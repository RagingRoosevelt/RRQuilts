# Implementation Plan: Project Setup & Delivery Pipeline

**Branch**: `005-project-setup` | **Date**: 2026-10-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-project-setup/spec.md`

## Summary

Scaffold the RRQuilts app with the official Quasar tooling (app-vite 3, TypeScript, Pinia, PWA mode,
Vitest), wrap every developer action in a Makefile that runs inside a pinned Node 24 container,
build straight into `docs/` with Pages fallbacks, preview with a pinned nginx container, guard
`docs/` drift in CI and `make push`, and ship a placeholder shell (spec 004 routes, settings with
`.rrq_conf` export/import, update prompt) that installs and works offline. See
[research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript (version from create-quasar scaffold; not TS 7), Node 24.21.0

**Primary Dependencies**: Vue 3.5, Quasar 2.35 + @quasar/app-vite 3.10, Pinia, Vue Router (history),
Workbox (via Quasar PWA mode), register-service-worker

**Storage**: `localStorage` (settings only in this feature)

**Testing**: Vitest via @quasar/quasar-app-extension-testing-unit-vitest; ESLint + Prettier

**Target Platform**: Evergreen Chrome/Edge, Firefox, Safari (desktop + iPad); static hosting
(GitHub Pages, nginx)

**Project Type**: Static single-page web app (PWA) + build tooling

**Performance Goals**: `make check` < 5 min warm (SC-005); shell first load small enough to precache
quickly (budget set when real features land)

**Constraints**: Offline after first load; no runtime network beyond own origin; never auto-reload;
host needs only Docker, make, git; repo path may contain spaces

**Scale/Scope**: ~8 placeholder routes, 1 settings module, tooling files; no product features

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / rule | Status | How |
|---|---|---|
| I. Static & Serverless | ✅ | Static build only; history routing with 404.html / try_files / navigateFallback |
| II. Offline-First PWA | ✅ | Quasar PWA (Workbox precache), update prompt, manifest |
| III. Open File Formats | ✅ | `.rrq_conf` with `format`/`version`, validated import, migrations table |
| IV. User Owns Their Data | ✅ | Settings on-device, guarded storage, export/import |
| V. Simplicity | ✅ | Only Quasar-stack deps; hand-written settings validation; no extra libs |
| Tech stack table | ✅ | Matches (Node 24 pinned, nginx pinned, npm, Vitest, ESLint/Prettier) |
| Build/Hosting (docs/, base path, .nojekyll, Docker targets, nginx rules) | ✅ | R3, R5, nginx config |
| Makefile targets incl. commit/push | ✅ | contracts/makefile.md |
| CI + README | ✅ | R11; README task |

Post-design re-check: ✅ no violations; Complexity Tracking empty.

## Project Structure

### Documentation (this feature)

```text
specs/005-project-setup/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── makefile.md
│   ├── routes.md
│   └── rrq_conf.schema.json
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
Dockerfile                    # targets: build (node:24.21.0-alpine3.24), serve (nginx:1.30.5-alpine3.24)
Makefile
docker/default.conf.template  # base path from RRQ_BASE; SPA fallback, no-cache rules, long cache for hashed assets
.github/workflows/ci.yml      # make check + docs drift check
README.md
package.json / package-lock.json
quasar.config.ts              # distDir docs, publicPath $RRQ_BASE, history mode, afterBuild 404/.nojekyll, PWA opts
tsconfig.json, eslint.config.js, .prettierrc
index.html
public/                       # icons (icongenie output), favicon
src/
├── App.vue
├── boot/                     # settings + theme init
├── router/ (index.ts, routes.ts)   # routes + open-project guard
├── layouts/MainLayout.vue
├── pages/                    # HomePage, SketchbookPage, QuiltEditorPage, BlockEditorPage,
│                             # ImageEditorPage, LibrariesPage, SettingsPage, NotFoundPage
├── stores/ (settings.ts, project.ts)
└── settings/                 # defaults, storage guard, rrq_conf export/import/validate/migrate
src-pwa/
├── register-service-worker.ts   # update prompt
├── manifest.json
└── pwa-env.d.ts
test/vitest/__tests__/
├── settings.spec.ts          # load/save/corrupt/unavailable/import/export/unknown-key round-trip
└── router-guard.spec.ts      # editor routes redirect without open project
docs/                         # build output (committed, never hand-edited)
```

**Structure Decision**: Single Quasar app at the repo root (Quasar's default layout), tooling files
at root, `docs/` as committed build output.

## Implementation Notes

- Order: Dockerfile + Makefile skeleton → scaffold in container → PWA mode + vitest ext →
  quasar.config (docs/base/history/afterBuild) → nginx + serve → shell routes/pages/guard →
  settings module + tests → update prompt → icons → CI → README → commit/push targets → verify
  quickstart end to end, including build reproducibility (R6).
- Quote `"$(CURDIR)"` everywhere (path contains a space).
- nginx serves the site under the same base path as the build (`/RRQuilts/` → `docs/`, `/` redirects
  there). The base comes from `RRQ_BASE` via the official nginx image's `/etc/nginx/templates`
  envsubst feature, so `docker/nginx.conf` is a template (`docker/default.conf.template`).
- First build after scaffold must be checked for non-deterministic output before enabling the CI
  drift check.

## Complexity Tracking

None.
