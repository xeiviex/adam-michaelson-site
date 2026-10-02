/**
 * POST /api/sms-optin
 *
 * Records a web-form opt-in as an append-only consent event in D1.
 * Binding: SMS_OPTIN_DB  ->  d1 database "sms-optin"
 *
 * The consent ledger is never mutated. Opt-outs and resubscribes are
 * appended as new rows; `current_consent` resolves the latest state.
 */

const PROGRAM_NAME = "Household Budget Summary";
const MSG_FREQUENCY = "approximately 1 message per day";
const PRIVACY_URL = "https://adam-michaelson.com/privacy";
const TERMS_URL = "https://adam-michaelson.com/sms-terms";

// Canonical server-side copy. What the browser sends is stored alongside it,
// but this is the wording of record if the two ever diverge.
const CANONICAL_CONSENT_TEXT =
  "I agree to receive one automated daily household budget summary text message " +
  "from Adam Michaelson. Message frequency is approximately 1 message per day. " +
  "Message and data rates may apply. Reply STOP to cancel, HELP for help.";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

/** Normalize a US mobile number to E.164, or return null. */
function toE164(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.length === 10) return "+1" + digits;
  if (digits.length === 11 && digits.startsWith("1")) return "+" + digits;
  return null;
}

export async function onRequestPost({ request, env }) {
  if (!env.SMS_OPTIN_DB) {
    return json({ error: "Database binding not configured." }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Malformed request." }, 400);
  }

  // Honeypot. Bots fill hidden fields; humans can't see this one.
  // Return 200 so scrapers don't learn anything from the response.
  if (body.company) {
    return json({ ok: true, message: "Thanks." });
  }

  const fullName = String(body.full_name || "").trim();
  const phone = toE164(body.phone);
  const consent = body.consent === true;

  if (!fullName) return json({ error: "Full name is required." }, 400);
  if (fullName.length > 120) return json({ error: "Name is too long." }, 400);
  if (!phone) return json({ error: "Enter a valid 10-digit US mobile number." }, 400);
  if (!consent) return json({ error: "Consent checkbox must be checked." }, 400);

  const submitted = String(body.consent_text || "").trim();
  const consentText =
    submitted && submitted === CANONICAL_CONSENT_TEXT ? submitted : CANONICAL_CONSENT_TEXT;

  const now = new Date().toISOString();
  const ip = request.headers.get("CF-Connecting-IP") || null;
  const ua = (request.headers.get("User-Agent") || "").slice(0, 300) || null;

  // If this number's most recent event was an opt-out, this is a resubscribe.
  let eventType = "opt_in";
  try {
    const prior = await env.SMS_OPTIN_DB.prepare(
      "SELECT event_type FROM consent_events WHERE phone_e164 = ?1 ORDER BY id DESC LIMIT 1"
    )
      .bind(phone)
      .first();
    if (prior && prior.event_type === "opt_out") eventType = "resubscribe";
  } catch {
    // Non-fatal: fall through and record as opt_in.
  }

  try {
    await env.SMS_OPTIN_DB.prepare(
      `INSERT INTO consent_events
         (occurred_at, phone_e164, event_type, source, full_name, consent_text,
          program_name, msg_frequency, privacy_url, terms_url, ip_address, user_agent)
       VALUES (?1,?2,?3,'web_form',?4,?5,?6,?7,?8,?9,?10,?11)`
    )
      .bind(
        now,
        phone,
        eventType,
        fullName,
        consentText,
        PROGRAM_NAME,
        MSG_FREQUENCY,
        PRIVACY_URL,
        TERMS_URL,
        ip,
        ua
      )
      .run();
  } catch (err) {
    return json({ error: "Could not record consent. Please try again." }, 500);
  }

  return json({
    ok: true,
    event_type: eventType,
    recorded_at: now,
    message:
      "You're opted in to the " +
      PROGRAM_NAME +
      ". Recorded " +
      now +
      " UTC. Reply STOP to any message to cancel.",
  });
}

/**
 * Do NOT add an `onRequest` catch-all here — in Pages Functions it takes
 * precedence over method-specific handlers and would swallow the POST.
 */
export async function onRequestGet() {
  return new Response("Method Not Allowed. POST only.", {
    status: 405,
    headers: { Allow: "POST" },
  });
}
