/**
 * Outgoing email behind a tiny interface. Provider: Resend (https://resend.com), enabled by RESEND_API_KEY.
 * Env: RESEND_API_KEY (secret), EMAIL_TO (default ADMIN_EMAIL), EMAIL_FROM.
 * EMAIL_FROM defaults to Resend's shared test sender, which can deliver only to the Resend account owner's own address;
 * once a sending domain is verified, set EMAIL_FROM (e.g. "Chat <chat@adam-michaelson.com>").
 */
export function emailTarget(env) {
  return env.EMAIL_TO || env.ADMIN_EMAIL || "";
}

export function emailConfigured(env) {
  return !!(env.RESEND_API_KEY && emailTarget(env));
}

/** Returns { ok, error? }. Never throws. */
export async function sendEmail(env, { subject, text, html }, fetchImpl = fetch) {
  if (!emailConfigured(env)) return { ok: false, error: "email not configured" };
  try {
    const res = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.EMAIL_FROM || "Chat module <onboarding@resend.dev>", to: [emailTarget(env)], subject, text, html }),
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e).slice(0, 200) };
  }
}
