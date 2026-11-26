<template>
  <!-- A colorway's colors, in place of the Design tab's palettes: each color of the colorway it
       follows and what it is in this one. Palette: picked by hand (from all colors, or one
       palette). Auto mapping (spec 024): each becomes its nearest in a palette, unless picked by
       hand. Changing what it follows keeps the picks (owner, 2026-11-25). Re-color: painted patch
       by patch as the primary, so only the mode shows here, above the palettes. -->
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
    <q-select
      v-else
      :model-value="colorway?.source ?? ''"
      :options="sourceOptions"
      emit-value
      map-options
      dense
      outlined
      label="Follows"
      :readonly="readonly"
      @update:model-value="(v: string) => setSource(v || undefined)"
    />
    <template v-if="auto && mode === 'auto'">
      <PaletteSelect
        :model-value="paletteKey(auto.palette)"
        :options="swapPalettes"
        label="Palette"
        :readonly="readonly"
        @update:model-value="(v) => v && setAutoPalette(v.replace(/^project:/, ''))"
      />
      <div class="text-caption text-grey-7">
        Each color of {{ sourceName }} becomes its nearest in the palette, and keeps up as either
        changes. Pick one by hand to keep it.
      </div>
    </template>
    <template v-else-if="mode === 'palette'">
      <PaletteSelect
        :model-value="colorway?.palette ? paletteKey(colorway.palette) : ''"
        :options="[{ id: '', label: 'All colors and palettes' }, ...swapPalettes]"
        label="Pick from"
        :readonly="readonly"
        @update:model-value="(v) => setManualPalette(v ?? '')"
      />
      <div class="text-caption text-grey-7">
        {{ colorway?.name }}: pick what each color of {{ sourceName }} becomes. Show {{ primary }}
        to paint pieces.
      </div>
    </template>
    <!-- Hovering a row, or tapping its color (it stays lit), lights its patches on the quilt. -->
    <div
      v-for="r in rows"
      :key="r.paints[0]"
      class="column"
      style="gap: 2px"
      @mouseenter="hovered = r.paints[0]!"
      @mouseleave="hovered = null"
    >
      <PaintMapRow
        :from="r.from"
        :model-value="r.to"
        :options="options"
        :readonly="readonly"
        :spot="!!pinned && r.paints.includes(pinned)"
        stacked
        @spot="pinned = pinned && r.paints.includes(pinned) ? null : r.paints[0]!"
        @update:model-value="(to) => change(r, to)"
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
            @click="clearOverride(r)"
          />
        </template>
        <template v-else>Automatic</template>
      </div>
    </div>
    <div v-if="!rows.length && mode !== 'recolor'" class="text-caption text-grey-8">
      {{ sourceName }} has no colors yet.
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
import {
  baseView,
  colorwayList,
  setSwap,
  shownColorway,
  startRecolor,
  swapper,
} from '@/model/colorways';
import type { Colorway, Quilt } from '@/model/schema/quilt';
import { useEditorStore } from '@/stores/editor';
import { useProjectStore } from '@/stores/project';

const props = defineProps<{ quilt: Quilt; readonly?: boolean }>();
const project = useProjectStore();
const { paintOpt, swapOptions, swapPalettes } = useSwapOptions();

const $q = useQuasar();
const editor = useEditorStore();
const colorway = computed(() => shownColorway(props.quilt));
/** The row lit on the quilt (by one of its base colors): the row hovered, else the one tapped. */
const hovered = ref<string | null>(null);
const pinned = ref<string | null>(null);
const lit = computed(() => {
  const p = hovered.value ?? pinned.value;
  return (p && rows.value.find((r) => r.paints.includes(p))?.paints) || null;
});
watch(lit, (p) => (editor.spotPaints = p ?? []));
onBeforeUnmount(() => (editor.spotPaints = []));
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
  { value: 'auto', label: 'Auto map' },
  ...(props.quilt.data?.on || props.quilt.layout.style === 'epp'
    ? []
    : [{ value: 'recolor', label: 'Re-color' }]),
]);
const primary = computed(() => colorwayList(props.quilt)[0]!.name);
/** A palette as the palette pickers list it (project palettes carry a `project:` prefix there). */
const paletteKey = (id: string) =>
  swapPalettes.value.some((p) => p.id === `project:${id}`) ? `project:${id}` : id;
