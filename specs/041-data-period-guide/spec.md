# Feature Specification: Making a Data Quilt (Next Steps, Cut Ahead Workbook, Block by Block)

**Feature Branch**: `TBD` (target 0.8.0, its own release; moved out of 0.7.4, owner 2026-10-30)

**Created**: 2026-10-22. Reworked 2026-10-30.

**Status**: Draft (spec only; not implemented). Builds on spec 025 (data quilts) and spec 046
(placing data blocks).

**Input**: Owner, 2026-10-22 test round: "we need a mechanism to, week by week or month by month or
day by day provide guidance on the block map. When you turn off tint by fabric, there's no
indication of how each day's or week's or month's block has fabric needs for that period."
Owner: "the per-tint fabric spec for printing should be in 0.7.1".

Owner, 2026-10-30 (the rework): "let's move the data quilt guide item into it's own release. this
is going to be a whole flow update for how data quilts are interacted with after the design is
done. Because we need to make it easy to enter a single (or several) day's info and get just the
next step(s) associated with that data entry action, we need for the way we present instructions
for data quilts to be possible to piece out that way too. we need to have another interaction mode
for it where all the template pieces are available from the start, but there's a workbook for
deciding which fabric to cut the piece from. we're really close to that right now with the ability
to turn off tint, but we need a bit of flow adjustment so that the templates are given just for the
days you provided data and for that workbook idea for preparing the quilt. I guess we also need a
sort of instruction view that goes data block by data block."
Then: "this release for the data quilt/block flow improvement will be the new 0.8.0 and will push
the current releases out by one".

## Today

- Designing a data quilt ends in the Design tab: the plan, the data blocks, the value mapping,
  sample data, and real data typed or imported in the Data tab's table of dates.
- Printing treats it like any quilt: the picture colored by the shown data, a legend, templates or
  cut sizes for every piece, and a worst-case yardage. **Tint by fabric** off prints the templates
  uncolored, which is close to "every template from the start", but nothing says which fabric each
  day's pieces take.
- Entering a day's value changes the picture, and nothing else. There is no "now cut and sew this".
- Which place is which day shows only on screen (numerals, order line), only in the Design tab.

## Concepts

- **Making** (new): what happens after the design is done, day after day for a year. It has its own
  place in the quilt editor (working name **Make**), with two ways to work: **As you go** and
  **Cut ahead**.
- **Steps**: data quilt instructions are built from small parts, one per day and value, so any set
  of days can be shown on its own: the days just entered, one data block, or the whole quilt. A
  day's step: its pieces (letters, from its block's variant), each with its fabric (the range or
  category its value falls in), its cut (template or rotary size, as the print settings give it),
  and where they go (the block, the places with the day's numeral).
- **As you go**: enter one day or several, and get the next steps for just those days: which
  pieces, cut from which fabric, sewn where. Nothing is cut before its day is known.
- **Cut ahead**: every template and cut is there from the start, uncolored, for the whole quilt (as
  with Tint by fabric off). The quilter prepares pieces in advance and decides each piece's fabric
  later, in the **workbook**.
- **Workbook**: a table of days for deciding which fabric each day's pieces are cut from. Per day:
  date, the day's pieces, value (blank until known), the range or category it falls in, and that
  range's fabric. On screen it fills in as values are entered. Printed, a day without a value shows
  every range's swatch small, to circle by hand.
- **Block by block**: an instruction view that walks the quilt one data block (one number of the
  plan: a month, a week or a day) at a time: the block's variant drawn with piece letters and day
  numerals, and the table of its days. This is the period guide of the first draft.
- **Done**: a day (or a block) can be marked made, so the next steps leave it out.

## User Scenarios & Testing

### User Story 1 - Enter a day, get its steps (Priority: P1)

A quilter making a temperature quilt as they go records yesterday's high and wants to know exactly
what to cut and sew for it.

**Independent Test**: As you go, enter one day's value: the steps show that day only, its pieces
each with a fabric and a cut, and its block with the pieces' places marked.

**Acceptance Scenarios**:

1. **Given** Make › As you go, **When** a day's value is entered (typed, picked, or imported),
   **Then** its steps show at once: the day's block (label, Block N, variant), the pieces with that
   day's numeral, and for each piece its letter, fabric (swatch and name, from the range its value
   falls in) and cut.
