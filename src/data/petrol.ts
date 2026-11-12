// Regular petrol, one point a week, for the chart on the news pages (Kardu,
// 12.11.2026: «новости про бензин делать в виде графика … по одной в неделю …
// за последние 3 месяца»). The petrol price is shown as this chart, not as a
// news item.
//
// A point is the same number the rent calculator prints: the median of the
// regular-petrol (92/93) price of each filling-station chain on priceshub.ge,
// one price per chain (scripts/fuel-price.mjs). The weeks from 20.08 to 12.11.2026
// were read on 12.11.2026 from the site's own 90-day archive
// (https://priceshub.ge/archive), counted the same way; the archive gives the
// same 3.96 for 11.10, 4.00 for 05.11 and 3.97 for 12.11 as the calculator showed
// on those days. On 10.09.2026 the archive had regular petrol for 4 chains, not 8.
//
// Every Thursday the weekly news task adds that day's price as the calculator
// prints it on ev8.ge. Nothing is filled in by hand: a week that was not read
// is left out.

export interface PetrolPoint {
  /** The day, YYYY-MM-DD (Asia/Tbilisi). */
  date: string;
  /** Median regular-petrol price, tetri a litre. */
  tetri: number;
  /** How many chains the median was taken over. */
  chains: number;
}

export const PETROL_SOURCE = 'https://priceshub.ge/';

export const petrol: PetrolPoint[] = [
  { date: '2026-08-20', tetri: 363, chains: 7 },
  { date: '2026-08-27', tetri: 367, chains: 7 },
  { date: '2026-09-03', tetri: 367, chains: 7 },
  { date: '2026-09-10', tetri: 377, chains: 4 },
  { date: '2026-09-17', tetri: 381, chains: 8 },
  { date: '2026-09-24', tetri: 381, chains: 8 },
  { date: '2026-10-01', tetri: 385, chains: 8 },
  { date: '2026-10-08', tetri: 395, chains: 8 },
  { date: '2026-10-15', tetri: 395, chains: 8 },
  { date: '2026-10-22', tetri: 395, chains: 8 },
  { date: '2026-10-29', tetri: 400, chains: 8 },
  { date: '2026-11-05', tetri: 400, chains: 8 },
  { date: '2026-11-12', tetri: 397, chains: 8 },
];
