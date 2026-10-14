# Feature Specification: Library Items in Projects

**Feature Branch**: `008-library-items`

**Created**: 2026-10-13

**Status**: Draft

**Input**: User description: "Keep my own work separate from system/resource-library work. Library
items aren't attached to a project unless actually used, and keep their identity so someone who has
the same item works from the canonical copy. My own blocks show above the library section. Item ids
are `<author>.<random id>`, with a version: `<author>.<id>@<version>` — a content hash, plus a
human-friendly auto-incrementing revision. Version mismatches are shown visually and the user
chooses. Library items are read-only: editing makes my copy, which can replace the library copy in
quilts. Recoloring in a quilt is a skin, not an edit. Applies to blocks and colors now."

> Amends specs 002 (libraries), 003 (FR-005 self-contained projects), and 006 (FR-002 starter
> content in new projects). Constitution Principle VI applies throughout.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - My work and library work are kept apart (Priority: P1)

A quilter sees their own blocks and colors first, and the library's (built-in, packs, repositories)
in a separate section below; new projects start empty instead of containing copies of the library.

**Why this priority**: Users must always know what they made versus what they're using.

**Independent Test**: Start a new project: the sketchbook's My blocks is empty and the Library
section lists the 13 starter blocks; draw a block → it appears under My blocks; the saved file
contains no starter blocks.

**Acceptance Scenarios**:

1. **Given** a new project, **Then** it contains no library blocks or colors; the sketchbook and the
   quilt tray show **My blocks** (empty) above **Library** (built-in starter set, plus installed packs
   and repositories when those exist).
2. **Given** colors, **Then** the tray shows **My colors** (added by the user) above **Library colors**
   (the 36 starter colors).
3. **Given** a block created in the block editor, **Then** it appears under My blocks with the user's
   author id.

---

### User Story 2 - Using a library item adds it to the project only while used (Priority: P1)

Setting a library block (or painting with a library color) embeds that item in the project, with its
identity; when nothing uses it anymore, it leaves the project.

**Why this priority**: Projects must stay self-contained (spec 003) without bloating with unused copies.

**Independent Test**: Set Ohio Star in a quilt, save → the file contains Ohio Star with its key;
erase it everywhere, save → the file no longer contains it.

**Acceptance Scenarios**:

1. **Given** a library block, **When** it is set in a quilt, **Then** the project gains an embedded
   copy carrying `id`, `version`, `revision`, and attribution, listed under Library (in use).
2. **Given** an embedded library item no longer used by any quilt or block, **Then** it is removed
   from the project automatically (undo restores it).
3. **Given** a project opened by someone without that library, **Then** everything renders from the
   embedded copies.

---

### User Story 3 - The canonical copy wins when versions match (Priority: P1)

When a project is opened and the user's libraries contain the same item at the same version, the
app treats it as that library item; when the version differs, the user sees both and chooses.

**Why this priority**: Shared projects should line up with each person's libraries without silently
changing designs.

**Independent Test**: Open a project using `rrquilts.ohio-star@<v1>` with a library holding `@<v2>`:
a dialog shows both versions side by side; choosing "Use library version" updates the project;
"Keep project's copy" leaves it.

**Acceptance Scenarios**:

1. **Given** same `id@version` in the project and a library, **Then** the item is shown as the library
   item (no duplicate entry) and no prompt appears.
2. **Given** the same `id` at a different `version`, **When** the project opens, **Then** a dialog
   lists each such item with thumbnails of both versions, their revisions, and the library they come
   from, and offers per item (and "all") **Keep project's copy** or **Use library version**; the
   project's copy is the default.
3. **Given** "Use library version", **Then** quilts using it switch to it, keeping quilt colorings on
   patches that still exist (spec 003 remap).

---

### User Story 4 - Library items are read-only; editing makes your copy (Priority: P1)

Editing a library block creates the user's own copy (credited "based on…"), which can replace the
library block in the quilts that use it.

**Why this priority**: Library content must stay canonical so ids and versions stay meaningful.

**Independent Test**: Edit Ohio Star (used in 2 quilts) → a dialog offers to make your copy and use
it in those quilts → yes → My blocks has "Ohio Star (mine)" based on Ohio Star; both quilts use the
copy with their colors intact.

**Acceptance Scenarios**:

1. **Given** a library block, **When** the user chooses Edit, **Then** a copy is created under My
   blocks with a new `<author>.<random>` id, revision 1, and `source` attribution marked derived.
2. **Given** that library block is used in quilts, **Then** the dialog offers "Use my copy in those
   quilts" (default on); quilt colorings carry over.
