<template>
  <q-dialog v-model="open">
    <q-card class="wizard">
      <DialogClose />
      <div class="body">
        <q-stepper
          v-model="step"
          class="steps"
          flat
          animated
          header-nav
          alternative-labels
          :contracted="$q.screen.lt.sm"
        >
          <q-step name="blocks" title="Layout" icon="grid_on">
            <!-- Block layouts or patch layouts (spec 026); some styles are in both. -->
            <q-btn-toggle
              v-model="mode"
              class="q-mb-md"
              spread
              no-caps
              unelevated
              toggle-color="primary"
              :options="[
                { label: 'Blocks', value: 'blocks' },
                { label: 'Patches', value: 'patches' },
              ]"
            />
            <!-- Style cards: each drawn by the layout engine; later styles join the list. -->
            <div class="styles q-mb-md" role="radiogroup" aria-label="Layout style">
              <button
                v-for="c in styleCards"
                :key="c.value"
                type="button"
                role="radio"
                class="style-card"
                :class="{ on: style === c.value }"
                :aria-checked="style === c.value"
                @click="style = c.value"
              >
                <svg :viewBox="c.picture.box" class="preview-art">
                  <path
                    v-for="(p, i) in c.picture.paths"
                    :key="i"
                    :d="p.d"
                    :class="p.kind"
                    vector-effect="non-scaling-stroke"
                  />
                </svg>
                <div class="text-caption">{{ c.label }}</div>
              </button>
            </div>
            <TargetEditor
              v-model="targetInput"
              :units="units"
              hint="Shown as an outline over the preview, to size the quilt to"
            />
          </q-step>
          <q-step name="detail" :title="detailTitle" :icon="isStrip ? 'view_stream' : 'straighten'">
            <div class="text-subtitle1 q-mb-md">{{ styleLabel }}</div>
            <template v-if="isStrip">
              <q-btn-toggle
                v-model="stripLayout.style"
                class="q-mb-md"
                spread
                no-caps
                unelevated
                toggle-color="primary"
                :options="[
                  { label: 'Horizontal', value: 'horizontal-strip' },
                  { label: 'Vertical', value: 'vertical-strip' },
                ]"
              />
              <StripsInspector
                :layout="stripLayout"
                :units="units"
                :readonly="false"
                @change="(l) => (stripLayout = l as StripLayout)"
              />
            </template>
            <template v-else>
              <template v-if="style === 'one-patch' || style === 'shaped-blocks'">
                <div class="styles q-mb-md" role="radiogroup" aria-label="Patch shape">
                  <button
                    v-for="c in style === 'shaped-blocks' ? blockShapeCards : shapeCards"
                    :key="c.value"
                    type="button"
                    role="radio"
                    class="style-card"
                    :class="{ on: tile.shape === c.value }"
                    :aria-checked="tile.shape === c.value"
                    @click="tile.shape = c.value"
                  >
                    <svg :viewBox="c.picture.box" class="preview-art">
                      <path
                        v-for="(p, i) in c.picture.paths"
                        :key="i"
                        :d="p.d"
                        :class="p.kind"
                        vector-effect="non-scaling-stroke"
                      />
                    </svg>
                    <div class="text-caption">{{ c.label }}</div>
                  </button>
                </div>
                <q-btn-toggle
                  v-if="!STRAIGHT.includes(tile.shape)"
                  class="q-mb-md"
                  v-model="tile.edge"
                  spread
                  no-caps
                  unelevated
                  toggle-color="primary"
                  :options="[
                    { label: 'Trimmed straight', value: 'trim' },
                    {
                      label: style === 'shaped-blocks' ? 'Whole blocks' : 'Whole patches',
                      value: 'none',
                    },
                  ]"
                />
              </template>
              <q-btn-toggle
                v-if="style === 'baby-blocks' || style === 'variable-blocks'"
                class="q-mb-md"
                v-model="tile.edge"
                spread
                no-caps
                unelevated
                toggle-color="primary"
                :options="[
                  { label: 'Trimmed straight', value: 'trim' },
                  { label: 'Whole cubes', value: 'none' },
                ]"
              />
              <FlowAngle v-if="flows" v-model="tile.flow" class="q-mb-md" />
              <div class="column" style="gap: 16px">
                <FieldGroup :label="countLabel">
                  <div class="row q-col-gutter-sm">
                    <q-input
                      v-model.number="cols"
                      class="col-6"
                      dense
                      outlined
                      type="number"
                      min="1"
                      max="100"
                      :label="acrossLabel"
                    />
                    <q-input
                      v-model.number="rows"
                      class="col-6"
                      dense
                      outlined
                      type="number"
                      min="1"
                      max="100"
                      :label="downLabel"
                    />
                  </div>
                </FieldGroup>
                <FieldGroup :label="sizeLabel">
                  <div class="row q-col-gutter-sm">
                    <ShapeSize
                      v-if="style === 'diamond-point'"
                      class="col-12"
                      shape="diamond60"
                      :size="[tile.width, tile.width * Math.sqrt(3)]"
                      :units="units"
                      @change="(s) => (tile.width = s[0])"
                    />
                    <template v-else-if="style === 'variable-point'">
                      <DiamondSize
                        class="col-12"
                        :width="tile.width"
                        :height="tile.height"
                        :units="units"
                        @change="(w, h) => Object.assign(tile, { width: w, height: h })"
                      />
                      <div class="col-12 text-caption text-grey-7">
                        Width and height are measured through the diamond, point to point.
                      </div>
                    </template>
                    <LengthInput
                      v-else-if="style === 'baby-blocks'"
                      v-model="tile.dside"
                      class="col-12"
                      label="Diamond side"
                      :units="units"
                      :min="0.25"
                    />
                    <template v-else-if="style === 'variable-blocks'">
                      <LengthInput
                        v-model="tile.width"
                        class="col-12"
                        label="Cube width"
                        :units="units"
                        :min="0.25"
                      />
                      <LengthInput
                        v-model="tile.top"
                        class="col-6"
                        label="Top height"
                        :units="units"
                        :min="0.25"
                      />
                      <LengthInput
                        v-model="tile.side"
                        class="col-6"
                        label="Side height"
                        :units="units"
                        :min="0.25"
                      />
                    </template>
                    <LengthInput
                      v-else-if="style === 'shaped-blocks'"
                      v-model="tile.width"
                      class="col-12"
                      :label="tile.shape === 'diamonds' ? 'Width (short diagonal = side)' : 'Side'"
                      :units="units"
                      :min="0.25"
                    />
                    <template v-else-if="style === 'one-patch'">
                      <template v-if="twoSizes">
                        <LengthInput
                          v-model="tile.width"
                          class="col-6"
                          :label="tile.shape === 'tumblers' ? 'Bottom width' : 'Width'"
                          :units="units"
                          :min="0.25"
                        />
                        <LengthInput
                          v-model="tile.height"
                          class="col-6"
                          label="Height"
                          :units="units"
                          :min="0.25"
                        />
                      </template>
                      <LengthInput
                        v-else
                        v-model="tile.width"
                        class="col-12"
                        :label="oneSizeLabel"
                        :units="units"
                        :min="0.25"
                      />
                    </template>
                    <LengthInput
                      v-else
                      v-model="blockSize"
                      class="col-12"
                      label="Finished block size"
                      :units="units"
                      :min="0.5"
                    />
                  </div>
                </FieldGroup>
              </div>
            </template>
          </q-step>
          <q-step name="sashing" title="Sashing" icon="view_comfy">
            <div v-if="isStrip" class="text-caption">
              Strip quilts have no sashing. Strips sit edge to edge.
            </div>
            <div v-else-if="!hasSash" class="text-caption">
              {{ styleLabel }} quilts have no sashing.
            </div>
            <LengthInput v-else v-model="sash" label="Sashing width (0 for none)" :units="units" />
            <q-toggle
              v-if="style === 'straight-set'"
              v-model="sashBorder"
              class="q-mt-sm"
              label="Sashing around the outside"
              :disable="!sash"
            />
          </q-step>
          <q-step name="borders" title="Borders" icon="crop_square">
            <q-input
              v-model.number="borderCount"
              dense
              outlined
              type="number"
              min="0"
              max="5"
              label="Number of borders"
            />
            <LengthInput
              v-if="borderCount > 0"
              v-model="borderWidth"
              class="q-mt-sm"
              label="Width of each"
              :units="units"
              :min="0.25"
            />
          </q-step>
        </q-stepper>
        <!-- Live preview of the layout as it's being chosen (beside the steps; below on phones). -->
        <div class="preview q-pa-md">
          <svg
            v-if="preview"
            :viewBox="preview.box"
            class="preview-art"
            preserveAspectRatio="xMidYMin meet"
          >
            <path
              v-for="(p, i) in preview.paths"
              :key="i"
              :d="p.d"
              :class="p.kind"
              vector-effect="non-scaling-stroke"
            />
            <path
              v-if="preview.target"
              class="target"
              :d="preview.target.d"
              vector-effect="non-scaling-stroke"
            />
            <rect
              v-if="preview.core"
              class="core"
              :x="preview.core.x"
              :y="preview.core.y"
              :width="preview.core.w"
              :height="preview.core.h"
              vector-effect="non-scaling-stroke"
            />
          </svg>
          <div v-else class="text-caption text-grey-7">Too many spaces to preview.</div>
        </div>
      </div>
      <q-card-actions align="right">
        <div class="col text-caption q-pl-sm">{{ summary }}</div>
        <q-btn flat no-caps label="Cancel" @click="open = false" />
        <q-btn v-if="next" flat no-caps label="Next" @click="step = next" />
        <q-btn unelevated no-caps color="primary" label="Create quilt" @click="create" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import DialogClose from './DialogClose.vue';
