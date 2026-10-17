# Feature Specification: Quilt Colorways

**Feature Branch**: `feat/more-layouts`

**Created**: 2026-10-16

**Status**: Implemented on `feat/more-layouts` (awaiting owner review)

**Input**: Owner request 2026-10-16: other colors for a quilt, picked like a block's colorings (the
count badge and its menu, a section like the block editor's Colorings) on the Details, Design, and
Print tabs. Later the same day: called **colorways** (as a pattern comes in several fabric lines,
and not to mix them up with library blocks' color variants). A colorway is a palette swap of the
primary colorway; the primary is painted as usual, the others are edited as a mapping.

## User Scenarios & Testing

### User Story 1 - Try a quilt in other colors (Priority: P1)

**Independent Test**: Paint a quilt's border red. Design › Colorways › Save as new colorway; in
the Colors tab, Red → Teal → the border is teal. Pick Colorway 1 → red again, and the Colors tab
shows the palettes. Delete Colorway 1 → the quilt's colors are teal. Print follows the shown
colorway.

**Acceptance Scenarios**:

1. **Given** a quilt, **Then** it has one or more named colorways, as a block has colorings: the
   first is the primary colorway, the quilt's own colors ("Colorway 1" until renamed). The one
   shown is saved with the quilt.
2. **Given** the primary colorway is shown, **Then** the Design tab's Colors are the usual palettes
   and painting works as it always has.
3. **Given** another colorway is shown, **Then** the Design tab's Colors list each color (or
   fabric) of the primary colorway with a menu of what it becomes in this colorway (the project's
   colors and fabrics and its palettes'). Painting on the quilt says to use that list or show the
   primary colorway.
4. **Given** the design changes (blocks placed, the primary recolored), **Then** every colorway
   shows the change with its mapping applied.
5. **Given** Design › Colorways, **Then** it lists every colorway as thumbnails to pick, with Rename
   and Delete under each (Delete off while only one is left) and Save as new colorway (a copy of
   the one shown), like a block's Colorings.
6. **Given** the primary colorway is deleted, **Then** the next one becomes the primary (its mapping
   painted in, its name kept) and the others keep how they look.
7. **Given** a quilt card (project Quilts tab) with several colorways, **Then** it has the count
   badge, whose menu only picks the colorway shown (as a block card's). The card's menu has **New
   colorway from palette swap…**: the same dialog as a block's palette swap (pick a palette, each
   color shown maps to its nearest there, change any, before and after pictures in the quilt's
   shape, half the dialog's width each, at most 500px tall); the new colorway copies the one shown
   with those colors swapped, named for the palette. The Details and Print tabs show the quilt as
   shown, its colorway's name, and the same badge.
8. **Given** printing or a thumbnail, **Then** the shown colorway's colors are used (pictures,
   yardage, cutting, templates).

## Requirements

- **FR-001**: Quilts MUST store `primaryName`, `colorways` (id, name, swaps `{from: fill key, to:
  Fill}`) and `shownColorway` (optional; none = the primary), format v6 (unreleased, no bump).
- **FR-002**: Drawing, thumbnails, and printing MUST apply the shown colorway's swaps.
- **FR-003**: A colorway's mapping MUST record a swap per primary color (mapping it back to itself
  removes it) and leave the quilt's colorings alone.
- **FR-004**: Library colors and fabrics a colorway swaps in MUST stay in the project (`syncDraft`).
- **FR-005**: Deleting the primary colorway MUST paint the next one's swaps into the quilt's
  colorings (overriding placed blocks' own fills where swapped) and rebase the other colorways'
  swaps so they look the same (two colors that became one keep the first one's swap).

## Assumptions

- A swap is by color or fabric (all pieces with it), not per piece: one colorway can't differ
  from the primary in a single piece.
- Changing the shown variant is an edit (undoable, saved).
