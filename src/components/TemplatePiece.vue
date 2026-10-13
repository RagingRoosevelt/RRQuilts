<template>
  <!-- One template in its own coordinates (project units): cutting line, sewing line, grain, label. -->
  <g>
    <path
      v-if="look.tint && piece.tint"
      :d="path(piece.sew)"
      :fill="piece.tint"
      fill-opacity="0.25"
      stroke="none"
    />
    <path
      v-if="look.shade"
      :d="`${path(piece.cut)} ${path(piece.sew)}`"
      fill="rgba(0,0,0,0.1)"
      fill-rule="evenodd"
      stroke="none"
    />
    <path
      :d="path(piece.cut)"
      fill="none"
      stroke="#000"
      :stroke-width="look.stroke"
      :stroke-dasharray="look.cutLine === 'dashed' ? dash(6) : undefined"
    />
    <path
      v-if="look.sewLine !== 'none'"
      :d="path(piece.sew)"
      fill="none"
      stroke="#000"
      :stroke-width="look.stroke * 0.7"
      :stroke-dasharray="
        look.sewLine === 'dashed' ? dash(3) : look.sewLine === 'dotted' ? dash(0.8) : undefined
      "
    />
    <template v-if="look.marks">
      <line
        v-for="(m, i) in piece.marks"
        :key="i"
        :x1="m.p[0] - m.n[0] * look.markLength * 0.4"
        :y1="m.p[1] - m.n[1] * look.markLength * 0.4"
        :x2="m.p[0] + m.n[0] * look.markLength"
        :y2="m.p[1] + m.n[1] * look.markLength"
        stroke="#000"
        :stroke-width="look.stroke * 1.4"
      />
    </template>
    <g v-if="look.grain && piece.grainLength > 0">
      <line
        :x1="end(-1)[0]"
        :y1="end(-1)[1]"
        :x2="end(1)[0]"
        :y2="end(1)[1]"
        stroke="#000"
        :stroke-width="look.stroke * 0.7"
      />
      <path :d="head(1)" fill="#000" />
      <path :d="head(-1)" fill="#000" />
    </g>
    <text
      v-if="seamSpot"
      :transform="`translate(${seamSpot.x} ${seamSpot.y}) rotate(${seamSpot.deg})`"
      :font-size="seamSpot.size"
      text-anchor="middle"
      dominant-baseline="central"
    >
      {{ look.seamText }}
    </text>
    <g v-if="scaleSquare">
      <rect
        :x="piece.center[0] - scaleSquare / 2"
        :y="stack.squareY"
        :width="scaleSquare"
        :height="scaleSquare"
        fill="none"
        stroke="#000"
        :stroke-width="look.stroke"
      />
      <text
        :x="piece.center[0]"
        :y="stack.squareY + scaleSquare / 2 + squareFont * 0.35"
        :font-size="squareFont"
        text-anchor="middle"
      >
        {{ fmt?.(scaleSquare) }}
      </text>
    </g>
    <template v-if="stack.lines.length">
      <text
        v-for="(line, i) in stack.lines"
        :key="i"
        :x="piece.center[0]"
        :y="line.y"
        :font-size="line.size"
        :font-weight="line.bold ? 'bold' : undefined"
        text-anchor="middle"
      >
        {{ line.text }}
      </text>
    </template>
    <text
      v-if="caption.length"
      :x="bounds[0]"
      :y="bounds[3] + look.font * 1.3 * captionK"
      :font-size="look.font * 0.85"
    >
      <tspan v-for="(c, i) in caption" :key="i" :font-size="look.font * 0.85 * c.k">{{
        c.text
      }}</tspan>
    </text>
    <!-- Color key off: a pill per fabric under the template -->
    <g v-for="p in pills" :key="p.n" :transform="`translate(${p.x} ${pillY + p.y})`">
      <rect
        :width="p.w"
        :height="look.font * 1.2"
        :rx="look.font * 0.6"
        fill="none"
        stroke="#666"
        :stroke-width="look.stroke * 0.7"
      />
      <rect
        :x="look.font * 0.35"
        :y="look.font * 0.3"
        :width="look.font * 0.6"
        :height="look.font * 0.6"
        :fill="p.css"
        stroke="#000"
        :stroke-width="look.stroke * 0.5"
      />
      <text :x="look.font * 1.15" :y="look.font * 0.85" :font-size="look.font * 0.75">
        {{ p.pill }}
      </text>
    </g>
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { pointInPolygon, type Pt } from '@/model/geometry/path';
import { pillWidth, wrapPills } from '@/model/print/pack';
import type { PlacedPiece } from '@/model/print/pieces';

