<template>
  <!-- Variable Point diamonds: tick any two of width, height, point angle, and leg length; the
       other two are worked out from them. -->
  <div class="column" style="gap: 8px">
    <div v-for="f in FIELDS" :key="f" class="row items-center no-wrap" style="gap: 4px">
      <q-checkbox
        :model-value="picked.includes(f)"
        dense
        :disable="readonly"
        :aria-label="`Set ${LABELS[f]}`"
        @update:model-value="(on) => toggle(f, on)"
      />
      <div class="col">
        <q-input
          v-if="f === 'angle'"
          :model-value="+values.angle.toFixed(2)"
          dense
          outlined
          type="number"
          min="10"
          max="170"
          suffix="°"
          :label="LABELS.angle"
          :readonly="!editable(f)"
          @update:model-value="(v) => set(f, Number(v))"
        />
        <LengthInput
          v-else
          :model-value="+values[f].toFixed(3)"
          :label="LABELS[f]"
          :units="units"
          :min="0.25"
          :readonly="!editable(f)"
          @update:model-value="(v) => set(f, v)"
        />
        <q-tooltip v-if="!readonly && !editable(f)">
          {{
            picked.length < 2
              ? 'Tick two values to set; the others are worked out from them.'
              : 'Calculated from the ticked values.'
          }}
        </q-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import LengthInput from '@/components/LengthInput.vue';

type Field = 'width' | 'height' | 'angle' | 'leg';
const FIELDS: Field[] = ['width', 'height', 'angle', 'leg'];
const LABELS: Record<Field, string> = {
  width: 'Diamond width',
  height: 'Diamond height',
  angle: 'Point angle (top and bottom)',
  leg: 'Leg length (each side)',
};

const props = withDefaults(
  defineProps<{ width: number; height: number; units: string; readonly?: boolean }>(),
  { readonly: false },
);
const emit = defineEmits<{ change: [width: number, height: number, key: string] }>();

/** Ticked fields, oldest first (at most two). */
const picked = ref<Field[]>(['width', 'height']);
function toggle(f: Field, on: boolean) {
  if (!on) picked.value = picked.value.filter((x) => x !== f);
  else picked.value = [...picked.value, f].slice(-2);
}
const editable = (f: Field) =>
  !props.readonly && picked.value.length === 2 && picked.value.includes(f);

const deg = (r: number) => (r * 180) / Math.PI;
const rad = (d: number) => (d * Math.PI) / 180;
/** All four from width and height: the angle at the top and bottom points (90° for a square), and
 *  the length of each side. */
const values = computed((): Record<Field, number> => ({
  width: props.width,
  height: props.height,
  angle: deg(2 * Math.atan(props.width / props.height)),
  leg: Math.hypot(props.width / 2, props.height / 2),
}));

/** Width and height from two known values, or null when they don't make a diamond. */
function solve(a: Field, av: number, b: Field, bv: number): [number, number] | null {
  const v: Partial<Record<Field, number>> = { [a]: av, [b]: bv };
  const { width: W, height: H, angle: A, leg: L } = v;
  const half = A !== undefined ? rad(A) / 2 : 0;
  const fromLeg = (side: number) =>
    L !== undefined && L > side / 2 ? 2 * Math.sqrt(L * L - (side * side) / 4) : NaN;
  let wh: [number, number];
  if (W !== undefined && H !== undefined) wh = [W, H];
  else if (W !== undefined && A !== undefined) wh = [W, W / Math.tan(half)];
  else if (H !== undefined && A !== undefined) wh = [H * Math.tan(half), H];
  else if (W !== undefined) wh = [W, fromLeg(W)];
  else if (H !== undefined) wh = [fromLeg(H), H];
  else wh = [2 * L! * Math.sin(half), 2 * L! * Math.cos(half)];
  return wh.every((x) => Number.isFinite(x) && x > 0) ? wh : null;
}

function set(f: Field, v: number) {
  if (!(v > 0) || (f === 'angle' && !(v >= 10 && v <= 170))) return;
  const other = picked.value.find((x) => x !== f)!;
  const wh = solve(f, v, other, values.value[other]);
  if (wh) emit('change', wh[0], wh[1], f);
}
</script>
