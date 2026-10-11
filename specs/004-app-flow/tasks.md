---
description: "Tasks for 004 App Flow — saving slice (US2 + minimal Home)"
---

# Tasks: App Flow — saving slice

**Input**: `/specs/004-app-flow/` (plan.md, research.md, data-model.md, quickstart.md)

**Scope**: US2 (Never lose work) and the Home/sketchbook minimum to exercise it (research R1).

## Phase 1: Setup

- [x] T001 Add `fake-indexeddb` dev dependency
- [x] T002 Add `project.id` to `src/model/schema/project.ts`; update fixture, regenerate schema (`npm run schema`), update spec 003 FR-010 and data-model
- [x] T003 `src/model/new-project.ts`: `createProject(name?)` (empty palette/blocks/quilts, new id, units from settings)

## Phase 2: Foundational storage

- [x] T004 [P] `src/storage/idb.ts`: open `rrquilts` v1 (stores `drafts`, `recent`), `get/put/delete/getAll` promises; every failure surfaces as a rejected promise
- [x] T005 [P] Tests `test/vitest/__tests__/storage/drafts.spec.ts` with fake-indexeddb: put/get, list dirty only, markClean, remove, storage failure → rejected
- [x] T006 `src/storage/drafts.ts` + `src/storage/recent.ts` (newest first, max 20, handles kept when present)
- [x] T007 [P] `src/storage/files.ts`: `pickProject()`, `readProjectFile(file)`, `saveToHandle()`, `saveWithPicker(name)`, `download(name, text)`, `supportsFileAccess()`; local types for picker APIs
- [x] T008 [P] Tests `storage/files.spec.ts`: fallback download produces `<name>.rrq` blob; picker path writes via handle (mocked)

## Phase 3: User Story 2 — Never lose work (P1) 🎯

- [x] T009 [US2] `src/session/autosave.ts`: 15 s throttle (first change schedules, later changes don't postpone), `flush()`, hide/pagehide hooks; test `session/autosave.spec.ts` with fake timers
- [x] T010 [US2] `src/session/tab-lock.ts`: `acquire(projectId)` (ifAvailable), `takeover(projectId, flush timeout 2 s, steal)`, BroadcastChannel `flush`/`flushed`, `onLost` callback
- [x] T011 [US2] `src/stores/project.ts`: doc, handle, fileName, revision/savedRevision, draftOk, readOnly, derived status; actions `newProject`, `open`, `change`, `save`, `saveAs`, `continueHere`, `close`; wires autosave, drafts, recent, tab lock; `beforeunload` warning when dirty
- [x] T012 [US2] `src/components/SaveStatus.vue` in the header (dot + label + Save button), Ctrl/Cmd+S and Ctrl/Cmd+Shift+S shortcuts
- [x] T013 [US2] `src/components/RestoreDrafts.vue`: on start list dirty drafts not locked elsewhere, restore/discard each
- [x] T014 [US2] `src/pages/HomePage.vue`: New project, Open file, Recent list (re-permission; "pick the file again" on denial), drop `.rrq` anywhere (in `App.vue`)
- [x] T015 [US2] `src/pages/SketchbookPage.vue` (temporary): editable project name, counts, read-only banner with "Continue here anyway"; route `/project` uses it
- [x] T016 [US2] One-time note on first download-fallback save; notices for open errors and load reports

## Phase 4: Polish

- [ ] T017 Update `CLAUDE.md` (storage/session modules); quickstart manual run; `make commit`

## Dependencies

T001–T003 → T004 → T006; T007 independent; T009/T010 → T011 → T012–T016 → T017.
