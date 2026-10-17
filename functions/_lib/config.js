import { blockedNames } from "./nameguard.js";

/** Chat configuration. Everything overridable by environment variable. */
export function getConfig(env) {
  const int = (v, d) => (Number.isFinite(parseInt(v, 10)) ? parseInt(v, 10) : d);
  return {
    // Contact: phone first, email as the alternative. Config values, not prompt text.
    contactPhone: env.CONTACT_PHONE || "801-822-9045",
    contactEmail: env.CONTACT_EMAIL || "hello@adam-michaelson.com",
    blockedNames: blockedNames(env),
    model: env.CHAT_MODEL || "claude-sonnet-5-5",
    effort: env.CHAT_EFFORT || "medium",
    maxTokens: { intro: int(env.CHAT_MAX_TOKENS_INTRO, 1024), fit: int(env.CHAT_MAX_TOKENS_FIT, 1800) },
    maxMessageChars: { intro: int(env.CHAT_MAX_CHARS_INTRO, 2000), fit: int(env.CHAT_MAX_CHARS_FIT, 20000) },
    maxTurns: { intro: int(env.CHAT_MAX_TURNS_INTRO, 30), fit: int(env.CHAT_MAX_TURNS_FIT, 8) },
    perIpPerHour: int(env.CHAT_RATE_PER_IP_HOUR, 40),
    dailyLimit: int(env.CHAT_DAILY_LIMIT, 1500), // total visitor messages per rolling 24h
  };
}
