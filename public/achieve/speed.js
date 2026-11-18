/* Auto-play pace. "Fast" is the original timing. "Slow" stretches every auto-play pause so a viewer can read along.
   Stored in sessionStorage under its own key so Start over keeps the choice. */
const KEY = 'achv-speed';
export const SPEEDS = { fast: { label: 'Fast', k: 1 }, slow: { label: 'Slower', k: 2.2 } };
export const getSpeed = () => { try { const v = sessionStorage.getItem(KEY); return SPEEDS[v] ? v : 'fast'; } catch { return 'fast'; } };
export const setSpeed = (v) => { try { sessionStorage.setItem(KEY, SPEEDS[v] ? v : 'fast'); } catch { /* private mode */ } };
export const pace = (ms) => Math.round(ms * SPEEDS[getSpeed()].k);
