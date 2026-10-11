// Step-7 check of a deployed build: every page in both languages at phone and
// laptop width — status, console errors, sideways scroll, clipped text, broken
// images, Georgian glyphs — then the three interactive flows. Screenshots go
// to qa-shots/. Run through scripts/qa.sh (Playwright lives in Docker).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'https://test.ops.ev8.ge/garage/site/';
const PAGES = ['', 'models/', 'rent/', 'queue/', 'stations/', 'am-licence/', 'how-it-works/', 'faq/', 'contacts/', 'privacy/'];
const LOCALES = ['', 'en/'];
const VIEWS = [{ name: 'phone', width: 375, height: 812 }, { name: 'laptop', width: 1366, height: 800 }];
const OUT = 'qa-shots';
mkdirSync(OUT, { recursive: true });

const problems = [];
const note = (where, what) => { problems.push(`${where}: ${what}`); };

const browser = await chromium.launch();
let checked = 0;

for (const view of VIEWS) {
  // reduced motion: the page checks look at the settled page, not at an entrance half way through; the flows below run with motion
  const ctx = await browser.newContext({ viewport: { width: view.width, height: view.height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  for (const loc of LOCALES) {
    for (const path of PAGES) {
      const url = BASE + loc + path;
      const where = `${view.name} /${loc}${path}`;
      const page = await ctx.newPage();
      const errors = [];
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('pageerror', (e) => errors.push(String(e)));
      page.on('requestfailed', (r) => errors.push(`request failed: ${r.url()}`));
      const bad = [];
      page.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`); });
      const res = await page.goto(url, { waitUntil: 'networkidle' });
      if (!res || res.status() !== 200) note(where, `status ${res && res.status()}`);
      await page.evaluate(() => document.fonts.ready);
      const r = await page.evaluate((isKa) => {
        const out = { overflow: document.documentElement.scrollWidth - window.innerWidth, clipped: [], images: [], lang: document.documentElement.lang, title: document.title, h1: !!document.querySelector('h1'), cyr: [], fontOk: true };
        const visible = (el) => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
        for (const el of document.querySelectorAll('a, button, label, h1, h2, b, small, span, p, dt, dd, summary, li')) {
          if (!visible(el)) continue;
          const b = el.getBoundingClientRect();
          if (b.right > window.innerWidth + 1 || b.left < -1) {
            // off-screen garage and carousel slides are expected; so is the hidden field against bots
            if (el.closest('.stage, .promo-track, .trap')) continue;
            out.clipped.push(`${el.tagName.toLowerCase()} "${(el.textContent || '').trim().slice(0, 40)}" sticks out by ${Math.round(Math.max(b.right - window.innerWidth, -b.left))}px`);
          } else if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== 'visible' && el.children.length === 0) {
            out.clipped.push(`${el.tagName.toLowerCase()} "${(el.textContent || '').trim().slice(0, 40)}" is cut`);
          }
        }
        // a text block squeezed so narrow that it breaks a word or two per line
        for (const el of document.querySelectorAll('.row-tx, .ask-opt span, .ask-tiles li span, .paper h3, .queue-steps b, .moped b, .fact-tile span, h1, h2, .btn')) {
          if (!visible(el)) continue;
          const text = (el.textContent || '').trim();
          const lines = Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight || '20'));
          if (text.length > 14 && el.clientWidth < 110 && lines > 3) out.clipped.push(`${el.className || el.tagName} "${text.slice(0, 30)}" is squeezed to ${el.clientWidth}px, ${lines} lines`);
        }
        // the main action of the first screen must be reachable without hunting
        for (const img of document.images) if (!img.complete || img.naturalWidth === 0) out.images.push(img.src);
        // Russian must not leak into a public page.
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) { const t = walker.currentNode.textContent.trim(); if (/[а-яё]/i.test(t) && walker.currentNode.parentElement && !walker.currentNode.parentElement.closest('script,style')) out.cyr.push(t.slice(0, 40)); }
        if (isKa) out.fontOk = document.fonts.check('500 16px "Noto Sans Georgian"', 'გ');
        return out;
      }, loc === '');
      if (r.overflow > 0) note(where, `page scrolls sideways by ${r.overflow}px`);
      r.clipped.slice(0, 5).forEach((c) => note(where, c));
      r.images.forEach((i) => note(where, `image did not load: ${i}`));
      if (r.cyr.length) note(where, `Russian text on the page: ${r.cyr.slice(0, 3).join(' | ')}`);
      if (!r.fontOk) note(where, 'Noto Sans Georgian is not loaded');
      if (!r.h1) note(where, 'no h1');
      if (r.lang !== (loc === '' ? 'ka' : 'en')) note(where, `html lang is "${r.lang}"`);
      errors.forEach((e) => note(where, `console: ${e.slice(0, 160)}`));
      bad.forEach((b) => note(where, b));
      if (path === '') await page.screenshot({ path: `${OUT}/${view.name}-${loc ? 'en' : 'ka'}-home-first.png` });
      await page.screenshot({ path: `${OUT}/${view.name}-${loc ? 'en' : 'ka'}-${path.replace(/\//g, '') || 'home'}.png`, fullPage: true });
      // every internal link answers
      if (view.name === 'laptop') {
        const links = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.href).filter((h) => h.startsWith(location.origin)))]);
        for (const l of links) { const lr = await ctx.request.get(l.split('#')[0]); if (lr.status() !== 200) note(where, `link ${l} -> ${lr.status()}`); }
      }
      checked++;
      await page.close();
    }
  }
  await ctx.close();
}

// ---- flows, on a phone, in both languages
// The site has no WhatsApp any more (Kardu, 11.10.2026): a request to wa.me is caught
// and reported as a problem.
for (const loc of LOCALES) {
  const lang = loc ? 'en' : 'ka';
  const where = `flow /${loc}`;
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true });
  let sent = null;
  await ctx.route('https://wa.me/**', (route) => { sent = route.request().url(); route.fulfill({ status: 200, contentType: 'text/html', body: '<title>wa</title>' }); });
  const page = await ctx.newPage();
  await page.goto(BASE + loc, { waitUntil: 'networkidle' });

  // carousel: turns by itself, four slides, the third dot brings the third slide
  await page.waitForTimeout(6600);
  const auto = await page.evaluate(() => { const t = document.querySelector('.promo-track'); return Math.round(t.scrollLeft / t.clientWidth); });
  if (auto !== 1) note(where, `carousel did not turn by itself: after 6 s it shows slide ${auto + 1}`);
  const slides = await page.locator('.promo .slide').count();
  if (slides !== 4) note(where, `carousel has ${slides} slides, expected 4`);
  await page.locator('.promo-dots button').nth(2).click();
  await page.waitForTimeout(1600);
  const at = await page.evaluate(() => { const t = document.querySelector('.promo-track'); return Math.round(t.scrollLeft / t.clientWidth); });
  if (at !== 2) note(where, `carousel dot 3 shows slide ${at + 1}`);
  await page.screenshot({ path: `${OUT}/flow-${lang}-promo.png` });

  // the "Ask us" panel: yes -> petrol moped -> AM, then name, phone and a question go
  // to the queue's address with the answers. The server is played here.
  if (await page.locator('.ask-fab, [data-ask-hint]').count()) note(where, 'the floating "Write to us" button is back');
  if (await page.locator('a[href*="wa.me"]').count()) note(where, 'a WhatsApp link is on the page');
  let askPosted = null;
  await ctx.route('**/api/site/queue', (route) => { askPosted = JSON.parse(route.request().postData() || '{}'); route.fulfill({ status: 202, contentType: 'application/json', body: '{"ok":true}' }); });
  await page.locator('.lead-cta [data-ask]').scrollIntoViewIfNeeded();
  await page.locator('.lead-cta [data-ask]').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/flow-${lang}-ask.png` });
  const picked3 = [];
  for (const j of [0, 0, 1]) {
    const opt = page.locator('.ask-panel [data-step]:not([hidden]) .ask-opt').nth(j);
    picked3.push((await opt.locator('span').textContent()).trim());
    await opt.click();
    await page.waitForTimeout(800);
  }
  const offer = await page.locator('.ask-panel [data-offer]:not([hidden])').getAttribute('data-offer');
  if (offer !== 'petrol') note(where, `widget gave "${offer}", expected petrol`);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/flow-${lang}-offer.png` });
  // an empty form goes nowhere; a filled one carries the answers and the question
  await page.locator('[data-ask-send]').click();
  await page.waitForTimeout(300);
  if (askPosted) note(where, 'an empty question form was sent');
  if (!(await page.locator('#ask-name-err').isVisible())) note(where, 'an empty question form does not say what is missing');
  await page.locator('#ask-name').fill('Test');
  await page.locator('#ask-phone').fill('+995 555 12 34 56');
  await page.locator('#ask-question').fill('QA question');
  await page.locator('#ask-consent').check();
  await page.locator('[data-ask-send]').click();
  await page.waitForTimeout(900);
  if (!askPosted) note(where, 'the question did not go to the queue address');
  else {
    if (askPosted.name !== 'Test' || askPosted.phone !== '+995 555 12 34 56' || askPosted.lang !== lang) note(where, `the question went with wrong fields: ${JSON.stringify(askPosted).slice(0, 200)}`);
    if (!picked3.every((p) => String(askPosted.text).includes(p)) || !String(askPosted.text).includes('QA question')) note(where, `the question lacks the answers: ${String(askPosted.text).slice(0, 200)}`);
  }
  if (!(await page.locator('[data-ask-status]').isVisible())) note(where, 'no "question received" after the server took it');
  await page.screenshot({ path: `${OUT}/flow-${lang}-ask-sent.png` });
  await ctx.unroute('**/api/site/queue');
  await page.locator('.ask-panel [data-ask-close]').click();
  await page.waitForTimeout(500);
  if (await page.locator('.ask-panel').isVisible()) note(where, 'the widget did not close');

  // garage: three steps forward come back to the first
  await page.locator('#garage').scrollIntoViewIfNeeded();
  const first = await page.locator('#garage > input:checked').getAttribute('value');
  for (let i = 0; i < 3; i++) { await page.locator('#garage .arrow.next:visible').click(); await page.waitForTimeout(150); }
  const back = await page.locator('#garage > input:checked').getAttribute('value');
  if (first !== back) note(where, `garage loop ended on ${back}, started on ${first}`);
  await page.locator('#garage .arrow.next:visible').click();
  await page.locator('#garage .arrow.next:visible').click();
  const picked = await page.locator('#garage > input:checked').getAttribute('value');
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/flow-${lang}-garage.png` });
  // "I take this one" -> the request builder with the same moped
  await Promise.all([page.waitForURL(/rent\//), page.locator('#garage [data-take]').click()]);
  await page.waitForLoadState('networkidle');
  const model = await page.locator('input[name="model"]:checked').getAttribute('value');
  if (model !== picked) note(where, `the builder opened with ${model}, garage had ${picked}`);
  // gear is out of stock and cannot be chosen; 60 hours: weekly = rent, first payment = rent + 180
  if (!(await page.locator('input[value="helmet"]').isDisabled())) note(where, 'gear out of stock can be chosen');
  if (await page.locator('input[name="service"]').count()) note(where, 'services are back on the builder');
  await page.locator('[data-hours="60"]').click();
  const num = async (k) => Number((await page.locator(`[data-out="${k}"]`).first().textContent()).replace(/[^\d-]/g, ''));
  const rent = await num('rent'), weekly = await num('weekly'), today = await num('today');
  if (weekly !== rent) note(where, `weekly ${weekly} != rent ${rent}`);
  if (today !== weekly + 180) note(where, `first payment ${today} != weekly ${weekly} + 180`);
  await page.screenshot({ path: `${OUT}/flow-${lang}-subscription.png`, fullPage: true });
  // a returning visitor: the saved choice is in place when the page is drawn, nothing animates into it
  await page.reload({ waitUntil: 'domcontentloaded' });
  const saved = await page.evaluate(() => ({
    moving: document.getAnimations().filter((x) => x.effect && x.effect.target && x.effect.target.closest && x.effect.target.closest('[data-sub], .sub-bar')).length,
    model: document.querySelector('input[name="model"]:checked').value,
    hours: document.querySelector('#hours').value,
  }));
  if (saved.moving) note(where, `the request page animates ${saved.moving} things into the saved choice on load`);
  if (saved.model !== picked || saved.hours !== '60') note(where, `the saved choice did not come back: ${JSON.stringify(saved)}`);
  await page.waitForLoadState('networkidle');
  // the bar at the bottom of a phone leads to the waiting list, which knows the moped
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await Promise.all([page.waitForURL(/queue\//), page.locator('.sub-bar a.btn').click()]);
  await page.waitForLoadState('networkidle');
  const wlModel = await page.locator('input[name="model"]:checked').getAttribute('value');
  if (wlModel !== picked) note(where, `the waiting list opened with ${wlModel}, garage had ${picked}`);
  // The waiting list goes to the queue (POST /api/site/queue). The server is played here: it
  // never gets a real request from the check.
  // 1) an empty form does not go anywhere
  let posted = null, answer = { status: 202, body: { ok: true } };
  await ctx.route('**/api/site/queue', (route) => { posted = JSON.parse(route.request().postData() || '{}'); route.fulfill({ status: answer.status, contentType: 'application/json', body: JSON.stringify(answer.body) }); });
  await page.locator('[data-wl-send]').click();
  await page.waitForTimeout(400);
  if (posted || sent) note(where, 'an empty waiting-list form was sent');
  if (!(await page.locator('#wl-name-err').isVisible()) || !(await page.locator('#wl-consent-err').isVisible())) note(where, 'an empty form does not say what is missing');
  // 2) filled in; the server names the phone as wrong: the field says so, nothing else happens
  await page.locator('#wl-name').fill('Test');
  await page.locator('#wl-surname').fill('Courier');
  await page.locator('#wl-phone').fill('+995 555 12 34 56');
  await page.locator('#wl-email').fill('test@example.test');
  for (const g of ['licence', 'courier', 'company']) await page.locator(`[data-group="${g}"] .wl-choice`).first().click();
  await page.locator('#wl-consent').check();
  answer = { status: 400, body: { error: 'bad_site_request', field: 'phone' } };
  await page.locator('[data-wl-send]').click();
  await page.waitForTimeout(700);
  if (!(await page.locator('#wl-phone-err').isVisible())) note(where, 'a phone the server refuses is not marked on the form');
  if (sent) note(where, 'WhatsApp opened');
  // 3) the server takes it: "You are in the queue", with the answers inside
  answer = { status: 202, body: { ok: true } }; posted = null;
  await page.locator('[data-wl-send]').click();
  await page.waitForTimeout(900);
  if (!posted) note(where, 'the waiting list did not go to the queue');
  else {
    if (posted.name !== 'Test Courier' || posted.phone !== '+995 555 12 34 56' || posted.lang !== lang || posted.website !== '') note(where, `the queue got wrong fields: ${JSON.stringify(posted).slice(0, 200)}`);
    if (!String(posted.text).includes('test@example.test') || !String(posted.text).includes('Wolt')) note(where, `the queue request lacks the answers: ${String(posted.text).slice(0, 200)}`);
  }
  if (!(await page.locator('[data-wl-status]').isVisible())) note(where, 'no "you are in the queue" after the server took it');
  if (sent) note(where, 'WhatsApp opened');
  await page.screenshot({ path: `${OUT}/flow-${lang}-queue-sent.png`, fullPage: true });
  await ctx.close();

  // a server that is off (503): what was typed stays and the phone number is shown, no WhatsApp
  const ctx2 = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true });
  let sent2 = null, posted2 = null;
  await ctx2.route('https://wa.me/**', (route) => { sent2 = route.request().url(); route.fulfill({ status: 200, contentType: 'text/html', body: '<title>wa</title>' }); });
  await ctx2.route('**/api/site/queue', (route) => { posted2 = JSON.parse(route.request().postData() || '{}'); route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"site_mail_off"}' }); });
  const page2 = await ctx2.newPage();
  await page2.goto(BASE + loc + 'queue/', { waitUntil: 'networkidle' });
  await page2.locator('#wl-name').fill('Test Courier');
  await page2.locator('#wl-phone').fill('+995555123456');
  for (const g of ['licence', 'courier', 'company']) await page2.locator(`[data-group="${g}"] .wl-choice`).nth(1).click();
  await page2.locator('#wl-consent').check();
  await page2.screenshot({ path: `${OUT}/flow-${lang}-queue-form.png`, fullPage: true });
  await page2.locator('[data-wl-send]').click();
  await page2.waitForTimeout(1200);
  if (!posted2) note(where, 'the waiting list did not try the queue');
  if (sent2) note(where, 'with the server off the waiting list opened WhatsApp');
  if (!(await page2.locator('[data-wl-status] a[href^="tel:"]').isVisible())) note(where, 'with the server off the waiting list does not show the number to call');
  if ((await page2.locator('#wl-name').inputValue()) !== 'Test Courier') note(where, 'with the server off the waiting list lost what was typed');
  await ctx2.close();
}

await browser.close();
console.log(`checked ${checked} page views (${PAGES.length} pages × ${LOCALES.length} languages × ${VIEWS.length} widths) and the flows`);
if (problems.length) { console.log(`PROBLEMS: ${problems.length}`); problems.forEach((p) => console.log(' - ' + p)); process.exit(1); }
console.log('no problems found');
