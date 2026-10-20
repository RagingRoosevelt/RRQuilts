# Feature Specification: Shaped Blocks (Triangles, 60° Diamonds, Hexagons)

**Feature Branch**: `feat/shaped-blocks`

**Created**: 2026-10-18

**Status**: In progress

**Input**: Owner, 2026-10-18: work on spec 001 FR-060a (block shapes), for the straight shapes first:
equilateral triangle, 60° diamond, hexagon. Baby Blocks becomes the block layout for 60° diamonds;
hexagon and triangle blocks too. The wizard tells block layouts from patch layouts. Any space that
takes a block also takes a patch (not the reverse). Decisions in Clarifications.

> Builds on spec 001 (FR-029a, FR-029c, FR-029e, FR-060a), spec 007 (block editor), spec 016 (layout
> engine), spec 018 (Variable Point, One Patch, Baby Blocks, Variable Blocks), spec 003 (format).
> Clamshell and spool (curved outlines, FR-029b) come later.

## Clarifications

### Session 2026-10-18 (owner)

- Shapes this round: equilateral **triangle**, **60° diamond**, regular **hexagon**. Square and
  rectangle stay the default.
- A block's shape is chosen when it is made and never changes (Edit a copy to start over).
- Size: a choice between **leg** (side length), **width** and **height**; the chosen one is typed, the
  other two are shown, calculated (like Variable Point's size picker).
- The block editor's grid for these shapes is triangle-based (60°), not square.
- Layout pairs, one for patches and one for blocks:
  - **Variable Patch** (was Variable Blocks): patches only. **Baby Blocks**: blocks (60° diamonds).
  - **Variable Point**: patches only. **Diamond Point**: its block version, fixed at 60° diamonds.
  - **One Patch**: patches only. **Shaped Blocks**: its block version, with Triangles, Diamonds or
    Hexagons.
- Every block space MUST also take a plain patch (a color or fabric over the whole space); a patch
  space does not take blocks.
- The wizard shows **Blocks** or **Patches** layouts, switched by a toggle. Horizontal, On-Point and
  Strips show in both.
- **Flow angle**: block and patch layouts made of triangles, hexagons or diamonds get a slider from 0°
  (default) to 360° that turns the direction the grid runs; the quilt's edge trims it.
- Starter blocks: log cabins for each shape and the traditional blocks from the owner's pictures
  (Madison Block, Hexagon Web I and II, Wonder of Egypt, Hexagon Whirligig, Arrowheads III, Round and
  Round triangle/diamond/hexagon, Symmetrical diamond/hexagon, Opposite Hexagon, Symmetrical and
  Round and Round Parallelogram adapted to 60° diamonds, Eisenhower Star, Hexagon Star, Tea Box,
  Block Puzzle, Cosmos, Interlocked Star, Ozark Diamonds). Not Stop Sign (appliqué). Added later:
  Kentucky, Columbia, Old Glory (stars), Hexagon Beauty (mosaic) and Hexagon Orange Peel (curves).
- Starter shaped blocks are filed by type of block, not by shape: Mosaics (Madison Block, Hexagon
  Web I and II, Hexagon Beauty, Hexagon Whirligig, Wonder of Egypt, Arrowheads III), Stars (Eisenhower Star, Hexagon
  Star, Tea Box, Kentucky, Columbia, Old Glory, Block Puzzle, Cosmos, Ozark Diamonds, Interlocked
  Star), Strips › Log Cabin (the Round and Round, Symmetrical and Opposite blocks, named "60-Degree"
  as in the book), Curves (Hexagon Orange Peel).
- (2026-10-20) 60° triangle blocks drawn for RRQuilts, mostly on a triangle lattice so they sew in
  straight rows: Basics (Four Triangles, Triangle Pinwheel), N-Patch › Nine-patch (Triangle
  Nine-Patch), Mosaics (Trip Around the Triangle, Thousand Pyramids, Sierpinski Triangle, Hexagon
  Triangle), Stars (Triangle Star, Three Kites), Strips › Strips (Rail Triangle, Flying Geese
  Triangle, Arrowhead Strips), Medallions (Twisted Triangle), Images › Plants (Christmas Tree). All
  but Three Kites (a set-in seam) and Triangle Pinwheel (a partial seam) sew with straight seams.
  Off the lattice: Basics (Sunburst Triangle), Images (Sailboat), Images › Animals (Peacock Fan),
  Medallions (Framed Triangle), Strips › Strips (Slanted Rails), Curves (Rising Sun Triangle, a curved
  seam), Stars (Spike Star, a set-in seam).
- (2026-10-20) A **Fractals** category (top level; RagingRoosevelt's designs, CC BY-SA 4.0, built in
  for now, maybe a pack later): Sierpinski Carpet, Vicsek Cross, Cantor Bars, Hilbert Curve (square,
  each row's runs as strips), Sierpinski Triangle (moved from Mosaics; each gap one piece), Sierpinski
  Diamond, Koch Snowflake (hexagon: the big first triangle one piece, a wing on each side of five triangles: the medium first-step point and four light triangles each with a small spike, sewn log cabin style). Built-in blocks may carry their own
  author and license.
- The quilt editor's block sidebar has two filters: **Fits layout** (each block layout with its
  picture; Shaped Blocks once per shape) and **Shape** (square, triangle, 60° diamond, hexagon, each
  with its outline). Both cleared by default; together they show blocks passing both.

### Defaults taken (owner may revisit)

- Each shape's upright position in the block editor: triangle point up; diamond standing on a point
  (long axis up and down); hexagon pointy-top (as One Patch's hexagons).
- Printouts give shaped pieces as templates; rotary-cut instructions with a 60° ruler come later.
- The flow angle slider moves in 1° steps and settles on multiples of 15° when dragged close to one.
- Variable Point and Diamond Point have no flow angle: their diamonds are framed by setting pieces
  along a straight edge, which a turned grid would break.
- Existing Baby Blocks quilts (patches) open as Variable Patch with the same sizes, so nothing
  painted is lost.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Draw a shaped block (Priority: P1)

A quilter draws a hexagon log cabin.

**Independent Test**: New block › Hexagon, leg 3″ → the editor shows a pointy-top hexagon 3″ a side
(width and height shown as calculated) over a triangle grid; drawing seams on the grid splits it into
patches only inside the hexagon.

**Acceptance Scenarios**:

1. **Given** New block, **Then** the shape is picked: Square or rectangle, Triangle, 60° diamond,
   Hexagon, each with a small picture.
2. **Given** a shaped block, **Then** its size is set by leg, width or height (radio); the other two
   are shown, calculated.
3. **Given** the editor, **Then** the outline is the shape; the snap grid is triangle-based, set by
   divisions per side; snapping to the outline's corners and edges works as for squares.
4. **Given** seams, **Then** patches are found inside the shape only; seams outside it are flagged as
   unconnected, as with squares.
5. **Given** an existing shaped block, **Then** its shape can't be changed; size can (same shape).

### User Story 2 - Set shaped blocks in a quilt (Priority: P1)

**Independent Test**: Layout › Shaped Blocks › Hexagons, 5 × 6, 3″; Set a hexagon block → it fills
the hexagon spaces; a square block or a triangle block is refused with a hint; Rotate turns it 60°.

**Acceptance Scenarios**:

1. **Given** a space of a shape, **Then** only blocks of that shape can be set there; others get a
   message naming the shape the space takes.
2. **Given** a placed shaped block, **Then** Rotate steps by its shape's turn (triangle 120°, diamond
   180°, hexagon 60°) and Flip mirrors it left to right; the outline always stays the space's.
3. **Given** a space at a trimmed edge, **Then** the block is placed whole and trimmed by the edge.
4. **Given** printing, **Then** shaped blocks give pieces and templates like square blocks.

### User Story 3 - Block and patch layouts (Priority: P1)

**Acceptance Scenarios**:

1. **Given** the wizard, **Then** a Blocks / Patches toggle chooses which layouts are shown. Blocks:
   Horizontal, On-Point, Diamond Point, Strips, Baby Blocks, Shaped Blocks. Patches: Horizontal,
   On-Point, Variable Point, Strips, Variable Patch, One Patch.
2. **Given** Baby Blocks, **Then** its three diamonds per cube are block spaces (three alternate
   classes as before); **Given** Variable Patch, **Then** it is the former Variable Blocks.
3. **Given** Diamond Point, **Then** it is Variable Point with 60° diamonds (one size: leg, width or
   height) whose diamonds are block spaces; setting pieces stay patches.
4. **Given** Shaped Blocks, **Then** it offers Triangles, Diamonds and Hexagons as One Patch does,
   with block spaces, counts, size and edge (Trimmed straight or No fill).
5. **Given** the Layout tab, **Then** the same layouts and settings are available.

### User Story 4 - Any block space takes a patch (Priority: P1)

**Acceptance Scenarios**:

1. **Given** an empty block space in any layout, **When** it is painted, **Then** the whole space takes
   that color or fabric (scope This / All / Alternate as usual).
2. **Given** a painted block space, **When** a block is set there, **Then** the block replaces the
   plain fill; Erase empties the space.

### User Story 5 - Flow angle (Priority: P2)

**Acceptance Scenarios**:

1. **Given** One Patch with triangles, diamonds or hexagons, Shaped Blocks, Baby Blocks or Variable
   Patch, **Then** a Flow angle slider (0–360°, default 0°) turns the grid; with Trimmed straight the
   quilt stays the same size and the turned grid is trimmed to it.
2. **Given** a turned grid, **Then** blocks and patches stay in their spaces' positions (ids don't
   change) and placed blocks turn with their spaces.

