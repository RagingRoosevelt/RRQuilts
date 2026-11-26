# Feature Specification: English Paper Piecing (EPP) Layouts

**Feature Branch**: `TBD` (target 0.9.0, its own release; was 0.8.0 until the data quilt making flow took 0.8.0, owner 2026-10-30)

**Created**: 2026-10-18

**Status**: Released in 0.9.0 (2026-11-24); 0.9.1 (2026-11-24) added the help guides and 3D assembly tools (seam finder, unsewn and stretched highlights); a Find tool, cut handles, rosette palette swap and any-link opening planned for 0.9.3 (owner, 2026-11-24, moved from 0.9.2). Was: Draft (spec only; not implemented). **2D** (User Stories 1-6) and **3D** (User Story
7; User Story 8 later) both ship in 0.9.0 (owner, 2026-11-23; first planned as two releases). STL
cutting templates are a stretch goal.

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

### Session 2026-11-19 (3D, before the prototype)

- Q: How do the parts of a 3D design come together? → A: The 2D design may hold several separate
  **assemblies** that don't touch in 2D, with seams between edges of different assemblies; the 3D
  view pulls them together until those seams line up. Owner, 2026-11-19: "I expect that in the 2d
  design view, we'll be likely to have several seperate assemblies that don't touch in 2d but have
  seams between edges of the assemblies. In 3d view they'll get pulled together to align their
  seams."
- Q: What does the fold treat as a seam, and how does a seam move? → A: Every seam is a **hinge**
  whose axis is the seam line. Two pieces sharing an edge in 2D have a seam there automatically;
  **explicit seams** (formerly "joins") are only added for edges that aren't shared in 2D. Any seam
  bends when the forces call for it. Owner, 2026-11-19: "We should treat seams as hinges when
  solving the fold. The seam line is the axis of the hinge. When two pieces share a common edge,
  they should be assumed to have a seam between them. Explicit seams are only required for edges
  that aren't shared between pieces in 2d view." and "We expect that all shared edges will serve as
  a hinge if force dictates that they should bend."
- Q: Where does 3D EPP live in the app? → A: A **3D EPP quilt** is its own quilt type. The project
  lists it in the EPP tab with a "3D" badge. It uses the EPP quilt designer for the 2D layout plus
  a **3D assembly** tab in the workbench, and the standard shapes and rosettes; quilters tag
  rosettes meant for 3D themselves (tags, spec 029). Owner, 2026-11-19: "3d epp is its own type of
  quilt but in the project view, they'll show up in the epp tab right a "3d" badge. It'll use the
  same designer for 2d layout and just add a 3d assembly tab to the workbench. It should use
  standard 2d shapes and rosettes. We'll leave it up to the user to employ a tab to differentiate
  rosettes intended for 3d from ones intended for 2d."
- Q: Which 3D library? → A: three.js, the one the STL prototype's notes named for the app's 3D view
  (the 3D Print preview was built without one). Owner, 2026-11-19: "We should use that for this
  too."
- Q: Flat or puffy (stuffed) faces? → A: Flat for the prototype; puffy is decided after seeing it.
  Owner, 2026-11-19: "For the prototype, let's see how it looks assuming flat faced and decide if
  we need puffy later."

### Session 2026-11-23 (3D, after the prototypes)

- Q: What did the prototypes settle? → A: Physical stuffing at the firmest setting (no firmness
  setting in the app), the fixed light with shadows (no lighting choice), stitches when exploded
  (no glue). The 3D view says clearly whether the design can be stuffed and, when it can't, why.
  When the flat pieces can't close every seam but the design is closed, it says stuffing might
  close the rest. Owner, 2026-11-23: "firmness to the max of the slider", "fixed light & shadows
  works well", "stitches for the explode mode", "we should have a clear indication of if the
  current design is allowed to be stuffed as well as a callout why it isn't" and "let's add a note
  that when it can't be joined but stuffing might help".
- Q: How does the project's Quilts tab filter its quilts now that there are EPP quilts? → A: **Show**
  offers All quilts, then Data, Block (with block spaces), Patch and EPP quilts (2D and 3D), only
  the types the project has, and only when it has more than one type ("Other" is gone). Owner,
  2026-11-23: "in the toggles for quilt types in the project view, we should add a toggle for epp",
  "let's also seperate other into "block" and "patch"" and "and then only show the toggle options
  for quilt types that exist in the project". The labels are short: All quilts, Data, Block, Patch,
  EPP. Owner, 2026-11-24: "Let's change the switch titles to "all quilts", "data", "block",
  "patch", "epp"".
- Q: When does 3D ship? → A: In 0.9.0 with the rest of the EPP work (rrq v12, still unreleased,
  carries the 3D fields), built on its own branch off `027-epp-layouts` and merged back. Owner,
  2026-11-23: "this will be releasing with the other epp work we've been doing".
