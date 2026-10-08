#!/usr/bin/env python3
"""Capture host software versions and decoder availability without starting SDRs."""
import argparse
import importlib.util
import json
import platform
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone


COMMANDS = [
    "openwebrx", "csdr", "nmux", "perseustest", "rtl_connector",
    "rtl_tcp_connector", "soapy_connector", "direwolf", "m17-demod",
    "airspy_rx", "jt9", "wsprd", "wsjtx_app_version", "msk144decoder",
    "js8", "js8py", "runds_connector", "hpsdr_connector", "codecserver",
    "dump1090-fa", "dump978-fa", "dumphfdl", "dumpvdl2", "acarsdec",
    "rtl_433", "dream", "dablin", "redsea", "nrsc5", "multimon-ng",
    "convert", "rigctl", "csdr-rttyskimmer", "rs41mod", "lorarx", "lame",
    "tetrarx", "satdump", "arecord", "rockprog", "freedv_rx",
    "webrx_rade_decode", "dump1090", "dump978",
]

PYTHON_MODULES = [
    "pycsdr", "digiham", "csdreti", "js8py", "paho", "Cryptodome",
    "google", "meshtastic",
]

SHARED_LIBRARY_PREFIXES = (
    "libcsdr", "libSoapySDR", "librtlsdr", "libairspy", "libairspyhf",
    "libhackrf", "libbladeRF", "libuhd", "libLimeSuite", "libiio",
    "libmirisdr", "libperseus", "libsdrplay", "libhamlib", "libcodec2",
    "libcodecserver", "libvolk", "libfftw3", "libsamplerate", "libusb",
    "libasound", "libzmq",
)

PACKAGES = [
    "openwebrx", "owrx-connector", "python3-csdr", "python3-all",
    "python3-setuptools", "python3-distutils-extra", "python3-digiham",
    "direwolf", "wsjtx", "js8call", "runds-connector", "hpsdrconnector",
    "aprs-symbols", "m17-demod", "python3-js8py", "nmux", "codecserver",
    "msk144decoder", "dump1090-fa-minimal", "dump978-fa-minimal", "dumphfdl",
    "dumpvdl2", "acarsdec", "rtl-433", "extra-sdr-drivers", "perseus-tools",
    "dream-headless", "codec2", "redsea", "python3-csdr-eti",
    "python3-paho-mqtt", "python3-meshtastic", "python3-pycryptodome",
    "dablin", "multimon-ng", "imagemagick", "nrsc5", "libhamlib-utils",
    "csdr-skimmer", "sonde-decoders", "dxlaprs-lora", "lame", "dream",
]


def read_os_release():
    data = {}
    try:
        with open("/etc/os-release", "r") as release:
            for line in release:
                key, separator, value = line.rstrip().partition("=")
                if separator:
                    data[key] = value.strip().strip('"')
    except IOError:
        pass
    return {key: data[key] for key in ("NAME", "VERSION", "VERSION_ID", "ID") if key in data}


def package_versions():
    if not shutil.which("dpkg-query"):
        return {"available": False, "packages": {}}
    try:
        result = subprocess.run(
            ["dpkg-query", "-W", "-f=${binary:Package}\t${Version}\n"] + PACKAGES,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            universal_newlines=True,
            timeout=10,
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired):
        return {"available": False, "packages": {}}
    packages = {}
    for line in result.stdout.splitlines():
        name, separator, version = line.partition("\t")
        if separator:
            packages[name] = version
    return {"available": True, "packages": packages}


def python_modules():
    modules = {}
    for name in PYTHON_MODULES:
        try:
            spec = importlib.util.find_spec(name)
            modules[name] = None if spec is None else {
                "origin": spec.origin,
                "locations": list(spec.submodule_search_locations or []),
            }
        except (ImportError, AttributeError, ValueError):
            modules[name] = None
    return modules


def shared_libraries():
    ldconfig = shutil.which("ldconfig")
    if not ldconfig:
        return {"available": False, "libraries": {}}
    try:
        result = subprocess.run(
            [ldconfig, "-p"], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
            universal_newlines=True, timeout=10, check=False,
        )
    except (OSError, subprocess.TimeoutExpired):
        return {"available": False, "libraries": {}}

    libraries = {}
    pattern = re.compile(r"^\s*(\S+)\s+\([^)]*\)\s+=>\s+(\S+)")
    for line in result.stdout.splitlines():
        match = pattern.match(line)
        if not match:
            continue
        name, path = match.groups()
        if name.startswith(SHARED_LIBRARY_PREFIXES):
            libraries.setdefault(name, []).append(path)
    return {
        "available": result.returncode == 0,
        "libraries": {name: sorted(paths) for name, paths in sorted(libraries.items())},
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", help="write JSON to this path instead of stdout")
    args = parser.parse_args()

    report = {
        "captured_at": datetime.now(timezone.utc).isoformat(),
        "os": read_os_release(),
        "kernel": platform.release(),
        "architecture": platform.machine(),
        "python": platform.python_version(),
        "executables": {name: shutil.which(name) for name in COMMANDS},
        "python_modules": python_modules(),
        "shared_libraries": shared_libraries(),
        "debian_packages": package_versions(),
        "notes": [
            "No SDR, decoder, network, or receiver service was started by this collector.",
            "Executable paths and Python module origins show availability; versions may require package metadata.",
            "Shared-library results come from ldconfig's cache and may omit unregistered or statically linked libraries.",
            "Review the report before sharing because it describes the host software inventory.",
        ],
    }
    output = json.dumps(report, indent=2, sort_keys=True) + "\n"
    if args.output:
        with open(args.output, "w") as destination:
            destination.write(output)
    else:
        sys.stdout.write(output)


if __name__ == "__main__":
    main()
