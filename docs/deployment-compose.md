# Docker Compose deployment

The source overlay runs this checkout's `owrx`, `csdr`, and `htdocs` files on
top of a digest-pinned OpenWebRX+ runtime image. The runtime image supplies
native SDR/DSP libraries, service initialization, and its health check. The
default image uses the standard OpenWebRX+ base; SoftMBE codecs are a separate,
opt-in image override. OpenWebRX+ publishes the standard `1.2.126` image with
its receiver and demodulator set, and a matching `1.2.126` SoftMBE image for
additional digital voice decoders ([standard image tags](https://hub.docker.com/r/slechev/openwebrxplus/tags), [SoftMBE image tags](https://hub.docker.com/r/slechev/openwebrxplus-softmbe/tags)).

## Build and run

Docker Compose v2 is required. The default port binding is loopback so an
HAProxy or another trusted reverse proxy can own public ingress:

```sh
docker compose config --quiet
docker compose build receiver
docker compose up -d receiver
docker compose ps
```

OpenWebRX configuration and receiver data persist in the named
`receiver-config` and `receiver-data` volumes. The existing setup wizard and
administrator account flow remain responsible for initial station setup. For
a different host port or direct LAN binding, set `OPENWEBRX_PORT` or
`OPENWEBRX_BIND_ADDRESS` in the environment used by Compose. Keep direct public
access behind the deployment's firewall and proxy policy; see
[`deployment-security.md`](deployment-security.md).

The service runs the pinned runtime image's SDR-aware health-check script every
30 seconds, restarts unless stopped, waits up to 30 seconds for orderly
shutdown, and sets default CPU and memory ceilings of 4 cores and 4 GiB. Adjust
`OPENWEBRX_CPUS` and `OPENWEBRX_MEMORY_LIMIT` for the host. `/tmp` is a
size-limited tmpfs; its 1 GiB limit counts against the container memory ceiling.

## Optional decoder image

The standard image is the default. To include the separately maintained SoftMBE
digital voice codec packages, build and run using the additional pinned image
variant:

```sh
docker compose -f compose.yaml -f compose.softmbe.yaml config --quiet
docker compose -f compose.yaml -f compose.softmbe.yaml build receiver
docker compose -f compose.yaml -f compose.softmbe.yaml up -d receiver
```

The SoftMBE overlay pins the matching OpenWebRX+ `1.2.126` base. It keeps the
large codec package set out of the default image; it does not run decoders in a
separate container because OpenWebRX currently launches its decoders locally.

## Optional SDR access

No device path is mapped by default. On a Linux receiver host, use the separate
overlay to grant access to the USB device bus without enabling privileged
container mode:

```sh
docker compose -f compose.yaml -f compose.sdr.yaml --profile sdr config --quiet
docker compose -f compose.yaml -f compose.sdr.yaml --profile sdr up -d receiver
```

This grants the container access to USB character devices on the host. Apply a
host udev policy to limit which users and devices are accessible, and use the
smallest device mapping your SDR driver supports. After USB reconnection or host
reboot, verify the SDRplay driver can rediscover the device; some USB APIs need
the container restarted after re-enumeration. No live SDR check is implied by
building this image.

## Upgrading and rollback

Back up both named volumes before replacing an existing deployment. Do not run
this Compose project alongside another receiver bound to the same host port.
Keep the previous image tag and a copy of the matching configuration/data
backups until the new container passes its health check and the configured SDR
and decoder paths have been exercised. Restoring a backup requires stopping the
receiver before restoring its volumes.

The runtime base digests and SoftMBE variant are recorded in `Dockerfile` and
`compose.softmbe.yaml`. Review and update those pins together with the source
version; changing only the app overlay does not refresh native packages.
For the repeatable backup, release-tag, upgrade, and restore procedure, see
[`deployment-operations.md`](deployment-operations.md).
