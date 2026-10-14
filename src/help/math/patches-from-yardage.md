---
title: Patches from yardage and fat quarters
order: 110
summary: How much fabric a set of patches needs, from the bolt or in fat quarters.
---

Yardage depends on how pieces are cut from strips. The app plans whole strips across the usable
width of the fabric.

## The method

1. Work out the cut size of one patch (see [Squares and rectangles](/help/math/squares-and-rectangles)).
2. The strip is as wide as the patch's shorter cut side, and the patches lie along it. **Patches per
   strip = ⌊usable width ÷ longer cut side⌋.** The rest of each strip is left over.
3. **Strips = ⌈patches ÷ patches per strip⌉.**
4. **Fabric = strips × strip width**, rounded up to your fabric step (⅛ yd or 10 cm by default).

Usable width is a little less than the printed width, since selvages are trimmed (a 42″ bolt gives
40″, 110 cm gives 105 cm).

## Fat quarters

A fat quarter is 18″ × 21″ (50 × 55 cm), with 20″ (53 cm) usable. Strips are packed into the 18″ (50
cm) depth. The calculator counts how many fat quarters the strips fit into.

<svg viewBox="0 0 500 135" width="750" role="img" aria-label="Fabric with three strips marked across its usable width and the leftover below, the three strips cut apart with the first cut into patches and a leftover end, and one patch with its finished length and width bracketed">
  <rect x="10" y="14" width="150" height="90" fill="#daa828" fill-opacity="0.35" stroke="currentColor" stroke-width="1.5"/>
  <rect x="10" y="14" width="150" height="24" fill="#daa828" stroke="currentColor"/>
  <rect x="10" y="38" width="150" height="24" fill="#daa828" stroke="currentColor"/>
  <rect x="10" y="62" width="150" height="24" fill="#daa828" stroke="currentColor"/>
  <text x="85.0" y="99" font-size="11" fill="#333" text-anchor="middle">leftover</text>
  <line x1="10.0" y1="106.0" x2="10.0" y2="120.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="160.0" y1="106.0" x2="160.0" y2="120.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="10.0" y1="116.0" x2="160.0" y2="116.0" stroke="currentColor"/>
  <line x1="10.0" y1="120.0" x2="10.0" y2="112.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="160.0" y1="120.0" x2="160.0" y2="112.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="85.0" y="130.0" font-size="11" fill="currentColor" text-anchor="middle">usable width</text>
  <defs><marker id="dim-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs>
  <line x1="166" y1="54" x2="184" y2="54" stroke="currentColor" marker-end="url(#dim-arrow)"/>
  <rect x="190" y="14" width="150" height="24" fill="#daa828" stroke="currentColor"/>
  <rect x="190" y="44" width="150" height="24" fill="#daa828" stroke="currentColor"/>
  <rect x="190" y="74" width="150" height="24" fill="#daa828" stroke="currentColor"/>
  <line x1="222" y1="14" x2="222" y2="38" stroke="currentColor"/>
  <line x1="254" y1="14" x2="254" y2="38" stroke="currentColor"/>
  <line x1="286" y1="14" x2="286" y2="38" stroke="currentColor"/>
  <rect x="318" y="14" width="22" height="24" fill="#f6e7bd" stroke="currentColor"/>
  <text x="265.0" y="114" font-size="11" fill="currentColor" text-anchor="middle">strips, cut into patches</text>
  <line x1="346" y1="26.0" x2="364" y2="26.0" stroke="currentColor" marker-end="url(#dim-arrow)"/>
  <rect x="370" y="14" width="32" height="24" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <rect x="373" y="17" width="26" height="18" fill="none" stroke="#333" stroke-dasharray="4 3"/>
  <line x1="373.0" y1="37.0" x2="373.0" y2="52.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="399.0" y1="37.0" x2="399.0" y2="52.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="373.0" y1="48.0" x2="399.0" y2="48.0" stroke="currentColor"/>
  <line x1="373.0" y1="52.0" x2="373.0" y2="44.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="399.0" y1="52.0" x2="399.0" y2="44.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="386.0" y="62.0" font-size="11" fill="currentColor" text-anchor="middle">finished length</text>
  <line x1="401.0" y1="17.0" x2="416.0" y2="17.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="401.0" y1="35.0" x2="416.0" y2="35.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="412.0" y1="17.0" x2="412.0" y2="35.0" stroke="currentColor"/>
  <line x1="408.0" y1="17.0" x2="416.0" y2="17.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="408.0" y1="35.0" x2="416.0" y2="35.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="418.0" y="30.0" font-size="11" fill="currentColor">finished width</text>
  <text x="386.0" y="90" font-size="11" fill="currentColor" text-anchor="middle">one patch</text>
</svg>

## Worked examples (40 patches)

| Finished  | Cut           | Per strip (bolt) | Strips | Fabric (bolt)                | Fat quarters       |
| --------- | ------------- | ---------------- | ------ | ---------------------------- | ------------------ |
| 4″ × 2″   | 4½″ × 2½″     | 8                | 5      | 12½″, rounded up to ⅜ yd     | 2 (10 strips of 4) |
| 10 × 5 cm | 11.5 × 6.5 cm | 9                | 5      | 32.5 cm, rounded up to 40 cm | 2 (10 strips of 4) |

::calc yardage
