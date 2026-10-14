---
title: Half-square triangles
order: 30
summary: Cut a square once diagonally for two triangles with their legs on the straight grain.
---

A half-square triangle (HST) is half of a square cut corner to corner. Its two short sides (the
legs) run along the straight grain, so the unit's outside edges don't stretch. Two HSTs sewn along
the long side make an HST unit.

## The formula

Cut a square of

> **cut = finished leg + (2 + √2) × SA**

SA is the [seam allowance](/help/math/seam-allowance).

and cut it once diagonally. With a ¼″ seam allowance, (2 + √2) × ¼″ ≈ 0.854″, which quilters round up
to **⅞″**, the familiar "add ⅞″" rule. With 7.5 mm, it is ≈ 2.56 cm.

Adding 2 × the seam allowance isn't enough, because the seam along the diagonal eats into the corner. The point
of the triangle has to extend √2 × the seam allowance past the finished corner for the seams to meet.

<svg viewBox="0 0 390 155" width="585" role="img" aria-label="A cut square halved on the diagonal, and one of its triangles with the finished triangle dashed inside it, a seam allowance from every side. A bracket marks the finished leg">
  <rect x="10" y="40" width="92.5" height="92.5" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <line x1="10" y1="132.5" x2="102.5" y2="40" stroke="currentColor" stroke-width="1.5"/>
  <text x="56.2" y="148.5" font-size="11" fill="currentColor" text-anchor="middle">cut square</text>
  <defs><marker id="dim-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs>
  <line x1="110.5" y1="86.2" x2="140" y2="86.2" stroke="currentColor" marker-end="url(#dim-arrow)"/>
  <polygon points="150,40 242.5,40 150,132.5" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="156.0,46.0 228.0,46.0 156.0,118.0" fill="none" stroke="#333" stroke-dasharray="4 3"/>
  <line x1="156.0" y1="44.0" x2="156.0" y2="20.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="228.0" y1="44.0" x2="228.0" y2="20.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="156.0" y1="24.0" x2="228.0" y2="24.0" stroke="currentColor"/>
  <line x1="156.0" y1="28.0" x2="156.0" y2="20.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="228.0" y1="28.0" x2="228.0" y2="20.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="192.0" y="22.0" font-size="11" fill="currentColor" text-anchor="middle">finished leg</text>
  <text x="255" y="80" font-size="11" fill="currentColor">one triangle at its cut</text>
  <text x="255" y="96" font-size="11" fill="currentColor">size (solid), finished</text>
  <text x="255" y="112" font-size="11" fill="currentColor">triangle (dashed)</text>
</svg>

## Worked examples

| Finished leg | Exact cut | Cut (rounded up)             | Makes       |
| ------------ | --------- | ---------------------------- | ----------- |
| 3″           | 3.854″    | 3⅞″ square                   | 2 triangles |
| 8 cm         | 10.56 cm  | 11 cm square (5 mm rounding) | 2 triangles |

The rotary cutting chart on your printouts uses this same formula, seam allowance, and rounding
(set them in the Print tab's options).

::calc hst

## Making several at once

The calculator also gives the squares for the [two, four, and eight at a time](/help/techniques/hst-units)
methods, which sew before cutting and trim the units to size afterward.
