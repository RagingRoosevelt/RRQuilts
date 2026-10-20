# File format samples

One file per released version of each file format, named `<format>-v<N>.<ext>`: project (`.rrq`),
library (`.rrqlib`), block (`.rrqbl`), palette (`.rrqplt`), settings (`.rrqconf`).
`__tests__/formats/samples.spec.ts` opens every one with today's code, so a schema change that
forgets a migration fails. Open them in the app to test by hand. Never rewrite an existing sample:
each one is what that release wrote.

## Demo project

`demo-v<N>.rrq` is one project that grows with each project version: the previous demo, opened by
that release's code, plus a quilt for each layout capability the version added (`ADDED` in
`__tests__/formats/write-demo.spec.ts`), with blocks set and the other spaces painted:

- v4: Nine Blocks (3×3 Straight Set, a different block in each space, sashing, border)
- v5: On Point, Strips
- v6: Variable Point, One Patch, Baby Blocks, Variable Blocks, Pieced Border
- v7: Shaped Blocks, Hexagons on a Flow, Diamond Point, Baby Blocks of Blocks
- v8: no new layouts (it added palette tags)

`demo-v<N>/` holds a PNG of each of its quilts and blocks, saved with the app's Save image by a
release that writes that version.

## Picture check

The dev server's **Tests › Picture check** (`make dev`, `/dev/pictures`; not in the built site)
opens every demo, draws its quilts and blocks as Save image does, and shows each beside its release
picture with the difference and a reference label (`v6.07`, numbered by name so it stays put between
runs), changed pictures first. Claude points the owner to it before each release and after changes
to file formats, migrations, layouts or quilt and block drawing; the owner names any wrong ones by
reference.

## Each release that ships a new format version

In the release's code (container: the Makefile RUN macro), then keep only the new versions:

```sh
FORMAT_SAMPLES=test/fixtures/formats npx vitest run test/vitest/__tests__/formats/write-samples.spec.ts
FORMAT_DEMO=test/fixtures/formats npx vitest run test/vitest/__tests__/formats/write-demo.spec.ts
```

For a new project version, add its new layouts to `ADDED` first, then the pictures, from the
release's build (host, needs `uv`; first run `uv run --with playwright playwright install firefox`):

```sh
make build
uv run scripts/format-images.py docs test/fixtures/formats/demo-vN.rrq
```

## Sources

- project v1 to v5: the `everything.rrq` fixture as committed at each version (migration tests).
- project v6, library v3, block v1, palette v1, settings v1: written by release v0.4.0's code.
- project v7, library v4, block v2: written by release v0.5.0's code.
- project v8, library v5, block v3: written by release v0.6.0's code.
- demo v4, v5, v6, v7, v8: written by releases v0.1.0, v0.3.0, v0.4.0, v0.5.0 and v0.6.0. Pictures:
  v4 by v0.2.0 (v0.1.0 had no Save image; both write v4), v5 by v0.3.0, v6 by v0.4.0, v7 by v0.5.0,
  v8 by v0.6.0.
