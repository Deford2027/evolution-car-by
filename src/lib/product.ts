// Товар как сущность для Google: один номер и одни данные для фида Google Ads,
// событий на страницах и карточек каталога. Всё строится здесь, чтобы номер
// товара в событиях гарантированно совпадал с номером в фиде — без этого
// динамический ремаркетинг не найдёт машину и покажет пустой баннер.
import type { Car } from '../content/cars';
import { cars, countries, powertrains, availabilities, formatUsd, carPath, slugify, modelSlug } from '../content/cars';
import { abs } from './seo';

/** Валюта как на сайте: цена в объявлении обязана совпадать с ценой на странице. */
export const CURRENCY = 'USD';

// ---------- Номер товара ----------

const base = (slug: string) => slug.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Номера, закреплённые вручную, — для позиций, у которых slug без дефисов
 * совпал с чужим. В каталоге есть hongqi-e-qm5 и hongqi-eqm5 (две
 * комплектации одной модели): без дефисов оба дают hongqieqm5.
 *
 * Закрепление вручную, а не автоматический хвост: автоматика при появлении
 * нового совпадения поменяла бы номер у машины, которая уже в рекламе, и
 * накопленные аудитории ремаркетинга молча потерялись бы.
 */
const ID_OVERRIDES: Readonly<Record<string, string>> = {
  'hongqi-e-qm5': 'hongqieqm5v2',
};

/**
 * Номер товара. В пользовательском фиде Google Ads ID — только буквы и цифры,
 * поэтому дефисы из slug убираются: geely-coolray → geelycoolray. Номер
 * зависит только от slug (и закрепления выше), а не от остального каталога.
 */
export const feedId = (car: Car): string => ID_OVERRIDES[car.slug] ?? base(car.slug);

// Совпадение номеров роняет сборку сразу, на любой странице: два товара с
// одним номером Google склеил бы в один.
{
  const seen = new Map<string, string>();
  for (const car of cars) {
    const id = feedId(car);
    const other = seen.get(id);
    if (other) {
      throw new Error(
        `Номер товара ${id} у двух позиций — ${other} и ${car.slug}. ` +
          `Закрепите номер новой позиции в ID_OVERRIDES (src/lib/product.ts), старую не трогайте.`,
      );
    }
    seen.set(id, car.slug);
  }
}

// ---------- Цена для Google ----------

/**
 * В выгрузке Tilda у части позиций диапазон цены склеился в одно число:
 * «16 600–18 500» превратилось в 1 660 018 500. Такая цена в Google сломала бы
 * ценность конверсий и ставки, поэтому вне правдоподобных границ цена в фид
 * и события не идёт — позиция остаётся, но без цены, и попадает в список
 * на исправление (priceProblems).
 */
const PRICE_MIN = 1_000;
const PRICE_MAX = 1_000_000;

export const adsPrice = (car: Car): number | undefined =>
  car.priceUsd && car.priceUsd >= PRICE_MIN && car.priceUsd <= PRICE_MAX ? car.priceUsd : undefined;

export const priceProblems = (): Car[] => cars.filter((car) => car.priceUsd && !adsPrice(car));

/** Товар в формате событий GA4 и динамического ремаркетинга Google Ads. */
export interface AdsItem {
  item_id: string;
  /** то же, что item_id: Google Ads ищет товар в фиде по полю id */
  id: string;
  item_name: string;
  item_brand: string;
  /** тип силовой установки: Электромобиль, Гибрид, Бензин, Дизель */
  item_category: string;
  /** рынок, откуда привозим */
  item_category2: string;
  /** год или диапазон лет, как в каталоге */
  item_variant: string;
  price?: number;
  quantity: 1;
  google_business_vertical: 'custom';
}

export function productItem(car: Car): AdsItem {
  const id = feedId(car);
  return {
    item_id: id,
    id,
    item_name: car.title,
    item_brand: car.brand,
    item_category: powertrains[car.powertrain],
    item_category2: countries[car.country].label,
    item_variant: car.year,
    ...(adsPrice(car) ? { price: adsPrice(car) } : {}),
    quantity: 1,
    google_business_vertical: 'custom',
  };
}

