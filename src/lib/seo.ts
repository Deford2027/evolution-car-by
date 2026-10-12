import type { Car } from '../content/cars';
import { countries, powertrains, availabilities, carPath } from '../content/cars';
import { site } from '../content/site';

/** Домен подтверждается клиентом; до этого используется заглушка. */
export const SITE_URL = import.meta.env.PUBLIC_SITE_URL ?? 'https://evolutioncar.by';

export const abs = (path: string): string => new URL(path, SITE_URL).href;

export interface Crumb {
  name: string;
  href: string;
}

export function carMeta(car: Car) {
  const country = countries[car.country].genitive;
  const price = car.priceUsd ? ` – ориентир от ${car.priceUsd.toLocaleString('ru-RU')} $` : '';
  const year = car.year ? ` ${car.year}` : '';

  return {
    title: `${car.title}${year} ${country} под ключ${price} | ${site.brand}`,
    description:
      `${car.title} ${country}: ${powertrains[car.powertrain].toLowerCase()}, ` +
      `${availabilities[car.availability].toLowerCase()}. ${car.description} ` +
      `Доставка, страхование, таможенное оформление и документы для постановки на учёт – на нас.`,
    canonical: abs(carPath(car)),
  };
}

export function breadcrumbsLd(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: abs(crumb.href),
    })),
  };
}

/** Schema.org Car наследуется от Product, поэтому offers и brand валидны. */
export function carLd(car: Car) {
  const find = (label: string) => car.specs.find((row) => row.label === label)?.value;
  const year = (car.year.match(/\d{4}/) ?? [])[0];

  return {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: car.title,
    description: car.description,
    image: [car.photo],
    url: abs(carPath(car)),
    brand: { '@type': 'Brand', name: car.brand },
    ...(year ? { vehicleModelDate: year } : {}),
    ...(find('Кузов') ? { bodyType: find('Кузов') } : {}),
    fuelType: powertrains[car.powertrain],
    ...(find('Мощность')
      ? { vehicleEngine: { '@type': 'EngineSpecification', name: find('Мощность') } }
      : {}),
    ...(find('Привод') ? { driveWheelConfiguration: find('Привод') } : {}),
    ...(car.priceUsd
      ? {
          offers: {
            '@type': 'Offer',
            price: car.priceUsd,
            priceCurrency: 'USD',
            availability:
              car.availability === 'in-stock'
                ? 'https://schema.org/InStock'
                : 'https://schema.org/PreOrder',
            url: abs(carPath(car)),
            seller: {
              '@type': 'AutoDealer',
              name: site.brand,
              telephone: site.phone,
              address: {
                '@type': 'PostalAddress',
                addressLocality: site.city,
                addressCountry: 'BY',
                streetAddress: site.showroom,
              },
            },
          },
        }
      : {}),
  };
}

export function catalogLd(list: Car[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Каталог автомобилей Evolution Car',
    numberOfItems: list.length,
    itemListElement: list.slice(0, 50).map((car, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: abs(carPath(car)),
      name: car.title,
    })),
  };
}
