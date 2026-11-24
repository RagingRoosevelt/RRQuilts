# Format contract: rrq v12, rrqlib v8, rrqepp v1

Shapes and fields: [data-model.md](../data-model.md). This file lists what readers and writers must do.

## rrq v12

- `project.eppShapes?`, `project.rosettes?`; Layout union gains `EppLayout`; `Quilt.epp?`.
- Migration 11 → 12: identity (fields optional). `io.ts` `VERSION = 12`, `migrations[11]`.
- Published schema `public/schemas/rrq.v12.json` (`npm run schema`; drift test).
- `parseProject` checks: piece refs resolve (`shape` in `eppShapes`, internal ids in the owning
  rosette or `quilt.epp.shapes`, `rosette` in `rosettes`); duplicate ids; outline vertex count 3-24;
  pieces ≤ 5000 per quilt, ≤ 500 per rosette; dangling refs reported, never a crash.
- Older apps: a v12 file is refused with the usual "newer version" message.

## rrqlib v8

- `LibraryItem` adds `epp-shape` and `rosette` (with `shapes?`: the library shapes a rosette uses).
- Every reader that branches on `type` handles all four types explicitly; unknown types are skipped
  with a per-item note (existing per-item skip behavior).
- `inInches`: EPP items have no real lengths; nothing to convert.
- Packs: license checks (`packDoc`) apply to shapes and rosettes; a rosette's shapes travel with it.
- `formats.json`: `rrqlib: 8`, `rrqepp: 1`. Library template: FORMATS, validate the new types.

## rrqepp v1 (single EPP item file)

```json
{ "format": "rrqepp", "version": 1, "app": "0.9.0",
  "item": { "type": "epp-shape" | "rosette", "data": { } },
  "shapes": [ ] }
```

- `shapes`: library shapes the rosette uses (absent for a shape file).
- Import adds to the project (and optionally My library), as `.rrqbl` import does for blocks
  (`block-file.ts` `importBlock` pattern), with credits kept.
