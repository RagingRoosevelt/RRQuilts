# Feature Specification: Block Cards Without the Gray Backing

**Feature Branch**: `TBD` (target 0.7.3)

**Created**: 2026-10-29

**Status**: Draft (spec only; not implemented)

**Input**: Owner, 2026-10-29: "let's also add to 0.7.3 that blocks should not show the gray
background and should instead have a drop shadow matching the shape of the block".

## Today (0.7.2)

- Block cards draw the block's picture on a gray square (`.thumb { background: #9e9e9e }` in
  `SketchbookPage.vue` and `LibrariesPage.vue`). A triangle, diamond or hexagon block sits on a
  gray square that isn't part of the block, and a light block on gray reads as a different value.
- Quilt cards use the same `.thumb` style.

## User Scenarios & Testing

### User Story 1 - See the block's own shape (Priority: P2)

**Independent Test**: project Blocks tab with a square block, a hexagon block and a 60° diamond
block. No gray squares; each block casts a soft shadow that follows its outline (a hexagon's
shadow is a hexagon). Same in Libraries and in dark mode.

**Acceptance Scenarios**:

1. **Given** a block card (project Blocks tab: own blocks and library blocks; Libraries), **Then**
   there is no gray square behind the picture; the card's own background shows around it.
2. **Given** a block card, **Then** the block casts a soft drop shadow shaped like its outline:
   square for square blocks, the triangle, diamond or hexagon for shaped ones.
3. **Given** dark mode, **Then** the shadow still shows the edge (a darker, wider shadow, or a faint
   light glow if dark on dark doesn't read).
4. **Given** a block with empty pieces, **Then** they draw as they do now in the picture (the block
   still reads as a whole shape), so the shadow follows the full outline, not just colored pieces.
5. **Given** quilt cards, **Then** nothing changes (out of scope unless asked).

## Requirements

- **FR-001**: Block card pictures MUST have no gray backing.
- **FR-002**: Block card pictures MUST cast a drop shadow following the block's outline, for every
  block shape, in light and dark mode (CSS `filter: drop-shadow()` on the picture follows its
  transparent edges).
- **FR-003**: The block picture MUST be transparent outside the block's outline and opaque over its
  whole outline (empty pieces included), so the shadow takes the outline's shape.
- **FR-004**: The drag landing glow (spec 037), hover and focus marks MUST stay visible on the new
  cards.

## Edge Cases

- Fabric image fills with transparent parts: the shadow shows through; acceptable.
- Rectangular blocks (not square): the picture is centered in the square card space and the shadow
  follows the rectangle.
- Small pictures (the coloring count's 64 px thumbs, the tray): out of scope; only the card picture
  changes unless the gray shows there too.

## Out of scope

- Quilt cards, the quilt editor's tray, print previews.

## Checklist

- Add a Tests checklist check (TC-###) when implemented.
