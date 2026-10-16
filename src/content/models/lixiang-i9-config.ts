// Конфигуратор нового электрического Lixiang i9 (2026): цвета, диски и салон.
//
// Источник – официальный конфигуратор заказа Li Auto (снято 17.10.2026):
// • lixiang.com/mall/buy-new/model.html?seriesId=101425618335875457 – версия
//   и её розничная цена в Китае;
// • lixiang.com/mall/buy-new/config.html – доплаты за каждый вариант и
//   официальные студийные рендеры каждой сборки.
// Пять цветов из восьми Li Auto сейчас отдаёт по акции без доплаты; обычная
// доплата за них – 10 000 ¥, она и указана. Цену под ключ в Минске считает менеджер.

export type TrimId = 'solo';
export type Avail = Record<TrimId, number | null>;
export interface Option { id: string; name: string; note?: string; avail: Avail }
export interface ConfigTrim { id: TrimId; name: string; priceCny: number; rows: { label: string; value: string }[] }

const free: Avail = { solo: 0 };
const paid = (v: number): Avail => ({ solo: v });
const opt = (dir: string, id: string) => `/img/lixiang-i9/${dir}/${id}.webp`;

export const configTrims: ConfigTrim[] = [
  {
    id: 'solo',
    name: 'Новый i9',
    priceCny: 369800,
    rows: [
      { label: 'Батарея', value: '101 кВт·ч, зарядка 5C' },
      { label: 'Запас хода', value: '705 км (CLTC)' },
      { label: 'Ассистенты', value: 'Li Mach, 1280 TOPS' },
    ],
  },
];

export const commonSpecs = [
  { label: 'Кресла', value: 'Четыре полноразмерных кресла «нулевой гравитации», третий ряд с наклоном 55°' },
  { label: 'Подвеска', value: 'Двухкамерная двухклапанная пневматическая «Magic Carpet»' },
  { label: 'Рулевое', value: 'По проводам, с поворотом задних колёс' },
  { label: 'Багажник', value: 'Увеличенный, с двойной складной полкой' },
];

const render = (name: string) => `/img/lixiang-i9/render/${name}.webp`;

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
  ['pearl-white', 'Жемчужно-белый', 'металлик', free],
  ['diamond-black', 'Бриллиантовый чёрный', 'металлик', free],
  ['flowing-silver', 'Струящееся серебро', 'металлик', free],
  ['amethyst-grey', 'Аметистовый серый', 'металлик, сейчас по акции без доплаты', paid(10000)],
  ['quantum-titanium', 'Квантовый титан', 'металлик, сейчас по акции без доплаты', paid(10000)],
  ['ebony-gold', 'Чёрное дерево с золотом', 'металлик, сейчас по акции без доплаты', paid(10000)],
  ['elephant-grey', 'Новый слоновий серый', 'холодный блеск, сейчас по акции без доплаты', paid(10000)],
  ['misty-blue', 'Туманное море', 'холодный блеск, сейчас по акции без доплаты', paid(10000)],
].map(([id, name, note, avail]) => ({
  id: id as string, name: name as string, note: note as string,
  avail: avail as Avail, swatch: opt('options', `paint-${id}`),
}));

export const wheels: (Option & { image: string })[] = [
  { id: '21-aero', name: '21″ аэродинамические', note: 'запас хода 705 км', avail: free },
  { id: '21-sport', name: '21″ спортивные', note: 'семь спиц, запас хода 705 км', avail: free },
  { id: '22-star', name: '22″ «семиконечная звезда»', note: 'запас хода 680 км', avail: paid(10000) },
].map((w) => ({ ...w, image: opt('options', `wheel-${w.id}`) }));

export const interiors: (Option & { swatch: string })[] = [
  { id: 'white-grey', name: 'Белый с серым', avail: free },
  { id: 'brown-coffee', name: 'Коричневый с кофейным', avail: free },
].map((t) => ({ ...t, swatch: opt('options', `trim-${t.id}`) }));

export const i9Config = {
  path: '/catalog/lixiang/i9/konfigurator/',
  seoTitle: 'Конфигуратор нового Lixiang i9 2026: цвета, диски, салон | Evolution Car',
  seoDescription:
    'Соберите электрический Lixiang i9 2026: восемь цветов кузова, диски 21″ и 22″, два варианта салона. ' +
    'Цены Li Auto в Китае и расчёт под ключ в Минске.',
  h1: 'Конфигуратор нового Lixiang i9',
  lead: 'Выберите цвет, диски и салон – менеджер подберёт автомобиль под вашу конфигурацию и пришлёт расчёт под ключ.',
  cardLink: { label: 'Все Lixiang в наличии и под заказ', href: '/catalog/lixiang/' },
  ui: {
    trimTitle: 'Версия', paintTitle: 'Цвет кузова', wheelTitle: 'Диски', interiorTitle: 'Цвет салона',
    commonTitle: 'В любой сборке', summaryTitle: 'Ваш Lixiang i9',
    chinaPrice: 'Цена Li Auto в Китае',
    turnkey: 'Под ключ в Минске – рассчитаем под вашу конфигурацию',
    included: 'входит', unavailable: 'нет в этой версии',
    switched: 'Этот вариант есть только у версии',
    formTitle: 'Получить расчёт под ключ',
    prev: 'Предыдущий кадр', next: 'Следующий кадр',
    stageLabel: 'Lixiang i9', viewLabel: 'Вид',
    altPaint: 'Lixiang i9, цвет', altInterior: 'Салон Lixiang i9',
    wheelsWord: 'диски', interiorWord: 'салон',
    leadSource: 'Конфигуратор нового i9',
    photoNote:
      'Изображения – официальные рендеры Li Auto для выбранной сборки. ' +
      'Цены – розничные цены Li Auto в Китае на 17.10.2026; пять цветов сейчас идут по акции без доплаты. ' +
      'Комплектацию конкретного автомобиля менеджер подтвердит до договора.',
  },
};
