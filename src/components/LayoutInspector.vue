<template>
  <div class="q-gutter-md">
    <FieldGroup label="Layout" heading />
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
        { label: 'Diamond Point (blocks)', value: 'diamond-point' },
        { label: 'Variable Point (patches)', value: 'variable-point' },
        { label: 'Shaped Blocks (blocks)', value: 'shaped-blocks' },
        { label: 'One Patch (patches)', value: 'one-patch' },
        { label: 'Baby Blocks (blocks)', value: 'baby-blocks' },
        { label: 'Variable Patch (patches)', value: 'variable-blocks' },
        ...soon,
      ]"
      emit-value
      map-options
      option-disable="disable"
      :readonly="readonly"
      @update:model-value="(v) => emit('change', convertLayout(layout, v, lu), '')"
    >
      <!-- The wizard's picture of each style. -->
      <template #option="{ opt, itemProps }">
        <q-item v-bind="itemProps">
          <q-item-section avatar>
            <svg v-if="PICS[opt.value]" :viewBox="PICS[opt.value]!.box" class="preview-art">
              <path
                v-for="(p, i) in PICS[opt.value]!.paths"
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
      <template v-if="PICS[layout.style]" #prepend>
        <svg :viewBox="PICS[layout.style]!.box" class="preview-art">
          <path
            v-for="(p, i) in PICS[layout.style]!.paths"
            :key="i"
            :d="p.d"
            :class="p.kind"
            vector-effect="non-scaling-stroke"
          />
        </svg>
      </template>
    </q-select>
    <StripsInspector
      v-if="layout.style === 'horizontal-strip' || layout.style === 'vertical-strip'"
      :layout="layout"
      :units="units"
      :readonly="readonly"
      :hint="hint"
      @change="(l, k) => emit('change', l, k)"
    />
    <template
      v-else-if="
        layout.style === 'on-point' ||
        layout.style === 'variable-point' ||
        layout.style === 'diamond-point'
      "
    >
      <FieldGroup label="Blocks">
        <div class="column" style="gap: 8px">
          <div class="row q-col-gutter-sm">
            <q-input
              class="col-6"
              :model-value="layout.cols"
              dense
              outlined
              type="number"
              step="0.5"
              label="Blocks across"
              min="1"
              max="100"
              :readonly="readonly"
              @update:model-value="(v) => setCount('cols', v, true)"
            />
            <q-input
              class="col-6"
              :model-value="layout.rows"
              dense
              outlined
              type="number"
              step="0.5"
              label="Blocks down"
              min="1"
              max="100"
              :readonly="readonly"
              @update:model-value="(v) => setCount('rows', v, true)"
            />
          </div>
        </div>
      </FieldGroup>
      <FieldGroup :label="layout.style !== 'on-point' ? 'Diamond size' : 'Block size'">
        <div class="column" style="gap: 8px">
          <template v-if="layout.style === 'diamond-point'">
            <ShapeSize
              shape="diamond60"
              :size="[layout.width, layout.width * Math.sqrt(3)]"
              :units="units"
              :readonly="readonly"
              @change="(s) => op({ width: s[0], height: s[1] }, 'width')"
            />
            <div class="text-caption text-grey-7">
              60° diamonds take 60° diamond blocks. Setting pieces take colors and fabrics.
            </div>
          </template>
          <template v-else-if="layout.style !== 'on-point'">
            <DiamondSize
              :width="layout.width"
              :height="layout.height"
              :units="units"
              :readonly="readonly"
              @change="(width, height, k) => op({ width, height }, k)"
            />
            <div class="text-caption text-grey-7">
              Width and height are measured through the diamond, point to point. Diamonds and
              setting pieces take colors and fabrics.
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
        </div>
      </FieldGroup>
      <FieldGroup label="Sashing">
        <div class="column" style="gap: 8px">
          <LengthInput
            :model-value="layout.sash"
            label="Sashing width (0 for none)"
            :units="units"
            :readonly="readonly"
            @update:model-value="(v) => op({ sash: v }, 'sash')"
          />
        </div>
      </FieldGroup>
      <FieldGroup label="Edge">
        <div class="column" style="gap: 8px">
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
        </div>
      </FieldGroup>
    </template>
    <template
      v-else-if="
        layout.style === 'one-patch' ||
        layout.style === 'shaped-blocks' ||
        layout.style === 'baby-blocks' ||
        layout.style === 'variable-blocks'
      "
    >
      <q-select
        v-if="layout.style === 'one-patch' || layout.style === 'shaped-blocks'"
        :model-value="layout.shape"
        dense
        outlined
        label="Shape"
        :options="layout.style === 'shaped-blocks' ? BLOCK_SHAPES : SHAPES"
        emit-value
        map-options
        :readonly="readonly"
        @update:model-value="(v) => tile({ shape: v }, '')"
      />
      <FieldGroup :label="countWord">
        <div class="column" style="gap: 8px">
          <div class="row q-col-gutter-sm">
            <q-input
              class="col-6"
              :model-value="layout.cols"
              dense
              outlined
              type="number"
              :label="`${countWord} across`"
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
              :label="`${countWord} down`"
              min="1"
              max="100"
              :readonly="readonly"
              @update:model-value="(v) => setCount('rows', v)"
            />
          </div>
        </div>
      </FieldGroup>
      <FieldGroup
        :label="
          layout.style === 'one-patch'
            ? 'Patch size'
            : layout.style === 'shaped-blocks'
              ? 'Block size'
              : layout.style === 'baby-blocks'
                ? 'Diamond size'
                : 'Cube size'
        "
      >
        <div class="column" style="gap: 8px">
          <LengthInput
            v-if="layout.style === 'shaped-blocks'"
            :model-value="layout.width"
            :label="layout.shape === 'diamonds' ? 'Width (short diagonal = side)' : 'Side'"
            :units="units"
            :min="0.25"
            :readonly="readonly"
            @update:model-value="(v) => emit('change', { ...layout, width: v } as Layout, 'width')"
          />
          <template v-else-if="layout.style === 'one-patch'">
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
        </div>
      </FieldGroup>
      <FieldGroup label="Edge">
        <div class="column" style="gap: 8px">
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
          <div class="text-caption text-grey-7">
            {{
              layout.style === 'shaped-blocks'
                ? 'Each space takes a block of its shape, or a color or fabric.'
                : layout.style === 'baby-blocks'
                  ? 'Each diamond takes a 60° diamond block, or a color or fabric.'
                  : 'Patches take colors and fabrics.'
            }}
          </div>
        </div>
      </FieldGroup>
      <FlowAngle
        v-if="flows"
        :model-value="layout.flow"
        :readonly="readonly"
        @update:model-value="(v) => emit('change', { ...layout, flow: v } as Layout, 'flow')"
      />
    </template>
    <template v-else-if="layout.style === 'straight-set'">
      <FieldGroup label="Columns and rows">
        <div class="column" style="gap: 8px">
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
        </div>
      </FieldGroup>
      <FieldGroup label="Finished block size">
        <div class="column" style="gap: 8px">
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
        </div>
      </FieldGroup>
      <FieldGroup label="Sashing (0 for none)">
        <div class="column" style="gap: 8px">
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
        </div>
      </FieldGroup>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import DiamondSize from '@/components/DiamondSize.vue';