import { computed, reactive, ref, watch } from 'vue';
import DiamondSize from '@/components/DiamondSize.vue';
import FlowAngle from '@/components/FlowAngle.vue';
import ShapeSize from '@/components/ShapeSize.vue';
import FieldGroup from '@/components/FieldGroup.vue';
import LengthInput from '@/components/LengthInput.vue';
import TargetEditor from '@/components/TargetEditor.vue';
import {
  defaultRegion,
  defaultsFrom,
  placeTarget,
  resolveTarget,
  shapeSize,
  type TargetInput,
} from '@/model/targets';
import StripsInspector from '@/components/StripsInspector.vue';
import { picture, sampleOnePatch, STYLES, type Style } from '@/render/layout-samples';
import { layoutDefaults, onPointDefaults, stripDefaults } from '@/model/io';
import { FLOWS, generateSlots } from '@/model/layout/slots';
import type {
  Border,
  Layout,
  OnePatchLayout,
  PatchShape,
  QuiltTarget,
  ShapedBlocksLayout,
  StripLayout,
  TumblingLayout,
  VariablePointLayout,
} from '@/model/schema/quilt';
import { useEditorStore } from '@/stores/editor';
import { useSettingsStore } from '@/stores/settings';

const props = defineProps<{ units: 'in' | 'cm' }>();
const emit = defineEmits<{
  create: [layout: Layout, borders: Border[], target?: QuiltTarget];
}>();

