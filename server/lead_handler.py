#!/usr/bin/env python3
"""Приёмщик заявок с сайта Evolution Car: SQLite + Telegram + почта.

Живёт на сервере рядом со статикой: заявка сначала ложится в базу и только
потом уходит в Telegram и на почту. Если доставка отвалится, заявка всё
равно останется видна в админке.

Токен бота и пароль почты берутся из окружения и никогда не попадают в код
сайта: сайт статический, его исходник видит любой посетитель.
"""

import json
import os
import re
import smtplib
import sqlite3
import ssl
import sys
import time
import urllib.parse
import urllib.request
from collections import defaultdict, deque
from email.message import EmailMessage
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = int(os.environ.get("LEAD_PORT", "8091"))
DB_PATH = os.environ.get("LEAD_DB", "/opt/evolution-car-by/leads.db")
SITE_NAME = os.environ.get("SITE_NAME", "Evolution Car")

TG_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
TG_CHAT_IDS = [c.strip() for c in os.environ.get("TELEGRAM_CHAT_IDS", "").split(",") if c.strip()]

SMTP_HOST = os.environ.get("SMTP_HOST", "").strip()
SMTP_PORT = int(os.environ.get("SMTP_PORT", "465"))
SMTP_USER = os.environ.get("SMTP_USER", "").strip()
SMTP_PASS = os.environ.get("SMTP_PASS", "").strip()
MAIL_TO = [a.strip() for a in os.environ.get("MAIL_TO", "").split(",") if a.strip()]

MAX_FIELD = 200
MAX_BODY = 4096
RATE_LIMIT = 5          # заявок с одного адреса
RATE_WINDOW = 600       # за 10 минут

_hits = defaultdict(deque)

PHONE_RE = re.compile(r"[\d+()\-\s]{6,}")


def log(msg):
    print(f"[{time.strftime('%F %T')}] {msg}", flush=True)


def rate_limited(ip):
    now = time.time()
    q = _hits[ip]
    while q and now - q[0] > RATE_WINDOW:
        q.popleft()
    if len(q) >= RATE_LIMIT:
        return True
    q.append(now)
    return False


def clean(value):
    """Обрезаем и вычищаем управляющие символы — в телеграм и почту
    уходит текст от постороннего человека."""
    text = str(value or "").strip()[:MAX_FIELD]
    return "".join(ch for ch in text if ch.isprintable())


def db():
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute(
        """CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            updated_at TEXT DEFAULT '',
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            page TEXT,
            ip TEXT,
            stage TEXT NOT NULL DEFAULT 'new',
            source TEXT DEFAULT '',
            car TEXT DEFAULT '',
            utm TEXT DEFAULT '',
            referrer TEXT DEFAULT '',
            journey TEXT DEFAULT '',
            visits INTEGER DEFAULT 1
        )"""
    )
    conn.execute(
        """CREATE TABLE IF NOT EXISTS lead_comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lead_id INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            text TEXT NOT NULL
        )"""
    )
    return conn


