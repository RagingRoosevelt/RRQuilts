# Feature Specification: Snap Gravity Setting

**Feature Branch**: `TBD` (target 0.7.3)

**Created**: 2026-10-19

**Status**: Draft (spec only; not implemented)

**Input**: Owner, 2026-10-19: a feature where the user can set the snapping gravity in their user
settings, under design, block design.
Owner, 2026-10-29: "let's move [it] into 0.7.3 and add the ability to pick which things have snap
gravity at all". Done as one strength per snap target (User Story 3), each of which can be Off.
Then: "add a snapping target toggle of horizontal or vertical alignment with nearest nearly
horizontal and nearest vertical node" (User Story 5).

## Concepts

- **Snapping** (block editor, spec 007; triangle grid spec 026): while drawing, the pointer jumps
  to the nearest existing corner (node), then a point on a seam or the outline, then a snap-grid
  point, when one is close enough. Which of these snap is set per block (the snap toggles).
- **Gravity**: how close is "close enough": the distance on screen within which a point pulls the
  pointer in. Today it is fixed at 8 screen pixels for every target and every input.
- Gravity is measured on screen, not in the block, so it feels the same at any zoom.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set how strongly drawing snaps (Priority: P1)

A quilter finds the pointer jumping to corners they didn't mean (or missing ones they did). In
**Settings › Quilt and block design › Block design** they set **Snapping gravity** and the block
editor follows it at once.

**Independent Test**: set gravity to Strong, draw near a corner from twice as far as before: the
seam end lands on the corner; set all three Off: it lands exactly where the pointer is.

**Acceptance Scenarios**:

1. **Given** Settings, **Then** **Block design** (inside **Quilt and block design**) has **Snapping
   gravity**: a step per snap target (User Story 3), each **Off**, **Gentle**, **Normal** (the
   default, today's behavior) or **Strong**.
2. **Given** a step, **Then** the pull reaches: Off 0, Gentle 4, Normal 8, Strong 16 screen pixels
   (mouse and pen).
3. **Given** a target Off, **Then** it doesn't snap (the block's toggle keeps its saved value, for
   when gravity comes back).
4. **Given** the setting changes while a block is open in another tab, **Then** that editor follows
   it when the settings sync (as other settings do).
5. **Given** a settings file (`.rrqconf`) exported and imported, **Then** gravity goes with it.

---

### User Story 2 - Fingers need more pull (Priority: P2)

**Acceptance Scenarios**:

1. **Given** drawing with a finger, **Then** the pull is twice the setting (a fingertip covers more
   than a mouse pointer), so Normal reaches 16 pixels by touch.
2. **Given** **Touch gravity** (shown under Snapping gravity), **Then** the touch multiplier can be
   set: **Same as mouse**, **Double** (default), **Triple**.

---

### User Story 3 - Pick which things pull, and how hard (Priority: P1)

A quilter wants seam ends to land on corners and grid points but never on the middle of a seam
(or only on corners, never the grid). Under Snapping gravity they set a strength for each target.

**Independent Test**: set Seams to Off and leave the rest Normal. Drawing across a seam doesn't
stop on it, in every block, while corners and grid points still pull.

**Acceptance Scenarios**:

1. **Given** Snapping gravity, **Then** it lists the snap targets, each with its own step
   (Off, Gentle, Normal, Strong): **Corners** (corners already drawn and the block's own corners),
   **Seams** (any point on a seam or the outline) and **Grid points** (the snap grid, square or
   triangle), plus **Line up** (User Story 5). All Normal by default.
2. **Given** a target set to Off, **Then** it never pulls, in any block, and the block editor's
   toggle for it ("Snap to nodes", "Snap to seams", "Snap to grid points", "Line up with
   nodes") shows off and disabled
   with the note "Off in Settings" and a link there.
3. **Given** a target not Off, **Then** the block's own toggle works as now (per block, saved with
   the block), so a quilter can still switch one off for a single block.
4. **Given** several targets within reach, **Then** priority stays as now: corners, then seams, then
   line up, then grid points, each reaching its own distance.
5. **Given** every target Off, **Then** nothing snaps and the snap marker never shows.

---

### User Story 5 - Line up with other corners (Priority: P2)

A quilter draws a seam end that should sit level with a corner across the block, or straight above
one, with no grid point there. The pointer pulls onto the level (or the plumb line) of the nearest
corner, and a guide line shows which corner it lined up with.

**Independent Test**: a block with one corner at (1, 2.3), grid off, Line up on. Move the pointer
near y 2.3 far from that corner: the point lands at y 2.3, with a dashed line to the corner. Near
x 1 as well: it lands at (1, 2.3) only if Corners pull it there; else at x 1 on its own line.

**Acceptance Scenarios**:

1. **Given** the block editor, **Then** a toggle **Line up with nodes** sits with the other snap
   toggles, per block, **off** for every block until switched on (so drawing stays as it is today).
2. **Given** Line up on, **When** the pointer's height is within reach of a corner's height (a
   nearly horizontal line from that corner), **Then** the point takes that corner's height exactly;
   of several, the corner nearest the pointer wins.
3. **Given** the same for width (a nearly vertical line from a corner), **Then** the point takes
   that corner's x exactly, nearest corner winning.
4. **Given** both apply at once (level with one corner, plumb with another), **Then** the point takes
   both: x from one, y from the other.
5. **Given** one axis lines up and Grid points is on, **Then** the other axis can still snap to the
   nearest grid line within reach, so the point lands level with a corner and on a grid column.
6. **Given** a point lined up, **Then** a dashed guide line runs from it to the corner (or corners)
   it lines up with, while the pointer is there.
7. **Given** drawing a seam, **Then** the seam's own start counts as a corner to line up with, so a
   seam can be drawn exactly level or plumb.
8. **Given** corners counted, **Then** they are the drawn corners and the block's own corners (the
   same ones Corners snaps to); the corner being moved, when editing, doesn't count.

