# Feature Specification: Quilt Instructions

**Feature Branch**: `TBD` (no feature branch yet)

**Created**: 2026-10-19

**Status**: Draft (spec only; not implemented). User Stories 1-4 are the feature; User Story 5
(block notes) is speculative and may change or be dropped.

**Input**: Owner, 2026-10-19: the UI framework already has a WYSIWYG editor. Add instructions as a
tab of the quilt design. Speculative: notes for blocks, too.

## Concepts

- **Instructions**: formatted text a quilter writes for one quilt: how to cut, piece, assemble and
  finish it, in their own words. Each quilt has its own (a project with two quilts has two sets).
- **Rich text**: headings, bold, italic, underline, strikethrough, bulleted and numbered lists,
  quotes, links, horizontal lines, and pictures of the quilt's own blocks, quilt and fabrics
  (User Story 2). Nothing else: no fonts, colors, sizes, tables or scripts in the first release.
- **Block notes** (speculative): the same kind of formatted text for one block.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Write a quilt's instructions (Priority: P1)

A quilter opens a quilt and picks the new **Instructions** tab (with Details, Layout, Design and
Print). The canvas gives way to a page with a formatting toolbar. They write steps, format them,
and the instructions are saved with the project like any other change.

**Independent Test**: write formatted instructions, save the project, close and reopen it: the
instructions are back exactly as written.

**Acceptance Scenarios**:

1. **Given** a quilt with no instructions, **When** the quilter opens the Instructions tab,
   **Then** they see an empty page with a short hint ("Write how to make this quilt") and the
   toolbar.
2. **Given** the toolbar, **When** the quilter makes text bold, adds a heading or a numbered list,
   **Then** it shows formatted as they type (what they see is what prints).
3. **Given** typing, **When** they pause, **Then** the change is one undo step (Undo does not
   remove one letter at a time), and the draft autosave and unsaved-changes warning cover it.
4. **Given** a phone, **When** the Instructions tab is open, **Then** the toolbar wraps or scrolls
   so every button is reachable, and the page uses the full width.
5. **Given** the usual keyboard shortcuts (Ctrl/Cmd+B, I, U, Z), **When** pressed, **Then** they
   format and undo as expected.

---

### User Story 2 - Pictures of the quilt, its blocks and fabrics (Priority: P2)

While writing, the quilter inserts a picture of one of the quilt's blocks (in a chosen coloring),
the whole quilt (in a chosen colorway), or a fabric, from an **Insert picture** menu.

**Independent Test**: insert a block picture, recolor the block, return: the picture shows the new
colors.

**Acceptance Scenarios**:

1. **Given** the Insert picture menu, **When** the quilter picks a block and coloring, **Then** a
   picture of it appears where the cursor is, at a size they can change (small, medium, full width).
2. **Given** an inserted picture, **When** the block, quilt or fabric changes later, **Then** the
   picture shows the current version (pictures are links to the design, not copies).
3. **Given** an inserted picture of a block, **When** that block is removed from the project,
   **Then** the picture shows a "Block no longer in this project" placeholder, not an error.
4. **Given** content pasted from elsewhere with images, **When** pasted, **Then** the text and
   formatting that the editor supports are kept and the images are left out, with a note saying to
   use Insert picture.

---

### User Story 3 - Print the instructions (Priority: P1)

The Print tab can include the instructions, on their own pages after the quilt picture and before
cutting charts, at the same page size and margins as the rest of the printout.

**Independent Test**: turn on Instructions in the print options and print: the instructions appear
formatted, with pictures, and page breaks don't cut a picture in half.

**Acceptance Scenarios**:

1. **Given** a quilt with instructions, **When** the quilter opens Print, **Then** an
   **Instructions** option is on by default and the preview shows them.
2. **Given** a quilt with no instructions, **When** printing, **Then** the option is off and
   hidden-looking (disabled with "No instructions yet").
3. **Given** a heading near the bottom of a page, **When** printing, **Then** the heading moves to
   the next page with the text after it.

---

### User Story 4 - Instructions travel with the quilt (Priority: P1)

Instructions are part of the quilt: saved in the project file, copied when the quilt is copied
(Create copy), and kept when the quilt's layout or colorways change.

**Independent Test**: Create copy of a quilt with instructions: the copy has the same instructions,
and editing one leaves the other alone.

**Acceptance Scenarios**:

1. **Given** a project opened read-only (another tab is editing it), **When** the Instructions
   tab is opened, **Then** the instructions show but can't be edited.
2. **Given** a project file from someone else with instructions, **When** opened, **Then** anything
   outside the supported formatting (scripts, styles, unknown tags, event attributes, links to
   anything but web pages and email) is removed before display, and the project still opens.

