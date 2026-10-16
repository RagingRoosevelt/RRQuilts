# Tasks: Shared Layout Engine

**Input**: `specs/016-layout-engine/` (plan.md, spec.md, research.md, data-model.md,
contracts/slot-ids.md, quickstart.md)

**Tests**: included. The spec's success criteria are checks (SC-001 oracle sweep, SC-003 cut sizes,
SC-004 engine presets), so each phase lists its tests first.

**Conventions**: model code in `src/model/` imports no Vue/Quasar/stores; the project is frozen (edit
via `project.change`); tests that hand-edit model results `structuredClone` first. Commit with
`make commit MSG="…"` after each phase (lint + test + build docs). Help text follows the help docs
style (no em/en dashes, no clause-joining semicolons, sentence-case headings).

**Model**: `(opus)` tasks are done by Opus (geometry, ids, data safety, cutting, the guard tests);
`(sonnet)` tasks may be delegated to Sonnet agents. Opus reviews every phase's diff before commit.

## Phase 1: Setup

- [X] T001 (sonnet) Add shared test helpers for layouts (build a quilt with a given layout/borders, collect
  `generateSlots` output as plain JSON, polygon area of a slot outline via `flattenLoop`) in
  `test/vitest/__tests__/model/layout-helpers.ts`

---

## Phase 2: Foundational (slot model + engine; blocks every story)

**Goal**: slots describe themselves (kind, shape, turns, alt, size, cut; `Generated.edge`, `trim`),
consumers stop inferring from ids and axis-aligned transforms, and the engine produces Horizontal.

### Tests

- [X] T002 (opus) [P] Oracle sweep test (SC-001): copy today's `horizontalSlots` into
  `test/vitest/__tests__/model/horizontal-oracle.ts` (frozen copy) and compare against
  `generateSlots` for cols/rows 1…6, square and non-square blocks, sash `[0,0]`, `[w,0]`, `[0,h]`,
  `[w,h]`, sash border on/off, and each border style: identical `id`, `outline`, `transform`, order,
  `center`, `bounds`, in `test/vitest/__tests__/model/layout-engine.spec.ts`
- [X] T003 (sonnet) [P] Scope test: Alternate on Horizontal selects the same spaces as today's digit-sum
  parity for blocks, sashes, cornerstones, border blocks, in `test/vitest/__tests__/editor/scope.spec.ts`
- [X] T004 (sonnet) [P] Hit test for a slot whose outline contains an arc (point inside the bulge hits, point
  outside misses) in `test/vitest/__tests__/render/hit.spec.ts`

### Implementation

- [X] T005 (opus) Extend `Slot` with `kind`, `shape` (`SpaceShape`), `turns`, `alt`, `size`, `cut?`, and
  `Generated` with `edge` and `trim` per data-model.md; fill them in `rectSlot`, `horizontal.ts`,
  and `borders.ts` (`polySlot`) in `src/model/layout/slots.ts`, `src/model/layout/horizontal.ts`,
  `src/model/layout/borders.ts`
- [X] T006 (opus) [P] Alternate scope from `Slot.alt` instead of `parity(id)`: `setTargets` and
  `placementTargets` take the generated slots (or an id → alt map); update callers in
  `src/editor/scope.ts` and `src/editor/actions.ts` / `src/pages/QuiltEditorPage.vue`
- [X] T007 (sonnet) [P] Hit testing uses the flattened outline (`pathPolygon(slot.outline, [1, 1])`, cached per
  slot) in `src/render/hit.ts`
- [X] T008 (sonnet) [P] Print and preview read block size from `slot.size` (not `transform[0]`/`[3]`) in
  `src/components/PrintOptions.vue` and `src/components/PrintPreview.vue`
- [X] T009 (opus) [P] Plain pieces use `slot.cut ?? slot.outline` in `quiltPieces` in
  `src/model/print/pieces.ts`
- [X] T010 (sonnet) [P] `binding()` takes a perimeter (callers pass `2 * (w + h)` for now) in
  `src/model/print/yardage.ts`, `src/help/calc.ts`, `src/components/PrintPreview.vue`
