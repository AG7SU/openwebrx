import threading
import unittest
from unittest.mock import patch

from owrx.client_queue import (
    BoundedClientQueue,
    CLIENT_QUEUE_STOP,
    MAX_CLIENT_QUEUE_BYTES,
    MAX_CLIENT_QUEUE_ITEMS,
)


class BoundedClientQueueTests(unittest.TestCase):
    def test_binary_waterfall_messages_obey_serialized_byte_budget(self):
        queue = BoundedClientQueue(max_items=MAX_CLIENT_QUEUE_ITEMS, max_bytes=1024)
        self.assertTrue(queue.put(bytes(700)))
        self.assertEqual(queue.queued_bytes, 700)
        self.assertFalse(queue.put(bytes(325)))
        self.assertEqual(queue.qsize(), 1)
        self.assertEqual(queue.queued_bytes, 700)

    def test_dequeue_releases_byte_budget(self):
        queue = BoundedClientQueue(max_items=2, max_bytes=8)
        payload = b"12345678"
        self.assertTrue(queue.put(payload))
        self.assertEqual(queue.get(), payload)
        queue.task_done()
        self.assertEqual(queue.queued_bytes, 0)
        self.assertTrue(queue.put(b"1234"))

    def test_queue_rejects_a_single_message_larger_than_budget(self):
        queue = BoundedClientQueue(max_items=MAX_CLIENT_QUEUE_ITEMS, max_bytes=1024)
        self.assertFalse(queue.put(bytes(1025)))
        self.assertEqual(queue.qsize(), 0)

    def test_item_limit_remains_bounded_and_close_discards_backlog(self):
        queue = BoundedClientQueue(max_items=2, max_bytes=MAX_CLIENT_QUEUE_BYTES)
        self.assertTrue(queue.put(b"one"))
        self.assertTrue(queue.put(b"two"))
        self.assertFalse(queue.put(b"three"))
        self.assertTrue(queue.clear_and_stop())
        self.assertEqual(queue.queued_bytes, 0)
        self.assertEqual(queue.qsize(), 1)
        self.assertIs(queue.get(), CLIENT_QUEUE_STOP)
        queue.task_done()

    def test_put_after_close_is_rejected_and_close_is_idempotent(self):
        queue = BoundedClientQueue(max_items=2, max_bytes=1024)
        self.assertTrue(queue.put(b"before"))
        self.assertTrue(queue.clear_and_stop())
        self.assertTrue(queue.clear_and_stop())
        self.assertFalse(queue.put(b"after"))
        self.assertEqual(queue.qsize(), 1)
        self.assertEqual(queue.queued_bytes, 0)

    def test_producer_racing_close_cannot_enqueue_after_stop_sentinel(self):
        queue = BoundedClientQueue(max_items=2, max_bytes=1024)
        size_started = threading.Event()
        allow_size = threading.Event()
        put_results = []

        def slow_message_size(_data):
            size_started.set()
            self.assertTrue(allow_size.wait(timeout=2))
            return 5

        with patch("owrx.client_queue.message_size", side_effect=slow_message_size):
            producer = threading.Thread(target=lambda: put_results.append(queue.put(b"later")))
            producer.start()
            self.assertTrue(size_started.wait(timeout=2))
            self.assertTrue(queue.clear_and_stop())
            allow_size.set()
            producer.join(timeout=2)

        self.assertFalse(producer.is_alive())
        self.assertEqual(put_results, [False])
        self.assertEqual(queue.qsize(), 1)
        self.assertEqual(queue.queued_bytes, 0)

    def test_unserializable_or_nonfinite_messages_are_rejected(self):
        queue = BoundedClientQueue(max_items=2, max_bytes=1024)
        self.assertFalse(queue.put(float("nan")))
        self.assertFalse(queue.put(object()))
        self.assertEqual(queue.qsize(), 0)
        self.assertEqual(queue.queued_bytes, 0)


if __name__ == "__main__":
    unittest.main()
