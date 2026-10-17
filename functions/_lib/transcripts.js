/** Builds the transcript email. Visitor text is HTML-escaped in the HTML part. */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
const when = (iso, tz) => new Date(iso).toLocaleString("en-US", { timeZone: tz, month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const WHO = { visitor: "Visitor", bot: "Assistant", adam: "You" };

export function adminLink(env, sessionId) {
  return `${(env.ADMIN_BASE_URL || "https://adam-michaelson.com").replace(/\/$/, "")}/admin#${sessionId}`;
}

export function buildTranscriptEmail({ env, session, messages, attachments = [] }) {
  const tz = env.ALERT_TZ || "America/Denver";
  const first = messages.find((m) => m.role === "visitor");
  const kind = session.chat_type === "fit" ? "job-fit chat" : "intro chat";
  const link = adminLink(env, session.session_id);
  const subject = `Chat transcript: "${clip((first ? first.content : "(no message)").replace(/\s+/g, " "), 60)}" (${kind}, ${messages.length} messages)`;
  const facts = [
    `Type: ${kind}`,
    `Visitor IP: ${session.user_id}`,
    `Started: ${when(session.created_at, tz)}`,
    `Last activity: ${when(session.last_activity_at, tz)}`,
    `Messages: ${messages.length}${session.mode === "human" ? " (you joined this conversation)" : ""}`,
    ...attachments.map((a) => `Job posting link read: ${a.url}`),
  ];
  const text = [
    `Open in the admin console: ${link}`, "", ...facts, "", "----------------------------------------",
    ...messages.map((m) => `${WHO[m.role] || m.role} (${when(m.created_at, tz)}):\n${m.content}\n`),
    "----------------------------------------", `Open in the admin console: ${link}`,
  ].join("\n");
  const html = `<div style="font:15px/1.5 -apple-system,Segoe UI,sans-serif;color:#14171f;max-width:640px">
<p><a href="${esc(link)}" style="display:inline-block;background:#2f8fd1;color:#fff;text-decoration:none;padding:9px 16px;border-radius:8px">Open in the admin console</a></p>
<p style="color:#5d6475;font-size:13px">${facts.map(esc).join("<br>")}</p>
${messages.map((m) => `<div style="margin:10px 0;padding:9px 13px;border-radius:12px;background:${m.role === "visitor" ? "#eceff4" : m.role === "adam" ? "#dff0df" : "#dbe9f5"}"><div style="font-size:11px;color:#5d6475;margin-bottom:2px">${esc(WHO[m.role] || m.role)} · ${esc(when(m.created_at, tz))}</div><div style="white-space:pre-wrap">${esc(m.content)}</div></div>`).join("")}
</div>`;
  return { subject, text, html };
}
