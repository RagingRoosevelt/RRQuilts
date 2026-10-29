# Feature Specification: Place Blocks Turned

**Feature Branch**: `TBD` (target 0.10.0)

**Created**: 2026-10-22

**Status**: Draft (spec only; not implemented)

**Input**: Owner, 2026-10-22: "when I click the rotate button after already having the rotate tool
active, the blocks in the block picker rotate accordingly" (described as wanted, not seen), and on
Flip: "I'd like flip to, but we're already using that subsequent flip to change orientation of the
flip tool".

## Today

- Set places a block unturned and unflipped (rotation 0, flip false); turning it takes Rotate taps
  on the quilt afterwards, one per space (or All / Alternate).
- Choosing Flip while it's active switches its direction (left↔right, top↕bottom). Choosing Rotate
  while it's active does nothing.

## Concepts

- **Placing turn**: a turn (0, 90, 180, 270°; a shaped block its own steps) that Set uses for the
  blocks it places, and that the block picker shows its blocks in. Session state, starting at 0.
- **Placing mirror** (open question below): the same for a flip.

## User Scenarios & Testing

### User Story 1 - Turn the blocks before placing them (Priority: P1)

1. **Given** Rotate is the active tool, **When** Rotate is chosen again, **Then** the placing turn
   steps by one turn (90°, or the shape's step), and every block in the picker (Blocks tab, sidebar
   and strip) is drawn turned by it.
2. **Given** a placing turn, **When** Set places a block (This, All, Alternate), **Then** it goes in
   turned by it, as if Rotate had been tapped on it that many times.
3. **Given** a placing turn, **Then** Rotate's button shows it (a small "90°" mark), its tooltip says
   "Rotate (next blocks go in turned 90°)", and a fourth step back to 0 clears it.
4. Rotate taps on the quilt still turn placed blocks as today.
5. The turn applies in the quilt's terms, like Flip (spec in 0.7.0): an On-Point space gets the turn
   as seen on screen.

### User Story 2 - Mirror the blocks before placing them (Priority: P2)

Same as Story 1 for a flip. How to choose it is open (see Open Questions).

### Edge Cases

- A block whose shape doesn't allow the turn (a triangle's steps are 120°): the picker shows it at
  the nearest allowed turn and Set places it so.
- Data quilts' Data blocks list: unaffected (they place by number); Other blocks follow it.
- Find, Eyedropper: unaffected.

## Open Questions

- **Flip**: its second click already switches direction. Options:
  - A. Flip's second click keeps switching direction, and the placing mirror is a separate small
    toggle in the picker's header ("Place mirrored"), with the direction Flip shows.
  - B. Flip's clicks cycle off → left↔right → top↕bottom → off, and the picker and Set follow the
    current one (Flip on the quilt uses it too).
  - C. Long-press (or right-click) Flip switches direction; a second click sets the placing mirror.

## Requirements

- **FR-001**: Editor state gains a placing turn (and mirror, per the answer above); Rotate chosen
  while active steps it.
- **FR-002**: The block picker draws blocks with the placing turn (and mirror).
- **FR-003**: Set applies them to every block it places, in the quilt's terms.
- **FR-004**: The Rotate (and Flip) buttons show the placing state; help describes it.
- **FR-005**: No file format change.

## Success Criteria

- **SC-001**: Filling a quilt with a block turned 90° takes one extra click, not one per space.
