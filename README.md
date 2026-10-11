# RRQuilts

Free, offline-capable quilt design in the browser. No sign-up, no accounts — your projects are
files on your device (`.rrq`). Installable as an app (PWA) and works without a connection after the
first visit.

Live: <https://ragingroosevelt.github.io/RRQuilts/>

> Early development: the app shell is in place; design features are specified in [`specs/`](specs/)
> and arrive feature by feature.

## Prerequisites

Docker, make, and git. Node is **not** needed on your machine — every build step runs in a pinned
Node 24 container as your user.

## Commands

| Command               | What it does                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| `make`                | List commands                                                                                                |
| `make dev`            | Dev server at <http://localhost:9000/RRQuilts/> with live reload (`POLL=1` if file changes aren't picked up) |
| `make test`           | Unit tests                                                                                                   |
| `make lint`           | ESLint, type check, Prettier check                                                                           |
| `make format`         | Auto-format with Prettier                                                                                    |
| `make build`          | Production build into `docs/`                                                                                |
| `make check`          | lint → test → build                                                                                          |
| `make serve`          | Serve `docs/` with nginx at <http://localhost:8080/RRQuilts/>                                                |
| `make clean`          | Remove dependencies, caches, and `docs/`                                                                     |
| `make commit MSG="…"` | Run `check` (rebuilds `docs/`), then commit everything including `docs/`                                     |
| `make push`           | Refuse if the tree is dirty or `docs/` is stale, then push the current branch                                |

Always commit and push through `make commit` / `make push` so the pre-steps run.

## Hosting

`docs/` is the built site and is committed (never edit it by hand). GitHub Pages serves it:
repository **Settings → Pages → Deploy from a branch → `main` / `/docs`**. CI fails if `docs/`
doesn't match a fresh build.

The site expects to live under `/RRQuilts/`. To host elsewhere (fork, custom domain, root of a
server), set the base path for both build and serve:

```bash
make build RRQ_BASE=/
make serve RRQ_BASE=/
```

Self-hosting: `docker build --target serve -t rrquilts .` then run it with `-e RRQ_BASE=…` matching
the build.

## Project docs

- [`.specify/memory/constitution.md`](.specify/memory/constitution.md) — principles and technical rules
- [`specs/`](specs/) — feature specifications (Spec Kit)
- [`CLAUDE.md`](CLAUDE.md) — guidance for AI-assisted development

## License

[MIT](LICENSE)
