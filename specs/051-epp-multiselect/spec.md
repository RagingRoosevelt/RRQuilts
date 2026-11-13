# Feature Specification: EPP Multi-Select (a Selection That Acts Like a Rosette)

**Feature Branch**: `027-epp-layouts` (target 0.9.0, with specs 027 and 050; was 0.8.0)

**Created**: 2026-10-29

**Status**: Built 2026-11-12 on `027-epp-layouts` (tasks T059-T061, T082; checklist TC-291), then
reworked the same day to the owner's design below. Details spec 027 User Story 2, scenario 6
(groups) and FR-005.

**Input**: Owner, 2026-10-29: "we should also add a spec for EPP so that patches can be
multi-selected and moved around as if they were a stamp (where the patches are kept together,
rotated together, etc). stamps should be able to be included in that multi-select".

## Clarifications

### Session 2026-11-12

- Q: How much does multi-select add to the editors? → A: Picking only, no toolbar of its own; the
  rail's own buttons and the sidebar act on what is picked, plus a Duplicate button. Owner,
  2026-11-12, after trying a first version with a floating bar of selection actions: "I don't think
  we need to have dedicated buttons for the various functions like you added in the new toolbar
  (in fact, we should kill it). here's what I think we should do: - multi-select only allows for
  multi selecting and doesn't add that new floating toolbar - multi select/deselect happens just
  from a click/touch when using that tool - the normal, pre-existing toolbar buttons work on
  multi-select items - when in multi-select mode, a drag started on a shape moves the pieces - a
  drag started not on a shape does the box select - changing the scale in the sidebar when
  mutli-selection is made changes the scale of the selected pieces - we add a duplicate button in
  the toolbar that acts on mutli-selected items that creates a temporary virtual rosette in the
  sidebar that can then be placed (until a new temporary virtual rosette is made). this isn't an
  actual entity, just a collection of whatever items were mutli-selected." Then: "let's just have
  two buttons for mirror-x and mirror-y".
  Dropped with the bar: Shift/Ctrl taps, press and hold, Select same, copy and paste, bring forward
  and send back, and Make rosette in quilts (rosettes are made in the rosette editor or the shape
  editor's Multi-shape mode, spec 050).

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
beside it: eight items show picked (seven hexagons and one rosette), with one outline around them
all.

**Acceptance Scenarios**:

1. **Given** the **Select** tool, **Then** a tap on a piece picks it or, picked already, unpicks it;
   a tap on empty space unpicks everything; a drag from empty space draws a box that adds every
   piece wholly inside (holding Alt: every piece it touches). Ctrl/Cmd+A picks all, Esc unpicks.
2. **Given** pieces picked, **Then** each shows a blue outline, a dashed outline surrounds them all,
   and the readout counts them ("· 3 picked"). There is no toolbar of its own.
3. **Given** a selection of placed shapes and placed rosettes, **Then** both kinds are treated alike.

---

### User Story 2 - Move, turn and snap as one (Priority: P1)

**Independent Test**: Select three diamonds forming a tumbling block, drag them next to another
tumbling block: the three move together and snap flush by their outside edges. Turn them 60°: they
turn around the selection's middle, still joined.

**Acceptance Scenarios**:

1. **Given** the Select tool, **When** a drag starts on a piece, **Then** the piece joins the
   selection if it wasn't picked and the whole selection moves, arrangement unchanged (with the
   Place tool, dragging a picked piece moves the selection too).
2. **Given** a selection dragged near unselected pieces, **Then** it snaps by the outside edges of the
   selection to equal edges (or whole-unit runs) of the others, as a rosette does (spec 050, spec 027
   FR-003). Edges between selected pieces don't snap to anything.
3. **Given** pieces picked, **When** the rail's **Turn** button is pressed, **Then** the selection
   turns around its middle, to the next edge that fits a neighbor it's snapped to, or by one corner
   step off snap. (With the Turn tool, a tap on a picked piece does the same.)
4. **Given** pieces picked, **When** **Mirror left to right** or **Mirror up and down** is pressed
   (two buttons, also for single pieces with a tap), **Then** the whole selection mirrors about its
   middle; mirrored shapes follow spec 027 (printed as their own or reversed templates).
5. **Given** pieces picked, **Then** the sidebar's **Scale** shows the smallest picked piece's size,
   and changing it sets that size, the others and their positions in proportion around the
   middle, so the arrangement keeps its joins (sizes stay whole, 1 to 4: a size some piece can't
   take is refused with a note). With nothing picked, Scale is the size to place at.
6. **Given** arrow keys, **Then** the selection nudges one unit (Shift: one grid step).
7. **Given** any of these, **Then** each move, turn, mirror or scale is one undo step.

---

### User Story 3 - Other actions on the selection (Priority: P1)

1. **Delete** (the rail's button, or the Delete key) removes every picked piece.
2. **Break into patches** (quilts) breaks each picked placed rosette into patches; the result stays
   picked.
3. **Paint**: with the Paint tool, a tap on a picked piece paints every picked piece with that fill
   (every piece of a picked placed rosette); a tap elsewhere paints as before (This / All / Same
   shape / Same fill).
4. **Duplicate** (a rail button, Ctrl/Cmd+D): the picked pieces become a temporary rosette at the
   top of the sidebar's picker, picked and ready to place with the Place tool, as often as wanted,
   until the next Duplicate replaces it. It is no entity (nothing is saved): placing it adds the
   pieces themselves at the ghost's spot, snapped by their outside edges like a rosette. Placed
   rosettes in it stay linked rosettes in a quilt; in a rosette they come in as their pieces
   (spec 050 FR-005). Made in a rosette and placed back in it, each coloring keeps its fills.

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

- **FR-001**: The EPP editors MUST support multi-select of placed shapes and placed rosettes with a
  Select tool: tap to pick or unpick, a box dragged from empty space, Select all; no toolbar of
  its own (owner, 2026-11-12).
- **FR-002**: A selection MUST move, turn (around its middle), mirror (left to right, up and down),
  scale (the sidebar's Scale) and nudge as one, keeping its arrangement, with one undo step per
  action; the rail's existing buttons act on it.
- **FR-003**: A selection MUST snap by its outside edges only, exactly as a rosette does.
- **FR-004**: Delete, paint, Break into patches and Duplicate (a temporary rosette in the picker, never
  saved, replaced by the next one) MUST work on a selection.
- **FR-005**: A selection is session state only: no format change; nothing is saved when it ends.

## Success Criteria

- **SC-001**: A quilter selects a flower of seven hexagons in one box drag and moves it to the other
  side of the quilt, snapped, in under 10 seconds.
- **SC-002**: Turning and mirroring a selection never changes which of its pieces share an edge.

## Assumptions

- "Patches" in the owner's note are spec 027's placed shapes.
- The editors' existing buttons are the selection's actions (owner, 2026-11-12); EPP adds the
  Select tool, the box, snap-as-one and Duplicate.

## Out of scope

- Saving a selection as a named group (a rosette does that, made in the rosette editor).
- Turning about a picked corner, nudging to the next snap, Select same, copy and paste, bring
  forward and send back (dropped 2026-11-12 with the toolbar).
