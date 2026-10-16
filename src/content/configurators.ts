// Список собранных конфигураторов – для страницы-хаба и перелинковки.
// Обложка – рендер из самого конфигуратора, чтобы не держать отдельные картинки.

export interface ConfiguratorCard {
  slug: string;
  brand: string;
  model: string;
  href: string;
  cover: string;
  powertrain: string;
  priceFromCny: number;
  options: string;
  summary: string;
}

export const configurators: ConfiguratorCard[] = [
  {
    slug: 'lixiang-l6', brand: 'Lixiang', model: 'Новый L6',
    href: '/catalog/lixiang/l6/konfigurator/',
    cover: '/img/lixiang-l6/render/meteor-grey--20-black--front.webp',
    powertrain: 'Гибрид EREV', priceFromCny: 249800,
    options: '3 цвета, 4 варианта дисков, 3 салона',
    summary: 'Кроссовер на каждый день: электромотор с бензиновым генератором, запас хода больше 1000 км.',
  },
  {
    slug: 'lixiang-l8', brand: 'Lixiang', model: 'Новый L8',
    href: '/catalog/lixiang/l8/konfigurator/',
    cover: '/img/lixiang-l8/render/ultra--gt-silver--21-black--front.webp',
    powertrain: 'Гибрид EREV', priceFromCny: 369800,
    options: '10 цветов, 5 вариантов дисков, 4 салона',
    summary: 'Шестиместный SUV с версиями Ultra и Livis: двухцветный кузов, пневма, рулевое по проводам.',
  },
  {
    slug: 'lixiang-l9', brand: 'Lixiang', model: 'Новый L9',
    href: '/catalog/lixiang/l9/konfigurator/',
    cover: '/img/lixiang-l9/render/pearl-white--21-black--front.webp',
    powertrain: 'Гибрид EREV', priceFromCny: 459800,
    options: '11 цветов, 4 варианта дисков, 4 салона',
    summary: 'Флагманский шестиместный SUV: 1650 км суммарного хода, пневмоподвеска третьего поколения.',
  },
  {
    slug: 'lixiang-i8', brand: 'Lixiang', model: 'i8',
    href: '/catalog/lixiang/i8/konfigurator/',
    cover: '/img/lixiang-i8/render/awd--pearl-white--20-aero--front.webp',
    powertrain: 'Электромобиль', priceFromCny: 309800,
    options: '4 цвета, 2 варианта дисков, 2 салона',
    summary: 'Электрический SUV с полным или задним приводом и запасом хода до 780 км.',
  },
  {
    slug: 'lixiang-i9', brand: 'Lixiang', model: 'Новый i9',
    href: '/catalog/lixiang/i9/konfigurator/',
    cover: '/img/lixiang-i9/render/solo--pearl-white--21-aero--front.webp',
    powertrain: 'Электромобиль', priceFromCny: 369800,
    options: '8 цветов, 3 варианта дисков, 2 салона',
    summary: 'Большой электрический SUV: батарея 101 кВт·ч, четыре кресла «нулевой гравитации».',
  },
  {
    slug: 'lixiang-mega', brand: 'Lixiang', model: 'Новый MEGA',
    href: '/catalog/lixiang/mega/konfigurator/',
    cover: '/img/lixiang-mega/render/solo--panda-white--18-aero--front.webp',
    powertrain: 'Электромобиль', priceFromCny: 509800,
    options: '5 цветов, 3 варианта дисков, 2 салона',
    summary: 'Минивэн-гостиная: батарея 108 кВт·ч, вращающиеся кресла, активное шасси 800 В.',
  },
  {
    slug: 'xiaomi-su7', brand: 'Xiaomi', model: 'SU7',
    href: '/catalog/xiaomi/su7/konfigurator/',
    cover: '/img/xiaomi-su7/render/capri-blue--19-diamond--front.webp',
    powertrain: 'Электромобиль', priceFromCny: 219900,
    options: '7 цветов, 4 варианта дисков, 4 салона',
    summary: 'Электрический седан: версии SU7, Pro и Max, до 902 км хода и до 690 л. с.',
  },
  {
    slug: 'xiaomi-yu7', brand: 'Xiaomi', model: 'YU7',
    href: '/catalog/xiaomi/yu7/konfigurator/',
    cover: '/img/xiaomi-yu7/render/titanium--19-diamond--front.webp',
    powertrain: 'Электромобиль', priceFromCny: 233500,
    options: '6 цветов, 2 варианта дисков, 3 салона',
    summary: 'Электрический кроссовер: четыре версии, до 835 км хода и разгон от 3,23 с.',
  },
];

export const cny = (v: number) => `${v.toLocaleString('ru-RU')} ¥`;
