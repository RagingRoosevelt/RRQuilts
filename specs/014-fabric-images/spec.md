# Feature Specification: Fabric Images

**Feature Branch**: `014-fabric-images`

**Created**: 2026-10-14

**Status**: Draft (decisions from the 2026-10-14 planning conversation; open points marked
*Assumed*)

**Input**: User description: "Supply fabric images in palettes: library-supplied image palettes,
the user's My library image palettes, preparing manufacturers' zips into palettes, keeping file
sizes light (WebP), and making it easy for people to maintain resource packs (a template repo)."

> Builds on spec 001 US11 (FR-070, FR-072), spec 002 (library format, amended alongside this
> spec), spec 008 (library items in projects), spec 011 (libraries). Constitution 1.9.0 amends
> Principles II, III, and IV for this spec.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Design with fabric images (Priority: P1)

A quilter colors patches with fabrics, not just solid colors, and sees the print at its real size.

**Why this priority**: Fabric images are what make a quilt design look like the quilt.

**Independent Test**: Pick a fabric in the tray, paint a patch in a quilt and in a block → the patch
shows the print tiled at true scale; zoom in and out → the print scales with the quilt.

**Acceptance Scenarios**:

1. **Given** a palette with fabrics, **Then** the tray and color pickers show each fabric as a
   swatch, alongside the palette's solid colors.
2. **Given** a fabric painted into a patch, **Then** the patch shows the image tiled at the fabric's
   real-world size, in quilts, blocks, thumbnails, and printouts.
3. **Given** a fabric whose image hasn't loaded yet, **Then** its average color stands in until it
   does (when the setting allows).
4. **Given** a fabric whose real size was never set, **Then** it is treated as 8 in × 8 in and marked
   approximate (≈) until a size is set for the fabric, its palette, or its library.

---

### User Story 2 - Add my own fabrics (Priority: P1)

A quilter adds photos or scans of their own fabrics, many at once.

**Why this priority**: The stash is personal; built-in content has no fabric photos.

**Independent Test**: In Libraries, import a folder of 20 photos into a new My library palette with
a shared size of 9 in × 9 in → 20 fabrics appear, each with an average color, ready to use.

**Acceptance Scenarios**:

1. **Given** Libraries, **When** the user imports fabric images (several files, a folder, or a zip),
   **Then** one dialog sets the shared options (palette, real size, square crop) and lists the
   images, each adjustable (name, size, crop) before importing.
2. **Given** an import, **Then** each image is reduced to 256 and 512 px (never enlarged) and stored
   as WebP where the browser can write it (JPEG otherwise), with its average color.
3. **Given** a project, **When** the user adds fabric images there, **Then** they join the project's
   own palette the same way.
4. **Given** the user's own fabrics, **Then** they are editable, can be copied between palettes, and
   travel in My library backups.

---

### User Story 3 - Libraries made of packs, switched on and off (Priority: P1)

A library holds many packs (palettes, blocks); the quilter turns on only the ones they want, so the
rest cost no download or storage.

**Why this priority**: Fabric libraries are large (thousands of images); loading all of one isn't
practical.

**Independent Test**: Add a library with 40 packs → only its index downloads; turn on two palettes →
only their images download; turn one off → its images are freed (unless a project still uses them).

**Acceptance Scenarios**:

1. **Given** a library, **Then** Libraries lists its packs (name, kind, item count, download size at
   the chosen image size) from the library's index, with an on/off switch each.
2. **Given** a pack turned on, **Then** its items appear in the trays and pickers; turned off, they
   don't, and its images are removed from the device unless an open or recent project uses them.
3. **Given** built-in palettes and My library palettes, **Then** they can be switched off the same
   way.
4. **Given** a pack, **Then** it holds either palettes (colors and fabrics together) or blocks.

---

### User Story 4 - Library fabrics in projects stay light (Priority: P1)

Projects point at library fabrics instead of carrying their images, unless the user asks to include
them.

**Why this priority**: Embedding manufacturer images would bloat every project and pass on images
that may only be licensed for personal use.

