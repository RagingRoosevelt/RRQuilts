# Feature Specification: Move Tool: Select and Drag Blocks in a Quilt

**Feature Branch**: `TBD` (target 0.10.0; was 0.9.0)

**Created**: 2026-10-29

**Status**: Draft (spec only; not implemented). The quilt editor's counterpart of spec 051 (EPP
multi-select).

**Input**: Owner, 2026-10-29: "let's also add a 0.9.0 spec that blocks in a standard quilt (or data
quilt) should also be multi-selectable and can be dragged (erasing anything they were dragged
ontop of). this would introduce a new move tool that activate this block selection mode".
Then: "turning or flipping a group of blocks should be supported. we won't add support for sashes,
borders, or strips (since they are part of the layout and can't be moved)" (User Story 5).

## Today (0.7.2)

- Block tools on the quilt editor's rail: Set, Rotate, Flip, Erase, Find (`BLOCK_TOOLS`,
  `stores/editor.ts`). Each acts on one tap, with the This / All / Alternate scope.
- A quilt's blocks live in its block spaces (`layers[0].slots`, keyed by slot id), each with the
  block, its turn, flip and coloring. A data quilt also places numbers and blocks on spaces
  (`plan.places`, spec 046).
- There's no way to move a block from one space to another except erasing it and setting it again.

## Concepts

- **Move tool**: a new block tool on the rail, next to Set. While it's on, taps and drags pick and
  move blocks instead of setting them.
- **Selection**: one or more block spaces picked together, with what's in them (block, turn, flip,
  coloring, and in a data quilt the placed numbers and data blocks).
- **Moving**: dragging the selection shifts it across the quilt's spaces. Each selected space's
  contents go to the space it lands on. Whatever was in a landing space is replaced (erased). The
  spaces the selection left become empty, unless something else in the selection landed there.

## User Scenarios & Testing

### User Story 1 - Pick blocks with the Move tool (Priority: P1)

**Independent Test**: Straight Set quilt, 5 × 5. Move tool, drag a box around the top-left 2 × 2:
four spaces show selected with one outline.

**Acceptance Scenarios**:

1. **Given** the quilt editor's Design tab, **Then** the rail has a **Move** tool (icon: four-way
   arrow) among the block tools, with a tooltip and a help link.
2. **Given** the Move tool, **Then** blocks are picked by: tap (one space); Shift (or Ctrl/Cmd) plus
   tap (add or remove); dragging a box from empty space or a space's edge (every space whose middle
   is inside); on touch, long-press to start adding, tap more, **Done** to finish; **Select all**
   (Ctrl/Cmd+A); **Select same** (every space with the same block).
3. **Given** a selection, **Then** the picked spaces show a highlight (the Find glow, spec 046, kept
   on), and empty spaces can be picked too (moving them moves emptiness: they erase what they land
   on).
4. **Given** Esc, a tap outside the quilt, or another tool, **Then** the selection clears.
5. **Given** sashes, cornerstones and borders, **Then** they can't be picked (only block spaces).

---

### User Story 2 - Drag the selection (Priority: P1)

**Independent Test**: Pick the top-left 2 × 2, drag it two spaces right: the four blocks now sit in
columns 3 and 4, what was there is gone, and columns 1 and 2 of those rows are empty. One undo puts
everything back.

**Acceptance Scenarios**:

1. **Given** a selection, **When** a selected space is dragged, **Then** a copy of the selection's
   blocks follows the pointer (faded originals stay in place, as spec 037), snapping space by space:
   the selection lands where the spaces under it line up with its own (same step across and down).
2. **Given** a landing place, **Then** its spaces are outlined before release; spaces whose contents
   will be erased show a red tint, so it's clear what will be lost.
3. **Given** release, **Then** each selected space's contents (block, turn, flip, coloring) go to its
   landing space, landing spaces' old contents are erased, and left spaces become empty. One undo step.
4. **Given** **Alt** (Option) held at release, **Then** the selection is copied instead of moved: the
   originals stay.
5. **Given** a landing place where some of the selection falls off the quilt, or onto spaces that
   can't take the block (a shaped space, spec 026 `takesBlock`; sashing), **Then** those show red
   with a cross and the release is refused with a note ("3 blocks don't fit there"); the quilter
   moves on.
6. **Given** arrow keys, **Then** the selection moves one space (with the same erase and refusal
   rules), one undo step each.
7. **Given** a drag back to the start, or Esc during a drag, **Then** nothing changes.

---

### User Story 3 - Layouts that aren't straight rows (Priority: P2)

1. **Given** On-Point, Strips, Variable Point, Tumbling, Baby Blocks and other layouts, **Then**
   "lining up" means the move that maps each picked space onto a space of the same kind and shape
   by the layout's own repeat (the steps `a` and `b` of the layout's tiling, spec 018 engine), so
   on-point blocks move to on-point spaces, alternate spaces to alternate spaces.
