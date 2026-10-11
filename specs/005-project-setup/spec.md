# Feature Specification: Project Setup & Delivery Pipeline

**Feature Branch**: `005-project-setup`

**Created**: 2026-10-11

**Status**: Draft

**Input**: User description: "Project setup: Vue + Quasar app as an offline PWA, Docker build and serve
containers, Makefile, build output to docs/ for GitHub Pages."

> Implements the constitution's Technology Stack and Build, Hosting & Tooling sections. Delivers an
> empty-but-real app shell (routes from spec 004 as placeholders) that installs and works offline.
> Requirement IDs are local to this spec. "Users" here are maintainers/contributors, plus end users
> for the install/offline/update behavior.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - From clone to running app with one command (Priority: P1)

A contributor with only Docker and make clones the repository and runs the app locally.

**Why this priority**: Every later feature is built on this loop.

**Independent Test**: On a machine without Node, `git clone` then `make dev`; the app opens at the
printed local address and reloads on file changes.

**Acceptance Scenarios**:

1. **Given** a fresh clone, **When** `make` (no target) runs, **Then** all targets are listed with
   one-line descriptions.
2. **Given** a fresh clone, **When** `make dev` runs, **Then** dependencies install in the build
   container and the dev server is reachable from the host with live reload.
3. **Given** a change, **When** `make test` and `make lint` run, **Then** unit tests and linting run in
   the container and fail the command on errors.

---

### User Story 2 - Build and preview the production site (Priority: P1)

A maintainer builds the production site into `docs/` and previews it exactly as it will be served.

**Why this priority**: GitHub Pages serves `docs/`; what's built must be what's shipped.

**Independent Test**: `make build` then `make serve`; open the local address, navigate to a deep
link, refresh — the app loads.

**Acceptance Scenarios**:

1. **Given** the source, **When** `make build` runs, **Then** `docs/` contains the full site,
   `docs/404.html` (copy of `index.html`), and `docs/.nojekyll`, with the configured base path.
2. **Given** a build, **When** `make serve` runs, **Then** nginx serves `docs/` on `localhost:8080`
   with unknown paths falling back to `index.html` and no-cache headers on `index.html`, `sw.js`,
   and `manifest.json`.
3. **Given** `make check`, **Then** lint, tests, and build run in order and stop at the first failure.
4. **Given** `make clean`, **Then** dependencies, caches, and `docs/` are removed.
5. **Given** changes, **When** `make commit MSG="…"` runs, **Then** checks run, `docs/` is rebuilt, and
   everything is committed together; a failing check means no commit.
6. **Given** a dirty tree or stale `docs/`, **When** `make push` runs, **Then** it refuses with the
   reason; otherwise it pushes the current branch.

---

### User Story 3 - Publish to GitHub Pages (Priority: P1)

A maintainer commits the rebuilt `docs/` to `main`; the live site updates.

**Why this priority**: The product's only hosting.

**Independent Test**: Push a commit with rebuilt `docs/`; `https://ragingroosevelt.github.io/RRQuilts/`
serves it; a deep link like `/RRQuilts/project` loads the app.

**Acceptance Scenarios**:

1. **Given** Pages set to `main` / `/docs`, **When** a commit with rebuilt `docs/` is pushed, **Then**
   the site updates with all assets resolving under `/RRQuilts/`.
2. **Given** a pull request, **When** CI runs, **Then** `make check` passes and CI fails if `docs/`
   is out of date with the source.

---

### User Story 4 - Install, use offline, and get updates safely (Priority: P1)

An end user installs RRQuilts, uses it without a connection, and is offered new versions without
losing work.

**Why this priority**: Constitution Principle II.

**Independent Test**: Load the live site once, install it, go offline, relaunch — the shell and every
route load. Publish a new build, go online — an "update available" prompt appears; it reloads only
when accepted.

**Acceptance Scenarios**:

1. **Given** a first visit, **Then** the app is installable (name, icons incl. maskable, theme color,
   standalone display, scope/start URL under the base path).
2. **Given** a prior visit, **When** offline, **Then** every route and asset loads.
3. **Given** a new version is published, **When** detected, **Then** the user sees "Update available —
   reload"; the app never reloads on its own.

---

### User Story 5 - Shell matches the app flow (Priority: P2)

The shell contains placeholder screens for the spec 004 routes, plus settings storage, so feature
work starts from the real structure.

**Why this priority**: Avoids reshaping routing and layout later.

**Independent Test**: Navigate Home → Project sketchbook → each editor placeholder → back; settings
can be exported as `.rrq_conf` and re-imported.

**Acceptance Scenarios**:

