# Feature Specification: Strip Layouts

**Feature Branch**: `017-strip-layouts`

**Created**: 2026-10-16

**Status**: Implemented (2026-10-16)

**Input**: User description: "Strip layouts (spec 001 FR-024): Horizontal Strip and Vertical Strip
quilts as presets of the shared layout engine (spec 016). A strip quilt is a stack of strips running
across (horizontal) or down (vertical); all strips share one length, each strip has its own width and
style. Plain strips are painted; Pieced Blocks and Half Drop Blocks hold blocks; the other styles are
fixed pieced patterns painted with colors and fabrics. Layout inspector with a strip list, select,
add, insert, delete, clone. Placed content survives inserting, deleting, and reordering strips.
Wizard picture cards. Format version bump. Printing as rotary cuts or templates."

> Builds on spec 016 (layout engine, wizard style cards, FR-023 cut-off blocks, FR-024 where blocks
> go), spec 001 FR-024 (strip styles), spec 010 (printing). The engine already generates strip
> stacks (spec 016 FR-002a); this feature gives them to users.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Build a strip quilt strip by strip (Priority: P1)

A quilter picks Horizontal Strip, then sets each strip's style and width: plain spacer strips
between rows of blocks, a strip of flying-geese points, a checkerboard.

**Why this priority**: Strip quilts are a common, beginner-friendly setting, and choosing a style per
strip is the whole point of the layout.

**Independent Test**: Start a quilt → Horizontal Strip → select strip 2 → style Pieced Blocks, 6
blocks → select strip 3 → Points A, 12 → the quilt shows plain, blocks, points as chosen, at the
shown widths, all the same length.

**Acceptance Scenarios**:

1. **Given** a strip quilt, **When** the user taps a strip in the quilt or picks it in the strip
   list (or steps with previous/next), **Then** it is selected and highlighted, and the inspector
   shows its style, width, and counts.
2. **Given** a selected strip, **When** the user changes its style, width, or counts, **Then** only
   that strip changes; the quilt's length is shared by all strips and set once.
3. **Given** Horizontal Strip, **Then** strips run left to right and stack top to bottom; **given**
   Vertical Strip, **Then** they run top to bottom and stack left to right.
4. **Given** a style that repeats (blocks, points, diamonds, spaced squares), **Then** its count along
   the length is editable; **given** Checker Board, **Then** the count across the width is editable
   too; **given** Plain, **Then** no counts.
5. **Given** a strip whose units aren't square (blocks) or whose points aren't 90°, **Then** the
   inspector shows the unit size and offers to make them square: the count or the length that
   would make them so (strip formulas, see FR-012).

---

### User Story 2 - Add, insert, delete, and clone strips (Priority: P1)

**Independent Test**: Select strip 2 → Insert → a new strip appears before it; Add → one at the end;
Delete → the selected strip goes; with Clone on, Add copies the selected strip's settings.

**Acceptance Scenarios**:

1. **Given** Clone off, **When** Add or Insert, **Then** a plain strip 2″ (5 cm) wide is added at the
   end, or inserted before the selected strip, and selected.
2. **Given** Clone on, **When** Add or Insert, **Then** the new strip copies the selected strip's
   style, width, and counts, and starts empty (no blocks or colors), as the reference software does.
3. **Given** Delete, **Then** the selected strip is removed (a quilt keeps at least one strip); its
   placed blocks are listed in the usual warning first.
4. **Given** blocks and colors placed in strips, **When** strips are inserted or deleted elsewhere,
   **Then** every remaining strip keeps its blocks and colors.
5. **Given** a strip quilt, **When** the user picks the Swap strips tool in the toolbar, taps one
   strip, then another, **Then** the two strips trade places, each keeping its settings, blocks, and
   colors; the first tap is highlighted until the second, tapping it again or pressing Escape cancels,
   and the swap is one undo step.
6. **Given** the Strip style tool, **When** the user clicks its toolbar button, **Then** a menu of all
   the styles opens, and picking one makes it the tool's style (shown on the button); **when**
   the user taps a strip, **Then** that strip takes the tool's style (keeping its width and counts),
   one undo step, with the usual warning if placed blocks would be lost.

---

### User Story 3 - Fill strips (Priority: P1)

**Independent Test**: Set blocks into a Pieced Blocks strip, paint a plain strip and the points of a
Points strip, print → cutting list has the plain strip, the triangles, and the blocks' pieces.

**Acceptance Scenarios**:

1. **Given** a Pieced Blocks strip, **Then** its spaces take blocks (This / All / Alternate as in
   other layouts); **given** Half Drop Blocks, **Then** the spaces at both ends are half blocks, placed
   whole and trimmed (spec 016 FR-023).
2. **Given** Plain or a pattern style, **Then** its pieces take colors and fabrics only (spec 016
   FR-024); Set explains this.
3. **Given** printing, **Then** plain strips print as strips to cut (pieced from several widths of
   fabric when longer than the usable width, like borders), pattern pieces as rotary cuts (squares,
   half- and quarter-square triangles) or templates, and blocks as usual.

---

### User Story 4 - Start a strip quilt from the wizard (Priority: P2)

