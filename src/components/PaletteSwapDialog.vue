<template>
  <!-- A new block coloring or quilt color variant from a palette swap: pick a palette and each color
       becomes its nearest there (or map each by hand), with before and after pictures. -->
  <q-dialog v-model="open">
    <q-card v-if="job" style="width: 520px; max-width: 95vw">
      <q-card-section>
        <div class="text-h6">{{ job.heading }}</div>
        <div class="text-caption text-grey-7">
          Pick a palette: each color of {{ job.title }} becomes its nearest color or fabric there,
          and you can change any of them.
        </div>
        <q-select
          :model-value="to"
          :options="swapPalettes"
          option-value="id"
          option-label="label"
          emit-value
          map-options
          dense
          outlined
          clearable
          label="Palette"
          class="q-mt-sm"
          @update:model-value="pick"
        />
      </q-card-section>
      <q-card-section class="column q-pt-none" style="gap: 8px">
        <div v-for="c in job.used" :key="c.id" class="row items-center no-wrap" style="gap: 8px">
          <div class="ps-swatch big" :style="optStyle(c)" />
          <div class="ellipsis" style="width: 110px">{{ c.notecard.name }}</div>
          <q-icon name="arrow_forward" />
          <q-select
            v-model="map[c.id]"
            :options="options"
            option-value="id"
            :option-label="(o) => o.notecard.name"
            emit-value
            map-options
            dense
            outlined
            class="col"
          >
            <template #prepend>
              <div class="ps-swatch" :style="optStyle(options.find((o) => o.id === map[c.id]))" />
            </template>
            <template #option="{ itemProps, opt }">
              <q-item v-bind="itemProps" dense>
                <q-item-section side>
                  <div class="ps-swatch" :style="optStyle(opt)" />
                </q-item-section>
                <q-item-section>
                  {{ opt.notecard.name }}
                  <span class="text-caption text-grey-7">{{ opt.from }}</span>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </q-card-section>
      <!-- Before and after, half the width each (at most 500px tall). -->
      <q-card-section class="row no-wrap q-pt-none" style="gap: 12px">
        <div v-for="side in ['Before', 'After']" :key="side" class="ps-side column items-center">
          <img :src="side === 'After' ? after : job.before" class="ps-picture" alt="" />
          <div class="text-caption">{{ side }}</div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn v-close-popup flat no-caps label="Cancel" />
        <q-btn v-close-popup flat no-caps color="primary" :label="job.okLabel" @click="ok" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { castDraft, produce } from 'immer';
import { computed, ref, shallowRef, toRaw } from 'vue';
import { nearestColor } from '@/editor/color';
import type { RrqDoc } from '@/model/schema/project';
import { optStyle, useSwapOptions, type Opt } from '@/composables/swap-options';
import { useProjectStore } from '@/stores/project';

/** One swap: what's swapped, its picture now, and its picture after (`map`: paint id → paint id;
 *  `doc`: the project with any library fabrics picked lent to it). */
type Job = {
  heading: string;
  title: string;
  okLabel: string;
  used: Opt[];
  before: string;
  preview: (map: Record<string, string>, name: string | undefined, doc: RrqDoc) => string;
  done: (map: Record<string, string>, name: string | undefined) => void;
};

const project = useProjectStore();
const { swapPalettes, swapOptions } = useSwapOptions();
const open = ref(false);
const job = shallowRef<Job>();
const to = ref<string | null>(null);
const options = ref<Opt[]>([]);
const map = ref<Record<string, string>>({});

/** The chosen palette's name (the new coloring or variant takes it). */
const name = computed(
  () => swapPalettes.value.find((p) => p.id === to.value)?.label.split(' · ')[0],
);

function show(j: Job) {
  job.value = j;
  pick(null);
  open.value = true;
}
/** Suggest each color's nearest in palette `id` (cleared: back to the colors as they are). */
function pick(id: string | null) {
  const used = job.value?.used ?? [];
  const pal = swapPalettes.value.find((p) => p.id === id);
  to.value = pal ? pal.id : null;
  options.value = pal ? pal.colors : swapOptions(); // only the chosen palette's colors and fabrics
  map.value = Object.fromEntries(
    used.map((c) => [c.id, (pal && nearestColor(c.rgb, pal.colors)?.id) ?? c.id]),
  );
}

const after = computed(() => {
  if (!job.value) return '';
  // Library colors and fabrics picked here aren't in the project yet: lend them for the "after"
  // picture (as plain objects: Immer can't take Vue proxies).
  const pal = project.doc!.project.palette;
  const fabrics = options.value.flatMap((o) =>
    o.fabric && !pal.fabrics.some((f) => f.id === o.fabric!.id) ? [toRaw(o.fabric)] : [],
  );
  const colors = options.value.flatMap((o) =>
    !o.fabric && !pal.colors.some((c) => c.id === o.id)
      ? [{ id: o.id, notecard: toRaw(o.notecard), rgb: toRaw(o.rgb) }]
      : [],
  );
  const doc =
    fabrics.length || colors.length
      ? produce(project.doc!, (d) => {
          d.project.palette.fabrics.push(...castDraft(fabrics));
          d.project.palette.colors.push(...castDraft(colors));
        })
      : project.doc!;
  return job.value.preview({ ...map.value }, name.value, doc);
});
const ok = () => job.value?.done({ ...map.value }, name.value);

defineExpose({ show });
</script>

<style>
/* Swatches (also in the select's menu, rendered in <body>, so not scoped). */
.ps-swatch {
  width: 18px;
  height: 18px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  flex: none;
}
.ps-side {
  flex: 1 1 0;
  min-width: 0;
}
.ps-picture {
  display: block;
  width: 100%;
  max-height: 500px;
  object-fit: contain;
}
.ps-swatch.big {
  width: 28px;
  height: 28px;
}
</style>
