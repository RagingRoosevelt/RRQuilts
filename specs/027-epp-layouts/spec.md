# Feature Specification: English Paper Piecing (EPP) Layouts

**Feature Branch**: `TBD` (target 0.9.0, its own release; was 0.8.0 until the data quilt making flow took 0.8.0, owner 2026-10-30)

**Created**: 2026-10-18

**Status**: Draft (spec only; not implemented). Two releases: **2D** first (User Stories 1-6),
**3D** later (User Stories 7-8). STL cutting templates are a stretch goal.

**Input**: Owner, 2026-10-18: a new type of layout for English paper piecing (EPP). EPP is made by
sewing shapes together along common edges, typically diamonds and regular polygons. A new type of
quilt design where the quilter picks EPP shapes from a library and arranges them so their edges
snap together. Edge lengths are an integer multiple of a base dimension the quilter sets when
designing the quilt (the integer rule may be dropped later). Quilters can design custom EPP template
shapes; like blocks, they can go in packs and libraries. Each EPP shape is a single color or fabric.
Drawing custom shapes straight into a quilt design may come later, not in the first release. Two
versions: first, shapes assembled on a 2D plane; second, a rough 2D starting layout with callouts
that one piece's edge attaches to another's, stitched into a 3D shape (e.g. five 60° diamonds edge
to edge form a 3D star). 2D and 3D ship in different releases; 3D likely needs added libraries (3D
rendering, maybe a solver). Printed templates come with and without seam allowance: with, for
cutting fabric; without, for the papers the fabric is pressed around, which also makes assembly
easier. Stretch goal: STL cutting templates so quilters can make their own paper and fabric pieces.

Owner, 2026-10-18 (clarification): EPP quilts aren't presumed to be rectangular or close to it, and
may end up with no binding or border.

Owner, 2026-10-18 (addition): pieces can be scaled up or down while designing, so one quilt can mix
for example a 1u and a 2u diamond: an integer slider from 1 to 4 above the EPP shapes in the shape
picker part of the sidebar.

Owner, 2026-10-18 (edge): the quilter switches the edge between a trimmed straight edge, no
trimming, and a custom trim specified in the layout.

Related: spec 003 (project format, versions and migrations), spec 006 (quilt editor), spec 007
(block editor, snapping), spec 008 / 011 (library items, packs), spec 009 (credits, licenses),
spec 010 (printing, templates, yardage), spec 014 (fabrics), spec 026 (shaped blocks: triangle,
60° diamond and hexagon outlines), constitution (offline, no server calls, new dependencies need
justification).

## Clarifications

### Session 2026-11-10

- Q: Is the shape editor its own editor or part of the rosette editor? → A: One engine, two
  presentations. The **shape editor** edits outlines only (no colors) and has a **multi-shape mode**:
  draw an outline and lines across it, and the assembly is split into its component shapes, saved as
  a self-contained rosette whose shapes are defined inside it (not added to My library one by one).
  The **rosette editor** places shapes and rosettes and can **close a space**: make a custom shape
  that fills a gap no library shape fits, kept inside that rosette. Owner, 2026-11-10: "I think they
  should be seperate editors but the shape editor should have a multi-shape mode where you can draw
  out an outline and then the whole assembly is split into constituant component shapes. these
  shapes wouldn't be saved as individual seperate shapes to my library but instead would be saved as
  a self-contained rosette with only internal definitions of its shapes. the shape editor doesn't
  need a color component, just the aspects for shape itself. [...] it would be ocasionally handy to
  be able to create a custom shape to close a space in a rosette that we don't have a shape for.
  [...] behind the scenes we can use the same editor but there would be two presentations of it, a
  shape editor that can do that mutli-shape-to-self-contained-rosette mode, and the rosette editor
  that can close up odd spaces to create shapes that are self-contained in the rosette."

- Q: Which edges of an EPP quilt can have borders and binding? → A: Only a made edge, never the
  jagged untrimmed one; with No trimming the Borders tab asks for an edge first. The quilter makes
  the edge either by **cutting to a size** (a straight trim set to a size) or by **auto-closing**
  (the app fills the notches along the outside with closing pieces up to a straight line, so nothing
  is cut). Owner, 2026-11-10: "A. Users can choose between specifying auto cutting to a size or
  auto-closing to create the edges."

