// The request builder in the browser: restores the saved choice, recounts on
// every change, hands the request to the "Write to us" widget and sends what
// it gives back to the queue (POST /api/site/queue).
//
// This file is NOT loaded as a module. The request page bundles it with
// esbuild and puts it into the page as a plain inline script (see
// pages/[...locale]/subscription/index.astro): it must run before the page is
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
  set('weekly', gel(r.weekly)); set('rent', gel(r.rent)); set('gear', gel(r.gear)); set('care', gel(r.care));
  set('today', gel(r.today)); set('once', gel(r.once)); set('hours', String(sel.hours));
  set('netMonth', gel(r.netMonth)); set('incomeMonth', m(r.incomeWeek)); set('subMonth', m(r.weekly));
  set('energyMonth', m(r.energyWeek)); set('taxMonth', m(r.taxWeek));
  set('petrolCost', gel(r.petrolCostMonth)); set('ev8Cost', gel(r.ev8CostMonth)); set('save', gel(r.saveMonth));
  line('gear', r.gear > 0); line('care', r.care > 0); line('once', r.once > 0);
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

// The request goes to the queue by email through the server. If the server is
// down or the network fails, WhatsApp opens with the same message, as before.
const API = '/api/site/queue';
const fields: Record<string, HTMLInputElement> = {
  name: form.querySelector<HTMLInputElement>('#q-name')!,
  phone: form.querySelector<HTMLInputElement>('#q-phone')!,
};
const trap = form.querySelector<HTMLInputElement>('input[name="website"]')!;
const sendBtn = form.querySelector<HTMLButtonElement>('[data-sub-send]')!;
const note = form.querySelector<HTMLElement>('[data-sub-note]')!;
const status = form.querySelector<HTMLElement>('[data-sub-status]')!;
const ctaText = sendBtn.textContent ?? '';

const fieldError = (input: HTMLInputElement, on: boolean) => {
  input.toggleAttribute('aria-invalid', on);
  document.getElementById(`${input.id}-err`)!.hidden = !on;
};
const clear = () => { Object.values(fields).forEach((i) => fieldError(i, false)); status.hidden = true; status.replaceChildren(); note.hidden = false; };
Object.values(fields).forEach((i) => i.addEventListener('input', () => fieldError(i, false)));

const say = (title: string, text?: string, wa?: string) => {
  const s = status.dataset;
  const b = document.createElement('b');
  b.textContent = title;
  status.replaceChildren(b);
  if (text) status.append(' ', text);
  if (wa) {
    const a = document.createElement('a');
    a.href = wa; a.rel = 'noopener'; a.textContent = s.tWa ?? '';
    status.append(' ', a);
  }
  status.hidden = false;
  status.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
};

const busy = (on: boolean) => {
  sendBtn.disabled = on;
  sendBtn.textContent = on ? sendBtn.dataset.tSending ?? '' : ctaText;
};

async function deliver(text: string, wa: string) {
  clear();
  busy(true);
  const ctl = new AbortController();
  const timer = window.setTimeout(() => ctl.abort(), 15000);
  let res: Response;
  try {
    res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: fields.name.value.trim(), phone: fields.phone.value.trim(), text,
        lang: form.dataset.lang, page: location.pathname, website: trap.value,
      }),
      signal: ctl.signal,
    });
  } catch {
    res = new Response(null, { status: 599 }); // network error or timeout
  } finally {
    window.clearTimeout(timer);
  }
  busy(false);
  if (res.status === 202) {
    note.hidden = true;
    say(status.dataset.tSent ?? '', status.dataset.tSentText);
    return;
  }
  if (res.status === 400) {
    const body = (await res.json().catch(() => ({}))) as { field?: string };
    const input = body.field ? fields[body.field] : undefined;
    if (input) { fieldError(input, true); input.focus(); input.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    else say(status.dataset.tErr ?? '', undefined, wa);
    return;
  }
  // 502, 503, a network error and anything unexpected: the request is not
  // lost, it goes to WhatsApp as before.
  window.location.href = wa;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (sendBtn.disabled) return;
  const sel = read();
  const r = compute(sel);
  const d = form.dataset;
  const label = (i: HTMLInputElement) => i.dataset.label ?? i.value;
  const picks = [...checked('model'), ...checked('gear'), ...checked('service')].map(label);
  const lines = [d.hello, ...picks.map((p) => `• ${p}`), `${d.lWeekly}: ${gel(r.weekly)} ₾`, `${d.lToday}: ${gel(r.today)} ₾`, `${d.lHours}: ${sel.hours}`];
  // The "Write to us" widget adds the three answers (components/Ask.astro), so
  // every request says who is writing, and hands the message back to deliver().
  document.dispatchEvent(new CustomEvent('ev8:request', { detail: { lines, deliver } }));
});

render();

// Nothing animates while the saved choice is being put back; from the next
// frame on every change is smooth again.
requestAnimationFrame(() => requestAnimationFrame(() => document.querySelectorAll('.init').forEach((el) => el.classList.remove('init'))));
