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
