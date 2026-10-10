import type { APIRoute } from 'astro';
import { cars, sections } from '../content/cars';
import { directions } from '../content/directions';
import { legalPages } from '../content/pages';

const paths = [
  '/',
  '/about/',
  '/contact/',
  '/portfolio/',
  '/rew/',
  ...directions.map((d) => `/${d.slug}/`),
  '/catalog/',
  ...sections.map((s) => `/catalog/${s.slug}/`),
  ...cars.map((c) => `/car/${c.slug}/`),
  ...legalPages.map((p) => `/${p.slug}/`),
  '/zeekr/',
];

export const GET: APIRoute = ({ site }) => {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${new URL(p, site).href}</loc></url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
