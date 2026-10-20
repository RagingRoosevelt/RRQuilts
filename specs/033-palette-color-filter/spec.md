# Feature Specification: Filter Palettes by Hue, Value and Saturation

**Feature Branch**: `TBD` (no feature branch yet)

**Created**: 2026-10-20

**Status**: Draft (spec only; not implemented)

**Input**: Owner, 2026-10-20: a palette-only filter by hue (pick a hue and an angle range around it),
or by value range, or by saturation range.

## Concepts

- **Swatch color**: a color's own color, or a fabric's average color (spec 014).
- **Hue** is an angle (0–360°) on the color wheel; a hue filter is a center hue and a range of ± degrees
  around it (wrapping past 0°/360°). **Value** (lightness) and **saturation** are 0–100 ranges.
- The filter is **palette-only**: it appears when the Libraries page shows Palettes (or All) and on the
  sketchbook Palettes tab, never for blocks.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Find palettes with the blues I need (Priority: P1)

A quilter wants palettes that have teal-to-blue fabrics in them.

**Independent Test**: set Hue to 200° ± 25°: only palettes with at least one swatch in 175°–225° stay;
their matching swatches are highlighted.

**Acceptance Scenarios**:

1. **Given** the filter sidebar on Palettes, **Then** a **Color** card offers **Hue** (a hue wheel or
   strip to pick the center, and a ± range slider, 5°–180°), **Value** (a two-ended 0–100 slider) and
   **Saturation** (a two-ended 0–100 slider); each can be switched on or off.
2. **Given** one or more set, **Then** a palette shows only if at least one swatch matches **all** the
   set ranges.
3. **Given** a palette that matches, **Then** its matching swatches stay full strength and the rest
   are dimmed, so the matches stand out; **Only matching swatches** hides the rest instead.
4. **Given** the hue range crosses 0°/360° (e.g. 350° ± 20°), **Then** reds on both sides match.
5. **Given** the filters are cleared, **Then** every palette shows as before.

---

### User Story 2 - Light or muted palettes (Priority: P2)

**Acceptance Scenarios**:

1. **Given** Value 70–100 only, **Then** palettes with a light swatch show (to find background
   fabrics).
2. **Given** Saturation 0–25 only, **Then** palettes with muted or gray swatches show.
3. **Given** Hue set and Saturation at its lowest, **Then** grays don't match a hue (their hue is
   undefined): a swatch below a small saturation counts as no hue.

---

### User Story 3 - The rest of the filters (Priority: P3)

**Acceptance Scenarios**:

1. **Given** other filters (search, Libraries, Category, Tags), **Then** the Color card combines with
   them (all must match), as the other cards do.
2. **Given** the Color card set and the switch moved to Blocks, **Then** the card hides and doesn't
   filter blocks; back to Palettes, it applies again.
3. **Given** a reload, **Then** the Color card's settings are kept for the session only (filters
   reset on reload like the others).

### Edge Cases

- A palette with no swatches never matches a set Color filter.
- Very small ranges (± 5°, a 2-point value band) may match nothing: the empty-state message names
  the Color filter so it's easy to loosen.
- Fabrics with very varied prints match by their average only (the average can be misleading for
  high-contrast prints; a note in the card says so).

## Requirements *(mandatory)*

- **FR-001**: A palette-only **Color** filter MUST offer hue (center + ± range, wrapping), value range
  and saturation range, each optional.
- **FR-002**: A palette MUST match when at least one swatch is within every set range; swatches below
  a minimum saturation have no hue and never match a hue range.
- **FR-003**: Matching swatches MUST be shown at full strength and others dimmed, or hidden with
  **Only matching swatches**.
- **FR-004**: The filter MUST appear only for palettes (Libraries Palettes/All, sketchbook Palettes
  tab) and combine with the other filters by AND.
- **FR-005**: Fabrics MUST be judged by their average color.

## Success Criteria *(mandatory)*

- **SC-001**: A quilter finds every palette containing a given hue family in under 15 seconds.
- **SC-002**: Filtering hundreds of palettes updates as the sliders move (no visible lag).

## Assumptions

- Hue, value and saturation come from the same perceptual space as spec 032's sort (LCh: hue angle,
  lightness L*, chroma scaled 0–100), so the two features agree.
- The hue picker shows the colors themselves (a strip or wheel), not just numbers.

## Out of Scope

- Filtering blocks by the colors of their colorings.
- Matching a whole palette's mood (e.g. "mostly pastel"): matching is per swatch.
