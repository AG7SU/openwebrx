from owrx.security import local_redirect
from owrx.controllers.template import WebpageController
from owrx.config import Config
from urllib.parse import parse_qs, urlencode
from uuid import uuid4
from http.cookies import SimpleCookie
from owrx.users import UserList, CleartextPassword, DefaultPasswordClass, HashedPassword
from datetime import datetime, timedelta, timezone
from threading import RLock
import os
import time

import logging

logger = logging.getLogger(__name__)


def add_cookie(cookie, name, value, request, max_age=None):
    cookie[name] = value
    cookie[name]["path"] = "/"
    cookie[name]["httponly"] = True
    cookie[name]["samesite"] = "Strict"
    if max_age is not None:
        cookie[name]["max-age"] = max_age
    if getattr(request, "secure", False) or os.environ.get("OWRX_SECURE_COOKIES", "").lower() in ("1", "true", "yes"):
        cookie[name]["secure"] = True


def build_cookie(name, value, request):
    cookie = SimpleCookie()
    add_cookie(cookie, name, value, request)
    return cookie


def build_session_cookie(value, request):
    return build_cookie("owrx-session", value, request)


class SessionStorage(object):
    sharedInstance = None
    sessionLifetime = timedelta(hours=6)
    maxSessions = 2048

    @staticmethod
    def getSharedInstance():
        if SessionStorage.sharedInstance is None:
            SessionStorage.sharedInstance = SessionStorage()
        return SessionStorage.sharedInstance

    def __init__(self):
        self.sessions = {}
        self.lock = RLock()

    def generateKey(self):
        return str(uuid4())

    def startSession(self, data):
        key = self.generateKey()
        self.updateSession(key, data)
        return key

    def getSession(self, key):
        with self.lock:
            if key not in self.sessions:
                return None
            expires, data = self.sessions[key]
            if expires < datetime.now(timezone.utc):
                del self.sessions[key]
                return None
            return data

    def getCsrfToken(self, key):
        with self.lock:
            if key not in self.sessions:
                return None
            expires, data = self.sessions[key]
            if expires < datetime.now(timezone.utc):
                del self.sessions[key]
                return None
            if "csrf_token" not in data:
                data["csrf_token"] = uuid4().hex
            return data["csrf_token"]

    def updateSession(self, key, data):
        with self.lock:
            self._removeExpired()
            if key not in self.sessions and len(self.sessions) >= self.maxSessions:
                oldest = min(self.sessions, key=lambda session: self.sessions[session][0])
                del self.sessions[oldest]
            expires = datetime.now(timezone.utc) + SessionStorage.sessionLifetime
            self.sessions[key] = expires, data

    def _removeExpired(self):
        now = datetime.now(timezone.utc)
        for key, (expires, _) in list(self.sessions.items()):
            if expires < now:
                del self.sessions[key]

    def endSession(self, key):
        with self.lock:
            self.sessions.pop(key, None)

    def revokeUserSessions(self, username):
        with self.lock:
            for key, (_, data) in list(self.sessions.items()):
                if data.get("user") == username:
                    del self.sessions[key]

    def prolongSession(self, key):
        data = self.getSession(key)
        if data is None:
            raise KeyError("Invalid session key")
        self.updateSession(key, data)