def save_lead(name, phone, page, ip, source="", car="", utm="", referrer="", journey="", visits=1):
    """Заявка сохраняется до отправки: если Telegram или почта отвалятся,
    она всё равно не потеряется и будет видна в админке."""
    try:
        now = time.strftime("%Y-%m-%d %H:%M:%S")
        with db() as conn:
            cur = conn.execute(
                """INSERT INTO leads
                   (created_at, updated_at, name, phone, page, ip, source, car, utm, referrer, journey, visits)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
                (now, now, name, phone, page, ip, source, car, utm, referrer, journey, visits),
            )
            return cur.lastrowid
    except Exception as exc:
        log(f"не удалось сохранить заявку: {exc}")
        return None


def send_telegram(text):
    if not TG_TOKEN or not TG_CHAT_IDS:
        return "telegram: не настроен"
    results = []
    for chat_id in TG_CHAT_IDS:
        payload = urllib.parse.urlencode(
            {"chat_id": chat_id, "text": text, "parse_mode": "HTML", "disable_web_page_preview": "true"}
        ).encode()
        url = f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage"
        try:
            with urllib.request.urlopen(urllib.request.Request(url, data=payload), timeout=10) as r:
                ok = json.loads(r.read().decode()).get("ok")
                results.append(f"telegram {chat_id}: {'ок' if ok else 'отказ'}")
        except Exception as exc:
            results.append(f"telegram {chat_id}: ошибка {exc}")
    return "; ".join(results)


def send_mail(subject, text):
    if not (SMTP_HOST and SMTP_USER and SMTP_PASS and MAIL_TO):
        return "почта: не настроена"
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = SMTP_USER
    msg["To"] = ", ".join(MAIL_TO)
    msg.set_content(text)
    try:
        ctx = ssl.create_default_context()
        if SMTP_PORT == 465:
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=ctx, timeout=20) as s:
                s.login(SMTP_USER, SMTP_PASS)
                s.send_message(msg)
        else:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as s:
                s.starttls(context=ctx)
                s.login(SMTP_USER, SMTP_PASS)
                s.send_message(msg)
        return "почта: ок"
    except Exception as exc:
        return f"почта: ошибка {exc}"


class Handler(BaseHTTPRequestHandler):
    server_version = "lead/1.0"

    def log_message(self, *args):
        pass  # свой лог ниже, стандартный только шумит

    def _reply(self, code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path.rstrip("/") in ("/api/lead/health", "/health"):
            self._reply(200, {"ok": True, "telegram": bool(TG_TOKEN and TG_CHAT_IDS), "mail": bool(MAIL_TO)})
        else:
            self._reply(404, {"ok": False})

    def do_POST(self):
        if self.path.rstrip("/") != "/api/lead":
            return self._reply(404, {"ok": False})

        ip = self.headers.get("X-Forwarded-For", self.client_address[0]).split(",")[0].strip()
        if rate_limited(ip):
            log(f"лимит исчерпан: {ip}")
            return self._reply(429, {"ok": False, "error": "too_many"})

        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            length = 0
        if length <= 0 or length > MAX_BODY:
            return self._reply(400, {"ok": False, "error": "bad_size"})

        try:
            data = json.loads(self.rfile.read(length).decode("utf-8"))
        except Exception:
            return self._reply(400, {"ok": False, "error": "bad_json"})

        # Ловушка для ботов: поле скрыто от людей, заполнить его может только робот.
        if clean(data.get("company")):
            log(f"бот отсеян: {ip}")
            return self._reply(200, {"ok": True})

        name = clean(data.get("name"))
        phone = clean(data.get("phone"))
        page = clean(data.get("page"))

        if not name or not phone or not PHONE_RE.fullmatch(phone):
            return self._reply(400, {"ok": False, "error": "bad_fields"})
        if not data.get("consent"):
            return self._reply(400, {"ok": False, "error": "no_consent"})

        # source — какая форма на странице сработала, car — машина из карточки
        source = clean(data.get("source"))
        car = clean(data.get("car"))
        utm = clean(data.get("utm"))
        referrer = clean(data.get("referrer"))
        journey = clean(data.get("journey"))[:1000]
        try:
            visits = max(1, min(int(data.get("visits") or 1), 9999))
        except (TypeError, ValueError):
            visits = 1

        when = time.strftime("%d.%m.%Y %H:%M")
        text_tg = (
            "<b>Заявка с сайта</b>\n\n"
            f"<b>Имя:</b> {name}\n"
            f"<b>Телефон:</b> {phone}\n"
            + (f"<b>Машина:</b> {car}\n" if car else "")
            + f"<b>Страница:</b> {page or '—'}\n"
            + (f"<b>Форма:</b> {source}\n" if source else "")
            + (f"<b>Источник:</b> {utm or referrer}\n" if (utm or referrer) else "")
            + (f"<b>Визитов до заявки:</b> {visits}\n" if visits > 1 else "")
            + f"<b>Время:</b> {when} (МСК сервера)"
        )
        text_mail = (
            f"Заявка с сайта {SITE_NAME}\n\n"
            f"Имя: {name}\nТелефон: {phone}\n"
            + (f"Машина: {car}\n" if car else "")
            + f"Страница: {page or '—'}\n"
            + (f"Форма: {source}\n" if source else "")
            + (f"Источник: {utm or referrer}\n" if (utm or referrer) else "")
            + f"Время: {when}\n"
        )

        lead_id = save_lead(name, phone, page, ip, source, car, utm, referrer, journey, visits)

        r1 = send_telegram(text_tg)
        r2 = send_mail(f"Заявка с сайта: {name}", text_mail)
        log(f"заявка #{lead_id} от {ip} | {r1} | {r2}")

        # Для клиента заявка принята, раз она сохранена: сбой доставки
        # в Telegram не его проблема, и повторная отправка только задвоит заявку.
        return self._reply(200, {"ok": True})


if __name__ == "__main__":
    log(f"старт на 127.0.0.1:{PORT}; telegram={'да' if TG_TOKEN and TG_CHAT_IDS else 'НЕТ'}, почта={'да' if MAIL_TO else 'НЕТ'}")
    try:
        ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
    except KeyboardInterrupt:
        sys.exit(0)
