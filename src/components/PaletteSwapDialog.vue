<template>
  <!-- A new block coloring, quilt colorway or rosette coloring from a palette swap: pick a palette
       and each color becomes its nearest there (or map each by hand), with before and after
       pictures. -->
  <q-dialog v-model="open">
    <q-card v-if="job" style="width: 520px; max-width: 95vw">
      <DialogClose />
      <q-card-section>
        <div class="text-h6">{{ job.heading }}</div>
        <div class="text-caption text-grey-7">
          Pick a palette: each color of {{ job.title }} becomes its nearest color or fabric there,
          and you can change any of them.
        </div>
        <!-- Quilt colorways (spec 024) and rosette colorings: Palette is picked by hand; Auto
             mapping keeps following the source's colors and the palette; Re-color starts from the
             swap, then is painted patch by patch. -->
        <template v-if="job.auto">
          <SlidePicker
            v-model="mode"
            :options="[
              { value: 'manual', label: 'Palette' },
              { value: 'auto', label: 'Auto mapping' },
              ...(job.recolor ? [{ value: 'recolor', label: 'Re-color' }] : []),
            ]"
            label="Mode"
            class="q-mt-sm"
          />
          <div class="text-caption text-grey-7 q-mt-xs">
            {{
              mode === 'auto'
                ? `Keeps following ${job.title}: when its colors or the palette change, the matches change too. Colors you pick by hand stay.`
                : mode === 'recolor'
                  ? (job.recolor?.hint ??
                    'Starts with these colors. Then paint any patch in the Design tab, as in the primary colorway.')
                  : (job.manualHint ??
                    'A one-time copy: later changes to the colors don’t carry over.')
            }}
          </div>
        </template>
        <PaletteSelect
          :model-value="to"
          :options="swapPalettes"
          clearable
          label="Palette"
          class="q-mt-sm"
          @update:model-value="pick"
        />
      </q-card-section>
      <q-card-section class="column q-pt-none" style="gap: 8px">
        <PaintMapRow
          v-for="c in job.used"
          :key="c.id"
          v-model="map[c.id]"
          :from="c"
          :options="options"
        />
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
        <q-btn
          v-close-popup
          flat
          no-caps
          color="primary"
          :label="job.okLabel"
          :disable="mode === 'auto' && !to"
          @click="ok"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { ref as r } from 'vue';
type Mode = 'manual' | 'auto' | 'recolor';
// shortcut: module state, so the mode lasts until reload; a setting if it should outlive it.
/** The quilt colorway mode last picked, the next one's start (owner, 2026-11-25). */
const lastMode = r<Mode>('manual');
</script>

<script setup lang="ts">
import DialogClose from './DialogClose.vue';
import SlidePicker from './SlidePicker.vue';
import { castDraft, produce } from 'immer';
import { computed, ref, shallowRef, toRaw } from 'vue';
import { nearestColor } from '@/editor/color';
import type { RrqDoc } from '@/model/schema/project';
import PaintMapRow from '@/components/PaintMapRow.vue';
import PaletteSelect from '@/components/PaletteSelect.vue';
import { useSwapOptions, type Opt } from '@/composables/swap-options';
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
  /** Palette mode's caption, when it differs from a one-time copy. */
  manualHint?: string;
  /** An Auto mapping instead (palette id; overrides: source paint → pick). */
  auto?: {
    done: (palette: string, overrides: Record<string, string>, name: string | undefined) => void;
  };
  /** A re-color starting from the mapping (`hint`: what happens next, in the caption). */
  recolor?: {
    done: (map: Record<string, string>, name: string | undefined) => void;
    hint?: string;
  };
};

const project = useProjectStore();
const { swapPalettes, swapOptions } = useSwapOptions();
const open = ref(false);
const job = shallowRef<Job>();
const to = ref<string | null>(null);
const options = ref<Opt[]>([]);
const map = ref<Record<string, string>>({});

const chosen = computed(() => swapPalettes.value.find((p) => p.id === to.value));
/** The chosen palette's name (the new coloring or colorway takes it). */
const name = computed(() => chosen.value?.label.split(' · ')[0]);

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
  // Only the chosen palette's colors and fabrics; else every one, the colors listed first.
  options.value = pal
    ? pal.colors
    : [...used, ...swapOptions()].filter((o, i, a) => a.findIndex((x) => x.id === o.id) === i);
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
/** The mode last picked, where this swap offers it (else Palette). */
const mode = computed<Mode>({
  get: () =>
    !job.value?.auto || (lastMode.value === 'recolor' && !job.value.recolor)
      ? 'manual'
      : lastMode.value,
  set: (m) => (lastMode.value = m),
});
/** Each color's nearest in the chosen palette (Auto mapping keeps only the picks that differ). */
const nearest = computed(() => {
  const pal = swapPalettes.value.find((p) => p.id === to.value);
  return Object.fromEntries(
    (job.value?.used ?? []).map((c) => [c.id, (pal && nearestColor(c.rgb, pal.colors)?.id) ?? '']),
  );
});
function ok() {
  const j = job.value;
  if (!j) return;
  if (mode.value === 'auto' && j.auto && to.value) {
    const overrides = Object.fromEntries(
      Object.entries(map.value).filter(([k, v]) => v !== nearest.value[k]),
    );
    return j.auto.done(to.value.replace(/^project:/, ''), overrides, name.value);
  }
  if (mode.value === 'recolor' && j.recolor) return j.recolor.done({ ...map.value }, name.value);
  j.done({ ...map.value }, name.value);
}

defineExpose({ show });
</script>

<style>
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
