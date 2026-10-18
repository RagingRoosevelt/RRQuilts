# Feature Specification: Automatic Colorways

**Feature Branch**: `TBD` (no feature branch yet)

**Created**: 2026-10-18

**Status**: Draft (spec only; not implemented)

**Input**: Owner, 2026-10-18: a quilt can make a new colorway from an existing one (primary or not)
and a chosen palette, matching each of the source colorway's colors to its closest in the palette.
The palette swap gets two modes, **Manual** (today's one-time swap) and **Automatic**. An automatic
colorway keeps its link: whenever it is drawn, it takes the source colorway's colors and shows the
best match for each in the palette. Deleting the source colorway leaves the automatic one with the
picks it has at that moment. The quilt design's Colors list for a colorway gets the same
Manual / Automatic switch. Available from a quilt's menu in the project and from the Design tab's
Colorways section, next to Save as new colorway. Name of the feature and button undecided.

Related: spec 019 (quilt colorways: palette swap dialog US1 acceptance 7, Colors list for a colorway
acceptance 3, deleting the primary FR-005), spec 011 (palettes), spec 014 (fabrics match by average
color).

## Clarifications

### Session 2026-10-18

- Defaults taken, owner may revisit:
  - **Names**: the menu item and button are **New colorway from palette…**; the modes are **Manual**
    and **Automatic**. "Automatic colorway" in help text.
  - **Overrides**: in Automatic mode the picks are shown but not editable. Changing one pick means
    switching to Manual (which keeps the current picks, then edits as today). Per-color overrides
    are out of scope for now.
  - **Chains**: an automatic colorway's source can be any other colorway, automatic ones included,
    but never itself or anything that comes from it (no loops).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Make an automatic colorway (Priority: P1)

A quilter has a finished quilt in its primary colorway and wants to see it in a fabric line's
palette, and keep seeing it that way as the design changes.

**Independent Test**: On a quilt with primary colors red, cream and navy, open **New colorway from
palette…**, choose Automatic, source = primary, palette = a blues palette. The new colorway shows
each color as its nearest blue. Recolor a primary piece from red to green: the automatic colorway
shows that piece as the nearest blue to green, with no other step.

**Acceptance Scenarios**:

1. **Given** the dialog, **Then** it offers **Manual** (today's palette swap, a one-time copy) and
   **Automatic**, plus a **Source colorway** choice (any colorway of the quilt; default the one
   shown).
2. **Given** Automatic, **When** a palette is picked, **Then** each source color shows its nearest
   color or fabric in that palette, with before and after pictures, and the picks are not editable
   (switch to Manual to edit them).
3. **Given** OK, **Then** a new colorway, named for the palette, is added and shown.
4. **Given** the dialog opened from the Design tab's Colorways section, **Then** it is the same
   dialog, reached by a **New colorway from palette…** button next to **Save as new colorway**.
5. **Given** a quilt card's menu, **Then** the existing palette swap item is this dialog under the
   same name.

### User Story 2 - The link stays live (Priority: P1)

**Acceptance Scenarios**:

1. **Given** an automatic colorway, **When** its source colorway's colors change (the primary
   recolored, blocks placed, a source swap changed), **Then** it shows the new nearest matches
   wherever it is drawn: editor, thumbnails, Details, Print (pictures, yardage, cutting).
2. **Given** colors or fabrics are added to, removed from or edited in the palette, **Then** the
   matches follow the palette as it is now.
3. **Given** a chain (A automatic from B, B automatic from the primary), **Then** a change to the
   primary flows through B to A.

### User Story 3 - Switch modes in the Colors list (Priority: P2)

**Acceptance Scenarios**:

1. **Given** a colorway shown in the Design tab, **Then** its Colors list (spec 019) has a
   Manual / Automatic switch.
2. **Given** Automatic is turned on for a manual colorway, **Then** the user picks a source
   colorway and a palette (same choices as the dialog), and the list shows the computed picks,
   read-only.
3. **Given** Manual is turned on for an automatic colorway, **Then** it keeps the picks it shows at
   that moment and they become editable as today; the link is gone.
4. **Given** the primary colorway is shown, **Then** no switch is shown (the primary is the
   quilt's own colors).
5. Each mode switch is one undoable change.

### User Story 4 - When the source or palette goes away (Priority: P2)

**Acceptance Scenarios**:

1. **Given** an automatic colorway, **When** its source colorway is deleted, **Then** it becomes a
   manual colorway with the picks it showed just before, and looks the same.
2. **Given** the source is the primary and the primary is deleted (spec 019 FR-005: the next
   colorway becomes the primary), **Then** the automatic colorway is set to its current picks first,
   so it looks the same afterward. If the automatic colorway is itself the one that becomes the
   primary, its current picks are what get painted in.
3. **Given** the palette is deleted, turned off (pack switched off), or removed from the project,
   **Then** the automatic colorway keeps its current picks as a manual colorway and a short notice
   says so.
4. **Given** the palette becomes empty, **Then** the same as 3.

## Requirements *(mandatory)*

- **FR-001**: The palette swap dialog for quilt colorways MUST offer Manual and Automatic modes and
  a source colorway choice (default: the one shown). Manual behaves as spec 019 does today, from the
  chosen source.
- **FR-002**: An automatic colorway MUST store its source colorway and its palette, not a fixed list
  of picks. Its picks MUST be computed from the source's current colors and the palette's current
  colors and fabrics every time it is drawn, printed or thumbnailed.
- **FR-003**: Matching MUST use the same nearest-color rule as the manual palette swap (fabrics by
  their average color). Several source colors may match the same palette color.
- **FR-004**: An automatic colorway's picks MUST be read-only; switching to Manual MUST keep the
  current picks.
- **FR-005**: Deleting an automatic colorway's source, or losing its palette (deleted, switched off,
  removed, emptied), MUST turn it into a manual colorway holding its current picks, so nothing looks
  different. The primary-delete rule (spec 019 FR-005) MUST settle automatic colorways first.
- **FR-006**: A source MUST NOT be the colorway itself or any colorway that depends on it.
- **FR-007**: Library colors and fabrics an automatic colorway currently picks MUST stay embedded in
  the project (spec 019 FR-004), so the file opens with the same look offline and on other devices.
- **FR-008**: The Design tab's Colorways section MUST have a **New colorway from palette…** button
  next to **Save as new colorway**; the quilt card's menu item uses the same name.
- **FR-009**: The Colors list of a non-primary colorway MUST have a Manual / Automatic switch
  (User Story 3).
- **FR-010**: Storing the source and palette is a project format change: version bump with a
  migration (spec 003), recorded in the format contract.

## Success Criteria *(mandatory)*

- **SC-001**: A quilter makes an automatic colorway from a palette in under 30 seconds.
- **SC-002**: After any recolor of the source, the automatic colorway's picture matches what a fresh
  Manual swap with the same palette would produce, in 100% of checked cases.
- **SC-003**: Deleting a source colorway or its palette changes no pixel of the automatic colorway's
  picture.
- **SC-004**: A project with automatic colorways saved and reopened (also offline, on another
  device) shows the same pictures.

## Edge Cases

- Two source colors closest to the same palette color: both become it (the quilt may lose contrast;
  that is the quilter's call, visible in the after picture).
- A tie in distance: the palette's earlier item wins, so results are stable.
- A palette with only fabrics, or only colors: matching uses what's there.
- A library palette that updates (pack version change): matches follow the new version.
- Source colorway renamed: no effect.
- A read-only project: modes and picks shown, not changeable.

## Out of Scope

- Per-color overrides inside an automatic colorway.
- Matching rules other than nearest color (e.g. by value order or hue rotation).
- Automatic block colorings (block palette swap stays manual).
