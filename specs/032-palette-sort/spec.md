# Feature Specification: Sort a Palette's Swatches

**Feature Branch**: `0.7.0`

**Created**: 2026-10-20

**Status**: Implemented on `0.7.0` (2026-10-20). FR-006 has nothing to act on yet: swatches can't be dragged to reorder (when that comes, it switches the view back to Saved order first). Swap menus (colorway mapping, palette swap) keep the saved order.

**Input**: Owner, 2026-10-20: being able to sort palettes by hue, value, etc. on an individual,
remembered basis.

## Concepts

- **Swatch**: a color or fabric in a palette. A fabric sorts by its average color (spec 014).
- **Saved order**: the order the palette's author put its swatches in (the file's order). Sorting is
  a way of looking at a palette: it never changes the saved order or the file.
- **Per palette, remembered**: each palette keeps its own sort on this device, across sessions, and
  shows that way wherever its swatches appear.

## Clarifications

### Session 2026-10-20

- Q: 021 (rewrite the palette's order) or 032 (a view)? → A: 032, the view. Sorting is a display
  preference, so library and pack palettes can be sorted too, and a palette keeps its sort as
  swatches are added. 021 is superseded.
- Q: Where does the user see their sorts? → A: Settings lists every palette that has a sort set
  (name, its sort), each with a way to clear it.
- Q: When does a preference go away? → A: When its palette is removed: deleted from the project or
  My library, or its pack/library removed. (The app can't see other projects' palettes, so a
  project palette's preference goes when it's deleted in the open project.)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sort one palette by hue or value (Priority: P1)

A quilter has a 36-color palette in maker's order and wants to see it as a rainbow, or light to
dark, to pick neighbors.

**Independent Test**: pick Sort › Hue on one palette: its swatches show in hue order; the palette
next to it stays as it was; reload: still by hue.

**Acceptance Scenarios**:

1. **Given** a palette's menu (⋮, on palette cards in Libraries and the sketchbook Palettes tab, and in
   the palette preview), **Then** **Sort by** offers **Saved order** (default), **Hue**,
   **Value** (light to dark), **Saturation** (vivid to muted) and **Name**, plus **Reverse**.
2. **Given** a sort is picked, **Then** that palette's swatches show in it on its card, in its preview,
   in the quilt editor's color tray and in the block editor's color picker; other palettes are
   unaffected.
3. **Given** the app is closed and reopened (or the project reopened), **Then** each palette shows in
   the sort last picked for it.
4. **Given** a sorted palette, **Then** the file and the saved order are unchanged (saving, exporting
   or sharing the palette keeps the author's order).
5. **Given** Saved order, **Then** the palette shows exactly as stored.

---

### User Story 2 - Sensible grays and ties (Priority: P2)

**Acceptance Scenarios**:

1. **Given** Hue, **Then** grays, whites and blacks (near-zero saturation) come after the colored
   swatches, light to dark, instead of scattering by an unstable hue.
2. **Given** equal keys, **Then** ties go by value, then by saved order (stable).
3. **Given** a fabric with an average color, **Then** it sorts by that color among the plain colors.

---

### User Story 3 - Editing a sorted palette (Priority: P3)

**Acceptance Scenarios**:

1. **Given** a sorted palette in the editor that changes its order (drag to reorder), **When** the
   quilter starts dragging, **Then** the view switches back to Saved order first (a sorted view can't
   be reordered by hand), with a short note saying so.
2. **Given** a sorted palette, **When** a swatch is added, **Then** it takes its sorted place in the
   view and is saved at the end of the saved order.

### Edge Cases

- A palette with one swatch: sorting is offered but changes nothing.
- The same library palette added to two projects: one remembered sort (it's the same palette, by id).
- A project palette made from a library palette (spec 008 copies) has its own id, so its own sort.
- Storage blocked: sorting still works for the session; it just isn't remembered.

## Requirements *(mandatory)*

- **FR-001**: Each palette MUST offer Sort by: Saved order, Hue, Value, Saturation, Name, and Reverse.
- **FR-002**: The sort MUST be remembered per palette (by palette id) on the device, in the app
  settings (like collapsed sections), and applied wherever that palette's swatches are listed.
- **FR-003**: Sorting MUST NOT change the palette's saved order, its file, its content version or
  anything shared.
- **FR-004**: Hue order MUST put low-saturation swatches (grays) last, by value; ties by value, then
  saved order.
- **FR-005**: Fabrics MUST sort by their average color.
- **FR-006**: Reordering by hand MUST first return the view to Saved order.
- **FR-007**: Settings MUST list the palettes that have a sort (palette name and where it lives, the
  sort, Reverse) with Clear for each.
- **FR-008**: Removing a palette (deleting a project or My library palette, removing its pack or
  library) MUST remove its sort preference.

### Key Entities

- **Palette sort preference**: palette id → { key: saved | hue | value | saturation | name, reverse }.
  Settings field (device only; included in `.rrqconf` export like other view preferences).

## Success Criteria *(mandatory)*

- **SC-001**: A quilter can show a palette as a rainbow or light to dark in two clicks.
- **SC-002**: Reopening the app shows every palette in the order last picked for it.
- **SC-003**: No saved file changes because of sorting (byte-identical before and after).

## Assumptions

- Value is perceptual lightness (CIE L*), hue and saturation from the same color space (LCh), so
  "light to dark" matches what the eye sees better than HSV.
- Old settings without the field: every palette in Saved order.

## Out of Scope

- Saving a sorted order as the palette's new saved order (a later "Apply this order" action).
- Sorting the list of palettes themselves (only the swatches inside one).
