---
title: Quarter-square triangles
order: 40
summary: Cut a square, cut both diagonals for four triangles, long side on the straight grain.
---

A quarter-square triangle (QST) is a square cut into quarters with both diagonals. Its **long side**
runs along the straight grain, which keeps the outside edge of a unit from stretching. They are used
for the hourglass shape, flying-geese centers, and the side triangles of an
[on-point setting](/help/math/on-point-settings).

## The formula

Let the finished long side be f. Cut a square of

> **cut = f + 2 × (1 + √2) × SA**

SA is the [seam allowance](/help/math/seam-allowance).

then cut both diagonals to make **4 triangles**. With a ¼″ seam allowance, 2(1 + √2) × ¼″ ≈ 1.207″,
and with 7.5 mm it is ≈ 3.62 cm.

This is more than a half-square triangle needs. The long side is the diagonal of the cut square, but the
triangle needs a seam allowance along that side _and_ a seam allowance on the two short sides, which
sit at 45° to the long side. Each short seam moves the points out by (1 + √2) × SA along the long side.

<svg viewBox="0 0 360 150" width="540" role="img" aria-label="A cut square quartered on both diagonals, and one of its triangles with the finished triangle dashed inside it. A bracket marks the finished long side">
  <rect x="10" y="62" width="50" height="50" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <line x1="10" y1="62" x2="60" y2="112" stroke="currentColor" stroke-width="1.5"/>
  <line x1="60" y1="62" x2="10" y2="112" stroke="currentColor" stroke-width="1.5"/>
  <text x="35" y="128" font-size="11" fill="currentColor" text-anchor="middle">cut square</text>
  <defs><marker id="dim-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs>
  <line x1="68" y1="87" x2="96" y2="87" stroke="currentColor" marker-end="url(#dim-arrow)"/>
  <polygon points="110,112 203.7,112 156.9,65.1" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="120.9,107.5 192.9,107.5 156.9,71.5" fill="none" stroke="#333" stroke-dasharray="4 3"/>
  <line x1="120.9" y1="109.5" x2="120.9" y2="130.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="192.9" y1="109.5" x2="192.9" y2="130.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="120.9" y1="126.0" x2="192.9" y2="126.0" stroke="currentColor"/>
  <line x1="120.9" y1="130.0" x2="120.9" y2="122.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="192.9" y1="130.0" x2="192.9" y2="122.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="156.9" y="140.0" font-size="11" fill="currentColor" text-anchor="middle">finished long side</text>
  <text x="215" y="64" font-size="11" fill="currentColor">one of the 4 triangles at</text>
  <text x="215" y="80" font-size="11" fill="currentColor">its cut size (solid),</text>
  <text x="215" y="96" font-size="11" fill="currentColor">finished triangle (dashed)</text>
</svg>

## Worked examples

| Finished long side | Exact cut | Cut (rounded up)             | Makes       |
| ------------------ | --------- | ---------------------------- | ----------- |
| 4″                 | 5.207″    | 5¼″ square                   | 4 triangles |
| 10 cm              | 13.62 cm  | 14 cm square (5 mm rounding) | 4 triangles |

::calc qst
