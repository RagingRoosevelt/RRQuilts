# Feature Specification: Rearranging Quilts in a Project

**Feature Branch**: `TBD` (no feature branch yet)

**Created**: 2026-10-20

**Status**: Draft (spec only; not implemented)

**Input**: Owner, 2026-10-20: add a spec for rearranging quilts within a project workspace.

## Today

The project's Quilts tab lists quilts as cards in the saved order (`project.quilts`). They can be
moved by mouse drag (HTML drag and drop: no touch, no landing mark) or one place at a time with
**Move earlier** / **Move later** in each card's ⋮ menu. The order is saved with the project and is
the order of the quilt editor's quilt switcher, printing and exports.

## User Scenarios & Testing

### User Story 1 - Drag a quilt to a new place, on any device (Priority: P1)

A quilter with a dozen quilts drags one card to where it belongs, with a mouse or a finger.

**Acceptance Scenarios**:

1. **Given** the Quilts tab, **When** the quilter drags a quilt card (mouse) or long-presses then
   drags it (touch), **Then** the card follows the pointer, a line marks where it will land, and
   releasing puts it there.
2. **Given** a drag near the top or bottom of the page, **Then** the page scrolls so any place can be
   reached.
3. **Given** a drop, **Then** it's one undo step; Esc or dropping outside the list cancels with no
   change.
4. **Given** touch, **Then** a plain swipe still scrolls the page and a tap still opens the quilt
   (only a long press starts a drag).
5. **Given** a read-only project, **Then** nothing can be dragged.

### User Story 2 - Move by keyboard and to the ends (Priority: P2)

1. **Given** a quilt card's ⋮ menu, **Then** besides Move earlier / Move later it offers **Move to
   start** and **Move to end** (disabled where they do nothing).
2. **Given** keyboard focus on a card's drag grip, **When** the quilter presses the arrow keys,
   **Then** the card moves one place (as the strip list's grips do, spec 017), and screen readers
   hear its new position ("3 of 12").

### User Story 3 - Sort once (Priority: P3)

1. **Given** the Quilts tab, **Then** a **Sort** menu reorders all quilts once, by name (A to Z) or
   by last changed (newest first), as one undo step. The order stays manual afterwards (no standing
   sort).

### Edge Cases

- Filtering or searching quilts (if added later) turns dragging off, as on the Blocks tab, and Move
  earlier/later moves within the full list.
- A quilt open in another tab of this project's editor: reordering doesn't change which quilt is
  open.
- One quilt: no drag, all move items disabled.

## Requirements

- **FR-001**: Quilt cards MUST be reorderable by drag with mouse, pen and touch (long press), with a
  visible landing mark and auto-scroll.
- **FR-002**: Every reorder (drag, menu, keyboard, sort) MUST be one undo step and change only
  `project.quilts` order (no format change).
- **FR-003**: The ⋮ menu MUST offer Move to start / Move earlier / Move later / Move to end.
- **FR-004**: Drag grips MUST be keyboard operable with the new position announced.
- **FR-005**: A one-off Sort (name, last changed) MAY be offered; it MUST NOT become a saved
  setting.
- **FR-006**: The Blocks tab's own-block list SHOULD use the same drag behavior, so both tabs feel
  the same.

## Success Criteria

- **SC-001**: On a phone, a quilter moves the 12th quilt to first place in one gesture.
- **SC-002**: No accidental reorders while scrolling on touch (a swipe never starts a drag).

## Assumptions

- "Workspace" means the project's Quilts tab; no folders or groups of quilts (a separate spec if
  wanted).
- The strip list's drag (spec 017) is the model for touch, landing line and keyboard.
- Last changed comes from a per-quilt timestamp; if quilts don't have one yet, sort by name only.

## Checklist

- Add a Tests checklist check (TC-###) when implemented.
