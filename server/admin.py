#!/usr/bin/env python3
"""Админка сайта Evolution Car: страницы сайта, заявки, карточка заявки.

Страница собирается на сервере, а не в статике сайта: в ней персональные
данные клиентов, и она не должна попадать ни в сборку сайта, ни в поиск.
Доступ — по паролю из окружения, сессия в подписанной cookie.

Перенесена с evolutioncarservice.ru. Разделы «Метрика», «SEO-аналитика» и
«Точка А» там держатся на внешних данных по Новосибирску (Wordstat,
Search Console, счётчик Метрики). Здесь таких данных пока нет, поэтому
разделы оставлены заглушками, которые честно перечисляют, чего не хватает,
вместо пустых страниц с нулями.
"""

import base64
import pathlib
import re
import hashlib
import hmac
import html
import os
import time
import urllib.parse
from collections import defaultdict, deque

import lead_handler as lead
import admin_leads as leads
import page_seo
from admin_ui import PAGE_CSS, SITE_URL, _doc, _topbar, login_page, stub_page

# стили карточки страницы лежат рядом с её разметкой, в page_seo
PAGE_CSS += page_seo.CSS

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "").strip()
SECRET = os.environ.get("ADMIN_SECRET", "").strip() or hashlib.sha256(
    (ADMIN_PASSWORD + "evolution-car-by").encode()
).hexdigest()
SESSION_HOURS = 12
COOKIE = "evcar_admin"

LOGIN_LIMIT = 5
LOGIN_WINDOW = 900
_login_hits = defaultdict(deque)


