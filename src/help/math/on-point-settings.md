---
title: On-point settings
order: 70
summary: Setting triangles for blocks turned 45°.
---

Blocks set "on point" are turned 45° so they sit like diamonds. The straight edges of the quilt are
then filled with triangles.

## The formulas

For a finished block of side f, the block's diagonal (corner to corner) is **f × √2**.

- **Side setting triangles** have their long side along the quilt's edge, so they are
  [quarter-square triangles](/help/math/quarter-square-triangles) with a long side of f × √2: cut a
  square of f × √2 + 2(1 + √2)s and cut both diagonals. Keeping the long side on the straight grain
  stops the quilt's edge from stretching.
- **Corner setting triangles** are [half-square triangles](/help/math/half-square-triangles) whose
  legs are f ÷ √2: cut a square of f ÷ √2 + (2 + √2)s once diagonally. You need 2 squares (4
  corners).

<svg viewBox="0 0 220 130" width="330" role="img" aria-label="Four blocks turned on point, with triangles filling the edges and corners">
  <rect x="10" y="10" width="140" height="110" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>
  <polygon points="80,20 120,60 80,100 40,60" fill="currentColor" fill-opacity="0.2" stroke="currentColor"/>
  <text x="160" y="50" font-size="11" fill="currentColor">block on point;</text>
  <text x="160" y="67" font-size="11" fill="currentColor">triangles fill</text>
  <text x="160" y="84" font-size="11" fill="currentColor">edges and corners</text>
</svg>

## Worked examples

| Finished block | Block diagonal | Side triangles (cut both diagonals) | Corner triangles (cut once) |
| -------------- | -------------- | ----------------------------------- | --------------------------- |
| 10″            | 14.142″        | 15⅜″ square (15.349″)               | 8″ square (7.925″)          |
| 25 cm          | 35.36 cm       | 39 cm square (38.98 cm)             | 20.5 cm square (20.24 cm)   |

The calculator gives sizes for one side triangle square (it makes 4 triangles) and one corner square
(2 triangles); the number you need depends on the layout.

::calc onpoint
