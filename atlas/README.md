# Project Atlas

Atlas is an AI-native fitness ecosystem that combines a high-value consumer fitness app, a SaaS
platform for gyms, and a trusted marketplace connecting people with fitness products, services,
providers, and communities. The platform helps people achieve their goals and become better off
while helping gyms acquire and retain members and enabling fitness businesses to build profitable
customer relationships.

The canonical strategy source of truth is the vision doc (mirrored in `vision.md` here and kept in
a Google Doc Adam owns).

---

## How this workspace works (multi-thread project)

Different conversations focus on different topics. Separate threads don't share live memory — **these
files are the shared memory.** Each thread reads the relevant docs on entry and writes decisions back
on exit (see `../CLAUDE.md` for the discipline). The single rule that makes it work: **decisions get
written down.**

## File map

| File | Purpose |
|---|---|
| `vision.md` | The product constitution — verbatim, canonical. Do not rewrite. |
| `working-agreement.md` | How Adam and Claude collaborate. |
| `decisions-log.md` | Running log of decisions + reasoning. The cross-thread glue. |
| `product/use-cases.md` | Enumerated use cases and persona hypotheses (Adam's, verbatim). |
| `product/data-model.md` | Object model (Adam's, verbatim) + open questions. |
| `research/data-sources.md` | Food / exercise / places data-source evaluation. |
| `research/competitive-landscape.md` | Who's building integrated fitness platforms; the whitespace. |
| `strategy/gtm.md` | Go-to-market strategy (stub). |
| `design/ux-style-guide.md` | UX principles and style guide (stub). |
| `prototype/README.md` | Prototype notes; code lands here (stub). |

## Status snapshot (2026-08-14)

- **Vision:** captured (constitution complete). ✅
- **Use cases:** first batch enumerated; not yet prioritized.
- **Data model:** iterating object-by-object. `User` resolved (2026-08-14); rest are draft + open questions.
- **Data sources:** research complete (food / exercise / places); selection **not yet decided**.
- **Prototype:** not started. Candidate first wedge: consumer workout loop.
- **GTM / UX style guide:** not started.
