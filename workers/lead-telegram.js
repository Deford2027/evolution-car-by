// Приёмник заявок сайта → Telegram. Cloudflare Worker.
// Переменные в настройках воркера: BOT_TOKEN (секрет) и CHAT_ID.
// Токен живёт только здесь – в код сайта он не попадает.

const ALLOWED = [
  'https://evolutioncar.by',
  'https://www.evolutioncar.by',
  'https://deford2027.github.io',
];

const esc = (v) => String(v ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]).slice(0, 500);

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': ALLOWED.includes(origin) ? origin : ALLOWED[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });

    let lead;
    try { lead = await request.json(); } catch { return new Response('Bad JSON', { status: 400, headers: cors }); }

    // поле-ловушка заполнено – робот: отвечаем «ок», но в чат не шлём
    if (lead.company) return new Response('ok', { headers: cors });
    if (!lead.phone || !lead.consent) return new Response('Нет телефона или согласия', { status: 400, headers: cors });

    const utm = lead.utm; // «источник / канал / кампания»
    const lines = [
      '<b>🚗 Новая заявка с сайта</b>',
      `<b>Имя:</b> ${esc(lead.name)}`,
      `<b>Телефон:</b> ${esc(lead.phone)}`,
      lead.car && `<b>Авто:</b> ${esc(lead.car)}`,
      `<b>Форма:</b> ${esc(lead.source)}`,
      lead.page && `<b>Страница:</b> ${esc(lead.page)}`,
      utm && `<b>UTM:</b> ${esc(utm)}`,
      lead.referrer && `<b>Откуда:</b> ${esc(lead.referrer)}`,
    ].filter(Boolean);

    const res = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.CHAT_ID, text: lines.join('\n'), parse_mode: 'HTML', disable_web_page_preview: true }),
    });
    return new Response(res.ok ? 'ok' : 'telegram error', { status: res.ok ? 200 : 502, headers: cors });
  },
};