- Q: In a block quilt, where do rosettes show up and how do they print? → A: In the sidebar's block
  picker behind a **Rosettes** filter, with an EPP badge, offering only rosettes whose outline
  matches the space; they place, turn and color like blocks. The printout adds an EPP templates
  section (paper and fabric templates) for their pieces, left out of rotary cutting. Owner,
  2026-11-10: "your recomendation for how rosettes show up in a block quilt looks right."

## Concepts

- **EPP quilt**: a quilt (or part of a project) made of **pieces** placed freely and joined edge to
  edge, not a grid of block spaces. It is a new quilt type next to the layout-engine quilts.
- **EPP shape** (template shape): a simple convex polygon, such as a 60° diamond, square,
  equilateral triangle, hexagon, octagon, a jewel or a kite. Every edge length is a whole number of
  **units** (1, 2, 3…), except edges the quilter deliberately marks as another length (FR-006a).
  Angles are free (any under 180°). A shape is a library item, kept apart from blocks (FR-013).
- **Base dimension** (unit): the finished length of one unit in this quilt, set by the quilter (for
  example 1 in, 1.5 in, 3 cm). A shape whose edges are 1 and 2 units is a 1 in × 2 in shape in a
  1 in quilt and twice that in a 2 in quilt.
- **Piece**: one EPP shape placed in a quilt, with a position, a turn, an optional mirror, a
  **scale** (a whole number, 1 to 4), and one fill (a color or a fabric).
- **Scale**: multiplies every edge of a piece's shape: a 60° diamond with 1-unit edges at scale 2
  has 2-unit edges. Scaled edges are still whole units, so pieces of different scales still snap
  (a scale-1 edge runs along half of a scale-2 edge).
- **Snap**: a dragged piece's edge settles onto a nearby edge of equal length, end to end, so the
  two would be sewn together.
- **Group**: pieces picked together to move, turn, copy or recolor as one. Saved for reuse, a group
  is a **rosette** (spec 050): a meta-block used interchangeably with shapes.
