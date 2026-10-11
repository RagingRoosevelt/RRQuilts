# Research: App Flow — saving slice

This pass implements spec 004 **User Story 2 (Never lose work)** plus the minimum of US3/Home
needed to exercise it. Other stories (wizard, full sketchbook, compare, phone view) follow with the
editor features.

## R1. Scope of this pass

- **In**: FR-020–FR-025 (live edits, 15 s draft, restore, save/save-as, status indicator,
  one editing tab with takeover); Home: New project, Open file (picker + drop anywhere), Recent
  projects (where supported); edge cases: two tabs, draft storage unavailable, recent file
  permission denied, deep link without project, undo after save → unsaved.
- **Out (later features)**: Start-a-quilt wizard (temporary "New project" button), sketchbook
  cards, editors, variations/compare, phone view-only mode, undo/redo (FR-026, comes with the first
  editor — nothing to undo yet), first-use hints.

## R2. Project identity

- **Decision**: Add a required `id` to `project` in `.rrq` v1 (generated at creation). Drafts,
  tab locks, and recent entries key on it.
- **Rationale**: "Same project in two tabs" needs an identity that survives renames and copies of
  the file on disk; file handles can't be compared across tabs cheaply.
- **Format change**: v1 has not been released, so the schema changes in place (no migration).
  "Save as copy" gives the copy a new id.

## R3. Draft storage

- **Decision**: IndexedDB database `rrquilts`, stores `drafts` (key = project id:
  `{ id, name, savedAt, dirty, doc }`) and `recent` (key = project id:
  `{ id, name, openedAt, handle }`). A ~40-line promise wrapper; no IndexedDB library.
- **Timing**: on the first change after a write, schedule a write 15 s later (throttle, not
  debounce — continuous editing can't postpone it); flush immediately on `visibilitychange`
  (hidden) and `pagehide`. Successful file save marks the draft clean; clean drafts are not
  offered for restore.
- **Failure**: any IndexedDB error → status "Draft not kept — save to file"; editing continues.
- **Tests**: `fake-indexeddb` (dev dependency only) to run the store against a real IndexedDB
  implementation in Vitest.

## R4. Files

- **Decision**: File System Access API where available (`showOpenFilePicker`,
  `showSaveFilePicker`, handle `createWritable`): saves overwrite the same file silently; handles
  are kept in `recent` and re-opened after `requestPermission`. Elsewhere: `<input type=file>` and
  an `<a download>` of `<name>.rrq`; the first fallback save shows a one-time note explaining why.
  Drop a `.rrq` anywhere on the window to open it.
- **Types**: minimal local declarations for the picker functions (not in TS's DOM lib).

## R5. One editing tab (FR-025)

- **Decision**: Web Locks — editing a project holds lock `rrq-edit:<projectId>`, requested with
  `ifAvailable`. Not available → open read-only with "Open in another tab — Continue here anyway".
  Takeover: post `flush` on BroadcastChannel `rrq`, wait for `flushed` (≤ 2 s), then request the
  lock with `steal: true`; the old tab's lock promise rejects → it switches to read-only with an
  explanation. The new tab then loads the latest draft. A frozen tab simply never answers; the
  steal still succeeds after the timeout, and the new tab warns that recent edits in the other tab
  may be missing.
- **Rationale**: Locks are released automatically when a tab closes or crashes; `steal` is exactly
  "continue here anyway".

## R6. Save status

- **States**: `saved` (file matches), `unsaved` (draft kept), `unsaved-no-draft` (draft storage
  failed), `new` (never saved to a file), `read-only`. Shown as a dot + label in the header
  whenever a project is open.

## R7. Edits (for now)

- **Decision**: All changes go through a Pinia project store action `change(fn)` that applies an
  immutable update (model functions already return copies), bumps a revision, and marks dirty.
  The temporary sketchbook page offers "rename project" as the first real edit to exercise saving.
