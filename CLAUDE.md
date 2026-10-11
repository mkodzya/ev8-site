# CLAUDE.md — EV8 site

## What this is
The public site of EV8 (E-Motion Motors LLC, Tbilisi): an electric moped subscription for
couriers. It replaces the WordPress site at ev8.ge. Owner: Mika. Director on site: Kardu.
Business rules, decisions and open questions live in the project book
(`~/Developer/ev8/handbook`, GitHub `mkodzya/ev8-handbook`):
@~/Developer/ev8/handbook/CLAUDE.md

The plan the site is built from, all in the book under `notes/` (01.10.2026): brief
(`site-brief.md`), map (`site-map.html`), flow and quiz (`site-flow.html`), master text
(`site-copy.md`), page design (`site-design-pages.html`).

## Who runs sessions (since 06.10.2026)
Two people work on the site, each with their own Claude on their own machine: **Mika** and
**Kardu** (GitHub `Kardu89`, Write access). Both work in `feature/*` branches and merge into
`develop`. A merge into `develop` puts itself on the preview (since 11.10.2026): GitHub
Actions builds it and ships it to the test host within a couple of minutes
(`.github/workflows/deploy.yml`; the receiving side is `deploy/site-receive.sh` in
`mkodzya/ev8-ops`), so nobody copies files to the server by hand. A merge into `main` is the
release of the site: the same workflow ships it to production. Either of them releases it:
Kardu may release the site whenever he decides (Mika, 11.10.2026: «Карду может выпустить
сайт когда захочет»; before that `main` was Mika's alone). A session never releases on its
own — only when the person running it says so. In a session run by Kardu: never touch the
server. Kardu's work is this repository
and nothing else (Mika, 11.10.2026): EV8 Ops (`mkodzya/ev8-ops`, the company's ERP) and its
two stands, test and prod, are changed by Mika's session only. What the site needs from
there — an address of the API, the edge, the server — a session run by Kardu does not build
itself: it writes down what is needed, and Kardu asks Mika. Decisions about the site are made by Mika and
Kardu together, and neither needs the other's permission to change the site (Kardu's
proposal of 06.10.2026, accepted by Mika on 07.10.2026; before that: "decisions stay with
Mika, Kardu proposes"). The owner's rules below, the server, the secrets and the DNS of
ev8.ge are not part of that: they stay as written. Kardu's setup: `README.md`, "Для Kardu".
Talk to whoever runs the session in the language they write in.

## Non-negotiable rules (from the owner)
1. **Never invent data.** A price, a figure or a claim appears on the site only if the book
   has it with a source. No data — the block stays closed and the open item is in the
   book's `register.md`. Prices and model order live in `src/data/models.ts`, with the source.
2. **Production moves only on a person's word — Kardu's or Mika's** (Mika, 11.10.2026; before
   that, Mika's only). A push to `main` is what moves it: the deploy workflow ships `main` to
   the server's production folder, which ev8.ge serves once its DNS points there. A session
   merges into `main` only when the person running it says to release, never on its own.
   The daily rebuild is not a release: it ships the released `main` again as it is, with the
   day's petrol price and nothing else.
   The server, its secrets and the DNS of ev8.ge stay Mika's; the edge on the server (Caddy,
   in `mkodzya/ev8-ops`) is restarted only when Mika says so: it fronts prod.
3. **No secrets in the repository.** The Kommo key and anything like it are registered and
   stored by Mika; code reads them from the server.
4. **No customer data in the repository.**

## Languages
Talk to Mika in Russian; code, comments and commit messages in English. The public site is
Georgian (no prefix) and English (`/en/`). Russian is not built (Mika, 01.10.2026): `src/i18n/ru.ts`
stays as the master text the other two are written from. `npm run check` is the i18n
guard: same keys in all three, nothing empty. Georgian text is a draft until a native
speaker has read it (book register, item 15). Georgian needs Noto Sans Georgian in the font
stack; Russian needs Inter.

## Design
The site is light (Mika, 03.10.2026, chosen after a trial against "Black and lime"): light top,
green and lime accents; the garage, the earnings card and the footer stay black, because the
moped renders are shot on black. `THEME=dark` still builds the black version. The garage page
(`/models/`) is dark from edge to edge with a light-on-dark header: you walk into a garage — the
page dims, the lamp flickers on, the moped comes out of the dark (Mika, 03.10.2026). Colours,
type and button shape come from the EV8 brand (`docs/design/brand.md` in `mkodzya/ev8-ops`);
no new colours. Phone first: couriers open the site from a phone. The moped picker is the
"garage": dark stage, podium, three mopeds in a loop — `src/components/Garage.astro`.

Motion (Mika, 03.10.2026): every change on the site is smooth, small and unhurried — pages
fade into each other, the carousel glides, choices in the request form and answers of the
quiz change softly. One curve and three durations, all in the "motion" block at the end of
`src/styles/global.css`; a new component takes its transitions from there. Reduced motion
switches all of it off.

Structure of the home page (Mika, 03.10.2026): it sells first. A carousel of the main
benefits (`Promo.astro`), the garage, the queue for new mopeds with the way onto the waiting
list. The papers block (licence, registration, tax) and the common questions are off the home
page for now (Kardu, 11.10.2026); the questions stay on `faq/`. The quiz is not a
gate any more: its three questions live in a panel (`Ask.astro`); every WhatsApp link
carries `data-ask` and opens it, so each message says who is writing. There is no floating "Write to us" button (removed by Mika, 07.10.2026):
the request form is the way in. The queue is shown without numbers.

The waiting list (Kardu, 11.10.2026): `queue/` is the one form on the site — the fields of the
old ev8.ge/waitlist/ (name, surname, phone, email, licence, courier experience, company,
consent to the privacy policy at `privacy/`) plus the moped picked in the garage or the
builder. Every "Join the queue" leads there; the builder only counts and sends nothing, its
gear is out of stock and its services are off (Kardu, 11.10.2026). Before that (Kardu,
06.10.2026; accepted by Mika, 07.10.2026) the builder itself asked for a name and a phone.
The form posts to `POST /api/site/queue` on its own host — EV8 Ops, which
sends it to the company mailbox by email and stores nothing (`apps/api/src/routes/site.ts` in
`mkodzya/ev8-ops`). 202 shows "Request received"; a server that is off (503 until Mika sets
the mailbox up), down or unreachable opens WhatsApp with the same message, as before. On the
production address the edge has to send `/api/site/*` to the production stack — part of the
launch. `scripts/qa.sh` plays the server: it never sends a real request.

The petrol price and the visit counter are the site's own, not EV8 Ops's (Mika, 11.10.2026:
«это были правки для сайта»). A session of Kardu's had built both into EV8 Ops that day and
they were taken out the same day: `/api/site/fuel` and `/api/site/hit` do not exist — do not
call them, and do not ask EV8 Ops for a screen of the site's numbers. The request form's
`/api/site/queue` above is the one thing of the site's that lives there.
- **Petrol price** (Kardu, 11.10.2026: always today's, by itself). Read when the site is
  built: `scripts/fuel-price.mjs` takes the regular petrol (92/93) of each chain on
  priceshub.ge and writes their median to `src/data/fuel.json`; the comparison counts with it
  and the note under it prints the price with its date. The deploy workflow builds both
  branches again every day at 09:30 Tbilisi for this one number; a day the page cannot be
  read ships nothing, and the site keeps the price it has. Never type the price in by hand.
- **Visit counter** (the owner's decision of 01.10.2026: our own anonymous counter, no names,
  no phones, no third-party analytics; book register, item 64). Not built yet: it needs a
  small program of the site's own on the server, which Mika's session sets up. Until it
  exists the site sends no events.

## How to build
This Mac has no Node: everything runs in Docker, one heavy task at a time (8 GB).

    scripts/build.sh              # production build -> dist/
    scripts/build.sh preview      # preview build (ka, en; noindex; base /garage/site/)
    scripts/qa.sh                 # check the deployed preview: 8 pages × 2 languages × 2 widths and the flows

The preview at https://test.ops.ev8.ge/garage/site/ deploys itself on a merge into `develop`;
the run is on GitHub under Actions ("Deploy"), and "Run workflow" there repeats it by hand.

Verify by doing: open the preview at phone width, click through, then report.

## Branches
GitFlow as in EV8 Ops: `develop` is the default and the working branch, `main` holds
releases tagged with bare semver. `feature/<topic>` from develop. A release, on Kardu's or
Mika's word: merge `develop` into `main` (`--no-ff`), tag the merge with the next bare
semver, push `main` and the tag — the workflow builds it and ships it, and the run under
Actions says whether it arrived. Until the A record of ev8.ge points at the server (Mika's
step: `deploy/README.md` in `mkodzya/ev8-ops`), a release lands in the production folder and
visitors still see the WordPress site. Commit and push as you go;
commit titles are a verdict sentence. End commit messages with
`Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
