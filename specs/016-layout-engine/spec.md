# Feature Specification: Shared Layout Engine

**Feature Branch**: `016-layout-engine`

**Created**: 2026-10-15

**Status**: Implemented (2026-10-15)

**Input**: User description: "Shared layout engine (spec 001 FR-029c). One engine generates every quilt
layout: a repeating cell of block spaces and sashing (each space with its own shape and turn),
repeated along two directions, turned or sheared as a whole, trimmed to the quilt, with edge
finishing where an edge is uneven (FR-029e). Layout styles become presets of the engine. The data
model must carry block-space shape and curved outlines from day one even though block shapes
(FR-060a) come in a later spec. Space ids stay position-based. Proof: On-Point layout with setting
pieces (FR-022, FR-029e), and Horizontal rebuilt on the engine producing identical slots and ids so
existing projects are unchanged."

> Builds on spec 001 (FR-020–FR-029e, FR-060a), spec 003 (project format, slot ids), spec 006 (quilt
> editor), spec 010 (printing). Later specs add the other styles (Variable Point, Baby Blocks,
> shaped-block and mixed layouts) as presets, and block shapes (FR-060a).

## Clarifications

### Session 2026-10-15

- Q: What number does On-Point's block size field take? → A: The finished side of the square block;
  the width on point is shown alongside.
- Q: Which edge finish do new On-Point quilts start with? → A: Floating, 1″.
- Q: How is a partial block (Trimmed blocks) printed and counted for yardage? → A: As the whole block,
  then trimmed: cut list and yardage count full blocks, and the printout shows the trim line.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Make an On-Point quilt (Priority: P1)

A quilter picks On-Point as the layout style, sets the number of blocks across and down, the
finished block size, and optional sashing, and sees blocks turned 45° with setting triangles filling
the edges.

**Why this priority**: On-Point is the most requested layout after Horizontal and the first one with
an uneven edge, so it proves the engine, turned layouts, and edge finishing at once.

**Independent Test**: New quilt → Layout style On-Point, 3 across, 4 down, 8″ blocks → the quilt shows
3 × 4 blocks on point plus 2 × 3 between them, side and corner setting triangles, and its finished
size; blocks can be placed and colored in every space.

**Acceptance Scenarios**:

1. **Given** On-Point with C across and R down, **Then** the quilt holds C × R blocks on point and
   (C − 1) × (R − 1) blocks between them, side setting triangles along each edge, and a corner
   finish at each corner.
2. **Given** the block size, **Then** it is the finished side of the square block; the inspector also
   shows the block's width on point (side × √2) and the quilt's finished size.
3. **Given** sashing, **Then** sashing strips run between blocks on the diagonal, with cornerstones
   where they cross, and the setting triangles grow to meet them.
4. **Given** the corner style, **Then** the user chooses one corner triangle per corner or a seam
   that continues the side triangles' line into the corner.
5. **Given** blocks placed on point, **Then** placing, coloring (this / all identical / alternate),
   turning, flipping, undo, saving, and reopening work as on Horizontal.

---

### User Story 2 - Finish an uneven edge (Priority: P1)

A quilter chooses how the zigzag edge of an On-Point quilt is finished.

**Why this priority**: The edge finish decides the quilt's size, its pieces, and whether borders fit;
every uneven-edged layout after this one reuses it (spec 001 FR-029e).

**Independent Test**: On-Point 3 × 3 → switch the edge finish through all four choices → the drawing,
the quilt size, and the printed piece list change to match each.

**Acceptance Scenarios**:

1. **Given** Exact setting pieces, **Then** block points touch the quilt's straight edge (or the first
   border).
2. **Given** Floating with a float amount, **Then** setting pieces grow so block points sit that far
   inside the straight edge, and the quilt size grows to match.
3. **Given** Trimmed blocks, **Then** the edge spaces hold partial blocks (half and quarter blocks cut
   by the straight edge) instead of setting pieces; each partial space takes a block, colored like
   the rest, and shows only the part inside the quilt. Printing and yardage count each partial block
   as a whole block, with a note to trim after setting along the shown trim line.
