# Feature Specification: First Quilt — Sketchbook, Layout, Blocks, Color

**Feature Branch**: `006-first-quilt`

**Created**: 2026-10-11

**Status**: Draft

**Input**: User description: "First working version: a real project sketchbook, the quilt editor's
Layout / Borders / Design modes for the Horizontal layout, setting blocks (this / all / alternate,
rotate, flip), coloring with solid colors, a small starter set of blocks and colors, and undo/redo."

> Implements spec 001 US1–US4 (P1) on top of the `.rrq` model (003) and saving (004), using the
> screen structure of spec 004. Out of scope here: drawing blocks, fabrics/images, other layout
> styles and pieced border styles, printing, libraries UI, compare view.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start a quilt and design it end to end (Priority: P1)

A quilter starts a quilt from the wizard, places starter blocks in alternating spaces, colors it,
and saves it.

**Why this priority**: The first moment the product is useful to a quilter (spec 001 SC-001).

**Independent Test**: From Home, reach a 5×5 quilt with a border, two blocks in alternating spaces,
recolored, saved to a file, in under 10 minutes without help.

**Acceptance Scenarios**:

1. **Given** Home, **When** the user taps "Start a quilt", **Then** a three-step skippable wizard
   (layout size and block size → sashing → borders) creates a new project with one quilt and opens
   the quilt editor in Design mode with the starter blocks and colors in the tray.
2. **Given** a project already open, **When** the user starts a quilt from the sketchbook, **Then**
   the wizard adds a quilt to that project.
3. **Given** the quilt editor, **Then** the finished quilt size (with borders) and center size are
   always visible.

---

### User Story 2 - Sketchbook (Priority: P1)

The quilter sees all quilts and blocks in the project as cards, opens, duplicates, renames,
reorders, and deletes them.

**Why this priority**: The project's home base; variations live here.

**Independent Test**: Make two variations of a quilt, rename one, reorder them, delete the other,
reopen the project: state matches.

**Acceptance Scenarios**:

1. **Given** an open project, **Then** the sketchbook shows Quilts and Blocks tabs with thumbnail
   cards; Fabrics & Colors, Photos, and Threads tabs show their lists (colors only in this feature).
2. **Given** a card, **When** the user opens it, **Then** its editor opens (quilt editor; blocks show
   a read-only preview until the block editor exists).
3. **Given** a quilt card, **When** "Duplicate as variation" is chosen, **Then** a copy named
   "<name> (2)" appears next to it and opens.
4. **Given** a card, **When** the user edits its notecard (name, notes), reorders by dragging, or
   deletes it, **Then** the change is saved; deleting a block used in a quilt is refused with the
   quilts that use it; deleting a quilt asks for confirmation.

---

### User Story 3 - Lay out the quilt (Priority: P1)

In Layout and Borders modes, the quilter sets block count and size, sashing, sash border, and
borders, and sees the quilt update live.

**Why this priority**: The layout is the skeleton of every quilt.

**Independent Test**: Change a filled 5×6 quilt to 6×6 with 2" sashing and two borders; placed
blocks stay; finished size matches hand calculation.

**Acceptance Scenarios**:

1. **Given** Layout mode, **When** the user changes columns, rows, block width/height (lockable
   square), sashing width/height (lockable), or sash border, **Then** the quilt redraws immediately.
2. **Given** a change that removes slots holding blocks, **Then** the user is warned with the count
   and can cancel (spec 003 FR-057).
3. **Given** Borders mode, **When** the user adds (outside), inserts (inside selected), deletes,
   clones, or reorders borders and sets style (long horizontal, long vertical, mitered) and side
   widths (all / left+right / top+bottom / each), **Then** the quilt redraws immediately.
