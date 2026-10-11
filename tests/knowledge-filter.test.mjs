import { test } from "node:test";
import assert from "node:assert/strict";
import { filterPage, assertNoLeak, markdownToBlocks } from "../scripts/lib/knowledge-filter.mjs";

const run = (md) => filterPage("Page", markdownToBlocks(md));

test("only [PUBLIC] sections are emitted, tags stripped, preamble dropped", () => {
  const r = run("Legend paragraph about [PUBLIC] and [PRIVATE] tags.\n## Open \\[PUBLIC\\]\nopen text\n## Secret \\[PRIVATE\\]\nsecret text\n## Untagged\nuntagged text\n");
  assert.match(r.markdown, /open text/);
  assert.doesNotMatch(r.markdown, /secret text|untagged text|Legend|PUBLIC|PRIVATE/);
});

test("untagged sub-headings inherit from nearest tagged parent", () => {
  const r = run("## A [PUBLIC]\n### sub a\npublic child\n## B [PRIVATE]\n### sub b\nprivate child\n## C [PUBLIC]\n### D [PRIVATE]\nhidden\n### E\nalso public\n");
  assert.match(r.markdown, /public child/);
  assert.match(r.markdown, /also public/);
  assert.doesNotMatch(r.markdown, /private child|hidden/);
});

test("both tags on one heading fails closed", () => {
  const r = run("## X [PUBLIC] [PRIVATE]\nnope\n## Y [PUBLIC]\nyes\n");
  assert.doesNotMatch(r.markdown, /nope/);
});

test("new sections are handled without code changes; zero public sections is detectable", () => {
  assert.equal(run("## New thing [PUBLIC]\nx\n## Another [PUBLIC]\ny\n").publicSections, 2);
  assert.equal(run("intro\n## A\nx\n## B [PRIVATE]\ny\n").publicSections, 0);
});

test("leak check: private id, private tag, dropped text and canaries all fail the build", () => {
  const ok = "# P\n\n## Fine\nhello\n";
  assertNoLeak(ok, { privateIds: ["3f52856e-f62e-812e-848d-ea3a12ed1688"] });
  assert.throws(() => assertNoLeak(ok + "3f52856ef62e812e848dea3a12ed1688", { privateIds: ["3f52856e-f62e-812e-848d-ea3a12ed1688"] }), /private page id/);
  assert.throws(() => assertNoLeak(ok + "\\[PRIVATE\\]"), /PRIVATE/);
  assert.throws(() => assertNoLeak(ok + "NOT FOR PUBLIC CHAT"), /PUBLIC CHAT/);
  const secret = "this is a long private sentence that must never reach the output file";
  assert.throws(() => assertNoLeak(ok + secret, { dropped: [secret] }), /non-public text/);
  assert.throws(() => assertNoLeak(ok + "Canary Phrase Here", { canaries: ["canary phrase here"] }), /canary/);
});
