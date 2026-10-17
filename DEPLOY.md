# Deploying

Structure (merges into the shared Pages project):

    public/
      sms-optin/index.html            opt-in form
      sms-optin-evidence/index.html   reviewer-facing evidence page
      privacy/index.html
      sms-terms/index.html
    functions/
      api/sms-optin.js                POST handler, writes to D1
    schema.sql
    wrangler.toml

The D1 database `sms-optin` already exists and the schema is applied.

    database_id = 26b61a0c-ed3b-43ce-97c5-45528a08c61b
    binding     = SMS_OPTIN_DB

## First deploy

    npm install -g wrangler
    wrangler login
    wrangler pages deploy public --project-name adam-michaelson

If the Pages project does not exist yet, wrangler offers to create it.
Wrangler picks up `functions/` automatically — do not put it inside `public/`.

## Bind the database

The binding must exist in the Pages project, not just wrangler.toml:

    Cloudflare dashboard -> Workers & Pages -> adam-michaelson
      -> Settings -> Bindings -> Add -> D1 database
         Variable name: SMS_OPTIN_DB
         Database:      sms-optin

Add it to **both** Production and Preview. Redeploy after adding.

## Custom domain

    Pages project -> Custom domains -> Set up a custom domain -> adam-michaelson.com

## Verify

    curl -s https://adam-michaelson.com/api/sms-optin            # expect 405
    wrangler d1 execute sms-optin --remote \
      --command "SELECT * FROM current_consent;"

## Local testing

    wrangler pages dev public --d1 SMS_OPTIN_DB=sms-optin


## Chat module (/api/chat)

Files: `functions/api/chat.js`, `functions/_lib/{config,prompts}.js`, `scripts/build-knowledge.mjs`,
`schema-chat.sql`. Generated and never committed: `knowledge.md`, `functions/_generated/knowledge.js`
(the committed copy is an empty stub).

### One-time setup (Cloudflare Pages -> Settings)

1. Apply the schema: `wrangler d1 execute sms-optin --remote --file=schema-chat.sql`
2. Build settings: build command `npm install && npm run build`, output directory `public`.
3. Secrets / variables (Production and Preview):

| Name | Type | Where it is used |
|---|---|---|
| `ANTHROPIC_API_KEY` | secret | runtime |
| `NOTION_TOKEN` | secret | **build** (Notion integration shared with the 7 knowledge pages only, NOT the private notes page) |
| `CHAT_PRIVATE_GUIDANCE` | secret | runtime. Sensitive-topic rules that would reveal something if published |
| `KNOWLEDGE_CANARIES` | secret, optional | build. Newline-separated phrases from the private page; the build fails if any appear |
| `CHAT_MODEL`, `CHAT_EFFORT`, `CONTACT_PHONE`, `CONTACT_EMAIL`, `CHAT_*` limits | optional vars | see `functions/_lib/config.js` |

The D1 binding `SMS_OPTIN_DB` is reused for the conversation log.

### Refresh knowledge after editing Notion

    NOTION_TOKEN=... npm run knowledge        # local check
    # production: retry the latest Pages deployment (or push), the build re-pulls Notion

### Tests

    npm test


## Admin console, alerts and takeover

The console is at `/admin` (not linked anywhere, `noindex`). It answers **404 to everyone** unless the request carries a valid
Cloudflare Access token for `ADMIN_EMAIL`, so it is closed until the steps below are done.

### 1. Protect it with Cloudflare Access (one time)

1. Cloudflare dashboard -> **Zero Trust** -> **Access** -> **Applications** -> **Add an application** -> **Self-hosted**.
2. Name: `Chat console`. Add two destinations on `adam-michaelson.com`: path `admin` and path `api/admin`.
3. Policy: **Allow**, include **Emails** = your email. Save.
4. Copy the application's **Audience (AUD) tag**, and your team domain (`<team>.cloudflareaccess.com`).
5. Do **not** put `/api/telegram/webhook` or `/api/chat/*` behind Access (Telegram and visitors must reach them; the webhook checks a secret token).

### 2. Secrets (Pages -> Settings -> Variables and Secrets, Production and Preview)

| Name | Purpose |
|---|---|
| `CF_ACCESS_TEAM_DOMAIN` | e.g. `yourteam.cloudflareaccess.com` |
| `CF_ACCESS_AUD` | the Access application's AUD tag |
| `ADMIN_EMAIL` | the one email allowed in |
| `TELEGRAM_BOT_TOKEN` | from @BotFather (`/newbot`) |
| `TELEGRAM_WEBHOOK_SECRET` | any long random string you make up |
| `TELEGRAM_CHAT_ID` | your Telegram chat id (step 3) |
| optional: `ALERT_QUIET_HOURS` (default `22-7`), `ALERT_TZ` (default `America/Denver`), `ALERT_DAILY_CAP` (default 50), `ALERT_PROVIDER` (`telegram`), `ADMIN_BASE_URL` | |

