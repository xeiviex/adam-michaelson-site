# Project Atlas — Data Source Research

**Purpose:** Evaluation of third-party data sources for Atlas's three data layers — **Food/nutrition**, **Exercises**, and **Local health businesses (marketplace/places)**. For each domain: top 5 recommendations with coverage, adoption, cost, pros/cons, and links.

**Compiled:** August 2026. Pricing and licensing terms change frequently — confirm on each vendor's own page before committing. A few figures are secondary-sourced (noted inline) because the vendor endpoints are blocked by this environment's egress proxy.

**How this connects to the object model:**
1. `Food` and `Exercise` each need a **source** + **verified** distinction (verified backbone from a data source + user-created customs, with a flag for whether a custom is shareable back to the shared set).
2. `Organization` (marketplace/places) **can't assume we own the data** — storability is a *licensing* property. Likely needs a `data_source` + `cache_expires_at` concept, or a two-tier model (stored catalog + live-fetched detail).
3. The **"Costco / most reputable sources"** principle argues for verified, curated backbones over cheap scraped sets, even at higher cost.

**Cross-cutting finding:** Licensing/caching terms matter as much as the data. Some sources are storable (build and own a catalog); others forbid persistence and bill on every render. Build each persistence layer around the strictest source you display.

---

## 1. Food & Nutrition

> **✅ SELECTED (2026-08-14): FatSecret (verified backbone) + USDA FoodData Central (free fallback).**
> Barcode-first UX + "most reputable sources" principle; $0 to build/run for US-only. See
> `../decisions-log.md`.

### Shortlist

| Source | Cost | Barcode/UPC | Coverage strength | Free & always-updated? |
|---|---|---|---|---|
| **USDA FoodData Central** | Free (gov) | Partial (branded set has GTIN/UPC) | Authoritative generic/whole foods + best micros | Yes — branded refreshed monthly |
| **Open Food Facts** | Free (ODbL) | Yes — 3M+ barcodes | Global packaged/branded, crowdsourced | Yes — grows daily |
| **FatSecret Platform API** | Free tier + Premier (quote) | Yes (>90% hit rate) | Verified global branded + generic | Yes — actively curated, 56 countries |
| **Nutritionix (Syndigo)** | Small free tier + enterprise | Yes (UPC on every CPG) | Best branded + restaurant | Yes — ~72-hr freshness, 10–15k updates/mo |
| **Edamam** | Free tier + $14–$299/mo | Yes | Branded + generic + NLP | Yes — commercial upkeep |

**Truly free + always-updated open sets:** USDA (public domain, no attribution required) and Open Food Facts (ODbL — attribution + share-alike if redistributing a derived database; fine to use inside the app).

### 1. USDA FoodData Central — free, authoritative generic/whole-food backbone
- **Coverage:** ~1.9M+ foods across Foundation Foods, SR Legacy, FNDDS (survey), Experimental, and the Global Branded Food Products Database. Richest micronutrient detail of any source here. Branded set carries GTIN/UPC (lookup possible, but not optimized as a barcode-scan service).
- **Freshness:** #1 API traffic on data.gov. Branded foods updated monthly online; downloadable branded file refreshes twice a year (Apr & Oct).
- **Adoption:** De-facto reference dataset; many commercial DBs seed or cross-check against it. Gold standard for generic/whole-food accuracy.
- **License/cost:** 100% free. Register for a free api.data.gov key (~1,000 req/hr, raisable). Public domain — commercial use permitted, no attribution/share-alike.
- **Pros:** Free forever, no restrictions/attribution; lab-grade nutrient + micronutrient data; actively maintained; ideal verified backbone for generic/whole foods.
- **Cons:** Branded/restaurant coverage and barcode UX lag commercial players; no restaurant menus; US-only; data-type sprawl means you must normalize before serving.
- **Links:** https://fdc.nal.usda.gov · API: https://fdc.nal.usda.gov/api-guide · Key: https://fdc.nal.usda.gov/api-key-signup · Update log: https://fdc.nal.usda.gov/log