- [X] T011 (opus) Convex polygon clip against a rectangle, and a curved clip via `arrange()` (outline +
  rectangle seams, faces inside both, arcs kept) in `src/model/layout/clip.ts`
- [X] T012 (opus) Engine `tile(tiling) → { slots, center }`: bands (cell pieces stepped by `a`, `b` over
  `i`, `j` ranges, `skip`), one affine `map`, optional `clip` (pieces fully outside dropped, partly
  outside clipped: `outline` = visible part, `transform` and `size` = whole piece), per-piece `id`
  and `alt`, emission order = band order, piece order, then `j`, `i` in
  `src/model/layout/engine.ts`
- [X] T013 (opus) Horizontal preset: `horizontal(layout) → Tiling` reproducing ids and order (blocks,
  vertical sashes, horizontal sashes, cornerstones as separate bands) in `src/model/layout/presets.ts`
- [X] T014 (opus) Switch `generateSlots` to `tile(presets.horizontal(...))`; run T002 until zero
  differences; delete `src/model/layout/horizontal.ts` (the oracle copy stays in tests) in
  `src/model/layout/slots.ts`

**Checkpoint**: `make test` green, existing projects draw, place, and print exactly as before
(US3 delivered).

---

## Phase 3: User Story 3 - Existing quilts stay the same (Priority: P1)

**Goal**: format v5 without changing any existing Horizontal project.

**Independent Test**: every fixture opens, migrates to v5, and generates identical slots.

- [X] T015 (sonnet) [P] [US3] Migration test: v4 fixture with Horizontal unchanged except `version`; v4 doc with
  `{ style: 'on-point' }` gets default On-Point parameters in
  `test/vitest/__tests__/model/io.migrate.spec.ts`
- [X] T016 (opus) [US3] `OnPointLayout` schema (`cols`, `rows`, `block`, `sash`, `corner`, `edge { finish,
  float }`), remove `'on-point'` from `OtherLayout`, `VERSION = 5` in
  `src/model/schema/quilt.ts` and `src/model/schema/project.ts`
- [X] T017 (opus) [US3] Migration `4` (placeholder On-Point → defaults in the project's units: 3 × 3, 12″ /
  30 cm, sash 0, `triangle`, float 1″ / 2.5 cm) in `src/model/io.ts`
- [X] T018 (sonnet) [P] [US3] Scale On-Point `block`, `sash`, `edge.float` in `src/model/units.ts` (+ case in
  `test/vitest/__tests__/model/units.spec.ts`)
- [X] T019 (sonnet) [US3] Regenerate `public/schemas/rrq.v5.json` (`npm run schema` in the container), update
  `public/schemas/formats.json`, keep `rrq.v4.json`; `schema.published.spec.ts` green
- [X] T020 (sonnet) [US3] Bump `test/fixtures/everything.rrq` to v5 only if the round-trip test requires it
  (otherwise leave it at v4 as migration coverage) in `test/fixtures/everything.rrq`

---

## Phase 4: User Story 1 - Make an On-Point quilt (Priority: P1)

**Goal**: On-Point with counts, block side, sashing, corner style; Exact finish first.

**Independent Test**: 3 across × 4 down, 8″ → 12 main + 6 between blocks, side and corner setting
pieces, size shown; place/color/turn/undo/save/reopen work.

### Tests

- [X] T021 (opus) [P] [US1] On-Point generation tests: counts (C × R main, (C−1)(R−1) between,
  2(C−1) + 2(R−1) side pieces, 4 corners, 8 corner halves with `seam`), 1 × 1 and 1 × R, ids per
  `contracts/slot-ids.md`, unique ids, area sum = quilt area, Exact width = C·s·√2 and height
  R·s·√2, `alt` 0 main / 1 between, `size` = [s, s], with sashing (sash and cornerstone ids, setting
  pieces meet sashing) in `test/vitest/__tests__/model/layout-on-point.spec.ts`
