# Feature Specification: Making a Data Quilt (Data Quilts, Next Steps, Block by Block)

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

Owner, 2026-11-09 (the access path, after four printout proposals on `explore/041-calendar`,
`-ledger`, `-kit` and `-map`): "in addition to "Home", "Project", "Libraries", "Help", "tests",
we'll add a module called "Data Quilts" right after project. when you're on the home page with a
list of recent projects, projects that include a data quilt will have a calendar icon next to the
trash bin icon. clicking that calendar icon will open a data entry wizard that will be reused from
the data quilt module. the data quilt module will have a list of all your data quilts in known
projects. each will have a note about when data was last entered and the preview for the quilt will
show the colors according to what has been entered so far. we'll have a dialog for entering data
for a quilt. it'll have a full-year calendar display that you can scroll through with markers
indicating for each day if entry has been made. it should indicate for each series present on the
quilt using the correct color for that series for that day. clicking on a day opens an entry form
below the calendar view for each of the series in that quilt. the entry dialog should also have a
preview of the quilt so far. for the quilt, we also want to track which days have actually been cut
and assembled so far and which blocks have been assembled so far. the entry form should have entry
inputs for the day cut/assembled note as well. we will use badges for each day for cut and
assembly. we'll have a next-step button in the entry dialog that will then show a print out page
for next steps. the user can select the days they want to get the printout for."

## Access path (owner, 2026-11-09)

- **Data Quilts** module: a new top-level nav item right after **Project** (Home, Project, Data
  Quilts, Libraries, Help, Tests). It lists every data quilt in the known projects. Each card: the
  quilt's picture colored by the entries so far, the project and quilt name, and when data was last
  entered. A card opens the **data entry dialog**.
- **Home**: a recent project with a data quilt shows a calendar icon beside its trash icon. It opens
  the same data entry dialog (for a project with several data quilts, the quilt is picked first).
- **Data entry dialog** (shared by both): 
  - A full-year calendar to scroll through. Each day shows a marker per series (A to D) on the quilt,
    in that series' color, when the day has an entry for it.
  - Each day also shows a **Cut** badge and an **Assembled** badge once marked.
  - Tapping a day opens an entry form below the calendar: one input per series, and Cut and
    Assembled inputs for the day.
  - A preview of the quilt so far, colored by the entries.
  - Blocks are tracked too: which data blocks are assembled.
  - **Next steps** button: opens a printout page of next steps. The quilter picks the days it covers.

## Clarifications

### Session 2026-11-09

