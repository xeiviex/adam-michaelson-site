# Handoff — adam-michaelson.com

Updated 2026-10-08.

## How the site works
- This repo is the full source. Cloudflare Pages project `adam-michaelson-site` (account adam.h.michaelson@gmail.com) builds from `main` and serves `public/` at adam-michaelson.com.
- `functions/api/sms-optin.js` handles the SMS opt-in form and writes to D1 database `sms-optin` (binding `SMS_OPTIN_DB`, set in the Pages project).
- Pushing to `main` deploys. A manual `wrangler pages deploy public --project-name adam-michaelson-site` also works, but replaces the whole site.

## Built
- New homepage (2026-10-08): `public/index.html`, `home.css`, `home.js`. Name, three CTAs (Work with me -> `/bio/`, Product and Get to know me scroll to teaser sections), chat widget, photo, three scroll-in teaser sections. Default accent is Deep Caribbean blue; the other Deep colors (green, yellow, orange, red, indigo) stay in `home.css` as `[data-accent]` options.
- The chat and the "Check my fit" modal now call `POST /api/chat` (Pages Function, Claude API, prompt caching, D1 logging). See DEPLOY.md > Chat module. The private `/admin` console (Cloudflare Access), Telegram alerts and live takeover are built (see DEPLOY.md > Admin console); Twilio SMS takeover waits on the A2P campaign.
- `/me/mission-and-beliefs/` holds the typed quotes that used to be the homepage (`public/quotes.js`).
- Homepage (typed quotes), `/clever` prototypes, SMS opt-in, privacy and terms pages.
- `/bio` — executive bio adapted from the 2026 PDF: black theme, responsive down to phone width, animated load (header fades in, then metric cards one by one, then each section header types and its paragraph fades in).
- `/bio/altabank`, `/optum`, `/workfront`, `/lendio1`, `/bamboohr`, `/aktify`, `/lendio2` — one page per employer: five full-screen sections (overview, charter, approach, outcomes, learnings and next chapter). Content is in `scripts/career/data.mjs`; run `node scripts/build-career-pages.mjs` to regenerate. Logos live in `public/bio/logos/`; photos are still placeholders. The old `/bio/ai-demo`, `/lendio-case-study`, `/customer-discovery` and `/leadership` placeholder pages were deleted.

- `/me/` (2026-10-13): hub plus `/me/{history,family,faith,music,outdoors}/`, shared `me.css`/`me.js` (placeholders for missing media, lightbox). Photos and videos still need adding; see `public/me/README.md`. Copy is a first draft to rewrite.
- `/product/` (2026-10-13): how-I-do-product page with 9 topic lead-ins, each linking to `/product/<topic>/` (pm, ux, eng, leader, research, leveling-up, measuring-success, ai, 30-60-90). pm/ux/eng/leader each have `competencies/` and `outputs+outcomes/`; PM competencies have 8 child pages. Every child page has a video placeholder and stub sections. Scaffolded by `scripts/build-product.mjs` (skips existing pages unless `--force`, so edit the HTML directly once written). Styles in `public/product/product.css`. Homepage Product teaser now links here.

## In progress
- Nothing. `/bio` is live (pushed 2026-10-02, Cloudflare build passed; `/`, `/bio/`, `/clever/`, `/sms-optin/` all return 200).
- If `git push` fails: an invalid `GITHUB_TOKEN` in the shell overrides `gh` login — `unset GITHUB_TOKEN` first.

## Next
- Replace the photo placeholders on the seven career pages, and swap in the newer dark Lendio logo (recolored white).
- Decide whether to delete stray duplicates: `public/00review.html`, `public/clone10contactinfo.html`, `public/clever/00review.html`, `public/clever/clone10contactinfo.html`.
- Note: this repo is public. Everything in it is already public on the site, except the opt-in handler code and the database schema, neither of which holds secrets.

## Site-wide scroll hint & Google Analytics
`functions/_middleware.js` automatically handles two things across every public HTML page:
1. Appends Google Analytics 4 (`G-1TRY7CFCFG`) to `<head>`.
2. Appends `<script src="/scroll-hint.js?v=1" defer>` to `<body>`.
3. Records privacy-friendly pageviews to D1 (`SMS_OPTIN_DB`) asynchronously with zero page latency, assigning a 1-year first-party cookie (`_am_vid`) to identify unique and returning visitors without PII.
4. Exposes `/api/stats` (authenticated via `STATS_KEY` or `am_stats_k9x2m4p8v7w1n5q3`) and `/api/admin/stats` for real-time querying of totals, unique visitors, returning users, page rank, and daily trends.

