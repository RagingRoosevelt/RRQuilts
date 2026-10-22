# Feature Specification: Data Quilts (Temperature, Mood, Daylight, Any Data)

**Feature Branch**: `0.7.0`

**Created**: 2026-10-18 · **Reworked**: 2026-10-21 (data paints model; then the numbered list,
block pools and the Design tab)

**Status**: Built on `0.7.0` (2026-10-21) except User Story 7 (quilt-as-you-go printing, open).
Built: data paints and numbering in the block editor (Color › Data places), the Data quilt switch
(Layout) and wizard option, the Design tab of a data quilt (Blocks: the numbered list with one
brush, Fill empty numbers, reordering, block pools with Shuffle, warnings; Data: period,
value slots with presets and scales, the colorway mapping of scale colors, filler, unused places,
waiting days), sample data (built-in year, CSV), real entries (table, Missing, Today's entry,
import, tap a piece for its row), print legend and worst-case yardage (most days expected per
range), built-in Month Strip 28 to 31, Week Row and Day Square, help (Guides › Data quilts). Not
built: a data block's own day list per value beyond A to D labels; reordering categories (add,
rename, recolor, remove only).

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

Owner, 2026-10-21 (second rework): the quilt places **data blocks by number**. A list of every
number the plan needs (001 to 012, 052 or 365) with one paintbrush at its top: placing a block
gives it the highlighted number, which then moves on; clicking a number places from there,
skipping numbers already placed. A label belongs to the place in the list, not the block, so
reordering the list relabels blocks. Blocks come from **pools**: Months has 28, 29, 30 and 31-day
pools, Weeks one 7-day pool; a block joins a pool only with at least that many day places, and a
number draws only from the pool for its days ("if we're placing a block january, then we'd only
pick from the 31 day pool"). The list and pools replace the Design tab's Blocks tab; a Data tab
right of Colors holds the value mapping and the other data settings, so there is no separate Data
tab. In a non-primary colorway the Data tab shows each range with its primary color and a picker for
its mapped color. Agreed with the owner: tapping a placed space takes its number back; Rows,
Columns and Snake fill the empty numbers; Weeks adds a number for each day left over (365, 366),
drawn from a 1-day pool, so year-day paints on pieces go and Days numbers one block space per day.

Related: spec 006 (quilt editor, wizard), spec 007 (block editor), spec 016 (layout engine), spec 019
and 024 (colorways), spec 010 (printing, yardage), spec 014 (fabrics), constitution I and II (no
server calls; offline first).

## Concepts

- **Data quilt**: an ordinary quilt (any layout, sashing, borders) with a **data plan**, turned on
  by a **Data quilt** switch in the Layout tab. Its Design tab's tray then has **Blocks** (the
  numbered list and pools), **Colors** (as usual, for everything that isn't a day) and **Data** (the
  plan and the value mapping). Set, Erase and Find leave the rail.
- **Data plan** (the quilt's math): **Months** (12 numbers, days 1–31 in each), **Weeks** (52
  numbers of 7 days from the period start, then a number per day left over), or **Days** (a number
  per day). Plus the **period**: a start date, one year long (365 or 366 days, by whether it holds a
  29 February).
- **Value slots A–D**: what each day records. The designer names each used slot ("High", "Low",
  "Mood") and gives it a **scale**: number **ranges** (from, to, fill) or **categories** (a name and a
  fill each). One-value quilts use A only. At most 4 slots.
- **Data paints**: virtual fills painted into pieces like a color, in a block: **1–31** (a month
  block) or **1–7** (a week block); a day block needs one. Each paint carries a slot: "5·A", "5·B".
  Slot A is the default, so one-value designers never pick a slot.
- **Data block**: a block whose pieces hold data paints. Its **day places** are its distinct
  numbers of value A.
- **Numbered list**: every number of the plan, labelled **001, 002…**, each empty or placed on a
  block space. The label is the place in the list: number k is the period's k-th month, week or day.
  Reordering moves a space to another number. Placed numbers show on the quilt with an order line.
- **Block pools**: the blocks a number draws from, by the days it needs: 31, 30, 29 and 28 (Months),
  7 (Weeks), 1 (days left over in Weeks, and Days). A block joins a pool only with at least that many
  day places. Each placed space shows a pool block picked at random and kept until **Shuffle**.
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
turn; the order line runs through them 1 to 31. Copies with 30, 29 and 28 places make the other
lengths.

**Acceptance Scenarios**:

1. **Given** the block editor's coloring tools, **Then** a **Data** palette offers the 1–31 and 1–7
   number sets, a slot picker (A–D, A by default) and a **Number in order** tool: each click paints
   the next number not yet used; clicking a numbered piece takes it back.
2. **Given** a data block, **Then** an overlay can show each piece's number (and slot when more than
   A is used), and an **order line** connecting piece centers in number order, one line per slot.
3. **Given** a selection of pieces, **Then** **Pattern fill** numbers them in one go: by rows, by
   columns, or snake (rows alternating direction), starting from the next free number.
