<template>
  <svg
    :viewBox="box"
    class="epp-thumb"
    :class="{ fill: !size }"
    :style="size ? { width: `${size}px`, height: `${size}px` } : undefined"
  >
    <path
      v-for="(p, i) in paths"
      :key="i"
      :d="p.d"
      :fill="p.fill"
      stroke="currentColor"
      :stroke-width="stroke"
    />
  </svg>
</template>

<script setup lang="ts">
// A small picture of EPP polygons (shapes, rosettes) for cards and pickers.
import { computed } from 'vue';
import { bbox, type Poly } from '@/model/epp/geometry';

const props = withDefaults(
  /** `size` 0: as wide as its box, square (cards). */
  defineProps<{ polys: { poly: Poly; fill?: string | undefined }[]; size?: number }>(),
  { size: 56 },
);
const span = computed(() => {
  const [x0, y0, x1, y1] = bbox(props.polys.map((p) => p.poly));
  return { x0, y0, w: Math.max(x1 - x0, 1e-3), h: Math.max(y1 - y0, 1e-3) };
});
const box = computed(() => {
  const { x0, y0, w, h } = span.value;
  const pad = Math.max(w, h) * 0.08 + 0.05;
  return `${x0 - pad} ${y0 - pad} ${w + 2 * pad} ${h + 2 * pad}`;
});
const stroke = computed(() => Math.max(span.value.w, span.value.h) / 60);
const paths = computed(() =>
  props.polys.map((p) => ({
    d: 'M' + p.poly.map(([x, y]) => `${x.toFixed(3)},${y.toFixed(3)}`).join('L') + 'Z',
    fill: p.fill ?? 'rgba(128,128,128,0.15)',
  })),
);
</script>

<style scoped>
.epp-thumb {
  display: block;
}
.epp-thumb.fill {
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  filter: var(--card-shadow);
}
</style>
