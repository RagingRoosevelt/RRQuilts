# Feature Specification: Drawing Your Own Blocks (Seam-Line)

**Feature Branch**: `007-block-drawing`

**Created**: 2026-10-11

**Status**: Draft

**Input**: User description: "Drawing your own blocks: a block editor (Draw / Color / Print modes)
with seam-line drawing — lines, arcs, grids, snapping, graph paper, guides — editing segments and
nodes, live patches with unconnected seams flagged, new blocks and editable copies of starter blocks,
block colorings and variations, undo."

> Implements spec 001 US6 (seam-line part: FR-060 seam style, FR-061, FR-062) on the spec 003 model
> (`applySeamEdit`, stable patch ids) and the spec 006 editor shell. Out of scope: patch-grid and
> appliqué drawing, Bézier drawing tool, tracing images, block generators, printing.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Draw a pieced block from scratch (Priority: P1)

A quilter creates a new block, sets its size and snap grid, draws seam lines and arcs that snap to
the grid and to each other, sees patches form as they draw, colors it, and uses it in a quilt.

**Why this priority**: Original blocks are the main reason to use design software.

**Independent Test**: Draw an Ohio Star on a 3×3 snap grid with the Grid and Line tools in under 3
minutes, color it, set it in a quilt; the patches match the starter Ohio Star.

**Acceptance Scenarios**:

1. **Given** the sketchbook Blocks tab, **When** the user taps "New block", **Then** they enter a
   name, finished width/height (default 10" / 25 cm), and snap grid (default ¼" / 5 mm steps) and
   the block editor opens in Draw mode with the block outline.
2. **Given** the Line tool, **When** the user drags from one point to another, **Then** a seam is
   drawn between the snapped points; releasing on the starting point cancels.
3. **Given** the Arc tool, **When** the user drags between two points, **Then** a quarter-circle arc
   is drawn; Space or a button bends it the other way before release (on touch, drawing from the
   other end does the same); after drawing, its bulge is adjustable (FR-012).
4. **Given** the Grid tool, **When** the user sets columns × rows and drags a rectangle, **Then** that
   grid's seams are drawn in one step; grids can be drawn inside cells of other grids.
5. **Given** any drawing, **Then** patches update live with a light fill, and seams not connected to
   the outline at both ends are highlighted with a count ("2 seams aren't connected") — never deleted.

---

### User Story 2 - Edit what's drawn (Priority: P1)

The quilter selects seams to move, delete, clone, rotate, flip, or resize them, and edits nodes and
arc curves.

**Why this priority**: Drawing is iterative; mistakes must be cheap to fix.

**Independent Test**: Draw a Churn Dash, select its four corner diagonals, rotate them 90°, flip one,
delete one, undo; move a node and reshape an arc.

**Acceptance Scenarios**:

1. **Given** the Select tool, **When** the user taps a seam, shift-taps or drags a box (marquee),
   **Then** those seams are selected; Select All works (Ctrl/Cmd+A).
2. **Given** a selection, **Then** the user can delete, clone (offset copy), move (drag, snapping),
   rotate (90 / 180 / 270 or any angle about the block center or the selection center), flip
   (left↔right, top↕bottom, both diagonals), resize by percent, and convert to guides.
3. **Given** the Node tool, **When** the user drags a node, **Then** every seam ending there follows;
   double-tap a seam adds a node there; nodes can also be added at the midpoint, thirds, N equal parts,
   or at every crossing.
4. **Given** an arc, **When** the user drags its bulge handle, **Then** the arc's curve changes
   (sweep), staying a true circular arc.

---

### User Story 3 - Color a block and keep variations (Priority: P1)

In Color mode the quilter colors the block's patches and saves alternative colorings.

**Why this priority**: A block's look is its coloring; quilters compare several.

**Independent Test**: Color a block, "Save as new coloring", recolor, switch between colorings, set
the second coloring in a quilt.

**Acceptance Scenarios**:

1. **Given** Color mode, **Then** Paint, Spray (same color within the block), and Eyedropper work on
   the block with the same tray as the quilt editor.
2. **Given** a coloring, **When** "Save as new coloring" is chosen, **Then** a copy is added and
   becomes current; colorings are browsable (thumbnails), renamable, and deletable (not the last one).
3. **Given** a block with several colorings, **When** setting it in a quilt, **Then** the tray offers
   the current coloring (choosable per block in the tray).
4. **Given** a block edit that splits or merges patches, **Then** colors carry over per spec 003
   (unchanged patches keep color; split patches inherit), in every coloring and every quilt placement.

---

### User Story 4 - Start from an existing block (Priority: P2)

The quilter opens a starter (or any) block and edits it, either in place or as a copy.

**Why this priority**: Most new blocks begin as variations of known ones.

**Independent Test**: "Edit a copy" of Ohio Star, add diagonals to the corner squares, save; the
original and quilts using it are unchanged.

**Acceptance Scenarios**:

1. **Given** a block card, **When** "Edit" is chosen, **Then** the block editor opens on it; editing a
   block used in quilts updates those quilts (after a one-time notice saying how many use it).
2. **Given** a block card, **When** "Edit a copy" is chosen, **Then** a copy named "<name> (2)" opens
   and the original is untouched.
3. **Given** a block's size is changed, **Then** its drawing scales with it (normalized geometry);
   arcs are re-evaluated at the new proportions with a notice if curved seams change shape (spec 003).

---

### User Story 5 - Precise drawing aids (Priority: P2)

