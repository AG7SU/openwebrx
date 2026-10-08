import os
import subprocess
import tempfile
import tarfile
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
BACKUP_SCRIPT = PROJECT_ROOT / "tools" / "compose_backup.sh"


class ComposeBackupScriptTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="openwebrx-backup-test-")
        self.root = Path(self.temp.name)
        self.bin_dir = self.root / "bin"
        self.bin_dir.mkdir()
        self.fixtures = self.root / "fixtures"
        (self.fixtures / "config").mkdir(parents=True)
        (self.fixtures / "data").mkdir()
        (self.fixtures / "config" / "settings.json").write_text('{"station":true}\n')
        (self.fixtures / "data" / "receiver.sqlite").write_text("sample data\n")
        self.log = self.root / "docker.log"
        self.fake_docker = self.bin_dir / "docker"
        self.fake_docker.write_text(r'''#!/usr/bin/env bash
set -eu
echo "$*" >> "$FAKE_DOCKER_LOG"
if [[ "$1" == compose ]]; then
    case "$2" in
        ps) echo fake-container ;;
        stop|start) exit 0 ;;
        *) exit 2 ;;
    esac
elif [[ "$1" == inspect ]]; then
    template=$3
    case "$template" in
        *State.Running*) echo "${FAKE_RECEIVER_RUNNING:-true}" ;;
        *Config.Image*) echo "openwebrx-modern:test" ;;
        *com.docker.compose.project*) echo "openwebrx-test" ;;
        *etc/openwebrx*) echo "config-volume" ;;
        *var/lib/openwebrx*) echo "data-volume" ;;
        *) exit 3 ;;
    esac
elif [[ "$1" == run ]]; then
    volume=
    for argument in "$@"; do
        if [[ "$argument" == type=volume,source=* ]]; then
            volume=${argument#type=volume,source=}
            volume=${volume%%,*}
        fi
    done
    if [[ "${FAKE_FAIL_VOLUME:-}" == "$volume" ]]; then exit 23; fi
    case "$volume" in
        config-volume) fixture=config ;;
        data-volume) fixture=data ;;
        *) exit 4 ;;
    esac
    /bin/tar --numeric-owner -C "$FAKE_BACKUP_FIXTURES/$fixture" -czf - .
else
    exit 5
fi
''')
        self.fake_docker.chmod(0o755)

    def tearDown(self):
        self.temp.cleanup()

    def run_backup(self, *, running="true", fail_volume=""):
        backup_dir = self.root / "backups"
        env = os.environ.copy()
        env.update({
            "PATH": f"{self.bin_dir}:{env['PATH']}",
            "FAKE_BACKUP_FIXTURES": str(self.fixtures),
            "FAKE_DOCKER_LOG": str(self.log),
            "FAKE_RECEIVER_RUNNING": running,
            "FAKE_FAIL_VOLUME": fail_volume,
        })
        result = subprocess.run(
            ["bash", str(BACKUP_SCRIPT), str(backup_dir)],
            cwd=PROJECT_ROOT,
            env=env,
            capture_output=True,
            text=True,
            check=False,
        )
        return result, backup_dir

    def test_backup_archives_both_actual_volumes_and_records_provenance(self):
        result, backup_dir = self.run_backup()
        self.assertEqual(result.returncode, 0, result.stderr)
        archives = list(backup_dir.glob("*.tar.gz"))
        self.assertEqual(len(archives), 2)
        config_archive = next(path for path in archives if "config" in path.name)
        data_archive = next(path for path in archives if "data-" in path.name)
        with tarfile.open(config_archive, "r:gz") as archive:
            self.assertIn("./settings.json", archive.getnames())
        with tarfile.open(data_archive, "r:gz") as archive:
            self.assertIn("./receiver.sqlite", archive.getnames())

        manifest = next(backup_dir.glob("*.txt")).read_text()
        self.assertIn("compose_project=openwebrx-test", manifest)
        self.assertIn("image=openwebrx-modern:test", manifest)
        self.assertIn("config_volume=config-volume", manifest)
        self.assertIn("data_volume=data-volume", manifest)
        checksum_file = next(backup_dir.glob("*.sha256"))
        verified = subprocess.run(
            ["sha256sum", "-c", checksum_file.name],
            cwd=backup_dir,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(verified.returncode, 0, verified.stdout + verified.stderr)
        log = self.log.read_text()
        self.assertLess(log.index("compose stop receiver"), log.index("run --rm"))
        self.assertLess(log.index("run --rm"), log.index("compose start receiver"))

    def test_receiver_restarts_and_partial_backup_is_removed_after_archive_failure(self):
        result, backup_dir = self.run_backup(fail_volume="data-volume")
        self.assertNotEqual(result.returncode, 0)
        self.assertTrue(any("compose start receiver" in line for line in self.log.read_text().splitlines()))
        self.assertEqual(list(backup_dir.iterdir()), [])

    def test_stopped_receiver_is_rejected_without_stopping_or_starting_it(self):
        result, _backup_dir = self.run_backup(running="false")
        self.assertNotEqual(result.returncode, 0)
        log = self.log.read_text()
        self.assertNotIn("compose stop receiver", log)
        self.assertNotIn("compose start receiver", log)


if __name__ == "__main__":
    unittest.main()
