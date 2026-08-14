# Decisions Log

The cross-thread glue. Every real decision (with the reasoning) goes here so any thread can catch up
without reading another thread's conversation. Keep newest at top. Distinguish **DECIDED** from
**PENDING** (researched/discussed but Adam hasn't chosen yet).

---

## 2026-08-14

**DECIDED — `User` object.** `User` = one human identity (one person, one login); no `type` field —
persona is *derived*: a **person** is a User with no org staff affiliation; an **admin** is a User with
a **Role at an Organization** (admin is a role, only ever at an org; gym-vs-provider comes from the
Org's type). Two distinct User↔Org links: **staff/admin** (Role → permissions) vs **member/customer**
(`Membership/contract` → money). Access: person = their consumer `Plan`; admin = Org's `Plan` ∩ Role.
`Plan` is typed by subscriber (personal-app subscription, org subscription, …). Static profile only on
User (name, DOB, sex, locale, units); **weight lives in `Measurement`**, not User. Auth/lifecycle:
passkey, email verification, invitation→onboard, health-app link, status. Role/Plan/Membership/
Measurement internals deferred to their own passes. (See `product/data-model.md` → Resolved objects.)

**RESEARCH SAVED — Competitive landscape.** See `research/competitive-landscape.md`. Bottom line:
no company does Atlas's exact integrated tri-sided (consumer app + gym SaaS + marketplace + neutral
AI) vision. Closest = Playlist (Mindbody+ClassPass+EGYM, ~$7.5B, merged Mar 2026) and Wellhub. The
identified **whitespace = genuinely unified, AI-personalized, incentive-aligned tri-sided architecture**
(incumbents integrate by acquisition, not architecture; their AI is a workout coach, not a neutral
recommender; and they're split by who-pays). Caveat: mature, PE-consolidated market — a hard,
execution-and-trust wedge, not an empty field.

**PENDING — Product name.** Round-1/2 brainstorm + prevalence scans done (see chat; not yet saved to
a doc pending finalists). "Atlas" is crowded in consumer fitness apps and collides with Peloton-owned
Atlas Wearables + Atlas Bar. Current finalists under **deep clearance scan**: **Tonova, Valen, Aptus**.
On naming a winner, Adam will rebrand all assets (repo/docs/branch) from "atlas" to the chosen name.

**PENDING — Data model iteration.** Stress-tested Adam's 13-object draft against the vision, KPIs,
and use cases; new open questions logged in `product/data-model.md` (Claude's reactions, 2026-08-14).
Headline items awaiting Adam's calls: (1) **definition-vs-performed-instance** split for
`Workout`/`Exercise` as the first decision (ripples into `Set`, history, logs); (2) `Exercise`
carries derived per-user metrics (1RM/PR/logs) that belong on the performed side; (3) thin
marketplace chain — likely need `Order`/`Transaction` + a first-class **commission/conversion**
between `Offer` and `Payment` (KPI-critical); (4) `Plan` (Atlas-side) vs `Membership` (gym-side)
naming overload; (5) `Organization` split into **claimed tenant** vs **discovered catalog place**
(where caching/licensing lives); (6) `Goal` + `Measurement`/`Vital` (health-app source) as top-tier
for "better off"; (7) Activity Log → split user-facing timeline (composed) from audit event store.
**No objects added to the model** — reactions/questions only, per the working agreement.

**DECIDED — Docs-as-shared-memory structure.** Atlas is organized under `atlas/` with one doc per
topic; `CLAUDE.md` (auto-loaded) carries the working agreement + the read-on-entry / write-on-exit
discipline. Rationale: separate threads don't share live memory, so the committed docs are the only
durable shared context.

**PENDING — Food data source.** Research complete (`research/data-sources.md`). Leading options: free
backbone = USDA FoodData Central + Open Food Facts; turnkey commercial = FatSecret or Nutritionix.
Not yet chosen.

**PENDING — Exercise data source.** Research complete. Key finding: the ubiquitous animated-GIF sets
trace to Gym Visual's commercial media; free GitHub mirrors are a licensing risk. Leading approach:
clean-license metadata backbone (wger or free-exercise-db) + animations via a legitimate channel
(license MuscleWiki, buy ExerciseDB/Gym Visual directly, or commission own). Not yet chosen.

**PENDING — Places/vendor data source.** Research complete. Caching rights vary and drive the data
model (Google/Yelp = live-only; Foursquare/HERE = 30-day cache; OSM = indefinite). Leading approach:
stored catalog (Foursquare or OSM) + live detail calls (Google or Yelp). Not yet chosen.

**PENDING — First prototype wedge.** Candidate: consumer workout loop (browse template → start →
complete sets/exercises → complete → history). Not yet confirmed.
