# Feature Specification: Sharing and Distributing Libraries

**Feature Branch**: `015-sharing-libraries` (built on `feat/add-library-link`,
`feat/library-links`, `feat/import-pick-packs`)

**Created**: 2026-10-15

**Status**: Implemented except FR-017 (written after the 2026-10-15 working session, from what was built and
the decisions made there)

**Input**: Owner requests on 2026-10-15: brand libraries in the template layout; a gallery site for
each library; home page, gallery and other links for libraries; adding a library by link;
importing a library file by picking packs and connecting it to its repository; reliable backups
of web libraries; making packs with links and chosen items.

> Builds on spec 002 (library format), spec 011 (libraries), spec 014 (fabric images, packs,
> connected libraries, template repository). Amends spec 014 User Story 6 (release files) and
> FR-051.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Find a library's home and gallery (Priority: P1)

A quilter sees where a library comes from and can open its pages.

**Independent Test**: Connect a library whose index has `links` → a globe beside its name in the
Libraries sidebar opens its home page.

**Acceptance Scenarios**:

1. **Given** a library with a home page, **Then** the globe beside its name in the sidebar list
   opens the home page in a new tab, without folding the list.
2. **Given** no home page but a gallery, **Then** the globe opens the gallery; **given** neither but
   a repository address, **Then** the repository; **given** none, **Then** no globe.
3. **Given** a library file whose links aren't web addresses, **Then** the links are dropped and
   listed as skipped, and the library still loads.

---

### User Story 2 - Add a library from a link (Priority: P1)

A library's page links straight into the app to add it.

**Independent Test**: Open `/libraries?add=<address>` → the Add from the web dialog opens filled in,
titled "Add this library?".

**Acceptance Scenarios**:

1. **Given** the link, **Then** the dialog is filled in (address, and branch or tag from `&ref=`)
   and nothing connects until the user clicks **Connect**.
2. **Given** the library is already added, **Then** it is shown (sidebar glow) with "already added".
3. **Given** the dialog was shown, **When** the page reloads, **Then** it doesn't ask again (the link
   part is removed from the address).

---

### User Story 3 - Import a library file, choosing packs (Priority: P1)

A quilter imports a downloaded library file and picks which packs to add.

**Independent Test**: Import a library `.rrqlib` with 110 packs → a picker lists them; tick two →
only those two are installed, with their images.

**Acceptance Scenarios**:

1. **Given** a library file, **Then** a picker lists its packs (search for long lists, select all or
   none), each marked new, newer than yours, installed, installed with images missing, or installed
   and switched off.
2. **Given** the file names its repository, **Then** importing connects the library as if added from
   the web: unpicked packs stay listed, to switch on (and download) later; the library gets Check
   for updates and Disconnect.
3. **Given** the file names no repository, **Then** only the picked packs are installed; importing
   the file again offers the rest.
4. **Given** a pack already installed, identical to the file's (same revision) and complete on the
   device, **Then** it shows installed, ticked, and needs nothing; **given** images missing, **Then**
   it says how many and starts ticked (importing fills them in).
5. **Given** packs installed with smaller images than the file's, **Then** an option (on by default)
   adds the larger ones; **given** larger images than the file's, **Then** a choice keeps them
   (default) or switches to the file's (deleting the larger, freeing space).
6. **Given** a cancelled picker, **Then** nothing is installed and no images are stored.

---

### User Story 4 - Backups keep web libraries (Priority: P1)

A backup restores web libraries even when they can't be reached.

**Independent Test**: Connect a library that can't be reached (private repository), install two
packs, back up, disconnect, restore → the library returns as a web library with all its packs
listed and the two installed, with images.

**Acceptance Scenarios**:

1. **Given** a backup, **Then** each web library with installed packs goes in with its address and
   index; packs its repository still serves are listed to download on restore, and the others are
   copied in with their images.
2. **Given** a restore whose web library can't be reached, **Then** it is connected from the index
   in the backup, and the copied packs are installed.
3. **Given** the restore dialog, **Then** it says per library how many packs download and how many
   are in the file.

---

### User Story 5 - Switching packs off doesn't lose images (Priority: P1)

**Acceptance Scenarios**:

1. **Given** a web library's pack switched off, **Then** its images are freed only if the library
   answers on the web (checked once per session); a private, gone, or offline library keeps them.
2. **Given** a library's packs all switched off, **Then** they leave the main Libraries view (a
   pack's name still shows it alone).

---

### User Story 6 - Make a pack (Priority: P2)

A quilter shares items from My library as a pack.

**Acceptance Scenarios**:

1. **Given** Make pack, **Then** the user can set name, description, author, license, a home page,
   a gallery, other links (name and address), and tick which palettes and blocks to include.
2. **Given** a link that isn't a web address, or nothing ticked, **Then** Download pack is off.
3. **Given** palettes with fabric images, **Then** the pack file includes the images (FR-017, not
   yet built).

---

### User Story 7 - Publish a library with a gallery (Priority: P2)

A library maintainer publishes a repository, its releases, and a gallery page.

**Acceptance Scenarios**:

