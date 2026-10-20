# Feature Specification: Techniques on the Built-in Blocks

**Feature Branch**: `TBD` (no feature branch yet)

**Created**: 2026-10-20

**Status**: Draft (tabled: better heuristics first)

**Input**: Owner, 2026-10-20 test round: "We need to apply those tags to our existing built-in
blocks." Round 3, after a first pass: "let's not push this to prod for now. I think we need better
heuristics when you're deciding what to label them."

## Background

Spec 029 made technique the designer's data (Techniques: FPP, appliqué, hand sewing; Efficiency:
strip piecing, quick units, stitch and flip), never worked out by the app. The built-in blocks have
none, so Libraries' Technique filter offers nothing for them.

A first pass (0.6.0, removed before release) proposed techniques once from each block's pieces and
wrote them into data. `draft-techniques.ts` here is that list, kept for reference:

- FPP: a piece angle off the 45° grid or under 40°, more than 4 pieces, no curves (13 blocks).
- Strip piecing: a row of 3+ rectangles joined along equal full sides, or 2 identical rows (same
  sizes and colors) (194).
- Quick units: 2+ half-square triangle units, or 2+ triangles with an axis hypotenuse (geese, QST)
  (219).
- Stitch and flip: a right triangle whose hypotenuse borders a 5+ sided piece (snowball corner) (8).
- Letters and numbers: none.

Too broad: most traditional blocks came out as both strip pieced and quick units.

## Requirements

- **FR-001**: Built-in blocks MUST carry techniques in their data (a reviewed list), not computed at
  run time.
- **FR-002**: The proposal heuristics MUST be stricter than the first pass, for example:
  - strip piecing only where a strip set is the usual way to make the block (units of 2+ strips cut
    into 2+ identical segments that make up a large share of the block), not any two squares;
  - quick units only where several identical HST/QST/geese units make up a large share of the block;
  - FPP where points are sharp or angles off-grid enough that rotary cutting is impractical;
  - appliqué and hand sewing by hand only.
- **FR-003**: The owner reviews the proposals (a page or list showing each block with its proposed
  techniques, accept/reject) before they ship.
- **FR-004**: Adding techniques changes block versions: projects using built-in blocks may be offered
  the update; that is acceptable.

## Open questions

- Thresholds for "large share" (half the block's area?).
- Should the review happen in the Tests tab (a Techniques page, dev only)?
