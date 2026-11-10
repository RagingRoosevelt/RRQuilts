# Research: English Paper Piecing (specs 027, 050, 051)

Decisions for the plan. Each: Decision, Rationale, Alternatives considered.

## R1. Where an EPP quilt lives

- **Decision**: An EPP quilt is a normal `Quilt` with a new layout style `{ style: 'epp', unit, seam,
  edge }` and an optional `epp` field holding its placed pieces. `layout.style` is already the only
  quilt discriminator (`schema/quilt.ts` Layout union); `generateFor` (`layout/slots.ts`) returns no
  block spaces for it.
- **Rationale**: The quilt list, Details, colorways, credits, Borders tab, print routing and the quilt
  wizard all key off `Quilt`. A new style reuses them; the editor branches on `layout.style === 'epp'`
  in the Design tab only (spec 027 FR-014: same Layout and Borders tabs, EPP design engine).
- **Alternatives**: a separate `project.eppQuilts` list (duplicates quilt list, details, printing
  routes); a `kind` field on every quilt (touches every quilt for one type).

## R2. Library item types and project storage

- **Decision**: Two new library item types, `{ type: 'epp-shape', data: EppShape }` and
  `{ type: 'rosette', data: Rosette }`, in `.rrqlib` **v8**. Projects get optional `eppShapes` and
  `rosettes` arrays in **rrq v12**. Both item types use `itemBase` (id, notecard, source, version,
  revision, author, license, credits), so identity, credits and sync work unchanged.
- **Rationale**: Spec 027 FR-007 / FR-013: library items like blocks, in their own EPP section. The
  integration map shows `withSources` (`model/library.ts:619`), `parseLibraryValue`
  (`model/library-file.ts:46`), `lookupOf`, `libraryGroups` and `stores/library.ts` `items` assume
  "not a block = a palette": each gets an explicit branch, and a test proves a v8 library with EPP
  items is never read as palettes.
- **Alternatives**: one `epp` type with a sub-kind (every reader checks two levels); storing shapes as
  blocks with a flag (spec says EPP stays apart from blocks).
- **Follow-up**: the library template (`~/Code/rrquilts-library-template`, `tools/common.py` FORMATS,
  build/validate for the new types), then our own library repos, per CLAUDE.md.

## R3. Shape geometry

- **Decision**: `EppShape.outline` = vertices in units (counter-clockwise, first vertex at 0,0), plus
  `locked?: number[]` (vertex indexes) and `marked?: number[]` (edge indexes deliberately not whole
  units). Checks in one pure function `checkOutline(verts, marked)` → `{ closes, simple, wholeUnits,
  convex }` (spec 027 FR-006 four flags). The prototype's turtle (lengths + angles) is not stored.
- **Rationale**: The shape editor drags corners on a grid (FR-006a); vertices are what it edits.
  Lengths and angles are derived for labels and the Angle tool.
- **Alternatives**: lengths + turns (the prototype's `turtle`; drag editing would have to convert both
  ways, and "closes" was buggy there).

## R4. Rosette geometry and coloring

- **Decision**: `Rosette = itemBase + { shapes?: EppShape-outline[] (internal), pieces: RosettePiece[],
  colorings: Coloring[], colorVariant? }`. `RosettePiece = { id, shape: ItemId | internal id, at: [x, y]
  (units), turn (deg), mirror?, scale (1-4) }`. Colorings reuse `schema/coloring.ts` `Coloring` keyed
  by piece id, exactly as block colorings key by patch id (clarification 2: like blocks, with color
  variants). No nesting (clarification 3): placing a rosette into a rosette copies its pieces and
  internal shapes in, with the current coloring's fills.
- **Rationale**: Reusing `Coloring` brings palette swap, colorway mapping and coloring UI for free.
  No nesting removes cycle checks and recursive expansion.
- **Alternatives**: slot letters (rejected in clarify Q2); live nesting (rejected in Q3).

## R5. Placed pieces in an EPP quilt

- **Decision**: `quilt.epp.pieces: EppPiece[]`, each `{ id, shape?: ItemId, rosette?: ItemId, at, turn,
  mirror?, scale, coloring?: Id, fills?: Record<pieceId, Fill> }` (a shape piece uses `fills['']`).
  Expansion `expand(doc, piece)` → polygons in units with fills; everything else (drawing, overlap,
  print, yardage) works on the expansion.
- **Rationale**: One flat list; a placed rosette is one entry (linked until Break into patches).
  Repaints per placement mirror quilt colorings over a block coloring.

## R6. One editing engine, three presentations

