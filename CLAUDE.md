# Repository guide

This repo contains two things:
1. **Adam Michaelson's personal site** — `index.html`, `styles.css`, `hero-bw.jpg`, and prototype flows under `clever/`.
2. **Project Atlas** — a product workspace under `atlas/`. This is the active, ongoing project.

---

## Project Atlas — read this before working on Atlas

Atlas is a multi-thread project: different conversations (threads) focus on different topics
(food data, exercise data, data model, GTM, use cases, prototype, UX, etc.). Separate threads
do **not** share live conversation memory. The **`atlas/` docs are the shared memory** — the only
way one thread's work reaches another.

**At the start of an Atlas thread:**
- Read `atlas/README.md` (project home + index), `atlas/vision.md`, and `atlas/working-agreement.md`.
- Read the specific topic doc(s) relevant to this thread before doing work.

**Before ending an Atlas thread:**
- Write conclusions/decisions back into the relevant topic doc.
- Add any real decision (with the reasoning) to `atlas/decisions-log.md`.
- Commit. Nothing is "remembered" unless it's written to a file and committed.

## The working agreement (summary — full version in `atlas/working-agreement.md`)

- **Adam drives.** He owns the vision and the drafts. Claude reacts, critiques, questions, refines.
- **Do not rewrite or draft** Adam's content unless he explicitly says "draft this," "rewrite this,"
  or "take a pass." Preserve his exact wording; his documents are the source of truth.
- **Assume Adam is right until proven otherwise.** Understand his reasoning first; only then, if
  there's a real flaw, say so directly. Do not normalize his ideas to industry defaults — he is the
  framework author.
- Act as an experienced peer learning Adam's methodology. Offer alternatives clearly labeled as
  additions, not replacements.
