<template>
  <!-- A colorway's colors, in place of the Design tab's palettes: each color of the primary colorway
       and what it is in this one. -->
  <div class="column q-pa-sm" style="gap: 8px">
    <div class="text-caption text-grey-7">
      {{ colorway?.name }}: pick what each color of {{ primary }} becomes. Show {{ primary }} to
      paint pieces.
    </div>
    <PaintMapRow
      v-for="r in rows"
      :key="r.from.id"
      :from="r.from"
      :model-value="r.to"
      :options="options"
      :readonly="readonly"
      @update:model-value="(to) => change(r.from.id, to)"
    />
    <div v-if="!rows.length" class="text-caption text-grey-8">{{ primary }} has no colors yet.</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import PaintMapRow from '@/components/PaintMapRow.vue';
import { useSwapOptions, type Opt } from '@/composables/swap-options';
import { quiltPaints } from '@/editor/colors';
import { fillFor, paintOf } from '@/editor/paint';
import { fillKey } from '@/model/coloring';
import { colorwayList, setSwap, shownColorway, swapper } from '@/model/colorways';
import type { Quilt } from '@/model/schema/quilt';
import { useProjectStore } from '@/stores/project';

const props = defineProps<{ quilt: Quilt; readonly?: boolean }>();
const project = useProjectStore();
const { paintOpt, swapOptions } = useSwapOptions();

const colorway = computed(() => shownColorway(props.quilt));
const primary = computed(() => colorwayList(props.quilt)[0]!.name);
/** Each primary color (paint id) and what this colorway shows instead. */
const rows = computed(() => {
  const swap = swapper(colorway.value);
  return [...quiltPaints(project.doc!, props.quilt)].flatMap((p) => {
    const from = paintOpt(p);
    return from ? [{ from, to: paintOf(swap(fillFor(p)))! }] : [];
  });
});
/** The project's colors and fabrics and its palettes', with the ones in use. */
const options = computed(() =>
  [...rows.value.flatMap((r) => [r.from, paintOpt(r.to)]), ...swapOptions()].filter(
    (o, i, a): o is Opt => !!o && a.findIndex((x) => x?.id === o.id) === i,
  ),
);

function change(from: string, to: string) {
  const id = colorway.value?.id;
  if (!id || props.readonly) return;
  project.change((d) => {
    const i = d.project.quilts.findIndex((x) => x.id === props.quilt.id);
    if (i >= 0)
      d.project.quilts[i] = setSwap(
        JSON.parse(JSON.stringify(d.project.quilts[i])) as Quilt,
        id,
        fillKey(fillFor(from)),
        fillFor(to),
      );
  });
}
</script>
