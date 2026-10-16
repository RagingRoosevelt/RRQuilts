# Quickstart: validating the layout engine

Prereqs: `make dev` (port 9000), Playwright Firefox via `fabric_collections` (`uv run python -I`).

## Automated

- `make test` runs:
  - **Horizontal oracle sweep** (SC-001): old generator vs engine for cols/rows 1…6, block sizes
    (square and not), sash 0 / one side / both, sash border on/off, each border style → identical
    `id`, `outline`, `transform`, order.
  - **Fixture**: `test/fixtures/everything.rrq` opens, migrates to v5, saves unchanged except version.
  - **On-Point counts**: C × R main + (C−1)(R−1) between; side pieces 2(C−1) + 2(R−1); 4 corners
    (8 halves with seam corners); 1 × 1 and 1 × R edge cases.
  - **Edge finishes**: Exact quilt width = (C) × side × √2 (no sash); Floating adds 2 × float; Trim
    gives `b:m:` partial spaces and no `set:`; None gives a zigzag `edge` and ignores borders.
  - **Cutting** (SC-003): 8″ blocks → side QST cut 12⅝″ (11.31 + 1.21, rounded up to ⅛″), corner HST
    cut 6⅝″ (5.66 + 0.85, rounded up).
  - **Engine presets** (SC-004): Variable Point, Baby Blocks, Variable Blocks, strips with half drop,
    One Patch, triangle, diamond, hexagon, clamshell (trimmed and shaped), spool, mixed triangle grid
    with merges → unique ids, no gaps or overlaps (area sum = clip area), hit test finds each space
    at its centroid, `drawQuilt` runs on a stub context.
  - **Migration** 4 → 5 for `{ style: 'on-point' }` placeholder.

## Manual (Playwright or by hand)

1. New quilt → Layout → style On-Point, 3 across, 4 down, 8″ → 12 + 6 blocks, setting triangles,
   size shown; place and color blocks (This / All / Alternate), turn, undo, save, reopen.
2. Edge finish through Exact → Floating 1″ → Trimmed → None → Floating: drawing, size, borders
   (gone at None, back after), print cutting list and binding change accordingly.
3. Horizontal 3 × 3 with nine blocks → On-Point → back: nine blocks keep their places; warning lists
   between blocks when going back.
4. Print → quilt with Floating: oversized setting triangles in the list, trim note on the diagram.
5. 100 × 100 On-Point on a phone-sized window: count changes redraw without a visible pause (SC-005).
