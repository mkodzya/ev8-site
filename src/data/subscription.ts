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

import fuel from './fuel.json';

export const DEPOSIT = 18000; // handbook business/pricing.md, Mika 21.09.2026

// There is no term to choose: the weekly price does not depend on it
// (no discounts — Mika, 01.10.2026), so the builder does not ask.

// Gear is sold, never rented, and only by instalments paid weekly with the
// subscription (Mika, 01.10.2026). The list, the instalments and the weeks:
// Kardu, 11.10.2026 — helmet 12 ₾ a week, phone holder with USB charging 8 ₾,
// thermal underwear (balaclava, top, bottoms) 15 ₾, winter gloves 8 ₾; each
// yours after 12 weeks. Protection, the chain lock, the thermal box and the
// winter kit are off the list. For now none of it is in stock (Kardu, same
// day): every item is shown with its price and "out of stock", and cannot be
// chosen, so nothing of it enters a sum until `inStock` is set.
// `perWeek: null` = no price in the book: shown, but cannot be chosen.
export interface GearItem { id: string; icon: string; perWeek: number | null; weeks: number | null; season?: boolean; inStock: boolean; }
export const gear: GearItem[] = [
  { id: 'helmet', icon: 'helmet', perWeek: 1200, weeks: 12, inStock: false },
  { id: 'phoneHolder', icon: 'phone', perWeek: 800, weeks: 12, inStock: false },
  { id: 'thermals', icon: 'shirt', perWeek: 1500, weeks: 12, inStock: false },
  { id: 'gloves', icon: 'glove', perWeek: 800, weeks: 12, inStock: false },
];

/** An item the builder lets you choose. */
export const choosable = (g: GearItem): boolean => g.inStock && g.perWeek !== null;

// Services — removed from the site for now (Kardu, 11.10.2026). They were
// Mika's of 01.10.2026: help with the licence 100 GEL, registration and tax
// 100 GEL, insurance +12 GEL a week. The compulsory insurance is now part of
// the S70 Pro's weekly price (models.ts). The list stays empty, so the builder
// shows no services and no sum counts one.
export interface Service { id: string; icon: string; label?: string; once?: number; perWeek?: number; }
export const services: Service[] = [];

export const calc = {
  // 20 GEL an hour (Kardu, 11.10.2026). Until then 15.38: Mika's 4 000 GEL a
  // month for 6 days × 10 h, divided out.
  hourlyRate: 2000,
  hoursPerDay: 10,
  hoursDefault: 50,
  hoursMin: 10,
  hoursMax: 70,
  presets: [25, 50, 60],
  // Charging at home and the paid battery swaps are left out of the
  // calculator for now (Kardu, 11.10.2026): they were 2 × 0.20 GEL a night and
  // 1.5 swaps a day at 3.49 GEL.
  // Small-business status, 1 % of turnover — to be checked with the accountant (register item 51).
  taxBp: 100,
  // A rented petrol scooter. Kilometres in a working day: 150 (Kardu,
  // 11.10.2026: what couriers ride on average; it was 120, Mika 01.10.2026).
  // Its rent, 170 GEL a week, is the ev8.ge calculator's (09.2026), confirmed by
  // Kardu on 11.10.2026: what a decent petrol moped rents for. Oil and repairs
  // are not counted: on a rented scooter the courier does not pay for them
  // (Kardu, 11.10.2026; this replaces Mika's ~100 GEL a month of 01.10.2026).
  // A litre of petrol is not typed in: ./fuel.json is written when the site is
  // built — the median of the chains' regular petrol that day
  // (scripts/fuel-price.mjs; Kardu, 11.10.2026). It was 3.05 GEL until then.
  petrol: { litresPer100km: 4, perLitre: fuel.perLitreTetri, rentPerWeek: 17000, kmPerDay: 150 },
};

/**
 * The saving the home page's second slide shows: a fixed 600 GEL a month
 * (Kardu, 11.10.2026: "просто замени на 600 лари, не тяни с калькулятора").
 */
export const PROMO_SAVE_GEL = 600;

/** The petrol price the comparison counts with, and the day it is of. */
export const petrolPrice = { tetri: fuel.perLitreTetri, asOf: fuel.asOf };
