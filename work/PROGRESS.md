# Programme of work – progress

Last updated: 16/11/2026

Work is iterative: each output goes through drafts (v0.1, v0.2 …) and is reviewed before it is treated as final.
This file is the record of where things stand, so work can be picked up again at any time.

**Publishing rule:** generic guidance and empty templates only. No personal or household details are ever committed to this repository.

## Three scenarios
- **A – Stay put and cope** (storm, long power cut, loss of gas or water; cut off by flooding; told to shelter in place)
- **B – Leave with notice** (about 1–2 hours: flood, wildfire, told to evacuate)
- **C – Leave instantly** (house fire)

## Status

| # | Workstream | Output | Status |
|---|---|---|---|
| 0a | Evidence: UK sources | `work/evidence/uk-sources.md` | Done (v0.1) |
| 0b | Evidence: Nordic sources | `work/evidence/nordic-sources.md` | Done (v0.1) from the 2018 Swedish edition; 2026 edition (MCF0180, June 2026) extracted to `work/evidence/sweden-2026.md` (ID SE26) |
| 0c | Evidence: Germany and France | `work/evidence/germany-france-sources.md` | Done (v0.1) |
| 0d | Evidence matrix (combined) | `work/evidence-matrix.md` | Done (v0.1); 15 conflicts for household decision |
| 0e | Research into known gaps | `work/research/gap-research.md` | v0.2 done – verified against official pages; some items still unverified (Ofcom, UKPN, Anglian Water blocked automated access) |
| 1 | Guidance booklet | A4 PDF + editable .docx | Not started (needs 0d, 0e) |
| 2 | Household plan question set | `planner/questions.js` | Draft placeholder only |
| 3A | Stay-put supplies checklist + stock cupboard log | Cards + LibreOffice Calc spreadsheet | Content draft v0.1 done – for review |
| 3B | Leave-with-notice packing cards | A5/A6 cards | Content draft v0.1 done – for review |
| 3C | Fire escape card + chuck bag list | A5/A6 cards | Content draft v0.1 done – for review (14 questions for the household) |
| 4 | Household planner tool | `planner/` web page | v0.1 built and tested; ready for Kathryn to try |

## Decisions made
- Supplies checklist: 3-day core with a 7-day-plus column.
- Stock cupboard log: LibreOffice Calc spreadsheet, printable.
- Booklet: print-ready A4 PDF plus editable .docx.
- Planner tool: used on a PC in Firefox or Chrome; answers stay on the computer; save and open backup files; print the final plan.

## Next session – start here
1. Work through the household decisions, a few at a time (15 conflicts listed at the end of `work/evidence-matrix.md`, plus open questions from the checklist drafts).
2. Review the checklist drafts in `work/checklists/` (open questions listed in `work/checklists/README.md`).
3. Try the planner tool (instructions in `planner/README.md`).

## To do (coordinator)
- Update `work/evidence-matrix.md` to use SE26 instead of the 2018 SE edition (Sweden now: at least one week; 3 L per person per day; a month's prescription medicines; about 1,000 SEK cash per adult).

## Waiting on Kathryn
- Household decisions (see above).

## Housekeeping
- The `main` branch still has the original upload layout; the sorted work is on branch `claude/loving-sagan-4g1chj`. Merge into `main` via a pull request when Kathryn is ready.
- The 2026 Swedish booklet was uploaded to `main` as `31523.pdf` (16/11/2026); a renamed copy is in `sources/europe/sweden/`.
