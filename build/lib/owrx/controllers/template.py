from owrx.controllers import Controller
from owrx.details import ReceiverDetails
from owrx.config import Config
from owrx.security import sanitize_html
from string import Template
import importlib.resources
import html
from urllib.parse import urlsplit


class TemplateController(Controller):
    def render_template(self, file, **vars):
        file_content = importlib.resources.files("htdocs").joinpath(file).read_text(encoding="utf-8")
        template = Template(file_content)

        return template.safe_substitute(**vars)

    def serve_template(self, file, **vars):
        self.send_response(self.render_template(file, **vars), content_type="text/html")

    def default_variables(self):
        return {}


class WebpageController(TemplateController):
    def get_document_root(self):
        path_parts = [part for part in self.request.path[1:].split("/")]
        levels = max(0, len(path_parts) - 1)
        return "../" * levels

    def header_variables(self):
        variables = {
            "document_root": self.get_document_root(),
            "map_type": "",
            "csrf_token": self.get_csrf_token() or "",
            "csp_nonce": html.escape(self.csp_nonce, quote=True),
        }
        details = ReceiverDetails().__dict__()
        for key, value in details.items():
            if key == "photo_desc":
                details[key] = sanitize_html(value)
                continue
            if key == "receiver_help":
                value = self._safe_help_url(value)
            elif key == "usage_policy_url":
                value = self._safe_policy_url(value)
            elif key == "session_timeout":
                try:
                    value = max(0, int(value))
                except (TypeError, ValueError):
                    value = 0
            else:
                value = "" if value is None else value
            details[key] = html.escape(str(value), quote=True)
        variables.update(details)
        return variables

    @staticmethod
    def _safe_help_url(value):
        value = "" if value is None else str(value)
        if any(ord(char) < 32 or ord(char) == 127 for char in value) or "\\" in value:
            return "#"
        try:
            parsed = urlsplit(value)
        except ValueError:
            return "#"
        if parsed.scheme:
            return value if parsed.scheme.lower() in ("http", "https") and parsed.netloc else "#"
        return value if value and not parsed.netloc and not value.startswith("//") else "#"

    @staticmethod
    def _safe_policy_url(value):
        value = "policy" if value is None else str(value)
        if any(ord(char) < 32 or ord(char) == 127 for char in value) or "\\" in value:
            return "policy"
        try:
            parsed = urlsplit(value)
        except ValueError:
            return "policy"
        if parsed.scheme:
            return value if parsed.scheme.lower() in ("http", "https") and parsed.netloc else "policy"
        return value if not parsed.netloc and not value.startswith("//") else "policy"

    def template_variables(self):
        header = self.render_template("include/header.include.html", **self.header_variables())
        return {
            "header": header,
            "document_root": self.get_document_root(),
            "csrf_token": self.get_csrf_token() or "",
            "csp_nonce": html.escape(self.csp_nonce, quote=True),
        }


class IndexController(WebpageController):
    def indexAction(self):
        self.serve_template("index.html", **self.template_variables())


class MapController(WebpageController):
    def indexAction(self):
        # TODO check if we have a google maps api key first?
        map_type = self.map_type()
        self.csp_unsafe_eval = map_type == "google"
        self.serve_template("map-{}.html".format(map_type), **self.template_variables())

    def header_variables(self):
        # Invert map type for the "map" toolbar icon
        variables = super().header_variables();
        type = self.map_type()
        if type == "google":
            variables.update({ "map_type" : "?type=leaflet" })
        elif type == "leaflet":
            variables.update({ "map_type" : "?type=google" })
        return variables

    def map_type(self):
        pm = Config.get()
        if "type" not in self.request.query:
            type = pm["map_type"]
        else:
            type = self.request.query["type"][0]
            if type not in ["google", "leaflet"]:
                type = pm["map_type"]
        return type


class PolicyController(WebpageController):
    def indexAction(self):
        self.serve_template("policy.html", **self.template_variables())
