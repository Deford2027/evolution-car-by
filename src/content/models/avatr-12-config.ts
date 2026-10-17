// Конфигуратор Avatr 12 (2026): цвета, диски и салон.
//
// Источник – официальный конфигуратор заказа Avatr (снято 17.10.2026):
// • avatr.com/carset?productCarId=1640630933 – версии, цены и доплаты;
//   сайт отдаёт готовый рендер на каждую сборку (car_diagram_combine),
//   поэтому кадры взяты как есть, без сборки из слоёв.
// Avatr – марка Changan, Huawei и CATL. Цены китайские розничные, в юанях.

export type TrimId = 'max' | 'ultra';
export type Avail = Record<TrimId, number | null>;
export interface Option { id: string; name: string; note?: string; avail: Avail }
export interface ConfigTrim { id: TrimId; name: string; priceCny: number; rows: { label: string; value: string }[] }

const free: Avail = { max: 0, ultra: 0 };
const paid = (v: number): Avail => ({ max: v, ultra: v });
const opt = (dir: string, id: string) => `/img/avatr-12/${dir}/${id}.webp`;

export const configTrims: ConfigTrim[] = [
  {
    id: 'max',
    name: '12 Max',
    priceCny: 293900,
    rows: [
      { label: 'Силовая установка', value: 'Два мотора, система Kunlun с генератором' },
      { label: 'Запас хода', value: '350 км на электричестве, 1260 км общий (CLTC)' },
      { label: 'Подвеска', value: 'Электромагнитные амортизаторы' },
    ],
  },
  {
    id: 'ultra',
    name: '12 Ultra',
    priceCny: 313900,
    rows: [
      { label: 'Подвеска', value: 'Пневматическая с адаптивными амортизаторами CDC' },
      { label: 'Двери', value: 'Электроприводные, с датчиком приближения' },
      { label: 'Разгон 0–100', value: '5,1 с' },
    ],
  },
];

export const commonSpecs = [
  { label: 'Ассистенты', value: 'Лидар Huawei на 896 линий' },
  { label: 'Батарея', value: '52 кВт·ч, CATL' },
  { label: 'Звук', value: 'Bowers & Wilkins, 25 динамиков' },
  { label: 'Салон', value: '5 мест' },
];

const render = (name: string) => `/img/avatr-12/render/${name}.webp`;

export const shots = [
  { id: 'side', label: 'Сбоку', kind: 'exterior' },
  { id: 'front', label: 'Спереди', kind: 'exterior' },
  { id: 'rear', label: 'Сзади', kind: 'exterior' },
  { id: 'dash', label: 'Салон', kind: 'interior' },
  { id: 'rear-seats', label: 'Второй ряд', kind: 'interior' },
  { id: 'cabin', label: 'Передние кресла', kind: 'interior' },
] as const;

export const renderPaths = {
  exterior: render('{paint}--{wheel}--{shot}'),
  interior: render('{interior}--{shot}'),
};

export const paints: (Option & { swatch: string })[] = [
  ['white', 'Белый «фарфор»', 'без доплаты', free],
  ['grey', 'Тёмно-серый', 'без доплаты', free],
  ['black', 'Чёрный', 'без доплаты', free],
  ['cloud-purple', 'Облачный фиолетовый', 'особая серия', paid(6000)],
  ['dawn-gold', 'Золото рассвета', 'особая серия', paid(6000)],
].map(([id, name, note, avail]) => ({
  id: id as string, name: name as string, note: note as string,
  avail: avail as Avail, swatch: opt('options', `paint-${id}`),
}));

export const wheels: (Option & { image: string })[] = [
  { id: '20-swirl', name: '20″ «Вихревые лопасти»', note: 'шины 265/45 R20', avail: free },
  { id: '21-beam', name: '21″ спортивные «Луч»', note: 'шины 265/40 R21, передние суппорты Brembo', avail: paid(10000) },
].map((w) => ({ ...w, image: opt('options', `wheel-${w.id}`) }));

export const interiors: (Option & { swatch: string })[] = [
  { id: 'ink-black', name: 'Чернильно-чёрный', avail: free },
  { id: 'dusk-purple', name: 'Сумеречный фиолетовый с дымчато-белым', avail: free },
  { id: 'rock-brown', name: 'Скальный коричневый', avail: paid(4000) },
  { id: 'crimson', name: 'Тёмно-красный', avail: paid(4000) },
].map((t) => ({ ...t, swatch: opt('options', `trim-${t.id}`) }));

export const avatr12Config = {
  path: '/catalog/avatr/12/konfigurator/',
  seoTitle: 'Конфигуратор Avatr 12 2026: цвета, диски, салон | Evolution Car',
  seoDescription:
    'Соберите Avatr 12 2026: версии Max и Ultra, пять цветов кузова, диски 20″ и 21″, четыре варианта салона. ' +
    'Запас хода 1260 км. Цены Avatr в Китае и расчёт под ключ в Минске.',
  h1: 'Конфигуратор Avatr 12',
  lead: 'Выберите версию, цвет, диски и салон – менеджер подберёт автомобиль под вашу конфигурацию и пришлёт расчёт под ключ.',
  cardLink: { label: 'Все Avatr в наличии и под заказ', href: '/catalog/avatr/' },
  ui: {
    trimTitle: 'Версия', paintTitle: 'Цвет кузова', wheelTitle: 'Диски', interiorTitle: 'Цвет салона',
    commonTitle: 'У обеих версий', summaryTitle: 'Ваш Avatr 12',
    chinaPrice: 'Цена Avatr в Китае',
    turnkey: 'Под ключ в Минске – рассчитаем под вашу конфигурацию',
    included: 'входит', unavailable: 'нет в этой версии',
    switched: 'Этот вариант есть только у версии',
    formTitle: 'Получить расчёт под ключ',
    prev: 'Предыдущий кадр', next: 'Следующий кадр',
    stageLabel: 'Avatr 12', viewLabel: 'Вид',
    altPaint: 'Avatr 12, цвет', altInterior: 'Салон Avatr 12',
    wheelsWord: 'диски', interiorWord: 'салон',
    leadSource: 'Конфигуратор Avatr 12',
    photoNote:
      'Изображения – официальные рендеры Avatr для выбранной сборки. Цены – розничные цены ' +
      'Avatr в Китае на 17.10.2026; доплаты за цвет, диски и салон одинаковы для обеих версий. ' +
      'Комплектацию конкретного автомобиля менеджер подтвердит до договора.',
  },
};
