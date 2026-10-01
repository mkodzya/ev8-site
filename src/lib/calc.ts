// Pure arithmetic of the subscription builder and the earnings calculator.
// Ported from the courier-store demo (src/calc/*.ts), without the term
// discount and without the buy-out (removed by Mika, 01.10.2026).
// All money in tetri, integers.
import { models } from '../data/models';
import { DEPOSIT, terms, gear, services, calc, type TermId } from '../data/subscription';

export interface Selection {
  modelId: string;
  termId: TermId;
  gear: string[];
  services: string[];
  hours: number;
}

export const WEEKS_PER_MONTH = 52 / 12;

export interface Result {
  weeks: number;
  rent: number;
  /** Weekly instalments for the chosen gear. */
  gear: number;
  /** Weekly services (insurance). */
  care: number;
  /** Everything paid per week. */
  weekly: number;
  once: number;
  deposit: number;
  /** Paid on the day of pick-up: first week + deposit + one-time services. */
  today: number;
  incomeWeek: number;
  energyWeek: number;
  taxWeek: number;
  netWeek: number;
  netMonth: number;
  /** A rented petrol scooter a month: its rent and fuel, same hours. */
  petrolCostMonth: number;
  /** The EV8 moped a month: its rent, home charging and swaps. */
  ev8CostMonth: number;
  /** petrolCostMonth − ev8CostMonth. */
  saveMonth: number;
}

export function compute(sel: Selection): Result {
  const model = models.find((m) => m.id === sel.modelId) ?? models[0];
  const term = terms.find((t) => t.id === sel.termId) ?? terms[0];
  const rent = model.weeklyGel * 100;
  const gearWeek = gear.filter((g) => sel.gear.includes(g.id)).reduce((s, g) => s + (g.perWeek ?? 0), 0);
  const chosen = services.filter((s) => sel.services.includes(s.id));
  const careWeek = chosen.reduce((s, x) => s + (x.perWeek ?? 0), 0);
  const once = chosen.reduce((s, x) => s + (x.once ?? 0), 0);
  const weekly = rent + gearWeek + careWeek;

  const hours = Math.min(168, Math.max(0, sel.hours));
  const days = Math.min(7, hours / calc.hoursPerDay);
  const incomeWeek = Math.round(hours * calc.hourlyRate);
  const taxWeek = Math.round((incomeWeek * calc.taxBp) / 10000);
  const energyWeek = Math.round(days * calc.homeChargePerNight) + Math.round(days * calc.swapsPerDay * calc.swapPrice);
  const netWeek = incomeWeek - weekly - energyWeek - taxWeek;

  // Vehicle against vehicle, rent against rent (Mika, 29.09.2026): what the
  // moped itself costs a month. Gear, insurance and tax are the same question
  // on either scooter and are left out of the comparison.
  const p = calc.petrol;
  const fuelWeek = Math.round((p.kmPerDay * days * p.litresPer100km * p.perLitre) / 100);
  const petrolCostMonth = Math.round((fuelWeek + p.rentPerWeek) * WEEKS_PER_MONTH);
  const ev8CostMonth = Math.round((rent + energyWeek) * WEEKS_PER_MONTH);

  return {
    weeks: term.weeks, rent, gear: gearWeek, care: careWeek, weekly, once, deposit: DEPOSIT,
    today: weekly + DEPOSIT + once,
    incomeWeek, energyWeek, taxWeek, netWeek,
    netMonth: Math.round(netWeek * WEEKS_PER_MONTH),
    petrolCostMonth, ev8CostMonth, saveMonth: petrolCostMonth - ev8CostMonth,
  };
}

/** 123456 tetri -> "1 235" (whole lari, thin-spaced thousands). */
export function gel(tetri: number): string {
  const v = Math.round(tetri / 100);
  const s = String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (v < 0 ? '−' : '') + s;
}