- **Outline**: an EPP quilt has no assumed shape and no quilt rectangle; binding and borders are
  optional, not assumed. Its edge is set by the **edge trim**:
  - **No trimming** (default): the edge is wherever the outer pieces end, often jagged (a hexagon
    garden's zigzag edge).
  - **Cut to size** (straight trim): a rectangle cuts across the outer pieces. It starts as the
    largest rectangle the pieces fill with no gaps; the quilter can type a size or move its sides in
    the Layout tab.
  - **Auto-close**: nothing is cut. The app fills the notches along the outside with closing pieces
    (internal shapes such as half hexagons, each made whole as a paper) up to a straight line, so the
    edge is straight. Closing pieces print and count like other pieces and take a fill the quilter
    picks (by default the background color).
  - **Custom trim**: a trim outline the quilter draws or edits in the Layout tab (straight sides and
    arcs, like a quilt target outline); pieces outside it are cut away.
- **Seam allowance**: the fabric margin around the paper, set per quilt (default 3/8 in or 1 cm).
- **3D (later)**: a **net** is a 2D arrangement plus **joins**: callouts saying edge A of one piece
  is sewn to edge B of another, though they don't touch in 2D. Folding the net so every join closes
  gives a 3D object.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start an EPP quilt (Priority: P1)

A quilter wants to make a hexagon flower garden with 1 in hexagons.

**Independent Test**: New › EPP quilt; set the base dimension to 1 in; the empty design opens with
the shape library beside it.

**Acceptance Scenarios**:

1. **Given** the project's quilt list, **Then** **EPP quilt** is offered next to the existing quilt
   wizard and asks for a name, the base dimension and the seam allowance (both editable later).
2. **Given** a new EPP quilt, **Then** it opens on an empty design area with the shapes available to
   this project beside it, filtered and grouped like blocks (spec 026 filters, categories).
3. **Given** the base dimension changes later, **Then** every piece scales with it; the arrangement
   (which edges meet) is unchanged.

---

### User Story 2 - Arrange shapes that snap edge to edge (Priority: P1)

**Independent Test**: Drop a hexagon, then six more around it; each settles flush against the
middle one, sharing a whole edge.

**Acceptance Scenarios**:

1. **Given** a shape picked in the library, **When** the quilter taps or drags into the design,
   **Then** a piece is placed with the shape's own fill (or the current color or fabric), at the
   scale set on the **Scale** slider.
2. **Given** the sidebar's shape picker, **Then** an integer **Scale** slider (1 to 4, default 1) sits
   above the shapes; the shape thumbnails show the picked scale's size, and new pieces take it.
   Selected pieces can be rescaled from the same slider (or their own setting), keeping one corner
   in place, with undo.
3. **Given** a piece dragged near another, **When** one of its edges comes within a snap distance of
   an edge of equal length, **Then** it turns and moves so the edges meet end to end; releasing
   keeps it there. Edges of different lengths don't snap to each other whole, but a short edge can
   snap to a run of a long edge at whole-unit steps.
4. **Given** a piece snapped in place, **Then** turning offers only the turns that keep a shared edge
   (for example 60° steps for a hexagon on a hexagon), and free turning is available off snap.
5. **Given** pieces that would overlap, **Then** the overlap is shown (but allowed, so the quilter can
   rearrange), and printing warns about it.
6. **Given** several pieces selected, **Then** they move, turn, mirror, copy, delete and recolor as a
   group (detailed in spec 051), and a group can be saved as a **rosette** (spec 050) for reuse.
7. Undo and redo cover every change (spec 006).
8. **Given** the toolbar, **Then** a three-way switch picks the placement mode: **Free**, **Grow** and
   **Grid** (FR-003b). The Scale slider, the shape and rosette picker and colors and fabrics stay in the
   sidebar; placement tools are in the toolbar, as in the other editors.
9. **Given** Free mode and a shape picked, **When** the mouse is over the design and not over a placed
   piece (desktop), **Then** a ghost of the shape follows it, showing where a tap places it and how it
   snaps. Snapping and turning work as in prototype A.
10. **Given** Grow mode, **When** the quilter taps a free edge, **Then** the picked shape is attached
    there (no separate "start with" and "place next" shapes). While the mouse is over an edge, each
    shape in the sidebar picker is shown in a color that says whether it fits that edge.
11. **Given** Grid mode, **Then** a button right under the mode switch drags the grid until a grid
    edge snaps to an edge of a placed piece, and a **Sync grid to selected size** toggle sizes the grid
    to the picked scale. Taps place shapes that sit on the grid.

---

### User Story 3 - Color pieces (Priority: P1)

**Acceptance Scenarios**:

1. **Given** a piece, **Then** it has exactly one fill: a color or a fabric (spec 014), painted with
   the editor's Paint tool and scopes (this piece, all pieces of the same shape, all with the same
   fill).
2. **Given** fabrics at true scale, **Then** a fabric's print shows at its real size in each piece;
   fussy-cut placement (moving the fabric inside one piece) is a later addition.
3. Colorways (spec 019) work on EPP quilts as on other quilts.

---

### User Story 4 - Design a custom EPP shape (Priority: P1)

**Independent Test**: Create a shape with edges 2, 1, 2, 1 units at 60° and 120° corners (a
parallelogram); place it and print it.

**Acceptance Scenarios**:

1. **Given** the project's EPP shapes, **When** the quilter makes a new shape, **Then** the shape
   editor shows the outline on a 1-unit grid and they drag its corners (nodes) into place. No angles
   or lengths are typed, and there is no base unit or scale: each edge is labeled with its length in
   units (or fractions of a unit) read off the grid.
2. **Given** the toolbar, **Then** it has four tools: **Vertex** (drag a corner), **Edge** (drag or
   split an edge, and mark it as not a whole unit), **Angle** (drag a corner's angle marker up to
   widen the angle, down to narrow it, in steps set in the sidebar) and **Lock vertex** (tap a corner
   so no tool moves it, tap again to free it).
3. **Given** the sidebar, **Then** a **Vertex grid snapping** setting (Free / Square / Triangle) sets
   where dragged corners land and which grid is drawn, and an angle step setting sets the Angle
   tool's increments.
