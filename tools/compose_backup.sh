#!/usr/bin/env bash
set -euo pipefail
umask 077

usage() {
    echo "Usage: $0 BACKUP_DIRECTORY" >&2
    exit 2
}

[[ $# -eq 1 ]] || usage
command -v docker >/dev/null || { echo "docker is required" >&2; exit 1; }
command -v tar >/dev/null || { echo "tar is required" >&2; exit 1; }
command -v sha256sum >/dev/null || { echo "sha256sum is required" >&2; exit 1; }

backup_dir=$(mkdir -p -- "$1" && cd -- "$1" && pwd -P)
script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
project_root=$(cd -- "$script_dir/.." && pwd -P)
container_id=$(docker compose ps -q receiver)
[[ -n "$container_id" ]] || { echo "Compose receiver container was not found" >&2; exit 1; }
[[ $(docker inspect --format '{{.State.Running}}' "$container_id") == true ]] || {
    echo "Receiver must be running before a consistent backup can be taken" >&2
    exit 1
}

volume_for_mount() {
    local destination=$1
    docker inspect --format "{{range .Mounts}}{{if eq .Destination \"$destination\"}}{{.Name}}{{end}}{{end}}" "$container_id"
}

config_volume=$(volume_for_mount /etc/openwebrx)
data_volume=$(volume_for_mount /var/lib/openwebrx)
image=$(docker inspect --format '{{.Config.Image}}' "$container_id")
project_name=$(docker inspect --format '{{index .Config.Labels "com.docker.compose.project"}}' "$container_id")
[[ -n "$config_volume" && -n "$data_volume" && -n "$image" && -n "$project_name" ]] || {
    echo "Could not identify both receiver volumes and its image" >&2
    exit 1
}

stamp=$(date -u +%Y%m%dT%H%M%SZ)
config_archive="$backup_dir/openwebrx-config-$stamp.tar.gz"
data_archive="$backup_dir/openwebrx-data-$stamp.tar.gz"
manifest="$backup_dir/openwebrx-backup-$stamp.txt"
for file in "$config_archive" "$data_archive" "$manifest"; do
    [[ ! -e "$file" ]] || { echo "Refusing to overwrite $file" >&2; exit 1; }
done

compose_stopped=false
backup_complete=false
restart_receiver() {
    if [[ "$backup_complete" != true ]]; then
        rm -f -- "$config_archive.partial" "$data_archive.partial" \
            "$config_archive" "$data_archive" "$manifest" \
            "$backup_dir/openwebrx-backup-$stamp.sha256"
    fi
    if [[ "$compose_stopped" == true ]]; then
        docker compose start receiver >/dev/null
    fi
}
trap restart_receiver EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

echo "Stopping receiver briefly for a consistent snapshot..."
docker compose stop receiver
compose_stopped=true

archive_volume() {
    local volume=$1
    local output=$2
    local temporary="$output.partial"
    docker run --rm --network none --read-only \
        --mount "type=volume,source=$volume,target=/source,readonly" \
        --entrypoint /bin/tar "$image" \
        --numeric-owner -C /source -czf - . > "$temporary"
    tar -tzf "$temporary" >/dev/null
    mv -- "$temporary" "$output"
}

archive_volume "$config_volume" "$config_archive"
archive_volume "$data_volume" "$data_archive"

{
    echo "created_utc=$stamp"
    echo "compose_project=$project_name"
    echo "container_id=$container_id"
    echo "image=$image"
    echo "config_volume=$config_volume"
    echo "data_volume=$data_volume"
    if git -C "$project_root" rev-parse --verify HEAD >/dev/null 2>&1; then
        echo "source_commit=$(git -C "$project_root" rev-parse HEAD)"
    fi
} > "$manifest"
(cd -- "$backup_dir" && sha256sum "$(basename -- "$config_archive")" "$(basename -- "$data_archive")" "$(basename -- "$manifest")" > "openwebrx-backup-$stamp.sha256")
backup_complete=true

docker compose start receiver
compose_stopped=false
trap - EXIT INT TERM
echo "Backup written to $backup_dir (receiver restarted; verify its health before relying on it)."
