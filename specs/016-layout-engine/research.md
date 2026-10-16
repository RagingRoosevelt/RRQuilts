# Research: Shared Layout Engine

## R1. What the engine is

- **Decision**: A pure function `tile(spec) → Slot[]` over a `Tiling`: one or more *bands*, each a
  repeating cell (pieces with outline, shape, kind, block mapping) stepped by two vectors over an
  index range; the whole turned/sheared by one affine map; then clipped to the quilt rectangle and
  finished at the edge. Strips are a stack of bands each stepped along one vector. Presets are small
  functions `params → Tiling` (`horizontal`, `onPoint`, and test-only presets for the rest).
- **Rationale**: Every layout in FR-002a is "the same pieces again, shifted": a lattice. Turn and
  shear are one affine map, so On-Point and Variable Point need no special code. Bands cover strips
  (each strip its own cell and count) without a second model.
- **Alternatives**: one generator per style (today's pattern) – rejected by spec 001 FR-029c; a
  general polygon tiler (Wallpaper groups) – far more than the planned layouts need.

## R2. Ids stay position-based and Horizontal-identical

- **Decision**: The cell piece supplies an id function of its lattice index (`(i, j) → id`), and an
  `alt` class. Horizontal's preset reproduces today's ids and today's order (blocks, vertical
  sashes, horizontal sashes, cornerstones) by emitting kinds in that order. On-Point ids: see
  `contracts/slot-ids.md`.
- **Rationale**: ids are the join key for placed content; SC-001 compares old and new generators over
  a sweep, so the old `horizontal.ts` is kept as the test oracle until the sweep passes, then removed.

## R3. Alternate scope without parsing ids

- **Decision**: `Slot` gains `alt: number`; `scope.ts` uses it instead of the digit-sum `parity`.
  Horizontal sets `alt = (r + c) % 2` (identical to today's parity for blocks, sashes, cornerstones);
  On-Point sets it from lattice parity (main grid vs between blocks), which is what "alternate"
  means on point. Hexagon grids (later) need three classes, so it's a number, not a boolean.
- **Alternatives**: keep parsing ids – breaks for `b:m:` ids and every later grammar.

## R4. Clipping and partial spaces

- **Decision**: Straight cells are clipped to the quilt rectangle with convex polygon clipping
  (Sutherland–Hodgman, a few lines). Curved cells (clamshell, spool) are clipped with the existing
  `arrange()` (cell outline + rectangle as seams; keep faces inside both). A clipped space keeps its
  full-cell `transform` (the block maps to the whole space) and its `outline` becomes the visible
  part. Drawing already clips content to `outline`; hit testing switches to the flattened outline
  (`pathPolygon`) so arcs work.
- **Rationale**: "show only the part inside, but the block is whole" (US2-3) is exactly outline ≠
  transform, which the slot model already has.

## R5. Setting pieces and the four edge finishes

- **Decision**: On-Point's lattice runs one ring beyond the blocks. The quilt rectangle passes
  through the outer block points (Exact) or Float beyond them (Floating).
  - *Exact / Floating*: outer-ring cells clipped to the rectangle become plain `set:` spaces (kind
    `set`); with Floating, adjacent clipped cells along the edge meet on the continued diagonal row
    seam. Each carries `cut`: the right-isosceles triangle to cut (side: hypotenuse on the edge →
    quarter-square; corner: legs on the edges → half-square). Exact `cut` = outline; Floating `cut`
    = the smallest such triangle containing it ("cut oversized, trim after").
  - *Trimmed blocks*: the same outer-ring cells become `b:m:` block spaces (partial), clipped.
  - *No fill*: no outer ring, no clip; `Generated.edge` is the zigzag; borders are skipped.
- **Corner style "seam"**: the corner cell is split along the continued side seam into two
  smaller quarter-square pieces (`…:1`, `…:2`).
- **Rationale**: one mechanism (outer ring + clip) gives all four finishes; rotary cutting already
  recognises half- and quarter-square triangles with the right grain when the pieces are axis-aligned
  to the quilt edge (`rotary.ts`), so `cut` only needs to be the shape, in quilt coordinates.
- **Check**: SC-003 formulas (side: diag + 1¼″ cut twice; corner: side ÷ √2 + ⅞″ cut once) come out of
  `cutFor` with ¼″ seams: QST cut = long + 2(1+√2)·¼ = long + 1.207″ (formula: + 1¼″); HST cut = leg +
  (2+√2)·¼ = leg + 0.854″ (formula: + ⅞″); both round up to the same ⅛″ (8″ block: 12⅝″, 6⅝″).

## R6. Printing and yardage

- **Decision**: `quiltPieces` uses `slot.cut ?? slot.outline` for plain pieces (today: outline), and
  keeps using the full-block transform for blocks, so trimmed partial blocks count whole (clarified).
  Block size for print comes from new `Slot.size` (finished w × h) instead of `transform[0]/[3]`
  (wrong once turned). Trimmed/floating quilts get a printed note "Trim the quilt top to the marked
  edge" and the quilt diagram draws the edge.
- **Binding**: `binding()` takes a perimeter instead of `w, h` (callers pass `2(w + h)` today);
  `Generated.edge` perimeter is used, so No fill measures along the zigzag.

## R7. Shapes and turns

- **Decision**: `Slot.shape: SpaceShape` = `'rect' | 'triangle' | 'diamond60' | 'hexagon' |
  'clamshell' | 'spool' | 'piece'` (`piece` = setting/partial/irregular: plain fill only) and
  `Slot.turns: number` (degrees between allowed block turns: 90 rect-square, 180 rectangle/diamond/
  spool, 120 triangle, 60 hexagon, 360 clamshell). Placement accepts only `rect` blocks into `rect`
  spaces now (FR-003). The stored `SlotContent.rotation` stays 0/90/180/270 for this feature; block
  shapes (FR-060a) widen it with a format bump when they land.
- **Rationale**: the space carries everything placement needs; widening the stored rotation now would
  be a format change with no user (Principle V).

## R8. Triangle grid and merging (FR-029d)

- **Decision**: The triangle grid is a band whose cell holds two triangles (up, down) on vectors
  `(s, 0)` and `(s/2, s·√3/2)`. A merge is a list of covered triangle ids; the merged space's
  outline is the union boundary (via `arrange()` with shared edges dropped), its id is
  `{shape}:{first covered id in reading order}`. Presets (Baby Blocks, Star, Hexagons and Triangles)
  are merge patterns repeated by the lattice. Test-only in this feature.

## R9. Format v5

- **Decision**: Project format `VERSION` 4 → 5. New `OnPointLayout` in the `Layout` union
  (`style 'on-point'`, `cols`, `rows`, `block` (side), `sash`, `corner: 'triangle' | 'seam'`,
  `edge: { finish: 'exact' | 'float' | 'trim' | 'none', float }`); `on-point` leaves `OtherLayout`.
  Migration 4→5: a placeholder `{ style: 'on-point' }` gets defaults (3 × 3, 12″ block… scaled to
  the project's units, no sashing, triangle corners, float 1″); everything else unchanged.
  `units.ts` scales On-Point lengths. Regenerate `public/schemas/rrq.v5.json`, `formats.json`.
- **Rationale**: Principle III (schema change = version + migration).

## R10. Performance

- **Decision**: Generated slots are memoised per `(layout, borders)` object (already a `computed`);
  100 × 100 On-Point ≈ 20 000 spaces – same order as Horizontal at 100 × 100 with sashing (≈ 40 000),
  which already draws acceptably. No spatial index unless SC-005 fails.
