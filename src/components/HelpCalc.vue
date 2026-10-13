<template>
  <!-- A Quilt math calculator (help/calc.ts): finished sizes in, cut sizes out, in the user's units
       and print settings (seam allowance, rounding) so it matches the printouts. -->
  <q-card v-if="calc" flat bordered class="help-calc q-my-md">
    <q-card-section class="q-pb-sm">
      <div class="text-subtitle2">
        <q-icon name="calculate" class="q-mr-xs" />{{ calc.title }} calculator
      </div>
      <div class="text-caption text-grey-7">
        Seam allowance {{ fmtLen(ctx.seam, units) }} · cut sizes rounded up to
        {{ ctx.step ? fmtLen(ctx.step, units) : 'exact sizes' }} (change in Print settings)
      </div>
    </q-card-section>
    <q-card-section class="row q-pt-none" style="gap: 12px">
      <template v-for="i in calc.inputs" :key="i.key">
        <q-input
          v-if="i.count || i.raw"
          v-model.number="values[i.key]"
          type="number"
          :step="i.count ? 1 : 'any'"
          :min="i.count ? 1 : 0"
          outlined
          dense
          :label="i.label"
          style="width: 140px"
        />
        <LengthInput
          v-else
          v-model="values[i.key]!"
          :units="units"
          :min="0.25"
          :label="i.label"
          style="width: 200px"
        />
      </template>
    </q-card-section>
    <q-markup-table flat dense separator="horizontal" class="q-mx-md q-mb-md">
      <tbody>
        <tr v-for="r in rows" :key="r.label">
          <td class="text-grey-8">{{ r.label }}</td>
          <td class="text-weight-medium">{{ r.value }}</td>
        </tr>
      </tbody>
    </q-markup-table>
  </q-card>
  <q-banner v-else dense class="bg-warning text-dark q-my-md"
    >Unknown calculator “{{ name }}”.</q-banner
  >
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import LengthInput from '@/components/LengthInput.vue';
import { CALCULATORS, calcContext } from '@/help/calc';
import { fmtLen } from '@/model/print/format';
import { printPrefs } from '@/model/print/prefs';
import { useProjectStore } from '@/stores/project';
import { useSettingsStore } from '@/stores/settings';

const props = defineProps<{ name: string }>();
const project = useProjectStore();
const app = useSettingsStore();
const calc = computed(() => CALCULATORS[props.name]);
/** The open project's units, else the units for new projects. */
const units = computed(() => project.doc?.units ?? app.settings.units);
const ctx = computed(() => calcContext(units.value, printPrefs(app.settings.print)));
const values = reactive<Record<string, number>>(
  Object.fromEntries((calc.value?.inputs ?? []).map((i) => [i.key, i.start[units.value]])),
);
const rows = computed(() => {
  const c = calc.value;
  if (!c || c.inputs.some((i) => !(values[i.key]! > 0))) return [];
  return c.rows(values, ctx.value);
});
</script>

<style scoped>
.help-calc {
  max-width: 640px;
}
</style>
