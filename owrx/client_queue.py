"""Byte- and item-bounded queue for websocket client outbound messages."""

import json
import threading
from queue import Empty, Full, Queue

from owrx.jsons import Encoder


MAX_CLIENT_QUEUE_ITEMS = 100
MAX_CLIENT_QUEUE_BYTES = 4 * 1024 * 1024
CLIENT_QUEUE_STOP = object()


def message_size(data):
    if isinstance(data, bytes):
        return len(data)
    if isinstance(data, str):
        return len(data.encode("utf-8"))
    return len(json.dumps(data, allow_nan=False, cls=Encoder).encode("utf-8"))


class BoundedClientQueue:
    """Queue messages up to fixed item and serialized-byte budgets."""

    def __init__(self, max_items=MAX_CLIENT_QUEUE_ITEMS, max_bytes=MAX_CLIENT_QUEUE_BYTES):
        self._queue = Queue(max_items)
        self.max_bytes = max_bytes
        self.queued_bytes = 0
        self._lock = threading.Lock()
        self._stopped = False

    def put(self, data):
        try:
            size = message_size(data)
        except (TypeError, ValueError, OverflowError, RecursionError):
            return False
        with self._lock:
            if self._stopped:
                return False
            if size > self.max_bytes or self.queued_bytes + size > self.max_bytes:
                return False
            try:
                self._queue.put_nowait((data, size))
            except Full:
                return False
            self.queued_bytes += size
            return True

    def get(self):
        item = self._queue.get()
        if item is CLIENT_QUEUE_STOP:
            return CLIENT_QUEUE_STOP
        data, size = item
        with self._lock:
            self.queued_bytes = max(0, self.queued_bytes - size)
        return data

    def task_done(self):
        self._queue.task_done()

    def clear_and_stop(self):
        with self._lock:
            if self._stopped:
                return True
            self._stopped = True
            while True:
                try:
                    self._queue.get_nowait()
                except Empty:
                    break
            self.queued_bytes = 0
            try:
                self._queue.put_nowait(CLIENT_QUEUE_STOP)
            except Full:
                # The queue was drained under the same lock; this indicates a bug.
                return False
            return True

    def qsize(self):
        return self._queue.qsize()
