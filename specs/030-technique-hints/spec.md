# Feature Specification: Technique Hints in a Block's Details

**Feature Branch**: `TBD` (no feature branch yet)

**Created**: 2026-10-19

**Status**: Draft (spec only; not implemented). Builds on spec 029 (techniques as Needs and
Efficiency checklists in a block's Details tab, only in the data, never applied by the app).

**Input**: Owner, 2026-10-19: add a feature where the app hints at applying an Efficiency or Needs
technique if some heuristic is met, when the user is in the Details view of a block.

## Concepts

- **Hint**: a suggestion shown beside a technique's checkbox in the block's Details tab, saying why
  the app thinks it applies ("Rows of equal strips: strip piecing may suit this block"). A hint never
  ticks anything; the designer decides, and the data holds only what they tick (spec 029).
- **Heuristic**: a rule over the block's drawing (its seams and pieces, as spec 029's construction
  reading already uses). Each technique has at most one.
- **Dismissed**: the designer said "not this block" to a hint; it stays hidden for that block.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See why a technique may apply (Priority: P1)

A designer finishes drawing a block and opens its Details tab. Under **Efficiency**, unticked **Strip
piecing** has a hint: "Two rows of equal strips run across the block." They tick it.

**Independent Test**: draw a Rail Fence (rows of equal strips), open Details: Strip piecing shows a
hint; tick it and the hint goes; the block's data now has strip piecing.

**Acceptance Scenarios**:

1. **Given** the designer's own block whose drawing meets a technique's heuristic, **When** the
   Details tab is open and that technique is unticked, **Then** a one-line hint shows under it with
   the reason and a **Not this block** link.
2. **Given** a hint, **When** the designer ticks the technique, **Then** the hint disappears and the
   technique is saved exactly as a manual tick (spec 029).
3. **Given** a ticked technique whose heuristic is not met, **Then** nothing is shown (the designer
   knows best; no "are you sure").
4. **Given** a built-in or pack block (read-only), **Then** no hints show.
5. **Given** the block's drawing changes, **When** Details is opened again, **Then** hints reflect
   the new drawing.

---

### User Story 2 - Dismiss a hint (Priority: P2)

**Acceptance Scenarios**:

1. **Given** a hint, **When** the designer picks **Not this block**, **Then** it hides for that block
   and stays hidden across sessions on this device.
2. **Given** a dismissed hint, **When** the block's drawing changes, **Then** the hint may show again
   (dismissals are for a drawing, not forever).
3. **Given** dismissals, **Then** they are not saved in the block, project, or library files: they're
   the designer's screen state, not block data.
4. **Given** Settings, **Then** **Show technique hints** turns them all off (on by default), and
   **Show dismissed hints again** clears dismissals.

---

### User Story 3 - Check the heuristics (Priority: P2, dev only)

**Acceptance Scenarios**:

1. **Given** the dev-only Tests › Blocks view, **Then** each built-in block lists which hints would
   show, so the owner can check them by eye and tune thresholds before release.

### Heuristics (starting points)

Measured on the block's drawing at its own size. Each lists the hint text shown.

**Efficiency**

- **Strip piecing**: two or more pieces are long rectangles (at least 3 × as long as wide) side by
  side with equal widths, spanning the block or a straight-seamed section of it; or a grid of squares
  whose rows repeat the same sequence (strip sets cut crosswise, as a Nine Patch). Hint: "Rows of
  equal strips: these can be cut from sewn strip sets."
- **Quick units**: two or more half-square triangle cells (a square split corner to corner into two
  pieces), quarter-square triangle cells (a square split by both diagonals), or flying geese (a 2:1
  rectangle split into one large and two small triangles). Hint: "4 half-square triangles: these can
  be made several at a time."
- **Stitch and flip**: a square or rectangle piece with small right-angled triangles in one or more
  corners, each triangle's legs at most half the piece's side (snowball, square-in-a-square corners).
  Hint: "Triangles on the corners of a square: they can be sewn on as squares and flipped."

**Needs**

- **Foundation paper piecing**: straight seams only, more than 12 pieces, several pieces narrower
  than ¾ in or with angles that aren't multiples of 45°, and the block can be split into sections
  each sewable in sequence. Hint: "Many small, angled pieces: foundation paper piecing may be easier."
- **Hand sewing**: set-in seams with a piece narrower than 1 in, or curved seams with a radius under
  1½ in. Hint: "Small set-in pieces (or tight curves): these may need hand sewing."
- **Appliqué**: the block has appliqué pieces (an appliqué or combined block). Hint: "This block has
  appliqué pieces."

### Edge Cases

- A block meeting several heuristics shows several hints, each under its own technique.
- Shaped blocks (triangles, diamonds, hexagons): the same rules, measured in the block's own shape.
- Curved blocks: strip piecing, quick units and stitch and flip are not suggested for pieces with
  curved edges.
- Very large blocks (hundreds of pieces): hints are worked out once per drawing and kept; the Details
  tab stays responsive (work happens after the tab shows).
- A project opened read-only (another tab editing): no hints, as nothing can be ticked.
- The hint text counts what it found ("4 half-square triangles") so the designer can check it.

## Requirements *(mandatory)*

- **FR-001**: The Details tab MUST show a hint under each unticked technique whose heuristic the
  block's drawing meets, with a short reason, for the designer's own editable blocks only.
- **FR-002**: Hints MUST NOT change the block's data; only ticking does.
- **FR-003**: Each hint MUST offer **Not this block**; dismissals MUST be kept on this device per
  block and drawing, never in files.
- **FR-004**: Settings MUST offer turning hints off and showing dismissed hints again.
- **FR-005**: Heuristics MUST be worked out from the drawing without blocking the Details tab, and
  reused until the drawing changes.
- **FR-006**: The dev-only Tests › Blocks view MUST list which hints each built-in block would get.

### Key Entities

- **Technique hint**: technique, reason text, and what was found (counts).
- **Dismissal**: block id, drawing version, technique; stored on this device only.

## Success Criteria *(mandatory)*

- **SC-001**: On the built-in blocks, the owner agrees with at least 9 in 10 hints shown, checked in
  Tests › Blocks before release.
- **SC-002**: The Details tab opens with no visible delay on a 200-piece block.
- **SC-003**: No file written by the app ever contains a technique the designer didn't tick.

## Assumptions

- Spec 029 is in place (technique checklists, construction reading, Tests tab).
- Quick-unit and stitch-and-flip detection work on pieces shared by the drawing's seams; a cell split
  differently than drawn (for example HSTs drawn as one square) isn't found, which is acceptable.

## Out of Scope

- Applying techniques to built-in blocks automatically (the owner wants techniques only in data).
- Hints for tags.
- Changing printing by technique (a later spec).
