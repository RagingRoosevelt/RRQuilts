# Feature Specification: EPP Rosettes (Meta-Blocks)

**Feature Branch**: `TBD` (target 0.9.0, with spec 027; was 0.8.0)

**Created**: 2026-10-29

**Status**: Draft (spec only; not implemented). Builds on spec 027 (EPP layouts): its saved
groups are rosettes. Owner, 2026-11-10: "let's use the name rosette" (this spec called them stamps
until then; its folder keeps the old name).

**Input**: Owner, 2026-10-29: "let's add a spec for english paper piecing where we'll be able to
define meta-blocks/stamps that are formed from individual patchblocks and can be used
interchangably with individual patchblocks when designing an EPP quilt".

## Clarifications

### Session 2026-11-10

- Q: Is the shape editor its own editor or part of the rosette editor? → A: One engine, two
  presentations. The **shape editor** edits outlines only (no colors) and has a **multi-shape mode**:
  draw an outline and lines across it, and the assembly is split into its component shapes, saved as
  a self-contained rosette whose shapes are defined inside it (not added to My library one by one).
  The **rosette editor** places shapes and rosettes and can **close a space**: make a custom shape
  that fills a gap no library shape fits, kept inside that rosette. Owner, 2026-11-10: "I think they
  should be seperate editors but the shape editor should have a multi-shape mode where you can draw
  out an outline and then the whole assembly is split into constituant component shapes. these
  shapes wouldn't be saved as individual seperate shapes to my library but instead would be saved as
  a self-contained rosette with only internal definitions of its shapes. the shape editor doesn't
  need a color component, just the aspects for shape itself. [...] it would be ocasionally handy to
  be able to create a custom shape to close a space in a rosette that we don't have a shape for.
  [...] behind the scenes we can use the same editor but there would be two presentations of it, a
  shape editor that can do that mutli-shape-to-self-contained-rosette mode, and the rosette editor
  that can close up odd spaces to create shapes that are self-contained in the rosette."

- Q: How is a rosette colored? → A: As blocks: the rosette editor paints real colors and fabrics,
  a rosette has several colorings, each placement picks one and can be repainted (This / All);
  color variants work as for blocks (a recoloring of a library rosette with its arrangement locked).
  Data rosettes, with the same fundamentals as data blocks (spec 025), are a later release. Owner,
  2026-11-10: "we'll do them like with blocks. we'll also have the same idea of color variants. and
  we should also make allowance for data rosettes with the same fundamentals as we have for data
  blocks." Then: "we can save the data rosettes for a future release".
- Q: When a rosette contains another rosette, how does the inner one get its colors? → A: No live
  nesting. Inserting a rosette into a rosette copies its pieces (and internal shapes) in, with the
  inserted rosette's current coloring as their fills, and keeps no link back. Owner, 2026-11-10: "C
  is the right option. we'll use the colors provided by the rosette we're inserting initially but
  retain no link back".

## Concepts

