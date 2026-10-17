# Feature Specification: Palette Downscale and Re-adding Images

**Feature Branch**: `feat/more-layouts`

**Created**: 2026-10-16

**Status**: Draft (spec only; not implemented)

**Input**: Owner, 2026-10-16: a palette's menu in Libraries offers downscaling its fabric images to a
lower resolution (unless already at 256 px). To get the resolution back, the quilter re-adds their
photos; fabrics whose original filename matches are replaced in place, keeping their ids, so quilts
and blocks using them update. Filenames and crops are kept only for My library palettes and dropped
when a pack is made.

Related: spec 014 (fabric images), spec 020 (import resolution: up to 2048 px).

## User Scenarios & Testing

### User Story 1 - Downscale a palette to free space (Priority: P1)

**Independent Test**: A My library palette of 20 fabrics imported at 512 px; menu › Downscale
images › 256 px → each fabric keeps only its 256 px image, device storage drops, quilts using them
still show them.

**Acceptance Scenarios**:

1. **Given** a palette in Libraries (My library or an installed pack) with any fabric image above
   256 px, **Then** its menu has **Downscale images…**; otherwise the item is hidden.
2. **Given** the dialog, **Then** it offers each standard size below the palette's current largest
   (e.g. 512 and 256 when at 1024), shows the space freed, and says how to get the images back: for
   My library, re-add the original photos (US2); for a pack, it downloads again while the library
   is connected (switch the screen size or print).
3. **Given** a confirmed downscale, **Then** every fabric in the palette keeps only its sizes up to
   the chosen one, its main image becomes the largest left, and the larger images are deleted from
   the device unless another library, palette or open project still uses that exact image.
4. **Given** a pack palette downscaled, **Then** the app doesn't download the larger images again
   on its own for screen display; printing still fetches 1024 px for just the fabrics printed (spec
   014), as for any pack.
5. **Given** a My library palette downscaled, **Then** linked project copies (spec 011) take the
   change through the usual sync.

### User Story 2 - Re-add photos to restore a My library palette (Priority: P1)

**Independent Test**: Downscale a My library palette to 256 px. Import the same photo folder into
it at 1024 px → the dialog marks 20 images "replaces <name>"; import → still 20 fabrics, same ids,
names, sizes and crops, now with 1024 px images; a quilt using them shows the sharper images.

**Acceptance Scenarios**:

1. **Given** an image imported into a My library palette, **Then** the fabric remembers where it
   came from: the file's name (no folder path), the original file's hash, and the crop box.
2. **Given** an import into a My library palette, **When** an image matches a fabric there (same
   file hash, else same filename and only one fabric with it), **Then** the dialog lists it as
   "replaces <fabric name>", with the matched fabric's crop, and a checkbox to import it as a new
   fabric instead.
3. **Given** a replacement, **Then** the fabric keeps its id, name, real size, SKU and credits and
   gets the new images and average color; everything using it updates, with nothing to remap.
4. **Given** a palette that is not a My library palette (a project palette, a pack), **Then** no
   filename is kept and imports never replace.
5. **Given** a fabric imported before this feature (no filename kept), **Then** it is never matched.

### Edge Cases

- Two fabrics in the palette with the same filename (and no hash match): neither is matched; the
  image imports as new, and the dialog says why.
- A matched file that is now smaller than the fabric's current largest image: it still replaces
  (the quilter chose it), and the dialog shows the new size so it can be unticked.
- A replacement with different proportions: the remembered crop is scaled into the new image; if
  it no longer fits, the centred square is used and the item is flagged for review.
- Downscaling while a print is fetching images: the print uses what's left.

## Requirements

- **FR-001**: Palettes in Libraries with a fabric image above 256 px MUST offer **Downscale
  images…**, to any standard size below the current largest, with the space freed shown first.
- **FR-002**: Downscaling MUST drop each fabric's sizes above the chosen one, make the largest left
  its main image, and delete the dropped images from the device only when nothing else uses them.
- **FR-003**: Fabrics imported into My library palettes MUST record their source: file name, file
  hash, crop box (in the original image's pixels).
- **FR-004**: The source (file name, hash and crop alike) MUST be removed whenever a fabric leaves My library: making or exporting a
  pack, saving or copying into a project, sharing a palette file (`.rrqplt`). My library backups
  (`kind: "personal"`) keep it.
- **FR-005**: Imports into a My library palette MUST match images to fabrics by file hash, else by
  a unique filename, and replace matched fabrics in place (same id; new images and average color),
  each match shown and individually declinable before importing.
- **FR-006**: Schema: Fabric gets an optional `source` record (file name, hash, crop); format v6
  is unreleased, so no version bump.

## Success Criteria

- **SC-001**: Downscaling a 512 px palette to 256 px frees at least half of its images' storage.
- **SC-002**: Re-adding the original folder restores every fabric of a downscaled palette in one
  import, with no quilt or block needing changes.
- **SC-003**: No pack, project file or palette file made from My library contains a filename or
  crop.

## Assumptions

- Filenames can be private (names of people, places); that's why they stay in My library and the
  user's own backups only.
- Downscaling a pack palette affects only this device's copy; the pack's index still lists the
  larger sizes, so they can come back.
- Downscale is per palette, not per fabric; a fabric shared by two My library palettes (same
  image) loses the larger image only if neither still needs it.
