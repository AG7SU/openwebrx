from owrx.source.soapy import SoapyConnectorSource, SoapyConnectorDeviceDescription
from owrx.form.input import Input, CheckboxInput, DropdownInput, NumberInput, DropdownEnum
from owrx.form.input.device import BiasTeeInput, GainInput
from owrx.form.input.validator import Range, RangeValidator
from typing import List


class SdrplaySource(SoapyConnectorSource):
    def getShutdownPriority(self):
        # SoapySDRPlay3's RSPduo API may return StopPending while a Slave is
        # still active. Stop Slave sources before their Master during shutdown.
        if "rspduo_mode" in self.props and self.props["rspduo_mode"] == "SL":
            return -1
        return 0

    def buildSoapyDeviceParameters(self, parsed, values):
        # SoapySDRPlay3 selects RSPduo operating modes through the device
        # identifier's `mode` argument. Keep the default automatic behavior
        # unless an administrator explicitly chooses a mode.
        mode = values.get("rspduo_mode")
        if mode:
            parsed = [part for part in parsed if not (isinstance(part, dict) and "mode" in part)]
            parsed.append({"mode": mode})

        tuner = values.get("rspduo_tuner")
        if tuner:
            # The driver calls this setting `antenna`; in RSPduo modes it
            # selects tuner A/B (and, for tuner A, the Hi-Z port).
            values["antenna"] = tuner

        return super().buildSoapyDeviceParameters(parsed, values)

    def getSoapySettingsMappings(self):
        mappings = super().getSoapySettingsMappings()
        mappings.update(
            {
                "bias_tee": "biasT_ctrl",
                "rf_notch": "rfnotch_ctrl",
                "dab_notch": "dabnotch_ctrl",
                "external_reference": "extref_ctrl",
                "hdr_ctrl": "hdr_ctrl",
                "if_mode": "if_mode",
                "rfgain_sel": "rfgain_sel",
                "agc_setpoint": "agc_setpoint",
            }
        )
        return mappings

    def getDriver(self):
        return "sdrplay"


class IfModeOptions(DropdownEnum):
    IFMODE_ZERO_IF = "Zero-IF"
    IFMODE_450 = "450kHz"
    IFMODE_1620 = "1620kHz"
    IFMODE_2048 = "2048kHz"

    def __str__(self):
        return self.value


class RspDuoModeOptions(DropdownEnum):
    AUTOMATIC = ("", "Automatic (driver default)")
    SINGLE_TUNER = ("ST", "Single tuner")
    MASTER = ("MA", "Master (pair with a Slave source)")
    MASTER_8_MHZ = ("MA8", "Master at 8 MHz (pair with a Slave source)")
    SLAVE = ("SL", "Slave (pair with a Master source)")

    def __new__(cls, value, label):
        member = object.__new__(cls)
        member._value_ = value
        member.label = label
        return member

    def __str__(self):
        return self.label


class RspDuoTunerOptions(DropdownEnum):
    AUTOMATIC = ("", "Driver default")
    TUNER_1 = ("Tuner 1 50 ohm", "Tuner 1 (50 ohm)")
    TUNER_1_HIZ = ("Tuner 1 Hi-Z", "Tuner 1 (Hi-Z)")
    TUNER_2 = ("Tuner 2 50 ohm", "Tuner 2 (50 ohm)")

    def __new__(cls, value, label):
        member = object.__new__(cls)
        member._value_ = value
        member.label = label
        return member

    def __str__(self):
        return self.label


class SdrplayDeviceDescription(SoapyConnectorDeviceDescription):
    def getName(self):
        return "SDRPlay device (RSP1, RSP2, RSPduo, RSPdx)"

    def getInputs(self) -> List[Input]:
        return super().getInputs() + [
            BiasTeeInput(),
            CheckboxInput(
                "rf_notch",
                "Enable RF notch filter",
            ),
            CheckboxInput(
                "dab_notch",
                "Enable DAB notch filter",
            ),
            CheckboxInput(
                "external_reference",
                "Enable external reference clock",
            ),
            CheckboxInput(
                "hdr_ctrl",
                "Enable HDR mode (RSPdx only)",
                infotext = "The high dynamic resolution (HDR) mode will "
                + "only work when the center frequency is set to 135kHz, "
                + "175kHz, 220kHz, 250kHz, 340kHz, 475kHz, 516kHz, 875kHz, "
                + "1.125MHz, or 1.9MHz. It will not work on devices other "
                + "than RSPdx or at other center frequencies."
            ),
            DropdownInput(
                "if_mode",
                "IF Mode",
                IfModeOptions,
            ),
            NumberInput(
                "rfgain_sel",
                "RF gain reduction",
                validator=RangeValidator(0, 27),
            ),
            NumberInput(
                "agc_setpoint",
                "AGC setpoint",
                append="dBFS",
                validator=RangeValidator(-60, 0),
            ),
            DropdownInput(
                "rspduo_mode",
                "RSPduo operating mode",
                RspDuoModeOptions,
                infotext=(
                    "For two independent receiver sources, set one RSPduo source to Master and the other to Slave. "
                    "Choose the tuner for each source below, enable both sources, and set both to always-on. "
                    "Only use non-automatic modes with an RSPduo and a compatible SDRplay API/SoapySDRPlay3 driver."
                ),
            ),
            DropdownInput(
                "rspduo_tuner",
                "RSPduo tuner/input",
                RspDuoTunerOptions,
                infotext="Select Tuner 1 for the Master source and Tuner 2 for its Slave source.",
            ),
            GainInput(
                "rf_gain",
                "IF gain reduction",
                has_agc=self.hasAgc(),
            ),
        ]

    def getDeviceOptionalKeys(self):
        return super().getDeviceOptionalKeys() + [
            "bias_tee", "rf_notch", "dab_notch", "external_reference", "hdr_ctrl",
            "if_mode", "rfgain_sel", "agc_setpoint", "rspduo_mode", "rspduo_tuner"
        ]

    def getProfileOptionalKeys(self):
        return super().getProfileOptionalKeys() + [
            "bias_tee", "rf_notch", "dab_notch", "external_reference", "hdr_ctrl",
            "if_mode", "rfgain_sel", "agc_setpoint"
        ]

    def getSampleRateRanges(self) -> List[Range]:
        # this is from SoapySDRPlay3's implementation of listSampleRates().
        # i don't think it's accurate, but this is the limitation we'd be running into if we had proper soapy
        # integration.
        return [
            Range(62500),
            Range(96000),
            Range(125000),
            Range(192000),
            Range(250000),
            Range(384000),
            Range(500000),
            Range(768000),
            Range(1000000),
            Range(1536000),
            Range(2000000, 10660000),
        ]
