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

<svg viewBox="0 0 360 145" width="540" role="img" aria-label="A cut square halved on the diagonal, and one of its triangles with the finished triangle dashed inside it, a seam allowance from every side. A bracket marks the finished leg">
  <rect x="10" y="62" width="50" height="50" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <line x1="10" y1="112" x2="60" y2="62" stroke="currentColor" stroke-width="1.5"/>
  <text x="35" y="128" font-size="11" fill="currentColor" text-anchor="middle">cut square</text>
  <defs><marker id="dim-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs>
  <line x1="68" y1="87" x2="96" y2="87" stroke="currentColor" marker-end="url(#dim-arrow)"/>
  <polygon points="110,40 202.5,40 110,132.5" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="116.0,46.0 188.0,46.0 116.0,118.0" fill="none" stroke="#333" stroke-dasharray="4 3"/>
  <line x1="116.0" y1="44.0" x2="116.0" y2="20.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="188.0" y1="44.0" x2="188.0" y2="20.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="116.0" y1="24.0" x2="188.0" y2="24.0" stroke="currentColor"/>
  <line x1="116.0" y1="28.0" x2="116.0" y2="20.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="188.0" y1="28.0" x2="188.0" y2="20.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="152.0" y="22.0" font-size="11" fill="currentColor" text-anchor="middle">finished leg</text>
  <text x="215" y="80" font-size="11" fill="currentColor">one triangle at its cut</text>
  <text x="215" y="96" font-size="11" fill="currentColor">size (solid), finished</text>
  <text x="215" y="112" font-size="11" fill="currentColor">triangle (dashed)</text>
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
