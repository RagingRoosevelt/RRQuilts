# Feature Specification: Printing

**Feature Branch**: `010-printing`

**Created**: 2026-10-12

**Status**: Draft

**Input**: User description: "Printing: templates, rotary cutting chart, yardage estimate, quilt
picture, block picture — from the existing Print tabs."

> First slice of spec 001 US7 (FR-090…FR-096). Foundation piecing, photo sheets, appliqué and
> embroidery printouts, and dragging pieces by hand come later.

## Clarifications

### Session 2026-10-12

- Q: First slice? → A: Templates, rotary cutting chart, yardage estimate, quilt picture, block picture.
- Q: Where? → A: The existing Print tabs (block editor: templates, rotary chart, block picture;
  quilt editor: quilt picture, yardage, rotary chart for the whole quilt).
- Q: Template layout? → A: Automatic packing (rotate to fit; oversize pieces tiled across pages with
  alignment marks). Dragging by hand later.
- Q: Rotary chart? → A: Squares, rectangles, half-square triangles (+⅞″), quarter-square triangles
  and geese (+1¼″); mitered border sides cut as strips (long edge + 2·seam·(1+√2)) with both ends trimmed
  at 45°, plus a true-size corner guide page per strip width (left and right end: cut line, sewing
  lines, a dot where stitching stops; the outer tip trimmed when trimmed points is on); anything else "needs a template". Rounding ⅛″ (default), 1/16″, none; metric
  5 mm (default), 1 mm, none; warning when rounding distorts. Seam allowance ¼″ / 7.5 mm, adjustable.
- Q: Yardage? → A: By color, one column per fabric width: 42″ (40″ usable), 44″, 60″, fat quarters;
  metric 110 cm, 150 cm, fat quarters (no width setting; rotary strips use the first). Mitered border strips get extra length
  (default 2″ / 5 cm, 0 = exact), trimmed at 45° after sewing. Rounded up to ⅛ yd (default), ¼ yd, ½ yd; metric 10 cm (default),
  20 cm, 45 cm. Borders from strips. Backing and binding included.
- Q: Long pages? → A: The rotary chart, yardage, credits, and block pages are measured and split into
  sheets: a color's chart stays whole, table and list headings repeat, continued sheets say
  "(continued)"; every footer shows "X of Y". Block fabric pills move under the picture when they
  don't fit beside it.
- Q: Paper? → A: Letter, Legal, or A4 in any project; default Letter (inches) or A4 (cm). A0
  dropped. Portrait
  (default) or landscape.
