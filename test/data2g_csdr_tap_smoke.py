"""Exercise the real pycsdr USB-to-Data2G audio tap without an SDR.

Run inside the receiver image, streaming this host-side file to Python stdin:

    docker compose exec -T receiver python3 - < test/data2g_csdr_tap_smoke.py

The fake host captures the FIFO bytes written by Data2GHostWorker. A synthetic
1 kHz USB-sideband IQ tone is pushed through the real selector, SSB demodulator,
and secondary audio branch. This validates the tap's float32/8 kHz format and
its position before the client audio/noise-processing chain; it does not test
Data2G decoding, an SDR, or RF.
"""

import os
import math
import stat
import struct
import tempfile
import threading
import time
from pathlib import Path

from pycsdr.modules import Buffer
from pycsdr.types import AgcProfile, Format

from csdr.chain.analog import Ssb
from owrx.data2g_demod import Data2GDemodulator
from owrx.dsp import ClientDemodulatorChain


FAKE_HOST = r'''#!/usr/bin/env python3
import os, socket, sys, time

def arg(name):
    return sys.argv[sys.argv.index(name) + 1]

command_port = int(arg("--command-port"))
kiss_port = int(arg("--kiss-port"))
audio = arg("--audio-io")
fifo = audio.removeprefix("pipe:").split(",", 1)[0]
capture = os.environ["OWRX_DATA2G_CAPTURE_FILE"]
trace = capture + ".trace"
def mark(value):
    with open(trace, "a") as output:
        output.write(value + chr(10))

def listen(port):
    server = socket.socket()
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(("127.0.0.1", port))
    server.listen(1)
    return server

command_server = listen(command_port)
kiss_server = listen(kiss_port)
mark("listening")
command, _ = command_server.accept()
mark("command-connected")
pending = bytearray()
while b"\r" not in pending:
    pending.extend(command.recv(128))
command.sendall(b"BCAST PORT 1\r")
mark("bcast-opened")
kiss, _ = kiss_server.accept()
mark("kiss-connected")
with open(fifo, "rb", buffering=0) as source:
    mark("fifo-opened")
    pcm = source.read(4096)
mark("pcm-read-" + str(len(pcm)))
with open(capture, "wb") as sink:
    sink.write(pcm)
time.sleep(60)
'''


class RateChanges:
    def onSecondaryDspRateChange(self, _rate):
        pass

    def onSecondaryDspBandwidthChange(self, _bandwidth):
        pass


