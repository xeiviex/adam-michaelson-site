/* Achieve prototype: what the assistant knows.
   Used two ways: as the system-prompt knowledge for /api/achieve-assistant (Claude), and as an offline
   fallback so the prototype still answers when the API is unreachable.
   Sources: the Achieve application flow Adam captured, achieve.com and Achieve's FAQ as summarized by search,
   and third-party reviews. Figures marked "reported" vary by source; the prototype's own offers are samples. */

export const COMPANY = `Achieve (achieve.com) is a digital personal finance company. Its products: personal loans (including debt consolidation and credit card refinancing, formerly FreedomPlus), a fixed-rate home equity line of credit (HELOC, also called a home equity loan on its site), and Achieve Debt Relief / Achieve Resolution, a debt settlement program (formerly Freedom Debt Relief). Its pages cite 450K+ members served, $7.5 billion+ in loans to members, and a 4.8 out of 5 Trustpilot score. Loans are made by Achieve's lending partners; the application discloses Cross River Bank, Delaware Branch.
The brand voice is reassuring and plain: free to check, no obligation, "won't affect your credit score", no shame about debt, short sentences. Consultants are available at 833-598-0058 (Monday-Thursday 6 am-8 pm MST, Friday 6 am-7 pm MST, Saturday-Sunday 7 am-4 pm MST). The main number on the application is (833) 435-2021.`;

export const FLOW = `The application flow, in order (each step shows "About N mins left"):
1. Loan amount: a slider from $5,000 to $50K+ (default $20,000). Perks: check your rate in 5 minutes, no prepayment penalty, funds in as little as 24-72 hours.
2. Loan purpose: Credit Card Refinancing, Debt Consolidation, Home Improvement, Major Purchase, or Other.
3. Individual annual income (before taxes, including wages, bonuses, commissions and other income), with an optional co-applicant income.
4. Name and date of birth. "Viewing your rate won't affect your credit score."
5. Home address, used to confirm it is really you.
6. Contact info: mobile phone, with consent to calls and texts.
7. Email, the last step to see an offer. Checking your rate uses a soft credit pull that does not affect your score.
8. Home and address details: housing situation (own with mortgage, own free and clear, rent, other) and monthly housing payment.
9. Work and income: employer and employment type.
10. "Boost your chances": how much of the loan will pay off credit cards and loans, current retirement savings (assets must be verifiable; retirement assets are not collateral), and an optional co-applicant. Filling this in may qualify you for extra interest-rate savings.
11. Review: every answer is shown with an edit control. Eligibility: 18+, a US citizen and/or permanent resident, and a verifiable bank account.
12. Verification: Social Security number ("Your data is safe and encrypted") and consent for a credit report pull; tapping Proceed submits the application.
13. Documents: Achieve asks for a recent paystub to verify income, and may also ask for proof of identity, proof of address, W-2 or tax forms, a bank statement or voided check, a retirement statement, an award letter (divorce decree, disability), or other documents.
14. Offers: options to review, compare and choose. After submission Achieve reviews documents and reaches out within 2-3 business days.`;