4. **Given** an edge that isn't a whole number of units, **Then** it fails the whole-unit flag unless
   the quilter marked it with the Edge tool as meant to be that length. A marked edge of length L snaps to
   edges of length L, a whole multiple of L (2L, 3L…), or L/2 or L/4, a shorter edge running along a
   longer one in steps of its own length.
5. **Given** an outline that doesn't close, crosses itself, isn't convex, or has an unmarked edge that
   isn't a whole number of units, **Then** the editor flags it and doesn't save it as a usable shape
   (FR-006 banner).
6. **Given** the shape editor, **Then** it has no colors or fabrics, only the outline. Its
   **Multi-shape** mode lets the quilter draw an outline and lines across it; each closed area
   becomes a shape (each checked by the four flags), and the whole is saved as a self-contained
   rosette whose shapes live inside it, not as separate library shapes (spec 050).
7. **Given** a saved shape, **Then** it has a name, notecard (notes, tags, styles), a default fill, and
   credits and license (spec 009), like a block.
8. A shape can be copied and edited; editing a shape used in a quilt updates its pieces, with undo.

---

### User Story 5 - Shapes in libraries and packs (Priority: P1)

**Acceptance Scenarios**:

1. **Given** the built-in library, **Then** it has a starter set of EPP shapes, filed by category:
   jewel (edges 1, 1, 2, 2, 1), hexagon, octagon, half hexagon, square, half square (right triangle,
   its long edge marked), equilateral triangle, 45° diamond, 60° diamond, pentagon, honeycomb (a
   hexagon of 1U edges with two 90° end corners) and elongated hexagon (the honeycomb with its two
   long sides 2U), and a kite cut from a 2U hexagon (center, edge midpoint, corner, next midpoint:
   short edges 1U, long edges √3, marked). Owner, 2026-11-10: "jewel (1u, 1u, 1u, 2u?, 2u?), hexagon, octagon,
   half-hexagon, square, half-square (right triangle), triangle (60deg equalatralal), 45deg
   diamond, 60deg diamond, pentagon, honeycomb (hexagon with 1u edges, two 90 degree end corners),
   elongated hexagon. same as honeycomb but with two 2u sides". Then: ""kite" which would be
   extracted from a hexagon and is formed from the center of the hexagon to the midpoint of one
   edge, connected to a natural vertex, connected to the next midpoint of the edge, connected back
   to the center. the edges between midpoint and natural vertex would be 1u leaving the long edges
   an odd length".
2. **Given** My library and packs (spec 011), **Then** EPP shapes (and rosettes, spec 050) can be saved to My
   library, shared in packs, copied from packs, synced and credited exactly like blocks, and the
   Libraries page and project tabs list and filter them as their own type.
3. **Given** a project that uses library shapes, **Then** it embeds the ones it uses (spec 008).

---

### User Story 6 - Print templates (Priority: P1)

**Acceptance Scenarios**:

1. **Given** an EPP quilt, **When** printing, **Then** each shape used (at each scale used) prints as templates at true
   size in two kinds: **paper templates** (finished size, no seam allowance), for the papers the
   fabric is pressed around and for assembly; and **fabric templates** (with the seam allowance
   around), for cutting fabric.
2. **Given** the print options, **Then** the quilter picks paper, fabric or both, and how many of each
   to print (the count used, per fill, or one of each), packed onto pages (spec 010 packing).
3. **Given** the print, **Then** each template is labeled with its shape, size and count per fill,
   and a yardage summary per fabric or color is included (spec 010).
4. **Given** a shape whose edges are all one unit, **Then** a 1 in test square or ruler is printed so
   the quilter can check the printer's scale.

---

### User Story 7 - 3D: a net with joins (Priority: P3, later release)

A quilter wants a 3D star: five 60° diamonds edge to edge, with the last edge sewn to the first.

**Independent Test**: Place five 60° diamonds in a fan (they leave a gap in 2D), add a join from the
fifth diamond's free edge to the first's; the 3D view shows a shallow five-point star.

**Acceptance Scenarios**:

1. **Given** an EPP design marked as 3D, **Then** the quilter can add **joins**: pick an edge of one
   piece and an edge of another of equal length; a callout links them in the 2D view.
