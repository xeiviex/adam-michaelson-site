import { test } from "node:test";
import assert from "node:assert/strict";
import { greenhouseTarget, looksLikeUrl, validateUrl, htmlToText, extractJobPosting, fetchPosting, PostingError } from "../functions/_lib/jobfetch.js";

test("looksLikeUrl only accepts a lone link", () => {
  assert.ok(looksLikeUrl("https://boards.greenhouse.io/acme/jobs/1"));
  assert.ok(looksLikeUrl("jobs.lever.co/acme/123"));
  assert.ok(!looksLikeUrl("Senior PM at acme.com, lead the team"));
  assert.ok(!looksLikeUrl("hello"));
  assert.ok(!looksLikeUrl("https://a.com/x " + "y".repeat(10)));
});

test("validateUrl blocks unsafe targets", () => {
  for (const bad of ["http://acme.com/x", "https://user:pw@acme.com/x", "https://acme.com:8443/x", "https://127.0.0.1/x", "https://192.168.1.1/x", "https://localhost/x", "https://db.internal/x", "https://metadata.local/x", "https://[::1]/x", "https://xn--e1afmkfd.com/x", "https://acme.com/file.zip", "https://acme.com/job.pdf", "ftp://acme.com/x"]) {
    assert.throws(() => validateUrl(bad), PostingError, bad);
  }
  assert.equal(validateUrl("acme.com/jobs/1").hostname, "acme.com");
});

test("htmlToText strips scripts, styles and tags and decodes entities", () => {
  const t = htmlToText("<head><title>x</title></head><style>a{}</style><script>evil()</script><h1>Title</h1><p>Fish &amp; chips&nbsp;now</p><ul><li>One</li><li>Two</li></ul>");
  assert.match(t, /Title/); assert.match(t, /Fish & chips now/); assert.match(t, /- One/);
  assert.doesNotMatch(t, /evil|a\{\}|<|title>x/);
});

test("extractJobPosting reads JobPosting JSON-LD (also inside @graph)", () => {
  const html = `<script type="application/ld+json">${JSON.stringify({ "@graph": [{ "@type": "Organization" }, { "@type": "JobPosting", title: "Head of Product", description: "&lt;p&gt;Build things&lt;/p&gt;", jobLocation: { address: { addressLocality: "Lehi", addressRegion: "UT" } } }] })}</script>`;
  const t = extractJobPosting(html);
  assert.match(t, /Title: Head of Product/); assert.match(t, /Location: Lehi, UT/); assert.match(t, /Build things/);
  assert.equal(extractJobPosting("<p>nothing</p>"), null);
});

const html = (body) => new Response(body, { status: 200, headers: { "content-type": "text/html" } });

test("fetchPosting: plain page, redirect re-validation, and failures", async () => {
  const long = "<p>" + "We need a product leader who owns strategy. ".repeat(20) + "</p>";
  const ok = await fetchPosting("https://acme.com/job", { fetchImpl: async () => html(long) });
  assert.ok(ok.text.length > 300);
  // redirect to a private address is refused
  const redirect = async (url) => url.includes("acme.com") ? new Response(null, { status: 302, headers: { location: "https://127.0.0.1/secret" } }) : html(long);
  await assert.rejects(fetchPosting("https://acme.com/job", { fetchImpl: redirect }), PostingError);
  // a redirect to another public page is followed
  const hop = async (url) => url.includes("acme.com") ? new Response(null, { status: 301, headers: { location: "https://careers.acme.org/j" } }) : html(long);
  assert.equal((await fetchPosting("https://acme.com/job", { fetchImpl: hop })).url, "https://careers.acme.org/j");
  // blocked, empty, wrong type, network error
  await assert.rejects(fetchPosting("https://acme.com/job", { fetchImpl: async () => new Response("no", { status: 403 }) }), /paste the text/);
  await assert.rejects(fetchPosting("https://acme.com/job", { fetchImpl: async () => html("<p>Sign in</p>") }), /paste the text/);
  await assert.rejects(fetchPosting("https://acme.com/job", { fetchImpl: async () => new Response("{}", { headers: { "content-type": "application/json" } }) }), /web page/);
  await assert.rejects(fetchPosting("https://acme.com/job", { fetchImpl: async () => { throw new Error("boom"); } }), /paste the text/);
});

test("fetchPosting caps the amount of text", async () => {
  const big = "<p>" + "word ".repeat(10000) + "</p>";
  const r = await fetchPosting("https://acme.com/job", { fetchImpl: async () => html(big), maxChars: 5000 });
  assert.equal(r.text.length, 5000);
});

test("greenhouseTarget finds board and job id from the common link shapes", () => {
  const T = (u) => greenhouseTarget(new URL(u));
  assert.deepEqual(T("https://job-boards.greenhouse.io/bamboohr/jobs/6186937004"), { boards: ["bamboohr"], id: "6186937004" });
  assert.deepEqual(T("https://boards.greenhouse.io/embed/job_app?for=acme&token=12345678"), { boards: ["acme"], id: "12345678" });
  assert.deepEqual(T("https://www.bamboohr.com/careers/application?gh_jid=6186937004"), { boards: ["bamboohr"], id: "6186937004" });
  assert.equal(T("https://acme.com/careers"), null);
  assert.equal(T("https://acme.com/careers?gh_jid=abc"), null);
});

test("fetchPosting uses the Greenhouse API for embedded links and falls back to the page", async () => {
  const content = "&lt;p&gt;" + "Lead the product organization and own strategy. ".repeat(12) + "&lt;/p&gt;&lt;ul&gt;&lt;li&gt;Ten years leading PMs&lt;/li&gt;&lt;/ul&gt;";
  const calls = [];
  const gh = async (url) => {
    calls.push(url);
    if (url === "https://boards-api.greenhouse.io/v1/boards/acme/jobs/12345678")
      return new Response(JSON.stringify({ title: "VP Product", location: { name: "Remote" }, content }), { status: 200, headers: { "content-type": "application/json" } });
    return new Response("<p>Sign in</p>", { status: 200, headers: { "content-type": "text/html" } });
  };
  const r = await fetchPosting("https://www.acme.com/careers/application?gh_jid=12345678", { fetchImpl: gh });
  assert.match(r.text, /Title: VP Product/); assert.match(r.text, /Location: Remote/); assert.match(r.text, /- Ten years leading PMs/);
  assert.doesNotMatch(r.text, /&lt;|<p>/);
  // unknown job id: the API 404s, the page has nothing, so the visitor is asked to paste
  await assert.rejects(fetchPosting("https://www.acme.com/careers/application?gh_jid=99999999", { fetchImpl: gh }), /paste the text/);
});
