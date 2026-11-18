/* Server-side knowledge for the debt relief assistant. Used by functions/api/achieve-debt-assistant.js.
   Everything here mirrors the prototype's illustrative rules. Names, numbers and partners are fictional samples. */
export const DEBT_KNOWLEDGE = `About this prototype
- This is a prototype of a debt relief experience for Achieve, built for a case study. The people, creditors, bank, trust company and numbers are fictional samples. Say so plainly if asked whether anything is real.

How the program works
- Debt settlement: the client makes one monthly deposit into a dedicated account they own. When the fund is big enough, a negotiator asks a creditor to accept less than the full balance as a one-time settlement. The client approves or declines every settlement. Nothing is paid without their yes.
- Minimum enrolled unsecured debt is about $7,500. Debts above about $100,000 get a specialist review and are never declined for size. Secured debts such as a mortgage or car loan are not included. Typical unsecured debts: credit cards, personal loans, medical bills, collections.
- Minimum monthly deposit is $250. Programs commonly run two to four years depending on the debt and the deposit. Sample plan: $32,000 across four accounts with a $600 deposit is about 38 months and about $22,400 total. These are estimates, not promises.
- Creditors usually settle once an account is behind, often around 90 days. The first settlement offers can begin around month 3 in the sample plan.
- Settlement amounts vary. In the sample, a medical bill may settle near 40%, a credit card near 50%, a personal loan near 55%. These are illustrative.

Fees
- No fee is charged until a debt is settled, the client approves it, and the first payment to that creditor is made. The sample fee is 20% of that debt's enrolled balance. The fee comes last.

The honest downsides, say these when relevant
- Credit scores will likely fall. Stopping payments to creditors causes late payments and settled accounts on the report. Recovery takes time and varies. Never promise a score outcome.
- Creditors and collectors can keep calling and texting, and can sue. A lawsuit or legal papers are urgent: tell the client to contact their specialist right away and not to ignore them.
- Forgiven debt can be taxable income in some cases. Suggest talking to a tax professional.
- Results are not guaranteed. Creditors decide whether to settle. The client can cancel any time, and the money in their account is theirs, minus fees already earned.

The journey
- Eight stages: get started, qualify, your plan, enroll, first deposit, build your fund, settle, debt free.
- Enrollment includes a plain-language agreement, separate consents, a typed signature, linking a bank and opening a dedicated account (sample trust company: Harbor Trust Services, sample bank: Granite Harbor Bank). The client controls the account.
- The first-deposit celebration happens only after the debit clears.
- Every call with a creditor is recorded, and calls, texts, emails and letters appear in the client's activity feed.
- Graduation: a celebration, a gift box, and optional next steps in savings, credit rebuilding, investing and home readiness. Nothing is promised.

Contact
- Prototype phone for questions: (833) 435-2021.`;
