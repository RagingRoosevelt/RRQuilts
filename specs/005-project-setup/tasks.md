---
description: "Tasks for 005 Project Setup & Delivery Pipeline"
---

# Tasks: Project Setup & Delivery Pipeline

**Input**: `/specs/005-project-setup/` (plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md)

**Tests**: Required by the constitution for settings load/save/import/export; plus the route guard.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [x] T001 Create `Dockerfile` with `build` target (`node:24.21.0-alpine3.24`, workdir `/app`) and `serve` target (`nginx:1.30.5-alpine3.24`, copies `docker/default.conf.template` to `/etc/nginx/templates/` and `docs/` to the html root under the base path)
- [x] T002 Create `Makefile` skeleton: `help` (default, parses `##` comments), image build, quoted `"$(CURDIR)"` docker-run macro with `-u $(id -u):$(id -g) -e HOME=/tmp`, TTY detection, `RRQ_BASE ?= /RRQuilts/`
- [x] T003 Scaffold the app in the build container with `create-quasar` (app-vite, TypeScript, Composition API, Pinia, ESLint + Prettier) into the repo root, keeping existing files; remove sample pages/components
- [x] T004 Add PWA mode (`quasar mode add pwa`) and Vitest extension (`quasar ext add @quasar/testing-unit-vitest`) in the container
- [x] T005 Merge scaffold `.gitignore` with existing one (keep `reference/`; ignore `node_modules`, `.quasar`, `dist`; do NOT ignore `docs/`)

## Phase 2: Foundational

- [x] T006 Add `install`, `dev` (port 9000, `--hostname 0.0.0.0`, `POLL=1` → `RRQ_POLL`), `build`, `test`, `lint`, `check`, `clean` targets to `Makefile`, auto-`install` when `node_modules` missing
- [x] T007 Configure `quasar.config.ts`: `build.distDir: 'docs'`, `build.publicPath` from `RRQ_BASE`, `vueRouterMode: 'history'`, `vite.server.watch.usePolling` from `RRQ_POLL`, Dark plugin `'auto'`, Notify plugin
- [x] T008 Add `build.afterBuild` hook in `quasar.config.ts` copying `docs/index.html` → `docs/404.html` and writing `docs/.nojekyll`
- [x] T009 Configure PWA in `quasar.config.ts` + `src-pwa/manifest.json`: GenerateSW, `skipWaiting: false`, `clientsClaim: true`, `navigateFallback` index under base, manifest name/short_name RRQuilts, `start_url`/`scope` `./`, `display: standalone`, theme color
- [x] T010 Verify `make build` produces `docs/` with `404.html`, `.nojekyll`, `sw.js`, `manifest.json` and asset URLs under `/RRQuilts/`

**Checkpoint**: tooling and build pipeline work.

## Phase 3: User Story 1 — Clone to running app (P1) 🎯

**Independent test**: fresh clone on a host without Node → `make dev` serves with live reload; `make test lint` pass.

- [x] T011 [US1] Verify `make` lists all targets with descriptions and `make dev` is reachable from the host with live reload (and with `POLL=1`)
- [x] T012 [US1] Verify files created by container runs (`node_modules`, `docs/`) are owned by the host user

## Phase 4: User Story 2 — Build & preview (P1)

**Independent test**: `make build && make serve`; deep-link refresh works; no-cache headers present.

- [x] T013 [P] [US2] Write `docker/default.conf.template`: serve `/RRQuilts/` (from `${RRQ_BASE}`) from html root, `try_files $uri $uri/ ${RRQ_BASE}index.html`, `/` → redirect to base, `Cache-Control: no-cache` for `index.html`/`sw.js`/`manifest.json`, long immutable cache for hashed assets
- [x] T014 [US2] Add `serve` target to `Makefile` (build `serve` image, run on `localhost:8080` with `RRQ_BASE` env)
- [x] T015 [US2] Add host-side `commit` target: `COMMIT_PRE := check`; `git add -A`; commit with `-m "$(MSG)"` when set, else editor
- [x] T016 [US2] Add host-side `ensure-clean`, `ensure-docs-clean` helpers and `push` target: `PUSH_PRE := ensure-clean build ensure-docs-clean`; `git push -u origin HEAD`
- [x] T017 [US2] Verify build reproducibility: two consecutive `make build` runs leave `git status -- docs` unchanged; remove any volatile output (research R6)

