// Конфигуратор нового Lixiang MEGA (2026): цвета, диски и салон.
//
// Источник – официальный конфигуратор заказа Li Auto (снято 17.10.2026):
// • lixiang.com/mall/buy-new/model.html?seriesId=100164890815658112 – версия
//   и её розничная цена в Китае;
// • lixiang.com/mall/buy-new/config.html – доплаты за каждый вариант и
//   официальные студийные рендеры каждой сборки.
// Названия переведены с китайского. Цену под ключ в Минске считает менеджер.

export type TrimId = 'solo';
export type Avail = Record<TrimId, number | null>;
export interface Option { id: string; name: string; note?: string; avail: Avail }
export interface ConfigTrim { id: TrimId; name: string; priceCny: number; rows: { label: string; value: string }[] }

const free: Avail = { solo: 0 };
const paid = (v: number): Avail => ({ solo: v });
const opt = (dir: string, id: string) => `/img/lixiang-mega/${dir}/${id}.webp`;

export const configTrims: ConfigTrim[] = [
  {
    id: 'solo',
    name: 'Новый MEGA',
    priceCny: 509800,
    rows: [
      { label: 'Батарея', value: '108 кВт·ч, зарядка 5C' },
      { label: 'Запас хода', value: '710 км (CLTC)' },
      { label: 'Ассистенты', value: 'Двойной Li Mach, 2560 TOPS' },
    ],
  },
];

export const commonSpecs = [
  { label: 'Салон', value: 'Вращающиеся кресла «большой гостиной», самовыравнивающийся электрический столик' },
  { label: 'Первый ряд', value: 'Полноразмерные кресла «нулевой гравитации»' },
  { label: 'Второй ряд', value: 'Динамические кресла «нулевой гравитации»' },
  { label: 'Шасси', value: 'Активный стабилизатор 800 В, рулевое по проводам, поворот задних колёс' },
  { label: 'Свет', value: 'Home Light – основной светильник салона' },
];

const render = (name: string) => `/img/lixiang-mega/render/${name}.webp`;

export const shots = [
  { id: 'side', label: 'Сбоку', kind: 'exterior' },
  { id: 'front', label: 'Спереди', kind: 'exterior' },
  { id: 'rear', label: 'Сзади', kind: 'exterior' },
  { id: 'dash', label: 'Салон', kind: 'interior' },
  { id: 'rear-seats', label: 'Второй ряд', kind: 'interior' },
] as const;

export const renderPaths = {
  exterior: render('solo--{paint}--{wheel}--{shot}'),
  interior: render('solo--{interior}--{shot}'),
};

export const paints: (Option & { swatch: string })[] = [
  ['panda-white', 'Панда, белый', 'перламутр', free],
  ['grey', 'Серый', 'металлик', free],
  ['silver', 'Серебристый', 'металлик', free],
  ['amethyst-grey', 'Аметистовый серый', 'металлик', free],
  ['elephant-grey', 'Новый слоновий серый', 'холодный блеск, особая серия', paid(10000)],
].map(([id, name, note, avail]) => ({
  id: id as string, name: name as string, note: note as string,
  avail: avail as Avail, swatch: opt('options', `paint-${id}`),
}));

export const wheels: (Option & { image: string })[] = [
  { id: '18-aero', name: '18″ аэродинамические', note: 'чёрно-серые, двухцветные', avail: free },
  { id: '18-space-grey', name: '18″ «летающая тарелка», тёмно-серые', avail: free },
  { id: '18-panda-white', name: '18″ «летающая тарелка», белые', avail: free },
].map((w) => ({ ...w, image: opt('options', `wheel-${w.id}`) }));

export const interiors: (Option & { swatch: string })[] = [
  { id: 'white-grey', name: 'Белый с серым', avail: free },
  { id: 'brown-coffee', name: 'Коричневый с кофейным', avail: free },
].map((t) => ({ ...t, swatch: opt('options', `trim-${t.id}`) }));

export const megaConfig = {
  path: '/catalog/lixiang/mega/konfigurator/',
  seoTitle: 'Конфигуратор нового Lixiang MEGA 2026: цвета, диски, салон | Evolution Car',
  seoDescription:
    'Соберите электрический минивэн Lixiang MEGA 2026: пять цветов кузова, три варианта 18-дюймовых дисков, ' +
    'два варианта салона. Цены Li Auto в Китае и расчёт под ключ в Минске.',
  h1: 'Конфигуратор нового Lixiang MEGA',
  lead: 'Выберите цвет, диски и салон – менеджер подберёт автомобиль под вашу конфигурацию и пришлёт расчёт под ключ.',
  cardLink: { label: 'Все Lixiang в наличии и под заказ', href: '/catalog/lixiang/' },
  ui: {
    trimTitle: 'Версия', paintTitle: 'Цвет кузова', wheelTitle: 'Диски', interiorTitle: 'Цвет салона',
    commonTitle: 'В любой сборке', summaryTitle: 'Ваш Lixiang MEGA',
    chinaPrice: 'Цена Li Auto в Китае',
    turnkey: 'Под ключ в Минске – рассчитаем под вашу конфигурацию',
    included: 'входит', unavailable: 'нет в этой версии',
    switched: 'Этот вариант есть только у версии',
    formTitle: 'Получить расчёт под ключ',
    prev: 'Предыдущий кадр', next: 'Следующий кадр',
    stageLabel: 'Lixiang MEGA', viewLabel: 'Вид',
    altPaint: 'Lixiang MEGA, цвет', altInterior: 'Салон Lixiang MEGA',
    wheelsWord: 'диски', interiorWord: 'салон',
    leadSource: 'Конфигуратор нового MEGA',
    photoNote:
      'Изображения – официальные рендеры Li Auto для выбранной сборки. ' +
      'Цены – розничные цены Li Auto в Китае на 17.10.2026; комплектацию конкретного автомобиля ' +
      'менеджер подтвердит до договора.',
  },
};
