---
name: adam-michaelson-site
description: Loads the full operational history of Adam's personal website (adam-michaelson.com) from Notion before doing anything to it, and records what changed afterward. Use this skill whenever Adam mentions adam-michaelson.com, "my site", "my website", "my portfolio", the repo xeiviex/adam-michaelson-site, the Cloudflare Pages project adam-michaelson-site, the withered-flower-841b Worker, the clever/ prototype, or the site's DNS, deploys, hosting, or content — even in passing, even if he only asks a question, and even if he does not mention Notion or ask for context. The site has a history of confusing failures where the obvious diagnosis was wrong, so acting without reading the record first has already wasted real time.
---

# adam-michaelson.com — site operations

Adam's personal site has a documented operational history in Notion. That history exists because this site has repeatedly produced failures where the obvious diagnosis was wrong and confidently acting on it made things worse. The record is the accumulated correction to those mistakes, so reading it first is what makes you useful here rather than a source of new errors.

Two obligations, and they bracket everything else you do:

1. **Read the record before acting or answering.**
2. **Write to the record after anything changes.**

## Step 1 — Load the context

Read both of these before you form a diagnosis, propose a change, or answer a question about the site:

- **Hub page** (current architecture, hazards, operating rules):
  `https://app.notion.com/p/3c12856ef62e81cba18aeb7a3356be3d`
- **Change Log database** (every prior change, incident, and investigation):
  `https://app.notion.com/p/31669bb645364df1b8e8c6b6b0fc6529`
  Data source: `collection://13599d3c-a621-493c-8820-3f7fff22b59a`

Fetch the hub page in full. For the Change Log, read the most recent entries — and if the current topic resembles something in the log, open that entry and read it completely. A past entry describing the same symptom usually contains the answer, including which plausible-sounding theories were already tested and found false.

The hub page is the authority on current architecture. If what you observe contradicts it, do not silently assume the page is stale — say so explicitly, establish which is true, and then update the page as part of your work.

If the Notion connector is unavailable in the current surface, say that plainly and tell Adam you are working without the record. Do not reconstruct the history from memory or guesswork and present it as context — a confident wrong summary of the architecture is exactly the failure mode this skill exists to prevent.

## Step 2 — Do the work

Carry the record forward into how you diagnose:

- **Separate the layers before theorizing.** The site is DNS in front of Cloudflare Pages in front of a GitHub repo. Symptoms at one layer routinely get blamed on another. Checking `adam-michaelson-site.pages.dev` isolates content faults from DNS faults in a single step, and it costs nothing.
- **Green dashboard status is not proof.** A Pages custom domain has read "Active" while the DNS record behind it did not exist. Verify the underlying object, not the summary badge.
- **Two faults can hide behind one symptom.** A site that is down has been down for two independent reasons at once. Fixing the first and declaring victory means Adam finds the second one himself.
- **Distinguish verified from inferred, every time.** Sandboxed sessions frequently cannot reach the live site at all, in which case only Adam's browser can confirm anything. Say which of your claims are confirmed and which are inference; the log's value depends on that distinction holding.

When a diagnosis turns out to be wrong, correct it plainly and immediately rather than layering a new theory on top. A previous wrong premise here got committed into git history and had to be untangled later.

## Step 3 — Write the record

Add a Change Log entry after anything changes: a deploy, a DNS or Cloudflare setting, a content edit, a resolved incident, or an investigation that reached a conclusion — including one that concluded nothing. Create it as a page in the data source above.

Properties:

| Property | Value |
|---|---|
| `Entry` | Short specific title — the actual thing, not a category |
| `Date` | The date of the work |
| `Type` | Incident, Fix, Deploy, DNS, Content, Config, or Investigation |
| `Outcome` | Resolved, In progress, Abandoned, Unresolved, or Informational |
| `Surface` | Claude Code, Cowork, Chat, or Manual (Adam) |
| `Summary` | One plain sentence covering what changed and why |
| `Verified` | Checked **only** if the outcome was actually confirmed — not if it merely should work |

In the page body, cover what was wrong, what was changed, how it was verified (or why it could not be), and what remains unknown. Two things earn their space and are easy to leave out:

- **Approaches that failed, and why.** A theory that looked right and wasn't is worth as much to the next session as the fix, because it stops the same hour being spent twice.
- **What you did not determine.** Symptoms get fixed without the cause being found. Recording an unresolved cause as unresolved is what lets a recurrence be recognized as a recurrence.

Update the hub page too when the architecture itself changes — a new host, a changed DNS record, a new hazard learned. The Change Log is history; the hub page is the present state, and it is only useful while it is true.

Small, routine, verified changes deserve short entries — a couple of sentences is fine. Match the depth to what actually happened rather than padding every entry to look thorough.

## Scope

This skill covers how the site is built, deployed, and kept running. Adam's separate Notion pages — Executive Brand Platform, Career, Job Search — cover the site's role in his brand and job search. If he is discussing what the site should *say* or who it should reach, that is those pages' territory; if he is discussing whether it *works*, it is this one's. When a request spans both, load this record for anything touching deployment or infrastructure.