- Q: Is there a sample? → A: A demo project, hosted by the owner as a gist and linked from the help,
  with a 3D EPP quilt each: a star pillow whose two stars are turned half a point against each
  other so their points interlock, the twisted pincushion, the dice shapes d4 (tetrahedron), d6
  (cube, one assembly), d8 (octahedron), d10 (kites), d12 (dodecahedron) and d20 (icosahedron), a
  hexagonal prism, a truncated tetrahedron and a soccer ball. Owner, 2026-11-23: "I want a demo rqq
  built that has the following designs (will be hosting it as a gist that can be linked to from the
  help)", "star pillow with a a phase rotation of where the seams go compared to where we have them
  now, so that they interlock rather than line up" and "let's also include the twisted pincushion
  in the demo rqq". It ships with the app instead: `public/demo/3d-epp.rrq`, in the deployed site's
  demo folder (precached), opened by the link `/?open_demo=3d-epp.rrq` (first called `open_url`; like `/?open_gist=`, but only
  for files in the demo folder) that the help uses. Owner, 2026-11-23: "let's add a demo folder
  that's included in the deployed app and a similar route to open_gist called ?open_url= that can
  load rrq files from the demo folder that are passed in". A second demo, `temperature.rrq`: three
  temperature quilts (365 days of highs, a month per row, highs and lows week by week) with a year
  of sample entries, the first weeks marked cut and sewn, then finished by the owner in the app:
  filler, borders and sashing colored, and a fourth quilt, Month pinwheels on point (Quartered Month
  Pinwheels on simulated data, Cobweb blocks between). The file is the source from then on; a test
  only checks it, including that it names only the built-in library (the save had Denim from the
  Novelty pack, which has the same color, so every device without that pack was asked to add it). Every demo's project author is "RRQuilts contributors". Owner, 2026-11-23: "yeah,
  I meant to use that new temp demo. and we should update the author of the other demos to match". The welcome wizard gets a **Demos** step
  after Help, and the home page an **Open a demo** button right of Open a project file and Open
  from a gist, both listing the demos (`DEMOS` in src/storage/demo.ts). Owner, 2026-11-23: "and
  let's also have a demo of temperature quilts", "let's add a "demos" step to the welcome wizard
  after help" and "let's add a button to the right of "open rpoject file" and "open github gist"
  for "open a demo"". A third demo, listed first, `block-quilts.rrq`: medallions on point with
  sashing (a Queen bed with its drop as the target), Diamond Point diamond blocks with sashing and a
  border, pieced horizontal strips with no plain strips between (a men's XL shirt back as the
  target), and Variable Patch tumbling cubes. Owner, 2026-11-23: "let's add a demo project with a
  handful of basic block and patch quilts. let's do an on-point quilt with some medalians with
  sashing between them, a shaped blocks with sashing and a border, a strips (patches) without
  sashing, and a variable patch without sashing. let's have a men's XL shirt back over the strips
  one and a queen XL over the on point quilt." Shaped Blocks has no sashing, so the shaped quilt is
  Diamond Point; the US list has no Queen XL, so the target is Queen (both the owner's picks, the
  same day). A fourth demo, `traditional-epp.rrq` (second in the list): Grandmother's Flower Garden
  (19-hexagon flowers in six colorings on a grid where they leave exactly one four-hexagon diamond
  between them, the leaves; cut straight, with a border of green squares), a Lone Star (eight
  points of 6 × 6 45° diamonds in rings, Auto-close setting pieces in cream) and Cube corners (each
  2U hexagon a cube with a corner cut away: its faces are L shapes of two half hexagons, light,
  medium and dark, around three 60° diamonds shaded the other way round), the last two with plain
  borders. Owner, 2026-11-23: "add a demo for traditional epp patterns. do a grandma's garden with
  little groups of four green hexis between the flowers for leaves. do a cut border of green
  blocks", "do an epp diamond lone star", "and then do the optical illusion cube corners in the
  same epp demo", "I believe it's built from half hexis", "put borders on the lone star and cube
  corners quilt demos", "move traditional EPP to position 2 in the demo list". Building it found a bug: a library color used only as the Auto-close fill
  wasn't embedded in the project, so cards (which color from the project) drew the closing pieces
  white. Now embedded like any color in use. Both overlays inverted: the shirt back black at full strength, the bed #757575 at 15%.
  Owner, 2026-11-23: "for both overlays, do tint of #000000, max opacity, invert", then "actually,
  for the medalians on point, do #757575 at 15%, inverted". The d10 is a real die's: every corner on a sphere, so each kite has two right
  angles, a 51.8° tip and a 128.2° bottom corner, short edges 1U and long edges 2.06U (marked);
  not the 108°/36° kite of the dual of the uniform antiprism. Owner, 2026-11-23: "the d10 kites
  demo should use the standard kite shape that would be found in a typical d10".

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
  - **Cut to size** (straight trim): a rectangle cuts across the outer pieces. **Largest
    rectangle** is the largest rectangle the pieces fill with no gaps, found again after every
    edit; **Manual** is sized by hand: its sides, corners or middle dragged on the Layout tab's
    picture (pieces outside faded), or a size typed (FR-001c).
  - **Auto-close**: nothing is cut. The app fills the notches along the outside with closing pieces
    (internal shapes such as half hexagons, each made whole as a paper) up to a straight line, so the
    edge is straight. Closing pieces print and count like other pieces and take a fill the quilter
    picks (by default the background color).
  - **Custom trim**: a trim outline the quilter draws or edits in the Layout tab (straight sides and
    arcs, like a quilt target outline); pieces outside it are cut away.
- **Seam allowance**: the fabric margin around the paper, set per quilt (default 3/8 in or 1 cm).
- **3D (later)**: a **net** is a 2D arrangement of one or more **assemblies** (pieces joined by
  shared edges) plus **explicit seams**: callouts saying edge A of one piece is sewn to edge B of
  another, though they don't touch in 2D. Every seam, shared or explicit, is a **hinge** about the
  seam line. Folding the net so every seam closes gives a 3D object.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start an EPP quilt (Priority: P1)

A quilter wants to make a hexagon flower garden with 1 in hexagons.

**Independent Test**: New › EPP quilt; set the base dimension to 1 in; the empty design opens with
the shape library beside it.

**Acceptance Scenarios**:

1. **Given** the project's quilt list, **Then** **EPP quilt** is offered next to the existing quilt
   wizard and asks for a name, the base dimension and the seam allowance (both editable later). In
   the new-quilt wizard's EPP mode the steps are Layout (1U, seam allowance, **3D EPP** toggle) and
   Borders (none by default, shown once the quilt has a made edge), with no Size or Sashing step
   (no block spaces). Owner, 2026-11-23: "in the new quilt wizard, even in epp mode, currently size
   has columns/rows and block size which don't apply to epp. I believe sashing should also be cut.
   we should leave borders, though".
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
4. **Given** a piece snapped in place, **Then** the Turn tool turns it by the smallest amount (either
   way; ties the same way each time, so taps cycle) that brings its next edge flush against the
   neighbor edge it lies along, so it stays attached; off snap it turns by its own corner step.
   Owner, 2026-11-10: "if a shape is already snapped to other shapes, when you hit the shape with
   the rotate tool, it should rotate by the smalles amount necessary to snap along its next edge to
   one of the neighbor's edges that it was previously aligned with" (for example a honeycomb's flat
   top under a square stays attached as it turns).
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
   snaps. Snapping and turning work as in prototype A. On touch, with no hover, a one-finger drag from empty space is the
   ghost, placed where it's let go (a tap places at the tap). Owner, 2026-11-10: "Single-finger drag
   on empty space should do the hover ghost thing, no?"
10. **Given** Grow mode, **When** the quilter taps a free edge, **Then** the picked shape is attached
    there (no separate "start with" and "place next" shapes). While the mouse is over an edge, each
    shape in the sidebar picker is shown in a color that says whether it fits that edge.
11. **Given** Grid mode, **Then** a button right under the mode switch drags the grid until a grid
    edge snaps to an edge of a placed piece, and a **Sync grid to selected size** toggle sizes the grid
    to the picked scale. Taps place shapes that sit on the grid. The grid shows in Grid mode only.
    Edges snap in Grid mode too: a neighbor's edge in reach wins, otherwise the shape sits on the
    grid. The Free / Grow / Grid switch and Grid mode's Drag grid and Sync grid sit at the top of
    the sidebar. Owner, 2026-11-10: "edge snapping should still be on when in grid placement mode.
    let's move the grid placement buttons into a multi-position switch in the sidebar".
    Owner, 2026-11-10: "the grid shouldn't be shown in "grow" and "free placement" mode".
12. **Given** a placed piece dragged in Free mode, **Then** it snaps when one of its edges comes
    within half the shorter edge of a neighbor's (whatever the zoom), the two edges showing green
    while dragging; it turns at most 30° to fit; snaps that overlap other pieces are allowed, for
    tidying up a rosette. One **Place** tool places (tap) and moves (drag) pieces; a Select tool
    comes with multi-select (spec 051). Owner, 2026-11-10: "i like what you suggest except I want
    to allow overlapping snaps. it'll be necessary to support them when someone is cleaning up a
    rosette after dragging the shapes around". A rosette being dragged or placed meets others by
    its outside edges only: a snap that would leave it over other pieces is skipped for the next
    best (loose shapes still snap overlapping). Owner, 2026-11-10: "only the outer edges of a
    rosette should be snap targets to another rosette".

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
   split an edge, and mark it as not a whole unit), **Angle** (drag a corner's angle label right to
   widen the angle, left to narrow it, in steps set in the sidebar; the label itself is no change) and **Lock vertex** (tap a corner
   so no tool moves it, tap again to free it) and **Delete** (tap a corner to remove it, or an edge to
   join its two corners into one; a shape keeps at least three corners). Owner, 2026-11-10: "we
   need to add a delete edge/vertex tool to the shape editor".
3. **Given** the sidebar, **Then** a **Vertex grid snapping** setting (Free / Square / Triangle) sets
   where dragged corners land and which grid is drawn, and an angle step setting sets the Angle
   tool's increments.
4. **Given** an edge that isn't a whole number of units, **Then** the whole-unit flag warns (orange,
   the shape stays usable) until the quilter marks it with the Edge tool as meant to be that length.
   Edges drawn in Multi-shape or made by Close space are marked as they're made. Owner, 2026-11-10:
   "maybe the requirement to be unit should be relaxed to just a warning with the same dismiss route
   rather than this "blocking" implmentation". Any edge of length L that isn't a whole unit snaps to
   edges of length L, a whole multiple of L (2L, 3L…), or L/2 or L/4, a shorter edge running along a
   longer one in steps of its own length.
5. **Given** an outline that doesn't close, crosses itself or isn't convex, **Then** the editor flags it,
   the banner says which, and it isn't a usable shape (FR-006 banner).