**Independent Test**: Use 10 library fabrics in a quilt, save → the file holds their references and
average colors, not images; save again with "Include library fabric images" → the file holds their
256 px images; open the first file on a device without the library → the app offers to add it.

**Acceptance Scenarios**:

1. **Given** library fabrics in a project, **When** saved, **Then** each is stored by reference
   (library, pack, item `id@version`, image hashes, average color, size), not as an image.
2. **Given** the save option "Include library fabric images", **Then** their 256 px images are
   embedded too; it is unavailable for packs whose license forbids sharing.
3. **Given** the user's own fabrics, **Then** they are always embedded, at the save size chosen in
   settings (256 or 512 px).
4. **Given** a project that uses a library the device doesn't have, **When** opened, **Then** the app
   names the library, its author, and the packs the project uses, and offers to add it (connect the
   repository, or pick its `.rrqlib`), turning on just those packs. Declined, the fabrics show
   their embedded images or average colors, and the offer stays available from the project's
   Details tab.

---

### User Story 5 - Image sizes for screen, saving, and printing (Priority: P2)

Images come in sizes for each use, so screens and files stay light and printouts stay sharp.

**Acceptance Scenarios**:

1. **Given** a library, **Then** each fabric is available at 256 and 512 px (and 1024 px for
   printing when its builder opted in), never larger than its source.
2. **Given** the screen setting Light (256) or Standard (512, default), **Then** the app downloads
   and shows that size.
3. **Given** a printout with fabrics, **When** online and the library is connected, **Then** the
   1024 px images for just those fabrics (if the library has them) are fetched before the pages build; offline, the largest
   size on the device is used and the printout says so.
4. **Given** the setting **Fabric images**: *Show, with average-color stand-ins while loading*
   (default) / *Show, blank while loading* / *Average colors only*, **Then** the app follows it
   everywhere (Average colors only never downloads images).

---

### User Story 6 - Build and publish a library (Priority: P2)

A creator turns a folder of images into a library repository others can add, using a template.

**Acceptance Scenarios**:

1. **Given** the template repository, **When** a creator puts source images in `sources/` and runs
   the build tool, **Then** packs (one per folder/collection) are written with 256/512 px WebP
   images (1024 px too with `--print`), average colors, hashes, and the library index.
2. **Given** a push, **Then** a GitHub Action validates the library; **given** a version tag, **Then**
   a release is built with `.rrqlib` files for the whole library and for each pack, per image size.
3. **Given** a newer library format than the repository uses, **Then** a scheduled Action reports it
   (an issue) and `tools/upgrade` migrates the library and refreshes the tools.
4. **Given** the README, **Then** it explains building, committing, tagging, and hosting (public
   repository raw files, GitHub Pages, or any static host that allows cross-origin reads; release
   downloads for offline import).

### Edge Cases

