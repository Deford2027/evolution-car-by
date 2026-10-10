export interface NavLink { label: string; href: string }

export const site = {
  brand: 'Evolution Car',
  tagline: 'Автосалон автомобилей в наличии и под заказ',
  phone: '+375 (29) 135-88-88',
  phonePlain: '+375 29 135-88-88',
  phoneHref: 'tel:+375291358888',
  hoursShort: 'Ежедневно с 10 до 19',
  hoursFull: 'Ежедневно, 9:00 — 20:00',
  showroom: 'пр-т Машерова, 15/4',
  service: '4-й пер. Монтажников, 13',
  city: 'Минск',
  telegram: 'https://t.me/',
  whatsapp: 'https://wa.me/375291358888',
  vk: 'https://vk.com/',
} as const;

// href, начинающийся с #, — якорь на главной: шапка добавляет к нему свой префикс
export const nav: NavLink[] = [
  { label: 'Авто в наличии', href: '/catalog/in_stock/' },
  { label: 'Авто под заказ', href: '/catalog/made_to_order/' },
  { label: 'Каталог', href: '/catalog/' },
  { label: 'Пригнали', href: '/portfolio/' },
  { label: 'О компании', href: '/about/' },
  { label: 'Контакты', href: '/contact/' },
];

export const ui = {
  order: 'Заказать',
  menu: 'Меню',
  close: 'Закрыть',
  prev: 'Назад',
  next: 'Далее',
  submit: 'Отправить заявку',
  sending: 'Отправляем…',
  name: 'Ваше имя',
  phone: 'Ваш номер телефона',
  consent: 'Я ознакомлен (-а) с Политикой обработки персональных данных и даю согласие на их использование',
  consentShort: 'Согласен на обработку персональных данных',
  success: 'Спасибо! Заявка отправлена. Менеджер свяжется с вами.',
  errorName: 'Укажите имя',
  errorPhone: 'Укажите корректный номер телефона',
  errorConsent: 'Нужно согласие на обработку данных',
} as const;
