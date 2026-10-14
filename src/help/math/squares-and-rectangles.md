---
title: Squares and rectangles
order: 20
summary: Cut size is the finished size plus a seam allowance on each side.
---

Squares and rectangles are the simplest pieces. Each edge gets a seam allowance, so each dimension
grows by two of them.

## The formula

> **cut = finished size + 2 × SA**

SA is the [seam allowance](/help/math/seam-allowance).

Do it once for each side of a rectangle. With a ¼″ seam allowance that is the familiar "add ½″". With
7.5 mm it is "add 1.5 cm".

<svg viewBox="0 0 345 130" width="517" role="img" aria-label="A rectangle of fabric with the finished area dashed inside it and a seam allowance on every side. Brackets mark the finished length and width">
  <rect x="10" y="10" width="120" height="80" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <rect x="25" y="25" width="90" height="50" fill="none" stroke="#333" stroke-dasharray="4 3"/>
  <line x1="25.0" y1="77.0" x2="25.0" y2="110.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="115.0" y1="77.0" x2="115.0" y2="110.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="25.0" y1="106.0" x2="115.0" y2="106.0" stroke="currentColor"/>
  <line x1="25.0" y1="110.0" x2="25.0" y2="102.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="115.0" y1="110.0" x2="115.0" y2="102.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="70.0" y="120.0" font-size="11" fill="currentColor" text-anchor="middle">finished length</text>
  <line x1="117.0" y1="25.0" x2="150.0" y2="25.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="117.0" y1="75.0" x2="150.0" y2="75.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="146.0" y1="25.0" x2="146.0" y2="75.0" stroke="currentColor"/>
  <line x1="142.0" y1="25.0" x2="150.0" y2="25.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="142.0" y1="75.0" x2="150.0" y2="75.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="152.0" y="54.0" font-size="11" fill="currentColor">finished width</text>
  <text x="190" y="20" font-size="11" fill="currentColor">cut (solid) = finished</text>
  <text x="190" y="36" font-size="11" fill="currentColor">(dashed) + SA on each side</text>
</svg>

## Worked examples

| Finished     | Exact cut     | Cut (rounded up) |
| ------------ | ------------- | ---------------- |
| 3″ square    | 3½″           | 3½″ square       |
| 6″ × 3″      | 6½″ × 3½″     | 6½″ × 3½″        |
| 8 cm square  | 9.5 cm        | 9.5 cm square    |
| 15 cm × 8 cm | 16.5 × 9.5 cm | 16.5 × 9.5 cm    |

These already land on a ruler mark. When they don't, the cut is rounded up. See
[Rounding](/help/math/rounding).

## Calculators

::calc square

::calc rect

To work out how much fabric a pile of squares needs, see
[Yardage and fat quarters](/help/math/yardage-and-fat-quarters).
