import unittest

from owrx.kiss_frames import KissStreamDecoder, ax25_payloads


class KissStreamDecoderTest(unittest.TestCase):
    def test_split_chunks_escaped_payload_and_multiple_ports(self):
        decoder = KissStreamDecoder()
        self.assertEqual(list(decoder.feed(b"\xc0\x00A\xdb")), [])
        frames = list(decoder.feed(b"\xdcB\xdb\xdd\xc0\xc0\x70payload\xc0"))
        self.assertEqual(frames[0].port, 0)
        self.assertEqual(frames[0].command, 0)
        self.assertEqual(frames[0].payload, b"A\xc0B\xdb")
        self.assertTrue(frames[0].is_data)
        self.assertEqual((frames[1].port, frames[1].command, frames[1].payload), (7, 0, b"payload"))

    def test_kiss_command_is_classified_separately_from_data(self):
        decoder = KissStreamDecoder()
        ack = list(decoder.feed(b"\xc0\x7c\x12\x34frame\xc0"))[0]
        self.assertEqual((ack.port, ack.command, ack.payload), (7, 0x0C, b"\x12\x34frame"))
        self.assertFalse(ack.is_data)

    def test_aprs_adapter_yields_only_port_zero_data_payloads(self):
        decoder = KissStreamDecoder()
        self.assertEqual(list(ax25_payloads(decoder, b"\xc0\x00ax25\xc0\xc0\x10other-port\xc0")), [b"ax25"])
        self.assertEqual(list(ax25_payloads(decoder, b"\xc0\x0ccontrol\xc0\xc0\x70not-aprs\xc0")), [])

    def test_invalid_escape_discards_until_delimiter_then_recovers(self):
        decoder = KissStreamDecoder()
        frames = list(decoder.feed(b"\xc0\x00bad\xdb\x01garbage\xc0\xc0\x20good\xc0"))
        self.assertEqual([(frame.port, frame.payload) for frame in frames], [(2, b"good")])

    def test_oversize_frame_is_discarded_without_losing_next_frame(self):
        decoder = KissStreamDecoder(max_frame_bytes=5)
        frames = list(decoder.feed(b"\xc0\x00large\xc0\xc0\x30ok\xc0"))
        self.assertEqual([(frame.port, frame.payload) for frame in frames], [(3, b"ok")])

    def test_invalid_limit_is_rejected(self):
        with self.assertRaises(ValueError):
            KissStreamDecoder(max_frame_bytes=0)


if __name__ == "__main__":
    unittest.main()
