# Feature Specification: Data Quilts (Temperature, Mood, Rainfall, Any Data)

**Feature Branch**: `0.7.0`

**Created**: 2026-10-18

**Status**: Draft (spec only; not implemented; open questions to settle during implementation)

**Input**: Owner, 2026-10-18: a temperature / mood / weather / rainfall / data quilt tool. A new
custom quilt type with its own wizard (instead of the existing new-quilt wizard, though parts such as
sashing, reference overlay and borders may be reused). It has a set of quilt layouts made of
different arrangements of 12 units. The quilter picks a data type and sets up a mapping for it:
temperature ranges map to colors or fabrics, mood ratings map to colors, open-ended data maps to
colors or fabrics. How data is entered, whether the app helps collect data over time, and whether it
connects to a weather service need clarifying as the feature is built.

Owner, 2026-10-18 (follow-up): each of the 12 units breaks down into 28 to 31 sub-units. Units may be
stars or other blocks or shapes, not only strips. The printout may get a quilt-as-you-go mode, so the
quilter can sew and quilt each day's part as the period goes, not all at the end.

Related: spec 006 (quilt editor, wizard), spec 016 / 018 (layout engine, borders), spec 019
(colorways), spec 010 (printing, yardage), spec 014 (fabrics), constitution I and II (no server
calls; offline first).

## Concepts

- **Data quilt**: a quilt whose pieces are colored by data, not painted by hand. Each piece stands
  for one **entry** (a day, typically), and its color comes from the **mapping**.
- **Unit**: one of 12 groups of entries (a month, typically), broken down into 28 to 31
  **sub-units**, one per entry (a day). The sub-units are the pieces the data colors.
- **Unit design**: how a unit's sub-units are arranged. Not only strips (rows, one per day): a unit
  can be a block or shape, such as a star whose pieces are the days, a grid of squares, a wheel or
  a spiral. A unit design has an ordered list of day places (first day to last) and says what
  happens to places a shorter month doesn't use (see Edge Cases). Unit designs can be built-in or
  drawn in the block editor, with the day order set there.
- **Data layout**: an arrangement of the 12 units in the quilt (for example 3 × 4, 4 × 3, 2 × 6,
  6 × 2, or 12 strips), with optional sashing between units and borders around the quilt.
- **Data type**: what is recorded per entry. Built-in: **Temperature** (°F or °C, from the project's
  units preference), **Rainfall**, **Mood** (a rating scale), and **Custom data** (numbers or named
  categories the quilter defines).
- **Mapping**: the rule from a value to a color or fabric. Number types map **ranges** (e.g. 60–69 °F
  → a green); Mood and categories map each **rating or category** to one color or fabric. An entry
  with no value yet shows a **blank** fill chosen in the mapping.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start a temperature quilt with its wizard (Priority: P1)

A quilter wants to make a 2027 temperature quilt: one row per day, a block per month, colored by the
day's high.

**Independent Test**: New › Data quilt; pick Temperature, a 3 × 4 layout of months, a year, a size;
accept the suggested ranges. The quilt appears with 365 blank day pieces in 12 month units.

**Acceptance Scenarios**:

1. **Given** the project's New menu, **Then** **Data quilt** is offered next to the existing quilt
   wizard and opens its own wizard.
2. **Given** the wizard, **Then** it asks, in order: data type, data layout (picture cards of the
   12-unit arrangements), period (start date; the 12 units follow from it), the unit design (strips,
   star, grid…), finished size, then sashing and borders (the same controls as the regular quilt wizard).
3. **Given** a data type, **Then** the wizard proposes a starting mapping (Temperature: equal ranges
   over a typical span with a cold-to-hot palette; Mood: one color per rating), which the quilter can
   change before finishing.
4. **Given** the finished quilt, **Then** it opens in the quilt editor with the reference overlay,
   sashing and borders working as for other quilts.

### User Story 2 - Set up the mapping (Priority: P1)

**Acceptance Scenarios**:

1. **Given** a number data type, **Then** the mapping is a list of ranges (from, to, color or fabric)
   that the quilter can add, remove, split and recolor; ranges never overlap, and values outside all
   ranges use the nearest end range.
2. **Given** Mood or a category type, **Then** each rating or category gets one color or fabric.
3. **Given** any change to the mapping, **Then** every piece recolors at once.
4. **Given** the mapping, **Then** a legend (value → swatch) shows beside the quilt and can be printed
   with the pattern.

### User Story 3 - Enter data (Priority: P1, method to be settled)

**Acceptance Scenarios**:

1. **Given** a data quilt, **Then** the quilter can enter or change the value for any entry, and its
   piece recolors from the mapping.
2. **Given** entries with no value, **Then** they show the blank fill, and a count of filled vs. total
   entries is shown.
3. Values are entered in a **table of dates** (every entry with its date and value, missing ones
   marked, editable) and by **pasting a column or importing a CSV** (date, value), matched to entries
   by date, else by order. Tapping a piece selects its row in the table. (Owner, 2026-10-20.)

### User Story 4 - Keep a quilt going over the year (Priority: P2, to be settled)

