import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

// домен-заглушка: заменить на реальный, от него зависят canonical и sitemap
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://evolutioncar.by',
  output: 'static',
  integrations: [preact()],
});
