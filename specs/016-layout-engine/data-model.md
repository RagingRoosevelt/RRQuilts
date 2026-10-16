# Data Model: Shared Layout Engine

## Stored (project format v5)

### OnPointLayout (new member of `Layout`)

| Field | Type | Rule |
|---|---|---|
| `style` | `'on-point'` | |
| `cols`, `rows` | integer 1…100 | blocks across / down on the main grid |
| `block` | length > 0 | finished side of the square block (project units) |
| `sash` | length ≥ 0 | 0 = no sashing |
| `corner` | `'triangle' \| 'seam'` | corner setting piece style |
| `edge` | `{ finish: 'exact' \| 'float' \| 'trim' \| 'none', float: length ≥ 0 }` | `float` used only by `'float'`; kept when switching finish |

Defaults (new quilt and v4 placeholder migration): 3 × 3, block 12″ (30 cm), sash 0, `triangle`,
`{ finish: 'float', float: 1″ (2.5 cm) }`.

`HorizontalLayout`, `Border`, `SlotContent` unchanged. Borders with `finish: 'none'` stay in
`quilt.borders` and are ignored by generation (restored when another finish is chosen).

## Generated (never stored)

### Slot (extended)

| Field | Type | Meaning |
|---|---|---|
| `id` | string | position-based (contracts/slot-ids.md) |
| `outline` | `PathCommand[]` | visible boundary in quilt units, lines and arcs; content clipped to it |
| `transform` | affine | block unit square → quilt units (whole space, even when trimmed) |
| `kind` | `'block' \| 'sash' \| 'cs' \| 'set' \| 'border'` | replaces id-prefix parsing in `slotGroup` callers over time |
| `shape` | `SpaceShape` | `rect`, `triangle`, `diamond60`, `hexagon`, `clamshell`, `spool`, `piece` |
| `turns` | degrees | step between allowed block turns |
| `alt` | integer | alternate-scope class |
| `size` | `[w, h]` | finished size of the whole space (print) |
| `cut?` | `PathCommand[]` | shape to cut when larger than `outline` (floating setting pieces) |

### Generated (extended)

`slots`, `center`, `bounds`, `unsupported` as today, plus `edge: PathCommand[]` (the quilt's outer
edge: the bounds rectangle, or the zigzag for No fill) and `trim: boolean` (pieces are cut larger
than the edge: floating or trimmed blocks → print the trim note).

### Tiling (engine input, internal)

```text
Tiling   { bands: Band[], map: Affine, clip?: Rect, }
Band     { cell: CellPiece[], a: Vec2, b?: Vec2, i: [from, to], j: [from, to], skip?(i, j, piece) }
CellPiece{ kind, shape, turns, outline (cell coords), transform (unit → cell coords),
           id(i, j): string, alt(i, j): number, edge?: 'set' | 'trim' }   // outer-ring behaviour
Merge    { shape, covers: string[] }                                       // triangle grid (R8)
```

State: none. Generation is a pure function of the stored layout and borders.
