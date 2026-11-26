/* Pause auto-play while the viewer is away, and pick up again when they are back, saying so both times.
   The same behaviour as the Achieve prototype: "away" means the tab is hidden or the window has lost focus.

   watchAttention({ active, embed })
     active  returns true while auto-play is running; nothing pauses, and nothing is shown, unless it is
     embed   true inside the small previews on the slides, which never have focus: there only a hidden tab counts,
             and no notice is shown

   away()    true while the prototype should stand still. Each prototype's timer asks this on every tick. */

let held = false;            // standing still: away, or just back and saying so
let attentive = true;
let timer = 0;
let note = null;
let isActive = () => true;
let isEmbed = false;

export const away = () => document.hidden || held;

const CSS = `
.vt-away { position: fixed; left: 50%; top: 14px; transform: translateX(-50%); z-index: 500; display: flex; flex-direction: column; align-items: center; gap: 2px;
  max-width: calc(100vw - 24px); padding: 10px 18px 11px; border-radius: 12px; background: rgba(13, 27, 42, .95); color: #fff; text-align: center;
  font: 500 13px/1.35 Inter, system-ui, -apple-system, "Segoe UI", sans-serif; box-shadow: 0 10px 30px rgba(0, 0, 0, .3), 0 0 0 2px rgba(255, 255, 255, .85);
  pointer-events: none; animation: vt-away-in .28s cubic-bezier(.2, .8, .3, 1); }
.vt-away[hidden] { display: none; }
.vt-away b { font-size: 14px; font-weight: 700; }
.vt-away span { color: rgba(255, 255, 255, .86); }
@keyframes vt-away-in { from { opacity: 0; transform: translate(-50%, -8px); } to { opacity: 1; transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) { .vt-away { animation: none; } }`;

function tell(a, b) {
  if (isEmbed) return;
  if (!note) {
    const st = document.createElement('style'); st.textContent = CSS; document.head.append(st);
    note = document.createElement('div'); note.className = 'vt-away'; note.setAttribute('role', 'status'); note.setAttribute('aria-live', 'polite'); note.hidden = true;
    note.append(document.createElement('b'), document.createElement('span')); document.body.append(note);
  }
  note.firstChild.textContent = a; note.lastChild.textContent = b; note.hidden = false;
}
const hush = () => { if (note) note.hidden = true; };

const here = () => !document.hidden && (isEmbed || document.hasFocus());

function set(v) {
  if (v === attentive) return;
  attentive = v; clearTimeout(timer);
  if (!v) {
    if (!isActive()) { held = false; hush(); return; }   // the viewer is driving: there is nothing to pause
    held = true; tell('Auto-play paused', 'Come back and it will pick up right where you left off.');
    return;
  }
  if (!held) { hush(); return; }
  tell('Welcome back', 'Picking up where you left off…');
  timer = setTimeout(() => { held = false; hush(); }, isEmbed ? 0 : 900);
}

export function watchAttention({ active, embed } = {}) {
  if (active) isActive = active;
  isEmbed = !!embed;
  document.addEventListener('visibilitychange', () => set(here()));
  if (isEmbed) return;
  addEventListener('blur', () => set(false));
  addEventListener('focus', () => setTimeout(() => set(here()), 0));
}

/* Auto-play was switched off or on by hand while the notice was up: do not leave it standing. */
export function attentionReset() { clearTimeout(timer); held = false; attentive = here(); hush(); }
