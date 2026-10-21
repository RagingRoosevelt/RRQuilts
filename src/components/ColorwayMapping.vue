<template>
  <!-- A colorway's colors, in place of the Design tab's palettes: each color of the primary colorway
       and what it is in this one. Manual: picked by hand (from all colors, or one palette). Auto
       mapping (spec 024): each follows its source colorway's color to the nearest in a palette,
       unless picked by hand. -->
  <div class="column no-wrap q-pa-sm" style="gap: 8px">
    <SlidePicker
      v-if="colorway"
      :model-value="auto ? 'auto' : 'manual'"
      :options="[
        { value: 'manual', label: 'Manual' },
        { value: 'auto', label: 'Auto mapping' },
      ]"
      label="Mode"
      :class="{ 'no-pointer': readonly }"
      @update:model-value="(m) => setMode(m === 'auto')"
    />
    <template v-if="auto">
      <q-select
        :model-value="auto.source ?? ''"
        :options="sourceOptions"
        emit-value
        map-options
        dense
        outlined
        label="Follows"
        :readonly="readonly"
        @update:model-value="(v: string) => setAuto({ source: v || undefined })"
      />
      <q-select
        :model-value="paletteKey(auto.palette)"
        :options="swapPalettes"
        option-value="id"
        option-label="label"
        emit-value
        map-options
        dense
        outlined
        label="Palette"
        :readonly="readonly"
        @update:model-value="(v: string) => setAuto({ palette: v.replace(/^project:/, '') })"
      />
      <div class="text-caption text-grey-7">
        Each color of {{ sourceName }} becomes its nearest in the palette, and keeps up as either
        changes. Pick one by hand to keep it.
      </div>
    </template>
    <template v-else>
      <q-select
        :model-value="colorway?.palette ? paletteKey(colorway.palette) : ''"
        :options="[{ id: '', label: 'All colors and palettes' }, ...swapPalettes]"
        option-value="id"
        option-label="label"
        emit-value
        map-options
        dense
        outlined
        label="Pick from"
        :readonly="readonly"
        @update:model-value="setManualPalette"
      />
      <div class="text-caption text-grey-7">
        {{ colorway?.name }}: pick what each color of {{ primary }} becomes. Show {{ primary }} to
        paint pieces.
      </div>
    </template>
    <div v-for="r in rows" :key="r.from.id" class="column" style="gap: 2px">
      <PaintMapRow
        :from="r.from"
        :model-value="r.to"
        :options="options"
        :readonly="readonly"
        stacked
        @update:model-value="(to) => change(r.from.id, to)"
      />
      <div v-if="auto" class="row items-center justify-end text-caption text-grey-7">
        <template v-if="r.overridden">
          Picked by hand
          <q-btn
            v-if="!readonly"
            flat
            dense
            no-caps
            size="sm"
            icon="autorenew"
            label="Automatic"
            @click="clearOverride(r.from.id)"
          />
        </template>
        <template v-else>Automatic</template>
      </div>
    </div>
    <div v-if="!rows.length" class="text-caption text-grey-8">{{ primary }} has no colors yet.</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import PaintMapRow from '@/components/PaintMapRow.vue';
import SlidePicker from '@/components/SlidePicker.vue';
import { useSwapOptions, type Opt, type Section } from '@/composables/swap-options';
import { quiltPaints } from '@/editor/colors';
import { fillFor, paintOf } from '@/editor/paint';
import { fillKey } from '@/model/coloring';
import { dependents } from '@/model/colorway-auto';
import { colorwayList, setSwap, shownColorway, swapper } from '@/model/colorways';
import type { Colorway, Quilt } from '@/model/schema/quilt';
import { useProjectStore } from '@/stores/project';

const props = defineProps<{ quilt: Quilt; readonly?: boolean }>();
const project = useProjectStore();
const { paintOpt, swapOptions, swapPalettes } = useSwapOptions();

const colorway = computed(() => shownColorway(props.quilt));
const auto = computed(() => colorway.value?.auto);
const primary = computed(() => colorwayList(props.quilt)[0]!.name);
/** A palette as the palette pickers list it (project palettes carry a `project:` prefix there). */
const paletteKey = (id: string) =>
  swapPalettes.value.some((p) => p.id === `project:${id}`) ? `project:${id}` : id;
