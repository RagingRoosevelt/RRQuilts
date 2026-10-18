# Contract: Slot ids

Slot ids are derived from position only, so they survive any change that keeps that position.
Rows/columns are 1-based, counted from the top-left of the quilt center.

| Element | Id | Example |
|---|---|---|
| Block space | `b:r{row}c{col}` | `b:r3c4` |
| Vertical sash (right of block r,c; `c0` = left sash border) | `sash:v:r{row}c{col}` | `sash:v:r1c0` |
| Horizontal sash (below block r,c; `r0` = top sash border) | `sash:h:r{row}c{col}` | `sash:h:r2c3` |
| Cornerstone (below-right of block r,c) | `cs:r{row}c{col}` | `cs:r0c0` |
| Border strip side (border n, 1 = innermost) | `border:{n}:{top|right|bottom|left}` | `border:1:top` |
| Border block k on a side (1 = first clockwise from top-left) | `border:{n}:{side}:{k}` | `border:2:left:3` |
| Border corner | `border:{n}:corner:{tl|tr|br|bl}` | `border:1:corner:tl` |
| One-patch cell (later) | `cell:r{row}c{col}` | |
| Strip piece (later) | `strip:{n}:{k}` | |

## On-Point

Rows and columns are 1-based on the main grid, counted from the top-left. `b:r{row}c{col}` is as
above.

| Element | Id | Example |
|---|---|---|
| Between block (centered between rows r, r+1 and cols c, c+1) | `b:m:r{row}c{col}` | `b:m:r1c1` |
| Partial block on the edge (Trimmed blocks; r ∈ {0, R} or c ∈ {0, C}) | `b:m:r{row}c{col}` | `b:m:r0c2` |
| Setting piece (Exact / Floating; same positions as partial blocks) | `set:m:r{row}c{col}` | `set:m:r0c2` |
| Corner setting piece split by a seam | `set:m:r{row}c{col}:{1|2}` (1 = first clockwise) | `set:m:r0c0:1` |
| Sash on a lattice cell's lower-right / lower-left side | `sash:se:{cell}` / `sash:sw:{cell}` | `sash:se:m:r1c1` |
| Cornerstone at a lattice cell's bottom point | `cs:s:{cell}` | `cs:s:r1c1` |

`{cell}` is a lattice position: `r{r}c{c}` (main grid) or `m:r{r}c{c}` (between), and may lie
outside the blocks (row or column 0, R + 1, C + 1) when it owns sashing along the outer blocks.

- Every sash and cornerstone is owned by the lattice cell up-left of it (above it on the
  diagonal), whether or not that cell holds a block. Sashing exists where it touches a block (or a
  partial block, with Trimmed blocks); setting pieces cover the sashing's place beyond the frame.
- Switching Horizontal and On-Point keeps `b:r{r}c{c}` placements; `b:m:` and `set:` ones are
  listed in the removal warning.
- Alternate class (`Slot.alt`): Horizontal `(r + c) mod 2`; On-Point 0 for `b:r…`, 1 for `b:m:…`.
- Triangle-grid layouts (later): `t:i{i}j{j}{u|d}` per grid triangle; a merged space is
  `{shape}:{first covered triangle in reading order}`, e.g. `hex:i3j1u`.

Other layout styles add grammar here when their presets are specified; ids MUST remain
position-derived.

## Strip quilts (spec 017)

Ids follow the strip's lasting `id` (stored in the layout), so inserting, deleting, or swapping
strips never moves content to another strip.

| Element | Id | Example |
|---|---|---|
| Block space k (Pieced Blocks: 1…n; Half Drop: 0…n, ends half) | `b:s{strip}:{k}` | `b:sx7k2:3` |
| Plain strip | `strip:{strip}:p0` | |
| Pattern foreground (point, diamond, square), unit k | `strip:{strip}:f{k}` | `strip:x7k2:f2` |
| Pattern background, unit k (`g` top/between, `h` bottom, `t`/`b` above/below a square) | `strip:{strip}:{g|h|t|b}{k}` | |
| Second row of double diamonds | `strip:{strip}:{f|g|h}2-{k}` | |
| Checker Board cell (along k, across r) | `strip:{strip}:c{k}.{r}` | `strip:x7k2:c3.1` |

Pattern pieces of the same role keep their ids across pattern styles, so colors carry over when a
strip changes, for example, from Points to Diamonds.

## Patch layouts (spec 018)

Patches take colors and fabrics only (slot group `patch`). `i` counts across, `j` down, from 0;
trimmed edges add partial patches at negative or past-the-end indices.

| Element | Id | Example |
|---|---|---|
| Variable Point diamond (setting pieces, sashes keep their On-Point ids) | On-Point block id with `b:` → `p:` | `p:r2c3`, `p:m:r1c1` |
| One Patch patch (squares, rectangles, bricks, diamonds, hexagons, tumblers, clamshells) | `p:i{i}j{j}` | `p:i4j1` |
| Half-square triangle halves | `p:i{i}j{j}{a|b}` | `p:i0j0a` |
| Equilateral triangle, up or down (`r` = index in the row) | `p:i{r}j{j}{u|d}` | `p:i2j3u` |
| Octagon / the small square up and left of it | `p:i{i}j{j}o` / `p:i{i}j{j}s` | |
| Tumbling-block face (top, left, right) | `p:i{i}j{j}{t|l|r}` | `p:i2j1t` |

## Shaped block layouts (spec 026)

Block versions of patch layouts use the patch id with `b:` in place of `p:`, so the same position has
the same id apart from the prefix (switching between the twins drops what was placed, with the usual
warning). Turning the grid (flow angle) doesn't change ids: they follow the grid, not the quilt.

| Space | Id | Example |
|---|---|---|
| Shaped Blocks triangle, diamond or hexagon | One Patch id, `b:` | `b:i2j3u`, `b:i4j1` |
| Baby Blocks diamond (top, left, right) | tumbling id, `b:` | `b:i2j1t` |
| Diamond Point diamond (setting pieces and sashes keep their On-Point ids) | On-Point block id | `b:r2c3`, `b:m:r1c1` |

Variable Patch (`variable-blocks`) keeps the `p:` tumbling ids; v6 Baby Blocks quilts become Variable
Patch on opening (format v7).

## Pieced borders (spec 018)

Border n's sides are pattern bands (the strip patterns above) running along the side from the
quilt outward. Pieces use the strip codes with the side in place of the strip: `border:{n}:{side}:{code}{k}`
(side `top`, `bottom`, `left`, `right`; codes as for strips, plus `u` = rectangle unit and `k` = little
shape in big and little styles). Corners are `border:{n}:corner:{tl|tr|br|bl}`; Tile On Point Corners
splits each into `…:c` (the square on point) and triangles `…:1` to `…:4`. Plain styles keep the ids
above (`border:{n}:{side}`).
