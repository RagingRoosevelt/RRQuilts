# Feature Specification: Quilt Color Variants

**Feature Branch**: `feat/more-layouts`

**Created**: 2026-10-16

**Status**: Implemented on `feat/more-layouts` (awaiting owner review)

**Input**: Owner request 2026-10-16: color variants (palette swaps) for quilts, picked like a block's
colorings (the count badge and its menu, and a picker like the block editor's Colorings), on the
Details, Design, and Print tabs. Decisions: a variant is a palette swap; it's made by painting while
it's shown; the shown variant is saved with the quilt.

## User Scenarios & Testing

### User Story 1 - Try a quilt in other colors (Priority: P1)

**Independent Test**: Paint a quilt's border red. Design › Color variants › Save as new variant;
paint the border orange → the whole quilt shows orange where it had red. Pick Variant 1 → red
again; pick Variant 2 → orange. Delete Variant 1 → the quilt's colors are orange. Print follows the
shown variant.

**Acceptance Scenarios**:

1. **Given** a quilt, **Then** it has one or more named color variants, as a block has colorings: the
   first is the quilt's own colors ("Variant 1" until renamed). The one shown is saved with the
   quilt.
2. **Given** a variant after the first is shown, **When** the quilter paints (or sprays or swaps) a
   piece, **Then** that piece's color or fabric (as the first variant has it) is swapped for the new
   one across the whole quilt, in that variant only. Pieces with no color can't be swapped (a
   message says to show the first variant to paint them). In the first variant, painting works as
   it always has.
3. **Given** the quilt changes (blocks placed, recolored), **Then** every variant shows the change
   with its swaps applied.
4. **Given** Design › Color variants, **Then** it lists every variant as thumbnails to pick, with
   Rename and Delete under each (Delete off while only one is left) and Save as new variant (a copy
   of the one shown), like a block's Colorings.
5. **Given** the first variant is deleted, **Then** the next one becomes the quilt's own colors (its
   swaps painted in, its name kept) and the others keep how they look.
6. **Given** a quilt card (project Quilts tab) with several variants, **Then** it has the count
   badge, whose menu only picks the variant shown (as a block card's). The card's menu has **New
   color variant from palette swap…**: the same dialog as a block's palette swap (pick a palette,
   each color shown maps to its nearest there, change any, before and after pictures); the new
   variant copies the one shown with those colors swapped, named for the palette. The Details and
   Print tabs show the quilt as shown, its variant's name, and the same badge.
7. **Given** printing or a thumbnail, **Then** the shown variant's colors are used (pictures,
   yardage, cutting, templates).

## Requirements

- **FR-001**: Quilts MUST store `colorsName` (the first variant's name), `variants` (id, name, swaps
  `{from: fill key, to: Fill}`) and `shownVariant` (optional; none = the first), format v6
  (unreleased, no bump).
- **FR-002**: Drawing, thumbnails, and printing MUST apply the shown variant's swaps.
- **FR-003**: Painting with a later variant shown MUST record a swap (swapping back to the first
  variant's color removes it) and leave the quilt's colorings alone.
- **FR-004**: Library colors and fabrics a variant swaps in MUST stay in the project (`syncDraft`).
- **FR-005**: Deleting the first variant MUST paint the next one's swaps into the quilt's colorings
  (overriding placed blocks' own fills where swapped) and rebase the other variants' swaps so they
  look the same (two colors that became one keep the first one's swap).

## Assumptions

- A swap is by color or fabric (all pieces with it), not per piece.
- Changing the shown variant is an edit (undoable, saved).