const open = ref(false);
const step = ref('blocks');
// Layout and target size first; the chosen layout's own settings next (spec 006 FR-001a).
const steps = ['blocks', 'detail', 'sashing', 'borders'];
const next = computed(() => steps[steps.indexOf(step.value) + 1]);
const detailTitle = computed(() =>
  isStrip.value
    ? 'Strips'
    : style.value === 'one-patch' || style.value === 'shaped-blocks'
      ? 'Shape'
      : 'Size',
);
/** A size to aim at, drawn over the preview and saved with the quilt. */
const targetInput = ref<TargetInput>({ choice: null, region: 'us' });
const targetShape = computed(() => resolveTarget(targetInput.value, props.units));
const isGarment = computed(
  () => targetInput.value.choice === 'top' || targetInput.value.choice === 'pants',
);
// Garment pieces have no borders: picking one sets them to none, leaving garments brings back
// the default border (unless the count was changed meanwhile).
watch(isGarment, (g) => {
  if (g) borderCount.value = 0;
  else if (borderCount.value === 0) borderCount.value = 1;
});
const style = ref<Style>('straight-set');
/** Block layouts or patch layouts (spec 026). */
const mode = ref<'blocks' | 'patches'>('blocks');
watch(mode, (m) => {
  if (!STYLES.find((x) => x.value === style.value)!.modes.includes(m))
    style.value = STYLES.find((x) => x.modes.includes(m))!.value;
});
const cols = ref(5);
const rows = ref(5);
const blockSize = ref(10);
const sash = ref(0);
const sashBorder = ref(false);
const borderCount = ref(1);
const borderWidth = ref(2);

