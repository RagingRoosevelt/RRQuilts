# Tasks: Library Items in Projects

## Phase 1: Model
- [x] T001 Schema: `ItemId` for blocks/colors + references; optional `version`, `revision` on blocks and colors; regenerate schema
- [x] T002 `src/model/identity.ts` + tests: slug, itemId, canonicalContent (excludes notecard/source/editor/coloring names), contentVersion, stampVersions (revision increments only on change)
- [x] T003 `src/library/builtin.ts` + tests: deterministic built-in blocks/colors with `rrquilts.` ids and stable versions across builds
- [x] T004 `src/model/library-items.ts` + tests: isLibraryItem, embedItems, pruneLibraryItems, swapToLibraryVersion (fill remap by overlap), useMyCopy

- [x] T004b `src/model/block-file.ts` + tests: `.rrqb` serialize/parse/import (US6)

## Phase 2: App wiring
- [ ] T005 Settings: author + authorAsked (validated, exported); Settings page field with privacy note; first-creation prompt composable
- [x] T006 `stores/library.ts` (built-in loaded with versions); project store: new projects empty, prune inside `change`, stamp versions on save, mismatch detection on open
- [x] T007 actions: library lookup for set/paint/swap embedding; render color lookup includes library colors

## Phase 3: UI
- [ ] T008 Tray: My blocks / Library; My colors / Library colors
- [ ] T009 Sketchbook: My blocks / Library sections; Edit on library block → copy + "use my copy in quilts"; colors tab sections
- [ ] T009b Sketchbook: Export block (.rrqb) / Import block; file picker accepts .rrqb
- [ ] T010 VersionDialog on open (per item / all; default keep)
- [ ] T011 Update tests that relied on starter content inside projects; quickstart; CLAUDE.md; `make commit`
