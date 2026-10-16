# Implementation Plan: Strip Layouts

**Branch**: `017-strip-layouts` | **Date**: 2026-10-16 | **Spec**: `spec.md`

## Summary

Strip quilts become a layout-engine preset: each strip is one band whose repeating cell is its
style's pieces, stepped along the strip and clipped at the quilt's ends. Strips carry lasting ids, so
content follows a strip through insert, delete, and swap. The Layout tab gets a strip list and two
toolbar tools (Swap strips, Strip style). Project format v5 (shared with spec 016; both unreleased).

## Technical Context

TypeScript strict, Vue 3 + Quasar, Pinia, Immer, TypeBox, Vitest; no new dependencies. Storage: `.rrq`
v4 → v5 (one new version with spec 016). Performance: 24 strips × 100 units regenerate without a visible pause. Model stays
framework-free.

## Constitution Check

I–IV pass (static, offline, v5 with migration and published schema, nothing dropped silently: the
removal warning covers style changes and deletes). V: no new abstraction; the engine is reused as is.
VI not affected. Re-checked after design: unchanged.

## Design

### Data (project v5)

`StripLayout = { style: 'horizontal-strip' | 'vertical-strip', length, strips: Strip[] }`,
`Strip = { id, style, width, along, across }` (`id` = `newId()`, lasting; `across` used by Checker
Board only). The two placeholder styles leave `OtherLayout`; migration 5 → 6 gives placeholders the
default strips (spec Assumptions). Switching direction only changes `style`.

### Geometry (strip-local: x along 0…L, y across 0…w; Vertical turns the whole by the engine map)

`u = L / along`. Foreground pieces have alt 0, background alt 1.

| Style | Pieces per unit k (clipped at x = 0 and L) | Square / 90° when |
|---|---|---|
| Plain | one `L × w` rectangle | — |
| Pieced Blocks | block `u × w` at `k·u` | `w · along = L` |
| Half Drop Blocks | blocks at `k·u − u/2`, k = 0…along (ends are half blocks, placed whole) | same |
| Points A | point: triangle base `[k·u, (k+1)·u]` on the bottom edge, apex at top middle; background: triangle base on the top edge between apexes (ends halved) | `2w · along = L` |
| Points B | Points A shifted half a unit (ends are half points) | same |
| Diamonds | diamond with tips at the unit's edge midpoints; background: triangles on top and bottom edges between diamonds (ends: corner triangles) | `w · along = L` |
| Half Drop Diamonds | Diamonds shifted half a unit | same |
| Double Diamonds | two Diamonds rows, each `w/2` wide, aligned | `(w/2) · along = L`, i.e. `w · along ÷ 2 = L` |
| Half Drop Double Diamonds | as Double Diamonds, second row shifted half a unit | same |
| Spaced Squares | square of side `min(w, u)` centered in each unit; spacers between (ends included) | — |
| Checker Board | `along × across` grid of rectangles, checkerboard alt | `L / along = w / across` |

### Ids (contract addition, `contracts/slot-ids.md`)

- Block spaces: `b:s{strip}:{k}` (Half Drop: k = 0…along).
- Plain pieces: `strip:{strip}:{code}{k}` — `p` plain, `f` foreground (point, diamond, square,
  checker dark), `g` background, `f2`/`g2` second row of double diamonds, checker `c{k}.{m}`.
- `slotGroup` = `strip:{strip}` for plain pieces (All and Alternate act within a strip), `block` for
  block spaces. New `SlotKind` `strip` (plain; never takes blocks, spec 016 FR-024).

### Editing

- Model ops (`src/model/layout/strips.ts`): `addStrip`, `insertStrip`, `deleteStrip`, `swapStrips`,
  `setStripStyle`, `stripOf(slotId)`, `fitSquare` (count or length from the formulas).
- Editor store: `selectedStrip`, layout tools `swap-strips` and `strip-style` (with `stripStyle`
  cycling on repeat click), pending swap cleared by Escape or a second tap on the same strip.
- Layout tab: tapping the canvas selects a strip (or applies the active layout tool).

## Project Structure

```text
src/model/schema/quilt.ts, project.ts, io.ts (v5 migration 4), units.ts
src/model/layout/presets.ts (strips preset), strips.ts (ops), slots.ts (dispatch, convertLayout)
src/model/plain.ts (slotGroup strip:), src/editor/scope.ts (kind strip)
src/stores/editor.ts, src/components/LayoutInspector.vue (+ StripsInspector.vue),
src/pages/QuiltEditorPage.vue (layout tools, Escape), src/components/QuiltWizard.vue
public/schemas/rrq.v5.json, formats.json; specs/003 slot-id contract; help; CLAUDE.md
test/vitest/__tests__/model/layout-strips.spec.ts
```

## Complexity Tracking

None.