6. **Given** the shape editor, **Then** it has no colors or fabrics, only the outline. Its
   **Multi-shape** mode lets the quilter draw an outline and lines across it; each closed area
   becomes a shape (each checked by the four flags), and the whole is saved as a self-contained
   rosette whose shapes live inside it, not as separate library shapes (spec 050). A piece that is an
   existing shape (the project's, then the libraries', at any turn, mirrored or not, scale 1 to 4)
   uses that shape instead; Close space does the same. **Save as shapes** (below Save as rosette;
   owner, 2026-11-16: "let's add a "save as shapes" button below "save as rosette" in the epp shape
   editor") saves the pieces as the project's own shapes instead: centered, counter-clockwise, new
   edges marked; a piece that is an existing shape is skipped and identical pieces make one shape;
   then the project's EPP tab opens. Owner, 2026-11-10: "if a
   mutli-shape-to-rosette ends up with an internal-to-the-rosette shape that's the same as a library
   shape, it should be replaced by that library shape". Line ends snap
   to the outline's corners and earlier lines' ends, then onto outline edges and earlier lines (at
   whole units from an end when close), then to the grid. Owner, 2026-11-10: "it doesn't feel like
   edges snap to existing exterior edges quite enough in multi-shape mode". Multi-shape adds a
   **Line** tool that draws the lines; the other tools work as in single shapes (Vertex also moves
   line ends, and lines follow a moved corner; Delete also removes a line), and a note above **Save
   as rosette** says why it's off. Owner, 2026-11-10: "a note should live right above "save as
   rosette" indicating why the button is disabled when in multi-shape" and "selecting the vertex
   tool in multi-shape mode doesn't allow for moving the vertices. it still just draws edges".
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
   an odd length". Categories: Regular Polygons (triangle, square, pentagon, hexagon, octagon),
   Irregular Hexagons (half hexagon, honeycomb, elongated hexagon), Irregular Triangles (half
   square), Diamonds (60°, 45°, kite, jewel), then Rosettes. Owner, 2026-11-23: "in built-in epp
   shapes, rename polygons to "regular polygons" and move square, triangle, and hexagon into it.
   rename the current hexagons to irregular hexigons. rename triagnels to irregular triangles".
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

### User Story 7 - 3D: a net with seams (Priority: P3, 0.9.0)

A quilter wants a 3D star: five 60° diamonds edge to edge, with the last edge sewn to the first.

**Independent Test**: Place five 60° diamonds in a fan (they leave a gap in 2D), add a seam from the
fifth diamond's free edge to the first's; the 3D assembly tab shows a shallow five-point star.

**Acceptance Scenarios**:

1. **Given** a 3D EPP quilt (its own quilt type, listed in the project's EPP tab with a "3D" badge),
   **Then** it opens in the EPP quilt designer with the standard shapes and rosettes, plus a **3D
   assembly** tab in the workbench. It is made from the EPP tab's **New 3D design**, or with the
   **3D EPP** toggle in the new-quilt wizard's EPP mode (Layout step only: a 3D design has no
   borders); an EPP quilt's Layout tab has the same toggle, either way (turning 3D on removes the
   edge and borders, turning it off keeps the seams unused). Owner, 2026-11-23: "the interface when
   the epp option has been picked should have a toggle for 3d epp mode" and "we don't appear to
   have the toggle for epp in layout of the quilt design, either". 3D EPP quilts are listed with the
   project's quilts as 2D EPP quilts are, with a 3D badge, and not in the EPP tab (shapes and
   rosettes only; the EPP tab's New 3D design went with them). Owner, 2026-11-23: "3d epp quilts
   should show up in the projects quilt tab just like 2d epp quilts do" and "the epp 3d quilts are
   showing up in the epp shapes/rosette tab".
   Their cards show the folded object as the 3D assembly tab first does (turned to its front,
   stuffed for a stuffed design), drawn in the background; the flat picture until it's ready.
   Owner, 2026-11-23: "can we change the thumbnails for 3d epp quilts to use a 3d render of the
   quilt?".
   The 3D assembly tab splits its
   view: the flat net (seams editable there too, those the fold can't close in red, the front
   ringed) above the 3D view, or beside it by a setting (Settings › Interface › 3D EPP: vertical
   or horizontal split, vertical by default). Owner, 2026-11-23: "the 3d assembly section should
   have a vertical viewport split for the 2d seam assembly on top and the 3d preview on the bottom.
   there should be an option in app user preferences/interface/3d epp for switching between
   vertical split and horizontal split".
2. **Given** the 2D layout, **Then** pieces sharing an edge have a seam there with nothing to add,
   and the quilter adds **explicit seams** only between edges that don't touch: pick an edge of one
   piece and an edge of another of equal length; a numbered callout links them in the 2D view. The
   layout may hold several separate assemblies joined only by explicit seams.
