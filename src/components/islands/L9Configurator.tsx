import { useEffect, useRef, useState } from 'preact/hooks';
import LeadForm from './LeadForm';

interface Color {
  id: string;
  name: string;
  note: string;
  group: 'paint' | 'livis';
  desktop: string;
  mobile: string;
  swatch: string;
}
interface Trim {
  id: string;
  name: string;
  years: string;
  priceUsd: number | null;
  rows: { label: string; value: string }[];
}
interface Texts {
  colorsTitle: string;
  paintGroup: string;
  livisGroup: string;
  trimTitle: string;
  summaryTitle: string;
  priceFrom: string;
  priceOnRequest: string;
  bynRate: number;
  formTitle: string;
  photoNote: string;
  livisNote: string;
  prev: string;
  next: string;
}
interface Props {
  colors: Color[];
  trims: Trim[];
  texts: Texts;
  form: { namePlaceholder: string; phonePlaceholder: string; cta: string; success: string };
}

const money = (n: number) => n.toLocaleString('ru-RU');

/**
 * Конфигуратор L9 на официальных фото по цветам. Смена цвета – плавная:
 * новое фото проявляется поверх прежнего, прежнее остаётся подложкой, так
 * что между кадрами нет пустого фона. Фото чуть смещается за мышью, на
 * телефоне цвет листается свайпом, с клавиатуры – стрелками.
 */
