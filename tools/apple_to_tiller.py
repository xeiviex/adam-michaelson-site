#!/usr/bin/env python3
"""
Convert an Apple Card transaction CSV into Tiller Transactions-sheet format.

Usage:
    python3 apple_to_tiller.py <apple_export.csv> [--start YYYY-MM-DD] [--out out.csv]

Defaults to --start 2026-07-23, which is where the Tiller bank feed begins.
Importing rows earlier than that makes months look "Apple Card only".

Output columns match the Transactions sheet from column B (Date) through
column T (Source). Paste into column B of the first empty row.

Sign convention: Apple exports purchases as POSITIVE. Tiller expects expenses
NEGATIVE. Every amount is inverted, which also correctly turns payments and
returns into inflows.

Category is deliberately left BLANK. Run AutoCat after pasting so the existing
rules classify these rows the same way they classify everything else. The only
exception is Apple's own card payments, which are pre-set to
"Credit Card Payment" so they're excluded from spending totals.
"""

import argparse
import csv
import hashlib
import sys
from datetime import datetime, timedelta

ACCOUNT_NAME = "Apple Card"
INSTITUTION = "Apple Card GS Bank"
IMPORT_TAG = "AppleCard-CSV"
SOURCE = "Manual"

# Column B through column T of the Transactions sheet.
TILLER_COLUMNS = [
    "Date", "Description", "Category", "Amount", "Account", "Account #",
    "Institution", "Month", "Week", "Transaction ID", "Account ID",
    "Import Tag", "Check Number", "Full Description", "Date Added",
    "Category Hint", "Categorized By", "Categorized Date", "Source",
]


def mdy(d):
    """Tiller renders dates as M/D/YY."""
    return f"{d.month}/{d.day}/{d.strftime('%y')}"


def week_start(d):
    """Sunday-anchored week start, matching the sheet's Week column."""
    return d - timedelta(days=(d.weekday() + 1) % 7)


def txn_id(date_str, amount, description):
    """Deterministic ID so re-running the same export can't create duplicates."""
    seed = f"{date_str}|{amount}|{description}"
    return "apl-" + hashlib.md5(seed.encode("utf-8")).hexdigest()[:20]


def convert(in_path, start=None, end=None):
    rows = []
    skipped = 0

    with open(in_path, newline="", encoding="utf-8-sig") as fh:
        reader = csv.DictReader(fh)
        required = {"Transaction Date", "Description", "Merchant", "Type", "Amount (USD)"}
        missing = required - set(reader.fieldnames or [])
        if missing:
            sys.exit(f"CSV is missing expected columns: {', '.join(sorted(missing))}")

        for r in reader:
            raw_date = (r.get("Transaction Date") or "").strip()
            if not raw_date:
                continue
            try:
                d = datetime.strptime(raw_date, "%m/%d/%Y").date()
            except ValueError:
                skipped += 1
                continue

            if start and d < start:
                continue
            if end and d > end:
                continue

            try:
                amount = float(str(r.get("Amount (USD)", "")).replace(",", "").replace("$", ""))
            except ValueError:
                skipped += 1
                continue

            raw_desc = (r.get("Description") or "").strip()
            merchant = (r.get("Merchant") or "").strip() or raw_desc
            ttype = (r.get("Type") or "").strip()

            # Apple: purchases positive, payments/returns negative. Tiller wants
            # the opposite. One inversion handles every case correctly.
            tiller_amount = round(-amount, 2)

            category = "Credit Card Payment" if ttype == "Payment" else ""

            rows.append({
                "Date": mdy(d),
                "Description": merchant,
                "Category": category,
                "Amount": f"{tiller_amount:.2f}",
                "Account": ACCOUNT_NAME,
                "Account #": "",
                "Institution": INSTITUTION,
                "Month": mdy(d.replace(day=1)),
                "Week": mdy(week_start(d)),
                "Transaction ID": txn_id(raw_date, amount, raw_desc),
                "Account ID": "",
                "Import Tag": IMPORT_TAG,
                "Check Number": "",
                "Full Description": raw_desc,
                "Date Added": mdy(datetime.now().date()),
                "Category Hint": "",
                "Categorized By": "",
                "Categorized Date": "",
                "Source": SOURCE,
            })

    # Oldest first, so pasted rows read in the same direction as the sheet's tail.
    rows.sort(key=lambda x: datetime.strptime(x["Date"], "%m/%d/%y"))
    return rows, skipped


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("infile")
    ap.add_argument("--start", default="2026-07-23",
                    help="Earliest transaction date to include (YYYY-MM-DD). "
                         "Pass 'none' for no lower bound.")
    ap.add_argument("--end", default=None, help="Latest date to include (YYYY-MM-DD)")
    ap.add_argument("--out", default="tiller_apple_card.csv")
    args = ap.parse_args()

    start = None
    if args.start and args.start.lower() != "none":
        start = datetime.strptime(args.start, "%Y-%m-%d").date()
    end = datetime.strptime(args.end, "%Y-%m-%d").date() if args.end else None

    rows, skipped = convert(args.infile, start, end)

    with open(args.out, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=TILLER_COLUMNS)
        w.writeheader()
        w.writerows(rows)

    total = sum(float(r["Amount"]) for r in rows)
    spend = sum(float(r["Amount"]) for r in rows if float(r["Amount"]) < 0)
    print(f"Wrote {len(rows)} rows to {args.out}")
    if rows:
        print(f"Date range:  {rows[0]['Date']} .. {rows[-1]['Date']}")
    print(f"Spending:    {spend:,.2f}")
    print(f"Net:         {total:,.2f}")
    if skipped:
        print(f"Skipped {skipped} unparseable row(s)")


if __name__ == "__main__":
    main()