- **Shape** (spec 027; the owner's "patchblock"): one EPP template shape, one fill.
- **Rosette** (meta-block): a named arrangement of shapes, snapped edge to edge, saved as one item.
  A hexagon flower (one middle, six petals), a star of six diamonds, a "Grandmother's Flower Garden"
  ring. A rosette built from other rosettes (a ring of flowers) holds copies of their pieces, not
  links to them (FR-005).
- **No size of its own**: a rosette is measured in its fundamental unit (1U, the edge of its shapes at
  scale 1) and has no real size. An EPP quilt's Layout tab sets the length of 1U for the whole quilt
  (spec 027 FR-001); in a block quilt the block space it fills sets it (spec 027 FR-015). Owner,
  2026-11-10: "rosettes don't have a size specified. they just end up being based on their
  fundamental unit. this is another area of differentiation between a rosette and an epp quilt,
  that in an EPP quilt, one of the layout elements will be specifying the length of 1U."
- **Why rosettes**: they make laying out a design easier and show the quilter the step between patch
  and quilt (sew the rosettes, then join them). Printouts break them into their EPP shapes.
- **Interchangeable**: anywhere a shape can be used, a rosette can too: the sidebar picker, placing,
  dragging, snapping, turning, mirroring, the Scale slider, painting, libraries, packs, printing.
- **Rosette edges**: a rosette snaps by the edges of its outside outline, each a whole number of units
  (they're its shapes' edges), so it joins shapes and other rosettes as a shape does. Inner edges
  (between its own shapes) don't snap from outside.
- **Colorings**: as a block's (spec 007): each piece of a rosette has a fill (a color or a fabric)
  in each of the rosette's **colorings**, so the same flower can be placed with a yellow middle in
  one spot and a red one in another. A **color variant** is a recoloring of a library rosette whose
  arrangement is locked, as for blocks.
- **Internal shape**: a shape defined inside one rosette, not a library item: made by the shape
  editor's Multi-shape mode (spec 027) or by closing a space in the rosette editor. It prints, counts
  and is checked like any shape, and goes wherever its rosette goes.
- **Placed rosette**: one item in the quilt, linked to its rosette, with its own coloring (and any pieces
  repainted for this placement), position, turn, mirror and scale.

## User Scenarios & Testing

### User Story 1 - Make a rosette from shapes (Priority: P1)

A quilter arranges seven hexagons into a flower and saves it as a rosette.

**Independent Test**: In an EPP quilt, select seven snapped hexagons, **Make rosette**, name it
"Flower". It appears in the picker next to the shapes, with a picture, and the seven pieces become
one placed Flower.

**Acceptance Scenarios**:

1. **Given** pieces selected (shapes or rosettes, at least two, joined edge to edge), **When** the
   quilter chooses **Make rosette**, **Then** they name it, and it's saved to the project's EPP items
   with the arrangement (placed rosettes in the selection are copied in as their pieces, unlinked),
   the pieces' fills as its first coloring, and the selection is replaced by
   one placed rosette in the same spot.
2. **Given** pieces that don't touch each other, **Then** Make rosette warns that the rosette is in
   parts (allowed: a rosette can be a spaced motif), and its outline is each part's.
3. **Given** the rosette, **Then** it can also be made or edited in the **rosette editor**, opened
   from the EPP section or the picker's ⋮ menu. It shares its engine with the shape editor
   (Clarifications 2026-11-10), with the four patch flags and banner (spec 027 FR-006).
4. **Given** a gap between placed pieces that no shape fits, **When** the quilter uses **Close
   space** in the rosette editor, **Then** a new internal shape fills it (its outline taken from the
   gap's edges, editable with the shape tools, checked by the four flags) and is kept inside this
   rosette only.
5. **Given** the rosette editor, **Then** the quilter paints pieces with real colors and fabrics in
   the current coloring, adds, copies and deletes colorings, and swaps palettes, as in the block
   editor.

---

### User Story 2 - Use a rosette like a shape (Priority: P1)

**Independent Test**: Place Flower, then a hexagon against one of its outside edges, then a second
Flower against the first: each snaps flush, as shapes do. Turn one Flower 60°, mirror it, set Scale
2: it behaves as one piece.

**Acceptance Scenarios**:

1. **Given** the sidebar's picker, **Then** rosettes list with shapes (filtered and grouped the same
   way, with a filter for Shapes / Rosettes), and tapping or dragging one places it as a shape is.
   A **Place rosettes ungrouped** toggle (off by default) at the top of the picker places a rosette
   as its loose patches instead of one linked rosette. Grouped rosettes can be broken up after
   (scenario 5).
2. **Given** a placed rosette dragged near a shape or rosette, **Then** its outside edges snap to equal
   edges (or whole-unit runs of longer ones) exactly as spec 027 FR-003.
3. **Given** a placed rosette, **Then** turn, mirror, move, copy, delete and the Scale slider apply to
   it as one piece; turning offers the turns that keep a shared edge.
4. **Given** the Paint tool on a placed rosette, **Then** tapping a piece of it paints that piece
   for this placement only (scope This), or for every placement of the rosette (scope All), as
   painting a block in a quilt does. The rosette's colorings can be picked per placement.
5. **Given** a placed rosette, **When** the quilter uses the **Break into patches** tool, **Then** it becomes its
   individual pieces (fills kept, undoable), no longer linked. A rosette stays together until broken
   into patches.
6. **Given** a rosette edited (in the rosette editor), **Then** every placement updates, with undo;
   placements whose snapped neighbors no longer meet are flagged, not moved (as edited shapes,
   spec 027).

---

### User Story 3 - Rosettes in libraries (Priority: P2)

1. **Given** My library and packs, **Then** rosettes save, share, copy, sync and credit like shapes and
   blocks (specs 008, 009, 011). A rosette carries the shapes it uses (embedded, as projects embed
   library items).
2. **Given** the built-in library, **Then** it has starter rosettes: hexagon flower (7), double flower
   (19), six-diamond star, tumbling block (three 60° diamonds), and an octagon-and-square repeat.
3. **Given** a rosette built from others' shapes, **Then** credits list the shapes' authors too, and the
   license follows the strictest (spec 009 chain).

---

### User Story 4 - Print and count by pieces (Priority: P1)

Owner, 2026-11-10: "we should have a print interface for rosettes".

**Independent Test**: Open the Flower rosette, Print tab, 1U = 1 in, 4 rosettes: 28 hexagon paper
templates and 28 fabric templates, grouped by fill, with the assembly sheet; Print from the EPP card
menu opens the same.

1. **Given** an EPP quilt with rosettes, **When** printing templates, **Then** counts are by shape,
   scale and fill, adding up every piece inside every placed rosette (a rosette is never a template).
1a. **Given** a rosette, **Then** it has its own print interface: a **Print** tab in the rosette
   editor (and **Print** on its card menu in Libraries and the project's EPP tab), with the print
   preview in place of the canvas and options in the sidebar, as the block editor's Print tab:
   **1U length** (a rosette has no size of its own), **how many rosettes**, **coloring**, **Paper /
   Fabric / Both** templates, **seam allowance**, **rosette sheet** on or off, test square, and the
   usual page and packing options (spec 010). Templates are counted for that many rosettes, by shape,
   size, mirror and fill.
2. **Given** any printout, **Then** rosettes are broken down into their EPP shapes: templates,
   counts and yardage are by shape, never by rosette. Owner, 2026-11-10: "in printouts, rosettes are
   broken down into the basic EPP shapes. they're used for design layout ease and to inform the
   quilter that there's an intermediary size between patch and quilt."
3. **Given** a rosette printed anywhere (its editor's Print tab, an EPP quilt, a block quilt), **Then**
   each of its patches gets both a paper template and a fabric cutting template; rosettes never use
   traditional block printing (rotary cutting, block templates). (Spec 027 FR-015.)
4. **Given** the print, **Then** an optional **rosette sheet** shows each rosette used, its pieces
   numbered, how many times it's placed and with which colorings, as an assembly guide.
5. **Given** yardage, **Then** it counts the rosettes' pieces like loose pieces.

### Edge Cases

- **Rosette inside a rosette**: never linked. Placing a rosette in the rosette editor (or in a Make
  rosette selection) copies its pieces and internal shapes in, filled with its current coloring;
  later edits to it don't reach the copy. So a rosette can't contain itself and there are no loops.
- **Scale**: a rosette at Scale 2 scales all its pieces, which stay whole units, so it still snaps.
  Pieces inside a rosette keep their own scales relative to it (a 2u middle with 1u petals).
- **Repainted placement**: a placement with pieces repainted keeps those fills when the rosette's
  coloring changes, as a block placement does.
- **Library rosette edited by its author**: placements of the synced copy follow sync rules (spec 008/
  011); a pack rosette is read-only, copy to edit.
- **Overlaps inside a rosette**: shown and warned in the rosette editor, as in quilts.
- **Missing shape in a loaded rosette**: reported on open; the rosette shows with that piece as an empty
  outline (never crashes, spec 003).
- **3D (spec 027, later)**: a rosette is flat; joins can attach to its outside edges.

## Requirements

- **FR-001**: Quilters MUST be able to make a rosette from two or more placed pieces (shapes or
  rosettes), name it, and have the selection replaced by one linked placement.
- **FR-002**: A rosette MUST be usable wherever a shape is: picker, place, drag, snap (outside edges
  only), turn, mirror, Scale, copy, delete, paint, libraries, packs, printing.
- **FR-003**: Rosettes MUST have colorings and color variants as blocks do; a placement picks a
  coloring and can be repainted with the editor's scopes.
- **FR-004**: Placed rosettes MUST stay linked to their rosette (edits update every placement, with undo)
  until broken into patches.
- **FR-005**: Rosettes MUST NOT nest: a rosette placed into a rosette is copied in as its pieces
  (with its current coloring's fills and its internal shapes) and keeps no link to its source.
- **FR-006a**: Rosettes MUST have their own print interface (rosette editor Print tab and card menu)
  with 1U length, number of rosettes, coloring, paper / fabric / both, seam allowance, rosette sheet
  and page options.
- **FR-006**: Templates, counts and yardage MUST expand rosettes into their pieces; an optional rosette
  sheet MUST list rosettes, their pieces and placements.
- **FR-007**: Rosettes MUST be library items with credits and licenses like shapes (spec 027 FR-007),
  replacing spec 027's rosettes.
- **FR-008**: The project format version that adds EPP (spec 027 FR-009) MUST include rosettes and
  placed rosettes; loading validates them (missing shapes, coloring references).
- **FR-009**: Rosettes are edited in a rosette editor; EPP quilts use the same engine with Layout and
  Borders tabs added (spec 027 FR-014, which replaces the earlier one-editor note). Both editors have a
  **Break into patches** tool and a **Place rosettes ungrouped** toggle. There is no Enable as
  rosette toggle: rosettes are made in the rosette editor or with Make rosette (owner, 2026-11-10,
  dropping the Details toggle from the first note below). Owner, 2026-11-10:
  "in details, we'll have a toggle for "enable as stamp". all stamps start out as grouped rosettes
  but can be broken down after placement and we'll have a toggle at the top of the rosette/stamp
  picker in the sidebar to "place as stamp/rosette"."
  Then, 2026-11-10: "in the rosette and quilt designer, we'll have a "break into patches" tool and
  a toggle for "place rosettes ungrouped" which will replace what we were calling stamps".

### Key Entities

- **EppRosette**: id, notecard, internal shapes (outlines defined only in this rosette), pieces
  (each a library shape or internal shape, position, turn, mirror, scale; never a rosette), colorings
  (a fill per piece), color variant flag, credits (including the authors of rosettes copied in),
  license.
- **Placed rosette** (a piece kind next to placed shapes): rosette ref, position, turn, mirror, scale,
  coloring id and any repainted pieces.

## Success Criteria

- **SC-001**: A quilter makes a 7-hexagon flower rosette and lays 7 of them into a 49-hexagon garden,
  every edge flush, in under 3 minutes.
- **SC-002**: Template counts for a quilt of rosettes match the counts for the same design broken
  apart.
- **SC-003**: A rosette shared in a pack places, snaps and prints the same in another person's app.

## Assumptions

- "Patchblock" in the owner's note is spec 027's EPP shape (one paper template).
- Rosettes live with EPP shapes (the EPP section, the picker), not with blocks. Block quilts can
  place rosettes whose outline matches a block space shape (spec 027 FR-015).

## Out of scope

- Rosettes of blocks for layout-engine quilts. (The reverse is in scope: rosettes whose outline matches
  a block space shape are placed in block quilts, spec 027 FR-015.)
- Data rosettes (rosettes with data paints and shorter variants, as data blocks in spec 025): a later
  release.
- Auto-filling an area with a rosette (a tiling fill); a later idea.
