<template>
  <div class="column" style="gap: 12px">
    <div class="column" style="gap: 8px">
      <div class="text-subtitle2">Shape</div>
      <q-list v-if="!hideItems && stl.items.length > 1" dense bordered separator class="items">
        <q-item
          v-for="(it, i) in stl.items"
          :key="it.key"
          clickable
          :active="stl.item === it"
          @click="stl.pick(i)"
        >
          <q-item-section avatar>
            <svg :viewBox="box(it.poly)" width="28" height="28">
              <polygon :points="pts(it.poly)" class="outline" />
            </svg>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ it.label }}</q-item-label>
            <q-item-label v-if="!it.convex" caption>Concave: no template yet</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <q-select
        v-if="stl.kind === 'shape'"
        :model-value="stl.nU"
        :options="SIZES"
        emit-value
        map-options
        dense
        outlined
        label="Size"
        @update:model-value="stl.setNU"
      />
      <div v-if="stl.fromQuilt" class="text-caption text-grey-7">
        1U = {{ fmtLen(stl.unit, stl.units) }} and the seam allowance
        {{ fmtLen(stl.seam, stl.units) }}, as set for the quilt.
      </div>
      <LengthInput
        v-else-if="stl.kind === 'shape' || stl.kind === 'rosette'"
        :model-value="stl.unit"
        label="1U length"
        :units="stl.units"
        :min="stl.units === 'in' ? 0.25 : 0.5"
        @update:model-value="stl.setUnit"
      />
      <template v-if="stl.kind === 'block'">
        <q-select
          :model-value="stl.blockSize.sizeSource"
          :options="stl.blockSize.sizeOptions"
          emit-value
          map-options
          dense
          outlined
          label="Block size"
          @update:model-value="stl.setBlockSize"
        />
        <div v-if="stl.blockSize.sizeSource === 'custom'" class="row no-wrap" style="gap: 8px">
          <LengthInput
            :model-value="stl.blockSize.custom[0]"
            class="col"
            label="Width"
            :units="stl.units"
            :min="0.5"
            @update:model-value="(v: number) => stl.setCustom(0, v)"
          />
          <LengthInput
            :model-value="stl.blockSize.custom[1]"
            class="col"
            label="Height"
            :units="stl.units"
            :min="0.5"
            @update:model-value="(v: number) => stl.setCustom(1, v)"
          />
        </div>
      </template>
    </div>

    <div class="column" style="gap: 4px">
      <div class="text-subtitle2">Template</div>
      <q-option-group
        :model-value="stl.opts.fabric"
        :options="KINDS"
        dense
        @update:model-value="(v: boolean) => stl.set({ fabric: v })"
      />
      <template v-if="stl.opts.fabric">
        <LengthInput
          v-if="!stl.fromQuilt"
          class="q-mt-sm"
          :model-value="stl.seam"
          label="Seam allowance"
          :units="stl.units"
          @update:model-value="stl.setSeam"
        />
        <q-checkbox
          :model-value="stl.opts.trim"
          dense
          label="Trim points sharper than 90°"
          class="q-mt-sm"
          @update:model-value="(v: boolean) => stl.set({ trim: v })"
        />
        <div v-if="!stl.canTrim" class="text-caption text-grey-7">
          This shape has no corners sharper than 90°: nothing to trim.
        </div>
      </template>
    </div>

    <q-expansion-item v-model="advanced" dense label="Advanced" class="op-section">
      <div class="column q-pa-sm" style="gap: 8px">
        <q-input
          v-for="f in FIELDS"
          :key="f.key"
          :model-value="f.key === 'cIn' && stl.opts.cIn < 0 ? '' : stl.opts[f.key]"
          type="number"
          dense
          outlined
          :step="0.1"
          :label="f.label"
          stack-label
          :placeholder="f.key === 'cIn' ? `Auto (${autoChamfer})` : undefined"
          :hint="f.key === 'cIn' ? 'Blank: (height − floor) / 2' : undefined"
          suffix="mm"
          @update:model-value="(v) => setField(f.key, v)"
        />
        <q-btn flat dense no-caps icon="restart_alt" label="Back to defaults" @click="reset" />
      </div>
    </q-expansion-item>
  </div>
</template>

<script setup lang="ts">
// The 3D Print tab's sidebar (spec 027 stretch goal; owner, 2026-11-13): which shape, paper or
// fabric, and the build under Advanced (collapsed).
import { computed, ref } from 'vue';
import LengthInput from '@/components/LengthInput.vue';
import type { Stl } from '@/composables/stl';
import type { Pt } from '@/model/geometry/path';
import { fmtLen } from '@/model/print/format';
import { STL_BUILD, type StlBuild } from '@/model/print/stl';

const props = defineProps<{ stl: Stl; hideItems?: boolean }>();

const SIZES = [1, 2, 3, 4].map((n) => ({ value: n, label: `${n}U` }));
const KINDS = [
  { value: false, label: 'Paper (finished size)' },
  { value: true, label: 'Fabric (with seam allowance)' },
];
const FIELDS: { key: keyof StlBuild; label: string }[] = [
  { key: 'height', label: 'Height' },
  { key: 'floor', label: 'Floor' },
  { key: 'wall', label: 'Outer wall' },
  { key: 'rOut', label: 'Outer corner radius' },
  { key: 'rIn', label: 'Inner corner radius' },
  { key: 'cOut', label: 'Outer edge chamfer' },
  { key: 'cIn', label: 'Inner edge chamfer' },
  { key: 'depth', label: 'Text depth' },
];
const advanced = ref(false);
const autoChamfer = computed(
  () => +((props.stl.opts.height - props.stl.opts.floor) / 2).toFixed(2),
);

function setField(key: keyof StlBuild, v: string | number | null) {
  const n = v === '' || v === null ? NaN : Number(v);
  // A blank inner chamfer follows the height and floor; other blanks are ignored.
  if (key === 'cIn' && !Number.isFinite(n)) return props.stl.set({ cIn: -1 });
  if (Number.isFinite(n) && n >= 0) props.stl.set({ [key]: n });
}
const reset = () => props.stl.set({ ...STL_BUILD });

/** A small outline thumbnail (y down, as drawn). */
const box = (poly: Pt[]) => {
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  const [x0, y0] = [Math.min(...xs), Math.min(...ys)];
  const s = Math.max(Math.max(...xs) - x0, Math.max(...ys) - y0) || 1;
  const pad = s * 0.08;
  return `${x0 - pad} ${y0 - pad} ${s + 2 * pad} ${s + 2 * pad}`;
};
const pts = (poly: Pt[]) => poly.map((p) => p.join(',')).join(' ');
</script>

<style scoped>
.items {
  border-radius: 6px;
  max-height: 40vh;
  overflow-y: auto;
}
.outline {
  fill: rgba(25, 118, 210, 0.25);
  stroke: currentColor;
  stroke-width: 1.5;
  vector-effect: non-scaling-stroke;
}
.op-section {
  border: 1px solid rgba(128, 128, 128, 0.35);
  border-radius: 8px;
  overflow: hidden;
}
</style>
