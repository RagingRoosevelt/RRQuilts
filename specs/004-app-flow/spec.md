# Feature Specification: App Flow & Screens

**Feature Branch**: `004-app-flow`

**Created**: 2026-10-11

**Status**: Draft

**Input**: User description: "RRQuilts' own flow: Home → Project sketchbook → focused editors with mode
tabs; live editing with autosaved draft plus explicit save to file; deliberate variations with a
compare view; phones view-only in v1; first run is a 'Start a quilt' wizard plus samples, no tour."

> Defines navigation, screen structure, save model, and interaction conventions for every capability
> in spec 001. Data lives in the formats of specs 002–003. Requirement IDs are local to this spec.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start a quilt in under a minute (Priority: P1)

A first-time visitor taps "Start a quilt", picks a layout, block count/size, and borders in a short
wizard, and lands in the quilt editor ready to place blocks.

**Why this priority**: First impression; proves the app is useful immediately.

**Independent Test**: From a fresh browser, reach a 5×5 quilt with a border in the quilt editor in
three wizard steps.

**Acceptance Scenarios**:

1. **Given** the home screen, **When** the user taps "Start a quilt", **Then** a three-step wizard
   (layout → blocks count/size → borders) opens; every step has sensible defaults and can be skipped.
2. **Given** the wizard finished, **Then** an untitled project opens in the quilt editor (Design mode)
   with starter blocks, colors, and threads in the palette tray.
3. **Given** the home screen, **When** the user opens a sample, **Then** it opens as an untitled copy.
4. **Given** the first visit to an editor mode, **Then** one short dismissible hint appears; no tour.

---

### User Story 2 - Never lose work (Priority: P1)

The quilter edits freely; changes are always kept in a draft, and saving writes the `.rrq` file.

**Why this priority**: Constitution Principle IV; trust.

**Independent Test**: Make edits, kill the tab, reopen the app, restore the draft; then save to file
and confirm the status changes to "Saved to file".

**Acceptance Scenarios**:

1. **Given** any edit, **Then** it is reflected immediately in the project (no separate "add to
   sketchbook" step) and written to an on-device draft within 15 seconds.
2. **Given** a draft exists for an unsaved project, **When** the app starts, **Then** the user is
   offered "Restore unsaved work from <time>" or discard.
3. **Given** the user saves, **Then** the `.rrq` file is written; where the browser allows, later
   saves overwrite the same file silently; otherwise each save downloads a new copy and the user is
   told why.
4. **Given** any screen, **Then** a status indicator shows "Saved to file" or "Unsaved changes (draft
   kept)".
5. **Given** unsaved changes, **When** closing or opening another project, **Then** the user is warned.

---

### User Story 3 - Move between project and editors (Priority: P1)

The quilter sees everything in the project as cards, opens any item in its editor, and returns.

**Why this priority**: The skeleton every feature hangs on.

**Independent Test**: From the sketchbook, open a quilt, switch to a block from the tray, edit it,
return to the sketchbook with the browser back button; all states preserved.

**Acceptance Scenarios**:

1. **Given** an open project, **Then** the sketchbook shows tabs Quilts · Blocks · Fabrics & Colors ·
   Photos · Threads with thumbnail cards; selecting a card shows its notecard and actions (open,
   duplicate as variation, delete, sort).
2. **Given** a card, **When** opened, **Then** its editor (quilt, block, image) fills the screen; the
   browser back button returns to the sketchbook.
3. **Given** an editor, **Then** it shows the shared layout: top bar (back, item name, mode tabs,
   undo/redo, save status), tool rail, canvas, inspector, bottom bar ("Apply to" toggle, layer
   switcher where relevant, palette tray).
4. **Given** the palette tray, **When** the user taps "⋯", **Then** a library drawer opens with
   Built-in, Mine, Packs, and Repositories kept visibly separate.

---

### User Story 4 - Compare variations (Priority: P2)

The quilter duplicates a quilt as a variation, changes it, and compares variations side by side.

**Why this priority**: Exploring alternatives is central to quilt design.

