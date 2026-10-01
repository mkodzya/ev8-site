import { ka } from './ka';
import { en } from './en';
import { ru, type Dict } from './ru';

export type Locale = 'ka' | 'en' | 'ru';

// The public site is Georgian (no prefix) and English (/en/). Russian is the
// working text for Mika's review and is built only when PREVIEW=1.
const preview = process.env.PREVIEW === '1';
export const locales: Locale[] = preview ? ['ka', 'en', 'ru'] : ['ka', 'en'];
export const defaultLocale: Locale = 'ka';

const dicts: Record<Locale, Dict> = { ka, en, ru };
export const dict = (l: Locale): Dict => dicts[l];

const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');

/** Path of a page in a locale: href('en', 'models/') -> "<base>en/models/". */
export function href(locale: Locale, path = ''): string {
  const prefix = locale === defaultLocale ? '' : `${locale}/`;
  return `${base}${prefix}${path}`;
}

/** Path of a file from public/. */
export const asset = (path: string): string => `${base}${path}`;

/** getStaticPaths for pages under [...locale]. */
export function localePaths() {
  return locales.map((l) => ({
    params: { locale: l === defaultLocale ? undefined : l },
    props: { locale: l },
  }));
}

export type { Dict };
