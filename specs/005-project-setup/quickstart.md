# Quickstart & Validation: Project Setup

Prerequisites: Docker, make, git. No Node on the host.

## 1. Dev loop (US1)

```bash
git clone https://github.com/RagingRoosevelt/RRQuilts.git && cd RRQuilts
make            # lists targets
make dev        # open the printed URL (port 9000); edit a page → browser reloads
make test lint  # both pass
```

## 2. Production build & preview (US2)

```bash
make build
ls docs/404.html docs/.nojekyll docs/sw.js docs/manifest.json   # all exist
make serve      # http://localhost:8080/RRQuilts/
```

- Open `http://localhost:8080/RRQuilts/settings`, refresh → Settings loads (SPA fallback).
- `curl -sI http://localhost:8080/RRQuilts/sw.js | grep -i cache-control` → `no-cache`.
- `make check` runs lint → test → build and stops at the first failure.

## 3. Offline & update (US4)

1. With `make serve` running, open the site, then DevTools → Application: manifest valid,
   installable, service worker activated.
2. DevTools → Network → Offline; reload `/`, `/settings`, `/libraries` → all load.
3. Change any visible text, `make build`, restart `make serve`, go online, reload the open tab →
   "Update available — Reload" notice appears; the page does not reload until clicked.

## 4. Shell behavior (US5)

- Visit `/project/quilt/x` with no project open → redirected to `/` with "Open a project first".
- Settings: switch theme → persists across reload; Export → `.rrq_conf` downloads; Import that file
  → succeeds; import a file with `"format": "nope"` → rejected, settings unchanged.
- DevTools: block storage (or private window) → app still loads with defaults.

## 5. Commit & push (US2/US3)

```bash
make commit MSG="test commit"   # runs check, commits everything incl. docs/
touch scratch && make push      # refuses: dirty tree
```

## 6. Pages & CI (US3)

- Repo Settings → Pages → Deploy from branch → `main` / `/docs`.
- Push → `https://ragingroosevelt.github.io/RRQuilts/` serves the app; deep link refresh works.
- Open a PR with stale `docs/` → CI fails on the drift check.
