#!/usr/bin/env python3
"""Раздел «Заявки»: доска по этапам, список, карточка заявки, выгрузка.

Данные берутся из той же базы, куда их кладёт приёмщик заявок
(lead_handler), — отдельного хранилища у админки нет, иначе доска
расходилась бы с тем, что реально пришло с сайта.
"""

import csv
import html
import io
import time

import lead_handler as lead
from admin_ui import _doc, _topbar

STAGES = [
    ("new", "Новые"),
    ("contact", "Связались"),
    ("select", "Подбор"),
    ("deposit", "Депозит"),
    ("transit", "В пути"),
    ("done", "Выдан"),
    ("reject", "Отказ"),
]
STAGE_KEYS = [k for k, _ in STAGES]
STAGE_NAMES = dict(STAGES)


DND_JS = """
// Перетаскивание карточек между этапами. Статус уходит на сервер сразу,
// чтобы доска не расходилась с базой при закрытии вкладки.
document.addEventListener('DOMContentLoaded', function () {
  var dragged = null;
  document.querySelectorAll('.card').forEach(function (c) {
    c.addEventListener('dragstart', function (e) {
      dragged = c; c.classList.add('drag');
      e.dataTransfer.effectAllowed = 'move';
    });
    c.addEventListener('dragend', function () { c.classList.remove('drag'); });
    // клик по карточке открывает её, но только если это не было перетаскивание
    c.addEventListener('click', function (e) {
      if (c.classList.contains('drag')) e.preventDefault();
    });
  });
  document.querySelectorAll('.col').forEach(function (col) {
    col.addEventListener('dragover', function (e) { e.preventDefault(); col.classList.add('over'); });
    col.addEventListener('dragleave', function () { col.classList.remove('over'); });
    col.addEventListener('drop', function (e) {
      e.preventDefault(); col.classList.remove('over');
      if (!dragged) return;
      col.appendChild(dragged);
      fetch('/admin/stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'id=' + dragged.dataset.id + '&stage=' + col.dataset.stage
      }).then(function () { location.reload(); });
    });
  });
});
"""



def _leads_tools(q: str, view: str) -> str:
    sw = (
        f'<div class="switch"><a href="/admin/leads?view=board" class="{"on" if view == "board" else ""}">Доска</a>'
        f'<a href="/admin/leads?view=list" class="{"on" if view == "list" else ""}">Списком</a></div>'
    )
    extra = (
        f'{sw}'
        f'<form method="get" action="/admin/leads"><input type="hidden" name="view" value="{view}">'
        f'<input type="search" name="q" value="{html.escape(q)}" placeholder="Имя или телефон"'
        f' style="height:32px;padding:0 11px;border-radius:8px;border:none;font:inherit;font-size:13px"></form>'
        f'<a href="/admin/export.csv" style="color:#fff;text-decoration:underline">CSV</a>'
        f'<form method="post" action="/admin/logout">'
        f'<button type="submit" style="background:none;border:none;color:rgba(255,255,255,.75);'
        f'font:inherit;font-size:14px;cursor:pointer;padding:0">Выйти</button></form>'
    )
    return _topbar("leads", extra)



def list_page(rows, q: str) -> bytes:
    items = []
    for r in rows:
        stage = STAGE_NAMES.get(r["stage"], r["stage"])
        cls = "new" if r["stage"] == "new" else ""
        src = (r["car"] or r["source"] or r["utm"] or "—")[:30]
        items.append(
            f"""<a class="lrow" href="/admin/lead?id={r['id']}">
<span>{html.escape(str(r['created_at']))}</span>
<span>{html.escape(str(r['name']))}</span>
<span style="color:#005653;font-weight:500">{html.escape(str(r['phone']))}</span>
<span style="color:#77817e;font-size:13px">{html.escape(src)}</span>
<span><i class="st {cls}" style="font-style:normal">{html.escape(stage)}</i></span></a>"""
        )
    body = "".join(items) or '<div class="empty">Заявок пока нет</div>'
    return _doc(
        "Заявки — список",
        _leads_tools(q, "list")
        + f"""<main><div class="list"><div class="lhead">
<span>Когда</span><span>Имя</span><span>Телефон</span><span>Машина</span><span>Этап</span>
</div>{body}</div></main>""",
    )



def board_page(rows, q: str) -> bytes:
    by_stage = {k: [] for k in STAGE_KEYS}
    for r in rows:
        by_stage.setdefault(r["stage"] if r["stage"] in by_stage else "new", []).append(r)

    cols = []
    for key, title in STAGES:
        items = by_stage.get(key, [])
        cards = []
        for r in items:
            car = (r["car"] or "").strip()
            src = (r["source"] or r["utm"] or r["referrer"] or "").strip()
            steps = len([p for p in (r["journey"] or "").split("|") if p])
            meta = []
            if car:
                meta.append(f'<span class="tag">{html.escape(car[:28])}</span>')
            # Источник не повторяем, если он и так называет ту же машину:
            # «Карточка: Geely Coolray» рядом с меткой «Geely Coolray» — шум.
            if src and (not car or car.lower() not in src.lower()):
                meta.append(f'<span class="tag">{html.escape(src[:28])}</span>')
            if steps > 1:
                meta.append(f'<span class="tag">{steps} стр.</span>')
            if (r["visits"] or 1) > 1:
                meta.append(f'<span class="tag">{r["visits"]} визита</span>')
            cards.append(
                f"""<a class="card" draggable="true" data-id="{r['id']}" href="/admin/lead?id={r['id']}">
<b>{html.escape(str(r['name']))}</b>
<span class="ph">{html.escape(str(r['phone']))}</span>
<div class="meta">{''.join(meta)}<br>{html.escape(str(r['created_at']))} · {html.escape(str(r['page'] or '—'))}</div>
</a>"""
            )
        inner = "".join(cards) or '<div class="empty">пусто</div>'
        cols.append(
            f'<div class="col" data-stage="{key}"><h2>{title}<span>{len(items)}</span></h2>{inner}</div>'
        )

    return _doc(
        "Заявки — доска",
        _leads_tools(q, "board") + f'<main><div class="board">{"".join(cols)}</div></main>',
        DND_JS,
    )




