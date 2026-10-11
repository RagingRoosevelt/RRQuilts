# Feature Specification: Project File Format & Data Model (`.rrq`)

**Feature Branch**: `003-project-format`

**Created**: 2026-10-11

**Status**: Draft

**Input**: User description: "Define the `.rrq` project format and data model. Decimal measurements
for inches and cm. Store patches derived from seam lines (with stable ids). Keep circular arcs and
Béziers distinct. Colorings and layers per proposal."

> Defines the data shared by `.rrq` (spec 001) and `.rrq_lib` items (spec 002). Item schemas here are
> used unchanged in libraries. Requirement IDs are local to this spec.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Designs survive save and reopen exactly (Priority: P1)

A quilter saves a project with quilts, drawn blocks, colorings, fabrics, and photos; reopening it on
any device and any later app version shows exactly the same design.

**Why this priority**: The file is the product's memory; any loss destroys trust.

**Independent Test**: Round-trip a project containing every item type; compare rendered quilts and
printed template dimensions before and after.

**Acceptance Scenarios**:

1. **Given** any project, **When** saved and reopened, **Then** every quilt, block, coloring, layer
   item, palette entry, asset, and notecard is identical.
2. **Given** a file from an older schema version, **When** opened, **Then** it is migrated and renders
   the same.
3. **Given** a file opened on a device without the libraries it came from, **When** opened, **Then**
   nothing is missing (projects are self-contained).

---

### User Story 2 - Edits to a block keep its colors (Priority: P1)

A quilter adds a line to a seam-line block that is already colored in a quilt; unaffected patches
keep their fabrics, and the split patch's pieces inherit the original fabric.

**Why this priority**: Re-coloring after every drawing tweak would make drawing unusable.

**Independent Test**: Color a nine-patch, split the center with a diagonal, confirm all eight outer
patches keep their fabrics and both triangles inherit the center fabric.

**Acceptance Scenarios**:

1. **Given** a colored block, **When** seam lines change, **Then** patches are re-derived and each new
   patch takes the fill of the old patch it overlaps most; untouched patches keep their ids.
2. **Given** foundation sections referencing patches, **When** patches change, **Then** sections are
   updated or flagged for re-sectioning.

---

### User Story 3 - Changing a layout keeps what still fits (Priority: P2)

A quilter changes a 5×6 quilt to 6×6 or adds sashing; blocks already placed stay where they were.

**Why this priority**: Layout iteration is constant during design.

**Independent Test**: Fill a 5×6 quilt, change to 6×6, confirm the original 30 blocks keep position,
rotation, and coloring; the new column is empty.

**Acceptance Scenarios**:

1. **Given** a placed layout, **When** counts change, **Then** content in slots that still exist is
   kept; content in removed slots is dropped only after the user is told.
2. **Given** units switched from inches to cm, **When** applied, **Then** all quilt measurements
   convert once and block shapes are unchanged.

---

### Edge Cases

- Seam-line drawing where derivation fails (unconnected segments) → segments saved as drawn; flagged
  segments listed; previously stored patches retained until fixed.
- Overlapping or self-intersecting appliqué patches → saved as drawn; flagged as non-printable.
- Reference to a missing fabric/color/thread/block/photo id → load succeeds, reference shown as
  "missing" (hatched), reported once.
- Duplicate ids → file rejected with a clear message (corruption).
- Arc with zero or ±360° sweep → invalid; full circles are two arcs.
- Block stretched into a slot with different proportions than its designed size → its arcs render
  and print as the corresponding elliptical arcs (affine image); stored arcs are unchanged.
- Block's designed proportions changed (e.g., 6×6 → 6×10) → arcs are re-evaluated at the new
  proportions; the user is shown that curved seams change shape.
- Very large projects (embedded photos) → user warned of file size; offered clean-up (spec 001 FR-005).

## Requirements *(mandatory)*

### Functional Requirements

**File envelope**

- **FR-001**: A `.rrq` file MUST be UTF-8 JSON with `format: "rrq"`, integer `version`, `app` (writer
  version), `units` (`"in"` | `"cm"`), and `project`.
- **FR-002**: All lengths MUST be stored as decimal numbers in the file's `units`. Changing units MUST
  convert every length once (block geometry is normalized and unaffected, FR-030). Comparisons MUST use a tolerance; rounding happens only for display and
  printing.
- **FR-003**: Every item MUST have an id unique within the file; references use ids.
- **FR-004**: Unknown keys MUST be preserved on round-trip where practical; older versions MUST
  migrate forward; newer versions MUST be refused with "update the app".