4. **Given** any length field, **Then** values are entered and shown in the project's units with
   decimal input and quick steps (¼" or 0.5 cm).

---

### User Story 4 - Set and arrange blocks (Priority: P1)

In Design mode, the quilter places blocks into spaces and rotates, flips, or erases them, applying
to this space, all spaces, or alternate spaces.

**Why this priority**: Setting blocks is the core design act.

**Independent Test**: Fill a quilt with block A everywhere, block B in alternate spaces, rotate all
B's once, flip one; erase one; undo restores it.

**Acceptance Scenarios**:

1. **Given** a block selected in the tray, **When** the user taps a space with scope This / All /
   Alternate, **Then** the block is set there / in every block space / in every other block space
   (checkerboard), replacing what was there; the placed block uses the block's default coloring.
2. **Given** the Rotate, Flip, or Erase tool, **When** the user taps a placed block with a scope,
   **Then** it rotates 90° clockwise, mirrors left-to-right, or is removed, for the scope.
3. **Given** the Find tool, **When** the user taps a placed block, **Then** that block is selected in
   the tray.

---

### User Story 5 - Color with solid colors (Priority: P1)

The quilter colors patches, sashing, cornerstones, and borders with solid colors, one at a time or
in bulk, and adds their own colors.

**Why this priority**: Color is where quilters spend most design time.

**Independent Test**: Color one patch in one block, the same patch in all identical blocks, every
patch of one color across the quilt, and the sashing; add a custom color and use it.

**Acceptance Scenarios**:

1. **Given** Paint with scope This / All / Alternate, **When** the user taps a patch, **Then** that
   patch is colored in this block / all identical blocks / alternate identical blocks (spec 003
   copy-on-write; other blocks unaffected).
2. **Given** Spray, **When** the user taps a patch, **Then** every patch with the same color in that
   block (This) or in all blocks on the piecing layer (All / Alternate) changes.
3. **Given** Swap, **When** the user taps a patch, **Then** every patch with that color anywhere in
   the quilt (blocks, sashing, borders) changes.
4. **Given** a sash, cornerstone, or border, **When** painted, **Then** it is colored as a plain
   piece; All paints every sash / every cornerstone / every side of that border.
5. **Given** Eyedropper, **When** the user taps a patch, **Then** its color becomes the selected
   color.
6. **Given** the colors tray, **When** the user adds a color (visual picker, hex, RGB, or HSL),
   **Then** it is added to the project's colors; recently used colors are shown first.
7. **Given** an unfilled patch, **Then** it is drawn with a neutral hatch so it is visibly unfilled.

---

### User Story 6 - Undo and redo (Priority: P1)

Every design change can be undone and redone within the session.

**Why this priority**: Exploration is only safe if mistakes are cheap (spec 004 FR-026).

**Independent Test**: Make 20 changes across modes, undo all 20, redo 10; state matches each step.

**Acceptance Scenarios**:

1. **Given** any change, **When** the user presses Undo (button or Ctrl/Cmd+Z), **Then** the project
   returns to the previous state; Redo (Ctrl/Cmd+Shift+Z or Ctrl+Y) re-applies it.
2. **Given** an undo after saving, **Then** the status becomes "Unsaved changes".
3. **Given** a slider drag or typed number, **Then** one gesture is one undo step.

---

### User Story 7 - See the quilt clearly (Priority: P1)

The quilter zooms, pans, fits the quilt to the view, and reads sizes, on desktop and tablet.

**Why this priority**: Every other story happens on this canvas.

**Independent Test**: On a tablet, pinch-zoom into a corner block, pan, fit; on desktop use wheel
zoom, drag-pan, and Fit.

**Acceptance Scenarios**:

1. **Given** the canvas, **Then** zoom (buttons, wheel/pinch), pan (drag in Pan mode, two-finger
   drag, space+drag), and Fit are available; the canvas background is neutral gray.
2. **Given** a selected or hovered space, **Then** its finished size is shown.
3. **Given** a 30×30 quilt (900 blocks), **Then** setting or coloring shows the result in under
   100 ms on a mid-range laptop or tablet (spec 001 SC-007).

### Edge Cases

- Block set into a non-square or sash space → stretched to fit (spec 001).
- A block in the tray is deleted while placed → refused (US2).
- Coloring with "All" when the tapped block's coloring is shared with item placements → copy-on-write
  keeps others intact (spec 003).
- Layout change that removes colored sashes/borders → their colors are dropped with the slots; the
  warning counts only blocks.
- Units are centimeters → steps are 0.5 cm; starter block sizes convert.
- Read-only tab (spec 004) → editors are viewable, tools disabled.
- Undo history is per session and cleared when the project is closed or another tab takes over.

## Requirements *(mandatory)*

### Functional Requirements

**Wizard & sketchbook**

- **FR-001**: "Start a quilt" MUST open a three-step skippable wizard (columns/rows + block size,
  sashing + sash border, borders) defaulting to 5×5 blocks of 10" (25 cm), no sashing, one 2" (5 cm)
  long-horizontal border. *Amended by spec 016 FR-013: the first step also picks the style
  (Horizontal or On-Point), and a live preview shows the quilt as choices are made.*
- **FR-001a**: The wizard's first page MUST pick the layout style and a target size: None (default),
  Placemat 18 × 13, Table runner 72 × 14, Wall hanging 36 × 36, Throw 50 × 65, or a bed by its
  mattress top: Crib 28 × 52, Twin 39 × 75, Double (Full) 54 × 75, Queen 60 × 80, King 76 × 80,
  California King 72 × 84 (in inches). cm projects list the other sizes in rounded cm (46 × 33, 183 × 36, 91 × 91, 127 × 165,
  Crib 71 × 132) and European beds (owner, 2026-10-16): Single 90 × 200, Single (XL) 100 × 200,
  Small double 120 × 200, Standard double / Queen 140 × 200, Queen (Europe) / King 160 × 200, Super
  King (Europe) 180 × 200, Emperor / Grand King 200 × 200. A bed adds a **drop** over the sides and
  foot, editable: 12″ for Twin and Double, 14″ for Queen and King, 30 cm up to 140 wide, 35 cm
  wider, 0 for Crib. A **Pillow tuck** checkbox (beds, off by default) adds extra at the head
  (12″ / 30 cm, editable) for bedspread-style quilts. A **US sizes / European sizes** switch picks the
  list (shown in the project's units; inches to the half, cm whole); it starts from the units
  preference and, once changed, is remembered (setting `bedSizes`). **Tall (XL)** makes Twin and
  Double 80″ long and European 200 cm beds 210 cm. The list is grouped (labels set into divider lines): None, Custom (width ×
  height fields), Table, wall, and lap, then Beds (mattress size), each name on the left and its
  size on the right. Switching lists keeps Custom (and its values) and sizes both lists share.
  A **Garments** group (before Beds) offers **Top** (Front, Back, or Sleeve with a sleeve length from
  shoulder to hem, starting at the size's full arm length) and **Pants** (Front or Back), Women's or Men's (on one row with the piece switch). Tops come in XS to XXL (European 34 to 44
  for women, 44 to 54 for men); pants in US women's misses sizes 0 to 18 (European US + 32) or men's
  waist sizes 28 to 42 in inches (European about the waist + 16), with an **Inseam** field (30½″
  women, 32″ men, editable). A "?" shows the size chart of body measurements for the list shown. The outline
  takes the piece's shape, drafted from that size (`src/model/garments.ts`: hip-length top with 4″
  ease, the front one side of a buttoned front with a 1″ button stand, the back whole as cut on
  the fold; set-in sleeve; one trouser leg, laid out as patterns show it: a straight, fairly wide leg with nearly straight
  side seams and a smoothly hollow inseam; the front with center front on the left, a slanted
  pocket opening, and a 1.5″ fly extension cut on; the back with a waist dart and its center seam
  slanting in and up toward the waist, running into the J-shaped crotch). It's a size guide, not a sewing pattern. Picking a garment sets the
  borders to none (garment pieces have none); leaving garments brings the default border back. With a
  size picked, the live preview MUST show it as a transparent outline over the quilt, centered on
  it: the outer outline is the size with its drop and tuck, and a fine outline inside marks the mattress top
  at the head. The footer shows the quilt's finished size and the target's. Counts, block sizes,
  and other layout settings are on the second page, headed with the layout's name ("Size"; "Shape" for One Patch,
  "Strips" for strip quilts). The target is saved with the quilt (optional `target` on a
  quilt, format v6, `src/model/targets.ts`): visibility, the choices made, and the resolved outline
  (and mattress rectangle) in project units, so the outline still draws if the size lists change;
  unit conversion converts it. Older quilts have none. The Layout tab's **Reference overlay** section (Layout and Reference overlay are its two sections; each layout's settings are grouped under divider lines with the group's name set into them, as on the wizard's Size page)
  adds, changes, shows or hides (Show), or removes (None) it, with the same controls as the wizard;
  the editor draws it centered on the quilt, and Fit includes it. *Added and built 2026-10-16
  (owner).*
