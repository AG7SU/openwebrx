# Compose backup, upgrade, and rollback

Run these commands from the directory containing `compose.yaml`. Backups
contain OpenWebRX configuration, including account and station settings; store
them outside the repository with access limited to the receiver administrator.

## Create a consistent backup

The helper discovers the two volumes mounted by the running Compose receiver,
records their exact Docker names and image in a manifest, verifies both tar
archives, and writes SHA-256 checksums. It stops the receiver while copying so
configuration and receiver data form a consistent snapshot; expect reception
to pause briefly. It automatically starts the receiver again if a backup step
fails.

```sh
./tools/compose_backup.sh /path/to/protected/openwebrx-backups
```

After the command returns, check `docker compose ps` and the receiver's health
before relying on the backup. Keep the manifest and checksum file beside the
archives. Test restore procedures against a separate Compose project before
depending on them for recovery.

## Build and deploy a release

Give each source revision a unique image tag so the last known-good image stays
available for rollback. Record the source commit and the runtime base digest
from `Dockerfile` with the release notes. Build and start the candidate using
its own tag:

```sh
export OPENWEBRX_VERSION=1.2.126-modern.20261008.1
docker compose config --quiet
docker compose build receiver
docker compose up -d --no-build receiver
docker compose ps
curl -fsS http://127.0.0.1:8073/status.json
```

Keep a verified configuration/data backup before an upgrade. Confirm the
health check, status endpoint, login, tuning, audio, configured decoder paths,
and hardware access before treating the release as accepted. Record any
deployment-specific steps, such as the SDR overlay and protected environment
settings, alongside the image tag.

## Roll back the image

If the candidate fails before changing persistent data, switch to the previous
unique image tag and start it without rebuilding:

```sh
export OPENWEBRX_VERSION=1.2.126-modern.20261001.1
docker compose up -d --no-build receiver
docker compose ps
curl -fsS http://127.0.0.1:8073/status.json
```

If the candidate migrated or damaged persistent state, restore both archives
from the same backup set before starting the old image. The manifest supplies
the exact `config_volume`, `data_volume`, and helper `image` values. Restoring
overwrites the selected volumes, so verify the manifest and checksums first,
stop the receiver, and preserve the current volumes if you may need to inspect
the failed state.

Example restore commands (replace the values from the manifest and archive
filenames; do not point them at unrelated volumes):

```sh
export CONFIG_VOLUME=receiver-config-volume-name-from-manifest
export DATA_VOLUME=receiver-data-volume-name-from-manifest
export HELPER_IMAGE=openwebrx-modern:image-from-manifest
sha256sum -c openwebrx-backup-BACKUP_TIMESTAMP.sha256
docker compose stop receiver
docker run --rm -i --network none \
  --mount type=volume,source="$CONFIG_VOLUME",target=/target \
  --entrypoint /bin/sh "$HELPER_IMAGE" \
  -c 'find /target -mindepth 1 -maxdepth 1 -exec rm -rf -- {} + && tar -xzpf - -C /target' \
  < openwebrx-config-BACKUP_TIMESTAMP.tar.gz
docker run --rm -i --network none \
  --mount type=volume,source="$DATA_VOLUME",target=/target \
  --entrypoint /bin/sh "$HELPER_IMAGE" \
  -c 'find /target -mindepth 1 -maxdepth 1 -exec rm -rf -- {} + && tar -xzpf - -C /target' \
  < openwebrx-data-BACKUP_TIMESTAMP.tar.gz
docker compose up -d --no-build receiver
docker compose ps
curl -fsS http://127.0.0.1:8073/status.json
```

The restore commands are destructive to the selected volume contents. Practice
them on copies first; a healthy HTTP status alone does not prove SDR, audio, or
decoder recovery.
