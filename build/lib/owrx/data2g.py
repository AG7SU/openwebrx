"""Receive-only bridge to a separately installed Data2G native host.

The host is optional and is never imported into the receiver process. PCM is
fed through a bounded queue to its documented 8 kHz float32 pipe; decoded KISS
frames come back on loopback TCP.
"""

from __future__ import annotations

import logging
import os
import queue
import re
import socket
import subprocess
import tempfile
import threading
import time
from pathlib import Path
from typing import Callable

from owrx.kiss_frames import KissFrame, KissStreamDecoder

logger = logging.getLogger(__name__)

DATA2G_SAMPLE_RATE = 8000
DATA2G_EVENT_SCHEMA_VERSION = 1
MAX_PCM_CHUNK_BYTES = 256 * 1024
MAX_QUEUED_PCM_BYTES = 64 * 1024  # at most two seconds at 8 kHz mono float32
DEFAULT_PCM_QUEUE_CHUNKS = 16
MAX_COMMAND_BUFFER_BYTES = 4096
MAX_COMMAND_LINE_BYTES = 256
MAX_DATA2G_WORKERS = 2
_WORKER_SLOTS = threading.BoundedSemaphore(MAX_DATA2G_WORKERS)
APRS_DATA_TYPE_IDS = frozenset(b"!=/@>}:;){`'\x1c")


def parse_data2g_status_line(line: str) -> dict | None:
    """Project one bounded Data2G command notification into a typed RX event."""
    line = line.strip()
    if len(line) > MAX_COMMAND_LINE_BYTES:
        return None
    if line == "BUSY ON":
        return {"state": "busy", "busy": True}
    if line == "BUSY OFF":
        return {"state": "idle", "busy": False}
    match = re.fullmatch(r"BCAST (\d{1,2}) HEARD(?: ([A-Z0-9/-]{1,10}))?", line)
    if match and int(match.group(1)) <= 15:
        event = {"state": "heard", "port": int(match.group(1))}
        if match.group(2):
            event["call"] = match.group(2)
        return event
    match = re.fullmatch(r"BCAST (\d{1,2}) LOST (\d{1,6})", line)
    if match and int(match.group(1)) <= 15:
        return {"state": "lost", "port": int(match.group(1)), "count": int(match.group(2))}
    match = re.fullmatch(r"BCAST \* MISSED ([A-Za-z0-9./_-]{1,48}) (\d{1,3})", line)
    if match:
        return {"state": "missed", "submode": match.group(1), "codewords": int(match.group(2))}
    match = re.fullmatch(r"BCAST (\d{1,2}) DROPPED (\d{1,6})", line)
    if match and int(match.group(1)) <= 15:
        return {"state": "dropped", "port": int(match.group(1)), "count": int(match.group(2))}
    return None


def is_aprs_ax25_ui(payload: bytes | bytearray | memoryview) -> bool:
    """Accept AX.25 UI frames with APRS PID and a known APRS data type."""
    payload = bytes(payload)
    if len(payload) < 17:
        return False
    control_pid = payload.find(b"\x03\xf0")
    if control_pid < 14 or control_pid > 70 or control_pid % 7:
        return False
    if control_pid + 2 >= len(payload):
        return False
    extension_bits = [payload[index] & 1 for index in range(6, control_pid, 7)]
    if not extension_bits or extension_bits[-1] != 1 or any(extension_bits[:-1]):
        return False
    return payload[control_pid + 2] in APRS_DATA_TYPE_IDS


def _free_ports(count: int) -> list[int]:
    for _ in range(20):
        probes = []
        try:
            for _ in range(count):
                probe = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                probes.append(probe)
                probe.bind(("127.0.0.1", 0))
            return [probe.getsockname()[1] for probe in probes]
        except OSError:
            continue
        finally:
            for probe in probes:
                probe.close()
    raise RuntimeError("could not reserve local ports for Data2G")


