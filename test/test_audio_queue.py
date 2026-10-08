import queue
import tempfile
import threading
import unittest
from pathlib import Path
from unittest.mock import patch

from owrx.audio.queue import PoisonPill, QueueJob, QueueWorker


class _WorkerQueue(queue.Queue):
    def onError(self):
        self.errors = getattr(self, "errors", 0) + 1


class DecoderProcessPlacementTests(unittest.TestCase):
    def test_decoder_subprocess_runs_on_queue_worker_not_request_caller(self):
        main_thread = threading.current_thread()
        popen_threads = []
        results = []

        class Profile:
            def decoder_commandline(self, filename):
                return ["decoder", filename]

        class Stdout:
            def __init__(self):
                self.chunks = iter((b"decoded line\n", b""))

            def read(self, _size):
                return next(self.chunks)

            def close(self):
                pass

        class Process:
            args = ["nice", "decoder"]
            pid = 12345
            stdout = Stdout()

            def wait(self, timeout=None):
                return 0

        def start_process(*_args, **_kwargs):
            popen_threads.append(threading.current_thread())
            return Process()

        with tempfile.NamedTemporaryFile() as audio_file:
            writer = type("Writer", (), {"sendResult": results.append})()
            job = QueueJob(Profile(), 14_074_000, writer, audio_file.name)
            work_queue = _WorkerQueue()
            worker = QueueWorker(work_queue)
            worker.name = "decoder-queue-test-worker"
            with patch("owrx.audio.queue.CoreConfig", return_value=type("Core", (), {
                "get_temporary_directory": lambda _self: "/tmp"
            })()), patch("owrx.audio.queue.subprocess.Popen", side_effect=start_process):
                worker.start()
                work_queue.put(job)
                work_queue.put(PoisonPill)
                work_queue.join()
                worker.join(timeout=2)

        self.assertFalse(worker.is_alive())
        self.assertEqual(popen_threads, [worker])
        self.assertIsNot(popen_threads[0], main_thread)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].lines, [b"decoded line\n"])


if __name__ == "__main__":
    unittest.main()
