# Feature Specification: Library Blocks Sorted by Shape, Then Name

**Feature Branch**: `TBD` (target 0.7.3)

**Created**: 2026-10-29

**Status**: Draft (spec only; not implemented)

**Input**: Owner, 2026-10-29: "let's add a 0.7.3 spec that library blocks (when displayed) are shown
sorted by shape then block name".

## Today (0.7.2)

- Library blocks show in sections (Group library blocks by: category, tags, technique or none; a
  library of packs has one section per pack). Inside a section they keep the library's own item
  order (`blockSections` / `blocksByLibrary` in `src/model/library.ts`), so square, triangle and
  hexagon blocks are mixed and names aren't in order.
- Used by the project Blocks tab's library sections, the Libraries page, and the quilt editor's
  tray (`PaletteTray.vue`).

## User Scenarios & Testing

### User Story 1 - Find a block by shape and name (Priority: P2)

**Independent Test**: Libraries › the built-in library, grouped by category. In a category with
square and shaped blocks, square blocks come first, A to Z, then triangles A to Z, then 60°
diamonds, then hexagons. Same on the project Blocks tab and in the quilt editor's tray.

**Acceptance Scenarios**:

1. **Given** any list of library blocks (project Blocks tab library sections, Libraries, the quilt
   editor's tray and block picker), **Then** inside each section blocks are sorted by shape, then by
   name.
2. **Given** shapes, **Then** the order is: square and rectangle blocks (no shape), triangle, 60°
   diamond, hexagon (the order of `BLOCK_SHAPES`, after the plain blocks).
3. **Given** names, **Then** A to Z, ignoring case, numbers in number order ("Block 2" before
   "Block 10"), as the app sorts names elsewhere (`localeCompare` with `numeric`).
4. **Given** two blocks with the same shape and name, **Then** they keep the library's order.
5. **Given** sections themselves, **Then** their order doesn't change (categories in the library's
   order, tags A to Z, techniques in list order, packs A to Z).
6. **Given** My blocks (the project's own blocks), **Then** nothing changes: they keep the order the
   quilter set (spec 037 drag).
7. **Given** a search, **Then** matches show in the same order.

## Requirements

- **FR-001**: Every display of library blocks MUST sort the blocks inside each section by shape
  (none, triangle, diamond60, hexagon), then name (case-insensitive, numeric), stable for ties.
- **FR-002**: Section order and the project's own block order MUST NOT change.
- **FR-003**: Display only: libraries, packs and `.rrqlib` files keep their stored item order.

## Edge Cases

- A block named with an emoji or accented letters: sorted as `localeCompare` sorts them.
- A section with one shape: plain A to Z.
- Data block variants (spec 025): sorted by the block's name, not the variant's.

## Checklist

- Add a Tests checklist check (TC-###) when implemented; a unit test on the sort.
