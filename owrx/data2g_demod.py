"""Audio-chain adapter for the optional receive-only Data2G worker."""

import logging
import os
import pickle
import threading
import time

from csdr.chain.demodulator import DialFrequencyReceiver, ServiceDemodulator
from csdr.module import ThreadModule
from owrx.data2g import DATA2G_EVENT_SCHEMA_VERSION, DATA2G_SAMPLE_RATE, Data2GHostWorker, is_aprs_ax25_ui
from pycsdr.types import Format

logger = logging.getLogger(__name__)
MAX_BROWSER_FRAME_BYTES = 4096


class _Data2GAudioInput(ThreadModule):
    def __init__(self, host_path):
        self.host_path = host_path
        self.worker = None
        from owrx.aprs import AprsParser, Ax25Parser
        self.ax25_parser = Ax25Parser()
        self.aprs_parser = AprsParser()
        self._parser_lock = threading.Lock()
        self._worker_lock = threading.Lock()
        self._supervisor_stop = threading.Event()
        self._supervisor = None
        self._writer_lock = threading.Lock()
        super().__init__()

    def getInputFormat(self):
        return Format.FLOAT

    def getOutputFormat(self):
        return Format.CHAR

    def _emit(self, event):
        writer = self.writer
        if writer is None:
            return
        try:
            payload = pickle.dumps(event)
            with self._writer_lock:
                if self.writer is not None:
                    self.writer.write(payload)
        except (BrokenPipeError, OSError, ValueError):
            logger.debug("Data2G receiver event writer closed", exc_info=True)

    def _on_frame(self, frame):
        if len(frame.payload) > MAX_BROWSER_FRAME_BYTES:
            logger.warning("dropping oversized Data2G frame from browser event: %d bytes", len(frame.payload))
            return
        if frame.is_data and is_aprs_ax25_ui(frame.payload):
            try:
                with self._parser_lock:
                    ax25 = self.ax25_parser.process(frame.payload)
                    message = self.aprs_parser.process(ax25) if ax25 is not None else None
                if message is not None:
                    self._emit({
                        "type": "data2g_aprs",
                        "schema_version": DATA2G_EVENT_SCHEMA_VERSION,
                        "port": frame.port,
                        "message": message,
                        "received_at": time.time(),
                    })
                    return
            except Exception:
                logger.exception("could not parse Data2G AX.25/APRS frame")
        self._emit({
            "type": "data2g_frame",
            "schema_version": DATA2G_EVENT_SCHEMA_VERSION,
            "port": frame.port,
            "command": frame.command,
            "payload_bytes": len(frame.payload),
            "payload_hex": frame.payload.hex(),
            "received_at": time.time(),
        })

    def run(self):
        self._supervisor_stop.clear()
        self._supervisor = threading.Thread(target=self._supervise_workers, name="data2g-supervisor", daemon=True)
        self._supervisor.start()
        try:
            last_drop_count = 0
            while self.doRun:
                data = self.reader.read()
                if data is None:
                    break
                pcm = data.tobytes() if hasattr(data, "tobytes") else bytes(data)
                with self._worker_lock:
                    worker = self.worker
                if worker is None or worker.stopped:
                    continue
                worker.enqueue_pcm(pcm)
                drops = worker.dropped_pcm_chunks
                if drops != last_drop_count:
                    last_drop_count = drops
                    self._emit({"type": "data2g_status", "schema_version": DATA2G_EVENT_SCHEMA_VERSION, "state": "audio_overrun", "dropped_chunks": drops})
        finally:
            self._stop_supervisor()
            self.doRun = False
            if self.reader is not None:
                self.reader.stop()

    def _supervise_workers(self):
        retry_delay = 0.5
        while self.doRun and not self._supervisor_stop.is_set():
            worker = Data2GHostWorker(
                self.host_path,
                self._on_frame,
                lambda message: self._emit({"type": "data2g_status", "schema_version": DATA2G_EVENT_SCHEMA_VERSION, "state": "error", "message": message[:240]}),
                startup_timeout=2.0,
                on_status=lambda event: self._emit({
                    "type": "data2g_status",
                    "schema_version": DATA2G_EVENT_SCHEMA_VERSION,
                    **event,
                }),
            )
            try:
                worker.start()
            except Exception as error:
                logger.warning("Data2G RX worker failed to start: %s", error)
                self._emit({"type": "data2g_status", "schema_version": DATA2G_EVENT_SCHEMA_VERSION, "state": "error", "message": str(error)[:240]})
                if self._supervisor_stop.wait(retry_delay):
                    break
                retry_delay = min(retry_delay * 2, 15.0)
                continue

            if self._supervisor_stop.is_set() or not self.doRun:
                worker.stop()
                break
            with self._worker_lock:
                self.worker = worker
            self._emit({"type": "data2g_status", "schema_version": DATA2G_EVENT_SCHEMA_VERSION, "state": "listening", "sample_rate_hz": DATA2G_SAMPLE_RATE})
            started_at = time.monotonic()
            while not self._supervisor_stop.is_set() and self.doRun and not worker.stopped:
                self._supervisor_stop.wait(0.2)

            with self._worker_lock:
                if self.worker is worker:
                    self.worker = None
            worker.stop()
            if self._supervisor_stop.is_set() or not self.doRun:
                break
            self._emit({"type": "data2g_status", "schema_version": DATA2G_EVENT_SCHEMA_VERSION, "state": "restarting"})
            if time.monotonic() - started_at > 30:
                retry_delay = 0.5
            if self._supervisor_stop.wait(retry_delay):
                break
            retry_delay = min(retry_delay * 2, 15.0)

    def _stop_supervisor(self):
        self._supervisor_stop.set()
        with self._worker_lock:
            worker = self.worker
            self.worker = None
        if worker is not None:
            worker.stop()
        if self._supervisor is not None and self._supervisor is not threading.current_thread():
            self._supervisor.join(timeout=5)
        self._supervisor = None

    def stop(self):
        self.doRun = False
        self._stop_supervisor()
        super().stop()


class Data2GDemodulator(ServiceDemodulator, DialFrequencyReceiver):
    """Use primary USB/LSB demodulated audio at Data2G's native 8 kHz rate."""

    def __init__(self):
        self.audio_input = _Data2GAudioInput(os.environ["OPENWEBRX_DATA2G_HOST"])
        super().__init__([self.audio_input])

    def getFixedAudioRate(self):
        return DATA2G_SAMPLE_RATE

    def setDialFrequency(self, frequency):
        with self.audio_input._parser_lock:
            self.audio_input.aprs_parser.setDialFrequency(frequency)

    def supportsSquelch(self):
        # Weak Data2G frames must not be gated by browser squelch settings.
        return False

    def isSecondaryFftShown(self):
        return False
