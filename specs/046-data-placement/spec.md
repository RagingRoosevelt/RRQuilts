# Feature Specification: Placing Data Blocks by Number and Series

**Feature Branch**: `TBD` (no feature branch yet)

**Created**: 2026-10-28

**Status**: Draft (spec only; not implemented). Reworks the numbered list of spec 025 (data quilts).

**Input**: Owner, 2026-10-28, after three week blocks didn't show in a Months quilt's picker:

- "we should be able place multiple blocks to address the same numeral (wk#, month#, day#)"
- "placing should be done the same way we do it for the numerals in a data block. we'll use the
  same labels we're already using for the data slots in the data quilts (wk#, month#, day#) but we
  won't have the drag and drop system we do now for blocks in the data quilt. if you want to remove
  a data block from a data slot, click the slot and then click the block you want to remove (if it
  matches the slot) or if you click on a data block assigned to a different slot, it sets the new
  slot on it."
- "we'll only do the numeral increment placing method rather than the drag/drop. and what is placed
  corresponds to the data block you have picked."
- "we will have support at the quilt level for designating a (single series) data block to one of
  the data series (A, B, C, D). when placing a single series block we'll show it as Wk1 with the
  series label on the line below qA, Jan<br>qB, etc. when a multi-series data block is selected, we
  will need to pick as many series as the block supports (and in the order we want them to map from
  quilt series designators to block series designators - quilt A -> block B, etc) and then when we
  place the multi-series block, we'll show the slot label on one line and the series label(s) on
  the next line in the order that they apply to the block's series if it's a multi-series block
  (for a three series data block, if quilt-A matches to block-C, quilt-B matches to block-A,
  quilt-C matches to block-B, then series order shown below data slot label would be qB, qC, qA)"
- "(in both data block design and data quilt design) since we expect there may be several instances
  of a given numeral, when we draw the trace indicating direction between the slots, we'll consider
  several cases of drawing traces from slot X to Y (y=x+1): two instances of X and one of Y means
  that both instances of X trace to Y; one instance of X and one instance of Y means a single trace
  from X to Y; one instance of X and two of Y means a trace from X to each instance of Y; two
  instances of X and two instances of Y means that the trace from X_1 goes to the nearest instance
  of Y and then the trace from X_2 goes to closes instance of Y that isn't already traced to
  (generalzied to cases of more than one X and Y). at some point we'll find ourselves in one of the
  three proceeding cases and then would draw traces according to those rules"
- "and we can drop the block number from displaying in the design view since the drag and drop is
  going away" / "we'll still have it behind the scenes, though, I'm sure"

## Today (spec 025, 0.7.0)

- The plan's **numbered list** (`DataPlan.order`) holds at most one block space per number (Jan,
  Wk 1, Jan 2…). Cards are dragged (or moved with arrows) to reorder.
- The block a space shows comes from the plan's **types**: picked per kind and month length in the
  Data blocks tab, several per length chosen at random (seeded, **Shuffle**).
- Tapping spaces with the number brush places the highlighted number and moves to the next free
  one; tapping a placed space takes its number back.
- The quilt's values A–D (the Data tab's **Values**; the owner calls them **series**) map straight
  onto the block's paints: a block patch painted "5·B" shows value B.
- Each list card and each placed space on the quilt shows **Block N** (spaces counted left to right,
  top to bottom) beside the number.
- The order line joins one place per number.

## Concepts

- **Number**: one entry of the plan's list (a month, a week or left-over day, or a day), shown by
  its label: Jan, Wk 1, Jan 2. Owner's word: data slot.
- **Placement**: a block space given a number, a data block and a series map. A number may have any
  number of placements (none, one, several).
- **Series**: the quilt's values A–D, written **qA…qD** on the quilt. A block's own series are the
  value letters its paints use, written block-A…D.
- **Single-series block**: a data block whose paints use one letter. Placed for one quilt series of
  the quilter's choice (qA by default).
- **Multi-series block**: paints use two to four letters. Picking it asks for a quilt series per
  block series, in the block's letter order: a three-series block (A, B, C) mapped qB→A, qC→B, qA→C
  shows **qB, qC, qA**.
- **Brush**: the picked data block, its series map and the highlighted number.

## User Scenarios & Testing

### User Story 1 - Place blocks by number (Priority: P1)

**Independent Test**: In a Weeks quilt, pick Snake Straight, tap three spaces: they read Wk 1, Wk 2,
Wk 3. Click Wk 2 in the list, tap a fourth space: it reads Wk 2 too, and Wk 2 has two placements.

