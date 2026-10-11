# Research: Project Setup & Delivery Pipeline

Versions checked against npm and Docker Hub on 2026-10-11.

## R1. Pinned versions

- **Decision**: `node:24.21.0-alpine3.24` (build target), `nginx:1.30.5-alpine3.24` (serve target,
  current stable line). App: `@quasar/app-vite` 3.10.x, `quasar` 2.35.x, `vue` 3.5.x, `pinia` 4.x,
  `vue-router` 5.x, Vitest via `@quasar/quasar-app-extension-testing-unit-vitest` 3.x (Vitest 4/5).
  Exact versions locked by `package-lock.json`.
- **Rationale**: Node 24 is the active LTS (Node 26 not yet promoted); app-vite 3 supports Node 24.
  nginx stable over mainline for a static host.
- **TypeScript**: use the version create-quasar scaffolds (5.x/6.x line). Do **not** force
  TypeScript 7 — the native compiler may not support the plugin API `vue-tsc` relies on. Revisit
  when Quasar's scaffold adopts it.
- **Alternatives**: Debian-slim Node images (larger, no benefit — no native deps); nginx mainline.

## R2. Scaffolding method

- **Decision**: Generate with `create-quasar` (app-vite, TypeScript, Composition API, Pinia, ESLint +
  Prettier) inside the build container, then `quasar mode add pwa` and
  `quasar ext add @quasar/testing-unit-vitest`. Prune sample content.
- **Rationale**: Official scaffold stays upgradeable via Quasar tooling; least hand-written config.
- **Alternatives**: Hand-written minimal Vite + Quasar plugin (more drift from upstream defaults).

## R3. Output folder, base path, 404 and .nojekyll

- **Decision**: `quasar.config.ts` → `build.distDir: 'docs'`, `build.publicPath` from env
  `RRQ_BASE` (default `/RRQuilts/`), `build.vueRouterMode: 'history'`. A `build.afterBuild` hook
  copies `index.html` → `404.html` and writes `.nojekyll`, so `quasar build -m pwa` alone produces a
  Pages-ready folder. Manifest `start_url`/`scope` are `./` (relative to the manifest under the base).
- **Rationale**: One env var drives router, assets, manifest, and service worker scope.
- **Alternatives**: Post-build steps in the Makefile (would make plain `quasar build` incomplete).

## R4. Service worker & update prompt

- **Decision**: Workbox `GenerateSW` (Quasar default), `skipWaiting: false`, `clientsClaim: true`,
  `navigateFallback: 'index.html'` (resolved under the base). `src-pwa/register-service-worker.ts`
  `updated()` shows a persistent Quasar Notify "Update available — Reload"; on accept it posts
  `SKIP_WAITING` to the waiting worker and reloads on `controllerchange`.
- **Rationale**: Meets "never auto-reload" (SC-006); stock Quasar/Workbox, no custom worker.
- **Alternatives**: `InjectManifest` custom worker (unneeded now; switch later if runtime caching of
  resource repositories needs custom logic).

## R5. Running npm in Docker from make

- **Decision**: Build image `rrquilts-build` from `Dockerfile` target `build` (Node only; no source
  baked in). Every container target runs
  `docker run --rm -u $(id -u):$(id -g) -e HOME=/tmp -v "$(CURDIR)":/app -w /app rrquilts-build …`.
  `node_modules` lives in the bind mount (host-owned because of `-u`). `make dev` publishes port
  9000 and runs `quasar dev -m pwa --hostname 0.0.0.0`; `-it` only when a TTY is present.
- **Paths with spaces**: the checkout path here contains a space (`Kits Quilts`); every `$(CURDIR)`
  use MUST be quoted.
- **Polling**: `make dev POLL=1` sets `RRQ_POLL=1`, which enables `vite.server.watch.usePolling`.
  Default off (inotify works on Linux bind mounts; polling costs CPU).
- **Alternatives**: Named volume for `node_modules` (root-owned files, hidden from IDE); baking deps
  into the image (slow rebuilds on every dependency change).

## R6. Drift check for `docs/` (CI and `make push`)

- **Decision**: CI: `make check` (rebuilds `docs/`) then `git status --porcelain -- docs` must be
  empty. `make push`: require a clean tree, run `make build`, require `docs/` still clean, then push.
- **Risk**: the check needs reproducible builds. Content-hashed asset names and Workbox revision
  hashes are deterministic; verify during implementation that no timestamps leak into output
  (e.g., build date banners). If something volatile remains, configure it away rather than
  excluding files from the check.
- **Alternatives**: Deploy via GitHub Actions instead of committing `docs/` (rejected by constitution).

## R7. Makefile `commit` / `push` structure

- **Decision**: Pre-steps as prerequisite lists:
  `COMMIT_PRE := check` and `PUSH_PRE := ensure-clean build ensure-docs-clean`;
  `commit: $(COMMIT_PRE)` then `git add -A && git commit` (`-m "$(MSG)"` when set, editor otherwise);
  `push: $(PUSH_PRE)` then `git push -u origin HEAD`. Adding a pre-step = appending to the variable.
  Run on the host (git + credentials live there).
- **Alternatives**: Git hooks (per-clone setup, easy to bypass, not visible in the Makefile).

## R8. Settings storage and `.rrq_conf`

- **Decision**: `src/settings/` module: typed defaults, guarded `localStorage` get/set (try/catch,
  JSON parse guarded), `exportConf()` → Blob download, `importConf(file)` with hand-written
  validation (format, version, known keys, value types); unknown keys preserved; migrations table
  keyed by version (empty at v1). Pinia store wraps it for reactivity.
- **Rationale**: Settings are small; a schema library is not yet justified. Re-evaluate (e.g., a
  validation library) when the `.rrq` format lands — that will justify it.
- **Alternatives**: Quasar `LocalStorage` plugin (still needs guarding; adds nothing).

## R9. Routes and guard

- **Decision**: History-mode routes `/` (Home), `/project` (Sketchbook), `/project/quilt/:id`,
  `/project/block/:id`, `/project/image/:id`, `/libraries`, `/settings`, catch-all → Not Found page
  with link home. A global guard redirects `/project/**` to `/` (with a notice) when the project
  store has no open project. Placeholders are minimal pages inside one `MainLayout`.

## R10. Theme

- **Decision**: Quasar `Dark` plugin set to `'auto'` (follows system); Settings offers
  Auto/Light/Dark persisted in settings.

## R11. CI

- **Decision**: `.github/workflows/ci.yml` on push + pull_request: checkout, `make check`, then the
  docs drift check. GitHub-hosted Ubuntu runners include Docker and make. Cache `~/.npm` via a
  mounted cache directory (`NPM_CACHE` path passed to the container).
- **Alternatives**: Running Node directly on the runner (diverges from local container builds).

## R12. Placeholder icons

- **Decision**: One original SVG mark (simple quilt-block motif) → 1024px PNG → `@quasar/icongenie`
  generates favicons, PWA icons (incl. maskable), and Apple icons into `public/`. Outputs committed.
- **Alternatives**: Hand-exporting each size (error-prone).
