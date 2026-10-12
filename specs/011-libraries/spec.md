# Feature Specification: Libraries

**Feature Branch**: `011-libraries`

**Created**: 2026-10-12

**Status**: Draft

**Input**: User description: "let's do the library feature"

> Implements the Libraries page (header button, a placeholder until now) on top of spec 002 (the
> `.rrq_lib` format), spec 001 US10 (find and reuse), spec 008 (library items, `id@version`, switch
> version), and spec 009 (credits, licenses). Item types: blocks and color collections (the types
> the app has); fabrics, threads, layouts, … join when those features exist. Repositories (spec 002
> US3–5) are spec 012.

## Clarifications

### Session 2026-10-12

- Q: Does a backup include the packs and repositories I've added? → A: Yes. One backup covers
  everything in Libraries: own items (incl. copies of pack items), imported packs embedded whole,
  and repository connections by reference (URL, ref, pinned revision, declined revision). Amends
  spec 002 FR-001 (optional `packs` and `repositories` on kind `personal`).
- Q: Scope? → A: The Libraries page, My library, backup/restore, packs. Repositories (connect, pin,
  changelog, export zip) are spec 012; the backup's `repositories` part arrives with it.
- Q: One personal library or several? → A: One "My library" with categories. Categories may become
  packs later.
- Q: Sketchbook Library section? → A: Keep listing everything (now from every library); revisit if
  it becomes a problem.
- Q: Categories and styles? → A: Categories are user-defined. A style is an optional, special kind of
  tag the user manages. Amends spec 002 FR-003/FR-004.
- Q: How do My-library items enter projects? → A: As library items: read-only, linked by
  `id@version` (spec 008).
- Q: Editing a My-library item? → A: Edit in a project; the sketchbook list offers to sync the
  change back to the library.
- Q: Colors? → A: My library holds color collections, not single colors. In scope.
- Q: Search by color? → A: Later.
- Q: Can a color collection travel on its own? → A: Yes: export/import as a standalone `.rrqcc`
  file (like `.rrqb` for one block).
- Q: What can be shared besides the whole library? → A: Later: single categories, and single types
  of things (color collections, blocks, fabrics, …), each as a pack.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and search libraries (Priority: P1)

The Libraries page lists every library on this device — My library, imported packs, built-in — and
lets the user browse and search their items.

**Independent Test**: Open Libraries → Built-in → search "star" → Ohio Star shows; filter by
category; preview it (larger picture, author, license, notes).

**Acceptance Scenarios**:

1. **Given** the Libraries page, **Then** it shows My library, Packs, and Built-in; each library shows
   name, author, license, revision, and item counts.
2. **Given** a library, **When** opened, **Then** its blocks show as thumbnails and its color
   collections as swatch strips, grouped by category, searchable by name, notes, tags, and style.
3. **Given** an item, **When** previewed, **Then** it shows the larger picture (or the collection's
   swatches), author, license, notes, and credits (as the sketchbook Preview does).

### User Story 2 - Use library items in a project (Priority: P1)

Every library's blocks and colors are available in every project, as built-in ones are today.

**Independent Test**: Add a block to My library in project A; open project B → the sketchbook's
Library section lists it under My library → set it in a quilt.

**Acceptance Scenarios**:

1. **Given** the sketchbook, **Then** the Library section lists blocks from every library, grouped by
   library (My library, each pack, Built-in); the palette lists library colors grouped by collection.
2. **Given** a library item set in a quilt, **Then** the project embeds it as a library item
   (read-only, linked by `id@version`, spec 008); removing the library later never changes the
   project.
3. **Given** a project using a library item, **When** that library has another version of it,
   **Then** the update icon / Switch version… (spec 008) offers it.

### User Story 3 - My library (Priority: P1)

The user keeps their own blocks and color collections in one personal library on this device,
available in every project, and keeps it current by editing in projects.