import FlowAngle from '@/components/FlowAngle.vue';
import ShapeSize from '@/components/ShapeSize.vue';
import FieldGroup from '@/components/FieldGroup.vue';
import LengthInput from '@/components/LengthInput.vue';
import StripsInspector from '@/components/StripsInspector.vue';
import { convertLayout, FLOWS } from '@/model/layout/slots';
import { picture, sampleStrips, STYLES } from '@/render/layout-samples';
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
const BLOCK_SHAPES = SHAPES.filter((s) => FLOWS.includes(s.value));
const countWord = computed(() =>
  props.layout.style === 'one-patch'
    ? 'Patches'
    : props.layout.style === 'shaped-blocks'
      ? 'Blocks'
      : 'Cubes',
);
/** Styles with a turnable grid (spec 026 flow angle). */
const flows = computed(
  () =>
    ['shaped-blocks', 'baby-blocks', 'variable-blocks'].includes(props.layout.style) ||
    (props.layout.style === 'one-patch' && FLOWS.includes(props.layout.shape)),
);
const patchEdgeOptions = [
  { label: 'Trimmed straight', value: 'trim' },
  { label: 'Whole patches', value: 'none' },
];

/** Each style's picture, as the wizard draws it. */
const PICS: Record<string, ReturnType<typeof picture>> = {
  ...Object.fromEntries(STYLES.map((s) => [s.value, picture(s.sample, [])])),
  'horizontal-strip': picture(sampleStrips('horizontal-strip'), []),
  'vertical-strip': picture(sampleStrips('vertical-strip'), []),
};
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

/** `half`: On-Point and Variable/Diamond Point take halves (a half row is a short row). */
function setCount(key: 'cols' | 'rows', v: string | number | null, half = false) {
  const n = half ? Math.round(Number(v) * 2) / 2 : Math.round(Number(v));
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

<style scoped>
.preview-art {
  width: 36px;
  height: 28px;
  flex: none;
}
.preview-art path {
  stroke: #9e9e9e;
  stroke-width: 1;
  fill: #fafafa;
}
.preview-art path.sash,
.preview-art path.cs {
  fill: #cfd8dc;
}
.preview-art path.set {
  fill: #e3ecf5;
}
:global(.body--dark .preview-art path) {
  stroke: #757575;
  fill: #2b2b2b;
}
:global(.body--dark .preview-art path.sash),
:global(.body--dark .preview-art path.cs) {
  fill: #3a3f44;
}
</style>
