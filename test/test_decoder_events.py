import unittest

from owrx.decoder_events import decoder_error_event, decoder_error_events, decoder_output_event, secondary_decoder_events


class DecoderErrorEventTests(unittest.TestCase):
    def test_decoder_output_event_has_version_and_timestamp(self):
        event = decoder_output_event()
        self.assertEqual(event["type"], "decoder_output")
        self.assertEqual(event["value"]["schema_version"], 1)
        self.assertIsInstance(event["value"]["received_at"], float)
        self.assertGreater(event["value"]["received_at"], 0)
        event = decoder_output_event("ft8")
        self.assertEqual(event["value"]["modulation"], "ft8")
        self.assertNotIn("modulation", decoder_output_event("x" * 65)["value"])
        self.assertNotIn("modulation", decoder_output_event("ft8\nforged")["value"])

    def test_generic_decoder_uses_versioned_sidecar_and_legacy_payload(self):
        payload = {"call": "N0CALL", "text": "decoded"}
        events = secondary_decoder_events(payload, "ft8")
        self.assertEqual(events[0]["type"], "decoder_output")
        self.assertEqual(events[0]["value"]["modulation"], "ft8")
        self.assertEqual(events[1], {"type": "secondary_demod", "value": payload})

    def test_data2g_contract_does_not_get_wrapped_twice(self):
        payload = {"type": "data2g_status", "schema_version": 1, "state": "heard"}
        self.assertEqual(secondary_decoder_events(payload), [{"type": "secondary_demod", "value": payload}])

    def test_decoder_error_event_is_versioned_and_bounded(self):
        event = decoder_error_event("decoder exited")
        self.assertEqual(event, {
            "type": "decoder_error",
            "value": {"schema_version": 1, "message": "decoder exited"},
        })

        event = decoder_error_event("x" * 400)
        self.assertEqual(event["value"]["schema_version"], 1)
        self.assertEqual(len(event["value"]["message"]), 240)

    def test_invalid_utf8_bytes_are_replaced(self):
        self.assertEqual(decoder_error_event(b"bad \xff")['value']['message'], "bad \ufffd")

    def test_dual_publish_keeps_legacy_clients_compatible(self):
        events = decoder_error_events("decoder stopped")
        self.assertEqual(events[0], {
            "type": "decoder_error",
            "value": {"schema_version": 1, "message": "decoder stopped"},
        })
        self.assertEqual(events[1], {"type": "demodulator_error", "value": "decoder stopped"})


if __name__ == "__main__":
    unittest.main()
