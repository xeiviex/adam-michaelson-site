/**
 * Outgoing email behind a tiny interface. Two providers:
 *
 *  gmail  (preferred when configured): sends through the Gmail API with a send-only OAuth credential
 *         (scope gmail.send: it can send mail but cannot read the mailbox).
 *         Secrets: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN. Optional: EMAIL_FROM.
 *  resend: https://resend.com. Secret: RESEND_API_KEY. EMAIL_FROM defaults to Resend's shared test sender,
 *         which can only deliver to the Resend account owner's own address.
 *
 * EMAIL_TO is the recipient (default ADMIN_EMAIL). EMAIL_PROVIDER ("gmail" | "resend") forces a choice.
 */
export function emailTarget(env) {
  return env.EMAIL_TO || env.ADMIN_EMAIL || "";
}

const gmailConfigured = (env) => !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REFRESH_TOKEN);
const resendConfigured = (env) => !!env.RESEND_API_KEY;

export function emailProvider(env) {
  const want = String(env.EMAIL_PROVIDER || "").toLowerCase();
  if (want === "resend") return resendConfigured(env) ? "resend" : null;
  if (want === "gmail") return gmailConfigured(env) ? "gmail" : null;
  return gmailConfigured(env) ? "gmail" : resendConfigured(env) ? "resend" : null;
}

export function emailConfigured(env) {
  return !!emailProvider(env) && !!emailTarget(env);
}

/* ---------------- Gmail ---------------- */

let token = { value: "", exp: 0, key: "" };
export function resetEmailTokenCache() { token = { value: "", exp: 0, key: "" }; }

async function gmailAccessToken(env, fetchImpl) {
  const key = env.GOOGLE_REFRESH_TOKEN;
  if (token.value && token.key === key && Date.now() < token.exp - 60e3) return token.value;
  const res = await fetchImpl("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, refresh_token: key, grant_type: "refresh_token" }).toString(),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.access_token) {
    const why = body.error === "invalid_grant" ? "the Google refresh token was rejected (expired or revoked): create a new one" : `Google token request failed: ${body.error || res.status}`;
    throw new Error(why);
  }
  token = { value: body.access_token, exp: Date.now() + (body.expires_in || 3600) * 1000, key };
  return token.value;
}

const b64 = (s) => {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};
const b64url = (s) => b64(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const wrap76 = (s) => s.replace(/(.{76})/g, "$1\r\n");
const oneLine = (s) => String(s).replace(/[\r\n]+/g, " ").trim();

/** An RFC 2822 message with text and HTML parts. Every header value is single-line and the subject is encoded. */
export function buildMime({ from, to, subject, text, html }) {
  const boundary = "=_chat_" + Math.random().toString(36).slice(2);
  const lines = [
    from ? `From: ${oneLine(from)}` : null,
    `To: ${oneLine(to)}`,
    `Subject: =?UTF-8?B?${b64(oneLine(subject))}?=`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    wrap76(b64(text)),
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    wrap76(b64(html)),
    `--${boundary}--`,
    "",
  ].filter((l) => l !== null);
  return lines.join("\r\n");
}

const gmail = {
  async send(env, { subject, text, html }, fetchImpl) {
    const access = await gmailAccessToken(env, fetchImpl);
    const raw = b64url(buildMime({ from: env.EMAIL_FROM, to: emailTarget(env), subject, text, html }));
    const res = await fetchImpl("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${access}`, "Content-Type": "application/json" },
      body: JSON.stringify({ raw }),
    });
    if (!res.ok) throw new Error(`Gmail HTTP ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
  },
};

/* ---------------- Resend ---------------- */

const resend = {
  async send(env, { subject, text, html }, fetchImpl) {
    const res = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.EMAIL_FROM || "Chat module <onboarding@resend.dev>", to: [emailTarget(env)], subject, text, html }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
  },
};

/** Returns { ok, error? }. Never throws. */
export async function sendEmail(env, message, fetchImpl = fetch) {
  if (!emailConfigured(env)) return { ok: false, error: "email not configured" };
  try {
    await ({ gmail, resend }[emailProvider(env)]).send(env, message, fetchImpl);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e).slice(0, 200) };
  }
}
