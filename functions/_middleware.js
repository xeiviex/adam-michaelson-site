/* Site-wide: adds the scroll hint (public/scroll-hint.js) to every public HTML page, so any page built later inherits it.
   API, admin (strict CSP) and the /clever design mockups are skipped. A page can opt out with <html data-no-scroll-hint>. */
const SKIP = [/^\/api\//, /^\/admin(\/|$)/, /^\/clever\//];
const TAG = '<script src="/scroll-hint.js?v=1" defer></script>';

export async function onRequest(ctx) {
  const res = await ctx.next();
  if (ctx.request.method !== 'GET' || typeof HTMLRewriter === 'undefined') return res;
  const path = new URL(ctx.request.url).pathname;
  if (SKIP.some(function (re) { return re.test(path); })) return res;
  if (!(res.headers.get('content-type') || '').includes('text/html')) return res;
  return new HTMLRewriter().on('body', { element: function (el) { el.append(TAG, { html: true }); } }).transform(res);
}
