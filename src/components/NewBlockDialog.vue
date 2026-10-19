<template>
  <!-- New block: a name and a shape (spec 026). The shape can't change later. -->
  <q-dialog v-model="open">
    <q-card style="width: 420px; max-width: 95vw">
      <q-card-section class="text-h6">New block</q-card-section>
      <q-card-section class="column q-pt-none" style="gap: 12px">
        <q-input v-model="name" dense outlined autofocus label="Name" @keyup.enter="ok" />
        <div class="nb-shapes" role="radiogroup" aria-label="Shape">
          <button
            v-for="c in CHOICES"
            :key="c.value ?? 'square'"
            type="button"
            role="radio"
            class="nb-shape column items-center"
            :class="{ on: shape === c.value }"
            :aria-checked="shape === c.value"
            @click="pick(c.value)"
          >
            <svg viewBox="-2 -2 44 44" width="44" height="44" aria-hidden="true">
              <polygon :points="c.points" />
            </svg>
            <span class="text-caption">{{ c.label }}</span>
          </button>
        </div>
        <div v-if="shape" class="text-caption text-grey-7">
          The shape stays with the block. Drawing uses a triangle grid.
        </div>
        <ShapeSize
          v-if="shape"
          :shape="shape"
          :size="size"
          :units="units"
          @change="(s) => (size = s)"
        />
        <div v-else class="text-caption text-grey-7">
          Finished size {{ size[0] }} × {{ size[1] }} {{ units }}. You can change it in the block
          editor.
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn v-close-popup flat no-caps label="Cancel" />
        <q-btn flat no-caps color="primary" label="Make block" @click="ok" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ShapeSize from '@/components/ShapeSize.vue';
import { SHAPE_NAME, SHAPE_OUTLINE, shapeSize, type BlockShape } from '@/model/blocks/shape';

const emit = defineEmits<{
  create: [name: string, shape: BlockShape | undefined, size: [number, number]];
}>();

const open = ref(false);
const name = ref('');
const units = ref<'in' | 'cm'>('in');
const shape = ref<BlockShape | undefined>();
const size = ref<[number, number]>([10, 10]);

/** Picture points in a 40 × 40 box, the shape centered at its own proportions. */
const points = (s?: BlockShape) => {
  const pts = s
    ? SHAPE_OUTLINE[s]
    : [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
      ];
  const [w, h] = s ? shapeSize(s, 'width', 1) : [1, 1];
  const k = 40 / Math.max(w, h);
  return pts.map(([x, y]) => `${20 + (x! - 0.5) * w * k},${20 + (y! - 0.5) * h * k}`).join(' ');
};
const CHOICES: { value: BlockShape | undefined; label: string; points: string }[] = [
  { value: undefined, label: 'Square', points: points() },
  ...(['triangle', 'diamond60', 'hexagon'] as BlockShape[]).map((s) => ({
    value: s,
    label: SHAPE_NAME[s],
    points: points(s),
  })),
];
/** Starting legs, in inches. */
const LEG: Record<BlockShape, number> = { triangle: 6, diamond60: 4, hexagon: 3 };

function pick(s: BlockShape | undefined) {
  shape.value = s;
  const k = units.value === 'cm' ? 2.5 : 1;
  size.value = s ? shapeSize(s, 'leg', LEG[s] * k) : [10 * k, 10 * k];
}

function show(defaultName: string, u: 'in' | 'cm') {
  name.value = defaultName;
  units.value = u;
  pick(undefined);
  open.value = true;
}
function ok() {
  open.value = false;
  emit('create', name.value.trim() || 'Block', shape.value, size.value);
}

defineExpose({ show });
</script>

<style scoped>
.nb-shapes {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.nb-shape {
  padding: 6px 2px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.nb-shape.on {
  border-color: var(--q-primary);
  outline: 2px solid var(--q-primary);
}
.nb-shape polygon {
  fill: color-mix(in srgb, var(--q-primary) 25%, transparent);
  stroke: currentColor;
  stroke-width: 1.5;
}
:global(.body--dark) .nb-shape {
  border-color: rgba(255, 255, 255, 0.28);
}
</style>
