# 3A Stock cupboard log: specification

Draft v0.2 (content only), 16/11/2026. This file specifies the log. It will later be built as a printable LibreOffice Calc spreadsheet (decision in `work/PROGRESS.md`). Source IDs are those in `work/evidence-matrix.md` (v0.2); GAP §n refers to `work/research/gap-research.md` v0.2, with ✅ = verified on the named official page.

## Change log

- **v0.2 (16/11/2026).** Sweden now cited as SE26 (June 2026). Review table: stored tap water now has SE26's "once or twice a year" check (met by the 6-monthly check); new rows for cash (SE26: "use cash occasionally") and the fridge thermometer; the medicines row notes SE26's month's supply; the smoke alarm row cites GOV.UK (GAP §1 ✅). One fictional row added to the worked example (stored tap water), making 11 rows. This file had no "(gap research – verification pending)" labels. No quantities changed.
- **v0.1 (16/11/2026).** First content draft.

## Purpose

To keep the stay-put store (`3A-stay-put-supplies.md`) complete and in date: what we hold, where it is, when it runs out of date, and what needs doing. The sources agree on checking expiry dates and batteries and rotating stock through normal use (matrix, topic 25).

## Columns

| # | Column | What goes in it | Format / validation (for the Calc build) |
|---|---|---|---|
| A | Item | Name of the item, as on the supplies checklist (e.g. "Bottled water 2 L") | Text |
| B | Category | One of the 11 checklist sections: Water; Food and cooking; Heat and warmth; Light and power; Communications; Cash and documents; Medication and first aid; Hygiene and sanitation; Dogs; Tools and home; Comfort and wellbeing | Drop-down list (data validity) |
| C | Quantity held | Number counted at the last check, with the unit (bottles, tins, rolls, packs, litres) | Number; unit in the item name or a note |
| D | Target quantity | From the supplies checklist: the 3-day core or 7-day-plus figure the household has chosen, worked out for the household's people and dogs | Number, same unit as C |
| E | Location | Where it is kept (e.g. "Kitchen cupboard", "Under-stairs box", "Garage shelf") | Text, ideally from a short drop-down list |
| F | Best-before / expiry date | Earliest date on the stock held. For items without a date, write the purchase date and mark "(bought)", as DE advises for food and medicines (DE p.11, p.14). For non-perishables, leave blank. | Date, dd/mm/yyyy |
| G | Date last checked | Date this row was last physically checked | Date, dd/mm/yyyy |
| H | Checked by | Who checked it | Text (initials or role) |
| I | Action needed | What to do: e.g. "Buy 2 more", "Use in normal meals and replace", "Replace batteries", "Charge", "None" | Text |
| J | Date action done | Date the action was completed | Date, dd/mm/yyyy |

**Optional calculated columns (SUGGESTION, for the Calc build):**
- **Shortfall** = target minus held: `=MAX(0;D2-C2)`.
- **Status** from the expiry date: `=IF(F2="";"";IF(F2<TODAY();"Expired";IF(F2<=EDATE(TODAY();2);"Nearing expiry";"OK")))`. (LibreOffice uses ";" as the separator in a UK locale set up that way; some set-ups use ",". `EDATE` returns a date serial number, so the comparison works as written.)

## Highlighting rules

These rules are **SUGGESTIONS**. No source sets a "nearing expiry" window.

| Condition | Highlight | Why |
|---|---|---|
| Expiry date (F) is before today | Red | Expired. Bin expired medicines (DE p.14); replace expired stock. |
| Expiry date (F) is within **2 months** of today | Amber | SUGGESTION: 2 months gives time to use the item in normal meals and buy a replacement before it expires ("use up the older food first", DE p.11). With a 6-monthly check, a 2-month window means anything expiring before the next-but-one check is caught. The household may prefer a longer window (e.g. up to the next check, 6 months). |
| Quantity held (C) is below target (D) | Amber | Restock. NO: "If you stock up before you run out you will always have some in reserve" (NO p.8). |
| Date last checked (G) is more than 6 months ago | Grey | Overdue check (review interval below). |
| Action needed (I) filled in but no date done (J) | Bold | Outstanding action. |

## Review frequency

