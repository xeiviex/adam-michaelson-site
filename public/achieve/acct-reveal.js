/* Achieve debt relief prototype: points out the new "My account" option once enrollment is done.
   Sparkles burst around the button, it pops in with a glow, and a pill with an arrow slides toward it for a few seconds. */
const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" fill="currentColor"/></svg>';
const ARROW_R = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';
const ARROW_U = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V5M6 11l6-6 6 6"/></svg>';
const visible = (el) => el && !el.hidden && el.getClientRects().length > 0;

export function revealAccount(acctBtn, menuBtn, opts) {
  const o = opts || {};
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const go = () => {
    const btn = visible(acctBtn) ? acctBtn : visible(menuBtn) ? menuBtn : null; if (!btn) return;
    const r = btn.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, mobile = btn === menuBtn;
    btn.classList.add('pop'); setTimeout(() => btn.classList.remove('pop'), 4600);
    const fx = document.createElement('div'); fx.className = 'acct-fx'; fx.style.cssText = `left:${cx}px;top:${cy}px`;
    if (!reduced) for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + Math.random() * 0.4, d = 34 + Math.random() * 38, s = document.createElement('span');
      s.className = 'acct-spk'; s.innerHTML = STAR; s.style.setProperty('--dx', Math.cos(a) * d + 'px'); s.style.setProperty('--dy', Math.sin(a) * d + 'px'); s.style.animationDelay = (Math.random() * 0.5) + 's'; s.style.color = ['#ffb703', '#5a4cf0', '#ff5d8f', '#00c2a8'][i % 4];
      fx.append(s);
    }
    document.body.append(fx);
    const ar = document.createElement('div'); ar.className = 'acct-arrow' + (mobile ? ' down' : ''); ar.setAttribute('aria-hidden', 'true');
    ar.innerHTML = mobile ? ARROW_U + '<span>Your account is ready</span>' : '<span>Your account is ready</span>' + ARROW_R;
    document.body.append(ar);
    const w = ar.getBoundingClientRect();
    if (mobile) { ar.style.left = Math.max(8, Math.min(innerWidth - w.width - 8, cx - w.width / 2)) + 'px'; ar.style.top = (r.bottom + 10) + 'px'; }
    else { ar.style.left = Math.max(8, r.left - w.width - 14) + 'px'; ar.style.top = (cy - w.height / 2) + 'px'; }
    setTimeout(() => { ar.style.transition = 'opacity .5s'; ar.style.opacity = '0'; }, 4200);
    setTimeout(() => { fx.remove(); ar.remove(); }, 4900);
  };
  setTimeout(() => requestAnimationFrame(() => requestAnimationFrame(go)), o.delay == null ? 700 : o.delay);
}
