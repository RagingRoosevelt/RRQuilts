<template>
  <!-- A colorway's colors, in place of the Design tab's palettes: each color of the primary colorway
       and what it is in this one. Palette: picked by hand (from all colors, or one palette). Auto
       mapping (spec 024): each follows its source colorway's color to the nearest in a palette,
       unless picked by hand. Re-color: painted patch by patch as the primary, so only the mode
       shows here, above the palettes. -->
  <div class="column no-wrap q-pa-sm" :class="{ 'q-pb-none': mode === 'recolor' }" style="gap: 8px">
    <SlidePicker
      v-if="colorway"
      :model-value="mode"
      :options="modes"
      label="Mode"
      :class="{ 'no-pointer': readonly }"
      @update:model-value="(m) => setMode(m as Mode)"
    />
    <div v-if="mode === 'recolor'" class="text-caption text-grey-7">
      {{ colorway?.name }}: paint any patch, as in {{ primary }}. Blocks set later show
      {{ primary }}’s colors until painted here.
    </div>
    <template v-else-if="auto">
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
      <PaletteSelect
        :model-value="paletteKey(auto.palette)"
        :options="swapPalettes"
        label="Palette"
        :readonly="readonly"
        @update:model-value="(v) => v && setAuto({ palette: v.replace(/^project:/, '') })"
      />
      <div class="text-caption text-grey-7">
        Each color of {{ sourceName }} becomes its nearest in the palette, and keeps up as either
        changes. Pick one by hand to keep it.
      </div>
    </template>
    <template v-else>
      <PaletteSelect
        :model-value="colorway?.palette ? paletteKey(colorway.palette) : ''"
        :options="[{ id: '', label: 'All colors and palettes' }, ...swapPalettes]"
        label="Pick from"
        :readonly="readonly"
        @update:model-value="(v) => setManualPalette(v ?? '')"
      />
      <div class="text-caption text-grey-7">
        {{ colorway?.name }}: pick what each color of {{ primary }} becomes. Show {{ primary }} to
        paint pieces.
      </div>
    </template>
    <!-- Hovering a row, or tapping its color (it stays lit), lights its patches on the quilt. -->
    <div
      v-for="r in mode === 'recolor' ? [] : rows"
      :key="r.from.id"
      class="column"
      style="gap: 2px"
      @mouseenter="hovered = r.from.id"
      @mouseleave="hovered = null"
    >
      <PaintMapRow
        :from="r.from"
        :model-value="r.to"
        :options="options"
        :readonly="readonly"
        :spot="pinned === r.from.id"
        stacked
        @spot="pinned = pinned === r.from.id ? null : r.from.id"
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
    <div v-if="!rows.length && mode !== 'recolor'" class="text-caption text-grey-8">
      {{ primary }} has no colors yet.
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import PaintMapRow from '@/components/PaintMapRow.vue';
import PaletteSelect from '@/components/PaletteSelect.vue';
import SlidePicker from '@/components/SlidePicker.vue';
import { useSwapOptions, type Opt, type Section } from '@/composables/swap-options';
import { quiltPaints } from '@/editor/colors';
import { fillFor, paintOf } from '@/editor/paint';
import { fillKey } from '@/model/coloring';
import { dependents } from '@/model/colorway-auto';
import { colorwayList, setSwap, shownColorway, startRecolor, swapper } from '@/model/colorways';
import type { Colorway, Quilt } from '@/model/schema/quilt';
import { useEditorStore } from '@/stores/editor';
import { useProjectStore } from '@/stores/project';

const props = defineProps<{ quilt: Quilt; readonly?: boolean }>();
const project = useProjectStore();
const { paintOpt, swapOptions, swapPalettes } = useSwapOptions();

const $q = useQuasar();
const editor = useEditorStore();
const colorway = computed(() => shownColorway(props.quilt));
/** The color lit on the quilt: the row hovered, else the one tapped. */
const hovered = ref<string | null>(null);
const pinned = ref<string | null>(null);
watch([hovered, pinned], ([h, p]) => (editor.spotPaint = h ?? p));
onBeforeUnmount(() => (editor.spotPaint = null));
const auto = computed(() => colorway.value?.auto);
type Mode = 'palette' | 'auto' | 'recolor';
const mode = computed<Mode>(() =>
  colorway.value?.recolor ? 'recolor' : auto.value ? 'auto' : 'palette',
);
// A re-color has no rows to light (the tray's swatches light colors instead).
watch(mode, (m) => m === 'recolor' && (hovered.value = pinned.value = null));
/** Re-color paints block spaces: not for data quilts or English paper piecing quilts. */
const modes = computed(() => [
  { value: 'palette', label: 'Palette' },
  { value: 'auto', label: 'Auto mapping' },
  ...(props.quilt.data?.on || props.quilt.layout.style === 'epp'
    ? []
    : [{ value: 'recolor', label: 'Re-color' }]),
]);
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
function setMode(m: Mode) {
  if (m === mode.value || props.readonly) return;
  if (m === 'recolor')
    return edit(
      (v) => v,
      (q) => startRecolor(q, colorway.value!.id, project.doc!.project.blocks),
    );
  if (mode.value !== 'recolor') return setSwapMode(m === 'auto');
  $q.dialog({
    title: 'Stop re-coloring?',
    message: `The colors painted in “${colorway.value?.name}” go, and it maps ${primary.value}’s colors again.`,
    cancel: true,
    ok: { label: 'Stop re-coloring', color: 'negative', flat: true },
  }).onOk(() => setSwapMode(m === 'auto'));
}
/** Palette or Auto mapping (a re-color's painting goes, its mapping from before comes back). */
function setSwapMode(on: boolean) {
  edit(({ recolor: _r, ...v }) => {
    void _r;
    if (!on) {
      // Palette keeps the picks it shows (overrides included); the link goes.
      const { auto: _a, ...rest } = v;
      void _a;
      return rest;
    }
    if (v.auto) return v; // back from a re-color: the mapping it had
    const palette = v.palette ?? swapPalettes.value[0]?.id.replace(/^project:/, '');
    if (!palette) return v;
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
