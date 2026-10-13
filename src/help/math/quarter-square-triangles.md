---
title: Quarter-square triangles
order: 40
summary: Cut a square, cut both diagonals — four triangles, long side on the straight grain.
---

A quarter-square triangle (QST) is a square cut into quarters with both diagonals. Its **long side**
runs along the straight grain, which keeps the outside edge of a unit from stretching. They are used
for the hourglass shape, flying-geese centers, and the side triangles of an
[on-point setting](/help/math/on-point-settings).

## The formula

Let the finished long side be f. Cut a square of

> **cut = f + 2 × (1 + √2) × seam allowance**

then cut both diagonals to make **4 triangles**. With a ¼″ seam allowance, 2(1 + √2) × ¼″ ≈ 1.207″,
and with 7.5 mm it is ≈ 3.62 cm.

Why more than a half-square triangle? The long side is the diagonal of the cut square, but the
triangle needs a seam allowance along that side _and_ a seam allowance on the two short sides, which
sit at 45° to the long side. Each short seam moves the points out by (1 + √2)s along the long side.

<svg viewBox="0 0 220 120" width="330" role="img" aria-label="A square cut along both diagonals into four triangles">
  <rect x="10" y="10" width="100" height="100" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="10" y1="10" x2="110" y2="110" stroke="currentColor" stroke-width="1.5"/>
  <line x1="110" y1="10" x2="10" y2="110" stroke="currentColor" stroke-width="1.5"/>
  <text x="125" y="50" font-size="11" fill="currentColor">cut square,</text>
  <text x="125" y="68" font-size="11" fill="currentColor">both diagonals:</text>
  <text x="125" y="86" font-size="11" fill="currentColor">4 triangles</text>
</svg>

## Worked examples

| Finished long side | Exact cut | Cut (rounded up)             | Makes       |
| ------------------ | --------- | ---------------------------- | ----------- |
| 4″                 | 5.207″    | 5¼″ square                   | 4 triangles |
| 10 cm              | 13.62 cm  | 14 cm square (5 mm rounding) | 4 triangles |

::calc qst
