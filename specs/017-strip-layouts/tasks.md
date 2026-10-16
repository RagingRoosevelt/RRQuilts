# Tasks: Strip Layouts

**Model**: `(opus)` tasks by Opus (geometry, ids, data safety); `(sonnet)` may go to Sonnet agents.
Opus reviews every diff. Tests are included (the spec's SC are checks).

## Phase 1: Model (blocking)

- [X] T001 (opus) `StripLayout`/`Strip` schema, `VERSION = 5`, migration 4 (with spec 016's) (placeholders → default
  strips in the project's units), units scaling in `src/model/schema/quilt.ts`, `project.ts`,
  `src/model/io.ts`, `src/model/units.ts`
- [X] T002 (opus) Strips preset: one band per strip, every style per plan.md, ids per contract, alt
  classes, Vertical via map, clip to the quilt in `src/model/layout/presets.ts`; dispatch in
  `slots.ts`; `slotGroup` `strip:{id}` and SlotKind `strip` in `plain.ts`/`slots.ts`
- [X] T003 (opus) Strip ops (`addStrip`, `insertStrip`, `deleteStrip`, `swapStrips`, `setStripStyle`,
  `stripOf`, `fitSquare`) in `src/model/layout/strips.ts`; `convertLayout` handles both directions and
  defaults
- [X] T004 (opus) Tests: every style covers its strip exactly for counts 1…24 (SC-003), unique ids,
  content survives insert/delete/swap (SC-002), formulas give square units within 1/64″ (SC-004),
  migration, Vertical = Horizontal turned, in `test/vitest/__tests__/model/layout-strips.spec.ts`
- [X] T005 (sonnet) Regenerate `public/schemas/rrq.v5.json`, `formats.json`, specs/003 schema;
  fix version-dependent tests

## Phase 2: Editing UI

- [X] T006 (sonnet) Editor store: `selectedStrip`, layout tools `swap-strips`, `strip-style` with
  `stripStyle`, pending swap in `src/stores/editor.ts`
- [X] T007 (sonnet) Strips inspector (list, previous/next, Add, Insert, Delete, Clone, direction,
  length, selected strip's style/width/counts, unit size and square fixes) in
  `src/components/StripsInspector.vue`, wired from `LayoutInspector.vue`
- [X] T008 (sonnet) Layout tab canvas taps: select strip; Swap strips tool (highlight first, Escape /
  same tap cancels); Strip style tool (its button opens a menu of styles; the pick is shown on the button) in
  `src/pages/QuiltEditorPage.vue`, `src/components/QuiltCanvas.vue`
- [X] T009 (sonnet) Wizard cards Horizontal Strip / Vertical Strip; Blocks step asks number of
  strips and length in `src/components/QuiltWizard.vue`
- [X] T010 (sonnet) Hover label "Strip piece"; Set message for strip pieces

## Phase 3: Polish

- [X] T011 (sonnet) Help (designing-a-quilt: strip quilts, tools), slot-id contract in specs/003,
  CLAUDE.md, tracker, spec status
- [X] T012 (opus) Browser check of every story; review; commit
