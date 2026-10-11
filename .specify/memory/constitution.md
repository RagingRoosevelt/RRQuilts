<!--
Sync Impact Report
- Version change: 1.3.0 → 1.4.0 (MINOR: .rrq_lib widened to also serve as resource pack — Principle III;
  free/no-sign-up/MIT licensing — Principle I)
- Prior: 1.2.2 → 1.3.0 (MINOR: on-device library storage (IndexedDB) + .rrq_lib format;
  user-initiated resource-repository fetches allowed as the sole network exception —
  Principles II, III, IV, Technology Stack)
- Prior: 1.2.1 → 1.2.2 (PATCH: concrete repo URL + Pages base path)
- Prior: 1.2.0 → 1.2.1 (PATCH: project renamed Kits Quilts → RRQuilts)
- Prior: 1.1.0 → 1.2.0 (MINOR: routing changed from hash mode to history mode
  with SPA fallbacks — Principle I, Build, Hosting & Tooling)
- Prior: 1.0.0 → 1.1.0 (MINOR: added Build, Hosting & Tooling section)
- Prior: template → 1.0.0 (initial ratification)
- Principles added: I. Static & Serverless, II. Offline-First PWA, III. Open File Formats,
  IV. User Owns Their Data, V. Simplicity
- Sections added: Technology Stack & Constraints, File Formats, Development Workflow;
  1.1.0: Build, Hosting & Tooling (Docker build/host, GitHub Pages docs/ output, Makefile)
- Templates: ✅ plan-template.md (Constitution Check derives gates from this file; no edit needed)
  ✅ spec-template.md (no change) ✅ tasks-template.md (no change)
- Deferred TODOs: business requirements / UX to be captured via /speckit-specify
-->

# RRQuilts Constitution

## Core Principles

### I. Static & Serverless

The app MUST ship as static files (HTML/JS/CSS/assets) deployable to any static host.
There is no backend, no account system, no API calls required for core function.

- No server-side code, database, or authentication.
- Free to use, no sign-up, no accounts, no paywalled features. Source is MIT-licensed
  (`LICENSE`); built-in library content ships under the same license.
- Routing uses clean URLs (Vue Router history mode, no `#/`). Deep links MUST still work on
  every supported host via SPA fallback to `index.html` (see Build, Hosting & Tooling).
- Third-party network calls (analytics, CDNs, fonts) MUST NOT be required at runtime;
  all assets are bundled.

Rationale: zero hosting cost, zero ops, nothing to break or breach.

### II. Offline-First PWA

The app MUST be an installable Progressive Web App that works fully offline after first load.

- Service worker precaches the entire app shell and all bundled assets (Quasar PWA mode /
  Workbox).
- Every feature MUST work with the network disconnected. A feature that needs the network
  is out of scope unless the constitution is amended.
- Sole exception: user-initiated connect/refresh of resource repositories (git repositories of
  extra library content). Fetched content is stored on-device and MUST remain usable offline;
  no core capability may depend on a repository being reachable.
- Web app manifest with name, icons (incl. maskable), theme color, `display: standalone`.
- App updates: new service worker is detected and the user is prompted to reload; the app
  MUST NOT silently reload over unsaved work.

Rationale: quilters work in sewing rooms, at retreats, and at shows with poor connectivity.

### III. Open File Formats

Projects and settings are plain JSON with documented, versioned schemas.

- Project file: `.rrq` — UTF-8 JSON, one project per file.
- Settings file: `.rrq_conf` — UTF-8 JSON export/import of app settings.
- Library file: `.rrq_lib` — UTF-8 JSON bundle of library resources. One format for both
  personal-library backup and shareable resource packs, distinguished by a required top-level
  `kind` (`personal` | `pack`; packs carry author and license); same content
  structure a resource repository provides, imported from disk (works offline).
- These are the app's only file formats; third-party quilt-software formats are not supported.
- Every file MUST carry a top-level `format` identifier and integer `version`.
- Loading MUST validate input (it is untrusted user data) and reject or repair malformed
  files with a clear message — never crash, never partially corrupt state.
- Older versions MUST load via forward migrations; the app MUST NOT write a file version
  older than it read. Schema changes bump `version` and add a migration.

Rationale: users' designs outlive any one app version; JSON is diffable and recoverable.

### IV. User Owns Their Data

All data stays on the user's device unless the user explicitly exports it.

- Projects are saved/opened as `.rrq` files on the user's filesystem. Use the File System
  Access API where available; fall back to download (`<a download>`) + `<input type="file">`
  elsewhere (Firefox, Safari, iOS).
- Settings persist in `localStorage` and can be exported to / imported from `.rrq_conf`.
- Personal libraries and downloaded repository content persist in IndexedDB (too large for
  `localStorage`); personal libraries export to / import from `.rrq_lib`. The app SHOULD request
  persistent storage and MUST warn when storage is full or was cleared.
- Browser storage access MUST be wrapped (it can throw or be empty); the app runs on defaults
  when it is unavailable.
- Projects MUST embed every library/repository item they use, so a `.rrq` file is
  self-contained.
- Repository and `.rrq_lib` content is untrusted: validate every item, never execute it, enforce size limits.
- Unsaved-work protection: warn before closing/navigating away with unsaved changes.

Rationale: no lock-in, no privacy exposure, nothing lost to a cleared cache that the user
didn't choose to lose.