1. **Given** a data block picked in the Data blocks tab, **When** the quilter taps a block space,
   **Then** the space takes the highlighted number with that block (its variant for the number's
   days, as today) and the highlight moves to the next number.
2. **Given** a number clicked in the list, **Then** it becomes the highlight, whether or not it is
   already placed, so the next tap adds another placement for it.
3. **Given** the highlighted number and a space already placed for it, **When** tapped, **Then**
   that placement is removed (the number keeps its other placements).
4. **Given** a space placed for another number, **When** tapped, **Then** it takes the highlighted
   number (keeping its block and series map).
5. **Given** an ordinary (non-data) block picked, **Then** taps set it as in Other blocks today.
6. **Then** there is no drag and drop and no move arrows in the list, and no per-length pools or
   Shuffle: the block placed is the one picked.

### User Story 2 - Series (Priority: P1)

**Independent Test**: A High/Low quilt (A, B). Pick a single-series week block, choose qB, place it:
the space reads Wk 1 over qB and its pieces follow the Low values.

1. **Given** a single-series block picked, **Then** a series choice (qA…qD, the quilt's values in
   use) sits by it, qA by default.
2. **Given** a multi-series block picked, **Then** the quilter picks a quilt series for each block
   series in order; placing waits until every block series has one. A quilt with fewer values than
   the block needs says so and doesn't place it.
3. **Then** a placed space shows its number on one line and its quilt series on the next, in the
   block's series order (qB, qC, qA).
4. **Then** a piece's value comes from its day and its block series mapped to the quilt series of
   its placement.

### User Story 3 - Order line with several placements (Priority: P1)

Applies to the order line between numbers in the quilt (block spaces) and to the line between
numerals in the data block editor (patches).

For a number X and the next number Y = X + 1, with places x₁…xₘ and y₁…yₙ (in placement order):

1. m = 1: x₁ traces to every y.
2. n = 1: every x traces to y₁.
3. m, n ≥ 2: take x's in order; each traces to the nearest y not yet traced to (center to center);
   both are set aside. Repeat until one side has a single place left, then apply 1 or 2 to what is
   left (the last x to every y left, or every x left to the last y).

Examples: 2 x, 1 y: both trace to y. 1 x, 2 y: two traces. 2 x, 2 y: x₁ to its nearest y, x₂ to the
other. 3 x, 2 y: x₁ to its nearest y, then x₂ and x₃ both to the other.

### User Story 4 - No block numbers (Priority: P2)

1. **Then** neither the list nor the quilt shows **Block N**. The list shows each number with its
   placements' thumbnails and series, or Not placed.
2. **Then** it stays behind the scenes: placements keep pointing at block spaces by their ids, and
   the reading-order count (`spaceNo`) is still worked out for screen-reader labels and anywhere
   else that needs to name a space (print, reports).

## Requirements

- **FR-001**: A data plan MUST hold, per number, a list of placements: block space, data block, and
  quilt series per block series (single-series: one).
- **FR-002**: Placing MUST be the number brush only (User Story 1); drag and drop, move arrows, the
  per-length type pools and Shuffle are removed.
- **FR-003**: A piece's value MUST come from the placement's series map (User Story 2.4).
- **FR-004**: The order line MUST follow User Story 3 in the quilt and in the data block editor.
- **FR-005**: Placed spaces MUST show the number and, below it, the quilt series in block series
  order; **Block N** goes (list and quilt).
- **FR-006**: Reports (spec 025 FR-004) MUST list numbers without placements; a number with several
  placements is fine. Print and yardage count every placement.
- **FR-007**: The project format MUST bump (rrq v10) with a migration: each old `order` entry
  becomes one placement with the block its space showed (its type) and series map qA→A … (paints'
  letters unchanged), so old quilts look the same.
- **FR-008**: Switching the plan (spec 025 FR-017) keeps placements whose block takes the new
  number's kind, asking first when any go.

## Open questions (defaults used until answered)

1. Placement order for x₁, x₂ in the order line: the order they were placed (default) or reading
   order (left to right, top to bottom)?
2. The series line on a quilt with only one value (qA): shown always (default, as asked) or hidden?
3. The series map belongs to each placement (default: one block can be placed for qA in one space
   and qB in another), not to the block for the whole quilt.
4. A space can hold one placement (default): tapping a space with another data block picked
   replaces its block.

## Out of scope

- Several numbers on one space (one block covering two weeks).
- Per-length random pools come back later only if asked.
