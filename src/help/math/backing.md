---
title: Backing
order: 100
summary: Fabric for the back, with an overhang, pieced the cheaper way.
---

The backing is cut bigger than the quilt top. Quilting draws the layers in a little and they can
shift, so the extra keeps the back from coming up short. For hand or home-machine quilting, 2″ to 4″
(5 to 10 cm) on each side is common. A longarm needs more, because the backing is clamped to the
frame. Ask your longarm quilter, who often wants 4″ to 6″ (10 to 15 cm). The backing size is the
quilt plus this **overhang** on each side (default 4″ / 10 cm, set as **Backing extra per side** in
the Print tab's **Fabric** options).

## The formula

> **backing size = (quilt width + 2 × overhang) × (quilt height + 2 × overhang)**

If that is wider than the fabric's usable width, panels are sewn together. The calculator tries both
directions and picks the one that needs less fabric:

- panels running top to bottom: **⌈backing width ÷ usable width⌉ × backing height**
- panels running side to side: **⌈backing height ÷ usable width⌉ × backing width**

The result is rounded up to your fabric step (⅛ yd or 10 cm by default).

<svg viewBox="0 0 230 120" width="345" role="img" aria-label="A quilt top (orange) centered on a larger backing (blue), with overhang on every side">
  <rect x="10" y="10" width="120" height="100" fill="#4a90c2" fill-opacity="0.45" stroke="currentColor" stroke-width="1.5"/>
  <rect x="25" y="25" width="90" height="70" fill="#d9822b" fill-opacity="0.85" stroke="currentColor" stroke-width="1.5"/>
  <rect x="142" y="41" width="12" height="12" fill="#d9822b" fill-opacity="0.85" stroke="currentColor"/>
  <text x="160" y="51" font-size="11" fill="currentColor">quilt top</text>
  <rect x="142" y="61" width="12" height="12" fill="#4a90c2" fill-opacity="0.45" stroke="currentColor"/>
  <text x="160" y="71" font-size="11" fill="currentColor">backing</text>
</svg>

## Worked examples

| Quilt        | Backing      | Panels (40″ / 105 cm usable)              | Fabric        |
| ------------ | ------------ | ----------------------------------------- | ------------- |
| 60″ × 72″    | 68″ × 80″    | 2 side to side, 2 × 68 = 136″ (vs 160″)   | 139½″ = 3⅞ yd |
| 150 × 180 cm | 170 × 200 cm | 2 side to side, 2 × 170 = 340 cm (vs 400) | 340 cm        |

::calc backing
