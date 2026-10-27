import { useEffect, useState } from 'preact/hooks';

interface Facet { value: string; label: string }
interface CarRef {
  slug: string;
  country: string;
  powertrain: string;
  availability: string;
}
interface Props {
  facets: { country: Facet[]; powertrain: Facet[]; availability: Facet[] };
  cars: CarRef[];
  total: number;
}

type Key = 'country' | 'powertrain' | 'availability';

const LABELS: Record<Key, string> = {
  country: 'Страна',
  powertrain: 'Двигатель',
  availability: 'Наличие',
};

/**
 * Фильтр прячет карточки, отрисованные на сервере: разметка остаётся
 * в HTML целиком и видна поисковым роботам.
 */
export default function CatalogFilter({ facets, cars, total }: Props) {
  const [picked, setPicked] = useState<Record<Key, string | null>>({
    country: null,
    powertrain: null,
    availability: null,
  });

  const matches = cars.filter(
    (car) =>
      (!picked.country || car.country === picked.country) &&
      (!picked.powertrain || car.powertrain === picked.powertrain) &&
      (!picked.availability || car.availability === picked.availability),
  );

  // Фильтр можно задать ссылкой: /catalog/elektromobili/?country=china –
  // так ведут кнопки со страниц направлений. Неизвестные значения игнорируем.
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const fromUrl = { ...picked };
    let found = false;
    for (const key of Object.keys(LABELS) as Key[]) {
      const value = q.get(key);
      if (value && cars.some((car) => car[key] === value)) {
        fromUrl[key] = value;
        found = true;
      }
    }
    if (found) setPicked(fromUrl);
  }, []);

  useEffect(() => {
    const visible = new Set(matches.map((c) => c.slug));
    document.querySelectorAll<HTMLElement>('#catalog-grid > li').forEach((li) => {
      li.hidden = !visible.has(li.dataset.slug ?? '');
    });
  }, [picked]);

  const toggle = (key: Key, value: string) =>
    setPicked((prev) => ({ ...prev, [key]: prev[key] === value ? null : value }));

  const reset = () => setPicked({ country: null, powertrain: null, availability: null });
  const active = Object.values(picked).some(Boolean);
  const rows = (Object.keys(LABELS) as Key[]).filter((key) => facets[key].length > 1);

  return (
    <div class="filter">
      {rows.map((key) => (
        <div class="filter__row" key={key}>
          <p class="filter__label">{LABELS[key]}</p>
          <div class="filter__chips">
            <button
              type="button"
              class={picked[key] === null ? 'filter__chip is-active' : 'filter__chip'}
              aria-pressed={picked[key] === null}
              onClick={() => setPicked((prev) => ({ ...prev, [key]: null }))}
            >
              Все
            </button>
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
      ))}

      <div class="filter__foot">
        <p class="filter__count" role="status">
          {matches.length === 0
            ? 'Под фильтр ничего не подошло – оставьте заявку, подберём под запрос'
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
