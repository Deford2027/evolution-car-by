// Конфигуратор Xiaomi YU7 (2026): версии, цвета, диски и салон.
//
// Источник – официальный конфигуратор заказа Xiaomi EV (снято 17.10.2026):
// • xiaomiev.com/configurator/select-version?goodsId=500015457 – версии, их
//   розничные цены в Китае и ключевые отличия;
// • API конфигуратора (car-configurator/get и materialV2 того же сайта) –
//   список вариантов с доплатами и официальные студийные слои сцены.
// Кадры собраны из тех же слоёв, что показывает сам конфигуратор Xiaomi:
// студийный фон, кузов в выбранном цвете и наложение выбранных дисков,
// по три ракурса, плюс салон в двух ракурсах для каждого цвета отделки.
// Показан набор вариантов версии «Стандарт». Версия GT с отдельным
// обвесом и карбон-керамическими тормозами здесь не собирается.
// Названия переведены с китайского. Цены – китайские розничные, в юанях.

export type TrimId = 'standard' | 'long-range' | 'pro' | 'max';

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

const free: Avail = { standard: 0, 'long-range': 0, pro: 0, max: 0 };
const paid = (v: number): Avail => ({ standard: v, 'long-range': v, pro: v, max: v });
const opt = (dir: string, id: string) => `/img/xiaomi-yu7/${dir}/${id}.webp`;

export const configTrims: ConfigTrim[] = [
  {
    id: 'standard',
    name: 'YU7 Стандарт',
    priceCny: 233500,
    rows: [
      { label: 'Запас хода', value: '643 км (CLTC)' },
      { label: 'Разгон 0–100', value: '5,9 с' },
      { label: 'Зарядка', value: 'Платформа 752 В, до 405 км за 15 минут' },
    ],
  },
  {
    id: 'long-range',
    name: 'YU7 Длинный пробег',
    priceCny: 253500,
    rows: [
      { label: 'Запас хода', value: '835 км (CLTC)' },
      { label: 'Батарея', value: '96,3 кВт·ч, литий-железо-фосфат' },
      { label: 'Подвеска', value: 'Адаптивные амортизаторы CDC' },
    ],
  },
  {
    id: 'pro',
    name: 'YU7 Pro',
    priceCny: 279900,
    rows: [
      { label: 'Запас хода', value: '770 км (CLTC)' },
      { label: 'Мощность', value: '496 л. с., два мотора, полный привод' },
      { label: 'Подвеска', value: 'Двухкамерная пневма с регулировкой высоты и жёсткости' },
    ],
  },
  {
    id: 'max',
    name: 'YU7 Max',
    priceCny: 329900,
    rows: [
      { label: 'Запас хода', value: '760 км (CLTC)' },
      { label: 'Мощность', value: '690 л. с., два мотора, полный привод; 0–100 за 3,23 с' },
      { label: 'Зарядка', value: 'Платформа 897 В, 101,7 кВт·ч, до 620 км за 15 минут' },
    ],
  },
];

/** Одинаково у всех версий */
export const commonSpecs = [
  { label: 'Ассистенты', value: 'Xiaomi HAD, лидар в базе' },
  { label: 'Приборы', value: 'Панорамный проекционный экран Xiaomi на всю ширину' },
  { label: 'Процессор', value: 'Snapdragon 8 третьего поколения' },
  { label: 'Кресла', value: 'Электрорегулировки, вентиляция и подогрев спереди, электрические кресла сзади' },
];

const render = (name: string) => `/img/xiaomi-yu7/render/${name}.webp`;

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
  ['titanium', 'Титановый', 'без доплаты', free],
  ['cherry-red', 'Вишнёвый красный', 'особая серия', paid(9000)],
  ['volcanic-grey', 'Вулканический пепел', 'металлик', paid(7000)],
  ['aurora-purple', 'Пурпурная заря', 'металлик', paid(7000)],
  ['gold-pink', 'Золотисто-розовый', 'металлик', paid(7000)],
  ['pearl-white', 'Жемчужно-белый', 'перламутр', paid(7000)],
].map(([id, name, note, avail]) => ({
  id: id as string,
  name: name as string,
  note: note as string,
  avail: avail as Avail,
  swatch: opt('options', `paint-${id}`),
}));

export const wheels: (Option & { image: string })[] = [
  { id: '19-diamond', name: '19″ «Алмаз»', note: 'шины для дальних поездок', avail: free },
  { id: '20-plum', name: '20″ «Слива»', note: 'шины для дальних поездок', avail: paid(6000) },
].map((w) => ({ ...w, image: opt('options', `wheel-${w.id}`) }));

export const interiors: (Option & { swatch: string })[] = [
  { id: 'twilight-blue', name: 'Сумеречный синий', avail: free },
  { id: 'iris-purple', name: 'Ирис: фиолетовый с серым', avail: free },
  { id: 'turquoise-grey', name: 'Бирюзовый с серым', avail: free },
].map((t) => ({ ...t, swatch: opt('options', `trim-${t.id}`) }));

export const yu7Config = {
  path: '/catalog/xiaomi/yu7/konfigurator/',
  seoTitle: 'Конфигуратор Xiaomi YU7 2026: цвета, диски, салон | Evolution Car',
  seoDescription:
    'Соберите кроссовер Xiaomi YU7 2026: версии Стандарт, Длинный пробег, Pro и Max, шесть цветов кузова, ' +
    'диски 19″ и 20″, три варианта салона. Цены Xiaomi в Китае и расчёт под ключ в Минске.',
  h1: 'Конфигуратор Xiaomi YU7',
  lead: 'Выберите версию, цвет, диски и салон – менеджер подберёт автомобиль под вашу конфигурацию и пришлёт расчёт под ключ.',
  cardLink: { label: 'Характеристики Xiaomi YU7', href: '/catalog/xiaomi/yu7/' },
  ui: {
    trimTitle: 'Версия',
    paintTitle: 'Цвет кузова',
    wheelTitle: 'Диски',
    interiorTitle: 'Цвет салона',
    commonTitle: 'У всех версий',
    summaryTitle: 'Ваш Xiaomi YU7',
    chinaPrice: 'Цена Xiaomi в Китае',
    turnkey: 'Под ключ в Минске – рассчитаем под вашу конфигурацию',
    included: 'входит',
    unavailable: 'не для этой версии',
    switched: 'Этот вариант есть только у версии',
    formTitle: 'Получить расчёт под ключ',
    prev: 'Предыдущий кадр',
    stageLabel: 'Xiaomi YU7',
    viewLabel: 'Вид',
    altPaint: 'Xiaomi YU7, цвет',
    altInterior: 'Салон Xiaomi YU7',
    wheelsWord: 'диски',
    interiorWord: 'салон',
    leadSource: 'Конфигуратор Xiaomi YU7',
    next: 'Следующий кадр',
    photoNote:
      'Изображения собраны из официальных слоёв конфигуратора Xiaomi для выбранной сборки. ' +
      'Цены – розничные цены Xiaomi в Китае на 17.10.2026; показан набор вариантов версии «Стандарт», ' +
      'у старших версий он шире, а спортивная YU7 GT за 389 900 ¥ собирается отдельно. ' +
      'Комплектацию конкретного автомобиля менеджер подтвердит до договора.',
  },
};
