# Contract: Makefile targets

Host prerequisites: Docker, make, git. "Container" = `rrquilts-build` image, repo bind-mounted at
`/app`, running as the host user.

| Target | Where | Behavior | Exit non-zero when |
|---|---|---|---|
| `help` (default) | host | Lists targets with one-line descriptions | — |
| `install` | container | `npm ci` | lockfile/install fails |
| `dev` | container | `quasar dev -m pwa` on port 9000, host-reachable, live reload; `POLL=1` enables polling | dev server fails to start |
| `build` | container | `quasar build -m pwa` → `docs/` incl. `404.html`, `.nojekyll`; honors `RRQ_BASE` | build fails |
| `test` | container | Vitest run (no watch) | any test fails |
| `lint` | container | ESLint + Prettier check | any violation |
| `format` | container | Prettier `--write` on the repo | — |
| `check` | container | `lint` → `test` → `build`, stops at first failure | any step fails |
| `serve` | host (docker) | Builds `serve` image (nginx config + current `docs/` copied in), runs it on `localhost:8080` | image/run fails |
| `clean` | container | Removes `node_modules`, `.quasar`, caches, `docs/` | — |
| `commit` | host | Runs `$(COMMIT_PRE)` (default: `check`), `git add -A`, commits with `MSG` or opens editor | a pre-step or commit fails |
| `push` | host | Runs `$(PUSH_PRE)` (default: `ensure-clean build ensure-docs-clean`), then `git push -u origin HEAD` | dirty tree, stale `docs/`, or push fails |

Variables: `MSG` (commit message), `POLL` (dev polling), `RRQ_BASE` (base path, default
`/RRQuilts/`), `COMMIT_PRE` / `PUSH_PRE` (extensible pre-step lists).

`install` runs automatically before other container targets when `node_modules` is missing.
