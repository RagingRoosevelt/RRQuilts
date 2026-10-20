# Feature Specification: Diamond Point with 45° and 60° Diamonds

**Feature Branch**: `TBD` (no feature branch yet)

**Created**: 2026-10-20

**Status**: Draft (spec only; not implemented)

**Input**: Owner, 2026-10-20: Diamond Point should support both 60-degree and 45-degree diamonds.

## Concepts

- **Diamond Point** (spec 026): the block twin of Variable Point (spec 018). Diamonds set on point in
  rows, framed by setting pieces, each diamond a block space. Today it is fixed at **60° diamonds**
  (height = width × √3) and takes `diamond60` blocks.
- **Diamond angle**: the diamond's narrow (tip) angle. 60° diamonds are the six-pointed-star and
  tumbling-block diamond; **45° diamonds** are the eight-pointed-star (Lone Star, LeMoyne Star)
  diamond. On point, a 45° diamond is width × (1 + √2) tall (≈ 2.414 × its width).
- **Block shape** (spec 026): a block's outline, fixed when it's created: `triangle`, `diamond60`,
  `hexagon` today. This feature adds **`diamond45`**.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A Diamond Point quilt of 45° diamonds (Priority: P1)

A quilter wants rows of Lone Star diamonds, each one pieced, to set eight of them into a star later or
just to show them in a diamond-point setting.

**Independent Test**: New quilt › Diamond Point › diamond angle 45°: the quilt shows 45° diamonds on
point with setting pieces around them; a 45° diamond block sets into every diamond.

**Acceptance Scenarios**:

1. **Given** the wizard's Diamond Point card or the Layout tab of a Diamond Point quilt, **Then** a
   **Diamond angle** choice offers **60°** and **45°** (60° by default, as today), each with a small
   picture of its diamond.
2. **Given** 45°, **Then** the diamonds are width × (1 + √2) tall and the one size field (leg, width
   or height, as for 60°) keeps the other two in step.
3. **Given** a 45° Diamond Point quilt, **Then** its block spaces take `diamond45` blocks only: Set
   refuses others (spec 026 shape matching), and the block sidebar's "Compatible with this layout"
   switch (spec 035 C) shows only 45° diamond blocks.
4. **Given** Rotate on a 45° diamond space, **Then** it turns in the steps that fit (a half turn) and
   flips as 60° diamonds do.
5. **Given** a 60° Diamond Point quilt, **Then** nothing about it changes: its size, blocks and
   colorings stay as they were.

---

### User Story 2 - Changing the angle of a quilt (Priority: P2)

**Acceptance Scenarios**:

1. **Given** a Diamond Point quilt with blocks set, **When** the quilter changes the angle, **Then**
   the layout rebuilds at the new angle, blocks of the other shape leave their spaces (as when a
   layout change makes spaces refuse a block), and a message says how many were removed; one undo
   step brings them back.
2. **Given** an empty Diamond Point quilt (or only colored setting pieces), **Then** changing the
   angle keeps the setting piece colors where the pieces still exist.

---

### User Story 3 - 45° diamond blocks to start from (Priority: P2)

**Acceptance Scenarios**:

1. **Given** the block editor's New block › Diamond, **Then** it offers 60° and 45° diamonds.
2. **Given** the built-in library, **Then** it has a few 45° diamond starters (filed by block type like
   the shaped starters, spec 026): at least a plain diamond, a diamond split in two along its long
   axis, a strip-pieced diamond (as in a Lone Star), and a four-patch of small diamonds.
3. **Given** the Libraries and sidebar Shape filter, **Then** 45° diamond is one of the shapes, with its
   picture.

### Edge Cases

- Variable Point (the patch twin) already takes any width and height; it gets no angle choice. A
  Variable Point quilt converted to Diamond Point picks the angle closest to its proportions.
- Baby Blocks, Tumbling and the triangle/hexagon layouts stay 60° only.
- A 45° diamond block placed in a quilt is sized from the space like 60° ones (`fitShape`).
- Cut sizes and templates (spec 010) handle 45° diamonds as they handle 60° ones: rotary cuts from
  strips at 45°, templates otherwise.

## Requirements *(mandatory)*

- **FR-001**: Diamond Point MUST have a diamond angle of 60° or 45°; 60° when absent.
- **FR-002**: The layout's diamonds MUST be width × √3 tall at 60° and width × (1 + √2) tall at 45°.
- **FR-003**: A new block shape `diamond45` MUST exist (outline, size fields, turns, fit, snap and
  derive, as for `diamond60`), and Diamond Point's block spaces MUST take the shape of their angle.
- **FR-004**: Saved projects MUST keep the angle; files without it MUST open as 60°. Adding the field
  and the shape is a project (and library, for 45° blocks) format version bump with a migration
  (CLAUDE.md: format bumps go into the library template too).
- **FR-005**: The wizard card, Layout tab, block sidebar, Shape filters and the block editor's New
  block MUST offer the 45° diamond where they offer the 60° one.
- **FR-006**: Tests checklist checks and Layout gallery entries (G###, newest first) MUST cover a 45°
  Diamond Point quilt with blocks.

### Key Entities

- **Diamond Point layout**: adds `angle: 60 | 45`.
- **Block shape**: adds `diamond45`.

## Success Criteria *(mandatory)*

- **SC-001**: A quilter can make a 45° Diamond Point quilt and set a 45° diamond block in every space
  in under a minute from New quilt.
- **SC-002**: Every 60° Diamond Point quilt saved before this feature opens and draws exactly as
  before (picture check unchanged).

## Assumptions

- 45° and 60° are the two angles quilters use for pieced diamonds; other angles stay Variable Point
  (patches only).
- The diamond's long axis runs up and down, as for 60° Diamond Point today.

## Out of Scope

- Eight-pointed star medallion layouts (diamonds radiating from a center) and Lone Star layouts.
- Any other diamond angle for blocks.
