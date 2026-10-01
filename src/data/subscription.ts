// Everything the subscription builder and the earnings calculator count with.
// Money is in tetri (1 GEL = 100 tetri), integers, VAT included — as in EV8 Ops.
//
// Status of the numbers. Model prices and the deposit are decisions
// (handbook knowledge.md). Everything else here is a DRAFT taken from the
// courier-store demo (src/config.ts there, with each source) — Mika's working
// numbers of 29.09–01.10.2026, not yet confirmed: handbook register items
// 41 (buy-out), 43 (gear prices), 45 (hour rate, tax), 47 (swap stations).
// Nothing is added that the book does not have: an item without a price is
// shown as "to be confirmed", cannot be chosen and never enters a sum.

export const DEPOSIT = 18000; // handbook business/pricing.md, Mika 21.09.2026

export type TermId = 'w1' | 'm1' | 'm3' | 'm6' | 'm12';
// No discounts for a longer term (Mika, call recorded 01.10.2026).
export const terms: { id: TermId; weeks: number }[] = [
  { id: 'w1', weeks: 1 },
  { id: 'm1', weeks: 4 },
  { id: 'm3', weeks: 13 },
  { id: 'm6', weeks: 26 },
  { id: 'm12', weeks: 52 },
];
export const DEFAULT_TERM: TermId = 'm3';

// Buy-out only on 52 weeks, +40 GEL a week (Mika, 29.09.2026; draft, register item 41).
export const buyout = { termId: 'm12' as TermId, perWeek: 4000 };

// Gear is sold, never rented, and only by instalments paid weekly with the
// subscription (Mika, 01.10.2026). `perWeek` is the weekly instalment — the
// demo's draft; `weeks` is how long it runs: 6 for the helmet and 12 for the
// protection are the idea from the call of 01.10.2026; null = not decided.
// `perWeek: null` = no price in the book: shown, but cannot be chosen.
export interface GearItem { id: string; icon: string; perWeek: number | null; weeks: number | null; }
export const gear: GearItem[] = [
  { id: 'helmet', icon: 'helmet', perWeek: 500, weeks: 6 },
  { id: 'protection', icon: 'shield', perWeek: null, weeks: 12 },
  { id: 'phoneHolder', icon: 'phone', perWeek: 400, weeks: null },
  { id: 'chainLock', icon: 'lock', perWeek: 300, weeks: null },
  { id: 'thermoBox', icon: 'box', perWeek: 800, weeks: null },
  // Season kits: draft prices exist (10 / 18 / 24 a week) but what is inside a
  // kit is not defined, so the kit is not offered yet.
  { id: 'seasonKit', icon: 'sun', perWeek: null, weeks: null },
];

// One-time services (demo drafts). The demo made registration free from a
// 3-month term; with "no discounts" it is one price for every term.
export const services: { id: string; icon: string; label?: string; once: number | null }[] = [
  { id: 'licence', icon: 'card', label: 'AM', once: 15000 },
  { id: 'registration', icon: 'bag', once: 4000 },
  // Insurance "EV8 Care": Mika wants it in the subscription, but what it covers
  // is not defined and today there is no insurance (knowledge.md) — not offered yet.
  { id: 'care', icon: 'shield', once: null },
];

export const calc = {
  // Mika, 29.09.2026: 6 days × 10 h a week earns 4 000+ GEL a month.
  // 4 000 × 12 / 52 / 60 h = 15.38 GEL an hour — a calculation, not a measurement.
  hourlyRate: Math.round(400000 / (52 / 12) / 60),
  hoursPerDay: 10,
  hoursDefault: 50,
  hoursMin: 10,
  hoursMax: 70,
  presets: [25, 50, 60],
  // Both batteries charged at home, 2 × 0.20 GEL a night (ev8.ge calculator; Mika 01.10.2026).
  homeChargePerNight: 40,
  // 1.2 station swaps a working day at 3.49 GEL (Mika, 01.10.2026). The station
  // network is not open yet (handbook batteries.md); today the swap is at the
  // showroom and is part of the rent. Counted here as Mika's model counts it,
  // which only lowers the promised figure. Decide before launch (register item 47).
  swapsPerDay: 1.2,
  swapPrice: 349,
  // Small-business status, 1 % of turnover — to be checked with the accountant (register item 51).
  taxBp: 100,
  // A rented petrol scooter, with the assumptions of the ev8.ge savings calculator (09.2026).
  petrol: { litresPer100km: 4, perLitre: 305, rentPerWeek: 17000, kmPerDay: 80 },
};
