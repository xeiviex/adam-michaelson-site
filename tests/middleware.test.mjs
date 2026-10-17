import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/_middleware.js';

function html(body = '<html><body>hi</body></html>') {
  return new Response(body, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}
function ctx(path, res, method = 'GET') {
  return { request: new Request('https://adam-michaelson.com' + path, { method }), next: async () => res };
}
function fakeRewriter() {
  globalThis.HTMLRewriter = class {
    on(sel, h) { this.sel = sel; this.h = h; return this; }
    transform(res) { const self = this; this.h.element({ append(t) { self.appended = t; } }); res.__rewritten = self; return res; }
  };
}

test('injects the scroll hint into public HTML pages', async () => {
  fakeRewriter();
  for (const p of ['/', '/bio/', '/product/pm/', '/privacy/']) {
    const res = await onRequest(ctx(p, html()));
    assert.ok(res.__rewritten, p);
    assert.equal(res.__rewritten.sel, 'body');
    assert.match(res.__rewritten.appended, /\/scroll-hint\.js/);
  }
});

test('skips api, admin, clever mockups, non-GET and non-HTML', async () => {
  fakeRewriter();
  for (const p of ['/api/chat', '/admin', '/admin/', '/clever/index.html']) {
    assert.equal((await onRequest(ctx(p, html()))).__rewritten, undefined, p);
  }
  assert.equal((await onRequest(ctx('/', html(), 'POST'))).__rewritten, undefined);
  const js = new Response('x', { headers: { 'content-type': 'text/javascript' } });
  assert.equal((await onRequest(ctx('/home.js', js))).__rewritten, undefined);
});

test('passes through untouched when HTMLRewriter is unavailable', async () => {
  delete globalThis.HTMLRewriter;
  const res = html();
  assert.equal(await onRequest(ctx('/', res)), res);
});