---

### User Story 5 - Block notes (Priority: P3, speculative)

A block has a **Notes** tab in the block editor with the same editor: how to piece it, pressing
directions, which seams to match. Notes travel with the block: in the project, in block files, in
My library and in packs, and they print with the block's templates.

**Independent Test**: write notes on a block, add it to My library, add it to another project:
the notes come along.

**Acceptance Scenarios**:

1. **Given** a block with notes, **When** it's printed, **Then** the notes print after its
   templates (option, on by default).
2. **Given** a library block with notes, **When** viewed in the project, **Then** the notes are
   read-only (like the rest of a library item); Edit a copy makes them editable.
3. **Given** the block's existing plain **Notes** field on its notecard (Details tab), **Then**
   that stays a short plain note that search covers; the rich notes are separate. (Open question:
   merge the two into one rich field instead.)

---

### Edge Cases

- Very long instructions (many pages): typing stays responsive; the print preview pages them.
- A link: opens in a new browser tab, never inside the app; the app makes no network request to
  show it (no link previews).
- Units: instructions are free text, so switching the project between inches and centimeters does
  not change numbers in them (the help says so).
- Undo after switching tabs: undo history covers instruction edits like any other edit.
- An instructions picture of a quilt in a colorway that's later deleted: falls back to the primary
  colorway, with a note in the picture's caption.
- Pasting plain text: keeps line breaks as paragraphs.
- Empty instructions (only whitespace or an empty list): treated as none (print option off, no
  "Instructions" mark on the quilt card).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each quilt MUST have an optional instructions document, edited in an
  **Instructions** tab of the quilt editor with a formatting toolbar and what-you-see-is-what-you-get
  display.
- **FR-002**: Supported formatting MUST be limited to the set in Concepts. Anything else, whether
  pasted or found in a loaded file, MUST be removed (its text kept) before display.
- **FR-003**: Instructions from files MUST be treated as untrusted: never executed, no scripts,
  styles or event attributes kept, links limited to `http`, `https` and `mailto`, no requests made
  to show them.
- **FR-004**: Instruction edits MUST go through the project's normal editing (undo, draft autosave,
  unsaved-changes warning), with typing grouped into one undo step per pause.
- **FR-005**: Insert picture MUST offer the quilt (per colorway), its blocks (per coloring) and the
  project's fabrics; pictures MUST be links to the design that redraw when it changes, with a
  placeholder when the item is gone.
- **FR-006**: The Print tab MUST offer an Instructions section (on by default when instructions
  exist), formatted, with pictures, keeping pictures and headings from splitting across pages.
- **FR-007**: Instructions MUST be saved in the project file and copied with Create copy. The
  project format version is bumped with a migration (none needed for older files: no instructions),
  unless the change ships in the same release as another bump.
- **FR-008**: The editor MUST work on phones (toolbar reachable, full-width page) and with a
  keyboard (standard shortcuts, toolbar buttons labeled for screen readers).
- **FR-009**: The quilt card in the project shows a small mark when the quilt has instructions.
- **FR-010** *(speculative)*: Blocks MAY get rich notes with the same editor and rules (FR-002 to
  FR-004), carried in block files and libraries (format bumps for `.rrqbl` and `.rrqlib`), and
  printed with the block's templates.

### Key Entities

- **Quilt instructions**: optional formatted document on a quilt; may contain picture links.
- **Picture link**: reference to a quilt (+ colorway), block (+ coloring) or fabric in the same
  project, plus a display size.
- **Block notes** (speculative): optional formatted document on a block.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A quilter can write a formatted page of instructions with a heading, a numbered list
  and a block picture in under 5 minutes without reading help.
- **SC-002**: Instructions survive save, reopen, Create copy and the format round trip unchanged.
- **SC-003**: A project file with hostile content in its instructions (scripts, event attributes,
  `javascript:` links, remote images) opens with that content removed and nothing run or fetched.
- **SC-004**: Printed instructions match the screen: same formatting, pictures whole on one page.

## Assumptions

- The UI framework's built-in WYSIWYG editor is used; no new dependency. Cleaning untrusted content
  uses the browser's own HTML parsing with an allow list (no new dependency).
- Instructions are per quilt, not per project; project-wide notes stay in the project's Details.
- Pictures are drawn by the app's existing quilt and block drawing; no image files are stored for
  them.
- Text is not translated or unit-converted.

## Out of Scope (first release)

- Fonts, text colors and sizes, tables, embedded videos.
- Pasted or uploaded photos in instructions (Photos tab covers reference photos).
- Instructions in library packs (quilts are not library items).
- Generating instructions automatically from the design (cutting steps, assembly order).