## Achieve first-take prototype (2026-11-06, moved to /achieve/firsttake 2026-11-17)
- The new Achieve debt-relief prototype (case study for Sean Fox) is being built at `/achieve/`. Slices 1-6 are live in the branch (stage 6 adds `fund.js` and `fund-ui.js`: an interactive thermometer and timeline with a month slider and fast-forward, dynamic milestone messages, a text-email-app message preview, and recurring-deposit view with an extra-deposit what-if) (stage 5 adds `deposit.js` and `deposit-ui.js`: logged-in account view, a simulated ACH first deposit (init, on its way, cleared), the celebration after it clears with confetti waves, a welcome-box card and a lyric-sheet song, and the creditor-outreach log with calm replies and an urgent path for legal papers) (stage 4 adds `enroll.js` and `enroll-ui.js`: plain-language agreement with ten expandable sections, four separate consents, typed-signature signing, simulated bank link and dedicated-account opening, automatic-deposit setup; the first deposit is celebrated in stage 5, after the debit clears) (stage 3 adds `consult.js` and `consult-ui.js`: debts confirmed from a simulated soft credit pull, goals, an open conversation, seven honest expectation cards, and a plan with an adjustable deposit and milestones) (stage 2 adds `qualify.js` rules and data, `qualify-ui.js` cards: debt types, payment status, hardship pick, per-hardship follow-ups with optional document prompts, budget sliders, result card with an illustrative program estimate; larger debts go to specialist review, never declined for size): `public/achieve/{index.html,app.js,journey.js,debt-kb.js,path.css}` (shell with an eight-stage path nav, assistant dock with offline answers, auto-play toggle, stage 1 lead intake, confetti on completion). It reuses the first take's `forms.js`, `shared/dom.js`, `shared/flow.js` and `achieve.css` by absolute path, so do not delete `/achieve/firsttake/`. Tests: `tests/achieve-journey.test.mjs`. Stages 2-8 are listed in `journey.js` with `built: false`.
`/achieve/firsttake/` (web funnel), `/achieve/firsttake/messages/` (Apple Messages) and `/achieve/firsttake/chatgpt/` (ChatGPT) are one prototype for a CEO conversation: a hybrid of conversation and progressive forms that mirrors Achieve's real application flow (screenshots in the "Achieve" Google Slides deck) with Aktify-style conventions.
- Shared logic lives in `public/achieve/firsttake/shared/`: `flow.js` (steps, fields, parsers, time estimate), `store.js` (session data model in localStorage: applicant, document, step, step_applicant; 30-minute idle expiry; SSN is never stored), `offers.js` (sample Achieve-only offers), `agent.js` (the chasing agent for Messages/ChatGPT: next incomplete step, links back with `?resume=<step>` for anything sensitive), `kb.js` + `bot.js` (assistant knowledge and client; offline FAQ fallback), `dom.js`.
- The assistant is `functions/api/achieve-assistant.js` (Claude via ANTHROPIC_API_KEY, optional ACHIEVE_MODEL). Only non-sensitive context is sent.
- "Prototype" pill (bottom-left, top on phones) is the drop-out simulator and reset. Not part of the product.
- Human consultant "Maya" is simulated; she uses `/achieve/firsttake/img/maya.jpg` if present, else an illustration. Drop a photo there to replace it.
- Offers are illustrative samples, not real Achieve pricing. Tests: `tests/achieve.test.mjs`.

## LendingTree strategy deck (2026-11-17)
- `/lendingtree/` is now a seven-screen strategy deck (`public/lendingtree/index.html`, code in `public/lendingtree/deck/`: `data.js` content, `embed.js` partner-widget preview, `app.js`, `deck.css`). Each slide is a title and one drawing; a single Details button opens a fixed-size modal with Details, Economics and 180-day plan tabs. The plan Gantt, the milestone cards and the overview rollup all read the same milestone data. The ROI calculator was removed; the roadmap details describe the ROI method in plain English.
- The previous page is preserved unchanged at `/lendingtree1/` (own `lt.css`/`lt.js` copies; images stay under `/lendingtree/img/`). It was verified pixel-identical to the original at 1280 and 390 px.
- The three prototypes keep their URLs. `public/lendingtree/backlink.js` sends the back link to `/lendingtree1/` when the visitor came from the archive.
- Old `/lendingtree/#...` fragments: section ids map to new slides, everything else (problems, notes, footnotes) redirects to the same anchor on `/lendingtree1/`. The table is `LEGACY` in `deck/data.js`; `tests/lendingtree-deck.test.mjs` fails if an archive id is unmapped.
- Chat knowledge: `scripts/build-knowledge.mjs` now also reads `/lendingtree1` (the archive text). The deck itself is rendered by script, so its copy is not in chat knowledge.
- Tests: `node --test tests/lendingtree-deck.test.mjs` (deck data, archive parity, link resolution). Twelve other tests (achieve, chat-endpoint) already failed before this change.
