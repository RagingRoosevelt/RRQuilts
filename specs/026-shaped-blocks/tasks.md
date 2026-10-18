# Tasks: Shaped Blocks

## Phase 1: Model

- [ ] T001 Shape module `src/model/blocks/shape.ts` (outline, proportions, size, symmetry, fitShape, lattice) + tests
- [ ] T002 Format v7: block `shape`, rotation steps, `shaped-blocks`/`diamond-point` layouts, `flow`; migration baby-blocks → variable-blocks; regenerate JSON schema; fixture
- [ ] T003 `deriveSeamPatches` uses the shape outline; `placementMatrix` uses shape symmetry

## Phase 2: Layouts and placement

- [ ] T004 `asBlocks` + Shaped Blocks preset; Baby Blocks as blocks; Diamond Point; layout defaults, convert/reconcile
- [ ] T005 Flow angle on One Patch (triangles/diamonds/hexagons), Shaped Blocks, Baby Blocks, Variable Patch
- [ ] T006 Set checks shape; Rotate steps by turns; Paint on empty block spaces (plain fill)
- [ ] T007 slot-ids contract + spec 018/001 notes

## Phase 3: Block editor

- [ ] T008 New block dialog: shape + leg/width/height size
- [ ] T009 Canvas outline + triangle grid; snapping to lattice and shape corners/edges; inspector size for shapes

## Phase 4: Wizard and Layout tab

- [ ] T010 Blocks/Patches toggle, Shaped Blocks and Diamond Point cards, Variable Patch label, flow slider (wizard + LayoutInspector)

## Phase 5: Content and docs

- [ ] T011 Starter shaped blocks (log cabins + owner's pictures)
- [ ] T012 Help topics, CLAUDE.md, Obsidian-free docs; specs updated
