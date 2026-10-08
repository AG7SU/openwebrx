import os
import importlib.util
import sys
import threading
import time
import types
import unittest
from unittest.mock import patch

from owrx.data2g import Data2GHostWorker, MAX_PCM_CHUNK_BYTES, MAX_QUEUED_PCM_BYTES, KissFrame, _WORKER_SLOTS, _free_ports, is_aprs_ax25_ui, parse_data2g_status_line
from owrx.feature import FeatureDetector


def load_data2g_demod_without_optional_dsp():
    """Load the supervisor while stubbing only its optional DSP base classes."""
    modules = {}
    for name in ("csdr", "csdr.chain", "pycsdr"):
        module = types.ModuleType(name)
        module.__path__ = []
        modules[name] = module

    demodulator = types.ModuleType("csdr.chain.demodulator")
    demodulator.DialFrequencyReceiver = type("DialFrequencyReceiver", (), {})
    demodulator.ServiceDemodulator = type("ServiceDemodulator", (), {})
    modules[demodulator.__name__] = demodulator
    thread_module = types.ModuleType("csdr.module")
    thread_module.ThreadModule = type("ThreadModule", (), {})
    thread_module.PickleModule = type("PickleModule", (), {})
    modules[thread_module.__name__] = thread_module
    types_module = types.ModuleType("pycsdr.types")
    types_module.Format = types.SimpleNamespace(FLOAT=object(), CHAR=object())
    modules[types_module.__name__] = types_module

    name = "owrx._data2g_demod_recovery_test"
    path = os.path.join(os.path.dirname(__file__), "..", "owrx", "data2g_demod.py")
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    with patch.dict(sys.modules, modules):
        spec.loader.exec_module(module)
    module._test_optional_dsp_modules = modules
    return module


