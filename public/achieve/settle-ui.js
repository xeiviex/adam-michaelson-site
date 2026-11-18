/* Achieve debt relief prototype, stage 7: the cards. Each card returns { el, auto(alive) }.
   No audio is played and no creditor is contacted. */
import { h, sleep, reduced, ico } from './firsttake/shared/dom.js';
import { cont } from './qualify-ui.js';
import * as S from './settle.js';
import { RULES } from './qualify.js';
import { money } from './firsttake/shared/flow.js';

const pause = (ms) => sleep(reduced() ? 0 : ms);

/* ---- meet your negotiator ---- */
export function advocateCard(applicant, onDone) {
  const go = cont('Show me', () => onDone({ advocate: true }));
  const el = h('div', { class: 'card' },
    h('div', { class: 'adv' }, h('div', { class: 'adv-av' }, 'PN'), h('div', null, h('b', null, S.NEGOTIATOR.name), h('em', null, S.NEGOTIATOR.title + '. ' + S.NEGOTIATOR.years + '.'))),
    h('p', { class: 'adv-say' }, 'Hi ' + (applicant.first || 'there') + '. I am on your side. My job is to get each of your creditors to accept less than you owe, and to keep you in the loop the whole way.'),
    h('ol', { class: 'how' }, S.HOW.map((x, i) => h('li', null, h('span', { class: 'ag-n' }, String(i + 1)), h('span', null, h('b', null, x.t), h('em', null, x.d))))), go);
  return { el, async auto(alive) { await pause(3400); if (alive()) go.click(); } };
}

/* ---- the activity feed: everything we do for you ---- */
export function activityCard(applicant, debt, onDone) {
  const items = S.activity(applicant.first, debt, S.REP);
  let kind = 'all', open = 'a1';
  const tabs = S.KINDS.map((k) => h('button', { type: 'button', class: 'tab' + (k.id === kind ? ' on' : ''), onclick: () => { kind = k.id; paint(); } }, k.label));
  const list = h('div', { class: 'act-list' });
  const IC = { call: 'phone', text: 'chat', email: 'file', letter: 'clip' };
  function play(it, box) {
    const t = box.querySelector('.tr'), btn = box.querySelector('.rec-play');
    if (!t || btn.disabled) return;
    btn.disabled = true; btn.classList.add('on'); t.replaceChildren();
    (async () => { for (const [who, line] of it.transcript) { t.append(h('div', { class: 'tl-line ' + (who === 'Priya' ? 'us' : 'them') }, h('b', null, who), h('span', null, line))); await pause(1300); } btn.disabled = false; btn.classList.remove('on'); })();
  }
  function paint() {
    tabs.forEach((t, i) => t.classList.toggle('on', S.KINDS[i].id === kind));
    list.replaceChildren(...items.filter((x) => kind === 'all' || x.kind === kind).map((it) => {
      const isOpen = open === it.id;
      const box = h('div', { class: 'act' + (isOpen ? ' open' : '') },
        h('button', { type: 'button', class: 'act-h', onclick: () => { open = isOpen ? null : it.id; paint(); } }, h('span', { class: 'act-ic' }, ico(IC[it.kind], 18)), h('span', { class: 'act-t' }, h('b', null, it.who), h('em', null, it.when + (it.dur ? ' · ' + it.dur : ''))), ico('chevD', 16)),
        isOpen ? h('div', { class: 'act-b' }, h('p', null, it.summary),
          it.transcript ? h('div', { class: 'rec' }, h('button', { type: 'button', class: 'btn line sm rec-play', onclick: () => play(it, box) }, ico('speaker', 16), 'Play recording'), h('span', { class: 'fine' }, 'Prototype: no audio. The transcript plays line by line.'), h('div', { class: 'tr' })) : null) : null);
      return box;
    }));
  }
  const go = cont('Next', () => onDone({ activity: true }));
  paint();
  const el = h('div', { class: 'card' }, h('div', { class: 'mint secure' }, ico('lock', 16), 'Every call is recorded and yours to hear. Every text and email is here.'), h('div', { class: 'tabs', style: { marginTop: '14px' } }, tabs), list, go);
  return { el, async auto(alive) {
    await pause(1500); if (!alive()) return;
    const box = list.querySelector('.act.open'); if (box) play(items[0], box);
    await pause(items[0].transcript.length * 1300 + 2500); if (alive()) go.click();
  } };
}

