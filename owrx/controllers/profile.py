from owrx.security import local_redirect
from owrx.controllers.template import WebpageController
from owrx.controllers.admin import AuthorizationMixin
from owrx.users import UserList, DefaultPasswordClass, PasswordException
from urllib.parse import parse_qs
from owrx.controllers.session import build_session_cookie
from uuid import uuid4


class ProfileController(AuthorizationMixin, WebpageController):
    def isAuthorized(self):
        return self.user is not None and self.user.is_enabled() and self.user.must_change_password

    def indexAction(self):
        self.serve_template("pwchange.html", **self.template_variables())

    def processPwChange(self):
        data = parse_qs(self.get_body().decode("utf-8"))
        data = {k: v[0] for k, v in data.items()}
        userlist = UserList.getSharedInstance()
        if "password" in data and "confirm" in data and data["password"] == data["confirm"]:
            try:
                password = DefaultPasswordClass(data["password"])
            except PasswordException:
                self.send_redirect("/pwchange")
                return
            self.user.setPassword(password, must_change_password=False)
            userlist.store()
            from owrx.controllers.session import SessionStorage
            sessions = SessionStorage.getSharedInstance()
            sessions.revokeUserSessions(self.user.name)
            session_id = sessions.startSession({
                "user": self.user.name,
                "csrf_token": uuid4().hex,
                "credential_version": self.user.credential_version,
                "account_id": self.user.account_id,
            })
            self.set_response_cookies(build_session_cookie(session_id, self.request))
            target = local_redirect(self.request.query.get("ref", ["/settings"])[0])
        else:
            target = "/pwchange"
        self.send_redirect(target)
