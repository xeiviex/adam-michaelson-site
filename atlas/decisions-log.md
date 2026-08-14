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
