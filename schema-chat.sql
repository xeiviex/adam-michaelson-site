-- Chat module: conversation log.
-- Same D1 database as the SMS consent ledger (binding SMS_OPTIN_DB).
-- Apply once:  wrangler d1 execute sms-optin --remote --file=schema-chat.sql
--
-- user_id is the visitor's IP address (CF-Connecting-IP). It is personal data under
-- some laws (GDPR/CCPA); the chat widget shows a recording notice, and a retention
-- purge job is planned for the admin pass.

CREATE TABLE IF NOT EXISTS chat_sessions (
  session_id       TEXT PRIMARY KEY,
  user_id          TEXT NOT NULL,                       -- IP address
  chat_type        TEXT NOT NULL CHECK (chat_type IN ('intro','fit')),
  mode             TEXT NOT NULL DEFAULT 'bot' CHECK (mode IN ('bot','human')),
  created_at       TEXT NOT NULL,                       -- ISO 8601 UTC
  last_activity_at TEXT NOT NULL,
  message_count    INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_activity ON chat_sessions (last_activity_at DESC);

CREATE TABLE IF NOT EXISTS chat_messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT NOT NULL,                            -- IP address
  session_id  TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('visitor','bot','adam')),
  content     TEXT NOT NULL,
  created_at  TEXT NOT NULL                             -- ISO 8601 UTC
);
CREATE INDEX IF NOT EXISTS idx_chat_msg_session ON chat_messages (session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_msg_user_time ON chat_messages (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_msg_time ON chat_messages (created_at);

-- Upstream failures (model errors, refusals) for debugging. No visitor text, no secrets.
CREATE TABLE IF NOT EXISTS chat_errors (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at  TEXT NOT NULL,
  session_id  TEXT,
  status      INTEGER,
  message     TEXT
);

-- Job posting text fetched from a link the visitor shared in the fit chat.
CREATE TABLE IF NOT EXISTS chat_attachments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id  TEXT NOT NULL,
  message_id  INTEGER NOT NULL,
  url         TEXT NOT NULL,
  content     TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  source_url  TEXT                                      -- the link as the visitor gave it, tracking params removed; used as a one-week cache key
);
-- Existing databases created before source_url was added: ALTER TABLE chat_attachments ADD COLUMN source_url TEXT;
CREATE INDEX IF NOT EXISTS idx_chat_att_msg ON chat_attachments (message_id);
CREATE INDEX IF NOT EXISTS idx_chat_att_source ON chat_attachments (source_url, created_at);

-- Admin console, alerts and search (created automatically on first use by functions/_lib/schema.js; listed here for reference)
-- Admin console tables: chat_alerts (alert log + reply routing), chat_meta, chat_emails (transcript-email state), chat_messages_fts (FTS5 full-text index) with triggers.
