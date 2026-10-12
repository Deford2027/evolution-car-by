#!/usr/bin/env python3
"""Сборка админки сайта Evolution Car в статические страницы.

Запускается после `astro build` и ДО rebase-dist: читает готовые страницы
из dist с корневыми путями и кладёт рядом dist/admin/ – список всех страниц
по сущностям, карточку разбора каждой страницы и разделы-заглушки.
Отдельного сервера нет: админка публикуется на GitHub Pages вместе с сайтом.

Каждая страница – сущность с рабочим именем, чтобы о ней было однозначно
говорить: «Хаб Китай» и «Каталог Китай» – разные страницы. Сущности:
Главная, Хаб (ведёт на другие страницы, полного списка товаров нет),
Каталог (список товаров), Карточка товара (одна машина), Страница,
Техническая страница, Юридическая страница.

Каталоги раскрываются, как в Тильде: внутри – их карточки товара. Одна
карточка стоит во всех каталогах, где она есть, но считается один раз.

Это MVP «чисто визуал»: приёма заявок и входа по паролю нет. Серверная
версия лежит в истории git (коммиты 8ee9aa7…ce2ba66).

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


# ---------- Сущности и рабочие имена ----------

# Порядок групп в списке
GROUPS = [
    ("Главная", "Главная"),
    ("Хаб", "Хабы"),
    ("Каталог", "Каталоги"),
    ("Страница", "Страницы"),
    ("Техническая страница", "Технические страницы"),
    ("Юридическая страница", "Юридические страницы"),
]

# Подборки каталога в порядке сайта (повторяет sections из src/content/cars.ts)
SECTION_NAMES = {
    "v-nalichii": "В наличии", "pod-zakaz": "Под заказ", "s-probegom": "С пробегом",
    "elektromobili": "Электромобили", "gibridy": "Гибриды",
    "iz-kitaya": "Китай", "iz-korei": "Корея", "iz-evropy": "Европа", "iz-ssha": "США",
}
# Хабы: сначала направления, потом города
DIRECTION_NAMES = {
    "china": "Китай", "korea": "Корея", "europa": "Европа", "usa": "США",
    "dostavka-i-rastamozhka": "Доставка и растаможка",
}
CITY_NAMES = {
    "minsk": "Минск", "gomel": "Гомель", "vitebsk": "Витебск",
    "brest": "Брест", "grodno": "Гродно", "mogilev": "Могилёв",
}
PAGE_NAMES = {"about": "О компании", "contact": "Контакты", "rew": "Отзывы", "portfolio": "Пригнали"}
TECH_NAMES = {"thank_page": "Спасибо"}
LEGAL_NAMES = {
    "policy": "Политика конфиденциальности", "agreement": "Пользовательское соглашение",
    "legal_data": "Юридические данные",
}


def _idx(d: dict, key: str) -> int:
    return list(d).index(key)


def entity_of(route: str, h1: str):
    """Сущность, рабочее имя и ключ порядка внутри группы.

    Неизвестный адрес не теряется: он становится «Страницей» с именем из H1,
    и его видно в списке – так новая страница сайта сразу заметна."""
    # Адрес сверяется целиком, по форме и длине, а не по первому сегменту:
    # иначе будущая /minsk/<что-то>/ стала бы вторым «Хаб Минск», и имя
    # перестало бы однозначно указывать на страницу.
    parts = [x for x in route.split("/") if x]
    n = len(parts)
    if not parts:
        return "Главная", "Главная", (0,)
    first = parts[0]

    if first == "zeekr":
        if n == 1:
            return "Главная", "Главная Zeekr", (1,)
        if n == 2 and parts[1] == "catalog":
            return "Каталог", "Каталог Zeekr-версии", (3, "")
        if n == 3 and parts[1] == "catalog":
            return "Карточка товара", f"{h1 or parts[2]} (Zeekr)", (0,)

    elif first == "catalog" and n <= 3:
        if n == 1:
            return "Каталог", "Общий каталог", (0, "")
        if n == 2:
            if parts[1] in SECTION_NAMES:
                return "Каталог", f"Каталог {SECTION_NAMES[parts[1]]}", (1, _idx(SECTION_NAMES, parts[1]))
            # «Geely – купить в Минске под заказ» → «Geely»
            brand = re.split(r"\s[––-]\s", h1, maxsplit=1)[0].strip() if h1 else parts[1]
            return "Каталог", f"Каталог {brand}", (2, brand.lower())
        return "Карточка товара", h1 or parts[2], (0,)

    elif n == 1:
        if first in DIRECTION_NAMES:
            return "Хаб", f"Хаб {DIRECTION_NAMES[first]}", (0, _idx(DIRECTION_NAMES, first))
        if first in CITY_NAMES:
            return "Хаб", f"Хаб {CITY_NAMES[first]}", (1, _idx(CITY_NAMES, first))
        if first in PAGE_NAMES:
            return "Страница", PAGE_NAMES[first], (0, _idx(PAGE_NAMES, first))
        if first in TECH_NAMES:
            return "Техническая страница", TECH_NAMES[first], (0, _idx(TECH_NAMES, first))
        if first in LEGAL_NAMES:
            return "Юридическая страница", LEGAL_NAMES[first], (0, _idx(LEGAL_NAMES, first))
    return "Страница", h1 or route, (1, (h1 or route).lower())


# ---------- Обход сборки ----------

# Товар в каталоге выводится компонентом CarCard: у него ссылка-картинка
# class="card__shot". По ней и собираем состав каталога – из того, что
# реально опубликовано, а не повторяя правила подборок из кода сайта.
CARD_LINK = re.compile(r'<a class="card__shot"[^>]*\bhref="(/(?:zeekr/)?catalog/[^"]+/)"')


def _text(s: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()


def scan_pages(site_root: str):
    """Собирает список страниц из выложенной статики. Источник – сами файлы
    сайта, поэтому список не может разойтись с тем, что опубликовано."""
    root = pathlib.Path(site_root)
    out = []
    for f in sorted(root.rglob("index.html")):
        rel = f.parent.relative_to(root).as_posix()
        # сама админка лежит в той же сборке – её страницы в список не берём
        if rel == "admin" or rel.startswith("admin/"):
            continue
        route = "/" if rel == "." else f"/{rel}/"
        try:
            src = f.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        title = re.search(r"<title>(.*?)</title>", src, re.S)
        h1 = re.search(r"<h1[^>]*>(.*?)</h1>", src, re.S)
        h1_text = _text(h1.group(1)) if h1 else ""
        entity, name, order = entity_of(route, h1_text)
        # миниатюра выбирается так же, как в карточке страницы
        shots = re.findall(r'<img[^>]+src="(/img/[^"]+)"', src)
        page = {
            "route": route,
            "title": _text(title.group(1)) if title else route,
            "img": page_seo._badge(route, shots),
            "entity": entity,
            "name": name,
            "order": order,
            "members": [],
        }
        if entity == "Каталог":
            # порядок как на странице каталога, повторы убираем
            page["members"] = list(dict.fromkeys(CARD_LINK.findall(src)))
        out.append(page)
    return out


def link_catalogs(pages):
    """Для каждой карточки товара – в каких каталогах она стоит, в порядке
    каталогов в списке. Пересчитывается с нуля: функцию зовут и для списка,
    и для разборов, и дописывание к прежнему давало бы каждый каталог дважды."""
    by_route = {p["route"]: p for p in pages}
    for p in pages:
        p["parents"] = []
    for cat in sorted((p for p in pages if p["members"]), key=lambda p: p["order"]):
        for r in cat["members"]:
            if r in by_route:
                by_route[r]["parents"].append(cat["name"])
    return by_route


# ---------- Разметка списка ----------

def _badge_html(p) -> str:
    if p["img"]:
        return f'<img class="badge-img" src="{html.escape(p["img"])}" alt="" loading="lazy">'
    return '<span class="badge-img"></span>'


def _search_key(p) -> str:
    return html.escape(f'{p["name"]} {p["title"]} {p["route"]}'.lower())


def _row(p, level=0) -> str:
    """Строка страницы: рабочее имя крупно, SEO-тайтл под ним, адрес, сущность."""
    card = html.escape("/admin/page" + p["route"])
    cls = f" lvl{level}" if level else ""
    return (
        f'<div class="prow{cls}" data-q="{_search_key(p)}">'
        f'<a class="pcard" href="{card}">{_badge_html(p)}</a>'
        f'<a class="pcard ptitle" href="{card}"><div><span class="pname">{html.escape(p["name"])}</span>'
        f'<span class="pdesc">{html.escape(p["title"][:140])}</span></div></a>'
        f'<a class="plink" href="{html.escape(SITE_URL + p["route"])}" target="_blank" rel="noopener">'
        f'{html.escape(p["route"])}</a>'
        f'<div class="pkind">{html.escape(p["entity"])}</div></div>'
    )


def _catalog_block(cat, by_route) -> str:
    """Каталог раскрывается по клику, как в Тильде: внутри его карточки товара.
    Имя каталога разворачивает список, разбор открывается отдельной ссылкой."""
    items = [by_route[r] for r in cat["members"] if r in by_route]
    card = html.escape("/admin/page" + cat["route"])
    head = (
        f'<summary class="prow pcat-head">'
        f'<span class="pcard">{_badge_html(cat)}</span>'
        f'<span class="ptitle"><span class="caret" aria-hidden="true"></span><div>'
        f'<span class="pname">{html.escape(cat["name"])}</span>'
        f'<span class="pcount">{len(items)} {_plural(len(items), "товар", "товара", "товаров")}</span>'
        f'<span class="pdesc">{html.escape(cat["title"][:140])}</span>'
        f'<a class="pseo" href="{card}">SEO-разбор каталога →</a></div></span>'
        f'<a class="plink" href="{html.escape(SITE_URL + cat["route"])}" target="_blank" rel="noopener">'
        f'{html.escape(cat["route"])}</a>'
        f'<span class="pkind">Каталог</span></summary>'
    )
    body = "".join(_row(p, 1) for p in items) or '<div class="empty">В каталоге нет товаров</div>'
    return f'<details class="pcat">{head}<div class="pcat-body">{body}</div></details>'


def _plural(n: int, one: str, few: str, many: str) -> str:
    if n % 10 == 1 and n % 100 != 11:
        return one
    if 2 <= n % 10 <= 4 and not 12 <= n % 100 <= 14:
        return few
    return many


def pages_page(pages) -> bytes:
    by_route = link_catalogs(pages)
    cards = [p for p in pages if p["entity"] == "Карточка товара"]
    orphans = [p for p in cards if not p["parents"]]

    tree = []
    counts = {}
    for entity, title in GROUPS:
        items = sorted((p for p in pages if p["entity"] == entity), key=lambda p: p["order"])
        counts[title] = len(items)
        if not items:
            continue
        tree.append(f'<div class="pgroup">{title}<span>{len(items)}</span></div>')
        if entity == "Каталог":
            tree.extend(_catalog_block(c, by_route) for c in items)
        else:
            tree.extend(_row(p) for p in items)
    if orphans:
        tree.append(f'<div class="pgroup">Карточки товара без каталога<span>{len(orphans)}</span></div>')
        tree.extend(_row(p) for p in sorted(orphans, key=lambda p: p["name"].lower()))

    # Для поиска – плоский список, где каждая страница ровно один раз:
    # в дереве карточка повторяется во всех своих каталогах.
    flat = "".join(_row(p) for p in sorted(pages, key=lambda p: p["name"].lower()))

    summary = " · ".join(
        [f"Страниц: {len(pages)}"]
        + [f"{t}: {n}" for t, n in counts.items() if n]
        + [f"Карточек товара: {len(cards)}"]
    )

    return _doc(
        "Страницы сайта",
        _topbar("pages")
        + f"""<main>
