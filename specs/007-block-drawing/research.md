# Research: Drawing Your Own Blocks

## R1. Shared viewport

- **Decision**: Extract zoom/pan/pinch/wheel/fit from `QuiltCanvas.vue` into a `useViewport`
  composable used by both the quilt canvas and the new block canvas. Tools receive pointer events
  already converted to world coordinates (quilt units / block design units).

## R2. Drawing operations are pure functions

- **Decision**: `src/editor/draw-ops.ts` — pure functions over a `Drawing` (normalized coords):
  `addLine`, `addArc`, `addGrid`, `deleteSegments`, `cloneSegments`, `transformSegments` (rotate any
  angle / flip ×4 / resize % about a center), `moveNode`, `splitSegmentAt`, `addNodes(mode)`
  (midpoint, thirds, N parts, crossings), `deleteNode`, `setArcSweep`, `toGuides`. The block editor
  page wraps each in `project.change(d => applySeamEdit(…))` — one undo step, stable patch ids.
- **Rationale**: Same pattern as `actions.ts` in 006: testable in Node, UI stays thin.

## R3. Snapping

- **Decision**: `src/editor/snap.ts`: given a pointer in design units, candidates in priority order:
  existing nodes → points on seams (closest point via the 003 `project`) → grid points (step or
  divisions); first within 8 screen px wins. Snapping to an existing node reuses its id (so Node
  drags move every seam ending there); other snaps create new nodes (derivation still connects
  them, spec 003).
- **Defaults**: step ¼" (5 mm in cm projects), snap to grid + nodes on, seams off.

## R4. Arc interaction

- **Decision**: Drag draws a 90° arc (sweep −90 = bulging left of travel on screen). Space or the
  inspector button flips the sign before release. After drawing, a selected arc shows a bulge
  handle at its midpoint; dragging it sets the sweep from the handle's distance to the chord
  (sagitta → sweep: `sweep = 4·atan(2s/c)`), clamped to 1°–359°.

## R5. Editor settings & guides

- **Decision**: Stored in `block.editor` (schema already open): `{ snap: { mode, step, divisions },
  snapGrid, snapNodes, snapSeams, graph: { show, step }, guides: Seg[] }`. Guides render dashed and
  are never derived, printed, or drawn in quilts.

## R6. Colorings

- **Decision**: Add optional `name` to `Coloring` (schema, backward compatible). Block editor keeps
  the current coloring per block in the editor store. Quilt tray: blocks with >1 coloring show a
  coloring picker; `applyTool` "set" uses the chosen coloring.

## R7. Attribution (Principle VI)

- **Decision**: `Source` gains optional `library`, `author`, `license`, `derived`. Starter content
  fills them (`RRQuilts starter`, `RRQuilts contributors`, `CC-BY-4.0`). Any drawing edit to a
  block with `source` sets `derived: true`; "Edit a copy" copies `source` with `derived: true`.
  Block notecards and the editor inspector show "Based on <item> by <author> (<license>)".

## R8. Performance

- **Decision**: Each edit re-derives once (`applySeamEdit`): 100-seam derivation measured at 10 ms
  (spec 003); remap across quilts is linear in placements. Live preview while dragging draws the
  in-progress seam only; derivation runs on release.
