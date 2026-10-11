# Research: Project File Format & Data Model

## R1. Scope of this feature

- **Decision**: Deliver the `.rrq` model as a UI-free TypeScript module (`src/model/`): schemas,
  validation, migration, serialization, unit conversion, geometry primitives, seam-line patch
  derivation with stable ids and fill remapping, coloring operations (copy-on-write), and the slot
  framework with the **Horizontal** layout and **plain strip borders** as the first generators.
- **Deferred**: the other 9 layout styles and 21 border styles → layout feature spec; file open/save
  UI, drafts, tab handover → spec 004; rendering → editor features.
- **Rationale**: Every later feature depends on the model; generators are many and each is its own
  geometry project. One generator proves the slot framework and US3.

## R2. Schema & validation library

- **Decision**: TypeBox (`typebox@1.3.x`). Schemas are plain JSON Schema objects built in TypeScript:
  `Static<typeof T>` gives the types, `Value.Check` / `Value.Errors` validate untrusted files
  (interpreted — the `compile` module, which generates code at runtime, is not used), and the
  published JSON Schema is the schema itself serialized. Unknown keys are kept because validation
  never strips (`Value.Clean` is not called) and objects allow additional properties.
- **Error reporting**: union mismatches report every branch; the app reports the deepest error path
  with a readable message.
- **Rationale**: One source for types, validation, and the published schema; no conversion step.
  Justified new dependency under Principle V (Complexity Tracking). Verified with a prototype
  (tuples, discriminated unions, numeric bounds, unknown keys, error paths).
- **Alternatives**: Zod 4 (needs `toJSONSchema` conversion; user preferred TypeBox); Ajv + hand
  types (two sources of truth); hand validation (too large).

## R3. Versioning & migration

- **Decision**: `version: 1`. `migrations: Record<number, (doc) => doc>` applied in order on raw JSON
  before validation (empty at v1, the mechanism and its test exist). Newer version → refuse.
- **Writing**: always the current version.

## R4. Ids

- **Decision**: 10-character random base-36 ids from `crypto.getRandomValues` (no dependency).
  Validation rejects duplicate ids across the whole file (edge case: corruption).
- **Alternatives**: `crypto.randomUUID()` (36 chars × thousands of patches bloats files); nanoid
  (dependency for 5 lines).

## R5. Numeric tolerance

- **Decision**: All geometry computed in design space (normalized coords × block `size`), epsilon
  `1e-7 × max(w, h)` for vertex merging and intersection classification. Stored numbers are plain
  JSON doubles; no rounding on save.

## R6. Circular arcs

- **Decision**: `["A", x, y, sweep]`: center/radius derived from chord and sweep in design space
  (`r = (chord/2) / sin(|sweep|/2)`, center on the chord's perpendicular bisector, side by sign).
  Sub-arcs after splitting keep kind `A` with the partial sweep. Rendering into stretched slots uses
  the affine image (elliptical) — renderer concern, not stored.

## R7. Seam-line patch derivation (planar arrangement)

- **Decision**:
  1. Add the block outline (4 lines) to the user's segments.
  2. Pairwise intersections: line–line and line–arc and arc–arc analytically; any pair with a Bézier
     by recursive subdivision with bounding-box rejection to tolerance (line–Bézier via cubic root
     solve after rotating the line to the x-axis).
  3. Collinear overlapping lines and co-circular overlapping arcs are merged (users trace over the
     outline or existing lines).
  4. Split every segment at its intersection parameters (lines exactly, arcs by angle → partial
     sweep, Béziers by de Casteljau), merge vertices within tolerance.
  5. Iteratively prune degree-1 vertices; pruned segments are reported as **unconnected**
     (flagged, never silently deleted from the drawing).
  6. Half-edge structure; at each vertex sort outgoing edges by tangent angle (tie → curvature);
     walk faces; drop the unbounded face. Each face becomes a patch path using the original
     segment kinds.
- **Rationale**: Exact segment kinds survive into patches (templates print true curves).
- **Risk**: highest-complexity algorithm in the app; isolated in `geometry/` with dense unit tests
  (grids, stars, curves, tangent arcs, near-coincident nodes, duplicates).

## R8. Stable ids & fill remapping after edits

- **Decision**: For each new face, find old patches by overlap measured by **grid sampling**: a fixed
  128×128 sample grid over the block; point-in-polygon on flattened paths (curves flattened to
  0.2% of block size). New patch takes the id of the old patch it overlaps most if that old patch
  is not claimed by a larger overlap; otherwise a new id and the fill of the most-overlapping old
  patch. Patches too thin for any sample use their interior point. Applies to every coloring of the
  block and every quilt coloring referencing it.
- **Rationale**: No polygon-clipping dependency; deterministic; accuracy far beyond what "greatest
  overlap" needs.
- **Ceiling**: slivers under one sample cell are matched by interior point only.
  `// ponytail: switch to exact clipping (e.g., polygon-clipping) if mis-assignments show up.`
- **Foundation sections**: ids no longer present are removed; a section containing any changed
  patch is marked `needsReview`.

## R9. Colorings

- **Decision**: Quilt coloring table + placement references. Operations: `paintPatch(scope:
  this | allIdentical | alternate)`. "This" clones the coloring when shared (copy-on-write), then
  edits. Unreferenced colorings are dropped on save. Sashes/borders/cells are plain single-patch
  blocks with the reserved patch id `p`.

## R10. Slots

- **Decision**: `generateSlots(layout, borders) → Slot[]` pure and deterministic. `Slot = { id,
  outline: Path (quilt units), transform: [a, b, c, d, e, f] (block design space → quilt) }`.
  Slot-id grammar in `contracts/slot-ids.md`. On layout change: `reconcile(oldContents, newSlots)`
  returns kept contents and the list that would be dropped (UI warns, FR-057).

## R11. Units

- **Decision**: One table of length-bearing fields per entity (layout sizes, border sides, item
  x/y/w/h, block `size`, fabric `size`, text size). `convertUnits(doc, to)` multiplies by 2.54 or
  1/2.54; normalized geometry, angles, and RGB are untouched. Same function used when copying items
  between files of different units (FR-005a).

## R12. Assets

- **Decision**: `{ data | path, type, sha256, width?, height? }` shared with spec 002. Projects
  require `data` (packed). `sha256` verified with `crypto.subtle.digest` on load; mismatch → item
  reported, asset kept but marked.

## R13. Published schema

- **Decision**: `npm run schema` serializes the TypeBox schema to `public/schemas/rrq.v1.json` (served on the site for library
  authors) and the copy in `contracts/`. A unit test fails if the committed schema differs from the
  generated one.
