# Feature Specification: Placing Data Blocks by Number and Series

**Feature Branch**: `TBD` (target 0.7.2, head of the roadmap: a fix for an oversight in spec 025)

**Created**: 2026-10-28

**Status**: Built on branch `046-data-placement`, 2026-10-28 (not released; checks TC-184, TC-186 to TC-190).
Reworks the numbered list of spec 025 (data quilts).

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
- "in quilt week mode, let's also placing a 1-day block in the first slot to convert it to a Jan 1
  block and the last slot into a week 52 slot"

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
  its label: Jan, Wk 1, Jan 2. The owner's words **numeral** and **data slot** mean the same.
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
3. **Given** a placed space, **When** tapped, **Then** it compares the brush (highlighted number,
   picked block, its series) with the placement and changes only what differs:

   | Brush vs placement | Result |
   |---|---|
   | same number, same block, same series | placement removed (the number keeps its others) |
   | same number, other block | block changed, number kept |
   | same block, other number | number changed, block kept |
   | other block and other number | both changed |
   | same number and block, other series | series changed |

   (Owner, 2026-10-28: "if you change the block but have the same numeral selected as is already
   present, then you just change the block; if you have the same block selected but have a
   different numeral selected, then you just change the numeral; if you have a different block and
   a different numeral selected, both are changed".)
4. **Then** the highlight moves to the next number after a new placement or a number change; a
   block or series change alone keeps it. A space holds one placement.
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
   block's series order (qB, qC, qA). A quilt with one value still shows its qA line (owner,
   2026-10-28: "yes it does").
4. **Then** a piece's value comes from its day and its block series mapped to the quilt series of
   its placement.

### User Story 3 - Order line with several placements (Priority: P1)

Applies to the order line between numbers in the quilt (block spaces) and to the line between
numerals in the data block editor (patches). Each value has its own line: in the block editor,
patches of one value letter (A); on the quilt, the placements showing one quilt value (qA), a
several-value placement joining each of its values' lines (owner, 2026-10-28: "tracings should
only consider blocks or patches that are in the same series").

For a number X and the next number Y = X + 1, with places x₁…xₘ and y₁…yₙ (in the order they were placed; owner, 2026-10-28: "seems fine"):

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

### User Story 5 - Weeks plan starting with a single day (Priority: P2)

Today a Weeks plan runs 52 weeks from the period start and puts the day left over (two in a leap
year) at the end: Wk 1 … Wk 52, Dec 31.