### 2. Open Food Facts — free, open, ever-growing barcode database
- **Coverage:** 3M+ products, growing daily (community-contributed). Barcode-first (EAN-13 / UPC-A); also full-text/faceted search. Global (strong in Europe, growing in US). Nutrition facts, ingredients, labels, photos.
- **Adoption:** World's largest *open* food database; common free barcode fallback in apps; used by researchers/NGOs. Non-profit.
- **License/cost:** 100% free, no rate limiting for reasonable use. ODbL — commercial use allowed, but **attribution + share-alike**: credit Open Food Facts, and if you publicly distribute a modified/derived *database*, share it back under ODbL. (Using data inside the app is fine; share-alike bites on redistribution of the enriched DB.) Bulk dumps available for local hosting.
- **Pros:** Free; best free barcode source (3M+ UPCs); continuously grown/cleaned; self-hostable dumps.
- **Cons:** Crowdsourced → variable data quality; ODbL share-alike is a real consideration; no restaurant menus; thinner US coverage.
- **Links:** https://world.openfoodfacts.org · API: https://openfoodfacts.github.io/openfoodfacts-server/api/ · Data/license: https://world.openfoodfacts.org/data

### 3. FatSecret Platform API — best all-round verified backbone
- **Coverage:** 1.9M+ verified foods across 56 countries (branded + generic + restaurant). Dedicated UPC/EAN barcode DB with >90% scan success — strongest single-API barcode story. Also recipes, exercises, NLP, image recognition, diary/weight primitives.
- **Adoption:** 35,000+ developers, ~700M API calls/month. One of the most widely embedded nutrition backends.
- **License/cost:**
  - **Basic — FREE:** 5,000 calls/day, US data only, attribution required.
  - **Premier Free:** startups/non-profits/students — unlimited calls + all premium features + US data, attribution required (sweet spot for early stage).
  - **Premier (paid):** white-labelled, global 56-country data, image recognition. **Price is quote-only — contact FatSecret.**
- **Pros:** Best free-to-start path; excellent barcode coverage; verified/curated; purpose-built for food-tracking apps.
- **Cons:** Paid pricing opaque; free/Premier-Free require attribution; global data + white-label gated behind paid.
- **Links:** https://platform.fatsecret.com/platform-api · Editions: https://platform.fatsecret.com/api-editions · Upgrade: https://platform.fatsecret.com/upgrade-account

### 4. Nutritionix (Syndigo) — best branded + restaurant coverage
- **Coverage:** ~975k+ grocery CPG (>92% market), 192k+ restaurant menu items (600+ chains), ~38.5k generic foods — ~1.9M+ total. UPC on every CPG record. Standout freshness: new CPG captured/verified within ~72 hrs of market; ~10–15k additions/updates per month. Strong NLP ("two eggs and toast") endpoint.
- **Adoption:** ~700M calls/month; powers food-tracking apps, weight-loss programs, hospitals, clinical trials. `natural/nutrients` endpoint is an informal standard.
- **License/cost:** Free dev tier ~200 calls/day (attribution required). Paid/enterprise negotiated. Publicly reported (indicative, confirm): hobby ~$50/mo (~10k calls/day); production $500–$2,000+/mo; enterprise from ~$1,850/mo, usually billed annually; 10% non-profit discount on annual >$6k. No self-serve mid-tier.
- **Pros:** Best restaurant + branded coverage and fastest freshness; excellent NLP; UPC on every product; well-documented.
- **Cons:** Tiny free tier (200/day); enterprise-style opaque pricing; US-centric.
- **Links:** https://www.nutritionix.com/api · Licensing: https://www.nutritionix.com/database · https://syndigo.com/nutrition-and-wellness/

### 5. Edamam Food Database API — balanced commercial option, usable free tier
- **Coverage:** Branded + generic ("common") foods; grocery/CPG focus with barcode/UPC; NLP + full macro/micro analysis; newer image recognition. Commercially maintained.
- **Adoption:** Widely used by recipe/diet/wellness apps; common pick for NLP + nutrition analysis together.
- **License/cost (verify — plans shift):** Basic FREE ~1,000 req/day. Basic Vision ~$14/mo (100k calls + 500 vision). Core ~$69/mo (750k). Plus ~$299/mo (5M + 10k vision). PAYG ~$0.00003/req; higher tiers to ~$999/mo. Free tier requires attribution and **restricts caching** — confirm before launch.
- **Pros:** Transparent low-cost tiers ($14–$299/mo); bundles NLP + macro/micro; decent free tier for prototyping.
- **Cons:** Free tier restricts caching/storage + attribution; branded/restaurant breadth trails Nutritionix/FatSecret; historically split into multiple APIs.
- **Links:** https://developer.edamam.com/food-database-api · https://developer.edamam.com · https://www.edamam.com

