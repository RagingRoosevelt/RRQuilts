# File format samples

One file per released version of each file format, named `<format>-v<N>.<ext>`:
project (`.rrq`), library (`.rrqlib`), block (`.rrqbl`), palette (`.rrqplt`), settings
(`.rrqconf`). `__tests__/formats/samples.spec.ts` opens every one with today's code, so a schema
change that forgets a migration fails. Open them in the app to test by hand.

**Every release that ships a new format version adds its samples** (constitution, Development
Workflow; `scripts/release.md`). Generate them with the release's code:

```sh
# in the container (Makefile RUN macro)
FORMAT_SAMPLES=test/fixtures/formats npx vitest run test/vitest/__tests__/formats/write-samples.spec.ts
```

That writes every format at its current version; keep only the new versions (never rewrite an
existing sample: each one is what that release wrote).

A new project version also gets pictures: `project-vN/` holds a PNG of each quilt and block, saved
with the app's Save image by that release's build. Compare them with what today's app draws.

```sh
make build   # the release's build in docs/
uv run scripts/format-images.py docs test/fixtures/formats/project-vN.rrq
```

`project-v6/` was drawn by release v0.4.0. Older project versions have no pictures.

Sources: project v1 to v5 are the `everything.rrq` fixture as committed at each version; project v6,
library v3, block v1, palette v1 and settings v1 were written by release v0.4.0's code.
