export interface NavLink { label: string; href: string }

export const site = {
  brand: 'Evolution Car',
  tagline: 'Автосалон автомобилей в наличии и под заказ',
  phone: '+375 (29) 135-88-88',
  phonePlain: '+375 29 135-88-88',
  phoneHref: 'tel:+375291358888',
  email: 'evolution.car.by@gmail.com',
  emailHref: 'mailto:evolution.car.by@gmail.com',
  // юрлицо – оператор персональных данных и владелец сайта
  company: 'ООО «Тренд Экспресс Авто»',
  unp: '193710155',
  legalAddress: 'г. Минск, ул. Тиражная, 150, пом. 411',
  // график автосалона – он же в шапке рядом с телефоном отдела продаж
  hoursShort: 'Ежедневно, 09:00 – 18:00',
  hoursFull: 'Ежедневно, 09:00 – 18:00',
  hoursShowroom: 'Автосалон: ежедневно 09:00 – 18:00',
  hoursService: 'Сервис: ежедневно 09:00 – 19:00',
  showroom: 'проспект Машерова, 15/4',
  address: 'г. Минск, проспект Машерова, 15/4',
  city: 'Минск',
  telegram: 'https://t.me/evolutioncar_by',
  vk: 'https://vk.com/',
  instagram: 'https://www.instagram.com/evolutioncar.by/',
  tiktok: 'https://www.tiktok.com/@evolutioncar.by',
  youtube: 'https://www.youtube.com/@Evoutioncar.by1',
} as const;

// href, начинающийся с #, – якорь на главной: шапка добавляет к нему свой префикс
export const nav: NavLink[] = [
  { label: 'Авто в наличии', href: '/catalog/v-nalichii/' },
  { label: 'Авто под заказ', href: '/catalog/pod-zakaz/' },
  { label: 'Каталог', href: '/catalog/' },
  // скрыто по просьбе клиента, страница остаётся: { label: 'Конфигураторы', href: '/konfiguratory/' },
  { label: 'Электромобили', href: '/catalog/elektromobili/' },
  { label: 'Доставка', href: '/dostavka-i-rastamozhka/' },
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
