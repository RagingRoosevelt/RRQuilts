# Tasks: Shaped Blocks

## Phase 1: Model

- [x] T001 Shape module `src/model/blocks/shape.ts` (outline, proportions, size, symmetry, fitShape, lattice) + tests
- [x] T002 Format v7: block `shape`, rotation steps, `shaped-blocks`/`diamond-point` layouts, `flow`; migration baby-blocks → variable-blocks; regenerate JSON schema
- [x] T003 `deriveSeamPatches` uses the shape outline; `placementMatrix` uses shape symmetry

## Phase 2: Layouts and placement

- [x] T004 `asBlocks` + Shaped Blocks preset; Baby Blocks as blocks; Diamond Point; layout defaults, convert/reconcile
- [x] T005 Flow angle on One Patch (triangles/diamonds/hexagons), Shaped Blocks, Baby Blocks, Variable Patch
- [x] T006 Set checks shape; Rotate steps by turns; Paint on empty block spaces (plain fill)
- [x] T007 slot-ids contract + spec 018/001 notes

## Phase 3: Block editor

- [x] T008 New block dialog: shape + leg/width/height size
- [x] T009 Canvas outline + triangle grid; snapping to lattice and shape corners/edges; inspector size for shapes

## Phase 4: Wizard and Layout tab

- [x] T010 Blocks/Patches toggle, Shaped Blocks and Diamond Point cards, Variable Patch label, flow slider (wizard + LayoutInspector)

## Phase 5: Content and docs

- [x] T011 Starter shaped blocks (log cabins + owner's pictures)
- [x] T012 Help topics (designing a quilt, drawing blocks), CLAUDE.md, specs 001 and 018 updated

## Phase 6: Follow-ups

- [x] T013 Starter shaped blocks by type of block (Mosaics, Stars, Strips/Log Cabin, Curves); Kentucky, Columbia, Old Glory, Hexagon Beauty, Hexagon Orange Peel (curved starter defs)
- [x] T014 Block sidebar filters: Fits layout (pictures) and Shape (outlines); wizard pictures shared via `src/render/layout-samples.ts`
