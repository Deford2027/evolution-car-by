#!/usr/bin/env python3
"""Сервер сайта Evolution Car: статика + приём заявок + админка.

Статика и /api/lead обслуживаются одним процессом намеренно: Caddy
проксирует адрес на один порт, и отдельный маршрут для API в его общем
конфиге — лишняя точка отказа в файле, от которого зависят ещё ~20
проектов.

Админка подключается, когда рядом лежит admin.py: сервер поднимается
и без неё, тогда /admin просто не отвечает.
"""

import os
import pathlib
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lead_handler as lead  # noqa: E402

try:
    import admin  # noqa: E402
except ImportError:
    admin = None

ROOT = os.environ.get("SITE_ROOT", "/var/www/evolution-car-by")
PORT = int(os.environ.get("SITE_PORT", "8081"))


# HSTS: браузер запоминает, что сюда ходят только по https, и больше не
# стучится по http — защищает от перехвата на первом запросе.
# CSP перечисляет, откуда можно грузить код и картинки: даже если на страницу
# как-то попадёт чужой скрипт, браузер его не выполнит.
# Шрифты — Google Fonts, карта на странице контактов — виджет Яндекса,
# поэтому им здесь открыты именно те источники, что сайт реально использует.
SECURITY_HEADERS = [
    ("Strict-Transport-Security", "max-age=31536000; includeSubDomains"),
    ("X-Content-Type-Options", "nosniff"),
    ("X-Frame-Options", "SAMEORIGIN"),
    ("Referrer-Policy", "strict-origin-when-cross-origin"),
    ("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()"),
    (
        "Content-Security-Policy",
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data:; "
        "connect-src 'self'; "
        "frame-src https://yandex.ru https://*.yandex.ru; "
        "object-src 'none'; base-uri 'self'; form-action 'self'",
    ),
]


class Handler(SimpleHTTPRequestHandler):
    server_version = "evolution-car/1.0"

    def log_message(self, fmt, *args):
        # Статику не логируем — шумно; заявки пишет lead_handler.
        pass

    def _is_api(self):
        return self.path.rstrip("/").startswith("/api/lead")

    def end_headers(self):
        """Защитные заголовки на каждый ответ.

        Ставим здесь, а не в Caddy: его конфиг общий на два десятка
        проектов, и трогать его ради заголовков одного сайта рискованнее.
        """
        for name, value in SECURITY_HEADERS:
            self.send_header(name, value)
        super().end_headers()

    def do_GET(self):
        if admin and admin.handle(self):
            return
        if self._is_api():
            return lead.Handler.do_GET(self)
        return super().do_GET()

    def do_HEAD(self):
        if self._is_api():
            return lead.Handler.do_GET(self)
        # Админка существует только как ответ сервера, файла под неё нет:
        # без этой ветки HEAD по /admin уходил бы в поиск файла и отвечал
        # 404 на работающий адрес. Тело для HEAD не собираем.
        if admin and self.path.split("?")[0].rstrip("/").startswith("/admin"):
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("X-Robots-Tag", "noindex, nofollow")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            return
        return super().do_HEAD()

    def send_error(self, code, message=None, explain=None):
        """Своя 404 вместо стандартной белой заглушки Python.

        Перехватываем здесь, а не в do_GET: SimpleHTTPRequestHandler сам
        зовёт send_error для любого ненайденного файла, так что одна точка
        покрывает и страницы, и картинки с опечаткой в пути.
        Своей 404-страницы у сайта пока нет — тогда отдаём стандартную.
        """
        if code == 404 and self.command in ("GET", "HEAD") and not self._is_api():
            page = pathlib.Path(ROOT) / "404.html"
            if page.is_file():
                body = page.read_bytes()
                self.send_response(404)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                if self.command == "GET":
                    self.wfile.write(body)
                return
        super().send_error(code, message, explain)

    def do_POST(self):
        if admin and admin.handle(self):
            return
        if self._is_api():
            return lead.Handler.do_POST(self)
        self.send_error(405, "Method Not Allowed")

    # методы, которые lead.Handler вызывает на себе
    _reply = lead.Handler._reply


if __name__ == "__main__":
    lead.log(
        f"сайт на 0.0.0.0:{PORT}, корень {ROOT}; "
        f"админка={'да' if admin else 'НЕТ'}, "
        f"telegram={'да' if lead.TG_TOKEN and lead.TG_CHAT_IDS else 'НЕТ'}, "
        f"почта={'да' if lead.MAIL_TO else 'НЕТ'}"
    )
    handler = partial(Handler, directory=ROOT)
    try:
        ThreadingHTTPServer(("0.0.0.0", PORT), handler).serve_forever()
    except KeyboardInterrupt:
        sys.exit(0)
