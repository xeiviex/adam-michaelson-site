import test from 'node:test';
import assert from 'node:assert/strict';
import * as F from '../public/achieve/shared/flow.js';
import { createStore, TTL } from '../public/achieve/shared/store.js';
import { buildOffers, pmt } from '../public/achieve/shared/offers.js';
import { createAgent, isQuestion } from '../public/achieve/shared/agent.js';
import { localAnswer } from '../public/achieve/shared/kb.js';
import { contextBlock } from '../functions/api/achieve-assistant.js';

const mem = () => { const m = {}; return { getItem: (k) => m[k] ?? null, setItem: (k, v) => { m[k] = String(v); }, removeItem: (k) => { delete m[k]; }, m }; };

test('flow: parsers read what people actually type', () => {
  assert.equal(F.parseMoney('$25k'), 25000);
  assert.equal(F.parseMoney('about 18,500 dollars'), 18500);
  assert.equal(F.parsePurpose('paying off my credit cards'), 'Credit Card Refinancing');
  assert.equal(F.parsePurpose('2'), 'Debt Consolidation');
  assert.deepEqual(F.parseName('my name is jordan van der berg'), { first: 'Jordan', last: 'Van Der Berg' });
  assert.equal(F.parseName('Jordan'), null);
  assert.deepEqual(F.parseAddress('3734 Royal Troon Dr, Eagle Mountain, UT 84005'), { street: '3734 Royal Troon Dr', apt: '', city: 'Eagle Mountain', state: 'UT', zip: '84005' });
  assert.equal(F.parseAddress('somewhere nice'), null);
  assert.equal(F.parsePhone('801-822-9045'), '(801) 822-9045');
  assert.equal(F.parseEmail('it is adam@example.com thanks'), 'adam@example.com');
  assert.equal(F.parseHousing('I rent'), 'rent');
});

test('flow: validation catches the usual mistakes', () => {
  const dob = F.stepById('name').fields.find((f) => f.id === 'dob');
  assert.equal(F.validateField(dob, '02/27/1977', {}), '');
  assert.match(F.validateField(dob, '02/27/2015', {}), /18/);
  assert.match(F.validateField(dob, '13/40/1990', {}), /valid/);
  const errs = F.validateStep(F.stepById('address'), { street: '1 Main', city: 'Lehi', state: '', zip: '123' });
  assert.ok(errs.state && errs.zip && !errs.street && !errs.apt);
});

test('flow: time estimate starts near four minutes for the first screens and shrinks', () => {
  const first7 = F.STEPS.slice(0, 7).reduce((t, s) => t + s.secs, 0);
  assert.ok(first7 >= 200 && first7 <= 260);
  assert.equal(F.minsLabel(F.secsLeft([])).startsWith('About '), true);
  const all = F.STEPS.filter((s) => s.id !== 'docs' && s.id !== 'offers').map((s) => s.id);
  assert.equal(F.secsLeft(all), 0);
  assert.match(F.minsLabel(0, all), /documents/);
  assert.ok(F.secsToOffers(all) > 0);
  assert.equal(F.minsLabel(30), 'Less than 1 min left');
});

test('flow: "take me to" understands steps', () => {
  assert.equal(F.parseNavigate('skip to my income').stepId, 'income');
  assert.equal(F.parseNavigate('can you take me to the documents step').stepId, 'docs');
  assert.equal(F.parseNavigate('change my address').edit, true);
  assert.equal(F.parseNavigate('what is a HELOC'), null);
});

test('store: data model, progress and expiry', () => {
  let t = 1000;
  const raw = mem();
  const S = createStore(raw, () => t);
  const s = S.get();
  assert.equal(s.step_applicants.length, F.STEPS.length);
  assert.equal(s.steps[0].id, 'amount');
  S.setApplicant({ amount: 20000, first: 'Adam' });
  S.start('amount'); S.complete('amount');
  assert.equal(S.status('amount'), 'complete');
  assert.equal(S.nextIncomplete(), 'purpose');
  assert.equal(S.progress().done, 1);
  const d = S.dropOut('web', 'messages');
  assert.equal(d.step_id, 'purpose');
  S.addDocument('paystub', { name: 'pay.pdf', size: 1000 });
  assert.equal(S.docFor('paystub').name, 'pay.pdf');
  assert.equal(JSON.stringify(raw.m).includes('123-45-6789'), false);
  // another page load within the window sees the same session
  const S2 = createStore(raw, () => t + 60000);
  assert.equal(S2.applicant().first, 'Adam');
  // after 30 idle minutes the record is ignored and the experience starts over
  const S3 = createStore(raw, () => t + TTL + 5000);
  assert.equal(S3.applicant().first, undefined);
  assert.equal(S3.doneIds().length, 0);
});

