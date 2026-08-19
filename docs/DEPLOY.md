# Deploying adam-michaelson.com

One repo, one Pages project, one build output. `public/` is the whole site.

## Target

The Pages project `adam-michaelson-site`. Everything here is built for that.

One sanity check before the first deploy: confirm in **Compute → Workers &
Pages** that the Pages project — not the Worker `withered-flower-841b` — still
holds the `adam-michaelson.com` custom domain. A previous session deployed this
repo's static assets onto that Worker on Aug 19. If a Worker holds the domain,
stop: `functions/` is a Pages concept and will not run under a static-asset
Worker, so `/api/sms-optin` would 404 and the opt-in form would break.

## Deploy

    npm install -g wrangler
    wrangler login
    wrangler pages deploy public --project-name adam-michaelson-site

Wrangler picks up `functions/` automatically because it sits beside `public/`,
not inside it. It also applies the D1 binding from `wrangler.toml` at deploy
time — no dashboard step needed.

## Verify after deploying

    curl -sI https://adam-michaelson.com/sms-optin           # 200
    curl -sI https://adam-michaelson.com/sms-optin-evidence  # 200
    curl -sI https://adam-michaelson.com/privacy             # 200
    curl -sI https://adam-michaelson.com/sms-terms           # 200
    curl -s  https://adam-michaelson.com/api/sms-optin       # 405 Method Not Allowed
    curl -sI https://adam-michaelson.com/clever/             # 200

Read back the ledger:

    wrangler d1 execute sms-optin --remote \
      --command "SELECT * FROM current_consent;"

Do not submit a live opt-in just to test the endpoint. The ledger is evidence;
a test row with a fake name sitting next to two real consents is exactly what a
reviewer should not find. If you must prove the write path, use a preview
deployment against a scratch database.

## Local

    wrangler pages dev public --d1 SMS_OPTIN_DB=sms-optin

## Before resubmitting to Twilio

1. All six URLs above return what they should.
2. `public/sms-optin-evidence/optin-completed.png` is in place — the evidence
   page is meaningless without it.
3. The home page carries the colophon that answers error 30489 — name, one
   line of what Adam does, email, and links to Privacy and SMS Terms, all on
   the root URL where the reviewer lands. Confirm the descriptor line still
   reads true before submitting; it is the one sentence a reviewer weighs.

Reusable submission copy is in docs/HANDOFF.md section 10.
