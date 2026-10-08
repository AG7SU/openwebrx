"""Shared checks for HTTP and filesystem trust boundaries."""
import os
import re
from urllib.parse import urlsplit


def local_redirect(target, default="/settings"):
    if not isinstance(target, str) or any(ord(c) < 32 or ord(c) == 127 for c in target):
        return default
    if not target.startswith("/") or target.startswith("//") or "\\" in target:
        return default
    return target


def confined_path(root, filename):
    root = os.path.realpath(root)
    path = os.path.realpath(os.path.join(root, filename))
    if os.path.commonpath([root, path]) != root or path == root:
        raise FileNotFoundError("invalid asset path")
    return path


def upload_path(root, filename, image_id=None):
    prefix = re.escape(image_id) if image_id else r"(?:receiver_avatar|receiver_top_photo)"
    if not isinstance(filename, str) or not re.fullmatch(prefix + r"-[0-9a-f]{32}\.(?:png|jpg|webp)", filename):
        raise FileNotFoundError("invalid upload filename")
    return confined_path(root, filename)


def cross_site_request(headers):
    # Fetch Metadata also covers legacy state-changing GET links.
    if headers.get("Sec-Fetch-Site") in ("cross-site", "same-site"):
        return True
    origin = headers.get("Origin") or headers.get("Referer")
    if origin is None:
        return False
    try:
        parsed = urlsplit(origin)
        return (parsed.scheme not in ("http", "https") or not parsed.netloc
                or parsed.netloc.lower() != headers.get("Host", "").lower())
    except ValueError:
        return True
