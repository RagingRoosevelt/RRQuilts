<template>
  <!-- One color (or fabric) and what it becomes: the palette swap dialog's rows and a colorway's
       mapping. -->
  <div class="row items-center no-wrap" style="gap: 8px">
    <!-- `stacked` (narrow places, the Design sidebar): the swatch above its name. -->
    <div v-if="stacked" class="column items-center ps-from">
      <div class="ps-swatch big" :style="optStyle(from)" />
      <div class="ellipsis text-caption" style="max-width: 100%">{{ from.notecard.name }}</div>
    </div>
    <template v-else>
      <div class="ps-swatch big" :style="optStyle(from)" />
      <div class="ellipsis" style="width: 110px">{{ from.notecard.name }}</div>
    </template>
    <q-icon name="arrow_forward" />
    <q-select
      :model-value="modelValue"
      :options="listed"
      option-value="id"
      :option-label="(o) => o.notecard.name"
      emit-value
      map-options
      dense
      outlined
      :readonly="readonly"
      class="col"
      style="min-width: 0"
      @update:model-value="(v) => emit('update:modelValue', v)"
    >
      <template #prepend>
        <div class="ps-swatch" :style="optStyle(options.find((o) => o.id === modelValue))" />
      </template>
      <template #option="{ itemProps, opt }">
        <q-item-label v-if="opt.header" header :class="opt.sub ? 'ps-sub' : 'ps-top'">{{
          opt.notecard.name
        }}</q-item-label>
        <q-item v-else v-bind="itemProps" dense>
          <q-item-section side>
            <div class="ps-swatch" :style="optStyle(opt)" />
          </q-item-section>
          <q-item-section>{{ opt.notecard.name }}</q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { optStyle, type Opt } from '@/composables/swap-options';

const props = defineProps<{
  from: Opt;
  modelValue: string | undefined;
  options: Opt[];
  readonly?: boolean;
  stacked?: boolean;
}>();
const emit = defineEmits<{ 'update:modelValue': [id: string] }>();

type Listed = Opt & { header?: boolean; sub?: boolean; disable?: boolean };
/** The options in sections, as the palette tray: each library (or Project palettes) and its
 *  palettes, in the order they first come. */
const listed = computed((): Listed[] => {
  const key = (o: Opt) => o.section?.join('\u0000') ?? '';
  const order = [...new Set(props.options.map(key))];
  const out: Listed[] = [];
  let top: string | undefined;
  for (const k of order) {
    const items = props.options.filter((o) => key(o) === k);
    const [t, sub] = items[0]!.section ?? [];
    const header = (name: string, isSub: boolean): Listed => ({
      id: `header:${isSub ? 'sub' : 'top'}:${k}`,
      notecard: { name },
      rgb: [0, 0, 0],
      from: '',
      header: true,
      sub: isSub,
      disable: true,
    });
    if (t && t !== top) out.push(header(t, false));
    top = t;
    if (sub) out.push(header(sub, true));
    out.push(...items);
  }
  return out;
});
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
.ps-from {
  width: 64px;
  flex: none;
}
.ps-top {
  padding: 10px 12px 2px;
  font-weight: 500;
}
.ps-sub {
  padding: 4px 12px 2px 20px;
  font-size: 12px;
}
.ps-swatch.big {
  width: 28px;
  height: 28px;
}
</style>
