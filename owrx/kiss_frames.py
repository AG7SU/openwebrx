"""Small streaming KISS frame decoder, independent of SDR/thread modules."""

from dataclasses import dataclass
from typing import Iterator

FEND = 0xC0
FESC = 0xDB
TFEND = 0xDC
TFESC = 0xDD
MAX_KISS_FRAME_BYTES = 1 << 20


@dataclass(frozen=True)
class KissFrame:
    """One unescaped KISS frame, with port and command kept separate."""

    port: int
    command: int
    payload: bytes

    @classmethod
    def from_command_byte(cls, command_byte: int, payload: bytes) -> "KissFrame":
        return cls(port=(command_byte >> 4) & 0x0F, command=command_byte & 0x0F, payload=payload)

    @property
    def is_data(self) -> bool:
        return self.command == 0x00


class KissStreamDecoder:
    """Decode arbitrarily chunked KISS input while bounding one frame's size."""

    def __init__(self, max_frame_bytes: int = MAX_KISS_FRAME_BYTES):
        if max_frame_bytes < 1:
            raise ValueError("max_frame_bytes must be positive")
        self.max_frame_bytes = max_frame_bytes
        self._buf = bytearray()
        self._escaped = False
        self._discarding = False

    def feed(self, data: bytes | bytearray | memoryview) -> Iterator[KissFrame]:
        for byte in data:
            if self._discarding:
                if byte == FEND:
                    self._discarding = False
                    self._buf.clear()
                    self._escaped = False
                continue

            if self._escaped:
                self._escaped = False
                if byte == TFEND:
                    value = FEND
                elif byte == TFESC:
                    value = FESC
                elif byte == FEND:
                    self._buf.clear()
                    continue
                else:
                    self._buf.clear()
                    self._discarding = True
                    continue
                self._append(value)
            elif byte == FESC:
                self._escaped = True
            elif byte == FEND:
                if self._buf:
                    yield KissFrame.from_command_byte(self._buf[0], bytes(self._buf[1:]))
                self._buf.clear()
            else:
                self._append(byte)

    def _append(self, byte: int) -> None:
        if len(self._buf) >= self.max_frame_bytes:
            self._buf.clear()
            self._escaped = False
            self._discarding = True
            return
        self._buf.append(byte)


def ax25_payloads(decoder: KissStreamDecoder, data: bytes | bytearray | memoryview) -> Iterator[bytes]:
    """Yield legacy APRS payloads from KISS port 0 data frames only."""
    for frame in decoder.feed(data):
        if frame.port == 0 and frame.is_data:
            yield frame.payload
