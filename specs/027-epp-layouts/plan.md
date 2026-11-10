# Implementation Plan: English Paper Piecing (EPP layouts, rosettes, multi-select)

**Branch**: `027-epp-layouts` | **Date**: 2026-11-10 | **Spec**: [spec.md](spec.md), with
[050 rosettes](../050-epp-stamps/spec.md) and [051 multi-select](../051-epp-multiselect/spec.md)

**Input**: Feature specifications 027, 050, 051 (clarified 2026-11-10). Prototypes in the
`proto/epp-090` worktree (`prototypes/epp/`, `epp-core.js`) as reference, not code to copy as is.

## Summary

EPP shapes and rosettes become their own library item types in an **EPP** section of Libraries and
the project page. One framework-free EPP model (`src/model/epp/`: geometry, snapping, the four patch
checks, expansion, gaps and splits through the existing arrangement code) drives one canvas
(`EppCanvas.vue` on `useViewport`) shown three ways: a **shape editor** (outline tools, Multi-shape),
a **rosette editor** (Free / Grow / Grid placement, Close space, block-style colorings) and the
Design tab of an **EPP quilt** (a `Quilt` with layout style `epp`: 1U length, seam allowance, edge,
borders when the edge is made). Printing turns expanded pieces into paper and fabric templates with
the existing print pipeline. Format: rrq v12, rrqlib v8, new `.rrqepp`.

Build order (owner, 2026-11-10), each phase stops for the owner to try it:
1. **MVP**: format and model, EPP section, shape editor, rosette editor.
2. EPP quilt type (Layout, Borders, edges, 1U) and printing.
3. Multi-select (051) and rosettes in block quilts (027 FR-015).

## Technical Context

**Language/Version**: TypeScript (strict), Vue 3, Quasar 2 (app-vite)

**Primary Dependencies**: existing only (Pinia, Immer, TypeBox). No new dependency.

**Storage**: `.rrq` v12 (`project.eppShapes`, `project.rosettes`, `EppLayout`, `quilt.epp`); `.rrqlib`
v8 (item types `epp-shape`, `rosette`); new `.rrqepp` v1; settings `libraryType` and `projectTab`
gain `epp`, new EPP editor settings (vertex grid snapping, angle step, placement mode).

**Testing**: Vitest for `model/epp` (checks, snap, expand, arrangement faces, counts), format
round-trips and library parsing; Tests tab checklist for the editors.

**Target Platform**: evergreen browsers, desktop and touch (iPad, phones).

**Project Type**: static offline PWA (single project).

**Performance Goals**: drag and snap at 60 fps with up to 3000 pieces; Grow hover fit test for every
picker shape under 16 ms; print of a 2000-piece quilt builds under 1 s.

**Constraints**: offline; untrusted files validated; framework-free model (lint forbids Vue/stores in
`src/model`); frozen project edited only through `project.change`.

**Scale/Scope**: shapes up to 24 corners; rosettes up to 500 pieces; quilts up to 5000 pieces.

## Constitution Check

| Principle | Check | Status |
| --- | --- | --- |
| I. Static & Serverless | Client only; new routes `/project/shape/:id`, `/project/rosette/:id` use the existing SPA fallbacks. | Pass |
| II. Offline-First | No network; starter shapes and rosettes are bundled in the built-in library. | Pass |
| III. Open File Formats | rrq v12 and rrqlib v8 with migrations (identity), validation of new fields, published schema, fixtures at release; `.rrqepp` carries format and version. | Pass |
| IV. User Owns Their Data | Edits go through `project.change` (drafts, undo); unsaved-work warnings unchanged; library items embedded in projects. | Pass |
| V. Simplicity | No new dependency; reuses viewport, arrangement, colorings, print pieces, offset, packing, library plumbing. New abstractions each have at least two uses (one EPP engine for three editors). | Pass |
| VI. Content Licenses | Shapes and rosettes carry itemBase credits and licenses; copied rosettes add their authors; pack license checks apply. | Pass |

Re-checked after Phase 1 design: unchanged, Pass.

## Project Structure

### Documentation (this feature)

```text
specs/027-epp-layouts/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ui.md
│   └── formats.md
└── tasks.md            (next: /speckit-tasks)
```

### Source Code (repository root)

```text
src/model/schema/epp.ts          EppShape, InternalShape, Rosette, EppLayout, EppPiece (TypeBox)
src/model/schema/{project,quilt,library}.ts   new fields and item types
src/model/io.ts                  VERSION 12, migrations[11]
src/model/epp/
├── geometry.ts                  place, outline edges, lengths, angles, convexity, overlaps
├── checks.ts                    checkOutline: closes, simple, wholeUnits, convex
├── snap.ts                      edge snapping (equal, short-on-long, marked), grid lattices
├── grow.ts                      attach to a free edge, fit test per shape
├── expand.ts                    pieces → polygons with fills (rosettes, internal shapes)
├── faces.ts                     Multi-shape split, Close space, Auto-close (geometry/arrangement.ts)
├── rosette-ops.ts               make, copy-in (no nesting), break into patches, colorings
└── print.ts                     templates and counts (print/pieces.ts, polygon.ts offset, pack.ts)
src/model/epp-file.ts            .rrqepp read/write
src/model/library*.ts, library-file.ts, library-items.ts   item types, syncDraft embedding
src/content/epp.ts               starter shapes and rosettes (built-in library)
src/stores/epp-editor.ts         tool, placement mode, grid, picked item, scale, selection
src/components/EppCanvas.vue     drawing + gestures (useViewport)
src/components/EppPicker.vue     shapes/rosettes picker with Scale, fit colors
src/components/EppLayoutSection.vue   1U, seam, edge (Layout tab)
src/pages/ShapeEditorPage.vue, RosetteEditorPage.vue
src/pages/{LibrariesPage,SketchbookPage,QuiltEditorPage}.vue, components/PrintPreview.vue   EPP branches
test/vitest/__tests__/model/epp/*.spec.ts, model/epp-file.spec.ts, library EPP tests
```

**Structure Decision**: Single project, following the existing layout: model in `src/model` (pure),
stores, components, pages; tests mirror `src/model`.

## Risks and notes

- **Library readers assume "not a block = a palette"** (`withSources`, `parseLibraryValue`): each
  needs an explicit branch; a test guards it (research R2).
- **Spec fixes found in review (2026-11-10)**, to apply before tasks: 050 FR-007 garbled clause;
  050 "Rosette edges" whole-unit rule now has exceptions (marked edges, Close space shapes); 056 join
  order needs a format field (outside this feature).
- **Quilt editor size**: `QuiltEditorPage.vue` is large; the EPP Design tab is its own component
  (`EppCanvas` + picker) mounted by a `layout.style` branch, not mixed into block tools.
- **Help**: new guides (EPP shapes, rosettes, EPP quilts) in `src/help/guides/`, following the help
  style rules, as each phase lands.

## Complexity Tracking

No violations.
