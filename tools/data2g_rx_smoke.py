#!/usr/bin/env python3
"""Replay a generated Data2G KISS waveform through data2g-host's PCM pipe.

Run from an environment that can import the pinned Data2G checkout:

    python tools/data2g_rx_smoke.py --host /path/to/data2g-host

This is an offline host/PCM/KISS integration check. It does not exercise an
SDR, RF conditions, or the OpenWebRX receive pipeline.
"""

import argparse
import os
import socket
import subprocess
import tempfile
import time
import wave
from pathlib import Path
import sys

import numpy as np

from data2g.arq import phy
from data2g.config import FS
from data2g.kisslink import KissLink
from data2g import tnc


def free_ports(count: int) -> int:
    for _ in range(100):
        with socket.socket() as probe:
            probe.bind(("127.0.0.1", 0))
            base = probe.getsockname()[1]
        if base + count > 65535:
            continue
        probes = []
        try:
            for port in range(base, base + count):
                probe = socket.socket()
                probes.append(probe)
                probe.bind(("127.0.0.1", port))
            return base
        except OSError:
            continue
        finally:
            for probe in probes:
                probe.close()
    raise RuntimeError("could not reserve a local port range")


def wait_for_command(host: subprocess.Popen, port: int, timeout: float) -> socket.socket:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if host.poll() is not None:
            raise RuntimeError(f"data2g-host exited early with status {host.returncode}")
        try:
            return socket.create_connection(("127.0.0.1", port), timeout=0.5)
        except OSError:
            time.sleep(0.1)
    raise TimeoutError("data2g-host command port did not open")