export const FAQ = [
  { k: /\b(soft|hard) (credit )?(pull|check|inquiry)|\baffect (my )?(credit )?score|\bcredit score (impact|hurt)|\bhurt (my )?(credit|score)|\b(ding|lower) (my )?(credit|score)|\bcredit check\b|\bimpact (my )?(credit|score)/i,
    a: "Checking your rate uses a soft credit pull, which doesn't affect your credit score. If you decide to move forward with a loan, Achieve runs a hard credit pull at that point, which can have a small, temporary effect on your score." },
  { k: /\b(minimum|min|required|need|what) (a )?credit score|\bcredit score (do i|to) (need|qualify)|\bbad credit|\bfair credit|\bqualify|\bapproval odds/i,
    a: "Achieve looks at your whole picture: credit history, income, and what you owe. Published minimums vary by product and source (roughly the 560 to 660 range is reported), and larger loans usually need a higher score. Checking your rate is free and won't affect your score, so it's the easiest way to find out." },
  { k: /\bhow (long|fast|quick)|\bwhen (do|will) i (get|receive)|\bfunding\b|\bfunds (in|by)|\bget (the )?money/i,
    a: "Achieve says funds can arrive in as little as 24-72 hours for a personal loan after you're approved and your documents are verified. A HELOC takes longer, usually around 10 to 14 days or more, because your home has to be valued." },
  { k: /\b(fees?|origination|costs?|charges?|prepay\w*)\b/i,
    a: "Personal loans have an origination fee that's taken from the loan amount (reported as roughly 2% to 10% depending on credit), and there's no prepayment penalty, so you can pay early and save interest. Your offers show the exact fee in dollars before you choose." },
  { k: /\b(apr|interest rate|rates?)\b/i,
    a: "Your rate depends on your credit profile, income, loan amount and term. Reviews report personal loan APRs from the high single digits up to about 36%, and HELOC rates starting around 5.5%. The offers you'll see here are samples; real offers show a fixed APR before you commit." },
  { k: /document|paystub|pay stub|w-?2|upload|proof of|verify (my )?income|what (do|should) i (need|send|provide)/i,
    a: "Typically a recent paystub to verify income, plus proof of identity (driver's license, passport or military ID) and proof of address (lease, property tax bill or homeowner insurance). A bank statement or voided check, W-2 or tax forms can help too. You can upload now, or text yourself a secure link and do it from your phone." },
  { k: /\b(ssn|social security|safe|secure|encrypt\w*|privacy|protect)\b|\bwhy (do you|are you) (need|ask)/i,
    a: "Your Social Security number is used to check your credit and confirm it's really you. It's encrypted, and it's never asked for over text or chat; you only enter it on the secure verification step. (In this prototype nothing is sent anywhere and your SSN isn't stored.)" },
  { k: /\b(heloc|home equity|line of credit|loc)\b/i,
    a: "A HELOC (home equity line of credit) uses your home as collateral, so it usually has the lowest rate and payment, but it takes longer to fund and your home is at risk if you can't repay. Achieve's HELOC is fixed-rate. A line of credit lets you borrow as needed and pay interest only on what you use, with a rate that can change. A personal loan is unsecured and gives you the full amount upfront with a fixed payment." },
  { k: /\b(personal loan|term loan|unsecured)\b/i,
    a: "An Achieve personal loan is unsecured (no collateral), with a fixed rate, a fixed monthly payment and a set term, typically 24 to 72 months. You get the full amount at once, and there's no prepayment penalty. Amounts run from $5,000 to $50,000." },
  { k: /\b(consolidat\w*|credit cards?|refinanc\w*)\b|\bpay off (my )?(cards?|debt)/i,
    a: "Debt consolidation and credit card refinancing roll several balances into one fixed payment, often at a lower rate than cards charge. In the boost step you can say how much goes to paying off cards and loans; Achieve can pay creditors directly, and that can earn extra rate savings." },
  { k: /\b(co-?applicant|joint|spouse|partner)\b/i,
    a: "Adding a co-applicant can help you qualify for a larger loan or a better rate, because their income counts too. It means you're both applying jointly and both share responsibility for the loan. It's optional: you can add one on the income step or in the boost step." },
  { k: /\b(income|employer)\b|\bwhy .*(work|job)\b/i,
    a: "Income and employer help Achieve confirm you can comfortably afford the payment and find offers that fit. Include wages, bonuses, commissions and other income, before taxes. You'll verify it with a recent paystub later." },
  { k: /\b(change|edit|fix|wrong|mistake|go back|update my)\b/i,
    a: "You can change any answer. On a computer, hover an earlier answer and click it; on a phone, tap it. You can also click any step in the progress list, or just tell me where to go, like \"take me to my address\"." },
  { k: /\b(human|person|agent|consultant|someone|talk to|call|phone number|speak)\b/i,
    a: "Of course. Choose \"Chat with a human\" and a loan consultant will join right here, and they can hand you back to me any time. Or call 833-598-0058: Monday-Thursday 6 am-8 pm MST, Friday 6 am-7 pm MST, Saturday-Sunday 7 am-4 pm MST." },
  { k: /\bafter (i )?(submit|apply|proceed)|\bwhat happens next|\bnext step|\bapproved\b|\bapproval\b|\bhow long.*(review|decision)/i,
    a: "After you submit, Achieve reviews your information and documents and reaches out within 2-3 business days. If you're approved you e-sign and funds are sent, to you or directly to your creditors for a consolidation." },
  { k: /\b(debt relief|debt settlement|resolution|settle (my )?debt|negotiate)\b/i,
    a: "Achieve Debt Relief is a separate program for people who are struggling with unsecured debt (generally at least $7,500). A specialist builds a plan, you make monthly deposits into a dedicated account that you own, and Achieve negotiates with creditors, with you approving each settlement. It usually takes 24 to 48 months, and the fee is reported as 15% to 25% of enrolled debt, collected only after a successful settlement. It's not a loan." },
  { k: /\b(states?|available|new jersey|nj)\b|\bwhere (do|can)/i,
    a: "Achieve products are available in most but not all states, and fees and terms can vary by state. You'll see whether you're eligible once you enter your address." },
  { k: /\b(eligib\w*|who can|age|citizen|18|bank account)\b/i,
    a: "To be eligible for an Achieve personal loan you must be at least 18, a US citizen and/or permanent resident, and have a verifiable bank account." },
  { k: /\b(texts?|sms|call me|stop texting|opt|unsubscribe)\b/i,
    a: "By giving your number you agree to calls and texts about your application. You can reply STOP at any time to opt out of texts." },
  { k: /\b(real|prototype|demo|fake|sample)\b/i,
    a: "This is a prototype that mirrors the Achieve application flow so you can try a hybrid conversation-and-form experience. The offers are samples, nothing is submitted, and your answers stay in your browser." },
  { k: /\b(trust|legit|reviews?|reputable|scam)\b/i,
    a: "Achieve cites 450K+ members served, $7.5 billion+ in loans, and a 4.8 out of 5 Trustpilot score. As with any lender, read the offer terms carefully before you accept." },
];

export const KNOWLEDGE_TEXT = [COMPANY, FLOW, 'Frequently asked questions:\n' + FAQ.map((f) => '- ' + f.a).join('\n')].join('\n\n');

/** Offline answer: best FAQ match for a question, or null. */
export function localAnswer(text) {
  const t = String(text || '');
  let best = null, bestScore = 0;
  for (const f of FAQ) {
    const m = t.match(new RegExp(f.k.source, 'gi'));
    const score = m ? m.length : 0;
    if (score > bestScore) { best = f; bestScore = score; }
  }
  return best ? best.a : null;
}