---

### User Story 4 - See and skip the pull (Priority: P3)

**Acceptance Scenarios**:

1. **Given** the gravity setting is being changed, **Then** a small preview shows a dot and a circle
   of the pull's size, so the quilter sees what each step means.
2. **Given** drawing, **When** the quilter holds **Alt** (Option on a Mac), **Then** nothing snaps
   for that stroke, whatever the setting (a quick way past a pull that's in the way).

### Edge Cases

- Very zoomed out (a whole quilt-sized block on a phone): the pull stays in screen pixels, so it may
  cover several grid points; the nearest wins, by the priority above.
- Strong gravity near many corners: the nearest corner wins; ties go to the one drawn first.
- Shaped blocks (triangle grid): the same gravity applies to triangle-grid points.
- Seam editing (moving a corner): the moved corner snaps with the same gravity; its own old position
  doesn't pull it back.
- Settings older than this feature: Normal and Double, matching today. Blocks saved before it: Line
  up off.
- Line up on a shaped block (triangle grid): level and plumb are still screen horizontal and
  vertical (the block's own axes); the triangle grid's slanted lines don't count.
- Line up beats grid points: a corner level 1/16″ off a grid line wins when both are within reach.

## Requirements *(mandatory)*

- **FR-001**: Settings MUST offer **Snapping gravity** under Quilt and block design › Block design:
  a step (Off, Gentle, Normal, Strong; default Normal) for each of Corners, Seams, Line up and Grid
  points,
  saved with the other settings and in `.rrqconf`.
- **FR-002**: The block editor's snapping MUST use each target's distance, in screen pixels; a
  target Off MUST not snap anywhere, without changing the per-block snap toggles, which show off and
  disabled with a note while their target is Off in Settings.
- **FR-003**: Touch input MUST multiply the distance by **Touch gravity** (Same, Double default,
  Triple).
- **FR-004**: Each target MUST reach its own distance; the priority order is corners (nodes), seams,
  line up, grid.
- **FR-008**: The block editor MUST offer **Line up with nodes** per block (off by default and for
  older blocks, saved in the block's editor state, so no format version change). On, a point MUST
  take the exact y of the nearest corner whose y is within reach, and the exact x of the nearest
  corner whose x is within reach, independently; the other axis MAY then snap to a grid line.
- **FR-009**: A lined up point MUST show a dashed guide line to its corner(s); the seam being drawn
  MUST count its own start as a corner.
- **FR-005**: Holding Alt (Option) while drawing MUST turn snapping off for that stroke.
- **FR-006**: The setting MUST show a preview of the pull's size while it's changed.
- **FR-007**: Settings files without the new fields MUST load as Normal and Double (no format
  version change is needed for added optional settings, per the settings rules).

### Key Entities

- **Snap gravity setting**: a step (off, gentle, normal, strong) per target (nodes, seams, align,
  grid)
  and a touch multiplier (1, 2, 3).

## Success Criteria *(mandatory)*

- **SC-001**: With every target Off, a seam ends exactly at the pointer in every case.
- **SC-004**: With one target Off, that target never pulls in any block, and the others still do.
- **SC-005**: With Line up on, a seam drawn from a corner toward another corner's level ends exactly
  level with it (same y to the stored precision).
- **SC-002**: With the default, drawing feels as it does today (nothing changes for anyone who never
  opens the setting).
- **SC-003**: A quilter can find and change the setting in under 30 seconds from the block editor.

## Assumptions

- "Settings › design › block design" is the existing **Quilt and block design** section of Settings,
  which gets a **Block design** group (the quilt editor has no point snapping today).
- The help guide for drawing blocks gets a line on gravity and the Alt key.

## Out of Scope

- Snapping in the quilt editor (placing items) and the print overlay.
- Per-block gravity (the setting is the quilter's, for every block).