- [X] T022 (opus) [P] [US1] Cut sizes (SC-003): 8″ block, ¼″ seam → side setting piece QST cut 12⅝″, corner
  HST cut 6⅝″, grain on the outer edge, via `quiltPieces` + `cutFor` in
  `test/vitest/__tests__/print/print.spec.ts`

### Implementation

- [X] T023 (opus) [US1] On-Point preset: main and between blocks as one band on the 45° lattice (`map` =
  turn 45° + translate), outer ring of `set:` pieces clipped to the quilt rectangle through the outer
  block points, `corner: 'seam'` splits corner pieces, diagonal sashes and cornerstones when
  `sash > 0` with ids per contract, `shape: 'rect'`, `turns: 90`, in `src/model/layout/presets.ts`
- [X] T024 (opus) [US1] `generateSlots` dispatches `on-point` to the preset; remove it from `unsupported`
  in `src/model/layout/slots.ts`
- [X] T025 (sonnet) [P] [US1] `slotGroup` knows `set:` (plain group `set`) and `b:m:` (block), and
  `describeSlot` reads "between r1-c1" / "setting piece" in `src/model/plain.ts`
- [X] T026 (sonnet) [US1] Layout inspector: style picker enables On-Point; On-Point fields (blocks across,
  down, block side with width on point shown, sashing, corner style); quilt finished size line, in
  `src/components/LayoutInspector.vue` (props widen to `Layout`) and `src/pages/QuiltEditorPage.vue`
  (show the inspector for both styles)
- [X] T027 (sonnet) [US1] Verify in the browser (dev server on 9000, Playwright Firefox): make 3 × 4 On-Point,
  place and color blocks with This / All / Alternate, turn, undo, save, reopen; screenshot to the
  scratchpad

**Checkpoint**: On-Point usable with Exact edges.

---

## Phase 5: User Story 2 - Finish an uneven edge (Priority: P1)

**Goal**: Floating (default 1″), Trimmed blocks, No fill; printing matches.

**Independent Test**: On-Point 3 × 3 through the four finishes → drawing, size, print list change.

### Tests

- [X] T028 (opus) [P] [US2] Edge finish tests: Floating adds 2·float to width and height and `cut` ⊇
  `outline` for setting pieces; Trim gives `b:m:` partial spaces (clipped outline, whole transform)
  and no `set:`; None gives no outer ring, a zigzag `edge`, no border slots while `quilt.borders` is
  untouched; `trim` true for Floating and Trim; float 0 = Exact in
  `test/vitest/__tests__/model/layout-on-point.spec.ts`
- [X] T029 (opus) [P] [US2] Print tests: Floating cut list uses the oversized triangles; Trim counts partial
  blocks as whole blocks in pieces and yardage; None binding length = zigzag perimeter in
  `test/vitest/__tests__/print/print.spec.ts`

### Implementation

- [X] T030 (opus) [US2] Edge finishes in the On-Point preset: Floating moves the clip rectangle out by
  `float` and sets `cut` to the smallest right-isosceles triangle containing each setting piece;
  Trim turns the outer ring into `b:m:` block pieces; None drops the outer ring and clip and
  returns the zigzag `edge` in `src/model/layout/presets.ts` / `src/model/layout/engine.ts`
- [X] T031 (opus) [US2] `generateSlots` skips borders when the edge finish is None and reports them as set
  aside (for the inspector note) in `src/model/layout/slots.ts`
- [X] T032 (sonnet) [US2] Inspector: edge finish select (Exact, Floating, Trimmed blocks, No fill) with the
  float amount, note when borders are set aside; Borders inspector disabled with the same note in
  `src/components/LayoutInspector.vue` and `src/components/BordersInspector.vue`
