// The weekly news (src/data/news.ts) as the pages show it.
import type { Locale } from '../i18n';
import { issues, type Issue } from '../data/news';
import { ORIGIN, prodUrl } from './seo';

/** 2026-11-05 -> 05.11.2026; dates as the rest of the site writes them. */
export const dmy = (iso: string) => iso.split('-').reverse().join('.');

/** The days an issue covers: "29.10–05.11.2026". */
export const range = (i: Issue) => {
  const [a, b] = [dmy(i.from), dmy(i.to)];
  return a.slice(6) === b.slice(6) ? `${a.slice(0, 5)}–${b}` : `${a}–${b}`;
};

/** Address of an issue: news/2026-11-05/. */
export const issuePath = (i: Issue) => `news/${i.date}/`;

export const latest = issues[0];

/** What search engines read about an issue: a list of the news it links to. */
export function issueLd(l: Locale, i: Issue, name: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url: prodUrl(l, issuePath(i)),
    itemListElement: i.items.map((it, n) => ({
      '@type': 'ListItem',
      position: n + 1,
      url: it.url,
      name: it[l].title,
    })),
    publisher: { '@id': `${ORIGIN}/#business` },
  };
}

export { issues };
