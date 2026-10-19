<template>
  <!-- Quilt editor block sidebar: show only blocks that fit a layout, or of one shape (spec 026). -->
  <div class="row no-wrap" style="gap: 6px">
    <q-select
      v-model="layout"
      class="col"
      dense
      outlined
      options-dense
      clearable
      emit-value
      map-options
      label="Fits layout"
      :options="BLOCK_LAYOUTS"
      option-value="key"
    >
      <template #option="{ opt, itemProps }">
        <q-item v-bind="itemProps">
          <q-item-section avatar>
            <svg :viewBox="opt.picture.box" class="art">
              <path
                v-for="(p, i) in opt.picture.paths"
                :key="i"
                :d="p.d"
                :class="p.kind"
                vector-effect="non-scaling-stroke"
              />
            </svg>
          </q-item-section>
          <q-item-section>{{ opt.label }}</q-item-section>
        </q-item>
      </template>
    </q-select>
    <q-select
      v-model="shape"
      class="col"
      dense
      outlined
      options-dense
      clearable
      emit-value
      map-options
      label="Shape"
      :options="SHAPES"
    >
      <template #option="{ opt, itemProps }">
        <q-item v-bind="itemProps">
          <q-item-section avatar>
            <svg :viewBox="opt.box" class="art">
              <path :d="opt.d" vector-effect="non-scaling-stroke" />
            </svg>
          </q-item-section>
          <q-item-section>{{ opt.label }}</q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script setup lang="ts">
import { SHAPE_NAME, SHAPE_OUTLINE, shapeSize, type BlockShape } from '@/model/blocks/shape';
import { BLOCK_LAYOUTS, type ShapeFilter } from '@/render/layout-samples';

const layout = defineModel<string | null>('layout', { default: null });
const shape = defineModel<ShapeFilter | null>('shape', { default: null });

const outline = (s: BlockShape) => {
  const [w, h] = shapeSize(s, 'leg', 1);
  return SHAPE_OUTLINE[s].map(([x, y]) => `${x * w} ${y * h}`);
};
const SHAPES = (['square', 'triangle', 'diamond60', 'hexagon'] as const).map((s) => {
  const [w, h] = s === 'square' ? [1, 1] : shapeSize(s, 'leg', 1);
  const pts = s === 'square' ? ['0 0', '1 0', '1 1', '0 1'] : outline(s);
  return {
    value: s,
    label: s === 'square' ? 'Square' : SHAPE_NAME[s],
    box: `${-0.05 * w} ${-0.05 * h} ${w * 1.1} ${h * 1.1}`,
    d: `M${pts.join('L')}Z`,
  };
});
</script>

<style scoped>
.art {
  width: 32px;
  height: 32px;
}
.art path {
  stroke: #9e9e9e;
  stroke-width: 1;
  fill: #fafafa;
}
.art path.sash,
.art path.cs {
  fill: #cfd8dc;
}
:global(.body--dark .art path) {
  stroke: #757575;
  fill: #2b2b2b;
}
</style>