- Q: More template options? → A: Include seam allowance (off: finished shapes for paper piecing),
  trimmed points (tips under 90° cut ¼″ past the sewing corner), shaded seam allowance, curve
  alignment marks (notch mid-curve), labels (letter / cut counts / finished size; a finished size with an approximate fraction prints small and the cut count large), tint by fabric
  (one fabric only), one template per page, scale square on each template (default on: 1″ / 2 cm under
  the labels, smaller if it doesn't fit, 2″ / 5 cm on pieces at least 6″ / 15 cm a side). The quilt picture page always has a
  scale square above the footer; footers hold only the title and byline. "SA = ¼″" printed in the seam allowance
  along each template's longest edge (option, default on).
- Q: Tinted templates? → A: One per fabric. A separate "Color key" label codes them by fabric number
  (A-2 = A from fabric 2; legend on the key). The template key is on the block page by default (option); template pages then skip
  it. Block pages show fabric pills only for fabrics that block uses.
- Q: Look? → A: User settings, defaulting to a solid cutting line, dashed sewing line, grain arrow,
  thin lines, mirror off.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Templates (Priority: P1)

A quilter prints each distinct patch of a block at true size with seam allowance.

**Independent Test**: Ohio Star at 9″: preview shows patches A (3½″ square), B (QST); a measured
printout matches; the scale square measures 1″.

**Acceptance Scenarios**:

1. **Given** a block, **Then** each distinct patch shape gets a letter, prints once with its cutting
   line (finished + seam allowance), sewing line, grain arrow, letter, and how many to cut of each
   color; a small key picture of the block shows the letters.
2. **Given** a size source (the block's own size, a quilt using it, or custom), **Then** templates are
   at that finished size.
3. **Given** many pieces, **Then** they're packed onto as few pages as practical; a piece larger than
   the printable area is split across pages with alignment marks.
4. **Given** mirror on, **Then** pieces print reversed.

### User Story 2 - Rotary cutting chart (Priority: P1)

**Acceptance Scenarios**:

1. **Given** a block (or a whole quilt), **Then** per color: strips to cut across the fabric width,
   subcuts, and the resulting pieces with counts, for squares, rectangles, half- and quarter-square
   triangles; other shapes listed as needing templates.
2. **Given** a finished size off the rounding grid, **Then** a warning says rounding distorts it and
   suggests templates.

### User Story 3 - Yardage (Priority: P1)

1. **Given** a quilt, **Then** an estimate per color (blocks, sashing, borders from strips), plus
   backing (4″ / 10 cm overhang per side, pieced from fabric widths) and binding (2½″ / 6 cm
   straight-grain strips), never under-estimating, rounded up to the chosen increment.

### User Story 4 - Pictures (Priority: P2)

1. **Given** a quilt or block, **Then** a picture in color or outlines only, with name and finished
   size; blocks at true size when they fit the page, otherwise scaled with the scale stated.

### User Story 5 - Block pages (Priority: P2)

1. **Given** a quilt printout with Block pages, **Then** each block used gets a page: picture,
   finished size, number planned, fabric per color for all of them, and its credits; the Credits
   page is then left out (each block page carries its own). Without block pages, a Credits page
   lists everyone. A block printout's "Block page" is the same page.

### User Story 6 - Suggest unit methods (Priority: P4, deferred — not planned soon)

Quilters often make common units whole instead of cutting each patch: flying geese by stitch and
flip (one rectangle + two squares) or four at a time (one big square + four small ones), half-square
triangles two or eight at a time, square-in-a-square, and so on. The rotary chart could recognize
these units from neighboring patches and offer the method alongside the per-patch cuts.

1. **Given** a block with a flying geese unit (one quarter-square triangle with two half-square
   triangles on its long side, filling a 2:1 rectangle), **Then** the rotary chart offers "Flying
   geese, stitch and flip: cut a W+½ × H+½ rectangle and two H+½ squares" and "four at a time: one
   W+1¼ square and four H+⅞ squares → 4 units", with the patches it replaces.
2. **Given** a suggested method, **When** the user picks it, **Then** the chart and yardage use it
   instead of the per-patch cuts for those units; per-patch stays the default.
3. **Given** a printout, **Then** each chosen method has a short how-to (sew lines, cut order).

### Every printout

- Header: name, finished size, project. Footer: author, license, everyone credited (spec 009).
- Page order (both printouts, for the pages each has): quilt picture → yardage → rotary chart →
  blocks (a block printout's block page) → templates → credits.
  A 1″ (2 cm) scale-check square. True scale at 100%; Save as PDF via the browser's print dialog.

## Requirements *(mandatory)*

- **FR-001**: Print tabs MUST offer the printouts above with options; Preview opens page views at
  true size; Print uses the browser print dialog (which also saves PDF). No new dependencies.
- **FR-002**: Print preferences (paper, orientation, seam allowance, rounding, fabric width,
  yardage increment, backing overhang, binding width, line styles, line weight, grain arrow, mirror)
  MUST be app settings, per unit system where they differ.
- **FR-003**: Distinct patches are found by shape (same outline up to rotation; mirror images
  differ).
- **FR-004**: Rotary math: squares/rectangles +2×seam; HST square = leg + (2+√2)×seam, 2 per square;
  QST square = hypotenuse + 2(1+√2)×seam, 4 per square; rounded up to the rounding step.
- **FR-005**: Yardage never under-estimates: whole strips across the usable width, rounded up.
- **FR-006**: Template labels (letter, finished size, cut count) MAY run into the seam allowance but
  MUST stay inside the cutting line. On long thin pieces, where a stack would shrink them, they lie
  in a row along the piece instead: letter at the start, size in the middle, count at the end
  (reading upward on upright pieces); such pieces carry no scale square. *Added 2026-10-16 (owner).*
- **FR-007**: A finished size off the ruler grid MUST print as its exact value with the ruler
  fractions on the line below in the form "(~ 3 5/16″ × 13/16″)", on templates (also when labels
  lie in a row, stacked in the middle item), under templates, and in the cutting chart; the chart's
  rounding warning prints smaller than the chart text. Template labels carry a light halo so they
  read across the seam lines (light labels on dark fabric get a dark one). *Added 2026-10-16 (owner).*

## Success Criteria *(mandatory)*

- **SC-001**: Printed templates and the scale square measure within 0.5 mm of size at 100% scale.
- **SC-002**: Rotary cut sizes match standard quilting charts (e.g. 3″ finished HST → 3⅞″ squares).

## Addendum 2026-10-16 (spec 018)

- Quilt pieces that aren't blocks (patches, setting pieces, pieced border and strip pattern shapes)
  that the cutting chart cuts from a template get template pages too, after the blocks', headed
  "Templates: quilt pieces" and lettered Q…, with a page-wide key: the template pieces in place, each labeled with its letter. The option reads "Templates (blocks and quilt
  pieces)".
- A **Quilt picture** section in the print options (quilts, after Paper) has **Show reference
  overlay** (print preference `showOverlay`, off by default) and its own **Fill** (`overlayOpacity`, 30%): the
  quilt picture page then draws the quilt's reference overlay, when it's enabled in Layout, in the
  quilt's tint (shared with Layout; show and fill are print's own), and grows to show it.
