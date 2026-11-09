# Tasks: Making a Data Quilt (Data Quilts, Next Steps, Block by Block)

**Input**: `specs/041-data-period-guide/` (plan.md, spec.md, research.md, data-model.md,
contracts/ui.md, quickstart.md)

**Tests**: unit tests for the model and storage logic (quickstart.md lists them); UI checked by the
Tests tab checklist.

**Conventions**: framework-free model in `src/model/` (no Vue imports); every project edit through
`project.change`; storage access wrapped in try/catch; help text follows the help style rules (no
em or en dashes, UI labels quoted as in the UI). Tests in `test/vitest/__tests__/`, run with
`make test`. Commit with `make commit MSG=…` (keep `RRQuilts-promo.xcs` out via
`.git/info/exclude`). Next free checklist id: TC-245.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [X] T001 Bump the IndexedDB version 3 → 4 and add stores `known` and `pending` to `STORES` in src/storage/idb.ts (keyPath `id`, created on upgrade like the others)

---

## Phase 2: Foundational (blocks every story)

- [X] T002 Add `DayMade` (`{ cut?: DateKey; assembled?: DateKey }`) and optional `DataPlan.made: Record<DateKey, DayMade>` and `DataPlan.blocksMade: Record<string, DateKey>` to src/model/schema/data-quilt.ts (data-model.md)
- [X] T003 Set `VERSION = 11` in src/model/schema/project.ts and add `migrations[10]` (no change, version only) in src/model/io.ts; marks outside the period are ignored; `blocksMade` keys (1-based numbers `n`) past the plan are pruned when it's refitted (`fitPlaces`)
- [X] T004 Regenerate the published schema (`npm run schema` in the container) to public/schemas/rrq.v11.json and set `rrq: 11` in public/schemas/formats.json; update any test that names v10 as current
- [X] T005 [P] Add `dayColor(quilt, slot, date)`, `lastEntry(plan)`, `nextDays(plan)` (entered, not cut, oldest first), `setMade(plan, date, part, on, today)`, `setBlockMade(plan, k, on, today)` in src/model/data-quilt.ts; make `replan`/`relabel`/`setLead` drop `blocksMade` indexes that no longer exist
- [X] T006 [P] Tests for T002 to T005 in test/vitest/__tests__/model/data-made.spec.ts and test/vitest/__tests__/model/io.migrate.spec.ts (v10 opens as v11 unchanged; bad mark keys dropped; dayColor follows the shown colorway; replan prunes blocksMade)
- [X] T007 [P] Create src/storage/known.ts: `KnownProject` (data-model.md), `rememberKnown(doc, handle?)` (writes when the doc has data quilts with `on`, deletes otherwise), `knownProjects()`, `forgetKnown(id)`; all wrapped in try/catch
- [X] T008 [P] Create src/storage/pending.ts: `PendingData` (data-model.md), `getPending(id)`, `putPending(id, quiltId, patch)` (merges into the stored record), `removePending(id)`
- [X] T009 [P] Create src/model/data-pending.ts: pure `mergePending(a, b)` and `applyPending(doc, pending)` (entries rows replaced, marks set or cleared on null, missing quilts or out-of-period days skipped); tests in test/vitest/__tests__/model/data-pending.spec.ts
- [X] T010 Create src/storage/read-project.ts `readProjectDoc(source)`: a draft through `draftDoc`, a handle through `ensurePermission(handle, 'read')` + file text + `parseProject`; returns `{ doc, problems }` or a typed failure (`denied`, `gone`, `invalid`); never touches the open project
- [X] T011 In src/stores/project.ts: after `load()` sets the doc, apply `getPending(id)` with one `project.change` (marks unsaved) then `removePending`; call `rememberKnown` on open and after each save (with the handle when there is one)

**Checkpoint**: v11 files load and save; marks and pending logic tested.

---

## Phase 3: User Story 1 - Enter a day, get its steps (P1) 🎯 MVP

**Goal**: Data Quilts module and Home icon open a data entry dialog; entering a day shows and prints its steps.

**Independent test**: open Data Quilts with no project open, open the demo months quilt, enter Jan 11; the calendar dot shows in its range color, the preview updates, Next steps prints Jan 11's pieces, fabric, cut and place.

