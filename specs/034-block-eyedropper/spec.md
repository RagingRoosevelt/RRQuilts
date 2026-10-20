# Feature Specification: Block Eyedropper (copy a block's coloring)

**Feature Branch**: `TBD` (no feature branch yet)

**Created**: 2026-10-20

**Status**: Draft (spec only; not implemented)

**Input**: Owner, 2026-10-20: an eyedropper in block mode that picks up an entire block coloration,
which can be applied to other placements of the same block, while the eyedropper in color mode
behaves as the eyedropper does now.

## Concepts

- **Quilt editor tool groups** (spec 006): **block tools** (Set, Rotate, Flip, Erase, Find) and **color
  tools** (Paint, Spray, Swap, Eyedropper). Which group shows follows the Design sidebar's tab
  (Blocks or Colors).
- **Coloring**: the fills of every patch of one placed block (spec 003: a placement points at one of
  the quilt's colorings, copy-on-write when edited for "this" only).
- **Color eyedropper** (today, unchanged): tap a patch, its color or fabric becomes the selected
  paint.
- **Block eyedropper** (new): tap a placed block, its whole coloring is picked up; then tap other
  placements of **the same block** to give them that coloring.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Copy one block's coloring to others (Priority: P1)

A quilter has recolored one Ohio Star by hand and wants three other Ohio Stars to match it.

**Independent Test**: block tools › Eyedropper, tap the recolored star, tap another Ohio Star: it now
shows the same colors patch for patch; undo restores it.

**Acceptance Scenarios**:

1. **Given** the block tools, **Then** they include an **Eyedropper** (block), after Find.
2. **Given** the block Eyedropper, **When** the quilter taps a placed block, **Then** its coloring is
   picked up: the toolbar shows it (a small thumbnail of that block in that coloring, its name) and
   the tool turns into **Apply coloring** (a stamp icon), as the color Eyedropper hands its color to
   Paint.
3. **Given** a picked coloring, **When** the quilter taps a placement of the same block, **Then** that
   placement takes the coloring; its rotation and flip stay as they were.
4. **Given** the scope (This / All / Alternate), **Then** Apply coloring follows it among placements of
   the same block (All: every placement of that block in the quilt).
5. **Given** a placement of a different block, **When** tapped with Apply coloring, **Then** nothing
   changes and a short message says the coloring is for that other block (name), with the option to
   pick this block's coloring instead (tapping with the Eyedropper again).
6. **Given** any apply, **Then** it is one undo step.

---

### User Story 2 - The color eyedropper stays as it is (Priority: P1)

**Acceptance Scenarios**:

1. **Given** the color tools, **When** the quilter uses Eyedropper, **Then** it behaves exactly as now:
   tapping a patch selects its color or fabric for Paint.
2. **Given** the two eyedroppers, **Then** their tooltips say what each picks up ("Pick up a block's
   coloring" / "Pick up a color"), and they use distinct icons (colorize for color; colorize with a
   small block badge for block).

---

### User Story 3 - Edge cases of colorings (Priority: P2)

**Acceptance Scenarios**:

1. **Given** an empty block space or sashing / borders, **When** tapped with the block Eyedropper,
   **Then** a message says there's no block there (plain fills are picked with the color
   Eyedropper).
2. **Given** a quilt showing a non-primary colorway, **When** applying a coloring, **Then** it is
   applied to the primary colorway's placements (the colorway's mapping then recolors them as usual),
   or a message explains, consistent with how Paint behaves in a non-primary colorway.
3. **Given** a library block with several stored colorings (e.g. themed palette colorings), **Then** the
   picked coloring is the placement's own (including any per-placement edits), not the block's
   default.
4. **Given** shaped blocks (spec 026), **Then** the same rules apply (same block, same shape).

### Edge Cases

- Picking up a coloring then editing the source block's coloring: the picked coloring is a snapshot
  from the moment it was picked; re-pick to take the edits.
- Applying where the target already has that coloring: no change, no undo step.
- Switching tool groups keeps each group's own pick (the picked color and the picked coloring are
  separate).

## Requirements *(mandatory)*

- **FR-001**: The quilt editor's block tools MUST include a block Eyedropper that picks up a placed
  block's coloring (all patch fills, threads included).
- **FR-002**: After picking, the tool MUST become Apply coloring, applying that coloring to tapped
  placements of the same block, following the scope; rotation and flip are kept.
- **FR-003**: Applying to a different block MUST change nothing and say why.
- **FR-004**: Each apply MUST be one undo step and reuse the quilt's coloring storage (placements
  sharing one coloring where they're identical, copy-on-write as today).
- **FR-005**: The color tools' Eyedropper MUST keep today's behavior.

### Key Entities

- **Picked coloring** (editor session state, not saved): block id + coloring (fills, threads).

## Success Criteria *(mandatory)*

- **SC-001**: Matching four placements to one hand-recolored block takes at most five taps (pick +
  four applies, or pick + one apply with scope All).
- **SC-002**: No change to how the color Eyedropper works or to saved files.

## Assumptions

- The quilt's colorings are already shared between placements and copied on edit, so applying a
  coloring points the placement at the picked coloring (or an identical existing one).
- A keyboard shortcut: Alt-click with Apply coloring picks again (as Alt does for color pickers),
  if the editor already uses Alt for the color Eyedropper; otherwise none.

## Out of Scope

- Applying a coloring to a different block (mapping colors by position between unlike blocks).
- Saving picked colorings as named block colorings in the library.
