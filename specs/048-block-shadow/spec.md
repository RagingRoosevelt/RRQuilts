# Feature Specification: Block and Quilt Cards Without the Gray Backing

**Feature Branch**: `feat/card-shadows` (target 0.7.4; moved from 0.7.3)

**Created**: 2026-10-29

**Status**: Implemented (check TC-228). `.thumb` in `SketchbookPage.vue` and `LibrariesPage.vue`
has no backing; its picture takes `filter: var(--card-shadow)` (`css/app.css`). The drag copy
(spec 037) casts `--card-shadow-lifted`. Thumbnails were already transparent outside the outline
and opaque inside it (empty pieces are hatched), so nothing changed in the drawing.

**Input**: Owner, 2026-10-29: "let's also add to 0.7.3 that blocks should not show the gray
background and should instead have a drop shadow matching the shape of the block". Then: "yeah,
let's implement that background & shadow update for quilts too" (User Story 2). Owner,
2026-10-30, on the first look: "let's go with slighly more shadow radius/spread", then "shadow
should be accent color in dark mode" (scenario 3).

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
3. **Given** dark mode, **Then** the shadow is a glow in the accent color (the app's primary color,
   the system accent when Settings › "Use the system accent color" is on).
4. **Given** a block with empty pieces, **Then** they draw as they do now in the picture (the block
   still reads as a whole shape), so the shadow follows the full outline, not just colored pieces.

### User Story 2 - Quilts too (Priority: P2)

**Independent Test**: project Quilts tab with a rectangle quilt, a round or shaped outline quilt
(a target outline such as a garment) and an on-point quilt with a sawtooth edge. No gray squares;
each casts a shadow following its own outline.

1. **Given** a quilt card (project Quilts tab), **Then** there is no gray square behind its picture,
   and the quilt casts the same soft drop shadow, following its outline (rectangle, curved or
   shaped outline, pieced or uneven edges).
2. **Given** a quilt with empty spaces or pieces, **Then** they draw as they do now, so the shadow
   follows the whole quilt.
3. **Given** dark mode, **Then** the same as blocks (User Story 1, scenario 3).

## Requirements

- **FR-001**: Block and quilt card pictures MUST have no gray backing.
- **FR-002**: Block and quilt card pictures MUST cast a drop shadow following the outline, for every
  block shape and quilt outline, in light and dark mode (CSS `filter: drop-shadow()` on the picture follows its
  transparent edges).
- **FR-003**: The picture MUST be transparent outside the block's or quilt's outline and opaque over
  its whole outline (empty pieces and spaces included), so the shadow takes the outline's shape.
- **FR-004**: Only the picture changes. The drag landing glow (spec 037), hover and focus marks
  belong to the card, not the block, and stay as they are.

## Edge Cases

- Fabric image fills with transparent parts: the shadow shows through; acceptable.
- A quilt much longer than wide: the picture is centered in the card space and the shadow follows
  it, as for rectangular blocks.
- Rectangular blocks (not square): the picture is centered in the square card space and the shadow
  follows the rectangle.
- Small pictures (the coloring count's 64 px thumbs, the tray): out of scope; only the card picture
  changes unless the gray shows there too.

## Out of scope

- The quilt editor's tray, the quilt switcher, print previews.

## Checklist

- Add a Tests checklist check (TC-###) when implemented.
