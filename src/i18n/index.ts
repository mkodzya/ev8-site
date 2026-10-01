import { ka } from './ka';
import { en } from './en';
import type { Dict } from './ru';

export type Locale = 'ka' | 'en';

// The site is Georgian (no prefix) and English (/en/). Russian is not built
// (Mika, 01.10.2026): ru.ts stays as the master text the other two are checked
// against and as the type of a dictionary.
export const locales: Locale[] = ['ka', 'en'];
export const defaultLocale: Locale = 'ka';

const dicts: Record<Locale, Dict> = { ka, en };
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
