/* Embedded screen: a local, illustrative preview of a configurable partner module.
   All data is made up. Nothing here calls a service or collects anything. One shared state drives the preview on the slide
   and the fuller configuration lab in the details overlay. */

const PARTNERS = {
  northbeam: { name: 'Northbeam Home', brand: '#1d63c9', tag: 'Home improvement marketplace' },
  fernhill: { name: 'Fernhill Rewards', brand: '#0b7a5a', tag: 'Card and rewards app' },
};
const STEPS = [['discover', 'Details'], ['offers', 'Offers'], ['compare', 'Compare'], ['select', 'Choose'], ['handoff', 'Hand off'], ['status', 'Status']];
const OFFERS = {
  lending: { title: 'Compare lending offers', unit: 'Illustrative home equity offers', rows: [['Sample lender A', 'Est. 8.4% APR', 'Funds in 2 to 3 days', 'Offer, expires in 24h'], ['Sample lender B', 'Est. 7.9% APR', 'Funds in 2 to 3 weeks', 'Indicative terms'], ['Sample lender C', 'Est. 8.9% APR', 'Funds next business day', 'Offer, expires in 24h']] },
  insurance: { title: 'Compare auto insurance quotes', unit: 'Illustrative auto quotes', rows: [['Sample carrier A', '$118 per month', '$500 deductible', 'Quote, bindable today'], ['Sample carrier B', '$104 per month', '$1,000 deductible', 'Indicative terms'], ['Sample carrier C', '$126 per month', '$250 deductible', 'Quote, bindable today']] },
};

export const E = {
  partner: 'northbeam', vertical: 'lending', placement: 'inline', entry: 'banner', presentation: 'cards', prefill: false,
  steps: { discover: true, offers: true, compare: true, select: true, handoff: true, status: false },
};
const subs = new Set();
export const onEmbedChange = (f) => { subs.add(f); };
export function setEmbed(patch) { Object.assign(E, patch); subs.forEach((f) => f()); }
export function toggleStep(key, on) { E.steps[key] = on; subs.forEach((f) => f()); }

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let uid = 0;

