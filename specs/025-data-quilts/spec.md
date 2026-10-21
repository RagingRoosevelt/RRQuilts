# Feature Specification: Data Quilts (Temperature, Mood, Daylight, Any Data)

**Feature Branch**: `0.7.0`

**Created**: 2026-10-18 · **Reworked**: 2026-10-21 (data paints model)

**Status**: Draft, settled with the owner 2026-10-21; implementation on `0.7.0` (quilt-as-you-go
printing still open)

**Input**: Owner, 2026-10-18: a temperature / mood / weather / rainfall / data quilt tool, a new
kind of quilt. The quilter picks what is recorded and maps values to colors or fabrics; units (months)
break down into days; units may be stars or other blocks, not only strips; a quilt-as-you-go
printout may follow.

Owner, 2026-10-21 (rework): think of data quilts as a whole system, a new type of quilt with a
supplementary type of block. The designer says where each day's data goes by painting **virtual
"colors"** (number paints) into pieces; the app fills in the real colors from the data and the
mapping. Number paints come in sets: 1–7, 1–31, 1–365, and unit paints 1–12 and 1–52 applied to
whole blocks. Each day may record up to 4 values (high/low temperature, average temperature and
mood, hours of light and mood…), as value slots A, B, C, D that the designer labels. Paints are
placed number-in-order, with a visualizer that connects the pieces in order and pattern fills. A
quilt owns a simulation mode: built-in sample data or the quilter's CSV. Yardage can't be known
ahead, so the quilter sets a worst case. The quilter says which math the quilt does (12 month
blocks, 52 week blocks, 365 day pieces); month blocks come as a block per month length, or one block
with a fill policy for the unused days.

Related: spec 006 (quilt editor, wizard), spec 007 (block editor), spec 016 (layout engine), spec 019
and 024 (colorways), spec 010 (printing, yardage), spec 014 (fabrics), constitution I and II (no
server calls; offline first).

## Concepts

- **Data quilt**: an ordinary quilt (any layout, sashing, borders) with a **data plan**. Pieces
  painted with data paints get their colors from the data; everything else is designed as usual.
- **Data plan** (the quilt's math): **Months** (12 units, days 1–31 in each), **Weeks** (52 units of
  7 days from the period start), or **Days** (one piece per day, 1–366). Plus the **period**: a start
  date, one year long (365 or 366 days, by whether it holds a 29 February).
- **Value slots A–D**: what each day records. The designer names each used slot ("High", "Low",
  "Mood") and gives it a **scale**: number **ranges** (from, to, fill) or **categories** (a name and a
  fill each). One-value quilts use A only. At most 4 slots.
- **Data paints**: virtual fills painted into pieces like a color.
  - **Local day paints**, in a block: **1–31** (a month block) or **1–7** (a week block).
  - **Year day paints**, on any piece: **1–366** (Days plan; also extra days in the other plans).
  - Each paint carries a slot: "5·A", "5·B". Slot A is the default, so one-value designers never
    pick a slot.
- **Unit paints**: numbers painted on whole block spaces in the quilt: **Unit 1–12** (Months) or
  **Unit 1–52** (Weeks). A space's unit plus a piece's local day gives the date: unit 3 + day 5 =
  the 5th day of the period's third month.
- **Data block**: a block whose pieces hold local day paints. A **month block family** is a set of
  data blocks for 28, 29, 30 and 31-day months; placed in a unit space, the quilt shows the family
  member that fits that month.
- **Fill policy** (unused places): what a place shows when its month is shorter than the block
  (a 31-day block in a 30-day month): a **filler** color or fabric, or **as designed**.
- **Waiting days**: what a day without an entry shows, the designer's choice: **as designed**, the
  **simulation** value, or the **filler**.
- **Entries**: the quilt's real data, a value per used slot per date.
- **Simulation**: sample data the quilt is shown with while it is designed: a built-in set or the
  quilter's CSV. The quilt switches between **Simulation** and **Real data**.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Design a data block (Priority: P1)

A designer draws a month strip of 31 small pieces and numbers them in order.

**Independent Test**: In the block editor, open the Data paints, pick 1–31 and click 31 pieces in
turn; the order line runs through them 1 to 31. Copy it as the 30, 29 and 28-day variants.

**Acceptance Scenarios**:

1. **Given** the block editor's coloring tools, **Then** a **Data** palette offers the 1–31 and 1–7
   number sets, a slot picker (A–D, A by default) and a **Number in order** tool: each click paints
   the next number not yet used; clicking a numbered piece takes it back.
