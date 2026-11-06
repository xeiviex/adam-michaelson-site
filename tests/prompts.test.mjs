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

test('CPO is the confident target role in both chats, without hedging', () => {
  for (const mode of ['intro', 'fit']) {
    const t = text(mode);
    assert.match(t, /TARGET ROLE: the role I'm looking for, and my best fit, is Chief Product Officer/);
    assert.match(t, /Never hedge, never apologize for my titles/);
    assert.match(t, /I don't lead with "SVP of Product" anymore/);
  }
  assert.match(text('fit'), /never list my titles or the lack of a CPO title as a gap/);
  assert.match(text('fit'), /I'm a CPO, it's the role I'm looking for, and here's the evidence/);
});

test('CTO and CPTO answers bring in the technical background', () => {
  assert.match(text('fit'), /computer science major at BYU/);
  assert.match(text('fit'), /hire and lean on a strong VP of Engineering/);
});

test('intro chat does not carry the fit-title rules', () => {
  assert.doesNotMatch(text('intro'), /ROLE TITLE ONLY/);
});
