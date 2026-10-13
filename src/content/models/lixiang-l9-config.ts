// Конфигуратор нового Lixiang L9 (2026): версии, цвета, диски и салон.
//
// Источник – официальный сайт Li Auto (снято 13.10.2026):
// • lixiang.com/configuration.html?carModel=L9 – список вариантов, в какой
//   версии что доступно и доплаты в юанях;
// • API продуктов Li Auto – розничные цены версий в Китае;
// • lixiang.com/l9 – фото по цветам (блок «每一种颜色，都高级») и фото салона.
// Названия переведены с китайского. Это новая L9 2026 года – не те
// поколения Pro/Max/Ultra 2023–2025, что описаны в карточке lixiang-l9.ts.
// Цены здесь – китайские розничные; цену под ключ в Минске считает менеджер.

export type TrimId = 'ultra' | 'livis';

/** Доплата в юанях для каждой версии; null – в этой версии варианта нет */
export type Avail = Record<TrimId, number | null>;

export interface Option {
  id: string;
  name: string;
  note?: string;
  avail: Avail;
}

const both: Avail = { ultra: 0, livis: 0 };
const opt = (dir: string, id: string) => `/img/lixiang-l9/${dir}/${id}.webp`;

export interface ConfigTrim {
  id: TrimId;
  name: string;
  priceCny: number;
  rows: { label: string; value: string }[];
}

export const configTrims: ConfigTrim[] = [
  {
    id: 'ultra',
    name: 'L9 Ultra',
    priceCny: 459800,
    rows: [
      { label: 'Подвеска', value: 'Пневматическая «Magic Carpet» 3-го поколения' },
      { label: 'Тормоза', value: 'Электрогидравлические (EHB)' },
      { label: 'Ассистенты', value: '1280 TOPS, передний лидар' },
    ],
  },
  {
    id: 'livis',
    name: 'L9 Livis',
    priceCny: 509800,
    rows: [
      { label: 'Подвеска', value: 'Активная, 800 В' },
      { label: 'Тормоза', value: 'Электромеханические (EMB)' },
      { label: 'Ассистенты', value: '2560 TOPS, четыре лидара' },
    ],
  },
];

/** Одинаково у обеих версий */
export const commonSpecs = [
  { label: 'Батарея', value: '72,7 кВт·ч, зарядка 10–80% за 10 мин' },
  { label: 'Запас хода', value: '420 км на электричестве, 1650 км общий (CLTC)' },
  { label: 'Салон', value: '6 мест, схема 2-2-2' },
];

export const paints: (Option & { photo: { desktop: string; mobile: string }; swatch: string })[] = [
  ['pearl-white', 'Жемчужно-белый', 'металлик', both],
  ['polar-grey', 'Полярный серый', 'холодный блеск', both],
  ['diamond-black', 'Бриллиантовый чёрный', 'металлик', both],
  ['titanium-gold', 'Титановое золото', 'металлик', both],
  ['emerald', 'Изумрудный', 'перламутр, особая серия', { ultra: 10000, livis: 10000 }],
  ['truffle-gold', 'Трюфельное золото', 'перламутр, особая серия', { ultra: 10000, livis: 10000 }],
  ['night-purple', 'Ночной фиолетовый', 'перламутр, особая серия', { ultra: 10000, livis: 10000 }],
  ['livis-brown', 'Коричневый с золотом', 'двухцветный кузов Livis', { ultra: null, livis: 20000 }],
  ['livis-black', 'Чёрный с золотом', 'двухцветный кузов Livis', { ultra: null, livis: 20000 }],
  ['livis-green', 'Зелёный с золотом', 'двухцветный кузов Livis', { ultra: null, livis: 20000 }],
  ['livis-purple', 'Фиолетовый с золотом', 'двухцветный кузов Livis', { ultra: null, livis: 20000 }],
].map(([id, name, note, avail]) => ({
  id: id as string,
  name: name as string,
  note: note as string,
  avail: avail as Avail,
  photo: { desktop: opt('colors', id as string), mobile: opt('colors', `${id}-m`) },
  swatch: opt('options', `paint-${id}`),
}));

export const wheels: (Option & { image: string })[] = [
  { id: '21-black', name: '21″ чёрные', note: 'шины Michelin 285/45 R21', avail: both },
  { id: '21-silver', name: '21″ серебристые', note: 'шины Michelin 285/45 R21', avail: both },
  { id: '22-silver', name: '22″ серебристые', note: 'только Ultra, шины 285/40 R22', avail: { ultra: 10000, livis: null } },
  { id: '22-grey', name: '22″ «кристальный графит»', note: 'только Livis, шины 285/40 R22', avail: { ultra: null, livis: 10000 } },
].map((w) => ({ ...w, image: opt('options', `wheel-${w.id}`) }));

export const interiors: (Option & { swatch: string })[] = [
  { id: 'green-white', name: 'Зелёный с белым', avail: both },
  { id: 'brown-coffee', name: 'Коричневый с кофейным', avail: both },
  { id: 'grey-purple', name: 'Серый с фиолетовым', avail: both },
  { id: 'brown-white', name: 'Коричневый с белым', avail: both },
].map((t) => ({ ...t, swatch: opt('options', `trim-${t.id}`) }));

/** Фото салона на сайте Li Auto – одного варианта отделки, по цветам их нет */
export const interiorPhotos = ['lounge', 'front-seats', 'dashboard', 'second-row', 'ambient', 'top-view'].map((id) => ({
  id,
  desktop: opt('interior', id),
  mobile: opt('interior', `${id}-m`),
}));

export const l9Config = {
  path: '/catalog/lixiang/l9/konfigurator/',
  seoTitle: 'Конфигуратор нового Lixiang L9 2026: цвета, диски, салон | Evolution Car',
  seoDescription:
    'Соберите новый Lixiang L9 2026: версии Ultra и Livis, 11 цветов кузова, диски 21″ и 22″, четыре варианта салона. ' +
    'Цены Li Auto в Китае и расчёт под ключ в Минске.',
  h1: 'Конфигуратор нового Lixiang L9',
  lead: 'Выберите версию, цвет, диски и салон – менеджер подберёт автомобиль под вашу конфигурацию и пришлёт расчёт под ключ.',
  cardLink: { label: 'Характеристики Lixiang L9', href: '/lixiangl9/' },
  ui: {
    exterior: 'Кузов',
    interior: 'Салон',
    trimTitle: 'Версия',
    paintTitle: 'Цвет кузова',
    wheelTitle: 'Диски',
    interiorTitle: 'Цвет салона',
    commonTitle: 'У обеих версий',
    summaryTitle: 'Ваш новый Lixiang L9',
    chinaPrice: 'Цена Li Auto в Китае',
    turnkey: 'Под ключ в Минске – рассчитаем под вашу конфигурацию',
    included: 'входит',
    unavailable: 'не для этой версии',
    switched: 'Этот вариант есть только у версии',
    formTitle: 'Получить расчёт под ключ',
    prev: 'Предыдущий кадр',
    stageLabel: 'Новый Lixiang L9',
    viewLabel: 'Вид',
    altPaint: 'Lixiang L9, цвет',
    altInterior: 'Салон Lixiang L9',
    wheelsWord: 'диски',
    interiorWord: 'салон',
    leadSource: 'Конфигуратор нового L9',
    next: 'Следующий кадр',
    photoNote:
      'Фото – официальные изображения Li Auto. Салон на фото – в одном из вариантов отделки. ' +
      'Цены – розничные цены Li Auto в Китае на 13.10.2026; доступность вариантов у конкретного автомобиля ' +
      'менеджер подтвердит до договора.',
  },
};
