# Feature Specification: EPP Stamps (Meta-Blocks)

**Feature Branch**: `TBD` (target 0.8.0, with spec 027)

**Created**: 2026-10-29

**Status**: Draft (spec only; not implemented). Builds on spec 027 (EPP layouts) and replaces its
rosettes (saved groups) with stamps.

**Input**: Owner, 2026-10-29: "let's add a spec for english paper piecing where we'll be able to
define meta-blocks/stamps that are formed from individual patchblocks and can be used
interchangably with individual patchblocks when designing an EPP quilt".

## Concepts

- **Shape** (spec 027; the owner's "patchblock"): one EPP template shape, one fill.
- **Stamp** (meta-block): a named arrangement of shapes, snapped edge to edge, saved as one item.
  A hexagon flower (one middle, six petals), a star of six diamonds, a "Grandmother's Flower Garden"
  ring. A stamp may hold other stamps (a ring of flowers).
- **Interchangeable**: anywhere a shape can be used, a stamp can too: the sidebar picker, placing,
  dragging, snapping, turning, mirroring, the Scale slider, painting, libraries, packs, printing.
- **Stamp edges**: a stamp snaps by the edges of its outside outline, each a whole number of units
  (they're its shapes' edges), so it joins shapes and other stamps as a shape does. Inner edges
  (between its own shapes) don't snap from outside.
- **Fill slots**: a stamp's pieces carry fill slots (A, B, C…), like a block's colorings: the stamp
  has one or more **colorings** mapping slots to colors or fabrics, so the same flower can be placed
  with a yellow middle in one spot and a red one in another.
- **Placed stamp**: one item in the quilt, linked to its stamp, with its own coloring (or its own
  fills per slot), position, turn, mirror and scale.

## User Scenarios & Testing

### User Story 1 - Make a stamp from shapes (Priority: P1)

A quilter arranges seven hexagons into a flower and saves it as a stamp.

**Independent Test**: In an EPP quilt, select seven snapped hexagons, **Make stamp**, name it
"Flower". It appears in the picker next to the shapes, with a picture, and the seven pieces become
one placed Flower.

**Acceptance Scenarios**:

1. **Given** pieces selected (shapes or stamps, at least two, joined edge to edge), **When** the
   quilter chooses **Make stamp**, **Then** they name it, and it's saved to the project's EPP items
   with the arrangement, the pieces' fills as its first coloring, and the selection is replaced by
   one placed stamp in the same spot.
2. **Given** pieces that don't touch each other, **Then** Make stamp warns that the stamp is in
   parts (allowed: a stamp can be a spaced motif), and its outline is each part's.
3. **Given** the stamp, **Then** it can also be made or edited in a **stamp editor**: the same
   design area with only the stamp's pieces, from the project's EPP items or the picker's ⋮ menu.
4. **Given** fills, **Then** pieces of the same fill become one slot, so recoloring a slot recolors
   all of them (the quilter can split or merge slots in the stamp editor).

---

### User Story 2 - Use a stamp like a shape (Priority: P1)

**Independent Test**: Place Flower, then a hexagon against one of its outside edges, then a second
Flower against the first: each snaps flush, as shapes do. Turn one Flower 60°, mirror it, set Scale
2: it behaves as one piece.

**Acceptance Scenarios**:

1. **Given** the sidebar's picker, **Then** stamps list with shapes (filtered and grouped the same
   way, with a filter for Shapes / Stamps), and tapping or dragging one places it as a shape is.
2. **Given** a placed stamp dragged near a shape or stamp, **Then** its outside edges snap to equal
   edges (or whole-unit runs of longer ones) exactly as spec 027 FR-003.
3. **Given** a placed stamp, **Then** turn, mirror, move, copy, delete and the Scale slider apply to
   it as one piece; turning offers the turns that keep a shared edge.
4. **Given** the Paint tool on a placed stamp, **Then** tapping a piece of it paints that piece's
   slot for this placement only (scope This), or for every placement of the stamp (scope All). The
   stamp's colorings can be picked per placement, as block colorings are.
5. **Given** a placed stamp, **When** the quilter chooses **Break apart**, **Then** it becomes its
   individual pieces (fills kept, undoable), no longer linked.
6. **Given** a stamp edited (in the stamp editor), **Then** every placement updates, with undo;
   placements whose snapped neighbors no longer meet are flagged, not moved (as edited shapes,
   spec 027).

