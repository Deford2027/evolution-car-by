import { useEffect, useRef, useState } from 'preact/hooks';
import LeadForm from './LeadForm';

type TrimId = 'ultra' | 'livis';
type Avail = Record<TrimId, number | null>;
interface Paint { id: string; name: string; note?: string; avail: Avail; swatch: string }
interface Shot { id: string; label: string; kind: 'exterior' | 'interior' }
interface Wheel { id: string; name: string; note?: string; avail: Avail; image: string }
interface Interior { id: string; name: string; avail: Avail; swatch: string }
interface Trim { id: TrimId; name: string; priceCny: number; rows: { label: string; value: string }[] }
interface Props {
  trims: Trim[];
  paints: Paint[];
  wheels: Wheel[];
  interiors: Interior[];
  shots: readonly Shot[];
  renderPaths: { exterior: string; interior: string };
  commonSpecs: { label: string; value: string }[];
  ui: Record<string, string>;
  form: { namePlaceholder: string; phonePlaceholder: string; cta: string; success: string };
}

const cny = (n: number) => `${n.toLocaleString('ru-RU')} ¥`;
const firstFor = <T extends { avail: Avail }>(list: T[], trim: TrimId) => list.find((o) => o.avail[trim] !== null)!;

/**
 * Конфигуратор нового L9 на официальных фото. Вариант, которого нет в
 * текущей версии, не прячется: при выборе версия переключается сама, а
 * несовместимые с ней варианты заменяются первыми доступными – так нельзя
 * собрать машину, которой не бывает. Кадры – официальные рендеры именно
 * выбранной сборки: диски меняются на машине, салон – в выбранном цвете.
 * Смена кадра плавная: под новым кадром лежит последний полностью
 * показанный, без пустого фона.
 */
