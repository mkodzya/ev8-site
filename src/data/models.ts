// The three mopeds in the subscription, in garage order: simple, middle, best.
// Order: Mika, 01.10.2026 (handbook knowledge.md). Prices and licences: Kardu,
// 11.10.2026 (book, notes/2026-10-11_site-edits-kardu.md) — XL1200 140 ₾ and no
// licence needed, Eagle 155 ₾ and AM, S70 Pro 185 ₾ with the compulsory
// insurance included, AM, and in the fleet from January 2027 (queue only until then).
// `level` drives the four bars in the garage. It is the owner's ranking of the
// models, not a measurement: real range and speed figures are not in the
// handbook yet (register, item 60), so all four bars of a model are equal.

export type ModelId = 'xl1200' | 'eagle' | 's70-pro';

export interface Model {
  id: ModelId;
  name: string;
  weeklyGel: number;
  level: 1 | 2 | 3;
  image: string;
  /** Square cut for small cards: every moped the same size, wheels on one line. */
  thumb: string;
  /** The licence the moped needs: none, or the AM category. */
  licence: 'none' | 'AM';
  /** The weekly price includes the compulsory insurance. */
  insurance?: boolean;
  /** Not in the fleet yet: the month it arrives (YYYY-MM). Until then it is queue only. */
  from?: string;
  /** Kilometres on one battery (Kardu, 11.10.2026). */
  rangeKm: number;
}

/** Batteries that come with every moped (Kardu, 11.10.2026: "Даем по 2 батареи"). */
export const BATTERIES = 2;

export const DEPOSIT_GEL = 180;

export const models: Model[] = [
  { id: 'xl1200', name: 'XL1200', weeklyGel: 140, level: 1, image: 'img/models/xl1200.webp', thumb: 'img/models/xl1200-thumb.webp', licence: 'none', rangeKm: 50 },
  { id: 'eagle', name: 'Eagle', weeklyGel: 155, level: 2, image: 'img/models/eagle.webp', thumb: 'img/models/eagle-thumb.webp', licence: 'AM', rangeKm: 50 },
  { id: 's70-pro', name: 'S70 Pro', weeklyGel: 185, level: 3, image: 'img/models/s70-pro.webp', thumb: 'img/models/s70-pro-thumb.webp', licence: 'AM', insurance: true, from: '2027-01', rangeKm: 75 },
];

/** The lowest weekly price — what "from {n} ₾" says anywhere on the site. */
export const fromGel = Math.min(...models.map((m) => m.weeklyGel));

export const contact = {
  phone: '+995 595 16 55 88',
  email: 'info@ev8.ge',
  // EV8's own pages, as its Google business profile lists them (11.10.2026).
  instagram: 'https://www.instagram.com/ev8electricmopeds/',
  facebook: 'https://www.facebook.com/ev8electricmopeds',
};
