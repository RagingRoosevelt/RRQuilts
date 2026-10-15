# Tasks: Fabric Images

- [x] T001 Schema: optional `Asset.data`, `Fabric.sizes`/`approximate`, `ColorCollection.fabrics`,
      `project.libraries`; project v2 + library v2 (no-op migrations); `npm run schema`; tests
- [x] T002 Licenses: `LicenseRef-Personal-Use` ranked as all rights reserved; tests
- [ ] T003 Storage: idb v3 `images` store; `storage/images.ts` (put/get/has, hash dedupe); tests
- [ ] T004 `render/fabric-images.ts` pattern cache + `stores/images.ts` tick; settings
      `fabricImages`, `imageSize`, `saveSize` (+ Settings UI)
- [ ] T005 Rendering: fill lookup with patterns in quilt, block, thumbnails, trays/pickers
- [ ] T006 `model/zip.ts` reader/writer (+ tests: round trip, unsafe paths, limits)
- [ ] T007 `editor/fabric-import.ts` pipeline (+ tests for pure parts) and `FabricImportDialog.vue`
      (files/folder/zip → My library palette or project palette)
- [ ] T008 Project save/open: own embedded at save size, library referenced, include option,
      `libraries` refs, embedded images to store on open; tests
- [ ] T009 Missing-library offer dialog on open (+ Details tab entry)
- [ ] T010 `fabric_collections/build_packs.py` + run on the four manufacturers
- [ ] T011 Template repository at `~/Code/rrquilts-library-template` (tools, workflows, README)
- [ ] T012 Library index + packs on/off in Libraries; zipped `.rrqlib` backup/import with images
- [ ] T013 Print: SVG fabric patterns; 1024 fetch for printouts when connected