3. **Given** recoloring a placed block in a quilt, **Then** the block is not edited (quilt colorings
   are a skin); only geometry changes or changes to the block's own colorings are edits.

---

### User Story 5 - Author identity (Priority: P2)

The user sets the name they want to be known by; items they create carry it in their id.

**Why this priority**: Namespaced ids and honest attribution (Principle VI).

**Independent Test**: Set "Jane Doe" in Settings, create a block → id `jane-doe.<random>`; rename to
"JD Quilts" → the old block keeps its id, new blocks use `jd-quilts.`.

**Acceptance Scenarios**:

1. **Given** Settings, **Then** a "Your name" field explains it appears in shared projects and packs.
2. **Given** no name set, **When** the user first creates an item, **Then** they're asked once; skipping
   uses `anonymous`.
3. **Given** ids already created, **Then** they never change when the name changes.

---

### User Story 6 - Share a single block as a file (Priority: P2)

A quilter exports one block to a `.rrqbl` file (JSON) and anyone can import it as their own block.

**Why this priority**: Lightweight sharing without building a pack.

**Independent Test**: Export Ohio Star from the sketchbook → `ohio-star.rrqbl`; import it in a cm
project → it appears under My blocks at 25.4 cm with its colors, credited to its library.

**Acceptance Scenarios**:

1. **Given** a block, **When** the user chooses Export block, **Then** a `.rrqbl` file holds the block,
   the colors its own colorings use, the units, and the exporter's name.
2. **Given** a `.rrqbl`, **When** imported, **Then** the block is added under My blocks (editable),
   converted to the project's units; existing attribution is kept, or the exporter is credited.
3. **Given** the same id at the same version already in the project, **Then** nothing is added; same
   id with a different design → added as a copy with the importer's new id and a "(2)" name.

---

### User Story 7 - Color variants: your colorings of a library block (Priority: P2)

A quilter recolors a library block without redrawing it. The block keeps its drawing, credit, and
name; the colorings the quilter makes are theirs, and the library's colorings stay as they were.

**Why this priority**: Recoloring is the most common change to a library block, and it shouldn't
cost the link to the original or mix the user's colorings in with the library's.

**Independent Test**: In a project's Blocks tab, choose "Create a coloration variant" on the library
block Sawtooth Medallion → the block editor opens on Color with the Draw tab hidden → pick its Neon
coloring and paint a patch → "Neon (project)" appears under Project colorings with the change, and
Neon is unchanged under Library colorings → back in the Blocks tab, the variant shows "Neon (project)"
and the quilt design picker offers only its project colorings.

**Acceptance Scenarios**:

1. **Given** a library block (built-in or pack), **When** the user chooses "Create a coloration
   variant", **Then** My blocks gets a copy flagged as a color variant with the library block's name
   (kept in sync with it), its credit, and all its colorings; the block editor opens on Color and the
   drawing can't be edited.
2. **Given** a color variant in the block editor, **Then** its colorings show in two groups, "Project
   colorings of ⟨block⟩" (new or changed since the copy) above "Library colorings of ⟨block⟩" (still
   as the library block has them, noted as read-only).
3. **Given** a library coloring selected, **When** the user paints, **Then** the editor first copies it
   into Project colorings as "⟨name⟩ (project)" and applies the paint to the copy, in one undo step;
   Rename and Delete are unavailable for library colorings.
4. **Given** a color variant, **Then** wherever the project shows it (My blocks, the quilt design
   block picker, the block editor on open) it shows a project coloring: the one last chosen, else its
   first; its coloring count badge counts and offers only its project colorings, and placing it in a
   quilt uses one of them.
5. **Given** a color variant with no project coloring yet, **Then** it offers all its colorings so it
   can still be placed.
6. **Given** a color variant, **Then** a "Color variant" badge marks it; clicking it scrolls to and
   briefly highlights the library block it came from.

### Edge Cases

- A color variant whose library block isn't installed → all its colorings count as its own.
- A library coloring edited before read-only colorings existed → it stays under Project colorings;
  the variant no longer has an untouched copy of it.
- Two people with the same display name → the random part keeps ids unique.
- An embedded item whose library is uninstalled → keeps working from the embedded copy; shown under
  Library as "from <library> (not installed)".
- The same item reached through two packs → same `id@version`, one entry.
- A user's own block shared and re-imported as a pack → appears under Library (it's a pack item now);
  their original under My blocks remains theirs.
- Library colors used only inside a library block's default coloring → embedded with the block.
- Undo of a prune or a version switch restores exactly.
- Files saved before this feature (plain ids, starter copies) → loaded as the user's own items, with
  their existing attribution; no prompt.

## Requirements *(mandatory)*

### Functional Requirements

