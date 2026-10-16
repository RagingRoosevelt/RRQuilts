<template>
  <!-- Variable Point diamonds: any two of width, height, and point angle; the third follows. -->
  <div class="column" style="gap: 8px">
    <div v-for="f in FIELDS" :key="f" class="row items-center no-wrap" style="gap: 4px">
      <q-checkbox
        :model-value="picked.includes(f)"
        dense
        :disable="readonly"
        :aria-label="`Set ${LABELS[f]}`"
        @update:model-value="() => pick(f)"
      />
      <q-input
        v-if="f === 'angle'"
        class="col"
        :model-value="+angle.toFixed(2)"
        dense
        outlined
        type="number"
        min="10"
        max="170"
        suffix="°"
        :label="LABELS.angle"
        :readonly="readonly || !picked.includes('angle')"
        :disable="!picked.includes('angle')"
        @update:model-value="(v) => setAngle(Number(v))"
      />
      <LengthInput
        v-else
        class="col"
        :model-value="+(f === 'width' ? width : height).toFixed(3)"
        :label="LABELS[f]"
        :units="units"
        :min="0.25"
        :readonly="readonly || !picked.includes(f)"
        @update:model-value="(v) => setLength(f, v)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import LengthInput from '@/components/LengthInput.vue';

type Field = 'width' | 'height' | 'angle';
const FIELDS: Field[] = ['width', 'height', 'angle'];
const LABELS: Record<Field, string> = {
  width: 'Diamond width',
  height: 'Diamond height',
  angle: 'Point angle (top and bottom)',
};

const props = withDefaults(
  defineProps<{ width: number; height: number; units: string; readonly?: boolean }>(),
  { readonly: false },
);
const emit = defineEmits<{ change: [width: number, height: number, key: string] }>();

/** The two set by hand, oldest first; the third is calculated. */
const picked = ref<Field[]>(['width', 'height']);
function pick(f: Field) {
  if (!picked.value.includes(f)) picked.value = [picked.value[1]!, f];
}

const rad = (d: number) => (d * Math.PI) / 180;
/** The angle at the top and bottom points: 90° when width = height. */
const angle = computed(() => (2 * Math.atan(props.width / props.height) * 180) / Math.PI);

function setLength(f: 'width' | 'height', v: number) {
  if (!(v > 0)) return;
  const t = Math.tan(rad(angle.value) / 2); // width ÷ height
  if (f === 'width')
    emit('change', v, picked.value.includes('angle') ? v / t : props.height, 'width');
  else emit('change', picked.value.includes('angle') ? v * t : props.width, v, 'height');
}
function setAngle(a: number) {
  if (!(a >= 10 && a <= 170)) return;
  const t = Math.tan(rad(a) / 2);
  // The other picked length stays; the calculated one follows.
  if (picked.value.includes('width')) emit('change', props.width, props.width / t, 'angle');
  else emit('change', props.height * t, props.height, 'angle');
}
</script>
