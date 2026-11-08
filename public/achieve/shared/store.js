/* Achieve prototype: the per-session data model, shared by the web funnel, Messages and ChatGPT.
   Lives in the browser (localStorage) for now, shaped like the tables a real build would have:
     applicant, document, step, step_applicant (+ a small event log).
   A session ends after 30 idle minutes: its record is ignored and the experience starts over.
   Nothing here is ever sent to a server. The Social Security number is never stored, only a flag. */
import { STEPS, GROUPS, secsLeft } from './flow.js';

export const KEY = 'achieve.session.v1';
export const TTL = 30 * 60 * 1000;

const rid = (p) => p + '_' + Math.random().toString(36).slice(2, 10);

function memoryStorage() {
  const m = {};
  return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: (k) => { delete m[k]; } };
}

export function createStore(storage, clock) {
  const now = clock || (() => Date.now());
  let mem = null;
  const st = storage || memoryStorage();

  function fresh() {
    const t = now();
    const applicantId = rid('app');
    return {
      id: rid('ses'), created_at: t, last_active: t,
      applicant: { id: applicantId },
      documents: [],
      steps: STEPS.map((s, i) => ({ id: s.id, name: s.label, group: s.group, position: i, required_fields: (s.fields || []).filter((f) => !f.optional).map((f) => f.id) })),
      step_applicants: STEPS.map((s) => ({ applicant_id: applicantId, step_id: s.id, status: 'not_started', started_at: null, completed_at: null })),
      groups: GROUPS.map((g) => ({ id: g.id, name: g.title })),
      focus: null,            // the step the web funnel is on right now
      dropout: null,          // { from, to, step_id, at } when someone "falls out of the funnel"
      selected_offer: null,
      ssn_provided: false,
      events: [],
      threads: { messages: [], chatgpt: [] },
    };
  }

  function read() {
    if (mem) return mem;
    let s = null;
    try { s = JSON.parse(st.getItem(KEY) || 'null'); } catch { s = null; }
    if (!s || !s.id || now() - (s.last_active || 0) > TTL) s = fresh();
    mem = s;
    return s;
  }
  function write(s) {
    mem = s;
    try { st.setItem(KEY, JSON.stringify(s)); } catch { /* private mode: keep it in memory */ }
    return s;
  }

  const api = {
    get() { return read(); },
    /** Another tab or page may have written; drop the cache and re-read. */
    refresh() { mem = null; return read(); },
    touch() { const s = read(); s.last_active = now(); return write(s); },
    save() { const s = read(); s.last_active = now(); return write(s); },
    reset() { mem = null; try { st.removeItem(KEY); } catch { /* ignore */ } return write(fresh()); },
    expired() { let s = null; try { s = JSON.parse(st.getItem(KEY) || 'null'); } catch { s = null; } return !!(s && now() - (s.last_active || 0) > TTL); },

    applicant() { return read().applicant; },
    setApplicant(patch) { const s = read(); Object.assign(s.applicant, patch); s.applicant.updated_at = now(); return api.save(), s.applicant; },

    stepRow(id) { return read().step_applicants.find((r) => r.step_id === id); },
    status(id) { const r = api.stepRow(id); return r ? r.status : 'not_started'; },
    isDone(id) { const x = api.status(id); return x === 'complete'; },
    start(id) {
      const r = api.stepRow(id);
      if (r && r.status === 'not_started') { r.status = 'in_progress'; r.started_at = now(); }
      read().focus = id; api.save();
    },
    complete(id) {
      const r = api.stepRow(id);
      if (!r) return;
      if (!r.started_at) r.started_at = now();
      r.status = 'complete'; r.completed_at = now();
      api.log('step_complete', { step_id: id });
      api.save();
    },
    reopen(id) { const r = api.stepRow(id); if (r) { r.status = 'in_progress'; r.completed_at = null; } api.save(); },
    doneIds() { return read().step_applicants.filter((r) => r.status === 'complete').map((r) => r.step_id); },
    nextIncomplete(skipId) {
      const s = read();
      const row = s.step_applicants.find((r) => r.status !== 'complete' && r.step_id !== skipId);
      return row ? row.step_id : null;
    },
    progress() {
      const done = api.doneIds();
      const total = STEPS.length;
      return { done: done.length, total, pct: Math.round((done.length / total) * 100), secsLeft: secsLeft(done) };
    },
    groupProgress(groupId) {
      const ids = STEPS.filter((s) => s.group === groupId).map((s) => s.id);
      return { done: ids.filter((i) => api.isDone(i)).length, total: ids.length };
    },

    addDocument(type, file) {
      const s = read();
      const d = { id: rid('doc'), applicant_id: s.applicant.id, type, name: (file && file.name) || type, size: (file && file.size) || 0, status: 'received', uploaded_at: now() };
      s.documents = s.documents.filter((x) => !(x.type === type && x.status !== 'removed')).concat(d);
      api.save();
      return d;
    },
    removeDocument(type) { const s = read(); s.documents.forEach((d) => { if (d.type === type) d.status = 'removed'; }); api.save(); },
    docFor(type) { return read().documents.find((d) => d.type === type && d.status !== 'removed') || null; },

    /** Someone leaves the funnel. The other contexts read this to pick up at the same spot. */
    dropOut(from, to) {
      const s = read();
      const stepId = s.focus && !api.isDone(s.focus) ? s.focus : api.nextIncomplete();
      s.dropout = { from, to, step_id: stepId, at: now() };
      api.log('dropout', { from, to, step_id: stepId });
      return api.save(), s.dropout;
    },
    clearDropout() { read().dropout = null; api.save(); },
    thread(ctx) { return read().threads[ctx] || (read().threads[ctx] = []); },
    pushThread(ctx, msg) { api.thread(ctx).push(Object.assign({ at: now() }, msg)); api.save(); },
    clearThread(ctx) { read().threads[ctx] = []; api.save(); },
    log(type, data) { const s = read(); s.events.push(Object.assign({ type, at: now() }, data || {})); if (s.events.length > 200) s.events.shift(); },
  };
  return api;
}

function browserStorage() {
  try { const k = '__achieve_probe'; window.localStorage.setItem(k, '1'); window.localStorage.removeItem(k); return window.localStorage; } catch { return null; }
}

/** The shared store for pages. Created lazily so importing this module in Node stays side-effect free. */
let shared = null;
export function store() {
  if (!shared) shared = createStore(typeof window === 'undefined' ? null : browserStorage());
  return shared;
}
