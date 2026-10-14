---
title: Square in a square
order: 60
summary: A square set on point inside four corner triangles.
---

A square-in-a-square unit is a center square turned 45° with a triangle on each side. Its corners
touch the middle of the unit's sides.

## The formulas

For a finished unit of side f:

> **center square (finished) = f ÷ √2**
> **center cut = f ÷ √2 + 2 × SA**

SA is the [seam allowance](/help/math/seam-allowance).

> **corner triangles = two squares of the half-square size for f ÷ 2, each cut once diagonally**

The center's diagonal is the unit's side, so its side is f ÷ √2 (about 0.707 × f). The corners are
half-square triangles whose legs are f ÷ 2, so the cut is f ÷ 2 + (2 + √2) × SA, and each square is
cut once diagonally to make 2 triangles.

<svg viewBox="0 0 260 150" width="390" role="img" aria-label="A square with a tilted center square inside it, touching the middle of each side, and a triangle in each corner. A bracket marks the finished unit side">
  <rect x="10" y="10" width="100" height="100" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="60,10 110,60 60,110 10,60" style="fill: var(--q-primary)" stroke="currentColor"/>
  <line x1="10.0" y1="112.0" x2="10.0" y2="128.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="110.0" y1="112.0" x2="110.0" y2="128.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="10.0" y1="124.0" x2="110.0" y2="124.0" stroke="currentColor"/>
  <line x1="10.0" y1="128.0" x2="10.0" y2="120.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="110.0" y1="128.0" x2="110.0" y2="120.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="60.0" y="138.0" font-size="11" fill="currentColor" text-anchor="middle">finished unit side</text>
  <rect x="130" y="40" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="148" y="50" font-size="11" fill="currentColor">tilted center</text>
  <rect x="130" y="58" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="148" y="68" font-size="11" fill="currentColor">4 corner triangles</text>
</svg>

## Worked examples

| Finished unit | Center cut            | Corner squares (cut once) |
| ------------- | --------------------- | ------------------------- |
| 4″            | 3.328″ → 3⅜″ square   | 2 × 2⅞″ square            |
| 10 cm         | 8.57 cm → 9 cm square | 2 × 8 cm square           |

The calculator rounds up to your ruler. See [Rounding](/help/math/rounding). For several units at
once, see [Square-in-a-square units](/help/techniques/square-in-a-square-units).

::calc sqinsq
