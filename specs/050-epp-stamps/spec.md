# Feature Specification: EPP Rosettes (Meta-Blocks)

**Feature Branch**: `TBD` (target 0.9.0, with spec 027; was 0.8.0)

**Created**: 2026-10-29

**Status**: Draft (spec only; not implemented). Builds on spec 027 (EPP layouts): its saved
groups are rosettes. Owner, 2026-11-10: "let's use the name rosette" (this spec called them stamps
until then; its folder keeps the old name).

**Input**: Owner, 2026-10-29: "let's add a spec for english paper piecing where we'll be able to
define meta-blocks/stamps that are formed from individual patchblocks and can be used
interchangably with individual patchblocks when designing an EPP quilt".

## Concepts

- **Shape** (spec 027; the owner's "patchblock"): one EPP template shape, one fill.
- **Rosette** (meta-block): a named arrangement of shapes, snapped edge to edge, saved as one item.
  A hexagon flower (one middle, six petals), a star of six diamonds, a "Grandmother's Flower Garden"
  ring. A rosette may hold other rosettes (a ring of flowers).
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
- **Fill slots**: a rosette's pieces carry fill slots (A, B, C…), like a block's colorings: the rosette
  has one or more **colorings** mapping slots to colors or fabrics, so the same flower can be placed
  with a yellow middle in one spot and a red one in another.
- **Placed rosette**: one item in the quilt, linked to its rosette, with its own coloring (or its own
  fills per slot), position, turn, mirror and scale.

## User Scenarios & Testing

### User Story 1 - Make a rosette from shapes (Priority: P1)

A quilter arranges seven hexagons into a flower and saves it as a rosette.

**Independent Test**: In an EPP quilt, select seven snapped hexagons, **Make rosette**, name it
"Flower". It appears in the picker next to the shapes, with a picture, and the seven pieces become
one placed Flower.

**Acceptance Scenarios**:

1. **Given** pieces selected (shapes or rosettes, at least two, joined edge to edge), **When** the
   quilter chooses **Make rosette**, **Then** they name it, and it's saved to the project's EPP items
   with the arrangement, the pieces' fills as its first coloring, and the selection is replaced by
   one placed rosette in the same spot.
2. **Given** pieces that don't touch each other, **Then** Make rosette warns that the rosette is in
   parts (allowed: a rosette can be a spaced motif), and its outline is each part's.
3. **Given** the rosette, **Then** it can also be made or edited in a **rosette editor**: the same
   design area with only the rosette's pieces, from the project's EPP items or the picker's ⋮ menu.
   Owner, 2026-11-10: one editor for shapes and rosettes, with each patch flagged as it's
   edited (closes, doesn't cross itself, whole-unit edges, convex) and a banner while any patch
   fails (spec 027 FR-006).
4. **Given** fills, **Then** pieces of the same fill become one slot, so recoloring a slot recolors
   all of them (the quilter can split or merge slots in the rosette editor).

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
4. **Given** the Paint tool on a placed rosette, **Then** tapping a piece of it paints that piece's
   slot for this placement only (scope This), or for every placement of the rosette (scope All). The
   rosette's colorings can be picked per placement, as block colorings are.
5. **Given** a placed rosette, **When** the quilter uses the **Break into patches** tool, **Then** it becomes its
   individual pieces (fills kept, undoable), no longer linked. This is what placing a spec 027 rosette did:
   a rosette is a rosette that stays together until broken into patches.
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

1. **Given** an EPP quilt with rosettes, **When** printing templates, **Then** counts are by shape,
   scale and fill, adding up every piece inside every placed rosette (a rosette is never a template).
2. **Given** any printout, **Then** rosettes are broken down into their EPP shapes: templates,
   counts and yardage are by shape, never by rosette. Owner, 2026-11-10: "in printouts, rosettes are
   broken down into the basic EPP shapes. they're used for design layout ease and to inform the
   quilter that there's an intermediary size between patch and quilt."
3. **Given** the print, **Then** an optional **rosette sheet** shows each rosette used, its pieces
   numbered, how many times it's placed and with which colorings, as an assembly guide.
4. **Given** yardage, **Then** it counts the rosettes' pieces like loose pieces.

### Edge Cases

- **Nesting**: a rosette inside a rosette inside a rosette is fine; a rosette can't contain itself, directly
  or through others (Make rosette and the editor refuse, naming the loop). Depth limit 8.
- **Scale**: a rosette at Scale 2 scales all its pieces, which stay whole units, so it still snaps.
  Pieces inside a rosette keep their own scales relative to it (a 2u middle with 1u petals).
- **Mixed fills**: a piece in a rosette with no slot (a fixed fill, for example a fabric chosen for
  the motif) stays that fill in every coloring unless the quilter makes it a slot.
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
- **FR-003**: Rosettes MUST have fill slots and colorings; a placement picks a coloring or overrides
  slots, painted with the editor's scopes.
- **FR-004**: Placed rosettes MUST stay linked to their rosette (edits update every placement, with undo)
  until broken into patches.
- **FR-005**: Rosettes MAY nest; cycles MUST be refused; depth at most 8.
- **FR-006**: Templates, counts and yardage MUST expand rosettes into their pieces; an optional rosette
  sheet MUST list rosettes, their pieces and placements.
- **FR-007**: Rosettes MUST be library items with credits and licenses like shapes (spec 027 FR-007),
  replacing spec 027's rosettes.
- **FR-008**: The project format version that adds EPP (spec 027 FR-009) MUST include rosettes and
  placed rosettes; loading validates them (cycles, missing shapes, slot references).
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

- **EppRosette**: id, notecard, pieces (each a shape or rosette ref, position, turn, mirror, scale, slot
  or fixed fill), colorings (slot → fill), credits, license.
- **Placed rosette** (a piece kind next to placed shapes): rosette ref, position, turn, mirror, scale,
  coloring id and/or per-slot overrides.

## Success Criteria

- **SC-001**: A quilter makes a 7-hexagon flower rosette and lays 7 of them into a 49-hexagon garden,
  every edge flush, in under 3 minutes.
- **SC-002**: Template counts for a quilt of rosettes match the counts for the same design broken
  apart.
- **SC-003**: A rosette shared in a pack places, snaps and prints the same in another person's app.

## Assumptions

- "Patchblock" in the owner's note is spec 027's EPP shape (one paper template).
- Rosettes live with EPP shapes (the project's EPP items, the picker), not with layout-engine blocks;
  using EPP rosettes in block-based quilts is out of scope.

## Out of scope

- Rosettes of blocks for layout-engine quilts. (The reverse is in scope: rosettes whose outline matches
  a block space shape are placed in block quilts, spec 027 FR-015.)
- Auto-filling an area with a rosette (a tiling fill); a later idea.
