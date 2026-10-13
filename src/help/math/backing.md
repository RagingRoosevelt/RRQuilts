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

<svg viewBox="0 0 230 90" width="345" role="img" aria-label="A quilt top of two Mexican Cross II blocks centered on a larger gold backing, with overhang on every side">
  <defs><pattern id="mx-backing" patternUnits="userSpaceOnUse" x="25" y="25" width="40" height="40"><polygon points="11.51,20.0 14.34,22.83 17.17,20.0 14.34,17.17" fill="#c4282c"/><polygon points="14.34,17.17 17.17,20.0 20.0,17.17 17.17,14.34" fill="#5a78a0"/><polygon points="17.17,14.34 20.0,17.17 22.83,14.34 20.0,11.51" fill="#c4282c"/><polygon points="14.34,22.83 17.17,25.66 20.0,22.83 17.17,20.0" fill="#5a78a0"/><polygon points="17.17,20.0 20.0,22.83 22.83,20.0 20.0,17.17" fill="#c4282c"/><polygon points="20.0,17.17 22.83,20.0 25.66,17.17 22.83,14.34" fill="#5a78a0"/><polygon points="17.17,25.66 20.0,28.49 22.83,25.66 20.0,22.83" fill="#c4282c"/><polygon points="20.0,22.83 22.83,25.66 25.66,22.83 22.83,20.0" fill="#5a78a0"/><polygon points="22.83,20.0 25.66,22.83 28.49,20.0 25.66,17.17" fill="#c4282c"/><polygon points="25.66,22.83 40.0,37.17 40.0,40.0 37.17,40.0 22.83,25.66" fill="#f4ecd8"/><polygon points="17.17,25.66 2.83,40.0 0.0,40.0 0.0,37.17 14.34,22.83" fill="#f4ecd8"/><polygon points="14.34,17.17 0.0,2.83 0.0,0.0 2.83,0.0 17.17,14.34" fill="#f4ecd8"/><polygon points="22.83,14.34 37.17,0.0 40.0,0.0 40.0,2.83 25.66,17.17" fill="#f4ecd8"/><polygon points="31.51,40.0 20.0,28.49 22.83,25.66 31.51,34.34" fill="#5a78a0"/><polygon points="0.0,31.51 11.51,20.0 14.34,22.83 5.66,31.51" fill="#5a78a0"/><polygon points="8.49,0.0 20.0,11.51 17.17,14.34 8.49,5.66" fill="#5a78a0"/><polygon points="40.0,8.49 28.49,20.0 25.66,17.17 34.34,8.49" fill="#5a78a0"/><polygon points="28.49,20.0 40.0,31.51 34.34,31.51 25.66,22.83" fill="#5a78a0"/><polygon points="20.0,28.49 8.49,40.0 8.49,34.34 17.17,25.66" fill="#5a78a0"/><polygon points="11.51,20.0 0.0,8.49 5.66,8.49 14.34,17.17" fill="#5a78a0"/><polygon points="20.0,11.51 31.51,0.0 31.51,5.66 22.83,14.34" fill="#5a78a0"/><polygon points="37.17,40.0 31.51,40.0 31.51,34.34" fill="#c4282c"/><polygon points="0.0,37.17 0.0,31.51 5.66,31.51" fill="#c4282c"/><polygon points="2.83,0.0 8.49,0.0 8.49,5.66" fill="#c4282c"/><polygon points="40.0,2.83 40.0,8.49 34.34,8.49" fill="#c4282c"/><polygon points="40.0,31.51 40.0,37.17 34.34,31.51" fill="#c4282c"/><polygon points="8.49,40.0 2.83,40.0 8.49,34.34" fill="#c4282c"/><polygon points="0.0,8.49 0.0,2.83 5.66,8.49" fill="#c4282c"/><polygon points="31.51,0.0 37.17,0.0 31.51,5.66" fill="#c4282c"/><polygon points="31.51,40.0 8.49,40.0 20.0,28.49" fill="#96c4e8"/><polygon points="0.0,31.51 0.0,8.49 11.51,20.0" fill="#96c4e8"/><polygon points="8.49,0.0 31.51,0.0 20.0,11.51" fill="#96c4e8"/><polygon points="40.0,8.49 40.0,31.51 28.49,20.0" fill="#96c4e8"/></pattern></defs>
  <rect x="10" y="10" width="110" height="70" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <rect x="25" y="25" width="80" height="40" fill="url(#mx-backing)" stroke="currentColor" stroke-width="1.5"/>
  <rect x="132" y="27" width="12" height="12" fill="#c4282c" stroke="currentColor"/>
  <text x="150" y="37" font-size="11" fill="currentColor">quilt top</text>
  <rect x="132" y="47" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="150" y="57" font-size="11" fill="currentColor">backing</text>
</svg>

## Worked examples

| Quilt        | Backing      | Panels (40″ / 105 cm usable)              | Fabric        |
| ------------ | ------------ | ----------------------------------------- | ------------- |
| 60″ × 72″    | 68″ × 80″    | 2 side to side, 2 × 68 = 136″ (vs 160″)   | 139½″ = 3⅞ yd |
| 150 × 180 cm | 170 × 200 cm | 2 side to side, 2 × 170 = 340 cm (vs 400) | 340 cm        |

::calc backing
