// What search engines and link previews read (Kardu, 11.10.2026: "проделай SEO
// работу"; target searches: moped rental in Tbilisi, a moped for couriers,
// electric moped, the AM licence and battery swaps). Every fact here comes from
// the site's own data: the showroom, hours, phone and mail of the footer, the
// models and their weekly prices, the swap stations of ev8.ge.
import { dict, defaultLocale, locales, type Locale } from '../i18n';
import { contact, models, fromGel } from '../data/models';
import { stations } from '../data/stations';

/** Production address of the site. Previews are noindex, so links always point here. */
export const ORIGIN = 'https://ev8.ge';

/** The production URL of a page in a locale, whatever base the build is served under. */
export const prodUrl = (l: Locale, path = '') => `${ORIGIN}/${l === defaultLocale ? '' : `${l}/`}${path}`;

/** Every page of the site that should be found (the old subscription/ only redirects). */
export const PAGES = ['', 'models/', 'rent/', 'stations/', 'am-licence/', 'how-it-works/', 'faq/', 'contacts/', 'queue/', 'privacy/'];

const OG_LOCALE: Record<Locale, string> = { ka: 'ka_GE', en: 'en_US' };
export const ogLocale = (l: Locale) => OG_LOCALE[l];
export const ogAlternates = (l: Locale) => locales.filter((x) => x !== l).map((x) => OG_LOCALE[x]);

const tel = contact.phone.replace(/\s/g, '');
const showroom = stations[0];

/** The business itself: the showroom on Nutsubidze street, where mopeds are handed out. */
export function business(l: Locale) {
  const d = dict(l);
  const prices = models.map((m) => m.weeklyGel);
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRental',
    '@id': `${ORIGIN}/#business`,
    name: 'EV8',
    legalName: 'E-Motion Motors LLC',
    description: d.meta.homeDesc.replace('{n}', String(fromGel)),
    url: prodUrl(l),
    logo: `${ORIGIN}/img/brand/logo.svg`,
    image: `${ORIGIN}/img/og.jpg`,
    telephone: tel,
    email: contact.email,
    priceRange: `${Math.min(...prices)}–${Math.max(...prices)} GEL / week`,
    currenciesAccepted: 'GEL',
    areaServed: { '@type': 'City', name: l === 'ka' ? 'თბილისი' : 'Tbilisi' },
    address: {
      '@type': 'PostalAddress',
      streetAddress: d.stationsPage.stations[0][1],
      addressLocality: l === 'ka' ? 'თბილისი' : 'Tbilisi',
      addressCountry: 'GE',
    },
    geo: { '@type': 'GeoCoordinates', latitude: showroom.lat, longitude: showroom.lng },
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '10:00',
      closes: '20:00',
    }],
    // EV8's own pages, as its Google business profile lists them (Kardu's profile, 11.10.2026).
    sameAs: ['https://www.instagram.com/ev8electricmopeds/', 'https://www.facebook.com/ev8electricmopeds'],
    inLanguage: d.htmlLang,
  };
}

/** The three mopeds with their weekly rent (the garage). */
export function offers(l: Locale) {
  const d = dict(l);
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: d.meta.modelsTitle.replace('{models}', models.map((m) => m.name).join(', ')),
    itemListElement: models.map((m, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: `EV8 ${m.name}`,
        image: `${ORIGIN}/${m.image}`,
        brand: { '@type': 'Brand', name: 'EV8' },
        offers: {
          '@type': 'Offer',
          url: prodUrl(l, 'models/'),
          priceCurrency: 'GEL',
          price: m.weeklyGel,
          priceSpecification: { '@type': 'UnitPriceSpecification', price: m.weeklyGel, priceCurrency: 'GEL', referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'WEE' } },
          availability: m.from ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock',
          businessFunction: 'http://purl.org/goodrelations/v1#LeaseOut',
          seller: { '@id': `${ORIGIN}/#business` },
        },
      },
    })),
  };
}

/** The questions page as questions and answers. */
export function faq(items: string[][]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
}

/** The swap stations, each a place with its address and coordinates. */
export function swapStations(l: Locale) {
  const d = dict(l);
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: d.stationsPage.metaTitle,
    itemListElement: stations.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Place',
        name: d.stationsPage.stations[i][0],
        address: { '@type': 'PostalAddress', streetAddress: d.stationsPage.stations[i][1], addressLocality: l === 'ka' ? 'თბილისი' : 'Tbilisi', addressCountry: 'GE' },
        geo: { '@type': 'GeoCoordinates', latitude: s.lat, longitude: s.lng },
        openingHours: 'Mo-Su 00:00-23:59',
      },
    })),
  };
}
