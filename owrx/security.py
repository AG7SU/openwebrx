"""Shared checks for HTTP and filesystem trust boundaries."""
import os
import re
import ipaddress
import html
from html.parser import HTMLParser
from urllib.parse import urlsplit


class _HtmlSanitizer(HTMLParser):
    allowed_tags = {
        "a", "b", "blockquote", "br", "code", "div", "em", "hr", "i",
        "li", "ol", "p", "pre", "s", "span", "strong", "sub", "sup",
        "u", "ul",
    }
    void_tags = {"br", "hr"}
    blocked_tags = {"iframe", "math", "object", "script", "style", "svg", "template"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.output = []
        self.blocked = []
        self.open_tags = []

    @staticmethod
    def _safe_href(value):
        if any(ord(char) < 32 or ord(char) == 127 for char in value) or "\\" in value:
            return None
        try:
            parsed = urlsplit(value.strip())
        except ValueError:
            return None
        if parsed.scheme:
            scheme = parsed.scheme.lower()
            if scheme in ("http", "https"):
                return value if parsed.netloc else None
            if scheme == "mailto":
                return value if parsed.path and not parsed.netloc else None
            return None
        if parsed.netloc or value.strip().startswith("//"):
            return None
        return value

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if self.blocked:
            if tag in self.blocked_tags:
                self.blocked.append(tag)
            return
        if tag in self.blocked_tags:
            self.blocked.append(tag)
            return
        if tag not in self.allowed_tags:
            return

        safe_attrs = []
        attr_values = dict(attrs)
        for name in ("class", "title"):
            value = attr_values.get(name)
            if isinstance(value, str) and (name != "class" or re.fullmatch(r"[A-Za-z0-9 _-]{1,128}", value)):
                safe_attrs.append((name, value))
        if tag == "a":
            href = attr_values.get("href")
            href = self._safe_href(href) if href is not None else None
            if href is not None:
                safe_attrs.append(("href", href))
            target = attr_values.get("target")
            if target in ("_blank", "_self"):
                safe_attrs.append(("target", target))
            if target == "_blank":
                safe_attrs.append(("rel", "noopener noreferrer"))
        rendered_attrs = "".join(
            ' {0}="{1}"'.format(name, html.escape(value, quote=True))
            for name, value in safe_attrs
        )
        self.output.append("<{0}{1}>".format(tag, rendered_attrs))
        if tag not in self.void_tags:
            self.open_tags.append(tag)

    def handle_endtag(self, tag):
        tag = tag.lower()
        if self.blocked:
            if tag == self.blocked[-1]:
                self.blocked.pop()
            return
        if tag not in self.allowed_tags or tag in self.void_tags or tag not in self.open_tags:
            return
        while self.open_tags:
            current = self.open_tags.pop()
            self.output.append("</{0}>".format(current))
            if current == tag:
                break

    def handle_data(self, data):
        if not self.blocked:
            self.output.append(html.escape(data))

    def result(self):
        while self.open_tags:
            self.output.append("</{0}>".format(self.open_tags.pop()))
        return "".join(self.output)


def sanitize_html(value):
    """Keep basic formatting while removing executable markup and unsafe links."""
    sanitizer = _HtmlSanitizer()
    sanitizer.feed("" if value is None else str(value))
    sanitizer.close()
    return sanitizer.result()


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


def resolve_client_ip(peer_ip, forwarded_for, trusted_proxies):
    """Resolve a client address only through explicitly trusted proxy hops.

    Returns ``(client_ip, proxied)``. A trusted proxy without a valid
    X-Forwarded-For chain returns ``(None, True)`` so callers can fail closed.
    """
    peer = ipaddress.ip_address(peer_ip)
    trusted = []
    for network in trusted_proxies:
        try:
            trusted.append(ipaddress.ip_network(network.strip(), strict=False))
        except ValueError:
            continue

    def is_trusted(address):
        return any(address in network for network in trusted)

    if not is_trusted(peer):
        return str(peer), False
    if not forwarded_for:
        return None, True

    try:
        chain = [ipaddress.ip_address(value.strip()) for value in forwarded_for.split(",")]
    except ValueError:
        return None, True
    if not chain:
        return None, True

    current = peer
    for candidate in reversed(chain):
        if not is_trusted(current):
            break
        current = candidate
    return str(current), True


def configured_trusted_proxies():
    """Return the single process-wide allowlist used for forwarded addresses."""
    return [value.strip() for value in os.environ.get("OWRX_TRUSTED_PROXIES", "").split(",") if value.strip()]


_DEFAULT_ADMIN_NETWORKS = tuple(
    ipaddress.ip_network(value)
    for value in (
        "127.0.0.0/8", "::1/128", "10.0.0.0/8", "172.16.0.0/12",
        "192.168.0.0/16", "169.254.0.0/16", "fc00::/7", "fe80::/10",
    )
)


def is_local_admin_address(address):
    """Allow standard local networks and explicitly configured admin CIDRs."""
    try:
        client = ipaddress.ip_address(address)
    except (TypeError, ValueError):
        return False
    if any(client.version == network.version and client in network for network in _DEFAULT_ADMIN_NETWORKS):
        return True
    for value in os.environ.get("OWRX_ADMIN_NETWORKS", "").split(","):
        try:
            if client in ipaddress.ip_network(value.strip(), strict=False):
                return True
        except ValueError:
            continue
    return False


def resolve_request_identity(peer_ip, forwarded_for):
    """Return the verified client IP and whether it may use local admin access."""
    try:
        client_ip, proxied = resolve_client_ip(
            peer_ip, forwarded_for, configured_trusted_proxies()
        )
    except (TypeError, ValueError):
        return peer_ip, False
    if proxied and client_ip is None:
        return None, False
    if client_ip is None:
        return peer_ip, False
    return client_ip, is_local_admin_address(client_ip)
