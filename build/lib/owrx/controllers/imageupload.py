from owrx.controllers import BodySizeError
from owrx.controllers.assets import AssetsController
from owrx.controllers.admin import AuthorizationMixin
from owrx.config.core import CoreConfig
from owrx.form.input.gfx import AvatarInput, TopPhotoInput
from owrx.security import upload_path
import logging
import os
import shutil
import subprocess
import tempfile
import uuid
import json

logger = logging.getLogger(__name__)


class ImageUploadController(AuthorizationMixin, AssetsController):
    # max upload filesizes
    max_sizes = {
        # not the best idea to instantiate inputs, but i didn't want to duplicate the sizes here
        "receiver_avatar": AvatarInput("id", "label").getMaxSize(),
        "receiver_top_photo": TopPhotoInput("id", "label").getMaxSize(),
    }
    max_reencoded_size = 20 * 1024 * 1024
    max_image_dimension = 2048
    image_convert_timeout = 15

    def __init__(self, handler, request, options):
        super().__init__(handler, request, options)
        self.file = request.query["file"][0] if "file" in request.query else None

    def getFilePath(self, file=None):
        if self.file is None:
            raise FileNotFoundError("missing filename")
        return upload_path(CoreConfig().get_temporary_directory(), self.file)

    def indexAction(self):
        self.serve_file(None)

    def _is_png(self, contents):
        return contents[0:8] == bytes([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])

    def _is_jpg(self, contents):
        return contents[0:3] == bytes([0xFF, 0xD8, 0xFF])

    def _is_webp(self, contents):
        return contents[0:4] == bytes([0x52, 0x49, 0x46, 0x46]) and contents[8:12] == bytes([0x57, 0x45, 0x42, 0x50])

    def _decode_and_reencode(self, contents, filetype):
        converter = shutil.which("magick") or shutil.which("convert")
        if not converter:
            raise RuntimeError("image decoder is unavailable")

        temporary_directory = CoreConfig().get_temporary_directory()
        source_path = None
        output_path = None
        try:
            with tempfile.NamedTemporaryFile(prefix=".owrx-upload-", dir=temporary_directory, delete=False) as source:
                source.write(contents)
                source_path = source.name
            with tempfile.NamedTemporaryFile(prefix=".owrx-normalized-", suffix=".png", dir=temporary_directory, delete=False) as output:
                output_path = output.name

            source_format = {"png": "PNG", "jpg": "JPEG", "webp": "WEBP"}[filetype]
            command = [
                converter,
                "-limit", "memory", "64MiB",
                "-limit", "map", "128MiB",
                "-limit", "disk", "128MiB",
                "-limit", "area", "4194304",
                "-limit", "time", "10",
                "-limit", "thread", "1",
                source_format + ":" + source_path + "[0]",
                "-auto-orient",
                "-strip",
                "-thumbnail", "{}x{}>".format(self.max_image_dimension, self.max_image_dimension),
                "-colorspace", "sRGB",
                "PNG:" + output_path,
            ]
            subprocess.run(
                command,
                check=True,
                stdin=subprocess.DEVNULL,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                timeout=self.image_convert_timeout,
                close_fds=True,
            )

            if os.path.getsize(output_path) > self.max_reencoded_size:
                raise ValueError("normalized image is too large")
            with open(output_path, "rb") as output:
                normalized = output.read(self.max_reencoded_size + 1)
            if len(normalized) > self.max_reencoded_size or not self._is_png(normalized):
                raise ValueError("image decoder produced invalid output")
            return normalized
        finally:
            for path in (source_path, output_path):
                if path:
                    try:
                        os.unlink(path)
                    except OSError:
                        pass

    def processImage(self):
        if "id" not in self.request.query:
            self.send_json_response({"error": "missing id"}, code=400)
            return
        file_id = self.request.query["id"][0]

        if file_id not in ImageUploadController.max_sizes:
            self.send_json_response({"error": "unexpected image id"}, code=400)
            return

        try:
            contents = self.get_body(ImageUploadController.max_sizes[file_id])
        except BodySizeError:
            self.send_json_response({"error": "file size too large"}, code=400)
            return

        filetype = None
        if self._is_png(contents):
            filetype = "png"
        elif self._is_jpg(contents):
            filetype = "jpg"
        elif self._is_webp(contents):
            filetype = "webp"
        if filetype is None:
            self.send_json_response({"error": "unsupported file type"}, code=400)
            return

        try:
            contents = self._decode_and_reencode(contents, filetype)
        except RuntimeError:
            logger.error("Image upload rejected because ImageMagick is unavailable")
            self.send_json_response({"error": "image processing is unavailable"}, code=503)
            return
        except (OSError, subprocess.SubprocessError, ValueError):
            logger.warning("Image upload rejected because decoding or normalization failed")
            self.send_json_response({"error": "invalid or oversized image"}, code=400)
            return

        self.file = "{id}-{uuid}.{ext}".format(
            id=file_id,
            uuid=uuid.uuid4().hex,
            ext="png",
        )
        with open(self.getFilePath(), "xb") as f:
            f.write(contents)
        self.send_json_response({"file": self.file}, code=200)

    def send_json_response(self, obj, code):
        self.send_response(json.dumps(obj), code=code, content_type="application/json")
