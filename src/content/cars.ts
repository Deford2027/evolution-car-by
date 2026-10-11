// Каталог: 107 позиций выгружены из Tilda Store (store-27278716-202610100909.csv).
// Данные лежат в cars.json, здесь — типы, справочники и выборки.
import data from './cars.json';

export type Country = 'china' | 'korea' | 'europe' | 'usa';
export type Powertrain = 'ev' | 'hybrid' | 'petrol' | 'diesel';
export type Availability = 'in-stock' | 'on-order';

export interface SpecRow {
  label: string;
  value: string;
}

export interface Car {
  slug: string;
  brand: string;
  title: string;
  country: Country;
  categories: string[];
  availability: Availability;
  powertrain: Powertrain;
  /** в выгрузке это диапазон: «2022-2024» или «2024» */
  year: string;
  priceUsd: number | null;
  priceByn: number | null;
  photo: string;
  description: string;
  /** оговорка продавца об ориентировочной цене, есть не у всех позиций */
  note: string;
  specs: SpecRow[];
}

export const cars = data as Car[];

export const countries: Record<Country, { label: string; genitive: string; slug: string }> = {
  china: { label: 'Китай', genitive: 'из Китая', slug: 'iz-kitaya' },
  korea: { label: 'Южная Корея', genitive: 'из Кореи', slug: 'iz-korei' },
  europe: { label: 'Европа', genitive: 'из Европы', slug: 'iz-evropy' },
  usa: { label: 'США', genitive: 'из США', slug: 'iz-ssha' },
};

export const powertrains: Record<Powertrain, string> = {
  ev: 'Электромобиль',
  hybrid: 'Гибрид',
  petrol: 'Бензин',
  diesel: 'Дизель',
};

export const availabilities: Record<Availability, string> = {
  'in-stock': 'В наличии',
  'on-order': 'Под заказ',
};

export interface CatalogSection {
  slug: string;
  title: string;
  h1: string;
  lead: string;
  match: (car: Car) => boolean;
}

/** Признак автомобиля с пробегом — заполненная характеристика «Пробег». */
export const isUsed = (car: Car) => car.specs.some((sp) => sp.label === 'Пробег' && sp.value);

/** Свежие китайские модели: год содержит 2026 (в выгрузке бывает «2025/ 2026»). */
export const isFreshChina = (car: Car) => car.country === 'china' && car.year.includes('2026');

export const sections: CatalogSection[] = [
  {
    slug: 'v-nalichii',
    title: 'В наличии',
    h1: 'Автомобили в наличии',
    lead: 'Машины, которые уже у нас или в пути: сроки передачи короче, чем у поставки под заказ, а цена зафиксирована.',
    match: (car) => car.availability === 'in-stock',
  },
  {
    slug: 'pod-zakaz',
    title: 'Под заказ',
    h1: 'Автомобили из Китая 2026 года под заказ',
    lead: 'Свежие модели китайского рынка: заказываем под ваш запрос — комплектация, цвет и срок согласуются до договора.',
    match: isFreshChina,
  },
  {
    slug: 's-probegom',
    title: 'С пробегом',
    h1: 'Автомобили с пробегом под заказ',
    lead: 'Проверенные автомобили с подтверждённым пробегом и историей обслуживания. Перед выкупом присылаем отчёт и фото с площадки.',
    match: isUsed,
  },
  {
    slug: 'elektromobili',
    title: 'Электромобили',
    h1: 'Электромобили под заказ',
    lead: 'Полностью электрические модели: запас хода, ёмкость батареи и мощность указаны в карточке каждой позиции.',
    match: (car) => car.powertrain === 'ev',
  },
  {
    slug: 'gibridy',
    title: 'Гибриды',
    h1: 'Гибридные автомобили под заказ',
    lead: 'Гибриды и модели с увеличенным запасом хода: подходят там, где зарядной инфраструктуры пока мало.',
    match: (car) => car.powertrain === 'hybrid',
  },
  {
    slug: 'iz-kitaya',
    title: 'Из Китая',
    h1: 'Автомобили из Китая под заказ',
    lead: 'Электромобили, гибриды и модели с двигателями внутреннего сгорания с китайского рынка.',
    match: (car) => car.country === 'china',
  },
  {
    slug: 'iz-korei',
    title: 'Из Кореи',
    h1: 'Автомобили из Южной Кореи под заказ',
    lead: 'Новые автомобили и автомобили с пробегом массового и премиального сегментов корейского рынка.',
    match: (car) => car.country === 'korea',
  },
  {
    slug: 'iz-evropy',
    title: 'Из Европы',
    h1: 'Автомобили из Европы под заказ',
    lead: 'Европейские автомобили с бензиновыми, дизельными и гибридными силовыми установками.',
    match: (car) => car.country === 'europe',
  },
  {
    slug: 'iz-ssha',
    title: 'Из США',
    h1: 'Автомобили из США под заказ',
    lead: 'Электромобили, автомобили с пробегом, премиальные и редкие модели с американского рынка.',
    match: (car) => car.country === 'usa',
  },
];

export const getSection = (slug: string) => sections.find((s) => s.slug === slug);
export const carsOf = (section: CatalogSection) => cars.filter(section.match);
export const getCar = (slug: string) => cars.find((c) => c.slug === slug);

export const formatUsd = (usd: number) => `${usd.toLocaleString('ru-RU')} $`;
export const formatByn = (byn: number) => `${byn.toLocaleString('ru-RU')} BYN`;

/** Три коротких параметра для превью в карточке списка. */
export function highlights(car: Car): string[] {
  const wanted = ['Мощность', 'Привод', 'Запас хода', 'Батарея', 'Коробка передач', 'Объём двигателя', 'Пробег'];
  return wanted
    .map((label) => car.specs.find((s) => s.label === label)?.value)
    .filter((v): v is string => Boolean(v))
    .slice(0, 3);
}

/** Характеристики, разложенные по смысловым группам для страницы товара. */
export function specGroups(car: Car): { group: string; rows: SpecRow[] }[] {
  const map: Record<string, string[]> = {
    'Автомобиль': ['Год выпуска', 'Год', 'Состояние', 'Пробег', 'Класс', 'Кузов', 'Комплектация'],
    'Силовая установка': ['Тип двигателя', 'Тип топлива', 'Объём двигателя', 'Мощность', 'Батарея', 'Запас хода'],
    'Трансмиссия и прочее': ['Коробка передач', 'Привод', 'Тип привода', 'Кому подходит', 'Данные Encar'],
  };

  return Object.entries(map)
    .map(([group, labels]) => ({
      group,
      rows: labels
        .map((label) => car.specs.find((s) => s.label === label))
        .filter((r): r is SpecRow => Boolean(r)),
    }))
    .filter((g) => g.rows.length > 0);
}

const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'i',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
  х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

export function slugify(text: string): string {
  const out = [...text.toLowerCase().replace(/&/g, '-')].map((c) => TRANSLIT[c] ?? c).join('');
  return out.replace(/[^a-z0-9]+/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '');
}

/** Модельная часть адреса: slug позиции без префикса марки. */
export function modelSlug(car: Car): string {
  const b = slugify(car.brand);
  return car.slug.startsWith(`${b}-`) ? car.slug.slice(b.length + 1) : car.slug;
}

/** Канонический адрес карточки: /catalog/<марка>/<модель>/ */
export const carPath = (car: Car) => `/catalog/${slugify(car.brand)}/${modelSlug(car)}/`;

/** Адрес страницы марки: /catalog/<марка>/ */
export const brandPath = (brand: string) => `/catalog/${slugify(brand)}/`;