export default function L9Configurator({ colors, trims, texts, form }: Props) {
  const [colorId, setColorId] = useState(colors[0].id);
  // последний полностью проявленный кадр – подложка под новым; меняется
  // по концу анимации, а не по клику, иначе при быстром листании
  // подложкой становится полупрозрачный или ещё не загруженный кадр
  const [shownId, setShownId] = useState(colors[0].id);
  const [trimId, setTrimId] = useState(trims[trims.length - 1].id);
  const stage = useRef<HTMLDivElement>(null);
  const swipeX = useRef<number | null>(null);

  const index = colors.findIndex((c) => c.id === colorId);
  const color = colors[index];
  const under = shownId !== colorId ? colors.find((c) => c.id === shownId) : null;
  const trim = trims.find((t) => t.id === trimId)!;

  const pick = (id: string) => {
    if (id !== colorId) setColorId(id);
  };
  const step = (dir: 1 | -1) => pick(colors[(index + dir + colors.length) % colors.length].id);

  // соседние фото грузим заранее, чтобы листание было без задержки
  useEffect(() => {
    const desktop = matchMedia('(min-width: 768px)').matches;
    for (const d of [1, -1]) {
      const c = colors[(index + d + colors.length) % colors.length];
      new Image().src = desktop ? c.desktop : c.mobile;
    }
  }, [index]);

  const preload = (c: Color) => {
    new Image().src = matchMedia('(min-width: 768px)').matches ? c.desktop : c.mobile;
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || !stage.current) return;
    const r = stage.current.getBoundingClientRect();
    stage.current.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    stage.current.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };
  const onLeave = () => {
    stage.current?.style.setProperty('--px', '0');
    stage.current?.style.setProperty('--py', '0');
  };
  const onDown = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') swipeX.current = e.clientX;
  };
  const onUp = (e: PointerEvent) => {
    if (swipeX.current === null) return;
    const dx = e.clientX - swipeX.current;
    swipeX.current = null;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.repeat) return;
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  };

  const groups: [string, Color[]][] = [
    [texts.paintGroup, colors.filter((c) => c.group === 'paint')],
    [texts.livisGroup, colors.filter((c) => c.group === 'livis')],
  ];
  // двухцветные кузова бывают только у версии Livis, которой нет в выборе
  // комплектаций, – это видно и в итоге, и в заявке менеджеру
  const livis = color.group === 'livis';
  const summary = `${trim.name} ${trim.years}, ${color.name.toLowerCase()}${livis ? ` (${texts.livisNote})` : ''}`;

  return (
    <div class="l9c">
      <div
        class="l9c__stage"
        ref={stage}
        tabIndex={0}
        aria-roledescription="галерея цветов"
        role="region"
        aria-label="Lixiang L9 в выбранном цвете"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={() => (swipeX.current = null)}
        onKeyDown={onKey}
      >
        {under && (
          <picture class="l9c__shot l9c__shot--under" key={`u-${under.id}`}>
            <source media="(min-width: 768px)" srcset={under.desktop} />
            <img src={under.mobile} alt="" />
          </picture>
        )}
        <picture
          class={`l9c__shot${under ? ' l9c__shot--in' : ''}`}
          key={color.id}
          onAnimationEnd={() => setShownId(color.id)}
        >
          <source media="(min-width: 768px)" srcset={color.desktop} />
          <img src={color.mobile} alt={`Lixiang L9, цвет «${color.name}»`} />
        </picture>

        <div class="l9c__caption" aria-live="polite">
          <span class="l9c__count">
            {String(index + 1).padStart(2, '0')} / {String(colors.length).padStart(2, '0')}
          </span>
          <span class="l9c__name">{color.name}</span>
          <span class="l9c__note">{color.note}</span>
        </div>
        <div class="l9c__arrows">
          <button type="button" class="l9c__arrow" onClick={() => step(-1)} aria-label={texts.prev}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </button>
          <button type="button" class="l9c__arrow l9c__arrow--next" onClick={() => step(1)} aria-label={texts.next}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </button>
        </div>
      </div>

      <div class="l9c__panel">
        <section class="l9c__block">
          <h2 class="l9c__title">{texts.colorsTitle}</h2>
          {groups.map(([label, list]) => (
            <div class="l9c__group" key={label}>
              <p class="l9c__group-label">{label}</p>
              <div class="l9c__swatches" role="group" aria-label={label}>
                {list.map((c) => (
                  <button
                    type="button"
                    aria-pressed={c.id === colorId}
                    aria-label={`${c.name}, ${c.note}`}
                    title={c.name}
                    class={`l9c__swatch${c.id === colorId ? ' is-active' : ''}`}
                    key={c.id}
                    onClick={() => pick(c.id)}
                    onPointerEnter={() => preload(c)}
                    onFocus={() => preload(c)}
                  >
                    <img src={c.swatch} alt="" width="107" height="70" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section class="l9c__block">
          <h2 class="l9c__title">{texts.trimTitle}</h2>
          <div class="l9c__trims" role="group" aria-label={texts.trimTitle}>
            {trims.map((t) => (
              <button
                type="button"
                aria-pressed={t.id === trimId}
                class={`l9c__trim${t.id === trimId ? ' is-active' : ''}`}
                key={t.id}
                onClick={() => setTrimId(t.id)}
              >
                <span class="l9c__trim-name">{t.name}</span>
                <span class="l9c__trim-years">{t.years}</span>
              </button>
            ))}
          </div>
          <dl class="l9c__rows">
            {trim.rows.map((r) => (
              <div class="l9c__row" key={r.label}>
                <dt>{r.label}</dt>
                <dd>{r.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section class="l9c__block l9c__summary">
          <p class="l9c__summary-title">{texts.summaryTitle}</p>
          <p class="l9c__summary-config">{summary}</p>
          {trim.priceUsd ? (
            <p class="l9c__price">
              {texts.priceFrom} {money(trim.priceUsd)} $
              <span> ≈ {money(trim.priceUsd * texts.bynRate)} BYN</span>
            </p>
          ) : (
            <p class="l9c__price l9c__price--ask">{texts.priceOnRequest}</p>
          )}
          <p class="l9c__form-title">{texts.formTitle}</p>
          <LeadForm
            namePlaceholder={form.namePlaceholder}
            phonePlaceholder={form.phonePlaceholder}
            cta={form.cta}
            success={form.success}
            source={`Конфигуратор L9: ${summary}`}
          />
        </section>
        <p class="l9c__photo-note">{texts.photoNote}</p>
      </div>
    </div>
  );
}