3. **Given** a net with seams, **Then** the 3D assembly tab folds it: every seam is a hinge about
   the seam line, separate assemblies are pulled together until their seams line up, every seam
   closes, the pieces stay flat and their sizes unchanged, and the quilter can turn the object
   around to look at it. Faces are flat, with a **Stuffed** toggle: a closed shape rounds out as a
   whole (faces push out, seams bow outward, corners pull in a little, as unstretchy fabric does),
   and an open shape's pieces each puff into a dome. Owner, 2026-11-19: "For the prototype, let's
   see how it looks assuming flat faced and decide if we need puffy later", then "can we add a
   toggle for stuff/inflate?" and "shouldn't stuffing impact the seams and vertices too?"
   A **physical stuffing** pass runs after the fold: the pieces become fabric (seams sewn by
   shared points, fabric that hardly stretches but bunches up easily), stuffing pressure pushes
   outward, and the shape settles; it also closes seams the rigid fold can't (a pillow's two sides,
   a twisted pincushion). Owner, 2026-11-19: "is it visual or does it impact the folding?", then
   "Let's make a new copy of the prototype to do a physical stuffer. Let's do the fold solve first
   then the stuffing sim. I expect that we'll have shapes that don't have a fold solution until
   stuffed." (prototype `prototypes/epp3d/stuff.html`). In the app (owner, 2026-11-23): only
   physical stuffing, at the prototype's firmest setting, with no firmness setting. **Stuffed
   design** is a quilt setting (`layout.stuffed`), in the Layout tab (3D quilts only) and in the
   3D assembly tab; a stuffed design stuffs once folded and turned to its front, and the tab's
   **Enable simulation view** switch (on whenever the tab opens a stuffed design) turns the
   simulation off and on without saving anything. A stuffed design's seams the flat pieces can't
   close aren't reported as not closing (the fabric closes them), whatever the switch shows; a
   design that isn't stuffed gets the warning and the note that stuffing might help. Owner,
   2026-11-23: "the not closing warning should only show based on the stuffed design toggle, not
   based on the stuffed design view toggle. the show stuffing should be renamed to "enable
   simulation view" and should be on any time that 3d assembly view is loaded if the quilt is a
   stuffed design".
   Owner, 2026-11-23: "Stuffing should be a quilt setting with a toggle in the assbly interface to
   show or hide the stuffing. The setting should be in layout and visible only if it's a 3d epp
   quilt and it should be available as well in the 3d assembly interface. The label for the view
   toggle and the setting should be clearly distinguished". Only a closed design (every edge sewn)
   stuffs, and the 3D view says whether the design can be stuffed and, when it can't, why (edges
   left open, or the fold still running).
   When a closed design's seams don't all close as flat pieces, it says stuffing might close the
   rest.
   **Explode**: a single click on the folded object toggles explode mode, where every piece moves
   a bit away from the middle (the fold itself is unchanged); another click closes it up. Drags
   only turn the view and leave the object closed or exploded as it was. Nothing follows the
   pointer without a button held. Owner, 2026-11-19 (first called flex mode): "let's add an
   action for a single click on the folded object to put it into flex mode that doesn't require
   dragging. another single click returns to unflexed mode. dragging when in flexed mode behaves
   as if the drag put it into flex mode and when the drag ends, it goes to non-flexed mode." and,
   after a first try that pulled the clicked piece along with the pointer, "click toggles flex
   mode. click+drag out of flex mode turns on flex mode and then lets the user orbit. click+drag
   when already in flex mode just does the orbiting but exits flex mode when the drag ends" and
   "I'm thinking of more of an "explode" mode where all pieces move a bit away from the center",
   then "let's have click-to-drag not reset back to unexploded" and "it'll leave it in whatever
   mode it's presently in". Exploded, every seam shows **glue**: a see-through film stretched
   between the two pieces' edges, its open ends bowing inward in arcs like glue pulled thin by
   surface tension, more as the pieces spread. Owner, 2026-11-19: "the explode mode should show
   a "glue" shape that spans between the two edges when exploded. it should be a transparent
   surface that has arcs on the open ends and be aligned with the piece edges" and, after a first
   try curving round from one piece's surface to the other's, "the curve should look kinda like
   surface tension as the glue stretches, not a curve tangent to the faces where they meet". The
   default exploded look is **stitches**: thread lacing back and forth across each seam's gap,
   with a soft glow around the thread so it stands out from the background; glue stayed as the
   other choice in the prototype, and the app has stitches only (owner, 2026-11-23: "stitches for
   the explode mode"). Owner, 2026-11-19: "ok, don't throw that away, but let's switch to a new mode
   that just shows a bunch of thread stitching between them. render a bit of glow around the
   edges of the thread so that it stands out from the background".
   **Front**: once folded, the object turns so its front faces the quilter and the 2D design's up
   is up. An open shape faces the way its right side faces overall (each piece's direction
   weighted by its area); a closed shape has no overall direction, so one piece faces front: by
   default the piece nearest the middle of the largest assembly, or one the quilter picks
   (double-click in the prototype), marked in the 2D view. Owner, 2026-11-19: "how do we decide
   where the front is? for example with five-diamond star?", then "yeah, that would be good." to
   this proposal.
4. **Given** seams that can't all close (impossible or conflicting), **Then** the 3D view says which
   seams don't close and shows the closest fold it found.
5. **Given** a 3D design, **Then** printing gives the same paper and fabric templates as 2D, plus an
   assembly sheet: the net with each explicit seam's two edges in its color (not numbered: owner,
   2026-11-24, "don't show the seam join labels in the 2d quilt picture").

Prototype (2026-11-19): `prototypes/epp3d/fold.html` on branch `proto/epp-3d`.

---

### User Story 8 - 3D: libraries of objects (Priority: P3, later release)

1. The built-in library gets a few 3D starters (a five-diamond star, a dodecahedron ball of
   pentagons, a cube of squares), and 3D designs can go in packs like other items.

---

### Stretch goal - STL cutting templates

1. **Given** any shape, **When** exporting, **Then** the app writes STL files for 3D-printed cutting
   templates: a paper template (finished size) and a fabric template (with seam allowance), so
   quilters can cut papers and fabric themselves.
