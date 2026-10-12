/**
 * Страны для поля телефона с выбором страны. Маска – национальная часть
 * номера после кода, «#» – цифра. Список – соседи и страны, откуда
 * реально пишут в автосалон; остальным – «Другая страна» без маски.
 */
export interface Country {
  iso: string;
  name: string;
  flag: string;
  dial: string;
  mask: string;
  /** Меньше цифр, чем в маске, – если номера в стране бывают короче */
  min?: number;
}

export const COUNTRIES: Country[] = [
  { iso: 'BY', name: 'Беларусь', flag: '🇧🇾', dial: '375', mask: '## ###-##-##' },
  { iso: 'RU', name: 'Россия', flag: '🇷🇺', dial: '7', mask: '### ###-##-##' },
  { iso: 'KZ', name: 'Казахстан', flag: '🇰🇿', dial: '7', mask: '### ###-##-##' },
  { iso: 'UA', name: 'Украина', flag: '🇺🇦', dial: '380', mask: '## ###-##-##' },
  { iso: 'PL', name: 'Польша', flag: '🇵🇱', dial: '48', mask: '### ### ###' },
  { iso: 'LT', name: 'Литва', flag: '🇱🇹', dial: '370', mask: '### #####' },
  { iso: 'LV', name: 'Латвия', flag: '🇱🇻', dial: '371', mask: '## ### ###' },
  { iso: 'EE', name: 'Эстония', flag: '🇪🇪', dial: '372', mask: '#### ####', min: 7 },
  { iso: 'GE', name: 'Грузия', flag: '🇬🇪', dial: '995', mask: '### ## ## ##' },
  { iso: 'AM', name: 'Армения', flag: '🇦🇲', dial: '374', mask: '## ######' },
  { iso: 'AZ', name: 'Азербайджан', flag: '🇦🇿', dial: '994', mask: '## ###-##-##' },
  { iso: 'UZ', name: 'Узбекистан', flag: '🇺🇿', dial: '998', mask: '## ###-##-##' },
  { iso: 'KG', name: 'Кыргызстан', flag: '🇰🇬', dial: '996', mask: '### ### ###' },
  { iso: 'MD', name: 'Молдова', flag: '🇲🇩', dial: '373', mask: '### ## ###' },
  { iso: 'XX', name: 'Другая страна', flag: '🌐', dial: '', mask: '' },
];

const byIso = (iso: string) => COUNTRIES.find((c) => c.iso === iso);

/** Часовые пояса, по которым страна определяется однозначно */
const ZONES: Record<string, string> = {
  'Europe/Minsk': 'BY', 'Europe/Kiev': 'UA', 'Europe/Kyiv': 'UA', 'Europe/Warsaw': 'PL',
  'Europe/Vilnius': 'LT', 'Europe/Riga': 'LV', 'Europe/Tallinn': 'EE', 'Asia/Tbilisi': 'GE',
  'Asia/Yerevan': 'AM', 'Asia/Baku': 'AZ', 'Asia/Tashkent': 'UZ', 'Asia/Samarkand': 'UZ',
  'Asia/Bishkek': 'KG', 'Europe/Chisinau': 'MD',
  'Asia/Almaty': 'KZ', 'Asia/Qostanay': 'KZ', 'Asia/Aqtobe': 'KZ', 'Asia/Aqtau': 'KZ',
  'Asia/Atyrau': 'KZ', 'Asia/Oral': 'KZ', 'Asia/Qyzylorda': 'KZ',
};
const RU_ZONES = /^(Europe\/(Moscow|Samara|Volgograd|Kaliningrad|Astrakhan|Saratov|Ulyanovsk|Kirov)|Asia\/(Yekaterinburg|Omsk|Novosibirsk|Barnaul|Tomsk|Novokuznetsk|Krasnoyarsk|Irkutsk|Chita|Yakutsk|Khandyga|Vladivostok|Ust-Nera|Sakhalin|Magadan|Srednekolymsk|Kamchatka|Anadyr))$/;

/**
 * Страна посетителя без сторонних сервисов: по часовому поясу устройства,
 * затем по региону языка браузера. Внешний геосервис по IP – это ещё
 * одна передача данных посетителя, ради подсказки в поле она не нужна.
 * Ничего не нашли – Беларусь: автосалон в Минске.
 */