// ---------- Товар страницы ----------

/**
 * Какой товар показывает страница — по её адресу. Адреса строятся теми же
 * правилами, что и сами страницы: основная карточка — carPath, версия Zeekr —
 * как в src/pages/zeekr/catalog/[slug].astro (там только машины из Китая).
 * Обе версии карточки дают один номер товара; страницы карточек не правятся.
 */
const BY_PATH: ReadonlyMap<string, Car> = new Map(
  cars.flatMap((car) => {
    const paths: [string, Car][] = [[carPath(car), car]];
    if (car.countries.includes('china')) {
      paths.push([`/zeekr/catalog/${slugify(car.brand)}-${modelSlug(car)}/`, car]);
    }
    return paths;
  }),
);

/**
 * Расширенные карточки по адресам старого сайта (evolutioncar.by/lixiangl9):
 * адрес сохранён ради позиций, а товар тот же, что в каталоге.
 */
const LEGACY_PATHS: Readonly<Record<string, string>> = {
  '/lixiangl9/': 'lixiang-l9',
};

export const productByPath = (path: string): Car | undefined => {
  const p = path.endsWith('/') ? path : `${path}/`;
  const legacy = LEGACY_PATHS[p];
  return legacy ? cars.find((c) => c.slug === legacy) : BY_PATH.get(p);
};

/** Данные товара для страницы: встраиваются в HTML, браузер читает их в analytics.ts. */
export function pageProductJson(car: Car): string {
  // «<» экранируется, чтобы название никогда не закрыло тег <script>
  return JSON.stringify({ currency: CURRENCY, item: productItem(car) }).replace(/</g, '\\u003c');
}

// ---------- Строка пользовательского фида ----------

/** Колонки в том виде, как их называет шаблон Google Ads «Custom». */
export const FEED_COLUMNS = [
  'ID',
  'Item title',
  'Item subtitle',
  'Item description',
  'Item category',
  'Price',
  'Formatted price',
  'Contextual keywords',
  'Final URL',
  'Image URL',
] as const;

export type FeedRow = Record<(typeof FEED_COLUMNS)[number], string>;

/** Ограничения Google: название, подзаголовок и описание — до 25 символов, цена текстом — до 20. */
const TITLE_MAX = 25;
const FORMATTED_PRICE_MAX = 20;

/** Первый вариант, который влезает в лимит; иначе — последний (самый
 *  короткий) вариант, обрезанный по словам. */
function fit(max: number, ...variants: string[]): string {
  const ok = variants.find((v) => v.length <= max);
  if (ok) return ok;
  const last = variants[variants.length - 1];
  let out = '';
  for (const word of last.split(' ')) {
    const next = out ? `${out} ${word}` : word;
    if (next.length > max) break;
    out = next;
  }
  // одно слово длиннее лимита резать всё равно приходится
  return out || last.slice(0, max);
}

export function feedRow(car: Car): FeedRow {
  const powertrain = powertrains[car.powertrain];
  const country = countries[car.country];
  const availability = availabilities[car.availability].toLowerCase();
  const model = car.title.startsWith(`${car.brand} `) ? car.title.slice(car.brand.length + 1) : car.title;
  const price = adsPrice(car);

  return {
    ID: feedId(car),
    // не влезает — сначала убираем пояснение в скобках, а не режем его посередине
    'Item title': fit(TITLE_MAX, car.title, car.title.replace(/\s*\([^)]*\)/g, '').trim()),
    'Item subtitle': fit(TITLE_MAX, `${car.year} · ${availability}`, availabilities[car.availability], car.year),
    'Item description': fit(TITLE_MAX, `${powertrain} · ${country.genitive}`, powertrain),
    'Item category': powertrain,
    Price: price ? `${price.toFixed(2)} ${CURRENCY}` : '',
    'Formatted price': price ? fit(FORMATTED_PRICE_MAX, `от ${formatUsd(price)}`, formatUsd(price)) : '',
    'Contextual keywords': [car.brand, model, `${car.title} купить`, `авто ${country.genitive}`].join(';'),
    'Final URL': abs(carPath(car)),
    'Image URL': abs(car.photo),
  };
}
