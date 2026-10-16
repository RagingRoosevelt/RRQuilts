<template>
  <q-dialog v-model="open">
    <q-card class="wizard">
      <div class="body">
        <q-stepper v-model="step" class="steps" flat animated header-nav alternative-labels>
          <q-step name="blocks" title="Blocks" icon="grid_on">
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
            <div v-if="isStrip" class="row q-col-gutter-sm">
              <q-input
                :model-value="stripLayout.strips.length"
                @update:model-value="(v) => setStripCount(Number(v))"
                class="col-6"
                dense
                outlined
                type="number"
                min="1"
                max="100"
                label="Number of strips"
              />
              <LengthInput
                :model-value="stripLayout.length"
                class="col-6"
                label="Length"
                :units="units"
                :min="1"
                @update:model-value="(v) => (stripLayout = { ...stripLayout, length: v })"
              />
            </div>
            <div v-else class="row q-col-gutter-sm">
              <q-input
                v-model.number="cols"
                class="col-6"
                dense
                outlined
                type="number"
                min="1"
                max="100"
                :label="style === 'on-point' ? 'Blocks across' : 'Columns'"
              />
              <q-input
                v-model.number="rows"
                class="col-6"
                dense
                outlined
                type="number"
                min="1"
                max="100"
                :label="style === 'on-point' ? 'Blocks down' : 'Rows'"
              />
              <LengthInput
                v-model="blockSize"
                class="col-12"
                label="Finished block size"
                :units="units"
                :min="0.5"
              />
            </div>
          </q-step>
          <q-step v-if="isStrip" name="strips" title="Strips" icon="view_stream">
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
          </q-step>
          <q-step name="sashing" title="Sashing" icon="view_comfy">
            <div v-if="isStrip" class="text-caption">
              Strip quilts have no sashing. Strips sit edge to edge.
            </div>
            <LengthInput v-else v-model="sash" label="Sashing width (0 for none)" :units="units" />
            <q-toggle
              v-if="style === 'horizontal'"
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
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              v-for="(p, i) in preview.paths"
              :key="i"
              :d="p.d"
              :class="p.kind"
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
import { computed, ref } from 'vue';
import LengthInput from '@/components/LengthInput.vue';
import StripsInspector from '@/components/StripsInspector.vue';
import { onPointDefaults, stripDefaults } from '@/model/io';
import { flattenLoop, pathToSegs } from '@/model/geometry/path';
import { generateSlots } from '@/model/layout/slots';
import type { Border, Layout, StripLayout } from '@/model/schema/quilt';
import { useEditorStore } from '@/stores/editor';

const props = defineProps<{ units: 'in' | 'cm' }>();
const emit = defineEmits<{ create: [layout: Layout, borders: Border[]] }>();

const open = ref(false);
const step = ref('blocks');
// Styles that need it get a customization step before Sashing (spec 017 FR-020).
const steps = computed(() => [
  'blocks',
  ...(isStrip.value ? ['strips'] : []),
  'sashing',
  'borders',
]);
const next = computed(() => steps.value[steps.value.indexOf(step.value) + 1]);
const style = ref<Style>('horizontal');
const cols = ref(5);
const rows = ref(5);
const blockSize = ref(10);
const sash = ref(0);
const sashBorder = ref(false);
const borderCount = ref(1);
const borderWidth = ref(2);

