// Конфигуратор нового Lixiang L8 (2026): версии, цвета, диски и салон.
//
// Источник – официальный конфигуратор заказа Li Auto (снято 17.10.2026):
// • lixiang.com/mall/buy-new/model.html?seriesId=100618542440964162 – две версии
//   и их розничные цены в Китае;
// • lixiang.com/mall/buy-new/config.html – доплаты за каждый вариант и
//   официальные студийные рендеры: кузов в трёх ракурсах для каждой пары
//   «цвет × диски» и салон в двух ракурсах для каждого варианта отделки.
// У Ultra и Livis кузов и салон рендерятся по-разному (у Livis свой обвес и
// отделка), поэтому в пути к рендеру входит версия.
// Названия переведены с китайского. Цены здесь – китайские розничные без
// акционных скидок; цену под ключ в Минске считает менеджер.

import type { TrimId, Avail, Option, ConfigTrim } from './lixiang-l9-config';

const both: Avail = { ultra: 0, livis: 0 };
const opt = (dir: string, id: string) => `/img/lixiang-l8/${dir}/${id}.webp`;

export const configTrims: ConfigTrim[] = [
  {
    id: 'ultra',
    name: 'L8 Ultra',
    priceCny: 369800,
    rows: [
      { label: 'Подвеска', value: 'Пневматическая «Magic Carpet» 3-го поколения, двухкамерная' },
      { label: 'Тормоза', value: 'Электрогидравлические (EHB)' },
      { label: 'Второй ряд', value: 'Два кресла «нулевой гравитации» в одном ряду' },
    ],
  },
  {
    id: 'livis',
    name: 'L8 Livis',
    priceCny: 429800,
    rows: [
      { label: 'Подвеска', value: 'Активная, полностью по проводам, 800 В' },
      { label: 'Тормоза', value: 'Электромеханические (EMB)' },
      { label: 'Ассистенты', value: '2560 TOPS, пакет «Mach» с лидарами' },
    ],
  },
];

/** Одинаково у обеих версий */
export const commonSpecs = [
  { label: 'Батарея', value: '72,7 кВт·ч, 5C: 10–80% за 10 минут' },
  { label: 'Запас хода', value: '430 км на электричестве, 1670 км общий (CLTC)' },
  { label: 'Рулевое', value: 'По проводам + поворот задних колёс' },
  { label: 'Звук', value: 'Аудиосистема 4720 Вт' },
];

const render = (name: string) => `/img/lixiang-l8/render/${name}.webp`;

/** Кадры сцены: три ракурса кузова и два салона – рендеры зависят от выбора */
export const shots = [
  { id: 'side', label: 'Сбоку', kind: 'exterior' },
  { id: 'front', label: 'Спереди', kind: 'exterior' },
  { id: 'rear', label: 'Сзади', kind: 'exterior' },
  { id: 'dash', label: 'Салон', kind: 'interior' },
  { id: 'rear-seats', label: 'Второй ряд', kind: 'interior' },
] as const;

/** Шаблон пути к рендеру; {trim} {paint} {wheel} {interior} {shot} подставляет остров */
export const renderPaths = {
  exterior: render('{trim}--{paint}--{wheel}--{shot}'),
  interior: render('{trim}--{interior}--{shot}'),
};

export const paints: (Option & { swatch: string })[] = [
  ['gt-silver', 'GT-серебро', 'металлик', both],
  ['diamond-black', 'Бриллиантовый чёрный', 'металлик', both],
  ['pearl-white', 'Жемчужно-белый', 'металлик', both],
  ['glacier-grey', 'Ледниковый серый', 'холодный блеск', both],
  ['emerald', 'Изумрудный', 'перламутр, особая серия', { ultra: 10000, livis: 10000 }],
  ['truffle-gold', 'Трюфельное золото', 'перламутр, особая серия', { ultra: 10000, livis: 10000 }],
  ['livis-brown', 'Коричневый с золотом', 'двухцветный кузов Livis', { ultra: null, livis: 20000 }],
  ['livis-black', 'Чёрный с золотом', 'двухцветный кузов Livis', { ultra: null, livis: 20000 }],
  ['livis-green', 'Зелёный с золотом', 'двухцветный кузов Livis', { ultra: null, livis: 20000 }],
  ['livis-purple', 'Фиолетовый с золотом', 'двухцветный кузов Livis', { ultra: null, livis: 20000 }],
].map(([id, name, note, avail]) => ({
  id: id as string,
  name: name as string,
  note: note as string,
  avail: avail as Avail,
  swatch: opt('options', `paint-${id}`),
}));