const k = computed(() => (props.units === 'cm' ? 2.5 : 1));
type EdgeChoice = 'trim' | 'none';
const STRAIGHT: PatchShape[] = ['squares', 'rectangles', 'half-square-triangles'];
const TWO_SIZES: PatchShape[] = ['rectangles', 'bricks', 'half-square-triangles', 'tumblers'];
const ONE_SIZE: Partial<Record<PatchShape, string>> = {
  squares: 'Patch size',
  triangles: 'Side',
  diamonds: 'Side',
  hexagons: 'Side',
  clamshells: 'Width',
  octagons: 'Width',
};
// Fields of the four newer styles; switching style reloads them from that style's defaults.
const tile = reactive<{
  shape: PatchShape;
  edge: EdgeChoice;
  width: number;
  height: number;
  top: number;
  side: number;
  dside: number;
  flow: number;
}>({
  flow: 0,
  shape: 'hexagons',
  edge: 'trim',
  width: 3,
  height: 3,
  top: 3,
  side: 3,
  dside: 3,
});
const twoSizes = computed(() => TWO_SIZES.includes(tile.shape));
const oneSizeLabel = computed(() => ONE_SIZE[tile.shape] ?? 'Size');
function loadTile() {
  const d = layoutDefaults(style.value, k.value);
  if (!d) return;
  if ('shape' in d) tile.shape = d.shape;
  tile.flow = 0;
  tile.edge = 'edge' in d && typeof d.edge === 'string' ? d.edge : 'trim';
  if ('width' in d) tile.width = d.width;
  if ('height' in d) tile.height = d.height;
  if ('top' in d) tile.top = d.top;
  if ('side' in d) tile.side = d.side;
  tile.dside = 3 * k.value;
}
watch(style, loadTile);
const clampCount = (n: number) => Math.min(100, Math.max(1, Math.round(n || 1)));
/** Styles with a turnable grid (spec 026 flow angle). */
const flows = computed(
  () =>
    ['shaped-blocks', 'baby-blocks', 'variable-blocks'].includes(style.value) ||
    (style.value === 'one-patch' && FLOWS.includes(tile.shape)),
);
const flow = () => (flows.value && tile.flow ? { flow: tile.flow } : {});
const isBlockShape = (s: PatchShape): s is ShapedBlocksLayout['shape'] => FLOWS.includes(s);
const stripLayout = ref<StripLayout>(stripDefaults(1));
const isStrip = computed(() => style.value === 'strips');
const layout = computed<Layout>(() =>
  isStrip.value
    ? stripLayout.value
    : style.value === 'diamond-point'
      ? {
          ...(layoutDefaults('diamond-point', k.value) as VariablePointLayout),
          cols: clampCount(cols.value),
          rows: clampCount(rows.value),
          width: tile.width,
          height: tile.width * Math.sqrt(3),
          sash: sash.value,
        }
      : style.value === 'shaped-blocks'
        ? {
            ...(layoutDefaults('shaped-blocks', k.value) as ShapedBlocksLayout),
            shape: isBlockShape(tile.shape) ? tile.shape : 'hexagons',
            cols: clampCount(cols.value),
            rows: clampCount(rows.value),
            width: tile.width,
            edge: tile.edge,
            ...flow(),
          }
        : style.value === 'variable-point'
          ? {
              ...(layoutDefaults('variable-point', k.value) as VariablePointLayout),
              cols: clampCount(cols.value),
              rows: clampCount(rows.value),
              width: tile.width,
              height: tile.height,
              sash: sash.value,
            }
          : style.value === 'one-patch'
            ? {
                ...(layoutDefaults('one-patch', k.value) as OnePatchLayout),
                shape: tile.shape,
                cols: clampCount(cols.value),
                rows: clampCount(rows.value),
                width: tile.width,
                height: twoSizes.value ? tile.height : tile.width,
                edge: STRAIGHT.includes(tile.shape) ? 'trim' : tile.edge,
                ...flow(),
              }
            : style.value === 'baby-blocks'
              ? {
                  ...(layoutDefaults('baby-blocks', k.value) as TumblingLayout),
                  cols: clampCount(cols.value),
                  rows: clampCount(rows.value),
                  width: tile.dside * Math.sqrt(3),
                  top: tile.dside,
                  side: tile.dside,
                  edge: tile.edge,
                  ...flow(),
                }
              : style.value === 'variable-blocks'
                ? {
                    ...(layoutDefaults('variable-blocks', k.value) as TumblingLayout),
                    cols: clampCount(cols.value),
                    rows: clampCount(rows.value),
                    width: tile.width,
                    top: tile.top,
                    side: tile.side,
                    edge: tile.edge,
                    ...flow(),
                  }
                : style.value === 'on-point'
                  ? {
                      ...onPointDefaults(props.units === 'cm' ? 2.5 : 1),
                      cols: clampCount(cols.value),
                      rows: clampCount(rows.value),
                      block: blockSize.value,
                      sash: sash.value,
                    }
                  : {
                      style: 'straight-set',
                      cols: clampCount(cols.value),
                      rows: clampCount(rows.value),
                      block: [blockSize.value, blockSize.value],
                      sash: [sash.value, sash.value],
                      sashBorder: sash.value > 0 && sashBorder.value,
                    },
);
const borders = computed<Border[]>(() =>
  Array.from({ length: Math.max(0, Math.min(5, Math.round(borderCount.value || 0))) }, () => ({
    style: 'long-horizontal',
    sides: [borderWidth.value, borderWidth.value, borderWidth.value, borderWidth.value],
  })),
);
const generated = computed(() => generateSlots(layout.value, borders.value));
const preview = computed(() => {
  const pic = picture(layout.value, borders.value);
  const t = targetShape.value;
  if (!pic || !t) return pic && { ...pic, target: null, core: null };
  // The target is centered on the quilt; the picture grows to show both.
  const [x0, y0, x1, y1] = generated.value.bounds;
  const p = placeTarget(t, generated.value.bounds);
  const d = `M${p.outline.map((q) => `${q[0]} ${q[1]}`).join('L')}Z`;
  const core = p.core && { x: p.core[0], y: p.core[1], w: p.core[2], h: p.core[3] };
  const [a, b] = [Math.min(x0, p.box[0]), Math.min(y0, p.box[1])];
  const [c, e] = [Math.max(x1, p.box[2]), Math.max(y1, p.box[3])];
  return { ...pic, box: `${a} ${b} ${c - a} ${e - b}`, target: { d }, core };
});

