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

    <q-expansion-item dense label="Paper" header-class="text-subtitle2" class="op-section">
      <div class="column q-pa-sm" style="gap: 8px">
        <q-select
          :model-value="prefs.paper[units]"
          :options="PAPERS[units]"
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
      </div>
    </q-expansion-item>

    <q-expansion-item dense label="Cutting" header-class="text-subtitle2" class="op-section">
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
      dense
      label="Fabric"
      header-class="text-subtitle2"
      class="op-section"
    >
      <div class="column q-pa-sm" style="gap: 8px">
        <q-select
          :model-value="prefs.width[units]"
          :options="WIDTHS[units]"
          option-value="id"
          emit-value
          map-options
          dense
          outlined
          label="Fabric width"
          @update:model-value="(v: string) => setUnit('width', v)"
        />
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

    <q-expansion-item dense label="Look" header-class="text-subtitle2" class="op-section">
      <div class="column q-pa-sm" style="gap: 8px">
        <q-select
          :model-value="prefs.lineWeight"
          :options="['thin', 'medium', 'thick']"
          dense
          outlined
          label="Line weight"
          @update:model-value="(v: PrintPrefs['lineWeight']) => set('lineWeight', v)"
        />
        <template v-if="kind === 'block'">
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
            label="Grain line arrow"
            @update:model-value="(v: boolean) => set('grain', v)"
          />
          <q-toggle
            :model-value="prefs.mirror"
            dense
            label="Mirror templates"
            @update:model-value="(v: boolean) => set('mirror', v)"
          />
        </template>
        <q-toggle
          :model-value="prefs.outline"
          dense
          label="Pictures as outlines only"
          @update:model-value="(v: boolean) => set('outline', v)"
        />
      </div>
    </q-expansion-item>

    <q-btn
      color="primary"
      no-caps
      icon="print"
      label="Preview & print"
      :disable="!sections.length"
      @click="preview"
    />
    <div class="text-caption text-grey-7">
      Print at 100% scale (no "fit to page"); check the scale square with a ruler. To save a PDF,
      pick "Save as PDF" in the print dialog.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import LengthInput from '@/components/LengthInput.vue';
import { generateSlots } from '@/model/layout/slots';
import { fmtLen } from '@/model/print/format';
import {
  FABRIC_STEPS,
  PAPERS,
  ROUNDINGS,
  WIDTHS,
  printPrefs,
  type PaperId,
  type PrintPrefs,
} from '@/model/print/prefs';
import { useProjectStore } from '@/stores/project';
import { useSettingsStore } from '@/stores/settings';

const props = defineProps<{
  kind: 'block' | 'quilt';
  id: string;
  coloringId?: string | undefined;
}>();

const project = useProjectStore();
const app = useSettingsStore();
const router = useRouter();
const units = computed(() => project.doc!.units);
const prefs = computed(() => printPrefs(app.settings.print));

function set<K extends keyof PrintPrefs>(key: K, value: PrintPrefs[K]) {
  app.settings.print = { ...app.settings.print, [key]: value };
}
type PerUnit = 'paper' | 'seam' | 'rounding' | 'width' | 'fabricStep' | 'overhang' | 'bindingWidth';
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
        { value: 'picture', label: 'Block picture' },
      ]
    : [
        { value: 'picture', label: 'Quilt picture' },
        { value: 'yardage', label: 'Yardage estimate' },
        { value: 'rotary', label: 'Rotary cutting chart' },
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

function preview() {
  const query: Record<string, string> = {};
  if (props.kind === 'block') {
    const fromQuilt = quiltSizes.value.find((u) => `quilt:${u.quilt.id}` === sizeSource.value);
    if (fromQuilt) query.quilt = fromQuilt.quilt.id;
    else {
      const s = sizeSource.value === 'custom' ? custom.value : block.value!.size;
      query.size = `${s[0]},${s[1]}`;
      if (props.coloringId) query.coloring = props.coloringId;
    }
  }
  void router.push({ path: `/project/print/${props.kind}/${props.id}`, query });
}
</script>

<style scoped>
.op-section {
  border: 1px solid rgba(128, 128, 128, 0.35);
  border-radius: 8px;
  overflow: hidden;
}
</style>