**Independent Test**: Duplicate a quilt twice, recolor each, open compare with all three; sizes and
yardage totals appear under each.

**Acceptance Scenarios**:

1. **Given** a quilt or block coloring, **When** "Create copy" is tapped, **Then** a copy
   appears next to the original and opens in the editor.
2. **Given** 2–4 selected quilts, **When** compare is opened, **Then** they show side by side with
   finished size and yardage summary; tapping one opens it.

---

### User Story 5 - Use a phone at the shop and cutting table (Priority: P3)

On a phone, the quilter opens a project to view quilts, yardage, and cutting charts.

**Why this priority**: Real-world use away from the design desk.

**Independent Test**: On a 390px-wide screen, open a project, view a quilt, its yardage, and a rotary
chart; editing controls are absent with a "edit on tablet or desktop" note.

**Acceptance Scenarios**:

1. **Given** a narrow screen (< 600px), **Then** projects, quilts, blocks, libraries, yardage, and
   cutting charts are viewable; editing is unavailable with an explanation.

---

### Edge Cases

- Two tabs open on the same project → second tab opens read-only with a note that the project is
  already open; "Continue here anyway" makes the first tab flush its draft and switch to read-only
  (with a note saying why), then the second tab loads that latest state and becomes editable.
- First tab unresponsive during takeover → second tab takes over after a short timeout using the last
  stored draft and tells the user recent edits in the other tab may be missing.
- Draft storage full or unavailable → editing continues; status shows "Draft not kept — save to
  file"; save prompts are more frequent.
- Browser denies re-opening a recent file → the entry asks the user to pick the file again.
- Deep link to an editor URL with no project open → goes to home with "open the project first".
- Device rotated or resized below 600px mid-edit → switches to view mode without losing the draft.
- Undo after a save → allowed; status returns to "Unsaved changes".

## Requirements *(mandatory)*

### Functional Requirements

**Navigation**

- **FR-001**: The app MUST have three levels: Home, Project sketchbook, and Editors (quilt, block,
  image, print/export), each with its own URL; browser back/forward MUST move between them.
- **FR-002**: Home MUST offer: Start a quilt, Open file (picker or drop anywhere), Recent projects
  (where re-opening is permitted), Samples, Library manager, Settings.
