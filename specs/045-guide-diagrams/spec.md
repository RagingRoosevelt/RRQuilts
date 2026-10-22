# Feature Specification: Pictures in the App Guides

**Feature Branch**: `TBD` (no feature branch yet)

**Created**: 2026-10-22

**Status**: Draft (spec only; not implemented)

**Input**: Owner, 2026-10-22: "app guide articles in help should include more diagrams, etc".

## Today

- Help › Guides has 11 articles (about 11,000 words) with no pictures at all: Getting started,
  Designing a quilt (2,500 words), Data quilts (1,800), Libraries (1,800), Colors and palettes,
  Drawing blocks, Sketchbook, Printing, Settings, Block colorings, Credits and licenses.
- Math and Techniques articles have 41 inline `<svg>` diagrams. `topics.ts` supports inline SVG,
  `::calc <name>` (a live calculator) and `::diagram <section>/<id>` (repeat another topic's first
  diagram).

## Concepts

- **Diagram**: a hand-made inline SVG explaining an idea (what Alternate picks, how half rows end,
  how a numbered list maps to block spaces). Uses theme colors, so it works in light and dark.
- **Live picture**: drawn at view time by the app's own drawing code from a short directive, so it
  can't drift from what the app does:
  - `::layout <style> [options]`: a small quilt in that layout (the wizard picture, or a filled
    one with sashing and borders), e.g. `::layout on-point cols=3.5 rows=3 sashing`.
  - `::block <id> [coloring]`: a built-in block, e.g. `::block rrquilts.month-fan`.
  - `::quilt-demo <name>`: a quilt from the demo project (the format samples), e.g. a data quilt
    with its sample colors.
- **Tool chip**: `::icon <tool>` (or an inline form) shows the same icon and label as the editor's
  button, so steps read "tap ⟳ Rotate".
- **Screen sketch**: a simplified SVG of a screen area (the Design sidebar, the Blocks list) with
  numbered callouts matching the steps below it. Not screenshots: they go stale with every UI
  change and weigh a lot in the offline cache.

## User Scenarios & Testing

### User Story 1 - See it before reading it (Priority: P1)

1. **Given** any guide, **Then** each major section with a visual idea opens with a picture: at
   least one per H2 where the section explains a layout, tool, mode or flow.
2. **Given** Designing a quilt, **Then** each layout style has its live picture (the wizard's), each
   design tool its tool chip, and This / All / Alternate (and Empty, spec 042) a diagram showing
   which spaces a tap changes.
3. **Given** Data quilts, **Then** a flow diagram (plan → place numbers → map values → preview →
   real data → print), the numbered list next to a quilt with its labels and order line, each
   built-in data block as a live picture, and a value scale with its histogram.
4. **Given** Drawing blocks, **Then** a diagram per drawing tool (line, arc, grid, node) showing a
   before and after.
5. **Given** Printing, **Then** small sheet sketches of each printout (templates, rotary cuts,
   yardage).

### User Story 2 - Pictures that stay right (Priority: P1)

1. **Given** a live picture, **Then** it is drawn by the same code as the app, so a layout or block
   change shows in Help with no edit.
2. **Given** a directive that no longer matches (a removed block id, an unknown layout option),
   **Then** a test fails naming the topic and line (as the `::calc` test does today).
3. **Given** the app offline, **Then** every picture shows (no network; SVG inline or drawn).

### User Story 3 - Readable everywhere (Priority: P2)

1. **Then** pictures fit a phone's width (scale down, never scroll sideways) and follow dark mode.
2. **Then** each has a caption or `aria-label` saying what it shows; tool chips read as their label
   to screen readers.
3. **Then** tapping a live picture can open it larger (optional).

### Edge Cases

- Live pictures draw lazily as they scroll into view (as the dev pages do), so long guides stay
  fast.
- Prints of Help (browser print) include the pictures.
- Help writing style applies to captions (no em or en dashes, no clause-joining semicolons, no
  "Concept: details" colons).

## Requirements

- **FR-001**: `topics.ts` gains `::layout`, `::block`, `::quilt-demo` and `::icon` directives
  (inline icon form too), validated by a test.
- **FR-002**: Every guide gains pictures per US1; Designing a quilt and Data quilts first.
- **FR-003**: Diagrams use theme tokens (light and dark) and scale to the column width.
- **FR-004**: Each picture has a caption or accessible label.
- **FR-005**: No screenshots in the bundle; added weight for hand-made SVG stays small (target:
  under 150 KB in all).

## Success Criteria

- **SC-001**: Every guide has at least one picture per major section that explains something
  visual.
- **SC-002**: Changing a built-in block or a layout updates its Help pictures with no Help edit.
- **SC-003**: No picture breaks the layout on a 360 px wide phone.

## Assumptions

- Live pictures reuse `render/` (quilt and block drawing, wizard layout samples).
- The reference quilt software's manuals may inspire which ideas need pictures, never copied.
