-- Household Budget Summary — SMS consent ledger
-- Cloudflare D1 database: sms-optin
-- Binding: SMS_OPTIN_DB
--
-- Design: append-only. A consent record is evidence, so it is never mutated.
-- Opt-outs and resubscribes are appended as new events; the current_consent
-- view resolves the latest state per phone number.

CREATE TABLE IF NOT EXISTS consent_events (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  occurred_at    TEXT    NOT NULL,          -- ISO 8601 UTC
  phone_e164     TEXT    NOT NULL,          -- +1XXXXXXXXXX
  event_type     TEXT    NOT NULL CHECK (event_type IN ('opt_in','opt_out','resubscribe')),
  source         TEXT    NOT NULL CHECK (source IN ('web_form','sms_keyword','admin')),
  full_name      TEXT,
  consent_text   TEXT,                      -- verbatim wording shown at consent time
  program_name   TEXT,
  msg_frequency  TEXT,
  privacy_url    TEXT,                      -- policy URLs in effect at consent time
  terms_url      TEXT,
  ip_address     TEXT,
  user_agent     TEXT,
  note           TEXT
);

CREATE INDEX IF NOT EXISTS idx_consent_phone_time ON consent_events (phone_e164, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_consent_time       ON consent_events (occurred_at DESC);

-- Latest event per number, with a convenience flag.
CREATE VIEW IF NOT EXISTS current_consent AS
SELECT e.phone_e164,
       e.full_name,
       e.event_type AS last_event,
       e.occurred_at AS last_event_at,
       e.source,
       e.consent_text,
       CASE WHEN e.event_type IN ('opt_in','resubscribe') THEN 1 ELSE 0 END AS is_subscribed
FROM consent_events e
JOIN (SELECT phone_e164, MAX(id) AS max_id FROM consent_events GROUP BY phone_e164) latest
  ON e.id = latest.max_id;
