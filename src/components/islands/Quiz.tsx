import { useState } from 'preact/hooks';
import { goToThanks, submitLead } from '../../lib/submit';
import { fullPhone, nationalFilled } from '../../lib/phone';
import { Consent, PhoneField } from './LeadForm';

interface Step { q: string; a: string[] }
interface Props {
  title: string;
  steps: Step[];
  contactQuestion: string;
  channels: string[];
  success: string;
  onDone?: () => void;
}

export default function Quiz({ title, steps, contactQuestion, channels, success, onDone }: Props) {
  const total = steps.length + 1;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [channel, setChannel] = useState(channels[0]);
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('BY');
  const [agreed, setAgreed] = useState(false);
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  const pick = (value: string) => {
    const next = [...answers];
    next[step] = value;
    setAnswers(next);
    setStep(step + 1);
  };

  const send = async () => {
    if (!nationalFilled(phone, country)) return setError('Укажите номер телефона полностью');
    if (!agreed) return setError('Отметьте согласие на обработку данных');
    setError('');
    setState('sending');
    // Телефон уходит без приписки канала: сервер принимает только номер,
    // а удобный способ связи виден в источнике заявки.
    const ok = await submitLead({
      name: `Опрос: ${answers.join(' / ')}`,
      phone: fullPhone(phone, country),
      source: `Опрос на расчёт стоимости · ${channel}`,
      consent: agreed,
    });
    // Отказ сервера нельзя показывать как успех: человек уйдёт, считая,
    // что заявка принята, а её не будет ни в базе, ни в уведомлениях.
    if (!ok) {
      setState('idle');
      setError('Не удалось отправить. Позвоните нам или попробуйте ещё раз.');
      return;
    }
    setState('done');
    onDone?.();
    goToThanks();
  };

  if (state === 'done') return <p class="quiz__done">{success}</p>;

  return (
    <div class="quiz">
      <p class="quiz__title">{title}</p>
      <div class="quiz__bar" aria-hidden="true">
        <i style={{ width: `${((step + 1) / total) * 100}%` }} />
      </div>
      <p class="quiz__counter">Шаг {step + 1} из {total}</p>

      {step < steps.length ? (
        <>
          <p class="quiz__q">{steps[step].q}</p>
          <div class="quiz__options">
            {steps[step].a.map((option) => (
              <button class="quiz__option" type="button" key={option} onClick={() => pick(option)}>
                {option}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p class="quiz__q">{contactQuestion}</p>
          <div class="quiz__channels">
            {channels.map((c) => (
              <button
                class={c === channel ? 'quiz__chip is-active' : 'quiz__chip'}
                type="button"
                key={c}
                onClick={() => setChannel(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <PhoneField
            label="Ваш номер телефона"
            country={country}
            national={phone}
            onChange={(iso, national) => {
              setCountry(iso);
              setPhone(national);
            }}
          />
          <Consent agreed={agreed} onChange={setAgreed} />
          <button
            class={`btn btn--block${agreed ? '' : ' is-locked'}`}
            type="button"
            onClick={send}
            disabled={state === 'sending'}
          >
            {state === 'sending' ? 'Отправляем…' : 'Получить расчёт'}
          </button>
        </>
      )}

      {error && <p class="lead-form__error" role="alert">{error}</p>}

      {step > 0 && state === 'idle' && (
        <button class="quiz__back" type="button" onClick={() => setStep(step - 1)}>
          ← Назад
        </button>
      )}
    </div>
  );
}
