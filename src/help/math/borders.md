---
title: Borders
order: 80
summary: Straight and mitered border strips, and why a mitered strip is longer.
---

Borders frame the quilt. The calculator gives both kinds for a quilt of a given size (before the
border) and border width. All three are finished sizes, without seam allowances. To get the quilt's
finished size, measure the center edge to edge and subtract two seam allowances. The calculator adds
the seam allowances to the strips.

## Straight borders

Sew the **sides** first, each as long as the quilt is tall. Then sew the **top and bottom**, which
are as long as the quilt is wide _plus both side borders_.

> **sides = quilt height × border width**
> **top and bottom = (quilt width + 2 × border width) × border width**

Each is then cut with a seam allowance added on every edge, so finished + 2 × SA, like any
[rectangle](/help/math/squares-and-rectangles). SA is the [seam allowance](/help/math/seam-allowance).

## Mitered borders

The corners join at 45°. Each strip's finished **long edge** (the outer edge) reaches the quilt's
outer corner:

> **long edge = quilt side + 2 × border width**

The cut length then adds **SA × (1 + √2) at each end**, a total of **2(1 + √2) × SA**:

- **SA × √2** for the seam allowance on the 45° seam. The seam allowance is measured at right angles
  to the diagonal, but the strip's edge meets it at 45°, so it stretches by 1 ÷ sin 45° = √2.
- **SA** for the seam allowance on the border's outer edge, which pushes the strip's edge out, and so the
  diagonal's end point along the edge, by one more SA.

<svg viewBox="0 0 345 170" width="517" role="img" aria-label="A quilt center with a mitered border all around. Brackets mark the width and height before the border and the border width">
  <rect x="22" y="26" width="156" height="104" fill="#daa828" stroke="currentColor" stroke-width="1.5"/>
  <rect x="40" y="44" width="120" height="68" style="fill: var(--q-primary)" stroke="currentColor" stroke-width="1.5"/>
  <line x1="22" y1="26" x2="40" y2="44" stroke="currentColor"/>
  <line x1="178" y1="26" x2="160" y2="44" stroke="currentColor"/>
  <line x1="22" y1="130" x2="40" y2="112" stroke="currentColor"/>
  <line x1="178" y1="130" x2="160" y2="112" stroke="currentColor"/>
  <line x1="40.0" y1="114.0" x2="40.0" y2="148.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="160.0" y1="114.0" x2="160.0" y2="148.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="40.0" y1="144.0" x2="160.0" y2="144.0" stroke="currentColor"/>
  <line x1="40.0" y1="148.0" x2="40.0" y2="140.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="160.0" y1="148.0" x2="160.0" y2="140.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="100.0" y="158.0" font-size="11" fill="currentColor" text-anchor="middle">finished width, no border</text>
  <line x1="162.0" y1="44.0" x2="196.0" y2="44.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="162.0" y1="112.0" x2="196.0" y2="112.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="192.0" y1="44.0" x2="192.0" y2="112.0" stroke="currentColor"/>
  <line x1="188.0" y1="44.0" x2="196.0" y2="44.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="188.0" y1="112.0" x2="196.0" y2="112.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="198.0" y="82.0" font-size="11" fill="currentColor">finished height, no border</text>
  <line x1="102.0" y1="26.0" x2="104.0" y2="26.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="102.0" y1="44.0" x2="104.0" y2="44.0" stroke="currentColor" stroke-width="0.75" opacity="0.7"/>
  <line x1="100.0" y1="26.0" x2="100.0" y2="44.0" stroke="currentColor"/>
  <line x1="96.0" y1="26.0" x2="104.0" y2="26.0" stroke="currentColor" stroke-width="1.5"/>
  <line x1="96.0" y1="44.0" x2="104.0" y2="44.0" stroke="currentColor" stroke-width="1.5"/>
  <text x="100.0" y="20" font-size="11" fill="currentColor" text-anchor="middle">finished border width</text>
  <rect x="222" y="104" width="12" height="12" style="fill: var(--q-primary)" stroke="currentColor"/>
  <text x="240" y="114" font-size="11" fill="currentColor">quilt center</text>
  <rect x="222" y="122" width="12" height="12" fill="#daa828" stroke="currentColor"/>
  <text x="240" y="132" font-size="11" fill="currentColor">border, mitered</text>
</svg>

The **Extra length on mitered strips** setting (default 2″ / 5 cm) adds more, so you can trim after
sewing the miter. Set it to 0 to cut exact.

## Worked examples (quilt 48″ × 60″, 4″ border, 120 × 150 cm, 10 cm border)

| Strip               | Inches (SA = ¼″, extra 2″)                | Centimeters (SA = 7.5 mm, extra 5 cm)       |
| ------------------- | ----------------------------------------- | ------------------------------------------- |
| Straight sides      | 2 × 60½″ × 4½″                            | 2 × 151.5 × 11.5 cm                         |
| Straight top/bottom | 2 × 56½″ × 4½″                            | 2 × 141.5 × 11.5 cm                         |
| Mitered sides       | 2 × 71¼″ × 4½″ (68 + 1.207 + 2 = 71.207″) | 2 × 179 × 11.5 cm (170 + 3.62 + 5 = 178.62) |
| Mitered top/bottom  | 2 × 59¼″ × 4½″ (56 + 1.207 + 2 = 59.207″) | 2 × 149 × 11.5 cm (140 + 3.62 + 5 = 148.62) |

::calc border
