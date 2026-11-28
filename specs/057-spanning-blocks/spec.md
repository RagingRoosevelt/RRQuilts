# Feature Specification: Blocks Spanning Several Block Spaces

**Feature Branch**: `057-spanning-blocks` (target 0.10.0)

**Created**: 2026-11-10

**Status**: In progress: User Stories 1 to 3 built (prototype D's way for 1 and 2, 2026-11-27;
printing checked and data quilts added 2026-11-28).

**Input**: Owner, 2026-11-10: "let's also add a spec for allowing a given block to take up several
block spaces (eg like you'd want to do with a medalion block)".

Related: spec 016 (layout engine; `merges` already join triangle spaces into bigger shapes), spec
026 (shaped spaces), spec 006 (quilt editor, Set/Paint tools), spec 052 (move blocks), spec 003
(slot ids, `contracts/slot-ids.md`).

## Clarifications

### Session 2026-11-26 (owner, before the prototypes)

- Q: Which spans are allowed? → A: "any shape that is several tiled units that have the same
  perimeter as a scaled-up single block": the space's own shape scaled up a whole number of times
  (kU): squares (2 × 2, 3 × 3 …), 2:1 rectangles, triangles of 4, 9 … triangles, diamonds of 2 × 2 …
  diamonds. Hexagons can't join into a bigger hexagon, so they stay 1U.
- Q: Which layouts? → A: every block layout.
- Q: How does a quilter make one? → A: prototype and compare three: select then Merge, drag with
  Set, and "a slider for block unit size that scales between 1U, 2U, 3U, etc and sets the number of
  block slots it covers, then when you drag a block over the quilt, the highlighted region shows
  which slots will be covered". Prototypes: `prototypes/spanning/` on branch
  `proto/spanning-blocks` (worktree `../Kits Quilts spanning-proto`).

### Session 2026-11-26/27 (owner, with the prototypes)

- A fourth prototype, D: drag with Set and the size slider together, "As you drag to increase the
  size the slider will match the current size", and "after placing, the size slider should return
  to whatever size it was before your placement". Owner, 2026-11-27: "ok, I like the way that
  feels. let's migrate that learning into the app". So there is no separate Merge step: a spanning
  block is made by setting it, and an empty merged space doesn't exist.
- Left as prototype D had them (its open questions, not yet answered): a drag can go below the
  slider's size; a drag grows from the space pressed, which stays a corner; covering placed blocks
  replaces them (shown, and counted under the quilt) rather than refusing.

### Session 2026-11-28 (owner, trying the app)

- Q: Should a 2U data block hold one week or four? → A: One. "the number of spots for it to hold
  something hasn't changed. it can only hold one week." A spanning data block is the same data
  block drawn bigger, holding one value.
- The prototype worked well on the owner's phone.
- Owner: "let's update where if you place a block (regardless of slider size), on top of a multi-slot block, the slider changes to the size of the multi-slot block and replaces the multi-block with the currently selected block". So a tap on a spanning block no longer
  goes by the slider (a 1U tap on one used to make it 1U).
- Owner: "didn't we already make data quilts work with this multi-U block?" Prototype D had data
  blocks; the app now does too (the number brush with Block size and drag).
- Printing: "please check that". Checked: templates, cutting and yardage come from the quilt's
  spaces with spans merged; a block used at more than one size now gets a block page and templates
  per size (it had one page at its first size, counting both).

## Concepts

- **Spanning block**: one block placed over a group of neighboring block spaces that is the space's
  own shape scaled up k times (kU: k × k squares or rectangles, a triangle of k² triangles, a
  diamond of k × k diamonds), drawn once at the group's size, like a medallion center in a grid
  quilt. Sashing and cornerstones inside the group are covered; sashing around it stays.
- **First space**: the space in the corner the span grows from (a rectangle's top-left in its own
  axes, a triangle's or diamond's tip). The block is stored there with `span: k` (rrq v14); the
  layout then shows that space grown and the others it covers gone.

## User Scenarios & Testing

### User Story 1 - Set a big block (Priority: P1)

**Independent Test**: 6 × 6 straight-set quilt, Set block, drag from one middle space to the one
diagonally next to it: four spaces light, the line under the quilt says "2U · 4 spaces", and on
release the block fills them as one block at twice the size; the Block size slider showed 2U during
the drag and is back at 1U.

1. **Given** the Set block tool where blocks can span, **Then** a **Block size** slider (1U up to the
   largest span the layout has room for, with − and +) sits under Apply to. Pointing at the quilt
   lights the spaces a block of that size would cover nearest the pointer: the quilt stays as it
   is and the new block is drawn see-through over them, at 1U too (owner, 2026-11-28: "continue to
   show the old block and then show a ghost of the new block over the old one"); a tap places it
   there. At 1U a tap sets the space tapped, as before.
2. **Given** a drag with Set block, **Then** the block grows from the space pressed (it stays a
   corner) to the smallest span holding the space under the pointer; the slider follows the size;
   release places it and the slider goes back to its size from before the drag.
3. **Given** a span over placed 1U blocks, **Then** they are replaced; the line under the quilt says how many it replaces. Sashing inside keeps its fabric,
   hidden, for when the block is split.
4. **Given** a spanning block, **Then** **Split spanning block** (a tool shown where blocks can span)
   leaves the block in its first space only; the others are empty. Undo works throughout.
5. Paint, rotate, flip, erase, find and colorings work on a spanning block as on any block. Apply to
   (All, Alternate) works at 1U only; Set with All or Alternate keeps spanning blocks their size.
6. **Given** a tap on a spanning block with Set (or the data brush), at any Block size, **Then** the
   selected block replaces it at its size and the slider changes to that size and stays there;
   pointing at it (its sashing too) lights the whole block and the slider shows its size until the
   pointer leaves it (owner, 2026-11-28: "the u-slider should show the size of the multi-slot block
   when you're hovering over one and might replace it"). Making it smaller or bigger is Split, then a new block.
7. **Given** a spanning block on the quilt, **Then** no other span may take part of it or hold it
   (pointing, tapping and dragging skip such spans; a tap with none left says the size doesn't fit
   there). Only a block in exactly its spaces goes there (owner, 2026-11-28: "the only place the
   multi-slot block should be able to go when the slot size differs from the slider-selected size
   is in the multi-slot that's already occupied").

### User Story 2 - Layout changes keep merges (Priority: P1)

1. **Given** rows or columns added, removed or resized, **Then** spanning blocks that still fit stay;
   one that no longer fits goes back to its first space.
2. **Given** sashing, **Then** it runs around spanning blocks, not through them; a span with sashing
   is k blocks plus the k − 1 sashes between them across.

### User Story 3 - Print and count (Priority: P1)

1. **Given** spanning blocks, **Then** templates, cutting and yardage use the block at its spanned
   size (spec 010), listed apart from the same block at the normal size: in a quilt printout each
   size gets its own block page (finished size, count, fabric) and its own template pages and key.

### Edge Cases

- Spans never overlap (a later one overlapping an earlier one in a file is left out); a span can't
  include a border.
- At the quilt's edge a span may take partial (trimmed) block spaces, its first space too, and is
  then cut to the edge like them (owner, 2026-11-28: "the first space should be allowed to sit in a
  trimmed space"). It still takes all k² spaces: it can't run past the edge where there are none.
  On-Point with setting pieces cut exact: a span may take setting pieces, which then hold its parts
  as trimmed blocks do (`spanSpaces`, `generateFor`). With floating setting pieces only edge
  positions already holding a block count (holding one moves that side's edge).
- A span is real only when exactly k² whole spaces of its shape, plus sashing and cornerstones,
  tile it with nothing else inside, so layouts of uneven spaces (strips, Variable layouts) span only
  where they form one clean shape. Hexagons, clamshells and spools never span.
- Data quilts: the Data tab's number brush takes the Block size and drag, as Set does. A 2U data
  block holds one number (one week for a week block), as at 1U (owner, 2026-11-28); the spaces it
  covers give their numbers back. Tapping a placed block again takes it off, except when the tap
  makes it bigger. A month's shorter variant keeps the span.

## Requirements

- **FR-001**: Quilters MUST be able to set one block over a kU span with the Set tool's Block size
  or a drag, and split it again, with undo.
- **FR-002**: A spanning block MUST be drawn once at the span's size, covering the sashing and
  cornerstones inside it.
- **FR-003**: Spanning blocks MUST survive layout edits where they still fit (spec 016 `reconcile`,
  which reports the others as `split`).
- **FR-004**: The project format stores a spanning block on its first space (`SlotContent.span`,
  rrq v14; v13 files need no change).
- **FR-005**: Printing and yardage MUST count spanning blocks at their spanned size.

## Success Criteria

- **SC-001**: A medallion quilt (a 2 × 2 center in a 6 × 6 grid) is made in under a minute.

## Out of Scope

- Blocks spanning spaces of different layouts or crossing borders; whole-quilt medallion layouts
  with rings of borders (a later layout style).