/* ---- the offer: approve, ask for more, or decline ---- */
export function offerCard(applicant, debt, fund, onDone) {
  let o = S.offerFor(debt), stage = 'offer', asked = false;
  const box = h('div', { class: 'ofr-box' });
  const row = (k, v, cls) => h('div', { class: 'ofr-row ' + (cls || '') }, h('span', null, k), h('b', null, v));
  const body = () => {
    if (stage === 'wait') return [h('div', { class: 'conn' }, h('span', { class: 'orbit', 'aria-hidden': 'true' }, h('i')), h('span', null, S.NEGOTIATOR.first + ' is asking ' + debt.name + ' for a better offer...'))];
    if (stage === 'approved') return [h('div', { class: 'linked' }, ico('check', 18, 3), h('span', null, 'Approved. ' + debt.name + ' will confirm in writing.')), h('ol', { class: 'after' }, S.afterApprove(o).map((s, i) => h('li', null, h('span', { class: 'ag-n' }, String(i + 1)), h('span', null, h('b', null, s.t), h('em', null, s.d)))))];
    if (stage === 'declined') return [h('div', { class: 'reassure' }, 'No problem. Nothing is paid, and your fund stays where it is. Priya will keep working on a better offer.')];
    const can = fund >= o.amount;
    return [
      h('div', { class: 'ofr-h' }, h('span', null, 'Offer for ' + debt.name), h('i', { class: 'pill ' + (asked ? 'ok' : 'warn') }, asked ? 'Improved offer' : 'New offer')),
      h('div', { class: 'ofr-big' }, money(o.amount), h('small', null, 'to settle ' + money(debt.balance) + ' (' + o.pctLabel + ')')),
      row('Your fund today', money(fund) + (can ? ', enough to cover this' : ', not enough yet')),
      row('Our fee', money(o.fee) + ', charged only after the payment'),
      row('Total cost of this settlement', money(o.total)),
      row('You keep, compared with the full balance', money(o.saved), 'pos'),
      h('p', { class: 'fine' }, 'Illustrative numbers. The fee is ' + Math.round(RULES.feePct * 100) + '% of this debt\'s enrolled balance, and it comes after the creditor is paid.'),
      confirmRow(),
      h('div', { class: 'ofr-act' }, approve, ask, decline)];
  };
  let sure = false;
  const approve = h('button', { type: 'button', class: 'btn', disabled: true, onclick: () => { stage = 'approved'; paint(); go.hidden = false; } }, 'Approve ' + money(o.amount));
  const ask = h('button', { type: 'button', class: 'btn line', onclick: askBetter }, 'Ask for a better offer');
  const decline = h('button', { type: 'button', class: 'lnk', onclick: () => { stage = 'declined'; paint(); go.hidden = false; } }, 'Decline');
  const sureBtn = h('button', { type: 'button', class: 'tl', role: 'checkbox', 'aria-checked': 'false', onclick: () => { sure = !sure; sync(); } }, h('span', { class: 'tl-box' }), h('span', { class: 'tl-main' }, h('b', { class: 'plainb' }, 'I approve this settlement and authorize payment from my dedicated account.')));
  const confirmRow = () => sureBtn;
  function sync() { sureBtn.classList.toggle('on', sure); sureBtn.setAttribute('aria-checked', String(sure)); sureBtn.querySelector('.tl-box').replaceChildren(...(sure ? [ico('check', 13, 3.4)] : [])); approve.disabled = !sure; approve.textContent = 'Approve ' + money(o.amount); }
  async function askBetter() {
    if (asked) return; stage = 'wait'; paint(); await pause(2200);
    o = S.counterOffer(debt, o); asked = true; sure = false; stage = 'offer'; ask.hidden = true; paint();
  }
  const go = cont('Next', () => onDone({ offer: { debtId: debt.id, amount: o.amount, fee: o.fee, saved: o.saved, status: stage, pct: o.pct } }));
  go.hidden = true;
  function paint() { box.replaceChildren(...body()); sync(); }
  paint();
  const el = h('div', { class: 'card' }, box, go);
  return { el, async auto(alive) {
    await pause(2600); if (!alive()) return;
    ask.click(); await pause(3400); if (!alive()) return;
    sureBtn.click(); await pause(900); if (!alive()) return;
    approve.click(); await pause(4200); if (alive()) go.click();
  } };
}

/* ---- the board: every debt and where it stands ---- */
export function boardCard(selected, deposit, offerRes, months, onDone) {
  const rows = S.board(selected, deposit, offerRes.debtId);
  const done = rows.filter((r) => r.status === 'settled').length;
  const go = cont('Continue', () => onDone({ board: true }));
  const el = h('div', { class: 'card' },
    h('div', { class: 'glance' }, h('div', { class: 'glance-t' }, 'Home stretch', h('em', null, done + ' of ' + rows.length + ' settled')),
      h('div', { class: 'rs-grid' }, h('div', { class: 'rs-stat' }, h('span', { class: 'k' }, 'You kept on the first one'), h('b', null, money(offerRes.saved)), h('small', null, 'after the settlement and our fee')), h('div', { class: 'rs-stat' }, h('span', { class: 'k' }, 'Estimated finish'), h('b', null, 'Month ' + months), h('small', null, 'an estimate, not a promise')))),
    h('div', { class: 'bd-list' }, rows.map((r) => h('div', { class: 'bd ' + r.status }, h('span', { class: 'bd-ic' }, r.status === 'settled' ? ico('check', 14, 3.4) : null), h('span', { class: 'bd-t' }, h('b', null, r.debt.name), h('em', null, money(r.debt.balance) + ' · ' + r.note)), h('i', { class: 'pill ' + (r.status === 'settled' ? 'ok' : r.status === 'next' ? 'warn' : '') }, r.label)))),
    h('p', { class: 'help' }, 'You can see every conversation about every debt in your activity feed, any time.'), go);
  return { el, async auto(alive) { await pause(4200); if (alive()) go.click(); } };
}