4. **Given** No fill, **Then** the zigzag edge is the quilt's edge: no setting pieces, borders are
   unavailable (existing borders are kept in the file but set aside, with a note), and the binding
   follows the zigzag.
5. **Given** setting pieces, **Then** they color like any patch (plain fill), and printing lists them
   with cut sizes, straight grain along the quilt's outer edge (side triangles cut as quarter-square
   triangles, corner triangles as half-square triangles).

---

### User Story 3 - Existing quilts stay the same (Priority: P1)

A quilter opens a project made before this feature and nothing about it changes.

**Why this priority**: The engine replaces the Horizontal code; any change in spaces or their names
would move or lose placed blocks in saved projects.

**Independent Test**: Open every saved test project and fixture with Horizontal layouts → each space
has the same id, outline, and placement as before, and saving without edits gives an identical
quilt.

**Acceptance Scenarios**:

1. **Given** any Horizontal layout (with or without sashing, sash border, borders), **Then** the
   engine produces the same spaces, ids, outlines, and order as before.
2. **Given** a project from an older format version, **Then** it opens and migrates as today.

---

### User Story 4 - Switch between Horizontal and On-Point (Priority: P2)

A quilter tries a design both ways without placing blocks again.

**Independent Test**: Horizontal 3 × 3 with nine blocks placed → switch to On-Point → the nine blocks
sit in the main on-point spaces in the same rows and columns; switch back → still there.

**Acceptance Scenarios**:

1. **Given** a switch between the two styles, **Then** blocks in the main grid keep their row and
   column; blocks only the other style has (between-blocks spaces, partial spaces) are listed in the
   usual warning before they're removed.
2. **Given** the switch, **Then** counts, block size, and sashing carry over.

---

### Edge Cases

- On-Point 1 × 1: one block on point, four corner triangles (no side triangles, no between blocks).
- On-Point with 1 across and several down (or the reverse): a single diagonal column, side triangles
  on two sides only.
- Float amount 0 → same as Exact; negative float → not allowed.
- Floating: printing gives the oversized setting-piece cut sizes and says to trim the quilt top to
  the shown edge.
- Trimmed blocks with sashing: sashing is trimmed by the straight edge like the blocks.
- No fill, then switching back to an edge with setting pieces → the set-aside borders return.
- A block placed in a partial space then switched to Exact → the partial space is gone; the block is
  in the removal warning.
- Very large counts (up to the FR-029 maximum) stay responsive.
- Files from a newer app with layout parameters this app doesn't know → opened read-safe as today
  (unsupported layout noted), never crash.

## Requirements *(mandatory)*

### Functional Requirements

**Engine** (spec 001 FR-029c)

- **FR-001**: Every layout MUST be generated by one engine from: a repeating cell (block spaces and
  sashing pieces, each with a shape, size, and turn), its repeat along two directions (or a stack of
  strips, each repeating its own cell along one direction), a turn and shear of the whole, the
  quilt's trim, and the edge finish. Horizontal and On-Point are presets (fixed choices of these),
  not separate geometry.
- **FR-002**: A space MUST carry its shape and its outline, and outlines MAY include arcs.
- **FR-002a**: The engine MUST be able to generate every layout planned in spec 001, even though this
  feature gives users only Horizontal and On-Point, so that each later style is a preset plus its
  inspector and never a change to the engine:
  - Variable Point (a sheared and turned lattice: diamonds measured through the block);
  - Baby Blocks and Variable Blocks (three diamonds per repeat, each with its own turn; equal or
    unequal sides);
  - Horizontal and Vertical Strip (a stack of strips, each with its own repeating cell and count,
    sharing one length, half drops included);
  - One Patch and Photo Patchwork (one tessellating patch shape repeated);
  - triangle, 60° diamond, hexagon, clamshell, and spool layouts with trimmed or shaped edges (spec
    001 FR-029a, FR-029b);
  - mixed triangle-grid layouts and their presets (Baby Blocks, Star, Hexagons and Triangles), and
    merging and splitting spaces on the triangle grid, stored as which grid triangles each space
    covers (FR-029d).
  Custom Set (free placement, FR-026) is not a lattice and stays outside the engine.
- **FR-003**: In this feature only square and rectangle blocks are placeable; a space's shape decides
  which blocks fit it, so later block shapes (FR-060a) plug in without changing placement.
