# RRQuilts

Web-based quilt design tool. Static, offline-capable PWA — no backend. Free, no sign-up, MIT
licensed (`LICENSE`).

Repo: https://github.com/RagingRoosevelt/RRQuilts · Live: https://ragingroosevelt.github.io/RRQuilts/

Business requirements / UX: not yet specified (see `specs/` once `/speckit-specify` runs).
`reference/` (git-ignored) holds the reference quilt software's manuals as domain reference —
read for quilting terminology and feature ideas, not as a spec to clone. In committed files call it
"the reference quilt software", never by name; don't use its coined feature names (generic terms
like sketchbook/worktable are fine).

## Stack

- Vue 3 + Quasar (app-vite), TypeScript strict, Pinia
- Quasar PWA mode (Workbox) — app must work fully offline after first load
- Vitest for unit tests
- Docker: multi-stage `Dockerfile` — `build` target (Node on Debian slim — not Alpine: Node on musl
  segfaulted intermittently; changing it reinstalls `node_modules`) and `serve`
  target (nginx, hosts the built site)
- Hosting: GitHub Pages from `main` → `/docs`. Build output goes to `docs/` (committed;
  never hand-edit, never put documentation there). Base path configurable, default
  `/RRQuilts/`; `docs/.nojekyll` emitted.

## Data

- **Projects**: `.rrq` files — JSON, saved/opened on the user's filesystem.
  File System Access API where supported; download + `<input type="file">` fallback.
- **Settings**: `localStorage`; export/import as `.rrqconf` (JSON).
- **Project drafts / personal libraries / repo cache**: IndexedDB (drafts = crash recovery, not a save).
- **Resource repositories**: git repos of extra library content, fetched on user request (the only
  network use). Cached for offline. Untrusted: validate, never execute. Projects embed used items.
- **Library files**: `.rrqlib` (JSON) — one format for personal-library backup and shareable
  resource packs, told apart by required `kind: "personal" | "pack"` (packs carry author + license).
  UI keeps own work separate from packs/repos; pack items are read-only, copy to own library to edit.
  Same content structure as a resource repository.
- Only our own formats (`.rrq*`); other quilt software formats are deliberately unsupported.
- All formats carry `{ "format": ..., "version": N }`. Bump `version` + add a migration
  for any schema change. Treat loaded files as untrusted: validate, never crash.
- A new `.rrqlib` (or index) version must also go into the library template
  (`~/Code/rrquilts-library-template`, `tools/common.py` `FORMATS`, plus build/validate for new
  fields): library repos' weekly check sees the app's `formats.json` and `tools/upgrade.py` pulls
  the template's tools. Then upgrade our own library repos (`libraries/<maker>`,
  `~/Code/rrquilts-fractal-blocks` (RagingRoosevelt's Novelty, RagingRoosevelt/rrquilts-novelty-blocks, offered
  in `bundled_libraries.json`; the fabric brands wait in `bundled_libraries.json.draft`)).
- `test/fixtures/formats/`: one sample per released format version (`<format>-v<N>.<ext>`), opened
  by a test; `demo-vN.rrq` = a demo project with a quilt per layout capability each version added
  (`write-demo.spec.ts`), `demo-vN/` = PNGs of its quilts and blocks drawn by that release
  (`scripts/format-images.py`). A release that ships a new format version adds them (`scripts/release.md`).