2. **Given** a net with joins, **Then** a 3D view folds the pieces so every join and every snapped
   edge closes, the pieces stay flat and their sizes unchanged, and the quilter can turn the object
   around to look at it.
3. **Given** joins that can't all close (impossible or conflicting), **Then** the 3D view says which
   joins conflict and shows the closest fold it found.
4. **Given** a 3D design, **Then** printing gives the same paper and fabric templates as 2D, plus an
   assembly sheet: the net with each join numbered on both edges.

---

### User Story 8 - 3D: libraries of objects (Priority: P3, later release)

1. The built-in library gets a few 3D starters (a five-diamond star, a dodecahedron ball of
   pentagons, a cube of squares), and 3D designs can go in packs like other items.

---

### Stretch goal - STL cutting templates

1. **Given** any shape, **When** exporting, **Then** the app writes STL files for 3D-printed cutting
   templates: a paper template (finished size) and a fabric template (with seam allowance), with a
   chosen thickness and an optional rim or handle, so quilters can cut papers and fabric themselves.

### Edge Cases

- **Base dimension tiny or huge**: limits (for example 1/4 in to 6 in), with a warning when a
  template won't fit on a page.
- **Snap ambiguity**: several edges in reach; the nearest edge wins, and the one it would join is
  highlighted before release.
- **Scale and templates**: each shape-and-scale pair used prints as its own templates (a 2u diamond
  is not a 1u diamond's template); counts are per shape, scale and fill.
- **Rescaling in place**: a rescaled piece may overlap or lose its snapped neighbors; it is shown as
  any overlap is, and the quilter rearranges.
- **Mirror-image shapes** (e.g. a kite or a parallelogram): mirrored pieces print as their own
  templates (or flipped, with the template marked "reverse").
- **No border or binding**: the default, and the only choice with No trimming. With no trimming, printing, yardage and the quilt's size use
  the pieces alone; the size shown is the bounding box, labeled as such.
- **Trim through gaps**: a straight or custom trim line that crosses a hole or an empty area leaves
  the edge open there; the Layout tab warns about it.
- **Pieces wholly outside the trim**: they're shown faded and left out of templates and counts,
  with a note. Facing or turned edges are the quilter's
  choice, not modeled.
- **Gaps**: a design may leave holes; they're fine in 2D (appliqué onto a background is out of
  scope) and print as nothing.
- **Shape edited after use**: pieces follow; snapped neighbors that no longer match are flagged, not
  moved.
- **Loaded files**: shapes whose outline doesn't close, or a piece referring to a missing shape, are
  reported on open and never crash the app (spec 003).
- **3D**: a join between edges of different lengths isn't allowed; a net that doesn't stay in one
  piece (disconnected) folds each part on its own.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST offer an EPP quilt type, separate from layout-engine quilts, with a base
  dimension (the length of 1U, set in the Layout tab) and a seam allowance per quilt. Shapes and
  rosettes have no size of their own (spec 050 Concepts).
- **FR-001a**: An EPP quilt MUST NOT assume a rectangular (or any) outline. Borders and binding are
  off by default. The Layout tab MUST offer the edge: **No trimming** (edge follows the outer
  pieces), **Cut to size** (a rectangle, sized by typing or dragging), **Auto-close** (closing pieces
  fill the outside notches up to a straight edge, nothing cut) or **Custom trim** (an outline set in
  the Layout tab). Borders and binding MUST need a made edge (Cut to size, Auto-close or Custom
  trim); with No trimming the Borders tab asks for one. The quilt's size, the drawing, borders and
  binding follow the chosen edge; yardage counts binding and borders only when on.
- **FR-001b**: Trimming MUST NOT change the templates: pieces are made whole (papers are whole
  shapes) and trimmed after assembly, so templates and fabric counts are for whole pieces; the
  print notes the trim line and its size.
- **FR-002**: EPP shapes MUST be simple closed convex polygons whose edge lengths are whole multiples of
  the quilt's base dimension, except edges the quilter deliberately marks as another length
  (FR-006a). A marked edge snaps to an edge of the same length, a whole multiple of it, or a half or a quarter of it (a shorter edge runs along a longer one in steps of its own length). Owner, 2026-11-10: "let's also allow snapping to an integer multiple of that length or to a 1/2
  or 1/4 ofthat length".
