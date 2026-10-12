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
      v-if="look.labels.letter"
      :x="piece.center[0]"
      :y="piece.center[1] - look.font * 0.9"
      :font-size="look.font * 1.6"
      font-weight="bold"
      text-anchor="middle"
    >
      {{ piece.letter }}
    </text>
    <template v-if="look.inside">
      <text
        v-for="(line, i) in insideLines"
        :key="i"
        :x="piece.center[0]"
        :y="piece.center[1] + look.font * (2.2 + i * 1.2)"
        :font-size="look.font * 0.9"
        text-anchor="middle"
      >
        {{ line }}
      </text>
    </template>
    <text
      v-else-if="caption"
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
    inside: boolean;
  };
}>();

const path = (poly: Pt[]) => (poly.length ? `M${poly.map((p) => p.join(' ')).join('L')}Z` : '');
const dash = (k: number) => `${props.look.stroke * k} ${props.look.stroke * k}`;
const bounds = computed(() => {
  const xs = props.piece.cut.map((p) => p[0]);
  const ys = props.piece.cut.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] as const;
});
/** "B · 3″ legs · Cut 72 Cream" from the chosen labels. */
const caption = computed(() => {
  const l = props.look.labels;
  const parts = [
    l.letter ? props.piece.letter : '',
    l.size ? props.piece.size : '',
    l.counts ? props.piece.note : '',
  ].filter(Boolean);
  // A lone letter is already printed big in the middle.
  return parts.length === 1 && l.letter ? '' : parts.join(' · ');
});
/** Notes printed inside the template (one per page): finished size, then what to cut. */
const insideLines = computed(() => {
  const l = props.look.labels;
  return [l.size ? `Finished ${props.piece.size}` : '', l.counts ? props.piece.note : ''].filter(
    Boolean,
  );
});
/** Arrow ends along the grain, through the label's center (offset below the letter). */
const end = (s: 1 | -1): Pt => {
  const c = props.piece.center;
  const L = props.piece.grainLength / 2;
  return [
    c[0] + s * props.piece.grain[0] * L,
    c[1] + props.look.font * (props.look.inside ? -2.6 : 0.6) + s * props.piece.grain[1] * L,
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