- **Decision**: Framework-free model in `src/model/epp/` (geometry, snap, checks, expand, outer edges,
  overlaps, arrangement-based gap and split), one canvas component `components/EppCanvas.vue` on
  `composables/viewport.ts` (`useViewport`: zoom, pan, pinch, tap/drag routing; reused as the quilt and
  block canvases do), and one tool state in `stores/epp-editor.ts`. Presentations:
  - **Shape editor** `/project/shape/:id` (`pages/ShapeEditorPage.vue`): tools Vertex, Edge, Angle,
    Lock vertex; sidebar Vertex grid snapping (Free / Square / Triangle) and angle step; Single /
    Multi-shape. No paint.
  - **Rosette editor** `/project/rosette/:id` (`pages/RosetteEditorPage.vue`): placement modes Free /
    Grow / Grid, shape and rosette picker with Scale slider, Place rosettes ungrouped, Break into
    patches, Close space, Paint and colorings; Details and Print tabs as the block editor.
  - **EPP quilt** Design tab inside `QuiltEditorPage.vue` when `layout.style === 'epp'`; Layout tab
    gets `EppLayoutSection` (1U, seam allowance, edge); Borders as today, gated on a made edge.
- **Rationale**: Owner, clarify Q1 and FR-014: same engine underneath, separate editors on top.
- **Alternatives**: one page with modes (owner rejected); reusing `BlockCanvas` (its snapping is tied to
  a normalized block `Drawing`, `editor/snap.ts`).

## R7. Snapping and placement modes

- **Decision**: Port the prototype's snap (equal edges end to end, short edges along long ones at
  whole-unit steps, marked edges of length L to L, whole multiples of L, L/2 and L/4, shorter along longer in steps of
  the shorter length) into `model/epp/snap.ts`, in units with a
  reach in screen pixels (`GRAVITY_PX`, `reachOf` from `editor/snap.ts`). Grow = attach the picked
  shape to a tapped free edge (fit test per picker shape for hover colors). Grid = lattice of the
  picked shape (`blocks/shape.ts` `lattice` for triangles and hexagons, squares trivial), offset by the
  grid drag, snapped to a placed edge.
- **Rationale**: The owner liked prototype A's snapping; B and C behaviors become modes.
- **Performance**: candidate edges filtered by bounding box before the exact test; target 60 fps
  drag up to 3000 pieces (largest garden quilts are about 2000).

## R8. Multi-shape split, Close space, Auto-close

- **Decision**: All three use `model/geometry/arrangement.ts` `arrange()` (segments → faces), already
  used to turn block seams into patches:
  - **Multi-shape**: the drawn outline plus lines across it → faces → internal shapes of a new rosette.
  - **Close space**: placed pieces' edges → the bounded face under the tap that no piece covers → an
    internal shape.
  - **Auto-close** (EPP quilt edge): pieces' outer edges + the straight bounding rectangle → faces
    between them → closing pieces (internal shapes of the quilt), filled with the chosen fill.
- **Rationale**: One proven algorithm; faces come out as simple polygons ready for the four checks.
- **Alternatives**: polygon boolean library (new dependency, Principle V).

## R9. Printing

- **Decision**: Every EPP patch, wherever it is placed (rosette editor, EPP quilt, rosette in a block
  quilt), prints both a paper template and a fabric cutting template. EPP quilts and rosettes print
  through `PrintPreview`: expanded pieces become `Piece`s
  (`model/print/pieces.ts`); paper templates = the polygon, fabric templates = `print/polygon.ts`
  `offset(poly, seam)`; packing `print/pack.ts`; counts by shape, scale, mirror and fill (spec 027
  US6, spec 050 US4). New `kind: 'rosette'` for the rosette print interface (spec 050 FR-006a: 1U length, how many
  rosettes, coloring, paper / fabric / both, seam allowance, rosette sheet; print prefs gain
  `rosetteUnit`, `rosetteCount`, `eppTemplates: 'paper' | 'fabric' | 'both'`); EPP quilts stay
  `kind: 'quilt'` with an EPP branch. Optional rosette sheet later in the phase.

## R10. Rosettes in block quilts (later phase)

- **Decision**: A rosette whose outline matches a block space shape is offered through a hidden
  derived block (`block.rosette: ItemId`), rebuilt on every change like data variants (`DataBlockInfo.
  of`): its drawing is the rosette's pieces fitted to the shape's outline, so placing, turning,
  and coloring reuse the block paths. Printing does not: block print paths (rotary cutting, block
  templates, foundations) skip derived rosette blocks, and their patches go through the EPP print
  path (R9), a paper and a fabric cutting template for each patch, counted with any other EPP
  pieces. Owner, 2026-11-10: EPP blocks print differently from traditional blocks.
- **Rationale**: `SlotContent.block` is an ItemId into `project.blocks`; widening it touches every
  slot reader. A derived block is the pattern already used for data variants.

## R11. Single-item file

- **Decision**: `.rrqepp` (`{ format: 'rrqepp', version: 1, item: { type, data }, shapes? }`): one
  shape, or one rosette with the library shapes it uses. `storage/files.ts` `FILE_TYPES` gains it.
- **Rationale**: Owner chose EPP apart from blocks; `.rrqbl` stays blocks only.