- [X] T012 [US1] Create src/stores/data-quilts.ts: the card list (open project, dirty drafts from `unsavedDrafts`, `knownProjects`), a session cache of read docs by project id (with pending laid over through `applyPending`), `source(projectId)` = `open | draft | file | other-tab` (lock from `lockedProjects()`), `write(projectId, quiltId, patch)` routing per research R3 (open: `project.change` with the Data tab's coalesce keys; draft: `putDraft` stays dirty; else `putPending`), and `stepsInput` for the steps page
- [X] T013 [US1] Add `/data` and `/data/steps` routes in src/router/routes.ts (no `requiresProject`; `/data/steps` redirects to `/data` without `stepsInput`)
- [X] T014 [US1] Add the **Data Quilts** nav item after Project in src/layouts/MainLayout.vue (always shown; active on `/data*`)
- [X] T015 [US1] Create src/pages/DataQuiltsPage.vue per contracts/ui.md: cards with picture (`quiltThumbnail` of the quilt with `show: 'real'`), project and quilt names, "Last entry …" from `lastEntry`, unsaved/pending badges; **Show** button when the file needs permission (one `readProjectDoc` per tap); card menu (Open project, Next steps, Block by block, Forget); empty state linking Help › Data quilts
- [X] T016 [P] [US1] Create src/components/DataCalendar.vue: the period's months stacked in a scroll area, opening on today's month (or the first month before the period starts); each day cell shows a dot per series with an entry in `dayColor` (resolved with `colorLookup`), an empty ring for a series without; dims days outside the period; emits `pick(date)`; props `{ quilt, selected: DateKey[], doc }`
- [X] T017 [P] [US1] Create src/components/DataDayForm.vue: one input per series reusing the Data tab's entry inputs from src/components/DataEntriesDialog.vue (number with unit, or category select); emits `set(date, slot, value)`; Enter moves to the next day
- [X] T018 [US1] Create src/components/DataEntryDialog.vue: header (quilt, project, where changes go per `source`), the quilt preview (real entries, redraws on change), DataCalendar, DataDayForm below for the tapped day, footer **Next steps** and Close; writes through the data-quilts store
- [X] T019 [US1] In src/pages/HomePage.vue add a calendar icon button (`event`, tooltip "Enter data") on recent rows and loose draft rows whose project has data quilts (from `knownProjects` and drafts), beside the trash icon where there is one; several data quilts open a small menu to pick one; opens DataEntryDialog
- [X] T020 [P] [US1] Create src/model/print/data-steps.ts `daySteps(doc, quilt, days)` per research R7 and data-model.md (`DayStep`): real entries only (`show: 'real'`, never the sample), colorway applied, pieces from `quiltPieces` filtered by the day's paint, identical pieces in one fabric counted together, reasons `no-entry` / `not-placed` / `past`
- [X] T021 [P] [US1] Tests in test/vitest/__tests__/model/print/data-steps.spec.ts on the demo months and weeks quilts with entries added in the test: Jan 11 to 13 letters, fabrics, counts; reasons; counts agree with `quiltPieces` for the same days
- [X] T022 [US1] Add `kind: 'steps'` to src/components/PrintPreview.vue with props `days?`/`numbers?`: sheets for the steps table, the blocks with the days' places outlined and numerals, templates via `templateItems` (respecting `tint`), and quilt notes; header "Jan 11 to Jan 13"
- [X] T023 [US1] Add `stepsNotes: true` to `PRINT_DEFAULTS` in src/model/print/prefs.ts and create src/pages/DataStepsPage.vue: PrintPreview `kind="steps"` with a slim options panel (Tint by fabric, **Quilt notes** shown only when the quilt has notes, paper) and a Print button

**Checkpoint**: MVP: enter data anywhere, print a day's steps.

---

## Phase 4: User Story 2 - Catch up on several days (P1)

**Goal**: pick several days and get one set of steps.

**Independent test**: select Jan 8 to 14 in the calendar, Next steps lists all seven grouped by block with merged counts; Tint by fabric on gives a template per unique piece and fabric labeled with its days, off gives uncolored templates per shape.

- [ ] T024 [US2] Range selection in src/components/DataCalendar.vue (shift-tap, or long press then tap, extends from the tapped day; a "Not cut yet" chip selects `nextDays`); the dialog's **Next steps** uses the selection, else `nextDays`
- [ ] T025 [US2] On src/pages/DataStepsPage.vue a days picker (date range plus "Not cut yet") to change the days covered
- [ ] T026 [US2] In the `steps` kind of src/components/PrintPreview.vue: group the steps table by block, and with `tint` on label each template with its days ("Jan 8, Jan 12"); with `tint` off keep today's uncolored per-shape templates with counts
- [ ] T027 [P] [US2] Extend test/vitest/__tests__/model/print/data-steps.spec.ts: a week of days merges identical pieces per fabric; non-data pieces are not in the steps

---

## Phase 5: User Story 3 - Block by block (P2)

**Goal**: walk the plan one data block at a time, on screen and in print.

**Independent test**: Block by block for January prints the block with letters and day numerals and a row per day of January (entered ones with fabric, others "no entry yet"); Jan to Mar prints three.

- [ ] T028 [US3] Add `blockSteps(doc, quilt, k)` in src/model/print/data-steps.ts (every day of number `k`, the block's non-data pieces listed once with their fabric); tests in test/vitest/__tests__/model/print/data-steps.spec.ts
- [ ] T029 [US3] **Block by block** mode on src/pages/DataStepsPage.vue (number range picker using `numberLabel`, Previous/Next on screen) feeding `numbers` to PrintPreview's `steps` kind in src/components/PrintPreview.vue
- [ ] T030 [US3] Entry points: **Block by block** in the DataEntryDialog footer (src/components/DataEntryDialog.vue, opens on the tapped day's block) and in the Data Quilts card menu (src/pages/DataQuiltsPage.vue)

---

## Phase 6: User Story 4 - What's done and what's next (P2)

**Goal**: mark days cut and assembled, blocks assembled; next steps leave done days out.

**Independent test**: mark Jan 11 Cut and Assembled: badges show in the calendar; the January block's Block assembled toggle shows on its days; Next steps' default days no longer include Jan 11; changing Jan 11's value warns it was cut.

- [X] T031 [US4] In src/components/DataDayForm.vue add **Cut** and **Assembled** toggles (`setMade` with today's date), the day's block label with **Block assembled** (`setBlockMade`), and the warning when changing a value of a day marked cut
- [ ] T032 [US4] (day badges done in the MVP: scissors, double check) Cut (scissors) and Assembled (needle) badges per day in src/components/DataCalendar.vue, and an assembled mark on each month's or week's label
- [ ] T033 [US4] Done days in the steps: `daySteps`/`blockSteps` carry `made`; the steps table in src/components/PrintPreview.vue shows "cut Jan 14" / "assembled" and Block by block marks done days

---

## Phase 7: Polish & Cross-Cutting

- [ ] T034 [P] Help: a "Making a data quilt" section in src/help/guides/data-quilts.md (Data Quilts module, the calendar and entry form, Cut and Assembled, where entries wait for a project that isn't open, Next steps, Block by block, Quilt notes toggle) (FR-007)
- [ ] T035 [P] (MVP checks TC-245 to TC-251 added) Checklist checks TC-245 onward in src/dev/checklist.ts, one per quickstart.md manual scenario, new group for spec 041
- [ ] T036 [P] Fixture with marks: extend test/vitest/__tests__/formats/write-samples.spec.ts / write-demo.spec.ts so v11 samples carry `made` and `blocksMade` (files written at release per scripts/release.md)
- [ ] T037 Update spec.md status and CLAUDE.md (Data Quilts module, `known`/`pending` stores, `data-steps.ts`) and run `make check`

## Dependencies & Execution Order

- Phase 1 → Phase 2 → stories. US1 first (MVP). US2 builds on US1's dialog and steps kind. US3 needs
  T020/T022. US4 needs T002/T005 and the dialog (T018). Polish last.
- Within Phase 2: T002 → T003 → T004; T005, T007, T008, T009 in parallel after T002; T010 after
  T001; T011 after T007 to T009.

## Parallel Examples

- Phase 2: T005, T007, T008, T009 together.
- US1: T016, T017, T020, T021 together once T012 exists.
- Polish: T034, T035, T036 together.

## Implementation Strategy

- MVP: Phases 1 to 3 (enter data from Data Quilts or Home, steps for entered days). Show the owner,
  then US2, US3, US4, each a checkpoint with its checks.
- Commit per phase with `make commit` on `041-data-making`; no merge or push without the owner.
