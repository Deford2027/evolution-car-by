import type { Car } from '../content/cars';
import { carTitle, countries, powertrains, conditions } from '../content/cars';
import { site } from '../content/site';

/** Домен подтверждается клиентом; до этого используется заглушка. */
export const SITE_URL = import.meta.env.PUBLIC_SITE_URL ?? 'https://evolutioncar.by';

export const abs = (path: string): string => new URL(path, SITE_URL).href;

export interface Crumb {
  name: string;
  href: string;
}

export function carMeta(car: Car, base = '/catalog/') {
  const name = carTitle(car);
  const country = countries[car.country].genitive;
  const state = car.condition === 'new' ? 'новый' : `с пробегом ${car.mileageKm?.toLocaleString('ru-RU')} км`;

  return {
    title: `${name} купить под заказ ${country} — цена от ${car.priceUsd.toLocaleString('ru-RU')} $ | ${site.brand}`,
    description:
      `${name}, ${state}. ${car.tagline}. Доставка ${country} под ключ за ` +
      `${car.deliveryWeeks[0]}–${car.deliveryWeeks[1]} недель: покупка, страхование, ` +
      `таможенное оформление и документы для постановки на учёт в Беларуси.`,
    canonical: abs(`${base}${car.slug}/`),
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
export function carLd(car: Car, base = '/catalog/') {
  const specs = car.specs.flatMap((group) => group.rows);
  const find = (label: string) => specs.find((row) => row.label === label)?.value;

  return {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: carTitle(car),
    description: car.description[0],
    image: car.photos.map((photo) => abs(photo)),
    url: abs(`${base}${car.slug}/`),
    brand: { '@type': 'Brand', name: car.brand },
    model: car.model,
    vehicleModelDate: String(car.year),
    productionDate: String(car.year),
    bodyType: car.bodyType,
    fuelType: powertrains[car.powertrain],
    itemCondition:
      car.condition === 'new'
        ? 'https://schema.org/NewCondition'
        : 'https://schema.org/UsedCondition',
    ...(car.mileageKm
      ? {
          mileageFromOdometer: {
            '@type': 'QuantitativeValue',
            value: car.mileageKm,
            unitCode: 'KMT',
          },
        }
      : {}),
    ...(find('Мощность') ? { vehicleEngine: { '@type': 'EngineSpecification', name: find('Мощность') } } : {}),
    offers: {
      '@type': 'Offer',
      price: car.priceUsd,
      priceCurrency: 'USD',
      availability:
        car.availability === 'in-stock'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/PreOrder',
      url: abs(`${base}${car.slug}/`),
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
      deliveryLeadTime: {
        '@type': 'QuantitativeValue',
        minValue: car.deliveryWeeks[0] * 7,
        maxValue: car.deliveryWeeks[1] * 7,
        unitCode: 'DAY',
      },
    },
  };
}

export function catalogLd(list: Car[], base = '/catalog/') {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Каталог автомобилей Evolution Car',
    numberOfItems: list.length,
    itemListElement: list.map((car, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: abs(`${base}${car.slug}/`),
      name: `${carTitle(car)} — ${conditions[car.condition].toLowerCase()}`,
    })),
  };
}
