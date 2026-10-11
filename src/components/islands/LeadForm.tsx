import { useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { handlePhoneInput, phoneFilled } from '../../lib/phone';

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
  const [company, setCompany] = useState(''); // ловушка для роботов, человек её не видит
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const onSubmit = async (e: JSX.TargetedEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!phoneFilled(phone)) {
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
    const ok = await submitLead({ name, phone, source, consent: agreed, company });
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
          onInput={(e) => handlePhoneInput(e, setPhone)}
          required
        />
        <button class="btn lead-form__submit" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Отправляем…' : cta}
        </button>
      </div>

      {/* Ловушка: поле убрано с экрана и из порядка обхода, заполнить его
          может только робот, разбирающий разметку. Такая заявка отсеивается. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autocomplete="off"
        aria-hidden="true"
        value={company}
        onInput={(e) => setCompany((e.target as HTMLInputElement).value)}
        style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0"
      />

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