## Phase 5: User Story 3 — Publish to Pages (P1)

**Independent test**: CI passes on a clean PR and fails when `docs/` is stale.

- [x] T018 [P] [US3] Create `.github/workflows/ci.yml`: on push + pull_request, checkout, `make check`, then fail if `git status --porcelain -- docs` is non-empty
- [x] T019 [P] [US3] Write `README.md`: what RRQuilts is, prerequisites (Docker, make, git), make targets incl. commit/push, Pages setup (`main` / `/docs`), `RRQ_BASE` override, license

## Phase 6: User Story 4 — Install, offline, updates (P1)

**Independent test**: install, go offline, all routes load; new build shows update prompt without auto-reload.

- [x] T020 [P] [US4] Create original placeholder icon `assets/icon.svg` → 1024px PNG; generate icons with `@quasar/icongenie` into `public/`; reference in manifest (incl. maskable)
- [x] T021 [US4] Implement update prompt in `src-pwa/register-service-worker.ts`: on `updated`, persistent Notify "Update available — Reload"; on click post `SKIP_WAITING` to the waiting worker and reload on `controllerchange`
- [ ] T022 [US4] Verify offline load of every route and the update flow per quickstart §3

## Phase 7: User Story 5 — Shell matches app flow (P2)

**Independent test**: routes navigate, guard redirects, settings persist/export/import, theme switches.

- [x] T023 [P] [US5] Write `test/vitest/__tests__/settings.spec.ts`: defaults when empty/corrupt/throwing storage, save/load round-trip, unknown keys preserved, export document shape, import valid, reject wrong `format`, reject newer `version`, invalid known value → default with report
- [x] T024 [P] [US5] Write `test/vitest/__tests__/router-guard.spec.ts`: project routes redirect to `/` without an open project; allowed with one
- [x] T025 [US5] Implement `src/settings/` (defaults, guarded storage, validate, migrate table, export Blob, import File) per data-model.md and `contracts/rrq_conf.schema.json`
- [x] T026 [US5] Implement `src/stores/settings.ts` (Pinia, persists on change, applies theme) and `src/stores/project.ts` stub `{ isOpen }`
- [x] T027 [US5] Implement `src/router/routes.ts` + guard in `src/router/index.ts` per `contracts/routes.md`, notice "Open a project first"
- [x] T028 [US5] Create `src/layouts/MainLayout.vue` and placeholder pages in `src/pages/` (Home with Start a quilt / Open file / Samples / Libraries / Settings entries as placeholders; Sketchbook; Quilt/Block/Image editors; Libraries; Settings; NotFound)
- [x] T029 [US5] Implement Settings page: theme Auto/Light/Dark, Export `.rrq_conf`, Import with error reporting
- [x] T030 [US5] Run tests until T023/T024 pass

## Phase 8: Polish

- [x] T031 Update `CLAUDE.md` commands section with real targets and any gotchas found
- [ ] T032 Run full quickstart.md validation; `make check` clean; commit with `make commit`

## Dependencies

- Phase 1 → Phase 2 → US1 → (US2, US3, US4, US5 in any order; US2's T017 before US3's CI drift check is trusted).
- T023/T024 before T025–T027 (tests first).
- T032 last.

## Parallel opportunities

- T013, T018, T019, T020 touch separate files.
- T023 and T024 together.

## Implementation strategy

MVP = Phases 1–4 (buildable, previewable site). Then US3 (CI + README), US4 (offline polish), US5
(shell), Polish. Commit after each phase.