2. **Given** a data block, **Then** an overlay can show each piece's number (and slot when more than
   A is used), and an **order line** connecting piece centers in number order, one line per slot.
3. **Given** a selection of pieces, **Then** **Pattern fill** numbers them in one go: by rows, by
   columns, or snake (rows alternating direction), starting from the next free number.
4. **Given** a data block, **Then** it can be made a month block family: the designer marks which
   member is for 28, 29, 30 and 31 days (from copies of the block). A family appears as one block in
   the sidebar.
5. **Given** a data block shown without data (sidebar, block editor), **Then** its data pieces draw in
   a neutral data color with their numbers, so they read as places, not colors.

### User Story 2 - Set up a data quilt (Priority: P1)

**Independent Test**: New › Data quilt; pick Months, start 1 January 2027, slots High and Low as
Temperature; then a 3 × 4 horizontal layout. Paint Unit 1–12 on the 12 spaces in order and place the
month block family. The quilt shows 365 days in the simulation's colors.

**Acceptance Scenarios**:

1. **Given** the New menu, **Then** **Data quilt** opens a wizard: plan (Months, Weeks, Days),
   period start, value slots (a preset per slot: Temperature, Mood, Daylight hours, Rainfall,
   Custom), then the regular layout steps.
2. **Given** a quilt's Data tab, **Then** the plan, period, slots and scales can be changed later;
   any quilt can be given a data plan there, and losing it turns data pieces back to placeholders.
3. **Given** the Months or Weeks plan, **Then** the quilt editor's Data palette offers the unit
   paints (Unit 1–12 or 1–52, number in order) for block spaces, and year day paints for pieces.
4. **Given** the Days plan, **Then** year day paints go on pieces (a One Patch quilt, a big block),
   with number in order and pattern fill over the quilt.
5. **Given** the quilt, **Then** the order line can show over it: units in order, and days in order
   within and across them, so gaps and jumps show.
6. **Given** a Months plan with month block families, **Then** each unit space shows the member for
   its month's length (February 29 days in a leap year).
7. **Given** a Months plan whose block has more places than a month (no family, or a member
   missing), **Then** the unused places follow the fill policy (filler or as designed).
8. **Given** a Weeks plan, **Then** week N is days 7N−6 to 7N of the period; days 365 and 366 have
   no unit, and go where the designer painted year day 365 and 366 (a sash, a cornerstone, a border
   piece).

### User Story 3 - Map values to colors (Priority: P1)

**Acceptance Scenarios**:

1. **Given** a number slot, **Then** its scale is a list of ranges (from, to, color or fabric) to
   add, remove, split and recolor; ranges never overlap; a value outside all ranges takes the
   nearest end range; a value on a boundary belongs to the range that starts there.
2. **Given** a category slot, **Then** each category has a name and a fill; categories can be added,
   renamed, reordered and recolored.
3. **Given** a preset (Temperature in °F or °C from the units preference, Mood, Daylight hours,
   Rainfall), **Then** the slot starts with suggested ranges or categories and fills from the
   project's palettes.
4. **Given** any scale change, **Then** every data piece recolors at once (one undo step).
5. **Given** the quilt, **Then** a legend per slot (value → swatch) shows in the Data tab and prints
   with the pattern.

### User Story 4 - Preview with sample data (Priority: P1)

**Acceptance Scenarios**:

1. **Given** a data quilt, **Then** it has a **Simulation / Real data** switch, saved with the quilt.
2. **Given** Simulation, **Then** the source is a built-in set (a year of daily high and low
   temperatures, a year of moods, a year of daylight hours) or a CSV the quilter loads.
3. **Given** a CSV, **Then** the quilter picks the date column and, for each used slot (by its
   label), the column that feeds it; rows that don't parse are reported and skipped.
4. **Given** a built-in set or CSV whose dates differ from the period, **Then** its days are matched
   by day of the year (so a 2019 sample previews a 2027 quilt).

### User Story 5 - Enter real data (Priority: P1)

**Acceptance Scenarios**:

1. **Given** a data quilt, **Then** a **table of dates** lists every day of the period with a column
   per used slot; values can be typed or picked (categories), and missing ones are marked.
2. **Given** a column of values or a CSV, **Then** it can be pasted or imported with the same column
   picking as the simulation (by date, else by order).
3. **Given** a piece tapped on the quilt (Real data), **Then** its day's row is selected in the table.
4. **Given** Real data, **Then** days without an entry show as the designer chose (as designed,
   simulation value, or filler).
5. **Given** a quilt in progress, **Then** a **Missing** view lists days without entries up to today,
   and a **Today's entry** shortcut opens today's row. No reminders. (Owner, 2026-10-20.)

