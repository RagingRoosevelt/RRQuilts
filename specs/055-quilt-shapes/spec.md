# Feature Specification: Quilt Shapes (Non-Rectangular Quilts)

**Feature Branch**: `TBD` (target 0.11.0)

**Created**: 2026-11-10

**Status**: Draft (spec only; not implemented).

**Input**: Owner, 2026-11-10: "let's add a spec for non-rectangular quilts. we'll have final shape
options of rectangular, circular, diamond, or other regular or irregular polygons".

Related: spec 006 (quilt wizard, target sizes and their outlines), spec 016 (layout engine,
clipping to the quilt), spec 026 (shaped blocks), spec 010 (printing, templates, yardage), spec 027
(EPP quilts: Cut to size, Auto-close and Custom trim edges), spec 003 (project format).

## Today

- A quilt is a rectangle. The layout engine clips block spaces to the quilt rectangle
  (`model/layout/clip.ts`, straight and curved outlines kept true).
- A **target size** (spec 006 FR-001a) can be a non-rectangular outline (garments), but it is only
  drawn over the quilt as a guide; nothing is cut to it.
- Borders and binding go around the rectangle.

## Concepts

- **Quilt shape**: the finished outline the quilt is cut to. One of:
  - **Rectangle** (today's quilts, the default).
  - **Circle** (and, by stretching it, an oval).
  - **Diamond** (a rhombus: the quilter sets the width and height, or the side and an angle).
  - **Regular polygon**: 3 to 12 equal sides (triangle, pentagon, hexagon, octagon...), set by size
    across and a turn.
  - **Irregular polygon**: an outline the quilter draws or edits, straight sides with corners
    snapping to the layout grid.
- **Cut away**: everything outside the shape. Block spaces crossing the outline are trimmed as they
  are at the rectangle's edge today; spaces wholly outside are dropped.

## User Scenarios & Testing

### User Story 1 - Pick a quilt shape (Priority: P1)

A quilter wants a round table topper: a 40 in circle cut from a block layout.

**Independent Test**: New quilt, layout Horizontal, shape Circle, 40 in across. The design shows
the blocks cut to the circle; the Layout tab can change it to Hexagon and back.

**Acceptance Scenarios**:

1. **Given** the quilt wizard and the Layout tab, **Then** a **Shape** setting offers Rectangle
   (default), Circle, Diamond, Regular polygon and Irregular polygon, each with its size settings.
2. **Given** a shape, **Then** the layout fills its bounding box and is cut to the outline; block
   spaces and patches crossing it are trimmed with true straight and curved edges.
3. **Given** a target size with an outline (spec 006), **Then** the quilter can use that outline as
   the quilt shape.
4. **Given** the shape is moved or turned over the layout, **Then** the layout stays put and the cut
   follows, so the quilter picks which part of the design shows.

---

### User Story 2 - Borders and binding follow the shape (Priority: P1)

**Acceptance Scenarios**:

1. **Given** a shaped quilt with borders, **Then** each border runs around the outline at its
   width: corners of polygons are mitered, a circle's border is a ring.
2. **Given** a curved shape, **Then** binding is noted as bias binding with its length, and only
   border styles that can follow a curve (plain borders) are offered on curved sides.
3. **Given** a polygon, **Then** pieced border styles work side by side as on a rectangle, with
   corner treatments at each corner where the style allows it.

---

### User Story 3 - Print and count a shaped quilt (Priority: P1)

**Acceptance Scenarios**:

1. **Given** trimmed patches at the outline, **Then** templates and cutting are for the trimmed
   pieces (with seam allowance on the cut edge), as edge pieces are today.
2. **Given** yardage, **Then** it counts only what's inside the shape, plus borders and binding
   around the outline.
3. **Given** the print, **Then** the quilt's size is shown as the shape and its size (a 40 in
   circle), with the outline's length for binding.

---

### User Story 4 - EPP quilts use the same shapes (Priority: P2)

1. **Given** an EPP quilt (spec 027), **Then** Cut to size and Custom trim offer the same shapes, and
   Auto-close closes up to the shape's straight sides.

### Edge Cases

- **Tiny slivers**: patches cut to very thin slivers at the outline are flagged, as narrow pieces are
  in construction checks (spec 029).
- **Shape bigger than the layout**: empty areas inside the shape are shown and warned about.
- **Irregular polygon that crosses itself or doesn't close**: not usable; the editor says why.
- **Changing shape**: undoable; nothing in the layout is lost, only the cut changes.
- **Loaded files**: an invalid shape falls back to the rectangle with a report (spec 003).

## Requirements

- **FR-001**: Every quilt MUST have a shape: Rectangle (default), Circle, Diamond, Regular polygon
  (3 to 12 sides) or Irregular polygon, set in the wizard and the Layout tab.
- **FR-002**: The layout MUST be cut to the shape with true edges (straight and arcs), reusing the
  layout engine's clipping.
- **FR-003**: Borders and binding MUST follow the shape (User Story 2).
- **FR-004**: Printing, templates, cutting and yardage MUST use the trimmed pieces and the outline.
- **FR-005**: The project format MUST gain a version with the quilt shape and a migration (existing
  quilts become Rectangle).
- **FR-006**: EPP quilts (spec 027) MUST offer the same shapes for their edge.

### Key Entities

- **QuiltShape**: kind (rectangle / circle / diamond / regular / irregular), size settings per kind
  (width and height, diameter, sides, angle, turn), position over the layout, and for irregular the
  outline points.

## Success Criteria

- **SC-001**: A quilter makes a 40 in round topper from a block layout in under 2 minutes.
- **SC-002**: Printed templates for edge pieces of a shaped quilt match the drawing within 0.5 mm.

## Assumptions

- Ovals come from a stretched circle; curved irregular outlines (arcs) are later.
- Shapes are convex or concave simple polygons; holes in a quilt are out of scope.

## Out of Scope

- Quilts with holes, and 3D quilts (spec 027 later releases).
- Pieced borders along curved sides.