- **FR-003**: Placing and dragging pieces MUST snap equal-length edges together end to end (and short
  edges along long ones at whole-unit steps), with free placement off snap.
- **FR-003a**: Each piece MUST have a whole-number scale from 1 to 4 that multiplies its shape's
  edges; the sidebar's shape picker MUST have a Scale slider (1 to 4) that sets new pieces' scale
  and can rescale selected pieces. Snapping works across scales at whole-unit steps.
- **FR-003b**: The editor MUST offer three placement modes on a three-way toolbar switch: Free (drag
  and drop with edge snapping, a ghost of the picked shape under the mouse on desktop), Grow (tap a
  free edge to attach the picked shape, picker shapes colored by whether they fit the hovered edge)
  and Grid (place on a grid that can be dragged until it snaps to a placed piece's edge, with a Sync
  grid to selected size toggle). Owner, 2026-11-10: "for assembling quilts / stamps / rosettes, I
  like all three of "free canvas", "grow", and "on a grid". let's support all three as various
  placement modes (three-way switch to change mode). we want to fit this into our existing
  paradigm, though, so scale, shape picker / stamp picker and colors/fabrics will be in the sidebar
  and placement tools will be in the toolbar." Quilts and rosettes share this editing engine but
  not one editor (FR-014, spec 050 FR-009).
- **FR-004**: Each piece MUST have exactly one fill: a color or a fabric.
- **FR-005**: Pieces MUST support select, group, move, turn, mirror, copy, delete and recolor, with
  undo; groups can be saved as rosettes (spec 050).
