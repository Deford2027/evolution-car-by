#!/usr/bin/env python3
"""Сборка админки сайта Evolution Car в статические страницы.

Запускается после `astro build`: читает готовые страницы из dist и кладёт
рядом dist/admin/ — список всех страниц, разложенных по группам, карточку
разбора каждой страницы и разделы-заглушки. Отдельного сервера нет:
админка публикуется на GitHub Pages вместе с сайтом.

Это MVP «чисто визуал». Приёма заявок и входа по паролю здесь нет — для них
нужен серверный процесс, которого у Pages не бывает. Серверная версия
лежит в истории git (коммит d98331e и соседние), её можно вернуть, когда
появится свой сервер.

Запуск: python3 admin/build.py dist
"""

import html
import pathlib
import re
import sys

import page_seo
import ui
from ui import SITE_URL, _doc, _topbar, stub_page

# стили карточки страницы лежат рядом с её разметкой, в page_seo
ui.PAGE_CSS += page_seo.CSS

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



def scan_pages(site_root: str):
    """Собирает список страниц из выложенной статики: заголовок, описание,
    картинку. Источник — сами файлы сайта, поэтому список не может
    разойтись с тем, что реально опубликовано."""
    root = pathlib.Path(site_root)
    out = []
    if not root.exists():
        return out
    for f in sorted(root.rglob("index.html")):
        rel = f.parent.relative_to(root).as_posix()
        # сама админка лежит в той же сборке — её страницы в список не берём
        if rel == "admin" or rel.startswith("admin/"):
            continue
        route = "/" if rel == "." else f"/{rel}/"
        try:
            src = f.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        title = re.search(r"<title>(.*?)</title>", src, re.S)
        desc = re.search(r'name="description" content="(.*?)"', src)
        # миниатюра выбирается так же, как в карточке страницы
        shots = re.findall(r'<img[^>]+src="(/img/[^"]+)"', src)
        img = page_seo._badge(route, shots)
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



# Группы страниц в порядке сайта: главная, посадочные, каталог деревом,
# вторая версия, служебные, документы — вниз.
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
    card = html.escape("/admin/page" + p["route"])
    return (
        f'<div class="prow{cls}" data-q="{html.escape((p["title"] + " " + p["route"]).lower())}">'
        f'<a class="pcard" href="{card}">{img}</a>'
        f'<a class="pcard ptitle" href="{card}">{home}'
        f'<div>{html.escape(p["title"])}{desc}</div></a>'
        f'<a class="plink" href="{html.escape(SITE_URL + p["route"])}" target="_blank" rel="noopener">'
        f'{html.escape(p["route"])}</a>'
        f'<div class="pkind">{html.escape(p["kind"])}</div></div>'
    )




def pages_page(pages) -> str:
    """Список страниц деревом по группам. Поиск — на странице, без сервера:
    строки фильтруются по заголовку и адресу прямо в браузере."""
    chunks = []
    for title, rows, key in group_pages(pages):
        if not rows:
            chunks.append(f'<div class="pgroup empty-grp">{title}<span>пусто</span></div>')
            continue
        chunks.append(f'<div class="pgroup" data-group>{title}<span>{len(rows)}</span></div>')
        chunks.extend(_page_row(p, lvl) for p, lvl in rows)
    body = "".join(chunks)

    return _doc(
        "Страницы сайта",
        _topbar("pages")
        + f"""<main>
<div class="tools">
<span class="lbl">Страницы сайта: {len(pages)}</span>
<input type="search" id="q" placeholder="Поиск по заголовку или адресу">
</div>
<div class="pages"><div class="phead"><span>Бейдж</span><span>Заголовок</span><span>Ссылка</span>
<span style="text-align:right">Тип</span></div>{body}
<div class="empty" id="none" hidden>Страниц не найдено</div></div></main>""",
        SEARCH_JS,
    )


# При поиске заголовки групп прячем: под ними остались бы чужие строки,
# и дерево вводило бы в заблуждение. Пустой запрос возвращает дерево.
SEARCH_JS = """
document.addEventListener('DOMContentLoaded', function () {
  var input = document.getElementById('q');
  var rows = document.querySelectorAll('.prow');
  var groups = document.querySelectorAll('.pgroup');
  var none = document.getElementById('none');
  input.addEventListener('input', function () {
    var q = input.value.trim().toLowerCase();
    var shown = 0;
    rows.forEach(function (r) {
      var ok = !q || r.dataset.q.indexOf(q) !== -1;
      r.hidden = !ok;
      if (ok) shown++;
    });
    groups.forEach(function (g) { g.hidden = !!q; });
    none.hidden = shown > 0;
  });
});
"""


STUBS = {
    "metrika": (
        "Метрика",
        "Здесь будут собраны данные аналитики по сайту — чтобы не ходить в интерфейс "
        "счётчика за каждой цифрой.",
        [
            "Посещаемость по дням и источникам трафика",
            "Какие страницы смотрят чаще всего и с каких уходят",
            "Сколько заявок и какая из них конверсия",
            "Путь посетителя до заявки",
        ],
        "На сайте пока нет счётчика: в разметке нет ни Метрики, ни Google Analytics. "
        "Нужно решение, какую аналитику ставить, номер счётчика и токен на чтение. "
        "До установки счётчика данных не существует — показывать нечего.",
    ),
    "seo": (
        "SEO-аналитика",
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
        "и источник частотностей по Беларуси. Пока домен не подключён и сайт закрыт "
        "от индексации, собирать нечего.",
    ),
    "tochka-a": (
        "Точка А",
        "Срез состояния сайта на начало работы: с чем сравнивать результат через месяц "
        "и через квартал.",
        [
            "Сколько страниц в индексе Яндекса и Google",
            "Трафик по месяцам и его источники",
            "Сколько заявок и с каких страниц они приходят",
            "Видимость по основным запросам на старте",
        ],
        "Снимок делается после запуска: нужны подключённый домен, открытая индексация, "
        "счётчик аналитики и приём заявок на сервере.",
    ),
}
STUB_TABS = {"metrika": "metrika", "seo": "seo", "tochka-a": "tochka"}


def write(path: pathlib.Path, data: bytes):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


def build(site_root: str) -> int:
    root = pathlib.Path(site_root)
    out = root / "admin"
    pages = scan_pages(site_root)

    write(out / "index.html", pages_page(pages))

    # Карточка каждой страницы — отдельный файл: адрес вида
    # /admin/page/catalog/geely/coolray/ повторяет адрес самой страницы.
    cards = 0
    for p in pages:
        data = page_seo.read_page(site_root, p["route"])
        if not data:
            continue
        page = _doc(data["title"] or p["route"],
                    _topbar("pages") + page_seo.detail_body(data, SITE_URL))
        write(out / "page" / p["route"].strip("/") / "index.html", page)
        cards += 1

    for slug, (title, lead_text, items, needs) in STUBS.items():
        write(out / slug / "index.html", stub_page(STUB_TABS[slug], title, lead_text, items, needs))

    print(f"admin: {len(pages)} страниц в списке, {cards} карточек, {len(STUBS)} заглушки -> {out}")
    return len(pages)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Использование: python3 admin/build.py dist", file=sys.stderr)
        sys.exit(1)
    if not build(sys.argv[1]):
        print("admin: в сборке не найдено ни одной страницы", file=sys.stderr)
        sys.exit(1)
