import { test } from "node:test";
import assert from "node:assert/strict";
import { freshDb, seed, withFetch, accessKeys } from "./helpers.mjs";
import { verifyAccess } from "../functions/_lib/adminauth.js";
import { ftsQuery } from "../functions/_lib/search.js";
import { onRequest as adminApi } from "../functions/api/admin/[[route]].js";
import { onRequestGet as adminPage } from "../functions/admin/index.js";
import { onRequestGet as poll } from "../functions/api/chat/poll.js";

const S1 = "aaaa1111bbbb2222cccc";
const S2 = "dddd3333eeee4444ffff";

const req = (path, { method = "GET", token, body, headers = {} } = {}) =>
  new Request("https://adam-michaelson.com" + path, {
    method,
    headers: { ...(token ? { "Cf-Access-Jwt-Assertion": token } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });

const api = (route, request, env) => adminApi({ request, env, params: { route: route.split("/") } });

test("verifyAccess accepts only a valid token for the admin", async () => {
  const k = await accessKeys();
  await withFetch(k.jwksHandler, async () => {
    assert.ok(await verifyAccess(req("/admin", { token: await k.sign() }), k.env));
    assert.equal(await verifyAccess(req("/admin"), k.env), null); // no token
    assert.equal(await verifyAccess(req("/admin", { token: await k.sign({ aud: ["other"] }) }), k.env), null);
    assert.equal(await verifyAccess(req("/admin", { token: await k.sign({ email: "eve@example.com" }) }), k.env), null);
    assert.equal(await verifyAccess(req("/admin", { token: await k.sign({ exp: Math.floor(Date.now() / 1000) - 5 }) }), k.env), null);
    assert.equal(await verifyAccess(req("/admin", { token: await k.sign({ iss: "https://evil.example" }) }), k.env), null);
    assert.equal(await verifyAccess(req("/admin", { token: await k.sign({}, k.otherPrivate) }), k.env), null); // wrong signing key
    assert.equal(await verifyAccess(req("/admin", { token: "a.b.c" }), k.env), null);
    // not configured: nobody gets in, even with a good token
    assert.equal(await verifyAccess(req("/admin", { token: await k.sign() }), {}), null);
    assert.equal(await verifyAccess(req("/admin", { token: await k.sign() }), { ...k.env, ADMIN_EMAIL: "" }), null);
  });
});

test("ftsQuery makes any input safe", () => {
  assert.equal(ftsQuery("Lendio under"), '"lendio" "under"*');
  assert.equal(ftsQuery('a" OR b:* NEAR('), '"a" "or" "b" "near"*');
  assert.equal(ftsQuery("   "), null);
});

test("admin page and API answer 404 to anyone without Access, and to a valid token when not configured", async () => {
  const { db } = freshDb();
  const k = await accessKeys();
  await withFetch(k.jwksHandler, async () => {
    const env = { ...k.env, SMS_OPTIN_DB: db };
    assert.equal((await adminPage({ request: req("/admin"), env })).status, 404);
    assert.equal((await api("conversations", req("/api/admin/conversations"), env)).status, 404);
    assert.equal((await api("reply", req("/api/admin/reply", { method: "POST", body: {}, headers: { "X-Admin": "1" } }), env)).status, 404);
    assert.equal((await adminPage({ request: req("/admin", { token: await k.sign() }), env: { SMS_OPTIN_DB: db } })).status, 404);
    const ok = await adminPage({ request: req("/admin", { token: await k.sign() }), env });
    assert.equal(ok.status, 200);
    assert.match(ok.headers.get("X-Robots-Tag"), /noindex/);
    assert.match(ok.headers.get("Content-Security-Policy"), /script-src 'nonce-/);
    assert.match(await ok.text(), /noindex/);
  });
});

test("list, search, filters and transcript", async () => {
  const { sqlite, db } = freshDb();
  const k = await accessKeys();
  // messages that exist before the search index does must still be found
  seed(sqlite, { id: S1, ip: "9.9.9.1", msgs: [["visitor", "Tell me about Lendio underwriting"], ["bot", "Happy to."]], at: "2026-10-01T10:00:00.000Z" });
  seed(sqlite, { id: S2, ip: "9.9.9.2", type: "fit", msgs: [["visitor", "VP Product role, rock climbing gym"]], at: "2026-10-05T10:00:00.000Z" });
  await withFetch(k.jwksHandler, async () => {
    const env = { ...k.env, SMS_OPTIN_DB: db };
    const t = await k.sign();
    const get = async (q) => (await (await api("conversations", req("/api/admin/conversations" + q, { token: t }), env)).json()).conversations;
    let all = await get("");
    assert.deepEqual(all.map((c) => c.session_id), [S2, S1]); // most recent first
    assert.equal(all[1].preview, "Tell me about Lendio underwriting");
    assert.equal(all[0].chat_type, "fit");
    const found = await get("?q=lend");
    assert.deepEqual(found.map((c) => c.session_id), [S1]);
    assert.match(found[0].snippet, /\u0001Lendio\u0002/);
    assert.deepEqual((await get("?q=%22%20climb*%20%28")).map((c) => c.session_id), [S2]);
    assert.deepEqual((await get("?type=fit")).map((c) => c.session_id), [S2]);
    assert.deepEqual((await get("?from=2026-10-03")).map((c) => c.session_id), [S2]);
    assert.deepEqual((await get("?to=2026-10-02")).map((c) => c.session_id), [S1]);
    assert.deepEqual(await get("?mode=human"), []);

    const conv = await (await api("conversation", req(`/api/admin/conversation?id=${S1}`, { token: t }), env)).json();
    assert.deepEqual(conv.messages.map((m) => m.role), ["visitor", "bot"]);
    const next = await (await api("conversation", req(`/api/admin/conversation?id=${S1}&after=${conv.messages[0].id}`, { token: t }), env)).json();
    assert.equal(next.messages.length, 1);
    assert.equal((await api("conversation", req("/api/admin/conversation?id=nope", { token: t }), env)).status, 404);

    // new messages are indexed as they arrive (the trigger exists now)
    sqlite.prepare("INSERT INTO chat_messages (user_id, session_id, role, content, created_at) VALUES ('x', ?, 'visitor', 'zebra crossing question', ?)").run(S1, new Date().toISOString());
    assert.deepEqual((await get("?q=zebra")).map((c) => c.session_id), [S1]);
  });
});

test("takeover: reply puts the session in human mode, the visitor can poll it, hand-back returns it to the bot", async () => {
  const { sqlite, db } = freshDb();
  const k = await accessKeys();
  seed(sqlite, { id: S1, msgs: [["visitor", "hello"], ["bot", "Hi!"]] });
  await withFetch(k.jwksHandler, async () => {
    const env = { ...k.env, SMS_OPTIN_DB: db };
    const t = await k.sign();
    const post = (route, body, extra = {}) => api(route, req("/api/admin/" + route, { method: "POST", token: t, body, headers: { "X-Admin": "1", ...extra } }), env);
    assert.equal((await post("reply", { sessionId: S1, text: "hi, it's Adam" }, { "X-Admin": "0" })).status, 403);
    assert.equal((await post("reply", { sessionId: S1, text: "hi, it's Adam" }, { Origin: "https://evil.example" })).status, 403);
    assert.equal((await post("reply", { sessionId: S1, text: "   " })).status, 400);
    assert.equal((await post("reply", { sessionId: S1, text: "hi, it's Adam" })).status, 200);
    assert.equal(sqlite.prepare("SELECT mode FROM chat_sessions WHERE session_id=?").get(S1).mode, "human");
    assert.equal(sqlite.prepare("SELECT role, content FROM chat_messages WHERE session_id=? ORDER BY id DESC").get(S1).role, "adam");

    const polled = await (await poll({ request: new Request(`https://adam-michaelson.com/api/chat/poll?sessionId=${S1}&after=0`), env })).json();
    assert.equal(polled.mode, "human");
    assert.deepEqual(polled.messages.map((m) => m.content), ["hi, it's Adam"]);
    const again = await (await poll({ request: new Request(`https://adam-michaelson.com/api/chat/poll?sessionId=${S1}&after=${polled.messages[0].id}`), env })).json();
    assert.deepEqual(again.messages, []);
    assert.equal((await poll({ request: new Request("https://adam-michaelson.com/api/chat/poll?sessionId=short"), env })).status, 400);

    assert.equal((await post("mode", { sessionId: S1, mode: "bot" })).status, 200);
    assert.equal((await (await poll({ request: new Request(`https://adam-michaelson.com/api/chat/poll?sessionId=${S1}`), env })).json()).mode, "bot");
  });
});

test("purge deletes old conversations only, and the search index follows", async () => {
  const { sqlite, db } = freshDb();
  const k = await accessKeys();
  seed(sqlite, { id: S1, msgs: [["visitor", "ancient history"]], at: "2020-01-01T00:00:00.000Z" });
  seed(sqlite, { id: S2, msgs: [["visitor", "fresh conversation"]] });
  await withFetch(k.jwksHandler, async () => {
    const env = { ...k.env, SMS_OPTIN_DB: db };
    const t = await k.sign();
    const r = await (await api("purge", req("/api/admin/purge", { method: "POST", token: t, body: { days: 365 }, headers: { "X-Admin": "1" } }), env)).json();
    assert.equal(r.deletedConversations, 1);
    const left = (await (await api("conversations", req("/api/admin/conversations", { token: t }), env)).json()).conversations;
    assert.deepEqual(left.map((c) => c.session_id), [S2]);
    assert.deepEqual((await (await api("conversations", req("/api/admin/conversations?q=ancient", { token: t }), env)).json()).conversations, []);
  });
});
