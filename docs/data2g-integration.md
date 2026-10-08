# Data2G receive integration notes

This checkout evaluates the local Data2G source at commit
`3a859720911469cf5164bfc9d7de6ac63c169fd8` (2026-10-07). This is an integration
candidate pin for interface work, not a declared release dependency. The other
checkout has an untracked `build/` directory; no files there were changed.

At this revision the Python host exposes a KISS server on port 8100 and command
server on port 8300 by default. Port 0 is the `KISS 0` group; `BCAST OPEN` can
allocate named groups on ports 1–15. KISS data frames use command nibble 0 and
the port in the high nibble. KISS ACKMODE uses command 0x0c. The OpenWebRX
worker opens the `APRS` group to enable the host's broadcast status stream while
leaving the default port-0 `KISS 0` group active. It does not send `LISTEN ON`,
so Data2G's ARQ listener and automatic ARQ replies remain disabled. Broadcast
frames still decode and arrive on KISS. The worker reads `BUSY ON/OFF` and
`BCAST` burst outcomes on the command connection.

The native `data2g-host` at this revision supports `--audio-io pipe:IN,OUT` for
raw mono float32 at 8 kHz and `--no-rig` to disable rig control/PTT. It does not
advertise a TX-disabled protocol mode: a local KISS client can still enqueue
frames for transmission. The process is physically receive-only when launched
with `--no-rig`, decoded receiver audio on the pipe input, and `/dev/null` as its
audio output. Both command and KISS listeners bind to loopback. The worker does
not enable the ARQ listener; queued KISS frames from another local client still
cannot reach RF because the host has neither PTT control nor an audio output
route. The KISS API itself still accepts transmit frames, so a protocol-level
TX-disable option would provide a stronger invariant. The WAV smoke test uses
this no-rig/discard-output launch and verifies reception without `LISTEN ON`.

The existing receiver KISS deframer only exposed port-0 payload bytes and
discarded command information. `owrx.kiss_frames.KissStreamDecoder` now
preserves port, command, and payload, handles fragmented and escaped streams,
and bounds an individual frame at 1 MiB. Its tests cover multi-port packets,
ACKMODE classification, bad escapes, oversized frames, and resynchronization.

## Optional OpenWebRX receive mode

The optional `Data2G RX` digital mode appears when the server process has
`OPENWEBRX_DATA2G_HOST` set to an absolute executable path for the reviewed
native `data2g-host` build. For example, place this variable in the OpenWebRX
service's protected environment configuration:

```sh
OPENWEBRX_DATA2G_HOST=/opt/data2g/bin/data2g-host
```

Restart OpenWebRX after configuring the environment. Choose USB or LSB and then
`Data2G RX` in the receiver mode selector. The secondary demodulator fixes the
primary demodulator output at mono float32/8 kHz, applies the primary
demodulator's sideband filter, and branches from `audioBuffer` before browser
volume and noise reduction. The decoder does not follow browser squelch. The
legacy browser audio chain converts this same branch to its requested playback
rate; changes to volume or noise reduction do not change Data2G input.

The modern receiver shows decoded APRS UI frames with source, destination, and
information text, while preserving non-APRS KISS data/control frames as typed
port, command, length, and hex events. AX.25/UI framing and recognized APRS data
types are checked before the existing `Ax25Parser` and `AprsParser` run; those
parsers retain their current map and reporting behavior. Frames appear only
after Data2G completes burst decoding. Other application protocols carried in
KISS payloads still need dedicated handlers. Data2G browser events use
`schema_version: 1`: `data2g_frame` requires integer `port` and `command` values
from 0 through 15, a payload length from 0 through 4096 bytes, and an exact
hexadecimal representation; `data2g_aprs` requires string source, destination,
and data fields; `data2g_status` v1 accepts listening, overrun, error,
restarting, busy, idle, heard, lost, missed, and dropped states with bounded
fields. Unknown versions and malformed events are dropped at the browser
boundary. The modern receiver retains a bounded recent activity list for channel
and burst events; complete KISS/APRS messages still appear only after host
decoding. Other decoder event families have not yet migrated to a versioned
contract.

