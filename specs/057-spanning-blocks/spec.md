# Feature Specification: Blocks Spanning Several Block Spaces

**Feature Branch**: `TBD` (target 0.10.0)

**Created**: 2026-11-10

**Status**: Draft (spec only; not implemented).

**Input**: Owner, 2026-11-10: "let's also add a spec for allowing a given block to take up several
block spaces (eg like you'd want to do with a medalion block)".

Related: spec 016 (layout engine; `merges` already join triangle spaces into bigger shapes), spec
026 (shaped spaces), spec 006 (quilt editor, Set/Paint tools), spec 052 (move blocks), spec 003
(slot ids, `contracts/slot-ids.md`).

## Concepts

- **Spanning block**: one block placed over a group of neighboring block spaces (2 × 2, 3 × 3,
  2 × 1...), drawn once at the group's size, like a medallion center in a grid quilt.
- **Merged space**: the group, treated as one space while merged. Sashing and cornerstones inside it
  are dropped; sashing around it stays.

## User Scenarios & Testing

### User Story 1 - Merge spaces and place a big block (Priority: P1)

**Independent Test**: 6 × 6 straight-set quilt, select the middle 2 × 2, **Merge**, Set a medallion
block: it fills the four spaces as one block at twice the size.

1. **Given** the quilt editor, **When** the quilter selects neighboring spaces that together form a
   rectangle (or for shaped spaces a shape the layout allows, as triangle merges do), **Then**
   **Merge spaces** makes them one space.
2. **Given** a merged space, **Then** Set places a block scaled to it; blocks whose shape or aspect
   doesn't fit aren't offered (as `takesBlock` does today).
3. **Given** a merged space, **Then** **Split** restores the spaces; the block stays in the top-left
   space (or is removed, undoable).
4. Paint, rotate, colorings and scopes work on a spanning block as on any block; scope All counts it
   with other placements of the same block.

### User Story 2 - Layout changes keep merges (Priority: P1)

1. **Given** rows or columns added, removed or resized, **Then** merges still inside the layout stay;
   a merge that no longer fits is split, with a note.
2. **Given** sashing, **Then** it runs around merged spaces, not through them.

### User Story 3 - Print and count (Priority: P1)

1. **Given** spanning blocks, **Then** templates, cutting and yardage use the block at its spanned
   size (spec 010), listed apart from the same block at the normal size.

### Edge Cases

- Overlapping merges are refused; a merge can't include a border or setting triangle.
- Variable layouts (spec 018) merge only where the spaces form one clean shape.

## Requirements

- **FR-001**: Quilters MUST be able to merge neighboring block spaces into one space and split it
  again, with undo.
- **FR-002**: A merged space MUST take one block at its size, with sashing and cornerstones inside it
  removed.
- **FR-003**: Merges MUST survive layout edits where they still fit (spec 016 `reconcile`).
- **FR-004**: The project format MUST store merges (a new version and migration if the slot id
  grammar or quilt schema changes).
- **FR-005**: Printing and yardage MUST count spanning blocks at their spanned size.

## Success Criteria

- **SC-001**: A medallion quilt (a 2 × 2 center in a 6 × 6 grid) is made in under a minute.

## Out of Scope

- Blocks spanning spaces of different layouts or crossing borders; whole-quilt medallion layouts
  with rings of borders (a later layout style).
