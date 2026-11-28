# File format samples

One file per released version of each file format, named `<format>-v<N>.<ext>`: project (`.rrq`),
library (`.rrqlib`), block (`.rrqbl`), palette (`.rrqplt`), settings (`.rrqconf`), EPP shape or
rosette (`.rrqepp`).
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
- v9: On Point Half Rows, Diamond Point Half Rows, Data Quilt (months placed with the built-in Month
  Strip and its variants, in the sample year's colors)
- v10: Data Weeks, Two Values (a Weeks plan starting with Jan 1 as a Day Square, then each week
  twice with the Week Strip, showing High and Low: spec 046 placements and series)
- v11: no new layouts (it added data quilt Cut and Assembled marks: both data quilts have Jan 1 to
  14 entered, Jan 1 to 10 cut, Jan 1 to 7 assembled, and the Weeks quilt's first two blocks
  assembled)
- v12: EPP Quilt (three flower rosettes, one in its second coloring, loose dominoes and a hexagon,
  Auto-close, a border), 3D EPP Cube, Rosette Blocks (Tumbling Block rosettes in hexagon spaces),
  plus a project shape (Domino) and rosette (Sample Flower): `__tests__/formats/epp-v12.ts`, which
  the project sample uses too
- v13: Colorways (the first quilt's layout with a Palette colorway, one following it, an Auto map
  one and a Re-color, shown), EPP Cut by Hand (the EPP Quilt cut by hand to a square, shown in an
  Auto map colorway), and the Sample Flower's colorings following another (Palette, Auto map):
  `__tests__/formats/v13.ts`, which the project, library and EPP samples use too
- v14: Spanning Blocks (6 × 6 Straight Set with sashing, a 2U and a 3U), Spanning Triangles (a 2U
  triangle), Spanning at the Edge (On-Point, a 2U from a setting triangle), Spanning Data (the
  first data quilt's copy with a 2U data block): `__tests__/formats/v14.ts`, which the project
  sample uses too

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
- project v9, library v6, block v4: written by release v0.7.0's code.
- project v10, library v7, block v5: written by release v0.7.2's code.
- project v11: written by release v0.8.0's code.
- project v12, library v8, EPP v1: written by release v0.9.0's code.
- project v13, library v9, EPP v2: written by release v0.9.3's code.
- project v14: written by release v0.10.0's code.
- demo v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14: written by releases v0.1.0, v0.3.0,
  v0.4.0, v0.5.0, v0.6.0, v0.7.0, v0.7.2, v0.8.0, v0.9.0, v0.9.3 and v0.10.0. Pictures: v4 by
  v0.2.0 (v0.1.0 had no Save image; both write v4), v5 by v0.3.0, v6 by v0.4.0, v7 by v0.5.0, v8 by
  v0.6.0, v9 by v0.7.0, v10 by v0.7.2, v11 by v0.8.0, v12 by v0.9.0, v13 by v0.9.3, v14 by
  v0.10.0.
