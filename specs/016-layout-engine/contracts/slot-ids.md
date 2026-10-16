# Contract addition: On-Point slot ids

Amends `specs/003-project-format/contracts/slot-ids.md` (copied there when implemented). All ids
stay position-derived. Rows and columns are 1-based on the main grid, counted from the top-left.

| Element | Id | Example |
|---|---|---|
| Main-grid block (same as Horizontal) | `b:r{row}c{col}` | `b:r2c3` |
| Between block (centered between rows r, r+1 and cols c, c+1) | `b:m:r{row}c{col}` | `b:m:r1c1` |
| Partial block on the edge (Trimmed blocks; r ∈ {0, R} or c ∈ {0, C}) | `b:m:r{row}c{col}` | `b:m:r0c2` |
| Setting piece (Exact / Floating; same positions as partial blocks) | `set:m:r{row}c{col}` | `set:m:r0c2` |
| Corner setting piece split by a seam | `set:m:r{row}c{col}:{1|2}` (1 = first clockwise) | `set:m:r0c0:1` |
| Diagonal sash on a block's lower-right / lower-left edge | `sash:se:{block}` / `sash:sw:{block}` with `{block}` = `r{r}c{c}` or `m:r{r}c{c}` | `sash:se:m:r1c1` |
| Diagonal sash on a block's upper-left / upper-right edge, only where no block lies beyond | `sash:nw:{block}` / `sash:ne:{block}` | `sash:ne:r1c3` |
| Cornerstone below a block's bottom point / at its left, right, top point where no block owns it | `cs:s:{block}`, `cs:w:{block}`, `cs:e:{block}`, `cs:n:{block}` | `cs:s:r1c1` |

Rules:

- Every space is owned by exactly one block position: a sash belongs to the block above it on the
  diagonal (`se`, `sw`); only spaces with no such block use `ne`, `nw`, `n`, `w`, `e`.
- Switching Horizontal ↔ On-Point keeps `b:r{r}c{c}` placements (US4); `b:m:` and `set:` ones are
  listed in the removal warning.
- Alternate class (`Slot.alt`): Horizontal `(r + c) mod 2`; On-Point 0 for `b:r…`, 1 for `b:m:…`.
- Triangle-grid layouts (later): `t:i{i}j{j}{u|d}` per grid triangle; a merged space is
  `{shape}:{first covered triangle in reading order}`, e.g. `hex:i3j1u`.