/** What it can follow: the primary or another colorway, never itself or one that follows it. A
 *  re-color it reaches is its base: the rows are that one's colors, picked anew. */
const sourceOptions = computed(() => {
  const own = colorway.value ? dependents(props.quilt, colorway.value.id) : new Set<string>();
  return colorwayList(props.quilt)
    .filter((c) => !c.id || !own.has(c.id))
    .map((c) => ({ value: c.id ?? '', label: c.name }));
});
const sourceName = computed(
  () => sourceOptions.value.find((o) => o.value === (colorway.value?.source ?? ''))?.label ?? '',
);
interface Row {
  from: Opt;
  to: string;
  overridden: boolean;
  /** The base colors (paint ids: the primary's, or a re-color's) it stands for. */
  paints: string[];
}
/** Each color of the colorway followed (from) and what this one shows (to). The picks are keyed by
 *  the base's colors, so base colors that show alike here and there share a row. */
const rows = computed(() => {
  const v = colorway.value;
  if (!v || v.recolor) return [];
  const followed = props.quilt.colorways?.find((w) => w.id === v.source);
  const fromOf = swapper(followed);
  const swap = swapper(v);
  const over = new Set((v.auto?.overrides ?? []).map((o) => o.from));
  const out = new Map<string, Row>();
  for (const p of quiltPaints(project.doc!, baseView(props.quilt, v))) {
    const f = fillFor(p);
    const from = paintOpt(paintOf(fromOf(f))!);
    if (!from) continue;
    const to = paintOf(swap(f))!;
    const overridden = over.has(fillKey(f));
    const key = `${from.id} ${to} ${overridden}`;
    const r = out.get(key);
    if (r) r.paints.push(p);
    else out.set(key, { from, to, overridden, paints: [p] });
  }
  return [...out.values()];
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
      // Palette keeps the picks it shows (overrides included), what it follows and its palette;
      // they no longer change with them.
      const { auto, ...rest } = v;
      return auto ? { ...rest, palette: auto.palette } : rest;
    }
    if (v.auto) return v; // back from a re-color: the mapping it had
    const palette = v.palette ?? swapPalettes.value[0]?.id.replace(/^project:/, '');
    if (!palette) return v;
    const { palette: _p, ...rest } = v;
    void _p;
    return { ...rest, auto: { palette } };
  });
}
/** Follow another colorway (none: the primary). The picks stay; auto mapping's follow its colors. */
function setSource(id: string | undefined) {
  edit((v) => {
    const { source: _s, ...rest } = v;
    void _s;
    return id ? { ...rest, source: id } : rest;
  });
}
function setAutoPalette(palette: string) {
  edit((v) => (v.auto ? { ...v, auto: { ...v.auto, palette } } : undefined));
}
function setManualPalette(id: string) {
  edit((v) => {
    const { palette: _p, ...rest } = v;
    void _p;
    return id ? { ...rest, palette: id.replace(/^project:/, '') } : rest;
  });
}
const keysOf = (r: Row) => r.paints.map((p) => fillKey(fillFor(p)));
function change(r: Row, to: string) {
  const keys = keysOf(r);
  if (auto.value)
    return edit((v) => ({
      ...v,
      auto: {
        ...v.auto!,
        overrides: [
          ...(v.auto!.overrides ?? []).filter((o) => !keys.includes(o.from)),
          ...keys.map((from) => ({ from, to: fillFor(to) })),
        ],
      },
    }));
  const id = colorway.value?.id;
  if (id)
    edit(
      (v) => v,
      (q) => keys.reduce((x, k) => setSwap(x, id, k, fillFor(to)), q),
    );
}
function clearOverride(r: Row) {
  const keys = keysOf(r);
  edit((v) => {
    if (!v.auto) return;
    const overrides = (v.auto.overrides ?? []).filter((o) => !keys.includes(o.from));
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
