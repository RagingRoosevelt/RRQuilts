# Feature Specification: Ideas from the 0.5.0 test round

**Feature Branch**: `TBD` (no feature branch yet; each part can be its own)

**Created**: 2026-10-20

**Status**: Draft (spec only; not implemented)

**Input**: Owner's test results, 2026-10-20 (Tests › Checklist notes). Each part below stands alone.

## Part A - Importing a quilt that's already there (TC-034) · done on 0.6.0 (TC-056)

Today, importing quilts whose id is already in the project adds copies named "(2)".

1. **Given** Import quilts picks a quilt whose id is already in this project, **Then** a dialog shows
   both quilts side by side (this project's on the left, the file's on the right, each drawn), with a
   three-way **Keep which?** switch between them: **Project** · **Both** · **Import**, starting on
   Project. With Both, the file's side shows the name it will come in as.
2. **Given** several clashing quilts, **Then** they're all in one scrolling list, each with its own
   switch, and an **All N** switch above sets every row (round 2, TC-076).
3. **Given** Use the file's, **Then** the project's quilt is replaced in place (its position in the
   list kept), as one undo step with the rest of the import.
4. **Given** Keep both, **Then** the file's comes in as a copy (new id, name with "(2)"), as today.
5. **Given** same name but different id, **Then** it's not a clash (names may repeat); it still gets
   "(2)".

## Part B - Adding a fabric whose name is taken (TC-036 note) · done on 0.6.0 (TC-057)

Today, adding a fabric image to a palette under a name already in that palette adds a second one.

1. **Given** fabric images added to a palette (dialog or drop) and one's name matches a fabric there,
   **Then** the same list as Part A shows both pictures with **Existing** · **Both** · **New**,
   starting on Existing (the new one left out). With Both the new one comes in as "Name (2)", shown
   on its side (round 2, TC-077).
2. **Given** Use the new one, **Then** the existing fabric keeps its id (so quilts using it change
   picture) and takes the new image and size.

## Part C - Show only blocks that fit (TC-009, TC-020) · done on 0.6.0 (TC-053)

1. **Given** the quilt editor's block sidebar, **Then** the **Fits layout** filter is replaced by a
   switch **Compatible with this layout** (on by default): on, only blocks the quilt's layout can take
   show (shapes and block spaces, spec 026 `blockFits`); off, all show, and an incompatible one says
   why when tapped (as now). The Shape filter shows only while the switch is off (round 2, TC-071).
2. **Given** a Shaped Blocks quilt, **Then** the same switch filters to the shapes its spaces take.
3. The sketchbook and Libraries keep their Fits layout filter (no quilt there).

## Part D - Shapes on the wizard's Shaped Blocks card (TC-037) · done on 0.6.0 (TC-051)

1. **Given** the new-quilt wizard's Shaped Blocks card, **Then** it shows small badges for the shapes
   it offers (triangle, diamond, hexagon), so it's clear it isn't hexagons only.

## Part E - Tags and category in a block's Details (TC-024) · done on 0.6.0 (TC-054)

1. **Given** a block's Details tab (block editor), **Then** it shows the block's **Tags** (editable, as
   the Tags dialog) and **Category** (editable for the quilter's own blocks; for a library block, its
   library category, read-only).
2. **Given** a library block or a color variation (a coloring, not a copy), **Then** its technique
   checkboxes are greyed, with a tooltip saying why. The quilter's own blocks, including copies they
   made of library blocks, can change them (round 2, TC-069).

## Part F - Palette filters in the project (TC-038 note) · done on 0.6.0 (TC-055; spec 033's Color card to join when built)

1. **Given** the project's Palettes tab, **Then** it has the same filter sidebar as Libraries ›
   Palettes (search, Tags with Favorite first, Category, and spec 033's Color filter when it exists),
   applied to the project's palettes and the library palettes listed there.

## Part G - Tests pages show your own blocks (TC-040 note) · done on 0.6.0 (TC-052)

1. **Given** the Tests › Blocks page, **Then** besides every built-in block it shows **My library**
   blocks and the **open project's** own blocks (each in its own section), drawn the same way.

## Part H - Round 2 (test results 2026-10-20, build 0.5.0+a542c67)

1. Removing items with the quilter's tags asks whether to keep the tag associations: Remove pack,
   Disconnect or Remove a library, and Delete from my library on a tagged palette or block (its own
   tags then wait in My library by id). Switching a pack off doesn't ask: nothing is lost (TC-070).
2. A colorway's mapping in the Design sidebar never scrolls sideways, whatever the names (TC-072).
3. Project › Blocks › Library blocks shows "N of M selected" over the shown blocks (TC-073).
4. Techniques on the built-in blocks: tabled (owner, round 3: better heuristics first). Spec 038 on
   the backlog.
5. Libraries sidebar: space on both sides of the line between libraries; **Get updates** (was Check
   for updates), its buttons on one line (TC-079).
6. Tests › Checklist: text left by a removed check is dropped with it (a check is removed once its
   round is addressed), so Copy results never says "?, somewhere" (TC-080).

## Assumptions

- Part A and B share one "keep which" component (a list of pairs, each with a three-way switch).
- Part C's switch state is remembered per device, like other sidebar settings.
