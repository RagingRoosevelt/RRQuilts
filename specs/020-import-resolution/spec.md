# Feature Specification: Fabric Import Resolution

**Feature Branch**: `feat/more-layouts`

**Created**: 2026-10-16

**Status**: Draft (spec only; not implemented)

**Input**: Owner request 2026-10-16: "add a feature for the fabric image importer where you can pick
the resolution that it's scaled to". Today the importer (spec 014 FR-011, FR-020) always reduces
each image to 256 and 512 px on the long side.

## User Scenarios & Testing

### User Story 1 - Pick how large imported fabric images are kept (Priority: P1)

A quilter importing photos of their stash picks the resolution the images are scaled to: smaller to
save space on the device and in project files, larger for sharper close-ups and printouts.

**Why this priority**: 512 px is soft for large-scale prints and for zooming in on a quilt, and
more than needed for a quick sketch. The quilter knows which they want.

**Independent Test**: Import a 3000 px photo with Resolution set to 1024 px → the fabric keeps 256,
512 and 1024 px images; its details show 1024 px. Import the same photo at 256 px → it keeps only
256 px. Import a 400 px photo at 1024 px → it keeps 256 and 400 px (never enlarged).

**Acceptance Scenarios**:

1. **Given** the fabric import dialog (Libraries or a project), **Then** its shared options include
   **Resolution**: 256, 512 (default), 1024 or 2048 px on the long side, with a short note on what
   each suits (e.g. 256 "light, for sketching", 2048 "sharp prints, large files").
2. **Given** a resolution, **When** the user imports, **Then** each image keeps every standard size
   up to that resolution (256, 512, 1024, 2048), each capped at the image's own long side after
   cropping and never enlarged, so screens still have their 256 and 512 px images.
3. **Given** the dialog, **Then** it shows a rough total size of the import at the chosen
   resolution, updating when the resolution or the image list changes.
4. **Given** an image in the list, **Then** it shows the size it will be kept at when smaller than
   the chosen resolution (e.g. "400 px: smaller than 1024").
5. **Given** the user imports again later, **Then** the dialog starts at the resolution they last
   used.
6. **Given** a fabric imported at 1024 or 2048 px, **When** printing, **Then** its largest image is
   used (as library 1024 px images are, spec 014 SC-005); on screen the screen setting's size is
   used as today.

---

### User Story 2 - Project files carry the larger images when asked (Priority: P2)

A quilter who imported at high resolution can share a project that keeps it.

**Independent Test**: Import a fabric at 2048 px into a project; set the save size to Largest; save
and open the file on another device → the fabric has its 2048 px image.

**Acceptance Scenarios**:

1. **Given** settings, **Then** the save size for own fabrics (spec 014 FR-012) offers 256, 512
   (default) and **Largest** (each fabric's largest image).
2. **Given** a save size smaller than a fabric's largest image, **Then** the file embeds the
   largest size up to the save size, as today.

### Edge Cases

- Image smaller than 256 px: kept at its own size only, whatever the resolution (as today).
- Crop changed after picking a resolution: the sizes kept follow the cropped size.
- Device storage full or near its quota during a large import: the import stops with a message
  naming how many images were added; nothing half-written is left behind (spec 014 behaviour).
- Fabrics already imported are not rescaled when the setting changes; re-importing the photo is
  the way to change one's resolution.
- My library backups and packs carry whatever sizes the fabric has; pack readers that only know
  256/512/1024 ignore the 2048 px entry and use the largest they know.

## Requirements

- **FR-001**: The fabric import dialog MUST offer a shared **Resolution** option: 256, 512, 1024
  or 2048 px long side; default 512; the last choice remembered as an app setting
  (`importSize`, validated, falling back to 512).
- **FR-002**: Import MUST produce each standard size (256, 512, 1024, 2048) up to the chosen
  resolution, capped at the cropped source's long side, never enlarged, deduplicated (spec 014
  FR-011 sizes otherwise unchanged: WebP about quality 80, JPEG fallback).
- **FR-003**: A fabric's main image MUST be its largest kept size (as today).
- **FR-004**: The dialog MUST show an estimated total size for the import at the chosen
  resolution, and per image the size it will be kept at when below the chosen one.
- **FR-005**: The save-size setting MUST add **Largest**; 256 and 512 behave as today.
- **FR-006**: Printing MUST use an own fabric's largest image on the device.
- **FR-007**: The fabric image schema MUST allow 2048 px images (it lists 256, 512, 1024 today);
  format v6 is unreleased, so no version bump.

### Key Entities

- **Import resolution**: the largest long-side size an import keeps (256 / 512 / 1024 / 2048 px);
  an app setting, not stored on fabrics (each fabric lists the sizes it has).

## Success Criteria

- **SC-001**: A quilter can change the resolution and import in the same dialog, no extra steps.
- **SC-002**: An import at 256 px takes no more device storage per image than today's 256 px
  image alone.
- **SC-003**: The estimated size shown is within 50% of the stored size for typical fabric photos.
- **SC-004**: Printed fabrics imported at 1024 px or more look as sharp as library fabrics with
  1024 px images.

## Assumptions

- Screen display keeps using the screen setting (Light 256 / Standard 512); larger images are for
  printing, zoom, and files only. Using them on screen at high zoom is a separate feature.
- 2048 px is the ceiling: larger costs a lot of storage for little visible gain at quilt scale.
- The choice is shared by the whole import, not per image (the per-image list already has name,
  size and crop).
- Library build tools are out of scope; they keep their `--print` 1024 px option.