function moduleHTML() {
  const p = PARTNERS[E.partner], o = OFFERS[E.vertical], st = E.steps;
  const on = STEPS.filter(([k]) => st[k]);
  const chips = on.length ? '<ol class="em-steps" aria-label="Enabled journey steps">' + on.map(([, n], i) => '<li><b>' + (i + 1) + '</b> ' + n + '</li>').join('') + '</ol>' : '<p class="em-none">No steps enabled. The module shows a link to the standard LendingTree experience.</p>';
  let body = '';
  if (st.offers || st.compare) {
    const list = o.rows.map((r) => {
      const choose = st.select ? '<span class="em-btn" aria-hidden="true">Choose</span>' : '';
      return E.presentation === 'table' || !st.compare
        ? '<tr><th scope="row">' + esc(r[0]) + '</th>' + (st.compare ? '<td>' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td>' : '') + '<td>' + esc(r[3]) + '</td><td>' + choose + '</td></tr>'
        : '<li class="em-card"><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span><span>' + esc(r[2]) + '</span><small>' + esc(r[3]) + '</small>' + choose + '</li>';
    }).join('');
    body = (E.presentation === 'table' || !st.compare)
      ? '<table class="em-table"><caption class="sr">' + esc(o.unit) + '</caption><tbody>' + list + '</tbody></table>'
      : '<ul class="em-cards" aria-label="' + esc(o.unit) + '">' + list + '</ul>';
  } else if (st.discover) body = '<p class="em-note">Collects only the details needed for the offer or quote.</p>';
  const hand = st.handoff ? '<p class="em-consent">By continuing you consent to share your details with the partner you choose. <u>Disclosures</u></p>' : '';
  const prefill = E.prefill ? '<p class="em-prefill">Prefilled from your ' + esc(p.name) + ' profile, with your consent.</p>' : '';
  const status = st.status ? '<p class="em-status">Status: application received. Updates appear here.</p>' : '';
  return '<div class="em-host" data-placement="' + E.placement + '" style="--pb:' + p.brand + '">' +
    '<div class="em-bar"><b>' + esc(p.name) + '</b><span>' + esc(p.tag) + '</span></div>' +
    '<div class="em-entry">' + ({ banner: 'Banner: See your options without leaving ' + p.name, button: 'Button: Compare offers', checkout: 'At checkout: Pay less with a better offer' }[E.entry]) + '</div>' +
    '<div class="em-mod"><div class="em-hd"><strong>' + esc(o.title) + '</strong><small>Powered by LendingTree</small></div>' + chips + prefill + body + hand + status + '</div></div>';
}

export function mountPreview(el, { controls = true } = {}) {
  const id = 'emp' + ++uid;
  el.innerHTML = (controls ? '<div class="em-ctl"><fieldset><legend>Partner brand</legend>' +
    Object.entries(PARTNERS).map(([k, v]) => '<label><input type="radio" name="' + id + 'p" value="' + k + '"> ' + esc(v.name) + '</label>').join('') + '</fieldset>' +
    '<fieldset><legend>Vertical</legend><label><input type="radio" name="' + id + 'v" value="lending"> Lending</label><label><input type="radio" name="' + id + 'v" value="insurance"> Insurance</label></fieldset></div>' : '') +
    '<div class="em-view" data-view></div>';
  const view = el.querySelector('[data-view]');
  const paint = () => {
    view.innerHTML = moduleHTML();
    el.querySelectorAll('input[type=radio]').forEach((r) => { r.checked = r.name.endsWith('p') ? r.value === E.partner : r.value === E.vertical; });
  };
  el.addEventListener('change', (e) => {
    const t = e.target; if (t.type !== 'radio') return;
    setEmbed(t.name.endsWith('p') ? { partner: t.value } : { vertical: t.value });
  });
  onEmbedChange(paint); paint();
}

export function mountLab(el) {
  const id = 'lab' + ++uid;
  const radio = (name, val, label) => '<label><input type="radio" name="' + id + name + '" data-k="' + name + '" value="' + val + '"> ' + label + '</label>';
  el.innerHTML =
    '<p class="note">Illustrative preview. Nothing is sent anywhere and all offers are made up.</p>' +
    '<div class="lab">' +
    '<form class="lab-form" onsubmit="return false"><fieldset><legend>Theme: partner brand</legend>' + Object.entries(PARTNERS).map(([k, v]) => radio('partner', k, esc(v.name))).join('') + '</fieldset>' +
    '<fieldset><legend>Vertical</legend>' + radio('vertical', 'lending', 'Lending') + radio('vertical', 'insurance', 'Insurance') + '</fieldset>' +
    '<label class="sel">Placement<select data-k="placement"><option value="inline">Inline in the page</option><option value="modal">Modal over the page</option><option value="sidebar">Sidebar</option></select></label>' +
    '<label class="sel">Entry point<select data-k="entry"><option value="banner">Banner</option><option value="button">Button</option><option value="checkout">Checkout step</option></select></label>' +
    '<fieldset><legend>Enabled steps</legend>' + STEPS.map(([k, n]) => '<label><input type="checkbox" data-step="' + k + '"> ' + n + '</label>').join('') + '</fieldset>' +
    '<fieldset><legend>Offer presentation</legend>' + radio('presentation', 'cards', 'Cards') + radio('presentation', 'table', 'Table') + '</fieldset>' +
    '<label><input type="checkbox" data-k="prefill"> Prefill, only when the shopper consents</label>' +
    '<fieldset class="locked"><legend>Enforced by LendingTree, not configurable</legend><ul><li>Consent capture and wording</li><li>Required disclosures</li><li>Offer integrity</li><li>Security and data handling</li><li>Attribution and events</li></ul></fieldset>' +
    '</form><div class="lab-out"><div data-prev></div><h4>Illustrative SDK configuration</h4><pre data-cfg tabindex="0" aria-label="Illustrative SDK configuration"></pre></div></div>';
  const prev = el.querySelector('[data-prev]'); const cfg = el.querySelector('[data-cfg]');
  mountPreview(prev, { controls: false });
  const paint = () => {
    el.querySelectorAll('[data-k]').forEach((c) => {
      const k = c.dataset.k;
      if (c.type === 'radio') c.checked = E[k] === c.value; else if (c.type === 'checkbox') c.checked = !!E[k]; else c.value = E[k];
    });
    el.querySelectorAll('[data-step]').forEach((c) => { c.checked = !!E.steps[c.dataset.step]; });
    cfg.textContent = '// Illustrative. Field names are not a final contract.\n' + JSON.stringify({
      sdk: '1.x', theme: { brand: PARTNERS[E.partner].brand, name: PARTNERS[E.partner].name }, vertical: E.vertical,
      placement: E.placement, entryPoint: E.entry, steps: STEPS.filter(([k]) => E.steps[k]).map(([k]) => k),
      prefill: { enabled: E.prefill, requires: 'shopper_consent' }, offerPresentation: E.presentation,
      lendingtreeEnforced: ['consent', 'disclosures', 'offer_integrity', 'security', 'attribution'],
    }, null, 2);
  };
  el.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.step) return toggleStep(t.dataset.step, t.checked);
    const k = t.dataset.k; if (!k) return;
    setEmbed({ [k]: t.type === 'checkbox' ? t.checked : t.value });
  });
  onEmbedChange(paint); paint();
}
