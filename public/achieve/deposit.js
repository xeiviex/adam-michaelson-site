/* Achieve debt relief prototype, stage 5: the first deposit. Pure data and rules, no DOM.
   The client signs in, sends the first deposit from their own bank into their dedicated account, and the moment it
   clears we celebrate. Also here: the creditor-outreach log, with the reassurance that goes with it.
   The song is an original template filled from the client's story; no audio is generated in this prototype. */
import { money } from './firsttake/shared/flow.js';

export const D_STEPS = ['login', 'deposit', 'celebrate', 'outreach'];
export const nextDStep = (ddone) => D_STEPS.find((s) => !ddone.includes(s)) || null;
export const dStepLabel = (id) => ({ login: 'Your account', deposit: 'First deposit', celebrate: 'Celebrate', outreach: 'Creditor contact' }[id]);

/* An ACH transfer in three steps. Real ones take one to three business days; the demo runs them in seconds. */
export const ACH = [
  { id: 'init', t: 'Sent from your bank', d: 'Your bank has the request.' },
  { id: 'proc', t: 'On its way', d: 'Usually 1 to 3 business days.' },
  { id: 'clear', t: 'Cleared in your account', d: 'The money is yours, in your account.' },
];

export function txns(deposit) {
  return deposit && deposit.cleared ? [{ id: 'd1', date: deposit.date, desc: 'Deposit from ' + deposit.bank, amt: deposit.amount, status: 'Cleared' }] : [];
}
export const balance = (deposit) => (deposit && deposit.cleared ? deposit.amount : 0);

/* The song. Original lines, short, filled from what the client told us. */
export function song(s) {
  const first = s.first || 'friend';
  const goalLine = { calls: 'The phone can ring, I know my way', total: 'I owe a lot less than I used to say', time: 'Month by month I count the days', nobk: 'No court, no fear, I found my way' }[s.goal] || 'Month by month I count the days';
  return {
    title: first + "'s Fresh Start",
    lines: [
      'Verse one: ' + first + ' took a breath and took a stand,',
      'A first small step with a steady hand.',
      goalLine + ',',
      'Every deposit lights the way.',
      'Chorus: Oh, ' + first + ', you did the hardest part,',
      'You opened the door and you made your start.',
      'The weight gets lighter, the road gets clear,',
      'Freedom is near, freedom is near.',
    ],
    note: 'Prototype: this is the lyric sheet. A real version would be sung from your story.',
  };
}

/* Creditor outreach. Every contact is logged, and every one gets a calm, true reply. */
export const METHODS = [
  { id: 'call', label: 'A phone call', ic: 'phone' },
  { id: 'voicemail', label: 'A voicemail', ic: 'speaker' },
  { id: 'text', label: 'A text', ic: 'chat' },
  { id: 'email', label: 'An email', ic: 'file' },
  { id: 'letter', label: 'A letter', ic: 'clip' },
  { id: 'legal', label: 'Legal papers or a summons', ic: 'info' },
];
const LEGAL = /summons|sue|suing|lawsuit|court|garnish|served/i;
export const isUrgent = (e) => e.how === 'legal' || LEGAL.test(e.text || '');
export function outreachReply(e) {
  if (isUrgent(e)) return { urgent: true, text: 'Thank you for telling us right away. Legal papers have deadlines, so a specialist is calling you today. Do not ignore them, and keep the papers safe. We will walk through this together.' };
  const by = {
    call: 'Calls like this are completely normal. You did the right thing by not engaging, and by telling us. Keep it up.',
    voicemail: 'Voicemails like this are normal at this stage. You do not need to call back. We saved it, and you can keep going.',
    text: 'Texts like this are normal, and you do not have to answer. We logged it. This is part of the plan.',
    email: 'Emails like this are normal. You can leave it unanswered. We logged it with the rest.',
    letter: 'Letters like this are normal. Keep it, add a photo here if you like, and carry on. You are doing great.',
  };
  return { urgent: false, text: by[e.how] || 'Thank you for logging this. It is normal, and it is part of the plan.' };
}
export const OUTREACH_OPEN = 'Have any creditors contacted you since you enrolled? It is common, and we want to know about every call, voicemail, text, email and letter.';

export const PERSONA_D = {
  amount: 600,
  outreach: { who: 't1', how: 'voicemail', text: 'Voicemail from Summit Bank about the past-due balance on the Visa. Said to call back today.' },
};
export { money };
