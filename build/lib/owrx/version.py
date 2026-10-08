from packaging.version import InvalidVersion, Version

_versionstring = "1.2.126"
looseversion = Version(_versionstring)
openwebrx_version = "v{0}".format(_versionstring)


def is_at_least(actual, required):
    """Compare decoder versions using PEP 440; invalid external versions fail closed."""
    try:
        return Version(str(actual)) >= Version(str(required))
    except (InvalidVersion, TypeError):
        return False