---

### User Story 3 - Stamps in libraries (Priority: P2)

1. **Given** My library and packs, **Then** stamps save, share, copy, sync and credit like shapes and
   blocks (specs 008, 009, 011). A stamp carries the shapes it uses (embedded, as projects embed
   library items).
2. **Given** the built-in library, **Then** it has starter stamps: hexagon flower (7), double flower
   (19), six-diamond star, tumbling block (three 60° diamonds), and an octagon-and-square repeat.
3. **Given** a stamp built from others' shapes, **Then** credits list the shapes' authors too, and the
   license follows the strictest (spec 009 chain).

---

### User Story 4 - Print and count by pieces (Priority: P1)

1. **Given** an EPP quilt with stamps, **When** printing templates, **Then** counts are by shape,
   scale and fill, adding up every piece inside every placed stamp (a stamp is never a template).
2. **Given** the print, **Then** an optional **stamp sheet** shows each stamp used, its pieces
   numbered, how many times it's placed and with which colorings, as an assembly guide.
3. **Given** yardage, **Then** it counts the stamps' pieces like loose pieces.

### Edge Cases

- **Nesting**: a stamp inside a stamp inside a stamp is fine; a stamp can't contain itself, directly
  or through others (Make stamp and the editor refuse, naming the loop). Depth limit 8.
- **Scale**: a stamp at Scale 2 scales all its pieces, which stay whole units, so it still snaps.
  Pieces inside a stamp keep their own scales relative to it (a 2u middle with 1u petals).
- **Mixed fills**: a piece in a stamp with no slot (a fixed fill, for example a fabric chosen for
  the motif) stays that fill in every coloring unless the quilter makes it a slot.
- **Library stamp edited by its author**: placements of the synced copy follow sync rules (spec 008/
  011); a pack stamp is read-only, copy to edit.
- **Overlaps inside a stamp**: shown and warned in the stamp editor, as in quilts.
- **Missing shape in a loaded stamp**: reported on open; the stamp shows with that piece as an empty
  outline (never crashes, spec 003).
- **3D (spec 027, later)**: a stamp is flat; joins can attach to its outside edges.

## Requirements

- **FR-001**: Quilters MUST be able to make a stamp from two or more placed pieces (shapes or
  stamps), name it, and have the selection replaced by one linked placement.
- **FR-002**: A stamp MUST be usable wherever a shape is: picker, place, drag, snap (outside edges
  only), turn, mirror, Scale, copy, delete, paint, libraries, packs, printing.
- **FR-003**: Stamps MUST have fill slots and colorings; a placement picks a coloring or overrides
  slots, painted with the editor's scopes.
- **FR-004**: Placed stamps MUST stay linked to their stamp (edits update every placement, with undo)
  until broken apart.
- **FR-005**: Stamps MAY nest; cycles MUST be refused; depth at most 8.
- **FR-006**: Templates, counts and yardage MUST expand stamps into their pieces; an optional stamp
  sheet MUST list stamps, their pieces and placements.
- **FR-007**: Stamps MUST be library items with credits and licenses like shapes (spec 027 FR-007),
  replacing spec 027's rosettes.
- **FR-008**: The project format version that adds EPP (spec 027 FR-009) MUST include stamps and
  placed stamps; loading validates them (cycles, missing shapes, slot references).

### Key Entities

- **EppStamp**: id, notecard, pieces (each a shape or stamp ref, position, turn, mirror, scale, slot
  or fixed fill), colorings (slot → fill), credits, license.
- **Placed stamp** (a piece kind next to placed shapes): stamp ref, position, turn, mirror, scale,
  coloring id and/or per-slot overrides.

## Success Criteria

- **SC-001**: A quilter makes a 7-hexagon flower stamp and lays 7 of them into a 49-hexagon garden,
  every edge flush, in under 3 minutes.
- **SC-002**: Template counts for a quilt of stamps match the counts for the same design broken
  apart.
- **SC-003**: A stamp shared in a pack places, snaps and prints the same in another person's app.

## Assumptions

- "Patchblock" in the owner's note is spec 027's EPP shape (one paper template).
- Stamps live with EPP shapes (the project's EPP items, the picker), not with layout-engine blocks;
  using EPP stamps in block-based quilts is out of scope.

## Out of scope

- Stamps of blocks for layout-engine quilts.
- Auto-filling an area with a stamp (a tiling fill); a later idea.