const onPointish = (st: Style) =>
  st === 'on-point' || st === 'variable-point' || st === 'diamond-point';
const cubes = (st: Style) => st === 'baby-blocks' || st === 'variable-blocks';
const hasSash = computed(() =>
  ['straight-set', 'on-point', 'variable-point', 'diamond-point'].includes(style.value),
);
const acrossLabel = computed(() =>
  onPointish(style.value)
    ? 'Blocks across'
    : style.value === 'one-patch'
      ? 'Patches across'
      : cubes(style.value)
        ? 'Cubes across'
        : style.value === 'shaped-blocks'
          ? 'Blocks across'
          : 'Columns',
);
const downLabel = computed(() =>
  onPointish(style.value)
    ? 'Blocks down'
    : style.value === 'one-patch'
      ? 'Patches down'
      : cubes(style.value)
        ? 'Cubes down'
        : style.value === 'shaped-blocks'
          ? 'Blocks down'
          : 'Rows',
);
/** Card labels on the Size page: how many, and how big. */
const countLabel = computed(() =>
  style.value === 'straight-set'
    ? 'Columns and rows'
    : style.value === 'one-patch'
      ? 'Patches'
      : cubes(style.value)
        ? 'Cubes'
        : 'Blocks',
);
const sizeLabel = computed(() =>
  style.value === 'variable-point' ||
  style.value === 'diamond-point' ||
  style.value === 'baby-blocks'
    ? 'Diamond size'
    : style.value === 'variable-blocks'
      ? 'Cube size'
      : style.value === 'one-patch'
        ? 'Patch size'
        : 'Block size',
);
const styleLabel = computed(() => STYLES.find((x) => x.value === style.value)?.label ?? '');
const SHAPES: [PatchShape, string][] = [
  ['squares', 'Squares'],
  ['rectangles', 'Rectangles'],
  ['bricks', 'Bricks'],
  ['half-square-triangles', 'Half-square triangles'],
  ['triangles', 'Triangles'],
  ['diamonds', '60° diamonds'],
  ['hexagons', 'Hexagons'],
  ['tumblers', 'Tumblers'],
  ['clamshells', 'Clamshells'],
  ['octagons', 'Octagons and squares'],
];
const shapeCards = SHAPES.map(([value, label]) => ({
  value,
  label,
  picture: picture(sampleOnePatch(value), [])!,
}));
const blockShapeCards = shapeCards.filter((c) => FLOWS.includes(c.value));
const allStyleCards = STYLES.map((x) => ({ ...x, picture: picture(x.sample, [])! }));
const styleCards = computed(() => allStyleCards.filter((x) => x.modes.includes(mode.value)));

