import { useEffect, useRef, useState } from 'preact/hooks';
import Quiz from './Quiz';
import LeadForm from './LeadForm';

type Kind = 'quiz' | 'video' | 'lead' | null;

interface Props {
  quizTitle: string;
  quizSteps: { q: string; a: string[] }[];
  contactQuestion: string;
  channels: string[];
  success: string;
  videoPoster: string;
}

/** Один диалог на страницу: слушает клики по [data-open] делегированием. */
export default function ModalHost({
  quizTitle,
  quizSteps,
  contactQuestion,
  channels,
  success,
  videoPoster,
}: Props) {
  const [kind, setKind] = useState<Kind>(null);
  // текст нажатой кнопки: заголовок окна и источник заявки в админке
  const [action, setAction] = useState('');
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const trigger = (e.target as HTMLElement).closest<HTMLElement>('[data-open]');
      if (!trigger) return;
      const value = trigger.dataset.open;
      if (value === 'quiz' || value === 'video' || value === 'lead') {
        e.preventDefault();
        setAction(trigger.textContent?.trim().slice(0, 60) || 'Оставить заявку');
        setKind(value);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (kind && !dialog.open) dialog.showModal();
    if (!kind && dialog.open) dialog.close();
    document.body.style.overflow = kind ? 'hidden' : '';
  }, [kind]);

  return (
    <dialog class="modal" ref={ref} onClose={() => setKind(null)}>
      <button class="modal__close" type="button" onClick={() => setKind(null)} aria-label="Закрыть">
        ✕
      </button>

      {kind === 'quiz' && (
        <Quiz
          title={quizTitle}
          steps={quizSteps}
          contactQuestion={contactQuestion}
          channels={channels}
          success={success}
        />
      )}

      {/* Кнопки, которые никуда не ведут, открывают отдельную заявку:
          человек остаётся там, где нажал, а не уезжает к форме в конце
          страницы. В разметке у них href="#final" – без скриптов сработает
          обычный переход к форме. */}
      {kind === 'lead' && (
        <div class="lead-modal">
          <p class="lead-modal__title">{action}</p>
          <p class="lead-modal__text">
            Оставьте контактные данные – менеджер свяжется с вами и ответит на вопросы.
          </p>
          <LeadForm
            namePlaceholder="Ваше имя"
            phonePlaceholder="Ваш номер телефона"
            cta="Отправить заявку"
            success={success}
            source={`Окно заявки: ${action}`}
          />
        </div>
      )}

      {kind === 'video' && (
        <figure class="modal__video">
          <img src={videoPoster} alt="" width="900" height="600" />
          <figcaption>
            Видео о сервисе появится здесь, когда клиент передаст исходник или ссылку.
          </figcaption>
        </figure>
      )}
    </dialog>
  );
}