1. **Given** a version tag, **Then** the release holds one `.rrqlib` of the whole library per image
   size (no file per pack), and the `library.json` inside names the repository (from GitHub
   Actions, the git remote, or `repository` in `library.config.json`).
2. **Given** a push to `main` with GitHub Pages on, **Then** a gallery site is published: a sidebar of
   collections (a menu on phones; the library name goes back to the top), About (description and
   links, home page first, not the gallery itself), Installing (follow the add link, add by hand
   with a copyable address, or import a release file, with approximate sizes rounded to 10 MB, and
   a note that imported files don't update themselves), each collection with its fabrics, a copy
   link button and a system share button, and a carousel opened at the clicked fabric.
3. **Given** scrolling the gallery, **Then** the address follows the collection in view (without
   adding history), and a reload returns there.
4. **Given** `links` in `library.config.json`, **Then** the build writes them into `library.json`
   and every pack (unchanged packs get them without a new revision).
5. **Given** manufacturer libraries, **Then** they use the template layout with `sources/` kept off
   the repository (gitignored, rebuilt by `fabric_collections/build_packs.py`), and the template's
   tools; their fabric ids and revisions stay as published.

### Edge Cases

- Library file with a `repository` that isn't https → imported without connecting.
- Same library imported again after a restore → installed packs are recognized; nothing is duplicated.
- Pack revisions: rebuilding unchanged sources never raises a revision; a deleted `packs/` folder
  continues from the revision `library.json` lists.
- Gallery Share button where the system share sheet doesn't exist (most desktops, plain HTTP) →
  hidden; copy link always works (with a toast).
- Private repository with Pages on → the gallery may still be public: the brand READMEs say not to
  turn Pages on before the manufacturer agrees.

## Requirements *(mandatory)*

### Functional Requirements

**Format** (spec 002)

- **FR-001**: Library indexes and `.rrqlib` documents MAY carry `links`: `homepage`, `gallery`, and
  `others` (`name`, `url`), http(s) only. Invalid links MUST be dropped and reported, not fail the
  file. Author `url` and socials stay separate (they're about a person).
- **FR-002**: A library index MAY carry `repository` (https address). Release files MUST include it.
- **FR-003**: Backups MAY carry, per web library, its `index` at backup time.
- **FR-004**: These optional fields MUST NOT raise the format versions (older apps ignore them, and
  a raised version would make them refuse the files). *Decision 2026-10-15.*

**App**

- **FR-010**: `/libraries?add=<address>[&ref=<branch or tag>]` MUST open Add from the web filled in
  and ask before connecting (US2).
- **FR-011**: The Libraries sidebar MUST show the globe link (US1).
- **FR-012**: Importing a library file MUST use the pack picker (US3), storing images only for the
  packs chosen (and for size changes chosen).
- **FR-013**: Backups and restores MUST behave as US4; images MUST be freed as US5.
- **FR-014**: Make pack MUST take links and the items to include (US6).
- **FR-015**: Imported libraries without a connection MUST have All off and Remove; web libraries
  All off, Check for updates, and Disconnect.
- **FR-017**: A pack file MUST carry its fabric images (a zipped `.rrqlib`, as backups are), so a
  palette with fabrics arrives complete. *Not yet built: packs are written as plain JSON without
  images (found 2026-10-15).*
- **FR-016**: The sidebar's Libraries box MUST hold Add from the web, Import resource, Back up, and
  Make pack (two rows); the separate Add fabrics button is removed (palettes take images directly).

**Template and tools** (amends spec 014 FR-051)

- **FR-020**: `tools/build.py` MUST support `manufacturer` in `library.config.json`, per-pack
  `description`, per-file overrides in `pack.json` (`name`, `sku`, `size`), and color packs from a
  folder's `palette.rrqplt`; very large photos are scaled to 2048 px first; image files are named
  after the fabric id.
- **FR-021**: Revisions MUST change only when contents change (fabrics, names, images, colors).
- **FR-022**: `tools/site.py` and the Gallery site workflow MUST publish the gallery (US7).
- **FR-023**: Releases MUST be whole-library files per size, naming the repository (US7).

### Key Entities

- **Library links**: home page, gallery, other named pages.
- **Library index**: adds `links`, `repository`.
- **Backup connection**: address, branch, library, packs to download, index.
- **Image check** (import): per installed pack, the largest size in the file and on the device, and
  images missing at sizes the device uses.

## Success Criteria *(mandatory)*

- **SC-001**: Importing a 110-pack library file and picking 2 packs stores only those packs' images.
- **SC-002**: Backup → disconnect → restore of an unreachable web library brings back the library,
  its pack list, and the copied packs with all images.
- **SC-003**: Rebuilding a brand library from its sources leaves every published fabric id, image
  hash, and revision unchanged.

## Assumptions

- Manufacturer images stay personal-use: brand repositories stay private, and their Pages off,
  until the manufacturers agree.
- The template repository is `RRQuilts/rrquilts-library-template`; brand repositories are
  `RRQuilts/rrqlib-<brand>`.
- Libraries imported before `repository` existed stay plain imports until a newer release file is
  imported.
