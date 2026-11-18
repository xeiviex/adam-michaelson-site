/* Achieve debt relief prototype: the account area UI. Left nav on desktop, a hamburger sheet on mobile.
   createAccount(api) returns { open(section), close(), openSheet(), isOpen() }. api: { state, ctx(), save(), pct(), onOpen(), onClose() } */
import { h, ico } from './firsttake/shared/dom.js';
import { money } from './firsttake/shared/flow.js';
import * as A from './account.js';

export function createAccount(api) {
  const { state } = api;
  let current = 'overview', view = null, main = null, nav = null, sheet = null, open = false, filter = { tx: 'all', act: 'all' }, timer = 0;
  const ctx = () => api.ctx();
  const stamp = () => { A.clearPending(state); api.save(); };
  const toast = (msg) => { const t = h('div', { class: 'av-toast', role: 'status' }, msg); document.body.append(t); requestAnimationFrame(() => t.classList.add('on')); setTimeout(() => { t.classList.remove('on'); setTimeout(() => t.remove(), 300); }, 2600); };
  const card = (title, ...kids) => h('section', { class: 'av-card' }, title ? h('h3', null, title) : null, ...kids);
  const row = (k, v) => h('div', { class: 'av-row' }, h('span', null, k), h('b', null, v));
  const btn = (txt, fn, cls) => h('button', { type: 'button', class: 'btn ' + (cls || ''), onclick: fn }, txt);
  const chips = (items, cur, set) => h('div', { class: 'av-chips', role: 'group' }, items.map(([id, label]) => h('button', { type: 'button', class: 'av-chip' + (cur === id ? ' on' : ''), 'aria-pressed': String(cur === id), onclick: () => set(id) }, label)));
  const dl = (name, text) => { const a = h('a', { href: URL.createObjectURL(new Blob([text], { type: 'text/plain' })), download: name.replace(/[^A-Za-z0-9]+/g, '_') + '.txt' }); document.body.append(a); a.click(); a.remove(); };
  const go = (id) => { current = id; if (history.replaceState) history.replaceState(null, '', '#account/' + id); paint(); main.scrollTop = 0; closeSheet(); };

  const ghostCard = (title, text, labels) => h('section', { class: 'av-card ghost' }, h('h3', null, title), h('p', { class: 'help' }, text), ...(labels || []).map((l) => h('div', { class: 'av-row' }, h('span', null, l), h('i', { class: 'ghost-bar', 'aria-hidden': 'true' }))));

  /* ---- overview ---- */
  function overview() {
    const c = ctx(), tx = A.transactions(state, c), bal = A.balance(tx), pend = A.pending(tx), acts = A.activity(state, c).slice(0, 4), urgent = A.reports(state, c).filter((r) => r.urgent);
    const dr = (state.e && state.e.draft) || {}, nextDay = dr.day || 15, nd = new Date(); if (nd.getDate() >= nextDay) nd.setMonth(nd.getMonth() + 1); nd.setDate(nextDay);
    const ded = A.hasDedicated(state), planned = (state.stageDone || []).includes('consult');
    const el = h('div', { class: 'av-grid' });
    if (urgent.length) el.append(h('div', { class: 'reassure urgent av-wide' }, A.URGENT_TEXT));
    el.append(
      !ded ? ghostCard('Dedicated account', 'Opens when you sign your agreement. Your balance and every transaction will show here.', ['Account', 'Balance']) : card('Dedicated account', h('div', { class: 'av-bal' }, money(bal), h('small', null, pend ? ' + ' + money(Math.abs(pend)) + ' pending' : ' balance')), row('Account', '••3318 · FDIC-insured'), h('div', { class: 'av-actions' }, btn('Add money', () => { filter.xfer = 'in'; go('bank'); }), btn('See transactions', () => go('bank'), 'line'))),
      card('Your program', h('div', { class: 'av-pct' }, h('b', null, api.pct() + '%'), ' of the way'), h('div', { class: 'rbar' }, h('i', { style: 'width:' + api.pct() + '%' })), row('Monthly deposit', planned ? money(c.deposit) : 'Set in your plan'), row('Next draft', ded ? nd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' from ' + c.bankName + ' ••' + c.last4 : 'After you enroll')),
      card('Do something', h('div', { class: 'av-actions col' }, btn('Report a contact from a creditor', () => { filter.report = true; go('contacts'); }, 'line'), btn('Upload a document', () => go('documents'), 'line'), btn('Report another debt', () => { filter.plan = 'debt'; go('profile'); }, 'line'), btn('Change monthly deposit', () => { filter.plan = 'deposit'; go('profile'); }, 'line'), btn('Update my details', () => go('profile'), 'line'))),
      h('section', { class: 'av-card av-wide' }, h('h3', null, 'Recent activity'), acts.length ? acts.map(actRow) : h('p', { class: 'help' }, 'Nothing yet.'), btn('See all activity', () => go('activity'), 'line sm')));
    return el;
  }

  /* ---- bank and transfers ---- */
  function bank() {
    if (!A.hasDedicated(state)) return h('div', { class: 'av-grid two' }, ghostCard('Dedicated account', 'Opens when you sign your agreement. It is an FDIC-insured account in your name, run by an independent administrator.', ['Account', 'In the name of', 'Balance']), ghostCard('Linked bank', 'You link the bank your deposits come from when you enroll.', ['Bank', 'Monthly deposit', 'Draft day']), ghostCard('Transactions', 'Deposits, settlement payments and fees will be listed here, with a statement you can download.', []));
    const c = ctx(), tx = A.transactions(state, c), bal = A.balance(tx), pend = A.pending(tx), bankLabel = c.bankName + ' ••' + c.last4;
    const dr = (state.e && state.e.draft) || {};
    let kind = filter.xfer || 'in'; filter.xfer = null;
    const amt = h('input', { class: 'inp', inputmode: 'numeric', placeholder: '$0', 'aria-label': 'Amount' }), err = h('p', { class: 'help av-err', hidden: true });
    amt.addEventListener('input', () => { const d = Number(amt.value.replace(/\D/g, '')); amt.value = d ? '$' + d.toLocaleString('en-US') : ''; });
    const kinds = h('div', { class: 'av-chips' });
    const fromTo = h('div', { class: 'av-ft' }); const note = h('p', { class: 'help' });
    const paintKind = () => { kinds.replaceChildren(...[['in', 'Add money'], ['out', 'Withdraw']].map(([id, l]) => h('button', { type: 'button', class: 'av-chip' + (kind === id ? ' on' : ''), 'aria-pressed': String(kind === id), onclick: () => { kind = id; err.hidden = true; paintKind(); } }, l)));
      fromTo.replaceChildren(row('From', kind === 'in' ? bankLabel : 'Dedicated account ••3318'), row('To', kind === 'in' ? 'Dedicated account ••3318' : bankLabel)); note.textContent = kind === 'in' ? 'Extra deposits go straight into your fund and can bring your finish date closer. Bank transfers usually take one to three business days.' : A.withdrawNote; };
    paintKind();
    const send = btn('Review and send', () => {
      const r = A.transfer(state, c, kind, amt.value.replace(/\D/g, ''), bankLabel);
      if (!r.ok) { err.textContent = r.error; err.hidden = false; return; }
      api.save(); toast((kind === 'in' ? 'Sent ' : 'Withdrawal requested: ') + money(Math.abs(r.txn.amt)) + '. It shows as pending until it clears.'); paint(); clearTimeout(timer); timer = setTimeout(() => { stamp(); if (open && current === 'bank') paint(); }, 4200);
    });
    const kindsOf = { all: () => true, deposit: (t) => t.kind === 'deposit', payment: (t) => t.kind === 'payment', fee: (t) => t.kind === 'fee' || t.kind === 'withdrawal' };
    const shown = tx.filter(kindsOf[filter.tx] || kindsOf.all);
    return h('div', { class: 'av-grid two' },
      card('Dedicated account', h('div', { class: 'av-bal' }, money(bal), h('small', null, pend ? ' + ' + money(Math.abs(pend)) + ' pending' : ' balance')), row('Account', '••3318 · FDIC-insured'), row('In the name of', ((state.applicant && state.applicant.first) || '') + ' ' + ((state.applicant && state.applicant.last) || ''))),
      card('Linked bank', row('Bank', bankLabel), row('Monthly deposit', money(c.deposit) + (dr.freq ? ', ' + dr.freq : '')), row('Draft day', dr.day ? 'The ' + dr.day + 'th' : 'The 15th'), h('p', { class: 'help' }, 'To change your bank or your draft date, call your specialist at (833) 435-2021.')),
      h('section', { class: 'av-card av-wide' }, h('h3', null, 'Make a transfer'), kinds, fromTo, h('div', { class: 'field' }, h('label', null, 'Amount'), amt), err, note, send),
      h('section', { class: 'av-card av-wide' }, h('h3', null, 'Transactions'), chips([['all', 'All'], ['deposit', 'Deposits'], ['payment', 'Payments'], ['fee', 'Fees and withdrawals']], filter.tx, (id) => { filter.tx = id; paint(); }),
        shown.length ? h('div', { class: 'txn-list av-tx' }, shown.map((t) => h('div', { class: 'txn' }, h('span', null, h('b', null, t.desc), h('em', null, A.when(t.ts) + ' · ' + t.status)), h('b', { class: t.amt > 0 ? 'pos' : 'neg' }, (t.amt > 0 ? '+' : '-') + money(Math.abs(t.amt)))))) : h('p', { class: 'help' }, 'No transactions yet.'),
        h('div', { class: 'av-actions' }, btn('Download statement', () => dl('Statement', 'Dedicated account ••3318\n\n' + tx.map((t) => A.when(t.ts) + '  ' + t.desc + '  ' + (t.amt > 0 ? '+' : '-') + money(Math.abs(t.amt)) + '  ' + t.status).join('\n') + '\n\nBalance: ' + money(bal)), 'line sm'))));
  }

  /* ---- keepsakes ---- */
  const getFile = (href, name) => { const a = h('a', { href, download: name }); document.body.append(a); a.click(); a.remove(); };
  function keepsakes() {
    const items = A.keepsakes(state);
    return h('div', { class: 'av-stack' }, card('', h('p', { class: 'help' }, 'The fun things we made along the way. Each one unlocks at its moment, and you can keep them.')),
      ...items.map((k) => {
        if (!k.on) return card(k.title, h('p', { class: 'help' }, k.blurb), h('p', { class: 'av-lock' }, k.lock));
        const media = k.kind === 'audio' ? h('audio', { controls: '', preload: 'none', src: k.src, class: 'av-aud' })
          : k.kind === 'video' ? h('video', { controls: '', preload: 'none', playsinline: '', poster: k.poster, src: k.src, class: 'av-vid' })
          : h('div', { class: 'av-thumbs' }, k.files.map(([lbl, src]) => h('figure', null, h('img', { src, alt: lbl, loading: 'lazy' }), h('figcaption', null, lbl), btn('Download', () => getFile(src, k.slug + '_Summit_' + lbl.replace(/[^A-Za-z0-9]+/g, '') + '.jpg'), 'line sm'))));
        return card(k.title, h('p', { class: 'help' }, k.blurb), media, k.kind === 'images' ? null : h('div', { class: 'av-actions' }, btn(k.label, () => getFile(k.src, k.file), 'line')));
      }));
  }

  /* ---- documents ---- */
  function documents() {
    const c = ctx(), docs = A.documents(state, c);
    const file = h('input', { type: 'file', hidden: true, 'aria-label': 'Choose a file' });
    file.addEventListener('change', () => { const f = file.files[0]; if (!f) return; A.addDocument(state, f.name, f.size); api.save(); toast('Uploaded ' + f.name); paint(); });
    return h('div', { class: 'av-stack' },
      card('Your documents', h('p', { class: 'help' }, 'Everything you have signed, uploaded or been sent, in one place.'), h('div', { class: 'av-actions' }, btn('Upload a document', () => file.click()), file)),
      docs.length ? h('div', { class: 'av-docs' }, docs.map((d) => { const pv = h('pre', { class: 'av-pv', hidden: true }, d.text);
        return h('div', { class: 'av-doc' }, h('div', { class: 'av-doc-h' }, h('span', { class: 'av-ic' }, ico('file', 18)), h('span', { class: 'av-doc-t' }, h('b', null, d.name), h('em', null, d.by + ' · ' + A.when(d.ts))), h('span', { class: 'av-doc-a' }, btn('View', () => { pv.hidden = !pv.hidden; }, 'line sm'), btn('Download', () => dl(d.name, d.text), 'line sm'))), pv); })) : h('p', { class: 'help' }, 'No documents yet.'));
  }

  /* ---- profile ---- */
  function profile() {
    const c = ctx(), p = A.profile(state, c), ap = state.applicant || {};
    const edit = h('div', { class: 'av-edit', hidden: true }), editBtn = btn('Edit contact details', () => { edit.hidden = !edit.hidden; }, 'line sm');
    const inputs = {}, errs = h('p', { class: 'help av-err', hidden: true });
    A.EDITABLE.forEach((f) => { inputs[f.id] = h('input', { class: 'inp', type: f.type === 'tel' ? 'tel' : f.type, value: ap[f.id] || '', 'aria-label': f.label }); edit.append(h('div', { class: 'field' }, h('label', null, f.label), inputs[f.id])); });
    edit.append(errs, btn('Save changes', () => {
      const patch = {}; for (const f of A.EDITABLE) { const v = inputs[f.id].value.trim(); if (!A.validField(f.id, v)) { errs.textContent = 'Check your ' + f.label.toLowerCase() + '.'; errs.hidden = false; return; } patch[f.id] = v; }
      const ch = A.saveProfile(state, patch); api.save(); toast(ch.length ? 'Saved' : 'Nothing changed'); paint();
    }));
    /* changes to the plan: report another debt, change the monthly deposit */
    const dForm = h('div', { class: 'av-edit', hidden: true }), dErr = h('p', { class: 'help av-err', hidden: true });
    const dName = h('input', { class: 'inp', type: 'text', placeholder: 'Who is it with? (for example, Harbor Card)', 'aria-label': 'Creditor name' });
    const dBal = h('input', { class: 'inp', type: 'number', inputmode: 'numeric', min: String(A.MIN_DEBT), placeholder: 'Balance in dollars', 'aria-label': 'Balance' });
    dForm.append(h('div', { class: 'field' }, h('label', null, 'Creditor'), dName), h('div', { class: 'field' }, h('label', null, 'Balance'), dBal), dErr,
      btn('Add this debt', () => { if (!A.validDebt(dName.value, dBal.value)) { dErr.textContent = 'Enter who it is with and the balance.'; dErr.hidden = false; return; } A.addDebt(state, dName.value, dBal.value); api.save(); toast('Added. Your specialist will review it and tell you if your plan changes.'); paint(); }));
    const mForm = h('div', { class: 'av-edit', hidden: true }), mErr = h('p', { class: 'help av-err', hidden: true });
    const mAmt = h('input', { class: 'inp', type: 'number', inputmode: 'numeric', min: String(A.MIN_DEPOSIT), value: String(c.deposit || ''), 'aria-label': 'New monthly deposit' });
    mForm.append(h('div', { class: 'field' }, h('label', null, 'New monthly deposit'), mAmt), h('p', { class: 'help' }, 'The minimum is ' + '$' + A.MIN_DEPOSIT + '. A bigger deposit builds your fund faster. The change starts with your next draft.'), mErr,
      btn('Save deposit', () => { if (!A.validDeposit(mAmt.value)) { mErr.textContent = 'Enter an amount of at least $' + A.MIN_DEPOSIT + '.'; mErr.hidden = false; return; } A.setDeposit(state, mAmt.value); api.save(); toast('Updated. Your new deposit starts with your next draft.'); paint(); }));
    const planActs = h('div', { class: 'av-actions' }, ...((state.stageDone || []).includes('consult') ? [btn('Change monthly deposit', () => { mForm.hidden = !mForm.hidden; dForm.hidden = true; }, 'line sm')] : []), btn('Report another debt', () => { dForm.hidden = !dForm.hidden; mForm.hidden = true; }, 'line sm'));
    if (filter.plan === 'deposit') mForm.hidden = false; else if (filter.plan === 'debt') dForm.hidden = false; filter.plan = null;
    return h('div', { class: 'av-grid two' },
      card('Contact', p.contact.map(([k, v]) => row(k, v)), editBtn, edit),
      card('Your plan', p.money.map(([k, v]) => row(k, v)), row('Agreement', p.consents), planActs, mForm, dForm),
      h('section', { class: 'av-card av-wide' }, h('h3', null, 'Debts in your program'), p.debts.length ? p.debts.map(([k, v]) => row(k, v)) : h('p', { class: 'help' }, 'None listed.')));
  }

  /* ---- contact reports ---- */
  function contacts() {
    const c = ctx(), list = A.reports(state, c), debts = c.debts || [];
    const who = h('select', { class: 'inp', 'aria-label': 'Who contacted you' }, h('option', { value: '' }, 'Who contacted you?'), debts.map((d) => h('option', { value: d.id }, d.name)), h('option', { value: 'other' }, 'Someone else'));
    const how = h('select', { class: 'inp', 'aria-label': 'How' }, h('option', { value: '' }, 'How?'), ['call', 'voicemail', 'text', 'email', 'letter', 'legal'].map((id) => h('option', { value: id }, A.how(id))));
    const text = h('textarea', { class: 'inp note', rows: 3, placeholder: 'Paste the message, or tell us what they said (optional)', 'aria-label': 'What they said' });
    const shot = h('input', { type: 'file', 'aria-label': 'Attach a screenshot', accept: 'image/*' }), msg = h('div', { class: 'reassure', hidden: true });
    const form = h('div', { class: 'av-form', hidden: !filter.report }, h('div', { class: 'field' }, who), h('div', { class: 'field' }, how), text, h('div', { class: 'field' }, h('label', null, 'Screenshot (optional)'), shot),
      btn('Log it', () => {
        if (!who.value || !how.value) { msg.hidden = false; msg.classList.remove('urgent'); msg.textContent = 'Choose who contacted you and how.'; return; }
        const e = { who: who.value, how: how.value, text: text.value.trim(), shot: !!(shot.files && shot.files[0]) }; e.urgent = how.value === 'legal' || /summons|sue|suing|lawsuit|court|garnish|served/i.test(e.text);
        A.addReport(state, e); A.recordEvent(state, 'you', 'Reported contact from ' + A.nameOf(debts, e.who), A.how(e.how) + (e.urgent ? ' · urgent' : '')); if (e.shot) A.addDocument(state, shot.files[0].name, shot.files[0].size);
        api.save(); filter.report = false; toast(e.urgent ? A.URGENT_TEXT : 'Logged. Thank you for telling us.'); paint();
      }), msg);
    filter.report = false;
    return h('div', { class: 'av-stack' },
      card('Contact from creditors', h('p', { class: 'help' }, 'Creditors may call, text or write. It is common, and we want to know about every call, voicemail, text, email and letter.'), h('div', { class: 'av-actions' }, btn('Report a contact', () => { form.hidden = !form.hidden; }), btn('Call my specialist', () => { location.href = 'tel:+18334352021'; }, 'line')), form),
      h('section', { class: 'av-card' }, h('h3', null, list.length + (list.length === 1 ? ' report' : ' reports')), list.length ? list.map((r) => h('div', { class: 'av-rep' + (r.urgent ? ' urgent' : '') }, h('b', null, r.name + ' · ' + r.howLabel), h('em', null, A.when(r.ts) + (r.urgent ? ' · urgent' : '')), r.text ? h('span', null, r.text) : null, r.shot ? h('i', { class: 'av-tag' }, 'Screenshot attached') : null)) : h('p', { class: 'help' }, 'Nothing reported yet. If anyone contacts you, log it here and we will tell you what it means.')));
  }

  /* ---- activity ---- */
  const actRow = (e) => h('div', { class: 'av-act' }, h('span', { class: 'av-who ' + e.who, 'aria-hidden': 'true' }, e.who === 'you' ? 'You' : 'A'), h('span', { class: 'av-act-t' }, h('b', null, e.title), e.detail ? h('em', null, e.detail) : null, h('small', null, (e.who === 'you' ? 'You' : 'Achieve') + ' · ' + A.when(e.ts))));
  function activity() {
    const all = A.activity(state, ctx()), shown = all.filter((e) => filter.act === 'all' || e.who === filter.act);
    const groups = []; shown.forEach((e) => { const d = A.day(e.ts); let g = groups.find((x) => x.d === d); if (!g) groups.push((g = { d, items: [] })); g.items.push(e); });
    return h('div', { class: 'av-stack' }, h('section', { class: 'av-card' }, h('h3', null, 'Everything you and Achieve have done'), chips([['all', 'All'], ['you', 'What I did'], ['achieve', 'What Achieve did']], filter.act, (id) => { filter.act = id; paint(); }),
      groups.length ? groups.map((g) => h('div', { class: 'av-day' }, h('h4', null, g.d), g.items.map(actRow))) : h('p', { class: 'help' }, 'Nothing here yet.')));
  }

  const RENDER = { overview, bank, documents, keepsakes, profile, contacts, activity };
  const TITLES = { overview: 'Overview', bank: 'Bank and transfers', documents: 'Documents', keepsakes: 'Keepsakes', profile: 'Profile', contacts: 'Contact reports', activity: 'Activity' };
  function paint() {
    if (!view) return;
    stamp();
    nav.querySelectorAll('button[data-s]').forEach((b) => { const on = b.dataset.s === current; b.classList.toggle('on', on); if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    $title.textContent = TITLES[current];
    main.replaceChildren(RENDER[current]());
  }
  let $title = null;
  function build() {
    nav = h('nav', { class: 'av-nav', 'aria-label': 'My account' }, h('button', { type: 'button', class: 'av-back', onclick: close }, ico('chevR', 16, 2.4), 'Back to my journey'), h('div', { class: 'av-nav-t' }, 'My account'),
      A.SECTIONS.map((s) => h('button', { type: 'button', 'data-s': s.id, onclick: () => go(s.id) }, ico(s.ic, 18), s.label)));
    $title = h('h1', null, '');
    main = h('div', { class: 'av-main', id: 'avMain' });
    const top = h('div', { class: 'av-top' }, h('button', { type: 'button', class: 'av-hb', 'aria-label': 'Menu', onclick: openSheet }, ico('menu', 22)), $title);
    view = h('section', { class: 'av', id: 'acctView', 'aria-label': 'My account', hidden: true }, nav, h('div', { class: 'av-col' }, top, main));
    document.body.append(view);
    sheet = h('div', { class: 'av-sheet', hidden: true }, h('div', { class: 'av-scrim', onclick: closeSheet }), h('div', { class: 'av-sheet-in', role: 'dialog', 'aria-label': 'Menu' },
      h('button', { type: 'button', onclick: () => { closeSheet(); close(); } }, ico('chevR', 16, 2.4), 'My journey'), A.SECTIONS.map((s) => h('button', { type: 'button', onclick: () => { openSection(s.id); } }, ico(s.ic, 18), s.label))));
    document.body.append(sheet);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (!sheet.hidden) closeSheet(); else if (open) close(); } });
  }
  function openSection(id) { if (!open) { open = true; view.hidden = false; document.body.classList.add('acct-open'); api.onOpen && api.onOpen(); } current = A.sectionById(id).id; if (history.replaceState) history.replaceState(null, '', '#account/' + current); closeSheet(); paint(); main.scrollTop = 0; }
  function close() { if (!open) return; open = false; view.hidden = true; document.body.classList.remove('acct-open'); if (history.replaceState) history.replaceState(null, '', location.pathname + location.search); api.onClose && api.onClose(); }
  function openSheet() { sheet.hidden = false; }
  function closeSheet() { if (sheet) sheet.hidden = true; }
  build();
  return { open: openSection, close, openSheet, isOpen: () => open, repaint: () => { if (open) paint(); } };
}