### 3. Connect Telegram

1. Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_WEBHOOK_SECRET`, redeploy, open `/admin` -> **Settings** -> **Connect Telegram webhook**.
2. Send any message to your bot in Telegram. It replies with your chat id. Save it as `TELEGRAM_CHAT_ID`, redeploy.
3. `/admin` -> **Settings** -> **Send test alert**.

### How takeover works

- A new chat sends you an alert (once per chat, silenced during quiet hours, capped per day). A job description or link in the fit chat is a "hot" alert.
- **Reply to the alert** in Telegram to answer as yourself. The visitor sees your message live, labelled "Live from Adam", and the bot goes quiet.
  Their replies are forwarded to you. `#a3f2 your message` targets a chat by its code; a plain message goes to the most recent chat that alerted you.
- `/bot` (or `#a3f2 /bot`) hands the chat back to the assistant, which knows what you said. The console has the same reply box and a **Hand back to bot** button.
- Twilio SMS is a second provider behind the same interface and stays off until its A2P campaign is approved.


## Transcript emails

After every chat, `EMAIL_TO` (default `ADMIN_EMAIL`) gets the full transcript with a button that opens the conversation in `/admin`.
A chat counts as closed when the visitor leaves the page or closes the fit modal (sent immediately), or after `EMAIL_IDLE_MINUTES` (default 20) of silence.
If the chat continues afterwards, a later email carries the updated full transcript. Only chats active after this feature went live are emailed.

Two ways to send (Gmail is used if its three secrets exist; otherwise Resend; `EMAIL_PROVIDER` can force one):

### Option A: your own Gmail (send-only credential)

The credential can send mail from your Gmail account but cannot read it. Secrets: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, plus `EMAIL_TO` (the alias to send to). Optional: `EMAIL_FROM`.

1. https://console.cloud.google.com -> create a project (e.g. `adam-michaelson-site chat`).
2. **APIs & Services -> Library** -> enable **Gmail API**.
3. **OAuth consent screen** (Google Auth Platform): user type **External**, app name and your email as support/contact. Add the scope `https://www.googleapis.com/auth/gmail.send`. Add yourself as a test user.
   **Then publish the app ("In production").** In "Testing" mode Google expires the refresh token after 7 days. Personal use of an unverified app is fine; you will see a "Google hasn't verified this app" screen, choose Advanced -> continue.
4. **Credentials -> Create credentials -> OAuth client ID -> Web application.** Authorized redirect URI: `https://developers.google.com/oauthplayground`. Copy the client ID and secret.
5. Open https://developers.google.com/oauthplayground. Gear icon -> **Use your own OAuth credentials** -> paste the ID and secret.
   Step 1: type the scope `https://www.googleapis.com/auth/gmail.send` in the box -> **Authorize APIs** -> sign in with the Gmail account and allow.
   Step 2: **Exchange authorization code for tokens** -> copy the **Refresh token**.
6. Add the secrets in Cloudflare (Production and Preview), then retry the latest Production deployment.

Mail arrives from your Gmail account to `EMAIL_TO`. If that is an alias of the same account, it shows up in your inbox (and also in Sent); a Gmail filter on the alias can label it and skip the inbox if you prefer.
If a send ever fails, the reason is saved (visible in the database table `chat_errors`); a revoked or expired token says so.

### Option B: Resend

1. Create a free account at https://resend.com (use the address that should receive transcripts) and an API key.
2. Secrets: `RESEND_API_KEY`, `EMAIL_TO`. Optional: `EMAIL_FROM`.
   Without `EMAIL_FROM` the mail comes from Resend's shared test sender, which can only deliver to the Resend account owner's own address. To send from your own domain, verify it in Resend (DNS records in Cloudflare) and set `EMAIL_FROM` (e.g. `Chat <chat@adam-michaelson.com>`).

### Either way

Optional: `EMAIL_IDLE_MINUTES`, `EMAIL_DAILY_CAP` (default 100). Pages Functions have no scheduler, so the 20-minute check runs when the site or console has traffic.
For on-time emails even on quiet days, set a `CRON_SECRET` secret and point any free scheduler (for example cron-job.org) at
`https://adam-michaelson.com/api/cron/sweep` every 5 minutes with the header `X-Cron-Secret: <your secret>`. This is optional.

## Names the chat must never say

`CHAT_BLOCKED_NAMES` (secret, comma separated): the children's names. They are removed from the knowledge at build time and from every reply as it streams ("Joshua" is always blocked).
`CHAT_ALLOWED_NAMES` (optional, comma separated full names): people who share a first name with a blocked name, e.g. `Joshua Steimle` (always allowed).
