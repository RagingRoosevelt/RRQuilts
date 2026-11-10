# Research: Making a Data Quilt (spec 041)

Code facts gathered 2026-11-09 on `041-data-making` (built on `feat/swirl-data-blocks`).

## R1. Reading a project that isn't open

- Decision: a new framework-free reader `readProjectDoc(source)` in `src/storage/` that returns a
  parsed `RrqDoc` without touching the open project: a draft through `draftDoc` (drafts hold the
  full doc), a file through its `FileSystemFileHandle` (`ensurePermission(handle, 'read')`, then
  `parseProject`). The open project in this tab is read from the store as is.
- Rationale: `stores/project.ts` `load()` replaces the open project and takes the edit lock, so it
  can't be used to list or preview other projects.
- Alternatives: open each project in turn (loses the open project); a summary copy per quilt
  (owner declined, 2026-11-09).

## R2. File permission prompts for the Data Quilts list

- Decision: cards show from the known-projects store at once (project and quilt names, last known
  entry date). A card's picture and entries load when the browser already grants read
  (`queryPermission` = granted), else on a tap (**Show**: one `requestPermission` per tap, which
  needs a user gesture). Read docs stay cached in memory for the session.
- Rationale: `requestPermission` must run in a user gesture, and Chrome forgets grants between
  visits unless the quilter chose "Allow on every visit" (installed apps and recent Chrome offer
  it). A prompt per card on open would be a wall of prompts.
- Alternatives: one **Load all** button looping prompts (rejected: a run of prompts, some browsers
  drop all but the first).
- Browsers without file handles (Firefox, Safari, phones): only drafts are listed (clarified).

## R3. Where data entered outside the editor goes

- Decision, by the project's state:
  1. Open in this tab: `project.change` as the Data tab does (same coalesce keys).
  2. A dirty draft (unsaved changes) and not open in a tab: the draft's doc is updated in place
     (`putDraft`, still dirty).
  3. Otherwise (saved file, or open in another tab): a **pending** record per project on the device
     (new IndexedDB store `pending`). It holds only what changed: entries and marks per quilt.
     `load()` applies it with one `project.change` right after a project opens (one undo step,
     marks the project unsaved), then deletes it.
- Rationale: owner: "we'll keep them on device and write to the project when it's next opened",
  drafts "can be updated as they're worked on".
- Another tab holding the lock: writing its draft would race its autosave, so it goes to pending
  and the dialog says the project is open in another tab. Pending applies at its next open.
- Shown values: the dialog and the list always show file or draft values with pending laid over.

## R4. Done marks in the file

- Decision: rrq v11. `DataPlan.made?: Record<DateKey, DayMade>` with `DayMade = { cut?: DateKey;
  assembled?: DateKey }` (the date it was marked), and `DataPlan.blocksMade?: Record<string,
  DateKey>` keyed by the plan's number index (as a string). Migration 10→11 changes nothing (both
  optional). `npm run schema` writes `public/schemas/rrq.v11.json`.
- Rationale: owner chose the file (format bump). Dates rather than booleans cost nothing and let
  the steps say "cut Jan 12". Number index keys match `dataNumbers(plan)`.
- Replanning (period, plan kind, lead day): `replan` drops `blocksMade` whose index no longer
  exists; `made` is keyed by date and survives.
- A value changed on a day marked cut: no warning and no stored flag (the owner found the warning
  not useful, 2026-11-09).

## R5. Known projects

- Decision: new IndexedDB store `known` (idb `VERSION` 3 → 4; stores are created by name on
  upgrade). Record `{ id, name, handle?, quilts: { id, name }[], seenAt }`, written on every open
  and save of a project with at least one data quilt, removed when it has none. Not capped (recent
  keeps 20).
- Rationale: owner: "keep a list of the file handles we've seen and the data quilts inside them".
  `recent` is capped and mixes all projects.
- Drafts are listed from the `drafts` store directly (no `known` record needed).

## R6. The color of a day's marker

- Decision: `dayColor(quilt, slot, date)` in `model/data-quilt.ts`:
  `scaleFill(plan.slots[slot], plan.entries[date]?.[slot])` swapped through
  `swapper(shownColorway(quilt))`, then drawn with the existing color lookup (`colorLookup`).
- Rationale: clarified: the series color is the range's fill through the shown colorway. No such
  helper exists today.

## R7. Steps for picked days

- Decision: `src/model/print/data-steps.ts` `daySteps(doc, quilt, days)`: for each picked date,
  its place day (`placeDays`), its number (`dataNumbers`), the spaces showing that number, and in
  each space the pieces with that day's paint (`quiltPieces(doc, quilt, blockId, slots)` filtered
  by the paint `n`/`slot`), each with its real fill (entries only: `show` forced to `'real'`,
  never the sample) and the colorway. Identical pieces in one fabric are merged with counts. Days
  without an entry or not placed come back with a reason and no pieces.
- `blockSteps(doc, quilt, k)` gives the same per number for Block by block.
- Rationale: FR-001 (any set of days), FR-006 (counts agree with yardage: same `quiltPieces`).

## R8. Print instructions and Block by block printouts

- Decision: `PrintPreview.vue` gains `kind: 'steps'` with props `days` or `numbers` and a `doc`
  (already a prop). Its sheets: a steps table (day, date, values, range and fabric, pieces), the
  block drawings with the days' places outlined and numerals, templates (`templateItems` with the
  print setting `tint`: on, a template per unique piece and fabric; off, uncolored per shape), and
  the quilt notes when the new pref `stepsNotes` (default true) is on and notes exist.
- Shown on a page `/data/steps` (`DataStepsPage.vue`), the inspector being a slim
  `StepsOptions` (days picked, Block by block or days, Tint by fabric, Quilt notes, paper).
- Rationale: reuses the sheet, template and pagination code; printing works the same way.
- The page holds its doc in a small store (`stores/data-quilts.ts`); a reload of `/data/steps`
  without it goes to `/data`.

## R9. Navigation and Home

- Decision: MainLayout nav gets `/data` "Data Quilts" right after Project, always shown. Route
  `/data` (`DataQuiltsPage.vue`), not behind `requiresProject`.
- Home: the recent list rows and the loose draft rows of projects with data quilts (from `known`
  and drafts) get a calendar icon button. Today only draft rows have a trash icon; on recent rows
  the calendar icon sits where the row's actions go (owner's "next to the trash bin icon").
