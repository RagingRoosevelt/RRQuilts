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
- **Personal libraries / repo cache**: IndexedDB.
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

Host needs only `make` + Docker. Run `make help` for the list.

- `make dev` — dev server (PWA mode)
- `make build` — production build → `docs/`
- `make test` / `make lint` / `make check` (lint + test + build, pre-merge gate)
- `make serve` — nginx container serving `docs/` on `localhost:8080`
- `make clean`
