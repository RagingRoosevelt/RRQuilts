# Feature Specification: Data Quilts (Temperature, Mood, Daylight, Any Data)

**Feature Branch**: `0.7.0`

**Created**: 2026-10-18 · **Reworked**: 2026-10-21 (data paints model; then the numbered list,
block pools and the Design tab; then data block types with variants)

**Status**: Third rework (data block types) built on `0.7.0`, 2026-10-21: data blocks with kind and
month variants (block Details, new-block window, variant picker, Day numerals palette), quilt type
picker, Data quilt switch in the quilt Details tab, data filters, library format 6 and block file
format 4 (library template on its `rrqlib-6` branch; library repos upgrade at release). Before it:
built on `0.7.0` (2026-10-21) except User Story 7 (quilt-as-you-go printing, open).
Built: data paints and numbering in the block editor (Color › Data places), the Data quilt switch
(Layout) and wizard option, the Design tab of a data quilt (Blocks: the numbered list with one
brush, Fill empty numbers, reordering, data block types, warnings; Data: period,
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

Owner, 2026-10-21 (third rework, data block types): the Month Strip 28/29/30/31 blocks are one
**type**, and another type could be strips that turn a corner. Placing blocks, the quilter picks a
type for each space; the type's **variant** is chosen by the month the space gets. A month type has a
31-day variant and optionally 30, 29 and 28. A block becomes a data block by a switch in its Details
tab (and the new-block wizard) with its kind (day, week, month); its Color tab then offers a
**numeral palette** of 1 to N (N by kind) to drag onto patches, a numeral on as many patches as
wanted, with a value picker (A to D) above it; the Draw tab gets a variant picker at the top to draw
each variant. Agreed: one block per variant (no random picks), each variant drawn and colored on its
own with one color variation covering all variants, library files carry data blocks (format bump),
the quilt's Blocks tab lists the types of the plan's kind. Then: the quilt's Data quilt switch and
plan move to the quilt's Details tab (as for blocks), and the project's and libraries' quilt and
block lists get a data filter.

Related: spec 006 (quilt editor, wizard), spec 007 (block editor), spec 016 (layout engine), spec 019
and 024 (colorways), spec 010 (printing, yardage), spec 014 (fabrics), constitution I and II (no
server calls; offline first).

## Concepts

- **Data quilt**: an ordinary quilt (any layout, sashing, borders) with a **data plan**, turned on
  by a **Data quilt** switch with its plan in the quilt's Details tab. Its Design tab's tray then has
  **Blocks** (the numbered list and the types), **Colors** (as usual, for everything that isn't a
  day) and **Data** (period, data and the value mapping). Set, Erase and Find leave the rail.
- **Data plan** (the quilt's math): **Months** (12 numbers, days 1–31 in each), **Weeks** (52
  numbers of 7 days from the period start, then a number per day left over), or **Days** (a number
  per day). Plus the **period**: a start date, one year long (365 or 366 days, by whether it holds a
  29 February).
- **Value slots A–D**: what each day records. The designer names each used slot ("High", "Low",
  "Mood") and gives it a **scale**: number **ranges** (from, to, fill) or **categories** (a name and a
  fill each). One-value quilts use A only. At most 4 slots.
- **Data paints**: virtual fills on a data block's patches: day numerals **1–31** (month), **1–7**
  (week) or **1** (day). A numeral may sit on several patches (one day, several pieces). Each paint
  carries a value slot: "5·A", "5·B". Slot A is the default.
- **Data block**: a block switched on as one in its Details tab, with a **kind**: day, week or month.
  It is a **type** the quilt places. A month block has **variants**: its own drawing is the 31-day
  one, and it may add 30, 29, 28 and 1-day variants, each drawn and numbered on its own; a week
  block may add a 1-day variant (owner, 2026-10-21: "the week and month block types should have a 1
  day variant"). A 1-day variant makes the block a day type too: a Weeks plan's days left over take
  the week type's 1-day variant unless a day type is picked. One color
  variation covers all its variants.
- **Numbered list**: every number of the plan, months by name (Jan), weeks as Wk 1, Wk 2…, days
  (and a Weeks plan's left-over days) by date (Jan 2),
  each empty or placed on a block space. The label is the place in the list: number k is the
  period's k-th month, week or day. Reordering moves a space to another number. Placed numbers show
  on the quilt with an order line.
- **Variant choice**: a placed space shows its type's smallest variant with at least as many days as
  its number holds (February: the 28, or 29 in a leap year; a 30-day month without a 30 variant: the
  31). Dragging a space to another month changes its variant, never its type.
- **Fill policy** (unused places): what a place shows when its month is shorter than the block
  (a 31-day block in a 30-day month): a **filler** color or fabric, or **as designed**.
- **Waiting days**: what a day without an entry shows, the designer's choice: **as designed**, the
  **simulation** value, or the **filler**.
- **Entries**: the quilt's real data, a value per used slot per date.
- **Simulation**: sample data the quilt is shown with while it is designed: a built-in set or the
  quilter's CSV. The quilt switches between **Simulation** and **Real data**.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Design a data block (Priority: P1)

A designer draws a month strip of 31 small pieces, numbers them, and adds a 30 and a 28-day variant.

**Independent Test**: New block with Data block on and kind Month; draw 31 strips; in Color drag
numerals 1 to 31 onto them. In Draw pick variant 30, draw 30 strips, number them. Place the block in
a Months quilt: April shows the 30, February the 28 (or the 31 with filler without one).

**Acceptance Scenarios**:

1. **Given** a block's Details tab (and the new-block wizard), **Then** a **Data block** switch and
   a kind (Day, Week, Month) make it a data block; switching it off keeps its numerals as colors
   underneath.
2. **Given** a data block's Color tab, **Then** a **numeral palette** lists 1 to N (31, 7 or 1) with a
   value picker (A to D) above it; a numeral dragged (or picked and tapped) onto a patch numbers it,
   over its color; a numeral can number several patches; each numeral shows how many patches it has.
3. **Given** a month data block's Draw tab, **Then** a variant picker at the top shows 31 and any of
   30, 29, 28 it has, with add and remove; picking one shows and edits that variant's drawing (a new
   variant starts as a copy of the 31); the Color tab numbers the picked variant (1 to its days).
4. **Given** a data block, **Then** an overlay can show each piece's numeral and an order line through
   them, one line per value.
5. **Given** a data block shown without data (library, block editor), **Then** its data pieces draw
   in a neutral data color with their numbers, so they read as places, not colors.

### User Story 2 - Set up a data quilt (Priority: P1)

**Independent Test**: New › Data quilt; pick Months, start 1 January 2027, slots High and Low as
Temperature; then a 3 × 4 horizontal layout. Fill empty numbers by Rows and pick the built-in month
strip type. The quilt shows 365 days in the simulation's colors.

**Acceptance Scenarios**:

1. **Given** the New menu, **Then** **Data quilt** opens a wizard: plan (Months, Weeks, Days),
   period start, value slots (a preset per slot: Temperature, Mood, Daylight hours, Rainfall,
   Custom), then the regular layout steps.
2. **Given** any quilt's Layout tab, **Then** a **Data quilt** switch, with the plan (Months, Weeks,
   Days) picked under it (owner, 2026-10-21), turns the Design tab's tray into
   Blocks (numbered list, types), Colors and Data; switching it off keeps the settings (until saved
   without them) and turns data pieces back to placeholders.
3. **Given** the Blocks tab, **Then** **Place numbers** is one brush: tapping a block space places
   the highlighted number and the highlight moves to the next number not placed; tapping a number in
   the list places from there, skipping placed numbers; tapping a placed space takes its number back
   and highlights it.
4. **Given** the list, **Then** **Fill empty numbers** by Rows, Columns or Snake puts unnumbered
   block spaces on the empty numbers, **Clear** empties the list, and dragging a placed number (or
   its arrows) moves it, relabelling it and the numbers between.
5. **Given** the quilt, **Then** each placed space shows its label (Jan, Wk 1, Jan 2) with an
   order line.
6. **Given** the Blocks tab, **Then** it lists the data blocks of the plan's kind (Weeks: week
   blocks, and day blocks for the days left over; Days: day blocks) from the project and libraries;
   the selected type is what Place numbers and Fill empty numbers place; tapping a placed space with
   another type selected changes its type and keeps its number.
