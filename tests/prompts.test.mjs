import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSystem } from '../functions/_lib/prompts.js';

const cfg = { contactPhone: '801-822-9045', contactEmail: 'a@example.com' };
const text = (mode) => buildSystem(cfg, mode, 'KNOWLEDGE BODY', '').map((b) => b.text).join('\n');

test('fit chat assesses bare product-leadership titles instead of asking for a job description', () => {
  const t = text('fit');
  assert.match(t, /ROLE TITLE ONLY/);
  assert.match(t, /Chief Product Officer/);
  assert.match(t, /never call it "just a title"/);
  assert.match(t, /B2B SaaS, fintech and lending, AI product, HR software, banking software, and infrastructure software/);
});

test('intro chat does not carry the fit-title rules', () => {
  assert.doesNotMatch(text('intro'), /ROLE TITLE ONLY/);
});
