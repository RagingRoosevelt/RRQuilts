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
    labels: { letter: boolean; counts: boolean; size: boolean };
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
  return { lines, top: props.piece.center[1] - (height * k) / 2, k };
});

/** Arrow ends along the grain, through the label's center (offset below the letter). */
const end = (s: 1 | -1): Pt => {
  const c = props.piece.center;
  const L = props.piece.grainLength / 2;
  return [
    c[0] + s * props.piece.grain[0] * L,
    stack.value.top + props.look.font * 0.5 * stack.value.k + s * props.piece.grain[1] * L,
  ];
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
