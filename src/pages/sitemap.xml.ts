import type { APIRoute } from 'astro';
import { cars } from '../content/cars';

const paths = ['/', '/zeekr/', '/catalog/', ...cars.map((c) => `/catalog/${c.slug}/`)];

export const GET: APIRoute = ({ site }) => {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${new URL(p, site).href}</loc></url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
