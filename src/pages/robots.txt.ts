import type { APIRoute } from 'astro';

/** Пока сайт не запущен, индексация закрыта целиком – снять перед релизом. */
export const GET: APIRoute = ({ site }) =>
  new Response(
    `User-agent: *\nDisallow: /\n\nSitemap: ${new URL('/sitemap.xml', site).href}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
