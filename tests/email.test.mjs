import { test } from "node:test";
import assert from "node:assert/strict";
import { freshDb, seed, withFetch } from "./helpers.mjs";
import { ensureSchema } from "../functions/_lib/schema.js";
import { sendEmail, emailConfigured } from "../functions/_lib/email.js";
import { buildTranscriptEmail } from "../functions/_lib/transcripts.js";
import { emailSession, sweepIdleSessions, resetSweepThrottle } from "../functions/_lib/sweep.js";
import { onRequestPost as endChat } from "../functions/api/chat/end.js";
import { onRequest as cron } from "../functions/api/cron/sweep.js";

const ENV = { RESEND_API_KEY: "re_test", ADMIN_EMAIL: "adam@example.com", ADMIN_BASE_URL: "https://adam-michaelson.com" };
const S1 = "aaaa1111bbbb2222cccc";
const S2 = "bbbb2222cccc3333dddd";
const S3 = "cccc3333dddd4444eeee";
const ago = (min) => new Date(Date.now() - min * 60e3).toISOString();

function fakeResend({ fail = false } = {}) {
  const sent = [];
  const fetchImpl = async (url, init) => {
    assert.equal(String(url), "https://api.resend.com/emails");
    assert.equal(init.headers.Authorization, "Bearer re_test");
    sent.push(JSON.parse(init.body));
    return fail ? new Response("nope", { status: 500 }) : new Response("{}", { status: 200 });
  };
  return { sent, fetchImpl };
}

async function setup() {
  const { sqlite, db } = freshDb();
  resetSweepThrottle();
  await ensureSchema(db);
  sqlite.prepare("UPDATE chat_meta SET value = ? WHERE key = 'email_since'").run(ago(24 * 60)); // feature "went live" yesterday
  return { sqlite, db };
}

test("email is configured only with a key and a recipient; the default sender is Resend's test sender", async () => {
  assert.equal(emailConfigured({}), false);
  assert.equal(emailConfigured({ RESEND_API_KEY: "x" }), false);
  assert.equal(emailConfigured(ENV), true);
  assert.equal(emailConfigured({ RESEND_API_KEY: "x", EMAIL_TO: "a@b.c" }), true);
  const r = fakeResend();
  assert.equal((await sendEmail(ENV, { subject: "s", text: "t", html: "h" }, r.fetchImpl)).ok, true);
  assert.deepEqual(r.sent[0].to, ["adam@example.com"]);
  assert.match(r.sent[0].from, /onboarding@resend\.dev/);
  assert.equal((await sendEmail({ ...ENV, EMAIL_FROM: "Chat <chat@adam-michaelson.com>" }, { subject: "s", text: "t", html: "h" }, r.fetchImpl)).ok, true);
  assert.equal(r.sent[1].from, "Chat <chat@adam-michaelson.com>");
  assert.equal((await sendEmail(ENV, { subject: "s", text: "t", html: "h" }, fakeResend({ fail: true }).fetchImpl)).ok, false);
  assert.equal((await sendEmail({}, { subject: "s", text: "t", html: "h" })).ok, false);
});

