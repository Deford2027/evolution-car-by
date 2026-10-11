import type { APIRoute } from 'astro';
import { cars, sections, carPath, slugify, modelSlug } from '../content/cars';
import { directions } from '../content/directions';
import { legalPages } from '../content/pages';
import { cities } from '../content/cities';
import { allBrands } from '../content/brands';

const paths = [
  '/',
  '/about/',
  '/contact/',
  '/portfolio/',
  '/rew/',
  ...directions.map((d) => `/${d.slug}/`),
    '/dostavka-i-rastamozhka/',
  ...cities.map((c) => `/${c.slug}/`),
  '/catalog/',
  ...allBrands().map((b) => `/catalog/${b.slug}/`),
  ...sections.map((s) => `/catalog/${s.slug}/`),
  ...cars.map((c) => carPath(c)),
  ...legalPages.map((p) => `/${p.slug}/`),
  '/zeekr/',
  '/zeekr/catalog/',
  ...cars.filter((c) => c.countries.includes('china')).map((c) => `/zeekr/catalog/${slugify(c.brand)}-${modelSlug(c)}/`),
];

export const GET: APIRoute = ({ site }) => {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${new URL(p, site).href}</loc></url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
