/**
 * Нормализует ввод телефона к виду +375 29 123-45-67.
 *
 * Живёт отдельным модулем, потому что номер приводят к одному виду и
 * форма заявки, и опрос: сервер принимает только цифры, плюс, пробелы,
 * скобки и дефисы, а человек пишет номер с точками, припиской «вайбер»
 * или через длинное тире. Без общей нормализации такая заявка уходила
 * бы в отказ уже на сервере.
 */
export function maskPhone(raw: string): string {
  let d = raw.replace(/\D/g, '');
  // 80291234567 и 0291234567 — местные записи того же номера
  if (d.startsWith('8')) d = '375' + d.slice(1);
  else if (d.startsWith('0')) d = '375' + d.slice(1);
  if (d.startsWith('3750')) d = '375' + d.slice(4);
  if (!d) return '';

  if (!d.startsWith('375')) return '+' + d.slice(0, 15);

  d = d.slice(0, 12);
  const p = [d.slice(0, 3), d.slice(3, 5), d.slice(5, 8), d.slice(8, 10), d.slice(10, 12)];
  let out = '+' + p[0];
  if (p[1]) out += ' ' + p[1];
  if (p[2]) out += ' ' + p[2];
  if (p[3]) out += '-' + p[3];
  if (p[4]) out += '-' + p[4];
  return out;
}

/** Номер пригоден к отправке: местный код плюс семь цифр номера. */
export function phoneFilled(value: string): boolean {
  return value.replace(/\D/g, '').length >= 11;
}

/**
 * Обработчик ввода телефона для полей с маской.
 *
 * Значение пишется и в поле, и в состояние: когда человек допечатывает
 * символ, который маска выбрасывает (точку, букву из «вайбер»), маска
 * возвращает прежнюю строку, состояние не меняется — и Preact не трогает
 * DOM. Без явной записи в поле этот символ остался бы на экране, хотя в
 * заявку он не попадает.
 */
export function handlePhoneInput(event: Event, set: (value: string) => void): void {
  const el = event.target as HTMLInputElement;
  const masked = maskPhone(el.value);
  el.value = masked;
  set(masked);
}
