#!/usr/bin/env python3
"""Общая разметка админки: стили, каркас страницы, шапка, заглушка раздела.

Вынесено из admin.py отдельным модулем, чтобы ни один файл админки не
разрастался: страницы сайта, заявки и разметка меняются по разным поводам.
Здесь нет ни данных, ни доступа — только то, как это выглядит.
"""

import html
import os

SITE_URL = os.environ.get("SITE_URL", "https://evolution-car-by.45.12.72.227.nip.io")

PAGE_CSS = """
*{box-sizing:border-box}
body{margin:0;font-family:Inter,system-ui,-apple-system,sans-serif;background:#f3f5f4;color:#1e1e1e}
a{color:inherit}
header{background:#005653;color:#fff;padding:16px 20px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
header b{font-size:17px;font-weight:500}
header .sp{margin-left:auto;display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px;border:none;
 background:#fff;color:#005653;font:inherit;font-size:14px;cursor:pointer;text-decoration:none}
.btn.ghost{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.4)}
header input[type=search]{height:34px;padding:0 12px;border-radius:8px;border:none;font:inherit;min-width:180px}
main{padding:18px 16px 60px}
.board{display:flex;gap:12px;align-items:flex-start;overflow-x:auto;padding-bottom:12px}
.col{flex:0 0 268px;background:#e9edec;border-radius:12px;padding:10px;min-height:120px}
.col.over{background:#d6e3e0;outline:2px dashed #005653}
.col h2{margin:0 0 10px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#55605d;
 display:flex;justify-content:space-between}
.card{background:#fff;border:1px solid #dfe4e3;border-radius:10px;padding:11px 12px;margin-bottom:9px;cursor:grab;
 display:block;text-decoration:none}
.card:active{cursor:grabbing}
.card.drag{opacity:.4}
.card b{display:block;font-size:14px;font-weight:600;margin-bottom:3px}
.card .ph{font-size:14px;color:#005653;font-weight:500}
.card .meta{font-size:11px;color:#77817e;margin-top:6px;line-height:1.5}
.tag{display:inline-block;background:#eef3f1;border-radius:5px;padding:1px 6px;margin-right:4px;font-size:11px}
.empty{font-size:12px;color:#8a938f;text-align:center;padding:14px 0}
.lead{max-width:760px;margin:0 auto}
.panel{background:#fff;border:1px solid #dfe4e3;border-radius:12px;padding:20px;margin-bottom:14px}
.panel h2{margin:0 0 14px;font-size:16px;font-weight:600}
.row{display:flex;gap:10px;padding:7px 0;border-bottom:1px solid #f0f3f2;font-size:14px}
.row:last-child{border-bottom:none}
.row span:first-child{flex:0 0 150px;color:#77817e}
.row span:last-child{flex:1;word-break:break-word}
.stage-pick{display:flex;gap:7px;flex-wrap:wrap}
.stage-pick button{padding:7px 13px;border-radius:999px;border:1px solid #cfd6d4;background:#fff;font:inherit;
 font-size:13px;cursor:pointer}
.stage-pick button.on{background:#005653;border-color:#005653;color:#fff}
.cmt{border-left:3px solid #d9e2df;padding:3px 0 3px 11px;margin-bottom:11px}
.cmt i{display:block;font-style:normal;font-size:11px;color:#8a938f;margin-bottom:3px}
textarea{width:100%;min-height:76px;padding:10px;border:1px solid #d9dedc;border-radius:8px;font:inherit;font-size:14px}
.send{margin-top:9px;padding:9px 18px;border:none;border-radius:8px;background:#005653;color:#fff;font:inherit;cursor:pointer}
.login{max-width:360px;margin:12vh auto;background:#fff;border:1px solid #d9dedc;border-radius:16px;padding:28px}
.login h1{margin:0 0 6px;font-size:22px;font-weight:500}
.login p{margin:0 0 20px;font-size:14px;color:#6b7472}
.login input{width:100%;height:46px;padding:0 14px;border:1px solid #d9dedc;border-radius:8px;font:inherit;margin-bottom:12px}
.login button{width:100%;height:46px;border:none;border-radius:8px;background:#005653;color:#fff;font:inherit;cursor:pointer}

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
.switch{display:inline-flex;border:1px solid rgba(255,255,255,.4);border-radius:9px;overflow:hidden}
.switch a{padding:7px 13px;font-size:13px;color:rgba(255,255,255,.8);text-decoration:none}
.switch a.on{background:#fff;color:#005653;font-weight:600}
.list{background:#fff;border:1px solid #dfe4e3;border-radius:12px;overflow:hidden}
.lhead,.lrow{display:grid;grid-template-columns:140px 1fr 170px 150px 120px;gap:12px;align-items:center;padding:11px 16px}
.lhead{background:#eef1f0;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#77817e}
.lrow{border-top:1px solid #f0f3f2;font-size:14px;text-decoration:none;color:inherit}
.lrow>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lrow>span:nth-child(5){overflow:visible;text-align:right}
.lrow:hover{background:#fafbfb}
.st{display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;background:#eef3f1;color:#55605d}
.st.new{background:#e6f4ea;color:#136c2e}
@media(max-width:900px){.phead,.prow{grid-template-columns:54px 1fr}.phead span:nth-child(n+3),.prow>:nth-child(n+3){display:none}
 .lhead,.lrow{grid-template-columns:1fr 130px}.lhead span:nth-child(n+3),.lrow>:nth-child(n+3){display:none}}
.err{background:#fdecea;color:#b3261e;padding:10px 14px;border-radius:8px;font-size:14px;margin-bottom:14px}
"""




def _doc(title: str, body: str, script: str = "") -> bytes:
    js = f"<script>{script}</script>" if script else ""
    return f"""<!doctype html>
<html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>{html.escape(title)}</title><style>{PAGE_CSS}</style></head>
<body>{body}{js}</body></html>""".encode()



def login_page(error: str = "") -> bytes:
    err = f'<div class="err">{html.escape(error)}</div>' if error else ""
    return _doc(
        "Вход — заявки",
        f"""<div class="login"><h1>Заявки с сайта</h1><p>Evolution Car — Минск</p>{err}
<form method="post" action="/admin/login">
<input type="password" name="password" placeholder="Пароль" autofocus required>
<button type="submit">Войти</button></form></div>""",
    )



def _topbar(active: str = "pages", right: str = "") -> str:
    """Шапка как в Tilda: слева разделы, справа адрес сайта.
    Кнопок публикации и подключения домена нет намеренно — владелец их вычеркнул."""
    tabs = (
        ("pages", "/admin", "Страницы сайта"),
        ("leads", "/admin/leads", "Заявки"),
        ("metrika", "/admin/metrika", "Метрика"),
        ("seo", "/admin/seo", "SEO-аналитика"),
        ("tochka", "/admin/tochka-a", "Точка А"),
    )
    nav = "".join(
        f'<a href="{href}" class="{"on" if active == key else ""}">{title}</a>' for key, href, title in tabs
    )
    return (
        f'<div class="topnav">{nav}{right}'
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


