---
title: Yardage and fat quarters
order: 110
summary: How much fabric a set of squares needs, from the bolt or in fat quarters.
---

Yardage depends on how pieces are cut from strips. The app plans whole strips across the usable
width of the fabric.

## The method

1. Work out the cut size of one piece (see [Squares and rectangles](/help/math/squares-and-rectangles)).
2. The strip is as wide as the cut size. **Pieces per strip = ⌊usable width ÷ cut size⌋.**
3. **Strips = ⌈pieces ÷ pieces per strip⌉.**
4. **Fabric = strips × strip width**, rounded up to your fabric step (⅛ yd or 10 cm by default).

Usable width is a little less than the printed width, since selvages are trimmed (a 42″ bolt gives
40″, 110 cm gives 105 cm).

## Fat quarters

A fat quarter is 18″ × 21″ (50 × 55 cm), with 20″ (53 cm) usable. Strips are packed into the 18″ (50
cm) depth. The calculator counts how many fat quarters the strips fit into.

<svg viewBox="0 0 330 130" width="495" role="img" aria-label="Fabric cut into strips across its usable width, each strip cut into squares, with leftover fabric below. One square is shown on its own with its finished size dashed and bracketed">
  <rect x="10" y="14" width="150" height="74" fill="#daa828" fill-opacity="0.35" stroke="currentColor" stroke-width="1.5"/>
  <rect x="10" y="14" width="144" height="18" fill="#daa828" stroke="currentColor"/>
  <line x1="28" y1="14" x2="28" y2="32" stroke="currentColor"/>
  <line x1="46" y1="14" x2="46" y2="32" stroke="currentColor"/>
  <line x1="64" y1="14" x2="64" y2="32" stroke="currentColor"/>
  <line x1="82" y1="14" x2="82" y2="32" stroke="currentColor"/>
  <line x1="100" y1="14" x2="100" y2="32" stroke="currentColor"/>
  <line x1="118" y1="14" x2="118" y2="32" stroke="currentColor"/>
  <line x1="136" y1="14" x2="136" y2="32" stroke="currentColor"/>
  <rect x="10" y="32" width="144" height="18" fill="#daa828" stroke="currentColor"/>
  <line x1="28" y1="32" x2="28" y2="50" stroke="currentColor"/>
  <line x1="46" y1="32" x2="46" y2="50" stroke="currentColor"/>
  <line x1="64" y1="32" x2="64" y2="50" stroke="currentColor"/>
  <line x1="82" y1="32" x2="82" y2="50" stroke="currentColor"/>
  <line x1="100" y1="32" x2="100" y2="50" stroke="currentColor"/>
  <line x1="118" y1="32" x2="118" y2="50" stroke="currentColor"/>
  <line x1="136" y1="32" x2="136" y2="50" stroke="currentColor"/>
  <rect x="10" y="50" width="144" height="18" fill="#daa828" stroke="currentColor"/>
  <line x1="28" y1="50" x2="28" y2="68" stroke="currentColor"/>
  <line x1="46" y1="50" x2="46" y2="68" stroke="currentColor"/>
  <line x1="64" y1="50" x2="64" y2="68" stroke="currentColor"/>
  <line x1="82" y1="50" x2="82" y2="68" stroke="currentColor"/>
  <line x1="100" y1="50" x2="100" y2="68" stroke="currentColor"/>
  <line x1="118" y1="50" x2="118" y2="68" stroke="currentColor"/>
  <line x1="136" y1="50" x2="136" y2="68" stroke="currentColor"/>
  <text x="85.0" y="82" font-size="11" fill="#333" text-anchor="middle">leftover</text>
  <line x1="10.0" y1="90.0" x2="10.0" y2="104.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="160.0" y1="90.0" x2="160.0" y2="104.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="10.0" y1="100.0" x2="160.0" y2="100.0" stroke="currentColor"/>
  <line x1="10.0" y1="104.0" x2="10.0" y2="96.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="160.0" y1="104.0" x2="160.0" y2="96.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="85.0" y="114.0" font-size="11" fill="currentColor" text-anchor="middle">usable width</text>
  <defs><marker id="dim-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs>
  <line x1="158" y1="23" x2="196" y2="40" stroke="currentColor" marker-end="url(#dim-arrow)"/>
  <rect x="205" y="20" width="60" height="60" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <rect x="211" y="26" width="48" height="48" fill="none" stroke="#333" stroke-dasharray="4 3"/>
  <line x1="211.0" y1="76.0" x2="211.0" y2="96.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="259.0" y1="76.0" x2="259.0" y2="96.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="211.0" y1="92.0" x2="259.0" y2="92.0" stroke="currentColor"/>
  <line x1="211.0" y1="96.0" x2="211.0" y2="88.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="259.0" y1="96.0" x2="259.0" y2="88.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="235.0" y="106.0" font-size="11" fill="currentColor" text-anchor="middle">finished square side</text>
</svg>

## Worked examples (40 squares)

| Finished | Cut    | Per strip | Strips | Fabric (bolt)              | Fat quarters |
| -------- | ------ | --------- | ------ | -------------------------- | ------------ |
| 3″       | 3½″    | 11        | 4      | 14″, rounded up to ½ yd    | 2            |
| 8 cm     | 9.5 cm | 11        | 4      | 38 cm, rounded up to 40 cm | 2            |

::calc yardage
