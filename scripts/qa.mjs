// Step-7 check of a deployed build: every page in both languages at phone and
// laptop width — status, console errors, sideways scroll, clipped text, broken
// images, Georgian glyphs — then the three interactive flows. Screenshots go
// to qa-shots/. Run through scripts/qa.sh (Playwright lives in Docker).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'https://test.ops.ev8.ge/garage/site/';
const PAGES = ['', 'models/', 'subscription/', 'stations/', 'am-licence/', 'how-it-works/', 'faq/', 'contacts/'];
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
// WhatsApp is never opened: the request to wa.me is caught and read.
const text = (url) => decodeURIComponent(String(url).split('?text=')[1] || '');
for (const loc of LOCALES) {
  const lang = loc ? 'en' : 'ka';
  const where = `flow /${loc}`;
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true });
  let sent = null;
  await ctx.route('https://wa.me/**', (route) => { sent = route.request().url(); route.fulfill({ status: 200, contentType: 'text/html', body: '<title>wa</title>' }); });
  const page = await ctx.newPage();
  await page.goto(BASE + loc, { waitUntil: 'networkidle' });

  // carousel: turns by itself, five slides, the third dot brings the third slide
  await page.waitForTimeout(6600);
  const auto = await page.evaluate(() => { const t = document.querySelector('.promo-track'); return Math.round(t.scrollLeft / t.clientWidth); });
  if (auto !== 1) note(where, `carousel did not turn by itself: after 6 s it shows slide ${auto + 1}`);
  const slides = await page.locator('.promo .slide').count();
  if (slides !== 5) note(where, `carousel has ${slides} slides, expected 5`);
  await page.locator('.promo-dots button').nth(2).click();
  await page.waitForTimeout(1600);
  const at = await page.evaluate(() => { const t = document.querySelector('.promo-track'); return Math.round(t.scrollLeft / t.clientWidth); });
  if (at !== 2) note(where, `carousel dot 3 shows slide ${at + 1}`);
  await page.screenshot({ path: `${OUT}/flow-${lang}-promo.png` });

  // the nudge appears half way down, once
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await page.waitForTimeout(600);
  if (!(await page.locator('[data-ask-hint]').isVisible())) note(where, 'the nudge did not appear at the bottom of the page');
  await page.screenshot({ path: `${OUT}/flow-${lang}-hint.png` });

  // widget: yes -> petrol moped -> AM, then the message carries the answers
  await page.locator('.ask-fab').click();
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
  const waHref = await page.locator('[data-ask-send]').getAttribute('href');
  if (!waHref.startsWith('https://wa.me/995595165588?text=')) note(where, `widget link goes to ${waHref.slice(0, 60)}`);
  if (!picked3.every((p) => text(waHref).includes(p))) note(where, `widget message lacks the answers: ${text(waHref).slice(0, 120)}`);
  await page.waitForTimeout(600);
  const fits = await page.evaluate(() => { const p = document.querySelector('.ask-panel'); return p.scrollHeight <= p.clientHeight + 1; });
  if (!fits) note(where, 'the answer in the widget does not fit one screen');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/flow-${lang}-offer.png` });
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
  await Promise.all([page.waitForURL(/subscription/), page.locator('#garage [data-take]').click()]);
  await page.waitForLoadState('networkidle');
  const model = await page.locator('input[name="model"]:checked').getAttribute('value');
  if (model !== picked) note(where, `the builder opened with ${model}, garage had ${picked}`);
  // add the helmet and the insurance, 60 hours: weekly = rent + 5 + 12
  await page.locator('label.row:has(input[value="helmet"])').click();
  await page.locator('label.row:has(input[value="care"])').click();
  await page.locator('[data-hours="60"]').click();
  const num = async (k) => Number((await page.locator(`[data-out="${k}"]`).first().textContent()).replace(/[^\d-]/g, ''));
  const rent = await num('rent'), weekly = await num('weekly'), today = await num('today');
  if (weekly !== rent + 5 + 12) note(where, `weekly ${weekly} != rent ${rent} + 5 + 12`);
  if (today !== weekly + 180) note(where, `first payment ${today} != weekly ${weekly} + 180`);
  await page.screenshot({ path: `${OUT}/flow-${lang}-subscription.png`, fullPage: true });
  // a returning visitor: the saved choice is in place when the page is drawn, nothing animates into it
  await page.reload({ waitUntil: 'domcontentloaded' });
  const saved = await page.evaluate(() => ({
    moving: document.getAnimations().filter((x) => x.effect && x.effect.target && x.effect.target.closest && x.effect.target.closest('[data-sub], .sub-bar')).length,
    model: document.querySelector('input[name="model"]:checked').value,
    helmet: document.querySelector('input[value="helmet"]').checked,
    weekly: Number(document.querySelector('[data-out="weekly"]').textContent.replace(/[^\d-]/g, '')),
  }));
  if (saved.moving) note(where, `the request page animates ${saved.moving} things into the saved choice on load`);
  if (saved.model !== picked || !saved.helmet || saved.weekly !== weekly) note(where, `the saved choice did not come back: ${JSON.stringify(saved)}`);
  await page.waitForLoadState('networkidle');
  // The request goes to the queue (POST /api/site/queue) with the name and the phone. The server is
  // played here: it never gets a real request from the check, and WhatsApp is never opened.
  // 1) an empty form does not go anywhere
  let posted = null, answer = { status: 202, body: { ok: true } };
  await ctx.route('**/api/site/queue', (route) => { posted = JSON.parse(route.request().postData() || '{}'); route.fulfill({ status: answer.status, contentType: 'application/json', body: JSON.stringify(answer.body) }); });
  await page.locator('[data-sub-send]').click();
  await page.waitForTimeout(400);
  if (posted || sent) note(where, 'a request without a name and a phone was sent');
  // 2) the server names the phone as wrong: the field says so, nothing else happens
  await page.locator('#q-name').fill('Test Courier');
  await page.locator('#q-phone').fill('12345');
  answer = { status: 400, body: { error: 'bad_site_request', field: 'phone' } };
  await page.locator('[data-sub-send]').click();
  await page.waitForTimeout(700);
  if (!(await page.locator('#q-phone-err').isVisible())) note(where, 'a phone the server refuses is not marked on the form');
  if (sent) note(where, 'a refused phone opened WhatsApp');
  // 3) the server takes it: "Request received", with the choice, the sum and the answers inside
  await page.locator('#q-phone').fill('+995 555 12 34 56');
  answer = { status: 202, body: { ok: true } }; posted = null;
  await page.locator('[data-sub-send]').click();
  await page.waitForTimeout(900);
  if (!posted) note(where, 'the request did not go to the queue');
  else {
    if (posted.name !== 'Test Courier' || posted.phone !== '+995 555 12 34 56' || posted.lang !== lang || posted.website !== '') note(where, `the queue got wrong fields: ${JSON.stringify(posted).slice(0, 200)}`);
    if (!String(posted.text).includes(String(weekly)) || !picked3.every((p) => String(posted.text).includes(p))) note(where, `the queue request lacks the sum or the answers: ${String(posted.text).slice(0, 200)}`);
  }
  if (!(await page.locator('[data-sub-status]').isVisible())) note(where, 'no "request received" after the server took it');
  if (sent) note(where, 'WhatsApp opened although the server took the request');
  await page.locator('[data-sub-status]').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${OUT}/flow-${lang}-request-sent.png` });
  await ctx.close();

  // a visitor who opens the builder first, and a server that is off (503, as before the mailbox
  // is set up): the three questions are asked, then the same message opens in WhatsApp
  const ctx2 = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true });
  let sent2 = null, posted2 = null;
  await ctx2.route('https://wa.me/**', (route) => { sent2 = route.request().url(); route.fulfill({ status: 200, contentType: 'text/html', body: '<title>wa</title>' }); });
  await ctx2.route('**/api/site/queue', (route) => { posted2 = JSON.parse(route.request().postData() || '{}'); route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"site_mail_off"}' }); });
  const page2 = await ctx2.newPage();
  await page2.goto(BASE + loc + 'subscription/', { waitUntil: 'networkidle' });
  await page2.locator('#q-name').fill('Test Courier');
  await page2.locator('#q-phone').fill('+995555123456');
  await page2.screenshot({ path: `${OUT}/flow-${lang}-request-form.png`, fullPage: true });
  await page2.locator('[data-sub-send]').click();
  if (!(await page2.locator('.ask-panel').isVisible())) note(where, 'the request did not open the three questions');
  await page2.waitForTimeout(500);
  await page2.screenshot({ path: `${OUT}/flow-${lang}-request-ask.png` });
  for (const j of [1, 3, 0]) { await page2.locator('.ask-panel [data-step]:not([hidden]) .ask-opt').nth(j).click(); await page2.waitForTimeout(800); }
  await page2.waitForTimeout(600);
  if (!posted2) note(where, 'the request did not try the queue after the three answers');
  if (!sent2) note(where, 'with the server off the request did not go to WhatsApp');
  else if (text(sent2).split('\n').length < 5 || text(sent2) !== posted2?.text) note(where, `WhatsApp got a different message than the queue: ${text(sent2).slice(0, 200)}`);
  await ctx2.close();
}

await browser.close();
console.log(`checked ${checked} page views (${PAGES.length} pages × ${LOCALES.length} languages × ${VIEWS.length} widths) and the flows`);
if (problems.length) { console.log(`PROBLEMS: ${problems.length}`); problems.forEach((p) => console.log(' - ' + p)); process.exit(1); }
console.log('no problems found');