2. **Given** several days entered at once (a week typed in, a month's CSV), **Then** the steps cover
   just those days, grouped by block, with identical pieces in the same fabric counted together.
3. **Given** several values (A to D), **Then** each value's pieces are listed under their value with
   their own range and fabric.
4. **Given** the steps, **Then** they print on their own (a sheet for those days only) as well as
   showing on screen.
5. **Given** a day whose block isn't placed (its number not on the quilt), **Then** its steps say
   so and list no pieces.

---

### User Story 2 - Cut ahead with a workbook (Priority: P1)

A quilter wants to cut every piece before the year starts, from plain templates, and choose each
piece's fabric only when the day's value is known.

**Independent Test**: Cut ahead: print the whole quilt's templates (uncolored) and the workbook.
Enter a week's values: the workbook shows those days' fabrics, the rest still open.

**Acceptance Scenarios**:

1. **Given** Make › Cut ahead, **Then** templates and cuts for every data piece of the quilt are
   there from the start, uncolored, counted per shape (identical pieces together), in print and on
   screen.
2. **Given** the workbook, **Then** it lists every day of the period: date, block (label), the
   day's pieces, value (blank until entered), range, and fabric.
3. **Given** a day with a value, **Then** its range and fabric fill in. Without one, every range's
   swatch shows small (printed: to circle by hand).
4. **Given** the workbook printed, **Then** it has room to write each value by hand.
5. **Given** the pieces that aren't data (the blocks' own colors, sashing, borders), **Then** they
   are listed once, with their fabric and cuts, as in any quilt's printout.

---

### User Story 3 - Block by block (Priority: P2)

**Acceptance Scenarios**:

1. **Given** Make, **Then** a **Block by block** view walks the plan's numbers in order (Jan, Wk 3,
   Jan 2) with Previous and Next: the block's variant drawn with lettered pieces and day numerals on
   its data places (uncolored with tint off), and a table:

   | Day | Date  | Value | Range    | Pieces | Fabric       |
   | --- | ----- | ----- | -------- | ------ | ------------ |
   | 1   | Jan 1 | 31 °F | 30 to 40 | A1, A2 | Sky (swatch) |

   Pieces not on any day (the block's own colors) are listed once with their fabric.
2. **Given** Print, **Then** the same sections print for all blocks or a range (Jan to Mar, Wk 1
   to 4).
3. **Given** a block space tapped in Design › Data, **Then** its block can open in this view.

---

### User Story 4 - What's done and what's next (Priority: P2)

**Acceptance Scenarios**:

1. **Given** a day's steps, **Then** they can be marked done. Done days are left out of the next
   steps and show as done in the workbook and block by block.
2. **Given** Make, **Then** it opens on what's next: days entered and not done, and days up to
   today without a value (spec 025's Missing list), with **Today's entry**.

### Edge Cases

- A month shorter than its variant: places past the last day show "past the month" with the setting
  for them (filler, own color).
- Weeks plan left-over days use their day block or the week block's 1-day variant.
- Colorways: steps, workbook and blocks use the shown colorway's range fabrics.
- A value changed after its day was marked done: the day is flagged, since its pieces may be in the
  wrong fabric.
- Simulation shown: steps and the workbook use real entries only. The sample never stands in for a
  day's fabric when making.
- Switching between As you go and Cut ahead keeps entries and done marks.

## Requirements

- **FR-001**: Data quilt instructions MUST be built from per-day, per-value steps, so any set of
  days (just entered, one block, all) can be shown and printed alone.
- **FR-002**: Entering one or several days' values MUST show the steps for just those days.
- **FR-003**: **Cut ahead** MUST offer every data piece's template or cut from the start,
  uncolored, with a workbook (on screen and printed) for each day's fabric.
- **FR-004**: **Block by block** MUST show each data block with lettered pieces, day numerals and
  its day table, on screen and in print.
- **FR-005**: A day's fabric MUST come from its real entry's range. Without one, every range is
  offered.
- **FR-006**: Counts in the steps, the workbook and block by block MUST agree with the yardage's
  counts for the same data.
- **FR-007**: Help (Data quilts) MUST describe making: As you go, Cut ahead, the workbook, and
  block by block.

## Success Criteria

- **SC-001**: After entering a day, the quilter knows what to cut and sew for it from one panel,
  without opening Print.
- **SC-002**: A quilter who cut ahead can tell from the printed workbook alone, without the app,
  which fabric each day's pieces take.
- **SC-003**: For any block, one section says which pieces to cut in which fabric for each day.

## Open Questions (for /speckit-clarify)

- Where Make lives: a third quilt editor tab beside Design and Print, a mode of Print, or a page of
  its own.
- Done marks change the file (a done date per day): a format version bump, or kept on the device.
- As you go or Cut ahead: a saved choice of the quilt, or just two views.
- Cut ahead: are cut pieces labeled per day, or counted per shape only.
- Whether next steps also say how to join finished blocks (spec 025 User Story 7, quilt as you go)
  or stop at the block.

## Assumptions

- The data blocks, plan and entries of specs 025 and 046 are unchanged. This adds views and print
  sections over them.
- Cuts and templates come from the print code (`model/print/`), so screen and print agree.
