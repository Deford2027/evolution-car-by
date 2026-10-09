import { useEffect, useRef, useState } from 'preact/hooks';
import Quiz from './Quiz';

type Kind = 'quiz' | 'video' | null;

interface Props {
  quizTitle: string;
  quizSteps: { q: string; a: string[] }[];
  contactQuestion: string;
  channels: string[];
  consent: string;
  success: string;
  videoPoster: string;
}

/** Один диалог на страницу: слушает клики по [data-open] делегированием. */
export default function ModalHost({
  quizTitle,
  quizSteps,
  contactQuestion,
  channels,
  consent,
  success,
  videoPoster,
}: Props) {
  const [kind, setKind] = useState<Kind>(null);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const trigger = (e.target as HTMLElement).closest<HTMLElement>('[data-open]');
      if (!trigger) return;
      const value = trigger.dataset.open;
      if (value === 'quiz' || value === 'video') {
        e.preventDefault();
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
          consent={consent}
          success={success}
        />
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
