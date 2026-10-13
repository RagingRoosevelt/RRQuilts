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

<svg viewBox="0 0 230 120" width="345" role="img" aria-label="A quilt top of Mexican Cross II blocks centered on a larger gold backing, with overhang on every side">
  <defs><pattern id="mx-backing" patternUnits="userSpaceOnUse" x="25" y="25" width="30" height="30"><polygon points="8.64,15.0 10.76,17.12 12.88,15.0 10.76,12.88" fill="#c4282c"/><polygon points="10.76,12.88 12.88,15.0 15.0,12.88 12.88,10.76" fill="#5a78a0"/><polygon points="12.88,10.76 15.0,12.88 17.12,10.76 15.0,8.64" fill="#c4282c"/><polygon points="10.76,17.12 12.88,19.24 15.0,17.12 12.88,15.0" fill="#5a78a0"/><polygon points="12.88,15.0 15.0,17.12 17.12,15.0 15.0,12.88" fill="#c4282c"/><polygon points="15.0,12.88 17.12,15.0 19.24,12.88 17.12,10.76" fill="#5a78a0"/><polygon points="12.88,19.24 15.0,21.36 17.12,19.24 15.0,17.12" fill="#c4282c"/><polygon points="15.0,17.12 17.12,19.24 19.24,17.12 17.12,15.0" fill="#5a78a0"/><polygon points="17.12,15.0 19.24,17.12 21.36,15.0 19.24,12.88" fill="#c4282c"/><polygon points="19.24,17.12 30.0,27.88 30.0,30.0 27.88,30.0 17.12,19.24" fill="#f4ecd8"/><polygon points="12.88,19.24 2.12,30.0 0.0,30.0 0.0,27.88 10.76,17.12" fill="#f4ecd8"/><polygon points="10.76,12.88 0.0,2.12 0.0,0.0 2.12,0.0 12.88,10.76" fill="#f4ecd8"/><polygon points="17.12,10.76 27.88,0.0 30.0,0.0 30.0,2.12 19.24,12.88" fill="#f4ecd8"/><polygon points="23.64,30.0 15.0,21.36 17.12,19.24 23.64,25.76" fill="#5a78a0"/><polygon points="0.0,23.64 8.64,15.0 10.76,17.12 4.24,23.64" fill="#5a78a0"/><polygon points="6.36,0.0 15.0,8.64 12.88,10.76 6.36,4.24" fill="#5a78a0"/><polygon points="30.0,6.36 21.36,15.0 19.24,12.88 25.76,6.36" fill="#5a78a0"/><polygon points="21.36,15.0 30.0,23.64 25.76,23.64 19.24,17.12" fill="#5a78a0"/><polygon points="15.0,21.36 6.36,30.0 6.36,25.76 12.88,19.24" fill="#5a78a0"/><polygon points="8.64,15.0 0.0,6.36 4.24,6.36 10.76,12.88" fill="#5a78a0"/><polygon points="15.0,8.64 23.64,0.0 23.64,4.24 17.12,10.76" fill="#5a78a0"/><polygon points="27.88,30.0 23.64,30.0 23.64,25.76" fill="#c4282c"/><polygon points="0.0,27.88 0.0,23.64 4.24,23.64" fill="#c4282c"/><polygon points="2.12,0.0 6.36,0.0 6.36,4.24" fill="#c4282c"/><polygon points="30.0,2.12 30.0,6.36 25.76,6.36" fill="#c4282c"/><polygon points="30.0,23.64 30.0,27.88 25.76,23.64" fill="#c4282c"/><polygon points="6.36,30.0 2.12,30.0 6.36,25.76" fill="#c4282c"/><polygon points="0.0,6.36 0.0,2.12 4.24,6.36" fill="#c4282c"/><polygon points="23.64,0.0 27.88,0.0 23.64,4.24" fill="#c4282c"/><polygon points="23.64,30.0 6.36,30.0 15.0,21.36" fill="#96c4e8"/><polygon points="0.0,23.64 0.0,6.36 8.64,15.0" fill="#96c4e8"/><polygon points="6.36,0.0 23.64,0.0 15.0,8.64" fill="#96c4e8"/><polygon points="30.0,6.36 30.0,23.64 21.36,15.0" fill="#96c4e8"/></pattern></defs>
  <rect x="10" y="10" width="120" height="90" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <rect x="25" y="25" width="90" height="60" fill="url(#mx-backing)" stroke="currentColor" stroke-width="1.5"/>
  <rect x="142" y="41" width="12" height="12" fill="#c4282c" stroke="currentColor"/>
  <text x="160" y="51" font-size="11" fill="currentColor">quilt top</text>
  <rect x="142" y="61" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="160" y="71" font-size="11" fill="currentColor">backing</text>
</svg>

## Worked examples

| Quilt        | Backing      | Panels (40″ / 105 cm usable)              | Fabric        |
| ------------ | ------------ | ----------------------------------------- | ------------- |
| 60″ × 72″    | 68″ × 80″    | 2 side to side, 2 × 68 = 136″ (vs 160″)   | 139½″ = 3⅞ yd |
| 150 × 180 cm | 170 × 200 cm | 2 side to side, 2 × 170 = 340 cm (vs 400) | 340 cm        |

::calc backing
