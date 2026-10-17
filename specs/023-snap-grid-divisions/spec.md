# Feature Specification: Snap Grid Spacing Display and Notes

**Feature Branch**: `TBD` (no feature branch yet)

**Created**: 2026-10-17

**Status**: Draft (spec only; not implemented)

**Input**: Owner, 2026-10-17: the block builder tool should allow the user to change the snap grid,
in particular to even divisions of the block. The UI should show what spacing the snap grid is set
to, and if set to fractions of an inch, show the fractional representation instead of the decimal
representation. The user should be encouraged by a toast, when changing the snap grid for a given
block, to record in the block's notes what grid spacings they used.

Related: spec 007 (block editor: snap grid by step or divisions, US5 acceptance 1, FR-002, FR-030,
FR-031), spec 003 (notecard `notes`, FR-011), spec 010 (printed lengths in ruler sixteenths).

## Already in place (spec 007)

The block editor's Snapping section already switches between **Step** (one spacing in project units)
and **Divisions** (an Across and a Down count, so grid lines fall on the block's edges). The setting is
saved with the block, and resizing the block keeps the division counts and recomputes the spacing.
This spec does not change any of that. What is missing: in Divisions mode the spacing is never shown,
and lengths in the editor show as decimals.

## Clarifications

### Session 2026-10-17

- Q: How should inch spacings show? → A: In sixteenths of an inch, reduced as a ruler reads them
  (4/16 shows as ¼, 8/16 as ½, 6/16 as ⅜, 5/16 stays 5/16). No other fractions (no thirds, fifths).
  A length that isn't on a sixteenth shows the nearest sixteenth with `≈` (10″ ÷ 3 shows `≈3 5/16″`).
- Q: Which lengths? → A: The grid spacing, and also the block size and pointer readout under the
  canvas, so inch decimals never sit beside fractions. (Default taken; owner may revisit.)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See the grid spacing (Priority: P1)

A quilter drawing a 10″ nine-patch sets Divisions to 3 × 3 and wants to know what that means on a
ruler.

**Independent Test**: On a 10″ × 10″ block, Divisions 4 × 4 shows `2½″` beside the counts; 3 × 3
shows `≈3 5/16″`; 3 × 4 shows `≈3 5/16″ × 2½″`.

**Acceptance Scenarios**:

1. **Given** Divisions mode, **Then** the resulting spacing is shown beside the counts: one value
   when both axes match, `across × down` when they differ.
2. **Given** Step mode, **Then** the step field shows its value the same way (fraction in inches).
3. **Given** the block is resized, **Then** the shown spacing updates at once.
4. **Given** a metric project, **Then** spacings show in centimeters as other editor lengths do
   (10 cm ÷ 4 shows `2.5 cm`).

### User Story 2 - Fractions instead of decimals (Priority: P1)

**Independent Test**: In an inch project, every length in the block editor (spacing, block size,
pointer position, seam length) shows as whole inches and sixteenths; no inch value shows a decimal
point.

**Acceptance Scenarios**:

1. **Given** an inch length on a sixteenth, **Then** it shows as a reduced ruler fraction (`2½″`,
   `1 5/16″`, `¾″`, `3″`).
2. **Given** an inch length off a sixteenth, **Then** it shows the nearest sixteenth with `≈`
   (`≈3 5/16″`).
3. **Given** the readout under the canvas, **Then** block size, pointer position and seam length
   follow the same rule.

### User Story 3 - Prompt to record the grid in the notes (Priority: P2)

**Independent Test**: Change a block from Divisions 4 × 4 to 3 × 3 and leave the field; a toast
suggests recording it and offers **Add to notes**; tapping it appends
`Snap grid: ≈3 5/16″ (3 × 3 divisions)` to the block's notes.

**Acceptance Scenarios**:

1. **Given** the snap grid of a block is changed (mode, step or a division count), **When** the change
   settles (the field loses focus or the mode switch is tapped), **Then** one toast encourages
   recording the spacing in the block's notes and offers **Add to notes**.
2. **Given** **Add to notes** is tapped, **Then** the line is appended to the block's notes on a new
   line (existing text kept), as one undoable change.
3. **Given** the toast is ignored or dismissed, **Then** nothing is written to the notes.
4. **Given** the notes already contain that exact line, **Then** no toast is shown.
5. **Given** typing a multi-digit count (1, then 12), **Then** only one toast is shown, for 12.
6. **Given** an undo or redo of a grid change, or opening a block, **Then** no toast is shown.

## Requirements *(mandatory)*

- **FR-001**: Divisions mode MUST show the resulting spacing per axis beside the counts (one value
  when equal). Step mode MUST show its step in the same format.
- **FR-002**: In inch projects, block editor lengths (spacing, block size, pointer position, seam
  length) MUST show as whole inches plus sixteenths, reduced to the ruler's name for the mark (¼, ½,
  ⅛, ⅜, ⅝, ¾, ⅞; otherwise n/16). No other denominators and no decimal inches.
- **FR-003**: An inch length not on a sixteenth MUST show the nearest sixteenth prefixed `≈`. Snapping
  still uses the exact spacing; only the display is rounded.
- **FR-004**: Metric lengths keep the existing editor format (centimeters, at most two decimals).
- **FR-005**: When a block's snap grid change settles, a toast MUST encourage recording it in the
  block's notes, with an **Add to notes** action. One toast per settled change; none on undo/redo or
  opening the block.
- **FR-006**: **Add to notes** MUST append one line to the block's notecard `notes` (spec 003
  FR-011): `Snap grid: <spacing>`, plus `(<across> × <down> divisions)` in Divisions mode. Spacing as
  in FR-001/FR-002. Existing notes are kept; the append is one undo step.
- **FR-007**: No toast MUST be shown when the notes already contain the exact line FR-006 would add.
- **FR-008**: Read-only blocks (library items, spec 008) show the spacing but never the toast.

## Success Criteria *(mandatory)*

- **SC-001**: For 20 random block sizes and division counts in an inch project, every length shown in
  the block editor is whole inches plus sixteenths (with `≈` when rounded); none has a decimal point.
- **SC-002**: A quilter can read the spacing of a 3 × 3 grid on a 10″ block without leaving the
  Snapping section.
- **SC-003**: After one grid change and **Add to notes**, the notes contain exactly one new line, and
  it survives save and reopen.

## Edge Cases

- A spacing under half a sixteenth (a 1″ block at 96 divisions) shows `≈0″`; it is still allowed
  (the existing limits on counts and step stay as they are).
- Switching Step ↔ Divisions counts as a change: one toast for the new setting.
- Changing the grid back to a value already recorded: no toast (FR-007).
- Two blocks edited one after the other: each block's toast is about that block only.

## Assumptions

- The ruler format already used by printouts (spec 010: sixteenths, reduced) is the one meant here;
  printouts are unchanged (they keep showing the decimal with the ruler mark).
- The toast is a short notice with one action, dismissed by timeout or tap, like other app toasts.

## Out of Scope

- New snap modes or changes to the existing step/division limits.
- A grid not tied to the block (free grid per quilt).
- Recording anything to the notes without the quilter's tap.
