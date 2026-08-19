/**
 * =====================================================================
 *  HOUSEHOLD BUDGET SMS  —  complete Apps Script
 * =====================================================================
 *
 *  Reads the Tiller Transactions sheet, summarizes yesterday's spending
 *  and month-to-date progress, and texts it to the household recipients
 *  via Twilio. Message bodies carry the A2P 10DLC disclosures so live
 *  traffic matches the samples registered with the campaign.
 *
 *  ------------------------------------------------------------------
 *  SETUP (one time)
 *  ------------------------------------------------------------------
 *  1. Open the Tiller sheet > Extensions > Apps Script.
 *  2. Replace the file contents with this script and save.
 *  3. Project Settings (gear icon) > Script Properties > add:
 *
 *       TWILIO_ACCOUNT_SID              AC…e15100  (redacted — full SID in the Twilio console)
 *       TWILIO_AUTH_TOKEN               <your auth token>
 *       TWILIO_MESSAGING_SERVICE_SID    MG1f5bfb4b5a63d62199e8b262dd86732a
 *       SMS_RECIPIENTS                  +15551234567,+15557654321
 *       MONTHLY_BUDGET                  3800
 *
 *     Optional:
 *       TRANSACTIONS_SHEET   defaults to "Transactions"
 *       EXCLUDED_CATEGORIES  defaults to the transfer-ish list below
 *
 *  4. Run  dryRun  once. Grant permissions when prompted, then read the
 *     Execution log to confirm the numbers and wording look right.
 *  5. Run  previewSamples  and paste its output into the Twilio campaign
 *     sample-message fields.
 *  6. Run  installDailyTrigger  to schedule the 7am send.
 * =====================================================================
 */


/* ============================ CONFIG ============================== */

var SMS_PROGRAM_NAME = 'Household Budget Summary';

/** Send hour for the daily trigger, 0-23, script timezone. */
var SEND_HOUR = 7;

/** Categories treated as non-spending. Overridable via EXCLUDED_CATEGORIES. */
var DEFAULT_EXCLUDED_CATEGORIES = [
  'Transfer',
  'Transfers',
  'Credit Card Payment',
  'Credit Card Payments',
  'Payment',
  'Income',
  'Paycheck',
  'Savings Transfer'
];

/** How many category line items to name in the message. */
var MAX_CATEGORIES_SHOWN = 3;


/* ========================= ENTRY POINTS =========================== */

/**
 * Main daily job. This is what the trigger calls.
 */
function sendDailyBudgetSms() {
  var summary = buildYesterdaySummary_();
  var body = buildBudgetMessage_(
    summary.date,
    summary.daySpend,
    summary.categories,
    summary.mtdSpend,
    getMonthlyBudget_()
  );

  var recipients = getRecipients_();
  if (!recipients.length) {
    throw new Error('No recipients. Set the SMS_RECIPIENTS script property.');
  }

  recipients.forEach(function (number) {
    sendSms_(number, body);
  });

  console.log('Sent to ' + recipients.length + ' recipient(s): ' + body);
}

/**
 * Same as the daily job, but logs the message instead of sending it.
 * Run this first to sanity-check the numbers.
 */
function dryRun() {
  var summary = buildYesterdaySummary_();
  var body = buildBudgetMessage_(
    summary.date,
    summary.daySpend,
    summary.categories,
    summary.mtdSpend,
    getMonthlyBudget_()
  );
  console.log('Recipients: ' + getRecipients_().join(', '));
  console.log('Transactions counted yesterday: ' + summary.txnCount);
  console.log('Message (' + body.length + ' chars):');
  console.log(body);
}

/**
 * Logs the three message shapes. Paste these into the Twilio campaign's
 * sample message fields so samples and live traffic match.
 */
function previewSamples() {
  console.log(buildBudgetMessage_(
    new Date(2026, 7, 16), 142.18,
    [['Groceries', 88.40], ['Gas', 53.78]], 2410, 3800));
  console.log(buildBudgetMessage_(
    new Date(2026, 7, 16), 0, [], 2410, 3800));
  console.log(buildBudgetMessage_(
    new Date(2026, 8, 1), 61.05,
    [['Dining', 61.05]], 61.05, 3800));
}

/**
 * Creates the daily trigger, removing any previous copy first so
 * repeated runs don't stack up duplicate sends.
 */
function installDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'sendDailyBudgetSms') {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger('sendDailyBudgetSms')
    .timeBased()
    .atHour(SEND_HOUR)
    .everyDays(1)
    .create();

  console.log('Daily trigger installed for ~' + SEND_HOUR + ':00 ' +
              Session.getScriptTimeZone());
}


/* ======================= MESSAGE BUILDING ========================= */

/**
 * Compliance footer. Full disclosure on the 1st of each month, short
 * opt-out reference every other day.
 */
function smsFooter_(date) {
  return (date.getDate() === 1)
    ? ' Reply HELP for help, STOP to cancel. Msg&data rates may apply.'
    : ' Reply STOP to cancel.';
}

/** Formats a number as USD with thousands separators. */
function usd_(n) {
  return '$' + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Builds the message body.
 *
 * @param {Date}   date        Date the summary covers (yesterday).
 * @param {number} daySpend    Total spent that day.
 * @param {Array}  categories  [['Groceries', 88.40], ['Gas', 53.78]]
 * @param {number} mtdSpend    Month-to-date spend.
 * @param {number} monthBudget Total monthly budget.
 * @return {string}
 */
function buildBudgetMessage_(date, daySpend, categories, mtdSpend, monthBudget) {
  var label = formatMonthDay_(date);
  categories = categories || [];

  var body;
  if (!daySpend || !categories.length) {
    body = SMS_PROGRAM_NAME + ' ' + label + ': no transactions posted.';
  } else {
    var detail = categories
      .slice()
      .sort(function (a, b) { return b[1] - a[1]; })
      .slice(0, MAX_CATEGORIES_SHOWN)
      .map(function (c) { return c[0] + ' ' + usd_(c[1]); })
      .join(', ');
    body = SMS_PROGRAM_NAME + ' ' + label + ': ' + usd_(daySpend) +
           ' spent (' + detail + ').';
  }

  body += ' Month to date: ' + usd_(mtdSpend) + ' of ' + usd_(monthBudget) + '.';
  return body + smsFooter_(date);
}


/* ========================= SHEET READING ========================== */

/**
 * Scans the Transactions sheet and totals yesterday's spend by category
 * plus month-to-date spend through yesterday.
 *
 * @return {{date: Date, daySpend: number, categories: Array,
 *           mtdSpend: number, txnCount: number}}
 */
function buildYesterdaySummary_() {
  var sheetName = getProp_('TRANSACTIONS_SHEET') || 'Transactions';
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('Sheet "' + sheetName + '" not found.');
  }

  var values = sheet.getDataRange().getValues();
  var headerRow = findHeaderRow_(values);
  var headers = values[headerRow].map(function (h) {
    return String(h).trim().toLowerCase();
  });

  var iDate = indexOfAny_(headers, ['date']);
  var iAmount = indexOfAny_(headers, ['amount']);
  var iCategory = indexOfAny_(headers, ['category']);

  if (iDate < 0 || iAmount < 0) {
    throw new Error('Could not find Date and Amount columns in "' +
                    sheetName + '".');
  }

  var yesterday = getYesterday_();
  var dayKey = dateKey_(yesterday);
  var monthPrefix = dayKey.slice(0, 7);          // yyyy-MM
  var excluded = getExcludedCategories_();

  var byCategory = {};
  var daySpend = 0;
  var mtdSpend = 0;
  var txnCount = 0;

  for (var r = headerRow + 1; r < values.length; r++) {
    var row = values[r];

    var when = toDate_(row[iDate]);
    if (!when) continue;

    var key = dateKey_(when);
    if (key.slice(0, 7) !== monthPrefix) continue;   // wrong month
    if (key > dayKey) continue;                      // today or later

    var category = iCategory >= 0 ? String(row[iCategory]).trim() : '';
    if (excluded.indexOf(category.toLowerCase()) !== -1) continue;

    var amount = toNumber_(row[iAmount]);
    if (!amount || amount >= 0) continue;            // Tiller: expenses are negative
    var spend = Math.abs(amount);

    mtdSpend += spend;

    if (key === dayKey) {
      daySpend += spend;
      txnCount++;
      var name = category || 'Uncategorized';
      byCategory[name] = (byCategory[name] || 0) + spend;
    }
  }

  var categories = Object.keys(byCategory).map(function (k) {
    return [k, byCategory[k]];
  });

  return {
    date: yesterday,
    daySpend: round2_(daySpend),
    categories: categories,
    mtdSpend: round2_(mtdSpend),
    txnCount: txnCount
  };
}

