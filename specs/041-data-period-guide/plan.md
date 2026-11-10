# Implementation Plan: Making a Data Quilt (Data Quilts, Printed Instructions, Block by Block)

**Branch**: `041-data-making` | **Date**: 2026-11-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/041-data-period-guide/spec.md` (clarified 2026-11-09)

## Summary

A **Data Quilts** module (nav, after Project) lists every data quilt in the open project, unsaved
drafts and projects the device has seen (file handles). Each opens a **data entry dialog**: a
scrolling year calendar with a dot per series in its range color, Cut and Assembled badges, an
entry form for the tapped day, and a live preview. Home rows of data quilt projects get a calendar
icon to the same dialog. Entries for a project that isn't open go into its draft, or wait on the
device and are applied when it next opens. **Print instructions** prints the steps (pieces, fabric, cut,
place) for any picked days, and **Block by block** the same per data block, through a new
`PrintPreview` kind. Done marks are saved in the project (rrq v11).

## Technical Context

**Language/Version**: TypeScript (strict), Vue 3, Quasar 2 (app-vite)

**Primary Dependencies**: existing only (Pinia, Immer, TypeBox, marked). No new dependency.

**Storage**: `.rrq` v11 (two optional `DataPlan` fields); IndexedDB `rrquilts` v4 with new stores
`known` and `pending`; settings `print.stepsNotes`.

**Testing**: Vitest (model, storage logic with fake handles), the Tests tab checklist (manual).

**Target Platform**: browsers; file handles in Chromium only, drafts everywhere.

**Project Type**: static offline PWA (single project).

**Performance Goals**: the calendar scrolls smoothly over 366 days; the dialog's preview redraws
under 100 ms per entry on the demo quilts; steps for a month build under 200 ms.

**Constraints**: offline; no server; browser permission prompts need a user gesture; the open
project is never replaced by reading another.

**Scale/Scope**: a handful of data quilts per device; up to 366 days × 4 series per quilt.

## Constitution Check

| Principle | Check | Status |
| --- | --- | --- |
| I. Static & Serverless | All client side; `/data` and `/data/steps` are SPA routes with the existing fallbacks. | Pass |
| II. Offline-First | No network. Reading files uses local handles. | Pass |
| III. Open File Formats | rrq v11: `format`/`version` kept, migration 10→11 (none needed, fields optional), validation of the new fields, published schema `rrq.v11.json`, fixtures `project-v11`/`demo-v11` at release. | Pass |
| IV. User Owns Their Data | Entries never lost: pending kept until applied; drafts updated, never discarded; storage access wrapped; the file stays the record (pending is written in at next open). | Pass |
| V. Simplicity | No new dependency; reuses `PrintPreview`, `quiltPieces`, `templates`, `DataEntriesDialog` inputs. Two IndexedDB stores, justified by the clarifications. | Pass |
| VI. Content Licenses | No new content; library items unaffected. | Pass |

Re-checked after Phase 1 design: unchanged, Pass.

## Project Structure

### Documentation (this feature)

```text
specs/041-data-period-guide/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/ui.md
└── tasks.md            # /speckit-tasks
```

### Source Code

```text
src/model/schema/data-quilt.ts      # DataPlan.made, blocksMade, DayMade (v11)
src/model/schema/project.ts         # VERSION 11
src/model/io.ts                     # migrations[10]
src/model/data-quilt.ts             # dayColor, lastEntry, nextDays, setMade, setBlockMade; replan prunes blocksMade
src/model/data-pending.ts           # applyPending, mergePending (pure)
src/model/print/data-steps.ts       # daySteps, blockSteps
src/model/print/prefs.ts            # stepsNotes
src/storage/idb.ts                  # VERSION 4, stores known + pending
src/storage/known.ts                # rememberKnown, knownProjects, forgetKnown
src/storage/pending.ts              # getPending, putPending, removePending
src/storage/read-project.ts         # readProjectDoc (draft or handle, no load)
src/stores/project.ts               # load(): apply pending; open/save: rememberKnown
src/stores/data-quilts.ts           # list, read docs, data sources (write routing), steps input
src/layouts/MainLayout.vue          # Data Quilts nav item
src/router/routes.ts                # /data, /data/steps
src/pages/DataQuiltsPage.vue        # the list
src/pages/DataStepsPage.vue         # Print instructions / Block by block printout
src/pages/HomePage.vue              # calendar icon on rows
src/components/DataEntryDialog.vue  # calendar, entry form, preview, footer
src/components/DataCalendar.vue     # year calendar (dots, badges, selection)
src/components/DataDayForm.vue      # series inputs, Cut, Assembled, Block assembled
src/components/PrintPreview.vue     # kind 'steps'
src/help/guides/data-quilts.md      # making section (FR-007)
src/dev/checklist.ts                # checks
public/schemas/rrq.v11.json, formats.json
test/vitest/__tests__/model/…       # see quickstart
```

**Structure Decision**: the existing single-project layout; model logic framework-free in
`src/model/`, device storage in `src/storage/`, UI in pages/components as for other modules.

## Phases (for tasks)

1. **Format v11** and model helpers (marks, colors, last entry, next days), tests.
2. **Device stores** (`known`, `pending`, read without load), `load()` applies pending, tests.
3. **Data Quilts page** + nav + Home icon.
4. **Data entry dialog** (calendar, form, preview, write routing).
5. **Steps model** + `PrintPreview` kind `steps` + `/data/steps` (Days, Block by block, notes toggle).
6. Help, checklist, layout of fixtures for release (`project-v11`, `demo-v11` with marks).

The Design tab's Data entries (DataInspector) stay as they are; the dialog is the new home for
entering data, and the inspector may later link to it.

## Risks

- Permission prompts per file (Chromium) can feel heavy; mitigated by on-demand **Show** and the
  session cache. Not testable in Firefox.
- Pending applied while the same project is edited elsewhere: last write wins per day; acceptable
  (one quilter, one device).
- `PrintPreview.vue` is large; the `steps` kind adds a branch in `logical` rather than a new
  component, to reuse pagination.

## Complexity Tracking

None.