- **FR-002**: ~~New projects MUST start with the starter blocks and colors~~ — superseded by spec 008:
  starter content is a built-in library; projects embed library items only while used.
- **FR-003**: The sketchbook MUST show tabbed card grids with thumbnails rendered from the model;
  actions: open, duplicate as variation, edit notecard, reorder (drag), delete (guarded).

**Quilt editor**

- **FR-010**: The quilt editor MUST follow spec 004's layout: mode tabs Layout · Borders · Design ·
  Print (Print shows "coming soon"), tool rail, canvas, inspector, bottom bar with "Apply to"
  toggle and palette tray.
- **FR-011**: Layout mode MUST edit the Horizontal layout parameters with live redraw; other layout
  styles are listed as "coming soon".
- **FR-012**: Borders mode MUST support add/insert/delete/clone/reorder and the three generated border
  styles with side-size locks; other styles listed as "coming soon".
- **FR-013**: Layout/border changes that would drop placed blocks MUST warn with a count before
  applying.
- **FR-014**: Design mode tools: Set block, Rotate, Flip, Erase, Find (blocks); Paint, Spray, Swap,
  Eyedropper (color); Pan. All honor the "Apply to" scope where meaningful.
- **FR-015**: Sashes, cornerstones, and border sides MUST be paintable as plain pieces.
- **FR-016**: Finished size and center size MUST be always visible; the hovered/selected space's
  finished size is shown.

