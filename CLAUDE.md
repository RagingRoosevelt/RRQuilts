# RRQuilts

Web-based quilt design tool. Static, offline-capable PWA — no backend. Free, no sign-up, MIT
licensed (`LICENSE`).

Repo: https://github.com/RagingRoosevelt/RRQuilts · Live: https://ragingroosevelt.github.io/RRQuilts/

Business requirements / UX: not yet specified (see `specs/` once `/speckit-specify` runs).
`reference/` (git-ignored) holds the reference quilt software's manuals as domain reference —
read for quilting terminology and feature ideas, not as a spec to clone. In committed files call it
"the reference quilt software", never by name; don't use its coined feature names (generic terms
like sketchbook/worktable are fine).

## Stack

- Vue 3 + Quasar (app-vite), TypeScript strict, Pinia
- Quasar PWA mode (Workbox) — app must work fully offline after first load
- Vitest for unit tests
- Docker: multi-stage `Dockerfile` — `build` target (Node, builds/tests) and `serve`
  target (nginx, hosts the built site)
- Hosting: GitHub Pages from `main` → `/docs`. Build output goes to `docs/` (committed;
  never hand-edit, never put documentation there). Base path configurable, default
  `/RRQuilts/`; `docs/.nojekyll` emitted.

## Data

- **Projects**: `.rrq` files — JSON, saved/opened on the user's filesystem.
  File System Access API where supported; download + `<input type="file">` fallback.
- **Settings**: `localStorage`; export/import as `.rrq_conf` (JSON).
- **Project drafts / personal libraries / repo cache**: IndexedDB (drafts = crash recovery, not a save).
- **Resource repositories**: git repos of extra library content, fetched on user request (the only
  network use). Cached for offline. Untrusted: validate, never execute. Projects embed used items.
- **Library files**: `.rrq_lib` (JSON) — one format for personal-library backup and shareable
  resource packs, told apart by required `kind: "personal" | "pack"` (packs carry author + license).
  UI keeps own work separate from packs/repos; pack items are read-only, copy to own library to edit.
  Same content structure as a resource repository.
- Only our own formats (`.rrq*`); other quilt software formats are deliberately unsupported.
- All formats carry `{ "format": ..., "version": N }`. Bump `version` + add a migration
  for any schema change. Treat loaded files as untrusted: validate, never crash.

## Rules

- No server calls, no runtime CDN/font fetches — everything bundled and precached.
- History-mode routing (clean URLs). Deep links rely on SPA fallbacks: `docs/404.html`
  copy of `index.html` (Pages), `try_files` (nginx), Workbox `navigateFallback` (SW).
- Warn before discarding unsaved work; SW update prompts, never auto-reloads.
- Wrap `localStorage` access in try/catch; fall back to defaults.
- Prefer Quasar components and platform APIs over new dependencies.

## Spec Kit

Project principles: `.specify/memory/constitution.md` (authoritative).
Flow: `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`.

## Commands

Host needs only Docker, make, git (no Node). Run `make` for the list.

- `make dev` — dev server at `localhost:9000/RRQuilts/` (`POLL=1` if edits aren't picked up)
- `make test` / `make lint` (ESLint + vue-tsc + Prettier check) / `make format`
- `make build` — production build → `docs/` (reproducible; CI fails if committed `docs/` is stale)
- `make check` — lint → test → build
- `make serve` — nginx at `localhost:8080/RRQuilts/` serving `docs/`
- `make commit MSG="…"` — check + rebuild `docs/` + commit all; `make push` — refuses if dirty/stale
- Ad-hoc commands in the container: copy the `RUN` macro in the Makefile (quote the repo path — it
  contains a space).

## Code layout

- `quasar.config.ts` — base path (`RRQ_BASE`), `docs/` output, 404/.nojekyll hook, PWA options
- `src/router/routes.ts` — routes + open-project guard; `src/pages/` screens
- `src/settings/` — settings persistence + `.rrq_conf`; `src/stores/` Pinia stores
- `src-pwa/` — manifest, update prompt (`register-sw.ts`); has its own `package.json`
- `test/vitest/__tests__/` — unit tests
- `docker/default.conf.template` — nginx (base path substituted at start)
- `assets/icon.svg` — placeholder icon source; regenerate with `@quasar/icongenie` (skip apple
  launch images — they bloat the offline cache)

## Gotchas

- Dev-server file watching must not see big folders: npm cache lives in `~/.cache/rrquilts-npm`
  (outside the repo); Vite ignores `docs/`, `specs/`, `reference/`.
- Workbox `skipWaiting` is forced off — updates apply only via the in-app prompt.
