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
paint the border orange → the whole quilt shows orange where it had red. Pick Original colors →
red again; pick the variant → orange. Print follows the shown variant.

**Acceptance Scenarios**:

1. **Given** a quilt, **Then** it has its own colors plus any number of named color variants; the
   one shown is saved with the quilt.
2. **Given** a variant is shown, **When** the quilter paints (or sprays or swaps) a piece, **Then**
   that piece's original color or fabric is swapped for the new one across the whole quilt, in that
   variant only; the quilt's own colors don't change. Pieces with no color can't be swapped (a
   message says to show the original colors to paint them).
3. **Given** the quilt changes (blocks placed, recolored), **Then** every variant shows the change
   with its swaps applied.
4. **Given** Design › Color variants, **Then** it lists the original colors and each variant as
   thumbnails to pick, with Rename and Delete under each variant and Save as new variant (a copy of
   the one shown), like a block's Colorings.
5. **Given** a quilt card (project Quilts tab) with variants, **Then** it has the count badge; its
   menu picks a variant and makes, renames, or deletes one. The Details and Print tabs show the
   quilt as shown, its variant's name, and the same badge and menu.
6. **Given** printing or a thumbnail, **Then** the shown variant's colors are used (pictures,
   yardage, cutting, templates).

## Requirements

- **FR-001**: Quilts MUST store `variants` (id, name, swaps `{from: fill key, to: Fill}`) and
  `shownVariant` (optional; none = the quilt's own colors), format v6 (unreleased, no bump).
- **FR-002**: Drawing, thumbnails, and printing MUST apply the shown variant's swaps.
- **FR-003**: Painting with a variant shown MUST record a swap (swapping back to the original color
  removes it) and leave the quilt's colorings alone.
- **FR-004**: Library colors and fabrics a variant swaps in MUST stay in the project (`syncDraft`).

## Assumptions

- A swap is by color or fabric (all pieces with it), not per piece.
- Changing the shown variant is an edit (undoable, saved).
