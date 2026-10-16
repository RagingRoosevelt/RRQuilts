# Implementation Plan: More Layouts and Pieced Borders

**Branch**: `feat/more-layouts` | **Date**: 2026-10-16 | **Spec**: `spec.md`

## Summary

Four layout presets and the pieced border styles, all on the spec 016 engine, all painted pieces.
Variable Point is On-Point stretched (generated as On-Point, then scaled vertically by H ÷ W, with
its spaces turned into patches). One Patch and the tumbling blocks are lattices of plain cells,
clipped (Trimmed) or not (No fill). Pieced borders reuse the strip pattern cells (spec 017) mapped
onto each side, with square corners. Format v6.

## Technical Context

TypeScript strict, Vue 3 + Quasar, TypeBox, Vitest, no new dependencies. Model framework-free.

## Constitution Check

I–IV pass (offline, static, v6 with migration and published schema, nothing silently dropped). V:
the strip pattern geometry is factored once and used by strips and borders (two real uses). VI n/a.

## Design

- **Kind `patch`**: plain spaces that never take blocks (spec 016 FR-024), id prefix `p:` (slot
  group `patch`, a plain group), so Paint, All, and Alternate work as on sashing.
- **Variable Point** (`presets.variablePoint`): `onPoint` with side W/√2, then every outline,
  transform, cut, edge, and bounds scaled by `[1, 0, 0, H/W]`; ids `b:` → `p:`, kind block/set →
  patch. Floating cut shapes scale too (they print as templates).
- **One Patch** (`presets.onePatch`): one band per shape (cells below), clipped to
  `cols × stepX` by `rows × stepY` when Trimmed; No fill keeps whole cells inside the counts.
  Squares, Rectangles (w × h), Bricks (w × h, odd rows shifted w/2), Half-square triangles (w × h
  cell, two triangles, alt by triangle), Equilateral triangles (side s, up/down), 60° diamonds (side
  s), Hexagons (pointy-top, side s), Tumblers (top w, bottom w/2·…; trapezoids alternating up/down),
  Clamshells (radius r, arcs), Octagons and squares (octagon side s with squares at the corners).
- **Tumbling blocks** (`presets.tumbling(W, T, S)`): cube = three parallelograms (top, left, right)
  on a lattice `a = (W, 0)`, `b = (W/2, S + T/2)`; Baby Blocks = W = s√3, T = S = s. Alt = face.
- **Strip pattern cells** factored out of `presets.strips` into `stripCells(style, L, w, n, across,
  idOf)` returning bands in strip-local coordinates; strips call it per strip, borders per side.
- **Borders** (`borders.ts`): for a pieced style, each side is a strip of the inner length (corners
  excluded) mapped by the side's affine (top, right, bottom, left; "out" = away from the center),
  plus four corner squares (`border:n:corner:tl` …). Points Out/In = Points A with the apex at the
  outer/inner edge. Big & Little = alternating full and half-size units. Tile On Point = Diamonds;
  Tile Squares = Blocks with square tiles (count from length ÷ width); Tile On Point Corners =
  corners split into a diamond and four triangles. Aligned styles take counts from the straight set
  layout (columns, rows), else the border's counts. Counts default to length ÷ width, rounded.
- **Format v6**: `VariablePointLayout`, `OnePatchLayout`, `TumblingLayout` (`baby-blocks` and
  `variable-blocks`), migration 5 for placeholders; border schema unchanged.
- **UI**: LayoutInspector sections per style, wizard cards (+ One Patch shape step), Borders
  inspector counts for pieced styles, hover label "Patch".

## Project Structure

```text
src/model/schema/quilt.ts, project.ts, io.ts, units.ts
src/model/layout/presets.ts, borders.ts, slots.ts, strips.ts; src/model/plain.ts; src/editor/scope.ts
src/components/LayoutInspector.vue, QuiltWizard.vue, BordersInspector.vue; src/pages/QuiltEditorPage.vue
test/vitest/__tests__/model/layout-more.spec.ts, borders-pieced.spec.ts
public/schemas/rrq.v6.json, formats.json; specs/003 slot ids; help; CLAUDE.md
```

## Complexity Tracking

None.
