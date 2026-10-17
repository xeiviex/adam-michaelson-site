/**
 * Admin access: only a request carrying a valid Cloudflare Access token for ADMIN_EMAIL is accepted.
 * Required env: CF_ACCESS_TEAM_DOMAIN (e.g. yourteam.cloudflareaccess.com), CF_ACCESS_AUD (the
 * Access application's AUD tag), ADMIN_EMAIL. If any is missing, every admin route refuses (fail closed).
 */
const b64u = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=")), (c) => c.charCodeAt(0));
const json = (s) => JSON.parse(new TextDecoder().decode(b64u(s)));

let jwks = { at: 0, team: "", keys: [] };

async function getKeys(team, fetchImpl, force) {
  if (!force && jwks.team === team && Date.now() - jwks.at < 3600e3 && jwks.keys.length) return jwks.keys;
  const res = await fetchImpl(`https://${team}/cdn-cgi/access/certs`);
  if (!res.ok) return [];
  const body = await res.json();
  jwks = { at: Date.now(), team, keys: body.keys || [] };
  return jwks.keys;
}

/** Returns { email } for a valid admin request, or null. */
export async function verifyAccess(request, env, fetchImpl = fetch) {
  const team = String(env.CF_ACCESS_TEAM_DOMAIN || "").replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const aud = env.CF_ACCESS_AUD;
  const admin = String(env.ADMIN_EMAIL || "").toLowerCase();
  if (!team || !aud || !admin) return null;
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const header = json(parts[0]);
    const payload = json(parts[1]);
    if (header.alg !== "RS256" || !header.kid) return null;
    if (payload.iss !== `https://${team}`) return null;
    if (![].concat(payload.aud || []).includes(aud)) return null;
    const now = Date.now() / 1000;
    if (!payload.exp || payload.exp < now || (payload.nbf && payload.nbf > now + 60)) return null;
    if (String(payload.email || "").toLowerCase() !== admin) return null;
    let key = (await getKeys(team, fetchImpl, false)).find((k) => k.kid === header.kid);
    if (!key) key = (await getKeys(team, fetchImpl, true)).find((k) => k.kid === header.kid);
    if (!key) return null;
    const pub = await crypto.subtle.importKey("jwk", key, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", pub, b64u(parts[2]), new TextEncoder().encode(parts[0] + "." + parts[1]));
    return ok ? { email: payload.email } : null;
  } catch {
    return null;
  }
}

export function resetKeyCache() { jwks = { at: 0, team: "", keys: [] }; }