2. Owner, 2026-11-13 (prototype `prototypes/stl/template.html` on branch `proto/epp-stl`):
   - An EPP shape's size is picked as a number of U (1U to 4U) and the 1U length.
   - Build: the outline extruded 4 mm, shelled with an open top 1.2 mm thick, walls brought in to
     4 mm, outside corners rounded 2 mm, pocket corners 2 mm (6 mm until 2026-11-14), outer edges chamfered 0.4 mm, inner
     edges (4 − 1.2) / 2 mm.
   - The edge size and seam allowance debossed in the floor in smooth letters (`Edge: 1"`,
     `SA: 3/8"`, or mm); paper templates say `SA: 0`, which marks them as paper.
   - Text 0.6 mm deep, aiming for 6 mm per inch of edge (12 mm at 2"), smaller only to fit; then a
     hanging hole, 3/4" if it still fits, else 3/8", above the text if possible.
   - Fabric templates trim points sharper than 90° by default (the quilter can turn it off).
3. Owner, 2026-11-13, in the app (built in 0.9.0):
   - **Libraries**: clicking an EPP shape or rosette opens a preview (as library blocks do) with
     **Preview** and **3D print** tabs; a rosette's 3D print has a tab per shape it's made of. In a
     project, clicking a card still opens its editor.
   - **3D Print** tab right of **Print** in the block, shape, rosette and quilt editors: the template in
     the middle, and the sidebar as other tabs: **Shape** (which piece; a shape's Size in U and 1U
     length; a block's size), **Template** (paper or fabric, seam allowance, trim points) and
     **Advanced** (collapsed: the build numbers above).
   - Every template shows its nominal size and seam allowance: `Edge:` for EPP shapes, `Size: w × h`
     (finished) for block and quilt pieces. A quilt's 1U (and an EPP quilt's seam allowance) come
     from the quilt and aren't set here.
   - Concave pieces (an L, a Drunkard's Path inner curve) are listed with a note and no template;
     concave outlines come later.
4. Owner, 2026-11-13: "let's update the algo for placing the hole in the 3d print template to try to
   place the hole on a line going from the midpoint out to a vertex" and "let's also set the default
   1U length to 2" for imperial or 50mm for metric".
   - The hanging hole sits on a line from the middle of the floor out to a corner, as far out as it
     fits; the corner that leaves it farthest out first (ties: the higher, then the left). The text
     still comes first and stays clear of the hole. If no corner works, the middle of the top or
     bottom edge, as before.
   - The 1U length a rosette or shape prints at defaults to 2 in (50 mm), as a new EPP quilt's.
   - Owner, 2026-11-13: "why does 1u, 2in/u half hexagon paper not get a hanging hole? is the font
     maxed out? can it be shrunk a bit to fit a hole?" When no hole fits beside the biggest text, the
     text shrinks (5% steps, up to a quarter smaller) until a hole fits; past that, text and no hole.
   - Owner, 2026-11-14: "lets drop the inner corner radius to 4mm", then "drop those radius to 2mm?":
     the pocket's corners 2 mm (was 6 mm), as the outside corners.
   - Owner, 2026-11-14: "for the various settings dialogs for 3d prints, the default seam allowance
     should be 3/8" or 10mm (and increment should be 1/8" or 1mm)", then "scratch that. 9.5mm with
     0.5mm increment", then "nope, going back to 10mm and 1mm", then "more specifically, the 3/8" and
     10mm seam allowance default is an EPP setting, not a 3d print setting": EPP templates have their
     own seam allowance, 3/8 in or 10 mm, apart from the Print tab's (1/4 in, for pieced blocks). It
     applies to a rosette's or shape's Print and 3D Print tabs and to the rosettes in a block quilt's
     printout; an EPP quilt has its own (also 3/8 in or 10 mm for a new one). Every EPP seam
     allowance steps by 1/8 in or 1 mm (new-quilt wizard, EPP quilt Layout tab, rosette Print,
     3D Print). 3D templates of block and quilt pieces keep the Print tab's seam allowance.
   - Owner, 2026-11-14: "seam allowance for epp and for standard piecing should be a project level
     setting. we already decided on 3/8 & 10mm for epp. lets use 1/4 & 6mm for standard piecing."
     Both are saved in the project (`project.seams`, rrq v12; unset = the default for the units). An
     EPP quilt no longer has its own: the Layout tab and the new-quilt wizard edit the project's EPP
     seam allowance (decided without the owner's answer: recommended option). Standard piecing's
     replaces the app-wide Print setting (was 1/4 in or 7.5 mm) everywhere: cut sizes, rotary chart,
     templates, miter guides, Help calculators. Changing units keeps a default a default (1/4 in →
     6 mm) and scales other values. Every seam allowance field steps 1/8 in or 1 mm.
   - Owner, 2026-11-14: "when I use the tumbling block rosette in a block quilt, why does the 3d
     print for the epp shape say "size: .... x ...." instead of giving the edge dimension?" and "epp
     rosettes in a block quilt should still use the epp seam allowance but a note should be added to
     a paper printout that their outer seam edge will need to be reconciled with the rest of the
     quilt's SA". A block quilt's 3D Print lists its rosettes' shapes as EPP templates (`Edge:` at
     the 1U where the rosette sits, the EPP seam allowance); its printout's rosette fabric templates
     carry a note under the key when the two seam allowances differ (trim the outer edge to the
     quilt's, or sew those seams at the EPP one).

### Edge Cases

- **The view while editing**: the shape, rosette and EPP quilt editors fit the pieces once when
  opened; after that only zoom, pan, pinch and Fit move the view, never placing or dragging pieces.
  Owner, 2026-11-16: "let's update the epp shape/rosette editor so that dragging around doesn't
  cause the viewport to change zoom/pan. the user should have to click/scroll/pinch to change the
  viewport for the designer interface".
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
- **3D**: an explicit seam between edges of different lengths isn't allowed, nor one between two
  edges of the same piece; an edge already shared in 2D needs no explicit seam. Assemblies with no
  seam linking them to the rest fold on their own.

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
  binding follow the chosen edge; yardage counts binding and borders only when on. Custom trim
  waits for spec 055 (quilt shapes), which brings circles, diamonds and polygons to every quilt; the
  first EPP release has No trimming, Cut to size and Auto-close. Owner, 2026-11-10: "custom trim:
  yeah, that's the right call".
- **FR-001b**: Trimming MUST NOT change the templates: pieces are made whole (papers are whole
  shapes) and trimmed after assembly, so templates and fabric counts are for whole pieces; the
  print notes the trim line and its size.
- **FR-001c**: Cut to size MUST offer **Largest rectangle** (the default: found again after every
  edit, so it follows the pieces) and **Manual**. Manual MUST put the cut on the Layout tab's
  picture with handles on its sides, corners and middle (drag to resize or move; pieces outside it
  shown faded, under any borders), an **Aspect ratio** (Freeform, Square, or wide and tall common
  ratios) that keeps its shape, and **Snap to vertex** and **Snap to edge** switches (a dragged side
  stops at piece corners and along upright or level piece edges near it; app settings). Typing a
  width or height makes it Manual. Cuts made before rrq v13 open as Manual (they keep their size).
  Owner, 2026-11-25: "the "largest rectangle the pices fill" should turn into a toggle with the
  other option being "manual" and activating "manual" should put a crop rectangle in the preview
  and should show several toggles for snapping the crop rectange with "snap to vertex" and "snap
  to edge" options", then "there should also be an "aspect ratio" dropdown that has several common
  aspect ratios as well as "freeform" that control the crop region's shape".
- **FR-002**: EPP shapes MUST be simple closed convex polygons. Edge lengths SHOULD be whole multiples
  of the quilt's base dimension: other lengths only warn, until the quilter marks them as meant
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
- **FR-005a**: The EPP quilt editor MUST have a **Find** tool, as the quilt editor's: tapping a piece
  picks its shape or rosette in the sidebar (a rosette in the coloring it shows, at the piece's
  scale, the card scrolled into view) and every piece placed from it glows. It works read-only too.
  Owner, 2026-11-25: "what we should implement instead is a "find" tool (in the toolbar) that works
  like it does in a normal quilt (selects the clicked-on block/rosette/shape)".
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
  Free / Square / Triangle, which also sets the grid drawn), angle labels dragged side to side (right
  widens, left narrows) in sidebar-set steps, locked corners that no tool moves, and edge lengths shown in units and fractions.
  Tools: Vertex, Edge, Angle, Lock vertex, Delete. Shapes have no base unit or scale of their own. Owner,
  2026-11-10: "nodes feel like they should be draggable. I don't like having to type in an angle. I
  also want to allow non-unit edges as long as the user is specifically picking to implment one.
  let's support locking a vertex so that it can't be moved. let's also support dragging the angle
  markers (drag up to increase the angle, down to decrease the angle, increments set in the sidebar.
  the "draw on a grid" mode feels a lot better for dragging vertices. let's have a "vertex grid
  snapping" setting for "free/square/triangle" that also changes the grid that is shown. in the
  toolbox we can have an angle edit tool, and a vertex tool, an edge tool, and a lock vertex tool. I
  don't believe base unit matters for blocks and there's no reason to set a scale since we can just
  show a 1u grid and the user will see the number of units (or fractional units) an edge is". Then: "when starting an EPP shape, start with a
  viewport that's roughly 8u x 8u. not 3u x 3u. the drag point for shape angle should start on the angle value's label, not on the edge. the control
  should be side-to-side from the label with the label itself representing 0 change and to the
  right representing an increasing value, to the left representing decreasing"
- **FR-007**: EPP shapes and rosettes (spec 050) MUST be library items: built-in starters, My library, packs,
  embedding, sync and credits, as blocks are (specs 008, 009, 011).
  - **FR-007a** (0.9.3, found by the export and import test the owner asked for on 2026-11-25): a
    rosette carries its own colors and fabrics as a block does, into My library (and so backups,
    zips with images and packs) and in its `.rrqepp` file, where its fabrics' images go embedded
    and are stored on import. Before, a rosette placed from My library in another project, or a
    `.rrqepp` opened on another device, lost its own fabrics' images (and a library rosette its own
    colors).
- **FR-008**: Printing MUST produce paper templates (no seam allowance) and fabric templates (with
  seam allowance) at true size, with counts per fill, labels, packing and yardage.
- **FR-009**: The project format MUST gain a version with EPP quilts, shapes and pieces, and a
  migration (spec 003); loaded EPP data is validated like the rest.
- **FR-010** (0.9.0, owner 2026-11-23): A 3D EPP quilt type MUST support explicit seams between
  equal edges (shared edges are seams already) and a 3D assembly tab that folds the net with every
  seam as a hinge, pulls separate assemblies together, reports seams that don't close, stuffs a
  closed design (saying whether it can be stuffed and why not), and prints the net with its explicit
  seams colored (not numbered, owner 2026-11-24) and the folded object below it (the assembly sheet is the quilt picture; owner,
  2026-11-23: "the print out should show both 2d and 3d view"). In the print preview a click on
  the 3D view swaps in a live view to turn by dragging; the pointer leaving or 15 seconds untouched
  swap the picture back, seen from there, and that view is saved with the quilt (`epp.printView`). In
  the 3D assembly tab, hovering a seam in the flat net (or pressing and holding it on touch) picks it
  out: its edges (both, for an explicit seam) glow and the other seams fade, and in the 3D view its
  stitches show, closed up too, thicker and brighter, while the others fade. Owner, 2026-11-24:
  "when hoving or long pressing a seam in the 2d view, it fades out the other seams and highlights
  that seam's made in the 2d view and in the 3d view, it fades the other seams and highlights the
  active seam's stitching". Under the fold result, the count of edges in no seam and a **Highlight
  unsewn edges** switch (a view setting): those edges in amber on the net and as tubes on the
  object, the pieces faded (see-through in 3D). Owner, 2026-11-24: "let's add a toggle near the note
  about how the fold solve went that will highlight the edges that arent part of a seam and fade the
  rest". Beside it **Highlight stretched seams**: seams whose ends stay more than 0.1U
  apart once folded, counted, their edges and stitches (shown closed up too) in pink, the rest
  faded. Owner, 2026-11-24: "let's also add a toggle for highlighting seams that are being stretched
  in the fold because they're crossing really far or something. threshold should be 0.1u,
  maybe?". A seam counts as closed when its ends meet within 0.04U (was 0.02U). Owner,
  2026-11-24: "for determining closing, let's allow up to 0.04U gaps".
  Owner, 2026-11-23: "let's allow click-to-orbit on the 3d preview in the printout. we'll record
  the orientation. clicking switches from showing an image to the orbitable view and mouse exit or
  15seconds uninteracted will revert back to image view".
- **FR-011** (stretch, built in 0.9.0): The app SHOULD export STL cutting templates for paper
  and fabric (convex pieces; see the stretch goal story).
- **FR-012**: Everything works offline; 3D rendering, any solver and STL export run in the app with
  no server calls.
- **FR-013**: Libraries and projects MUST have an **EPP** section next to Blocks and Palettes, holding
  EPP shapes and rosettes (spec 050), never mixed into the block lists. Library shapes and
  rosettes are grouped by library and then category with the block lists' collapsible sections
  (`BlockSections`): in a project's EPP tab after Mine (a library item the project holds shows as
  its copy, marked used; one no library here has goes under Other libraries), and under each
  library on the Libraries page (always by category). Owner, 2026-11-16: "let's update the EPP
  project & library tabs to do grouping for shapes / rosettes by library source. let's use the
  same UI components for that grouping as we use in the block interface."
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
  A rosette matches a space's shape only when its outline is exactly that shape: its pieces fill a
  regular hexagon, equilateral triangle, 60° diamond or square with no gap or overlap, every side one
  straight edge. Owner, 2026-11-12: "we want to require that the edges are actually the required
  shape, not the required shape only after cutting. so for example if it counts as a hexagon, it
  needs a perimeter with 6 fully straight edges." (Of the built-in rosettes, the Tumbling Block is a
  hexagon; the Hexagon Flower, Six-Diamond Star and Octagon and Square aren't.) A square rosette goes
  only in square spaces: rosettes are never stretched. Built 2026-11-12: a placed rosette is a hidden
  block made from it (`block.rosette`), rebuilt on every change; the tray's Blocks tab has a Blocks /
  Rosettes switch when some rosette fits the quilt, tiles badged EPP. In print, its patches stay out
  of rotary cutting and come under Templates as "Paper templates: rosettes" and "Fabric templates:
  rosettes" (the fabric ones with the print's seam allowance), and count in the yardage.