1. **Given** the shell, **Then** routes exist for Home, Project sketchbook, Quilt/Block/Image editors,
   Library manager, and Settings, using clean URLs; an editor URL with no project open redirects Home.
2. **Given** Settings, **Then** settings persist on-device, survive reload, export as `.rrq_conf`,
   import with validation, and fall back to defaults when storage is unavailable.
3. **Given** the shell, **Then** light/dark theme follows the system with a manual override.

---

### Edge Cases

- `docs/` edited by hand or stale → CI detects drift and fails.
- Base path changed (fork, custom domain) → one setting changes it for router, manifest, and service
  worker; build documents how.
- Pages deep link on first visit returns HTTP 404 status with the app body → acceptable (spec'd in
  constitution).
- Service worker from an old build with a changed base path → old worker is unregistered/replaced, no
  broken cache.
- Container user vs host file ownership → files written to `docs/` and `node_modules` are owned by
  the host user, not root.
- Dev server file watching inside Docker on some hosts → falls back to polling so live reload works.
- Malformed `.rrq_conf` import → rejected with a message, current settings unchanged.

## Requirements *(mandatory)*

### Functional Requirements

**Tooling**

- **FR-001**: The host MUST need only Docker, make, and git; every Makefile target except `serve`,
  `commit`, and `push` runs inside the `build` container (those three run on the host).
- **FR-002**: Makefile targets MUST be: `help` (default), `install`, `dev`, `build`, `test`, `lint`,
  `check`, `serve`, `clean`, `commit`, `push`.
- **FR-002a**: `make commit MSG="…"` MUST run `make check` (which rebuilds `docs/`), stage all changes
  including `docs/`, and commit with the message; without `MSG` it MUST open the git editor. It
  MUST stop without committing if any step fails.
- **FR-002b**: `make push` MUST refuse to push when the working tree is dirty or the committed `docs/`
  differs from a fresh build, then push the current branch to `origin`.
- **FR-002c**: `commit` and `push` MUST be structured as ordered pre-steps followed by the git action,
  so new pre-steps can be added by appending a single prerequisite.
- **FR-003**: One multi-stage `Dockerfile` MUST provide `build` (pinned Node LTS) and `serve` (pinned
  nginx) targets with exact version tags.
- **FR-004**: Dependencies MUST be locked (`package-lock.json`) and installed with `npm ci`.

**App**

- **FR-010**: The app MUST be Vue 3 + Quasar (Vite) with TypeScript strict, Pinia, Vue Router history
  mode, Vitest, ESLint + Prettier.
- **FR-011**: PWA mode MUST precache the whole app; navigation fallback to `index.html` within the base
  path; update prompt instead of auto-reload; checks for a new version when the app regains
  focus and hourly while open (not only on page load).
- **FR-012**: The shell MUST include the spec 004 routes as placeholders and the redirect for editor
  URLs without an open project.
- **FR-013**: Settings MUST persist via a guarded local storage wrapper and export/import `.rrq_conf`
  (`format`, `version`, validated on import).
- **FR-014**: No runtime network requests other than the app's own origin.

**Build & hosting**

- **FR-020**: Production build MUST output to `docs/` with `404.html` and `.nojekyll`; base path
  defaults to `/RRQuilts/` and is overridable by environment variable.
- **FR-021**: nginx config MUST implement SPA fallback and the no-cache rules; hashed assets cached
  long-term.
- **FR-022**: CI (GitHub Actions) MUST run `make check` on pushes and pull requests and fail if the
  committed `docs/` differs from a fresh build.
- **FR-023**: The README MUST cover prerequisites, make targets, GitHub Pages setup, and base-path
  override.

### Key Entities

- **Settings document**: `.rrq_conf` envelope with `format`, `version`, `app`, `settings`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Fresh clone → running dev app with one command on a machine with only Docker and make.
- **SC-002**: After one online visit, 100% of shell routes load with the network disabled.
- **SC-003**: The live site passes the browser's installability checks.
- **SC-004**: A deep link refresh works on Pages, under `make serve`, and offline.
- **SC-005**: `make check` completes in under 5 minutes on a typical laptop with a warm cache.
- **SC-006**: Zero automatic reloads: a new version is applied only after the user accepts.

## Assumptions

- Node 24 (current LTS) and the latest stable nginx-alpine at implementation time, pinned exactly.
- CI, Node 24, container ownership/polling, and README rules are in constitution v1.6.0.
- Committing build output to `docs/` is accepted (constitution); CI guards against drift rather than
  deploying.
- Placeholder screens have minimal styling; real UI arrives with feature specs.
- Icons are a simple original placeholder until branding exists.
