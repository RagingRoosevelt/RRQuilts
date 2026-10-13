<template>
  <div v-if="project.doc" class="column" style="gap: 12px">
    <div>
      <div class="text-subtitle2">Print</div>
      <q-option-group
        :model-value="sections"
        :options="sectionOptions"
        type="checkbox"
        dense
        @update:model-value="setSections"
      />
    </div>

    <template v-if="kind === 'block'">
      <q-select
        v-model="sizeSource"
        :options="sizeOptions"
        emit-value
        map-options
        dense
        outlined
        label="Size"
      />
      <div v-if="sizeSource === 'custom'" class="row no-wrap" style="gap: 8px">
        <LengthInput v-model="custom[0]" class="col" label="Width" :units="units" :min="0.5" />
        <LengthInput v-model="custom[1]" class="col" label="Height" :units="units" :min="0.5" />
      </div>
    </template>

    <q-expansion-item
      :model-value="open('Paper')"
      dense
      label="Paper"
      header-class="text-subtitle2"
      class="op-section"
      @update:model-value="(v) => setOpen('Paper', v)"
    >
      <div class="column q-pa-sm" style="gap: 8px">
        <q-select
          :model-value="paper.id"
          :options="PAPERS"
          option-value="id"
          emit-value
          map-options
          dense
          outlined
          label="Paper"
          @update:model-value="(v: PaperId) => setUnit('paper', v)"
        />
        <q-btn-toggle
          :model-value="prefs.landscape"
          no-caps
          dense
          :options="[
            { label: 'Portrait', value: false },
            { label: 'Landscape', value: true },
          ]"
          @update:model-value="(v: boolean) => set('landscape', v)"
        />
        <LengthInput
          :model-value="prefs.margin[units]"
          label="Margins"
          :units="units"
          :min="units === 'in' ? 0.125 : 0.3"
          @update:model-value="(v: number) => setUnit('margin', v)"
        />
      </div>
    </q-expansion-item>

    <q-expansion-item
      :model-value="open('Cutting')"
      dense
      label="Cutting"
      header-class="text-subtitle2"
      class="op-section"
      @update:model-value="(v) => setOpen('Cutting', v)"
    >
      <div class="column q-pa-sm" style="gap: 8px">
        <LengthInput
          :model-value="prefs.seam[units]"
          label="Seam allowance"
          :units="units"
          :min="0"
          @update:model-value="(v: number) => setUnit('seam', v)"
        />
        <q-select
          :model-value="prefs.rounding[units]"
          :options="roundingOptions"
          emit-value
          map-options
          dense
          outlined
          label="Cut size rounding"
          @update:model-value="(v: number) => setUnit('rounding', v)"
        />
      </div>
    </q-expansion-item>

    <q-expansion-item
      v-if="kind === 'quilt'"
      :model-value="open('Fabric')"
      dense
      label="Fabric"
      header-class="text-subtitle2"
      class="op-section"
      @update:model-value="(v) => setOpen('Fabric', v)"
    >
      <div class="column q-pa-sm" style="gap: 8px">
        <q-select
          :model-value="prefs.fabricStep[units]"
          :options="fabricStepOptions"
          emit-value
          map-options
          dense
          outlined
          label="Fabric rounding"
          @update:model-value="(v: number) => setUnit('fabricStep', v)"
        />
        <LengthInput
          :model-value="prefs.overhang[units]"
          label="Backing extra per side"
          :units="units"
          :min="0"
          @update:model-value="(v: number) => setUnit('overhang', v)"
        />
        <LengthInput
          :model-value="prefs.bindingWidth[units]"
          label="Binding strip width"
          :units="units"
          :min="0.5"
          @update:model-value="(v: number) => setUnit('bindingWidth', v)"
        />
      </div>
    </q-expansion-item>

    <q-expansion-item
      :model-value="open('Templates')"
      dense
      label="Templates"
      header-class="text-subtitle2"
      class="op-section"
      @update:model-value="(v) => setOpen('Templates', v)"
    >
      <div class="column q-pa-sm" style="gap: 8px">
        <q-toggle
          :model-value="prefs.seamAllowance"
          dense
          label="Include seam allowance"
          @update:model-value="(v: boolean) => set('seamAllowance', v)"
        />
        <q-toggle
          :model-value="prefs.trimPoints"
          dense
          :disable="!prefs.seamAllowance"
          label="Trimmed points"
          @update:model-value="(v: boolean) => set('trimPoints', v)"
        />
        <q-toggle
          :model-value="prefs.shadeSeam"
          dense
          :disable="!prefs.seamAllowance"
          label="Shaded seam allowance"
          @update:model-value="(v: boolean) => set('shadeSeam', v)"
        />
        <q-select
          :model-value="prefs.cutLine"
          :options="['solid', 'dashed']"
          dense
          outlined
          label="Cutting line"
          @update:model-value="(v: PrintPrefs['cutLine']) => set('cutLine', v)"
        />
        <q-select
          :model-value="prefs.sewLine"
          :options="['dashed', 'dotted', 'solid', 'none']"
          dense
          outlined
          label="Sewing line"
          @update:model-value="(v: PrintPrefs['sewLine']) => set('sewLine', v)"
        />
        <q-toggle
          :model-value="prefs.grain"
          dense
          label="Grain lines"
          @update:model-value="(v: boolean) => set('grain', v)"
        />
        <q-toggle
          :model-value="prefs.mirror"
          dense
          label="Mirror templates"
          @update:model-value="(v: boolean) => set('mirror', v)"
        />
        <q-toggle
          :model-value="prefs.curveMarks"
          dense
          label="Curve alignment marks"
          @update:model-value="(v: boolean) => set('curveMarks', v)"
        />
        <q-toggle
          :model-value="prefs.tint"
          dense
          label="Tint by fabric"
          @update:model-value="(v: boolean) => set('tint', v)"
        />
        <q-toggle
          :model-value="prefs.keyOnBlockPage"
          dense
          label="Template key on the block page"
          @update:model-value="(v: boolean) => set('keyOnBlockPage', v)"
        />
        <q-toggle
          :model-value="prefs.onePerPage"
          dense
          label="One template per page"
          @update:model-value="(v: boolean) => set('onePerPage', v)"
        />
        <div>
          <div class="text-caption text-grey-7">Labels on each template</div>
          <div class="text-caption text-grey-7">(unchecked ones print under it)</div>
          <div class="label-grid">
            <q-checkbox
              v-for="l in LABELS"
              :key="l.key"
              :model-value="prefs.labels[l.key]"
              dense
              :label="l.label"
              @update:model-value="(v: boolean) => set('labels', { ...prefs.labels, [l.key]: v })"
            />
          </div>
        </div>
      </div>
    </q-expansion-item>

    <q-expansion-item
      :model-value="open('Look')"
      dense
      label="Look"
      header-class="text-subtitle2"
      class="op-section"
      @update:model-value="(v) => setOpen('Look', v)"
    >
      <div class="column q-pa-sm" style="gap: 8px">
        <q-select
          :model-value="prefs.lineWeight"
          :options="['thin', 'medium', 'thick']"
          dense
          outlined
          label="Line weight"
          @update:model-value="(v: PrintPrefs['lineWeight']) => set('lineWeight', v)"
        />
        <q-toggle
          :model-value="prefs.outline"
          dense
          label="Pictures as outlines only"
          @update:model-value="(v: boolean) => set('outline', v)"
        />
      </div>
    </q-expansion-item>

    <div class="text-caption text-grey-7">
      Print at 100% scale (no "fit to page"); check the scale square with a ruler. To save a PDF,
      pick "Save as PDF" in the print dialog.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import LengthInput from '@/components/LengthInput.vue';
