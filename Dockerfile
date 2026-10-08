# The upstream image supplies the native SDR/DSP runtime. Overlay this checkout
# so the container runs the source tree being built instead of upstream Python
# and browser assets from the base image.
ARG OPENWEBRX_BASE_IMAGE=slechev/openwebrxplus:1.2.126@sha256:967182a51ebaef5f79ccab60205ff85228c0aa5bcb8518d7940eb43c0df17361
FROM ${OPENWEBRX_BASE_IMAGE}

ARG OPENWEBRX_VERSION=1.2.126
LABEL org.opencontainers.image.title="OpenWebRX+ modernized source overlay" \
      org.opencontainers.image.version="${OPENWEBRX_VERSION}" \
      org.opencontainers.image.licenses="AGPL-3.0-only"

COPY csdr/ /usr/lib/python3/dist-packages/csdr/
COPY owrx/ /usr/lib/python3/dist-packages/owrx/
COPY htdocs/ /usr/lib/python3/dist-packages/htdocs/
