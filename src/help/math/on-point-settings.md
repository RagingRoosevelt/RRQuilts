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
- **The quilt**, with n blocks across the top row and m down the side, is n × f × √2 wide and
  m × f × √2 tall. It holds n × m + (n − 1)(m − 1) blocks and 2(n − 1) + 2(m − 1) side triangles.
  A half in either count adds half a block's width on point to that side, and the quilt ends on a
  short row (or column) there.

<svg viewBox="0 0 420 150" width="630" role="img" aria-label="Eight blocks turned on point, with side triangles along the edges and corner triangles at the corners. A bracket marks the side of one block">
  <rect x="10" y="30" width="144" height="96" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="34,30 58,54 34,78 10,54" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="34,78 58,102 34,126 10,102" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="58,54 82,78 58,102 34,78" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="82,30 106,54 82,78 58,54" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="82,78 106,102 82,126 58,102" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="106,54 130,78 106,102 82,78" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="130,30 154,54 130,78 106,54" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="130,78 154,102 130,126 106,102" style="fill: var(--q-primary)" stroke="currentColor"/>
  <polygon points="212,54 236,78 212,102 188,78" style="fill: var(--q-primary)" stroke="currentColor" stroke-width="1.5"/>
  <line x1="213.4" y1="52.6" x2="221.9" y2="44.1" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="237.4" y1="76.6" x2="245.9" y2="68.1" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="219.1" y1="46.9" x2="243.1" y2="70.9" stroke="currentColor"/>
  <line x1="216.2" y1="49.8" x2="221.9" y2="44.1" stroke="currentColor" stroke-width="1.5"/>
  <line x1="240.2" y1="73.8" x2="245.9" y2="68.1" stroke="currentColor" stroke-width="1.5"/>
  <text x="232" y="46" font-size="11" fill="currentColor">finished block side</text>
  <text x="212" y="118" font-size="11" fill="currentColor" text-anchor="middle">one block</text>
  <rect x="270" y="74" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="288" y="84" font-size="11" fill="currentColor">blocks on point</text>
  <rect x="270" y="92" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="288" y="102" font-size="11" fill="currentColor">side and corner triangles</text>
</svg>

## Worked examples

| Finished block | Block diagonal | Side triangles (cut both diagonals) | Corner triangles (cut once) |
| -------------- | -------------- | ----------------------------------- | --------------------------- |
| 10″            | 14.142″        | 15⅜″ square (15.349″)               | 8″ square (7.925″)          |
| 25 cm          | 35.36 cm       | 39 cm square (38.98 cm)             | 20.5 cm square (20.24 cm)   |

The calculator gives sizes for one side triangle square (it makes 4 triangles) and one corner square
(2 triangles). The number you need depends on the layout.

::calc onpoint