**Acceptance Scenarios**:

1. **Given** a quilt in progress, **Then** the quilter sees which entries are missing up to today.
2. The app shows which entries are missing up to today and offers a **Today's entry** shortcut; no
   reminders. (Owner, 2026-10-20.)
3. Weather data stays typed or imported in 0.7.0. Later: an optional, user-started fetch from a good,
   free, key-less weather API, with the constitution amendment it needs (a later spec). (Owner,
   2026-10-20.)

### User Story 5 - Print and make it (Priority: P2)

**Acceptance Scenarios**:

1. **Given** a data quilt, **Then** printouts work as for other quilts (cutting, templates,
   yardage), with yardage per mapped color or fabric counted from the entries; blank entries are
   counted separately so the quilter can plan ahead.
2. **Given** the legend, **Then** it prints with the pattern.

### User Story 6 - Quilt as you go (Priority: P3, to be settled)

A quilter wants to sew and quilt each day's part on that day, so the quilt is nearly done when the
year ends.

**Acceptance Scenarios**:

1. **Given** the print tab, **Then** a quilt-as-you-go mode prints the pattern in the order it will be
   made: per unit (a month's sheet with its day pieces in order) and per entry (what to cut and sew
   for one day, its color from that day's value).
2. **Given** a unit in progress, **Then** its sheet shows which days are done, so the quilter can pick
   up where they left off.
3. **Given** quilt-as-you-go, **Then** the instructions include how each unit is quilted and joined
   (backing and batting per unit, joining strips), so units can be finished separately and joined at
   the end.

## Requirements *(mandatory)*

- **FR-001**: The app MUST offer a **Data quilt** type with its own wizard (User Story 1), reusing the
  regular quilt's size, sashing, border and reference overlay controls where they apply.
- **FR-002**: A data quilt MUST be laid out as 12 units in one of the data layouts. Each unit MUST be
  divided into 28 to 31 sub-units (one per entry) by its unit design, which can be a strip set, a
  block such as a star, or another shape. Layouts are built on the shared layout engine (spec 016),
  so sashing and borders behave as in other quilts.
- **FR-002a**: The model MUST NOT assume units are strips or rectangles: a unit design is any
  pieced block or shape with an ordered list of day places, so new designs (stars, wheels, custom
  blocks) can be added without changing the data model.
- **FR-003**: Data types MUST include Temperature, Rainfall, Mood and Custom (numbers or named
  categories); temperature and rainfall follow the project's units preference.
- **FR-004**: The mapping MUST support non-overlapping number ranges and per-category fills, each a
  color or fabric from the project's palettes, plus a blank fill for missing entries.
- **FR-005**: A piece's color MUST always come from its entry's value through the current mapping
  (no hand painting of data pieces); mapping and value changes recolor at once and are undoable.
- **FR-006**: The quilt MUST store its data type, period, entries (date or index → value) and
  mapping in the project file, a format addition with a version bump and migration (spec 003).
- **FR-007**: Values MUST be validated (numbers for number types, known ratings or categories
  otherwise); bad imported values are reported and skipped, never crash.
- **FR-008**: Printing MUST include a legend and yardage per mapped fill (User Story 5).
- **FR-009**: Everything MUST work offline. Any network data source is subject to the constitution
  (User Story 4, acceptance 3).
- **FR-010**: Printing SHOULD offer a quilt-as-you-go mode (User Story 6).

## Success Criteria *(mandatory)*

- **SC-001**: A quilter sets up a year-long temperature quilt in the wizard in under 3 minutes.
- **SC-002**: Entering one day's value recolors its piece within a moment, with no other step.
- **SC-003**: Changing a mapping range recolors every affected piece; printed yardage matches the
  piece counts per fill exactly.
- **SC-004**: A data quilt with a full year of entries saves and reopens unchanged, offline.

## Edge Cases

- Months of 28, 29, 30 and 31 days: every unit design MUST handle all four. Its unused places
  (days 29–31) either take a filler fill chosen in the mapping, or the design has a variant per
  length (a 28-point star vs. a 31-point star); which, per design, to settle with the designs.
- Periods not starting in January (e.g. a school year): units follow the chosen start.
- Two values per entry (daily high and low): to settle; possibly two pieces per entry, each mapped.
- Mapping edited after data is in: all pieces follow the new mapping.
- A value exactly on a range boundary: belongs to the range that starts there.
- Custom data with more categories than fills: each category still needs a fill before it shows.

## Open Questions (to settle during implementation)

- Settled 2026-10-20: data entry (table, paste/CSV), help over time (missing view, Today's entry),
  weather fetch later.
- The set of 12-unit data layouts and unit designs (strips, stars, grids, wheels, custom blocks),
  with picture cards; how a custom block's day order is set in the block editor.
- Quilt-as-you-go printouts: per-day vs. per-unit sheets, and the joining method (User Story 6).
- Whether units can be other than months (12 weeks, 12 hours, 12 categories).
- Two values per entry (high/low), and Rainfall's zero-rain days.

## Out of Scope (for now)

- Automatic data collection from device sensors or accounts.
- Sharing live data between quilters.
