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
> **center cut = f ÷ √2 + 2 × seam allowance**
> **corner triangles: two squares of the half-square size for f ÷ 2, each cut once diagonally**

The center's diagonal is the unit's side, so its side is f ÷ √2 (about 0.707 × f). The corners are
half-square triangles whose legs are f ÷ 2, so the cut is f ÷ 2 + (2 + √2) × s, and each square is
cut once diagonally to make 2 triangles.

<svg viewBox="0 0 220 120" width="330" role="img" aria-label="A square with a tilted square inside it, touching the middle of each side">
  <rect x="10" y="10" width="100" height="100" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="60,10 110,60 60,110 10,60" fill="currentColor" fill-opacity="0.2" stroke="currentColor"/>
  <text x="125" y="55" font-size="11" fill="currentColor">center: tilted</text>
  <text x="125" y="72" font-size="11" fill="currentColor">4 corner triangles</text>
</svg>

## Worked examples

| Finished unit | Center cut            | Corner squares (cut once) |
| ------------- | --------------------- | ------------------------- |
| 4″            | 3.328″ → 3⅜″ square   | 2 × 2⅞″ square            |
| 10 cm         | 8.57 cm → 9 cm square | 2 × 8 cm square           |

The calculator rounds up to your ruler; see [Rounding](/help/math/rounding). For several units at
once, see [Square-in-a-square units](/help/techniques/square-in-a-square-units).

::calc sqinsq
