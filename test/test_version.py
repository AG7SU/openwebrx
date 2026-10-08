import unittest

from owrx.version import is_at_least, openwebrx_version


class VersionTests(unittest.TestCase):
    def test_application_version_string(self):
        self.assertEqual(openwebrx_version, "v1.2.126")

    def test_decoder_version_comparisons(self):
        self.assertTrue(is_at_least("3.10", "3.2"))
        self.assertTrue(is_at_least("2.4", "2.3"))
        self.assertFalse(is_at_least("2.3rc1", "2.3"))
        self.assertFalse(is_at_least("unknown", "0.1"))


if __name__ == "__main__":
    unittest.main()