/** Finds the row holding the column headers within the first few rows. */
function findHeaderRow_(values) {
  var limit = Math.min(values.length, 5);
  for (var r = 0; r < limit; r++) {
    var row = values[r].map(function (h) {
      return String(h).trim().toLowerCase();
    });
    if (row.indexOf('date') !== -1 && row.indexOf('amount') !== -1) {
      return r;
    }
  }
  return 0;
}

function indexOfAny_(headers, candidates) {
  for (var i = 0; i < candidates.length; i++) {
    var idx = headers.indexOf(candidates[i]);
    if (idx !== -1) return idx;
  }
  return -1;
}


/* =========================== TWILIO =============================== */

/**
 * Sends through the registered Messaging Service, so Twilio's Advanced
 * Opt-Out handles STOP / START / HELP automatically. Refuses to send a
 * body with no opt-out reference.
 */
function sendSms_(toNumber, body) {
  var sid = getProp_('TWILIO_ACCOUNT_SID');
  var token = getProp_('TWILIO_AUTH_TOKEN');
  var msid = getProp_('TWILIO_MESSAGING_SERVICE_SID');

  if (!sid || !token || !msid) {
    throw new Error('Missing Twilio script properties (SID, token, or ' +
                    'messaging service SID).');
  }
  if (!/STOP/i.test(body)) {
    body += ' Reply STOP to cancel.';
  }

  var res = UrlFetchApp.fetch(
    'https://api.twilio.com/2010-04-01/Accounts/' + sid + '/Messages.json',
    {
      method: 'post',
      headers: {
        Authorization: 'Basic ' + Utilities.base64Encode(sid + ':' + token)
      },
      payload: {
        To: toNumber,
        MessagingServiceSid: msid,
        Body: body
      },
      muteHttpExceptions: true
    }
  );

  if (res.getResponseCode() >= 300) {
    console.error('Twilio send failed for ' + toNumber + ': ' +
                  res.getContentText());
  }
  return res;
}


/* =========================== HELPERS ============================== */

function getProp_(name) {
  return PropertiesService.getScriptProperties().getProperty(name);
}

function getRecipients_() {
  var raw = getProp_('SMS_RECIPIENTS') || '';
  return raw.split(',')
    .map(function (s) { return s.trim(); })
    .filter(function (s) { return s.length > 0; });
}

function getMonthlyBudget_() {
  var raw = getProp_('MONTHLY_BUDGET');
  var n = Number(String(raw).replace(/[^0-9.\-]/g, ''));
  if (!raw || isNaN(n) || n <= 0) {
    throw new Error('Set the MONTHLY_BUDGET script property to a number.');
  }
  return n;
}

function getExcludedCategories_() {
  var raw = getProp_('EXCLUDED_CATEGORIES');
  var list = raw
    ? raw.split(',')
    : DEFAULT_EXCLUDED_CATEGORIES;
  return list.map(function (s) { return String(s).trim().toLowerCase(); });
}

/** Yesterday at local midnight, script timezone. */
function getYesterday_() {
  var d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** yyyy-MM-dd in the script timezone. */
function dateKey_(d) {
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

/** M/d in the script timezone. */
function formatMonthDay_(d) {
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'M/d');
}

/** Coerces a cell value to a Date, or null if it isn't one. */
function toDate_(v) {
  if (v instanceof Date && !isNaN(v.getTime())) return v;
  if (v === '' || v === null || v === undefined) return null;
  var d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

/** Coerces a cell value to a number, tolerating "$1,234.56" and "(12.00)". */
function toNumber_(v) {
  if (typeof v === 'number') return v;
  var s = String(v).trim();
  if (!s) return 0;
  var negative = /^\(.*\)$/.test(s);
  var n = Number(s.replace(/[()]/g, '').replace(/[^0-9.\-]/g, ''));
  if (isNaN(n)) return 0;
  return negative ? -Math.abs(n) : n;
}

function round2_(n) {
  return Math.round(n * 100) / 100;
}
