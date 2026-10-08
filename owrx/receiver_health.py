"""Versioned, privacy-limited receiver health events for the browser UI."""

RECEIVER_HEALTH_SCHEMA_VERSION = 1


def receiver_health_event(source, state, severity="info", message=None):
    """Build the public health projection without exposing receiver config."""
    return {
        "type": "receiver_health",
        "value": {
            "schema_version": RECEIVER_HEALTH_SCHEMA_VERSION,
            "source_id": source.getId() if source is not None else None,
            "source_name": source.getName()[:80] if source is not None else None,
            "state": str(state)[:32],
            "severity": severity if severity in ("info", "warning", "error") else "info",
            "message": str(message)[:240] if message else None,
        },
    }
