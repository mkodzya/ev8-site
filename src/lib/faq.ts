// The questions and answers of faq/, with every figure filled in from the
// site's own data: models, prices, licences, deposit, stations. One function,
// so the page, its structured data and llms.txt say the same thing.
import { dict, type Locale } from '../i18n';
import { models, fullName, DEPOSIT_GEL } from '../data/models';
import { stations } from '../data/stations';

export function faqItems(locale: Locale): [string, string][] {
  const d = dict(locale);
  const t = d.faqPage;
  const num = (x: number) => (locale === 'en' ? String(x) : String(x).replace('.', ','));
  const range = models.map((m) => t.rangeLine.replace('{model}', m.name).replace('{km}', String(m.rangeKm))).join(' ');
  const charge = models.map((m) => t.chargeLine.replace('{model}', m.name).replace('{h}', num(m.chargeHours))).join(' ');
  // Weekly price of every model; one that is not in the fleet yet says from when.
  const prices = models
    .map((m) => t.priceLine.replace('{model}', fullName(m)).replace('{gel}', String(m.weeklyGel)).replace('{soon}', m.from ? ` (${d.garage.soonShort})` : ''))
    .join(' ');
  // Which mopeds need no licence and which need AM.
  const noLicence = models.filter((m) => m.licence === 'none').map(fullName).join(', ');
  const needAM = models.filter((m) => m.licence === 'AM').map(fullName).join(', ');
  const fill = (a: string) =>
    a
      .replace('{range}', range)
      .replace('{charge}', charge)
      .replace('{prices}', prices)
      .replace('{deposit}', String(DEPOSIT_GEL))
      .replace('{stations}', String(stations.length))
      .replace('{nolicence}', noLicence)
      .replace('{am}', needAM);
  // The questions of the home page first, then the rest.
  return [...d.faq.items, ...t.more].map(([q, a]) => [q, fill(a)] as [string, string]);
}
