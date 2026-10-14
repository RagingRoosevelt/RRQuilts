---
title: On-point settings
order: 70
summary: Setting triangles for blocks turned 45°.
---

Blocks set "on point" are turned 45° so they sit like diamonds. The straight edges of the quilt are
then filled with triangles.

## The formulas

For a finished block of side f, the block's diagonal (corner to corner) is **f × √2**. SA is the
[seam allowance](/help/math/seam-allowance).

- **Side setting triangles** have their long side along the quilt's edge, so they are
  [quarter-square triangles](/help/math/quarter-square-triangles) with a long side of f × √2. Cut a
  square of f × √2 + 2(1 + √2) × SA and cut both diagonals. Keeping the long side on the straight grain
  stops the quilt's edge from stretching.
- **Corner setting triangles** are [half-square triangles](/help/math/half-square-triangles) whose
  legs are f ÷ √2. Cut a square of f ÷ √2 + (2 + √2) × SA once diagonally. You need 2 squares (4
  corners).

<svg viewBox="0 0 300 100" width="450" role="img" aria-label="Eight blocks turned on point, with side triangles along the edges and corner triangles at the corners">
  <rect x="10" y="12" width="108" height="72" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="28,12 46,30 28,48 10,30" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="28,48 46,66 28,84 10,66" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="46,30 64,48 46,66 28,48" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="64,12 82,30 64,48 46,30" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="64,48 82,66 64,84 46,66" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="82,30 100,48 82,66 64,48" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="100,12 118,30 100,48 82,30" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="100,48 118,66 100,84 82,66" style="fill: var(--q-primary)" stroke="currentColor"/>
  <rect x="140" y="30" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="158" y="40" font-size="11" fill="currentColor">blocks on point</text>
  <rect x="140" y="48" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="158" y="58" font-size="11" fill="currentColor">side and corner triangles</text>
</svg>

## Worked examples

| Finished block | Block diagonal | Side triangles (cut both diagonals) | Corner triangles (cut once) |
| -------------- | -------------- | ----------------------------------- | --------------------------- |
| 10″            | 14.142″        | 15⅜″ square (15.349″)               | 8″ square (7.925″)          |
| 25 cm          | 35.36 cm       | 39 cm square (38.98 cm)             | 20.5 cm square (20.24 cm)   |

The calculator gives sizes for one side triangle square (it makes 4 triangles) and one corner square
(2 triangles). The number you need depends on the layout.

::calc onpoint
