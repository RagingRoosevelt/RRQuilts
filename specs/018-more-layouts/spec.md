# Feature Specification: More Layouts and Pieced Borders

**Feature Branch**: `feat/more-layouts`

**Created**: 2026-10-16

**Status**: Implemented on `feat/more-layouts` (awaiting owner review)

**Input**: Owner request 2026-10-16: implement Variable Point, One Patch (no Photo Patchwork yet),
Baby Blocks, Variable Blocks, and the pieced border styles. Decisions given up front: diamonds and
patches take colors and fabrics only (no blocks until block shapes exist); One Patch's custom
shape comes later; zigzag-edged layouts offer the edge choice with Trimmed straight by default;
pieced borders take colors and fabrics only; project format v6.

> Builds on spec 016 (layout engine, edge finishes, wizard cards), spec 017 (strip styles, whose
> pattern geometry the borders reuse), spec 001 FR-022, FR-023, FR-025, FR-031. Defers spec 001
> FR-025's custom shape, FR-032's per-side styles, FR-033's blocks in borders, and Photo Patchwork.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Variable Point (Priority: P1)

A quilter makes diamonds measured through the block: a width and a height, not necessarily equal.

**Independent Test**: Layout → Variable Point, 4 across, 3 down, width 8″, height 12″ → tall
diamonds with blocks-between diamonds, setting pieces at the edge, finished size shown; diamonds
paint like patches.

**Acceptance Scenarios**:

1. **Given** Variable Point, **Then** it takes blocks across and down, diamond width and height
   (through the diamond, point to point), sashing, corner style, and edge finish, as On-Point does.
2. **Given** width = height, **Then** the diamonds are On-Point squares measured corner to corner.
3. **Given** a diamond or setting piece, **Then** it takes colors and fabrics only; Set says blocks
   come with diamond-shaped blocks.

---

### User Story 2 - One Patch (Priority: P1)

A quilter covers the quilt with one repeated shape and colors each patch.

**Independent Test**: Layout → One Patch, Hexagons, 8 across, 10 down, 3″ → a hexagon quilt
trimmed straight; switch Edge to No fill → whole hexagons with a zigzag edge.

**Acceptance Scenarios**:

1. **Given** One Patch, **Then** the shapes are Squares, Rectangles, Bricks (rows offset half a
   patch), Half-square triangles, Equilateral triangles, 60° diamonds, Hexagons, Tumblers,
   Clamshells, and Octagons and squares.
2. **Given** a shape, **Then** the inspector asks for patches across and down and the patch size
   (width and height for rectangles, bricks, half-square triangles, and tumblers; one size for the
   others), and shows the finished quilt size.
3. **Given** a shape whose rows don't end straight, **Then** Edge offers Trimmed straight (default:
   partial patches at the edge) or No fill (whole patches; bound along the edge).
4. **Given** patches, **Then** they take colors and fabrics; Alternate colors every other patch
   (or every other kind, for octagons and squares).

---

### User Story 3 - Baby Blocks and Variable Blocks (Priority: P1)

A quilter makes tumbling blocks: cubes of three diamonds.

**Independent Test**: Layout → Baby Blocks, 6 across, 5 down, 3″ diamond side → cubes trimmed
straight; Alternate paints all tops, then all lefts, then all rights in three taps.

**Acceptance Scenarios**:

1. **Given** Baby Blocks, **Then** it takes cubes across and down and the diamond side (60°
   diamonds).
2. **Given** Variable Blocks, **Then** it takes cubes across and down, the cube width, the top's
   height, and the sides' height, so the diamonds can be squashed or stretched.
3. **Given** either, **Then** Edge offers Trimmed straight (default) or No fill, and the three
   faces of the cubes are three alternate classes.

---

### User Story 4 - Pieced border styles (Priority: P1)

A quilter picks a pieced border style and colors its pieces.

**Independent Test**: Borders → add a border → Points Out, 3″ wide → triangles point outward
along all four sides with corner squares; paint points and background with Alternate.

**Acceptance Scenarios**:

1. **Given** a border, **Then** every style in spec 001 FR-031 is drawn as itself (not as a plain
   strip): Corner Blocks, Blocks, Half Drop Blocks, Spaced Squares, Diamonds, Half Drop Diamonds,
   Double Diamonds, Half Drop Double Diamonds, Big & Little Diamonds, Half Drop Big & Little
   Diamonds, Points Out, Points In, Big & Little Points Out, Big & Little Points In, Tile Squares,
   Tile On Point, Tile On Point Corners, Blocks Aligned Inside, Half Drop Aligned, alongside the
   existing Mitered, Long Vertical, and Long Horizontal.
