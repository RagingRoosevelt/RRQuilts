<template>
  <!-- A style that takes several block shapes (Shaped Blocks): a small badge for each. -->
  <span class="shape-badges" aria-hidden="true">
    <svg v-for="sh in SHAPES" :key="sh" viewBox="-0.1 -0.1 1.2 1.2">
      <polygon :points="SHAPE_OUTLINE[sh].map((p) => p.join(',')).join(' ')" />
    </svg>
    <q-tooltip>Triangles, diamonds or hexagons</q-tooltip>
  </span>
</template>

<script setup lang="ts">
import { SHAPE_OUTLINE, type BlockShape } from '@/model/blocks/shape';

const SHAPES: BlockShape[] = ['triangle', 'diamond60', 'hexagon'];
</script>

<style scoped>
.shape-badges {
  display: flex;
  gap: 1px;
}
svg {
  width: 11px;
  height: 11px;
}
polygon {
  fill: var(--q-primary);
  opacity: 0.8;
}
</style>
