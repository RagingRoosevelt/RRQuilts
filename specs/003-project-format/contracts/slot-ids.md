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

Other layout styles add grammar here when their generators are specified; ids MUST remain
position-derived.