### User Story 6 - Starter shaped blocks (Priority: P2)

**Acceptance Scenarios**:

1. **Given** the built-in library, **Then** it has the starter blocks listed in Clarifications, each in
   its shape, with a coloring that shows the design.

## Requirements *(mandatory)*

- **FR-001**: Blocks MUST store a shape: none (square/rectangle), `triangle`, `diamond60`, `hexagon`.
  Size stays width × height (the shape's bounding box), always in the shape's proportions.
- **FR-002**: The block editor MUST use the shape's outline for drawing, snapping and patches, and a
  triangle snap grid (divisions per side) for shaped blocks.
- **FR-003**: Placement MUST match shapes; rotation steps follow the shape (spec 001 FR-060a); a
  placement's rotation is stored in degrees (0, 60, 90, 120, 180, 240, 270, 300).
- **FR-004**: Shaped Blocks, Baby Blocks and Diamond Point MUST be presets of the layout engine whose
  shaped spaces take blocks; Variable Patch, Variable Point and One Patch stay patch-only.
- **FR-005**: Every block space MUST accept a plain fill (User Story 4).
- **FR-006**: Flow angle per User Story 5, stored with the layout.
- **FR-007**: Format v7: block `shape`, placement rotations in 60° steps, `shaped-blocks` and
  `diamond-point` layouts, `flow`; migration: v6 `baby-blocks` layouts become `variable-blocks`
  (Variable Patch) with the same sizes and ids.
- **FR-008**: Space ids stay position-based; Shaped Blocks and Baby Blocks use One Patch's and
  Variable Patch's ids with `b:` in place of `p:` (contracts/slot-ids.md).
- **FR-009**: The quilt editor's block sidebar MUST offer a layout filter (each block layout with a
  picture, showing only blocks whose shape its spaces take) and a shape filter (each shape with its
  outline). The Libraries page and the project's Blocks tab MUST offer the same filters; the Blocks
  tab also gets the Libraries page's Category, Tags, Styles (Technique since spec 029), search and Group by (not its library
  management box).

## Success Criteria *(mandatory)*

- **SC-001**: A quilter draws a hexagon log cabin and sets it in a Shaped Blocks quilt in under 5
  minutes.
- **SC-002**: Every starter shaped block derives its patches with no unconnected seams.
- **SC-003**: A v6 project with Baby Blocks opens unchanged in look as Variable Patch.

## Edge Cases

- A block with no seams: one patch, the whole shape.
- Flow angle 60° on hexagons: the grid looks the same as 0° turned; ids still follow the grid.
- Library shaped blocks in the tray: offered for Set only where the space's shape matches.
- A shaped block in a square space (old files can't have one): refused with the hint, never drawn
  stretched.

## Out of Scope

- Clamshell and spool blocks and layouts (FR-029b).
- Mixed triangle, diamond and hexagon layouts and merging spaces (FR-029d).
- Rotary-cut instructions for 60° shapes.
