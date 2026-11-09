# UI contract: Data Quilts, data entry dialog, Print instructions (spec 041)

## Navigation

- Nav order: RRQuilts (Home), Project (when open), **Data Quilts** `/data`, Libraries, Help, Tests (dev).
- `/data` is reachable with no project open. `/data/steps` needs the steps input in the store;
  without it, it redirects to `/data`.

## `/data`: DataQuiltsPage

- One card per data quilt (`data.on`) in: the open project, dirty drafts, `known` projects.
- Card: quilt picture colored by real entries (`show: 'real'`, pending laid over), project name,
  quilt name, "Last entry Jan 14" (or "No entries yet"), a badge for unsaved (draft) or
  "Waiting to be saved into the project" (pending).
- No permission yet: the picture is a placeholder with **Show** (one permission request).
- Tap: opens DataEntryDialog for that quilt. Card menu: Open project, Print instructions, Block by block,
  Forget (removes the `known` record, not the file).
- Empty state: no data quilts known, with a link to Help › Data quilts.

## Home

- A recent row or loose draft row whose project has data quilts shows a calendar icon button
  (`event`, tooltip "Enter data"), beside the trash icon where the row has one.
- Several data quilts: a small menu picks the quilt first.

## DataEntryDialog (`components/DataEntryDialog.vue`)

Props: `{ projectId: string; quiltId: string }` (source resolved by the store). Maximized on phones.

- Header: quilt name, project name, where changes go ("Saved with the project's unsaved changes",
  "Kept on this device until you next open the project", or nothing when open here).
- **Preview**: the quilt picture, real entries only, updating as values are entered.
- **Calendar**: the whole period (start to start + 1 year), months stacked, scrolling; opens on
  today's month (or the period's first month before it starts). Each day cell:
  - day number;
  - one dot per series (A to D) with an entry, in `dayColor`; an empty ring for a series without;
  - a **Cut** badge (scissors) and an **Assembled** badge (needle) when marked;
  - outside the period or past the plan: dimmed, not tappable.
  - Selection: tap a day; shift-tap or long press then tap extends a range (for Print instructions).
- **Entry form** below the calendar for the tapped day:
  - one input per series as the Data tab's entries (number with unit, or category select);
  - **Cut** and **Assembled** toggles (setting them stores today's date);
  - the day's block (label) with **Block assembled** toggle;
  - a warning when changing the value of a day marked cut.
  - Keyboard: Enter moves to the next day.
- Footer: **Print instructions** (the selected days, else `nextDays`), **Block by block**, Close.

## `/data/steps`: DataStepsPage

- Mode: **Days** (picked days, a date range picker plus "Not cut yet") or **Block by block**
  (a number range, Jan to Mar, Wk 1 to 4).
- Options: Tint by fabric (shared print pref `tint`), **Quilt notes** (pref `stepsNotes`, shown
  only when the quilt has notes), paper and margins (shared prefs).
- Preview: `PrintPreview kind="steps"`; Print button prints it.

## PrintPreview `kind: 'steps'`

Props added: `days?: DateKey[]`, `numbers?: number[]` (one of them), `doc` (existing).

Sheets in order:
1. Steps: a table per block: Day, Date, Value(s), Range and fabric swatch, Pieces (letter × count).
   Days with a reason print the reason, no pieces.
2. Blocks: each block drawn with piece letters and day numerals; the picked days' places outlined
   and tinted (tint on) or outlined only (tint off).
3. Templates: `templateItems` with `tint` (on: one per unique piece and fabric, labeled with its
   days; off: uncolored, per shape, counted).
4. Quilt notes (when `stepsNotes` and notes exist).

Header: quilt name, days covered ("Jan 11 to Jan 13" or "Jan to Mar"), page n of m.
