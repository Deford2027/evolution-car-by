import { useState } from 'preact/hooks';
import type { JSX } from 'preact';

type Status = 'idle' | 'sending' | 'done' | 'error';

interface Props {
  namePlaceholder: string;
  phonePlaceholder: string;
  cta: string;
  consent: string;
  success: string;
  /** compact — поля в столбец (карточка шага), wide — в строку (финальный оффер) */
  layout?: 'compact' | 'wide';
  source: string;
}

/** Нормализует ввод телефона к виду +375 29 123-45-67 */
function maskPhone(raw: string): string {
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

export default function LeadForm({
  namePlaceholder,
  phonePlaceholder,
  cta,
  consent,
  success,
  layout = 'compact',
  source,
}: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const onSubmit = async (e: JSX.TargetedEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (phone.replace(/\D/g, '').length < 11) {
      setError('Укажите номер телефона полностью');
      return;
    }
    if (!agreed) {
      setError('Отметьте согласие на обработку данных');
      return;
    }
    setError('');
    setStatus('sending');
    const { submitLead } = await import('../../lib/submit');
    const ok = await submitLead({ name, phone, source });
    setStatus(ok ? 'done' : 'error');
  };

  if (status === 'done') {
    return (
      <p class="lead-form__done" role="status">
        {success}
      </p>
    );
  }

  return (
    <form class={`lead-form lead-form--${layout}`} onSubmit={onSubmit} novalidate>
      <div class="lead-form__fields">
        <input
          class="lead-form__input"
          type="text"
          name="name"
          autocomplete="name"
          placeholder={namePlaceholder}
          value={name}
          onInput={(e) => setName((e.target as HTMLInputElement).value)}
        />
        <input
          class="lead-form__input"
          type="tel"
          name="phone"
          autocomplete="tel"
          inputMode="tel"
          placeholder={phonePlaceholder}
          value={phone}
          onInput={(e) => setPhone(maskPhone((e.target as HTMLInputElement).value))}
          required
        />
        <button class="btn lead-form__submit" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Отправляем…' : cta}
        </button>
      </div>

      <label class="lead-form__consent">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed((e.target as HTMLInputElement).checked)}
        />
        <span>{consent}</span>
      </label>

      {error && (
        <p class="lead-form__error" role="alert">
          {error}
        </p>
      )}
      {status === 'error' && (
        <p class="lead-form__error" role="alert">
          Не удалось отправить. Позвоните нам или попробуйте ещё раз.
        </p>
      )}
    </form>
  );
}
