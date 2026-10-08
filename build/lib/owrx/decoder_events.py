"""Versioned browser-facing decoder status events."""

DECODER_ERROR_SCHEMA_VERSION = 1
MAX_DECODER_ERROR_BYTES = 240


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