def _sign(payload: str) -> str:
    return hmac.new(SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()[:32]


def make_token() -> str:
    exp = str(int(time.time()) + SESSION_HOURS * 3600)
    return base64.urlsafe_b64encode(f"{exp}.{_sign(exp)}".encode()).decode()


def token_valid(token: str) -> bool:
    try:
        raw = base64.urlsafe_b64decode(token.encode()).decode()
        exp, sig = raw.split(".", 1)
        if not hmac.compare_digest(sig, _sign(exp)):
            return False
        return int(exp) > time.time()
    except Exception:
        return False


def login_blocked(ip: str) -> bool:
    now = time.time()
    q = _login_hits[ip]
    while q and now - q[0] > LOGIN_WINDOW:
        q.popleft()
    return len(q) >= LOGIN_LIMIT


def note_login_fail(ip: str):
    _login_hits[ip].append(time.time())




SITE_ROOT = os.environ.get("SITE_ROOT", "/var/www/evolution-car-by")

# Тип страницы — чтобы в списке было видно, что это за страница,
# не вчитываясь в заголовок.

# Разделы каталога. Нужны, чтобы отличить /catalog/iz-kitaya/ (подборка)
# от /catalog/geely/ (марка): в адресе у них одинаково один сегмент.
# Список повторяет sections из src/content/cars.ts.
CATALOG_SECTIONS = {
    "v-nalichii", "pod-zakaz", "s-probegom", "elektromobili", "gibridy",
    "iz-kitaya", "iz-korei", "iz-evropy", "iz-ssha",
}

# Страницы направлений и городов — плоские адреса первого уровня,
# поэтому отличаем их по спискам, а не по форме адреса.
DIRECTION_SLUGS = {"china", "korea", "europa", "usa", "dostavka-i-rastamozhka"}
CITY_SLUGS = {"minsk", "gomel", "vitebsk", "brest", "grodno", "mogilev"}
LEGAL_SLUGS = {"policy", "agreement", "legal_data"}



def _page_kind(route: str) -> str:
    if route == "/":
        return "Главная"
    parts = [x for x in route.split("/") if x]

    # Зеекровская версия: своя главная, свой каталог и карточки товара
    if parts[0] == "zeekr":
        if len(parts) == 1:
            return "Главная (Zeekr)"
        if len(parts) == 2:
            return "Каталог (Zeekr)"
        return "Модель (Zeekr)"

    if parts[0] == "catalog":
        if len(parts) == 1:
            return "Каталог"
        if len(parts) == 2:
            return "Подборка" if parts[1] in CATALOG_SECTIONS else "Марка"
        return "Модель"

    if parts[0] in DIRECTION_SLUGS:
        return "Направление"
    if parts[0] in CITY_SLUGS:
        return "Город"
    if parts[0] in LEGAL_SLUGS:
        return "Документ"
    return "Служебная"



def scan_pages():
    """Собирает список страниц из выложенной статики: заголовок, описание,
    картинку. Источник — сами файлы сайта, поэтому список не может
    разойтись с тем, что реально опубликовано."""
    root = pathlib.Path(SITE_ROOT)
    out = []
    if not root.exists():
        return out
    for f in sorted(root.rglob("index.html")):
        rel = f.parent.relative_to(root).as_posix()
        route = "/" if rel == "." else f"/{rel}/"
        try:
            src = f.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        title = re.search(r"<title>(.*?)</title>", src, re.S)
        desc = re.search(r'name="description" content="(.*?)"', src)
        # Бейдж: сначала фото самой модели (файл называется как адрес:
        # /service/zeekr/001/ -> 001.png), потом любая картинка, кроме фона
        # первого экрана — он один на всех, и список из одинаковых плашек нечитаем.
        shots = re.findall(r'<img[^>]+src="(/images/[^"]+)"', src)
        slug = route.strip("/").rsplit("/", 1)[-1]
        img = next(
            (x for x in shots if slug and x.rsplit("/", 1)[-1].rsplit(".", 1)[0] == slug),
            next((x for x in shots if "hero" not in x.rsplit("/", 1)[-1]), shots[0] if shots else ""),
        )
        out.append(
            {
                "route": route,
                "title": html.unescape(title.group(1).strip()) if title else route,
                "desc": html.unescape(desc.group(1).strip()) if desc else "",
                "img": img,
                "kind": _page_kind(route),
                "size": f.stat().st_size,
            }
        )
    # главная всегда первой — так же, как в Tilda
    out.sort(key=lambda p: (p["route"] != "/", p["route"]))
    return out



# Группы страниц в порядке, в котором владелец просил их видеть:
# сначала главная, потом сервис деревом, потом служебные, документы — вниз.
GROUPS = [
    ("main", "Главная"),
    ("directions", "Направления"),
    ("cities", "Города"),
    ("catalog", "Каталог"),
    ("zeekr", "Версия Zeekr"),
    ("tech", "Служебные"),
    ("legal", "Документы"),
]



def _group_of(route: str) -> str:
    if route == "/":
        return "main"
    parts = [x for x in route.split("/") if x]
    if parts[0] == "zeekr":
        return "zeekr"
    if parts[0] == "catalog":
        return "catalog"
    if parts[0] in DIRECTION_SLUGS:
        return "directions"
    if parts[0] in CITY_SLUGS:
        return "cities"
    if parts[0] in LEGAL_SLUGS:
        return "legal"
    return "tech"


def group_pages(pages):
    """Раскладывает страницы по группам и считает уровень вложенности
    по адресу: /service/zeekr/ — первый уровень, /service/zeekr/001/ — второй."""
    buckets = {key: [] for key, _ in GROUPS}
    for p in pages:
        buckets[_group_of(p["route"])].append(p)

    out = []
    for key, title in GROUPS:
        items = sorted(buckets[key], key=lambda x: x["route"])
        if not items:
            out.append((title, [], key))
            continue
        rows = []
        for p in items:
            # вложенность считаем только внутри сервиса: там есть марка и модель.
            # Документы и служебные — плоский список, отступ сбивал бы с толку.
            if key in ("catalog", "zeekr"):
                depth = len([s for s in p["route"].split("/") if s])
                # /catalog/ — корень группы, марки и подборки под ним,
                # модели — ещё на уровень глубже. В зеекровской версии
                # адреса на один сегмент длиннее из-за префикса /zeekr/.
                shift = 2 if key == "zeekr" else 1
                rows.append((p, max(0, depth - shift)))
            else:
                rows.append((p, 0))
        out.append((title, rows, key))
    return out

SORTS = {
    "default": "по умолчанию (деревом)",
    "title": "по заголовку",
    "route": "по адресу",
    "kind": "по типу страницы",
}


def sort_pages(pages, how):
    if how == "title":
        return sorted(pages, key=lambda p: p["title"].lower())
    if how == "route":
        return sorted(pages, key=lambda p: p["route"])
    if how == "kind":
        return sorted(pages, key=lambda p: (p["kind"], p["route"]))
    return pages

# Этапы воронки. Ключи не менять: они лежат в базе у существующих заявок.

def _page_row(p, level=0):
    home = (
        '<svg class="home" width="15" height="15" viewBox="0 0 24 24" fill="#1e1e1e" aria-label="Главная">'
        '<path d="M12 3 2 11h3v10h5v-6h4v6h5V11h3z"/></svg>'
    ) if p["route"] == "/" else ""
    img = (
        f'<img class="badge-img" src="{html.escape(p["img"])}" alt="" loading="lazy">'
        if p["img"] else '<span class="badge-img"></span>'
    )
    desc = f'<span class="pdesc">{html.escape(p["desc"][:120])}</span>' if p["desc"] else ""
    cls = f" lvl{level}" if level else ""
    # вся строка ведёт в карточку страницы, кроме самой ссылки: по ней
    # по-прежнему открывается живая страница на сайте
    card = "/admin/page?route=" + urllib.parse.quote(p["route"])
    return (
        f'<div class="prow{cls}">'
        f'<a class="pcard" href="{card}">{img}</a>'
        f'<a class="pcard ptitle" href="{card}">{home}'
        f'<div>{html.escape(p["title"])}{desc}</div></a>'
        f'<a class="plink" href="{SITE_URL}{p["route"]}" target="_blank" rel="noopener">'
        f'{html.escape(p["route"])}</a>'
        f'<div class="pkind">{html.escape(p["kind"])}</div></div>'
    )



def pages_page(pages, q: str, how: str) -> bytes:
    opts = "".join(
        f'<option value="{k}"{" selected" if k == how else ""}>Порядок: {v}</option>' for k, v in SORTS.items()
    )

    if how == "default" and not q:
        # Дерево по хабам: так видно, какая страница чья
        chunks = []
        for title, rows, key in group_pages(pages):
            if not rows:
                hint = " — страницы нет" if key == "service" else ""
                chunks.append(f'<div class="pgroup empty-grp">{title}<span>пусто{hint}</span></div>')
                continue
            chunks.append(f'<div class="pgroup">{title}<span>{len(rows)}</span></div>')
            chunks.extend(_page_row(p, lvl) for p, lvl in rows)
        body = "".join(chunks)
    else:
        body = "".join(_page_row(p) for p in pages) or '<div class="empty">Страниц не найдено</div>'

    return _doc(
        "Страницы сайта",
        _topbar("pages")
        + f"""<main>
<form class="tools" method="get" action="/admin">
<span class="lbl">Страницы сайта: {len(pages)}</span>
<input type="search" name="q" value="{html.escape(q)}" placeholder="Введите запрос">
<select name="sort" onchange="this.form.submit()">{opts}</select>
</form>
<div class="pages"><div class="phead"><span>Бейдж</span><span>Заголовок</span><span>Ссылка</span>
<span style="text-align:right">Тип</span></div>{body}</div></main>""",
    )




def handle(req) -> bool:
    """Обрабатывает /admin*. Возвращает True, если запрос обслужен."""
    # без "or" — иначе корень сайта "/" превращался бы в "/admin"
    path = req.path.split("?")[0].rstrip("/")
    if not path.startswith("/admin"):
        return False

    if not ADMIN_PASSWORD:
        req.send_response(503)
        req.send_header("Content-Type", "text/plain; charset=utf-8")
        req.end_headers()
        req.wfile.write("Админка не настроена: не задан ADMIN_PASSWORD".encode())
        return True

    ip = req.headers.get("X-Forwarded-For", req.client_address[0]).split(",")[0].strip()
    cookies = dict(
        c.strip().split("=", 1) for c in (req.headers.get("Cookie") or "").split(";") if "=" in c
    )
    authed = token_valid(cookies.get(COOKIE, ""))

    def send(code, body, ctype="text/html; charset=utf-8", extra=None):
        req.send_response(code)
        req.send_header("Content-Type", ctype)
        req.send_header("Content-Length", str(len(body)))
        req.send_header("X-Robots-Tag", "noindex, nofollow")
        req.send_header("Cache-Control", "no-store")
        for k, v in (extra or []):
            req.send_header(k, v)
        req.end_headers()
        req.wfile.write(body)
        return True  # без этого site_server решит, что запрос не обслужен,
        # и допишет статику поверх уже отправленного ответа

    def form_data():
        try:
            n = int(req.headers.get("Content-Length") or 0)
        except ValueError:
            return {}
        if n <= 0 or n > 8192:
            return {}
        return {k: v[0] for k, v in urllib.parse.parse_qs(req.rfile.read(n).decode()).items()}

    if path == "/admin/login" and req.command == "POST":
        if login_blocked(ip):
            lead.log(f"админка: перебор пароля с {ip}")
            return send(429, login_page("Слишком много попыток. Подождите 15 минут."))
        pw = form_data().get("password", "")
        # сравниваем байты: compare_digest падает на строках с кириллицей
        if hmac.compare_digest(pw.encode("utf-8"), ADMIN_PASSWORD.encode("utf-8")):
            cookie = f"{COOKIE}={make_token()}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age={SESSION_HOURS*3600}"
            return send(303, b"", extra=[("Location", "/admin"), ("Set-Cookie", cookie)])
        note_login_fail(ip)
        lead.log(f"админка: неверный пароль с {ip}")
        return send(401, login_page("Неверный пароль"))

    if path == "/admin/logout" and req.command == "POST":
        return send(303, b"", extra=[("Location", "/admin"), ("Set-Cookie", f"{COOKIE}=; Path=/; Max-Age=0")])

    if not authed:
        return send(200, login_page())

    if path == "/admin/stage" and req.command == "POST":
        d = form_data()
        leads.set_stage(d.get("id", ""), d.get("stage", ""))
        where = f"/admin/lead?id={d.get('id','')}" if d.get("back") else "/admin/leads"
        return send(303, b"", extra=[("Location", where)])

    if path == "/admin/comment" and req.command == "POST":
        d = form_data()
        leads.add_comment(d.get("id", ""), d.get("text", ""))
        return send(303, b"", extra=[("Location", f"/admin/lead?id={d.get('id','')}")])

    if path == "/admin/lead":
        lead_id = urllib.parse.parse_qs(urllib.parse.urlparse(req.path).query).get("id", [""])[0]
        row, cmts = leads.fetch_lead(lead_id)
        if not row:
            return send(404, _doc("Не найдено", leads._leads_tools("", "board") + '<main><div class="empty">Заявка не найдена</div></main>'))
        return send(200, leads.lead_page(row, cmts))

    if path == "/admin/page":
        route = urllib.parse.parse_qs(urllib.parse.urlparse(req.path).query).get("route", [""])[0]
        # ходим только внутрь выложенного сайта: адрес из запроса в путь к файлу
        # попадает после нормализации, иначе ../ увёл бы за пределы SITE_ROOT
        route = "/" + urllib.parse.unquote(route).strip("/")
        route = route if route == "/" else route + "/"
        if ".." in route or "\\" in route:
            return send(400, _doc("Плохой адрес", _topbar("pages")
                                  + '<main><div class="empty">Некорректный адрес страницы</div></main>'))
        data = page_seo.read_page(SITE_ROOT, route)
        if not data:
            return send(404, _doc("Не найдено", _topbar("pages")
                                  + '<main><div class="empty">Такой страницы на сайте нет</div></main>'))
        return send(200, _doc(data["title"] or route,
                              _topbar("pages") + page_seo.detail_body(data, SITE_URL)))

    if path == "/admin/export.csv":
        return send(200, leads.export_csv(), "text/csv; charset=utf-8",
                    [("Content-Disposition", 'attachment; filename="leads.csv"')])

    query = urllib.parse.parse_qs(urllib.parse.urlparse(req.path).query)
    q = query.get("q", [""])[0][:60]

    if path == "/admin/metrika":
        return send(200, stub_page(
            "metrika", "Метрика",
            "Здесь будут собраны данные Яндекс.Метрики по сайту — чтобы не ходить в её интерфейс за каждой цифрой.",
            [
                "Посещаемость по дням и источникам трафика",
                "Какие страницы смотрят чаще всего и с каких уходят",
                "Сколько заявок и какая из них конверсия",
                "Путь посетителя до заявки и доля дошедших до страницы благодарности",
            ],
            "На сайте пока нет счётчика: в разметке нет ни Метрики, ни Google Analytics. "
            "Нужно решение, какую аналитику ставить, номер счётчика и токен на чтение. "
            "До установки счётчика данных не существует — показывать нечего.",
        ))

    if path == "/admin/seo":
        return send(200, stub_page(
            "seo", "SEO-аналитика",
            "Здесь будет видно, по каким запросам сайт показывается и какие страницы "
            "за эти запросы отвечают — чтобы не держать карту запросов в отдельной таблице.",
            [
                "Запросы по каждой странице и частотность по Беларуси",
                "Показы и позиции из Яндекс.Вебмастера и Search Console",
                "Страницы без запросов и запросы без страниц",
                "Марки и модели каталога, у которых нет своей посадочной",
            ],
            "Частотности и позиции из кода сайта взять нельзя: это внешние данные. "
            "Нужны доступы — Яндекс.Вебмастер и Search Console на подтверждённый домен, "
            "и источник частотностей по Беларуси (Wordstat через XMLRiver). "
            "Пока домен не подключён и сайт закрыт от индексации, собирать нечего.",
        ))

    if path == "/admin/tochka-a":
        return send(200, stub_page(
            "tochka", "Точка А",
            "Срез состояния сайта на начало работы: с чем сравнивать результат через месяц "
            "и через квартал.",
            [
                "Сколько страниц в индексе Яндекса и Google",
                "Трафик по месяцам и его источники",
                "Сколько заявок и с каких страниц они приходят",
                "Видимость по основным запросам на старте",
            ],
            "Снимок делается после запуска: нужны подключённый домен, открытая индексация "
            "и счётчик аналитики на сайте. Заявки админка уже считает — этот столбец "
            "появится первым.",
        ))

    if path == "/admin/leads":
        view = query.get("view", ["board"])[0]
        rows = leads.fetch_leads(q)
        return send(200, leads.list_page(rows, q) if view == "list" else leads.board_page(rows, q))

    how = query.get("sort", ["default"])[0]
    pages = scan_pages()
    if q:
        needle = q.lower()
        pages = [p for p in pages if needle in p["title"].lower() or needle in p["route"].lower()]
    return send(200, pages_page(sort_pages(pages, how), q, how if how in SORTS else "default"))
