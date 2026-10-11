# Implementation Plan: First Quilt

**Branch**: `006-first-quilt` | **Date**: 2026-10-11 | **Spec**: [spec.md](./spec.md)

## Summary

Turn the shell into a working quilt designer: wizard, sketchbook, quilt editor (Layout, Borders,
Design modes) on a Canvas 2D renderer with exact hit-testing, block setting and solid-color tools
with This/All/Alternate scopes, starter blocks/colors, and patch-based undo/redo via Immer. See
[research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript, Vue 3 + Quasar

**Primary Dependencies**: Immer 11 (new); Canvas 2D (browser)

**Storage**: unchanged (004)

**Testing**: Vitest — model ops (scopes, spray, swap, plain pieces, starter derivation), undo
coalescing, hit-testing math; manual quickstart for UI and performance

**Target Platform**: desktop + tablet browsers (touch-first)

**Performance Goals**: < 100 ms per set/paint on 900 blocks; redraw < 16 ms typical

**Constraints**: model stays framework-free; all edits through `project.change`

**Scale/Scope**: ~4 pages/components groups, renderer, 3 model additions, starter data

## Constitution Check

| Rule | Status | Notes |
|---|---|---|
| I–IV | ✅ | No network, no new formats; starter content original, CC-BY-4.0 |
| V. Simplicity | ⚠️ justified | Immer — see Complexity Tracking. No canvas/graphics library |

## Project Structure

```text
src/content/starter.ts          # 12 blocks (seam drawings + default colorings) + 36 colors
src/model/coloring.ts           # paint(slotIds), spray, swap; scope helpers in src/editor/
src/model/plain.ts              # ensurePlainBlock, plain-piece slot groups
src/render/
├── paths.ts                    # block → cached Path2D per patch (design space)
├── draw.ts                     # drawQuilt(ctx, quilt, slots, view)
├── hit.ts                      # point → { slotId, patchId }
└── thumbnail.ts
src/editor/
├── scope.ts                    # resolve This/All/Alternate → slot ids (blocks vs. plain groups)
└── undo.ts                     # Immer patches history with coalescing
src/stores/editor.ts            # tool/mode/scope/selection/recent colors/view
src/stores/project.ts           # change() via Immer + undo/redo
src/components/
├── QuiltCanvas.vue             # canvas, zoom/pan/fit, pointer + touch, hover size
├── PaletteTray.vue             # blocks / colors tabs, recent first, add color
├── ColorEditor.vue             # QColor + HSL
├── QuiltWizard.vue
└── SketchbookCard.vue
src/pages/
├── SketchbookPage.vue          # real sketchbook
└── QuiltEditorPage.vue         # Layout / Borders / Design / Print(coming soon)
test/vitest/__tests__/{model,editor,render}/
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| New runtime dependency: Immer | Undo/redo as tiny patches + structural sharing so edits never copy embedded images | Snapshots copy up to 20 MB per step; hand-written structural sharing makes every edit error-prone |
