/**
 * Tables and indexes for the admin console, alerts and search. Created on first use
 * (idempotent), so no manual migration is needed. The same statements are documented in schema-chat.sql.
 */
const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS chat_alerts (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     created_at TEXT NOT NULL,
     session_id TEXT NOT NULL,
     kind TEXT NOT NULL,
     provider_msg_id TEXT
   )`,
  `CREATE INDEX IF NOT EXISTS idx_chat_alerts_session ON chat_alerts (session_id, kind)`,
  `CREATE INDEX IF NOT EXISTS idx_chat_alerts_msg ON chat_alerts (provider_msg_id)`,
  `CREATE TABLE IF NOT EXISTS chat_meta (key TEXT PRIMARY KEY, value TEXT)`,
  `CREATE TABLE IF NOT EXISTS chat_emails (
     session_id TEXT PRIMARY KEY,
     emailed_count INTEGER NOT NULL DEFAULT 0,
     attempts INTEGER NOT NULL DEFAULT 0,
     sent_at TEXT
   )`,
  `CREATE VIRTUAL TABLE IF NOT EXISTS chat_messages_fts USING fts5(content, content='chat_messages', content_rowid='id')`,
  `CREATE TRIGGER IF NOT EXISTS chat_messages_ai AFTER INSERT ON chat_messages BEGIN
     INSERT INTO chat_messages_fts(rowid, content) VALUES (new.id, new.content);
   END`,
  `CREATE TRIGGER IF NOT EXISTS chat_messages_ad AFTER DELETE ON chat_messages BEGIN
     INSERT INTO chat_messages_fts(chat_messages_fts, rowid, content) VALUES ('delete', old.id, old.content);
   END`,
];

let ready = false;

export async function ensureSchema(db) {
  if (ready) return;
  for (const sql of STATEMENTS) await db.prepare(sql).run();
  // Transcript emails only cover chats that were active after this moment, so old conversations are never mass-mailed.
  await db.prepare("INSERT OR IGNORE INTO chat_meta (key, value) VALUES ('email_since', ?1)").bind(new Date().toISOString()).run();
  // Index everything that was logged before the search index existed.
  const built = await db.prepare("SELECT value FROM chat_meta WHERE key = 'fts_built'").first();
  if (!built) {
    await db.prepare("INSERT INTO chat_messages_fts(chat_messages_fts) VALUES ('rebuild')").run();
    await db.prepare("INSERT OR REPLACE INTO chat_meta (key, value) VALUES ('fts_built', '1')").run();
  }
  ready = true;
}

/** Test helper: forget that the schema was ensured (each test uses a fresh database). */
export function resetSchemaCache() { ready = false; }
