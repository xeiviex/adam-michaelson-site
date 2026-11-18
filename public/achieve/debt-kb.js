/* Achieve debt relief prototype: offline answers for the assistant dock. Slice 1 only.
   Plain, honest statements that match the disclosures a debt settlement program must make. A later slice
   routes questions to the Claude assistant with this knowledge as its server-side context. */
const QA = [
  [/credit|score/, 'Yes, your credit score will likely drop. Settlement programs ask you to stop paying creditors, and late payments and settled accounts show on your report. Many people are already behind and see the score fall further before it recovers. Your specialist will walk through what to expect before you decide anything.'],
  [/fee|cost|price|charge|how much.*pay/, 'You pay no fee until a debt is settled, you approve the settlement, and the first payment to that creditor is made. The fee is a percentage of the debt enrolled for that account. Your specialist will show the exact numbers for your debts before you sign.'],
  [/call|text|harass|collector|threat/, 'Expect calls and texts from creditors. That is normal, and you do not have to answer them. Later you can log every contact with us, and we will tell you what it means and what to do next. If anyone threatens a lawsuit or sends legal papers, tell us right away.'],
  [/how long|months|timeline|years/, 'Most programs run two to four years, and it depends on how much you owe and how much you can deposit each month. The first settlement often comes in the first several months. Your plan will show a timeline built from your own numbers, and it is an estimate, not a promise.'],
  [/qualif|eligible|minimum|7,?500/, 'Programs generally need about $7,500 or more in unsecured debt, a hardship that makes the payments hard, and the ability to make a monthly deposit. Secured debts like a mortgage or car loan are not included.'],
  [/cancel|quit|leave|stop/, 'You can cancel at any time. The money in your account is yours, and it is returned to you minus any fees already earned.'],
  [/guarantee|promise|sure/, 'Nobody can guarantee a result. Creditors decide whether to settle. What we can promise is to explain each step, show you every offer, and let you approve or decline each settlement.'],
  [/human|person|talk|call me|specialist/, 'A specialist can walk through this with you. In this demo, the plan stage is where that conversation happens.'],
];
export const FALLBACK = "Good question. I don't have a confident answer here. A specialist can answer it on your plan call, or you can reach us at (833) 435-2021.";
export function localAnswer(text) {
  const t = String(text || '').toLowerCase();
  const hit = QA.find(([re]) => re.test(t));
  return hit ? hit[1] : null;
}
export const SUGGESTIONS = ['Will this hurt my credit?', 'What does it cost?', 'Can I stop the calls?', 'How long does it take?'];