def run_smoke():
    # The production Compose container mounts /tmp with noexec, so place the
    # short-lived fake host under /run for this in-container integration check.
    with tempfile.TemporaryDirectory(prefix="openwebrx-csdr-tap-", dir="/run") as root:
        root = Path(root)
        fake_host = root / "data2g-host"
        capture_path = root / "pcm.f32"
        fake_host.write_text(FAKE_HOST)
        fake_host.chmod(fake_host.stat().st_mode | stat.S_IXUSR)

        previous_host = os.environ.get("OPENWEBRX_DATA2G_HOST")
        previous_capture = os.environ.get("OWRX_DATA2G_CAPTURE_FILE")
        os.environ["OPENWEBRX_DATA2G_HOST"] = str(fake_host)
        os.environ["OWRX_DATA2G_CAPTURE_FILE"] = str(capture_path)

        chain = None
        audio_reader = None
        drain_stop = threading.Event()
        drain_thread = None
        try:
            chain = ClientDemodulatorChain(
                Ssb(AgcProfile.FAST),
                sampleRate=48_000,
                outputRate=48_000,
                hdOutputRate=48_000,
                audioCompression="none",
                nrEnabled=True,
                nrThreshold=10,
                secondaryDspEventReceiver=RateChanges(),
            )
            chain.setBandpass(300, 3_000)
            chain.setFrequencyOffset(0)

            iq_buffer = Buffer(Format.COMPLEX_FLOAT)
            client_audio = Buffer(Format.SHORT)
            secondary_events = Buffer(Format.CHAR)
            audio_reader = client_audio.getReader()

            def drain_client_audio():
                while not drain_stop.is_set():
                    if audio_reader.read() is None:
                        return

            drain_thread = threading.Thread(target=drain_client_audio, daemon=True)
            drain_thread.start()

            chain.setSecondaryWriter(secondary_events)
            chain.setSecondaryDemodulator(Data2GDemodulator())
            if chain.selector.outputRate != 8_000:
                raise AssertionError(f"Data2G selected {chain.selector.outputRate} Hz, expected 8000 Hz")

            chain.setReader(iq_buffer.getReader())
            chain.setWriter(client_audio)

            # The receive DSP is continuous, while the first buffer write below
            # is finite and processed faster than real time. Wait for the async
            # host supervisor so this synthetic burst cannot be discarded during
            # normal worker startup.
            module = chain.secondaryDemodulator.workers[0]
            deadline = time.monotonic() + 8
            while time.monotonic() < deadline:
                with module._worker_lock:
                    worker = module.worker
                if worker is not None and not worker.stopped:
                    break
                time.sleep(0.02)
            else:
                raise TimeoutError("Data2G host did not become ready")

            sample_count = 12_000  # 250 ms at the 48 kHz IQ input rate
            iq = bytearray()
            for index in range(sample_count):
                phase = 2 * math.pi * 1_000 * index / 48_000
                iq.extend(struct.pack("<ff", 0.5 * math.cos(phase), 0.5 * math.sin(phase)))
            iq_buffer.write(bytes(iq))

            deadline = time.monotonic() + 8
            while not capture_path.exists() and time.monotonic() < deadline:
                time.sleep(0.02)
            if not capture_path.exists():
                trace_path = Path(str(capture_path) + ".trace")
                trace = trace_path.read_text() if trace_path.exists() else "(fake host produced no trace)"
                module = chain.secondaryDemodulator.workers[0]
                with module._worker_lock:
                    worker = module.worker
                worker_state = "no-worker" if worker is None else (
                    f"queued={worker.queued_pcm_bytes}, dropped={worker.dropped_pcm_chunks}, "
                    f"stopped={worker.stopped}"
                )
                raise TimeoutError(
                    "Data2G worker did not receive audio from the pycsdr chain "
                    f"(module_alive={module.is_alive()}, worker={worker_state}); "
                    f"host trace: {trace}"
                )

            deadline = time.monotonic() + 2
            while capture_path.stat().st_size < 4_096 and time.monotonic() < deadline:
                time.sleep(0.02)
            raw = capture_path.read_bytes()
            if len(raw) < 1_024 or len(raw) % 4:
                raise AssertionError(f"unexpected float32 tap byte count: {len(raw)}")
            audio = struct.unpack(f"<{len(raw) // 4}f", raw)
            rms = math.sqrt(sum(sample * sample for sample in audio) / len(audio))
            if not all(math.isfinite(sample) for sample in audio) or rms < 1e-5:
                raise AssertionError("CSDR tap did not contain finite, non-silent float32 audio")
            # Find the strongest tone between 900 and 1100 Hz using a direct
            # complex correlation; the capture is short enough for this check.
            powers = []
            for frequency in range(900, 1101):
                real = imaginary = 0.0
                for index, sample in enumerate(audio):
                    phase = 2 * math.pi * frequency * index / 8_000
                    real += sample * math.cos(phase)
                    imaginary -= sample * math.sin(phase)
                powers.append((real * real + imaginary * imaginary, frequency))
            peak_hz = max(powers)[1]
            if abs(peak_hz - 1_000) > 100:
                raise AssertionError(f"expected the 1 kHz USB tone at the 8 kHz tap, got {peak_hz:.1f} Hz")
            print(f"PASS: pycsdr USB tap delivered {len(audio)} float32 samples at 8 kHz; peak {peak_hz:.1f} Hz")
        finally:
            if chain is not None:
                chain.stop()
            drain_stop.set()
            if audio_reader is not None:
                audio_reader.stop()
            if drain_thread is not None:
                drain_thread.join(timeout=2)
            if previous_host is None:
                os.environ.pop("OPENWEBRX_DATA2G_HOST", None)
            else:
                os.environ["OPENWEBRX_DATA2G_HOST"] = previous_host
            if previous_capture is None:
                os.environ.pop("OWRX_DATA2G_CAPTURE_FILE", None)
            else:
                os.environ["OWRX_DATA2G_CAPTURE_FILE"] = previous_capture


if __name__ == "__main__":
    run_smoke()
