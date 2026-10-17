// Конфигуратор Xiaomi SU7 Ultra (2026): версии, цвета, диски и салон.
//
// Источник – официальный конфигуратор заказа Xiaomi EV (снято 17.10.2026):
// • xiaomiev.com/configurator/select-version?goodsId=500010402 – версии и цены;
// • API конфигуратора (car-configurator/get и materialV2) – варианты с доплатами
//   и слои сцены. Кадр собран из тех же слоёв, что рисует сам конфигуратор:
//   трековый фон, кузов в цвете, диски и детали обвеса.
// Версии здесь – это два состояния кузова: обычный и с карбоновым пакетом
// (капот с воздуховодами, обвес, фиксированное антикрыло), как у трековой
// комплектации. Цены – китайские розничные, в юанях.

export type TrimId = 'stock' | 'carbon';
export type Avail = Record<TrimId, number | null>;
export interface Option { id: string; name: string; note?: string; avail: Avail }
export interface ConfigTrim { id: TrimId; name: string; priceCny: number; rows: { label: string; value: string }[] }

const free: Avail = { stock: 0, carbon: 0 };
const paid = (v: number): Avail => ({ stock: v, carbon: v });
const opt = (dir: string, id: string) => `/img/xiaomi-su7-ultra/${dir}/${id}.webp`;

export const configTrims: ConfigTrim[] = [
  {
    id: 'stock',
    name: 'SU7 Ultra',
    priceCny: 529900,
    rows: [
      { label: 'Мощность', value: '1548 л. с., три мотора; 0–100 за 2,1 с' },
      { label: 'Запас хода', value: '630 км (CLTC)' },
      { label: 'Тормоза', value: 'Карбон-керамика, суппорты Akebono' },
    ],
  },
  {
    id: 'carbon',
    name: 'SU7 Ultra, трековый пакет',
    priceCny: 629900,
    rows: [
      { label: 'Кузов', value: 'Карбоновый капот с воздуховодами, обвес и антикрыло' },
      { label: 'Разгон', value: '0–100 за 1,98 с' },
      { label: 'Шасси', value: 'Койловеры Bilstein, колодки ENDLESS' },
    ],
  },
];

export const commonSpecs = [
  { label: 'Максимальная скорость', value: '350 км/ч' },
  { label: 'Крутящий момент', value: '1770 Н·м' },
  { label: 'Торможение', value: '100–0 км/ч от 30,8 м' },
  { label: 'Ассистенты', value: 'Xiaomi HAD' },
];

const render = (name: string) => `/img/xiaomi-su7-ultra/render/${name}.webp`;

export const shots = [
  { id: 'side', label: 'Сбоку', kind: 'exterior' },
  { id: 'front', label: 'Спереди', kind: 'exterior' },
  { id: 'rear', label: 'Сзади', kind: 'exterior' },
  { id: 'dash', label: 'Салон', kind: 'interior' },
  { id: 'rear-seats', label: 'Второй ряд', kind: 'interior' },
] as const;

export const renderPaths = {
  exterior: render('{trim}--{paint}--{wheel}--{shot}'),
  interior: render('{interior}--{shot}'),
};

export const paints: (Option & { swatch: string })[] = [
  ['lightning-yellow', 'Молния, жёлтый', 'фирменный цвет Ultra', free],
  ['pearl-white', 'Жемчужно-белый', 'без доплаты', free],
  ['space-silver', 'Космическое серебро', 'металлик', paid(9000)],
  ['parrot-green', 'Изумрудный «попугай»', 'металлик', paid(9000)],
  ['obsidian-black', 'Обсидиановый чёрный', 'металлик', paid(9000)],
].map(([id, name, note, avail]) => ({
  id: id as string, name: name as string, note: note as string,
  avail: avail as Avail, swatch: opt('options', `paint-${id}`),
}));

export const wheels: (Option & { image: string })[] = [
  { id: 'u-black', name: '21″ U-образные, чёрные', avail: free },
  { id: 'u-yellow', name: '21″ U-образные с жёлтым кантом', avail: free },
  { id: 'forged-graphite', name: '21″ кованые, графит', avail: free },
  { id: 'forged-neodymium', name: '21″ кованые, неодим', avail: free },
].map((w) => ({ ...w, image: opt('options', `wheel-${w.id}`) }));

export const interiors: (Option & { swatch: string })[] = [
  { id: 'bright-yellow', name: 'Жёлтый с чёрным', avail: free },
  { id: 'black-yellow', name: 'Чёрный с жёлтым', avail: paid(3000) },
  { id: 'black-red', name: 'Чёрный с красным', avail: paid(3000) },
].map((t) => ({ ...t, swatch: opt('options', `trim-${t.id}`) }));

export const su7UltraConfig = {
  path: '/catalog/xiaomi/su7-ultra/konfigurator/',
  seoTitle: 'Конфигуратор Xiaomi SU7 Ultra 2026: цвета, диски, карбон | Evolution Car',
  seoDescription:
    'Соберите Xiaomi SU7 Ultra 2026: 1548 л. с., пять цветов кузова, четыре варианта 21-дюймовых дисков, ' +
    'карбоновый трековый пакет и три салона. Цены Xiaomi в Китае и расчёт под ключ в Минске.',
  h1: 'Конфигуратор Xiaomi SU7 Ultra',
  lead: 'Выберите кузов, цвет, диски и салон – менеджер подберёт автомобиль под вашу конфигурацию и пришлёт расчёт под ключ.',
  cardLink: { label: 'Все Xiaomi в наличии и под заказ', href: '/catalog/xiaomi/' },
  ui: {
    trimTitle: 'Исполнение', paintTitle: 'Цвет кузова', wheelTitle: 'Диски', interiorTitle: 'Цвет салона',
    commonTitle: 'У обоих исполнений', summaryTitle: 'Ваш Xiaomi SU7 Ultra',
    chinaPrice: 'Цена Xiaomi в Китае',
    turnkey: 'Под ключ в Минске – рассчитаем под вашу конфигурацию',
    included: 'входит', unavailable: 'нет в этом исполнении',
    switched: 'Этот вариант есть только у исполнения',
    formTitle: 'Получить расчёт под ключ',
    prev: 'Предыдущий кадр', next: 'Следующий кадр',
    stageLabel: 'Xiaomi SU7 Ultra', viewLabel: 'Вид',
    altPaint: 'Xiaomi SU7 Ultra, цвет', altInterior: 'Салон Xiaomi SU7 Ultra',
    wheelsWord: 'диски', interiorWord: 'салон',
    leadSource: 'Конфигуратор Xiaomi SU7 Ultra',
    photoNote:
      'Изображения собраны из официальных слоёв конфигуратора Xiaomi для выбранной сборки. ' +
      'Цены – розничные цены Xiaomi в Китае на 17.10.2026. Есть и третья версия, лимитированная ' +
      'SU7 Ultra Nürburgring за 814 900 ¥, – её привозим под заказ отдельно. ' +
      'Комплектацию конкретного автомобиля менеджер подтвердит до договора.',
  },
};
