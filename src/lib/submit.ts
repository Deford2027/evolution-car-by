export interface Lead {
  name: string;
  phone: string;
  source: string;
}

/**
 * Отправка заявки. Бэкенда пока нет: если PUBLIC_LEAD_ENDPOINT не задан,
 * заявка только логируется, форма показывает успешное состояние.
 */
export async function submitLead(lead: Lead): Promise<boolean> {
  const endpoint = import.meta.env.PUBLIC_LEAD_ENDPOINT;

  if (!endpoint) {
    console.info('[lead]', lead);
    await new Promise((r) => setTimeout(r, 400));
    return true;
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...lead, page: location.pathname }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