- Image smaller than 256 px → kept at its own size; no larger sizes listed.
- Non-square image → square crop from the center by default; the user can turn cropping off.
- Image fails to decode or isn't PNG/JPEG/WebP → skipped and reported; the rest import.
- Safari (can't write WebP) → JPEG at the same sizes.
- Storage full while importing or turning on a pack → stop, keep what's done, report it.
- A pack turned off while a project uses its fabrics → the images the project needs stay until no
  open, recent, or draft project needs them.
- Same image in two packs or palettes → stored once (by hash).
- Hash mismatch on a downloaded image → image rejected; the fabric shows its average color and the
  problem is reported.
- Project fabric reference to a library item at a different version → the version dialog (spec 008)
  offers the library version or the project's.
- "Include library fabric images" with a personal-use pack → unavailable for that pack, with the
  reason shown.

## Requirements *(mandatory)*

### Functional Requirements

**Fabrics**

- **FR-001**: A fabric MUST carry its image(s), real-world `size` (true scale), `average` color,
  optional `manufacturer` and `sku`, and the usual notecard, author, license, and credits. Its
  `size` MAY be marked approximate.
- **FR-002**: Palettes (color collections) MUST hold fabrics as well as colors, in library documents,
  My library, and projects.
- **FR-003**: Fabric fills MUST tile the image at true scale in quilts, blocks, thumbnails, and
  printouts, following quilt and block rotation and flips.
- **FR-004**: Unset sizes MUST default to 8 in × 8 in (20.3 cm), marked approximate; a size set on a
  library or palette applies to its fabrics without their own.

**Images**

- **FR-010**: Images MUST be stored once per device, keyed by SHA-256, as binary (not base64) in
  IndexedDB; thumbnails and patterns are made on the device and cached in memory.
- **FR-011**: Standard sizes MUST be 256 and 512 px on the long side, WebP (quality about 80,
  metadata stripped), never enlarged; JPEG where the browser can't write WebP. 1024 px is optional
  (build tools' `--print`, off by default: it about triples a library's size) and for printing only.
- **FR-012**: Settings MUST include screen size (Light 256 / Standard 512), save size for the user's
  own fabrics (256 / 512), and **Fabric images** (stand-ins while loading / blank while loading /
  average colors only).
- **FR-013**: Downloaded images MUST be verified against their hash; allowed types PNG, JPEG, WebP
  (spec 002 FR-011).

**Import**

- **FR-020**: Users MUST be able to import several images at once (files, a folder, a zip) into a
  My library or project palette, with shared options and per-image edits.

**Projects**

- **FR-030**: Projects MUST store library fabrics by reference (library, pack, item `id@version`,
  image hashes, average color, size) and the user's own fabrics with their images embedded
  (constitution IV as amended).
- **FR-031**: Saving MUST offer "Include library fabric images" (256 px), unavailable for packs whose
  license forbids sharing.
- **FR-032**: Projects MUST record each library they use (id, name, author, location: repository URL
  or local file name, packs used); opening a project with an unknown library MUST offer to add it.

**Libraries**

- **FR-040**: A library MUST be indexed (`library.json`, spec 002 amendment) listing its packs with
  kind, item count, sizes and download size per image size, and each fabric's average color.
- **FR-041**: Users MUST be able to turn packs on and off per library (built-in, My library, packs,
  repositories); off packs are hidden and their images freed unless a project needs them.
- **FR-042**: Library licenses MAY be custom (an id plus its text), e.g. "All rights reserved, for
  personal use"; such licenses are kept on copies and edits like all rights reserved (spec 009).

**Tooling** (outside the app)

- **FR-050**: A pack builder MUST turn manufacturer downloads (`fabric_collections/`) into personal
  libraries: one pack per collection, author = designer, `manufacturer` = company, license
  "All rights reserved, for personal use", tags from the manufacturer's styles.
- **FR-051**: A template repository MUST provide the library layout, build/validate/upgrade tools
  (Python, uv), GitHub Actions (validate on push; release `.rrqlib` files on tag; scheduled format
  check), and a README covering hosting.

### Key Entities

- **Fabric**: image(s) by hash (embedded or referenced), size (true scale, maybe approximate),
  average color, manufacturer, SKU, notecard, author, license, source.
- **Image store**: device-wide, hash → binary image + type + dimensions.
- **Library index**: library header + packs (id, name, kind, items, sizes, bytes per size).
- **Pack**: a library document of palettes or blocks, switchable.
- **Library reference** (in projects): library id, name, author, location, packs used.

## Success Criteria *(mandatory)*

- **SC-001**: A project using 30 library fabrics saves under 100 KB more than the same project with
  solid colors (references only).
- **SC-002**: Turning on one 30-fabric palette downloads no more than about 2 MB at Standard size.
- **SC-003**: A palette of fabrics shows its stand-in colors immediately, before any image arrives.
- **SC-004**: Importing 50 photos takes under a minute on a typical laptop.
- **SC-005**: Prints of library fabrics use 1024 px images when available.

## Assumptions

- Repositories are public and reachable with cross-origin reads (spec 002); private libraries are
  local `.rrqlib` files.
- Manufacturer images are personal-use only; packs built from them are never bundled with the app
  or published publicly.
- *Assumed*: approximate scale shows as "≈" beside the size; packs are switched in Libraries;
  GitHub addresses default to the `main` branch.
- The template repository lives on the owner's GitHub account until an `rrquilts` organization
  exists; publishing it is the owner's step.
