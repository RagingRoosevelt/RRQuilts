<template>
  <!-- A rosette coloring's mode, as a quilt colorway's (0.9.3 roadmap): Palette (each color of the
       coloring it follows picked by hand), Auto mapping (each its nearest in a palette, unless
       picked by hand) or Re-color (painted piece by piece, with the palettes below). -->
  <div v-if="modes.length > 1" class="column no-wrap" style="gap: 8px">
    <SlidePicker
      :model-value="mode"
      :options="modes"
      label="Mode"
      :class="{ 'no-pointer': readonly }"
      @update:model-value="(m) => setMode(m as Mode)"
    />
    <div v-if="mode === 'recolor'" class="text-caption text-grey-7">
      {{ name }}: paint any piece with the colors below.
    </div>
    <template v-else>
      <q-select
        :model-value="coloring?.source"
        :options="sourceOptions"
        emit-value
        map-options
        dense
        outlined
        label="Follows"
        :readonly="readonly"
        @update:model-value="(v: string) => edit((c) => ({ ...c, source: v }))"
      />
      <template v-if="coloring?.auto">
        <PaletteSelect
          :model-value="paletteKey(coloring.auto.palette)"
          :options="swapPalettes"
          label="Palette"
          :readonly="readonly"
          @update:model-value="
            (v) => v && edit((c) => (c.auto ? { ...c, auto: { ...c.auto, palette: unkey(v) } } : c))
          "
        />
        <div class="text-caption text-grey-7">
          Each color of {{ sourceName }} becomes its nearest in the palette, and keeps up as either
          changes. Pick one by hand to keep it.
        </div>
      </template>
      <template v-else>
        <PaletteSelect
          :model-value="coloring?.palette ? paletteKey(coloring.palette) : ''"
          :options="[{ id: '', label: 'All colors and palettes' }, ...swapPalettes]"
          label="Pick from"
          :readonly="readonly"
          @update:model-value="(v) => setManualPalette(v ?? '')"
        />
        <div class="text-caption text-grey-7">
          {{ name }}: pick what each color of {{ sourceName }} becomes. Repainting
          {{ sourceName }} shows here too.
        </div>
      </template>
      <div v-for="r in rows" :key="r.keys[0]" class="column" style="gap: 2px">
        <PaintMapRow
          :from="r.from"
          :model-value="r.to"
          :options="options"
          :readonly="readonly"
          stacked
          @update:model-value="(to) => setPick(r, to)"
        />
        <div v-if="coloring?.auto" class="row items-center justify-end text-caption text-grey-7">
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
              @click="clearOverride(r)"
            />
          </template>
          <template v-else>Automatic</template>
        </div>
      </div>
      <div v-if="!rows.length" class="text-caption text-grey-8">
        {{ sourceName }} has no colors yet.
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed } from 'vue';
import PaintMapRow from '@/components/PaintMapRow.vue';
import PaletteSelect from '@/components/PaletteSelect.vue';
import SlidePicker from '@/components/SlidePicker.vue';
import { useSwapOptions, type Opt, type Section } from '@/composables/swap-options';
import { fillFor, paintOf } from '@/editor/paint';
import { fillKey } from '@/model/coloring';
import { bake, baseColoring, followers, swapperOf } from '@/model/epp/rosette-colorings';
import type { Rosette, RosetteColoring } from '@/model/schema/epp';

const props = defineProps<{
  rosette: Rosette;
  coloringId: string;
  readonly?: boolean;
  /** Change the rosette (one undo step). */
  change: (fn: (r: Rosette) => Rosette) => void;
}>();
const $q = useQuasar();
const { paintOpt, swapOptions, swapPalettes } = useSwapOptions();

const coloring = computed(() => props.rosette.colorings.find((c) => c.id === props.coloringId));
const label = (c: RosetteColoring | undefined) =>
  c ? (c.name ?? `Coloring ${props.rosette.colorings.indexOf(c) + 1}`) : '';
const name = computed(() => label(coloring.value));
type Mode = 'palette' | 'auto' | 'recolor';
const mode = computed<Mode>(() =>
  !coloring.value?.source ? 'recolor' : coloring.value.auto ? 'auto' : 'palette',
);
/** What it can follow: another coloring, never one that follows it. */
const sourceOptions = computed(() => {
  const own = followers(props.rosette, props.coloringId);
  return props.rosette.colorings
    .filter((c) => !own.has(c.id))
    .map((c) => ({ value: c.id, label: label(c) }));
});
/** Palette and Auto mapping need another coloring to follow. */
const modes = computed(() => [
  ...(sourceOptions.value.length
    ? [
        { value: 'palette', label: 'Palette' },
        { value: 'auto', label: 'Auto map' },
      ]
    : []),
  { value: 'recolor', label: 'Re-color' },
]);
const sourceName = computed(() =>
  label(props.rosette.colorings.find((c) => c.id === coloring.value?.source)),
);
/** A palette as the palette pickers list it (project palettes carry a `project:` prefix there). */
const paletteKey = (id: string) =>
  swapPalettes.value.some((p) => p.id === `project:${id}`) ? `project:${id}` : id;
