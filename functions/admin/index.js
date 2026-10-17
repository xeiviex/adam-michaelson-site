/** GET /admin: the review console. Served only to a valid Cloudflare Access session for ADMIN_EMAIL; everyone else gets a plain 404. */
import { verifyAccess } from "../_lib/adminauth.js";
import { adminPage } from "../_lib/adminpage.js";

const headers = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

export async function onRequestGet({ request, env }) {
  const who = await verifyAccess(request, env);
  if (!who) return new Response("Not found", { status: 404, headers: { "X-Robots-Tag": "noindex" } });
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
  return new Response(adminPage(nonce), {
    headers: {
      ...headers,
      "Content-Security-Policy": `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`,
      "Referrer-Policy": "no-referrer",
    },
  });
}

export const onRequest = () => new Response("Not found", { status: 404, headers: { "X-Robots-Tag": "noindex" } });
