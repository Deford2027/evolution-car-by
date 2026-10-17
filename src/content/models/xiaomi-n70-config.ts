// Конфигуратор Xiaomi N70 (серия Kunlun, 2026): цвета, диски и салон.
//
// Источник – официальный конфигуратор заказа Xiaomi EV (снято 17.10.2026):
// • xiaomiev.com/configurator/select-version?goodsId=900020768 – версия и цена;
// • API конфигуратора (car-configurator/get и materialV2) – варианты с доплатами
//   и слои сцены; кадр собран из тех же слоёв, что рисует сам конфигуратор.
// Это гибрид с генератором (увеличенный запас хода), а не чистый электромобиль.

export type TrimId = 'base';
export type Avail = Record<TrimId, number | null>;
export interface Option { id: string; name: string; note?: string; avail: Avail }
export interface ConfigTrim { id: TrimId; name: string; priceCny: number; rows: { label: string; value: string }[] }

const free: Avail = { base: 0 };
const paid = (v: number): Avail => ({ base: v });
const opt = (dir: string, id: string) => `/img/xiaomi-n70/${dir}/${id}.webp`;

export const configTrims: ConfigTrim[] = [
  {
    id: 'base',
    name: 'N70',
    priceCny: 209900,
    rows: [
      { label: 'Запас хода', value: '1351 км (CLTC), гибрид с генератором' },
      { label: 'Салон', value: '5 мест, схема 2+3, пространство второго ряда 1410 мм' },
      { label: 'Привод', value: 'Один мотор, передний; двойные поперечные рычаги спереди' },
    ],
  },
];

export const commonSpecs = [
  { label: 'Отделка', value: 'Кожа Nappa' },
  { label: 'Подвеска', value: 'Многорычажная сзади' },
  { label: 'Ассистенты', value: 'Xiaomi HAD' },
];

const render = (name: string) => `/img/xiaomi-n70/render/${name}.webp`;

export const shots = [
  { id: 'side', label: 'Сбоку', kind: 'exterior' },
  { id: 'front', label: 'Спереди', kind: 'exterior' },
  { id: 'rear', label: 'Сзади', kind: 'exterior' },
  { id: 'dash', label: 'Салон', kind: 'interior' },
  { id: 'rear-seats', label: 'Второй ряд', kind: 'interior' },
] as const;

export const renderPaths = {
  exterior: render('{paint}--{wheel}--{shot}'),
  interior: render('{interior}--{shot}'),
};

export const paints: (Option & { swatch: string })[] = [
  ['butterfly-blue', 'Синий «долина бабочек»', 'без доплаты', free],
  ['mountain-teal', 'Бирюза дальних гор', 'без доплаты', free],
  ['volcanic-grey', 'Вулканический пепел', 'без доплаты', free],
  ['cold-khaki', 'Холодный хаки', 'металлик', paid(7000)],
  ['obsidian-black', 'Обсидиановый чёрный', 'металлик', paid(7000)],
  ['pearl-white', 'Жемчужно-белый', 'перламутр', paid(7000)],
].map(([id, name, note, avail]) => ({
  id: id as string, name: name as string, note: note as string,
  avail: avail as Avail, swatch: opt('options', `paint-${id}`),
}));

export const wheels: (Option & { image: string })[] = [
  { id: '19-blade', name: '19″ «Лопасти»', note: 'шины для дальних поездок', avail: free },
  { id: '21-star', name: '21″ «Звёздный луч»', note: 'тихие шины Bridgestone', avail: paid(12000) },
  { id: '21-star-black', name: '21″ «Звёздный луч», чёрные', note: 'тихие шины Bridgestone', avail: paid(14000) },
  { id: '21-ray', name: '21″ «Лучи» с парящим шильдиком', note: 'тихие шины Bridgestone', avail: paid(14000) },
].map((w) => ({ ...w, image: opt('options', `wheel-${w.id}`) }));

export const interiors: (Option & { swatch: string })[] = [
  { id: 'sand-beige', name: 'Песочно-бежевый', avail: free },
  { id: 'mocha-brown', name: 'Мокко', avail: free },
  { id: 'midnight-black', name: 'Ночной чёрный', avail: free },
].map((t) => ({ ...t, swatch: opt('options', `trim-${t.id}`) }));

export const n70Config = {
  path: '/catalog/xiaomi/n70/konfigurator/',
  seoTitle: 'Конфигуратор Xiaomi N70 2026: цвета, диски, салон | Evolution Car',
  seoDescription:
    'Соберите Xiaomi N70 2026: шесть цветов кузова, диски 19″ и 21″, три варианта салона из кожи Nappa. ' +
    'Запас хода 1351 км. Цены Xiaomi в Китае и расчёт под ключ в Минске.',
  h1: 'Конфигуратор Xiaomi N70',
  lead: 'Выберите цвет, диски и салон – менеджер подберёт автомобиль под вашу конфигурацию и пришлёт расчёт под ключ.',
  cardLink: { label: 'Все Xiaomi в наличии и под заказ', href: '/catalog/xiaomi/' },
  ui: {
    trimTitle: 'Версия', paintTitle: 'Цвет кузова', wheelTitle: 'Диски', interiorTitle: 'Цвет салона',
    commonTitle: 'В любой сборке', summaryTitle: 'Ваш Xiaomi N70',
    chinaPrice: 'Цена Xiaomi в Китае',
    turnkey: 'Под ключ в Минске – рассчитаем под вашу конфигурацию',
    included: 'входит', unavailable: 'нет в этой версии',
    switched: 'Этот вариант есть только у версии',
    formTitle: 'Получить расчёт под ключ',
    prev: 'Предыдущий кадр', next: 'Следующий кадр',
    stageLabel: 'Xiaomi N70', viewLabel: 'Вид',
    altPaint: 'Xiaomi N70, цвет', altInterior: 'Салон Xiaomi N70',
    wheelsWord: 'диски', interiorWord: 'салон',
    leadSource: 'Конфигуратор Xiaomi N70',
    photoNote:
      'Изображения собраны из официальных слоёв конфигуратора Xiaomi для выбранной сборки. ' +
      'Цены – розничные цены Xiaomi в Китае на 17.10.2026; показан набор вариантов базовой версии, ' +
      'у старших он шире. Комплектацию конкретного автомобиля менеджер подтвердит до договора.',
  },
};
