import unittest

from owrx.receiver_health import receiver_health_event


class FakeSource:
    def getId(self):
        return "source-1"

    def getName(self):
        return "RSPduo tuner 1"


class ReceiverHealthEventTests(unittest.TestCase):
    def test_source_health_event_is_versioned_and_projects_only_public_fields(self):
        event = receiver_health_event(FakeSource(), "running", "info")
        self.assertEqual(event, {
            "type": "receiver_health",
            "value": {
                "schema_version": 1,
                "source_id": "source-1",
                "source_name": "RSPduo tuner 1",
                "state": "running",
                "severity": "info",
                "message": None,
            },
        })

    def test_error_and_text_fields_are_bounded(self):
        event = receiver_health_event(FakeSource(), "failed" * 8, "critical", "x" * 300)
        self.assertEqual(event["value"]["severity"], "info")
        self.assertEqual(len(event["value"]["state"]), 32)
        self.assertEqual(len(event["value"]["message"]), 240)
        self.assertEqual(len(event["value"]["source_name"]), 14)

    def test_missing_receiver_has_explicit_offline_projection(self):
        self.assertEqual(receiver_health_event(None, "offline", "error", "No SDR") ["value"], {
            "schema_version": 1,
            "source_id": None,
            "source_name": None,
            "state": "offline",
            "severity": "error",
            "message": "No SDR",
        })


if __name__ == "__main__":
    unittest.main()