### V. Simplicity

Prefer platform features and Quasar built-ins over new dependencies and custom
abstractions.

- New runtime dependencies require justification in the plan's Complexity Tracking table.
- No abstraction without at least two real uses.
- YAGNI: build what the current spec requires, nothing speculative.

Rationale: small bundle = fast offline cache, small surface = fewer bugs.

## Technology Stack & Constraints

| Concern | Choice |
|---|---|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| UI / build | Quasar Framework (Vite-based `@quasar/app-vite`) |
| Language | TypeScript (strict) |
| State | Pinia (Quasar default) |
| PWA | Quasar PWA mode (`quasar mode add pwa`), Workbox `GenerateSW` |
| Settings persistence | `localStorage` (via Quasar `LocalStorage` or thin wrapper) |
| Library persistence | IndexedDB (personal libraries, cached repository content) |
| Project persistence | `.rrq` files via File System Access API + download/upload fallback |
| Unit tests | Vitest (Quasar testing extension) |
| Lint/format | ESLint + Prettier (Quasar scaffold defaults) |
| Package manager | npm |

- Target browsers: current evergreen Chrome/Edge, Firefox, Safari (desktop + iPad).
- Build output (`docs/`) is the deployable artifact (see Build, Hosting & Tooling).
- Bundle MUST be precacheable; keep total precache reasonable (budget set in plan).

## Build, Hosting & Tooling

**Output folder**: `quasar build -m pwa` MUST emit to `docs/` at repo root
(`build.distDir: 'docs'` in `quasar.config`), the default folder GitHub Pages serves from
("Deploy from a branch" → `main` / `/docs`). `docs/` is committed build output — never
hand-edited, never used for documentation.

**GitHub Pages**:
- Repo: https://github.com/RagingRoosevelt/RRQuilts — site served at
  `https://ragingroosevelt.github.io/RRQuilts/`. Base path (`publicPath`) MUST be
  configurable (env var), defaulting to `/RRQuilts/`; manifest
  `start_url`/`scope` and service-worker scope MUST respect it.
- Emit `docs/.nojekyll` so Pages serves files untouched.
- Pages has no rewrite rules: the build MUST copy `index.html` to `docs/404.html` so deep
  links and refreshes load the app (Pages returns HTTP 404 status with the app body —
  acceptable, the app is not SEO-indexed content).
- Router base MUST equal the configured base path (`createWebHistory(base)`).
- Service worker MUST use Workbox `navigateFallback` → `index.html` (scoped to the base
  path), so deep links work offline and, once installed, never hit the Pages 404.

**Docker**: one multi-stage `Dockerfile`, two targets:
- `build` — pinned Node LTS image; runs `npm ci` + lint/test/build. Used to produce
  `docs/` with nothing but Docker installed on the host (bind-mount repo, output lands in
  `./docs`).
- `serve` — pinned `nginx:alpine` image serving the built `docs/` content; long-running
  host for self-hosting or local preview of the production build.
- nginx MUST fall back to `index.html` for unknown paths (`try_files $uri $uri/ /index.html`).
- nginx MUST send `Cache-Control: no-cache` for `index.html`, `sw.js`, and
  `manifest.json` so PWA updates are picked up; hashed assets cache long-term.
- Base image versions pinned (exact tags), no `latest`.

**Makefile** (host needs only `make` + Docker; targets run in the `build` container
unless noted):

| Target | Does |
|---|---|
| `make install` | `npm ci` |
| `make dev` | Quasar dev server (PWA mode), port published to host |
| `make build` | Production build → `docs/` |
| `make test` | Vitest run |
| `make lint` | ESLint (+ Prettier check) |
| `make check` | `lint` + `test` + `build` (pre-merge gate) |
| `make serve` | Build `serve` image, run nginx on `localhost:8080` serving `docs/` |
| `make clean` | Remove `node_modules`, Quasar caches, `docs/` |
| `make help` | List targets (default target) |

`localhost` counts as a secure context, so the service worker works under `make serve`.

## File Formats

Minimum envelope (details defined per feature in `specs/`):

```json
// .rrq
{ "format": "rrq", "version": 1, "app": "<app version>", "project": { } }

// .rrq_conf
{ "format": "rrq_conf", "version": 1, "app": "<app version>", "settings": { } }
```

- Schema + migrations live in one module per format; covered by unit tests
  (round-trip, each migration step, malformed input).
- Unknown keys are preserved on round-trip where practical.

## Development Workflow

- Spec Kit flow: `/speckit-specify` → `/speckit-clarify` (optional) → `/speckit-plan`
  → `/speckit-tasks` → `/speckit-implement`.
- Every plan MUST pass the Constitution Check against Principles I–V.
- Required tests: file-format parse/validate/migrate; settings load/save/import/export;
  core geometry/calculation logic. UI tests only where logic lives in components.
- Before merge: `make check` passes and `docs/` is rebuilt and committed; offline smoke
  test via `make serve` (load once, go offline, reload, open/save a project).

## Governance

This constitution supersedes other practices. Amendments are made via
`/speckit-constitution`, with a Sync Impact Report and semantic version bump
(MAJOR: principle removed/redefined; MINOR: principle/section added; PATCH: wording).
Runtime development guidance lives in `CLAUDE.md`.

**Version**: 1.4.0 | **Ratified**: 2026-10-10 | **Last Amended**: 2026-10-10
