import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { htmlToText, scriptWording, siteSection } from '../scripts/lib/site-pages.mjs';

test('htmlToText keeps visible copy and drops chrome, scripts and markup', () => {
  const t = htmlToText('<html><head><title>x</title></head><body><header>Adam nav</header><main><h1>Big &amp; bold</h1><p>It&rsquo;s <b>research</b> first.</p><script>var a=1</script></main><footer>hello@example.com</footer></body></html>');
  assert.equal(t, "Big & bold\nIt's research first.");
});

test('scriptWording keeps prose-like strings only', () => {
  const w = scriptWording(`var a='Funds can arrive as soon as the next business day.'; var b='<span class="x">hello there friend</span>'; var c='short one'; var d="Ask a question about this offer";`);
  assert.deepEqual(w, ['Funds can arrive as soon as the next business day.', 'Ask a question about this offer']);
});

test('siteSection picks up a route and its sub-pages automatically, tagged public', () => {
  const pub = mkdtempSync(join(tmpdir(), 'pub-'));
  mkdirSync(join(pub, 'topic/deep'), { recursive: true });
  writeFileSync(join(pub, 'topic/index.html'), '<title>Topic | Adam Michaelson</title><body><p>Main page copy about the topic.</p></body>');
  writeFileSync(join(pub, 'topic/deep/index.html'), '<title>Deep dive | Adam Michaelson</title><body><p>Sub page copy.</p></body>');
  const s = siteSection(pub, 'topic', 'My topic');
  assert.match(s, /^## My topic \\\[PUBLIC\\\]/);
  assert.match(s, /### Topic \(adam-michaelson\.com\/topic\)\nMain page copy/);
  assert.match(s, /### Deep dive \(adam-michaelson\.com\/topic\/deep\)\nSub page copy/);
  assert.equal(siteSection(pub, 'missing', 'x'), '');
});
