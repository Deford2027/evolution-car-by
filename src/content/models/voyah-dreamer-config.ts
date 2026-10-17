// Конфигуратор Voyah Dreamer 9 (岚图梦想家9, 2026): цвета, диски и салон.
//
// Источник – официальный конфигуратор заказа Voyah (снято 17.10.2026):
// • configuration-3d-web.dsmp.voyah.com.cn – версии, цены и доплаты;
//   сайт отдаёт готовый кадр на каждую сборку, поэтому рендеры взяты как есть.
// Экстерьер производитель показывает одним ракурсом – его и используем,
// салон идёт тремя кадрами. Voyah – марка Dongfeng. Цены китайские, в юанях.

export type TrimId = 'ultra';
export type Avail = Record<TrimId, number | null>;
export interface Option { id: string; name: string; note?: string; avail: Avail }
export interface ConfigTrim { id: TrimId; name: string; priceCny: number; rows: { label: string; value: string }[] }

const free: Avail = { ultra: 0 };
const paid = (v: number): Avail => ({ ultra: v });
const opt = (dir: string, id: string) => `/img/voyah-dreamer/${dir}/${id}.webp`;

export const configTrims: ConfigTrim[] = [
  {
    id: 'ultra',
    name: 'Dreamer 9 Ultra PHEV',
    priceCny: 419900,
    rows: [
      { label: 'Силовая установка', value: 'Гибрид на платформе 800 В' },
      { label: 'Шасси', value: 'Voyah «Тигриная хватка» Premium' },
      { label: 'Оснащение', value: 'Холодильник 13 л, климат без обдува, архитектура под L3' },
    ],
  },
];

export const commonSpecs = [
  { label: 'Кузов', value: 'Минивэн, кресла «нулевой гравитации» во втором ряду' },
  { label: 'Экран', value: 'Потолочный 21,4″ для второго ряда' },
  { label: 'Стёкла', value: 'Боковые с электронной шторкой (опция)' },
];

const render = (name: string) => `/img/voyah-dreamer/render/${name}.webp`;

export const shots = [
  { id: 'front', label: 'Автомобиль', kind: 'exterior' },
  { id: 'dash', label: 'Салон', kind: 'interior' },
  { id: 'rear-seats', label: 'Второй ряд', kind: 'interior' },
  { id: 'cabin', label: 'Кресла второго ряда', kind: 'interior' },
] as const;

export const renderPaths = {
  exterior: render('{paint}--{wheel}--{shot}'),
  interior: render('{interior}--{shot}'),
};

export const paints: (Option & { swatch: string })[] = [
  ['iris-white', 'Белый ирис', 'без доплаты', free],
  ['obsidian-black', 'Чёрный оникс', 'без доплаты', free],
  ['moon-teal', 'Лунная бирюза', 'без доплаты', free],
  ['crimson-purple', 'Пурпурная заря', 'без доплаты', free],
  ['gold-red', 'Золото и багрянец', 'двухцветный кузов', paid(10000)],
].map(([id, name, note, avail]) => ({
  id: id as string, name: name as string, note: note as string,
  avail: avail as Avail, swatch: opt('options', `paint-${id}`),
}));

export const wheels: (Option & { image: string })[] = [
  { id: '21-starbeam', name: '21″ «Звёздный блеск»', avail: free },
  { id: '21-starlight', name: '21″ «Звёздное сияние»', avail: paid(10000) },
].map((w) => ({ ...w, image: opt('options', `wheel-${w.id}`) }));

export const interiors: (Option & { swatch: string })[] = [
  { id: 'purple-white', name: 'Фиолетовый нефрит с белым', avail: free },
  { id: 'sandal-brown', name: 'Сандаловый коричневый', avail: free },
].map((t) => ({ ...t, swatch: opt('options', `trim-${t.id}`) }));

export const voyahDreamerConfig = {
  path: '/catalog/voyah/dreamer/konfigurator/',
  seoTitle: 'Конфигуратор Voyah Dreamer 9 2026: цвета, диски, салон | Evolution Car',
  seoDescription:
    'Соберите минивэн Voyah Dreamer 9 2026: пять цветов кузова, два варианта 21-дюймовых дисков, ' +
    'два салона с креслами «нулевой гравитации». Цены Voyah в Китае и расчёт под ключ в Минске.',
  h1: 'Конфигуратор Voyah Dreamer 9',
  lead: 'Выберите цвет, диски и салон – менеджер подберёт автомобиль под вашу конфигурацию и пришлёт расчёт под ключ.',
  cardLink: { label: 'Все Voyah в наличии и под заказ', href: '/catalog/voyah/' },
  ui: {
    trimTitle: 'Версия', paintTitle: 'Цвет кузова', wheelTitle: 'Диски', interiorTitle: 'Цвет салона',
    commonTitle: 'В любой сборке', summaryTitle: 'Ваш Voyah Dreamer 9',
    chinaPrice: 'Цена Voyah в Китае',
    turnkey: 'Под ключ в Минске – рассчитаем под вашу конфигурацию',
    included: 'входит', unavailable: 'нет в этой версии',
    switched: 'Этот вариант есть только у версии',
    formTitle: 'Получить расчёт под ключ',
    prev: 'Предыдущий кадр', next: 'Следующий кадр',
    stageLabel: 'Voyah Dreamer 9', viewLabel: 'Вид',
    altPaint: 'Voyah Dreamer 9, цвет', altInterior: 'Салон Voyah Dreamer 9',
    wheelsWord: 'диски', interiorWord: 'салон',
    leadSource: 'Конфигуратор Voyah Dreamer 9',
    photoNote:
      'Изображения – официальные кадры конфигуратора Voyah для выбранной сборки; кузов производитель ' +
      'показывает одним ракурсом. Цены – розничные цены Voyah в Китае на 17.10.2026, показана версия ' +
      'Ultra PHEV; есть и старшие, до 519 900 ¥. Комплектацию конкретного автомобиля менеджер ' +
      'подтвердит до договора.',
  },
};
