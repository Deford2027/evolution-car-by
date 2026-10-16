// Конфигуратор нового Lixiang L6 (新一代理想L6).
//
// Источник – официальный конфигуратор заказа Li Auto (снято 17.10.2026):
// • mall/buy-new/model.html?seriesId=100167931652606784 – версия, цена, срок;
// • mall/buy-new/config.html – студийные рендеры каждой сборки: кузов
//   в трёх ракурсах для каждой пары «цвет × диски» (12 пар) и салон
//   в двух ракурсах для каждой отделки (3).
// Данные переиспользуют интерфейс конфигуратора L9: у L6 одна версия,
// поэтому доступность вариантов везде одинаковая.
import type { TrimId } from './lixiang-l9-config';

type Avail = Record<TrimId, number | null>;
interface Option { id: string; name: string; note?: string; avail: Avail }

/** У L6 одна версия – вариант доступен всегда и без доплаты */
const any: Avail = { ultra: 0, livis: null };

const opt = (id: string) => `/img/lixiang-l6/options/${id}.webp`;
const render = (name: string) => `/img/lixiang-l6/render/${name}.webp`;

export const configTrims = [
  {
    id: 'ultra' as TrimId,
    name: 'Новый L6 Ultra',
    priceCny: 249800,
    rows: [
      { label: 'Силовая установка', value: 'EREV, два мотора, полный привод' },
      { label: 'Ассистенты', value: 'Mach VLA, чип Snapdragon 8797' },
      { label: 'Экран', value: '29″ панорамный, 6K' },
    ],
  },
];

export const commonSpecs = [
  { label: 'Батарея', value: '51 кВт·ч, зарядка 20–80% за 12 минут' },
  { label: 'Запас хода', value: '300 км на электричестве (CLTC)' },
  { label: 'Салон', value: 'Кресла нулевой гравитации спереди, задний ряд с наклоном 140°' },
  { label: 'Срок в Китае', value: '3–5 недель с момента заказа' },
];

export const paints = [
  { id: 'pearl-white', name: 'Жемчужно-белый', note: 'металлик', avail: any },
  { id: 'meteor-grey', name: 'Метеоритно-серый', note: 'металлик', avail: any },
  { id: 'obsidian-black', name: 'Обсидиановый чёрный', note: 'металлик', avail: any },
].map((o) => ({ ...o, swatch: opt(`paint-${o.id}`) }));

export const wheels = [
  { id: '20-silver', name: '20″ серебристые', note: 'пять спиц', avail: any },
  { id: '20-black', name: '20″ чёрные', note: 'пять спиц', avail: any },
  { id: '21-silver', name: '21″ серебристые', note: 'семь спиц', avail: any },
  { id: '21-black', name: '21″ чёрные', note: 'семь спиц', avail: any },
].map((o) => ({ ...o, image: opt(`wheel-${o.id}`) }));

export const interiors = [
  { id: 'snow-white', name: 'Снежно-белый', avail: any },
  { id: 'sand', name: 'Песочный', avail: any },
  { id: 'caramel', name: 'Карамельный', avail: any },
].map((o) => ({ ...o, swatch: opt(`trim-${o.id}`) }));

export const shots = [
  { id: 'side', label: 'Сбоку', kind: 'exterior' },
  { id: 'front', label: 'Спереди', kind: 'exterior' },
  { id: 'rear', label: 'Сзади', kind: 'exterior' },
  { id: 'dashboard', label: 'Место водителя', kind: 'interior' },
  { id: 'cabin', label: 'Салон', kind: 'interior' },
] as const;

/** Салон у L6 не зависит от версии, поэтому {trim} в пути не участвует */
export const renderPaths = {
  exterior: render('{paint}--{wheel}--{shot}'),
  interior: render('{interior}--{shot}'),
};

export const l6Config = {
  path: '/catalog/lixiang/l6/konfigurator/',
  h1: 'Конфигуратор нового Lixiang L6',
  lead:
    'Соберите машину как в салоне Li Auto: три цвета кузова, четыре варианта дисков ' +
    'и три отделки салона. Кадр меняется под выбранную сборку.',
  seoTitle: 'Конфигуратор нового Lixiang L6: цвета, диски, салон | Evolution Car',
  seoDescription:
    'Соберите новый Lixiang L6: три цвета кузова, четыре варианта дисков и три отделки салона. ' +
    'Официальные рендеры Li Auto, расчёт под ключ в Минске по запросу.',
  cardLink: { label: 'Характеристики Lixiang L6', href: '/catalog/lixiang/l6/' },
  ui: {
    trimTitle: 'Версия',
    paintTitle: 'Цвет кузова',
    wheelTitle: 'Диски',
    interiorTitle: 'Цвет салона',
    commonTitle: 'В любой сборке',
    summaryTitle: 'Ваш новый Lixiang L6',
    chinaPrice: 'Цена Li Auto в Китае',
    turnkey: 'Под ключ в Минске – рассчитаем под вашу конфигурацию',
    included: 'входит',
    unavailable: 'недоступно',
    switched: 'Этот вариант есть только у версии',
    formTitle: 'Получить расчёт под ключ',
    prev: 'Предыдущий кадр',
    next: 'Следующий кадр',
    stageLabel: 'Новый Lixiang L6',
    viewLabel: 'Вид',
    altPaint: 'Lixiang L6, цвет',
    altInterior: 'Салон Lixiang L6',
    wheelsWord: 'диски',
    interiorWord: 'салон',
    leadSource: 'Конфигуратор нового L6',
    photoNote:
      'Изображения – официальные рендеры Li Auto для выбранной сборки. ' +
      'Цена – розничная цена Li Auto в Китае на 17.10.2026; доступность вариантов ' +
      'у конкретного автомобиля менеджер подтвердит до договора.',
  },
};
