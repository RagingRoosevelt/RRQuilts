# Implementation Plan: App Flow — saving slice

**Branch**: `004-app-flow` | **Date**: 2026-10-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-app-flow/spec.md`

## Summary

Make projects real in the app: create, open (picker, drop, recent), save/save-as (overwrite in
place where the browser allows, download elsewhere), autosave a crash-recovery draft to IndexedDB
within 15 s, offer restore on start, show save status, and allow only one tab to edit a project
(with "continue here anyway" takeover). Scope and decisions: [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript, Vue 3 + Quasar (existing app)

**Primary Dependencies**: none new at runtime; `fake-indexeddb` (dev, tests only)

**Storage**: IndexedDB (`drafts`, `recent`), user files (`.rrq`)

**Testing**: Vitest (draft store, scheduler, file I/O fallbacks with mocks); manual quickstart for
pickers, two-tab takeover, and crash recovery

**Target Platform**: Chrome/Edge (File System Access), Firefox/Safari (download fallback)

**Project Type**: Web app (existing)

**Performance Goals**: draft write of a 20 MB project < 500 ms (off the input path)

**Constraints**: never lose > 15 s of edits; never two editing tabs; app works when IndexedDB is
unavailable

**Scale/Scope**: ~6 new modules, Home + header + temporary sketchbook changes

## Constitution Check

| Rule | Status | Notes |
|---|---|---|
| I. Static & Serverless | ✅ | Browser APIs only |
| II. Offline-First | ✅ | No network |
| III. Open File Formats | ✅ | `.rrq` via the 003 model; schema gains `project.id` before first release |
| IV. User Owns Their Data | ✅ | Drafts are recovery only; unsaved-work warnings; fallback when storage blocked |
| V. Simplicity | ✅ | No IndexedDB/runtime libraries; one dev-only test dependency |

## Project Structure

### Documentation

```text
specs/004-app-flow/
├── plan.md, research.md, data-model.md, quickstart.md
└── tasks.md            # /speckit-tasks
```

### Source Code

```text
src/model/schema/project.ts      # + project.id (and fixture/schema regeneration)
src/model/new-project.ts         # createProject()
src/storage/
├── idb.ts                       # tiny IndexedDB promise wrapper
├── drafts.ts                    # put/get/list/markClean/remove drafts
├── recent.ts                    # recent projects (handles where supported)
└── files.ts                     # open/save/save-as with File System Access + fallbacks
src/session/
├── autosave.ts                  # 15 s throttle + flush on hide/pagehide
└── tab-lock.ts                  # Web Locks + BroadcastChannel takeover
src/stores/project.ts            # doc, fileHandle, status, readOnly, change(), save(), open()
src/components/SaveStatus.vue    # header indicator
src/components/RestoreDrafts.vue # start-up restore dialog
src/pages/HomePage.vue           # New project, Open, Recent, drop-to-open
src/pages/SketchbookPage.vue     # temporary: name (editable) + counts + read-only banner
test/vitest/__tests__/storage/   # drafts, recent, files fallbacks, autosave timing
```

## Complexity Tracking

None.