class Data2GHostWorkerTest(unittest.TestCase):
    def test_ax25_aprs_frame_runs_real_parsers_and_emits_typed_browser_event(self):
        demod = load_data2g_demod_without_optional_dsp()
        events = []

        class EventWriter:
            def write(self, data):
                events.append(__import__("pickle").loads(data))

        def address(call, last=False):
            shifted = bytes(ord(character) << 1 for character in call.upper().ljust(6)[:6])
            return shifted + bytes([0x61 if last else 0x60])

        payload = (
            address("APRS") + address("N0CALL", last=True) + b"\x03\xf0"
            + b"!4903.50N/07201.75W>test"
        )
        with patch.dict(sys.modules, demod._test_optional_dsp_modules):
            from owrx.aprs import AprsParser, Ax25Parser
            from owrx.reporting import ReportingEngine

            receiver = object.__new__(demod._Data2GAudioInput)
            receiver.ax25_parser = Ax25Parser()
            receiver.aprs_parser = AprsParser()
            receiver._parser_lock = threading.Lock()
            receiver._writer_lock = threading.Lock()
            receiver.writer = EventWriter()
            with patch.object(receiver.aprs_parser, "getMetric", return_value=types.SimpleNamespace(inc=lambda: None)), \
                    patch.object(AprsParser, "updateMap"), \
                patch.object(ReportingEngine, "getSharedInstance", return_value=types.SimpleNamespace(spot=lambda _data: None)):
                receiver._on_frame(KissFrame(port=0, command=0, payload=payload))
                receiver._on_frame(KissFrame(port=3, command=0, payload=b"opaque application data"))
                receiver._on_frame(KissFrame(port=7, command=0x0C, payload=b"\x12\x34ack"))

        self.assertEqual(len(events), 3)
        event = events[0]
        self.assertEqual((event["type"], event["schema_version"], event["port"]), ("data2g_aprs", 1, 0))
        self.assertEqual(event["message"]["source"], "N0CALL")
        self.assertEqual(event["message"]["destination"], "APRS")
        self.assertEqual(event["message"]["data"], "!4903.50N/07201.75W>test")
        self.assertAlmostEqual(event["message"]["lat"], 49 + 3.5 / 60)
        self.assertAlmostEqual(event["message"]["lon"], -(72 + 1.75 / 60))
        self.assertEqual({key: value for key, value in events[1].items() if key != "received_at"}, {
            "type": "data2g_frame", "schema_version": 1, "port": 3, "command": 0,
            "payload_bytes": len(b"opaque application data"),
            "payload_hex": b"opaque application data".hex(),
        })
        self.assertIsInstance(events[1]["received_at"], float)
        self.assertEqual((events[2]["type"], events[2]["port"], events[2]["command"]), ("data2g_frame", 7, 0x0C))

    def test_command_status_lines_are_projected_to_bounded_typed_events(self):
        cases = {
            "BUSY ON": {"state": "busy", "busy": True},
            "BUSY OFF": {"state": "idle", "busy": False},
            "BCAST 0 HEARD": {"state": "heard", "port": 0},
            "BCAST 15 HEARD W1AW-1": {"state": "heard", "port": 15, "call": "W1AW-1"},
            "BCAST 2 LOST 3": {"state": "lost", "port": 2, "count": 3},
            "BCAST * MISSED qpsk-r1/5 4": {"state": "missed", "submode": "qpsk-r1/5", "codewords": 4},
            "BCAST 4 DROPPED 12": {"state": "dropped", "port": 4, "count": 12},
        }
        for line, expected in cases.items():
            with self.subTest(line=line):
                self.assertEqual(parse_data2g_status_line(line), expected)
        for line in (
            "BUSY MAYBE", "BCAST 16 HEARD", "BCAST 1 LOST 1000000",
            "BCAST * MISSED qpsk;drop 2", "BCAST 2 DROPPED -1", "X" * 257,
        ):
            with self.subTest(line=line):
                self.assertIsNone(parse_data2g_status_line(line))

    def _run_supervisor_recovery(self, worker_factory, fail_first):
        demod = load_data2g_demod_without_optional_dsp()
        events = []
        workers = []
        factory = worker_factory(workers)
        instance = object.__new__(demod._Data2GAudioInput)
        instance.host_path = "/test/data2g-host"
        instance.worker = None
        instance._worker_lock = threading.Lock()
        instance._supervisor_stop = threading.Event()
        instance.doRun = True
        instance._emit = events.append

        with patch.object(demod, "Data2GHostWorker", factory):
            supervisor = threading.Thread(target=instance._supervise_workers, daemon=True)
            supervisor.start()
            try:
                deadline = time.monotonic() + 5
                while not workers and time.monotonic() < deadline:
                    time.sleep(0.01)
                self.assertTrue(workers, "supervisor did not start the first worker")
                while not any(event.get("state") == "listening" for event in events) and time.monotonic() < deadline:
                    time.sleep(0.01)
                self.assertTrue(any(event.get("state") == "listening" for event in events), "first worker did not become ready")
                fail_first(workers[0])
                deadline = time.monotonic() + 8
                while (len(workers) < 2 or sum(event.get("state") == "listening" for event in events) < 2) and time.monotonic() < deadline:
                    time.sleep(0.02)
                self.assertGreaterEqual(len(workers), 2, "supervisor did not restart the failed worker")
                self.assertTrue(workers[1].started if hasattr(workers[1], "started") else workers[1]._process is not None,
                                "replacement worker did not finish startup")
                if hasattr(workers[1], "_process"):
                    self.assertIsNone(workers[1]._process.poll(), "replacement native host exited unexpectedly")
                states = [event.get("state") for event in events]
                self.assertIn("restarting", states)
                self.assertGreaterEqual(states.count("listening"), 2)
            finally:
                instance.doRun = False
                instance._supervisor_stop.set()
                supervisor.join(timeout=8)
                for worker in workers:
                    worker.stop()
                self.assertFalse(supervisor.is_alive(), "supervisor did not stop cleanly")
        return workers

    def test_supervisor_restarts_after_worker_failure(self):
        class FakeWorker:
            def __init__(self, _path, _on_frame, _on_error, startup_timeout, on_status=None):
                self.started = False
                self.stopped = False
                self.on_status = on_status

            def start(self):
                self.started = True

            def stop(self):
                self.stopped = True

        def factory(workers):
            def create(*args, **kwargs):
                worker = FakeWorker(*args, **kwargs)
                workers.append(worker)
                return worker
            return create

        self._run_supervisor_recovery(factory, lambda worker: setattr(worker, "stopped", True))

    @unittest.skipUnless(os.environ.get("OPENWEBRX_DATA2G_TEST_HOST"), "set OPENWEBRX_DATA2G_TEST_HOST to the reviewed native host")
    def test_supervisor_recovers_after_native_host_is_killed(self):
        executable = os.environ["OPENWEBRX_DATA2G_TEST_HOST"]

        def factory(workers):
            def create(_path, *args, **kwargs):
                worker = Data2GHostWorker(executable, *args, **kwargs)
                workers.append(worker)
                return worker
            return create

        def kill_host(worker):
            self.assertIsNotNone(worker._process)
            worker._process.kill()

        self._run_supervisor_recovery(factory, kill_host)

    def test_pcm_input_is_validated_and_queue_is_bounded_without_blocking(self):
        worker = Data2GHostWorker("/unused/data2g-host", lambda frame: None, queue_chunks=4)
        self.assertFalse(worker.enqueue_pcm(b""))
        self.assertFalse(worker.enqueue_pcm(b"abc"))
        self.assertFalse(worker.enqueue_pcm(bytes(MAX_PCM_CHUNK_BYTES + 4)))
        self.assertTrue(worker.enqueue_pcm(bytes(MAX_QUEUED_PCM_BYTES)))
        self.assertFalse(worker.enqueue_pcm(bytes(4)))
        self.assertEqual(worker.queued_pcm_bytes, MAX_QUEUED_PCM_BYTES)
        self.assertEqual(worker.dropped_pcm_chunks, 1)

    def test_queue_capacity_is_validated(self):
        with self.assertRaises(ValueError):
            Data2GHostWorker("/unused/data2g-host", lambda frame: None, queue_chunks=0)

    def test_local_listener_ports_are_distinct_and_unprivileged(self):
        command_port, kiss_port = _free_ports(2)
        self.assertNotEqual(command_port, kiss_port)
        self.assertTrue(all(1024 <= port <= 65535 for port in (command_port, kiss_port)))

    def test_worker_requires_an_executable_host(self):
        worker = Data2GHostWorker("/unused/data2g-host", lambda frame: None)
        with self.assertRaises(FileNotFoundError):
            worker.start()

    def test_startup_failure_releases_worker_slot_and_temporary_resources(self):
        worker = Data2GHostWorker("/bin/true", lambda frame: None)
        with patch("owrx.data2g._free_ports", side_effect=OSError("port reservation failed")):
            with self.assertRaisesRegex(OSError, "port reservation failed"):
                worker.start()
        self.assertFalse(worker._slot_acquired)
        self.assertIsNone(worker._temporary)
        self.assertIsNone(worker._process)
        acquired = []
        try:
            for _ in range(2):
                acquired.append(_WORKER_SLOTS.acquire(blocking=False))
            self.assertEqual(acquired, [True, True])
        finally:
            for slot in acquired:
                if slot:
                    _WORKER_SLOTS.release()

    def test_data2g_feature_requires_an_absolute_executable_path(self):
        detector = FeatureDetector()
        with patch.dict(os.environ, {"OPENWEBRX_DATA2G_HOST": "data2g-host"}):
            self.assertFalse(detector.has_data2g_host())
        with patch.dict(os.environ, {"OPENWEBRX_DATA2G_HOST": "/bin/true"}):
            self.assertTrue(detector.has_data2g_host())

    def test_data2g_mode_is_bound_to_usb_and_lsb(self):
        from owrx.modes import DigitalMode, Modes

        mode = next(item for item in Modes.getModes() if item.modulation == "data2g")
        self.assertIsInstance(mode, DigitalMode)
        self.assertEqual(mode.underlying, ["usb", "lsb"])
        self.assertEqual(mode.requirements, ["data2g"])

    def test_aprs_router_accepts_ax25_ui_aprs_and_rejects_other_payloads(self):
        def address(callsign, final=False):
            shifted = bytes(ord(character) << 1 for character in callsign.ljust(6))
            return shifted + bytes([0x60 | int(final)])

        ax25 = address("APRS") + address("N0CALL", final=True) + b"\x03\xf0!4903.50N/07201.75W>RX test"
        self.assertTrue(is_aprs_ax25_ui(ax25))
        data_type_offset = ax25.find(b"\x03\xf0") + 2
        non_aprs = ax25[:data_type_offset] + b"?" + ax25[data_type_offset + 1:]
        self.assertFalse(is_aprs_ax25_ui(non_aprs))
        self.assertFalse(is_aprs_ax25_ui(b"\x03\xf0!"))

    def test_mode_capabilities_report_missing_or_configured_host(self):
        from owrx.modes import Modes

        class CapabilityProbe:
            def get_failed_requirements(self, feature):
                if feature != "data2g":
                    return []
                return [] if FeatureDetector().has_data2g_host() else ["data2g_host"]

        with patch.dict(os.environ, {"OPENWEBRX_DATA2G_HOST": ""}):
            mode = next(item for item in Modes.getClientModeCapabilities(CapabilityProbe()) if item["modulation"] == "data2g")
            self.assertFalse(mode["available"])
            self.assertEqual(mode["missing_requirements"], ["data2g_host"])
        with patch.dict(os.environ, {"OPENWEBRX_DATA2G_HOST": "/bin/true"}):
            mode = next(item for item in Modes.getClientModeCapabilities(CapabilityProbe()) if item["modulation"] == "data2g")
            self.assertTrue(mode["available"])
            self.assertEqual(mode["missing_requirements"], [])


if __name__ == "__main__":
    unittest.main()