test("transcript email: subject, admin link, roles, job link, and hostile text escaped in the HTML", () => {
  const session = { session_id: S1, user_id: "1.2.3.4", chat_type: "fit", mode: "human", created_at: "2026-10-10T16:00:00.000Z", last_activity_at: "2026-10-10T16:05:00.000Z" };
  const messages = [
    { role: "visitor", content: "<img src=x onerror=alert(1)> & more", created_at: "2026-10-10T16:00:00.000Z" },
    { role: "bot", content: "Hello", created_at: "2026-10-10T16:00:05.000Z" },
    { role: "adam", content: "Hi, it's me", created_at: "2026-10-10T16:04:00.000Z" },
  ];
  const e = buildTranscriptEmail({ env: ENV, session, messages, attachments: [{ url: "https://jobs.acme.com/1" }] });
  assert.match(e.subject, /^Chat transcript: "<img src=x/);
  assert.match(e.subject, /job-fit chat, 3 messages/);
  assert.match(e.text, /https:\/\/adam-michaelson\.com\/admin#aaaa1111bbbb2222cccc/);
  assert.match(e.text, /Visitor \(.*\):\n<img src=x onerror=alert\(1\)> & more/);
  assert.match(e.text, /You \(.*\):\nHi, it's me/);
  assert.match(e.text, /Job posting link read: https:\/\/jobs\.acme\.com\/1/);
  assert.doesNotMatch(e.html, /<img/);
  assert.match(e.html, /&lt;img src=x onerror=alert\(1\)&gt; &amp; more/);
  assert.match(e.html, /href="https:\/\/adam-michaelson\.com\/admin#aaaa1111bbbb2222cccc"/);
});

test("a session is emailed once per batch of messages, and again with the full transcript if the chat continues", async () => {
  const { sqlite, db } = await setup();
  const r = fakeResend();
  seed(sqlite, { id: S1, msgs: [["visitor", "hello there"], ["bot", "Hi!"]], at: ago(30) });
  assert.equal(await emailSession({ db, env: ENV, sessionId: S1 }, r.fetchImpl), "sent");
  assert.equal(await emailSession({ db, env: ENV, sessionId: S1 }, r.fetchImpl), "skipped"); // nothing new
  assert.equal(r.sent.length, 1);
  assert.match(r.sent[0].text, /hello there/);
  sqlite.prepare("INSERT INTO chat_messages (user_id, session_id, role, content, created_at) VALUES ('1.2.3.4', ?, 'visitor', 'one more thing', ?)").run(S1, new Date().toISOString());
  sqlite.prepare("UPDATE chat_sessions SET message_count = 3 WHERE session_id = ?").run(S1);
  assert.equal(await emailSession({ db, env: ENV, sessionId: S1 }, r.fetchImpl), "sent");
  assert.equal(r.sent.length, 2);
  assert.match(r.sent[1].text, /hello there[\s\S]*one more thing/);
});

test("no visitor message, unknown session, or no email config: nothing is sent", async () => {
  const { sqlite, db } = await setup();
  const r = fakeResend();
  seed(sqlite, { id: S1, msgs: [["bot", "greeting only"]], at: ago(30) });
  assert.equal(await emailSession({ db, env: ENV, sessionId: S1 }, r.fetchImpl), "skipped");
  assert.equal(await emailSession({ db, env: ENV, sessionId: "zzzz0000zzzz0000zzzz" }, r.fetchImpl), "skipped");
  seed(sqlite, { id: S2, msgs: [["visitor", "hi"]], at: ago(30) });
  assert.equal(await emailSession({ db, env: {}, sessionId: S2 }, r.fetchImpl), "skipped");
  assert.equal(r.sent.length, 0);
});

test("a failed send is retried by a later sweep, then given up on after five attempts, and the reason is kept", async () => {
  const { sqlite, db } = await setup();
  seed(sqlite, { id: S1, msgs: [["visitor", "hello"], ["bot", "hi"]], at: ago(30) });
  const bad = fakeResend({ fail: true });
  for (let i = 0; i < 7; i++) await emailSession({ db, env: ENV, sessionId: S1 }, bad.fetchImpl);
  assert.equal(bad.sent.length, 5);
  assert.match(sqlite.prepare("SELECT message FROM chat_errors ORDER BY id DESC").get().message, /transcript email: HTTP 500/);
  // a recovered provider does not resurrect an abandoned session; a different session still works
  const good = fakeResend();
  seed(sqlite, { id: S2, msgs: [["visitor", "hello"]], at: ago(30) });
  assert.equal(await emailSession({ db, env: ENV, sessionId: S2 }, good.fetchImpl), "sent");
});

test("sweep: only quiet chats, only chats active since the feature began, at most five at a time, throttled", async () => {
  const { sqlite, db } = await setup();
  const r = fakeResend();
  seed(sqlite, { id: S1, msgs: [["visitor", "quiet for 30 minutes"]], at: ago(30) });
  seed(sqlite, { id: S2, msgs: [["visitor", "still active"]], at: ago(2) });
  seed(sqlite, { id: S3, msgs: [["visitor", "from before the feature"]], at: ago(3 * 24 * 60) });
  const res = await sweepIdleSessions({ db, env: ENV }, r.fetchImpl);
  assert.deepEqual([res.checked, res.sent], [1, 1]);
  assert.match(r.sent[0].text, /quiet for 30 minutes/);
  assert.equal(r.sent.length, 1);
  assert.equal((await sweepIdleSessions({ db, env: ENV }, r.fetchImpl)).throttled, true);
  // the idle window is configurable
  const res2 = await sweepIdleSessions({ db, env: { ...ENV, EMAIL_IDLE_MINUTES: "1" }, force: true }, r.fetchImpl);
  assert.equal(res2.sent, 1);
  assert.match(r.sent[1].text, /still active/);
  // five at a time
  for (let i = 0; i < 7; i++) seed(sqlite, { id: `many${i}aaaaaaaaaaaaaaaa`, msgs: [["visitor", "m" + i]], at: ago(40) });
  assert.equal((await sweepIdleSessions({ db, env: ENV, force: true }, r.fetchImpl)).sent, 5);
});

test("the daily cap stops a flood of emails", async () => {
  const { sqlite, db } = await setup();
  const r = fakeResend();
  for (let i = 0; i < 4; i++) seed(sqlite, { id: `cap${i}aaaaaaaaaaaaaaaaa`, msgs: [["visitor", "x" + i]], at: ago(40) });
  const env = { ...ENV, EMAIL_DAILY_CAP: "2" };
  for (let i = 0; i < 4; i++) await emailSession({ db, env, sessionId: `cap${i}aaaaaaaaaaaaaaaaa` }, r.fetchImpl);
  assert.equal(r.sent.length, 2);
});

test("/api/chat/end emails right away when the visitor leaves; junk is ignored", async () => {
  const { sqlite, db } = await setup();
  const r = fakeResend();
  seed(sqlite, { id: S1, msgs: [["visitor", "just left"], ["bot", "Bye!"]], at: ago(1) });
  const post = (body) => endChat({ request: new Request("https://adam-michaelson.com/api/chat/end", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }), env: { ...ENV, SMS_OPTIN_DB: db } });
  await withFetch(async (url, init) => { if (String(url).startsWith("https://api.resend.com/")) { r.sent.push(JSON.parse(init.body)); return new Response("{}"); } }, async () => {
    assert.equal((await post({ sessionId: S1 })).status, 204);
    assert.equal(r.sent.length, 1);
    assert.match(r.sent[0].text, /just left/);
    assert.match(r.sent[0].text, /admin#aaaa1111bbbb2222cccc/);
    await post({ sessionId: S1 });
    await post("not json");
    await post({ sessionId: "short" });
    assert.equal(r.sent.length, 1);
  });
});

test("/api/cron/sweep needs the secret", async () => {
  const { sqlite, db } = await setup();
  seed(sqlite, { id: S1, msgs: [["visitor", "hi"]], at: ago(40) });
  const call = (headers, env) => cron({ request: new Request("https://adam-michaelson.com/api/cron/sweep", { headers }), env: { ...ENV, SMS_OPTIN_DB: db, ...env } });
  const sent = [];
  await withFetch(async (url, init) => { if (String(url).startsWith("https://api.resend.com/")) { sent.push(1); return new Response("{}"); } }, async () => {
    assert.equal((await call({}, { CRON_SECRET: "s3cret" })).status, 404);
    assert.equal((await call({ "X-Cron-Secret": "wrong" }, { CRON_SECRET: "s3cret" })).status, 404);
    assert.equal((await call({ "X-Cron-Secret": "s3cret" }, {})).status, 404); // no secret configured: closed
    assert.equal(sent.length, 0);
    const ok = await call({ "X-Cron-Secret": "s3cret" }, { CRON_SECRET: "s3cret" });
    assert.equal(ok.status, 200);
    assert.deepEqual(await ok.json(), { checked: 1, sent: 1 });
  });
});

/* ---------------- Gmail provider ---------------- */
import { buildMime, emailProvider, resetEmailTokenCache } from "../functions/_lib/email.js";

const GENV = { GOOGLE_CLIENT_ID: "cid", GOOGLE_CLIENT_SECRET: "csec", GOOGLE_REFRESH_TOKEN: "rtok", EMAIL_TO: "adam+chats@example.com" };

function fakeGoogle({ tokenFail, sendStatus = 200 } = {}) {
  const calls = { token: 0, sent: [] };
  const fetchImpl = async (url, init) => {
    const u = String(url);
    if (u === "https://oauth2.googleapis.com/token") {
      calls.token++;
      const form = new URLSearchParams(init.body);
      assert.equal(form.get("grant_type"), "refresh_token");
      assert.equal(form.get("refresh_token"), "rtok");
      return tokenFail ? new Response(JSON.stringify({ error: tokenFail }), { status: 400 }) : new Response(JSON.stringify({ access_token: "at-" + calls.token, expires_in: 3600 }));
    }
    if (u === "https://gmail.googleapis.com/gmail/v1/users/me/messages/send") {
      assert.match(init.headers.Authorization, /^Bearer at-/);
      calls.sent.push(JSON.parse(init.body).raw);
      return sendStatus === 200 ? new Response("{}") : new Response("denied", { status: sendStatus });
    }
    throw new Error("unexpected " + u);
  };
  return { calls, fetchImpl };
}

const decodeRaw = (raw) => Buffer.from(raw, "base64url").toString("utf8");
const bodyPart = (mime, type) => {
  const m = new RegExp(`Content-Type: ${type}; charset=UTF-8\\r\\nContent-Transfer-Encoding: base64\\r\\n\\r\\n([\\s\\S]*?)\\r\\n--`).exec(mime);
  return Buffer.from(m[1].replace(/\r\n/g, ""), "base64").toString("utf8");
};

test("provider choice: Gmail when its credentials exist, Resend otherwise, or forced by EMAIL_PROVIDER", () => {
  assert.equal(emailProvider({}), null);
  assert.equal(emailProvider({ RESEND_API_KEY: "x" }), "resend");
  assert.equal(emailProvider(GENV), "gmail");
  assert.equal(emailProvider({ ...GENV, RESEND_API_KEY: "x" }), "gmail");
  assert.equal(emailProvider({ ...GENV, RESEND_API_KEY: "x", EMAIL_PROVIDER: "resend" }), "resend");
  assert.equal(emailProvider({ GOOGLE_CLIENT_ID: "a", GOOGLE_CLIENT_SECRET: "b" }), null); // missing refresh token
  assert.equal(emailConfigured({ ...GENV, EMAIL_TO: "" }), false); // no recipient
  assert.equal(emailConfigured(GENV), true);
});

test("buildMime: valid multipart, UTF-8, long bodies, and no header injection from the subject", () => {
  const evil = "Hello\r\nBcc: attacker@evil.example\r\nX-Injected: 1 — café 😀";
  const long = "line of text ".repeat(20000);
  const mime = buildMime({ from: "Chat <me@example.com>", to: "adam@example.com", subject: evil, text: long + " café", html: "<p>é</p>" });
  const headers = mime.split("\r\n\r\n")[0];
  assert.doesNotMatch(headers, /^Bcc:/m);
  assert.doesNotMatch(headers, /^X-Injected:/m);
  assert.match(headers, /^From: Chat <me@example\.com>$/m);
  assert.match(headers, /^To: adam@example\.com$/m);
  const subj = /Subject: =\?UTF-8\?B\?([^?]+)\?=/.exec(headers)[1];
  assert.equal(Buffer.from(subj, "base64").toString("utf8"), "Hello Bcc: attacker@evil.example X-Injected: 1 — café 😀");
  assert.equal(bodyPart(mime, "text/plain"), long + " café");
  assert.equal(bodyPart(mime, "text/html"), "<p>é</p>");
  assert.ok(!buildMime({ to: "a@b.c", subject: "s", text: "t", html: "h" }).includes("From:"));
});

test("Gmail send: refreshes the access token once, reuses it, and sends a valid raw message to the alias", async () => {
  resetEmailTokenCache();
  const g = fakeGoogle();
  const msg = { subject: "Chat transcript", text: "hello é", html: "<p>hello</p>" };
  assert.deepEqual(await sendEmail(GENV, msg, g.fetchImpl), { ok: true });
  assert.deepEqual(await sendEmail(GENV, msg, g.fetchImpl), { ok: true });
  assert.equal(g.calls.token, 1);
  assert.equal(g.calls.sent.length, 2);
  const mime = decodeRaw(g.calls.sent[0]);
  assert.match(mime, /^To: adam\+chats@example\.com\r\n/m);
  assert.equal(bodyPart(mime, "text/plain"), "hello é");
});

test("Gmail failures are reported with a clear reason and never throw", async () => {
  resetEmailTokenCache();
  const revoked = await sendEmail(GENV, { subject: "s", text: "t", html: "h" }, fakeGoogle({ tokenFail: "invalid_grant" }).fetchImpl);
  assert.equal(revoked.ok, false);
  assert.match(revoked.error, /refresh token was rejected/);
  resetEmailTokenCache();
  const denied = await sendEmail(GENV, { subject: "s", text: "t", html: "h" }, fakeGoogle({ sendStatus: 403 }).fetchImpl);
  assert.equal(denied.ok, false);
  assert.match(denied.error, /Gmail HTTP 403/);
});

test("transcripts go out through Gmail end to end", async () => {
  resetEmailTokenCache();
  const { sqlite, db } = await setup();
  const g = fakeGoogle();
  seed(sqlite, { id: S1, msgs: [["visitor", "hello via gmail"], ["bot", "Hi!"]], at: ago(30) });
  assert.equal(await emailSession({ db, env: GENV, sessionId: S1 }, g.fetchImpl), "sent");
  const mime = decodeRaw(g.calls.sent[0]);
  assert.match(bodyPart(mime, "text/plain"), /hello via gmail/);
  assert.match(bodyPart(mime, "text/html"), /admin#aaaa1111bbbb2222cccc/);
});
