// Конфигуратор Xiaomi SU7 (поколение 2026): версии, цвета, диски и салон.
//
// Источник – официальный конфигуратор заказа Xiaomi EV (снято 17.10.2026):
// • xiaomiev.com/configurator/select-version?goodsId=900010301 – три версии,
//   их розничные цены в Китае и ключевые отличия;
// • API конфигуратора (car-configurator/get и materialV2 того же сайта) –
//   список вариантов с доплатами и официальные студийные слои сцены.
// Кадры собраны из тех же слоёв, что показывает сам конфигуратор Xiaomi:
// кузов в выбранном цвете плюс наложение выбранных дисков, по три ракурса,
// и салон в двух ракурсах для каждого цвета отделки.
// Названия переведены с китайского. Цены – китайские розничные, в юанях;
// цену под ключ в Минске считает менеджер.

export type TrimId = 'standard' | 'pro' | 'max';

/** Доплата в юанях для каждой версии; null – в этой версии варианта нет */
export type Avail = Record<TrimId, number | null>;

export interface Option {
  id: string;
  name: string;
  note?: string;
  avail: Avail;
}

export interface ConfigTrim {
  id: TrimId;
  name: string;
  priceCny: number;
  rows: { label: string; value: string }[];
}

const free: Avail = { standard: 0, pro: 0, max: 0 };
const paid = (v: number): Avail => ({ standard: v, pro: v, max: v });
const opt = (dir: string, id: string) => `/img/xiaomi-su7/${dir}/${id}.webp`;

export const configTrims: ConfigTrim[] = [
  {
    id: 'standard',
    name: 'SU7',
    priceCny: 219900,
    rows: [
      { label: 'Запас хода', value: '720 км (CLTC)' },
      { label: 'Мощность', value: '320 л. с., задний привод' },
      { label: 'Зарядка', value: 'Платформа 752 В, до 450 км за 15 минут' },
    ],
  },
  {
    id: 'pro',
    name: 'SU7 Pro',
    priceCny: 249900,
    rows: [
      { label: 'Запас хода', value: '902 км (CLTC)' },
      { label: 'Батарея', value: '96,3 кВт·ч, литий-железо-фосфат' },
      { label: 'Подвеска', value: 'Двухкамерная пневма и адаптивные амортизаторы CDC' },
    ],
  },
  {
    id: 'max',
    name: 'SU7 Max',
    priceCny: 303900,
    rows: [
      { label: 'Запас хода', value: '835 км (CLTC)' },
      { label: 'Мощность', value: '690 л. с., два мотора, полный привод' },
      { label: 'Зарядка', value: 'Платформа 897 В, до 670 км за 15 минут' },
    ],
  },
];

/** Одинаково у всех версий */
export const commonSpecs = [
  { label: 'Ассистенты', value: 'Xiaomi HAD, лидар в базе' },
  { label: 'Передние кресла', value: 'Вентиляция, подогрев, массаж; водительское – 18 регулировок' },
  { label: 'Пассажир', value: 'Кресло «нулевой гравитации» справа впереди' },
  { label: 'Кузов', value: 'Стёкла с защитой от солнца, большой электропривод переднего багажника' },
];

const render = (name: string) => `/img/xiaomi-su7/render/${name}.webp`;

/** Кадры сцены: три ракурса кузова и два салона – рендеры зависят от выбора */
export const shots = [
  { id: 'side', label: 'Сбоку', kind: 'exterior' },
  { id: 'front', label: 'Спереди', kind: 'exterior' },
  { id: 'rear', label: 'Сзади', kind: 'exterior' },
  { id: 'dash', label: 'Салон', kind: 'interior' },
  { id: 'rear-seats', label: 'Второй ряд', kind: 'interior' },
] as const;

/** Шаблон пути к рендеру; {paint} {wheel} {interior} {shot} подставляет остров */
export const renderPaths = {
  exterior: render('{paint}--{wheel}--{shot}'),
  interior: render('{interior}--{shot}'),
};