class SessionController(WebpageController):
    # In-memory per-client throttle; bounded so random source addresses cannot
    # grow process memory indefinitely. A restart clears the short-lived state.
    _login_attempts = {}
    _login_lock = RLock()
    _login_window = 15 * 60
    _login_limit = 8
    _login_max_clients = 4096

    @classmethod
    def _login_blocked(cls, address):
        now = time.monotonic()
        with cls._login_lock:
            record = cls._login_attempts.get(address)
            if not record:
                return False
            failures, started, blocked_until = record
            if blocked_until > now:
                return True
            if now - started >= cls._login_window:
                cls._login_attempts.pop(address, None)
            return False

    @classmethod
    def _record_login_failure(cls, address):
        now = time.monotonic()
        with cls._login_lock:
            record = cls._login_attempts.get(address)
            if not record or now - record[1] >= cls._login_window:
                record = (0, now, 0)
            failures = record[0] + 1
            blocked_until = now + cls._login_window if failures >= cls._login_limit else 0
            cls._login_attempts[address] = (failures, record[1], blocked_until)
            if len(cls._login_attempts) > cls._login_max_clients:
                oldest = min(cls._login_attempts, key=lambda item: cls._login_attempts[item][1])
                cls._login_attempts.pop(oldest, None)

    @classmethod
    def _clear_login_failures(cls, address):
        with cls._login_lock:
            cls._login_attempts.pop(address, None)

    def template_variables(self):
        variables = super().template_variables()
        variables["csrf_token"] = getattr(self, "_login_csrf_token", None) or self.get_csrf_token() or ""
        return variables

    def loginAction(self):
        if self.request.local or Config.get()["allow_remote_config"]:
            self._login_csrf_token = self.get_csrf_token()
            if self._login_csrf_token is None:
                self._login_csrf_token = uuid4().hex
                self.set_response_cookies(build_cookie("owrx-login-csrf", self._login_csrf_token, self.request))
            self.serve_template("login.html", **self.template_variables())
        else:
            self.send_response("access forbidden", code=403)

    def processLoginAction(self):
        if not self.request.local and not Config.get()["allow_remote_config"]:
            self.send_response("access forbidden", code=403)
            return

        address = getattr(self.request, "client_address", "unknown")
        if self._login_blocked(address):
            self.send_response("too many login attempts; try again later", code=429)
            return

        data = parse_qs(self.get_body().decode("utf-8"))
        data = {k: v[0] for k, v in data.items()}
        userlist = UserList.getSharedInstance()
        if "user" in data and "password" in data:
            if data["user"] in userlist:
                user = userlist[data["user"]]
                if user.is_enabled() and user.password.is_valid(data["password"]):
                    if (isinstance(user.password, CleartextPassword)
                            or isinstance(user.password, HashedPassword) and user.password.needs_rehash()):
                        user.setPassword(
                            DefaultPasswordClass(data["password"]),
                            must_change_password=user.must_change_password,
                        )
                        userlist.store()
                    key = SessionStorage.getSharedInstance().startSession(
                        {
                            "user": user.name,
                            "csrf_token": uuid4().hex,
                            "credential_version": user.credential_version,
                            "account_id": user.account_id,
                        }
                    )
                    old_session = self.request.cookies.get("owrx-session")
                    if old_session is not None:
                        SessionStorage.getSharedInstance().endSession(old_session.value)
                    cookie = build_session_cookie(key, self.request)
                    add_cookie(cookie, "owrx-login-csrf", "", self.request, max_age=0)
                    self._clear_login_failures(address)
                    target = local_redirect(self.request.query.get("ref", ["/settings"])[0])
                    if user.must_change_password:
                        # force password change
                        target = "/pwchange?{0}".format(urlencode({"ref": target}))
                    self.set_response_cookies(cookie)
                    self.send_redirect(target)
                    return
        self._record_login_failure(address)
        target = "{}login?{}".format(self.get_document_root(), urlencode({"ref": self.request.query.get("ref", ["/settings"])[0]}))
        self.send_redirect(target)

    def logoutAction(self):
        if self.request.local or Config.get()["allow_remote_config"]:
            if "owrx-session" in self.request.cookies:
                SessionStorage.getSharedInstance().endSession(self.request.cookies["owrx-session"].value)
            cookie = build_cookie("owrx-session", "", self.request)
            cookie["owrx-session"]["max-age"] = 0
            add_cookie(cookie, "owrx-login-csrf", "", self.request, max_age=0)
            self.set_response_cookies(cookie)
            self.send_redirect("/")
        else:
            self.send_response("access forbidden", code=403)
