import test from 'node:test';
import assert from 'node:assert/strict';
import { contextBlock, onRequestPost } from '../functions/api/achieve-debt-assistant.js';
import { DEBT_KNOWLEDGE } from '../public/achieve/debt-knowledge.js';

test('debt assistant: context block uses only light fields', () => {
  const c = contextBlock({ stage: 'build', first: 'Jordan', deposit: 600, months: 38, debts: [{ name: 'Summit Bank Visa', kind: 'Credit card', balance: 11200 }], ssn: '123-45-6789' });
  assert.match(c, /stage 6 of 8/); assert.match(c, /Jordan/); assert.match(c, /\$600/); assert.doesNotMatch(c, /123-45/);
});
test('debt assistant: knowledge states the honest downsides and fee timing', () => {
  assert.match(DEBT_KNOWLEDGE, /credit scores will likely fall/i);
  assert.match(DEBT_KNOWLEDGE, /sue/i);
  assert.match(DEBT_KNOWLEDGE, /No fee is charged until/);
});
test('debt assistant: 503 without a key, 400 on bad body, 403 on foreign origin', async () => {
  const mk = (body, origin) => new Request('https://example.com/api/achieve-debt-assistant', { method: 'POST', headers: origin ? { Origin: origin } : {}, body });
  assert.equal((await onRequestPost({ request: mk('{}'), env: {} })).status, 503);
  assert.equal((await onRequestPost({ request: mk('nope'), env: { ANTHROPIC_API_KEY: 'k' } })).status, 400);
  assert.equal((await onRequestPost({ request: mk('{}', 'https://evil.test'), env: { ANTHROPIC_API_KEY: 'k' } })).status, 403);
  assert.equal((await onRequestPost({ request: mk(JSON.stringify({ messages: [{ role: 'assistant', content: 'hi' }] })), env: { ANTHROPIC_API_KEY: 'k' } })).status, 400);
});
