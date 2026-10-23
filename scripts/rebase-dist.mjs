// GitHub Pages отдаёт проект из подпапки /<repo>/, а в разметке пути корневые.
// После сборки дописываем префикс в HTML, CSS и sitemap — исходники не трогаем,
// локальная разработка продолжает работать от корня.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const base = process.argv[2];
if (!base || !base.startsWith('/')) {
  console.error('Использование: node scripts/rebase-dist.mjs /имя-репозитория');
  process.exit(1);
}

const dist = 'dist';
const exts = new Set(['.html', '.css', '.xml', '.txt', '.js']);

/** Пропускаем внешние ссылки, протоколы и уже переписанные пути. */
const rules = [
  [/(\s(?:href|src|action|content|poster)=")\/(?!\/)/g, `$1${base}/`],
  // <astro-island> грузит сам остров и рендерер по этим адресам: без префикса
  // скрипты отдают 404 и остров не оживает – кнопки конфигуратора не работают
  [/(\s(?:component-url|renderer-url|before-hydration-url|data-src|data-poster-m)=")\/(?!\/)/g, `$1${base}/`],
  // srcset хранит список «URL дескриптор, URL дескриптор» – префикс нужен каждому
  [/(\s(?:srcset|imagesrcset)=")([^"]+)"/g, (_, attr, list) =>
    attr + list.split(',').map((part) => part.trim().replace(/^\/(?!\/)/, `${base}/`)).join(', ') + '"'],
  [/(url\()\/(?!\/)/g, `$1${base}/`],
  [/("(?:url|image)":\s*")\//g, `$1${base}/`],
  // пути внутри props островов и встроенных данных: Astro кодирует кавычки как
  // &quot;, а остров потом строит из них адрес картинки уже в браузере
  [new RegExp(`(&quot;|["'\`])/(img|catalog|video|sravnenie|thank_page)/`, 'g'), `$1${base}/$2/`],
];

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)));
    else if (exts.has(extname(entry.name))) out.push(path);
  }
  return out;
}

const files = await walk(dist);
let touched = 0;

for (const file of files) {
  const text = await readFile(file, 'utf8');
  let next = text;
  for (const [from, to] of rules) next = next.replace(from, to);
  // canonical, og:url и JSON-LD содержат абсолютный адрес: Astro собирает его
  // из site + pathname, и подпапка Pages при этом теряется — дописываем её здесь
  const host = 'https://tema-mail.github.io';
  next = next.replaceAll(new RegExp(`${host}(?!${base}/)/`, 'g'), `${host}${base}/`);
  next = next.replaceAll(`${host}${base}${base}`, `${host}${base}`);
  if (next !== text) {
    await writeFile(file, next);
    touched += 1;
  }
}

console.log(`rebase-dist: префикс ${base} проставлен в ${touched} из ${files.length} файлов`);