const summary = computed(() => {
  const [x0, y0, x1, y1] = generated.value.bounds;
  const n = (v: number) => +v.toFixed(2);
  const done = `Finished ${n(x1 - x0)} × ${n(y1 - y0)} ${props.units}`;
  const t = targetShape.value;
  if (!t) return done;
  const [w, h] = shapeSize(t);
  return `${done} · ${t.label} ${n(w)} × ${n(h)} ${props.units}`;
});

function create() {
  open.value = false;
  // A plain copy: the project freezes what it's given, and these are live, editable objects.
  const t = targetShape.value;
  // The first garment or bed made becomes the quilter's own, until changed in Settings.
  const settings = useSettingsStore().settings;
  const first = defaultsFrom(targetInput.value, props.units);
  for (const key of ['top', 'pants', 'bed'] as const)
    if (first[key] && !settings.overlayDefaults[key])
      settings.overlayDefaults = { ...settings.overlayDefaults, [key]: first[key] };
  const target: QuiltTarget | undefined = t
    ? { visible: true, input: targetInput.value, ...t }
    : undefined;
  emit(
    'create',
    JSON.parse(JSON.stringify(layout.value)) as Layout,
    borders.value,
    target && (JSON.parse(JSON.stringify(target)) as QuiltTarget),
  );
}

/** Open with the defaults for the project's units (FR-001). */
function show() {
  const cm = props.units === 'cm';
  step.value = 'blocks';
  mode.value = 'blocks';
  style.value = 'straight-set';
  targetInput.value = {
    choice: null,
    region: defaultRegion(useSettingsStore().settings.bedSizes, props.units),
  };
  cols.value = rows.value = 5;
  blockSize.value = cm ? 25 : 10;
  sash.value = 0;
  sashBorder.value = false;
  borderCount.value = 1;
  borderWidth.value = cm ? 5 : 2;
  stripLayout.value = stripDefaults(cm ? 2.5 : 1);
  loadTile();
  useEditorStore().selectedStrip = null;
  open.value = true;
}
defineExpose({ show });
</script>

<style scoped>
/* One size whatever the step shows: the content scrolls, the buttons stay put. */
.wizard {
  width: 760px;
  max-width: 95vw;
  height: min(720px, 92vh);
  max-height: none;
  display: flex;
  flex-direction: column;
}
.body {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  overflow-y: auto;
  /* Room for the scrollbar always, so nothing shifts when it appears. */
  scrollbar-gutter: stable;
  min-height: 0;
}
.steps {
  flex: 1 1 400px;
  min-width: 0;
}
.preview {
  flex: 1 1 260px;
  height: min(520px, 60vh);
  position: sticky;
  top: 0;
}
/* Beside the steps, the picture starts level with the step's first row. ponytail: 128px = the
   stepper header (104) + its content padding (24); measure again if the step header changes. */
@media (min-width: 720px) {
  .preview {
    padding-top: 128px;
    height: min(640px, 72vh);
  }
}
.preview svg {
  width: 100%;
  height: 100%;
}
.styles {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.style-card {
  width: 88px;
  padding: 6px 4px 2px;
  border: 2px solid transparent;
  border-radius: 6px;
  background: none;
  color: inherit;
  cursor: pointer;
}
.style-card:hover {
  background: rgba(0, 0, 0, 0.04);
}
.style-card.on {
  border-color: var(--q-primary);
}
.style-card svg {
  width: 64px;
  height: 64px;
}
/* Labels take two lines' room, so a card keeps its height when its label changes (Blocks / Patches). */
.style-card .text-caption {
  min-height: calc(2 * 1.25rem);
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
.preview-art path.border {
  fill: #eceff1;
}
.preview-art rect.core {
  fill: none;
  stroke: var(--q-primary);
  stroke-width: 1;
  stroke-dasharray: 2 3;
}
.preview-art .target {
  fill: var(--q-primary);
  fill-opacity: 0.12;
  stroke: var(--q-primary);
  stroke-width: 2;
  stroke-dasharray: 6 4;
}
:global(.body--dark .preview-art path) {
  stroke: #757575;
  fill: #2b2b2b;
}
:global(.body--dark .preview-art path.sash),
:global(.body--dark .preview-art path.cs),
:global(.body--dark .preview-art path.border) {
  fill: #3a3f44;
}
:global(.body--dark .preview-art path.set) {
  fill: #33404d;
}
</style>
