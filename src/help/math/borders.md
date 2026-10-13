---
title: Borders
order: 80
summary: Straight and mitered border strips, and why a mitered strip is longer.
---

Borders frame the quilt. The calculator gives both kinds for a quilt of a given size (before the
border) and border width.

## Straight borders

Sew the **sides** first: each is as long as the quilt is tall. Then sew the **top and bottom**, which
are as long as the quilt is wide _plus both side borders_.

> **sides = quilt height × border width**
> **top and bottom = (quilt width + 2 × border width) × border width**

Each is then cut with a seam allowance added on every edge: finished + 2s, like any
[rectangle](/help/math/squares-and-rectangles).

## Mitered borders

The corners join at 45°. Each strip's finished **long edge** (the outer edge) reaches the quilt's
outer corner:

> **long edge = quilt side + 2 × border width**

The cut length then adds **s × (1 + √2) at each end**, a total of **2(1 + √2)s**:

- **s × √2** for the seam allowance on the 45° seam. The seam allowance is measured at right angles
  to the diagonal, but the strip's edge meets it at 45°, so it stretches by 1 ÷ sin 45° = √2.
- **s** for the seam allowance on the border's outer edge, which pushes the strip's edge out, and so the
  diagonal's end point along the edge, by one more s.

<svg viewBox="0 0 220 110" width="330" role="img" aria-label="A mitered border strip: a trapezoid with 45 degree ends, its seam allowance beyond the finished corner">
  <polygon points="10,10 150,10 130,40 30,40" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="20,10 140,10 124,34 36,34" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>
  <text x="160" y="25" font-size="11" fill="currentColor">dashed: finished</text>
  <text x="160" y="42" font-size="11" fill="currentColor">solid: cut, longer</text>
</svg>

The **Extra length on mitered strips** setting (default 2″ / 5 cm) adds more, so you can trim after
sewing the miter. Set it to 0 to cut exact.

## Worked examples (quilt 48″ × 60″, 4″ border, 120 × 150 cm, 10 cm border)

| Strip               | Inches (s = ¼″, extra 2″)                 | Centimeters (s = 7.5 mm, extra 5 cm)        |
| ------------------- | ----------------------------------------- | ------------------------------------------- |
| Straight sides      | 2 × 60½″ × 4½″                            | 2 × 151.5 × 11.5 cm                         |
| Straight top/bottom | 2 × 56½″ × 4½″                            | 2 × 141.5 × 11.5 cm                         |
| Mitered sides       | 2 × 71¼″ × 4½″ (68 + 1.207 + 2 = 71.207″) | 2 × 179 × 11.5 cm (170 + 3.62 + 5 = 178.62) |
| Mitered top/bottom  | 2 × 59¼″ × 4½″ (56 + 1.207 + 2 = 59.207″) | 2 × 149 × 11.5 cm (140 + 3.62 + 5 = 148.62) |

::calc border