- **FR-016** (built 2026-11-16): A block quilt's Layout tab MUST offer **Even edge length**, a
  section under the block size (a strip quilt's strip length), collapsed by default: pick a block
  placed in the quilt's block spaces (a rosette in a block quilt counts as a block), one of its
  patches, and one of the patch's straight edges. It shows that edge's finished length where the block sits and every 1/8 inch (cm
  projects: 1 mm) from the whole inch (cm) below it to the one above (a whole-inch edge: the inch on
  each side, its own length greyed out), each with the block size it gives. Choosing one scales the block size so the edge is that length: width and
  height together (patches keep their shape), sashing and borders unchanged, strip quilts by their
  length. Not in EPP quilts, where 1U already sets edge lengths. A block used at two sizes is listed once per size. Owner, 2026-11-16:
  "let's add a utility to the quilt layout interface that will adjust the block size so that a
  user-selected patch from a user chosen block (that's currently in use in the quilt) has an edge
  length that's nicely rounded. this utility will be in a (normally collapsed) subsection of the
  block size setting after picking. after selecting the block and patch, the user should then be
  able to pick one of the edges of the patch and then the block size is set to a value that makes
  that chosen edge a nice length. this feature should work on both block and epp quilts, and if
  chosing an epp "block" in a block quilt, should also function." Owner's answers: pick from nearby
  lengths, keep proportions; named "even edge length". Owner, later the same day: "actually, let's
  skip this feature on EPP quilts since it's already addressed by the U system. it's only necessary
  on block quilts (including ones that use EPP blocks". And: "the increments shown in the interface
  should be in 1/8" incrments or 1mm increments and should, between the min and max value shown,
  show all increments of that amount".

### Key Entities

- **EppShape**: id, notecard, outline (vertices in units, locked corners, edges marked as not whole
  units), default fill, credits, license; its own library item type, in the EPP section (FR-013).
- **EppQuilt**: base dimension, seam allowance, edge (none / cut to size / auto-close with its
  closing pieces' fill / custom outline), optional binding and borders (off by default), pieces, groups, colorways; a 3D EPP quilt (`threeD`) also has explicit `seams` and a `front` piece.
- **Piece**: shape ref, position, turn, mirror, scale (1-4), fill.
- **Rosette**: see spec 050 (a saved group used like a shape).
- **Explicit seam** (formerly "join"): two (piece, edge) pairs of equal length that don't touch in
  2D; each end names a placed piece, the rosette piece inside it, and an edge of its shape (rrq v12
  `epp.seams`, data-model.md).

## Success Criteria *(mandatory)*

- **SC-001**: A quilter lays out a 19-hexagon flower (one middle, two rings) in under 3 minutes, every
  hexagon flush with its neighbors.
- **SC-002**: Printed paper templates measure within 0.5 mm of the finished size; fabric templates
  are exactly one seam allowance larger on every side.
- **SC-003**: A custom shape saved to a pack opens in another person's app and places and prints the
  same.
- **SC-004**: The five-diamond star folds in the 3D view with every seam closed (every hinge about
  42°, test/vitest/__tests__/model/epp/fold.spec.ts).

## Assumptions

- Shapes are straight-sided and convex in the first release (no curves); their corners can be any
  angle under 180°.
- An EPP quilt has no target rectangle; the wizard's target sizes (spec 006) don't apply, though a
  size to aim at may be shown as a guide.
- An EPP quilt is a whole quilt. Rosettes can fill block spaces in block quilts (FR-015); loose EPP
  pieces in a block quilt and appliqué onto a background are later.
- Snap distance is in screen space (about the size of a fingertip), so it works zoomed in or out.
- 3D needs a new dependency, three.js (owner, 2026-11-19), for the 3D view; the fold and the
  stuffing are solved in our own code (pieces as rigid plates, seams as hinges, then fabric under
  pressure). The justification is in plan.md; it's bundled for offline use and loaded only when a
  3D assembly tab opens.

## Out of Scope (first release)

- Drawing custom shapes straight into the quilt design (shapes are made in the shape editor).
- 3D libraries of objects (User Story 8). STL cutting templates were a stretch goal and came in
  0.9.0 (convex pieces).
- Fussy-cutting fabric inside a piece, curved shapes, and appliqué onto a background.