- **Tests tab** (testing aids, `make dev` only; first tab **Checklist**: `dev/checklist.ts` manual checks shown as
  `<build>-TC-###` (build = version + commit after the release, from a dev-only `__dev/build` endpoint reading .git), Not tested / Works / Needs iteration / Problem with notes, sample files to download; progress per release line in localStorage `rrq.dev.checklist` (apart from
  app data), text blocks between checks (+ in each gap, `rrq.dev.checklist.notes`), **Copy results** for pasting back; add checks for new features; a check for a fix or a reworked check gets a new id and quotes the owner's note in `last`; checks that worked are removed after a round; route and nav behind `import.meta.env.DEV`;
  `make build` fails if any of it reaches `docs/`): `pages/DevPage.vue` + `src/dev/`.
  **Layout gallery** (`/dev/gallery`): `dev/variations.ts` = quilts per layout and setting with
  blocks/solids/mixes (`dev/fill-quilt.ts`), each with what it should show, drawn live with seams;
  **newest first, new ids (G###) on top** whenever a feature adds a layout capability or setting.
  **Picture check** (`/dev/pictures`): each demo sample drawn now vs its release PNGs, with
  differences and reference labels (v6.07). Also **Borders** (every style, generated from
  `BORDER_STYLE_NAMES` in `model/layout/borders.ts`), **Sweeps** (`dev/sweeps.ts`: one setting
  stepped through its range), **Extremes** (`dev/extremes.ts`, with build/draw times), **Blocks**
  (every built-in block, named), **Print** (`dev/print-examples.ts`: PrintPreview with a `doc` prop
  for gallery quilts). Each quilt builds as its own project when its card scrolls into view (`dev/build.ts` `buildOne`, `DevQuiltCards.vue` with `q-intersection once`, as the project block list); blocks draw the same way. Point the owner to them (localhost:9000/RRQuilts/dev/…)
  before releases and after format/layout/drawing changes; never publish them.

## Rules

- No server calls, no runtime CDN/font fetches — everything bundled and precached. Exceptions,
  user-initiated only: resource repositories, and Open from a gist (`storage/gist.ts`, GitHub API).
- History-mode routing (clean URLs). Deep links rely on SPA fallbacks: `docs/404.html`
  copy of `index.html` (Pages), `try_files` (nginx), Workbox `navigateFallback` (SW).
- Warn before discarding unsaved work; SW update prompts, never auto-reloads.
- Wrap `localStorage` access in try/catch; fall back to defaults.
- Prefer Quasar components and platform APIs over new dependencies.

## Spec Kit

Project principles: `.specify/memory/constitution.md` (authoritative).
Flow: `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`.
New specs/stories/bug write-ups outside the feature in progress: `specs/backlog` branch in the
`../Kits Quilts specs` worktree (constitution, Development Workflow); never commit to `main`.
Every release starts by merging `main` into `specs/backlog`, pushing it, then merging it into `main`
(`scripts/release.md` step 1), so `main` carries the drafted specs.

## Commands

Host needs only Docker, make, git (no Node). Run `make` for the list.

- `make dev` — dev server at `localhost:9000/RRQuilts/` (`POLL=1` if edits aren't picked up)
- `make test` / `make lint` (ESLint + vue-tsc + Prettier check) / `make format`
- `make build` — production build → `docs/` (reproducible; CI fails if committed `docs/` is stale)
- `make check` — lint → test → build
- `make serve` — nginx at `localhost:8080/RRQuilts/` serving `docs/`
- `make commit MSG="…"` — check + rebuild `docs/` + commit all; `make push` — refuses if dirty/stale
- `make release` — pick major/minor/hotfix, then Claude follows `scripts/release.md`: writes the
  `CHANGELOG.md` entry (shown at Help › About › Changelog; features for quilters, not commits), sets
  `package.json` version, commits on `release/X.Y.Z`, fast-forwards `main`, pushes, and tags
  `vX.Y.Z` (every release must be tagged and the tag pushed). A test keeps the two versions matching
- Ad-hoc commands in the container: copy the `RUN` macro in the Makefile (quote the repo path — it
  contains a space).

## Code layout

- `quasar.config.ts` — base path (`RRQ_BASE`), `docs/` output, 404/.nojekyll hook, PWA options
- `src/router/routes.ts` — routes + open-project guard; `src/pages/` screens
- `src/settings/` — settings persistence + `.rrqconf`; `src/stores/` Pinia stores
- `src/stores/project.ts` — the open project; **all edits go through `change(fn)`** (bumps
  revision, schedules the draft). Status, save/save-as/copy, open file/recent/draft, tab takeover
- `src/storage/` — IndexedDB (`idb.ts` wrapper; `drafts`, `recent`) and `.rrq` file I/O
  (File System Access with download/input fallback)
- `src/session/` — 15 s draft autosave throttle; one-editing-tab Web Lock + BroadcastChannel
- `src-pwa/` — manifest, update prompt (`register-sw.ts`); has its own `package.json`
- `test/vitest/__tests__/` — unit tests
- `docker/default.conf.template` — nginx (base path substituted at start)
- `assets/icon.svg` — placeholder icon source; regenerate with `@quasar/icongenie` (skip apple
  launch images — they bloat the offline cache)

## File-format model (`src/model/`, spec 003)

Framework-free (lint forbids Vue/Quasar/stores imports) — pure functions over `RrqDoc`.

- `schema/` — TypeBox schemas = TS types + validation + published JSON Schema
  (`public/schemas/rrq.v10.json`; regenerate with `npm run schema`, a test fails on drift)
- `io.ts` — `parseProject` (JSON → migrate → validate → duplicate ids → dangling refs + asset
  hashes reported), `serializeProject`. New version: bump `VERSION`, add `migrations[old]`.
- `units.ts` — only real lengths scale; block geometry is normalized 0…1
- `geometry/` — lines, circular arcs (`sweep` deg, + = CCW on screen, y down), Béziers;
  `arrangement.ts` turns seams into faces (outline component only; dangling → unconnected)
- `blocks/edit.ts` `applySeamEdit` — derive + stable ids/fills (`remap.ts`, 128² sampling)
- `project-palettes.ts` — v3 project palettes (`palette.collections`: named groups of own colors and
  fabrics by id); `syncPalettes` (in `syncDraft`) files loose own items into the first palette. v4
  `source` links one to a My library palette (`base` = per-item hashes at the last sync;
  `resolveSync` decides each difference's direction, conflicts go to the user)
- `coloring.ts` `paint` — copy-on-write quilt colorings (this / allIdentical / alternate)
- `layout/` — one engine: `engine.ts` `tile(Tiling)` = bands of a repeating cell stepped by a, b, one
  affine `map`, `merges` (triangle grids), `clip` to the quilt (`clip.ts`, curved outlines too);
  `presets.ts` (`horizontal`, `onPoint`, `strips`, spec 018 `variablePoint`, `onePatch`, `tumbling`;
  `patternBands` = strip patterns shared with pieced borders in `borders.ts`; spec 026 `asBlocks` turns
  patches into shaped block spaces for `shapedBlocks`, Baby Blocks and Diamond Point, `flowTiling` =
  flow angle) return a `Tiling`; `strips.ts` strip ops (add/insert/
  delete/swap/set, square fixes); `slots.ts` `Slot` has kind/shape/turns/
  alt/size/cut, `Generated` has edge/trim; `reconcile`/`applyLayout`/`convertLayout` on changes. Add
  a style = a preset + its id grammar in `specs/003-project-format/contracts/slot-ids.md`; test-only
  presets (`__tests__/model/layout-presets.ts`) prove the planned ones
- `colorways.ts` — quilt colorways (palette swaps of the primary colorway, the quilt's own colors:
  `from` fill key → `to` fill; `shownColorway` saved, `primaryName`; deleting the primary bakes the
  next in); applied in `drawQuilt`, `quiltPieces`. `components/QuiltColorways.vue` (badge / row /
  Design panel); in a non-primary colorway the Design Colors tab is `ColorwayMapping.vue` (each
  primary color → its replacement). `components/PaletteSwapDialog.vue` (+
  `composables/swap-options.ts`) = palette swap for block colorings and quilt colorways
- `targets.ts` (+ `garments.ts`) — target sizes (beds, garments…) → outline; quilts store `target`
  (choices + resolved outline); `components/TargetEditor.vue` (wizard + Layout tab `TargetSection`)
- Fixture with every entity: `test/fixtures/everything.rrq`

## Editor (spec 006)

- `src/render/` — Canvas 2D: `paths.ts` cached `Path2D` per block (design units, true arcs),
  `draw.ts` quilt drawing + `fitView`, `hit.ts` tap → slot/patch (model polygons, testable),
  `affine.ts` (re-exports `model/geometry/affine.ts`)/`placement.ts` transforms, `thumbnail.ts` cached data URLs
- `src/editor/` — `actions.ts` (pure: tap + tool → new doc), `scope.ts` (This/All/Alternate),
  `undo.ts` (Immer patch history), `color.ts`/`colors.ts`
- `src/stores/editor.ts` — session tool/mode/scope/selection/view state
- Plain sashes/cornerstones/borders use the hidden `plain` block (`src/model/plain.ts`); so does a
  painted empty block space (spec 026)
- Shaped blocks (spec 026): `src/model/blocks/shape.ts` (triangle / diamond60 / hexagon: outline in
  the size's unit square, leg↔size, `shapeOrient` turns, `fitShape` onto a space, triangle `lattice`);
  `block.shape` fixed at creation; placement/derive/snap take it; Set matches shapes (`takesBlock`).
  Starter shaped blocks: `content/shaped*.ts` (pieces in side-1 centered coordinates; curves as seams + points in `shaped-curves.ts`), filed by block type. Sidebar block filter: `BlockFilter.vue` + `render/layout-samples.ts` (wizard pictures, `blockFits`)
- Starter blocks/colors: `src/content/starter.ts` (+ `grid.ts` grid-piece helpers, `four-patch.ts`, `five-patch.ts`, `seven-patch.ts`, `nine-patch.ts`, `letters.ts`, `strips.ts`, `medallions.ts`; `palette-colorings.ts` = each block recolored per themed palette) → built-in library (`builtinLibrary()`, ids
  `rrquilts.<name>`, deterministic inner ids so versions are stable), loaded at boot into
  `stores/library.ts`; `addStarterContent` only for tests
- Library items (spec 008, `src/model/library-items.ts`): `isLibraryItem` = has `source`, not
  `derived` → read-only. `project.change` runs `syncDraft` every edit: embeds referenced library
  blocks/colors, prunes unused ones (same undo step). `splitItems` = Mine vs Library for display
- Tags and technique (spec 029, `model/tags.ts`): notecard `techniques` (fixed list, author's) replaced
  free-text `styles` (`upgradeNotecards` upgrade in every parser and stored libraries); tags are the
  quilter's: on own items in the notecard, on others' in My library `annotations` (by item id; packs and
  `.rrqbl` exports drop tags); tag list = tags in use, `system` hidden. `model/blocks/construction.ts`
  reads curved/set-in seams, pieces, narrowest piece, difficulty from the drawing (Construction filters).
  `components/TagsDialog.vue` (tags only: Libraries, Blocks tab); technique = Needs/Efficiency checklists in block Details (`TECHNIQUE_GROUPS`, never applied by the app); ⭐ `FAVORITE` tag always first, `FavoriteBadge.vue` on cards
- Identity (`src/model/identity.ts`): shareable ids `<author-slug>.<random>`; `version` = 12-hex
  content hash (sizes hashed in inches), `revision` display counter; stamped on save
- `.rrqbl` single-block files: `src/model/block-file.ts`; `.rrqplt` single palette (color-collection) files (spec 011;
  the UI calls color collections **palettes**)
- Credits/licenses (spec 009, `src/model/credits.ts`): items carry `author`, `license`, `credits`
  (origin first); copying/editing others' work (`creditCopy`) appends the previous author. Chain
  locks the license (ARR > NC > SA). `components/DetailsPanel.vue` = Details tab (project/quilt/block)

## Libraries (spec 011)

- `src/model/schema/library.ts` (`.rrqlib`: My library backups with embedded packs, and packs;
  items `{ type: 'block' | 'colors', category?, data, colors? }`, content in inches),
  `model/library-file.ts` (parse with per-item skips, backup, restore, license-checked `packDoc`),
  `model/library.ts` (add/sync with **linked copies** — own project items whose `source.derived`
  points at a My-library item; conflicts via `source.version`; collections; `withSources`/`lookupOf`
  over all libraries), `model/collection-file.ts` (`.rrqplt`)
- `stores/library.ts`: built-in + My library + packs (IndexedDB `libraries`, `storage/libraries.ts`);
  `items`/`lookup` cover every library. `pages/LibrariesPage.vue`; sketchbook Add/Sync/Copy

## Help (spec 013)

- `src/help/<section>/<id>.md` (guides, math, techniques, resources): front matter (title, order,
  summary) + Markdown (`marked`); `::calc <name>` places a calculator; inline `<svg>` diagrams.
  `topics.ts` loads them (bundled, offline); `calc.ts` calculators run the print code (`cutFor`,
  `yardage.ts`) so help math matches printouts. `pages/HelpPage.vue` at `/help/<section>/<topic>`;
  `components/HelpLink.vue` = "?" links from editors/print. A test checks calc names and topic links
- Help › About › Roadmap (`about/roadmap.md`): the owner's picks of backlog specs per target version (their
  tracker: `~/Obsidian/NotesVault/Projects/RRQuilts_todo.md`, Roadmap candidates); update it at each release

## Fabric images (spec 014)

- Images live once per device in IndexedDB `images` (`storage/images.ts`, keyed by SHA-256); documents
  hold `Asset`s without `data` (references). `render/fabric-images.ts`: decode cache, true-scale
  `fabricFill` patterns (`colorLookup(doc, extra, { ctx, devicePerUnit })`), `swatchStyle`, `imagesTick`
  (redraw trigger), `display` (settings `fabricImages`, `imageSize`)
- Paint ids: `fabric:<id>` (`editor/paint.ts` `fillFor`/`paintOf`). Import: `editor/fabric-import.ts` +
  `components/FabricImportDialog.vue` (256/512 WebP, never enlarged, 8 in ≈ default)
- Save/open: `storage/fabric-files.ts` (own fabrics embedded at `saveSize`; library fabrics referenced,
  256 px when `project.includeLibraryImages`; `absorbImages` on open); `model/library-refs.ts`
- Libraries: palettes hold `fabrics`; zipped `.rrqlib` (`model/zip.ts`, `storage/library-zip.ts`:
  `library.json` index + packs, backups with `images/`); packs switch off via setting `packsOff`
  (`library.views` = on, `allViews` = all). `public/schemas/formats.json` = current format versions
- Tooling: `fabric_collections/build_packs.py` (manufacturer zips → `libraries/<maker>/sources/`, gitignored);
  each `libraries/<maker>` is a brand repository in the template layout, built by its own
  `tools/build.py`. Template: `~/Code/rrquilts-library-template` (RRQuilts/rrquilts-library-template)

## Printing (spec 010)

- `src/model/print/` (framework-free): `pieces.ts` (block/quilt pieces, lettered templates),
  `rotary.ts` (cut sizes, strip plans), `yardage.ts`, `pack.ts`, `polygon.ts`, `format.ts`,
  `prefs.ts` (print prefs in app settings `print`, merged with defaults)
- Print tabs: `components/PrintOptions.vue` (inspector) + `components/PrintPreview.vue` in place of
  the canvas (sheets at true size in SVG, zoomed to fit on screen). A second `printOnly` copy is
  teleported to `<body>`; `@media print` hides `#q-app`, so only sheets print. `@page` injected

## Block editor (spec 007)

- `src/editor/draw-ops.ts` — pure seam-line operations on a `Drawing` (normalized coords; design
  space = × block size for rotation/arcs); `snap.ts` (nodes → grid → seams); `block-ops.ts`
  (new/copy/colorings/attribution, `SelectionOp`)
- `src/composables/viewport.ts` — shared zoom/pan/pinch + tap/drag routing (tools claim drags)
- `src/render/draw-block.ts`; `components/BlockCanvas.vue` (tool gestures), `BlockInspector.vue`,
  `pages/BlockEditorPage.vue` — every drawing change goes through `applySeamEdit` + `markDerived`
- Library items keep `source` attribution; edits/copies set `derived` (constitution Principle VI)

### Immer + Vue rules

- The project lives in a `shallowRef` and is **frozen**: never mutate it or bind `v-model` to it.
  Edit via `project.change(recipe, { coalesce? })` — mutate the draft or return a new document.
- Don't pass Vue reactive proxies into Immer (`toRaw` if ever needed).
- Model functions return frozen results; tests that hand-edit them must `structuredClone` first.

## Gotchas

- Dev-server file watching must not see big folders: npm cache lives in `~/.cache/rrquilts-npm`
  (outside the repo); Vite ignores `docs/`, `specs/`, `reference/`, `fabric_collections/`.
- Workbox `skipWaiting` is forced off — updates apply only via the in-app prompt.
- `make dev` / `make serve` are plain HTTP. Over the LAN (not localhost) browsers treat that as
  insecure: no service worker, no install, no File System Access — so PWA install/offline can't be
  tested on a phone that way. Deferred: an HTTPS dev option (e.g. Vite `basicSsl` / mkcert).