def make_fixture(path: Path) -> tuple[bytes, float]:
    # Use the same broadcast/control construction as the Data2G host. A raw
    # modem payload is not enough: the receiver validates KISS group control
    # and group-keyed codewords before emitting an application frame.
    expected = bytes.fromhex(
        "82a0a4a64040e0 9c608682989861 03f0"
    ) + b"OpenWebRX Data2G WAV proof"
    transmitter = KissLink()
    transmitter.enqueue(expected)
    burst = transmitter.next_burst()
    if burst is None:
        raise RuntimeError("Data2G did not create a KISS broadcast burst")

    signal = np.concatenate((np.zeros(2 * FS), phy.tx_audio(burst), np.zeros(6 * FS)))
    scale = 0.25 / float(np.max(np.abs(signal)))
    pcm = np.rint(signal * scale * 32767).astype("<i2")
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(FS)
        wav.writeframes(pcm.tobytes())
    return expected, scale


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", required=True, type=Path, help="built data2g-host executable")
    parser.add_argument("--timeout", type=float, default=40.0, help="seconds to wait for the decoded KISS frame")
    parser.add_argument(
        "--openwebrx-worker", action="store_true",
        help="feed the burst through OpenWebRX's bounded receive worker instead of a WAV file path",
    )
    parser.add_argument(
        "--worker-count", type=int, default=1,
        help="number of concurrent OpenWebRX workers to exercise (1 or 2; requires --openwebrx-worker)",
    )
    args = parser.parse_args()
    if not args.host.is_file():
        parser.error(f"host executable does not exist: {args.host}")
    if args.worker_count not in (1, 2):
        parser.error("--worker-count must be 1 or 2")
    if args.worker_count > 1 and not args.openwebrx_worker:
        parser.error("--worker-count greater than 1 requires --openwebrx-worker")

    with tempfile.TemporaryDirectory(prefix="openwebrx-data2g-") as temp:
        directory = Path(temp)
        wav_path = directory / "broadcast.wav"
        pcm_path = directory / "input.f32"
        log_path = directory / "host.log"
        expected, scale = make_fixture(wav_path)
        with wave.open(str(wav_path), "rb") as wav:
            if wav.getnchannels() != 1 or wav.getframerate() != FS or wav.getsampwidth() != 2:
                raise RuntimeError("generated WAV has unexpected audio format")
            # Recover the normalized float waveform; the PCM WAV is the
            # recorded fixture format, while data2g-host's pipe contract is
            # raw float32 at 8 kHz.
            wav.rewind()
            pcm = np.frombuffer(wav.readframes(wav.getnframes()), dtype="<i2").astype(np.float32)
        (pcm / 32767.0 / scale).astype("<f4").tofile(pcm_path)

        if args.openwebrx_worker:
            sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
            from owrx.data2g import Data2GHostWorker

            received = [[] for _ in range(args.worker_count)]
            errors = [[] for _ in range(args.worker_count)]
            statuses = [[] for _ in range(args.worker_count)]
            workers = [Data2GHostWorker(
                args.host, received[index].append, errors[index].append,
                startup_timeout=min(args.timeout, 20.0), on_status=statuses[index].append,
            ) for index in range(args.worker_count)]
            try:
                for worker in workers:
                    worker.start()
                samples = (pcm / 32767.0 / scale).astype("<f4").tobytes()
                chunk_bytes = 16 * 1024
                deadline = time.monotonic() + args.timeout
                for offset in range(0, len(samples), chunk_bytes):
                    chunk = samples[offset:offset + chunk_bytes]
                    for index, worker in enumerate(workers):
                        while not worker.enqueue_pcm(chunk):
                            if errors[index] or time.monotonic() >= deadline:
                                raise RuntimeError(
                                    f"OpenWebRX worker {index + 1} did not accept PCM: {errors[index]!r}"
                                )
                            time.sleep(0.005)
                def worker_received(index):
                    return any(frame.port == 0 and frame.is_data and frame.payload == expected
                               for frame in received[index])
                def worker_heard(index):
                    return any(status.get("state") == "heard" and status.get("port") == 0
                               for status in statuses[index])
                while time.monotonic() < deadline and not all(
                    worker_received(index) and worker_heard(index)
                    for index in range(args.worker_count)
                ) and not any(errors):
                    time.sleep(0.05)
                missing = [index + 1 for index in range(args.worker_count)
                           if not worker_received(index) or not worker_heard(index)]
                if missing:
                    raise AssertionError(
                        f"workers did not receive exact frame and BCAST HEARD: missing={missing}, "
                        f"frames={received!r}, statuses={statuses!r}, errors={errors!r}"
                    )
                print(
                    f"PASS: {args.worker_count} concurrent OpenWebRX worker(s) each fed generated "
                    "float32/8 kHz PCM to native data2g-host and received the exact KISS frame plus BCAST HEARD status"
                )
                return 0
            finally:
                for worker in workers:
                    worker.stop()

        base = free_ports(3)
        env = dict(os.environ)
        for key in ("OMP_NUM_THREADS", "OPENBLAS_NUM_THREADS", "MKL_NUM_THREADS"):
            env.setdefault(key, "1")
        with log_path.open("w") as log:
            host = subprocess.Popen(
                [str(args.host), "--mycall", "OWRX", "--host", "127.0.0.1",
                 "--command-port", str(base), "--kiss-port", str(base + 2),
                 "--kiss-address", "127.0.0.1", "--audio-io", f"pipe:{pcm_path},/dev/null",
                 "--no-rig", "--stats-interval", "0", "--record-dir", str(directory / "recordings")],
                stdout=subprocess.DEVNULL, stderr=log, env=env,
            )
            command = kiss = None
            try:
                command = wait_for_command(host, base, min(args.timeout, 30.0))
                command.settimeout(2.0)
                kiss = socket.create_connection(("127.0.0.1", base + 2), timeout=3.0)
                kiss.settimeout(0.2)
                decoder, received = tnc.KissDecoder(), []
                deadline = time.monotonic() + args.timeout
                while time.monotonic() < deadline and not received:
                    if host.poll() is not None:
                        raise RuntimeError(f"data2g-host exited with status {host.returncode}")
                    try:
                        received.extend(decoder.feed(kiss.recv(4096)))
                    except socket.timeout:
                        continue
                if (0, expected) not in received:
                    raise AssertionError(f"expected KISS port-0 frame not received; got {received!r}")
                print(f"PASS: native data2g-host decoded {len(expected)} bytes from generated WAV over PCM pipe and KISS")
                return 0
            finally:
                if command:
                    command.close()
                if kiss:
                    kiss.close()
                host.terminate()
                try:
                    host.wait(timeout=15)
                except subprocess.TimeoutExpired:
                    host.kill()
                    host.wait()
        tail = log_path.read_text()[-3000:]
        print(tail)


if __name__ == "__main__":
    raise SystemExit(main())