export function detectCountry(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
    if (ZONES[tz]) return ZONES[tz];
    if (RU_ZONES.test(tz)) return 'RU';
  } catch { /* старый браузер без Intl – идём дальше */ }
  for (const lang of navigator.languages ?? [navigator.language]) {
    const region = lang.split('-')[1]?.toUpperCase();
    if (region && region !== 'XX' && byIso(region)) return region;
  }
  return 'BY';
}

/** Сколько цифр нужно национальной части номера */
function need(c: Country): number {
  return c.min ?? (c.mask.match(/#/g)?.length ?? 0);
}

/**
 * Национальная часть номера по маске страны. Человек часто вставляет номер
 * целиком – с кодом страны или в местной записи (8 029…, 8 916…) – поэтому
 * код и местный префикс срезаются, а не дописываются к номеру второй раз.
 */
export function maskNational(raw: string, c: Country): string {
  let d = raw.replace(/\D/g, '');
  if (!c.mask) return d.slice(0, 15);
  const len = c.mask.match(/#/g)!.length;
  if (d.length > len && d.startsWith(c.dial)) d = d.slice(c.dial.length);
  // Местный префикс срезается сразу, иначе при наборе по цифре номер упёрся
  // бы в длину маски раньше, чем стал похож на местную запись. Ни в одной
  // стране списка номер после кода не начинается с 0 – это всегда префикс.
  // В Беларуси и Литве номер после кода не начинается и с 8; «375…» без
  // плюса – тоже не белорусский номер, а он же с кодом страны.
  if (c.iso === 'BY') d = d.replace(/^375|^8/, '');
  if (c.iso === 'LT') d = d.replace(/^8/, '');
  d = d.replace(/^0+/, '');
  // В России и Казахстане номера на 8 бывают (8 800, 812), поэтому 8
  // срезаем сразу только перед мобильным 9xx, остальное – когда номер целиком
  if (c.dial === '7' && /^89/.test(d)) d = d.slice(1);
  if (c.dial === '7' && /^8\d{10}$/.test(d)) d = d.slice(1);
  if (c.iso === 'UZ' && /^8\d{9}$/.test(d)) d = d.slice(1);
  d = d.slice(0, len);
  let out = '';
  let i = 0;
  for (const ch of c.mask) {
    if (i >= d.length) break;
    out += ch === '#' ? d[i++] : ch;
  }
  return out;
}

/**
 * Разбор поля телефона. Номер с «+» несёт страну в себе: +7 из
 * белорусского поля не должен превратиться в +375 7… Поэтому страна
 * берётся из кода, а в поле остаётся только номер. Пока код набран не до
 * конца (+3, +37), поле оставляем как есть и ждём следующую цифру.
 */
export function parsePhoneInput(raw: string, current: string): { iso: string; national: string } {
  const cur = byIso(current) ?? COUNTRIES[0];
  if (!raw.trim().startsWith('+')) return { iso: current, national: maskNational(raw, cur) };
  const d = raw.replace(/\D/g, '');
  if (!d) return { iso: current, national: '+' };
  const hit = cur.dial && d.startsWith(cur.dial)
    ? cur
    : COUNTRIES.filter((c) => c.dial && d.startsWith(c.dial)).sort((a, b) => b.dial.length - a.dial.length)[0];
  // +7 7xx – Казахстан: в России номер после кода с 7 не начинается.
  // Пока набрано только +7, страну не выбираем – ждём следующую цифру.
  if (hit?.dial === '7' && d.length === 1) return { iso: current, national: '+7' };
  const country = hit?.dial === '7' && d[1] === '7' ? byIso('KZ')! : hit;
  if (country) return { iso: country.iso, national: maskNational(d.slice(country.dial.length), country) };
  if (COUNTRIES.some((c) => c.dial.startsWith(d))) return { iso: current, national: '+' + d };
  return { iso: 'XX', national: d.slice(0, 15) };
}

/** Номер целиком, в том виде, в каком он уходит в заявку */
export function fullPhone(national: string, iso: string): string {
  const c = byIso(iso);
  if (!c?.dial) return '+' + national.replace(/\D/g, '');
  return `+${c.dial} ${national}`;
}

/** Номер набран полностью для своей страны */
export function nationalFilled(national: string, iso: string): boolean {
  const c = byIso(iso);
  const digits = national.replace(/\D/g, '').length;
  if (!c?.mask) return digits >= 8;
  return digits >= need(c);
}