test('offers: all Achieve products, HELOC only for homeowners, sane math', () => {
  const own = buildOffers({ amount: 20000, income: 90000, housing: 'own_mortgage' });
  const rent = buildOffers({ amount: 20000, income: 90000, housing: 'rent' });
  assert.deepEqual(own.map((o) => o.id), ['term36', 'term60', 'loc', 'heloc']);
  assert.deepEqual(rent.map((o) => o.id), ['term36', 'term60', 'loc']);
  assert.ok(own.every((o) => /^Achieve /.test(o.name)));
  const t36 = own[0];
  assert.equal(t36.monthly, Math.round(pmt(20000, t36.apr, 36)));
  assert.ok(own.find((o) => o.id === 'heloc').monthly < t36.monthly);
  assert.ok(own.some((o) => o.tags.includes('Lowest payment')) && own.some((o) => o.tags.includes('Lowest total cost')));
  assert.equal(buildOffers({ amount: 10000, housing: 'own_free' }).some((o) => o.id === 'heloc'), false);
});

test('agent: picks up at the next incomplete step, never takes sensitive data, links back to the exact spot', async () => {
  const S = createStore(mem());
  const agent = createAgent({ store: S, channel: 'messages', ask: async () => 'ANSWER', origin: 'https://example.test' });
  // no state: generic opener plus the first question and a link
  let out = agent.start();
  assert.match(out[0].text, /^Hi there/);
  assert.match(out[1].text, /How much/);
  assert.ok(out.some((m) => m.link && m.link.url === 'https://example.test/achieve/'));
  const hist = [];
  const say = async (t) => { const r = await agent.reply(t, hist); hist.push({ who: 'user', text: t }); r.forEach((m) => hist.push({ who: 'agent', text: m.text })); return r; };
  await say('$25k'); await say('debt consolidation'); await say('$80k');
  assert.equal(S.applicant().amount, 25000);
  assert.equal(S.applicant().income, 80000);
  // a question is answered, then the agent returns to where it was
  let r = await say('Does this affect my credit score?');
  assert.equal(r[0].text, 'ANSWER');
  assert.match(r[1].text, /Whenever you are ready/);
  r = await say('Jordan Smith');
  assert.equal(S.applicant().first, 'Jordan');
  // date of birth is sensitive: link, not a question
  assert.ok(r.some((m) => m.link && /resume=name/.test(m.link.url)));
  assert.equal(S.isDone('name'), false);
  // dropout awareness: new agent in another channel reads the same session
  S.dropOut('web', 'chatgpt');
  const gpt = createAgent({ store: S, channel: 'chatgpt', ask: async () => 'x', origin: 'https://example.test' });
  const o2 = gpt.start();
  assert.match(o2[0].text, /^Hey there, Jordan/);
  assert.match(o2[0].text, /minutes? away from options/);
  assert.equal(S.get().dropout, null);
});

test('agent: SSN, documents and offers are always a link, never a question', async () => {
  const S = createStore(mem());
  const all = F.STEPS.filter((s) => s.id !== 'ssn' && s.id !== 'docs' && s.id !== 'offers').map((s) => s.id);
  all.forEach((id) => S.complete(id));
  S.setApplicant({ first: 'Ann' });
  const agent = createAgent({ store: S, channel: 'messages', ask: async () => '', origin: 'https://example.test' });
  const out = agent.start();
  assert.ok(out.some((m) => m.link && /resume=ssn/.test(m.link.url)));
  assert.ok(!out.some((m) => /social security number\?/i.test(m.text)));
  const r = await agent.reply('my ssn is 123-45-6789', []);
  assert.equal(JSON.stringify(S.get()).includes('123-45-6789'), false);
});

test('agent: isQuestion', () => {
  assert.equal(isQuestion('What is a HELOC?'), true);
  assert.equal(isQuestion('$25,000'), false);
  assert.equal(isQuestion('Jordan Smith'), false);
});

test('knowledge: offline answers cover the basics', () => {
  assert.match(localAnswer('Will this hurt my credit score?'), /soft credit pull/);
  assert.match(localAnswer('what is a HELOC'), /home equity/i);
  assert.match(localAnswer('what documents do I need'), /paystub/);
  assert.equal(localAnswer('zzz'), null);
});

test('assistant API: context block only carries light, non-sensitive context', () => {
  const b = contextBlock({ step: 'income', first: 'Ann', amount: 20000, purpose: 'Debt Consolidation', ssn: '123-45-6789', dob: '01/01/1980', channel: 'messages' });
  assert.match(b, /Income|income/);
  assert.match(b, /Ann/);
  assert.doesNotMatch(b, /123-45-6789|01\/01\/1980/);
});