const props = defineProps<{
  piece: PlacedPiece;
  look: {
    stroke: number;
    font: number;
    cutLine: string;
    sewLine: string;
    grain: boolean;
    shade: boolean;
    marks: boolean;
    markLength: number;
    labels: { letter: boolean; counts: boolean; size: boolean; color: boolean };
    tint: boolean;
    square?: { sizes: number[]; big: number; bigAt: number } | undefined;
    /** Seam allowance to label in the band between the lines (0 = no label), and the label. */
    seam?: number;
    seamText?: string;
  };
  /** Formats a length for the scale square's label. */
  fmt?: (x: number) => string;
}>();

const path = (poly: Pt[]) => (poly.length ? `M${poly.map((p) => p.join(' ')).join('L')}Z` : '');
const dash = (k: number) => `${props.look.stroke * k} ${props.look.stroke * k}`;
const bounds = computed(() => {
  const xs = props.piece.cut.map((p) => p[0]);
  const ys = props.piece.cut.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] as const;
});
// A finished size with an approximation ("3.333″ (~ 3 5/16″)") is long: it goes small and the cut
// count large, so what to cut stays easy to read.
const approx = computed(() => props.piece.size.includes('(~'));
const sizeK = computed(() => (approx.value ? 0.75 : 1));
const noteK = computed(() => (approx.value ? 1.35 : 1));
/** Unchecked labels print under the template: "B · 3″ legs · Cut 72 Cream", each at its size. */
const caption = computed(() => {
  const l = props.look.labels;
  return [
    l.letter ? null : { text: props.piece.letter, k: 1 },
    l.size ? null : { text: props.piece.size, k: sizeK.value },
    l.counts ? null : { text: props.piece.note, k: noteK.value },
  ]
    .filter((x) => !!x?.text)
    .map((x, i) => ({ ...x!, text: i ? ` · ${x!.text}` : x!.text }));
});
const captionK = computed(() => Math.max(1, ...caption.value.map((x) => x.k)));
/** Fabric pills (color key unchecked), laid left to right under the caption. */
const pillY = computed(
  () =>
    bounds.value[3] + props.look.font * (caption.value.length ? 0.6 + 1.3 * captionK.value : 0.4),
);
const pills = computed(() => {
  if (props.look.labels.color) return [];
  const f = props.look.font;
  const widths = props.piece.fabrics.map((p) => pillWidth(p.pill ?? '', f));
  const at = wrapPills(widths, bounds.value[2] - bounds.value[0], f * 0.3);
  return props.piece.fabrics.map((p, i) => ({
    ...p,
    x: bounds.value[0] + at[i]!.x,
    y: at[i]!.row * f * 1.5,
    w: widths[i]!,
  }));
});
/** Checked notes, printed on the template: finished size, then what to cut. */
const insideLines = computed(() => {
  const l = props.look.labels;
  return [
    l.size ? { text: `Finished ${props.piece.size}`, em: 0.9 * sizeK.value } : null,
    l.counts ? { text: props.piece.note, em: 0.9 * noteK.value } : null,
  ].filter((x) => !!x?.text) as { text: string; em: number }[];
});
/**
 * Letter and notes stacked at the roomiest spot inside the sewing line, shrunk to fit when the piece
 * is small (width estimated at 0.55 em per character).
 */
