---
description: "Tasks for 006 First Quilt"
---

# Tasks: First Quilt

**Input**: `/specs/006-first-quilt/` (spec.md, plan.md, research.md)

## Phase 1: Setup & model

- [x] T001 Add `immer@11`; switch `paint`, `applyLayout`, `applySeamEdit`, `convertUnits` to `produce` (tests unchanged and passing)
- [x] T002 `src/model/coloring.ts`: `paint(quilt, slotIds, patchId, fill)`, `spray(quilt, slotIds, matchFill, fill)`, `swap(quilt, matchFill, fill)`; copy-on-write across the target set; tests
- [x] T003 `src/model/plain.ts`: `ensurePlainBlock(doc)`, `slotGroup(slotId)` (`block` / `sash` / `cs` / `border:n`), `ensureSlotContent(quilt, slotId)`; tests
- [x] T004 `src/editor/scope.ts`: resolve This/All/Alternate → slot ids (blocks: same block + checkerboard parity; plain pieces: slot group); tests
- [x] T005 `src/content/starter.ts`: 12 seam-drawn blocks + sample-point colorings + 36 colors; `createProject` includes them; test every block derives the expected patch count and colorings cover every patch

## Phase 2: Undo

- [x] T006 `src/editor/undo.ts`: history of Immer patch pairs, 200-step cap, coalesce same key within 1 s; tests
- [x] T007 `stores/project.ts`: `change(recipe, { coalesce? })` via `produceWithPatches`; `undo`/`redo`/`canUndo`/`canRedo`; history cleared on load/close/takeover; keyboard shortcuts

## Phase 3: Renderer

- [x] T008 `src/render/paths.ts`: block → `Path2D` per patch in design space (L / A via center+radius / C), cached by block object identity
- [x] T009 `src/render/draw.ts`: draw slots (fills, hatch for unfilled, outlines toggle), borders, selection/hover highlight; view transform (zoom/pan/fit)
- [x] T010 `src/render/hit.ts`: point → `{ slotId, patchId }`; uses cached model polygons (testable in Node, no `isPointInPath`)
- [x] T011 `src/render/thumbnail.ts`: quilt/block → data URL, cached by revision

## Phase 4: Quilt editor

- [x] T012 `stores/editor.ts`: mode, tool, scope, selected block/color, recent colors, view per quilt
- [x] T013 `components/QuiltCanvas.vue`: canvas sizing (devicePixelRatio), rAF redraw, pointer/touch (tap, drag-pan, pinch, wheel), hover size readout, Fit
- [x] T014 `pages/QuiltEditorPage.vue`: mode tabs, tool rail, inspector, bottom bar (Apply to, tray); finished/center size always visible
- [x] T015 Layout mode inspector: cols/rows, block size (lock square), sashing (lock), sash border; drop warning with count
- [x] T016 Borders mode inspector: list (select/add/insert/delete/clone/reorder), style (3 + "coming soon"), side sizes with locks
- [x] T017 Design tools: Set, Rotate, Flip, Erase, Find; Paint, Spray, Swap, Eyedropper; Pan
- [x] T018 `components/PaletteTray.vue` + `ColorEditor.vue`: blocks tab, colors tab (recent first), add/rename/reorder/delete color

## Phase 5: Sketchbook & wizard

- [x] T019 `components/QuiltWizard.vue` (3 skippable steps, defaults FR-001) from Home and sketchbook
- [x] T020 `pages/SketchbookPage.vue`: tabs, cards with thumbnails, open, duplicate as variation, notecard edit, drag reorder, guarded delete; block preview dialog

## Phase 6: Polish

- [x] T021 Performance check: 30×30 quilt set/paint < 100 ms (perf test on model ops + manual on canvas)
- [ ] T022 `CLAUDE.md` (render/editor modules, Immer + Vue rules); quickstart manual run; `make commit`

## Dependencies

Phase 1 → 2 → 3 → 4 → 5 → 6. T002–T005 parallel after T001. T008–T011 parallel.