7. **Given** a Months plan, **Then** each placed space shows its type's variant for its month (see
   Variant choice); places past the month's days follow the fill policy.
8. **Given** a Weeks plan, **Then** week N is days 7N−6 to 7N of the period; numbers 053 (and 054)
   are days 365 (and 366), each a block space showing a day type.

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
- **FR-003**: Data blocks MUST have a kind (day, week, month) and patches MUST take **data paints**
  (numerals 1 to the kind's days, a numeral on any number of patches) with a slot (A by default).
  Month blocks MAY have 30, 29 and 28-day variants, each its own drawing; one coloring covers all.
  A data quilt's block spaces MUST take **numbers** from its numbered list and a **type**.
- **FR-004**: A data piece's day MUST be: Months: the number's month + the piece's day; Weeks:
  7 × (number − 1) + day, and the left-over numbers their day; Days: the number. Places past a
  number's days follow the fill policy. Days without a place, numbers not placed and types missing
  from the project or libraries MUST be reported in the Blocks tab, not dropped silently.
- **FR-005**: A data piece's color MUST come from its day's value for its slot through the slot's
  scale; unused places follow the fill policy; days without a value follow the waiting-days choice.
  Data pieces are never painted by hand while they hold a data paint.
- **FR-006**: Data colors MUST be worked out from the design, the shown data and the scales whenever
  the project changes, so drawing, thumbnails, colorways, printing and yardage see ordinary fills.
- **FR-007**: A placed space MUST show its type's variant for its number's days (the smallest with
  at least that many days, else the 31). Data blocks with variants MUST survive library files,
  packs and single-block files (format versions bumped) and the quilt's Details tab and the project
  and library lists MUST offer a data filter.
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
- **FR-014** (test round 2026-10-22): Number ranges stay joined and at least 1 wide: moving a
  boundary past a neighbour's pushes the ranges beyond it along (`moveBound`); typed numbers apply
  on Enter or leaving the field. A value's Sample offers only series of its kind; its sample
  histogram sits right above its ranges or categories.
- **FR-015**: A data quilt's Blocks tab offers **Data blocks** (types and the numbered list) or
  **Other blocks** (the usual blocks without data blocks, with This/All/Alternate). An ordinary
  block set on a numbered space gives that number back. Its Blocks and Data sections fold away
  (kept in settings, as the tray's sections), and the numbered list scrolls with the sidebar.
- **FR-016**: Print lists a data block's variants shown in the quilt as blocks of their own
  (Month Strip (30 days)). The built-in Month Strip is square (31 × 31 in, 1 in bars).
- **FR-017** (second round): Switching the plan keeps only placed spaces whose type takes their
  new number's kind (`replan`); when that takes any off, a dialog says how many and asks first.
  Labels: months by name, weeks Wk N, days by date, one label in the list and on the quilt. Built-in
  samples per kind: temperate place, Fairbanks AK and Honolulu HI (highs and lows), three moods,
  rain (temperate, Hilo HI, Phoenix AZ), daylight (temperate, Fairbanks, Austin TX); a value's
  Sample offers its kind's. Hovering any part of a quilt glows in one of three hues from the
  overlay tint: data blocks (opposite), other spaces that take blocks (+120°; setting and cut-down
  edge pieces too), patch-only parts (+240°). The block editor's Color tab glows the hovered patch
  the same way.

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

- Leap years: a period holding 29 February has 366 days; Months shows February's 29-day variant (or the next longer);
  Weeks gets a second left-over number and Days a 366th.
- A space holds one number: placing another number on it frees its old one. A space left without a
  number (taken back, Clear, a shorter list) gives up its block and is empty again. A day number used twice
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
