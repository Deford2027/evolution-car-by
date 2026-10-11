// События для Google Analytics 4 и Google Ads в стандартном формате
// интернет-магазина. Пишутся в window.dataLayer: пока Google Tag Manager не
// подключён, они копятся в браузере и никуда не уходят — сайт от них не зависит.
//
// Модуль работает в браузере и не импортирует каталог: данные товара страница
// получает готовыми из BaseLayout (<script id="product-item">), иначе в каждую
// страницу уехали бы все 107 машин.

interface Item {
  item_id: string;
  price?: number;
  [key: string]: unknown;
}

interface PageProduct {
  currency: string;
  item: Item;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/** ecommerce обнуляется перед каждым событием — так требует GA4, иначе
 *  товары прошлого события «прилипают» к следующему. */
function push(event: string, ecommerce: Record<string, unknown>) {
  const dl = (window.dataLayer = window.dataLayer || []);
  dl.push({ ecommerce: null });
  dl.push({ event, ecommerce });
}

/** Ценность для Google — цена машины; без цены событие уходит без value. */
function valueOf(currency: string, items: Item[]) {
  const value = items.reduce((sum, i) => sum + (i.price ?? 0), 0);
  return value > 0 ? { currency, value } : {};
}

/** Товар этой страницы — есть только на карточках товара. */
function pageProduct(): PageProduct | null {
  const el = document.getElementById('product-item');
  if (!el?.textContent) return null;
  try {
    return JSON.parse(el.textContent) as PageProduct;
  } catch {
    return null;
  }
}

/**
 * Карточка товара: просмотр и интерес к машине.
 *
 * Корзины на сайте нет. Самый сильный сигнал интереса — «Запросить расчёт»
 * или начало заполнения формы заявки, поэтому для Google это add_to_cart:
 * по нему строится аудитория «хотел эту машину, но заявку не оставил».
 * Уходит один раз за просмотр страницы.
 */
function trackProduct(product: PageProduct) {
  const { currency, item } = product;
  push('view_item', { ...valueOf(currency, [item]), items: [item] });

  let sent = false;
  const intent = () => {
    if (sent) return;
    sent = true;
    push('add_to_cart', { ...valueOf(currency, [item]), items: [item] });
  };
  document.addEventListener('click', (e) => {
    if ((e.target as Element | null)?.closest?.('a[href="#request"]')) intent();
  });
  document.getElementById('request')?.addEventListener('focusin', intent);
}

let started = false;

export function initAnalytics() {
  if (started) return;
  started = true;
  const product = pageProduct();
  if (product) trackProduct(product);
}
