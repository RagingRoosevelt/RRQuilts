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
      v-if="caption"
      :x="bounds[0]"
      :y="bounds[3] + look.font * 1.3"
      :font-size="look.font * 0.85"
    >
      {{ caption }}
    </text>
    <!-- Color key off: a pill per fabric under the template -->
    <g v-for="p in pills" :key="p.n" :transform="`translate(${p.x} ${pillY})`">
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
        {{ p.n }} · {{ p.name }}
      </text>
    </g>
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Pt } from '@/model/geometry/path';
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
  };
}>();

const path = (poly: Pt[]) => (poly.length ? `M${poly.map((p) => p.join(' ')).join('L')}Z` : '');
const dash = (k: number) => `${props.look.stroke * k} ${props.look.stroke * k}`;
const bounds = computed(() => {
  const xs = props.piece.cut.map((p) => p[0]);
  const ys = props.piece.cut.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] as const;
});
/** Unchecked labels print under the template: "B · 3″ legs · Cut 72 Cream". */
const caption = computed(() => {
  const l = props.look.labels;
  return [
    l.letter ? '' : props.piece.letter,
    l.size ? '' : props.piece.size,
    l.counts ? '' : props.piece.note,
  ]
    .filter(Boolean)
    .join(' · ');
});
/** Fabric pills (color key unchecked), laid left to right under the caption. */
const pillY = computed(() => bounds.value[3] + props.look.font * (caption.value ? 1.9 : 0.4));
const pills = computed(() => {
  if (props.look.labels.color) return [];
  const f = props.look.font;
  let x = bounds.value[0];
  return props.piece.fabrics.map((p) => {
    const w = f * (1.5 + `${p.n} · ${p.name}`.length * 0.42);
    const pill = { ...p, x, w };
    x += w + f * 0.3;
    return pill;
  });
});
/** Checked notes, printed on the template: finished size, then what to cut. */
const insideLines = computed(() => {
  const l = props.look.labels;
  return [l.size ? `Finished ${props.piece.size}` : '', l.counts ? props.piece.note : ''].filter(
    Boolean,
  );
});
/**
 * Letter and notes stacked at the roomiest spot inside the sewing line, shrunk to fit when the piece
 * is small (width estimated at 0.55 em per character).
 */
const stack = computed(() => {
  const f = props.look.font;
  const rows = [
    ...(props.look.labels.letter ? [{ text: props.piece.letter, em: 1.6, bold: true }] : []),
    ...insideLines.value.map((text) => ({ text, em: 0.9, bold: false })),
  ];
  const arrow = props.look.grain && props.piece.grainLength > 0 ? 1.2 : 0;
  const height = (rows.reduce((a, x) => a + x.em * 1.15, 0) + arrow) * f;
  const width = Math.max(0, ...rows.map((x) => x.text.length * 0.55 * x.em)) * f;
  const room = props.piece.room * 1.9;
  const k = Math.min(1, room / (height || 1), room / (width || 1));
  let y = props.piece.center[1] - (height * k) / 2 + arrow * f * k;
  const lines = rows.map((x) => {
    y += x.em * 1.15 * f * k;
    return { text: x.text, size: x.em * f * k, bold: x.bold, y: y - x.em * 0.25 * f * k };
  });
  return { lines, top: props.piece.center[1] - (height * k) / 2, k, width: width * k };
});

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
