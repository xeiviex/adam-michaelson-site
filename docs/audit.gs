/**
 * =====================================================================
 *  DIAGNOSTIC — paste this at the very bottom of the script file.
 *  Sends nothing. Run it, then read the Execution log.
 * =====================================================================
 */
function auditMonthToDate() {
  var sheetName = getProp_('TRANSACTIONS_SHEET') || 'Transactions';
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error('Sheet "' + sheetName + '" not found.');

  var values = sheet.getDataRange().getValues();
  var headerRow = findHeaderRow_(values);
  var headers = values[headerRow].map(function (h) {
    return String(h).trim().toLowerCase();
  });

  var iDate = indexOfAny_(headers, ['date']);
  var iAmount = indexOfAny_(headers, ['amount']);
  var iCategory = indexOfAny_(headers, ['category']);
  var iDesc = indexOfAny_(headers, ['description', 'full description']);

  var monthPrefix = dateKey_(getYesterday_()).slice(0, 7);
  var excluded = getExcludedCategories_();

  var counted = {};
  var skipped = {};
  var inflow = {};
  var biggest = [];

  for (var r = headerRow + 1; r < values.length; r++) {
    var row = values[r];
    var when = toDate_(row[iDate]);
    if (!when) continue;
    if (dateKey_(when).slice(0, 7) !== monthPrefix) continue;

    var cat = iCategory >= 0 ? String(row[iCategory]).trim() : '';
    var name = cat || 'Uncategorized';
    var amt = toNumber_(row[iAmount]);

    if (amt >= 0) {
      inflow[name] = (inflow[name] || 0) + amt;
      continue;
    }

    var spend = Math.abs(amt);
    if (excluded.indexOf(cat.toLowerCase()) !== -1) {
      skipped[name] = (skipped[name] || 0) + spend;
      continue;
    }

    counted[name] = (counted[name] || 0) + spend;
    biggest.push([spend, dateKey_(when), name,
                  iDesc >= 0 ? String(row[iDesc]).slice(0, 40) : '']);
  }

  console.log('=== MONTH ' + monthPrefix + ' ===');
  console.log('');
  console.log('--- COUNTED AS SPENDING (this is what inflates the total) ---');
  dumpTotals_(counted);
  console.log('');
  console.log('--- ALREADY EXCLUDED ---');
  dumpTotals_(skipped);
  console.log('');
  console.log('--- POSITIVE AMOUNTS (ignored as income/refunds) ---');
  dumpTotals_(inflow);
  console.log('');
  console.log('--- 15 LARGEST COUNTED TRANSACTIONS ---');
  biggest.sort(function (a, b) { return b[0] - a[0]; });
  biggest.slice(0, 15).forEach(function (t) {
    console.log(usd_(t[0]) + '  ' + t[1] + '  [' + t[2] + ']  ' + t[3]);
  });
}

function dumpTotals_(map) {
  var rows = Object.keys(map).map(function (k) { return [k, map[k]]; });
  if (!rows.length) {
    console.log('  (none)');
    return;
  }
  rows.sort(function (a, b) { return b[1] - a[1]; });
  var total = 0;
  rows.forEach(function (row) {
    total += row[1];
    console.log('  ' + usd_(row[1]) + '   ' + row[0]);
  });
  console.log('  ----------');
  console.log('  ' + usd_(total) + '   TOTAL');
}