### User Story 6 - Print and make it (Priority: P2)

**Acceptance Scenarios**:

1. **Given** a data quilt, **Then** printouts work as for other quilts, with data pieces colored by
   the shown data (Simulation or Real).
2. **Given** yardage, **Then** for each range or category a **most days expected** number (default:
   its count in the simulation) gives a worst case: that many of the largest piece that slot uses.
   Printouts label it as an estimate; non-data pieces and the filler count as usual.
3. **Given** the legend, **Then** it prints with the pattern.

### User Story 7 - Quilt as you go (Priority: P3, to be settled)

1. **Given** the print tab, **Then** a quilt-as-you-go mode prints in making order: per unit and per
   day, with done days marked, and how units are quilted and joined.

## Requirements *(mandatory)*

- **FR-001**: A quilt MAY have a **data plan**: Months, Weeks or Days; a period start (Months: the
  1st of a month); one year long.
- **FR-002**: A data plan MUST have 1 to 4 **value slots** (A–D), each with a label and a scale of
  number ranges or categories mapping to colors or fabrics from the project's palettes.
- **FR-003**: Pieces MUST take **data paints** as fills: local day 1–31 or 1–7 (in blocks), year day
  1–366 (anywhere), each with a slot (A by default). Block spaces in the quilt MUST take **unit
  paints** (1–12 or 1–52).
- **FR-004**: A data piece's day MUST be: Months: unit's month + local day; Weeks: 7 × (unit − 1) +
  local day; year day paints: that day of the period. Days a block can't reach (a 31-day month in a
  28-place block) MUST be reported in the Data tab, not dropped silently.
- **FR-005**: A data piece's color MUST come from its day's value for its slot through the slot's
  scale; unused places follow the fill policy; days without a value follow the waiting-days choice.
  Data pieces are never painted by hand while they hold a data paint.
- **FR-006**: Data colors MUST be worked out from the design, the shown data and the scales whenever
  the project changes, so drawing, thumbnails, colorways, printing and yardage see ordinary fills.
- **FR-007**: Month block families MUST pick the member for each month's length; a family with no
  member for a length uses the next longer member and the fill policy.
- **FR-008**: Number in order, pattern fill (rows, columns, snake) and the order line MUST be
  available in the block editor and the quilt editor.
- **FR-009**: The quilt MUST save its plan, slots, scales, entries, simulation choice and loaded
  simulation data in the project file (format v9, not yet released). Values are validated (numbers
  for number slots, known categories otherwise); bad imported values are reported and skipped.
- **FR-010**: Built-in simulation sets MUST be bundled (offline); CSVs are read on the device only.
- **FR-011**: Yardage for data fills MUST use the worst-case counts (User Story 6) and say so.
- **FR-012**: Everything MUST work offline. A weather fetch is a later spec with its constitution
  amendment.
- **FR-013**: Printing SHOULD offer a quilt-as-you-go mode (User Story 7).

## Success Criteria *(mandatory)*

- **SC-001**: A designer numbers a 31-piece block in under a minute with number in order or one
  pattern fill.
- **SC-002**: A year-long Months quilt from built-in blocks is set up and previewed with sample data
  in under 3 minutes.
- **SC-003**: Typing a day's value recolors its piece at once; changing a range recolors every
  affected piece.
- **SC-004**: A quilt with a full year of 4-slot entries saves and reopens unchanged, offline.
- **SC-005**: Printed worst-case yardage per range is never below what the entered data needs.

## Edge Cases

- Leap years: a period holding 29 February has 366 days; Months shows February's 29-day member; Weeks
  and Days need a place for day 366 (reported if missing).
- A unit number used twice, or a day number used twice in a block or quilt: shown in the Data tab
  and on the order line; both pieces show that day.
- A slot removed: its paints become placeholders until repainted or the slot is added back.
- A block with local day paints placed in a space without a unit paint: its pieces show as
  placeholders, and the Data tab lists the space.
- Colorways: a colorway swaps data fills too (the scale's fill keys), so a data quilt can be
  previewed in another palette.
- A data block outside a data quilt (a regular quilt, the library): it draws its placeholders.
- Simulation CSV with values for slots not in the plan: ignored; slots without a column: placeholders.

## Open Questions

- Quilt-as-you-go printouts (User Story 7).
- Which built-in data blocks ship first (a month strip family and a week row are planned).

## Out of Scope (for now)

- Automatic data collection from device sensors or accounts; a weather fetch (later spec).
- Periods other than one year; units other than months or 7-day weeks.
- Sharing live data between quilters.
