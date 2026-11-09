<template>
  <!-- Next steps for a data quilt (spec 041): the picked days' pieces, fabrics and templates, to
       print. Opened from Data Quilts or the data entry dialog. -->
  <q-page v-if="input" class="row no-wrap items-stretch steps-page">
    <div class="options q-pa-md column" style="gap: 12px">
      <q-btn
        flat
        dense
        no-caps
        icon="arrow_back"
        label="Data Quilts"
        class="self-start"
        to="/data"
      />
      <div>
        <div class="text-subtitle1">{{ quilt?.notecard.name }}</div>
        <div class="text-caption text-grey-7">{{ input.doc.project.name }}</div>
      </div>
      <div class="text-body2">{{ daysNote }}</div>
      <q-toggle
        :model-value="prefs.tint"
        dense
        label="Tint by fabric"
        @update:model-value="(v: boolean) => set('tint', v)"
      >
        <q-tooltip>A template for each piece and fabric, tinted; off: one per shape</q-tooltip>
      </q-toggle>
      <q-toggle
        v-if="quilt?.notecard.notes"
        :model-value="prefs.stepsNotes"
        dense
        label="Quilt notes"
        @update:model-value="(v: boolean) => set('stepsNotes', v)"
      >
        <q-tooltip>Print the quilt's notes after the steps</q-tooltip>
      </q-toggle>
    </div>
    <div class="col column" style="min-width: 0">
      <PrintPreview kind="steps" :id="input.quiltId" :doc="input.doc" :days="input.days ?? []" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import PrintPreview from '@/components/PrintPreview.vue';
import { printPrefs, type PrintPrefs } from '@/model/print/prefs';
import { useDataQuiltsStore } from '@/stores/data-quilts';
import { useSettingsStore } from '@/stores/settings';

const store = useDataQuiltsStore();
const app = useSettingsStore();
const router = useRouter();
const input = computed(() => store.stepsInput);
const quilt = computed(() =>
  input.value?.doc.project.quilts.find((q) => q.id === input.value!.quiltId),
);
const prefs = computed(() => printPrefs(app.settings.print));
function set<K extends keyof PrintPrefs>(key: K, value: PrintPrefs[K]) {
  app.settings.print = { ...app.settings.print, [key]: value };
}
const daysNote = computed(() => {
  const n = input.value?.days?.length ?? 0;
  return n ? `${n} ${n === 1 ? 'day' : 'days'}` : 'No days picked';
});
// Opened directly (a reload): nothing to print, back to the list.
onMounted(() => !input.value && void router.replace('/data'));
</script>

<style scoped>
.steps-page {
  height: calc(100vh - 50px);
}
.options {
  width: 240px;
  flex: none;
  border-right: 1px solid rgba(128, 128, 128, 0.3);
}
</style>
