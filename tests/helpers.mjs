import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { resetSchemaCache } from "../functions/_lib/schema.js";
import { resetKeyCache } from "../functions/_lib/adminauth.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** In-memory SQLite shaped like the D1 binding. */
export function d1(sqlite) {
  const mk = (sql, args = []) => ({
    bind: (...a) => mk(sql, a),
    first: async () => sqlite.prepare(sql).get(...args) ?? null,
    all: async () => ({ results: sqlite.prepare(sql).all(...args) }),
    run: async () => { const r = sqlite.prepare(sql).run(...args); return { meta: { last_row_id: Number(r.lastInsertRowid), changes: Number(r.changes) } }; },
    _run: () => { const r = sqlite.prepare(sql).run(...args); return { meta: { last_row_id: Number(r.lastInsertRowid) } }; },
  });
  return { prepare: (sql) => mk(sql), batch: async (stmts) => stmts.map((s) => s._run()) };
}

export function freshDb() {
  resetSchemaCache();
  resetKeyCache();
  const sqlite = new DatabaseSync(":memory:");
  // Only the base chat tables: the admin tables are created on first use, exactly as in production.
  sqlite.exec(readFileSync(join(root, "schema-chat.sql"), "utf8").split("-- Admin console")[0]);
  return { sqlite, db: d1(sqlite) };
}

export function seed(sqlite, { id, ip = "1.2.3.4", type = "intro", mode = "bot", msgs = [], at = new Date().toISOString() }) {
  sqlite.prepare("INSERT INTO chat_sessions (session_id, user_id, chat_type, mode, created_at, last_activity_at, message_count) VALUES (?,?,?,?,?,?,?)").run(id, ip, type, mode, at, at, msgs.length);
  for (const [role, content] of msgs) sqlite.prepare("INSERT INTO chat_messages (user_id, session_id, role, content, created_at) VALUES (?,?,?,?,?)").run(ip, id, role, content, at);
}

/** Replace globalThis.fetch for the duration of fn; handler(url, init) returns a Response or undefined to pass through. */
export async function withFetch(handler, fn) {
  const real = globalThis.fetch;
  globalThis.fetch = async (url, init) => (await handler(String(url), init)) ?? real(url, init);
  try { return await fn(); } finally { globalThis.fetch = real; }
}

const b64 = (b) => Buffer.from(b).toString("base64url");

/** An Access-style RS256 key pair, JWKS document and token signer. */
export async function accessKeys(team = "team.cloudflareaccess.com", aud = "aud-123", email = "adam@example.com") {
  const kp = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
  const jwk = { ...(await crypto.subtle.exportKey("jwk", kp.publicKey)), kid: "k1", alg: "RS256", use: "sig" };
  async function sign(over = {}, key = kp.privateKey) {
    const header = b64(JSON.stringify({ alg: "RS256", kid: "k1", typ: "JWT" }));
    const payload = b64(JSON.stringify({ iss: `https://${team}`, aud: [aud], email, exp: Math.floor(Date.now() / 1000) + 600, ...over }));
    const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(header + "." + payload));
    return `${header}.${payload}.${b64(new Uint8Array(sig))}`;
  }
  const env = { CF_ACCESS_TEAM_DOMAIN: team, CF_ACCESS_AUD: aud, ADMIN_EMAIL: email };
  const jwksHandler = (url) => (url === `https://${team}/cdn-cgi/access/certs` ? new Response(JSON.stringify({ keys: [jwk] })) : undefined);
  const other = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign"]);
  return { env, sign, jwksHandler, otherPrivate: other.privateKey };
}