import { generateSlots } from '@/model/layout/slots';
import { fmtLen } from '@/model/print/format';
import {
  FABRIC_STEPS,
  PAPERS,
  type PaperId,
  ROUNDINGS,
  pick,
  printPrefs,
  type PrintTarget,
  type PrintPrefs,
} from '@/model/print/prefs';
import { useProjectStore } from '@/stores/project';
import { useSettingsStore } from '@/stores/settings';

const props = defineProps<{
  kind: 'block' | 'quilt';
  id: string;
  coloringId?: string | undefined;
}>();
const emit = defineEmits<{ target: [target: PrintTarget] }>();

const project = useProjectStore();
const app = useSettingsStore();
const units = computed(() => project.doc!.units);
const prefs = computed(() => printPrefs(app.settings.print));
const paper = computed(() => pick(PAPERS, prefs.value.paper[units.value]));

function set<K extends keyof PrintPrefs>(key: K, value: PrintPrefs[K]) {
  app.settings.print = { ...app.settings.print, [key]: value };
}
type PerUnit =
  'paper' | 'margin' | 'seam' | 'rounding' | 'fabricStep' | 'overhang' | 'bindingWidth';
function setUnit<K extends PerUnit>(key: K, value: PrintPrefs[K]['in']) {
  set(key, { ...prefs.value[key], [units.value]: value });
}