**Acceptance Scenarios**:

1. **Given** Start a quilt, **Then** the style cards include Horizontal Strip and Vertical Strip, each
   with its picture, and the live preview shows the default strips.
2. **Given** a strip style in the wizard, **Then** the Blocks step asks for the number of strips and
   the length (strip styles are set afterwards in the Layout tab); sashing doesn't apply.

---

### Edge Cases

- One strip only: Delete is unavailable.
- Count of 1: one unit along the whole strip (Points: one point; Half drop: two half units).
- Very narrow or very long units (count too high for the length) still draw; the unit size shows,
  so the quilter can see it.
- Switching between Horizontal Strip and Vertical Strip keeps every strip, its settings, and its
  content (the strips just turn).
- Switching to or from another layout style starts from that style's defaults; placed blocks that
  would be lost are listed in the warning.
- Borders work around a strip quilt as around any other.
- A file from before this feature with the placeholder strip styles opens with default strips.

## Requirements *(mandatory)*

### Functional Requirements

**Layout**

- **FR-001**: The app MUST offer Horizontal Strip and Vertical Strip layouts made of one or more
  strips sharing one length, each strip with its own style and width.
- **FR-002**: Strip styles MUST be Plain, Pieced Blocks, Half Drop Blocks, Spaced Squares, Points A,
  Points B, Diamonds, Half Drop Diamonds, Double Diamonds, Half Drop Double Diamonds, and Checker
  Board, each with the count along the length it needs (Checker Board also across the width).
- **FR-003**: Pieced Blocks and Half Drop Blocks MUST make block spaces; all other styles MUST make
  plain pieces (colors and fabrics only).
- **FR-004**: Placed blocks and colors MUST belong to the strip they're in, so inserting, deleting,
  or reordering other strips never moves or drops them (space ids follow the strip, not its
  position; the slot-id contract gains the strip grammar).
- **FR-005**: The strips MUST be generated by the shared layout engine (spec 016) as presets; no new
  geometry outside it.

**Inspector**

- **FR-010**: The Layout tab MUST show the strip list with the selected strip, previous/next, Add,
  Insert, Delete, and a Clone option, and the selected strip's style, width, and counts, plus the
  shared length and the direction (Horizontal or Vertical).
- **FR-011**: Tapping a strip in the quilt while the Layout tab is open MUST select it.
- **FR-013**: For strip quilts, the quilt editor's toolbar MUST offer a Swap strips tool: tap two
  strips to trade their places (settings and content go with them), one undo step; Escape or tapping
  the first strip again cancels.
- **FR-014**: For strip quilts, the toolbar MUST offer a Strip style tool: its button opens a menu of
  the styles to pick from (the pick is shown on the button, and a small filled chevron marks it as a
  menu), and tapping a strip sets that strip's style. *Added
  2026-10-16 (owner).* *Added
  2026-10-16 (owner).*
- **FR-012**: The inspector MUST show each strip's unit size and, when units aren't square (or points
  not 90°), offer one-tap fixes: the count that makes them square at the current length, or the
  length that does at the current count, using the strip formulas: width × count = length (blocks,
  diamonds), width × count ÷ 2 = length (double diamonds), width × count × 2 = length (points), and
  for Checker Board, along = across × length ÷ width.

**Wizard** (spec 016 FR-013)

- **FR-020**: The wizard's style cards MUST include Horizontal Strip and Vertical Strip; their Blocks
  step asks for the number of strips and the length, and the preview follows.

**Format and printing**

- **FR-030**: The strip layout MUST be saved in the project; the project format version MUST rise
  with a migration (placeholder strip styles get the default strips) and the published schema be
  regenerated.
- **FR-031**: Printing MUST cut plain strips as strips (joined when longer than the usable fabric
  width), pattern pieces as rotary cuts or templates, and blocks as usual; yardage includes them.

### Key Entities

- **Strip layout**: direction, shared length, and an ordered list of strips.
- **Strip**: a lasting identity, style, width, count along, count across (Checker Board).
- **Strip space**: a block space or plain piece inside a strip, identified by its strip and its
  position along (and across) it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A quilter builds a 5-strip quilt (plain, blocks, points, blocks, plain) and prints its
  cutting list in under 3 minutes.
- **SC-002**: Inserting, deleting, or swapping strips never changes the content of any strip other
  than moving it with its strip (checked over every style).
- **SC-003**: Every style covers its strip exactly (no gaps or overlaps) for counts 1 to 24 and any
  width and length.
- **SC-004**: Using the offered fix gives square units or 90° points to within 1/64″.

## Assumptions

- The shapes of each pattern style follow the reference quilt software's strip styles (pictured in
  its manual) and common quilting use; the plan fixes their exact geometry with drawings.
- Pattern pieces are plain pieces; putting blocks into diamonds or points needs block shapes
  (spec 001 FR-060a) and is out of scope.
- Default new strip quilt: 5 strips alternating Plain 3″ and Pieced Blocks 8″ (6 blocks), 48″ long
  (cm: 7.5, 20, 120).
- Strips are reordered with the Swap strips tool (FR-013); dragging is not required.
