# Implementation Plan: Drawing Your Own Blocks (Seam-Line)

**Branch**: `007-block-drawing` | **Date**: 2026-10-11 | **Spec**: [spec.md](./spec.md)

## Summary

A block editor (Draw / Color / Print) on the shared Canvas 2D viewport: snapping Line, Arc, and
Grid tools; Select and Node editing; arc bulge handles; guides and graph paper; live patch
derivation through `applySeamEdit` with unconnected seams highlighted; block colorings with
variations; new block / edit / edit a copy with license attribution kept. See
[research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript, Vue 3 + Quasar

**Primary Dependencies**: none new

**Storage**: unchanged; schema additions are optional fields (`Coloring.name`, `Source.library/
author/license/derived`)

**Testing**: Vitest for draw-ops, snapping, sagitta↔sweep, copy/attribution; manual quickstart

**Performance Goals**: < 100 ms per drawing change for ≤ 200 seams (SC-002)

**Constraints**: all edits via `project.change`; model framework-free

## Constitution Check

| Rule | Status | Notes |
|---|---|---|
| I–V | ✅ | No new deps; no network; formats extended with optional fields |
| VI. Content licenses | ✅ | Source attribution kept and marked derived on copies/edits |

## Project Structure

```text
src/model/schema/{shared,coloring}.ts   # optional attribution fields; Coloring.name
src/content/starter.ts                  # starter source attribution
src/editor/
├── draw-ops.ts                         # pure drawing operations
├── snap.ts                             # snapping
└── block-ops.ts                        # newBlock, editCopy, markDerived, coloring variations
src/composables/viewport.ts             # shared zoom/pan/pinch/wheel/fit
src/render/draw-block.ts                # block editor rendering (patches, seams, nodes, guides, grid)
src/components/
├── QuiltCanvas.vue                     # refactored onto useViewport
├── BlockCanvas.vue                     # drawing interactions
└── BlockInspector.vue                  # settings, selection ops, node ops, colorings
src/pages/BlockEditorPage.vue
src/pages/SketchbookPage.vue            # New block, Edit, Edit a copy
src/components/PaletteTray.vue          # coloring picker per block
test/vitest/__tests__/editor/{draw-ops,snap,block-ops}.spec.ts
```

## Complexity Tracking

None.
