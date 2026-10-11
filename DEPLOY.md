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
