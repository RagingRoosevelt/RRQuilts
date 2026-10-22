# Feature Specification: Palette Sorting

**Feature Branch**: `feat/more-layouts`

**Created**: 2026-10-16

**Status**: Superseded by spec 032 (owner, 2026-10-20: sorting is a remembered display preference per palette, not a rewrite of its order)

**Input**: Owner request 2026-10-16: "sorting a palette by hue or value (or hue or value of average
color)". Palettes hold colors and fabrics (spec 011, spec 014); a fabric's color is its average
color.

## User Scenarios & Testing

### User Story 1 - Sort a palette by hue or value (Priority: P1)

A quilter with a palette built up over time (imported fabrics, picked colors) sorts it so like
colors sit together (hue) or it runs light to dark (value), which is how quilters lay out a stash.

**Why this priority**: Imported palettes come in file order; finding "the dark blue" or planning
contrast means scanning the whole palette.

**Independent Test**: In a project palette with red, a navy fabric, yellow and white, pick Sort ›
By value → white, yellow, red, navy (light to dark). Sort › By hue → red, yellow, navy, with white
at the end. Undo → the old order.

**Acceptance Scenarios**:

1. **Given** one of the user's own palettes (a project palette or a My library palette), **Then**
   its menu has **Sort** with **By hue** and **By value**.
2. **Given** By hue, **Then** colors and fabrics run around the color wheel from red (red, orange,
   yellow, green, blue, purple), and near-grays (low saturation: whites, grays, blacks) go after
   them, light to dark.
3. **Given** By value, **Then** they run light to dark by perceived lightness (so yellow is lighter
   than blue of the same strength).
4. **Given** a fabric, **Then** it sorts by its average color, mixed in with the plain colors (not
   in a separate group).
5. **Given** a sort, **Then** the palette's order changes for good (saved with the project or
   library, shown everywhere the palette is: palette tray, swap menus, Libraries), and is one undo
   step in a project.
6. **Given** a sort applied twice, **Then** the second changes nothing (stable: ties keep their
   current order).
7. **Given** a library or pack palette (read-only), **Then** Sort is not offered; copying it to
   My library first allows it (as other edits, spec 011).

### Edge Cases

- Empty palette or one item: Sort does nothing (menu items disabled).
- Two items with the same hue and value: they keep their order relative to each other.
- A palette linked to a My library palette (spec 011 v4 `source`): sorting is an ordinary change
  and syncs like any other edit (order differences go through the existing sync).
- Very dark or very light colors have unreliable hue: they count as near-grays in By hue.

## Requirements

- **FR-001**: Own palettes (project and My library) MUST offer Sort › By hue and Sort › By value;
  read-only palettes MUST NOT.
- **FR-002**: By value MUST order light to dark by perceived lightness (CIE L*), ties stable.
- **FR-003**: By hue MUST order chromatic items by hue angle starting at red, then near-grays
  (chroma below a small threshold, or very light/dark) light to dark, ties stable.
- **FR-004**: Fabrics MUST sort by their average color, interleaved with colors.
- **FR-005**: Sorting MUST reorder the palette's stored items (one undoable edit in projects); no
  sort mode is stored.

### Key Entities

- **Palette order**: the existing order of a palette's colors and fabrics; sorting rewrites it.
  Colors and fabrics are stored in separate lists today, so an interleaved order needs one combined
  order for the palette (a format note for the plan; v6 is unreleased, so no version bump).

## Success Criteria

- **SC-001**: Sorting a palette of 200 items takes one menu pick and finishes with no visible wait.
- **SC-002**: In a hue sort, a quilter can point to where each color family (reds, blues, neutrals)
  starts; in a value sort, the first item is the lightest and the last the darkest.

## Assumptions

- A one-off sort, not a live sort mode: items added later go at the end until the next sort. Hand
  reordering (drag) is a separate feature.
- Hue starts at red, as the color wheel quilters use; no direction choice or reverse option.
- Sorting a fabric by its print's dominant color (rather than the average) is out of scope.