export default function L9Configurator(p: Props) {
  const { ui } = p;
  const [trimId, setTrimId] = useState<TrimId>('ultra');
  const [paintId, setPaintId] = useState(p.paints[0].id);
  const [wheelId, setWheelId] = useState(p.wheels[0].id);
  const [interiorId, setInteriorId] = useState(p.interiors[0].id);
  const [shotIdx, setShotIdx] = useState(0);
  const [hint, setHint] = useState('');
  // кадр проявляется только после загрузки фото, иначе подложка уйдёт раньше
  const [loadedKey, setLoadedKey] = useState('');
  const stage = useRef<HTMLDivElement>(null);
  const swipeX = useRef<number | null>(null);

  const trim = p.trims.find((t) => t.id === trimId)!;
  const paint = p.paints.find((o) => o.id === paintId)!;
  const wheel = p.wheels.find((o) => o.id === wheelId)!;
  const interior = p.interiors.find((o) => o.id === interiorId)!;

  /** Путь к рендеру кадра для текущей (или переданной) сборки */
  const srcOf = (shot: Shot, cfg = { trimId, paintId, wheelId, interiorId }) =>
    (shot.kind === 'exterior' ? p.renderPaths.exterior : p.renderPaths.interior)
      .replace('{paint}', cfg.paintId)
      .replace('{wheel}', cfg.wheelId)
      .replace('{trim}', cfg.trimId)
      .replace('{interior}', cfg.interiorId)
      .replace('{shot}', shot.id);
  const shot = p.shots[shotIdx];
  const frame = {
    key: srcOf(shot),
    src: srcOf(shot),
    title: shot.kind === 'exterior' ? paint.name : interior.name,
    sub: shot.label,
  };
  const [shown, setShown] = useState(frame);
  const under = shown.key !== frame.key ? shown : null;

  /** Переключить версию и заменить несовместимые варианты */
  const applyTrim = (t: TrimId) => {
    setTrimId(t);
    if (paint.avail[t] === null) setPaintId(firstFor(p.paints, t).id);
    if (wheel.avail[t] === null) setWheelId(firstFor(p.wheels, t).id);
    if (interior.avail[t] === null) setInteriorId(firstFor(p.interiors, t).id);
  };
  const chooseTrim = (t: TrimId) => {
    setHint('');
    applyTrim(t);
  };
  /** Выбрать вариант; если его нет в текущей версии – перейти в ту, где он есть */
  const choose = (avail: Avail, set: () => void) => {
    if (avail[trimId] === null) {
      const other = (Object.keys(avail) as TrimId[]).find((t) => avail[t] !== null)!;
      applyTrim(other);
      setHint(`${ui.switched} ${p.trims.find((t) => t.id === other)!.name}`);
    } else setHint('');
    set();
  };
  // цвет кузова смотрим снаружи, диски – сбоку, салон – со второго ряда
  const choosePaint = (o: Paint) => {
    if (shot.kind === 'interior') setShotIdx(0);
    choose(o.avail, () => setPaintId(o.id));
  };
  const chooseWheel = (o: Wheel) => {
    setShotIdx(0);
    choose(o.avail, () => setWheelId(o.id));
  };
  const chooseInterior = (o: Interior) => {
    setShotIdx(p.shots.length - 1);
    choose(o.avail, () => setInteriorId(o.id));
  };

  const step = (dir: 1 | -1) => {
    setHint('');
    setShotIdx((shotIdx + dir + p.shots.length) % p.shots.length);
  };

  // все кадры текущей сборки грузим заранее – листание и миниатюры без ожидания
  useEffect(() => {
    for (const sh of p.shots) new Image().src = srcOf(sh);
  }, [trimId, paintId, wheelId, interiorId]);

  const onShotLoad = () => {
    setLoadedKey(frame.key);
    // без анимации (reduced motion) animationend не придёт – подложку убираем сразу
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) setShown(frame);
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

  const extra = (a: Avail) => a[trimId] ?? 0;
  const total = trim.priceCny + extra(paint.avail) + extra(wheel.avail) + extra(interior.avail);
  const price = (a: Avail) => (a[trimId] === null ? ui.unavailable : a[trimId] ? `+${cny(a[trimId]!)}` : ui.included);
  const summary = `${trim.name}: ${paint.name.toLowerCase()}, ${ui.wheelsWord} ${wheel.name}, ${ui.interiorWord} ${interior.name.toLowerCase()}`;
  const waiting = under && loadedKey !== frame.key;

  return (
    <div class="l9c">
      <div class="l9c__stage-wrap">
        <div
          class="l9c__stage"
          ref={stage}
          tabIndex={0}
          role="region"
          aria-label={ui.stageLabel}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          onPointerDown={onDown}
          onPointerUp={onUp}
          onPointerCancel={() => (swipeX.current = null)}
          onKeyDown={onKey}
        >
          {under && (
            <div class="l9c__shot l9c__shot--under" key={`u-${under.key}`}>
              <img src={under.src} alt="" />
            </div>
          )}
          <div
            class={`l9c__shot${waiting ? ' l9c__shot--wait' : under ? ' l9c__shot--in' : ''}`}
            key={frame.key}
            onAnimationEnd={() => setShown(frame)}
          >
            <img
              src={frame.src}
              alt={shot.kind === 'exterior' ? `${ui.altPaint} «${paint.name}», ${shot.label.toLowerCase()}` : `${ui.altInterior}: ${interior.name.toLowerCase()}`}
              onLoad={onShotLoad}
              onError={onShotLoad}
            />
          </div>

          <div class="l9c__caption" aria-live="polite">
            <span class="l9c__name">{frame.title}</span>
            <span class="l9c__note">{frame.sub}</span>
            <span class="l9c__chips">
              <span class="l9c__chip"><img src={wheel.image} alt="" width="24" height="24" />{wheel.name}</span>
              <span class="l9c__chip"><img src={interior.swatch} alt="" width="24" height="24" />{interior.name}</span>
            </span>
          </div>
          <div class="l9c__arrows">
            <button type="button" class="l9c__arrow" onClick={() => step(-1)} aria-label={ui.prev}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </button>
            <button type="button" class="l9c__arrow l9c__arrow--next" onClick={() => step(1)} aria-label={ui.next}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </button>
          </div>
        </div>

        <div class="l9c__thumbs" role="group" aria-label={ui.viewLabel}>
          {p.shots.map((sh, i) => (
            <button
              type="button"
              key={sh.id}
              aria-pressed={i === shotIdx}
              class={`l9c__thumb${i === shotIdx ? ' is-active' : ''}`}
              onClick={() => {
                setHint('');
                setShotIdx(i);
              }}
            >
              <img src={srcOf(sh)} alt="" width="160" height="120" loading="lazy" />
              <span>{sh.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div class="l9c__panel">
        <section class="l9c__block">
          <h2 class="l9c__title">{ui.trimTitle}</h2>
          <div class="l9c__trims" role="group" aria-label={ui.trimTitle}>
            {p.trims.map((t) => (
              <button type="button" key={t.id} aria-pressed={t.id === trimId} class={`l9c__trim${t.id === trimId ? ' is-active' : ''}`} onClick={() => chooseTrim(t.id)}>
                <span class="l9c__trim-name">{t.name}</span>
                <span class="l9c__trim-years">{cny(t.priceCny)}</span>
              </button>
            ))}
          </div>
          <dl class="l9c__rows">
            {trim.rows.map((r) => (
              <div class="l9c__row" key={r.label}><dt>{r.label}</dt><dd>{r.value}</dd></div>
            ))}
          </dl>
          {hint && <p class="l9c__hint" role="status">{hint}</p>}
        </section>

        <section class="l9c__block">
          <div class="l9c__head"><h2 class="l9c__title">{ui.paintTitle}</h2><span class="l9c__picked">{paint.name}</span></div>
          <div class="l9c__swatches" role="group" aria-label={ui.paintTitle}>
            {p.paints.map((o) => (
              <button
                type="button"
                key={o.id}
                aria-pressed={o.id === paintId}
                aria-label={`${o.name}, ${o.note}, ${price(o.avail)}`}
                title={`${o.name} – ${price(o.avail)}`}
                class={`l9c__swatch${o.id === paintId ? ' is-active' : ''}${o.avail[trimId] === null ? ' is-other' : ''}`}
                onClick={() => choosePaint(o)}
              >
                <img src={o.swatch} alt="" width="96" height="96" />
              </button>
            ))}
          </div>
          <p class="l9c__opt-note">{paint.note} · {price(paint.avail)}</p>
        </section>

        <section class="l9c__block">
          <h2 class="l9c__title">{ui.wheelTitle}</h2>
          <div class="l9c__options" role="group" aria-label={ui.wheelTitle}>
            {p.wheels.map((o) => (
              <button
                type="button"
                key={o.id}
                aria-pressed={o.id === wheelId}
                class={`l9c__option${o.id === wheelId ? ' is-active' : ''}${o.avail[trimId] === null ? ' is-other' : ''}`}
                onClick={() => chooseWheel(o)}
              >
                <img src={o.image} alt="" width="56" height="56" />
                <span class="l9c__option-text">
                  <span class="l9c__option-name">{o.name}</span>
                  <span class="l9c__option-note">{o.note}</span>
                </span>
                <span class="l9c__option-price">{price(o.avail)}</span>
              </button>
            ))}
          </div>
        </section>

        <section class="l9c__block">
          <div class="l9c__head"><h2 class="l9c__title">{ui.interiorTitle}</h2><span class="l9c__picked">{interior.name}</span></div>
          <div class="l9c__swatches" role="group" aria-label={ui.interiorTitle}>
            {p.interiors.map((o) => (
              <button
                type="button"
                key={o.id}
                aria-pressed={o.id === interiorId}
                aria-label={o.name}
                title={o.name}
                class={`l9c__swatch${o.id === interiorId ? ' is-active' : ''}`}
                onClick={() => chooseInterior(o)}
              >
                <img src={o.swatch} alt="" width="96" height="96" />
              </button>
            ))}
          </div>
        </section>

        <section class="l9c__block">
          <h2 class="l9c__title">{ui.commonTitle}</h2>
          <dl class="l9c__rows">
            {p.commonSpecs.map((r) => (
              <div class="l9c__row" key={r.label}><dt>{r.label}</dt><dd>{r.value}</dd></div>
            ))}
          </dl>
        </section>

        <section class="l9c__block l9c__summary">
          <p class="l9c__summary-title">{ui.summaryTitle}</p>
          <p class="l9c__summary-config">{summary}</p>
          <p class="l9c__summary-label">{ui.chinaPrice}</p>
          <p class="l9c__price">{cny(total)}</p>
          <p class="l9c__price--ask">{ui.turnkey}</p>
          <p class="l9c__form-title">{ui.formTitle}</p>
          <LeadForm
            namePlaceholder={p.form.namePlaceholder}
            phonePlaceholder={p.form.phonePlaceholder}
            cta={p.form.cta}
            success={p.form.success}
            source={`${ui.leadSource} – ${summary}; ${ui.chinaPrice.toLowerCase()} ${cny(total)}`}
          />
        </section>
        <p class="l9c__photo-note">{ui.photoNote}</p>
      </div>
    </div>
  );
}
