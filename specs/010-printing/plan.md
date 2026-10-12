# Implementation Plan: Printing

**Branch**: `010-printing` | **Date**: 2026-10-12 | **Spec**: [spec.md](./spec.md)

## Design

- **Model** (`src/model/print/`, framework-free):
  - `polygon.ts` — simplify, orientation, offset (miter, bevel past 4×), congruence signature,
    min-area bounding orientation.
  - `pieces.ts` — pieces of a block at a size, or of a whole quilt (via `placementMatrix`), each with
    finished polygon (project units), curved flag, fill key; distinct shapes lettered.
  - `rotary.ts` — classify (square, rectangle, HST, QST, template), cut sizes, rounding, strip plan
    per color.
  - `yardage.ts` — per color from strip plans; backing; binding.
  - `pack.ts` — shelf packing with 90° turns; tiling oversize pieces.
  - `format.ts` — lengths as fractions (⅛, 1/16) or mm.
- **Settings**: `print` object in app settings, merged with defaults (`printPrefs`).
- **UI**: `PrintOptions.vue` in the Print tabs; `PrintPreview.vue` replaces the canvas there and
  renders sheets (SVG in real units; pictures via canvas) and calls `window.print()`; `@page` size
  injected; app chrome hidden in print.