- Q: How does the Data Quilts list read projects that aren't open? → A: Owner: "easy for unsaved
  changes. for projects that have been saved when we have access to file handles: we'll keep a list
  of the file handles we've seen and the data quilts inside them and ask to read the file when we
  need to gather specific data from them. i'm inclined to skip the outright summary since unless
  the user opens a project in a browser without the file handle, we won't be able to open the
  project anyhow." Drafts (unsaved changes) are read from IndexedDB. Saved projects: the device
  keeps each file handle seen with the names and ids of its data quilts, and reads the file (asking
  the browser's permission) when the list needs its picture or entries. No summary copy. A browser
  without file handles lists drafts only.
- Q: Where are entries made from Home or Data Quilts saved? → A: Owner: "ultimatly, saved to the
  project file. but we'll keep them on device and write to the project when it's next opened. for
  "unsaved changes" projects we're keeping in local storage, these can be updated as they're worked
  on." Pending entries and marks wait on the device and are written into the project when it's next
  opened (then saved as usual). A draft is updated in place.
- Q: Where are Cut ahead (workbook, templates) and Block by block reached? → A: "from the data quilt
  module and the entry dialog". (Cut ahead was dropped later the same day: Block by block only.)
- Q: Which color does each series get on the calendar? → A: "the color the quilter picked per
  series". Then: "I see a palette selection in the quilt design data tab. and doing a colorway
  offers the ability to pick alternative colors. I think the colorway specifically does provide the
  quilter picked colors, right?" Yes: a day's marker for a series is the color its value maps to
  (the range's fill in the Data tab, through the shown colorway). No new color setting.
- Q: Cut and assembled marks in the project file? → A: "yup": a format version bump (done marks
  per day: cut, assembled; per block: assembled).
- Q: As you go and Cut ahead: a saved choice or two views? → A: Owner: "I don't plan on offering a
  cut ahead option. "As you go" will naturally have a "catch-up" aspect if someone falls behind
  where they can select multiple days to get instructions for. this is just a view, not something
  saved with the quilt." Cut ahead and its workbook are dropped. Next steps covers any days picked.
- Q: Templates labeled per day or counted per shape? → A: Owner: "this responds to the "tint per
  piece" choice. if tinting per piece, then each unique patch/color gets its own template in the as
  you go view too. if tinting isn't selected, we'll do uncolored templates like we already do." The
  next steps follow the print setting Tint by fabric: on, a template per unique piece and fabric;
  off, uncolored templates per shape, as Print does today.

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

- **Making** (new): what happens after the design is done, day after day for a year. It lives in
  the **Data Quilts** module and the data entry dialog (see Access path). One way to work: **As you
  go**.
- **Steps**: data quilt instructions are built from small parts, one per day and value, so any set
  of days can be shown on its own: the days just entered, one data block, or the whole quilt. A
  day's step: its pieces (letters, from its block's variant), each with its fabric (the range or
  category its value falls in), its cut (template or rotary size, as the print settings give it),
  and where they go (the block, the places with the day's numeral).
- **As you go**: enter one day or several, and get the next steps for just those days: which
  pieces, cut from which fabric, sewn where. Nothing is cut before its day is known. Catching up
  after falling behind: pick several days and get their steps together. A view, not saved.
- **Templates in the steps** follow Tint by fabric: on, each unique piece and fabric gets its own
  template; off, uncolored templates per shape, as Print does today.
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

1. **Given** the data entry dialog, **When** a day's value is entered (typed, picked, or imported),
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

### User Story 2 - Catch up on several days (Priority: P1)

A quilter who fell behind picks a run of days (entered, not yet cut) and gets one set of steps.

**Acceptance Scenarios**:

1. **Given** Next steps, **When** several days are picked, **Then** the steps cover just those days,
   grouped by block, identical pieces in the same fabric counted together.
2. **Given** Tint by fabric on, **Then** each unique piece and fabric has its own template. Off,
   templates are uncolored, one per shape, as in Print today.
3. **Given** the pieces that aren't data (the blocks' own colors, sashing, borders), **Then** they
   are not in the next steps (they're in the quilt's Print).

---

### User Story 3 - Block by block (Priority: P2)

**Acceptance Scenarios**:

1. **Given** the Data Quilts module or the data entry dialog, **Then** a **Block by block** view walks the plan's numbers in order (Jan, Wk 3,
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
   steps and show as done in the calendar and block by block.
2. **Given** the data entry dialog, **Then** it opens on what's next: days entered and not done, and days up to
   today without a value (spec 025's Missing list), with **Today's entry**.

### Edge Cases

- A month shorter than its variant: places past the last day show "past the month" with the setting
  for them (filler, own color).
- Weeks plan left-over days use their day block or the week block's 1-day variant.
- Colorways: steps, calendar markers and blocks use the shown colorway's range fabrics.
- A value changed after its day was marked done: the day is flagged, since its pieces may be in the
  wrong fabric.
- Simulation shown: steps and the calendar use real entries only. The sample never stands in for a
  day's fabric when making.

## Requirements

- **FR-001**: Data quilt instructions MUST be built from per-day, per-value steps, so any set of
  days (just entered, one block, all) can be shown and printed alone.
- **FR-002**: Entering one or several days' values MUST show the steps for just those days.
- **FR-003**: Next steps MUST cover any days the quilter picks, with templates per Tint by fabric
  (on: per unique piece and fabric; off: uncolored, per shape).
- **FR-004**: **Block by block** MUST show each data block with lettered pieces, day numerals and
  its day table, on screen and in print.
- **FR-005**: A day's fabric MUST come from its real entry's range. Without one, every range is
  offered.
- **FR-006**: Counts in the steps and block by block MUST agree with the yardage's
  counts for the same data.
- **FR-007**: Help (Data quilts) MUST describe making: the Data Quilts module, the data entry
  dialog, next steps, and block by block.

## Success Criteria

- **SC-001**: After entering a day, the quilter knows what to cut and sew for it from one panel,
  without opening Print.
- **SC-002**: A quilter a week behind gets that week's steps in one printout.
- **SC-003**: For any block, one section says which pieces to cut in which fabric for each day.

## Open Questions (for /speckit-clarify)

- ~~Where Make lives~~: a Data Quilts module and a data entry dialog (2026-11-09).
- ~~Done marks in the file~~: yes, a format version bump (2026-11-09).
- ~~As you go or Cut ahead~~: no Cut ahead; catching up is a view (2026-11-09).
- ~~Labeled per day or per shape~~: follows Tint by fabric (2026-11-09).
- Whether next steps also say how to join finished blocks (spec 025 User Story 7, quilt as you go)
  or stop at the block.

## Assumptions

- The data blocks, plan and entries of specs 025 and 046 are unchanged. This adds views and print
  sections over them.
- Cuts and templates come from the print code (`model/print/`), so screen and print agree.