4. **Given** a data block shown without data (sidebar, block editor), **Then** its data pieces draw in
   a neutral data color with their numbers, so they read as places, not colors.

### User Story 2 - Set up a data quilt (Priority: P1)

**Independent Test**: New › Data quilt; pick Months, start 1 January 2027, slots High and Low as
Temperature; then a 3 × 4 horizontal layout. Fill empty numbers by Rows and pick the built-in month
strips for the four pools. The quilt shows 365 days in the simulation's colors.

**Acceptance Scenarios**:

1. **Given** the New menu, **Then** **Data quilt** opens a wizard: plan (Months, Weeks, Days),
   period start, value slots (a preset per slot: Temperature, Mood, Daylight hours, Rainfall,
   Custom), then the regular layout steps.
2. **Given** any quilt's Layout tab, **Then** a **Data quilt** switch, with the plan (Months, Weeks,
   Days) picked under it (owner, 2026-10-21), turns the Design tab's tray into
   Blocks (numbered list, pools), Colors and Data; switching it off keeps the settings (until saved
   without them) and turns data pieces back to placeholders.
3. **Given** the Blocks tab, **Then** **Place numbers** is one brush: tapping a block space places
   the highlighted number and the highlight moves to the next number not placed; tapping a number in
   the list places from there, skipping placed numbers; tapping a placed space takes its number back
   and highlights it.
4. **Given** the list, **Then** **Fill empty numbers** by Rows, Columns or Snake puts unnumbered
   block spaces on the empty numbers, **Clear** empties the list, and dragging a placed number (or
   its arrows) moves it, relabelling it and the numbers between.
5. **Given** the quilt, **Then** each placed space shows its label (001…) with an order line.
6. **Given** a Months plan with pools filled, **Then** each placed space shows a block from the pool
   for its month's days (February's 29-day pool in a leap year); with several, each space keeps its
   random pick, and **Shuffle** picks again.
7. **Given** a number whose pool is empty, **Then** its space keeps what it holds and the tab says
   which pool has no block. A block with more places than its number's days shows the fill policy
   (filler or as designed) past them.
8. **Given** a Weeks plan, **Then** week N is days 7N−6 to 7N of the period; numbers 053 (and 054)
   are days 365 (and 366), each a block space drawing from the 1-day pool.

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
- **FR-003**: Pieces MUST take **data paints** as fills: day 1–31 or 1–7 in blocks, each with a slot
  (A by default). A data quilt's block spaces MUST take **numbers** from its numbered list.
- **FR-004**: A data piece's day MUST be: Months: the number's month + the piece's day; Weeks:
  7 × (number − 1) + day, and the left-over numbers their day; Days: the number. Places past a
  number's days follow the fill policy. Days without a place, numbers not placed and pools without a
  block MUST be reported in the Blocks tab, not dropped silently.
- **FR-005**: A data piece's color MUST come from its day's value for its slot through the slot's
  scale; unused places follow the fill policy; days without a value follow the waiting-days choice.
  Data pieces are never painted by hand while they hold a data paint.
- **FR-006**: Data colors MUST be worked out from the design, the shown data and the scales whenever
  the project changes, so drawing, thumbnails, colorways, printing and yardage see ordinary fills.
- **FR-007**: Pools MUST be picked in the Blocks tab (one or more blocks each, only blocks with
  enough day places offered and used); a placed space shows a block from its number's pool, chosen
  at random among several and kept (stable across saves) until Shuffle. No other pool stands in.
- **FR-008**: Number in order, pattern fill (rows, columns, snake) and the order line MUST be
  available in the block editor (pieces) and the quilt editor (block spaces), with reordering of
  the numbered list.
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

- Leap years: a period holding 29 February has 366 days; Months draws February from the 29-day pool;
  Weeks gets a second left-over number and Days a 366th.
- A space holds one number: placing another number on it frees its old one. A space left without a
  number (taken back, Clear, a shorter list) gives up its pool block and is empty again. A day number used twice
  in a block: both pieces show that day.
- Changing the plan or period resizes the list (numbers past the end dropped, new ones empty).
- A slot removed: its paints become placeholders until repainted or the slot is added back.
- A block with data paints in a space without a number: its pieces show as placeholders, and the
  Blocks tab counts the space.
- Colorways: a colorway swaps data fills too (the scale's fill keys), so a data quilt can be
  previewed in another palette.
- A data block outside a data quilt (a regular quilt, the library): it draws its placeholders.
- Simulation CSV with values for slots not in the plan: ignored; slots without a column: placeholders.

## Open Questions

- Quilt-as-you-go printouts (User Story 7).
- Built-in data blocks: a month strip (28, 29, 30, 31), a week row and a one-place day square.

## Out of Scope (for now)

- Automatic data collection from device sensors or accounts; a weather fetch (later spec).
- Periods other than one year; groups other than months or 7-day weeks.
- Sharing live data between quilters.
