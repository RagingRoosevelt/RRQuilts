# Feature Specification: Rearranging Quilts in a Project

**Feature Branch**: `TBD` (target 0.7.3)

**Created**: 2026-10-20

**Status**: Draft (spec only; not implemented)

**Input**: Owner, 2026-10-20: add a spec for rearranging quilts within a project workspace.
Owner, 2026-10-29: "it looks like it's also partially implmented for blocks, but the glow is
missing. let's put it in 0.7.3 and add fixing the glow for blocks. that will also let uus drop the
move earlier/later menu items from blocks" (User Story 4). Then: "when dragging, the actual
quilt/block is reduced in transparency and a virtual drag representation is shown following the
mouse (sylized a bit to look like it's moving / being dragged)" (User Story 1, scenarios 6 and 7). Then: "add a bugfix to that item where if you drag a
quilt/block too far past the end, letting go doesn't drop it where the glow suggests it will go"
(Bug below, User Story 1 scenario 9). Then: "it looks like we already have the virtual copy that's
moving but it's the one with opacity and the actual item that stays in place until the drop is
completed stays at full opacity, so we're maybe jsut inverting that opacity assignment" (Today, and
scenarios 6 and 7).

## Today

The project's Quilts tab lists quilts as cards in the saved order (`project.quilts`). They can be
moved by mouse drag (HTML drag and drop, no touch) or one place at a time with **Move earlier** /
**Move later** in each card's ⋮ menu. While a quilt is dragged, the facing edges of the two cards
either side of where it will land glow (`glow-right` / `glow-left`, `quiltGap` in
`SketchbookPage.vue`).

While dragging, the copy under the pointer is the browser's own drag image: see-through (the
browser sets that, the page can't) and plain. The card left in place stays at full opacity. So
today's look is the reverse of the one wanted: the card in place should fade and the moving copy
should be solid. Fading the card in place is a class while `dragFrom === i`. A solid, styled moving
copy needs the app's own copy (FR-007), since the browser's drag image can't be made opaque.

The Blocks tab's own blocks drag the same way (mouse only, off while filtering) but show no glow,
so there is no telling where a block will land. Their ⋮ menu also has Move earlier / Move later. The order is saved with the project and is
the order of the quilt editor's quilt switcher, printing and exports.

## Bug: letting go past the end doesn't drop

Dragging a quilt past the last card and letting go in the empty space after it leaves the quilt
where it was, though the glow showed it landing at the end. Cause: the glow comes from the last
card the pointer was over (`quiltDropAt`, set on `dragover`), but the move happens only on a
`drop` event over a card, and none fires on empty space; `dragend` then clears the glow. Blocks
have the same gap (`drop('blocks', i)` only on cards).

## User Scenarios & Testing

### User Story 1 - Drag a quilt to a new place, on any device (Priority: P1)

A quilter with a dozen quilts drags one card to where it belongs, with a mouse or a finger.

**Acceptance Scenarios**:

1. **Given** the Quilts tab, **When** the quilter drags a quilt card (mouse) or long-presses then
   drags it (touch), **Then** the card follows the pointer, the glow marks where it will land (as it
   does now for the mouse), and releasing puts it there.
2. **Given** a drag near the top or bottom of the page, **Then** the page scrolls so any place can be
   reached.
3. **Given** a drop, **Then** it's one undo step; Esc cancels with no change (letting go
   elsewhere follows scenario 9).
4. **Given** touch, **Then** a plain swipe still scrolls the page and a tap still opens the quilt
   (only a long press starts a drag).
5. **Given** a read-only project, **Then** nothing can be dragged.
6. **Given** a drag (mouse, pen or finger), **Then** the card being moved stays in its place, faded
   (about 40% opacity), so it's clear which one is moving and where it came from.
7. **Given** a drag, **Then** a solid (fully opaque) copy of the card's picture follows the pointer,
   in place of the browser's see-through drag image, styled as picked up:
   a little larger (about 105%), tilted a few degrees, with a deeper drop shadow (spec 048's shadow,
   lifted). It tilts slightly toward the direction of movement and settles straight when the
   pointer stops. On drop it slides into the landing place; on cancel it slides back to the faded
   card, then the card returns to full opacity.
9. **Given** a glow showing where the card will land, **When** the quilter lets go anywhere (over a
   card, past the last card, in a gap, below the list), **Then** the card lands exactly where the
   glow showed. No glow, no move: only Esc, or dragging back over the card's own place, cancels.
   Past the last card the glow shows the end of the list; before the first, its start.
8. **Given** the quilter's system asks for reduced motion, **Then** the copy follows without tilt or
   slide (still larger, with the shadow).

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

### User Story 4 - Blocks drag like quilts (Priority: P1)

**Acceptance Scenarios**:

1. **Given** the Blocks tab, **When** an own block is dragged, **Then** the facing edges of the cards
   either side of where it will land glow, and the faded card and picked-up copy show, exactly as
   for quilts (User Story 1).
2. **Given** blocks, **Then** they drag with a finger (long press) as well as a mouse, with the same
   auto-scroll, cancel and undo as quilts (User Story 1).
3. **Given** a block's ⋮ menu, **Then** **Move earlier** and **Move later** are gone (dragging
   covers them, and the keyboard grip of User Story 2 covers keyboard users).
4. **Given** a filter or search on the Blocks tab, **Then** blocks don't drag (as now).

### Edge Cases

- Filtering or searching quilts (if added later) turns dragging off, as on the Blocks tab, and Move
  earlier/later moves within the full list.
- A quilt open in another tab of this project's editor: reordering doesn't change which quilt is
  open.
- One quilt: no drag, all move items disabled.

## Requirements

- **FR-001**: Quilt cards MUST be reorderable by drag with mouse, pen and touch (long press), with the
  landing glow they have now and auto-scroll.
- **FR-008**: Letting go MUST move the card to the place the glow shows, wherever the pointer is
  (fixes the drop lost past the end of the list); with no glow showing, nothing moves.
- **FR-007**: While dragging, the moved card MUST stay in place faded, and a styled copy of its
  picture (larger, tilted, lifted shadow) MUST follow the pointer, honoring reduced motion. The
  browser's own drag image isn't styleable and doesn't work for touch, so the drag is built on
  pointer events (as the strip list's, spec 017), not HTML drag and drop.
- **FR-002**: Every reorder (drag, menu, keyboard, sort) MUST be one undo step and change only
  `project.quilts` order (no format change).
- **FR-003**: The ⋮ menu MUST offer Move to start / Move earlier / Move later / Move to end.
- **FR-004**: Drag grips MUST be keyboard operable with the new position announced.
- **FR-005**: A one-off Sort (name, last changed) MAY be offered; it MUST NOT become a saved
  setting.
- **FR-006**: The Blocks tab's own-block list MUST use the same drag behavior as quilts (landing
  glow, touch, auto-scroll, keyboard grip), and its ⋮ menu MUST drop Move earlier / Move later.
  Quilts keep theirs (FR-003).

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