- **FR-004**: Space ids MUST stay derived from position (spec 003 slot-ids contract). On-Point's main
  grid MUST use the same ids as Horizontal's block grid (row and column), so switching keeps blocks
  (US4). The contract MUST gain the id grammar for between-blocks spaces, partial spaces, setting
  pieces, and diagonal sashing.
- **FR-005**: Horizontal on the engine MUST produce exactly the spaces, ids, outlines, and order it
  produces today (US3).

**On-Point** (spec 001 FR-022)

- **FR-010**: On-Point MUST take blocks across and down (1 to the FR-029 maximum), finished block side,
  sashing width (0 for none), and corner style (corner triangle or seam).
- **FR-011**: The inspector MUST show the quilt's finished size and the block's width on point.
- **FR-012**: The layout style picker MUST offer On-Point (it is listed as coming soon today).
- **FR-013**: The Start a quilt wizard (spec 006 FR-001) MUST offer the style (Horizontal or
  On-Point; On-Point starts with the default corners and edge) and MUST show a live preview of the
  quilt, with its finished size, that updates as choices are made. *Added 2026-10-15 (owner).*

**Edge finish** (spec 001 FR-029e)

- **FR-020**: A layout with an uneven edge MUST offer Exact, Floating (with a float amount), Trimmed
  blocks, and No fill. New On-Point quilts start Floating with a 1″ float.
- **FR-021**: Setting pieces MUST be plain spaces that color like patches, are included in yardage,
  and print with cut sizes and grain along the outer edge.
- **FR-022**: No fill MUST make the uneven edge the quilt's edge: borders set aside (kept, restored
  when another finish is chosen), binding length measured along the edge.

**Format** (spec 003)

- **FR-030**: On-Point's parameters MUST be saved in the project. The project format version MUST be
  raised with a migration (files with the placeholder On-Point style get default parameters), and
  the published schema regenerated.
- **FR-031**: Generated spaces MUST NOT be stored; only the layout parameters and placed content are.

### Key Entities

- **Layout preset**: a named style (Horizontal, On-Point) and the parameters the user sets.
- **Repeating cell**: the block spaces and sashing pieces that repeat, each with shape, size, turn.
- **Space**: a place in the quilt with an id, shape, outline (lines and arcs), and how a block maps
  into it; kinds are block space, partial space, sashing, cornerstone, setting piece, border.
- **Edge finish**: Exact, Floating (float amount), Trimmed blocks, or No fill.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every Horizontal layout in the test fixtures and a sweep of counts, sizes, and sashing
  gives identical spaces and ids before and after the engine (zero differences).
- **SC-002**: A quilter makes a 5 × 5 On-Point quilt with sashing and floating setting triangles and
  prints its cutting list without leaving the quilt editor, in under 2 minutes.
- **SC-003**: On-Point quilt size and setting-triangle cut sizes match the standard quilting formulas
  (side triangles: block diagonal + 1¼″ square cut twice; corners: block side ÷ √2 + ⅞″ square cut
  once) within 1/16″.
- **SC-004**: Every layout in FR-002a is described as an engine preset in a check (no user interface)
  that generates, draws, and hit-tests it, with unique position-based ids and spaces that cover the
  quilt without gaps or overlaps (other than trims). Adding each one's user-facing style later needs
  no change to the engine, drawing, hit testing, or printing.
- **SC-005**: Changing On-Point counts up to 100 × 100 redraws without a noticeable pause on a
  mid-range phone.

## Assumptions

- The engine supports every layout in FR-002a now (proved by SC-004), but their inspectors, style
  picker entries, file parameters, and printing checks come with later specs; this feature ships only
  Horizontal and On-Point to users.
- The editing gesture for merging and splitting triangle-grid spaces is a later feature; the engine
  already generates layouts with merged spaces.
- Block sizes are entered as the finished square side (what quilters piece); the reference quilt
  software measures differently, which isn't copied (confirmed 2026-10-15).
- Borders keep working as today (straight strips around the straight edge); border styles are not
  part of this feature.
- Turning or flipping a block in an on-point space uses the same choices as a square space (90°
  steps), since the space is a square turned with the layout.
