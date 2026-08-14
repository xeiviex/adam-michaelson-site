# Data Model

> Adam's object model, verbatim, followed by open questions. Iteration in progress. Claude reacts
> and questions here — does not rewrite the model unless Adam asks.

## Object model (Adam's draft, verbatim)

- **User** (with types and roles; person has access based on plan, admin has access based on plan + role)
- **Role** (user roles)
- **Plan** (for person, gym, provider – strata for each)
- **Organization** (with types – gym, restaurant, clothing, trainer, etc.)
- **Workout** (includes stats, vitals, etc.)
- **Exercise** (type, includes reps, weight, logs, 1RM, PR, etc.)
- **Set**
- **Activity log** (should I make this a log for everything – food, workout, user activity, payments, plan change, check in, login, etc.? Or should I have different logs for each purpose?)
- **Food** (may be custom entered or from data source)
- **Meal**
- **Offer**
- **Membership/contract**
- **Payment**

## Open questions (raised, not decided)

1. **Activity Log — one log or many?** (Adam's own open question.) Also: which of these is it meant
   to be — (A) technical event store, (B) business audit log, (C) user-facing timeline, or (D) the
   canonical history from which many features derive? These are four different things.
2. **`Food` and `Exercise` need a source + verified distinction.** Confirmed by data-source research
   (`../research/data-sources.md`): a verified backbone from a data source, plus user-created customs,
   with a flag for whether a custom is shareable back to the shared set. Adam's model already gestures
   at this ("may be custom entered or from data source").
3. **`Organization` can't assume we own the data.** Places/marketplace records come from third-party
   APIs whose caching rights vary (some forbid storage, some allow 30 days, some indefinite). May need
   a `data_source` + `cache_expires_at` concept, or a two-tier model (stored catalog + live-fetched
   detail). See `../research/data-sources.md`.
4. **Objects the use cases imply but the list doesn't name yet** (open — not additions until Adam
   decides): Goal, Notification, Conversation/Message, Check-in, Review, Schedule/Class, and the
   Workout↔Exercise linking concept (a template vs. a performed instance).

## Claude's reactions — 2026-08-14 (data-model thread)

> Reactions and questions only; Adam's model above is untouched. Additions are labeled as such and
> are candidates for Adam to accept/reject, not decisions.

**What's strong (so it's preserved deliberately):**
- **`Organization` as one typed object** doing double duty — the SaaS *tenant* (gym) and the
  marketplace *supply side* (restaurant, retailer, trainer) — is elegant and matches the three-part
  vision. One onboarding/billing/profile spine serves both.
- **`Plan` and `Role` split from `User`** cleanly encodes "access by plan; admin access by plan +
  role" — the right instinct for a product that is consumer + multi-tenant SaaS at once.
- **`Workout → Exercise → Set`** is the proven decomposition (it's what Strong uses; see research).

**Highest-leverage decision — definition vs. performed instance (elevates the Q4 parenthetical):**
- `Workout` and `Exercise` each carry two meanings: a **definition** (the "Push Day A" *template*;
  the *bench press* exercise) and a **performed record** (today's session with vitals; today's bench
  press logged as 3 sets). The use cases force both — "browses templates," "starts a workout *from a
  template*," "creates from scratch," "views past workouts," "views *history for an exercise*." If
  each stays a single object you can't cleanly ask "show this template's 12 past performances." I'd
  treat the **definition/instance split as the first decision to make**, because it ripples into
  `Set`, history, and the Activity Log.
- **Follow-ons of that split:**
  - **`Set` lives on the instance side** (reps/weight only exist for a performed exercise). Is there
    also a *prescribed* set (target reps/weight the template specifies) distinct from the *actual*
    logged set? Two set-like concepts may be worth naming.
  - **`Exercise` is carrying derived per-user metrics** — the draft lists "logs, 1RM, PR" on it. Those
    are *computed facts about (user, exercise) over performed sets*, not attributes of the catalog
    definition. Suggest keeping `Exercise` as the definition and deriving 1RM/PR from logged sets (or
    a small `PersonalRecord` object if you want to cache/celebrate them).

**Marketplace transaction chain looks thin (KPI-critical) — `Offer → ? → Payment`:**
- Use cases go "reviews offer details → selects offer → *fills out requirements* → completes
  transaction (incl. payment)." That implies an **`Order`/`Purchase`** between `Offer` (the listing/
  promotion) and `Payment` (money movement). Question: is `Offer` the *catalog listing* or the
  *accepted deal*? Is a `Payment` distinct from the order it settles (one order → installments,
  refunds, multiple payments)?
- **Where does commission / conversion live?** The profitability KPI is "commission revenue from
  marketplace conversions." Today nothing models the platform take-rate or a "conversion" as a
  first-class thing. That likely wants a `Transaction`/ledger with fee + payout fields. *(Addition to
  consider, not asserted.)*

**Naming overload — `Plan` vs `Membership/contract`:**
- Two recurring-contract concepts sit side by side: **`Plan`** = what a person/gym/provider pays
  *Atlas*; **`Membership/contract`** = what a person pays a *gym* (sold through the marketplace).
  They're genuinely different money flows but both are "recurring agreement + payments." Worth
  confirming they stay distinct and consistently named — and whether a shared `Subscription` /
  `Contract` abstraction should back both, with `Plan` as the Atlas-side instance.

**`Organization` — a sharper cut than "add a `data_source` field" (extends Q3):**
- There are really *two kinds*: **(a) claimed/onboarded tenant orgs** (we own this data — profile,
  billing, config) and **(b) discovered catalog places** pulled from Foursquare/Google/OSM that a
  Person can browse but that haven't onboarded (storability governed by licensing; `data_source` +
  `cache_expires_at` belong *here*). A gym can exist as a discovered place *before* it becomes a
  tenant → a "claim your listing" path. The two-tier model in Q3 maps onto claimed-vs-discovered, not
  just owned-vs-cached.

**Objects the vision/KPIs make load-bearing (beyond the Q4 list):**
- **`Goal`** is arguably top-tier, not a "maybe" — the north star is "people *achieve their goals* and
  are better off," and there's a whole goals use-case group. *(Already in Q4; I'd promote it.)*
- **`Measurement`/`Vital`** (a biometric time series — weight, body metrics, health-app data) looks
  missing. "Better off" is Adam's *cross-user comparable* measure (healthier vitals), and the KPI is
  "we can quantify that we solve the problems." Vitals are currently implied *inside* `Workout`, but
  they're a standalone time series that also feeds Goals. **"Person connects to health app"** makes
  this another **source + verified** distinction like Food/Exercise (Apple Health / Google Fit as a
  source). *(Addition to consider.)*
- **`Connection` + visibility/privacy** for social ("see other people," "see another's stats,"
  "message"). A user↔user relationship plus a *who-can-see-my-stats* control — and trust is a stated
  product principle, so the visibility model isn't cosmetic. *(Message is already in Q4; Connection +
  privacy is the addition.)*

**Activity Log (Adam's Q1) — a concrete recommendation to react to:**
- The four purposes really are different objects. The cleanest cut I see: split the **user-facing
  timeline/history** (feature-bearing — "past workouts," nutrition history, goal progress; *composed
  from first-class domain records*, not a generic log) from a **system audit/event store** (payments,
  plan changes, logins — append-only, for proof/debug). Serving the UX timeline out of a generic
  event log couples the experience to plumbing. Framed the way you think about it: *what better
  decision does the log enable?* If "help the user see progress" → domain timeline; if "prove what
  happened" → audit store.