<div class="tools">
<span class="lbl">{summary}</span>
<input type="search" id="q" placeholder="Поиск по имени, заголовку или адресу">
</div>
<div class="pages"><div class="phead"><span>Бейдж</span><span>Сущность и имя</span><span>Ссылка</span>
<span style="text-align:right">Тип</span></div>
<div id="tree">{"".join(tree)}</div>
<div id="flat" hidden>{flat}</div>
<div class="empty" id="none" hidden>Страниц не найдено</div></div></main>""",
        SEARCH_JS,
    )


# Пустой запрос – дерево с каталогами. Непустой – плоский список, где каждая
# страница один раз: иначе карточка из пяти каталогов нашлась бы пять раз.
SEARCH_JS = """
document.addEventListener('DOMContentLoaded', function () {
  var input = document.getElementById('q');
  var tree = document.getElementById('tree');
  var flat = document.getElementById('flat');
  var rows = flat.querySelectorAll('.prow');
  var none = document.getElementById('none');
  input.addEventListener('input', function () {
    var q = input.value.trim().toLowerCase();
    tree.hidden = !!q;
    flat.hidden = !q;
    var shown = 0;
    rows.forEach(function (r) {
      var ok = !!q && r.dataset.q.indexOf(q) !== -1;
      r.hidden = !ok;
      if (ok) shown++;
    });
    none.hidden = !q || shown > 0;
  });
});
"""


# ---------- Заглушки ----------

STUBS = {
    "metrika": (
        "Метрика",
        "Здесь будут собраны данные аналитики по сайту – чтобы не ходить в интерфейс "
        "счётчика за каждой цифрой.",
        [
            "Посещаемость по дням и источникам трафика",
            "Какие страницы смотрят чаще всего и с каких уходят",
            "Сколько заявок и какая из них конверсия",
            "Путь посетителя до заявки",
        ],
        "На сайте пока нет счётчика: в разметке нет ни Метрики, ни Google Analytics. "
        "Нужно решение, какую аналитику ставить, номер счётчика и токен на чтение. "
        "До установки счётчика данных не существует – показывать нечего.",
    ),
    "seo": (
        "SEO-аналитика",
        "Здесь будет видно, по каким запросам сайт показывается и какие страницы "
        "за эти запросы отвечают – чтобы не держать карту запросов в отдельной таблице.",
        [
            "Запросы по каждой странице и частотность по Беларуси",
            "Показы и позиции из Яндекс.Вебмастера и Search Console",
            "Страницы без запросов и запросы без страниц",
            "Марки и модели каталога, у которых нет своей посадочной",
        ],
        "Частотности и позиции из кода сайта взять нельзя: это внешние данные. "
        "Нужны доступы – Яндекс.Вебмастер и Search Console на подтверждённый домен, "
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


# ---------- Сборка ----------

def write(path: pathlib.Path, data: bytes):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


def already_rebased(root: pathlib.Path) -> bool:
    """Сборка уже прошла rebase-dist: пути с префиксом подпапки. Тогда ни
    картинки, ни состав каталогов не найдутся, и админка выйдет пустой."""
    home = root / "index.html"
    if not home.is_file():
        return False
    src = home.read_text(encoding="utf-8", errors="ignore")
    return 'href="/catalog/' not in src and re.search(r'href="/[^"/]+/catalog/', src) is not None


def build(site_root: str) -> int:
    root = pathlib.Path(site_root)
    if already_rebased(root):
        print("admin: сборка уже с префиксом подпапки – запускать до rebase-dist", file=sys.stderr)
        sys.exit(1)
    out = root / "admin"
    pages = scan_pages(site_root)
    by_route = link_catalogs(pages)

    write(out / "index.html", pages_page(pages))

    # Карточка разбора каждой страницы – отдельный файл: адрес вида
    # /admin/page/catalog/geely/coolray/ повторяет адрес самой страницы.
    done = 0
    for p in pages:
        data = page_seo.read_page(site_root, p["route"])
        if not data:
            continue
        data.update(
            name=p["name"], entity=p["entity"],
            parents=by_route[p["route"]]["parents"],
            members=len([r for r in p["members"] if r in by_route]),
        )
        page = _doc(p["name"], _topbar("pages") + page_seo.detail_body(data, SITE_URL))
        write(out / "page" / p["route"].strip("/") / "index.html", page)
        done += 1

    for slug, (title, lead_text, items, needs) in STUBS.items():
        write(out / slug / "index.html", stub_page(STUB_TABS[slug], title, lead_text, items, needs))

    cats = sum(1 for p in pages if p["entity"] == "Каталог")
    cards = sum(1 for p in pages if p["entity"] == "Карточка товара")
    print(f"admin: {len(pages)} страниц, {cats} каталогов, {cards} карточек товара, "
          f"{done} разборов, {len(STUBS)} заглушки -> {out}")
    return len(pages)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Использование: python3 admin/build.py dist", file=sys.stderr)
        sys.exit(1)
    if not build(sys.argv[1]):
        print("admin: в сборке не найдено ни одной страницы", file=sys.stderr)
        sys.exit(1)
