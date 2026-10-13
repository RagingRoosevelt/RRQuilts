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

## Rules

- No server calls, no runtime CDN/font fetches — everything bundled and precached.
- History-mode routing (clean URLs). Deep links rely on SPA fallbacks: `docs/404.html`
  copy of `index.html` (Pages), `try_files` (nginx), Workbox `navigateFallback` (SW).
- Warn before discarding unsaved work; SW update prompts, never auto-reloads.
- Wrap `localStorage` access in try/catch; fall back to defaults.
- Prefer Quasar components and platform APIs over new dependencies.

## Spec Kit

Project principles: `.specify/memory/constitution.md` (authoritative).
Flow: `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`.

## Commands

Host needs only Docker, make, git (no Node). Run `make` for the list.

- `make dev` — dev server at `localhost:9000/RRQuilts/` (`POLL=1` if edits aren't picked up)
- `make test` / `make lint` (ESLint + vue-tsc + Prettier check) / `make format`
- `make build` — production build → `docs/` (reproducible; CI fails if committed `docs/` is stale)
- `make check` — lint → test → build
- `make serve` — nginx at `localhost:8080/RRQuilts/` serving `docs/`
- `make commit MSG="…"` — check + rebuild `docs/` + commit all; `make push` — refuses if dirty/stale
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
  (`public/schemas/rrq.v1.json`; regenerate with `npm run schema`, a test fails on drift)
- `io.ts` — `parseProject` (JSON → migrate → validate → duplicate ids → dangling refs + asset
  hashes reported), `serializeProject`. New version: bump `VERSION`, add `migrations[old]`.
- `units.ts` — only real lengths scale; block geometry is normalized 0…1
- `geometry/` — lines, circular arcs (`sweep` deg, + = CCW on screen, y down), Béziers;
  `arrangement.ts` turns seams into faces (outline component only; dangling → unconnected)
- `blocks/edit.ts` `applySeamEdit` — derive + stable ids/fills (`remap.ts`, 128² sampling)
- `coloring.ts` `paint` — copy-on-write quilt colorings (this / allIdentical / alternate)
- `layout/` — slots per `specs/003-project-format/contracts/slot-ids.md`; add a layout style by
  writing a generator and adding its id grammar there; `reconcile`/`applyLayout` on changes
- Fixture with every entity: `test/fixtures/everything.rrq`

## Editor (spec 006)

- `src/render/` — Canvas 2D: `paths.ts` cached `Path2D` per block (design units, true arcs),
  `draw.ts` quilt drawing + `fitView`, `hit.ts` tap → slot/patch (model polygons, testable),
  `affine.ts`/`placement.ts` transforms, `thumbnail.ts` cached data URLs
- `src/editor/` — `actions.ts` (pure: tap + tool → new doc), `scope.ts` (This/All/Alternate),
  `undo.ts` (Immer patch history), `color.ts`/`colors.ts`
- `src/stores/editor.ts` — session tool/mode/scope/selection/view state
- Plain sashes/cornerstones/borders use the hidden `plain` block (`src/model/plain.ts`)
- Starter blocks/colors: `src/content/starter.ts` (+ `grid.ts` grid-piece helpers, `four-patch.ts`, `five-patch.ts`, `seven-patch.ts`, `nine-patch.ts`, `letters.ts`) → built-in library (`builtinLibrary()`, ids
  `rrquilts.<name>`, deterministic inner ids so versions are stable), loaded at boot into
  `stores/library.ts`; `addStarterContent` only for tests
- Library items (spec 008, `src/model/library-items.ts`): `isLibraryItem` = has `source`, not
  `derived` → read-only. `project.change` runs `syncDraft` every edit: embeds referenced library
  blocks/colors, prunes unused ones (same undo step). `splitItems` = Mine vs Library for display
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
  (outside the repo); Vite ignores `docs/`, `specs/`, `reference/`.
- Workbox `skipWaiting` is forced off — updates apply only via the in-app prompt.
- `make dev` / `make serve` are plain HTTP. Over the LAN (not localhost) browsers treat that as
  insecure: no service worker, no install, no File System Access — so PWA install/offline can't be
  tested on a phone that way. Deferred: an HTTPS dev option (e.g. Vite `basicSsl` / mkcert).
