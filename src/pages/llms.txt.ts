// /llms.txt — the site in a few lines for AI assistants (the llms.txt
// convention: a title, a summary, then links). People ask ChatGPT, Gemini and
// Perplexity where to rent a moped in Tbilisi; this gives them EV8's own
// answer with the figures the site shows. Built from the same data and texts
// as the pages, so it never says anything the site does not (Kardu, 04.11.2026).
import type { APIRoute } from 'astro';
import { dict } from '../i18n';
import { models, fullName, fromGel, DEPOSIT_GEL, contact } from '../data/models';
import { googleReviews } from '../data/reviews';
import { faqItems } from '../lib/faq';
import { PAGES, prodUrl } from '../lib/seo';

export const GET: APIRoute = () => {
  const en = dict('en');
  const ka = dict('ka');
  const fill = (s: string) => s.replace('{n}', String(fromGel));
  const title = (p: string) => {
    const t: Record<string, string> = {
      '': en.meta.homeTitle,
      'models/': en.meta.modelsTitle.replace('{models}', models.map(fullName).join(', ')),
      'rent/': en.sub.metaTitle,
      'stations/': en.stationsPage.metaTitle,
      'am-licence/': en.licence.metaTitle,
      'how-it-works/': en.how.metaTitle,
      'faq/': en.faqPage.metaTitle,
      'news/': en.news.metaTitle,
      'contacts/': en.contacts.metaTitle,
      'queue/': en.waitlist.metaTitle,
      'privacy/': en.privacy.metaTitle,
    };
    return (t[p] ?? p).replace(/ — EV8$/, '');
  };
  const model = (m: (typeof models)[number]) =>
    `- ${fullName(m)}: ${m.weeklyGel} GEL a week; ${m.licence === 'none' ? 'no licence needed' : 'AM licence category needed'}; ` +
    `${m.batteries} ${m.batteries === 1 ? 'battery and charger' : 'batteries and chargers'} included; ${m.rangeKm} km on one battery; ${m.motorW} W motor; ${m.battery.volts} V ${m.battery.ah} Ah battery, full charge in ${m.chargeHours} h` +
    `${m.deliveryBox ? '; delivery box' : ''}${m.insurance ? '; compulsory insurance included' : ''}${m.from ? `; ${en.garage.soonShort}, booking open now` : ''}`;

  const lines = [
    '# EV8',
    '',
    `> ${fill(en.about.text)}`,
    '',
    'EV8 is run by E-Motion Motors LLC, Tbilisi, Georgia. In Georgian: ' + fill(ka.about.text),
    '',
    '## Key facts',
    '',
    `- Rent by the week, from ${fromGel} GEL a week; minimum one week. Deposit ${DEPOSIT_GEL} GEL.`,
    `- Batteries and chargers come with the moped (${models.map((m) => `${fullName(m)}: ${m.batteries} + ${m.batteries}`).join(', ')}); consumables and repairs are included.`,
    `- Battery swap stations: ${en.stationsPage.stations.map(([n, a]) => `${n} (${a})`).join('; ')}. Swaps 24/7, 3.49 GEL a swap, about 15 seconds.`,
    `- Showroom: ${en.footer.address}; ${en.footer.hours}. Free test ride. No delivery: mopeds are handed over at the showroom.`,
    `- Phone ${contact.phone}, email ${contact.email}. Instagram ${contact.instagram}, Facebook ${contact.facebook}.`,
    `- Google Maps: ${googleReviews.url} (rated ${googleReviews.rating} from ${googleReviews.count} reviews as of ${googleReviews.asOf}).`,
    '',
    '## Mopeds',
    '',
    ...models.map(model),
    '',
    '## Questions and answers',
    '',
    ...faqItems('en').flatMap(([q, a]) => [`### ${q}`, '', a, '']),
    '## Pages',
    '',
    ...PAGES.map((p) => `- [${title(p)}](${prodUrl('en', p)}): in Georgian ${prodUrl('ka', p)}`),
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