def lead_page(row, comments) -> bytes:
    """Карточка одной заявки: что известно о человеке, на каком она этапе
    и что по ней уже делали.

    В образце, с которого перенесена админка, эта функция вызывалась, но
    отсутствовала — там карточка заявки падала. Здесь она написана заново
    по тем же стилям, что и остальные экраны.
    """
    def field(label, value, accent=False):
        if not value:
            return ""
        style = ' style="color:#005653;font-weight:500"' if accent else ""
        return (
            f'<div class="row"><span>{html.escape(label)}</span>'
            f'<span{style}>{html.escape(str(value))}</span></div>'
        )

    source = (row["utm"] or row["referrer"] or "").strip()
    journey = [x for x in (row["journey"] or "").split("|") if x]
    visits = row["visits"] or 1

    facts = (
        field("Когда", row["created_at"])
        + field("Имя", row["name"])
        + field("Телефон", row["phone"], accent=True)
        + field("Машина", row["car"])
        + field("Страница заявки", row["page"])
        + field("Форма", row["source"])
        + field("Источник перехода", source)
        + (field("Визитов до заявки", visits) if visits > 1 else "")
        + (field("Путь по сайту", " → ".join(journey)) if len(journey) > 1 else "")
        + field("Адрес", row["ip"])
    )

    picks = "".join(
        f'<button name="stage" value="{key}" class="{"on" if row["stage"] == key else ""}">{title}</button>'
        for key, title in STAGES
    )
    stage_form = (
        f'<form method="post" action="/admin/stage">'
        f'<input type="hidden" name="id" value="{row["id"]}">'
        f'<input type="hidden" name="back" value="1">'
        f'<div class="stage-pick">{picks}</div></form>'
    )

    cmts = "".join(
        f'<div class="cmt"><i>{html.escape(str(c["created_at"]))}</i>'
        f'{html.escape(str(c["text"]))}</div>'
        for c in comments
    ) or '<div class="empty">Записей пока нет</div>'

    comment_form = (
        f'<form method="post" action="/admin/comment">'
        f'<input type="hidden" name="id" value="{row["id"]}">'
        f'<textarea name="text" placeholder="Что выяснили, что договорились"></textarea>'
        f'<button class="send" type="submit">Добавить запись</button></form>'
    )

    body = f"""<main><div class="lead">
<div class="panel"><h2>Заявка №{row['id']}</h2>{facts}</div>
<div class="panel"><h2>Этап</h2>{stage_form}</div>
<div class="panel"><h2>История работы</h2>{cmts}{comment_form}</div>
</div></main>"""

    return _doc(
        f"Заявка №{row['id']} — {row['name']}",
        _leads_tools("", "board") + body,
    )



def fetch_leads(q: str = ""):
    with lead.db() as conn:
        if q:
            like = f"%{q}%"
            return conn.execute(
                "SELECT * FROM leads WHERE name LIKE ? OR phone LIKE ? ORDER BY id DESC LIMIT 500", (like, like)
            ).fetchall()
        return conn.execute("SELECT * FROM leads ORDER BY id DESC LIMIT 500").fetchall()


def fetch_lead(lead_id):
    with lead.db() as conn:
        row = conn.execute("SELECT * FROM leads WHERE id=?", (lead_id,)).fetchone()
        cmts = conn.execute(
            "SELECT * FROM lead_comments WHERE lead_id=? ORDER BY id DESC", (lead_id,)
        ).fetchall()
        return row, cmts


def set_stage(lead_id, stage):
    if stage not in STAGE_KEYS:
        return
    with lead.db() as conn:
        conn.execute(
            "UPDATE leads SET stage=?, updated_at=? WHERE id=?",
            (stage, time.strftime("%Y-%m-%d %H:%M:%S"), lead_id),
        )


def add_comment(lead_id, text):
    text = text.strip()[:2000]
    if not text:
        return
    with lead.db() as conn:
        conn.execute(
            "INSERT INTO lead_comments (lead_id, created_at, text) VALUES (?,?,?)",
            (lead_id, time.strftime("%Y-%m-%d %H:%M"), text),
        )


def export_csv() -> bytes:
    buf = io.StringIO()
    w = csv.writer(buf, delimiter=";")
    w.writerow(["id", "дата", "имя", "телефон", "машина", "форма", "страница",
                "этап", "источник", "визитов", "путь"])
    for r in fetch_leads():
        w.writerow([
            r["id"], r["created_at"], r["name"], r["phone"], r["car"] or "",
            r["source"] or "", r["page"] or "",
            STAGE_NAMES.get(r["stage"], r["stage"]), r["utm"] or "", r["visits"] or 1,
            (r["journey"] or "").replace("|", " > "),
        ])
    # BOM — иначе Excel откроет кириллицу кракозябрами
    return "﻿".encode() + buf.getvalue().encode("utf-8")