2. **Given** a layout where one block's move can't keep shapes or turns (for example a triangle
   space landing on one pointing the other way), **Then** that landing isn't offered (the drag snaps
   only to landings that fit).
3. **Given** a layout with one-off spaces (a medallion's center), **Then** only identical spaces are
   landings; a lone center can't move.

---

### User Story 4 - Data quilts (Priority: P1)

1. **Given** a data quilt, **Then** the Move tool works the same, and each space carries its placed
   data (numbers and their data blocks with series, spec 046) with it; landing erases the data placed
   on the landing spaces.
2. **Given** a move, **Then** the order lines (spec 025) redraw for the new spaces; the numbers
   themselves don't change.
3. **Given** a weeks plan with the Jan 1 or Dec 31 single day (spec 046), **Then** it moves like any
   other placement.
4. **Given** an erase that removes numbers, **Then** the data report (spec 025) lists the numbers no
   longer placed, as it does after an Erase.

### User Story 5 - Turn or flip the selection (Priority: P1)

**Independent Test**: Straight Set, pick a 2 × 3 group with an arrow block pointing right in its
top-left space. **Turn** once: the group is now 3 × 2 in the same place, the arrow block is in the
top-right space and points down. **Flip across**: the group mirrors left to right and each block
is flipped. One undo each.

**Acceptance Scenarios**:

1. **Given** a selection with the Move tool, **Then** **Turn left**, **Turn right**, **Flip across**
   and **Flip up and down** show by the selection (and as keys: R / Shift+R, H, V).
2. **Given** a turn, **Then** the selection's spaces turn around its middle by the layout's turn
   step (90° for square grids and On-Point, 60° for triangle and hexagon grids): each block goes to
   the turned position and its own turn changes by the same step, so the group looks turned as a
   whole.
3. **Given** a flip, **Then** positions mirror across the selection's middle line and each block is
   flipped the same way (its flip toggled, and its turn adjusted so the picture is the mirror image).
4. **Given** a turn or flip whose result doesn't line up with the quilt's spaces (an odd-sized group
   whose turned middle falls between spaces, a shape the layout doesn't have turned), **Then** the
   result is nudged to the nearest landing that fits, or refused with a note if none does.
5. **Given** a turned or flipped selection, **Then** it lands by the same rules as a move: shown
   first while dragging, erases what it covers, red for what doesn't fit, one undo step. Turning in
   place (no drag) applies at once with the same rules.
6. **Given** a data quilt, **Then** placed numbers move with their spaces as in User Story 4; the
   numbers keep their values.

### Edge Cases

- **Overlapping move** (the selection lands partly on itself): handled as one move (all lifted,
  then all set), never erasing the selection's own blocks.
- **Colorings**: the quilt's per-space colorings (copy-on-write, `coloring.ts`) move with their
  blocks; a coloring scope (All, Alternate) isn't involved.
- **Colorways**: a move changes the primary colorway; other colorways follow it (they map colors,
  not spaces).
- **Scope** (This / All / Alternate) doesn't apply to the Move tool.
- **Read-only project**: Move tool is off.
- **Big selections**: moving 500 spaces stays smooth (copy drawn as one image).

## Requirements

- **FR-001**: The quilt editor MUST have a **Move** block tool for standard and data quilts.
- **FR-002**: With Move on, block spaces MUST be multi-selectable by tap with modifier, box, touch
  long-press, Select all and Select same; only block spaces.
- **FR-003**: Dragging (or arrow keys) MUST move the selected spaces' contents by a whole step of the
  layout's repeat, landing only where every picked space fits, showing what will be erased; release
  replaces the landing spaces' contents and empties the left ones, as one undo step.
- **FR-004**: Alt (Option) at release MUST copy instead of move.
- **FR-005**: In data quilts, placed numbers and data blocks MUST move with their spaces (`plan.places`
  updated), and landing MUST erase the data placed there.
- **FR-006**: The selection is session state only; no format change.
- **FR-007**: A selection MUST turn (left, right, by the layout's turn step) and flip (across, up and
  down) as a group, positions and each block's turn and flip together, landing by FR-003's rules.

## Success Criteria

- **SC-001**: A quilter moves a 3 × 3 group of blocks across a 10 × 10 quilt in one drag, with what
  they'll overwrite shown before letting go.
- **SC-002**: Any move followed by one undo leaves the quilt exactly as before.

## Assumptions

- The faded original and picked-up copy follow spec 037's drag look.
- The Rotate and Flip tools still turn or flip single blocks in place; turning a group is the Move
  tool's.

## Out of scope

- Moving sashes, borders or strips: they're part of the layout and can't be moved (strips are
  rearranged with their own tools, spec 017).