The worker starts one native process per active Data2G receiver session, with
`--no-rig`, loopback-only command/KISS sockets, no output device, `/dev/null` as
the audio output, host recording disabled, and the ARQ listener left off. This
prevents automatic ARQ replies and RF transmission from the worker, though the
local KISS server still accepts queued transmit frames and a host-level TX-
disable option remains desirable. At most two worker processes may run per
OpenWebRX process. Equivalent sessions are not shared;
additional sessions receive a worker-limit error. PCM enters a nonblocking
queue capped at 64 KiB (two seconds of 8 kHz float32 mono) and each chunk is
limited to 256 KiB. Queue overflow drops newest audio and reports an overrun;
an independent supervisor retries startup and restarts failed host/KISS sessions
with bounded exponential backoff while the DSP input pump continues draining.
`test/test_data2g_worker.py` covers the bounded queue, status-line projection,
and restart state machine.
To exercise process recovery against a native Data2G build without starting an
SDR or DSP chain, set `OPENWEBRX_DATA2G_TEST_HOST` to its executable and run:

```sh
OPENWEBRX_DATA2G_TEST_HOST=/path/to/data2g-host \
  uv run python -m unittest test.test_data2g_worker.Data2GHostWorkerTest.test_supervisor_recovers_after_native_host_is_killed
```

The integration test kills the first native host process and verifies the
supervisor starts a second healthy process. It does not verify SDR lifecycle or
RF reception.

To verify that two independent workers can run concurrently within the configured
process limit and each decode the same controlled burst, run:

```sh
uv run --project /path/to/Data2G python tools/data2g_rx_smoke.py \
  --host /path/to/data2g-host --openwebrx-worker --worker-count 2
```

This passed against the pinned native host. It verifies concurrent worker/host
operation and independent KISS/status delivery; it does not replace live dual-
tuner SDR or RF verification.

The worker can be tested without a receiver or transmitter by replaying the
generated Data2G broadcast through its real native-host, FIFO, and KISS path:

```sh
uv run --project /path/to/Data2G python tools/data2g_rx_smoke.py \
  --host /path/to/data2g-host --openwebrx-worker
```

This remains a controlled generated-signal check. SDR-host shutdown lifecycle
and RF reception need verification on a receiver installation.

## OpenWebRX audio tap candidate

`owrx/dsp.py` wires the primary demodulator into `ClientDemodulatorChain`'s
`audioBuffer`, then into `ClientAudioChain`. `Data2GDemodulator` is now an
optional secondary chain on that buffer. Its fixed 8 kHz rate tells the existing
selector and primary USB/LSB demodulator to produce the host's native input rate;
the branch precedes browser processing and does not enable squelch. With a
receiver image built from this checkout and running, the synthetic-IQ
integration check runs the real pycsdr selector, USB demodulator, secondary
branch, and Data2G worker FIFO:

```sh
docker compose exec -T receiver python3 - < test/data2g_csdr_tap_smoke.py
```

It confirms that a 1 kHz USB-sideband tone reaches the native-host FIFO as
finite, non-silent float32 audio at 8 kHz, before browser volume and noise
processing. It uses synthetic IQ and a fake host, so it does not verify SDR
ingestion, hardware lifecycle, Data2G burst decoding in this chain, or RF.

## Recorded-WAV smoke test

The initial experiment sent a valid modem burst without Data2G's KISS broadcast
control codewords and group-keyed payload. The native host correctly emitted no
KISS frame; a plain modem payload is not a valid broadcast. The corrected,
repeatable check is `tools/data2g_rx_smoke.py`. It uses Data2G's own `KissLink`
and PHY encoder to create a port-0 broadcast, writes a mono PCM WAV at 8 kHz,
converts that audio into the native host's raw float32 pipe format, and requires
the exact AX.25 frame on the KISS socket without enabling the ARQ listener. Run
it in an environment with the pinned Data2G Python package and native host
available:

```sh
uv run --project /path/to/Data2G python tools/data2g_rx_smoke.py \
  --host /path/to/Data2G/native/build/data2g-host
```

On 2026-10-08 it passed against a native build from candidate commit
`3a859720911469cf5164bfc9d7de6ac63c169fd8`, using the OpenWebRX worker. The
host ran with `--no-rig`, loopback listeners, and `/dev/null` as the audio output
sink; it received the expected 42-byte frame without `LISTEN ON`. This
establishes generated-WAV to worker to native-host PCM-pipe to KISS
interoperability while keeping host output disconnected from radio hardware.
It does not establish live SDR audio integration or RF reception, and arbitrary
local KISS clients are still accepted as possible transmit-frame sources.
The same pinned binary also passed the OpenWebRX worker's host-kill/restart
integration test and its generated-waveform worker smoke test (exact KISS frame
and `BCAST HEARD` status). These validate process recovery and the host-facing
PCM/KISS/status boundary; neither exercises a live SDR or RF.
