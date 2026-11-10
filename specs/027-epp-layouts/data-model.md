# Data Model: English Paper Piecing (rrq v12, rrqlib v8, rrqepp v1)

Units: EPP geometry is in **units** (1U = one edge of a scale-1 piece). Only an EPP quilt's `unit`
gives it a real length (project units, inches or cm). Rosettes and shapes have no real size.

## EppShape (library item, project `eppShapes[]`)

| Field | Type | Rules |
| --- | --- | --- |
| itemBase | id, notecard, source, version, revision, author, license, credits | as blocks |
| outline | `[x, y][]` units, 3-24 vertices, counter-clockwise | checks: closes, simple (no self-crossing), convex (corners < 180°), whole-unit edges except `marked` |
| locked | `number[]` vertex indexes | optional; tools never move them |
| marked | `number[]` edge indexes (edge i = vertex i → i+1) | optional; deliberately not whole units, snap only to equal lengths |
| fill | Fill | optional default fill for new pieces |

A shape failing a check is saved as a draft (`notecard` kept) but not offered in pickers.

## InternalShape (inside a Rosette or an EPP quilt)

`{ id, outline, marked? }`: same checks, no itemBase; made by Multi-shape, Close space, Auto-close.

## Rosette (library item, project `rosettes[]`)

| Field | Type | Rules |
| --- | --- | --- |
| itemBase | as above | credits include authors of rosettes copied in |
| shapes | InternalShape[] | optional |
| pieces | RosettePiece[] | 1-500 |
| colorings | Coloring[] (`schema/coloring.ts`, fills keyed by piece id) | at least 1 |
| colorVariant | boolean | optional; arrangement locked, colorings editable (as blocks) |

**RosettePiece**: `{ id, shape: ItemId | internal id, at: [x, y], turn: number (deg), mirror?: boolean,
scale: 1-4 }`. Never a rosette (no nesting, clarify Q3).

Derived (not stored): outline edges (outer edges of the union, each with its length), bounding box,
expansion to polygons.

## EPP quilt (a `Quilt` with `layout.style = 'epp'`)

**EppLayout** (in the Layout union):

| Field | Type | Rules |
| --- | --- | --- |
| style | `'epp'` | |
| unit | number (project units) | 1/4 in to 6 in (or cm equivalent); default 1 in / 2.5 cm |
| seam | number | default 3/8 in / 1 cm |
| edge | `{ kind: 'none' }` \| `{ kind: 'cut', rect: [x0, y0, x1, y1] }` \| `{ kind: 'close', fill?: Fill }` \| `{ kind: 'custom', outline: PathCommand[] }` | borders and binding only when kind ≠ none (clarify Q4) |

**quilt.epp**:

| Field | Type | Rules |
| --- | --- | --- |
| shapes | InternalShape[] | optional; closing pieces (Auto-close) live here, rebuilt when pieces change |
| pieces | EppPiece[] | up to 5000 |

**EppPiece**: `{ id, shape?: ItemId, rosette?: ItemId, at, turn, mirror?, scale: 1-4, coloring?: Id,
fills?: Record<string, Fill> }`; exactly one of `shape` / `rosette`. A shape piece's fill is
`fills['']` (absent: the shape's default fill). A rosette piece shows `coloring` (absent: the first)
with `fills` overriding per rosette piece id (repaints, scope This).

## Block (later phase, R10)

`block.rosette?: ItemId`: hidden derived block of a rosette fitted to a block space shape; rebuilt on
change, never saved by itself in libraries.

## Project (rrq v12)

`project.eppShapes?: EppShape[]`, `project.rosettes?: Rosette[]`. `syncDraft` embeds library shapes and
rosettes used by EPP quilts and rosettes, prunes unused ones (spec 008), as for blocks.

## Library (rrqlib v8)

`LibraryItem` adds `{ type: 'epp-shape', category?, data: EppShape }` and `{ type: 'rosette', category?,
data: Rosette, shapes?: EppShape[] }` (a rosette carries the library shapes it uses). Packs keep
license checks (`packDoc`). Settings `libraryType` adds `'epp'`; `projectTab` adds `'epp'`.

## Migrations

- rrq 11 → 12: nothing to change (new fields optional). Published `public/schemas/rrq.v12.json`,
  `formats.json` `rrq: 12`, fixtures `project-v12.rrq`, `demo-v12.rrq` + PNGs at release.
- rrqlib 7 → 8: nothing to change. `formats.json` `rrqlib: 8`; library template FORMATS.
- Validation: unknown shape or rosette ids in pieces reported on open, piece shown as an empty outline
  (spec 027 Edge Cases); outlines over 24 vertices or pieces over limits refused with a message.
