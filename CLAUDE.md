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
`develop`. The preview on the test host is put there by Mika's session
(`scripts/deploy-preview.sh` needs the server). In a session run by Kardu: never push `main`
or a tag, never touch the server (`.githooks/pre-push` refuses the first two); a merge of
Kardu's reaches the preview with Mika's session's next deploy, or when Kardu asks Mika. The
production address moves only on Mika's word. Product decisions stay with Mika; Kardu
proposes. Kardu's setup: `README.md`, "Для Kardu". Talk to whoever runs the session in the
language they write in.

## Non-negotiable rules (from the owner)
1. **Never invent data.** A price, a figure or a claim appears on the site only if the book
   has it with a source. No data — the block stays closed and the open item is in the
   book's `register.md`. Prices and model order live in `src/data/models.ts`, with the source.
2. **Production moves only on Mika's word.** `scripts/deploy-preview.sh` copies a preview to
   the test host and restarts nothing; there is no production deploy yet. The edge on the
   server (Caddy, in `mkodzya/ev8-ops`) is restarted only when Mika says so: it fronts prod.
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
benefits (`Promo.astro`), the garage, the queue for new mopeds with the way into the request
builder, then the papers (licence, registration, tax) and the questions. The quiz is not a
gate any more: its three questions live in the "Write to us" widget (`Ask.astro`), on every
page; every WhatsApp link carries `data-ask` and opens it, and the builder sends its request
through it, so each message says who is writing. The queue is shown without numbers.

## How to build
This Mac has no Node: everything runs in Docker, one heavy task at a time (8 GB).

    scripts/build.sh              # production build -> dist/
    scripts/build.sh preview      # preview build (ka, en; noindex; base /garage/site/)
    scripts/deploy-preview.sh     # build a preview and copy it to https://test.ops.ev8.ge/garage/site/
    scripts/qa.sh                 # check the deployed preview: 8 pages × 2 languages × 2 widths and the flows

Verify by doing: open the preview at phone width, click through, then report.

## Branches
GitFlow as in EV8 Ops: `develop` is the default and the working branch, `main` holds
releases tagged with bare semver. `feature/<topic>` from develop. Commit and push as you go;
commit titles are a verdict sentence. End commit messages with
`Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
