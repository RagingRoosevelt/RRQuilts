# Implementation Plan: Fabric Images

**Spec**: `spec.md` · **Constitution**: 1.9.0 (II, III, IV amended for this feature)

## Summary

Fabrics become first-class palette items with images stored once per device by hash, drawn as
true-scale patterns, and kept light: WebP at 256/512 (1024 for print), library images referenced
from projects, libraries split into switchable packs. Tooling outside the app turns manufacturer
downloads into personal libraries and gives creators a template repository.

## Technical context

- Vue 3 + Quasar + TypeScript strict, Pinia, Immer (frozen project), TypeBox schemas, Vitest.
- No new runtime dependencies. Zip: read with `DecompressionStream('deflate-raw')` (all target
  browsers), write stored (uncompressed) entries — images are already compressed. Images: canvas
  `createImageBitmap` + `OffscreenCanvas`/canvas `toBlob('image/webp', 0.8)` with a JPEG fallback when
  the result isn't WebP (Safari). SHA-256 via `crypto.subtle` (existing `sha256Hex`).
- Tooling: Python 3.12 via uv in `fabric_collections/` (Pillow); the template repository reuses it.

## Design

### Schema (project v2, library v2; additive, migrations are no-ops)

- `Asset.data` becomes optional: an asset without `data` is a reference resolved by `sha256` from the
  device image store (or a library). Hash checks on load apply only to assets with data.
- `Fabric` gains `approximate?: true` (size not set; 8 in default) and `sizes?: FabricImage[]`
  (`{ px, sha256, type, width, height, path? }`, library images per standard size). `image` stays the
  fabric's main image (largest ≤ 512).
- `ColorCollection` gains `fabrics?: Fabric[]` (palettes = colors + fabrics).
- `LibraryItem` keeps `colors` items (now with fabrics); blocks unchanged.
- Project gains `libraries?: LibraryRef[]` (`{ id, name, author?, url?, ref?, file?, packs[] }`).
- Licenses: `LicenseRef-Personal-Use` ("All rights reserved, for personal use"), ranked with all
  rights reserved (spec 009 locks). Library `license` stays an id; custom names/texts are recorded in
  the pack's `credits`.

### Image store (`src/storage/images.ts`, idb v3 store `images`)

- Row `{ id: sha256, blob, type, width, height }`. `putImage(blob)` hashes and dedupes.
- `src/render/fabric-images.ts`: in-memory `ImageBitmap` cache by hash; `patternFor(ctx, fabric)`
  returns a `CanvasPattern` scaled to true size (`setTransform(scale(size/px))`) or `undefined`
  while loading; loading resolves from the store, else from embedded `data` (and stores it). A Pinia
  counter (`images.tick`) increments as images arrive; canvases and thumbnails watch it.
- Setting `fabricImages`: `'standins'` (default) | `'blank'` | `'colors'`; `imageSize` 256 | 512;
  `saveSize` 256 | 512.

### Rendering

- `colorLookup` → `fillLookup(doc, ctx, setting)` returning `string | CanvasPattern | undefined`.
  Quilt, block, and thumbnail drawing use it; stand-in = `rgb(average)`, blank = background.
- Trays/pickers: fabric swatches are small canvases or object URLs of the 256 image.
- Print (SVG): `<pattern>` per fabric with the image as a data URL at true scale.

### Import

- `src/editor/fabric-import.ts` (pure where possible): decode → optional centre square crop → 512
  and 256 (no enlarging) → WebP/JPEG blob → hash → average colour (downscaled read). Zip input via
  `src/model/zip.ts` (reader/writer, safe paths, size limits).
- `components/FabricImportDialog.vue`: files/folder/zip, shared options, per-image list.
- Targets: a My library palette (new or existing) or the project palette.

### Projects

- Save: own fabrics embed `image.data` at `saveSize`; library fabrics (`source` from a library) are
  saved without `data` unless "Include library fabric images" (256) is ticked and the license
  allows. `project.libraries` is rebuilt on save from the fabrics' sources.
- Open: embedded images go into the image store; unknown libraries → offer dialog (connect URL or
  pick file), else stand-ins.

### Libraries and packs

- `library.json` index and pack documents per spec 002 FR-050–055; `stores/library.ts` tracks per
  pack `enabled`; disabled packs are hidden and their images released (kept if a project uses them).
- Zipped `.rrqlib` read/write (backup with images; imported packs).
- Repositories (connect, pin, update) follow spec 002 US3/US4 — after this feature's core.

### Tooling

- `fabric_collections/build_packs.py`: manufacturer zips + `collections.json` → personal library in
  repository layout (one pack per collection), WebP 256/512/1024, `library.json`, and a zipped
  `.rrqlib` per manufacturer.
- Template repository (local, unpublished): `~/Code/rrquilts-library-template` with `tools/`
  (build, validate, upgrade), `.github/workflows/` (validate, release, format check), README.

## Phases

1. Schema + licenses + migrations (tests).
2. Image store, pattern cache, settings, rendering in quilt/block/thumbnails/trays.
3. Import pipeline + dialog; zip reader/writer.
4. Project save/open rules (embed own, reference library, include option, library refs, offer).
5. Pack builder + run on downloads.
6. Template repository.
7. Library index, packs on/off, zipped `.rrqlib` import, print patterns, 1024 fetch.

## Complexity tracking

| Item | Why | Simpler alternative rejected because |
|---|---|---|
| Own zip reader/writer (~150 lines) | `.rrqlib` zips, zip import | A zip dependency adds bundle weight for two small uses; platform streams cover deflate |
| Image store keyed by hash | Dedupe across packs/projects, references | Per-item base64 in documents is the bloat we're removing |
