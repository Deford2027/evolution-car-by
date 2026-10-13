// Дополнительные фото к карточкам машин. Ключ – slug из cars.json; первым
// кадром галереи всегда идёт фото каталога (car.photo), эти – после него.
// Zeekr 7X: официальные фото с zeekrlife.com/global/vehicles/7x (13.10.2026),
// обрезаны к 16:10, чтобы все кадры галереи были одной пропорции.

export interface GalleryShot {
  src: string;
  thumb: string;
  alt: string;
}

const z7x = (id: string, alt: string): GalleryShot => ({
  src: `/img/gallery/zeekr-7x/${id}.webp`,
  thumb: `/img/gallery/zeekr-7x/${id}-t.webp`,
  alt: `Zeekr 7X – ${alt}`,
});

export const galleries: Record<string, GalleryShot[]> = {
  'zeekr-7x': [
    z7x('front-34', 'вид спереди сбоку'),
    z7x('side', 'вид сбоку'),
    z7x('rear-34', 'вид сзади сверху'),
    z7x('front-detail', 'передняя часть и фары'),
    z7x('dashboard', 'салон, место водителя'),
    z7x('multimedia', 'экран мультимедиа'),
    z7x('rear-seats', 'задний ряд'),
    z7x('cabin', 'салон, вид назад'),
  ],
};

export const galleryLabels = {
  prev: 'Предыдущее фото',
  next: 'Следующее фото',
  more: 'ещё',
};
