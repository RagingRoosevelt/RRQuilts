---
title: Backing
order: 100
summary: Fabric for the back, with an overhang, pieced the cheaper way.
---

The backing is bigger than the quilt top so the quilt can be loaded for quilting. Its size is the
quilt plus the **overhang** on each side (default 4″ / 10 cm).

## The formula

> **backing size = (quilt width + 2 × overhang) × (quilt height + 2 × overhang)**

If that is wider than the fabric's usable width, panels are sewn together. The calculator tries both
directions and picks the one that needs less fabric:

- panels running top to bottom: **⌈backing width ÷ usable width⌉ × backing height**
- panels running side to side: **⌈backing height ÷ usable width⌉ × backing width**

The result is rounded up to your fabric step (⅛ yd or 10 cm by default).

<svg viewBox="0 0 220 120" width="330" role="img" aria-label="A quilt top centered on a larger backing, with overhang on every side">
  <rect x="10" y="10" width="120" height="100" fill="currentColor" fill-opacity="0.12" stroke="currentColor" stroke-width="1.5"/>
  <rect x="25" y="25" width="90" height="70" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>
  <text x="142" y="50" font-size="11" fill="currentColor">quilt (dashed)</text>
  <text x="142" y="67" font-size="11" fill="currentColor">backing (solid)</text>
</svg>

## Worked examples

| Quilt        | Backing      | Panels (40″ / 105 cm usable)              | Fabric        |
| ------------ | ------------ | ----------------------------------------- | ------------- |
| 60″ × 72″    | 68″ × 80″    | 2 side to side, 2 × 68 = 136″ (vs 160″)   | 139½″ = 3⅞ yd |
| 150 × 180 cm | 170 × 200 cm | 2 side to side, 2 × 170 = 340 cm (vs 400) | 340 cm        |

::calc backing