**Not in top 5 — Spoonacular:** excellent recipe/meal-planning API, but not a verified per-product nutrition backbone with barcode. Good to add later for recipe features. Pricing: Free $0, Cook $29/mo, Culinarian $79/mo, Chef $149/mo, Enterprise custom; $10/mo academic. https://spoonacular.com/food-api/pricing

**Recommended pattern:** commercial API (FatSecret *or* Nutritionix) as primary verified backbone + USDA/Open Food Facts as free fallbacks + user-generated custom-foods table on top. For zero/low cost: combine USDA (generic + micros, no attribution) with Open Food Facts (barcodes), owning the cleaning/normalization work.

---

## 2. Exercises

### Two key answers
- **What Strong (strong.app) uses:** A proprietary, in-house library (~300+ exercises) with its own commissioned animations. Closed-source — **you cannot license "the Strong dataset."** Strong is the *product pattern* to copy (curated verified core + user custom on top), not a source to buy.
- **The GIF set reused everywhere:** **ExerciseDB** (~1,300–1,500 exercises, looping GIFs) and its many GitHub mirrors. **The GIFs originate from [Gym Visual](https://gymvisual.com), a company that sells them.** ExerciseDB redistributes "with permission"; most free GitHub mirrors do **not** have that permission — unlicensed copyrighted media. The other widely-reused set, free-exercise-db, is **static images** and genuinely public-domain-safe.

### Shortlist

| Source | Content | Media | License | Cost |
|---|---|---|---|---|
| **wger** | ~845 exercises, rich metadata, multilingual | Sparse images/some video — no GIF library | CC-BY-SA (attribution + share-alike) | Free / self-host |
| **free-exercise-db** (yuhonas) | 800+, full metadata + instructions | Static images only | Public domain (Unlicense) | Free |
| **ExerciseDB / AscendAPI** | 1,300–1,500+ | GIFs for all (Gym Visual origin) | Redistribution forbidden; provenance risk | RapidAPI free tier ~10/day; ~$10–50/mo; or one-time bundle |
| **MuscleWiki API** | 1,900+, 7,500+ videos | Real videos, legitimately licensed | Commercial OK, attribution, stream-only | Paid (pricing not public) |
| **WorkoutX** | 1,400+ | GIFs (same Gym-Visual lineage — verify) | Claims commercial OK | Free 500/mo; $9.99/mo+ |

### 1. wger — safe, open-source backbone
- **Content:** ~845+ exercises. Name, category, primary/secondary muscles, equipment, multilingual descriptions, images/videos arrays. Media coverage uneven; not a comprehensive animated-GIF set.
- **Adoption:** Widely used open-source reference backbone; the "clean-license" alternative to ExerciseDB.
- **License/cost:** Free. Code AGPL-3.0; data CC-BY-SA 4.0 (older 3.0). Commercial use with attribution + share-alike (derivative datasets under same terms — matters if you want a closed proprietary catalog). Public API free; self-hostable.
- **Pros:** Cleanest license of any large set; rich structured multilingual metadata; self-hostable (no limits/lock-in).
- **Cons:** Media sparse/inconsistent — not the animations you want; share-alike awkward for a closed catalog.
- **Links:** https://github.com/wger-project/wger · https://wger.readthedocs.io · https://wger.de/en/software/features

### 2. free-exercise-db (yuhonas) — public-domain default
- **Content:** 800+ exercises. Fields: id, name, force, level, mechanic, equipment, primary/secondary muscles, instructions, category, images.
- **Media:** Static JPG images only (start/end pose) — no GIFs/video.
- **Adoption:** One of the two most-reused open sets in indie apps. Derived from wrkout/exercises.json.
- **License/cost:** Free. Data + code under The Unlicense (public domain), no attribution, commercial OK. Image license technically unspecified (open GitHub issues) but circulated as public-domain for years, low-risk in practice.
- **Pros:** Truest "do whatever" license; zero cost, offline-bundleable, simple JSON; great verified backbone under user customs.
- **Cons:** No animations; image licensing not formally documented; ~800 exercises is mid-sized.
- **Links:** https://github.com/yuhonas/free-exercise-db · Demo: https://yuhonas.github.io/free-exercise-db/

### 3. ExerciseDB / AscendAPI — the GIF set everyone uses (with a caveat)
- **Content:** ~1,300–1,500 exercises. Name, bodyPart, target + secondary muscles, equipment, instructions, and a GIF each. Richest ready-made animated set.
- **Media origin (critical):** Gym Visual's commercial animations, redistributed "with permission." Your permission flows only through a current, valid ExerciseDB/AscendAPI/Gym Visual license — not the GitHub mirrors.
- **Adoption:** The single most common source of animated exercise demos in third-party apps.
- **License/cost (fragmented):** RapidAPI original free tier gutted to ~10 req/day; paid ~$10–50+/mo. AscendAPI/exercisedb.dev has a free hosted OSS tier (180p GIFs) + paid multi-resolution. exercisedb.io sells a one-time downloadable bundle (~1,394 exercises, JSON + GIFs to self-host) — use inside app OK, reselling/redistribution forbidden.
- **Pros:** Turnkey complete animated set; good metadata; self-hostable bundle option.
- **Cons:** Licensing provenance risk (media is Gym Visual's); fragmented/unstable pricing; classic free tier near-useless; redistribution forbidden (can't open your catalog).
- **Links:** https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb · https://exercisedb.dev · https://oss.exercisedb.dev/docs · https://exercisedb.io · Media source: https://gymvisual.com

### 4. MuscleWiki API — legitimately-licensed video option
- **Content:** 1,900+ exercises, 7,500+ video demonstrations (multiple angles). Target muscles, equipment, categories, body-map images, instructions.
- **Media:** Real videos — and MuscleWiki actually owns/licenses this media (unlike scraped GIF sets). Cleanest animated option.
- **Adoption:** MuscleWiki.com very popular; official API is newer. Many unofficial scrapers exist but violate terms.
- **License/cost:** Paid; all paid plans include full commercial-use rights, no extra licensing fee. Attribution required ("Powered by MuscleWiki"). Strict: no scraping/mass-download, no ML/AI training, metadata cache 30 days, thumbnails 24h, **videos transient-only (stream, don't store).** Exact USD prices not retrievable (endpoint egress-blocked) — confirm on their site.
- **Pros:** Cleanest media rights of any large animated set; highest quality/volume; explicit commercial terms.
- **Cons:** Paid + restrictive caching (can't bundle offline, must stream); mandatory attribution; can't self-host media; pricing not transparent.
- **Links:** https://api.musclewiki.com · https://api.musclewiki.com/documentation · https://musclewiki.com/api-terms

### 5. WorkoutX — modern free-tier GIF API
- **Content:** 1,400+ exercises with GIFs. Target/body-part muscle, equipment, category, step-by-step instructions.
- **Media:** Animated GIFs for all. Same Gym-Visual-derived lineage as ExerciseDB — treat provenance with same caution.
- **Adoption:** Newer; positions as "ExerciseDB without RapidAPI"; growing among indie devs.
- **License/cost:** Free tier 500 req/mo, 30 req/min, full DB + GIFs, no card. Basic $9.99/mo (3,000 req), Pro (10,000), Ultra (35,000). Direct API keys. Claims commercial-use permitted.
- **Pros:** Actually usable free tier; transparent low pricing; direct API, cleaner DX; GIFs out of the box.
- **Cons:** Same GIF-provenance question — verify media license; newer/smaller vendor (longevity risk); metered rather than one-time buy.
- **Links:** https://workoutxapp.com · https://workoutxapp.com/docs.html

**Also:** Everkinetic (github.com/everkinetic/data) — CC-BY-SA, ~800 entries, start/finish image pairs (2-frame "animation"), clean license but minimal animation. LogPress (github.com/hasaneyldrm/exercises-dataset) — 1,324 exercises, ExerciseDB-lineage GIFs (same provenance risk).

### Licensing risk tiers
- **Safe (data + media):** free-exercise-db (public domain, static images), wger (CC-BY-SA, sparse media), Everkinetic (CC-BY-SA, 2-frame images).
- **Safe if you pay the legitimate channel:** MuscleWiki official API (license video from the owner), ExerciseDB/AscendAPI or Gym Visual purchased directly.
- **Avoid for commercial launch:** random GitHub GIF dumps, scraper repos, unofficial MuscleWiki scrapers — same media, no license.

**Recommended architecture:** seed verified backbone metadata from wger or free-exercise-db (clean license, needed fields); source animations by licensing MuscleWiki, buying ExerciseDB/Gym Visual directly, or commissioning your own (only way to fully own them — what Strong did); let users add custom exercises on top. Do **not** ship free-mirror GIFs.

---

## 3. Gyms & Local Health Businesses (Places)

**Scope:** Find nearby gyms, health-food stores, smoothie/juice bars, physical therapists, supplement/gear retailers, wellness/recovery — by location + category, returning name, address, hours, phone, website, ratings/reviews, photos, lat/lng.

### Shortlist

| Provider | Reviews | Photos | Store/cache displayed data? | Free tier | Headline price |
|---|---|---|---|---|---|
| **Google Places (New)** | Yes (best) | Yes | **No** — Place ID forever, lat/lng ≤30 days, rest live-only | 10k/5k/1k by SKU tier | Text Search Pro ~$32/1k |
| **Foursquare Places** | Yes | Yes (Premium) | **Yes, ≤30 days** | ~10k Pro calls | Premium fields from ~$18.75/1k |
| **Yelp Fusion** | Yes (best reviews) | Yes | **No** — destroy within 24h (IDs only) | 30-day trial, 5k total | Starter $7.99/1k (300/day cap) |
| **HERE** | Weak/none | Limited | **Yes, ≤30 days** (no AI/ML use) | 30k/mo (or 1k/day) | ~$0.83/1k |
| **OSM / Overpass** | No | No | **Yes, indefinitely** (ODbL) | Free / self-host | $0 |

**Caching split (biggest data-model consequence):**
- **Live-calls-only (store IDs, not content):** Google, Yelp, Mapbox. Every render is effectively another billable call; no offline catalog.
- **Store up to 30 days:** Foursquare, HERE — build a real searchable local database.
- **Store indefinitely:** OSM (ODbL attribution + share-alike), but no ratings/reviews/photos.

### 1. Google Places API (New) — coverage/quality leader
- **Data:** Most complete/freshest consumer-business dataset. Taxonomy covers gym, fitness_center, health, physiotherapist, wellness_center, spa, etc. Returns name, address, lat/lng, phone, website, opening hours, rating + count, individual reviews, photos.
- **Adoption:** De facto default; largest install base.
- **Cost (2025–2026):** Since Mar 1 2025, per-SKU free monthly thresholds: 10k Essentials / 5k Pro / 1k Enterprise. Representative first paid tier: Place Details Essentials $5 / Pro $17 / Enterprise $20 per 1k; Text Search Pro ~$32/1k; Nearby Search (Enterprise) ~$35/1k. Volume discounts >100k, >500k.
- **ToS (strictest):** Store Place IDs indefinitely, cache lat/lng ≤30 days. **No caching of display fields** — name/address/rating/reviews/photos/hours must be live. Scraping/exporting prohibited. Forces live-fetch design.
- **Pros:** Best quality/coverage/freshness/reviews/photos; taxonomy maps to fitness/health; field-masked billing.
- **Cons:** Can't cache displayed data (recurring cost per view, no offline model); most expensive at scale; Maps Platform lock-in.
- **Links:** https://developers.google.com/maps/documentation/places/web-service/overview · Billing: https://developers.google.com/maps/documentation/places/web-service/usage-and-billing · Caching: https://developers.google.com/maps/documentation/places/web-service/policies

### 2. Foursquare Places API — best storage rights + POI depth
- **Data:** Excellent fine-grained POI taxonomy (gyms, yoga/pilates, health-food, juice bars, PTs, supplements, spas/recovery). Pro returns name/address/lat/lng/category; Premium adds photos, tips (reviews), rating, hours.
- **Adoption:** Widely used, especially where you need to store/own place data; long-standing Google alternative.
- **Cost (2025–2026):** Sandbox / Pay-As-You-Go / Enterprise. Dev accounts historically ~$200/mo credits (no rollover) ≈ ~10k Pro calls/mo. Premium endpoints from ~$18.75/1k (no free tier). Note: from Jun 1 2026, accounts get 500 free Pro calls (credit model revised) — verify.
- **ToS (favorable):** Cache allowed if refreshed ≥ every 30 days; none beyond 30 days. Attribution required. Can't expose "material portions" to third parties. **30-day storage is the key advantage.**
- **Pros:** 30-day caching → own a searchable store, cut cost; deep taxonomy; PAYG with Pro free allotment.
- **Cons:** Photos/hours/ratings/tips are Premium (extra cost); review depth thinner than Google/Yelp; credit terms in flux.
- **Links:** https://foursquare.com/pricing/ · Docs: https://docs.foursquare.com/developer/reference/places-api-overview · License: https://foursquare.com/legal/terms/apilicenseagreement/

### 3. Yelp Fusion / Places API — best reviews, worst storage terms
- **Data:** Best-in-class reviews/star ratings for local health/fitness businesses. Name, address, lat/lng, phone, URL, hours, rating + count, review excerpts, photos.
- **Adoption:** The reference source for local reviews.
- **Cost (2025–2026):** Free access ended; all paid. 30-day trial = 5k calls total. Starter $7.99/1k (300/day cap), Plus $9.99/1k (500/day), Enterprise $14.99/1k. Overages 429; reset midnight UTC.
- **ToS (very restrictive):** Remove from display and destroy Yelp Content within 24h — no long-term storage. May retain business IDs for back-end matching only. Mandatory Yelp attribution; cannot blend Yelp ratings with other sources.
- **Pros:** Richest reviews/ratings for exactly these businesses; clear low pricing at small scale.
- **Cons:** 24-hour destroy rule (no caching); mandatory attribution + no rating blending; low daily caps (300–500/day).
- **Links:** https://business.yelp.com/data/products/places-api/ · Pricing: https://business.yelp.com/data/resources/pricing/ · Display: https://terms.yelp.com/developers/display_requirements/

### 4. HERE — generous free tier, storable, thin on reviews/photos
- **Data:** Solid POI/geocoding covering fitness/health; name, address, lat/lng, contacts/website/hours where available. Weak on ratings/reviews and photos.
- **Adoption:** Common in automotive/logistics/enterprise; a frequent Google alternative for volume/cost.
- **Cost (2025–2026):** Base ~30k free transactions/mo; Limited 1k req/day. Paid ~$0.83/1k up to 5M, ~$0.66/1k 5–10M — among the cheapest.
- **ToS:** Store/cache up to 30 days. Can't share results with third parties; **prohibits use with ML/AI systems** (training, predictive, generative) — relevant to Atlas's intelligence layer.
- **Pros:** Large free tier + lowest per-call at scale; 30-day storage; strong geocoding/address quality.
- **Cons:** Little/no ratings/reviews/photos; third-party-sharing + AI/ML prohibitions; shallower niche taxonomy.
- **Links:** https://www.here.com/get-started/pricing · Docs: https://www.here.com/docs/bundle/geocoding-and-search-api-v7-api-reference/page/index.html · Terms: https://legal.here.com/terms

### 5. OpenStreetMap / Overpass (+ Nominatim) — free, open, storable
- **Data:** Good structured tags (leisure=fitness_centre, shop=health_food, amenity=juice_bar, healthcare=physiotherapist, shop=nutrition_supplements, leisure=spa). Name, lat/lng, and (where mapped) addr:*, phone, website, opening_hours. No ratings/reviews/photos. Coverage uneven (dense in cities, sparse long tail).
- **Adoption:** Extremely broad as base map data; rarely used alone for business discovery (missing ratings/photos).
- **Cost:** $0. Public endpoints rate-limited (Nominatim ~1 req/s; Overpass fair-use) and not for heavy commercial load — self-host for production.
- **ToS:** ODbL 1.0 — store indefinitely, but attribution + share-alike on derived databases. Valid User-Agent/Referer required.
- **Pros:** Free and you can own the data (no per-render billing); good taxonomy; self-host for unlimited volume; no lock-in.
- **Cons:** No ratings/reviews/photos; completeness/freshness varies; phone/hours/website often missing; ODbL share-alike; public rate limits force self-hosting at scale.
- **Links:** https://wiki.openstreetmap.org/wiki/Overpass_API · https://overpass-turbo.eu/ · License: https://www.openstreetmap.org/copyright

**Also evaluated:** Mapbox Search Box — 500 free sessions/mo, $11.50/1k after (rose ~4× Aug 2025), temporary-use-only (storage forbidden without sales deal); no reviews/photos. TomTom Search — free 2,500 req/day, ~$2.50/1k overage, storage restricted, no reviews/photos; pricing revised Jul 2026.

**Recommended hybrid (respects terms):** use Foursquare or OSM as your stored catalog (search, categories, lat/lng), call Google or Yelp live only on the detail screen for ratings/reviews/photos. Build persistence around the strictest source you display.

---

*Prices and ToS change frequently (Google Mar 2025, Mapbox Aug 2025, Foursquare Jun 2026, TomTom Jul 2026). Confirm on official pages before committing. Egress-blocked figures (MuscleWiki, RapidAPI/ExerciseDB, some places pricing) are secondary-sourced.*