**Colors**

- **FR-020**: Users MUST be able to add colors by visual picker, hex, RGB, or HSL, rename them, and
  reorder or delete unused ones; used colors cannot be deleted without confirmation (patches fall
  back to unfilled).
- **FR-021**: The tray MUST show most-recently-used colors first, then the project's colors.

**Starter content**

- **FR-030**: The app MUST bundle original starter content (CC-BY-4.0; packaged as a spec 002 `pack`
  when the libraries feature lands) of 12 classic blocks — Four Patch, Nine Patch, Half-Square Triangle, Pinwheel, Hourglass, Flying
  Geese, Square in a Square, Rail Fence, Log Cabin, Churn Dash, Ohio Star, Drunkard's Path — each
  with a default two- or three-color coloring, plus a palette of 36 solid colors.
- **FR-031**: Starter blocks are drawn as seam-line blocks so they derive patches with the spec 003
  model.

**Undo**

- **FR-040**: Every change through the project store MUST be undoable/redoable within the session
  (at least 200 steps); continuous gestures coalesce into one step.

**Canvas**

- **FR-050**: The canvas MUST render the quilt from generated slots and block patches, with patch
  outlines toggleable, unfilled patches hatched, and zoom/pan/fit by mouse, keyboard, and touch.
- **FR-051**: Hit-testing MUST resolve a tap to the space and patch under it at any zoom.

### Key Entities

- Uses spec 003 entities. New: **Starter pack** (bundled `.rrqlib`), **Undo history** (session only),
  **Tool state** (current tool, scope, selected block/color; remembered per session).

## Success Criteria *(mandatory)*

- **SC-001**: A first-time user designs, colors, and saves a 5×5 quilt with a border in under 10
  minutes without help (spec 001 SC-001).
- **SC-002**: Setting or coloring on a 900-block quilt responds in under 100 ms.
- **SC-003**: 100% of actions in this feature work with touch only on a tablet.
- **SC-004**: Every change is undoable; undo/redo of 200 steps reproduces each intermediate state.
- **SC-005**: Finished sizes shown match hand calculation for every layout/border combination.

## Assumptions

- Only the Horizontal layout and the three generated border styles exist in the model so far.
- Fabrics, block drawing, printing, and the full original library are later features.
- Starter blocks are original drawings of traditional public-domain patterns (no reference-software
  content).
- Phone screens stay view-only (spec 004).
