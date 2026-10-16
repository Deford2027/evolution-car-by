// Конфигуратор электрического Lixiang i8 (2026): версии, цвета, диски и салон.
//
// Источник – официальный конфигуратор заказа Li Auto (снято 17.10.2026):
// • lixiang.com/mall/buy-new/model.html?seriesId=100163911563136707 – две версии
//   и их розничные цены в Китае;
// • lixiang.com/mall/buy-new/config.html – доплаты за каждый вариант и
//   официальные студийные рендеры каждой сборки.
// У полноприводной и заднеприводной версий Li Auto держит отдельные наборы
// рендеров, поэтому в пути к кадру входит версия.
// Названия переведены с китайского. Цены – китайские розничные; цену под ключ
// в Минске считает менеджер.

export type TrimId = 'awd' | 'rwd';
export type Avail = Record<TrimId, number | null>;
export interface Option { id: string; name: string; note?: string; avail: Avail }
export interface ConfigTrim { id: TrimId; name: string; priceCny: number; rows: { label: string; value: string }[] }

const free: Avail = { awd: 0, rwd: 0 };
const paid = (v: number): Avail => ({ awd: v, rwd: v });
const opt = (dir: string, id: string) => `/img/lixiang-i8/${dir}/${id}.webp`;

export const configTrims: ConfigTrim[] = [
  {
    id: 'awd',
    name: 'i8 полный привод',
    priceCny: 339800,
    rows: [
      { label: 'Привод', value: 'Два мотора, полный; 0–100 за 4,5 с' },
      { label: 'Запас хода', value: '720 км (CLTC) на 20-дюймовых дисках' },
      { label: 'Звук', value: '22 динамика, экран для второго ряда в базе' },
    ],
  },
  {
    id: 'rwd',
    name: 'i8 задний привод',
    priceCny: 309800,
    rows: [
      { label: 'Привод', value: 'Один мотор, задний' },
      { label: 'Запас хода', value: '780 км (CLTC) на 20-дюймовых дисках' },
      { label: 'Зарядка', value: '500 км за 10 минут' },
    ],
  },
];

export const commonSpecs = [
  { label: 'Кресла', value: 'Два полноразмерных кресла «нулевой гравитации» спереди, третье – справа во втором ряду' },
  { label: 'Массаж', value: '16 точек в передних креслах' },
  { label: 'Подвеска', value: 'Двухкамерная пневматическая «Magic Carpet», алюминиевые рычаги' },
  { label: 'Аэродинамика', value: 'Коэффициент 0,218; электропривод переднего багажника' },
  { label: 'Ассистенты', value: 'Li AD Max' },
];

const render = (name: string) => `/img/lixiang-i8/render/${name}.webp`;

export const shots = [
  { id: 'side', label: 'Сбоку', kind: 'exterior' },
  { id: 'front', label: 'Спереди', kind: 'exterior' },
  { id: 'rear', label: 'Сзади', kind: 'exterior' },
  { id: 'dash', label: 'Салон', kind: 'interior' },
  { id: 'rear-seats', label: 'Второй ряд', kind: 'interior' },
] as const;

export const renderPaths = {
  exterior: render('{trim}--{paint}--{wheel}--{shot}'),
  interior: render('{trim}--{interior}--{shot}'),
};

export const paints: (Option & { swatch: string })[] = [
  ['pearl-white', 'Жемчужно-белый', 'перламутр', free],
  ['silver', 'Серебристый', 'металлик', free],
  ['black', 'Чёрный', 'металлик', free],
  ['elephant-grey', 'Слоновий серый', 'холодный блеск, особая серия', paid(8000)],
].map(([id, name, note, avail]) => ({
  id: id as string, name: name as string, note: note as string,
  avail: avail as Avail, swatch: opt('options', `paint-${id}`),
}));

export const wheels: (Option & { image: string })[] = [
  { id: '20-aero', name: '20″ аэродинамические', note: 'максимальный запас хода', avail: free },
  { id: '21-sport', name: '21″ спортивные', note: 'семь спиц', avail: paid(10000) },
].map((w) => ({ ...w, image: opt('options', `wheel-${w.id}`) }));

export const interiors: (Option & { swatch: string })[] = [
  { id: 'white', name: 'Белый', avail: free },
  { id: 'grey-brown', name: 'Серо-коричневый', avail: free },
].map((t) => ({ ...t, swatch: opt('options', `trim-${t.id}`) }));

export const i8Config = {
  path: '/catalog/lixiang/i8/konfigurator/',
  seoTitle: 'Конфигуратор Lixiang i8 2026: цвета, диски, салон | Evolution Car',
  seoDescription:
    'Соберите электрический Lixiang i8 2026: версии с полным и задним приводом, четыре цвета кузова, ' +
    'диски 20″ и 21″, два варианта салона. Цены Li Auto в Китае и расчёт под ключ в Минске.',
  h1: 'Конфигуратор Lixiang i8',
  lead: 'Выберите версию, цвет, диски и салон – менеджер подберёт автомобиль под вашу конфигурацию и пришлёт расчёт под ключ.',
  cardLink: { label: 'Все Lixiang в наличии и под заказ', href: '/catalog/lixiang/' },
  ui: {
    trimTitle: 'Версия', paintTitle: 'Цвет кузова', wheelTitle: 'Диски', interiorTitle: 'Цвет салона',
    commonTitle: 'У обеих версий', summaryTitle: 'Ваш Lixiang i8',
    chinaPrice: 'Цена Li Auto в Китае',
    turnkey: 'Под ключ в Минске – рассчитаем под вашу конфигурацию',
    included: 'входит', unavailable: 'не для этой версии',
    switched: 'Этот вариант есть только у версии',
    formTitle: 'Получить расчёт под ключ',
    prev: 'Предыдущий кадр', next: 'Следующий кадр',
    stageLabel: 'Lixiang i8', viewLabel: 'Вид',
    altPaint: 'Lixiang i8, цвет', altInterior: 'Салон Lixiang i8',
    wheelsWord: 'диски', interiorWord: 'салон',
    leadSource: 'Конфигуратор Lixiang i8',
    photoNote:
      'Изображения – официальные рендеры Li Auto для выбранной сборки. ' +
      'Цены – розничные цены Li Auto в Китае на 17.10.2026; доступность вариантов у конкретного ' +
      'автомобиля менеджер подтвердит до договора.',
  },
};
