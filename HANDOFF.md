# Handoff — adam-michaelson.com

Updated 2026-10-08.

## How the site works
- This repo is the full source. Cloudflare Pages project `adam-michaelson-site` (account adam.h.michaelson@gmail.com) builds from `main` and serves `public/` at adam-michaelson.com.
- `functions/api/sms-optin.js` handles the SMS opt-in form and writes to D1 database `sms-optin` (binding `SMS_OPTIN_DB`, set in the Pages project).
- Pushing to `main` deploys. A manual `wrangler pages deploy public --project-name adam-michaelson-site` also works, but replaces the whole site.

## Built
- New homepage (2026-10-08): `public/index.html`, `home.css`, `home.js`. Name, three CTAs (Work with me -> `/bio/`, Product and Get to know me scroll to teaser sections), chat widget, photo, three scroll-in teaser sections. Default accent is Deep Caribbean blue; the other Deep colors (green, yellow, orange, red, indigo) stay in `home.css` as `[data-accent]` options.
- The chat and the "Check my fit" modal are front-end only. They validate links and reply that the feature isn't live, pointing to email. Real versions need a server function (Cloudflare Pages Function) that calls the model; safety rules are in the plan.
- `/me/mission-and-beliefs/` holds the typed quotes that used to be the homepage (`public/quotes.js`).
- Homepage (typed quotes), `/clever` prototypes, SMS opt-in, privacy and terms pages.
- `/bio` — executive bio adapted from the 2026 PDF: black theme, responsive down to phone width, animated load (header fades in, then metric cards one by one, then each section header types and its paragraph fades in).
- `/bio/ai-demo`, `/bio/lendio-case-study`, `/bio/customer-discovery`, `/bio/leadership` — placeholder pages using only facts from the bio, marked "Full write-up in progress."

## In progress
- Nothing. `/bio` is live (pushed 2026-10-02, Cloudflare build passed; `/`, `/bio/`, `/clever/`, `/sms-optin/` all return 200).
- If `git push` fails: an invalid `GITHUB_TOKEN` in the shell overrides `gh` login — `unset GITHUB_TOKEN` first.

## Next
- Write real content for the four `/bio/*` sub-pages (demo video/link, Lendio case study, customer discovery, leadership).
- Decide whether to delete stray duplicates: `public/00review.html`, `public/clone10contactinfo.html`, `public/clever/00review.html`, `public/clever/clone10contactinfo.html`.
- Note: this repo is public. Everything in it is already public on the site, except the opt-in handler code and the database schema, neither of which holds secrets.
