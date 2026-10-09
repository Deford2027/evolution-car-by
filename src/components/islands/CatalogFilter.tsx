import { useEffect, useState } from 'preact/hooks';

interface Facet { value: string; label: string }
interface CarRef {
  slug: string;
  country: string;
  powertrain: string;
  condition: string;
  price: number;
}
interface Props {
  facets: { country: Facet[]; powertrain: Facet[]; condition: Facet[] };
  cars: CarRef[];
  total: number;
}

type Key = 'country' | 'powertrain' | 'condition';

/**
 * Фильтр показывает и прячет карточки, отрисованные на сервере:
 * разметка остаётся в HTML и видна поисковым роботам.
 */
export default function CatalogFilter({ facets, cars, total }: Props) {
  const [picked, setPicked] = useState<Record<Key, string | null>>({
    country: null,
    powertrain: null,
    condition: null,
  });

  const matches = cars.filter(
    (car) =>
      (!picked.country || car.country === picked.country) &&
      (!picked.powertrain || car.powertrain === picked.powertrain) &&
      (!picked.condition || car.condition === picked.condition),
  );

  useEffect(() => {
    const visible = new Set(matches.map((c) => c.slug));
    document.querySelectorAll<HTMLElement>('#catalog-grid > li').forEach((li) => {
      li.hidden = !visible.has(li.dataset.slug ?? '');
    });
  }, [picked]);

  const toggle = (key: Key, value: string) =>
    setPicked((prev) => ({ ...prev, [key]: prev[key] === value ? null : value }));

  const reset = () => setPicked({ country: null, powertrain: null, condition: null });
  const active = Object.values(picked).some(Boolean);

  const row = (key: Key, label: string) => (
    <div class="filter__row">
      <p class="filter__label">{label}</p>
      <div class="filter__chips">
        {facets[key].map((facet) => (
          <button
            key={facet.value}
            type="button"
            class={picked[key] === facet.value ? 'filter__chip is-active' : 'filter__chip'}
            aria-pressed={picked[key] === facet.value}
            onClick={() => toggle(key, facet.value)}
          >
            {facet.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div class="filter">
      {row('country', 'Страна')}
      {row('powertrain', 'Двигатель')}
      {row('condition', 'Состояние')}

      <div class="filter__foot">
        <p class="filter__count" role="status">
          {matches.length === 0
            ? 'Под фильтр ничего не подошло — оставьте заявку, подберём под запрос'
            : `Показано ${matches.length} из ${total}`}
        </p>
        {active && (
          <button class="filter__reset" type="button" onClick={reset}>
            Сбросить
          </button>
        )}
      </div>
    </div>
  );
}
