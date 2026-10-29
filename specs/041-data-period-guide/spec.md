# Feature Specification: Data Quilt Period Guide

**Feature Branch**: `TBD` (target 0.7.3)

**Created**: 2026-10-22

**Status**: Draft (spec only; not implemented). Builds on spec 025 (data quilts).

**Input**: Owner, 2026-10-22 test round: "we need a mechanism to, week by week or month by month or
day by day provide guidance on the block map. When you turn off tint by fabric, there's no
indication of how each day's or week's or month's block has fabric needs for that period."
Owner: "the per-tint fabric spec for printing should be in 0.7.1".

## Today

- A data quilt prints its picture with a legend (each value range and its color) and a worst-case
  yardage.
- The quilt and the block pictures show which place is which day only on screen (numerals, order
  line) and only in the Design tab.
- A quilter sewing one month (or week, or day) at a time has no sheet saying: for this period, these
  pieces, for these days, in the fabric of whichever range that day's value falls in.

## Concepts

- **Period**: one number of the plan: a month, a week (or a left-over day), or a day.
- **Period guide**: a printed (and on-screen) sheet per period: the block (its variant for the
  period) drawn with piece letters and day numerals, plus a table of its pieces by day.
- **Fabric by range**: with sample or real data, each day's row names the range its value falls in
  and that range's color or fabric. Without a value yet, the row lists every range's fabric as
  choices (the quilter picks once the day is recorded).

## User Scenarios & Testing

### User Story 1 - Print a guide per period (Priority: P1)

1. **Given** a data quilt with placed numbers, **When** printing, **Then** Print options has
   **Period guide** (off by default) with **All periods** or a range (Jan to Mar, Wk 1 to 4).
2. **Given** Period guide on, **Then** each period gets a section: its label (Jan, Wk 3, Jan 2), the
   block space (Block N), the block variant drawn with lettered pieces and the day numerals on its
   data places (fabric tint off draws it uncolored, outlines only), and a table:

   | Day | Date   | Value | Range     | Pieces    | Fabric        |
   | --- | ------ | ----- | --------- | --------- | ------------- |
   | 1   | Jan 1  | 31 °F | 30 to 40  | A1, A2    | Sky (swatch)  |

   Pieces not on any day (the block's own colors) are listed once with their fabric.
3. **Given** a day with no value (real data not entered, no sample shown), **Then** Value and Range
   are blank and Fabric lists each range's swatch small, to circle by hand.
4. **Given** several values (A to D), **Then** each value's places are listed under their value
   letter, each with its own range and fabric.
5. Cut sizes per piece follow the print settings (rotary cuts or templates, as block printing does
   today); identical pieces across days are counted together per fabric.

### User Story 2 - See it on screen (Priority: P2)

1. **Given** the Design › Data tab, **When** a placed block space is tapped, **Then** a panel shows
   that period's guide (same content as the print section) with Previous and Next periods.

### Edge Cases

- A period without a block (number not placed) prints "Not placed" and no table.
- A month shorter than its variant: places past the last day show "past the month" with the setting
  for them (filler, own color).
- Weeks plan left-over days use their day block or the week block's 1-day variant.
- Colorways: the guide uses the shown colorway's range colors.

## Requirements

- **FR-001**: Print gains an optional Period guide section for data quilts, per period, with the
  block picture (piece letters, day numerals) and the day table above.
- **FR-002**: Values come from real data when shown, else the sample, else blank with every range
  offered.
- **FR-003**: Picture and table work with fabric tint off (uncolored outlines, swatch beside each
  row).
- **FR-004**: The on-screen guide reuses the print section's content.
- **FR-005**: Help (Data quilts › Print it) describes the guide.

## Success Criteria

- **SC-001**: For any period, the quilter can tell from one section which pieces to cut in which
  fabric for each day, without the app open.
- **SC-002**: Totals in the guide (pieces per fabric) agree with the yardage's counts for the same
  data.

## Assumptions

- No file format change: the guide is computed from the plan, the blocks and the data.
