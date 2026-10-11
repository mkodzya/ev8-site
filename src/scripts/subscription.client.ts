// The request builder in the browser: restores the saved choice and recounts
// on every change. It sends nothing: "Join the queue" leads to the waiting
// list (queue/), which reads the choice saved here (Kardu, 11.10.2026).
//
// This file is NOT loaded as a module. The request page bundles it with
// esbuild and puts it into the page as a plain inline script (see
// pages/[...locale]/rent/index.astro): it must run before the page is
// first drawn. As a module it ran after the first paint, and a visitor with a
// saved choice saw the page open on the first moped and then jump to his own
// (measured in the Safari engine, 03.10.2026).
import { compute, gel, WEEKS_PER_MONTH, type Selection } from '../lib/calc';

const form = document.querySelector<HTMLFormElement>('[data-sub]')!;
const KEY = 'ev8-sub';
const q = <T extends Element>(s: string) => Array.from(document.querySelectorAll<T>(s));
const checked = (name: string) => q<HTMLInputElement>(`input[name="${name}"]:checked`);
const hours = form.querySelector<HTMLInputElement>('#hours')!;

const read = (): Selection => ({
  modelId: checked('model')[0]?.value ?? '',
  gear: checked('gear').map((i) => i.value),
  services: checked('service').map((i) => i.value),
  hours: Number(hours.value),
});

// A number that changed ticks: it dips and settles (styles: "motion"). Not while
// the hours slider is being dragged — there every number changes at once.
let tick = false;
const set = (name: string, value: string) => q<HTMLElement>(`[data-out="${name}"]`).forEach((el) => {
  if (el.textContent === value) return;
  el.textContent = value;
  if (!tick) return;
  el.classList.remove('tick');
  void el.offsetWidth;
  el.classList.add('tick');
});
const line = (name: string, on: boolean) => q<HTMLElement>(`[data-line="${name}"]`).forEach((el) => (el.hidden = !on));

function render() {
  const sel = read();
  const r = compute(read());
  const m = (week: number) => gel(week * WEEKS_PER_MONTH);
  set('weekly', gel(r.weekly)); set('rent', gel(r.rent)); set('gear', gel(r.gear));
  set('today', gel(r.today)); set('hours', String(sel.hours));
  set('netMonth', gel(r.netMonth)); set('incomeMonth', m(r.incomeWeek)); set('subMonth', m(r.weekly));
  set('taxMonth', m(r.taxWeek));
  set('petrolCost', gel(r.petrolCostMonth)); set('ev8Cost', gel(r.ev8CostMonth)); set('save', gel(r.saveMonth));
  line('gear', r.gear > 0);
  // Two bars to one scale: the longer cost is the full width.
  const top = Math.max(r.petrolCostMonth, r.ev8CostMonth, 1);
  const bar = (name: string, v: number) => q<HTMLElement>(`[data-bar="${name}"]`).forEach((el) => (el.style.width = `${Math.round((v / top) * 100)}%`));
  bar('petrol', r.petrolCostMonth); bar('ev8', r.ev8CostMonth);
  const save = document.querySelector<HTMLElement>('[data-save]');
  if (save) save.hidden = r.saveMonth <= 0;
  try { localStorage.setItem(KEY, JSON.stringify(sel)); localStorage.setItem('ev8-model', sel.modelId); } catch {}
}

// Restore: the moped picked in the garage, then the last builder state.
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || 'null') as Partial<Selection> | null;
  const model = localStorage.getItem('ev8-model') || saved?.modelId;
  const pick = (name: string, values: string[]) => q<HTMLInputElement>(`input[name="${name}"]`).forEach((i) => { if (!i.disabled) i.checked = values.includes(i.value); });
  if (model && q(`input[name="model"][value="${CSS.escape(model)}"]`).length) pick('model', [model]);
  if (saved?.gear) pick('gear', saved.gear);
  if (saved?.services) pick('service', saved.services);
  if (saved?.hours) hours.value = String(saved.hours);
} catch {}

const onChange = (e: Event) => { tick = (e.target as HTMLInputElement).type !== 'range'; render(); tick = false; };
form.addEventListener('input', onChange);
form.addEventListener('change', onChange);
q<HTMLButtonElement>('[data-hours]').forEach((b) => b.addEventListener('click', () => { hours.value = b.dataset.hours!; tick = true; render(); tick = false; }));

render();

// Nothing animates while the saved choice is being put back; from the next
// frame on every change is smooth again.
requestAnimationFrame(() => requestAnimationFrame(() => document.querySelectorAll('.init').forEach((el) => el.classList.remove('init'))));
