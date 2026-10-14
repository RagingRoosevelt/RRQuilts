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

<svg viewBox="0 0 230 130" width="345" role="img" aria-label="A block turned on point, with setting triangles filling the edges and corners around it">
  <rect x="10" y="20" width="140" height="80" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="80,20 120,60 80,100 40,60" style="fill: var(--q-primary)" stroke="currentColor"/>
  <line x1="10" y1="20" x2="40" y2="60" stroke="currentColor"/>
  <line x1="10" y1="100" x2="40" y2="60" stroke="currentColor"/>
  <line x1="150" y1="20" x2="120" y2="60" stroke="currentColor"/>
  <line x1="150" y1="100" x2="120" y2="60" stroke="currentColor"/>
  <rect x="160" y="40" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="178" y="50" font-size="11" fill="currentColor">block on point</text>
  <rect x="160" y="58" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="178" y="68" font-size="11" fill="currentColor">setting triangles</text>
</svg>

## Worked examples

| Finished block | Block diagonal | Side triangles (cut both diagonals) | Corner triangles (cut once) |
| -------------- | -------------- | ----------------------------------- | --------------------------- |
| 10″            | 14.142″        | 15⅜″ square (15.349″)               | 8″ square (7.925″)          |
| 25 cm          | 35.36 cm       | 39 cm square (38.98 cm)             | 20.5 cm square (20.24 cm)   |

The calculator gives sizes for one side triangle square (it makes 4 triangles) and one corner square
(2 triangles). The number you need depends on the layout.

::calc onpoint
