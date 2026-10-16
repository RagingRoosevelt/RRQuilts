<template>
  <div class="q-gutter-md">
    <div class="text-subtitle2">Layout</div>
    <q-select
      :model-value="layout.style"
      dense
      outlined
      label="Style"
      :options="[
        { label: 'Straight Set', value: 'straight-set' },
        { label: 'On-Point', value: 'on-point' },
        { label: 'Horizontal Strip', value: 'horizontal-strip' },
        { label: 'Vertical Strip', value: 'vertical-strip' },
        { label: 'Variable Point', value: 'variable-point' },
        { label: 'One Patch', value: 'one-patch' },
        { label: 'Baby Blocks', value: 'baby-blocks' },
        { label: 'Variable Blocks', value: 'variable-blocks' },
        ...soon,
      ]"
      emit-value
      map-options
      option-disable="disable"
      :readonly="readonly"
      @update:model-value="(v) => emit('change', convertLayout(layout, v, lu), '')"
    />
    <StripsInspector
      v-if="layout.style === 'horizontal-strip' || layout.style === 'vertical-strip'"
      :layout="layout"
      :units="units"
      :readonly="readonly"
      :hint="hint"
      @change="(l, k) => emit('change', l, k)"
    />
    <template v-else-if="layout.style === 'on-point' || layout.style === 'variable-point'">
      <div class="row q-col-gutter-sm">
        <q-input
          class="col-6"
          :model-value="layout.cols"
          dense
          outlined
          type="number"
          label="Blocks across"
          min="1"
          max="100"
          :readonly="readonly"
          @update:model-value="(v) => setCount('cols', v)"
        />
        <q-input
          class="col-6"
          :model-value="layout.rows"
          dense
          outlined
          type="number"
          label="Blocks down"
          min="1"
          max="100"
          :readonly="readonly"
          @update:model-value="(v) => setCount('rows', v)"
        />
      </div>
      <template v-if="layout.style === 'variable-point'">
        <DiamondSize
          :width="layout.width"
          :height="layout.height"
          :units="units"
          :readonly="readonly"
          @change="(width, height, k) => op({ width, height }, k)"
        />
        <div class="text-caption text-grey-7">
          Measured through the diamond, point to point. Diamonds and setting pieces take colors and
          fabrics.
        </div>
      </template>
      <div v-else>
        <LengthInput
          :model-value="layout.block"
          label="Finished block size"
          :units="units"
          :min="0.25"
          :readonly="readonly"
          @update:model-value="(v) => op({ block: v }, 'block')"
        />
        <div class="text-caption text-grey-7">
          Width on point: {{ fmtLen(layout.block * Math.SQRT2, lu) }}
        </div>
      </div>
      <LengthInput
        :model-value="layout.sash"
        label="Sashing width (0 for none)"
        :units="units"
        :readonly="readonly"
        @update:model-value="(v) => op({ sash: v }, 'sash')"
      />
      <q-btn-toggle
        :model-value="layout.corner"
        dense
        no-caps
        spread
        :options="[
          { label: 'Corner triangle', value: 'triangle' },
          { label: 'Seam', value: 'seam' },
        ]"
        :disable="readonly"
        @update:model-value="(v) => op({ corner: v }, '')"
      />
      <q-select
        :model-value="layout.edge.finish"
        dense
        outlined
        label="Edge"
        :options="edgeOptions"
        emit-value
        map-options
        :readonly="readonly"
        @update:model-value="(v) => edge({ finish: v }, '')"
      >
        <template #option="{ opt, itemProps }">
          <q-item v-bind="itemProps">
            <q-item-section>
              <q-item-label>{{ opt.label }}</q-item-label>
              <q-item-label caption>{{ opt.hint }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <LengthInput
        v-if="layout.edge.finish === 'float'"
        :model-value="layout.edge.float"
        label="Float"
        :units="units"
        :min="0"
        :readonly="readonly"
        @update:model-value="(v) => edge({ float: v }, 'float')"
      />
      <div v-if="layout.edge.finish === 'none' && hasBorders" class="text-caption text-grey-8">
        Borders are set aside while the edge is unfilled. They come back with another edge.
      </div>
    </template>
    <template
      v-else-if="
        layout.style === 'one-patch' ||
        layout.style === 'baby-blocks' ||
        layout.style === 'variable-blocks'
      "
    >
      <q-select
        v-if="layout.style === 'one-patch'"
        :model-value="layout.shape"
        dense
        outlined
        label="Shape"
        :options="SHAPES"
        emit-value
        map-options
        :readonly="readonly"
        @update:model-value="(v) => tile({ shape: v }, '')"
      />
      <div class="row q-col-gutter-sm">
        <q-input
          class="col-6"
          :model-value="layout.cols"
          dense
          outlined
          type="number"
          :label="layout.style === 'one-patch' ? 'Patches across' : 'Cubes across'"
          min="1"
          max="100"
          :readonly="readonly"
          @update:model-value="(v) => setCount('cols', v)"
        />
        <q-input
          class="col-6"
          :model-value="layout.rows"
          dense
          outlined
          type="number"
          :label="layout.style === 'one-patch' ? 'Patches down' : 'Cubes down'"
          min="1"
          max="100"
          :readonly="readonly"
          @update:model-value="(v) => setCount('rows', v)"
        />
      </div>
      <template v-if="layout.style === 'one-patch'">
        <div v-if="twoSizes" class="row q-col-gutter-sm">
          <LengthInput
            class="col-6"
            :model-value="layout.width"
            :label="layout.shape === 'tumblers' ? 'Bottom width' : 'Width'"
            :units="units"
            :min="0.25"
            :readonly="readonly"
            @update:model-value="(v) => tile({ width: v }, 'width')"
          />
          <LengthInput
            class="col-6"
            :model-value="layout.height"
            label="Height"
            :units="units"
            :min="0.25"
            :readonly="readonly"
            @update:model-value="(v) => tile({ height: v }, 'height')"
          />
        </div>
        <LengthInput
          v-else
          :model-value="layout.width"
          :label="oneSizeLabel"
          :units="units"
          :min="0.25"
          :readonly="readonly"
          @update:model-value="(v) => tile({ width: v, height: v }, 'width')"
        />
      </template>
      <LengthInput
        v-else-if="layout.style === 'baby-blocks'"
        :model-value="layout.side"
        label="Diamond side"
        :units="units"
        :min="0.25"
        :readonly="readonly"
        @update:model-value="(v) => tile({ width: v * Math.sqrt(3), top: v, side: v }, 'side')"
      />
      <template v-else>
        <LengthInput
          :model-value="layout.width"
          label="Cube width"
          :units="units"
          :min="0.25"
          :readonly="readonly"
          @update:model-value="(v) => tile({ width: v }, 'width')"
        />
        <div class="row q-col-gutter-sm">
          <LengthInput
            class="col-6"
            :model-value="layout.top"
            label="Top height"
            :units="units"
            :min="0.25"
            :readonly="readonly"
            @update:model-value="(v) => tile({ top: v }, 'top')"
          />
          <LengthInput
            class="col-6"
            :model-value="layout.side"
            label="Side height"
            :units="units"
            :min="0.25"
            :readonly="readonly"
            @update:model-value="(v) => tile({ side: v }, 'side')"
          />
        </div>
      </template>
      <q-select
        v-if="layout.style !== 'one-patch' || !STRAIGHT.includes(layout.shape)"
        :model-value="layout.edge"
        dense
        outlined
        label="Edge"
        :options="patchEdgeOptions"
        emit-value
        map-options
        :readonly="readonly"
        @update:model-value="(v) => tile({ edge: v }, '')"
      />
      <div v-if="layout.edge === 'none' && hasBorders" class="text-caption text-grey-8">
        The quilt's edge follows the patches; borders are set aside.
      </div>
      <div class="text-caption text-grey-7">Patches take colors and fabrics.</div>
    </template>
    <template v-else-if="layout.style === 'straight-set'">
      <div class="row q-col-gutter-sm">
        <q-input
          class="col-6"
          :model-value="layout.cols"
          dense
          outlined
          type="number"
          label="Columns"
          min="1"
          max="100"
          :readonly="readonly"
          @update:model-value="(v) => setCount('cols', v)"
        />
        <q-input
          class="col-6"
          :model-value="layout.rows"
          dense
          outlined
          type="number"
          label="Rows"
          min="1"
          max="100"
          :readonly="readonly"
          @update:model-value="(v) => setCount('rows', v)"
        />
      </div>
      <div class="text-caption">Finished block size</div>
      <q-toggle
        v-model="squareBlock"
        dense
        label="Keep width and height equal"
        :disable="readonly"
      />
      <div class="row q-col-gutter-sm">
        <LengthInput
          class="col-6"
          :model-value="layout.block[0]"
          label="Width"
          :units="units"
          :min="0.25"
          :readonly="readonly"
          @update:model-value="(v) => setPair('block', 0, v, squareBlock)"
        />
        <LengthInput
          class="col-6"
          :model-value="layout.block[1]"
          label="Height"
          :units="units"
          :min="0.25"
          :readonly="readonly"
          @update:model-value="(v) => setPair('block', 1, v, squareBlock)"
        />
      </div>
      <div class="text-caption">Sashing (0 for none)</div>
      <q-toggle
        v-model="squareSash"
        dense
        label="Keep width and height equal"
        :disable="readonly"
      />
      <div class="row q-col-gutter-sm">
        <LengthInput
          class="col-6"
          :model-value="layout.sash[0]"
          label="Width"
          :units="units"
          :readonly="readonly"
          @update:model-value="(v) => setPair('sash', 0, v, squareSash)"
        />
        <LengthInput
          class="col-6"
          :model-value="layout.sash[1]"
          label="Height"
          :units="units"
          :readonly="readonly"
          @update:model-value="(v) => setPair('sash', 1, v, squareSash)"
        />
      </div>
      <q-toggle
        :model-value="layout.sashBorder"
        dense
        label="Sashing around the outside"
        :disable="readonly"
        @update:model-value="(v) => hz({ sashBorder: v })"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import DiamondSize from '@/components/DiamondSize.vue';
import LengthInput from '@/components/LengthInput.vue';
import StripsInspector from '@/components/StripsInspector.vue';
import { convertLayout } from '@/model/layout/slots';
import { fmtLen } from '@/model/print/format';
import type {
  HorizontalLayout,
  Layout,
  OnePatchLayout,
  OnPointLayout,
  PatchShape,
  TumblingLayout,
  VariablePointLayout,
} from '@/model/schema/quilt';

const props = defineProps<{
  layout: Layout;
  units: string;
  readonly: boolean;
  hasBorders?: boolean;
  hint?: string | undefined;
}>();
const emit = defineEmits<{ change: [layout: Layout, coalesce: string] }>();
const op = (patch: Partial<OnPointLayout> | Partial<VariablePointLayout>, k = '') =>
  emit('change', { ...(props.layout as OnPointLayout), ...patch } as Layout, k);
const tile = (patch: Partial<OnePatchLayout> | Partial<TumblingLayout>, k = '') =>
  emit('change', { ...props.layout, ...patch } as Layout, k);
const edge = (patch: Partial<OnPointLayout['edge']>, k = '') => {
  const l = props.layout as OnPointLayout;
  op({ edge: { ...l.edge, ...patch } }, k);
};
const hz = (patch: Partial<HorizontalLayout>, k = '') =>
  emit('change', { ...(props.layout as HorizontalLayout), ...patch }, k);
const lu = computed(() => (props.units === 'cm' ? 'cm' : 'in'));
const edgeOptions = [
  { label: 'Exact', value: 'exact', hint: 'Block points meet the edge' },
  { label: 'Floating', value: 'float', hint: 'Blocks float, trim after' },
  { label: 'Trimmed blocks', value: 'trim', hint: 'Partial blocks, trim after' },
  { label: 'No fill', value: 'none', hint: 'Bind the uneven edge' },
];

const SHAPES: { label: string; value: PatchShape }[] = [
  { label: 'Squares', value: 'squares' },
  { label: 'Rectangles', value: 'rectangles' },
  { label: 'Bricks', value: 'bricks' },
  { label: 'Half-square triangles', value: 'half-square-triangles' },
  { label: 'Triangles (equilateral)', value: 'triangles' },
  { label: '60° diamonds', value: 'diamonds' },
  { label: 'Hexagons', value: 'hexagons' },
  { label: 'Tumblers', value: 'tumblers' },
  { label: 'Clamshells', value: 'clamshells' },
  { label: 'Octagons and squares', value: 'octagons' },
];
/** Shapes whose edge is always straight, so no edge choice. */
const STRAIGHT: PatchShape[] = ['squares', 'rectangles', 'half-square-triangles'];
const TWO_SIZES: PatchShape[] = ['rectangles', 'bricks', 'half-square-triangles', 'tumblers'];
const ONE_SIZE_LABEL: Partial<Record<PatchShape, string>> = {
  squares: 'Patch size',
  triangles: 'Side',
  diamonds: 'Side',
  hexagons: 'Side',
  clamshells: 'Width',
  octagons: 'Width',
};
const twoSizes = computed(
  () => props.layout.style === 'one-patch' && TWO_SIZES.includes(props.layout.shape),
);
const oneSizeLabel = computed(() =>
  props.layout.style === 'one-patch' ? (ONE_SIZE_LABEL[props.layout.shape] ?? 'Size') : '',
);
const patchEdgeOptions = [
  { label: 'Trimmed straight', value: 'trim' },
  { label: 'Whole patches', value: 'none' },
];

const soon = ['Custom Set'].map((label) => ({
  label: `${label} (coming soon)`,
  value: label,
  disable: true,
}));
const pair = (k: 'block' | 'sash') => {
  const v = (props.layout as HorizontalLayout)[k];
  return Array.isArray(v) && v[0] === v[1];
};
const squareBlock = ref(props.layout.style !== 'straight-set' || pair('block'));
const squareSash = ref(props.layout.style !== 'straight-set' || pair('sash'));

function setCount(key: 'cols' | 'rows', v: string | number | null) {
  const n = Math.round(Number(v));
  if (n >= 1 && n <= 100) emit('change', { ...props.layout, [key]: n }, key);
}

function setPair(key: 'block' | 'sash', i: 0 | 1, v: number, locked: boolean) {
  const l = props.layout as HorizontalLayout;
  const p: [number, number] = [...l[key]];
  p[i] = v;
  if (locked) p[1 - i] = v;
  emit('change', { ...l, [key]: p }, `${key}`);
}
</script>