| What | How often | Source |
|---|---|---|
| Whole store: expiry dates, quantities, swap out items | **Every 6 months** (SUGGESTION from the matrix, following UK-GOV) | UK-GOV 091117/091126 ("Set a reminder every six months to check expiry dates and swap out items that need replacing, or update your kit if your household's needs have changed"); UK-GOV-CHK p.1. FR says once a year (FR p1); DK, NO and DE say "regularly". This is DECISION 10 in the matrix. |
| After any use of the store | Restock straight away | FR p1 ("If you use it, don't forget to restock it!", translated) **[1 source]** |
| Batteries | At each 6-monthly check: use up and replace regularly | DE p.23; FR p1 (replace yearly) |
| Power banks | Recharge at each check, or more often | NO p.14 ("charge it regularly") |
| Regular medicines | Order repeats at least 5 working days ahead (UK-GOV) / collect no later than a week before running out (NO). Target is the household's DECISION 6 buffer (7 days' extra, working towards SE26's "month's supply") | UK-GOV 091150; NO p.12; SE26 p.18 |
| Medicine cabinet and first aid kit | At each check; bin expired items | DE p.14; FR p1 |
| Stored tap water in own containers | At each 6-monthly check (SUGGESTION): check whether it "tastes or smells unusual" and change it when necessary, which meets SE26's "once or twice a year". How often to replace it regardless is DECISION 15: "several months" (DK p.2) or "for years" (NO p.5) | SE26 p.15; DK p.2; NO p.5 |
| Bottled water | By the date on the bottle | DK p.2 |
| Camping stove, gas cooker, grill (if held) | Check condition regularly | NO p.8 |
| Cash | At each check: count it against the target (DECISION 16); spend some and replace it, so it is used now and then | SE26 p.17 ("You should use cash occasionally") **[1 source]** |
| Fridge thermometer (if held) | At each check: still working | GAP §4 ✅ (FSA "Food safety in a power cut": "Use a fridge thermometer") |
| Smoke alarms | At least once a month (not part of the store, but a natural reminder) | UK-GOV 091230; GAP §1 ✅ (Home Office "Fire safety in the home": "Test your smoke alarms at least monthly") |
| Household plan | Whenever circumstances change, and at least once a year (SUGGESTION from the matrix) | RS-PLAN 092102/092108; UK-GOV-PLAN p.1 |

**Rotation rule:** newly bought supplies go to the back of the shelf; use the older food first (DE p.11). Rotate the store through normal use (DK p.2; DE p.11). Build the store up gradually by "buying one or two additional items when doing your regular shopping" (SE26 p.17).

## Worked example (fictional)

All dates are fictional. "Today" for this example is 16/11/2026, so the amber window runs to 16/01/2027. Status shown is what the highlighting rules would produce. Quantities assume a fictional household of 2 people and 1 dog on the 3-day core.

| Item | Category | Qty held | Target | Location | Best-before / expiry | Last checked | Checked by | Action needed | Action done | Status (calculated) |
|---|---|---|---|---|---|---|---|---|---|---|
| Bottled water 2 L | Water | 8 | 9 (3 L × 2 people × 3 days = 18 L) | Under-stairs box | 30/06/2027 | 14/11/2026 | Adult 1 | Buy 1 more | | Below target (amber) |
| Tinned fish | Food and cooking | 6 | 6 | Kitchen cupboard | 12/01/2027 | 14/11/2026 | Adult 1 | Use in normal meals; replace | | **Nearing expiry** (amber) |
| Tinned fruit | Food and cooking | 4 | 4 | Kitchen cupboard | 31/10/2026 | 14/11/2026 | Adult 1 | Replace now | | **Expired** (red) |
| Tin opener (manual) | Food and cooking | 1 | 1 | Kitchen drawer | | 14/11/2026 | Adult 1 | None | | OK |
| AA batteries (pack of 8) | Light and power | 2 | 2 | Under-stairs box | 01/03/2033 | 14/11/2026 | Adult 2 | None | | OK |
| Power bank | Light and power | 2 | 2 | Hall drawer | | 14/11/2026 | Adult 2 | Recharge | 14/11/2026 | OK |
| Paracetamol (pack) | Medication and first aid | 1 | 2 | Bedroom medicine box | 05/01/2027 | 14/11/2026 | Adult 2 | Buy 2 new; bin old pack after expiry | | **Nearing expiry**, below target (amber) |
| Hand sanitiser | Hygiene and sanitation | 2 | 2 | Bathroom cupboard | 01/09/2027 | 14/11/2026 | Adult 2 | None | | OK |
| Dog food (kg) | Dogs | 1.5 | 1.5 (daily ration × 1 dog × 3 days) | Utility room bin | 20/04/2027 | 14/11/2026 | Adult 1 | None | | OK |
| Tap water in own containers, 5 L (filled 10/05/2026) | Water | 4 | 4 | Garage shelf | | 14/11/2026 | Adult 1 | Taste and smell checked: fine | 14/11/2026 | OK |
| Strong plastic bags (emergency toilet) | Hygiene and sanitation | 20 | 24 (fictional household figure) | Garage shelf | | 02/05/2026 | Adult 1 | Buy 1 roll | | Below target (amber); **check overdue** (grey: last checked more than 6 months ago) |

Notes on the example:
- The bottled-water target in the Target column is 9 bottles of 2 L, i.e. 18 L for 2 people for 3 days.
- The emergency-toilet bag target is a made-up household figure; no source gives one.
- The own-container water row leaves the expiry column blank (so the Status formula does not mark it expired) and puts the fill date in the item name. The 6-monthly taste-and-smell check follows SE26 p.15.
- "Adult 1" and "Adult 2" stand in for real names, which belong only in the private household copy.
