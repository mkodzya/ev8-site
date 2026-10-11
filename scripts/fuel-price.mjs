#!/usr/bin/env node
// The price of a litre of regular petrol for the calculator's comparison
// (Kardu, 11.10.2026: "стоимость бензина для сравнения должна подтягиваться
// всегда актуальная"), read when the site is built. The site has no server of
// its own, and this is not EV8 Ops's job (Mika, 11.10.2026: "это были правки
// для сайта"), so the build reads it and the daily rebuild keeps it fresh
// (.github/workflows/deploy.yml).
//
// Where it reads: priceshub.ge, one page with a table per chain (SOCAR,
// Rompetrol, Gulf, Lukoil, Wissol, Portal, Connect…), prices in the HTML as
// data-std="4.03" beside the octane. One regular price (92/93) per chain, and
// the median of them — what a courier's petrol moped runs on. It is somebody
// else's page and can change without notice, so the reading is strict: fewer
// than three chains, or a price outside 2–8 GEL, is not a reading.
//
//   node scripts/fuel-price.mjs            a failed reading falls back to the price
//                                          the live site shows (FUEL_LIVE_URL), else
//                                          to the one committed in src/data/fuel.json
//   node scripts/fuel-price.mjs --strict   a failed reading fails: the daily rebuild
//                                          ships nothing, and the site keeps the
//                                          price it has, with its date
//
// Writes src/data/fuel.json: { perLitreTetri, asOf, chains, source }. The page
// prints asOf beside the price, so a price that could not be refreshed still
// says which day it is of.
import { readFileSync, writeFileSync } from 'node:fs';

const SOURCE = 'https://priceshub.ge/';
const FILE = new URL('../src/data/fuel.json', import.meta.url);
const MIN_CHAINS = 3;
const SANE_TETRI = { min: 200, max: 800 };
// Plain ASCII: fetch refuses a header with a character above 255 before it
// sends anything.
const AGENT = 'ev8.ge site build (info@ev8.ge) - daily petrol price for the calculator';

/** Regular petrol, one price per chain: the first row of each table whose octane starts with 92. Tetri. */
export function regularPrices(html) {
  const out = [];
  for (const table of html.split(/<table\b/i).slice(1)) {
    const m = table.match(/<td[^>]*>\s*92[^<]*<\/td>\s*<td[^>]*\bdata-std="(\d{1,2}(?:\.\d{1,2})?)"/i);
    if (m) out.push(Math.round(Number(m[1]) * 100));
  }
  return out;
}

export function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

const sane = (p) => Number.isInteger(p) && p >= SANE_TETRI.min && p <= SANE_TETRI.max;
const isPrice = (v) => v && sane(v.perLitreTetri) && /^\d{4}-\d{2}-\d{2}$/.test(v.asOf ?? '');
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tbilisi' }).format(new Date());
const page = (url) => fetch(url, { headers: { 'user-agent': AGENT }, signal: AbortSignal.timeout(15_000) });

async function read() {
  const res = await page(SOURCE);
  if (!res.ok) throw new Error(`the page answered ${res.status}`);
  const prices = regularPrices(await res.text()).filter(sane);
  if (prices.length < MIN_CHAINS) throw new Error(`regular petrol found for ${prices.length} chain(s), fewer than ${MIN_CHAINS}`);
  return { perLitreTetri: median(prices), asOf: today(), chains: prices.length, source: SOURCE };
}

async function live(url) {
  const res = await page(url);
  if (!res.ok) throw new Error(`answered ${res.status}`);
  const v = await res.json();
  if (!isPrice(v)) throw new Error('is not a price');
  return v;
}

if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  const strict = process.argv.includes('--strict');
  const gel = (t) => (t / 100).toFixed(2);
  try {
    const p = await read();
    writeFileSync(FILE, `${JSON.stringify(p, null, 2)}\n`);
    console.log(`fuel: ${gel(p.perLitreTetri)} GEL a litre, median of ${p.chains} chains, ${p.asOf}`);
  } catch (err) {
    console.error(`fuel: not read — ${err.message}`);
    if (strict) process.exit(1);
    const kept = JSON.parse(readFileSync(FILE, 'utf8'));
    const url = process.env.FUEL_LIVE_URL;
    let from = 'the repository';
    let p = kept;
    if (url) {
      try {
        const shown = await live(url);
        // The newer of the two: the live site may be days ahead of the commit.
        if (shown.asOf > kept.asOf) { p = shown; from = url; }
      } catch (e) {
        console.error(`fuel: ${url} ${e.message}`);
      }
    }
    writeFileSync(FILE, `${JSON.stringify(p, null, 2)}\n`);
    console.log(`fuel: keeping ${gel(p.perLitreTetri)} GEL of ${p.asOf}, from ${from}`);
  }
}