**Independent Test**: Add a block to My library; in another project edit it (Edit makes the
project's copy), change a seam → the sketchbook card offers "Sync to my library" → sync → the
library has revision 2, and every project offers the new version.

**Acceptance Scenarios**:

1. **Given** one of the user's blocks in a project, **When** they choose "Add to my library" (picking
   a category, optional), **Then** a snapshot (`id@version`, credits, license) is stored, and the
   project's block stays editable, linked to it.
2. **Given** a My-library block in a project, **When** the user chooses Edit, **Then** the project
   gets an editable copy linked to the library item (no new credit — the user is the author).
3. **Given** a linked copy that differs from its library item, **Then** its sketchbook card shows a
   "Sync to my library" action; syncing stores the copy as the item's next version (revision + 1).
4. **Given** a pack or built-in item, **When** the user chooses "Copy to my library", **Then** it
   becomes their own item with credits per spec 009.
5. **Given** My library on the Libraries page, **Then** the user can rename, delete, and
   re-categorize items, set tags and styles, and create, rename, and delete categories (deleting a
   category moves its items to Uncategorized).

### User Story 4 - Color collections (Priority: P1)

Colors live in My library as named collections ("Kona brights", "Granny's scraps"), not one by one.

**Independent Test**: Fabrics & Colors › select four of the project's colors › Save as collection
"Sunset" → Libraries › My library shows Sunset with four swatches; another project's palette lists
Sunset's colors.

**Acceptance Scenarios**:

1. **Given** the project's own colors, **When** the user selects some and chooses "Save as
   collection", **Then** a new collection is stored in My library (name, category optional).
2. **Given** an existing collection, **When** the user chooses "Add to collection", **Then** the
   selected colors join it (its next version).
3. **Given** a library color changed in a project (Edit makes a linked copy), **Then** "Sync to my
   library" updates that color in its collection.
4. **Given** the built-in colors, **Then** they appear as one collection, "Basic colors".
5. **Given** a collection on the Libraries page, **Then** the user can rename it, reorder, rename,
   or remove its colors.
6. **Given** a collection, **When** the user chooses Export, **Then** a `.rrqcc` file downloads with
   the collection, its colors, author, license, and credits.
7. **Given** a `.rrqcc` file, **When** imported on the Libraries page, **Then** the collection joins
   My library keeping its author and credits (as `.rrqb` blocks do); **When** imported in the
   project's Fabrics & Colors tab, **Then** its colors join the project as the user's own colors.
   Same collection id already there: same version → "already there"; another version → replace it
   or keep both.
8. **Given** the Libraries page Import button, **Then** it accepts `.rrq_lib` and `.rrqcc` (and
   `.json`), choosing the flow from the file's `format`.

### User Story 5 - Back up and restore (Priority: P1, spec 002 US1)

One backup file holds everything in Libraries, so a cleared browser or a new device gets it all back.

**Independent Test**: With My library and an imported pack, back up; clear site data; restore
offline → My library and the pack are back with the same `id@version`s.

**Acceptance Scenarios**:

1. **Given** the Libraries page, **When** the user chooses Back up, **Then** they tick what to include
   (all on by default): My library, Packs, Repositories (links, once spec 012 exists); a `.rrq_lib`
   of kind `personal` downloads.
2. **Given** My library, **Then** the backup holds every item and category, including copies of pack
   items (they are the user's own, with credits, and don't need the pack).
3. **Given** imported packs, **Then** each is embedded whole (its own `.rrq_lib` document), so restoring
   needs neither the original file nor the network.
4. **Given** connected repositories (spec 012), **Then** each is stored by reference: URL, branch or
   tag, pinned revision, and declined revision — never its downloaded content; restoring reconnects
   when online at the pinned revision via its `rrq-rev-<n>` tag, else offers the latest with its
   changelog (spec 002 FR-035).
5. **Given** that file on another device, **When** imported, **Then** My library restores as the
   user's own (non-empty My library → merge or replace); packs restore under Packs.
6. **Given** a pack with the same id is already installed, **When** restoring, **Then** the user keeps
   the installed one or replaces it with the backup's.

