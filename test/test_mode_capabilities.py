import unittest

from owrx.modes import Modes, ServiceOnlyMode


class FakeFeatureDetector:
    def get_failed_requirements(self, feature):
        return {
            "wsjt-x": ["wsjtx"],
            "wsjt-x-2-3": ["wsjtx_2_3"],
            "wsjt-x-2-4": ["wsjtx_2_4"],
        }.get(feature, [])


class ModeCapabilitiesTest(unittest.TestCase):
    def test_reports_available_and_missing_decoder_requirements(self):
        capabilities = {
            item["modulation"]: item
            for item in Modes.getClientModeCapabilities(FakeFeatureDetector())
        }

        self.assertTrue(capabilities["usb"]["available"])
        self.assertEqual(capabilities["usb"]["missing_requirements"], [])
        self.assertFalse(capabilities["ft8"]["available"])
        self.assertEqual(capabilities["ft8"]["missing_requirements"], ["wsjtx"])
        self.assertEqual(capabilities["fst4"]["missing_requirements"], ["wsjtx_2_3"])
        self.assertEqual(capabilities["q65"]["missing_requirements"], ["wsjtx_2_4"])

    def test_does_not_offer_service_only_modes_to_client_picker(self):
        capabilities = Modes.getClientModeCapabilities(FakeFeatureDetector())
        service_only = {mode.modulation for mode in Modes.getModes() if isinstance(mode, ServiceOnlyMode)}
        offered = {item["modulation"] for item in capabilities}
        self.assertFalse(offered.intersection(service_only))


if __name__ == "__main__":
    unittest.main()
