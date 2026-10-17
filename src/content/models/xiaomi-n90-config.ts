// Конфигуратор Xiaomi N90 (серия Kunlun, 2026): цвета, диски и салон.
//
// Источник – официальный конфигуратор заказа Xiaomi EV (снято 17.10.2026):
// • xiaomiev.com/configurator/select-version?goodsId=900020450 – версия и цена;
// • API конфигуратора (car-configurator/get и materialV2) – варианты с доплатами
//   и слои сцены; кадр собран из тех же слоёв, что рисует сам конфигуратор.
// Это гибрид с генератором (увеличенный запас хода), а не чистый электромобиль.

export type TrimId = 'base';
export type Avail = Record<TrimId, number | null>;
export interface Option { id: string; name: string; note?: string; avail: Avail }
export interface ConfigTrim { id: TrimId; name: string; priceCny: number; rows: { label: string; value: string }[] }

const free: Avail = { base: 0 };
const paid = (v: number): Avail => ({ base: v });
const opt = (dir: string, id: string) => `/img/xiaomi-n90/${dir}/${id}.webp`;

export const configTrims: ConfigTrim[] = [
  {
    id: 'base',
    name: 'N90',
    priceCny: 269900,
    rows: [
      { label: 'Запас хода', value: '1705 км (CLTC), гибрид с генератором' },
      { label: 'Салон', value: '7 мест, схема 2+2+3, пространство второго ряда 1550 мм' },
      { label: 'Привод', value: 'Два мотора, полный; пневмоподвеска' },
    ],
  },
];

export const commonSpecs = [
  { label: 'Отделка', value: 'Кожа Nappa' },
  { label: 'Подвеска', value: 'Пневматическая, с адаптивными амортизаторами' },
  { label: 'Ассистенты', value: 'Xiaomi HAD' },
];

const render = (name: string) => `/img/xiaomi-n90/render/${name}.webp`;

export const shots = [
  { id: 'side', label: 'Сбоку', kind: 'exterior' },
  { id: 'front', label: 'Спереди', kind: 'exterior' },
  { id: 'rear', label: 'Сзади', kind: 'exterior' },
  { id: 'dash', label: 'Передние кресла', kind: 'interior' },
  { id: 'rear-seats', label: 'Второй ряд', kind: 'interior' },
] as const;

export const renderPaths = {
  exterior: render('{paint}--{wheel}--{shot}'),
  interior: render('{interior}--{shot}'),
};

export const paints: (Option & { swatch: string })[] = [
  ['mountain-teal', 'Бирюза дальних гор', 'без доплаты', free],
  ['volcanic-grey', 'Вулканический пепел', 'без доплаты', free],
  ['wine-red', 'Винно-красный', 'металлик', paid(7000)],
  ['cold-khaki', 'Холодный хаки', 'металлик', paid(7000)],
  ['pearl-white', 'Жемчужно-белый', 'перламутр', paid(7000)],
  ['obsidian-black', 'Обсидиановый чёрный', 'металлик', paid(7000)],
].map(([id, name, note, avail]) => ({
  id: id as string, name: name as string, note: note as string,
  avail: avail as Avail, swatch: opt('options', `paint-${id}`),
}));

export const wheels: (Option & { image: string })[] = [
  { id: '21-prism', name: '21″ «Призма»', note: 'тихие шины Bridgestone', avail: free },
  { id: '21-star', name: '21″ «Звёздный луч»', note: 'тихие шины Bridgestone', avail: paid(12000) },
  { id: '21-star-black', name: '21″ «Звёздный луч», чёрные', note: 'тихие шины Bridgestone', avail: paid(14000) },
  { id: '21-ray', name: '21″ «Лучи» с парящим шильдиком', note: 'тихие шины Bridgestone', avail: paid(14000) },
].map((w) => ({ ...w, image: opt('options', `wheel-${w.id}`) }));

export const interiors: (Option & { swatch: string })[] = [
  { id: 'sand-beige', name: 'Песочно-бежевый', avail: free },
  { id: 'mocha-brown', name: 'Мокко', avail: free },
  { id: 'midnight-black', name: 'Ночной чёрный', avail: free },
].map((t) => ({ ...t, swatch: opt('options', `trim-${t.id}`) }));

export const n90Config = {
  path: '/catalog/xiaomi/n90/konfigurator/',
  seoTitle: 'Конфигуратор Xiaomi N90 2026: цвета, диски, салон | Evolution Car',
  seoDescription:
    'Соберите семиместный Xiaomi N90 2026: шесть цветов кузова, четыре варианта 21-дюймовых дисков, ' +
    'три салона из кожи Nappa. Запас хода 1705 км. Цены Xiaomi в Китае и расчёт под ключ в Минске.',
  h1: 'Конфигуратор Xiaomi N90',
  lead: 'Выберите цвет, диски и салон – менеджер подберёт автомобиль под вашу конфигурацию и пришлёт расчёт под ключ.',
  cardLink: { label: 'Все Xiaomi в наличии и под заказ', href: '/catalog/xiaomi/' },
  ui: {
    trimTitle: 'Версия', paintTitle: 'Цвет кузова', wheelTitle: 'Диски', interiorTitle: 'Цвет салона',
    commonTitle: 'В любой сборке', summaryTitle: 'Ваш Xiaomi N90',
    chinaPrice: 'Цена Xiaomi в Китае',
    turnkey: 'Под ключ в Минске – рассчитаем под вашу конфигурацию',
    included: 'входит', unavailable: 'нет в этой версии',
    switched: 'Этот вариант есть только у версии',
    formTitle: 'Получить расчёт под ключ',
    prev: 'Предыдущий кадр', next: 'Следующий кадр',
    stageLabel: 'Xiaomi N90', viewLabel: 'Вид',
    altPaint: 'Xiaomi N90, цвет', altInterior: 'Салон Xiaomi N90',
    wheelsWord: 'диски', interiorWord: 'салон',
    leadSource: 'Конфигуратор Xiaomi N90',
    photoNote:
      'Изображения собраны из официальных слоёв конфигуратора Xiaomi для выбранной сборки. ' +
      'Цены – розничные цены Xiaomi в Китае на 17.10.2026; показан набор вариантов базовой версии, ' +
      'у старших он шире. Комплектацию конкретного автомобиля менеджер подтвердит до договора.',
  },
};