Snap settings, graph paper, guides, and zoom let the quilter draw accurately.

**Why this priority**: Pieced blocks are only useful if they cut accurately.

**Independent Test**: With snaps off for grid but on for nodes, draw a seam ending exactly on an
existing seam's midpoint; zoomed to 800% the ends coincide.

**Acceptance Scenarios**:

1. **Given** the snap settings, **Then** snap to grid points, snap to nodes, and snap to seams are
   individually switchable; the snap grid's horizontal/vertical step is set in project units or as a
   division count (e.g., 3 × 3); the setting is saved with the block (spec 003 FR-038).
2. **Given** graph paper (independent spacing) and guides, **Then** both are visible while drawing and
   never print or appear in quilts.
3. **Given** the pointer over the canvas, **Then** its position (in units from the block's top-left)
   and the length of the seam being drawn are shown.

### Edge Cases

- Seam drawn entirely outside the block or along the outline → ignored / merged (spec 003).
- Floating closed shape inside the block → highlighted as unconnected (spec 003 rule).
- Deleting a seam that removes a patch used in colorings → its fills drop; split/merge follows the
  overlap rule.
- Very small seams (< 1/32" or < 1 mm) → snapped away or refused with a hint.
- Starter/library blocks carry `source` (library, author, license). Editing in place and "Edit a
  copy" both keep it and mark it `derived` (constitution Principle VI); the block's notecard shows
  "Based on <name> by <author> (<license>)".
- Read-only tab → block editor viewable, tools disabled.
- Undo spans drawing, editing, coloring, and block settings in one history (spec 006).

## Requirements *(mandatory)*

### Functional Requirements

**Block editor**

- **FR-001**: The block editor MUST follow the spec 004 editor layout with modes Draw · Color ·
  Print (Print "coming soon"), tool rail, canvas, inspector, tray, undo/redo, and route
  `/project/block/:id`.
- **FR-002**: Block settings (inspector): name, finished width/height, snap grid, snap toggles,
  graph paper, show patches, show unconnected.
- **FR-003**: "New block", "Open in block editor" (was "Edit"), and "Edit a copy" MUST be available
  from the sketchbook; opening a block used in quilts shows a one-time notice with the usage count.
  "Open in block editor" sits right after "Preview" in a block's menu (own and library blocks; on
  the Libraries page too, while a project is open), then "Print" (straight to the Print tab; quilts
  have Print too), and block previews have the same buttons. A library block opens read-only with
  Details and Print only (no Draw or Color: the banner's buttons make a version to change), Details is fixed except
  the quilter's tags, and techniques show as text with the reason (no checkboxes, as for color
  variants and read-only projects); a banner offers "Create a coloration variant" and "Edit (make a copy)". A project keeps one
  coloration variant per library block: creating another opens the existing one (0.6.1, owner
  2026-10-20).

**Drawing (seam-line)**

- **FR-010**: Tools: Select, Node, Line, Arc, Grid, Pan.
- **FR-011**: Line/Arc/Grid MUST snap per the enabled snaps; endpoints within the snap radius
  (8 px on screen) of a node or seam MUST connect exactly.
- **FR-012**: Arcs MUST be drawn as true circular arcs (default 90° sweep), with direction flip while
  drawing and a bulge handle afterwards (sweep 1°–359°).
- **FR-013**: Grid tool MUST draw columns × rows seams within the dragged rectangle in one undo step.
- **FR-014**: Selection operations: delete, clone, move, rotate (preset and arbitrary angle; block
  or selection center), flip (four directions), resize %, convert to guides; each one undo step.
- **FR-015**: Node operations: drag node (connected seams follow), add node at point / midpoint /
  thirds / N parts / at crossings, delete node (merging two collinear seams when possible).
- **FR-016**: Every drawing change MUST re-derive patches via `applySeamEdit` (stable ids, inherited
  fills in all colorings and quilts) and update the canvas within 100 ms for blocks up to 200 seams.
- **FR-017**: Unconnected seams MUST be highlighted with a count; they're kept in the drawing.

**Coloring & variations**

- **FR-020**: Color mode MUST offer Paint, Spray, Eyedropper with the shared tray.
- **FR-021**: Colorings: save as new, switch, rename, delete (≥ 1 kept), thumbnails.
- **FR-022**: The quilt editor tray MUST let the user choose which coloring is set for a block.

**Aids**

- **FR-030**: Snap grid, graph paper, and guides are saved with the block's editor settings and are
  never printed or drawn in quilts.
- **FR-031**: Pointer coordinates and live seam length are shown in project units.

### Key Entities

- Uses spec 003: seam block (drawing nodes/segments, patches, colorings, editor settings, guides).
- **Editor settings** (per block): snap step or divisions, snap toggles, graph paper spacing, guides.

## Success Criteria *(mandatory)*

- **SC-001**: A user draws an Ohio Star with Grid + Line tools in under 3 minutes, and its patches
  match the starter Ohio Star (count and areas).
- **SC-002**: Each drawing action updates patches on screen within 100 ms for blocks up to 200 seams.
- **SC-003**: Editing a block used in a quilt keeps 100% of fills on unchanged patches (spec 003).
- **SC-004**: Every action is undoable; all tools work by touch on a tablet.

## Assumptions

- Seam-line style only; patch-grid, appliqué, combination, Bézier/freehand tools, tracing, and block
  generators are later features.
- Drawing uses the same Canvas 2D renderer and hit-testing approach as spec 006.
