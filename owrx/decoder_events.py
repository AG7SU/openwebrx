"""Versioned browser-facing decoder status events."""

import re
import time

DECODER_ERROR_SCHEMA_VERSION = 1
MAX_DECODER_ERROR_BYTES = 240
DECODER_OUTPUT_SCHEMA_VERSION = 1
_DECODER_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$")


def decoder_output_event(modulation=None):
    """Report one completed legacy decoder output through a stable envelope."""
    value = {
        "schema_version": DECODER_OUTPUT_SCHEMA_VERSION,
        "received_at": time.time(),
    }
    if isinstance(modulation, str) and _DECODER_ID.fullmatch(modulation):
        value["modulation"] = modulation
    return {
        "type": "decoder_output",
        "value": value,
    }


def secondary_decoder_events(message, modulation=None):
    """Publish versioned activity plus the legacy payload during migration."""
    is_versioned_data2g = (
        isinstance(message, dict)
        and message.get("type") in {"data2g_frame", "data2g_aprs", "data2g_status"}
        and message.get("schema_version") == 1
    )
    events = [] if is_versioned_data2g else [decoder_output_event(modulation)]
    events.append({"type": "secondary_demod", "value": message})
    return events


def decoder_error_event(message):
    """Build the bounded decoder-error contract consumed by modern clients."""
    if isinstance(message, bytes):
        message = message.decode("utf-8", "replace")
    return {
        "type": "decoder_error",
        "value": {
            "schema_version": DECODER_ERROR_SCHEMA_VERSION,
            "message": str(message)[:MAX_DECODER_ERROR_BYTES],
        },
    }


def decoder_error_events(message):
    """Publish the new contract alongside the legacy string during migration."""
    return [
        decoder_error_event(message),
        {"type": "demodulator_error", "value": message},
    ]
