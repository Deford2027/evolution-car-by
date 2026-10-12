// Конфигуратор Lixiang L9: цвета кузова и комплектации.
//
// Фото и образцы цветов – официальные изображения Li Auto со страницы
// lixiang.com/l9 (блок «每一种颜色，都高级»: 11 цветов, из них 4
// двухцветных – только для версии Livis). Названия переведены с китайского.
// Комплектации и цены – из нашей карточки L9 (lixiang-l9.ts), чтобы цифры
// на двух страницах не разошлись.
import { lixiangL9 } from './lixiang-l9';

export interface PaintColor {
  id: string;
  name: string;
  /** Подпись под названием: тип покраски или ограничение */
  note: string;
  group: 'paint' | 'livis';
}

const dir = '/img/lixiang-l9/colors';
export const colorImage = (id: string) => ({
  desktop: `${dir}/${id}.webp`,
  mobile: `${dir}/${id}-m.webp`,
  swatch: `${dir}/${id}-swatch.webp`,
});

export const paintColors: PaintColor[] = [
  { id: 'pearl-white', name: 'Жемчужно-белый', note: 'металлик', group: 'paint' },
  { id: 'polar-grey', name: 'Полярный серый', note: 'холодный блеск', group: 'paint' },
  { id: 'diamond-black', name: 'Бриллиантовый чёрный', note: 'металлик', group: 'paint' },
  { id: 'titanium-gold', name: 'Титановое золото', note: 'металлик', group: 'paint' },
  { id: 'emerald', name: 'Изумрудный', note: 'перламутр, особая серия', group: 'paint' },
  { id: 'truffle-gold', name: 'Трюфельное золото', note: 'перламутр, особая серия', group: 'paint' },
  { id: 'night-purple', name: 'Ночной фиолетовый', note: 'перламутр, особая серия', group: 'paint' },
  { id: 'livis-brown', name: 'Коричневый с золотом', note: 'двухцветный, только Livis', group: 'livis' },
  { id: 'livis-black', name: 'Чёрный с золотом', note: 'двухцветный, только Livis', group: 'livis' },
  { id: 'livis-green', name: 'Зелёный с золотом', note: 'двухцветный, только Livis', group: 'livis' },
  { id: 'livis-purple', name: 'Фиолетовый с золотом', note: 'двухцветный, только Livis', group: 'livis' },
];

export interface ConfigTrim {
  id: string;
  name: string;
  years: string;
  /** Цена под ключ, $; null – цену подтверждает менеджер под конкретный лот */
  priceUsd: number | null;
  rows: { label: string; value: string }[];
}

// Строки сравнения берём из таблицы комплектаций карточки L9 по индексу
// колонки: 0 – Pro, 1 – Max, 2 – Ultra.
const rowsFor = (col: 0 | 1 | 2) =>
  lixiangL9.trims
    .filter((r) => ['Батарея', 'Запас хода на электричестве', 'Общий запас хода', 'Лидар'].includes(r.label))
    .map((r) => ({ label: r.label, value: r.values[col] }));

export const configTrims: ConfigTrim[] = [
  { id: 'pro', name: 'L9 Pro', years: '2023–2024', priceUsd: null, rows: rowsFor(0) },
  { id: 'max', name: 'L9 Max', years: '2023–2024', priceUsd: null, rows: rowsFor(1) },
  { id: 'ultra', name: 'L9 Ultra', years: '2025', priceUsd: 65000, rows: rowsFor(2) },
];

export const l9Config = {
  path: '/catalog/lixiang/l9/konfigurator/',
  seoTitle: 'Конфигуратор Lixiang L9 (Li Auto L9): цвета и комплектации | Evolution Car',
  seoDescription:
    'Соберите свой Lixiang L9: 11 цветов кузова, включая двухцветные Livis, комплектации Pro, Max и Ultra. ' +
    'Цена под ключ в Минске и расчёт под вашу конфигурацию.',
  h1: 'Конфигуратор Lixiang L9',
  lead: 'Выберите цвет и комплектацию – менеджер подберёт лот под вашу конфигурацию и пришлёт расчёт под ключ.',
  colorsTitle: 'Цвет кузова',
  paintGroup: 'Цвета',
  livisGroup: 'Двухцветные Livis',
  trimTitle: 'Комплектация',
  summaryTitle: 'Ваш Lixiang L9',
  priceFrom: 'от',
  priceOnRequest: 'Цену под конкретный лот подтвердит менеджер',
  bynRate: 3,
  livisNote: 'цвет только для версии Livis – уточнить у менеджера',
  formTitle: 'Получить расчёт с этой конфигурацией',
  photoNote:
    'Фото – официальные изображения Li Auto. Оттенок, доступность цвета и комплектацию конкретного ' +
    'автомобиля менеджер подтвердит до договора.',
  cardLink: { label: 'Характеристики Lixiang L9', href: lixiangL9.path },
};