- **FR-002a** (added 2026-10-19): Home MUST offer **Open from a gist** beside Open file: the user
  pastes a GitHub gist link or id; the gist's `.rrq` files are listed (a choice when more than one)
  and the picked one opens like a picked file with no file to save back to (Save asks where). Only
  on request, never in the background; offline or unreachable is reported (constitution 1.12.0,
  Principle II). **Restore unsaved project** sits below Recent projects.
  Both ways fetch the gist's details first and ask "Open from a gist?", naming its description and
  owner (the GitHub account, not the link's user part) and its project(s); the project file is
  fetched only on Open. A link `/?open_gist=<gist link or id>` does the same.
- **FR-003**: The sketchbook MUST show tabbed card grids (Quilts, Blocks, Fabrics & Colors, Photos,
  Threads; Embroidery when present) with notecards and actions (open, duplicate as variation, delete,
  sort by drag or sort mode).
- **FR-004**: Only one editor is open at a time.

**Editor layout**

- **FR-010**: Every editor MUST use the shared layout: top bar, tool rail, canvas, inspector, bottom
  bar with palette tray.
- **FR-011**: Editors MUST use mode tabs instead of ribbons — Quilt: Layout · Borders · Design · Print;
  Block: Draw · Color · Print; Image: Edit · Color · Effects · Print.
- **FR-012**: The bottom bar MUST hold the "Apply to: This · All matching · Alternate" toggle wherever
  a tool supports scope, and the layer switcher (1 piecing, 2 appliqué, 3 quilting, with visibility)
  in the quilt editor.
- **FR-013**: The palette tray MUST provide search, most-recently-used items, and the library drawer
  (Built-in, Mine, Packs, Repositories — separated per spec 002).
- **FR-014**: The inspector MUST show properties of the current selection or tool with exact numeric
  entry.
- **FR-015**: The canvas background MUST be neutral gray in light and dark themes.

**Saving**

- **FR-020**: Edits MUST apply live to the project; there is no separate "add to sketchbook" step.
- **FR-021**: The project MUST be autosaved to an on-device draft within 15 seconds of any change,
  and immediately when the tab is hidden or closing (where the browser allows).
- **FR-022**: On start, an existing draft MUST be offered for restore or discard, showing its time and
  project name.
- **FR-023**: Save (button and Ctrl/Cmd+S) MUST write the `.rrq` file; save-as MUST always choose a new
  file; where overwriting isn't possible, each save downloads a copy and the user is told once why.
- **FR-024**: A save-status indicator MUST always be visible.
- **FR-025**: A project already open in another tab MUST open read-only in the new tab with a note;
  "Continue here anyway" MUST move editing to the new tab: the other tab saves its draft, switches
  to read-only with an explanation, and the new tab loads that latest state. Only one tab may edit
  a project at a time.
- **FR-026**: Undo/redo MUST cover the session and are not stored in files.

**Variations**

- **FR-030**: "Create copy" MUST exist for quilts and block colorings.
- **FR-030a** (added 2026-10-19): **Import quilts** (Quilts tab, under New quilt) MUST copy picked
  quilts from another project file into the open project, with the blocks, colors, fabrics and
  threads they use. Items already here (same id) are reused; an own block with the same id but a
  different design comes in as a copy (new id, "(2)" name) and the quilts use it. Quilt ids and names
  that clash get new ones. Lengths convert to the project's units. One undo step.
- **FR-031**: A compare view MUST show 2–4 quilts side by side with finished size and yardage summary.

**Devices & input**

- **FR-040**: Desktop and tablet MUST support full editing; screens under 600px wide MUST be view-only
  (projects, quilts, blocks, libraries, yardage, cutting charts).
- **FR-041**: Tools MUST be tool-first (choose tool, then tap/click canvas). Long-press MUST equal
  right-click; pinch zooms; two-finger drag pans; desktop gets keyboard shortcuts including modifier
  equivalents of "Apply to".
- **FR-042**: No action may require hover, right-click, or a modifier key without an on-screen
  alternative.

**First run & help**

- **FR-050**: "Start a quilt" MUST open a three-step skippable wizard (layout, blocks, borders) ending
  in the quilt editor.
- **FR-051**: Samples MUST open as untitled copies.
- **FR-052**: Each editor mode MUST show one dismissible first-use hint; hints can be reset in
  Settings. No forced tour.

### Key Entities

- **Draft**: On-device copy of the open project, timestamp, project name, file link if any.
- **Recent entry**: Project name, last opened, re-open permission (where supported).
- **UI preferences**: Theme, dismissed hints, tray size, last mode per editor (stored in settings).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user reaches a placed-and-colored quilt in under 3 minutes from home.
- **SC-002**: After a forced tab close, 100% of edits made more than 15 seconds earlier are restorable.
- **SC-003**: Every editor action is reachable with touch alone on a tablet.
- **SC-004**: Users can identify the save state of their work at any time (always-visible status).
- **SC-005**: On a phone, a user can find a quilt's rotary cutting chart within 3 taps of opening the
  project.

## Assumptions

- Drafts live in on-device browser storage (IndexedDB), requiring a constitution amendment (done in
  v1.5.0).
- File overwrite-in-place depends on browser support; elsewhere downloads are the fallback.
- Phone editing may come in a later version; nothing here prevents it.
- Exact visual design (colors, iconography, spacing) is decided during planning with Quasar
  components.

## Addendum 2026-10-16

- Restoring a draft (unsaved work) opens it the way a file opens: `draftDoc` (src/storage/drafts.ts)
  runs it through `parseProject`, so drafts written by an older app version are migrated to the
  current format and checked, problems are reported as for a file, and a draft that can't be read
  shows a message (staying up) and is kept (never discarded), with **Download** to save it as an
  .rrq to fix by hand. "Continue here" (taking over editing from another
  tab) brings the other tab's draft up to date the same way. The image clean-up reads drafts
  defensively (older or damaged drafts can't break it).
