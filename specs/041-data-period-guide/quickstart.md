# Quickstart: validating spec 041

Prerequisites: `make dev` (localhost:9000/RRQuilts/), Chrome or Edge for the file handle cases,
Firefox for the drafts-only case. Unit tests: `make test`.

## Unit tests (vitest)

- `model/data-made.spec.ts`: marks set and cleared; replan drops gone `blocksMade`.
- `model/io.migrate.spec.ts`: a v10 file opens as v11 unchanged; bad `made` keys are dropped.
- `model/data-pending.spec.ts`: `applyPending` over a doc (entries, marks, a missing quilt skipped).
- `model/print/data-steps.spec.ts` (demo-v11 months and weeks quilts): steps for Jan 11 to 13 list
  the right letters, fabrics and counts; a day without entry and a day not placed give reasons;
  the sample never fills a day; counts agree with `quiltPieces` for the same days.
- `model/data-quilt.spec.ts`: `dayColor` follows the shown colorway; `lastEntry`, `nextDays`.
- Formats: `project-v11.rrq`, `demo-v11.rrq` open (`formats/samples.spec.ts`).

## Manual (Tests tab checklist)

1. Data Quilts in the nav after Project, with no project open; the demo data quilts listed after
   opening the demo once.
2. Close the project; Data Quilts card **Show** asks for file permission once, then the picture.
3. Enter Jan 11 to 13 in the dialog: dots in the range colors, preview updates; Cut and Assembled
   badges appear after the toggles.
4. Reopen the project: the entries and marks are there (applied from pending), project unsaved.
5. Unsaved project (draft) closed: entries from Data Quilts land in the draft; Restore shows them.
6. Same project open in another tab: dialog says it's kept on this device; the other tab shows the
   entries after reopening.
7. Home: calendar icon on rows with data quilts only; opens the dialog.
8. Print instructions for Jan 11 to 13: table, block with the three places outlined, templates per Tint by
   fabric (on and off), Quilt notes toggle prints notes; prints on Letter and A4.
9. Block by block January: every day of January, entered ones with fabrics, others "no entry yet".
10. Firefox: only drafts and the open project listed; no Show buttons.
