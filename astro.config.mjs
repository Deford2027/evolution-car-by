import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

// пока сайт живёт на GitHub Pages; при переезде на боевой домен
// задать PUBLIC_SITE_URL и убрать шаг rebase-dist из workflow
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://tema-mail.github.io/evolution-car-by',
  output: 'static',
  integrations: [preact()],
});
