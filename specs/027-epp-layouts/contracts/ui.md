# UI contract: EPP section, shape editor, rosette editor, EPP quilt (specs 027, 050, 051)

## EPP section

- **Libraries** (`LibrariesPage.vue`): the type picker (`libraryType`) gains **EPP** next to Blocks and
  Palettes (and All). The EPP section lists shapes and rosettes with a **Shapes / Rosettes** filter,
  cards with a picture, name and author, the same menus as block cards (Add to project, Copy to My
  library, Sync, Tags, Export `.rrqepp`, Delete). Never mixed into block lists.
- **Project** (`SketchbookPage.vue` tabs): an **EPP** tab after Palettes, listing the project's shapes
  and rosettes (Mine / Library groups as blocks), with **New shape**, **New rosette**, **Import**
  (`.rrqepp`). Tapping a card opens its editor.

## Shape editor `/project/shape/:id` (`ShapeEditorPage.vue`)

- Tabs: **Details** (notecard, credits, license), **Draw**, **Print** (paper and fabric template of the
  shape at a chosen 1U length, for checking).
- Toolbar (rail): Undo, Redo, **Vertex**, **Edge**, **Angle**, **Lock vertex**.
- Sidebar: **Single shape / Multi-shape** switch, **Vertex grid snapping** (Free / Square / Triangle;
  the grid drawn follows), **Angle step** (default 15°).
- Canvas: 1U grid; each edge labeled with its length in units or fractions; locked corners show a
  lock; marked edges show a marker. Four flags per patch (Closes, No crossing, Whole units, Convex),
  green or red; a banner while any patch fails names them.
- Multi-shape: draw an outline and lines across; each closed area is a patch with its own flags;
  **Save** makes a self-contained rosette (internal shapes) and opens it in the rosette editor.
- No colors or fabrics anywhere in this editor.

## Rosette editor `/project/rosette/:id` (`RosetteEditorPage.vue`)

- Tabs: **Details**, **Design**, **Print**. Print shows `PrintPreview kind="rosette"` in place of the
  canvas and `PrintOptions kind="rosette"` in the sidebar: 1U length, number of rosettes, coloring,
  Paper / Fabric / Both, seam allowance, rosette sheet, test square, page and packing options. A
  paper and a fabric cutting template per patch, counted for that many rosettes. Also reachable from
  **Print** on a rosette card's menu (Libraries, project EPP tab), which opens this tab.
- Toolbar: Undo, Redo, **placement mode** three-way switch (Free / Grow / Grid); in Grid mode a
  **Drag grid** button right under it; Select, Turn, Mirror, Delete, **Break into patches**, **Close
  space**, Paint.
- Sidebar: Scale slider (1-4); **Place rosettes ungrouped** toggle at the top of the picker; picker of
  shapes and rosettes (Shapes / Rosettes filter); Grid mode **Sync grid to selected size**; colorings
  (add, copy, delete, palette swap) and the palette tray, as the block editor's Color tab.
- Free mode: a ghost of the picked shape follows the mouse (desktop) when not over a piece; drop
  snaps. Grow: tapping a free edge attaches the picked shape; while hovering an edge, picker cards
  show green (fits) or grey (doesn't). Grid: taps place on the grid.
- Placing a rosette into a rosette copies its pieces in (no link); a note says so once.
- Four patch flags and the banner apply to internal shapes (Close space).

## EPP quilt (`QuiltEditorPage.vue`, `layout.style = 'epp'`)

- **New quilt** (wizard): an **EPP quilt** choice asks name, 1U length and seam allowance.
- **Design** tab: the rosette editor's canvas, toolbar and picker, plus Make rosette (selection),
  colorways (`QuiltColorways`) and the quilt Paint scopes (This / All / Same shape / Same fill).
- **Layout** tab: `EppLayoutSection`: 1U length, seam allowance, Edge (No trimming / Cut to size /
  Auto-close / Custom trim) with its settings (size or sides; closing pieces' fill; outline editor).
- **Borders** tab: as today when the edge is made; with No trimming, a note "Pick an edge in Layout
  first" and a button to the Layout tab.
- **Print** tab: paper templates, fabric templates, counts per shape/scale/mirror/fill, yardage, the
  1 in test square, rosette sheet; pieces outside a trim faded and left out.

## Multi-select (spec 051, later phase)

- Tap with Shift/Ctrl, box drag, long-press then tap on touch, Select all, Select same; the selection
  moves, turns, mirrors, scales and snaps by its outside edges; Copy/Paste/Duplicate/Delete; Paint
  scope **Selection**; Make rosette; Break into patches.

## Rosettes in block quilts (later phase)

- Quilt editor sidebar, Blocks: a **Rosettes** filter; rosette cards carry an EPP badge; only rosettes
  whose outline matches the space (square, triangle, 60° diamond, hexagon) are offered.
- Print: an **EPP templates** section with a paper template and a fabric cutting template for every
  patch of the placed rosettes (counts by shape, size, fill); rosettes are left out of rotary cutting,
  block templates and foundation patterns.
