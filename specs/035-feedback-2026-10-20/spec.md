# Feature Specification: Ideas from the 0.5.0 test round

**Feature Branch**: `TBD` (no feature branch yet; each part can be its own)

**Created**: 2026-10-20

**Status**: Draft (spec only; not implemented)

**Input**: Owner's test results, 2026-10-20 (Tests › Checklist notes). Each part below stands alone.

## Part A - Importing a quilt that's already there (TC-034)

Today, importing quilts whose id is already in the project adds copies named "(2)".

1. **Given** Import quilts picks a quilt whose id is already in this project, **Then** a dialog shows
   both quilts side by side (this project's on the left, the file's on the right, each drawn), with a
   three-way switch between them: **Keep this one** · **Keep both** · **Use the file's**.
2. **Given** several clashing quilts, **Then** the dialog steps through them (with "Do the same for
   the rest").
3. **Given** Use the file's, **Then** the project's quilt is replaced in place (its position in the
   list kept), as one undo step with the rest of the import.
4. **Given** Keep both, **Then** the file's comes in as a copy (new id, name with "(2)"), as today.
5. **Given** same name but different id, **Then** it's not a clash (names may repeat); it still gets
   "(2)".

## Part B - Adding a fabric whose name is taken (TC-036 note)

Today, adding a fabric image to a palette under a name already in that palette adds a second one.

1. **Given** fabric images added to a palette (dialog or drop) and one's name matches a fabric there,
   **Then** the import dialog shows both pictures with **Keep the original** · **Keep both** · **Use
   the new one** (the same three-way switch as Part A), per clash, with "Do the same for the rest".
2. **Given** Use the new one, **Then** the existing fabric keeps its id (so quilts using it change
   picture) and takes the new image and size.

## Part C - Show only blocks that fit (TC-009, TC-020)

1. **Given** the quilt editor's block sidebar, **Then** the **Fits layout** filter is replaced by a
   switch **Compatible with this layout** (on by default): on, only blocks the quilt's layout can take
   show (shapes and block spaces, spec 026 `blockFits`); off, all show, and an incompatible one says
   why when tapped (as now).
2. **Given** a Shaped Blocks quilt, **Then** the same switch filters to the shapes its spaces take.
3. The sketchbook and Libraries keep their Fits layout filter (no quilt there).

## Part D - Shapes on the wizard's Shaped Blocks card (TC-037) · done on 0.6.0 (TC-051)

1. **Given** the new-quilt wizard's Shaped Blocks card, **Then** it shows small badges for the shapes
   it offers (triangle, diamond, hexagon), so it's clear it isn't hexagons only.

## Part E - Tags and category in a block's Details (TC-024)

1. **Given** a block's Details tab (block editor), **Then** it shows the block's **Tags** (editable, as
   the Tags dialog) and **Category** (editable for the quilter's own blocks; for a library block, its
   library category, read-only).
2. **Given** a library block or a color variation of one (a coloring, not a copy), **Then** its
   technique shows as a read-only list, not checkboxes (only the block's designer sets technique).

## Part F - Palette filters in the project (TC-038 note)

1. **Given** the project's Palettes tab, **Then** it has the same filter sidebar as Libraries ›
   Palettes (search, Tags with Favorite first, Category, and spec 033's Color filter when it exists),
   applied to the project's palettes and the library palettes listed there.

## Part G - Tests pages show your own blocks (TC-040 note) · done on 0.6.0 (TC-052)

1. **Given** the Tests › Blocks page, **Then** besides every built-in block it shows **My library**
   blocks and the **open project's** own blocks (each in its own section), drawn the same way.

## Assumptions

- Part A and B share one "keep which" component (two previews and a three-way switch).
- Part C's switch state is remembered per device, like other sidebar settings.