**Identity**

- **FR-001**: Shareable items (blocks, colors now; fabrics, threads, layouts, photos later) MUST have
  `id` = `<author slug>.<random>` (built-in: `rrquilts.<readable name>`), immutable once created.
- **FR-002**: Items MUST carry `version` = first 12 hex chars of SHA-256 of their canonical design
  content (blocks: kind, size, geometry, patches, own colorings; colors: RGB) — excluding notecard,
  attribution, and editor settings — and an integer `revision` that increments whenever `version`
  changes. Matching uses `id@version`; `revision` is for display.
- **FR-003**: Settings MUST have "Your name" (display name; slug derived: lowercase, non-alphanumeric →
  `-`); asked once on first creation; `anonymous` if skipped; included in `.rrqconf`.

**Libraries in the app**

- **FR-010**: The starter content MUST be a built-in library (pack, spec 002 format; Public Domain Mark per spec 009) loaded
  by the app, not copied into projects. New projects start empty (amends spec 006 FR-002).
- **FR-011**: Sketchbook Blocks and the quilt tray MUST show **My blocks** above **Library** (built-in +
  packs + repositories combined); the tray's colors MUST show **My colors** above **Library colors**.

**Projects**

- **FR-020**: Using a library item MUST embed a copy (with `id`, `version`, `revision`, attribution);
  library items unused by any quilt or block MUST be removed from the project automatically within the
  same change (undoable).
- **FR-021**: On open, for each embedded library item: same `id@version` in a local library → treated
  as that item; same `id`, different `version` → version dialog (FR-022); unknown → embedded copy.
- **FR-022**: The version dialog MUST show both versions visually (thumbnails/swatches), revisions and
  source, with per-item and all-items choices; default keeps the project's copy.
- **FR-023**: Switching to the library version MUST remap quilt colorings (spec 003) and be one undo
  step.

**Editing**

- **FR-030**: Library items MUST be read-only. "Edit" on one MUST create the user's copy (new id,
  revision 1, `source` derived) and offer to use it in quilts that use the library item (default on).
- **FR-031**: Quilt colorings MUST NOT change a block's id, version, or revision.

**Color variants (US7)**

- **FR-032**: "Create a coloration variant" on a library block MUST make a My blocks copy flagged
  `colorVariant`, with the library block's name, credit (FR-030 rules), and colorings; its drawing
  MUST NOT be editable.
- **FR-033**: A variant's coloring is a **project coloring** when it differs from every coloring of
  the library block it came from (compared as stored), else a **library coloring**. Library colorings
  MUST be read-only: painting one MUST first copy it as "⟨name⟩ (project)" (same undo step); rename
  and delete MUST be unavailable for them.
- **FR-034**: The block editor MUST show a variant's colorings in two groups, project colorings above
  library colorings.
- **FR-035**: My blocks, the quilt design picker, and the block editor MUST show a variant in a project
  coloring (last chosen, else first); its count badge and coloring menu MUST cover only its project
  colorings, and placing it MUST use one. With no project coloring yet, all its colorings apply.
- **FR-036**: Blocks with several colorings MUST show a coloring count badge (Libraries, the project's
  My blocks and library blocks, the quilt design picker); clicking it chooses the coloring the card
  shows (and, in the picker, the one placed). The badge's tap target is larger than the badge and
  softly blurs the block behind it, fading out at its edge.

**Block files**

- **FR-040**: Users MUST be able to export one block as `.rrqbl` (`format: "rrqbl"`, `version`, `units`,
  `author`, `block`, `colors`) and import it as their own block (FR-030 attribution rules; untrusted
  input validated like `.rrq`; fills referencing missing colors dropped).
- **FR-041**: Users MUST be able to import every block of another `.rrq` (nothing else) the same way;
  library blocks already in the user's library are skipped; identical blocks are not duplicated.

### Key Entities

- **Item key**: `id@version`; **revision**: display counter.
- **Library** (app-level): built-in pack now; packs/repositories (spec 002) later.
- **Embedded library item**: a library item copied into a project because it's used.

## Success Criteria *(mandatory)*

- **SC-001**: A new project's file contains no library items until one is used.
- **SC-002**: 100% of embedded items that match a local library item by `id@version` show as library
  items, with no duplicates and no prompt.
- **SC-003**: Version mismatches are never resolved silently.
- **SC-004**: Recoloring in quilts never changes a block's version.
- **SC-005**: Painting a color variant's library coloring never changes that coloring.

## Assumptions

- Only the built-in library exists until spec 002's import/repository features are built; the
  matching and dialog work the same for them.
- Pre-release files are not migrated beyond being treated as the user's own items.
