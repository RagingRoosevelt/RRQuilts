# Tasks: English Paper Piecing (EPP layouts, rosettes, multi-select)

**Input**: `specs/027-epp-layouts/` (plan.md, spec.md, research.md, data-model.md, contracts/ui.md,
contracts/formats.md, quickstart.md), with `specs/050-epp-stamps/spec.md` (rosettes) and
`specs/051-epp-multiselect/spec.md`.

**Tests**: unit tests for `src/model/epp/`, the formats and library parsing (requested); editors
checked through the Tests tab checklist (`src/dev/checklist.ts`, next free id **TC-280**, one TC per
feature).

**Conventions**: framework-free model in `src/model/` (no Vue/Quasar/store imports); every project
edit through `project.change`; frozen documents (tests `structuredClone` before hand edits); help text
follows the help style rules (no em or en dashes, no clause-joining semicolons, UI labels quoted as
in the UI). Tests in `test/vitest/__tests__/`. Commit with `make commit COMMIT_PRE="lint build"
MSG=…` after running the tests (keep `RRQuilts-promo.xcs` out via `.git/info/exclude`). Reference
geometry: `../Kits Quilts epp-proto/prototypes/epp/epp-core.js` (port, don't copy blindly; its known
limits are listed in the plan's research).

**Story map** (labels used below; specs' own story numbers in brackets):

| Label | Story | Phase |
| --- | --- | --- |
| US1 | Design a custom EPP shape: shape editor, Multi-shape [027 US4, FR-006, FR-006a] | MVP |
| US2 | Make and use rosettes: rosette editor, placement modes, Close space, colorings [050 US1-2, 027 US2-3 engine] | MVP |
| US3 | EPP section in Libraries and projects, packs, `.rrqepp` [027 US5, FR-013, 050 US3] | MVP |
| US4 | Print a rosette [050 US4, FR-006a] | MVP |
| US5 | EPP quilt: start, arrange, color, Layout (1U, seam, edge), Borders [027 US1-3, FR-001, FR-014] | 2 |
| US6 | Print an EPP quilt [027 US6, FR-008] | 2 |
| US7 | Multi-select [051] | 3 |
| US8 | Rosettes in block quilts [027 FR-015] | 3 |

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [X] T001 Create folders src/model/epp/ and test/vitest/__tests__/model/epp/ with a one-line header comment in a placeholder src/model/epp/index.ts re-exporting nothing yet (removed once real modules exist); confirm `make lint` allows src/model/epp (framework-free rule applies to all of src/model)

---

## Phase 2: Foundational (format, geometry core; blocks every story)

- [X] T002 Create src/model/schema/epp.ts (TypeBox): `Pt` units tuple, `EppShape` (`...itemBase`, `outline` 3-24 points, `locked?`, `marked?`, `fill?`), `InternalShape` (`id`, `outline`, `marked?`), `RosettePiece` (`id`, `shape`, `at`, `turn`, `mirror?`, `scale` 1-4), `Rosette` (`...itemBase`, `shapes?`, `pieces` 1-500, `colorings: Coloring[]` min 1, `colorVariant?`), `EppPiece` (`id`, `shape?`, `rosette?`, `at`, `turn`, `mirror?`, `scale`, `coloring?`, `fills?`), `EppEdge` union (`none` / `cut` rect / `close` fill? / `custom` PathCommand[]), `EppLayout` (`style: 'epp'`, `unit`, `seam`, `edge`), per data-model.md
- [X] T003 Add `EppLayout` to the `Layout` union and optional `epp: { shapes?: InternalShape[]; pieces: EppPiece[] }` (max 5000 pieces) to `Quilt` in src/model/schema/quilt.ts; add optional `eppShapes` and `rosettes` to `Project` in src/model/schema/project.ts; set `VERSION = 12` there and add identity `migrations[11]` in src/model/io.ts
- [X] T004 Make `generateFor` in src/model/layout/slots.ts return no slots for `style: 'epp'`, and check every other `switch (layout.style)` (grep `layout.style`, `convertLayout`, `reconcile`, `applyLayout`, wizard pictures in src/render/layout-samples.ts) handles `'epp'` without crashing (no-op or excluded)
- [X] T005 In `parseProject` (src/model/io.ts) validate EPP refs: piece `shape` in `project.eppShapes` or the owning `quilt.epp.shapes`/rosette `shapes`, piece `rosette` in `project.rosettes`, rosette piece shapes resolve, duplicate ids; report dangling refs as problems (piece kept, drawn as an empty outline), never throw
- [X] T006 Regenerate public/schemas/rrq.v12.json (`npm run schema` in the container), set `rrq: 12` in public/schemas/formats.json, update tests that name v11 as current
- [X] T007 [P] Tests in test/vitest/__tests__/model/io.epp.spec.ts: v11 fixtures open as v12 unchanged; a project with shapes, rosettes and an EPP quilt round-trips; dangling shape/rosette refs reported, not thrown; over-limit outlines refused with a message
- [X] T008 [P] Create src/model/epp/geometry.ts: `place(piece, shapeOutline)` (scale, mirror, turn, translate, counter-clockwise result), `edges(poly)`, `edgeLength`, `cornerAngles`, `outerEdges(polys)` (edges not shared; a short edge along part of a long one splits the long one, fixing the prototype's half-covered edge limit), `overlaps(a, b)` (area > epsilon), `bbox`
- [X] T009 [P] Create src/model/epp/checks.ts `checkOutline(outline, marked)` → `{ closes, simple, wholeUnits, convex }` (closes: ≥ 3 distinct points and non-zero area; simple: no two non-adjacent edges cross; wholeUnits: every unmarked edge length within 1e-6 of an integer ≥ 1; convex: every corner < 180°), plus `patchFlags(...)` for a list of outlines returning failing indexes for the banner
- [X] T010 [P] Create src/model/epp/expand.ts `expand(doc-like lookup, piece)` → `{ id, poly, fill, shapeKey }[]` for shape pieces, rosette pieces (coloring then per-placement `fills`), and internal shapes; `lookupEpp(project)` builds the id → shape/rosette maps
- [X] T011 [P] Create src/model/epp/snap.ts `snapPiece(moving polys, others' outer edges, reachUnits)`: equal edges meet end to end reversed; a whole-unit edge along a longer whole-unit edge at whole-unit steps; a marked edge of length L to edges of L, kL, L/2, L/4 at steps of the shorter length; nearest wins; returns the transform delta (turn + translate) or null; candidates prefiltered by bbox
- [X] T012 Tests in test/vitest/__tests__/model/epp/geometry.spec.ts, checks.spec.ts, expand.spec.ts, snap.spec.ts (hexagon flower: six hexagons snap flush to the middle one; a 1U triangle edge snaps along a 2U edge at 0 and 1; marked 1.5 edge snaps to 3 and 0.75, not to 1; parallelogram 2-1-2-1 is convex and whole; a bow-tie fails `simple`; a dart fails `convex`)
- [X] T013 [P] Add EPP library item types to src/model/schema/library.ts (`{ type: 'epp-shape', category?, data: EppShape }`, `{ type: 'rosette', category?, data: Rosette, shapes?: EppShape[] }`), `LIBRARY_VERSION = 8`; `rrqlib: 8` in public/schemas/formats.json
- [X] T014 Give every library reader an explicit branch for the new types: `parseLibraryValue` and `inInches` in src/model/library-file.ts, `withSources`, `lookupOf`, `libraryGroups`, `itemFabrics`, `copyToMine` in src/model/library.ts, `items` in src/stores/library.ts (add `eppShapes`, `rosettes`); nothing that isn't `colors` is treated as a palette
- [X] T015 Tests in test/vitest/__tests__/model/library.epp.spec.ts: a v8 library with shapes and rosettes parses with no palettes created from them; v7 libraries still parse; a pack with a rosette carries its shapes; `copyToMine` of a rosette keeps credits
- [X] T016 Make `syncDraft` (src/model/library-items.ts) embed library shapes and rosettes used by rosettes and EPP quilts (and the shapes those rosettes use), and prune unused ones in the same undo step, as for blocks; test in test/vitest/__tests__/model/library-items.epp.spec.ts
- [X] T017 Settings: add `'epp'` to `libraryType` and `projectTab` types, defaults and validators in src/settings/settings.ts; add `epp: { vertexGrid: 'free' | 'square' | 'triangle'; angleStep: number; mode: 'free' | 'grow' | 'grid'; ungrouped: boolean; syncGrid: boolean }` with defaults (`square`, 15, `free`, false, true) and validation
- [X] T018 Create src/stores/epp-editor.ts (Pinia): current tool, placement mode (from settings), picked item (shape or rosette id), scale 1-4, grid offset and drag state, selection ids, hover edge, ghost pose; per-item view (zoom/pan) like `editor.views`
- [X] T019 Create src/components/EppCanvas.vue on `useViewport` (src/composables/viewport.ts): draws a list of polygons with fills (`colorLookup` / fabric fills as the quilt canvas does), outlines, grid (square or triangle lattice in units), labels slot, overlap tint, failing-patch highlight; emits tap/hover/drag in unit coordinates; props `polys`, `grid`, `view`, `readOnly`

**Checkpoint**: v12 projects and v8 libraries load, save and validate; geometry, checks, snap tested; empty canvas renders.

---

## Phase 3: User Story 1 - Design a custom EPP shape (P1) 🎯 MVP

**Goal**: Draw a shape by dragging corners on a 1U grid, with the four flags, locks, marked edges, Angle tool and Multi-shape.

**Independent Test**: quickstart Phase 1 steps 1-3 (2 × 1 rectangle, off-grid corner flagged then marked, Multi-shape hexagon → six internal shapes).

- [X] T020 [P] [US1] Create src/model/epp/shape-ops.ts: `newShape(author)` (unit square), `moveVertex(shape, i, p, grid)` (respects `locked`, snaps to free/square/triangle lattice), `moveEdge(shape, i, delta)`, `splitEdge(shape, i, t)`, `toggleMarked(shape, i)`, `toggleLocked(shape, i)`, `setAngle(shape, i, deg)` (moves the next unlocked vertex along its edge direction so corner i takes the angle; refuses when both neighbors are locked), `edgeLabels(outline)` (lengths as units or fractions: 1/2, 1/3, 1/4 … else 2 decimals)
- [X] T021 [P] [US1] Create src/model/epp/faces.ts `splitOutline(outline, lines)` → `InternalShape[]` via `arrange()` (src/model/geometry/arrangement.ts), one shape per bounded face, outlines normalized (counter-clockwise, first vertex at the min corner); also `gapAt(polys, p)` (the bounded face containing p not covered by any polygon, for Close space)
- [X] T022 [US1] Tests in test/vitest/__tests__/model/epp/shape-ops.spec.ts and faces.spec.ts (locked vertex doesn't move; Angle on a square corner to 60° gives a rhombus edge direction; labels "1/2", "1.41"; hexagon + three diameters → six triangles; gap between six hexagons around an empty middle → one hexagon)
- [X] T023 [US1] Add route `/project/shape/:id` (meta project) in src/router/routes.ts and create src/pages/ShapeEditorPage.vue: tabs Details / Draw / Print (as BlockEditorPage), tool rail (Undo, Redo, Vertex, Edge, Angle, Lock vertex), sidebar (Single shape / Multi-shape `SlidePicker`, Vertex grid snapping, Angle step), `EppCanvas` with the 1U grid, edge labels, lock and marked markers, angle markers (drag up widens, down narrows by the step), four flags per patch and the banner naming failing patches; edits through `project.change` on `project.eppShapes`; no colors anywhere
- [X] T024 [US1] Multi-shape mode in src/pages/ShapeEditorPage.vue: draw outline then lines across (lines snap to the grid and to existing points), live faces with flags; **Save as rosette** creates a `Rosette` with those internal shapes (one coloring, unfilled) in `project.rosettes` and routes to `/project/rosette/:id`
- [X] T025 [US1] Details tab: reuse `DetailsPanel.vue` for notecard, credits, license of an `EppShape` (add the item kind where it switches on block/quilt/project); Print tab placeholder showing the paper and fabric template of the shape at a chosen 1U (finished in US4's print code; until then the outline at true size)
- [X] T026 [US1] Checklist TC-280 in src/dev/checklist.ts: shape editor (grid snapping modes, flags and banner, Edge marking, Lock, Angle drag, Multi-shape to rosette)

**Checkpoint**: shapes can be drawn, checked and saved in the project.

---

## Phase 4: User Story 2 - Make and use rosettes (P1) 🎯 MVP

**Goal**: The rosette editor: place shapes and rosettes in Free / Grow / Grid modes, snap, turn, mirror, scale, Close space, Break into patches, Place rosettes ungrouped, colorings like blocks.

**Independent Test**: quickstart Phase 1 steps 4-7.

- [X] T027 [P] [US2] Create src/model/epp/grow.ts: `freeEdges(polys)` (outer edges), `attach(shape outline, scale, edge)` → piece pose with the shape's matching edge on the tapped edge outside the existing polys (tries each edge of the shape whose length fits: equal, or a whole-unit run), `fits(shape, scale, edge, polys)` boolean for hover colors (no overlap after attaching)
- [X] T028 [P] [US2] Create src/model/epp/grid.ts: `gridFor(shape, scale)` (square, triangle or hexagon lattice in units: `lattice` in src/model/blocks/shape.ts for triangle/hexagon), `snapGrid(offset, polys)` (moves the grid offset so a grid edge lies on the nearest placed edge), `cellAt(p, grid)` → piece pose of the shape sitting on the grid at p
- [X] T029 [P] [US2] Create src/model/epp/rosette-ops.ts: `newRosette(author)`, `addPiece(rosette, piece)`, `copyIn(rosette, other, at, turn, mirror, scale)` (no nesting: copies the other's pieces and internal shapes with fresh ids, fills from its current coloring into every coloring), `breakApart(container, placedRosetteId)` (for quilts: rosette piece → shape pieces with fills kept), `closeSpace(rosette, p)` (adds an internal shape from `gapAt`), colorings add/copy/delete/rename, `paintPiece(rosette, coloringId, pieceId, fill)`
- [X] T030 [US2] Tests in test/vitest/__tests__/model/epp/grow.spec.ts, grid.spec.ts, rosette-ops.spec.ts (attach a hexagon to each of a hexagon's 6 edges gives a flower; a 2U edge accepts a 1U square at two steps; grid snaps to a placed edge; copyIn of a flower into a rosette leaves no rosette refs and keeps fills; closeSpace fills the middle of a ring of six hexagons)
- [X] T031 [US2] Create src/components/EppPicker.vue: Scale slider (1-4) above the cards, **Place rosettes ungrouped** toggle at the top, Shapes / Rosettes filter, cards (picture at the picked scale, name), grouped by category like blocks; prop `fit?: (id) => boolean | undefined` colors cards green/grey while hovering an edge in Grow mode
- [X] T032 [US2] Add route `/project/rosette/:id` and create src/pages/RosetteEditorPage.vue: tabs Details / Design / Print; tool rail with the placement mode three-way switch (Free / Grow / Grid), **Drag grid** under it in Grid mode, Select, Turn (snapped turns when attached, free otherwise), Mirror, Delete, Break into patches (no-op inside a rosette since pieces are already loose; shown for parity), Close space, Paint; sidebar `EppPicker`, Grid mode **Sync grid to selected size**, colorings list and `PaletteTray` colors as the block editor's Color tab; `EppCanvas` with snapping on drag, overlap tint, four flags and banner for internal shapes
- [X] T033 [US2] Free mode ghost: on desktop hover (pointer type mouse) over empty canvas, `EppCanvas` draws the picked shape/rosette ghost at the snapped pose; tap places it; hidden over a placed piece and on touch
- [X] T034 [US2] Placing a rosette in the rosette editor always copies in (`copyIn`) with a one-time note "Rosettes placed in a rosette become its pieces"; Details tab via `DetailsPanel.vue` (notecard, credits incl. authors of copied-in rosettes, license); color variants as blocks (`colorVariant` locks arrangement editing, colorings stay editable)
- [X] T035 [US2] Checklist TC-281 (rosette editor: three modes, ghost, Grow fit colors, Drag grid and Sync grid, snapping across scales, Close space, colorings and palette swap, copy-in note)

**Checkpoint**: rosettes can be built, colored and saved.

---

## Phase 5: User Story 3 - EPP section, libraries, packs, `.rrqepp` (P1) 🎯 MVP

**Goal**: Shapes and rosettes live in an EPP section of Libraries and the project page, sync and share like blocks, and travel as `.rrqepp`.

**Independent Test**: quickstart Phase 1 step 8.

- [X] T036 [P] [US3] Create src/model/epp-file.ts: `EPP_FORMAT = 'rrqepp'`, `EPP_VERSION = 1`, TypeBox file schema (contracts/formats.md), `eppFile(item, shapes)`, `serializeEpp`, `parseEppFile` (validate, untrusted), `importEpp(doc, file)` (adds to project with credits, like `importBlock` in src/model/block-file.ts); add `rrqepp` to `FILE_TYPES` in src/storage/files.ts and `rrqepp: 1` to public/schemas/formats.json; tests in test/vitest/__tests__/model/epp-file.spec.ts
- [X] T037 [P] [US3] Create src/content/epp.ts: starter shapes (hexagon, equilateral triangle, square, 60° diamond, 45° diamond, half hexagon, jewel, kite, octagon, pentagon, 2U long hexagon) and rosettes (hexagon flower 7, double flower 19, six-diamond star, tumbling block, octagon and square) with deterministic ids `rrquilts.epp-<name>`; add them to `builtinLibrary()` (src/content/starter.ts) under categories
- [X] T038 [US3] Project page: **EPP** tab after Palettes in src/pages/SketchbookPage.vue (Mine / Library groups, cards with pictures from a small `eppThumbnail` in src/render/thumbnail.ts, **New shape**, **New rosette**, **Import** `.rrqepp`, card menu: Open, Duplicate, Export, Print (rosettes), Add to My library, Delete)
- [X] T039 [US3] Libraries page: **EPP** option in the type picker (`TYPE_OPTIONS`) and a gated EPP section in src/pages/LibrariesPage.vue with the Shapes / Rosettes filter, cards and the block cards' menus (Add to project, Copy to My library, Sync, Tags, Export `.rrqepp`); pack items read-only, copy to edit
- [X] T040 [US3] Tests in test/vitest/__tests__/model/library.epp.spec.ts (extend T015): add a library rosette to a project embeds its shapes; sync of a linked copy follows `source.version`; packing a rosette with an NC shape keeps the strictest license
- [X] T041 [US3] Checklist TC-282 (EPP tab and Libraries section, starters present, export/import `.rrqepp`, My library copy and sync)

**Checkpoint (MVP)**: shapes and rosettes made, stored, shared.

---

## Phase 6: User Story 4 - Print a rosette (P1) 🎯 MVP

**Goal**: The rosette print interface: paper and fabric cutting templates per patch, counts, rosette sheet.

**Independent Test**: spec 050 US4 test (Flower, 1U = 1 in, 4 rosettes → 28 paper + 28 fabric templates, grouped by fill, with the sheet).

- [X] T042 [P] [US4] Create src/model/epp/print.ts: `eppTemplates(polys with fills, unit, seam, count)` → grouped by shape key (outline up to turn), scale, mirror and fill, each with `paper` = poly × unit and `fabric` = `offset(paper, seam)` (src/model/print/polygon.ts) as `Piece`s (src/model/print/pieces.ts), counts × count; `rosetteSheet(rosette, coloring)` (pieces numbered)
- [X] T043 [P] [US4] Print prefs in src/model/print/prefs.ts: `rosetteUnit`, `rosetteCount`, `eppTemplates: 'paper' | 'fabric' | 'both'`, `rosetteSheet: boolean`, with defaults (1 in or 2.5 cm, 1, both, true)
- [X] T044 [US4] Tests in test/vitest/__tests__/model/epp/print.spec.ts (flower × 4 = 28 of each; fabric template is exactly `seam` larger on every side of a hexagon; mirrored kites counted apart; counts equal the broken-apart design)
- [X] T045 [US4] `PrintPreview.vue` `kind: 'rosette'` (templates sheets reused, rosette sheet, 1 in test square) and `PrintOptions.vue` `kind: 'rosette'` (1U length, how many, coloring, Paper / Fabric / Both, seam allowance, rosette sheet, page options); Print tab in RosetteEditorPage and card menu **Print** in the EPP tab/Libraries open it; ShapeEditorPage Print tab uses the same templates for one shape
- [X] T046 [US4] Checklist TC-283 (rosette print: options, counts, templates measure at 100 %, sheet)

**Checkpoint**: MVP complete. **Stop for the owner to try it** (Phases 1-6).

---

## Phase 7: User Story 5 - EPP quilt (P1, release phase 2)

**Goal**: An EPP quilt type whose Design tab is the EPP engine, with Layout (1U, seam, edge) and Borders tabs.

**Independent Test**: quickstart Phase 2 steps 1-2.

- [X] T047 [P] [US5] Create src/model/epp/quilt-ops.ts: `newEppQuilt(name, unit, seam)` (via `createQuilt` in src/model/new-quilt.ts with `layout: { style: 'epp', … }`, `epp: { pieces: [] }`), `placePiece`, `movePieces`, `paint(quilt, pieceId, rosettePieceId?, fill, scope: this | all | sameShape | sameFill)`, `breakIntoPatches(quilt, id)`, `makeRosette(doc, quilt, ids, name)` (selection → new rosette + one linked placement; placed rosettes copied in), `setUnit`, `setSeam`, `setEdge`
- [X] T048 [P] [US5] Create src/model/epp/edge.ts: `cutRect(polys)` (largest axis-aligned rectangle fully covered, starting value for Cut to size), `autoClose(polys, rect?)` → closing `InternalShape[]` via `arrange()` of outer edges + the straight bounding rectangle (faces outside every piece, inside the rectangle), `edgeOutline(quilt)` (none: union outline; cut: rect; close: rect; custom: path) for size, borders and binding
- [X] T049 [US5] Tests in test/vitest/__tests__/model/epp/quilt-ops.spec.ts and edge.spec.ts (unit change scales size, arrangement unchanged; autoClose on a 19-hexagon flower yields closing pieces whose union with the flower is the rectangle; paint scopes)
- [X] T050 [US5] Quilt wizard: **EPP quilt** choice in src/components/QuiltWizard.vue asking name, 1U length and seam allowance; creates through `useStartQuilt` (src/composables/start-quilt.ts) and opens the editor
- [X] T051 [US5] src/pages/QuiltEditorPage.vue: when `layout.style === 'epp'`, the Design tab mounts a new src/components/EppDesign.vue (EppCanvas + tool rail + EppPicker + `QuiltColorways` + Paint scopes This / All / Same shape / Same fill + Break into patches + Place rosettes ungrouped) instead of `QuiltCanvas` and block tools; Layout tab shows src/components/EppLayoutSection.vue (1U, seam, Edge: No trimming / Cut to size with size inputs and draggable sides / Auto-close with closing fill / Custom trim waits for spec 055 (owner, 2026-11-10)); Borders tab disabled with "Pick an edge in Layout first" and a button to Layout when edge is `none`
- [X] T052 [US5] Borders and binding around `edgeOutline` for made edges in src/model/layout/borders.ts (plain borders around any outline; pieced styles only on the rectangle from Cut to size and Auto-close); quilt size and Details use the edge outline (bounding box labeled as such for No trimming)
- [X] T053 [US5] Drawing outside a trim: pieces wholly outside faded, crossing pieces clipped visually at the trim; overlaps tinted; colorways applied to EPP fills in `drawQuilt`/EppCanvas lookup
- [X] T054 [US5] Checklist TC-284 (EPP quilt: wizard, Design tools, 1U change, edges, borders gating, colorways)

---

## Phase 8: User Story 6 - Print an EPP quilt (P1, release phase 2)

**Goal**: Paper and fabric templates at true size, counts per fill, yardage, test square, trim notes.

**Independent Test**: quickstart Phase 2 step 3.

- [X] T055 [US6] `PrintPreview.vue`/`PrintOptions.vue` `kind: 'quilt'` EPP branch: expand all pieces (closing pieces included), `eppTemplates` at the quilt's unit and seam, Paper / Fabric / Both and copies (count used, per fill, one of each), pieces wholly outside the trim left out with a note, trim line and size noted, 1 in test square, rosette sheet, credits
- [X] T056 [US6] Yardage for EPP quilts in src/model/print/yardage.ts: fabric templates' areas per fill (packed estimate as for templates today), plus borders and binding when on
- [X] T057 [US6] Tests in test/vitest/__tests__/model/epp/quilt-print.spec.ts (counts per shape/scale/mirror/fill; outside-trim pieces excluded; yardage grows with seam allowance)
- [X] T058 [US6] Checklist TC-285 (EPP quilt print: templates at 100 %, counts, yardage, trim notes)

**Checkpoint**: phase 2 complete. **Stop for the owner to try it.**

---

## Phase 9: User Story 7 - Multi-select (P2, release phase 3)

**Goal**: Select several pieces and act on them as one (spec 051).

**Independent Test**: quickstart Phase 3 step 1.

- [X] T059 [P] [US7] Selection ops in src/model/epp/selection.ts: `boxSelect(polys, rect)`, `selectSame(pieces, id)`, `transformSelection(pieces, ids, turn | mirror | scale | translate, pivot)`, `copySelection`, `pasteSelection` (fresh ids, placed rosettes stay linked), outside-edge snapping of the group via `snapPiece`; tests in test/vitest/__tests__/model/epp/selection.spec.ts
- [X] T060 [US7] Gestures in EppCanvas/EppDesign/RosetteEditorPage: Shift/Ctrl tap, box drag on empty canvas, long-press then tap on touch, Select all, Select same, Copy/Paste/Duplicate/Delete, nudge with arrow keys, Paint scope **Selection**, Make rosette and Break into patches on the selection, Bring forward / Send back; one undo step per action
- [X] T061 [US7] Checklist TC-290 (multi-select on desktop and touch)

---

## Phase 10: User Story 8 - Rosettes in block quilts (P2, release phase 3)

**Goal**: Rosettes whose outline matches a block space shape fill block spaces and print as EPP.

**Independent Test**: quickstart Phase 3 step 2.

- [X] T062 [P] [US8] Create src/model/epp/as-block.ts: `rosetteShape(rosette)` → `'square' | BlockShape | null` (outline matches a square, triangle, 60° diamond or hexagon up to turn), `rosetteBlock(rosette)` → hidden derived `Block` (`rosette: ItemId`, drawing = pieces fitted into the shape's unit outline via `fitShape`, patches keyed by piece ids, colorings mapped); add optional `rosette` to the block schema in src/model/schema/block.ts; rebuilt in `syncDraft` like data variants; tests in test/vitest/__tests__/model/epp/as-block.spec.ts Built: `src/model/epp/as-block.ts` `rosetteFit` (owner, 2026-11-12: the outline exactly the shape, straight edges, no gap or overlap), `rosetteBlock`, `syncRosetteBlocks` (called from `syncDraft`; `eppUsed` embeds the library rosettes they come from); `block.rosette` in the schema
- [X] T063 [US8] Block picker: **Rosettes** filter and EPP badge in src/components/PaletteTray.vue / BlockFilter.vue; offer only rosettes whose shape `takesBlock` accepts (src/editor/scope.ts) Built: a Blocks / Rosettes switch in the tray (src/components/PaletteTray.vue, via src/composables/rosette-blocks.ts) when some rosette fits, tiles badged EPP; `takesBlock`/`setTargets` `exact`: square rosettes only in square spaces; the Set tool finds rosette blocks before they are in the project
- [X] T064 [US8] Printing: block print paths (rotary in src/model/print/rotary.ts, block templates in pieces.ts, foundations) skip blocks with `rosette`; an **EPP templates** section in the quilt print lists their patches through `eppTemplates` (paper + fabric per patch, unit from the space size); test in test/vitest/__tests__/model/epp/block-print.spec.ts Built: `Piece.epp` from `quiltPieces`; the quilt print keeps them out of rotary cutting and adds "Paper templates: rosettes" and "Fabric templates: rosettes" under Templates; yardage counts them
- [X] T065 [US8] Checklist next free TC id (rosettes in a hexagon quilt: filter, placement, coloring, EPP templates, absent from rotary) Built: TC-293

---

## Phase 11: Polish & Cross-Cutting

- [ ] T071 [US2] Change the coloring of a rosette already placed (EPP quilt): for example a coloring choice on a placed rosette with several colorings, setting `piece.coloring` (owner, 2026-11-10: "We should have a method to change a rosette's selected color variation. We can leave that as a note for now") **Deferred to 0.9.1** (owner, 2026-11-24: 0.9.0 released without it; the EPP follow-ups are 0.9.1 on the roadmap).
- [X] T072 [US1] Close space lines: drag corner to corner to fill the closed spaces on each side of the line or split the piece it crosses; areas that are existing shapes become references (`faces.ts` `lineCut`, `match.ts` `pieceFor`, `rosette-ops`/`quilt-ops` `fillGap`/`splitPiece`, both editors; TC-286, fix TC-287)
- [X] T073 [US1] Cut to size fits the pieces: grid cells count only when fully covered, then each side pushed out to the pieces (`edge.ts` `cutRect`; owner, 2026-11-10: "cut-to-size is leaving weird bumps on the top of the quilt"; TC-288)
- [X] T074 [US1] Largest rectangle the pieces fill snaps its corners to piece corners within 1/4 U, in or out, landing as many corners as it can, then the smallest move (`edge.ts` `snapCorners`; owner, 2026-11-10; TC-289)
- [ ] T075 [US5] Cut to size sides draggable on the Design canvas (left out of T051: today only Width and Height inputs in src/components/EppLayoutSection.vue; the Design tab draws the cut line in src/components/EppDesign.vue, no handles) **Deferred to 0.9.1** (owner, 2026-11-24: 0.9.0 released without it; the EPP follow-ups are 0.9.1 on the roadmap).
- [ ] T076 [US5] Pieces wholly outside the cut shown faded on the Design canvas (left out of T053: EppDesign draws only the cut line; `drawQuilt` in src/render/draw.ts clips to the cut, no fade) **Deferred to 0.9.1** (owner, 2026-11-24: 0.9.0 released without it; the EPP follow-ups are 0.9.1 on the roadmap).
- [ ] T077 [US2] Edit an internal shape's outline from the rosette editor (outline tools, as the shape editor's) **Deferred to 0.9.1** (owner, 2026-11-24: 0.9.0 released without it; the EPP follow-ups are 0.9.1 on the roadmap).
- [ ] T078 [US2] Palette swap for rosette colorings (`PaletteSwapDialog` as for block colorings; TC-281 names it, RosetteEditorPage has none) **Deferred to 0.9.1** (owner, 2026-11-24: 0.9.0 released without it; the EPP follow-ups are 0.9.1 on the roadmap).
- [ ] T079 [US3] Fabric photos carried in `.rrqepp` exports (src/model/epp-file.ts embeds fabrics without image data) **Deferred to 0.9.1** (owner, 2026-11-24: 0.9.0 released without it; the EPP follow-ups are 0.9.1 on the roadmap).
- [ ] T080 [US3] Libraries page sidebar counts EPP items (check src/pages/LibrariesPage.vue) **Deferred to 0.9.1** (owner, 2026-11-24: 0.9.0 released without it; the EPP follow-ups are 0.9.1 on the roadmap).
- [X] T082 [US7] Multi-select reworked to the owner's design (2026-11-12, spec 051 Clarifications): no selection toolbar; the Select tool taps pieces in and out and boxes from empty space; a drag from a piece moves the selection; the rail's Turn, Mirror left to right, Mirror up and down (two buttons, owner: "let's just have two buttons for mirror-x and mirror-y"), Delete and Break act on it; the sidebar's Scale sizes it; a Duplicate rail button makes a temporary rosette in the picker (`clipRosette`, `DUPLICATE_ID`, placed by `pastePieces` at the ghost's pose) until the next one; Make rosette in quilts, Select same, copy/paste and front/back dropped (TC-291, then TC-292)
- [X] T083 [US7] Picked pieces mirror one by one in place (`flipEach`); a group turn steps by 360° over the lcm of each picked item's turn stops (`turnStops` from edge directions, `turnStep`), around the corners' mean (owner, 2026-11-12: "the flip tools should flip the pieces individually, not as a group. rotate should still function for the group, though. and rotate should be based on the least common multiple among the rosettes / shapes in the group"; TC-292)
- [X] T084 [Stretch] STL cutting templates, model: `src/model/print/stl.ts` (`buildTemplate` from the prototype on `proto/epp-stl`: offset rings joined by trapezoids, ear-clipped floor with the letters and hanging hole cut out, `checkMesh`, `stlBytes`, `stlLength`), `src/model/print/stl-font.ts` (Noto Sans Bold subset, OFL, from `scripts/stl-font.py`), print prefs `stl`; test/vitest/__tests__/model/print/stl.spec.ts
- [X] T085 [Stretch] 3D Print tab right of Print in the block, shape, rosette and quilt editors (shape editor added 2026-11-16, TC-300): `src/composables/stl.ts` (templates per kind, the picked one's solid, download), `src/components/StlPreview.vue` (software renderer), `src/components/StlOptions.vue` (Shape, Template, Advanced collapsed); block size shared with the Print tab (`src/composables/block-print-size.ts`); help in guides/printing.md (TC-294)
- [X] T087 [Stretch] Hanging hole on a line from the floor's middle out to a corner (`holeSpots` in src/model/print/stl.ts; text clears it across that line, level or upright); default 1U 2 in / 50 mm (src/model/print/prefs.ts `rosetteUnit`, the new-quilt wizard's EPP 1U and seam allowance follow the units via `eppDefaults`) (owner, 2026-11-13; TC-295); text up to a quarter smaller to fit a hole (`TEXT_FOR_HOLE`, TC-296); inner corner radius 2 mm (`STL_BUILD.rIn`, owner 2026-11-14, TC-297); project seam allowances, piecing 1/4 in or 6 mm and EPP 3/8 in or 10 mm, steps 1/8 in or 1 mm (`project.seams` in rrq v12, src/model/seams.ts, src/composables/seams.ts, EPP quilt layout `seam` removed with a parse-time upgrade, unit conversion; PrintPreview `eppSeam` for EPP templates and `lookFor`; LengthInput `step`; TC-298); block quilts' rosettes as EPP 3D templates (`quiltRosettes` in src/model/print/pieces.ts) and the seam note on their fabric templates (PrintPreview `rosetteSeamNote`, key `note`); the wizard's EPP seam applies on create (`useStartQuilt` `eppSeam`) (TC-299)
- [X] T086 [Stretch] Libraries: clicking an EPP shape or rosette opens a preview with Preview and 3D print tabs, a tab per shape for rosettes (src/components/EppLibraryItems.vue; TC-294)
- [X] T088 Even edge length (FR-016): `src/model/layout/even-edge.ts` (`blockEdgeItems` via `placementMatrix`, `niceLengths`, `blockSize`, `scaleBlockSize`), `src/components/EvenEdge.vue` (block, patch picture, edges, length buttons) under the block size in `src/components/LayoutInspector.vue`, block quilts only (not EPP quilts: 1U); help in guides/designing-a-quilt.md; test/vitest/__tests__/model/even-edge.spec.ts (owner, 2026-11-16; TC-301)
- [X] T089 EPP lists grouped by library and category (FR-013): `blocksByLibrary` / `blockSections` / `BlockSection` generic over blocks and EPP items (`Sectioned`, `listOf`), `src/components/BlockSections.vue` generic; `src/components/EppItems.vue` (Mine, then libraries) and `src/components/EppLibraryItems.vue` (by category) (owner, 2026-11-16; TC-303)
- [X] T090 EPP editors keep their first fitted view (`src/components/EppCanvas.vue` stores it on the first draw), so placing and dragging pieces never zooms or pans (owner, 2026-11-16; TC-304)
- [X] T091 Shape editor Multi-shape **Save as shapes** below Save as rosette (`saveShapes` in `src/pages/ShapeEditorPage.vue`: each piece a project shape via `newShape` + `normalize`, centered, `nonWholeEdges` marked; pieces matching a known or just-made shape skipped; opens the project's EPP tab) (owner, 2026-11-16; TC-305)

- [ ] T066 [P] Help guides src/help/guides/epp-shapes.md, rosettes.md, epp-quilts.md (front matter, help style rules, UI labels as in the UI), HelpLink from each editor; link checks pass (topics test) **Deferred to 0.9.1** (owner, 2026-11-24: 0.9.0 released without it; the EPP follow-ups are 0.9.1 on the roadmap).
- [ ] T067 [P] Layout gallery and picture check: an EPP quilt variation (G### newest on top) in src/dev/variations.ts if gallery quilts can carry EPP; Print examples in src/dev/print-examples.ts for a rosette and an EPP quilt **Deferred to 0.9.1** (owner, 2026-11-24: 0.9.0 released without it; the EPP follow-ups are 0.9.1 on the roadmap).
- [X] T068 Library template: add `rrqlib` 8 and the EPP item types to `~/Code/rrquilts-library-template` (`tools/common.py` FORMATS, build/validate) and upgrade our library repos (per CLAUDE.md); separate commits in those repos, owner approves pushes **Done for 0.9.0**: template tools write rrqlib 8 and take EPP shapes and rosettes from a pack's blocks.rrqlib (validated like blocks); library repos upgraded after the release push.
- [X] T069 Update CLAUDE.md (EPP section: model/epp, schema/epp, editors, formats rrq v12 / rrqlib v8 / rrqepp) and the specs' status lines; release fixtures (`project-v12.rrq`, `demo-v12.rrq`, PNGs) come with the release (scripts/release.md) **Done for 0.9.0**: CLAUDE.md EPP section; release fixtures written at release (project-v12, demo-v12 with its pictures, library-v8, epp-v1) by `__tests__/formats/epp-v12.ts` via the sample and demo writers.
- [ ] T070 Run quickstart.md end to end; performance check: drag with 3000 pieces stays smooth (dev Extremes card if practical) **Deferred to 0.9.1** (owner, 2026-11-24: 0.9.0 released without it; the EPP follow-ups are 0.9.1 on the roadmap).

---

## Phase 12: 3D EPP (spec User Story 7; owner 2026-11-23: ships in 0.9.0)

Branch `027-epp-3d` off `027-epp-layouts`, merged back before the release. Prototypes:
`prototypes/epp3d/fold.html` and `stuff.html` on `proto/epp-3d`. Tagged [3D] (this file's US7 is
multi-select).

- [X] T092 [3D] Format (rrq v12, unreleased): `EppLayout.threeD`, `EppDesign.seams` (`EppSeam`, `EppEdgeRef`) and `front` in src/model/schema/epp.ts; dangling seam and front pieces reported by `danglingReferences` (src/model/io.ts); published schema regenerated
- [X] T093 [3D] Fold solver src/model/epp/fold.ts (rigid plates, hinged seams, curl start, settle, `foldReport`, `openEdges`, front and `turnToFront`) and stuffing src/model/epp/stuff.ts (fabric under pressure at the firmest setting); src/model/epp/net.ts (quilt → net: y flipped, seam ends by shape edge, `seamsAt`, `seamMarks`); quilt ops `is3d`, `addSeam`, `removeSeam`, `setFront`, seams follow `breakIntoPatches` and go with deleted pieces; tests test/vitest/__tests__/model/epp/fold.spec.ts
- [X] T094 [3D] 3D assembly tab src/components/EppAssembly.vue (three.js 0.187, loaded on first use): fold, explode with stitches, fixed light with self-shadows, front, Stuff with "Can be stuffed" or why not, the note when stuffing might close what the fold can't (owner, 2026-11-23); tab and mode `assembly` in src/pages/QuiltEditorPage.vue, no Borders tab and no Edge for 3D quilts (TC-307, TC-308)
- [X] T095 [3D] Seam tool in src/components/EppDesign.vue (3D quilts): tap a free edge then an equal edge on another piece, tap a numbered edge to unpick; seams drawn in color with their numbers, the front piece ringed, seams counted in the readout (TC-309, TC-310)
- [X] T096 [3D] Project EPP tab (src/components/EppItems.vue): 3D filter, New 3D design, cards with a 3D badge (open, print, copy, delete); not listed under Quilts (src/pages/SketchbookPage.vue) (TC-306, TC-309)
- [X] T097 [3D] Print: the quilt picture of a 3D quilt shows each explicit seam's edges, colored and numbered, and no edge line (src/components/PrintPreview.vue `seamPicture`) (TC-311)
- [X] T098 [3D] Demo project (test/fixtures/epp3d-demo.rrq, since T114 public/demo/3d-epp.rrq) (owner, 2026-11-23): star pillow (stars turned half a point, interlocking), twisted pincushion, d4, d6 (one assembly), d8, d10 (kites, a project shape), d12, d20, hexagonal prism, truncated tetrahedron, soccer ball; written by test/vitest/__tests__/model/epp/demo3d.spec.ts with `EPP3D_DEMO=<file>` (designs in designs3d.ts), which checks each folds shut or closes once stuffed; offered in the checklist (TC-306)
- [X] T099 [3D] Help src/help/guides/epp-3d.md, linked from the 3D assembly tab
- [X] T102 New-quilt wizard, EPP mode: no Size or Sashing step (no block spaces), Borders kept (none by default, passed to the quilt; they show once it has a made edge) (src/components/QuiltWizard.vue; owner, 2026-11-23; TC-312)
- [X] T103 [3D] **3D EPP** toggle in the wizard's EPP mode (Layout step only when on) and in an EPP quilt's Layout tab (src/components/EppLayoutSection.vue `setThreeD`: on clears the edge and borders, off keeps the seams) (owner, 2026-11-23; TC-313)
- [X] T104 [3D] 3D assembly tab split: the flat net (src/components/EppCanvas.vue, seams tapped on and off, open seams red, front ringed) above the 3D view, or beside it; setting `epp3dSplit` (src/settings/settings.ts, Settings › Interface › 3D EPP, vertical by default); the Seam tool's code shared as src/composables/epp-seams.ts; `removeSeam` by index (seams never came off through a draft) (owner, 2026-11-23; TC-314)
- [X] T105 [3D] Stuffed design, a quilt setting (`EppLayout.stuffed`, `setStuffedDesign`) in the Layout tab (3D only) and the 3D assembly tab, plus the tab's Show stuffing (this view) switch in place of Stuff and Unstuff; a stuffed design stuffs once folded and turned; stuffed, the fold's open seams no longer show red; demo: star pillow, twisted pincushion and soccer ball stuffed (owner, 2026-11-23; TC-315)
- [X] T106 [3D] 3D EPP quilts listed under Quilts again, with a 3D badge, as well as in the EPP tab (src/pages/SketchbookPage.vue) (owner, 2026-11-23; TC-316)
- [X] T107 [3D] "Not closing" (red text, red seams in the net) follows the Stuffed design setting, not the view; the view switch renamed **Enable simulation view**, on whenever the tab opens a stuffed design (and when the tab shows another quilt) (owner, 2026-11-23; TC-317)
- [X] T108 [3D] Demo d10 uses a real die's kite (corners on a sphere: two right angles, 51.8° tip, long edges 2.06U marked) instead of the antiprism dual's 108°/36° kite (`trapezohedron` in test/vitest/__tests__/model/epp/designs3d.ts, tested); Enable simulation view shows off when the design isn't stuffed (owner, 2026-11-23; TC-318)
- [X] T109 Project Quilts tab Show: All, Data, Block, Patch and EPP quilts (block = has block spaces, as the editor opens it on Set), only types the project has, hidden with one type (src/pages/SketchbookPage.vue `kindOf`, `kindOptions`); help in guides/sketchbook.md (owner, 2026-11-23; TC-319)
- [X] T110 [3D] Stuffing mesh: each piece an even triangle mesh (a lattice inside it plus its outline, 6 points per unit, Delaunay; `pieceMesh` in src/model/epp/stuff.ts) in place of rings shrunk from the outline, whose spokes to the corners became folds all meeting in the middle (owner, 2026-11-23: the stuffed middle looked pinched); concave pieces keep the rings; mesh test in fold.spec.ts (TC-321)
- [X] T111 [3D] Card pictures of 3D EPP quilts (Quilts and EPP tabs): the folded object, turned to its front and stuffed for a stuffed design, drawn off screen with one shared three.js renderer in 12 ms slices, cached by what it shows; the flat picture until ready (src/render/epp3d-picture.ts, src/composables/quilt-picture.ts) (owner, 2026-11-23; TC-322)
- [X] T112 [3D] Print: a 3D quilt's picture page shows the numbered net and, below it, the folded object (as the 3D assembly tab first shows it, stuffed for a stuffed design; `useQuiltPicture().view3d` at 900 px, "Drawing the 3D view…" until ready) (src/components/PrintPreview.vue; owner, 2026-11-23; TC-323)
- [X] T113 [3D] Print preview: click the 3D view to turn it live (src/components/Epp3dPrintView.vue, `orbit` in src/render/epp3d-picture.ts, which now keeps each worked-out object so a new view only redraws); the pointer leaving or 15 s untouched bring the picture back and save the view (rrq v12 `epp.printView`, undoable) (owner, 2026-11-23; TC-324)
- [X] T114 Demo folder in the deployed app: `public/demo/` (precached: `demo/*.rrq` in the Workbox globs), the 3D demo moved there as `3d-epp.rrq`; `/?open_demo=<name>.rrq` (first `open_url`, renamed by the owner 2026-11-23: "the current method should be renamed to open_demo") opens a demo project at once (src/storage/demo.ts `demoName`: a bare name, `demo/<name>` or this site's link, nothing else; `demoText`), handled by src/pages/HomePage.vue beside `open_gist`; test test/vitest/__tests__/storage/demo.spec.ts (owner, 2026-11-23; TC-325)
- [X] T115 [3D] 3D EPP quilts only under Quilts: the EPP tab lists shapes and rosettes again (no 3D filter, cards or New 3D design; src/components/EppItems.vue), its count without them (owner, 2026-11-23; TC-326)
- [X] T116 Temperature quilts demo public/demo/temperature.rrq (365 days of highs, a month per row, highs and lows by week; a year of sample entries, the first weeks cut and sewn), written and checked by test/vitest/__tests__/model/temperature-demo.spec.ts (`TEMPERATURE_DEMO`); linked from guides/data-quilts.md (owner, 2026-11-23; TC-328). Then the owner's own save of it is the demo (colors on filler, borders and sashing; a fourth quilt, renamed Month pinwheels on point; Denim re-sourced from the Novelty pack to the built-in library), which the test only checks; project author "RRQuilts contributors" on all three demos (owner, 2026-11-23; TC-332)
- [X] T117 Demos in the welcome wizard (a Demos step after Help) and on the home page (Open a demo, right of Open from a gist): src/components/DemoList.vue from `DEMOS` (src/storage/demo.ts), opened by src/composables/open-demo.ts (also behind `?open_demo=`); help in guides/getting-started.md (owner, 2026-11-23; TC-328)
- [X] T119 Block and patch quilts demo public/demo/block-quilts.rrq (first in `DEMOS`): Medallions on point (three medallions, 14 in, 2½ in sashing, Queen with drop target), Diamonds with sashing (Diamond Point, two diamond blocks, 1 in sashing, 3 in border), Pieced strips (seven pattern strips, men's XL shirt back target), Tumbling cubes (Variable Patch); both overlays inverted, the shirt back black at full strength, the bed #757575 at 15% (owner, 2026-11-23: "for both overlays, do tint of #000000, max opacity, invert", then "for the medalians on point, do #757575 at 15%, inverted"); written and checked by test/vitest/__tests__/model/blocks-demo.spec.ts (`BLOCKS_DEMO`); linked from guides/designing-a-quilt.md (owner, 2026-11-23; TC-331, was TC-330)
- [X] T120 Traditional EPP demo public/demo/traditional-epp.rrq (second in `DEMOS`): Grandmother's Flower Garden (Garden Flower and Leaf rosettes, cut, border of green squares), Lone Star (Auto-close in cream; 1 in gold and 4 in navy borders), Cube corners (half hexagons and 60° diamonds; 1 in powder blue and 3 in navy borders); written and checked by test/vitest/__tests__/model/epp/traditional-demo.spec.ts (`EPP_DEMO`); linked from guides/getting-started.md (owner, 2026-11-23; TC-333)
- [X] T130 [0.9.1] Turn steps: a shape's stops are the lcm of its edge directions' and its corners; Turn on a single piece (EPP quilt Design tab, rosette editor) uses them instead of 360° over the corners, so the Hexi Kite turns 30° (was 90°) (src/model/epp/selection.ts `turnStops`; spec 051 note) (owner, 2026-11-24; TC-339)
- [ ] T129 Bug: Auto-close covers a piece that touches nothing (no other piece, not the edge): the arrangement keeps only the outline the pieces connect to, so the closing piece runs over it (drawn on top, and its template ignores it). Found writing the v12 demo, 2026-11-24. **Deferred past 0.9.0** (a floating piece is a design in progress; known issue).
- [X] T128 Bug: Auto-close (and Close space) could make a shape over 24 corners, which saved but wouldn't open ("Project file is damaged"); shapes the app makes to fill a gap now allow up to 1000 corners (src/model/schema/epp.ts `InternalShape`; rrq v12 unreleased, so no version bump), regression test in test/vitest/__tests__/model/epp/io-library.spec.ts (found writing the v12 format samples, 2026-11-24)
- [X] T126 New quilt wizard: a last **Details** step (title, author, license, notes) for every quilt type (src/components/QuiltWizard.vue, `QuiltDetails` in src/composables/start-quilt.ts; spec 006 FR-001 amended) (owner, 2026-11-24; TC-337)
- [X] T127 Home › Start a quilt adds the quilt to the open project (no close prompt); a new project only when none is open or it's read-only here (src/pages/HomePage.vue; spec 004 FR-050 amended) (owner, 2026-11-24; TC-338)
- [X] T124 Project › Quilts › Show labels shortened to All quilts, Data, Block, Patch, EPP (src/pages/SketchbookPage.vue `KINDS`, guides/sketchbook.md) (owner, 2026-11-24, test round note after TC-319; TC-335)
- [X] T125 Print: a 3D quilt's picture shows its explicit seams' edges in color without numbers, and no margin for them (src/components/PrintPreview.vue `seamPicture`) (owner, 2026-11-24, test round note after TC-323; TC-336)
- [X] T123 Built-in EPP shape categories: Regular Polygons (Triangle, Square, Pentagon, Hexagon, Octagon), Irregular Hexagons, Irregular Triangles, Diamonds; Squares and Polygons gone (src/content/epp.ts `STARTER_SHAPES`, `EPP_CATEGORIES`) (owner, 2026-11-23; TC-334)
- [X] T122 Test over the shipped demo files (test/vitest/__tests__/storage/demo.spec.ts): every public/demo file listed in `DEMOS` and the reverse, each opening with no report and the project author set (owner, 2026-11-23: "tests are up to date?")
- [X] T121 Bug: a library color used only as an EPP quilt's Auto-close fill was never embedded (cards drew the closing pieces white); `eppColorings` in src/model/library-items.ts counts it, regression test in test/vitest/__tests__/model/epp/io-library.spec.ts (found building T120; TC-333)
- [ ] T118 `?open_url=` to open any link (the demo-only link is now `?open_demo=`) (bug: specs/bugs/open-url-any-url.md; needs a Principle II exception; owner, 2026-11-23) **Deferred to 0.9.1** (owner, 2026-11-24: 0.9.0 released without it; the EPP follow-ups are 0.9.1 on the roadmap).
- [X] T100 [3D] Link the demo from the help (guides/epp-3d.md links `/?open_demo=3d-epp.rrq`; first planned as a gist)
- [X] T101 [3D] CLAUDE.md: 3D EPP (model/epp fold, stuff, net; EppAssembly; three.js) with T069 **Done** (CLAUDE.md, English paper piecing section).

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 (all stories need the schema, geometry, library branches, canvas).
- US1 and US2 can start after Phase 2; US2's Close space needs `faces.ts` from T021 (US1).
- US3 needs US1/US2 items to list (works with starters alone from T037).
- US4 needs US2 (rosettes) and Phase 2.
- **MVP stop after Phase 6.**
- US5 needs US2 (engine, picker) and US4's print code for later US6; US6 needs US5.
- **Stop after Phase 8.**
- US7 needs US5 (quilt) and US2; US8 needs US2 and the block quilt code.
- Polish last; T066 help pages may be written per phase as each lands.

## Parallel Examples

- Phase 2: T007, T008, T009, T010, T011, T013 touch different files and can run together after T002-T003.
- US1: T020 and T021 together, then T022; UI T023-T025 after.
- US2: T027, T028, T029 together, then T030; T031 alongside.
- US3: T036 and T037 together.
- US4: T042 and T043 together.

## Implementation Strategy

1. MVP (Phases 1-6): format, model, shape editor, rosette editor, EPP section, rosette print. Owner tries it (checklist TC-280 to TC-283).
2. Phase 2 release work (Phases 7-8): EPP quilt and its printing (TC-284, TC-285). Owner tries it.
3. Phase 3 (Phases 9-10): multi-select and rosettes in block quilts (TC-286, TC-287).
4. Polish, then the 0.9.0 release per scripts/release.md.
