---
description: "Tasks for 003 Project File Format & Data Model"
---

# Tasks: Project File Format & Data Model (`.rrq`)

**Input**: `/specs/003-project-format/` (plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md)

**Tests**: Required (constitution: format parse/validate/migrate; geometry). Tests are written
before or with each module; quickstart scenarios map 1:1 to test files in
`test/vitest/__tests__/model/`.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [ ] T001 Add `typebox@1.3.x` dependency (lockfile via `npm install` in the build container)
- [ ] T002 Create `src/model/` folders and an ESLint rule (or comment-enforced convention + test) that `src/model/**` imports nothing from `vue`, `quasar`, or `@/stores`

## Phase 2: Foundational (schemas, ids, io)

- [ ] T003 [P] `src/model/ids.ts`: `newId()` (10-char base-36 via `crypto.getRandomValues`), `collectIds(doc)` duplicate detection
- [ ] T004 [P] `src/model/schema/shared.ts`: Id, Notecard, Source, Asset, RGB, Path commands (`M`/`L`/`A`/`C`/`Z` tuples, sweep bounds)
- [ ] T005 [P] `src/model/schema/palette.ts`: Fabric, Color, Thread, Photo, Embroidery, Font
- [ ] T006 [P] `src/model/schema/block.ts`: Block union by `kind` (seam, grid, applique, motif, stencil, frame, combo), Patch, Drawing (nodes/segments), Foundation, Editor
- [ ] T007 [P] `src/model/schema/coloring.ts`: Fill, ThreadUse, Coloring
- [ ] T008 [P] `src/model/schema/quilt.ts`: Layout (style union; `horizontal` fully specified, other styles shape-validated), Border, Layers (3 fixed), SlotContent, Item, Text
- [ ] T009 `src/model/schema/project.ts`: Project + Envelope; export `RrqDoc` static type
- [ ] T010 `src/model/io.ts`: `parseProject(text)` (JSON → migrations → `Value.Check` → readable deepest error → integrity: duplicate ids reject, dangling refs report, asset sha256 verify), `serializeProject(doc)` (stable key order, current version), `migrations` table
- [ ] T011 `scripts/gen-schema.ts` + `npm run schema`: write `public/schemas/rrq.v1.json` and `specs/003-project-format/contracts/rrq.schema.json`
- [ ] T012 `test/fixtures/everything.rrq`: every entity, every block kind, every path command, unknown keys at several levels, one embedded small PNG

**Checkpoint**: files load and save.

## Phase 3: User Story 1 — Designs survive save and reopen (P1) 🎯

- [ ] T013 [P] [US1] Test `model/io.roundtrip.spec.ts`: fixture parse → serialize → parse deep-equal; arcs stay `A`, Béziers stay `C`; unknown keys preserved (quickstart 1)
- [ ] T014 [P] [US1] Test `model/io.reject.spec.ts`: wrong format, newer version, duplicate ids, malformed path, bad sha256, dangling refs reported (quickstart 2)
- [ ] T015 [P] [US1] Test `model/io.migrate.spec.ts`: synthetic migration registered in-test runs in order (quickstart 3)
- [ ] T016 [P] [US1] Test `model/schema.published.spec.ts`: generated schema equals committed `public/schemas/rrq.v1.json` (quickstart 10)
- [ ] T017 [US1] `src/model/units.ts`: length-field table + `convertUnits(doc, to)`; test `model/units.spec.ts` in→cm→in within 1e-9, geometry untouched (quickstart 4)
- [ ] T018 [US1] Test `model/perf.spec.ts`: synthetic 10 quilts / 100 blocks / 50 × 300 KB images parses < 3 s (quickstart 9)
- [ ] T019 [US1] Make T013–T018 pass

## Phase 4: User Story 2 — Edits to a block keep its colors (P1)

- [ ] T020 [P] [US2] `src/model/geometry/path.ts`: arc center/radius in design space, point at/tangent/curvature, flatten (0.2% tolerance), area (shoelace on flattened), point-in-polygon; tests `model/geometry.path.spec.ts`
- [ ] T021 [P] [US2] `src/model/geometry/intersect.ts`: line–line, line–arc, arc–arc analytic; line–Bézier cubic roots; Bézier–arc and Bézier–Bézier subdivision; collinear/co-circular overlap merge; tests `model/geometry.intersect.spec.ts`
- [ ] T022 [US2] `src/model/geometry/arrangement.ts`: split at params (line, partial arc sweep, de Casteljau), vertex merge, degree-1 pruning → unconnected ids, half-edge face walk with tangent+curvature ordering, faces → paths with original kinds
- [ ] T023 [US2] `src/model/blocks/derive.ts`: `deriveSeamPatches(block)` (adds outline, normalizes to design space and back); test `model/derive.spec.ts`: nine-patch = 9, Ohio Star lines → expected count and areas summing to block area, arc → curved patches with `A`, floating segment → unconnected & drawing unchanged, tangent arcs, near-duplicate nodes (quickstart 5)
- [ ] T024 [US2] `src/model/blocks/remap.ts`: grid-sampling overlap (128×128), stable id claim order, fill inheritance across block colorings and quilt colorings, foundation section cleanup + `needsReview`; test `model/remap.spec.ts` (quickstart 6)
- [ ] T025 [US2] `src/model/coloring.ts`: `paint(quilt, slotId, patchId, fill, scope)` with copy-on-write, alternate scope, unreferenced coloring cleanup; test `model/coloring.spec.ts` (quickstart 7)

## Phase 5: User Story 3 — Changing a layout keeps what still fits (P2)

- [ ] T026 [US3] `src/model/layout/slots.ts`: Slot type (id, outline, affine transform), `generateSlots` dispatcher, `reconcile(quilt, newLayout, newBorders)` → kept/dropped
- [ ] T027 [US3] `src/model/layout/horizontal.ts`: blocks, sashes, cornerstones, sash border per `contracts/slot-ids.md`
- [ ] T028 [US3] `src/model/layout/borders.ts`: plain strip borders (`long-horizontal`, `long-vertical`, `mitered`) with per-side sizes
- [ ] T029 [US3] Test `model/slots.spec.ts`: 5×6 + sashing + sash border + 2 borders → ids, outlines, transforms, finished size; 5×6→6×6 keeps 30; →4×6 reports 6 dropped (quickstart 8)

## Phase 6: Polish

- [ ] T030 Document `src/model/` in `CLAUDE.md` (module map, purity rule, how to add a migration / layout generator / slot grammar)
- [ ] T031 `make check` clean; commit with `make commit`

## Dependencies

- Phase 1 → Phase 2 → US1. US2 needs schemas (Phase 2) only; US3 needs schemas only. US2 and US3 independent.
- T020/T021 → T022 → T023 → T024. T026 → T027/T028 → T029.

## Parallel opportunities

- T003–T008 (separate schema files), T013–T016, T020/T021.

## Implementation strategy

MVP = Phases 1–3 (valid files load/save). Then US2 (hardest: derivation), US3, Polish. Commit after each phase with `make commit`.
