#!/usr/bin/env python3
"""Общая разметка админки: стили, каркас страницы, шапка, заглушка раздела.

Здесь нет ни данных, ни доступа – только то, как это выглядит. Сборщик
admin/build.py складывает из этих частей статические страницы.
"""

import html
import os

SITE_URL = os.environ.get("SITE_URL", "https://tema-mail.github.io/evolution-car-by")

PAGE_CSS = """
*{box-sizing:border-box}
[hidden]{display:none !important}
body{margin:0;font-family:Inter,system-ui,-apple-system,sans-serif;background:#f3f5f4;color:#1e1e1e}
a{color:inherit}
main{padding:18px 16px 60px}
.empty{font-size:12px;color:#8a938f;text-align:center;padding:14px 0}
.lead{max-width:760px;margin:0 auto}
.panel{background:#fff;border:1px solid #dfe4e3;border-radius:12px;padding:20px;margin-bottom:14px}
.panel h2{margin:0 0 14px;font-size:16px;font-weight:600}

.topnav{background:#005653;color:#fff;padding:13px 20px;display:flex;align-items:center;gap:20px;flex-wrap:wrap;font-size:14px}
.topnav a{color:rgba(255,255,255,.75);text-decoration:none;display:inline-flex;align-items:center;gap:7px}
.topnav a:hover{color:#fff}
.topnav a.on{color:#fff;font-weight:600}
.topnav .site{margin-left:auto;color:rgba(255,255,255,.6)}
.topnav .site a{color:#fff;text-decoration:underline}
.tools{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin:0 0 14px}
.tools .lbl{color:#77817e;font-size:14px;margin-right:auto}
.tools input[type=search],.tools select{height:38px;padding:0 12px;border:1px solid #dfe4e3;border-radius:9px;
 font:inherit;font-size:14px;background:#fff}
.pages{background:#fff;border:1px solid #dfe4e3;border-radius:12px;overflow:hidden}
.phead,.prow{display:grid;grid-template-columns:70px 1fr 220px 150px;gap:14px;align-items:center;padding:12px 16px}
.phead{background:#eef1f0;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#77817e}
.prow{border-top:1px solid #f0f3f2}
.prow:hover{background:#fafbfb}
.pgroup{display:flex;align-items:center;gap:10px;padding:13px 16px 9px;background:#f7f9f8;border-top:1px solid #eceff0;
 font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#55605d;font-weight:600}
.pgroup span{color:#99a3a0;font-weight:400}
.pgroup.empty-grp{color:#a8b0ad}
.lvl1 .ptitle{padding-left:26px}
.lvl2 .ptitle{padding-left:52px}
.lvl1 .ptitle::before,.lvl2 .ptitle::before{content:"";position:absolute;margin-left:-16px;margin-top:9px;
 width:9px;height:1px;background:#c6cfcc}
.ptitle{position:relative}
.badge-img{width:54px;height:40px;border-radius:7px;object-fit:cover;background:#eef1f0;display:block}
.ptitle{font-size:14px;line-height:1.35;display:flex;gap:8px;align-items:flex-start}
.ptitle .home{flex:0 0 auto;margin-top:2px}
.pdesc{display:block;color:#8a938f;font-size:12px;margin-top:3px;line-height:1.4}
.plink{font-size:13px;color:#005653;text-decoration:none;word-break:break-all}
.pkind{font-size:12px;color:#77817e;text-align:right}
.pname{display:block;font-size:14px;font-weight:600;line-height:1.35}
.pcount{display:inline-block;margin-top:3px;font-size:12px;color:#005653;font-weight:500}
.pseo{display:inline-block;margin-top:4px;font-size:12px;color:#005653;text-decoration:none}
.pseo:hover{text-decoration:underline}
details.pcat{border-top:1px solid #f0f3f2}
details.pcat>summary{list-style:none;cursor:pointer;border-top:none}
details.pcat>summary::-webkit-details-marker{display:none}
details.pcat[open]>summary{background:#f7faf9}
.caret{flex:0 0 auto;width:0;height:0;margin-top:5px;border-left:6px solid #55605d;
 border-top:5px solid transparent;border-bottom:5px solid transparent;transition:transform .15s}
details.pcat[open] .caret{transform:rotate(90deg)}
.pcat-body{background:#fcfdfd}
@media(max-width:900px){.phead,.prow{grid-template-columns:54px 1fr}.phead span:nth-child(n+3),.prow>:nth-child(n+3){display:none}}
"""




def _doc(title: str, body: str, script: str = "") -> bytes:
    js = f"<script>{script}</script>" if script else ""
    return f"""<!doctype html>
<html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>{html.escape(title)}</title><style>{PAGE_CSS}</style></head>
<body>{body}{js}</body></html>""".encode()



def _topbar(active: str = "pages") -> str:
    """Шапка как в Tilda: слева разделы, справа адрес сайта.
    Кнопок публикации и подключения домена нет намеренно – владелец их вычеркнул."""
    tabs = (
        ("pages", "/admin/", "Страницы сайта"),
        ("metrika", "/admin/metrika/", "Метрика"),
        ("seo", "/admin/seo/", "SEO-аналитика"),
        ("tochka", "/admin/tochka-a/", "Точка А"),
    )
    nav = "".join(
        f'<a href="{href}" class="{"on" if active == key else ""}">{title}</a>' for key, href, title in tabs
    )
    return (
        f'<div class="topnav">{nav}'
        f'<span class="site">Адрес сайта: <a href="{SITE_URL}" target="_blank" rel="noopener">{SITE_URL}</a></span>'
        f'</div>'
    )




def stub_page(active: str, title: str, lead_text: str, items, needs: str) -> bytes:
    """Заглушка раздела. Не пустая страница: перечисляет, что здесь будет
    и чего не хватает, чтобы это заработало."""
    lis = "".join(f"<li>{html.escape(i)}</li>" for i in items)
    return _doc(
        title,
        _topbar(active)
        + f"""<main><div class="lead">
<div class="panel"><h2>{html.escape(title)}</h2>
<p style="margin:0 0 14px;font-size:14px;line-height:1.5;color:#55605d">{html.escape(lead_text)}</p>
<ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.9;color:#1e1e1e">{lis}</ul>
</div>
<div class="panel" style="border-color:#f0d9a8;background:#fffaf0">
<h2 style="font-size:14px">Чтобы раздел заработал, нужно</h2>
<p style="margin:0;font-size:14px;line-height:1.5;color:#55605d">{html.escape(needs)}</p>
</div></div></main>""",
    )


