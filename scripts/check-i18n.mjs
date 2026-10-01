// i18n guard: every locale has the same keys and array lengths as the Russian
// master, and no empty strings. TypeScript already forces the shape; this
// catches empty values and arrays that drifted in length. Run: npm run check
import { readFileSync } from 'node:fs';

const load = (name) => {
  const src = readFileSync(new URL(`../src/i18n/${name}.ts`, import.meta.url), 'utf8')
    .replace(/^import[^\n]*\n/gm, '')
    .replace(/export type[^\n]*\n/g, '')
    .replace(/export const \w+(: Dict)? = /, 'return ')
    .replace(/;\s*$/, '');
  return new Function(src)();
};

const shape = (v, path, out) => {
  if (Array.isArray(v)) { out.set(path, `array:${v.length}`); v.forEach((x, i) => shape(x, `${path}[${i}]`, out)); }
  else if (v && typeof v === 'object') Object.keys(v).forEach((k) => shape(v[k], path ? `${path}.${k}` : k, out));
  else out.set(path, typeof v === 'string' && v.trim() === '' ? 'EMPTY' : typeof v);
  return out;
};

const master = shape(load('ru'), '', new Map());
let bad = 0;
for (const name of ['en', 'ka']) {
  const other = shape(load(name), '', new Map());
  for (const [k, v] of master) {
    if (!other.has(k)) { console.error(`${name}: missing ${k}`); bad++; }
    else if (other.get(k) !== v) { console.error(`${name}: ${k} is ${other.get(k)}, master is ${v}`); bad++; }
  }
  for (const k of other.keys()) if (!master.has(k)) { console.error(`${name}: extra ${k}`); bad++; }
}
for (const [k, v] of master) if (v === 'EMPTY') { console.error(`ru: empty ${k}`); bad++; }
if (bad) { console.error(`i18n: ${bad} problem(s)`); process.exit(1); }
console.log(`i18n: ${master.size} keys, three locales agree`);
