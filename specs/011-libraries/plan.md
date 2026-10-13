# Implementation Plan: Libraries

**Branch**: `011-libraries` | **Date**: 2026-10-12 | **Spec**: [spec.md](./spec.md)

## Constitution check

- Static/offline: libraries live in IndexedDB; no network (repositories are spec 012). ✅
- Open formats: `.rrqlib` (spec 002, amended) and `.rrqplt`, versioned, validated as untrusted. ✅
- User owns data: backup/restore of everything in Libraries; `navigator.storage.persist()` asked on
  the first library write. ✅
- Licenses (Principle VI): credits kept on every copy; packs lock their license and leave out items
  the user may not redistribute. ✅

## Data model

- **Library document** (`src/model/schema/library.ts`, TypeBox):
  `{ format: 'rrqlib', version: 1, units: 'in', kind, id, revision, name, description?, author?,
  license?, changelog?, credits?, categories: { id, name }[], items: LibraryItem[], packs?,
  repositories? }`.
  - `LibraryItem` = `{ type: 'block', category?, data: Block }` | `{ type: 'colors', category?,
    data: ColorCollection }`. `data` is the project-schema object itself (its `id`, `notecard`,
    `author`, `license`, `credits`, `version`, `revision` live there; spec 002 FR-004's envelope
    fields map onto it). Styles: `notecard.styles?: string[]`.
  - `ColorCollection` = `{ ...itemBase, colors: Color[] }`.
  - Everything in a library is stored **in inches** (as built-in is), so `toUnits` stays valid;
    importing a cm file converts once.
- **Source** gains optional `version` (the library item's `id@version` the copy started from) —
  for "Sync" and conflict detection. Optional field → no `.rrq` version bump; `npm run schema`.
- **Library ids**: My library gets `<author-slug>.<random>` once (stored with it). Library items in
  My library carry `source = { libraryId, itemId: id, revision, version, library: 'My library',
  author }` so, embedded in a project, they are library items (read-only) like built-in ones.
- **Linked copy**: a project item with `source.derived = true` and `source.libraryId` = My library.
  - "Add to my library": the library gets the item under the **same id**; the project item becomes
    a linked copy (stays editable).
  - "Edit" on an embedded My-library item: `copyBlock` (new id, `source` kept, derived) — the user
    is the author, so no credit is added (spec 009).
  - Needs sync when its canonical content ≠ the library item's (`canonicalContent` compare — sync,
    no hashing on every render). Conflict when `source.version` ≠ the library item's `version`.
- **Display**: `splitItems` drops library entries whose id is a linked copy in the project (the copy
  shows under My blocks with a sync icon).

## Modules

- `src/model/library.ts` (framework-free, pure, returns new docs):
  `emptyPersonal(me)`, `addItem(lib, item, category?)`, `syncItem(lib, copy) → { lib, conflict }`,
  `removeItem`, `renameItem`, `setCategory`, `setTags/Styles`, categories CRUD (delete → items
  uncategorized), `saveCollection(lib, name, colors)`, `addToCollection`, `copyToMine(lib, item, me)`
  (creditCopy, new id), `lookupOf(libs)` (My library → packs → built-in), `searchItems(lib, text,
  category)`.
- `src/model/library-file.ts`: `parseLibrary(text)` → `{ ok, doc, skipped[] }` (envelope must
  validate; each item validated alone and skipped with its reason; embedded `packs` parsed
  recursively; newer version → "update the app"; units → inches), `serializeLibrary`,
  `backupDoc(mine, packs, opts)`, `packDoc(mine, me, meta) → { doc, excluded[] }` (license lock via
  `requiredLicense`, ARR-by-others excluded, credits list), `restore(current, backup, choices)`.
- `src/model/collection-file.ts`: `.rrqplt` `{ format: 'rrqplt', version: 1, units, app, collection }`
  — `collectionFile`, `parseCollectionFile`, `importCollection(doc, file, me)` (project: colors as
  own) — mirrors `block-file.ts`.
- `src/storage/libraries.ts`: IndexedDB store `libraries` (idb `VERSION` 2 adds it): `getAll`,
  `put`, `delete`.
- `src/stores/library.ts`: `libraries` (built-in + stored), `mine`, `packs`; `items`/`lookup` now
  over all libraries (existing callers unchanged); actions persist then update; `loaded` awaits
  built-in + IndexedDB. Built-in colors exposed as one collection "Basic colors".

## UI

- `src/pages/LibrariesPage.vue` (route `/libraries`, replaces the placeholder):
  - Right: filter sidebar (menu button toggles it on phones): search, Libraries checkboxes (kind and
    counts; all checked), searchable checkbox dropdowns Type, Category, Tags, Styles; toolbar Import (`.rrqlib,.rrqplt,.json`, dispatch by `format`), Back up…, Share as pack….
  - Main: one group per library with matches (header: name, author, license, revision), cards (block thumbnails, collection swatch strips); card menu:
    Preview, Rename, Category…, Tags & styles…, Export (`.rrqbl` / `.rrqplt`), Copy to my library
    (packs/built-in), Delete (mine), Remove pack (pack header).
  - Categories dialog (add/rename/delete). Collection dialog (rename, reorder/rename/remove colors).
  - Thumbnails via `blockThumbnail(emptyDoc, …)` with all library colors.
- `SketchbookPage.vue`: Library section grouped by library; block menu "Add to my library…"
  (category) / "Sync to my library" (+ icon) / "Copy to my library" on pack items; Fabrics & Colors:
  select own colors → "Save to my library…" (one dialog: pick a collection or New collection + name); Import `.rrqplt` there.
- `PaletteTray.vue`: library colors grouped by collection; library colors get "Edit a copy…" (linked
  copy) so color changes can sync back.
- Dialogs: Backup (checkboxes), Restore (merge/replace My library; keep/replace each same-id pack),
  Share as pack (name, description, author, license with lock, excluded list).

## Testing

- Vitest: library-file (round trip, invalid item skipped, newer version refused, cm → in, embedded
  packs), library ops (add → linked copy; edit → sync; conflict; collections; categories delete),
  pack export (license lock, ARR exclusion, credits), collection file, lookup precedence, `splitItems`
  with linked copies. Search 500 blocks < 100 ms (`expectFast`).
- Playwright smoke: Libraries page lists Built-in; add block to My library in project A, visible in
  project B; backup → clear IndexedDB → restore.
- Quickstart: `quickstart.md`.

## Risks

- IndexedDB eviction → persist() request + backup reminder on the Libraries page.
- One library record per library: fine for blocks/colors (KBs); revisit when fabric images arrive
  (assets in their own store).
