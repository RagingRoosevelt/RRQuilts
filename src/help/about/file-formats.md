---
title: File formats
order: 30
summary: The files RRQuilts reads and writes, and their published schemas.
---

Every RRQuilts file is plain JSON (text) or a zip holding JSON and images. Each starts with a
`format` name and a `version` number. A newer RRQuilts opens files made by an older one, and
upgrades them when you save.

## The files

| File       | Holds                                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.rrq`     | One project: its quilts, blocks, palettes, fabrics and settings. Your own fabric images are inside. Library fabric images are referenced, unless you include them when saving. |
| `.rrqbl`   | One block, with the colors its colorings use.                                                                                                                                  |
| `.rrqplt`  | One palette: its colors and fabric images.                                                                                                                                     |
| `.rrqlib`  | A library: a backup of My library and installed packs, or a pack to share. It's a zip when it holds fabric images.                                                             |
| `.rrqconf` | Your settings, exported from **Settings**.                                                                                                                                     |

## For developers

Anyone writing tools that read or make these files can use the published JSON Schemas:

- [Project file (`.rrq`), version 6](../../schemas/rrq.v6.json)
- [Bundled libraries list](../../schemas/bundled_libraries.v1.json)
- [Current version of each format](../../schemas/formats.json)

A library on the web is a git repository with a `library.json` index at its top and a folder for
each pack. A library's index and files can name its web pages in `links`: a `homepage`, a
`gallery`, and `others`, each with a `name` and `url`.
