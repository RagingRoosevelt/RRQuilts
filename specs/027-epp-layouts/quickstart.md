# Quickstart: validating EPP (specs 027, 050, 051)

## Setup

- `make dev`, open `localhost:9000/RRQuilts/`, open or start a project.
- Unit tests: `make test` (model: `test/vitest/__tests__/model/epp/*.spec.ts`).
- Manual checks: Tests tab › Checklist (one TC per feature, added as each part lands).

## Phase 1 (MVP): shapes, rosettes, EPP section, format

1. Project › **EPP** tab › New shape. Drag four corners on the square grid into a 2 × 1 rectangle:
   edge labels read 2 and 1, all four flags green, no banner. Drag one corner off the grid (Vertex
   grid snapping Free): Whole units goes red, the banner names the patch. Mark that edge with the Edge
   tool: the flag turns green.
2. Angle tool: drag a corner's marker up; the angle grows by the angle step. Lock a corner: Vertex
   and Angle can't move it.
3. Multi-shape: draw a hexagon outline and three lines through the middle: six triangles, each
   flagged; Save opens a new rosette of six internal shapes.
4. New rosette: Free mode, pick Hexagon, ghost follows the mouse; place 7 into a flower, each snaps
   flush (SC-001 of spec 050 with 7 flowers, under 3 minutes). Grow mode: tap an outer edge, a
   hexagon attaches; hovering an edge colors picker cards by fit. Grid mode: Drag grid until it snaps
   to a placed edge; Sync grid to selected size follows the Scale slider.
5. Leave a gap no shape fits, **Close space**: an internal shape fills it, flagged.
6. Paint pieces, add a second coloring, swap palettes: as in the block editor.
7. Place the flower rosette into another rosette: its pieces are copied in, unlinked.
8. Libraries › EPP: copy the rosette to My library, export `.rrqepp`, re-import in a fresh project.
9. Save and reopen the project: everything round-trips (rrq v12). Tests: v11 fixtures open unchanged;
   a v8 library with EPP items is never read as palettes.

## Phase 2: EPP quilt and printing

1. New quilt › EPP quilt, 1U = 1 in. Design a 19-hexagon flower (spec 027 SC-001, under 3 minutes).
2. Layout: change 1U to 1.5 in, everything scales, arrangement unchanged. Edge: Cut to size, type
   30 × 30: rectangle shown; Auto-close: closing pieces fill the notches; Borders tab enabled; back to
   No trimming: Borders tab asks for an edge.
3. Print: paper and fabric templates measure within 0.5 mm (print at 100 %, check the 1 in square);
   fabric templates exactly one seam allowance larger; counts match the design broken into patches
   (spec 050 SC-002).

## Phase 3: multi-select and rosettes in block quilts

1. Select several pieces (Shift-click, box, long-press on touch): move, turn, mirror, scale and snap as
   one; Make rosette; Break into patches.
2. In a hexagon (shaped) block quilt, the block picker's Rosettes filter offers the hexagon flower
   rosette; Set places it; Print shows an EPP templates section.
