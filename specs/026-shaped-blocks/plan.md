# Implementation Plan: Shaped Blocks

**Spec**: [spec.md](spec.md) · **Branch**: `feat/shaped-blocks`

## Approach

- **One shape module** (`src/model/blocks/shape.ts`, framework-free): per shape the outline in the
  block's unit square (normalized to its bounding box), its proportions (height ÷ width), leg ↔ width ↔
  height, the turn step, the symmetry transforms (turn about the centroid, flip left to right) in
  unit-square coordinates, `fitShape` (unit square → a polygon of that shape, no mirror, least turn),
  and the triangle lattice for snapping.
- **Blocks**: optional `shape` on every block kind (absent = square/rectangle). `deriveSeamPatches`
  takes the outline from the shape. Size stays the bounding box.
- **Placement**: `placementMatrix` uses the shape's symmetry transform for rotation/flip.
  `SlotContent.rotation` gains 60° steps (schema + `orient` for squares keeps 90° steps).
- **Layouts**: presets build patch pieces as today; a `asBlocks()` step turns a cell's patch pieces
  into block spaces (`kind: 'block'`, shape, `fitShape` transform, canonical outline, `b:` ids).
  Shaped Blocks = One Patch geometry for triangles/diamonds/hexagons + `asBlocks`. Baby Blocks =
  tumbling geometry at 60° + `asBlocks`. Diamond Point = Variable Point at k = √3 with the diamond
  slots turned into block spaces. Flow angle = `Tiling.map` turn about the quilt's center, band ranges
  widened to cover the turned rectangle, clipped as before.
- **Editor**: Set checks block shape against the slot shape; Rotate steps by `slot.turns`; Paint on an
  empty block space places the plain block (it is clipped to the space).
- **Block editor**: New block dialog gets shape + size (leg/width/height radio); canvas draws the shape
  outline and a triangle grid; snapping uses the lattice and the shape's corners.
- **Wizard / Layout tab**: Blocks/Patches toggle, Shaped Blocks and Diamond Point cards, Variable
  Patch label, flow angle slider.
- **Format v7** + migration (`baby-blocks` → `variable-blocks`). Schema JSON regenerated.
- **Starter blocks**: transcribed into `src/content/shaped.ts` (agents per the block transcription
  workflow), checked for no unconnected seams.

## Constitution check

Static/offline: no new dependencies or network. Open formats: v7 with migration, JSON schema
regenerated. Library attribution unchanged.
