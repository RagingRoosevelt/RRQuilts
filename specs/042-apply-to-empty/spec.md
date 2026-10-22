# Feature Specification: Apply to Empty

**Feature Branch**: `TBD` (target 0.8.0)

**Created**: 2026-10-22

**Status**: Draft (spec only; not implemented)

**Input**: Owner, 2026-10-22: "let's add a spec that will add a new option next to "apply to":
"this|all|alternate" which is "empty"".

## Today

The quilt editor's Design tab has **Apply to** with **This**, **All** and **Alternate**
(`src/editor/scope.ts`, `Scope = 'this' | 'all' | 'alternate'`):

- **Set**: This sets the tapped space. All sets every space of the tapped kind that takes the block,
  Alternate those in the tapped space's alternate class. Both replace blocks already there.
- **Paint / Spray / Swap**: change pieces in the tapped space, or in every placement of the same
  block (All), or the alternate ones.
- **Rotate / Flip / Erase**: the tapped placement, or every placement of the same block.

To fill only the gaps (a quilt partly designed, then "everything else gets this block"), the
quilter has to set each empty space by hand.

## Concepts

- **Empty**: a fourth Apply to choice. It narrows to spaces that hold nothing yet: no block and no
  paint. A space painted as a patch (the plain block) counts as filled.

## User Scenarios & Testing

### User Story 1 - Fill the empty spaces with a block (Priority: P1)

1. **Given** a quilt with some blocks set, **When** Apply to is **Empty** and Set is tapped on any
   space of a kind, **Then** the block goes in every empty space of that kind that takes it (block
   spaces, setting pieces, square cornerstones, as Set allows today). Spaces already holding a block
   or paint are left as they are, the tapped one too if it's filled.
2. **Given** a shaped layout, **Then** only empty spaces of the block's shape take it.
3. **Given** a data quilt's Other blocks, **Then** Empty skips numbered spaces (they hold a data
   block or wait for one).
4. One tap is one undo step.

### User Story 2 - Color the empty pieces (Priority: P2)

1. **Given** Paint or Spray with Empty, **When** a sash, cornerstone, border or empty block space is
   tapped, **Then** every unpainted piece of that kind takes the color (the hatch goes), painted ones
   keep theirs.
2. **Given** Paint with Empty on a placed block's patch, **Then** that block's unpainted patches,
   in every placement of the block, take the color; painted patches keep theirs.

### User Story 3 - Where Empty makes no sense (Priority: P2)

1. **Given** Rotate, Flip, Erase, Swap, Eyedropper or Find, **Then** Empty is shown disabled with a
   tooltip ("Empty spaces have nothing to turn"), and a tool switch while Empty is picked falls
   back to This for those tools only (Empty comes back with Set or Paint).

### Edge Cases

- No empty space of the tapped kind: a short message says so; nothing changes.
- Borders: each border is its own kind (as All treats them today).
- Strip layouts: empty block spaces along block strips count; pieced strip patterns are patches.
- The choice is remembered per session like the others; Settings doesn't need it.

## Requirements

- **FR-001**: `Scope` gains `'empty'`; the Apply to control shows This, All, Alternate, Empty.
- **FR-002**: `setTargets` with Empty returns the spaces of the tapped kind that take the block and
  hold nothing; `sprayTargets`/paint with Empty the unpainted pieces of the tapped kind (and of the
  tapped block's placements, US2.2).
- **FR-003**: Tools with no use for Empty disable it (US3).
- **FR-004**: Help (Designing a quilt, the tools table) and the editor's hint line describe Empty.
- **FR-005**: No file format change.

## Success Criteria

- **SC-001**: Filling every remaining space of a half-designed quilt with one block takes one tap.
- **SC-002**: Nothing already placed or painted changes when Empty is used.

## Assumptions

- "Empty" means nothing placed and nothing painted; a painted-as-patch space is not empty.
- Alternate with Empty (empty and alternate) isn't needed; Empty is its own choice.
