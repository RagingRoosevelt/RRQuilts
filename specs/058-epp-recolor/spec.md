# Feature Specification: Re-color Colorways for English Paper Piecing Quilts

**Feature Branch**: `TBD` (target 0.13.0)

**Created**: 2026-11-26

**Status**: Draft (spec only; not implemented).

**Input**: Owner, 2026-11-26: "why couldn't a recolor use the same approach as the primary color in
an epp quilt?" and "let's add that as a requirement on the roadmap for 0.13.0".

Related: spec 019 FR-007 (Re-color colorways for block quilts, rrq v13 `colorway.recolor`: not
offered for EPP quilts in 0.9.3), FR-009 (colorways follow a colorway), FR-011/FR-012 (map and
badges); spec 024 (Auto map; EPP quilts' colors are `eppQuiltFills`, 0.9.3); spec 027 (EPP quilts:
pieces, rosettes, Auto-close, borders, 3D EPP); spec 050 (rosette colorings).

## Why it isn't there yet

Re-color (0.9.3) stores, per colorway, its own block and coloring for each **block space**
(`recolor.slots` + `recolor.colorings`), and the block quilt's paint tools run on that copy
(`recolorView` / `keepRecolor`). An EPP quilt has no block spaces: its colors live on its pieces
(a shape's fill, a placed rosette's chosen coloring and per-piece repaints) and Auto-close's fill.
It was left out to keep 0.9.3's Re-color to block quilts, not because it can't be done.

## Concepts

- **EPP re-color**: a colorway of an EPP quilt with its own copy of what the primary keeps on the
  pieces: each piece's fill, each placed rosette's coloring and per-piece repaints, and the
  Auto-close fill, by piece id. Pieces it doesn't list show the primary's colors.
- **Quilt as shown**: the quilt with the shown re-color's copy in place of the primary's fills; the
  one step every reader of an EPP quilt's colors goes through.

## User Scenarios & Testing

### User Story 1 - Paint an EPP quilt's colorway piece by piece (Priority: P1)

**Independent Test**: Traditional EPP demo, Grandmother's Flower Garden: New colorway from
palette…, Re-color, add it; paint a few hexagons and switch one flower to another coloring. Show
the primary: unchanged. Show the re-color again: as painted.

1. **Given** an EPP quilt, **Then** Mode (Colors tab, New colorway from palette…) offers
   **Re-color** besides Palette and Auto map, as for block quilts.
2. **Given** a re-color shown, **Then** the EPP paint tools (Paint with This / All / Same shape /
   Same fill, selections, the eyedropper) paint the re-color's copy, never the primary.
3. **Given** a placed rosette in a re-color, **Then** its coloring can be chosen apart from the
   primary's (a thing Palette and Auto map can't do), and its pieces repainted.
4. **Given** a re-color, **Then** it starts from what the colorway showed (its swaps baked in), and
   switching back to Palette or Auto map asks first, then drops the painting, as for block quilts.

### User Story 2 - Edits to the quilt carry over (Priority: P1)

1. **Given** pieces added, pasted or duplicated, **Then** they show the primary's colors in the
   re-color until painted there, as a new block space does.
2. **Given** a rosette broken into patches, **Then** the re-color's colors carry over to the new
   pieces, as the primary's do.
3. **Given** pieces deleted, **Then** the re-color's entries for them go.
4. **Given** Auto-close rebuilds its pieces on an edit, **Then** the re-color's Auto-close fill
   stays.

### User Story 3 - Everything shows the re-color (Priority: P1)

1. **Given** a re-color shown, **Then** the Design and Layout pictures, Print (templates, counts,
   yardage), thumbnails and saved images, 3D EPP (its assembly and pictures), Find and Same fill
   all read the quilt as shown.
2. **Given** an Auto map or Palette colorway that follows a re-color, **Then** the re-color's
   colors are its base, as in block quilts (spec 019 FR-009).
3. **Given** the quilt's borders (block spaces), **Then** the existing block re-color paints them,
   and the two work together as one colorway.

### Edge Cases

- A re-color of an EPP quilt whose pieces were all replaced shows the primary's colors.
- Deleting the primary makes the re-color the quilt's colors as painted (spec 019 FR-007).
- Export, import and the export and import test (`formats/export-import.spec.ts`) keep it.

## Requirements

- **FR-001**: EPP quilts MUST offer Re-color as a colorway mode, painted with the EPP paint tools on
  the colorway's own copy of the pieces' fills, placed rosettes' colorings and repaints, and the
  Auto-close fill.
- **FR-002**: Piece edits MUST carry over as in User Story 2.
- **FR-003**: Every reader of an EPP quilt's colors MUST go through the quilt as shown (User Story
  3).
- **FR-004**: The file format MUST store it in `colorway.recolor` (a new version and migration if
  rrq v13 has shipped by then).

## Notes

- Cost (estimate, 2026-11-26): somewhat more than block Re-color, mostly in following piece-id
  changes and moving every reader of EPP colors onto the quilt as shown.
