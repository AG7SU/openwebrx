import importlib.util
import sys
import types
import unittest
from unittest.mock import patch


# The SDR source base imports pycsdr at module load time. These adapter tests
# do not construct or run an SDR pipeline, so provide import-only stubs when
# the optional native receiver dependency is absent in the test environment.
if importlib.util.find_spec("pycsdr") is None:
    pycsdr = types.ModuleType("pycsdr")
    modules = types.ModuleType("pycsdr.modules")
    csdr_types = types.ModuleType("pycsdr.types")
    modules.TcpSource = type("TcpSource", (), {})
    modules.Buffer = type("Buffer", (), {})
    csdr_types.Format = type("Format", (), {})
    pycsdr.modules = modules
    pycsdr.types = csdr_types
    sys.modules.update({
        "pycsdr": pycsdr,
        "pycsdr.modules": modules,
        "pycsdr.types": csdr_types,
    })

from owrx.soapy import SoapySettings
from owrx.property import PropertyLayer
from owrx.sdr import MappedSdrSources, SdrService
from owrx.source.sdrplay import RspDuoModeOptions, SdrplayDeviceDescription, SdrplaySource


def source():
    # This adapter only needs its stateless Soapy parameter builder.
    return object.__new__(SdrplaySource)


class SdrplayConfigTest(unittest.TestCase):
    def setUp(self):
        self.source = object.__new__(SdrplaySource)

    def test_rspduo_slave_targets_tuner_two(self):
        values = {"rspduo_mode": "SL", "rspduo_tuner": "Tuner 2 50 ohm"}

        device = self.source.buildSoapyDeviceParameters(
            SoapySettings.parse("serial=DUO123,mode=MA"), values
        )

        self.assertEqual(device, [
            {"serial": "DUO123"},
            {"mode": "SL"},
            {"driver": "sdrplay"},
        ])
        self.assertEqual(values["antenna"], "Tuner 2 50 ohm")

    def test_automatic_mode_preserves_explicit_device_query(self):
        values = {"rspduo_mode": "", "rspduo_tuner": ""}

        device = self.source.buildSoapyDeviceParameters(
            SoapySettings.parse("serial=DUO123,mode=MA"), values
        )

        self.assertEqual(device, [
            {"serial": "DUO123"},
            {"mode": "MA"},
            {"driver": "sdrplay"},
        ])
        self.assertNotIn("antenna", values)

    def test_rspduo_mode_and_tuner_are_device_level_options(self):
        description = SdrplayDeviceDescription()
        device_keys = description.getDeviceOptionalKeys()

        self.assertIn("rspduo_mode", device_keys)
        self.assertIn("rspduo_tuner", device_keys)
        self.assertNotIn("rspduo_mode", description.getProfileOptionalKeys())
        self.assertEqual(RspDuoModeOptions.MASTER.value, "MA")
        self.assertEqual(RspDuoModeOptions.SLAVE.value, "SL")

    def test_global_source_shutdown_stops_rspduo_slave_before_master(self):
        slave = object.__new__(SdrplaySource)
        slave.props = {"rspduo_mode": "SL"}
        master = object.__new__(SdrplaySource)
        master.props = {"rspduo_mode": "MA"}
        self.assertLess(slave.getShutdownPriority(), master.getShutdownPriority())

        stopped = []

        class Source:
            def __init__(self, name, priority):
                self.name = name
                self.priority = priority

            def getShutdownPriority(self):
                return self.priority

            def stop(self):
                stopped.append(self.name)

        configured_sources = {
            "master": Source("master", master.getShutdownPriority()),
            "other": Source("other", 0),
            "slave": Source("slave", slave.getShutdownPriority()),
        }
        with patch.object(SdrService, "getAllSources", return_value=configured_sources):
            SdrService.stopAllSources()
        self.assertEqual(stopped, ["slave", "master", "other"])

    def test_initialization_starts_rspduo_master_before_slave_without_reordering_profiles(self):
        configured = PropertyLayer(
            slave=PropertyLayer(type="sdrplay", rspduo_mode="SL", profiles=PropertyLayer()),
            other=PropertyLayer(type="rtl_sdr", profiles=PropertyLayer()),
            master=PropertyLayer(type="sdrplay", rspduo_mode="MA", profiles=PropertyLayer()),
        )
        started = []

        class Source:
            pass

        def build_source(_manager, source_id, _props):
            started.append(source_id)
            return Source()

        with patch.object(MappedSdrSources, "isDeviceValid", return_value=True), patch.object(
            MappedSdrSources, "buildNewSource", new=build_source
        ):
            MappedSdrSources(configured)

        self.assertLess(started.index("master"), started.index("slave"))
        self.assertEqual(list(configured.keys()), ["slave", "other", "master"])
