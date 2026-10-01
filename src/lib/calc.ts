// Pure arithmetic of the subscription builder and the earnings calculator.
// Ported from the courier-store demo (src/calc/*.ts), without the term
// discount. All money in tetri, integers.
import { models } from '../data/models';
import { DEPOSIT, terms, buyout, gear, services, calc, type TermId } from '../data/subscription';

export interface Selection {
  modelId: string;
  termId: TermId;
  buyout: boolean;
  gear: string[];
  services: string[];
  hours: number;
}

export const WEEKS_PER_MONTH = 52 / 12;

export interface Result {
  weeks: number;
  rent: number;
  gear: number;
  buyout: number;
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
  /** What a courier on a rented petrol scooter would keep, same hours. */
  petrolNetMonth: number;
  /** netMonth − petrolNetMonth. */
  diffMonth: number;
}

export function compute(sel: Selection): Result {
  const model = models.find((m) => m.id === sel.modelId) ?? models[0];
  const term = terms.find((t) => t.id === sel.termId) ?? terms[0];
  const rent = model.weeklyGel * 100;
  const gearWeek = gear.filter((g) => sel.gear.includes(g.id)).reduce((s, g) => s + (g.perWeek ?? 0), 0);
  const buyoutWeek = sel.buyout && term.id === buyout.termId ? buyout.perWeek : 0;
  const weekly = rent + gearWeek + buyoutWeek;
  const once = services.filter((s) => sel.services.includes(s.id)).reduce((s, x) => s + (x.once ?? 0), 0);

  const hours = Math.min(168, Math.max(0, sel.hours));
  const days = Math.min(7, hours / calc.hoursPerDay);
  const incomeWeek = Math.round(hours * calc.hourlyRate);
  const taxWeek = Math.round((incomeWeek * calc.taxBp) / 10000);
  const energyWeek = Math.round(days * calc.homeChargePerNight) + Math.round(days * calc.swapsPerDay * calc.swapPrice);
  const netWeek = incomeWeek - weekly - energyWeek - taxWeek;

  // Rent against rent: the petrol courier earns the same, pays the same tax and
  // the same gear; only the vehicle's rent and its energy differ.
  const p = calc.petrol;
  const fuelWeek = Math.round((p.kmPerDay * days * p.litresPer100km * p.perLitre) / 100);
  const petrolNetWeek = incomeWeek - taxWeek - (fuelWeek + p.rentPerWeek) - gearWeek;

  const netMonth = Math.round(netWeek * WEEKS_PER_MONTH);
  const petrolNetMonth = Math.round(petrolNetWeek * WEEKS_PER_MONTH);
  return {
    weeks: term.weeks, rent, gear: gearWeek, buyout: buyoutWeek, weekly, once, deposit: DEPOSIT,
    today: weekly + DEPOSIT + once,
    incomeWeek, energyWeek, taxWeek, netWeek, netMonth, petrolNetMonth,
    diffMonth: netMonth - petrolNetMonth,
  };
}

/** 123456 tetri -> "1 235" (whole lari, thin-spaced thousands). */
export function gel(tetri: number): string {
  const v = Math.round(tetri / 100);
  const s = String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (v < 0 ? '−' : '') + s;
}