**Independent Test**: A Weeks quilt starting 1 January 2027. Pick a 1-day block (a day block or a
week block's 1-day variant), tap a space with Wk 1 highlighted: the list now reads Jan 1, Wk 1
(Jan 2–8) … Wk 52 (Dec 25–31), and no Dec 31 day at the end.

1. **Given** a Weeks plan whose first number is a week, **When** a 1-day block is placed on it,
   **Then** the first number becomes a single day (the period's first day, Jan 1), weeks start the
   day after, and the day left over at the end goes (the last number is Wk 52). A leap year
   follows the Leap day setting (User Story 6).
2. **Then** placed weeks keep their numbers (Wk k stays Wk k) and their days move one later.
3. **Given** the first number is already a single day, **Then** placing a week block on it,
   removing its last 1-day placement, or placing a 1-day block on the last number (Wk 52) turns it
   back (weeks from the period start, the left-over day at the end). Placing on Wk 52 asks first:
   "Make Jan 1 part of Wk 1 again and the last day (Dec 31) a single day?" Yes turns it back and
   puts the block on the new last number, Dec 31; No places nothing. (Owner, 2026-10-28: "or
   placing a 1 day block in the last slot asks if you want to convert the first slot to a week
   slot and change to the last slot being a 1 day slot".)
4. **Given** week placements already on Wk 1, **When** a 1-day block is placed there, **Then** a
   dialog says those placements move to Wk 1 starting a day later and asks first.
5. **Then** the switch is saved with the plan (`lead: 'day'`), is one undo step, and the Data tab's
   period text says "Jan 1, then weeks from Jan 2".

### User Story 6 - Leap day setting (Priority: P2)

A Weeks plan over a period holding 29 February has 366 days: 52 weeks and two days left over. A
Days plan has 366 numbers. Months plans need nothing: February takes its block's 29-day variant
(spec 025; owner, 2026-10-28: "in month mode, it goes in the month using the extra slot").

(Owner, 2026-10-28: "let's have the leap year question be a setting in the details / data quilt
section. choices the user could pick between are "ignore Feb 29", "use a 2-day block variant in
place of a 1-day block variant", or "use an extra single-day data block slot which will be at the
start/end of the year"" and "months already has it solved by using the 29/30/31 variant for feb
for leap years. for day mode, let's give the user the option between "average feb 28 & feb 29"
(let's add this as an option for wk mode too), "ignore feb 29", "make extra day slot available to
place"".)

1. **Given** a Weeks or Days plan whose period holds 29 February, **Then** the quilt's Details tab,
   Data quilt section, shows **Leap day**:

   | Choice | Weeks | Days |
   |---|---|---|
   | **Average Feb 28 and Feb 29** | ✓ | ✓ |
   | **Ignore Feb 29** | ✓ | ✓ |
   | **Use a 2-day block variant** | ✓ | |
   | **Extra single-day number** (default) | ✓ | ✓ |

   - **Average**: the period counts 365 places. Feb 28's place shows the average of Feb 28's and
     Feb 29's values (each value A–D on its own); a day with only one of the two shows that one.
     A category value (Mood) averages the two categories' places in its list, and a half is
     settled by the quilt's **Categories round** setting, **Down** (default: the one earlier in
     the list) or **Up** (the later). One setting for the whole quilt, covering every category
     value, in the Details tab's Data quilt section beside Leap day; shown while Average is picked
     and the quilt has a category value. (Owner, 2026-10-28: "for categorial, give the option to
     round up or round down" / "no let's just have this as a setting for the whole quilt for any
     category series. we can put it in the details/data quilt settings section".)
   - **Ignore**: the period counts 365 places. Feb 29 has no place (in Weeks, the week holding it
     runs Feb 28 to Mar 1 with seven places) and its entries and sample values are left out.
   - **2-day variant** (Weeks): the single day becomes one number of two days (Jan 1–2 at the
     start, Dec 30–31 at the end) and takes a block's **2-day variant**. Week blocks may add a
     2-day variant (spec 025 variants: 1 and 2). A block without one shows its smallest variant
     with at least two days (the 7-day drawing), its unused places following the fill policy.
   - **Extra**: Weeks: the period's first and last days are single-day numbers and the 52 weeks
     run between them: Jan 1, Wk 1 (Jan 2–8) … Wk 52 (Dec 24–30), Dec 31 for a 2028 quilt (owner,
     2026-10-28: "jan 1 and dec 31, paralles what we're already doing"). The single-day start of User Story 5 is then always on and its
     switches don't apply. 0.7.0 quilts (both days at the end) open with their placements on the same
     numbers. Days: Feb 29 is a number of its own to place.
2. **Given** a period without 29 February, **Then** the setting is hidden (and kept for when the
   start moves).
3. **Then** the choice is saved with the plan (`leap: 'average' | 'ignore' | 'pair' | 'extra'`,
   and `leapRound: 'down' | 'up'` for the whole quilt;
   `pair` only in Weeks, a Days plan reads it as `extra`). Changing it moves placements by their
   number's label (Wk 3 stays Wk 3, Mar 1 stays Mar 1). Placements whose label goes (Days: Feb 29
   under Average or Ignore; Dec 31 under the 2-day variant) or whose block can't show the new
   number come off the quilt, after a dialog saying how many (Undo brings them back), as when the
   plan switches (FR-008).
4. **Then** the Data tab's entry table still lists Feb 29 under Average and Ignore, so real data
   can be kept complete, with a note saying how the quilt uses it.

## Requirements

- **FR-001**: A data plan MUST hold, per number, a list of placements: block space, data block, and
  quilt series per block series (single-series: one).
- **FR-002**: Placing MUST be the number brush only (User Story 1); drag and drop, move arrows, the
  per-length type pools and Shuffle are removed.
- **FR-003**: A piece's value MUST come from the placement's series map (User Story 2.4). The map
  belongs to each placement: the same block can be placed for qA in one space and qB in another
  (owner, 2026-10-28: "we expect to use a block placed in one spot for one series and placed in
  another spot for another series").
- **FR-004**: The order line MUST follow User Story 3 in the quilt and in the data block editor.
- **FR-005**: Placed spaces MUST show the number and, below it, the quilt series in block series
  order; **Block N** goes (list and quilt).
- **FR-006**: Reports (spec 025 FR-004) MUST list numbers without placements; a number with several
  placements is fine. Print and yardage count every placement.
- **FR-007**: The project format MUST bump (rrq v10) with a migration: each old `order` entry
  becomes one placement with the block its space showed (its type) and series map qA→A … (paints'
  letters unchanged), so old quilts look the same. A leap year's Weeks list (Wk 1 … Wk 52, Dec 30,
  Dec 31) becomes the Extra layout (Jan 1, Wk 1 … Wk 52, Dec 31): weeks keep their labels, Dec 30's
  blocks go to Jan 1. Block files go to v5 and libraries to v7 for the 2-day variant.
- **FR-008**: Switching the plan (spec 025 FR-017) keeps placements whose block takes the new
  number's kind, asking first when any go.
- **FR-009**: A Weeks plan MUST allow a single lead day (User Story 5), set by placing a 1-day
  block on the first number and cleared by placing a week block there, removing its last 1-day
    placement, or (after asking) placing a 1-day block on the last number. Day numbering (spec 025
  FR-004) becomes: lead day 1, then 7 × (k − 1) + 2 … for Wk k.
- **FR-010**: A Weeks or Days plan over a leap year MUST offer the Leap day setting (User Story 6) in the
  Details tab's Data quilt section; week blocks MUST be able to add a 2-day variant (block file and
  library formats bumped with the project's).

## Out of scope

- Several numbers on one space (one block covering two weeks).
- Per-length random pools come back later only if asked.
