import hashlib
import json
import os
import secrets
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

DATA_FILE = os.environ.get("DATA_FILE", "server_data.json")
TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60


def load_db():
    if not os.path.exists(DATA_FILE):
        return {"users": {}, "tokens": {}}
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        db = json.load(f)
    db.setdefault("users", {})
    db.setdefault("tokens", {})
    return db


def save_db(db):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)


def json_response(handler, code, data):
    body = json.dumps(data, ensure_ascii=False).encode("utf-8")
    handler.send_response(code)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
    handler.end_headers()
    handler.wfile.write(body)


class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
        self.end_headers()

    def do_POST(self):
        if self.path == "/api/register":
            return self.handle_register()
        if self.path == "/api/login":
            return self.handle_login()
        if self.path == "/api/share-code":
            return self.handle_share_code()
        return json_response(self, 404, {"error": "not found"})

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/state":
            return self.handle_get_state()
        if parsed.path == "/api/me":
            return self.handle_me()
        if parsed.path == "/api/public/students":
            return self.handle_public_students(parsed.query)
        return self.handle_static(parsed.path)

    def do_PUT(self):
        if self.path == "/api/state":
            return self.handle_put_state()
        return json_response(self, 404, {"error": "not found"})

    def parse_json(self):
        n = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(n) if n > 0 else b"{}"
        try:
            return json.loads(raw.decode("utf-8"))
        except Exception:
            return {}

    def hash_password(self, raw_password, salt):
        data = hashlib.pbkdf2_hmac("sha256", raw_password.encode("utf-8"), salt.encode("utf-8"), 120000)
        return data.hex()

    def verify_password(self, raw_password, user):
        salt = user.get("salt")
        password_hash = user.get("password_hash")
        if not salt or not password_hash:
            old_password = user.get("password")
            return old_password == raw_password
        return self.hash_password(raw_password, salt) == password_hash

    def issue_token(self, db, username):
        token = secrets.token_hex(24)
        db["tokens"][token] = {
            "username": username,
            "expire_at": int(time.time()) + TOKEN_TTL_SECONDS
        }
        return token

    def get_auth_user(self, db):
        token = self.headers.get("Authorization", "").replace("Bearer ", "").strip()
        if not token:
            return None
        token_info = db["tokens"].get(token)
        if not token_info:
            return None
        if int(time.time()) > int(token_info.get("expire_at", 0)):
            db["tokens"].pop(token, None)
            save_db(db)
            return None
        username = token_info.get("username")
        user = db["users"].get(username)
        if not user:
            return None
        return username, user

    def handle_register(self):
        db = load_db()
        body = self.parse_json()
        username = (body.get("username") or "").strip()
        password = (body.get("password") or "").strip()
        role = (body.get("role") or "teacher").strip()
        parent_teacher_username = (body.get("parentTeacherUsername") or "").strip()
        parent_child_name = (body.get("parentChildName") or "").strip()
        parent_child_id = (body.get("parentChildId") or "").strip()
        invite_code = (body.get("inviteCode") or "").strip()
        if not username or not password:
            return json_response(self, 400, {"error": "username/password required"})
        if username in db["users"]:
            return json_response(self, 409, {"error": "username exists"})
        if role == "parent":
            if not invite_code or not parent_child_id:
                return json_response(self, 400, {"error": "parent must provide inviteCode and parentChildId"})
            teacher = self.find_teacher_by_share_code(db, invite_code)
            if not teacher or teacher.get("role") != "teacher":
                return json_response(self, 404, {"error": "teacher not found"})
            parent_teacher_username = teacher.get("username_cache", "")
            teacher_state = (teacher.get("state_wrapper") or {}).get("payload") or {}
            matched_student = self.find_student_in_state(teacher_state, parent_child_id)
            if not matched_student:
                return json_response(self, 404, {"error": "student not found by parentChildId"})
            parent_child_name = matched_student.get("name", "")
        salt = secrets.token_hex(16)
        db["users"][username] = {
            "password_hash": self.hash_password(password, salt),
            "salt": salt,
            "role": role,
            "state_wrapper": None,
            "share_code": secrets.token_hex(6) if role == "teacher" else "",
            "parent_teacher_username": parent_teacher_username if role == "parent" else "",
            "parent_child_name": parent_child_name if role == "parent" else "",
            "parent_child_id": parent_child_id if role == "parent" else "",
            "username_cache": username
        }
        save_db(db)
        return json_response(self, 200, {"ok": True})

    def handle_login(self):
        db = load_db()
        body = self.parse_json()
        username = (body.get("username") or "").strip()
        password = (body.get("password") or "").strip()
        user = db["users"].get(username)
        if not user or not self.verify_password(password, user):
            return json_response(self, 401, {"error": "invalid credentials"})
        token = self.issue_token(db, username)
        save_db(db)
        return json_response(self, 200, {"token": token, "role": user.get("role", "teacher")})

    def handle_get_state(self):
        db = load_db()
        auth = self.get_auth_user(db)
        if not auth:
            return json_response(self, 401, {"error": "unauthorized"})
        _, user = auth
        role = user.get("role", "teacher")
        if role == "teacher":
            wrapper = user.get("state_wrapper")
            if not wrapper:
                return json_response(self, 200, {"state": None, "version": 0})
            return json_response(self, 200, {"state": wrapper.get("payload"), "version": wrapper.get("version", 0)})
        teacher_username = user.get("parent_teacher_username")
        teacher = db["users"].get(teacher_username)
        if not teacher:
            return json_response(self, 404, {"error": "teacher not found"})
        wrapper = teacher.get("state_wrapper")
        if not wrapper:
            return json_response(self, 200, {"state": None, "version": 0})
        teacher_state = wrapper.get("payload") or {}
        child_name = user.get("parent_child_name", "")
        child_id = user.get("parent_child_id", "")
        filtered = self.filter_parent_view_state(teacher_state, child_name, child_id)
        return json_response(self, 200, {"state": filtered, "version": wrapper.get("version", 0)})

    def handle_put_state(self):
        db = load_db()
        auth = self.get_auth_user(db)
        if not auth:
            return json_response(self, 401, {"error": "unauthorized"})
        username, user = auth
        if user.get("role") != "teacher":
            return json_response(self, 403, {"error": "parent read-only"})
        body = self.parse_json()
        state = body.get("state")
        base_version = int(body.get("baseVersion", 0))
        if not isinstance(state, dict):
            return json_response(self, 400, {"error": "state must be object"})
        wrapper = user.get("state_wrapper") or {"version": 0, "payload": None, "updated_at": 0}
        current_version = int(wrapper.get("version", 0))
        if base_version != current_version:
            return json_response(self, 409, {
                "error": "version conflict",
                "serverVersion": current_version,
                "serverState": wrapper.get("payload")
            })
        wrapper["version"] = current_version + 1
        wrapper["updated_at"] = int(time.time())
        wrapper["payload"] = state
        user["state_wrapper"] = wrapper
        db["users"][username] = user
        save_db(db)
        return json_response(self, 200, {"ok": True, "version": wrapper["version"]})

    def handle_me(self):
        db = load_db()
        auth = self.get_auth_user(db)
        if not auth:
            return json_response(self, 401, {"error": "unauthorized"})
        username, user = auth
        return json_response(self, 200, {
            "username": username,
            "role": user.get("role", "teacher"),
            "parentTeacherUsername": user.get("parent_teacher_username", ""),
            "parentChildName": user.get("parent_child_name", ""),
            "parentChildId": user.get("parent_child_id", "")
        })

    def handle_share_code(self):
        db = load_db()
        auth = self.get_auth_user(db)
        if not auth:
            return json_response(self, 401, {"error": "unauthorized"})
        username, user = auth
        if user.get("role") != "teacher":
            return json_response(self, 403, {"error": "only teacher"})
        if not user.get("share_code"):
            user["share_code"] = secrets.token_hex(6)
        db["users"][username] = user
        save_db(db)
        return json_response(self, 200, {"shareCode": user["share_code"], "teacherUsername": username})

    def handle_public_students(self, query):
        q = parse_qs(query)
        invite_code = (q.get("inviteCode", [""])[0] or "").strip()
        if not invite_code:
            return json_response(self, 400, {"error": "inviteCode required"})
        db = load_db()
        teacher = self.find_teacher_by_share_code(db, invite_code)
        if not teacher:
            return json_response(self, 404, {"error": "inviteCode invalid"})
        wrapper = teacher.get("state_wrapper")
        payload = (wrapper or {}).get("payload") or {}
        students = []
        for cls in payload.get("classes", []):
            for st in cls.get("students", []):
                students.append({
                    "id": st.get("id"),
                    "name": st.get("name"),
                    "className": cls.get("name")
                })
        return json_response(self, 200, {"students": students})

    def handle_static(self, path):
        if path in ("", "/"):
            return self.send_static_file("index.html", "text/html; charset=utf-8")
        if path.startswith("/src/"):
            rel = path.lstrip("/")
            if rel.endswith(".css"):
                return self.send_static_file(rel, "text/css; charset=utf-8")
            if rel.endswith(".js"):
                return self.send_static_file(rel, "application/javascript; charset=utf-8")
            return self.send_static_file(rel, "text/plain; charset=utf-8")
        return json_response(self, 404, {"error": "not found"})

    def send_static_file(self, file_path, content_type):
        safe_path = os.path.normpath(file_path).replace("\\", "/")
        if safe_path.startswith("../"):
            return json_response(self, 403, {"error": "forbidden"})
        full_path = os.path.join(os.getcwd(), safe_path)
        if not os.path.exists(full_path) or not os.path.isfile(full_path):
            return json_response(self, 404, {"error": "file not found"})
        with open(full_path, "rb") as f:
            body = f.read()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def filter_parent_view_state(self, teacher_state, child_name, child_id=""):
        classes = []
        current_class_id = ""
        for cls in teacher_state.get("classes", []):
            students = cls.get("students", [])
            target = None
            for st in students:
                if child_id and st.get("id") == child_id:
                    target = st
                    break
                if (not child_id) and st.get("name") == child_name:
                    target = st
                    break
            if not target:
                continue
            target_id = target.get("id")
            logs = [x for x in cls.get("logs", []) if x.get("studentId") == target_id]
            classes.append({
                "id": cls.get("id"),
                "name": cls.get("name"),
                "students": [target],
                "logs": logs
            })
            if not current_class_id:
                current_class_id = cls.get("id")
        return {
            "classes": classes,
            "currentClassId": current_class_id,
            "rules": teacher_state.get("rules", []),
            "shopItems": teacher_state.get("shopItems", []),
            "levelExp": teacher_state.get("levelExp", 40),
            "ui": {"viewMode": "student"}
        }

    def find_teacher_by_share_code(self, db, share_code):
        for username, user in db.get("users", {}).items():
            if user.get("role") == "teacher" and user.get("share_code") == share_code:
                if not user.get("username_cache"):
                    user["username_cache"] = username
                return user
        return None

    def find_student_in_state(self, teacher_state, student_id):
        for cls in teacher_state.get("classes", []):
            for st in cls.get("students", []):
                if st.get("id") == student_id:
                    return st
        return None


if __name__ == "__main__":
    host = "127.0.0.1"
    port = 8000
    server = ThreadingHTTPServer((host, port), Handler)
    print(f"server running at http://{host}:{port}")
    server.serve_forever()