- **FR-005a**: Items copied between files with different `units` MUST be converted to the
  destination's units.
- **FR-005**: Projects MUST be self-contained: all assets embedded (packed form, as in spec 002), and
  items from libraries copied in with `source` (`libraryId`, `itemId`, `revision`).

**Project**

- **FR-010**: `project` MUST contain `id` (stable across renames; new for copies), `name`, `palette` (`fabrics`, `colors`, `threads`), `blocks`
  (blocks, motifs, stencils, frames), `photos`, `embroidery`, `quilts`, and `fonts` used by text.
- **FR-011**: Every item MUST carry a `notecard` (`name`, `notes`, `reference`, `tags`; blocks also
  `categories`).
- **FR-012**: Sort order of every list MUST be stored (list order is display order).

**Palette**

- **FR-020**: Fabric: image asset, real-world `size` [w, h] in file units (true scale), `average`
  color, `manufacturer`, `sku`.
- **FR-021**: Color: RGB. Thread: name, number, manufacturer, RGB.

**Geometry**

- **FR-030**: Block geometry MUST use normalized coordinates (0…1 across the block's width and
  height). A block MUST also store its designed `size` [w, h] in file units; geometry never changes
  when units change or the block is resized — only `size` (or the slot) does.
- **FR-031**: Paths MUST be JSON command lists with three distinct segment kinds:
  - `["M", x, y]` move, `["L", x, y]` line,
  - `["A", x, y, sweep]` **circular arc** from the current point to (x, y) with signed central angle
    `sweep` in degrees (positive = counter-clockwise, 0 < |sweep| < 360). The arc is circular at the
    block's designed proportions: to evaluate it, scale the endpoints by `size`, take the circular
    arc, and scale back. For square blocks (the common case) it is circular in 0…1 space as well,
  - `["C", x1, y1, x2, y2, x, y]` **cubic Bézier**,
  - `["Z"]` close.
  Arcs MUST NOT be converted to Béziers on save; each kind round-trips as itself.
- **FR-032**: Editable nodes MUST record handle type (`corner`, `cusp`, `smooth`, `symmetric`) where
  curves meet.
- **FR-033**: Seam-line blocks MUST store the drawing (nodes and segments: line, arc, or Bézier) as
  source of truth **and** the derived patches with stable ids. Files load from stored patches without
  re-deriving.
- **FR-034**: After a seam-line edit, patches MUST be re-derived; unchanged patches keep ids; new
  patches inherit the fill of the old patch with greatest overlap (applies to every coloring of the
  block and every quilt coloring using it).
- **FR-035**: Patch-grid blocks MUST store closed patches as source of truth, plus the grid type and
  parameters used.
- **FR-036**: Appliqué blocks/motifs/stencils MUST store an ordered list of closed patches (order =
  stacking, first = bottom) and open stitch paths; appliqué blocks also store their background patch.
- **FR-037**: Combination blocks MUST store a pieced part (seam-line or patch-grid) and an appliqué
  part.
- **FR-038**: Blocks MUST also store foundation sections (ordered lists of patch ids, numbered),
  guides, snap/grid settings, and an optional tracing-photo reference with its fit/crop/lightness.

**Colorings**

- **FR-040**: A fill MUST be one of: `{ fabric, offset: [x, y], rotation }`, `{ color }`, or absent
  (unfilled).
- **FR-041**: A thread assignment MUST be `{ thread, style: "solid" | "dashed", weight }`, applicable
  to patch outlines and stitch paths.
- **FR-042**: A coloring MUST map patch ids → fill and outline/stitch ids → thread.
- **FR-043**: A block MUST store its list of saved colorings (its variations).
- **FR-044**: A quilt MUST store a coloring table; each placed block references one entry. Editing one
  placement MUST copy its coloring first (copy-on-write); "all identical blocks" edits the shared
  entry.
- **FR-045**: Sashes, cornerstones, border pieces, setting triangles, and one-patch cells MUST be
  treated as plain single-patch blocks so one coloring model covers the whole quilt.

**Quilts, layouts, layers**

- **FR-050**: A quilt MUST store `layout` and `borders` as parameters (style + counts + sizes + style
  options), never as generated shapes.
- **FR-051**: The app MUST generate slots deterministically from those parameters. Each slot has a
  stable id derived from its position (e.g., `b:r3c4`, `sash:h:2:3`, `border:1:top:4`), an outline,
  and an affine mapping from block design space into the slot (content clipped to the outline).
