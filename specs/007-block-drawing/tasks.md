---
description: "Tasks for 007 Drawing Your Own Blocks"
---

# Tasks: Drawing Your Own Blocks (Seam-Line)

## Phase 1: Model & pure operations

- [x] T001 Schema: optional `Source.library/author/license/derived`, `Coloring.name`; regenerate schema; starter content fills attribution
- [x] T002 `src/editor/draw-ops.ts` + tests: addLine, addArc, addGrid, deleteSegments, cloneSegments, transformSegments (rotate/flip ×4/resize about a center), moveNode, splitSegmentAt, addNodes (mid/thirds/N/crossings), deleteNode, setArcSweep (sagitta), toGuides
- [x] T003 `src/editor/snap.ts` + tests: nodes → seams → grid (step/divisions), radius in screen px
- [x] T004 `src/editor/block-ops.ts` + tests: newBlock (size, units snap default), editCopy (new id, "(2)" name, source derived), markDerived on edit, coloring save-as-new / rename / delete (≥1)

## Phase 2: Viewport & rendering

- [x] T005 `src/composables/viewport.ts`; refactor `QuiltCanvas.vue` onto it (no behavior change)
- [x] T006 `src/render/draw-block.ts`: block at design scale, patches (light fill or coloring), seams, unconnected seams highlighted, nodes, selection, guides (dashed), graph paper, snap preview

## Phase 3: Block editor

- [x] T007 `components/BlockCanvas.vue`: Line/Arc/Grid drag with snapping + preview (Space flips arc), Select (tap/shift/marquee), Node (drag, double-tap to split), arc bulge handle, Pan; pointer readout + live seam length
- [x] T008 `components/BlockInspector.vue`: block settings (name, size, snap mode/step/divisions, snap toggles, graph paper), selection ops, node ops, unconnected count, attribution line
- [x] T009 `pages/BlockEditorPage.vue`: modes Draw / Color / Print, tool rail, Color mode (Paint/Spray/Eyedropper on block patches), colorings strip (save as new, switch, rename, delete), undo/redo, Ctrl/Cmd+A, Delete key; route `/project/block/:id`

## Phase 4: Integration

- [x] T010 Sketchbook: New block dialog, Edit (one-time in-use notice), Edit a copy; notecard shows attribution
- [x] T011 Quilt tray: coloring picker for blocks with several colorings; `applyTool` set uses it
- [x] T012 Performance test: 200-seam edit cycle < 100 ms (model); quickstart; `CLAUDE.md`; `make commit`
