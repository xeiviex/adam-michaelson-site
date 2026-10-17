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