const clampCount = (n: number) => Math.min(100, Math.max(1, Math.round(n || 1)));
const stripLayout = ref<StripLayout>(stripDefaults(1));
const isStrip = computed(() => style.value === 'strips');
/** More or fewer strips: keeps the ones already set up, new ones alternate plain and blocks. */
function setStripCount(n: number) {
  const k = props.units === 'cm' ? 2.5 : 1;
  const all = stripDefaults(k, clampCount(n)).strips;
  const strips = all.map((s, i) => stripLayout.value.strips[i] ?? s);
  stripLayout.value = { ...stripLayout.value, strips };
}
const layout = computed<Layout>(() =>
  isStrip.value
    ? stripLayout.value
    : style.value === 'on-point'
      ? {
          ...onPointDefaults(props.units === 'cm' ? 2.5 : 1),
          cols: clampCount(cols.value),
          rows: clampCount(rows.value),
          block: blockSize.value,
          sash: sash.value,
        }
      : {
          style: 'horizontal',
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
// ponytail: plain SVG paths, capped; a canvas would be needed to preview very large quilts.
/** Outlines of a layout's spaces as SVG paths, or null when there are too many to draw. */
function picture(l: Layout, b: Border[]) {
  const g = generateSlots(l, b);
  // ponytail: plain SVG paths, capped; a canvas would be needed to preview very large quilts.
  if (g.slots.length > 6000) return null;
  const [x0, y0, x1, y1] = g.bounds;
  return {
    box: `${x0} ${y0} ${x1 - x0} ${y1 - y0}`,
    paths: g.slots.map((s) => ({
      kind: s.kind,
      d: `M${flattenLoop(pathToSegs(s.outline, [1, 1]), 0.05)
        .map((p) => `${p[0]} ${p[1]}`)
        .join('L')}Z`,
    })),
  };
}
const preview = computed(() => picture(layout.value, borders.value));

type Style = 'horizontal' | 'on-point' | 'strips';
const sampleStrips = (style: 'horizontal-strip' | 'vertical-strip'): Layout => ({
  style,
  length: 16,
  strips: ['plain', 'blocks', 'plain', 'blocks'].map((st, i) => ({
    id: `w${i}`,
    style: st as 'plain' | 'blocks',
    width: st === 'plain' ? 3 : 4,
    along: 4,
    across: 1,
  })),
});
/** Styles to pick from, each with a small sample. */
const STYLES: { value: Style; label: string; sample: Layout }[] = [
  {
    value: 'horizontal',
    label: 'Horizontal',
    sample: {
      style: 'horizontal',
      cols: 3,
      rows: 3,
      block: [1, 1],
      sash: [0, 0],
      sashBorder: false,
    },
  },
  {
    value: 'on-point',
    label: 'On-Point',
    sample: { ...onPointDefaults(1), block: 1, edge: { finish: 'exact', float: 0 } },
  },
  { value: 'strips', label: 'Strips', sample: sampleStrips('horizontal-strip') },
];
const styleCards = STYLES.map((x) => ({ ...x, picture: picture(x.sample, [])! }));

const summary = computed(() => {
  const [x0, y0, x1, y1] = generated.value.bounds;
  return `Finished ${+(x1 - x0).toFixed(2)} × ${+(y1 - y0).toFixed(2)} ${props.units}`;
});

function create() {
  open.value = false;
  // A plain copy: the project freezes what it's given, and these are live, editable objects.
  emit('create', JSON.parse(JSON.stringify(layout.value)) as Layout, borders.value);
}

/** Open with the defaults for the project's units (FR-001). */
function show() {
  const cm = props.units === 'cm';
  step.value = 'blocks';
  style.value = 'horizontal';
  cols.value = rows.value = 5;
  blockSize.value = cm ? 25 : 10;
  sash.value = 0;
  sashBorder.value = false;
  borderCount.value = 1;
  borderWidth.value = cm ? 5 : 2;
  stripLayout.value = stripDefaults(cm ? 2.5 : 1);
  useEditorStore().selectedStrip = null;
  open.value = true;
}
defineExpose({ show });
</script>

<style scoped>
.wizard {
  width: 760px;
  max-width: 95vw;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
}
.body {
  display: flex;
  flex-wrap: wrap;
  overflow-y: auto;
  min-height: 0;
}
.steps {
  flex: 1 1 400px;
  min-width: 0;
}
.preview {
  flex: 1 1 260px;
  height: 320px;
  position: sticky;
  top: 0;
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