class Data2GHostWorker:
    """Manage one isolated RX-only host process and its PCM/KISS streams.

    Input chunks must already be mono float32 at 8 kHz. Enqueue is nonblocking;
    when the bounded queue is full, the newest chunk is dropped and counted so
    the receiver's DSP pump never stalls behind decoder load.
    """

    def __init__(
        self,
        executable: str | os.PathLike,
        on_frame: Callable[[KissFrame], None],
        on_error: Callable[[str], None] | None = None,
        queue_chunks: int = DEFAULT_PCM_QUEUE_CHUNKS,
        startup_timeout: float = 8.0,
        on_status: Callable[[dict], None] | None = None,
    ):
        if queue_chunks < 1:
            raise ValueError("queue_chunks must be positive")
        self.executable = Path(executable)
        self.on_frame = on_frame
        self.on_error = on_error or (lambda message: logger.warning("Data2G RX: %s", message))
        self.on_status = on_status or (lambda event: None)
        self.startup_timeout = startup_timeout
        self.pcm_queue: queue.Queue[bytes] = queue.Queue(maxsize=queue_chunks)
        self.dropped_pcm_chunks = 0
        self.queued_pcm_bytes = 0
        self._stop = threading.Event()
        self._queue_lock = threading.Lock()
        self._process: subprocess.Popen | None = None
        self._temporary: tempfile.TemporaryDirectory | None = None
        self._command: socket.socket | None = None
        self._kiss: socket.socket | None = None
        self._threads: list[threading.Thread] = []
        self._command_buffer = bytearray()
        self._slot_acquired = False

    @property
    def stopped(self) -> bool:
        return self._stop.is_set() or self._process is None or self._process.poll() is not None

    @staticmethod
    def _is_valid_chunk(pcm: bytes | bytearray | memoryview) -> bytes | None:
        try:
            chunk = bytes(pcm)
        except (TypeError, ValueError):
            return None
        if not chunk or len(chunk) > MAX_PCM_CHUNK_BYTES or len(chunk) % 4:
            return None
        return chunk

    def enqueue_pcm(self, pcm: bytes | bytearray | memoryview) -> bool:
        chunk = self._is_valid_chunk(pcm)
        if chunk is None or self._stop.is_set():
            return False
        with self._queue_lock:
            if self.queued_pcm_bytes + len(chunk) > MAX_QUEUED_PCM_BYTES:
                self.dropped_pcm_chunks += 1
                return False
            try:
                self.pcm_queue.put_nowait(chunk)
                self.queued_pcm_bytes += len(chunk)
                return True
            except queue.Full:
                self.dropped_pcm_chunks += 1
                return False

    def _connect(self, port: int, deadline: float) -> socket.socket:
        while time.monotonic() < deadline and not self._stop.is_set():
            if self._process is None or self._process.poll() is not None:
                raise RuntimeError("data2g-host exited before opening its local sockets")
            try:
                result = socket.create_connection(("127.0.0.1", port), timeout=0.25)
                result.settimeout(0.5)
                return result
            except OSError:
                self._stop.wait(0.1)
        raise TimeoutError("data2g-host did not open its local sockets")

    def start(self) -> None:
        if not self.executable.is_file() or not os.access(self.executable, os.X_OK):
            raise FileNotFoundError(f"Data2G host is not executable: {self.executable}")
        if self._process is not None:
            raise RuntimeError("Data2G host worker already started")
        if not _WORKER_SLOTS.acquire(blocking=False):
            raise RuntimeError(f"Data2G worker limit reached ({MAX_DATA2G_WORKERS})")
        self._slot_acquired = True

        self._temporary = tempfile.TemporaryDirectory(prefix="openwebrx-data2g-")
        directory = Path(self._temporary.name)
        pcm_fifo = directory / "pcm-in.f32"
        command_port, kiss_port = _free_ports(2)
        command = [
            str(self.executable), "--mycall", "OWRX", "--host", "127.0.0.1",
            "--command-port", str(command_port), "--kiss-port", str(kiss_port),
            "--kiss-address", "127.0.0.1", "--audio-io", f"pipe:{pcm_fifo},/dev/null",
            "--no-rig", "--rigctld-port", "0", "--stats-interval", "0", "--record-dir", "",
        ]
        try:
            os.mkfifo(pcm_fifo, 0o600)
            self._process = subprocess.Popen(command, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            deadline = time.monotonic() + self.startup_timeout
            self._command = self._connect(command_port, deadline)
            # Subscribe to broadcast receive status without enabling Data2G's
            # ARQ listener. LISTEN ON would permit automatic ARQ replies; port
            # 0's default KISS 0 receive group remains active without it.
            self._command.sendall(b"BCAST OPEN APRS\r")
            reply = self._read_command_line(deadline)
            if not re.fullmatch(r"BCAST PORT (?:[1-9]|1[0-5])", reply):
                raise RuntimeError("data2g-host refused BCAST OPEN APRS")
            self._kiss = self._connect(kiss_port, deadline)
            self._threads = [
                threading.Thread(target=self._write_pcm, args=(pcm_fifo,), name="data2g-pcm", daemon=True),
                threading.Thread(target=self._read_kiss, name="data2g-kiss", daemon=True),
                threading.Thread(target=self._read_command_status, name="data2g-status", daemon=True),
            ]
            for thread in self._threads:
                thread.start()
        except Exception:
            self.stop()
            raise

    def _read_command_line(self, deadline: float) -> str:
        while time.monotonic() < deadline:
            separator = self._command_buffer.find(b"\r")
            if separator >= 0:
                raw = bytes(self._command_buffer[:separator])
                del self._command_buffer[:separator + 1]
                if len(raw) > MAX_COMMAND_LINE_BYTES:
                    raise RuntimeError("Data2G command response line is too large")
                return raw.decode("ascii", "replace")
            if len(self._command_buffer) > MAX_COMMAND_BUFFER_BYTES:
                raise RuntimeError("Data2G command response buffer is too large")
            try:
                data = self._command.recv(512)
            except socket.timeout:
                continue
            if not data:
                raise ConnectionError("Data2G command connection closed during startup")
            self._command_buffer.extend(data)
        raise TimeoutError("timed out waiting for Data2G command response")

    def _read_command_status(self) -> None:
        try:
            while not self._stop.is_set():
                while b"\r" in self._command_buffer:
                    raw, _, remainder = self._command_buffer.partition(b"\r")
                    self._command_buffer[:] = remainder
                    if len(raw) > MAX_COMMAND_LINE_BYTES:
                        raise RuntimeError("Data2G command status line is too large")
                    event = parse_data2g_status_line(raw.decode("ascii", "replace"))
                    if event is not None:
                        self.on_status(event)
                if len(self._command_buffer) > MAX_COMMAND_BUFFER_BYTES:
                    raise RuntimeError("Data2G command status buffer is too large")
                try:
                    data = self._command.recv(1024) if self._command is not None else b""
                except socket.timeout:
                    if self._process is not None and self._process.poll() is not None:
                        raise RuntimeError("data2g-host exited")
                    continue
                if not data:
                    if not self._stop.is_set():
                        raise ConnectionError("Data2G command connection closed")
                    break
                self._command_buffer.extend(data)
        except Exception as error:
            if not self._stop.is_set():
                self.on_error(f"command status stream stopped: {error}")
                self._stop.set()

    def _write_pcm(self, path: Path) -> None:
        try:
            with path.open("wb", buffering=0) as stream:
                while not self._stop.is_set():
                    try:
                        pcm = self.pcm_queue.get(timeout=0.2)
                    except queue.Empty:
                        continue
                    with self._queue_lock:
                        self.queued_pcm_bytes -= len(pcm)
                    stream.write(pcm)
        except (BrokenPipeError, OSError) as error:
            if not self._stop.is_set():
                self.on_error(f"PCM pipe stopped: {error}")
                self._stop.set()

    def _read_kiss(self) -> None:
        decoder = KissStreamDecoder()
        try:
            while not self._stop.is_set():
                try:
                    data = self._kiss.recv(8192) if self._kiss is not None else b""
                except socket.timeout:
                    if self._process is not None and self._process.poll() is not None:
                        raise RuntimeError("data2g-host exited")
                    continue
                if not data:
                    if not self._stop.is_set():
                        raise ConnectionError("Data2G KISS connection closed")
                    break
                for frame in decoder.feed(data):
                    self.on_frame(frame)
        except Exception as error:
            if not self._stop.is_set():
                self.on_error(f"KISS stream stopped: {error}")
                self._stop.set()

    def stop(self, timeout: float = 3.0) -> None:
        if self._stop.is_set() and self._process is None:
            return
        self._stop.set()
        for connection in (self._kiss, self._command):
            if connection is not None:
                try:
                    connection.shutdown(socket.SHUT_RDWR)
                except OSError:
                    pass
                connection.close()
        self._kiss = self._command = None
        process, self._process = self._process, None
        if process is not None and process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=timeout)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait(timeout=timeout)
        for thread in self._threads:
            thread.join(timeout=timeout)
        self._threads.clear()
        temporary, self._temporary = self._temporary, None
        if temporary is not None:
            temporary.cleanup()
        if self._slot_acquired:
            self._slot_acquired = False
            _WORKER_SLOTS.release()