export const wheels: (Option & { image: string })[] = [
  { id: '21-black', name: '21″ чёрные', note: 'пять сдвоенных спиц', avail: both },
  { id: '21-silver', name: '21″ серебристые', note: 'пять сдвоенных спиц', avail: both },
  { id: '22-black', name: '22″ чёрные', note: 'семь спиц, только Ultra', avail: { ultra: 10000, livis: null } },
  { id: '22-silver', name: '22″ серебристые', note: 'семь спиц, только Ultra', avail: { ultra: 10000, livis: null } },
  { id: '22-grey', name: '22″ «кристальный графит»', note: 'только Livis', avail: { ultra: null, livis: 10000 } },
].map((w) => ({ ...w, image: opt('options', `wheel-${w.id}`) }));

export const interiors: (Option & { swatch: string })[] = [
  { id: 'green-white', name: 'Зелёный с белым', avail: both },
  { id: 'brown-coffee', name: 'Коричневый с кофейным', avail: both },
  { id: 'grey-purple', name: 'Серый с фиолетовым', avail: both },
  { id: 'brown-white', name: 'Коричневый с белым', avail: both },
].map((t) => ({ ...t, swatch: opt('options', `trim-${t.id}`) }));

export const l8Config = {
  path: '/catalog/lixiang/l8/konfigurator/',
  seoTitle: 'Конфигуратор нового Lixiang L8 2026: цвета, диски, салон | Evolution Car',
  seoDescription:
    'Соберите новый Lixiang L8 2026: версии Ultra и Livis, 10 цветов кузова, диски 21″ и 22″, четыре варианта салона. ' +
    'Цены Li Auto в Китае и расчёт под ключ в Минске.',
  h1: 'Конфигуратор нового Lixiang L8',
  lead: 'Выберите версию, цвет, диски и салон – менеджер подберёт автомобиль под вашу конфигурацию и пришлёт расчёт под ключ.',
  cardLink: { label: 'Характеристики Lixiang L8', href: '/catalog/lixiang/l8/' },
  ui: {
    trimTitle: 'Версия',
    paintTitle: 'Цвет кузова',
    wheelTitle: 'Диски',
    interiorTitle: 'Цвет салона',
    commonTitle: 'У обеих версий',
    summaryTitle: 'Ваш новый Lixiang L8',
    chinaPrice: 'Цена Li Auto в Китае',
    turnkey: 'Под ключ в Минске – рассчитаем под вашу конфигурацию',
    included: 'входит',
    unavailable: 'не для этой версии',
    switched: 'Этот вариант есть только у версии',
    formTitle: 'Получить расчёт под ключ',
    prev: 'Предыдущий кадр',
    stageLabel: 'Новый Lixiang L8',
    viewLabel: 'Вид',
    altPaint: 'Lixiang L8, цвет',
    altInterior: 'Салон Lixiang L8',
    wheelsWord: 'диски',
    interiorWord: 'салон',
    leadSource: 'Конфигуратор нового L8',
    next: 'Следующий кадр',
    photoNote:
      'Изображения – официальные рендеры Li Auto для выбранной сборки. ' +
      'Цены – розничные цены Li Auto в Китае на 17.10.2026; доступность вариантов у конкретного автомобиля ' +
      'менеджер подтвердит до договора.',
  },
};
