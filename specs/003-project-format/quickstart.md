# Quickstart & Validation: Project Format

All validation is automated; no UI in this feature.

```bash
make test        # model unit tests incl. fixtures below
make lint
```

## Scenarios (each is a test file under `test/vitest/__tests__/model/`)

1. **Round-trip (US1, SC-001/002)**: `fixtures/everything.rrq` (every item and segment kind) →
   parse → serialize → parse; deep-equal; arcs stay `A`, Béziers stay `C`; unknown keys preserved.
2. **Rejections**: wrong `format`, newer `version`, duplicate ids, malformed path → clear errors;
   dangling references → loaded with a report.
3. **Migration**: a synthetic v0→v1 migration registered in the test runs in order.
4. **Units (US3.2)**: in→cm→in returns the original within 1e-9; block geometry untouched.
5. **Derivation**: nine-patch grid → 9 patches; Ohio Star lines → 16+ patches with correct areas
   (sum = block area); arc through block → curved patches with `A` segments; floating segment →
   reported unconnected, drawing unchanged.
6. **Stable ids (US2, SC-003)**: colored nine-patch, add a diagonal across the center → 8 outer ids
   and fills unchanged; 2 new triangles inherit the center fill; quilt colorings updated too.
7. **Copy-on-write**: two placements share a coloring; paint "this" on one → other unchanged;
   paint "all identical" → both change.
8. **Slots (US3, SC-004)**: 5×6 horizontal with sashing + sash border + 2 strip borders → expected
   ids and transforms; change to 6×6 → all 30 original contents kept, new column empty; change to
   4×6 → 6 reported for dropping.
9. **Performance (SC-005)**: synthetic project (10 quilts, 100 blocks, 50 × 300 KB images) parses
   in < 3 s in the test environment.
10. **Published schema**: generated JSON Schema equals the committed `public/schemas/rrq.v1.json`.
