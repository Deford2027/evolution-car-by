export interface Lead {
  name: string;
  phone: string;
  /** Какая форма сработала — видно в админке, по чему человек пришёл */
  source: string;
  /** Согласие на обработку данных: без него сервер заявку не примет */
  consent: boolean;
  /** Машина из карточки. Если не передали — берём из заголовка страницы */
  car?: string;
  /** Значение поля-ловушки из формы: заполнено — значит отправил робот */
  company?: string;
}

/** Название машины для карточек каталога: /catalog/<марка>/<модель>/ и /zeekr/catalog/<слаг>/ */
function carFromPage(): string {
  if (!/^\/(zeekr\/)?catalog\/[^/]+\/[^/]+\/?$/.test(location.pathname)) return '';
  return document.querySelector('h1')?.textContent?.trim().slice(0, 120) ?? '';
}

/** Метки рекламной кампании из адреса — чтобы в заявке был виден источник */
function utmFromUrl(): string {
  const q = new URLSearchParams(location.search);
  return ['utm_source', 'utm_medium', 'utm_campaign']
    .map((k) => q.get(k))
    .filter(Boolean)
    .join(' / ');
}

/**
 * Отправка заявки на сервер сайта. Адрес приёмника задаётся
 * PUBLIC_LEAD_ENDPOINT при сборке; на статичном превью без сервера
 * переменной нет — тогда заявка только логируется, чтобы форма не
 * показывала человеку ошибку там, где принимать заявку просто некому.
 */
export async function submitLead(lead: Lead): Promise<boolean> {
  const endpoint = import.meta.env.PUBLIC_LEAD_ENDPOINT;

  const payload = {
    ...lead,
    car: lead.car || carFromPage(),
    page: location.pathname,
    referrer: document.referrer.slice(0, 200),
    utm: utmFromUrl(),
    // поле-ловушка: человек его не видит и не заполняет, роботы заполняют
    company: lead.company ?? '',
  };

  if (!endpoint) {
    console.info('[lead]', payload);
    await new Promise((r) => setTimeout(r, 400));
    return true;
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}
