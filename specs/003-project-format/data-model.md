# Data Model: `.rrq` v1

Authoritative definitions live in `src/model/schema/` (TypeBox) and the generated
`contracts/rrq.schema.json`. This page summarizes entities, invariants, and operations.

## Envelope

`{ format: "rrq", version: 1, app: string, units: "in" | "cm", project: Project }`

## Shared

- **Id**: string, `[a-z0-9]{1,32}`, unique across the file.
- **Notecard**: `{ name, notes, reference, tags: string[], categories?: string[] }`.
- **Source**: `{ libraryId, itemId, revision }` — present on items copied from libraries.
- **Asset**: `{ data, type, sha256, width?, height? }` (packed; `path` only in library repos).
- **RGB**: `[r, g, b]` integers 0–255.
- **Path**: list of commands `M | L | A(x, y, sweep) | C | Z`; coordinates normalized 0…1 for block
  geometry, quilt units for slot outlines.

## Project

`{ id, name, palette: { fabrics, colors, threads }, blocks, photos, embroidery, quilts, fonts }`; list
order = display order.

| Entity | Fields | Invariants |
|---|---|---|
| Fabric | id, notecard, source?, image: Asset, size [w,h] (units), average RGB, manufacturer?, sku? | size > 0 |
| Color | id, notecard, source?, rgb | — |
| Thread | id, notecard, source?, rgb, number?, manufacturer? | — |
| Photo | id, notecard, source?, image: Asset | — |
| Embroidery | id, notecard, source?, file: Asset (`.EXP`), threads: Thread ids | — |
| Font | id, family, asset?: Asset (embedded) or bundled id | referenced by text items |

## Block

`{ id, notecard, source?, kind, size: [w, h], colorings: Coloring[], foundation?, editor? }` plus
kind-specific geometry:

| kind | Geometry | Notes |
|---|---|---|
| `seam` | `drawing { nodes[{id,x,y,handle?}], segments[{id,from,to,kind:line|arc|bezier, sweep?, c1?, c2?}] }` + derived `patches[]` + `unconnected[]` segment ids | patches loaded as stored |
| `grid` | `grid { type: rectangle|circle|arc|star8|kaleidoscope|octagon, params }` + `patches[]` | patches are source |
| `applique` | `patches[]` (first = bottom), `stitches[]` open paths, `background` patch | |
| `motif` / `stencil` / `frame` | as `applique` without `background` | stencil: stitches only allowed |
| `combo` | `pieced` (seam or grid part) + `applique` part | patch ids unique across parts |

- **Patch**: `{ id, path }` closed path; `flags?: ["self-intersecting" | ...]`.
- **Foundation**: `sections: [{ id, patches: Id[] (sewing order), needsReview? }]`.
- **Editor**: snap/grid/guides settings, `tracing?: { photo: Id, fit, crop, lightness }`.

## Coloring

`{ id, fills: { [patchId]: Fill }, threads: { [patchOrStitchId]: ThreadUse } }`

- **Fill**: `{ fabric: Id, offset: [x, y], rotation }` | `{ color: Id }`; missing key = unfilled.
- **ThreadUse**: `{ thread: Id, style: "solid" | "dashed", weight }`.

## Quilt

`{ id, notecard, layout, borders[], colorings: { [id]: Coloring }, layers: [L1, L2, L3] }`

- **layout**: `{ style, ...style params }` (v1 generator: `horizontal { cols, rows, block [w,h],
  sash [w,h], sashBorder }`; other styles validated by schema, generated in later features).
- **border**: `{ style, sides [l, t, r, b], blocks? [h, v] }`.
- **Layer 1**: `{ visible, slots: { [slotId]: { block, coloring, rotation 0|90|180|270, flip } },
  items: Item[] }`.
- **Layers 2–3**: `{ visible, items: Item[] }` (purposes fixed: appliqué, quilting).
- **Item**: `{ id, kind: block|motif|stencil|photo|text|embroidery, ref?, x, y, w, h, rotation,
  skew [x, y], flip, clip: none|center|quilt, coloring?, text? }`; list order = stacking.
- **Text**: `{ value, font: Id, size, bold, italic, align }`.
- Sashes/cornerstones/borders/cells: placed as plain blocks; their single patch id is `p`.

## Operations (model API)

| Operation | Behavior |
|---|---|
| `parseProject(text)` | JSON parse → migrate → validate → integrity checks (duplicate ids, dangling refs reported) → `{ ok, project, report }` |
| `serializeProject(doc)` | stable key order, current version |
| `convertUnits(doc, to)` | scales length fields only |
| `deriveSeamPatches(block)` | arrangement → patches, unconnected ids, flags |
| `remapAfterEdit(oldBlock, newBlock, quilts)` | stable ids + inherited fills across all colorings; foundation review flags |
| `paint(quilt, slotId, patchId, fill, scope)` | copy-on-write coloring edits |
| `generateSlots(layout, borders)` | deterministic slots |
| `reconcile(quilt, newLayout)` | kept vs dropped slot contents |