const unkey = (id: string) => id.replace(/^project:/, '');

interface Row {
  from: Opt;
  to: string;
  overridden: boolean;
  /** The base's fill keys it stands for. */
  keys: string[];
}
/** Each color of the coloring followed (from) and what this one shows (to), by the base's colors;
 *  alike on both sides, one row. */
const rows = computed(() => {
  const c = coloring.value;
  const base = c?.source ? baseColoring(props.rosette, c) : undefined;
  if (!c || !base) return [];
  const fromOf = swapperOf(props.rosette.colorings.find((x) => x.id === c.source));
  const toOf = swapperOf(c);
  const over = new Set((c.auto?.overrides ?? []).map((o) => o.from));
  const out = new Map<string, Row>();
  for (const f of new Map(Object.values(base.fills).map((f) => [fillKey(f), f])).values()) {
    const from = paintOpt(paintOf(fromOf(f))!);
    if (!from) continue;
    const to = paintOf(toOf(f))!;
    const overridden = over.has(fillKey(f));
    const key = `${from.id} ${to} ${overridden}`;
    const r = out.get(key);
    if (r) r.keys.push(fillKey(f));
    else out.set(key, { from, to, overridden, keys: [fillKey(f)] });
  }
  return [...out.values()];
});
/** Choices: the auto mapping's or Pick from palette's; else every color, those in use first. */
const IN_USE: Section = ['In use'];
const options = computed(() => {
  const only = coloring.value?.auto?.palette ?? coloring.value?.palette;
  const pal = only && swapPalettes.value.find((p) => p.id === paletteKey(only));
  if (pal) return pal.colors;
  return [
    ...rows.value.flatMap((r) => [{ ...r.from, section: IN_USE }, paintOpt(r.to, IN_USE)]),
    ...swapOptions(),
  ].filter((o, i, a): o is Opt => !!o && a.findIndex((x) => x?.id === o.id) === i);
});

/** Change this coloring. */
function edit(fn: (c: RosetteColoring) => RosetteColoring) {
  if (props.readonly) return;
  props.change((r) => ({
    ...r,
    colorings: r.colorings.map((c) => (c.id === props.coloringId ? fn(c) : c)),
  }));
}
function setMode(m: Mode) {
  if (m === mode.value || props.readonly) return;
  // Re-color: painted from now on, as it shows.
  if (m === 'recolor') return edit(bake);
  if (mode.value !== 'recolor') return setAuto(m === 'auto');
  const source = sourceOptions.value[0];
  if (!source) return;
  $q.dialog({
    title: 'Stop re-coloring?',
    message: `The colors painted in “${name.value}” go, and it maps ${source.label}’s colors.`,
    cancel: true,
    ok: { label: 'Stop re-coloring', color: 'negative', flat: true },
  }).onOk(() => edit((c) => autoOf({ ...c, source: source.value, swaps: [] }, m === 'auto')));
}
const setAuto = (on: boolean) => edit((c) => autoOf(c, on));
/** Auto mapping (from the palette it picks from, else the first) or Palette (keeping its picks). */
function autoOf(c: RosetteColoring, on: boolean): RosetteColoring {
  if (!on) {
    const { auto, ...rest } = c;
    return auto ? { ...rest, palette: auto.palette } : rest;
  }
  const palette = c.palette ?? (swapPalettes.value[0] && unkey(swapPalettes.value[0].id));
  if (!palette) return c;
  const { palette: _p, ...rest } = c;
  void _p;
  return { ...rest, auto: { palette } };
}
function setManualPalette(id: string) {
  edit((c) => {
    const { palette: _p, ...rest } = c;
    void _p;
    return id ? { ...rest, palette: unkey(id) } : rest;
  });
}
function setPick(r: Row, to: string) {
  const pick = fillFor(to);
  if (coloring.value?.auto)
    return edit((c) => ({
      ...c,
      auto: {
        ...c.auto!,
        overrides: [
          ...(c.auto!.overrides ?? []).filter((o) => !r.keys.includes(o.from)),
          ...r.keys.map((from) => ({ from, to: pick })),
        ],
      },
    }));
  edit((c) => ({
    ...c,
    swaps: [
      ...(c.swaps ?? []).filter((s) => !r.keys.includes(s.from)),
      ...r.keys.filter((from) => from !== fillKey(pick)).map((from) => ({ from, to: pick })),
    ],
  }));
}
function clearOverride(r: Row) {
  edit((c) => {
    if (!c.auto) return c;
    const overrides = (c.auto.overrides ?? []).filter((o) => !r.keys.includes(o.from));
    const { overrides: _o, ...a } = c.auto;
    void _o;
    return { ...c, auto: overrides.length ? { ...a, overrides } : a };
  });
}
</script>

<style scoped>
.no-pointer {
  pointer-events: none;
}
</style>
