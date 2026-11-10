# Feature Specification: EPP Multi-Select (a Selection That Acts Like a Rosette)

**Feature Branch**: `TBD` (target 0.9.0, with specs 027 and 050; was 0.8.0)

**Created**: 2026-10-29

**Status**: Draft (spec only; not implemented). Details spec 027 User Story 2, scenario 6 (groups)
and FR-005.

**Input**: Owner, 2026-10-29: "we should also add a spec for EPP so that patches can be
multi-selected and moved around as if they were a stamp (where the patches are kept together,
rotated together, etc). stamps should be able to be included in that multi-select".

## Concepts

- **Piece**: a placed shape (spec 027, the owner's "patch") or a placed rosette (spec 050).
- **Selection**: one or more pieces picked together. While picked, the selection behaves like a
  temporary, unsaved rosette (spec 050): it moves, turns, mirrors, scales and snaps as one, keeping
  its pieces' arrangement. Nothing is linked or saved; deselecting leaves the pieces where they are,
  each on its own again.
- A placed rosette in a selection is one piece of it (it isn't broken apart).

## User Scenarios & Testing

### User Story 1 - Pick several pieces (Priority: P1)

**Independent Test**: In a hexagon garden, drag a box around one flower plus a placed Flower rosette
beside it: eight items show selected (seven hexagons and one rosette), with one outline and handles
around them all.

**Acceptance Scenarios**:

1. **Given** the Select tool, **Then** pieces are picked by:
   - tap or click: just that piece;
   - Shift (or Ctrl/Cmd) plus tap: add or remove a piece;
   - dragging a box on empty space: every piece wholly inside (holding Alt: every piece touched);
   - on touch, long-press a piece to start multi-select, then tap more to add or remove; **Done**
     ends it;
   - **Select all** (Ctrl/Cmd+A, and the ⋮ menu), and **Select same** (every piece of the same shape
     or rosette, or same fill).
2. **Given** a selection, **Then** each piece shows a light highlight, and one outline with handles
   (turn, mirror, scale) surrounds the whole selection.
3. **Given** a selection of placed shapes and placed rosettes, **Then** both kinds are treated alike.
4. **Given** Esc or a tap on empty space, **Then** the selection clears.

---

### User Story 2 - Move, turn and snap as one (Priority: P1)

**Independent Test**: Select three diamonds forming a tumbling block, drag them next to another
tumbling block: the three move together and snap flush by their outside edges. Turn them 60°: they
turn around the selection's middle, still joined.

**Acceptance Scenarios**:

1. **Given** a selection, **When** any selected piece is dragged, **Then** the whole selection moves,
   arrangement unchanged.
2. **Given** a selection dragged near unselected pieces, **Then** it snaps by the outside edges of the
   selection to equal edges (or whole-unit runs) of the others, as a rosette does (spec 050, spec 027
   FR-003). Edges between selected pieces don't snap to anything.
3. **Given** turn, **Then** the selection turns around its middle (or around a picked corner: tap a
   corner of the outline to set the turn point), in the steps that keep a shared edge with any
   neighbor it's snapped to, or freely off snap.
4. **Given** mirror (across or up and down), **Then** the whole selection mirrors; mirrored shapes
   follow spec 027 (printed as their own or reversed templates).
5. **Given** the Scale slider, **Then** every selected piece's scale and position scale together
   around the middle, so the arrangement keeps its joins (each piece's scale stays 1 to 4: if one
   would leave the range, the step is refused with a note).
6. **Given** arrow keys, **Then** the selection nudges one unit (Shift: one grid step); with
   snapping on, it nudges to the next snap.
7. **Given** any of these, **Then** each move, turn, mirror or scale is one undo step.

---

### User Story 3 - Other actions on the selection (Priority: P1)

1. **Copy / paste / duplicate**: the selection copies as one; paste places it under the pointer, as
   one selection, ready to drag and snap. Placed rosettes stay linked rosettes in the copy.
2. **Delete** removes every selected piece.
3. **Paint**: with the Paint tool and a selection, painting a piece paints it, and scope **Selection**
   (new, next to This / All) paints every selected piece with that fill (in a placed rosette, that piece of the
   placement, spec 050).
4. **Make rosette**: turns the selection into a rosette (spec 050 User Story 1); placed rosettes in it are
   copied in as their pieces, unlinked (spec 050 FR-005).
5. **Break into patches**: on a selection with placed rosettes, breaks each one into patches; the result stays
   selected.
6. **Bring forward / send back**, for overlaps (spec 027 allows them while arranging).

### Edge Cases

- **Selection touching only some neighbors**: dragging it away splits the joins; nothing else
  moves.
- **Locked pieces** (if added later): left out of box selection.
- **A piece inside a placed rosette**: can't be selected on its own from the quilt; the whole rosette is
  picked (edit the rosette, or break it apart, to reach its pieces).
- **Very large selections** (hundreds of pieces): moving stays smooth; snapping checks only the
  selection's outside edges.
- **Selection after undo**: undo restores the selection as it was before the step.
- **Pieces of different scales**: they move and turn together; snapping still uses whole-unit
  steps.

## Requirements

- **FR-001**: The EPP editor MUST support multi-select of placed shapes and placed rosettes by tap with
  a modifier, box, long-press multi-select on touch, Select all and Select same.
- **FR-002**: A selection MUST move, turn (around its middle or a picked corner), mirror, scale and
  nudge as one, keeping its arrangement, with one undo step per action.
- **FR-003**: A selection MUST snap by its outside edges only, exactly as a rosette does.
- **FR-004**: Copy, paste, duplicate, delete, paint (scope Selection), Make rosette and Break into patches MUST
  work on a selection.
- **FR-005**: A selection is session state only: no format change; nothing is saved when it ends.

## Success Criteria

- **SC-001**: A quilter selects a flower of seven hexagons in one box drag and moves it to the other
  side of the quilt, snapped, in under 10 seconds.
- **SC-002**: Turning and mirroring a selection never changes which of its pieces share an edge.

## Assumptions

- "Patches" in the owner's note are spec 027's placed shapes.
- The quilt editor's existing selection tools (spec 006) are the model where they fit; EPP adds the
  box, the outline handles and snap-as-one.

## Out of scope

- Saving a selection as a named group without making a rosette (a rosette does that).
