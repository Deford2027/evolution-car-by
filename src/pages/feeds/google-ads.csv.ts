import type { APIRoute } from 'astro';
import { cars } from '../../content/cars';
import { FEED_COLUMNS, feedRow, priceProblems } from '../../lib/product';

/**
 * Пользовательский фид Google Ads (тип «Custom») для динамического ремаркетинга:
 * по номеру товара из событий Google находит здесь машину, её фото и цену
 * и показывает их в баннере. Merchant Center не подходит – легковые машины
 * запрещены в товарных объявлениях, а программы Vehicle ads в Беларуси нет.
 *
 * Собирается вместе с сайтом из того же каталога, что и страницы, поэтому
 * не расходится с ними. Уникальность номеров проверяет src/lib/product.ts.
 */
const cell = (value: string) => (/[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

export const GET: APIRoute = () => {
  // Позиции со склеенной ценой идут в фид без цены – список виден в логе сборки
  for (const car of priceProblems()) {
    console.warn(`Фид Google Ads: у ${car.slug} неправдоподобная цена ${car.priceUsd} – в фид без цены, исправить в каталоге`);
  }

  const lines = [
    FEED_COLUMNS.join(','),
    ...cars.map((car) => {
      const row = feedRow(car);
      return FEED_COLUMNS.map((col) => cell(row[col])).join(',');
    }),
  ];

  return new Response(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/csv; charset=utf-8' },
  });
};
