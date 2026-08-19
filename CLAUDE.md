# adam-michaelson.com

Static site for adam-michaelson.com plus the SMS compliance tier required by
US carriers to register Adam's household budget text message program.

Full background: `docs/HANDOFF.md`. Read it before touching anything in
`public/sms-*`, `public/privacy`, or `functions/`.

## Layout

    public/                     everything served on the domain
      index.html                home page: quote typer plus the #colophon
                                footer that answers Twilio error 30489
      hero-bw.jpg               unreferenced; intended for a future home page
      clever/                   Clever portfolio case study, reachable at /clever/
      sms-optin/                opt-in form
      sms-optin-evidence/       reviewer-facing evidence page
      privacy/                  SMS privacy policy
      sms-terms/                SMS terms of service
    functions/
      api/sms-optin.js          POST handler, writes consent events to D1
    schema.sql                  D1 schema for the consent ledger
    wrangler.toml               project name, build output dir, D1 binding
    docs/                       handoff, Apps Script sources
    tools/                      Apple Card -> Tiller CSV converter

`functions/` must stay a sibling of `public/`, never inside it.

## Rules learned the hard way

1. **A Cloudflare deploy replaces the whole site.** Never deploy a different
   local folder into this project. That is what erased the SMS pages and
   caused the toll-free verification rejection. One repo, one build output.
2. **Do not push to `main` until the Cloudflare wiring is confirmed.** A
   previous session added a `wrangler.jsonc` naming the Worker
   `withered-flower-841b`; a build picked it up and deployed this repo's
   static assets over that Worker. It was reverted (commit `67739b6`), but
   whether a build hook is still watching this repo has not been verified.
3. **Never invent numbers.** Placeholder figures written into a sample message
   were carried into live Twilio config. Label fabricated values loudly or do
   not produce them.
4. **Do not add an `onRequest` catch-all** to `functions/api/sms-optin.js`. In
   Pages Functions it takes precedence over method-specific handlers and
   swallows the POST.
5. **`wrangler.toml` bindings are sufficient for Pages.** Wrangler applies them
   at deploy time and the dashboard binding UI goes read-only as a result.
6. **The consent ledger is evidence.** Append only. Never update or delete a
   row in `consent_events`; opt-outs and resubscribes are new rows and the
   `current_consent` view resolves the latest state per number.

## Verified state (2026-08-19, read from Cloudflare)

- D1 `sms-optin` (`26b61a0c-ed3b-43ce-97c5-45528a08c61b`) is intact:
  `consent_events`, both indexes, and the `current_consent` view all exist.
  Both real opt-ins are present — Adam `+18018229045` 2026-08-18T05:25:51.857Z,
  Summer `+18013182316` 2026-08-18T16:02:48.473Z, both `web_form`.
- Exactly one Worker exists in the account: `withered-flower-841b`, last
  modified 2026-08-19T15:40:36Z — the clobbering deploy described above.

Not verified from here: what actually serves adam-michaelson.com today. This
environment's egress proxy blocks the domain, and the Cloudflare tools exposed
here cannot list Pages projects.

## Missing asset

`public/sms-optin-evidence/optin-completed.png` — screenshot of a completed
opt-in. Adam has it locally. The evidence page renders a broken image without
it, and the page is the primary artifact a carrier reviewer looks at.

## Home page colophon

`public/index.html` ends with a deliberately quiet fixed footer: Adam's name,
one line of what he does, his email, and links to Privacy and SMS Terms. It is
there because Twilio error 30489 requires the site to show a description of
services and contact information, and the root URL is where a reviewer lands.

The design constraint is that the quote still owns the page — the footer sits
at 0.42 opacity and brightens on hover. Verified with headless Chromium at
320x480, 360x560, 390x660, 768x500 and 1440x700 using the longest quote in the
deck: no collision with the quote at any of them.

The descriptor line is the one sentence a compliance reviewer actually weighs.
Keep it true.
