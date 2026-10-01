// Everything the subscription builder and the earnings calculator count with.
// Money is in tetri (1 GEL = 100 tetri), integers, VAT included — as in EV8 Ops.
//
// Status of the numbers. Model prices and the deposit are decisions
// (handbook knowledge.md). Everything else here is a DRAFT taken from the
// courier-store demo (src/config.ts there, with each source) — Mika's working
// numbers of 29.09–01.10.2026, not yet confirmed: handbook register items
// 43 (gear prices), 45 (hour rate, tax).
// Nothing is added that the book does not have: an item without a price is
// shown as "to be confirmed", cannot be chosen and never enters a sum.

export const DEPOSIT = 18000; // handbook business/pricing.md, Mika 21.09.2026

// There is no term to choose: the weekly price does not depend on it
// (no discounts — Mika, 01.10.2026), so the builder does not ask.

// Gear is sold, never rented, and only by instalments paid weekly with the
// subscription (Mika, 01.10.2026). `perWeek` is the weekly instalment — still
// the demo's draft of 29.09.2026 (register item 43); `weeks` is how long it
// runs — Mika, 01.10.2026: helmet 12, phone holder 5, chain lock 5, thermal
// box 6; the winter kit is paid over the season ("yours for the winter").
// `perWeek: null` = no price in the book: shown, but cannot be chosen.
export interface GearItem { id: string; icon: string; perWeek: number | null; weeks: number | null; season?: boolean; }
export const gear: GearItem[] = [
  { id: 'helmet', icon: 'helmet', perWeek: 500, weeks: 12 },
  { id: 'protection', icon: 'shield', perWeek: null, weeks: null },
  { id: 'phoneHolder', icon: 'phone', perWeek: 400, weeks: 5 },
  { id: 'chainLock', icon: 'lock', perWeek: 300, weeks: 5 },
  { id: 'thermoBox', icon: 'box', perWeek: 800, weeks: 6 },
  // Only the winter kit is offered (Mika, 01.10.2026). 18 GEL a week is the
  // demo's draft for the winter kit; what is inside it is not defined yet.
  { id: 'winterKit', icon: 'sun', perWeek: 1800, weeks: null, season: true },
];

// Services — Mika, 01.10.2026: help with the licence 100 GEL; help with
// registration and tax optimisation 100 GEL; insurance +12 GEL a week,
// "covers every breakdown that is not your fault".
export interface Service { id: string; icon: string; label?: string; once?: number; perWeek?: number; }
export const services: Service[] = [
  { id: 'licence', icon: 'card', label: 'AM', once: 10000 },
  { id: 'registration', icon: 'bag', once: 10000 },
  { id: 'care', icon: 'shield', perWeek: 1200 },
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
  // A battery swap is paid: 3.49 GEL a swap (Mika, 01.10.2026 — decides register
  // item 47 for the price). 1.5 swaps a working day at 120 km a day (Mika, same day).
  swapsPerDay: 1.5,
  swapPrice: 349,
  // Small-business status, 1 % of turnover — to be checked with the accountant (register item 51).
  taxBp: 100,
  // A rented petrol scooter, with the assumptions of the ev8.ge savings calculator (09.2026).
  // Kilometres in a working day: 120 (Mika, 01.10.2026; the ev8.ge calculator's default was 80).
  // Oil and the extra repairs a petrol scooter needs: about 100 GEL a month
  // (Mika, 01.10.2026: "ещё лари 100 в месяц точно") — his estimate, not a measurement.
  petrol: { litresPer100km: 4, perLitre: 305, rentPerWeek: 17000, kmPerDay: 120, upkeepPerMonth: 10000 },
};