export const paints: (Option & { swatch: string })[] = [
  ['capri-blue', 'Капри, синий', 'без доплаты', free],
  ['sunset-red', 'Алая заря', 'без доплаты', free],
  ['elegant-grey', 'Благородный серый', 'без доплаты', free],
  ['indigo-green', 'Индиговый зелёный', 'металлик', paid(7000)],
  ['gold-pink', 'Золотисто-розовый', 'металлик', paid(7000)],
  ['pearl-white', 'Жемчужно-белый', 'перламутр', paid(7000)],
  ['aurora-purple', 'Пурпурная заря', 'металлик', paid(7000)],
].map(([id, name, note, avail]) => ({
  id: id as string,
  name: name as string,
  note: note as string,
  avail: avail as Avail,
  swatch: opt('options', `paint-${id}`),
}));

export const wheels: (Option & { image: string })[] = [
  { id: '19-diamond', name: '19″ «Алмаз»', note: 'шины для дальних поездок', avail: free },
  { id: '20-plum', name: '20″ «Слива»', note: 'шины для дальних поездок', avail: paid(2000) },
  { id: '20-rice', name: '20″ «Рисовое зерно»', note: 'шины для дальних поездок', avail: paid(2000) },
  { id: '20-blade', name: '20″ «Лезвие»', note: 'спортивные шины', avail: paid(2000) },
].map((w) => ({ ...w, image: opt('options', `wheel-${w.id}`) }));

export const interiors: (Option & { swatch: string })[] = [
  { id: 'misty-purple', name: 'Туманный фиолетовый', avail: free },
  { id: 'sand-beige', name: 'Песочно-бежевый', avail: free },
  { id: 'twilight-red', name: 'Сумеречный красный', avail: free },
  { id: 'midnight-black', name: 'Ночной чёрный', avail: paid(3000) },
].map((t) => ({ ...t, swatch: opt('options', `trim-${t.id}`) }));

export const su7Config = {
  path: '/catalog/xiaomi/su7/konfigurator/',
  seoTitle: 'Конфигуратор Xiaomi SU7 2026: цвета, диски, салон | Evolution Car',
  seoDescription:
    'Соберите Xiaomi SU7 2026: версии SU7, Pro и Max, семь цветов кузова, диски 19″ и 20″, четыре варианта салона. ' +
    'Цены Xiaomi в Китае и расчёт под ключ в Минске.',
  h1: 'Конфигуратор Xiaomi SU7',
  lead: 'Выберите версию, цвет, диски и салон – менеджер подберёт автомобиль под вашу конфигурацию и пришлёт расчёт под ключ.',
  cardLink: { label: 'Характеристики Xiaomi SU7', href: '/catalog/xiaomi/su7/' },
  ui: {
    trimTitle: 'Версия',
    paintTitle: 'Цвет кузова',
    wheelTitle: 'Диски',
    interiorTitle: 'Цвет салона',
    commonTitle: 'У всех версий',
    summaryTitle: 'Ваш Xiaomi SU7',
    chinaPrice: 'Цена Xiaomi в Китае',
    turnkey: 'Под ключ в Минске – рассчитаем под вашу конфигурацию',
    included: 'входит',
    unavailable: 'не для этой версии',
    switched: 'Этот вариант есть только у версии',
    formTitle: 'Получить расчёт под ключ',
    prev: 'Предыдущий кадр',
    stageLabel: 'Xiaomi SU7',
    viewLabel: 'Вид',
    altPaint: 'Xiaomi SU7, цвет',
    altInterior: 'Салон Xiaomi SU7',
    wheelsWord: 'диски',
    interiorWord: 'салон',
    leadSource: 'Конфигуратор Xiaomi SU7',
    next: 'Следующий кадр',
    photoNote:
      'Изображения собраны из официальных слоёв конфигуратора Xiaomi для выбранной сборки. ' +
      'Цены – розничные цены Xiaomi в Китае на 17.10.2026; показан набор вариантов версии SU7, ' +
      'у версии Max доступны дополнительный цвет и диски. Комплектацию конкретного автомобиля ' +
      'менеджер подтвердит до договора.',
  },
};