2. **Given** a pieced style, **Then** the border takes the count of units along the top and bottom
   and along the sides (aligned styles follow the layout's columns and rows), and its corners are
   squares (split on point for Tile On Point Corners).
3. **Given** a pieced border, **Then** its pieces take colors and fabrics only (no blocks yet), and
   Alternate colors foreground and background apart.
4. **Given** printing, **Then** border pieces cut as rotary shapes or templates, like strip
   patterns.

---

### User Story 5 - Start any of these from the wizard (Priority: P2)

**Acceptance Scenarios**:

1. **Given** Start a quilt, **Then** cards include Variable Point, One Patch, Baby Blocks, and
   Variable Blocks, each with its picture; One Patch has a step for choosing its shape.

---

### Edge Cases

- Counts of 1, very small and very large sizes still draw; sizes are at least ¼″ / 0.5 cm.
- Switching between On-Point and Variable Point keeps counts, sashing, corner, and edge; content
  doesn't carry over (blocks there can't go into Variable Point diamonds).
- Switching a border to another pieced style keeps the colors of pieces with the same role
  (foreground stays foreground), as strips do.
- Files from older versions with the placeholder styles open with each style's defaults.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Variable Point, One Patch, Baby Blocks, and Variable Blocks MUST be presets of the
  shared layout engine (spec 016), with their spaces as patches that take colors and fabrics only.
- **FR-002**: Variable Point MUST behave as On-Point (counts, between blocks, sashing, corners, edge
  finishes FR-029e) with diamonds W wide and H high through the block.
- **FR-003**: One Patch MUST offer the shapes in US2 with counts and sizes, and Trimmed or No fill
  edges where rows don't end straight.
- **FR-004**: Baby Blocks and Variable Blocks MUST take counts and sizes per US3, with Trimmed or
  No fill edges and three alternate classes.
- **FR-005**: Every border style in spec 001 FR-031 MUST be generated, pieced styles reusing the
  strip pattern geometry (spec 017) along each side with square corners, counts along the sides,
  colors and fabrics only.
- **FR-006**: The Layout tab and the wizard MUST offer the new styles with their settings and
  pictures; the Borders tab MUST offer counts for pieced styles.
- **FR-007**: Project format v6 MUST store the new layouts, with a v5 → v6 migration giving the
  placeholder styles their defaults; the published schema regenerated.
- **FR-008**: Space ids MUST stay position-based (slot-id contract gains the new grammar).

### Key Entities

- **Variable Point layout**: counts, diamond width and height, sashing, corner style, edge finish.
- **One Patch layout**: shape, counts, size (width, height), edge (trim or none).
- **Tumbling blocks layout**: counts, width, top height, side height (Baby Blocks: from one side
  length), edge.
- **Border**: style, side widths, counts along (existing fields).

## Success Criteria *(mandatory)*

- **SC-001**: Every new layout and border style covers its area with no gaps or overlaps, with
  unique ids, for counts 1 to 12.
- **SC-002**: A quilter builds a 60-hexagon One Patch quilt and prints its cutting list in under
  two minutes.
- **SC-003**: Older files with placeholder styles open without errors.

## Assumptions

- Defaults: Variable Point 3 × 3, 12″ wide, 16″ high, edge Floating 1″; One Patch Squares 8 × 8,
  4″; Baby Blocks 6 × 6, 3″ side; Variable Blocks 6 × 6, 6″ wide, 3″ top, 4″ sides; tessellation
  edges Trimmed. cm projects use 2.5 × (rounded).
- Border corner squares are the border's width on both sides (left/right width × top/bottom width).
- "Blocks" border styles are rectangles painted like pieced strips until blocks in borders exist.
- Default counts give each pattern its classic proportions for the border's width: square blocks,
  tiles, and diamonds; 90° points; spaced squares as long as their gaps; square big shapes among big
  and little ones; square diamonds in double rows.
- Variable Point stretches On-Point vertically: the float is the same on every side, but sashing
  between diamonds is thinner across the steep sides than the set width says (it is the On-Point
  sash stretched).
- Hexagons can't be colored in two alternating colors, so Alternate colors every other row.
- Unpainted patches don't print, as with every other space.
