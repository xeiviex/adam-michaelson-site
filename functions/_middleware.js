/* Site-wide: adds the scroll hint (public/scroll-hint.js) and Google Analytics (G-1TRY7CFCFG)
   to every public HTML page, records privacy-friendly pageviews to D1, and skips API/admin.
   A page can opt out of scroll hint with <html data-no-scroll-hint>. */
import { getVisitorId, recordPageView } from "./_lib/analytics.js";

const SKIP = [/^\/api\//, /^\/admin(\/|$)/, /^\/clever\//];
const TAG = '<script src="/scroll-hint.js?v=1" defer></script>';
const GA4_ID = 'G-1TRY7CFCFG';
const GA4_TAG = `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA4_ID}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA4_ID}');</script>`;

// adam-michaelson.com/q+a is the memorable address; the page lives at /q-and-a/ (a "+" is awkward in static paths).
const QA_ALIAS = /^\/q(\+|%2b|%20)a\/?$/i;

export async function onRequest(ctx) {
  const url = new URL(ctx.request.url);
  if (QA_ALIAS.test(url.pathname)) return Response.redirect(url.origin + '/q-and-a/', 301);
  const res = await ctx.next();
  if (ctx.request.method !== 'GET') return res;
  const path = url.pathname;
  if (SKIP.some(function (re) { return re.test(path); })) return res;
  if (!(res.headers.get('content-type') || '').includes('text/html')) return res;

  // Track visitor via persistent cookie
  const existingVid = getVisitorId(ctx.request);
  const isReturning = Boolean(existingVid);
  const visitorId = existingVid || (typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));

  // Record pageview in D1 asynchronously without blocking the response
  if (ctx.env?.SMS_OPTIN_DB) {
    const recordPromise = recordPageView(ctx.env.SMS_OPTIN_DB, {
      request: ctx.request,
      url,
      visitorId,
      isReturning
    }).catch(function (err) {
      console.error('analytics recording error:', err);
    });

    if (typeof ctx.waitUntil === 'function') {
      ctx.waitUntil(recordPromise);
    } else {
      await recordPromise;
    }
  }

  if (typeof HTMLRewriter === 'undefined') return res;

  let transformed = new HTMLRewriter()
    .on('head', { element: function (el) { el.append(GA4_TAG, { html: true }); } })
    .on('body', { element: function (el) { el.append(TAG, { html: true }); } })
    .transform(res);

  if (!isReturning) {
    try {
      transformed.headers.append('Set-Cookie', `_am_vid=${visitorId}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`);
    } catch {
      const copy = new Response(transformed.body, transformed);
      if (transformed.__rewritten) copy.__rewritten = transformed.__rewritten;
      copy.headers.append('Set-Cookie', `_am_vid=${visitorId}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`);
      transformed = copy;
    }
  }

  return transformed;
}
