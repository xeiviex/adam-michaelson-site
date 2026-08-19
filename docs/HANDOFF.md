# Handoff: Household Budget SMS + adam-michaelson.com

**Source:** Claude Cowork session, 2026-08-17 through 2026-08-19
**Purpose:** Full context transfer into a Claude Code project so site changes and
Twilio compliance work share one view of the codebase.
**Status at handoff:** BROKEN. Toll-free verification rejected. SMS pages wiped
from production by a conflicting deploy. Do not resubmit to Twilio until the site
is restored — see *Current broken state* and *Open decisions*.

---

## 1. What this project is

Adam runs a "Personal Operating System." Part of it: a Google Apps Script bound to
his Tiller budgeting spreadsheet texts him and his wife Summer a daily summary of
the prior day's spending and month-to-date budget progress. Two recipients, no
customers, no marketing.

To send that SMS through Twilio, US carriers require registration. That
registration is what this whole thread has been about, and it forced the creation
of a real website at adam-michaelson.com — which then collided with his Clever
portfolio project work.

---

## 2. Identifiers

| Thing | Value |
|---|---|
| Twilio Account SID | `AC…e15100  (redacted — full SID in the Twilio console)` |
| Twilio Messaging Service SID | `MG1f5bfb4b5a63d62199e8b262dd86732a` (bound to the dead 10DLC campaign) |
| A2P 10DLC Campaign SID | `CM6a9b0757907ce7c5be1ed432265dcc57` (REJECTED, abandoned) |
| A2P Brand Registration SID | `BNacba0ac51d980f2a92cbb69dce86c6be` (sole proprietor) |
| Toll-free number | `+1 833 754 4859` (REJECTED, 7-day prioritized resubmit window) |
| Toll-Free Verification SID | `HHb440daa6b0eb8b744edd725d579e43f5` |
| Old local number | `+1 351 217 3605` (messaging disabled, should be released) |
| Cloudflare Pages project | `adam-michaelson-site` |
| Production branch | `production` (NOT `main`) |
| Custom domain | `adam-michaelson.com` (CNAME → `adam-michaelson-site.pages.dev`, proxied) |
| D1 database | `sms-optin`, id `26b61a0c-ed3b-43ce-97c5-45528a08c61b` |
| D1 binding | `SMS_OPTIN_DB` |
| Other D1 database | `clever-investor-platform`, id `4bc5b1f4-bd12-4e39-82f4-a88429415382` (Clever project, 0 tables as of Aug 17) |
| Stray Worker | `withered-flower-841b` (created Aug 8, no custom domains, purpose unknown) |
| Recipient 1 | Adam Michaelson, `+18018229045` |
| Recipient 2 | Summer Michaelson, `+18013182316` |

> **Redacted for this repo.** The Twilio Account SID is masked above and in
> `docs/BudgetSms.gs`; GitHub push protection blocks it. The full value is in
> the Twilio console and in Adam's copy of this document. No auth token has
> ever been in these files.

---

## 3. Chronology

### 3.1 A2P 10DLC — three rejections, then abandoned

Campaign `CM6a9b...` (use case STARTER, sole proprietor brand) was rejected
repeatedly with:

- **30886** — campaign description does not clearly explain the messaging program
- **30909** — Message Flow / Call to Action cannot be verified

Two rewrites were attempted. Both failed. **The wording was never the problem.**

Root cause, from Twilio's own docs:

- [Error 30912](https://www.twilio.com/docs/api/errors/30912): *"If your traffic is
  truly personal or peer-to-peer, do not submit it as an A2P 10DLC campaign."*
  A household budget text reads to a reviewer as P2P. There is no internal-use or
  private-program carve-out in TCR.
- [Error 30909](https://www.twilio.com/docs/api/errors/30909): *"If the flow is
  behind a login or offline, hosted screenshots or other publicly accessible
  evidence must be provided."* Verbal consent is accepted as a *method* but never
  on its own word — a reviewer must be able to look at something.

At the time there was no website, so there was no artifact, so 30909 fired every
time. Also relevant: sole-proprietor 10DLC is capped at 1 campaign, 1 phone number,
1 MPS, and each use-case change requires deleting and recreating the campaign at a
new $15 vetting fee.

**Decision:** abandon 10DLC, pivot to Toll-Free Verification. Toll-free treats
`VERBAL` and `WEB_FORM` as first-class opt-in types, reviews in ~3 business days
instead of weeks, and has no 30912 equivalent. It does require a website.

Adam chose to continue with Twilio rather than switch to Pushover/ntfy, explicitly
for the experience of wiring up carrier registration end to end.

### 3.2 The website was built to satisfy the reviewer

Four pages plus a Pages Function were deployed to adam-michaelson.com:

- `/sms-optin` — real opt-in form, consent checkbox unchecked by default
- `/sms-optin-evidence` — reviewer-facing page with a screenshot of a completed opt-in
- `/privacy` — SMS privacy policy, carries the no-sharing/no-selling clause
- `/sms-terms` — SMS terms of service
- `/api/sms-optin` — POST handler writing consent events to D1

**Both recipients actually completed the form.** This was deliberate — the point is
that the evidence is real, not staged. Ledger contents verified:

```
Adam Michaelson    +18018229045   opt_in   web_form   2026-08-18T05:25:51.857Z
Summer Michaelson  +18013182316   opt_in   web_form   2026-08-18T16:02:48.473Z
```

### 3.3 Toll-free verification submitted, then rejected

Submitted with use case Account Notifications, opt-in type Web form, volume 100/mo,
and URLs pointing at the four pages above.

Rejected. Email from `trusthub-verify`, 2:33 PM:

- **30489** — Website Must Be Established and Active
- **30513** — Opt-in: Consent for messaging is a requirement for service

7 days to resubmit into the prioritized queue; after that it expires to normal
turnaround.

---

## 4. The outage / conflict — root cause

**Cloudflare Pages deploys replace the entire site, not just changed files.**

The four SMS pages and the `functions/` bundle were deployed to the
`adam-michaelson-site` project from a local folder called `site/`. Later, Clever
project work deployed a *different* output directory to the *same* Pages project.
That deploy replaced everything. The SMS pages and the Pages Function ceased to
exist in production.

**This was my error.** I directed the deploy into the shared project without warning
that any subsequent deploy from a different source folder would erase it.

Verified live state at handoff (all three now return the near-empty "Adam Michaelson"
stub page — title tag only, no body content):

- `https://adam-michaelson.com/sms-optin` → gone
- `https://adam-michaelson.com/sms-optin-evidence` → gone
- `https://adam-michaelson.com/api/sms-optin` → gone (Function not deployed)

That is exactly why Twilio fired 30513: the reviewer clicked the opt-in proof URLs
and got nothing. And 30489 fired because the site root is a stub with no contact
information and no description of services.

**The D1 database is untouched.** Both consent records still exist. Only the
web tier was lost.

---

## 5. Current broken state — checklist

- [ ] `/sms-optin` not deployed
- [ ] `/sms-optin-evidence` not deployed (and its `optin-completed.png` is gone)
- [ ] `/privacy` not deployed
- [ ] `/sms-terms` not deployed
- [ ] `/api/sms-optin` Function not deployed; D1 binding may or may not still be
      attached to the project — verify in the dashboard
- [ ] Home page is a stub — will fail 30489 again even if the above are restored
- [ ] Toll-free verification rejected, prioritized resubmit window closing
- [ ] Two local source folders both deploy to one Pages project — the actual bug

---

## 6. Open decisions (do not resubmit to Twilio before settling these)

**6.1 Repo architecture.** The Clever work and the SMS pages must publish from a
single source of truth. Adam's stated intent (from earlier planning) was one shared
Cloudflare Pages site with path-scoped Pages Functions per project, one D1 database
per project — naming convention db `<project-slug>`, binding `<PROJECT>_DB`. The
outage happened because that intent was implemented as two separate local folders
deploying to one project. Consolidate into one repo whose build output contains
everything, or set up a build that composes them.

**6.2 Home page content vs. 30489.** Adam's stated design for the home page:
minimal, no nav, no resume-style content — just his name on the left over a
full-bleed black-and-white photo of himself rock climbing, with the Clever case
study reachable only at the direct URL `/clever`, unlinked.

30489 requires the site to show contact information and a description of services.
A name over a photo will likely fail again. This is a genuine conflict between his
design intent and the carrier requirement, and it was not resolved before the
session ended. Options raised but not chosen:

1. Keep the photo; add one line of what he does plus a small footer with email and
   links to Privacy and SMS Terms.
2. Leave the home page alone; build a real `/about` page and link it from a footer.
3. Change nothing and resubmit — likely to fail again and burn the 7-day window.
4. Ship the Clever case study first so the site is genuinely substantive.

**6.3 Apps Script sender.** `sendSms_()` currently sends via Messaging Service
`MG1f5bfb...`, which is bound to the dead 10DLC campaign. Once toll-free is
approved it must point at `+18337544859` instead. Not yet changed — deliberately
deferred until the approved config is known.

**6.4 Cleanup, non-urgent.** Release `+13512173605`. Delete the rejected 10DLC
campaign and sole-prop brand ($2/mo). Investigate/delete the `withered-flower-841b`
Worker. Delete the empty duplicate Pages project `adam-michaelson` if it still
exists.

---

## 7. The Apps Script (separate from the website)

Lives in the Tiller Google Sheet: Extensions → Apps Script. Deliberately hosted in
Adam's own Google account so it doesn't depend on Claude.

**Files provided:** `BudgetSms.gs` (complete script), `audit.gs` (diagnostic).

**Script Properties required:**

```
TWILIO_ACCOUNT_SID              AC…e15100  (redacted — full SID in the Twilio console)
TWILIO_AUTH_TOKEN               <secret>
TWILIO_MESSAGING_SERVICE_SID    MG1f5bfb4b5a63d62199e8b262dd86732a
SMS_RECIPIENTS                  +18018229045,+18013182316
MONTHLY_BUDGET                  9400
```

**Functions:** `sendDailyBudgetSms` (the daily job), `dryRun` (logs, doesn't send),
`previewSamples` (prints the three registered sample messages),
`installDailyTrigger` (7am daily, removes prior copies first),
`auditMonthToDate` (diagnostic: month-to-date spend by category).

**Verified behavior.** Logic was tested against a mock Tiller sheet before delivery:
correctly excludes paycheck deposits, `Transfer`, and `Credit Card Payment`; ignores
same-day transactions; parses `($1,750.00)` as negative. Live `dryRun` on 8/15 data
produced `Household Budget Summary 8/15: no transactions posted. Month to date:
$8,902.39 of $9,400.00. Reply STOP to cancel.`

**Known quirks to expect, not bugs:**

- "No transactions posted" appears often. Tiller's bank feed lags 1–3 days, so
  "yesterday" is frequently empty at 7am. If it becomes annoying, change the script
  to report on the most recent day that actually has data.
- August 2026 will close over budget. Mortgage, a 1.5× tithing payment, and ~$690 of
  one-time homeschool curriculum all landed in the first two weeks. September should
  be the first clean read.

---

## 8. Budget configuration and how `MONTHLY_BUDGET` was derived

Needed because the number is otherwise arbitrary.

- Tiller feed history is thin: bank backfill covers only 2026-07-23 → 2026-08-14.
  No complete calendar month exists.
- Income is semi-monthly (confirmed by Adam), ~$15,118/mo net, plus ~$110/mo
  "Kids Paying Bills."
- Non-Apple-Card spending normalizes to ~$9,200/mo.
- Apple Card is **not connected to Tiller** and never will be automatically — no
  native-iPhone-app integration exists. 13 months of exported Apple Card data
  (571 transactions, Jul 2025 – Aug 2026) gave a trailing-12-month average of
  **$1,798.95/mo**, median $1,754, trailing-6 $2,075.
- Total ≈ $11,000/mo. Implied maximum savings ≈ $4,200/mo (~28% of net).

**`MONTHLY_BUDGET` is set to `9400`, deliberately excluding Apple Card**, because
Apple Card isn't in the sheet and importing it is a manual chore. The daily text
therefore measures only what the script can see. **If Apple Card transactions are
ever imported into Tiller, `MONTHLY_BUDGET` must rise to ~11200** or the text will
read falsely optimistic.

**Apple Card importer provided:** `apple_to_tiller.py` converts an Apple Card CSV
export into Tiller Transactions format. Apple exports purchases as *positive*;
the script inverts every amount, which also correctly turns payments and returns
into inflows. Category is left blank on purpose so Adam's 414 existing AutoCat
rules classify the rows. Transaction IDs are md5-hashed from date+amount+description
so re-running an overlapping range can't create duplicates. Default `--start` is
2026-07-23 to match the feed. Rows are tagged `Import Tag = AppleCard-CSV`.
A pre-converted file for 7/23–8/12 (40 rows) is included as `tiller_apple_card.csv`.

**Known data-quality issues in Tiller:**

- 12 transactions with a blank Category, ~$1,204 in August (13.5% of the month).
- A $740.08 Venmo inflow from Summer, noted "paul payments," is miscoded as
  `Groceries`, which inverts that category's August total. It is a reimbursement
  related to in-home care for Paul Michaelson, not a grocery refund. Note: this does
  **not** affect the budget number — the script ignores positive amounts — it only
  pollutes category reporting.
- Proposed AutoCat fix, not yet applied. AutoCat sheet columns are: `Category`,
  `Description Contains`, `Category Hint Contains`, `Account Contains`, `Amount Min`,
  `Amount Max`. Suggested rule: Description Contains `Summer Michaelson "paul`,
  Account Contains `Personal Profile`. Place it near the bottom of the sheet so it
  takes precedence over looser matches — and do NOT shorten it to just `paul`,
  which would collide with the existing `Paul O'donnell` → `Adam's Lunches` rule.
  The destination category still needs to be decided (a netting `Paul Care` expense
  category vs. `Transfer`); depends on whether Adam fronts the costs.

---

## 9. Website source

Provided in `site/`:

```
public/sms-optin/index.html            opt-in form
public/sms-optin-evidence/index.html   reviewer evidence page
public/privacy/index.html
public/sms-terms/index.html
functions/api/sms-optin.js             POST handler → D1
schema.sql
wrangler.toml
DEPLOY.md
```

**Missing from the bundle:** `public/sms-optin-evidence/optin-completed.png` — the
screenshot of the completed opt-in. Adam has it locally; it must be restored or
re-captured, because the evidence page is meaningless without it.

**Data model.** Append-only. A consent record is evidence, so nothing is ever
updated in place; opt-outs and resubscribes append as new events and a
`current_consent` view resolves the latest state per number.

`consent_events` columns: `id`, `occurred_at` (ISO 8601 UTC), `phone_e164`,
`event_type` (`opt_in`|`opt_out`|`resubscribe`), `source`
(`web_form`|`sms_keyword`|`admin`), `full_name`, `consent_text` (verbatim wording
displayed at consent time), `program_name`, `msg_frequency`, `privacy_url`,
`terms_url`, `ip_address`, `user_agent`, `note`.

The `consent_text` column is the important one: if the form wording changes later,
you can still prove exactly what each person agreed to on the day they agreed.

**Function notes.** Honeypot field `company` returns 200 silently. Phone numbers
normalize to E.164 (10 digits or 11 starting with 1; anything else rejected).
A prior `opt_out` for the same number causes the new event to be recorded as
`resubscribe`. Do **not** add an `onRequest` catch-all export to the Function file —
in Pages Functions it takes precedence over method-specific handlers and would
swallow the POST.

---

## 10. Twilio submission values that were used

Kept for reuse on resubmission. **Do not resubmit until the site is actually live
again** — every URL here must resolve.

**Use case:** Account Notifications · **Volume:** 100/mo · **Opt-in type:** Web form

**Use case description (max 500 chars, this is 483):**

> Automated daily household financial notification. A Google Apps Script on a
> scheduled daily trigger reads transaction and budget data from a private Google
> Sheet and sends one SMS summarizing the prior day's spending and month-to-date
> budget progress. Recipients are the two enrolled adult members of the operator's
> household, both of whom opted in at https://adam-michaelson.com/sms-optin. One-way
> transactional notifications only. No marketing, promotional, or third-party content.

**Sample message:**

> Household Budget Summary 8/16: $142.18 spent (Groceries $88.40, Gas (auto) $53.78).
> Month to date: $4,210.55 of $9,400.00. Reply STOP to cancel.

**Opt-in policy proof:**

```
https://adam-michaelson.com/sms-optin
https://adam-michaelson.com/sms-optin-evidence
```

**Terms URL:** `https://adam-michaelson.com/sms-terms`
**Privacy URL:** `https://adam-michaelson.com/privacy`

**Help message:**

> Household Budget Summary from Adam Michaelson: daily household budget alerts,
> approx 1 msg/day. Msg&data rates may apply. Reply STOP to cancel. Support:
> adam.h.michaelson@gmail.com

**Opt-in keywords and opt-in message: left blank, deliberately.** The evidence page
states the web form is the only opt-in path. Claiming text-keyword opt-in would
contradict it and a reviewer who spots the mismatch bounces the submission. Blank
still means Twilio honors START/YES/UNSTOP by default.

**Additional information (492 chars):**

> Private, closed program with exactly two enrolled recipients, both adult members
> of the operator's household. Not offered to the public and not a commercial
> service. The only opt-in path is the web form at
> https://adam-michaelson.com/sms-optin; text-keyword opt-in is not offered. Each
> consent is recorded in an append-only ledger with timestamp, verbatim consent
> language, and originating IP. A screenshot of a completed opt-in is published at
> https://adam-michaelson.com/sms-optin-evidence.

---

## 11. Mistakes made in this session — don't repeat them

1. **Two campaign rewrites before checking whether the campaign was registrable at
   all.** The 30909/30886 failures were structural. Read the vendor's error docs
   before drafting copy against them.
2. **Directed a deploy into a shared Pages project without warning that Pages
   replaces the whole site.** This caused the outage and the toll-free rejection.
3. **Told the user wrangler.toml bindings weren't enough for Pages.** They are —
   wrangler applies them at deploy time and the dashboard goes read-only as a result.
4. **Invented placeholder numbers ($3,800 budget, $142.18 spend) in sample messages,
   which the user then carried into live Twilio config.** Label fabricated values
   loudly or don't produce them.
5. **Guessed at Twilio and Cloudflare console navigation.** Both had moved. Cloudflare
   is Compute → Workers & Pages. Twilio is Numbers & senders → Overview → Phone
   Numbers → Set up a new phone number. The Pages production branch defaulted to
   `production`, not `main`.

---

## 12. Working preferences (carry these forward)

- Concise, high-signal. Contained scope unless he asks to broaden it.
- One deliverable drafted, calibrated, and approved before moving to the next.
- When he has set the values or design constraints for a project, work within them
  rather than re-litigating the philosophy.
- Never pretend a tool worked when it didn't. Distinguish "verified" (actually read
  from the system) from "user-confirmed" (relying on what he said).
- Values truth over agreement. Asks to be told when a response is flattering him.
- Financial detail does not go in Claude's persistent memory — the Notion Finances
  page is its canonical home.
- As of Aug 2026 he is deliberately shedding discretionary commitments to protect
  capacity for a job search and homeschooling. Weigh new optional work against that.