// "Up to the next ⅛″": rounding never makes a piece smaller than it needs to be.
const roundingOptions = computed(() =>
  ROUNDINGS[units.value].map((r) => ({
    value: r.value,
    label: r.value ? `Up to the next ${r.label}` : 'None (exact sizes)',
  })),
);
const fabricStepOptions = computed(() =>
  FABRIC_STEPS[units.value].map((f) => ({ value: f.value, label: `Up to the next ${f.label}` })),
);

const sectionOptions = computed(() =>
  props.kind === 'block'
    ? [
        { value: 'templates', label: 'Templates' },
        { value: 'rotary', label: 'Rotary cutting chart' },
        { value: 'picture', label: 'Block page (picture, fabric, credits)' },
      ]
    : [
        { value: 'picture', label: 'Quilt picture' },
        { value: 'blocks', label: 'Block pages (picture, fabric, credits)' },
        { value: 'yardage', label: 'Yardage estimate' },
        { value: 'rotary', label: 'Rotary cutting chart' },
        { value: 'templates', label: 'Templates (each block)' },
      ],
);
const sections = computed<string[]>(() =>
  props.kind === 'block' ? prefs.value.blockSections : prefs.value.quiltSections,
);
const setSections = (v: string[]) =>
  props.kind === 'block'
    ? set('blockSections', v as PrintPrefs['blockSections'])
    : set('quiltSections', v as PrintPrefs['quiltSections']);

// Block size: its own, as used in a quilt (counts from that quilt), or custom.
const block = computed(() => project.doc!.project.blocks.find((b) => b.id === props.id));
const fmtSize = (s: [number, number]) =>
  `${fmtLen(s[0], units.value)} × ${fmtLen(s[1], units.value)}`;
const quiltSizes = computed(() =>
  project.doc!.project.quilts.flatMap((q) => {
    const slot = generateSlots(q.layout, q.borders).slots.find(
      (s) => q.layers[0].slots[s.id]?.block === props.id,
    );
    return slot
      ? [{ quilt: q, size: [slot.transform[0], slot.transform[3]] as [number, number] }]
      : [];
  }),
);
const sizeOptions = computed(() => [
  ...quiltSizes.value.map((u) => ({
    value: `quilt:${u.quilt.id}`,
    label: `As in “${u.quilt.notecard.name}” (${fmtSize(u.size)})`,
  })),
  ...(block.value ? [{ value: 'own', label: `Block size (${fmtSize(block.value.size)})` }] : []),
  { value: 'custom', label: 'Custom size' },
]);
const sizeSource = ref(sizeOptions.value[0]!.value);
const custom = ref<[number, number]>(block.value ? [...block.value.size] : [10, 10]);

const LABELS = [
  { key: 'letter', label: 'Letter' },
  { key: 'counts', label: 'Cut counts' },
  { key: 'size', label: 'Finished size' },
  { key: 'color', label: 'Color key' },
] as const;

// What the preview prints (sent up whenever it changes).
const target = computed<PrintTarget>(() => {
  if (props.kind !== 'block') return {};
  const fromQuilt = quiltSizes.value.find((u) => `quilt:${u.quilt.id}` === sizeSource.value);
  if (fromQuilt) return { quilt: fromQuilt.quilt.id };
  const size = sizeSource.value === 'custom' ? custom.value : block.value!.size;
  return { size: [size[0], size[1]], coloring: props.coloringId };
});
watch(target, (t) => emit('target', t), { immediate: true, deep: true });

// Open/closed sections are remembered app-wide (spec 007 BlockInspector does the same).
const open = (label: string) => !app.settings.collapsedSections.includes(`print:${label}`);
function setOpen(label: string, value: boolean) {
  const key = `print:${label}`;
  const rest = app.settings.collapsedSections.filter((l) => l !== key);
  app.settings.collapsedSections = value ? rest : [...rest, key];
}
</script>

<style scoped>
.label-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 4px 8px;
}
.op-section {
  border: 1px solid rgba(128, 128, 128, 0.35);
  border-radius: 8px;
  overflow: hidden;
}
</style>
