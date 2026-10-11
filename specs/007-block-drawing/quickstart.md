# Quickstart & Validation: Drawing Your Own Blocks

Automated: `make test` (draw-ops, snapping, block ops, attribution, 200-seam edit < 100 ms).

Manual (`make dev`, desktop and tablet):

1. **New block**: Sketchbook → Blocks → New block → name → editor opens in Draw with the Line tool.
2. **Grid + lines (Ohio Star)**: Grid tool 3×3, drag corner to corner → nine patch. Line tool: draw
   both diagonals in the four edge-middle squares, snapping to nodes → 21 patches.
3. **Arcs**: Arc tool, drag between two points; press Space (or "Flip arc direction") before
   release to bend the other way; on a tablet draw from the other end. Select the arc → drag its
   blue handle to change the curve.
4. **Unconnected**: draw a short seam floating inside → shown red with a count; patches unaffected.
5. **Select & edit**: tap / shift-tap / box-select seams; rotate 90° and 45°, flip ×4, resize 50%,
   clone, delete (Delete key), to guides (dashed, never printed); Ctrl+A; Esc clears.
6. **Nodes**: Node tool → drag a node (connected seams follow, snapping); double-tap a seam to add a
   node; Select → Add nodes: midpoint / thirds / N parts / at crossings.
7. **Snapping**: toggle grid / nodes / seams; Step vs Divisions (e.g., 3×3); graph paper on/off.
8. **Color mode**: Paint / Spray / Eyedropper; Save as new coloring, switch, rename, delete.
9. **In quilts**: set the block in a quilt; right-click (long-press) its tray tile to choose a
   coloring; editing the block from the sketchbook warns "in use" and updates the quilt, keeping
   colors on unchanged patches; "Edit a copy" leaves the original alone.
10. **Attribution**: Edit a copy of Ohio Star → block details show "Based on Ohio Star by RRQuilts
    contributors (RRQuilts starter, CC-BY-4.0)".
11. **Undo**: every drawing, editing, coloring, and settings change undoes/redoes.