- [X] T033 (opus) [US2] Print: binding from `Generated.edge` perimeter; trim note ("Trim the quilt top to the
  marked edge") and the edge drawn on the quilt diagram when `trim` in
  `src/components/PrintPreview.vue`
- [X] T034 (sonnet) [US2] Verify in the browser: switch through the four finishes, check size, borders gone
  and back, print preview list and binding; screenshots to the scratchpad

---

## Phase 6: User Story 4 - Switch between Horizontal and On-Point (Priority: P2)

**Independent Test**: Horizontal 3 × 3 with nine blocks → On-Point → back: blocks stay.

- [X] T035 (sonnet) [P] [US4] Conversion test: Horizontal → On-Point keeps cols, rows, `block[0]`, `sash[0]`;
  On-Point → Horizontal gives square block and sash, no sash border; `reconcile` keeps `b:r…`
  and drops `b:m:`/`set:` in `test/vitest/__tests__/model/slots.spec.ts`
- [X] T036 (opus) [US4] `convertLayout(layout, style)` in `src/model/layout/slots.ts`; style picker change
  goes through it, then the existing removal warning (`reconcile().dropped`) in
  `src/components/LayoutInspector.vue` / `src/pages/QuiltEditorPage.vue`
- [X] T037 (sonnet) [US4] Verify in the browser: place nine blocks, switch both ways, warning lists between
  blocks

---

## Phase 7: Engine proof (FR-002a, SC-004)

**Goal**: every planned lattice layout generates through the engine without engine changes.

- [X] T038 (opus) Test-only presets in `test/vitest/__tests__/model/layout-presets.ts`: Variable Point
  (sheared map), Baby Blocks and Variable Blocks (three diamonds per cell), Horizontal Strip with a
  half-drop strip and Vertical Strip (bands), One Patch (single shape), triangle (up/down cell),
  60° diamond, hexagon, clamshell (arcs; trimmed and shaped edge), spool (arcs, alternating turn),
  mixed triangle grid with merges (Baby Blocks, Star, Hexagons and Triangles via `Merge`)
- [X] T039 (opus) Merge support in the engine (union outline of covered triangles via `arrange()`, id
  `{shape}:{first covered id}`) in `src/model/layout/engine.ts`
- [X] T040 (opus) Checks for every preset: unique ids, area sum = clip area (no gaps or overlaps), hit test at
  each space's interior point finds that space, `drawQuilt` runs on a stub 2D context, plain pieces
  produce templates (arcs kept) in `test/vitest/__tests__/model/layout-presets.spec.ts`
- [X] T041 (sonnet) Performance check: 100 × 100 On-Point generates under the budget used by
  `test/vitest/__tests__/model/perf.spec.ts`, added there

---

## Phase 8: Polish & cross-cutting

- [X] T042 (sonnet) [P] Copy the On-Point grammar into `specs/003-project-format/contracts/slot-ids.md`
- [X] T043 (sonnet) [P] Help: On-Point and edge finishes in `src/help/guides/designing-a-quilt.md` (help docs
  style; link checks green)
- [X] T044 (sonnet) [P] CLAUDE.md layout section: engine, presets, slot fields, how to add a style as a preset
  in `CLAUDE.md`
- [X] T045 (sonnet) [P] Tracker and spec 001 status: FR-029c, FR-022, FR-029e (On-Point part) done in
  `/home/theodore/Obsidian/NotesVault/Projects/RRQuilts_todo.md`; spec 016 status Implemented
- [X] T046 (sonnet) Run quickstart.md end to end (automated + manual); fix what fails; `make commit`

---

## Dependencies

- Phase 1 → Phase 2 (engine) → US3 (format) → US1 → US2 → US4. Phase 7 needs Phase 2 only (can run
  beside US1–US4). Phase 8 last.
- US2 builds on US1's preset; US4 needs US1's schema and inspector.

## Parallel examples

- Phase 2: T002, T003, T004 together; then T006, T007, T008, T009, T010 together (different files),
  while T011 → T012 → T013 → T014 run in order.
- US1: T021 and T022 together; T025 beside T023.
- Phase 7 (T038–T041) beside Phases 4–6.

## Implementation strategy

MVP = Phases 1–4 (engine with identical Horizontal, v5 format, On-Point with Exact edges): a
releasable increment. Then US2 (edge finishes, default Floating once it exists: until then new
On-Point quilts start Exact), US4, the engine proof, polish. Commit per phase on
`016-layout-engine`.