### User Story 6 - Share and import packs (Priority: P2, spec 002 US2)

**Independent Test**: Share My library as a pack; import it on another profile → it shows under
Packs with author and license; its blocks are read-only until copied.

**Acceptance Scenarios**:

1. **Given** My library, **When** the user chooses Share as pack, **Then** the whole library is
   shared (single categories or single item types — only blocks, only color collections, … — come
   later); they confirm name,
   description, author, license (default CC BY-SA; locked by item licenses per spec 009), and a
   `.rrq_lib` of kind `pack` downloads with a credits list. Items the user may not redistribute (All
   rights reserved by someone else) are left out, with a list.
2. **Given** a pack file, **When** imported, **Then** it appears under Packs, read-only, with author
   and license shown.
3. **Given** a pack, **When** the user removes it, **Then** projects that used its items keep their
   embedded copies.
4. **Given** a pack with the same id and a higher revision, **When** imported, **Then** the user is
   offered the update with its changelog; same or lower revision → "already installed".

### Edge Cases

- Library storage cleared by the browser → projects keep their embedded copies; the page offers to
  restore from a backup. Ask the browser for persistent storage when the first item is added.
- Invalid items in an imported file → skipped and listed; the rest load (spec 002 FR-022).
- A My-library item is deleted while projects use it → the projects keep their embedded copies; a
  linked copy's "Sync to my library" becomes "Add to my library".
- Syncing a copy whose library item changed since the copy was made (another project synced first)
  → warn; the user picks overwrite or keep both (the copy becomes a new item).
- Units: library items keep the units they were saved in; adding to a project converts (spec 008
  `toUnits`).
- A pack and My library contain the same `id` (the user's copy came from a pack and kept its id) →
  impossible: copies get new ids (spec 008).

## Requirements *(mandatory)*

- **FR-001**: My library and imported packs live in IndexedDB; built-in stays bundled.
- **FR-002**: `.rrq_lib` import/export per spec 002 (validation, migration, credits, licenses).
- **FR-003**: The library store exposes one lookup over all libraries (`id` → current version), used
  by `syncDraft`, version checks, and thumbnails, so projects work with any library as with built-in.
- **FR-004**: Library items are read-only everywhere; changes go through a linked copy (spec 008/009).
- **FR-005**: Everything works offline.
- **FR-006**: Amends spec 002 FR-001: a `personal` document MAY carry `packs` (complete `pack`
  documents, validated as if imported on their own) and `repositories` (`{ url, ref, pinned,
  declined? }`). Packs and repositories never carry these fields.
- **FR-007**: Amends spec 002 FR-003/FR-004: `categories` are `{ id, name }`, user-defined; an
  item's `category` is optional (absent = Uncategorized); `style` is not a category level but an
  optional tag kind: `notecard.styles: string[]`, shown and searched apart from plain tags.
- **FR-008**: Amends spec 002 FR-005: item type `colors` = a color collection, `data` = `{ colors:
  Color[] }` (each color keeps its own `id@version`, so projects link single colors). Single `color`
  items are not used by My library.
- **FR-009**: A linked copy records the library item it came from (`source.libraryId`,
  `source.itemId`, `source.version`); "Sync to my library" is offered when the copy's content
  version differs from that item's.
- **FR-010**: `.rrqcc` files: UTF-8 JSON `{ format: "rrqcc", version, units?, app, collection }`
  where `collection` is a library item of type `colors` (FR-008) with its author, license, and
  credits; validated as untrusted like `.rrqb` (spec 008 FR-040). File pickers filter by
  `.rrqcc,.json`.

## Success Criteria *(mandatory)*

- **SC-001**: A block added to My library in one project can be used in another without files.
- **SC-002**: Backup → clear site data → restore returns every own item and pack (same
  `id@version`) offline.
- **SC-003**: Searching a library of 500 blocks shows results within 100 ms.
- **SC-004**: No edit in a project ever changes My library without the user choosing Sync.