- **FR-052**: A quilt MUST have exactly three layers with fixed purposes: **piecing** (1),
  **appliqué** (2), **quilting** (3), each with a `visible` flag.
- **FR-053**: Layer 1 MUST store slot contents `{ slotId → { block, coloring, rotation, flip } }`;
  Custom Set layouts and all layers MUST store free-placed `items`.
- **FR-054**: A free-placed item MUST store `id`, `kind` (block, motif, stencil, photo, text,
  embroidery), reference, `x`, `y`, `w`, `h`, `rotation`, `skew`, `flip`, `clip`
  (`none` | `center` | `quilt`), and coloring; list order = stacking order.
- **FR-055**: Text items MUST store text, font id, size, bold/italic, alignment; fonts used MUST be
  embedded or reference bundled fonts by id.
- **FR-056**: Layer purpose MUST drive outputs: piecing and appliqué count toward yardage and print as
  patterns; quilting counts as thread only.
- **FR-057**: Content in slots removed by a layout change MUST be dropped only after warning.

### Key Entities

- **Project**, **Palette** (fabrics, colors, threads), **Block** (size, kind, geometry, patches,
  colorings, foundation, editor settings), **Path / Segment** (line, arc, Bézier), **Patch**,
  **Coloring**, **Fill**, **Thread assignment**, **Quilt** (layout, borders, coloring table, layers),
  **Slot** (generated), **Placed item**, **Photo**, **Embroidery**, **Font**, **Notecard**, **Source**.

### Example (abridged)

```json
{
  "format": "rrq", "version": 1, "app": "0.1.0", "units": "in",
  "project": {
    "name": "Ohio Star Sampler",
    "palette": {
      "fabrics": [{ "id": "f1", "notecard": { "name": "Indigo Dot" },
                    "image": { "data": "data:image/jpeg;base64,…", "type": "image/jpeg",
                               "sha256": "…", "width": 350, "height": 350 },
                    "size": [5, 5], "average": [38, 52, 110] }],
      "colors": [{ "id": "c1", "rgb": [250, 245, 230] }],
      "threads": []
    },
    "blocks": [{
      "id": "blk1", "kind": "seam", "size": [9, 9], "notecard": { "name": "Ohio Star" },
      "drawing": {
        "nodes": [{ "id": "n1", "x": 0, "y": 0 }, { "id": "n2", "x": 0.3333, "y": 0 }],
        "segments": [{ "id": "s1", "from": "n1", "to": "n2", "kind": "line" },
                     { "id": "s2", "from": "n2", "to": "n3", "kind": "arc", "sweep": 90 }]
      },
      "patches": [{ "id": "p1", "path": [["M",0,0],["L",0.3333,0],["A",0.5,0.1667,90],["Z"]] }],
      "colorings": [{ "id": "k1", "fills": { "p1": { "fabric": "f1", "offset": [0,0], "rotation": 0 } } }]
    }],
    "quilts": [{
      "id": "q1", "notecard": { "name": "Version A" },
      "layout": { "style": "horizontal", "cols": 5, "rows": 6, "block": [9, 9],
                  "sash": [1, 1], "sashBorder": true },
      "borders": [{ "style": "corner-blocks", "sides": [2, 2, 2, 2] }],
      "colorings": { "qk1": { "fills": { "p1": { "color": "c1" } } } },
      "layers": [
        { "visible": true, "slots": { "b:r1c1": { "block": "blk1", "coloring": "qk1",
                                                  "rotation": 0, "flip": false } }, "items": [] },
        { "visible": true, "items": [] },
        { "visible": true, "items": [] }
      ]
    }]
  }
}
```

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Save → reopen of a project containing every item type produces identical renders and
  template dimensions (within 0.001 file units).
- **SC-002**: Circular arcs and Béziers round-trip as their own kinds 100% of the time.
- **SC-003**: Splitting one patch of a colored block preserves fills on 100% of untouched patches.
- **SC-004**: Changing a layout's counts keeps 100% of content in surviving slots.
- **SC-005**: A project of 10 quilts, 100 blocks, 50 fabric images opens in under 3 s on a mid-range
  laptop.
- **SC-006**: Files from every released schema version open in the current version.

## Assumptions

- Arc sweep in degrees and decimal coordinates are precise enough at quilting scale with tolerance
  comparisons.
- Fixed three-purpose layers confirmed by the user (2026-10-11).
- Undo history, view state (zoom, selection), and app settings are not stored in projects.
- Exact JSON Schema files and slot-id grammar per layout style are produced during planning
  (`contracts/`).
