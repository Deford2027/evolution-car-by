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
  china: { label: 'Китай', genitive: 'из Китая', slug: 'from_china' },
  korea: { label: 'Южная Корея', genitive: 'из Кореи', slug: 'from_korea' },
  europe: { label: 'Европа', genitive: 'из Европы', slug: 'from_europe' },
  usa: { label: 'США', genitive: 'из США', slug: 'from_usa' },
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

/** Разделы повторяют структуру каталога на тильде. */
export const sections: CatalogSection[] = [
  {
    slug: 'in_stock',
    title: 'Автомобили в наличии',
    h1: 'Автомобили в наличии',
    lead: 'Машины, которые уже находятся у нас или в пути: сроки передачи короче, чем у поставки под заказ.',
    match: (car) => car.availability === 'in-stock',
  },
  {
    slug: 'made_to_order',
    title: 'Автомобили под заказ',
    h1: 'Автомобили под заказ',
    lead: 'Подбираем и выкупаем автомобиль на зарубежной площадке под ваш запрос: модель, комплектация, год и бюджет.',
    match: (car) => car.availability === 'on-order',
  },
  {
    slug: 'from_china',
    title: 'Автомобили из Китая',
    h1: 'Автомобили из Китая под заказ',
    lead: 'Электромобили, гибриды и модели с двигателями внутреннего сгорания с китайского рынка.',
    match: (car) => car.country === 'china',
  },
  {
    slug: 'from_korea',
    title: 'Автомобили из Кореи',
    h1: 'Автомобили из Южной Кореи под заказ',
    lead: 'Новые автомобили и автомобили с пробегом массового и премиального сегментов корейского рынка.',
    match: (car) => car.country === 'korea',
  },
  {
    slug: 'from_europe',
    title: 'Автомобили из Европы',
    h1: 'Автомобили из Европы под заказ',
    lead: 'Европейские автомобили с бензиновыми, дизельными и гибридными силовыми установками.',
    match: (car) => car.country === 'europe',
  },
  {
    slug: 'from_usa',
    title: 'Автомобили из США',
    h1: 'Автомобили из США под заказ',
    lead: 'Электромобили, автомобили с пробегом, премиальные и редкие модели с американского рынка.',
    match: (car) => car.country === 'usa',
  },
  {
    slug: 'electro_car',
    title: 'Электромобили',
    h1: 'Электромобили под заказ',
    lead: 'Полностью электрические модели: запас хода, батарея и мощность указаны в карточке каждой позиции.',
    match: (car) => car.powertrain === 'ev',
  },
  {
    slug: 'hybrid',
    title: 'Гибридные автомобили',
    h1: 'Гибридные автомобили под заказ',
    lead: 'Гибриды и модели с увеличенным запасом хода: подходят там, где зарядной инфраструктуры пока мало.',
    match: (car) => car.powertrain === 'hybrid',
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
