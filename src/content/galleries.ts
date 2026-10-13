// Дополнительные фото к карточкам машин – официальные изображения
// производителей (сайты марок и пресс-центры). Данные – galleries.json:
// ключ – slug из cars.json, первым кадром карточка показывает фото каталога.
// Все кадры обрезаны к 16:10, чтобы галерея не прыгала при листании.
import data from './galleries.json';

export interface GalleryShot {
  src: string;
  thumb: string;
  alt: string;
}

interface Entry { source: string; generation: string; shots: { src: string; thumb: string; alt: string }[] }

/** Кадры галереи с подписью для alt: «<модель> – <вид>» */
export function galleryFor(slug: string, title: string): GalleryShot[] | null {
  const e = (data as Record<string, Entry>)[slug];
  if (!e) return null;
  return e.shots.map((s) => ({ ...s, alt: `${title} – ${s.alt}` }));
}

export const galleryLabels = {
  prev: 'Предыдущее фото',
  next: 'Следующее фото',
  // последний «закрытый» кадр галереи – приглашение получить живые фото
  lockTitle: 'Ещё 15 живых фото',
  lockText: 'Оставьте контакты – менеджер пришлёт живые фото и видео этого автомобиля в наличии и под заказ, во всех комплектациях.',
  lockCta: 'Получить',
  lockThumb: 'Живые фото – по запросу',
};