/** What it can follow: the primary or another colorway, never itself or one that follows it. */
const sourceOptions = computed(() => {
  const own = colorway.value ? dependents(props.quilt, colorway.value.id) : new Set<string>();
  return colorwayList(props.quilt)
    .filter((c) => !c.id || !own.has(c.id))
    .map((c) => ({ value: c.id ?? '', label: c.name }));
});
const sourceName = computed(
  () => sourceOptions.value.find((o) => o.value === (auto.value?.source ?? ''))?.label ?? '',
);
/** Each primary color (paint id) and what this colorway shows instead. */
const rows = computed(() => {
  const swap = swapper(colorway.value);
  const over = new Set((auto.value?.overrides ?? []).map((o) => o.from));
  return [...quiltPaints(project.doc!, props.quilt)].flatMap((p) => {
    const from = paintOpt(p);
    return from
      ? [{ from, to: paintOf(swap(fillFor(p)))!, overridden: over.has(fillKey(fillFor(p))) }]
      : [];
  });
});
/** Choices: auto mapping, or a manual palette, offers that palette's; else every color (in use first). */
const IN_USE: Section = ['In use'];
const options = computed(() => {
  const only = auto.value?.palette ?? colorway.value?.palette;
  const pal = only && swapPalettes.value.find((p) => p.id === paletteKey(only));
  if (pal) return pal.colors;
  return [
    ...rows.value.flatMap((r) => [{ ...r.from, section: IN_USE }, paintOpt(r.to, IN_USE)]),
    ...swapOptions(),
  ].filter((o, i, a): o is Opt => !!o && a.findIndex((x) => x?.id === o.id) === i);
});

/** Edit the shown colorway (one undo step). */
function edit(fn: (v: Colorway) => Colorway | void, q = (x: Quilt) => x) {
  const id = colorway.value?.id;
  if (!id || props.readonly) return;
  project.change((d) => {
    const i = d.project.quilts.findIndex((x) => x.id === props.quilt.id);
    if (i < 0) return;
    const quilt = q(JSON.parse(JSON.stringify(d.project.quilts[i])) as Quilt);
    quilt.colorways = (quilt.colorways ?? []).map((v) => (v.id === id ? (fn(v) ?? v) : v));
    d.project.quilts[i] = quilt;
  });
}
function setMode(on: boolean) {
  edit((v) => {
    if (!on) {
      // Manual keeps the picks it shows (overrides included); the link goes.
      const { auto: _a, ...rest } = v;
      void _a;
      return rest;
    }
    const palette = v.palette ?? swapPalettes.value[0]?.id.replace(/^project:/, '');
    if (!palette) return;
    const { palette: _p, ...rest } = v;
    void _p;
    return { ...rest, auto: { palette } };
  });
}
function setAuto(patch: { source?: string | undefined; palette?: string }) {
  edit((v) => {
    if (!v.auto) return;
    const { source: _s, ...a } = v.auto;
    void _s;
    const source = 'source' in patch ? patch.source : v.auto.source;
    return {
      ...v,
      auto: {
        ...a,
        ...(patch.palette ? { palette: patch.palette } : {}),
        ...(source ? { source } : {}),
      },
    };
  });
}
function setManualPalette(id: string) {
  edit((v) => {
    const { palette: _p, ...rest } = v;
    void _p;
    return id ? { ...rest, palette: id.replace(/^project:/, '') } : rest;
  });
}
function change(from: string, to: string) {
  const key = fillKey(fillFor(from));
  if (auto.value)
    return edit((v) => ({
      ...v,
      auto: {
        ...v.auto!,
        overrides: [
          ...(v.auto!.overrides ?? []).filter((o) => o.from !== key),
          { from: key, to: fillFor(to) },
        ],
      },
    }));
  const id = colorway.value?.id;
  if (id)
    edit(
      (v) => v,
      (q) => setSwap(q, id, key, fillFor(to)),
    );
}
function clearOverride(from: string) {
  const key = fillKey(fillFor(from));
  edit((v) => {
    if (!v.auto) return;
    const overrides = (v.auto.overrides ?? []).filter((o) => o.from !== key);
    const { overrides: _o, ...a } = v.auto;
    void _o;
    return { ...v, auto: overrides.length ? { ...a, overrides } : a };
  });
}
</script>

<style scoped>
.no-pointer {
  pointer-events: none;
}
</style>
