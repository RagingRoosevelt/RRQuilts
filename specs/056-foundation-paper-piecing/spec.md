# Feature Specification: Foundation Paper Piecing (FPP)

**Feature Branch**: `TBD` (no target version yet)

**Created**: 2026-11-10

**Status**: Draft (spec only; not implemented).

**Input**: Owner, 2026-11-10: "do we have a spec for FPP quilts / blocks?" There wasn't one; this
spec gathers what spec 001 (User Story 7, FR-093) asked for and what spec 010 left for later.

Related: spec 001 (FR-093 foundation patterns), spec 003 (FR-038: blocks store foundation sections,
already in the format), spec 007 (block editor), spec 010 (printing), specs 029 / 030 / 038
(Foundation paper piecing technique, the hint that suggests it).

## Today

- The format has `block.foundation.sections` (ordered patch ids, `needsReview`), kept in step with
  patch edits (`model/blocks/remap.ts`), but nothing makes or uses them.
- "Foundation paper piecing" is a technique tag; spec 030 hints at it for blocks with many small,
  angled pieces.

## Concepts

- **Foundation**: paper printed with the block's seam lines, mirrored; fabric is sewn on the
  unprinted side along the printed lines, in number order.
- **Section**: a part of the block pieced on one foundation, sewn in a sequence (1, 2, 3…), each new
  piece covering a straight line across what's sewn so far. Sections are then joined (A to B…).
- **Sewable**: a section is sewable when every next piece is joined by one straight seam to the pieces
  before it.

## User Scenarios & Testing

### User Story 1 - Split a block into sections and number it (Priority: P1)

**Independent Test**: Open a Storm at Sea block, choose **Foundation**, get sections A-C numbered
automatically; every section shows as sewable.

1. **Given** a block in the block editor, **When** the quilter opens the **Foundation** view, **Then**
   the app proposes sections and a sewing number for each patch, fewest sections first.
2. **Given** the sections, **Then** the quilter can regroup patches between sections and renumber by
   hand; each section shows whether it's sewable, and the join order of sections (A+B, then C).
3. **Given** a block that can't be foundation pieced (curves, set-in seams), **Then** the view says so
   and which patches stop it.
4. Sections are saved with the block (spec 003 FR-038) and marked for review when the drawing
   changes.

### User Story 2 - Print foundation patterns (Priority: P1)

1. **Given** a sectioned block, **When** printing, **Then** each section prints mirrored at true size
   with its seam lines, numbers (A1, A2…), a 1/4 in seam allowance around the section and its
   fabric per piece (line, grayscale or color fill).
2. **Given** the print options, **Then** the quilter picks mirror on or off, numbers on or off, fill
   style, and how many copies (per block in the quilt), packed onto pages (spec 010).
3. **Given** the pieces, **Then** a cutting list gives oversize fabric pieces for each number (the
   piece's bounding box plus a generous allowance).

### User Story 3 - FPP in a quilt (Priority: P2)

1. **Given** a quilt with foundation pieced blocks, **Then** its printout gives each block's
   foundations and counts, and yardage accounts for the oversize pieces.

### Edge Cases

- Sections with one patch are allowed (cut and sewn on as a piece).
- A block too big for the page: sections split across pages with match marks.
- Drawing changes after sectioning: changed sections are flagged, others kept.

## Requirements

- **FR-001**: The block editor MUST offer a Foundation view that proposes sections and sewing numbers
  and lets the quilter change them, showing which sections are sewable.
- **FR-002**: Sections and numbers MUST be saved with the block (existing format field).
- **FR-003**: Printing MUST produce mirrored foundation patterns at true size with numbers, seam
  allowance, fill style and page packing, plus oversize cutting sizes.
- **FR-004**: Blocks that can't be foundation pieced MUST be reported with the reason.

## Success Criteria

- **SC-001**: Printed foundations measure within 0.5 mm of the block's finished seams.
- **SC-002**: For starter blocks tagged Foundation paper piecing, the proposed sections are all
  sewable.

## Out of Scope

- Freezer-paper and other foundation methods; curved FPP.