const stack = computed(() => {
  const f = props.look.font;
  const sq = scaleSquare.value;
  const room = props.piece.room * 1.9;
  const rows = [
    ...(props.look.labels.letter ? [{ text: props.piece.letter, em: 1.6, bold: true }] : []),
    ...insideLines.value.map((x) => ({ ...x, bold: false })),
  ];
  const arrow = props.look.grain && props.piece.grainLength > 0 ? 1.2 : 0;
  const height = (rows.reduce((a, x) => a + x.em * 1.15, 0) + arrow) * f;
  const width = Math.max(0, ...rows.map((x) => x.text.length * 0.55 * x.em)) * f;
  // The scale square keeps its size; the text shrinks around it.
  const below = sq ? sq + f * 0.4 : 0;
  const k = Math.max(0, Math.min(1, (room - below) / (height || 1), room / (width || 1)));
  let y = props.piece.center[1] - (height * k + below) / 2 + arrow * f * k;
  const lines = rows.map((x) => {
    y += x.em * 1.15 * f * k;
    return { text: x.text, size: x.em * f * k, bold: x.bold, y: y - x.em * 0.25 * f * k };
  });
  const top = props.piece.center[1] - (height * k + below) / 2;
  return { lines, top, k, width: width * k, squareY: top + height * k + (below - sq) };
});

/** The scale square's side: the largest offered that fits the label room (big on big pieces). */
const scaleSquare = computed(() => {
  const s = props.look.square;
  if (!s) return 0;
  const xs = props.piece.sew.map((p) => p[0]);
  const ys = props.piece.sew.map((p) => p[1]);
  const side = Math.min(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  const fits = (q: number) => q <= props.piece.room * 0.9;
  if (side >= s.bigAt - 1e-6 && fits(s.big)) return s.big;
  // ponytail: a piece too small for the smallest square gets none.
  return s.sizes.find(fits) ?? 0;
});

/** "SA = ¼″" along the longest sewing edge, centered in the seam allowance and reading upright. */
const seamSpot = computed(() => {
  const s = props.look.seam ?? 0;
  const text = props.look.seamText ?? '';
  const sew = props.piece.sew;
  if (!s || sew.length < 3) return undefined;
  const size = Math.min(props.look.font * 0.7, s * 0.7);
  // Longest edge; between equal ones, the most level (reads without turning the page).
  let best: { a: Pt; b: Pt; L: number; score: number } | undefined;
  sew.forEach((a, i) => {
    const b = sew[(i + 1) % sew.length]!;
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const score = L * (1 + (0.01 * Math.abs(b[0] - a[0])) / (L || 1));
    if (!best || score > best.score) best = { a, b, L, score };
  });
  if (!best || best.L < text.length * 0.55 * size * 1.3) return undefined;
  const { a, b, L } = best;
  const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let n: Pt = [(b[1] - a[1]) / L, -(b[0] - a[0]) / L];
  if (pointInPolygon([mid[0] + n[0] * s * 0.1, mid[1] + n[1] * s * 0.1], sew)) n = [-n[0], -n[1]];
  let deg = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  if (deg > 90) deg -= 180;
  else if (deg <= -90) deg += 180;
  return { x: mid[0] + (n[0] * s) / 2, y: mid[1] + (n[1] * s) / 2, deg, size };
});

const squareFont = computed(() => Math.min(props.look.font * 0.7, scaleSquare.value * 0.4));

/** Arrow ends along the grain, through the label's center (offset below the letter). */
const end = (s: 1 | -1): Pt => {
  const c = props.piece.center;
  const [gx, gy] = props.piece.grain;
  const L = props.piece.grainLength / 2;
  const { top, k, width } = stack.value;
  // Across the piece: above the labels; up and down: beside them.
  const at: Pt =
    Math.abs(gy) > Math.abs(gx)
      ? [c[0] - width / 2 - props.look.font * 0.8 * k, c[1]]
      : [c[0], top + props.look.font * 0.5 * k];
  return [at[0] + s * gx * L, at[1] + s * gy * L];
};
function head(s: 1 | -1) {
  const [x, y] = end(s);
  const [gx, gy] = props.piece.grain;
  const k = props.look.font * 0.5;
  const bx = x - s * gx * k;
  const by = y - s * gy * k;
  return `M${x} ${y}L${bx - gy * k * 0.5} ${by + gx * k * 0.5}L${bx + gy * k * 0.5} ${by - gx * k * 0.5}Z`;
}
</script>
