# Decisions Log

The cross-thread glue. Every real decision (with the reasoning) goes here so any thread can catch up
without reading another thread's conversation. Keep newest at top. Distinguish **DECIDED** from
**PENDING** (researched/discussed but Adam hasn't chosen yet).

---

## 2026-08-14

**DECIDED — Docs-as-shared-memory structure.** Atlas is organized under `atlas/` with one doc per
topic; `CLAUDE.md` (auto-loaded) carries the working agreement + the read-on-entry / write-on-exit
discipline. Rationale: separate threads don't share live memory, so the committed docs are the only
durable shared context.

**DECIDED — Food data source: FatSecret + USDA.** FatSecret is the verified backbone (best barcode
hit rate >90%, purpose-built for food tracking, free to start — Basic 5k calls/day, or Premier-Free
= unlimited if we qualify); USDA FoodData Central is the free fallback for generics/whole foods and
micronutrients (public domain, no attribution). Rationale: barcode-first "scan and it just works" UX
plus the "most reputable sources / Costco" principle, at **$0 to build and run** for US-only. First
real cost is only global/international data (FatSecret Premier, quote-only). Nutritionix (best
restaurant/branded coverage, but $50–$2,000+/mo) deferred — reconsider if restaurant-menu depth
becomes an early priority. Open Food Facts available as a secondary free barcode fallback if needed.
(Adam decided 2026-08-14.)

**PENDING — Exercise data source.** Research complete. Key finding: the ubiquitous animated-GIF sets
trace to Gym Visual's commercial media; free GitHub mirrors are a licensing risk. Leading approach:
clean-license metadata backbone (wger or free-exercise-db) + animations via a legitimate channel
(license MuscleWiki, buy ExerciseDB/Gym Visual directly, or commission own). Not yet chosen.

**PENDING — Places/vendor data source.** Research complete. Caching rights vary and drive the data
model (Google/Yelp = live-only; Foursquare/HERE = 30-day cache; OSM = indefinite). Leading approach:
stored catalog (Foursquare or OSM) + live detail calls (Google or Yelp). Not yet chosen.

**PENDING — First prototype wedge.** Candidate: consumer workout loop (browse template → start →
complete sets/exercises → complete → history). Not yet confirmed.
