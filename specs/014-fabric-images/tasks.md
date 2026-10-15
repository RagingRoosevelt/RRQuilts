# Tasks: Fabric Images

- [x] T001 Schema: optional `Asset.data`, `Fabric.sizes`/`approximate`, `ColorCollection.fabrics`,
      `project.libraries`; project v2 + library v2 (no-op migrations); `npm run schema`; tests
- [x] T002 Licenses: `LicenseRef-Personal-Use` ranked as all rights reserved; tests
- [x] T003 Storage: idb v3 `images` store; `storage/images.ts` (put/get/has, hash dedupe); tests
- [x] T004 `render/fabric-images.ts` pattern cache + `stores/images.ts` tick; settings
      `fabricImages`, `imageSize`, `saveSize` (+ Settings UI)
- [x] T005 Rendering: fill lookup with patterns in quilt, block, thumbnails, trays/pickers
- [x] T006 `model/zip.ts` reader/writer (+ tests: round trip, unsafe paths, limits)
- [x] T007 `editor/fabric-import.ts` pipeline (+ tests for pure parts) and `FabricImportDialog.vue`
      (files/folder/zip → My library palette or project palette)
- [x] T008 Project save/open: own embedded at save size, library referenced, include option,
      `libraries` refs, embedded images to store on open; tests
- [x] T009 Missing-library offer dialog on open (+ Details tab entry)
- [x] T010 `fabric_collections/build_packs.py` + run on the four manufacturers
- [x] T011 Template repository at `~/Code/rrquilts-library-template` (tools, workflows, README)
- [x] T012 Library index + packs on/off in Libraries; zipped `.rrqlib` backup/import with images
- [x] T013 Print: SVG fabric patterns (largest image on the device). 1024 fetch waits on repositories (spec 002 US3)
- [x] T014 Connected libraries (spec 002 US3/US4): `storage/repositories.ts`; Libraries › Add from the
  web…, index packs download when switched on, Check for updates (changelog; Update / Skip),
  Disconnect; project library refs carry the address, Details tab **Connect**; print fetches 1024
- [ ] T015 Switch off built-in / My library palettes individually; free images of off packs;
  warn when a library uses an older format
