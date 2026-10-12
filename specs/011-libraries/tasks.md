# Tasks: Libraries

- [x] T001 Schema: `schema/library.ts` (document, items, collection, categories, changelog),
      `notecard.styles`, `Source.version`; `npm run schema`
- [x] T002 `model/library-file.ts` (+ tests): parse/serialize, per-item skip, units → inches,
      embedded packs, backup doc, restore
- [x] T003 `model/library.ts` (+ tests): add/sync/conflict/remove/rename, categories, collections,
      copy to mine, lookup, search (+ speed test)
- [x] T004 `model/collection-file.ts` (+ tests): `.rrqcc` export/parse/import
- [x] T005 Storage: idb v2 `libraries` store; `stores/library.ts` over all libraries, persist()
- [x] T006 `LibrariesPage.vue`: list, browse, search, categories, preview, item menus, route
- [x] T007 Import (`.rrqlib`/`.rrqcc`), Back up, Restore dialogs
- [x] T008 Share as pack dialog (`packDoc`: license lock, exclusions, credits) + pack import/update
      /remove
- [x] T009 Sketchbook: Library grouped by library; Add / Sync / Copy to my library; `splitItems`
      linked copies
- [x] T010 Colors: Save to my library / Add to library collection; `.rrqcc` import in Fabrics & Colors;
      tray groups by collection; Edit a copy of library colors
- [x] T011 Playwright smoke; `quickstart.md`; CLAUDE.md; `make commit`