- **FR-006**: Quilters MUST be able to create, copy and edit EPP shapes (by dragging, FR-006a) with
  validation that the outline closes, doesn't cross itself, has whole-unit edges and is convex.
  Owner, 2026-11-10: "we should have a shape/stamp/rosette editor. it should have a banner that
  shows as long as at least one patche doesn't meet the following criteria: 1. closes, 2. doesn't
  cross itself, 3. every edge is a whole unit, 4. each shape is convex. each check should be shown
  as a flag as you're editing." The shape editor and the rosette editor are two presentations of one
  editing engine (Clarifications 2026-11-10): in both, every patch outline being drawn shows four
  flags (closes, doesn't cross itself, whole-unit edges, convex), and a banner names the failing
  patches until all pass. Shapes MUST be convex.
- **FR-006a**: The shape editor MUST edit by dragging: corners on a 1-unit grid (Vertex grid snapping
  Free / Square / Triangle, which also sets the grid drawn), angle markers dragged up or down in
  sidebar-set steps, locked corners that no tool moves, and edge lengths shown in units and fractions.
  Tools: Vertex, Edge, Angle, Lock vertex. Shapes have no base unit or scale of their own. Owner,
  2026-11-10: "nodes feel like they should be draggable. I don't like having to type in an angle. I
  also want to allow non-unit edges as long as the user is specifically picking to implment one.
  let's support locking a vertex so that it can't be moved. let's also support dragging the angle
  markers (drag up to increase the angle, down to decrease the angle, increments set in the sidebar.
  the "draw on a grid" mode feels a lot better for dragging vertices. let's have a "vertex grid
  snapping" setting for "free/square/triangle" that also changes the grid that is shown. in the
  toolbox we can have an angle edit tool, and a vertex tool, an edge tool, and a lock vertex tool. I
  don't believe base unit matters for blocks and there's no reason to set a scale since we can just
  show a 1u grid and the user will see the number of units (or fractional units) an edge is"
- **FR-007**: EPP shapes and rosettes (spec 050) MUST be library items: built-in starters, My library, packs,
  embedding, sync and credits, as blocks are (specs 008, 009, 011).
- **FR-008**: Printing MUST produce paper templates (no seam allowance) and fabric templates (with
  seam allowance) at true size, with counts per fill, labels, packing and yardage.
- **FR-009**: The project format MUST gain a version with EPP quilts, shapes and pieces, and a
  migration (spec 003); loaded EPP data is validated like the rest.
- **FR-010** (later release): EPP designs MUST support joins between equal edges and a 3D view that
  folds the net, reports conflicting joins, and prints an assembly sheet.
- **FR-011** (stretch): The app SHOULD export STL cutting templates for paper and fabric.
- **FR-012**: Everything works offline; 3D rendering, any solver and STL export run in the app with
  no server calls.
- **FR-013**: Libraries and projects MUST have an **EPP** section next to Blocks and Palettes, holding
  EPP shapes and rosettes (spec 050), never mixed into the block lists.
- **FR-014**: The EPP quilt type's designer MUST use the rosette editor's engine (placement modes,
  snapping, checks, paint) and add the quilt editor's **Layout** and **Borders** tabs, which the
  rosette editor doesn't have. Owner, 2026-11-10: "I think I'm going to go back on what I said about
  epp using the same editor for rosettes and quilts. under the hood I think this should be true, but
  I think we should have a quilt type for EPP that for the designer uses the epp backend we're using
  for rosettes, but adds the layout and borders editor tabs that would not be present in the rosette
  editor."
- **FR-015**: The block-based quilt designer MUST also offer rosettes whose outline matches a standard
  block space shape (square, triangle, diamond, hexagon; spec 026), so EPP rosettes can be mixed into
  normal block quilts. Owner, 2026-11-10: "in the standard block-based quilt designer, we should also
  show rosettes that match standard block layout shapes (triangle, diamond, hexagon, square) so that
  EPP rosettes could be mixed into normal block quilts." The block space sets the rosette's size (its
  1U follows from the space). Rosettes are offered in the sidebar's block picker behind a
  **Rosettes** filter, with an EPP badge, only where their outline matches the space; they place,
  turn and color like blocks. Rosettes never print as traditional blocks: no rotary cutting, no block
  templates or foundation patterns. Every patch of a placed rosette gets a **paper template**
  (finished size) and a **fabric cutting template** (with the seam allowance), counted by shape,
  size and fill, in the block quilt's printout as in an EPP quilt's. Owner, 2026-11-10: "EPP "blocks" should print different than traditional blocks. we need to
  provide both paper and fabric cutting templates for each of the patches in an EPP rosette/block."

### Key Entities

- **EppShape**: id, notecard, outline (vertices in units, locked corners, edges marked as not whole
  units), default fill, credits, license; its own library item type, in the EPP section (FR-013).
- **EppQuilt**: base dimension, seam allowance, edge (none / cut to size / auto-close with its
  closing pieces' fill / custom outline), optional binding and borders (off by default), pieces, groups, colorways; later `joins` and a 3D flag.
- **Piece**: shape ref, position, turn, mirror, scale (1-4), fill.
- **Rosette**: see spec 050 (a saved group used like a shape).
- **Join** (later): two (piece, edge) pairs.

## Success Criteria *(mandatory)*

- **SC-001**: A quilter lays out a 19-hexagon flower (one middle, two rings) in under 3 minutes, every
  hexagon flush with its neighbors.
- **SC-002**: Printed paper templates measure within 0.5 mm of the finished size; fabric templates
  are exactly one seam allowance larger on every side.
- **SC-003**: A custom shape saved to a pack opens in another person's app and places and prints the
  same.
- **SC-004** (later): The five-diamond star folds in the 3D view with every join closed.

## Assumptions

- Shapes are straight-sided and convex in the first release (no curves); their corners can be any
  angle under 180°.
- An EPP quilt has no target rectangle; the wizard's target sizes (spec 006) don't apply, though a
  size to aim at may be shown as a guide.
- An EPP quilt is a whole quilt. Rosettes can fill block spaces in block quilts (FR-015); loose EPP
  pieces in a block quilt and appliqué onto a background are later.
- Snap distance is in screen space (about the size of a fingertip), so it works zoomed in or out.
- The 3D release needs new dependencies (a 3D renderer, maybe a constraint solver). Per the
  constitution they need justification in that release's plan; they're bundled for offline use.

## Out of Scope (first release)

- Drawing custom shapes straight into the quilt design (shapes are made in the shape editor).
- 3D designs (second release) and STL export (stretch).
- Fussy-cutting fabric inside a piece, curved shapes, and appliqué onto a background.
