#!/usr/bin/env python3
"""Measure application PBKDF2 verification latency on the current host.

Run on the receiver before changing PBKDF2_ITERATIONS. The reported password
and hash are synthetic and are never printed or persisted.
"""
import argparse
import hashlib
import json
import os
import platform
import statistics
from pathlib import Path
import sys
import time

# Make direct execution from the source checkout work without installing the
# receiver package (which also needs host-provided native SDR bindings).
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from owrx.users import HashedPassword


PASSWORD = "OpenWebRX local PBKDF2 benchmark only"


def measure(iterations, samples, warmups):
    salt = os.urandom(32)
    digest = hashlib.pbkdf2_hmac("sha256", PASSWORD.encode("utf-8"), salt, iterations)
    password = HashedPassword({
        "encoding": "hash",
        "value": digest.hex(),
        "algorithm": "sha256",
        "salt": salt.hex(),
        "iterations": iterations,
    })

    for _ in range(warmups):
        if not password.is_valid(PASSWORD):
            raise RuntimeError("synthetic password verification failed")

    elapsed_ms = []
    for _ in range(samples):
        start = time.perf_counter_ns()
        valid = password.is_valid(PASSWORD)
        elapsed_ms.append((time.perf_counter_ns() - start) / 1_000_000)
        if not valid:
            raise RuntimeError("synthetic password verification failed")

    return {
        "iterations": iterations,
        "median_ms": round(statistics.median(elapsed_ms), 3),
        "min_ms": round(min(elapsed_ms), 3),
        "max_ms": round(max(elapsed_ms), 3),
        "samples_ms": [round(value, 3) for value in elapsed_ms],
    }


def positive_int(value):
    result = int(value)
    if result < 1:
        raise argparse.ArgumentTypeError("must be a positive integer")
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--iterations", nargs="+", type=positive_int,
        default=[100_000, 300_000, 600_000, 1_200_000],
        help="candidate work factors to measure (default: 100k, 300k, 600k, 1.2m)",
    )
    parser.add_argument("--samples", type=positive_int, default=7)
    parser.add_argument("--warmups", type=positive_int, default=2)
    args = parser.parse_args()

    if args.samples > 100 or args.warmups > 20:
        parser.error("samples must be <=100 and warmups must be <=20")
    if any(iterations > 10_000_000 for iterations in args.iterations):
        parser.error("iterations must not exceed the application's 10,000,000 work bound")

    report = {
        "python": sys.version.split()[0],
        "platform": platform.platform(),
        "machine": platform.machine(),
        "logical_cpus": os.cpu_count(),
        "algorithm": "PBKDF2-HMAC-SHA256",
        "measurement": "HashedPassword.is_valid",
        "results": [
            measure(iterations, args.samples, args.warmups)
            for iterations in dict.fromkeys(args.iterations)
        ],
    }
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
