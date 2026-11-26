<template>
  <!-- A palette picker: each palette in the list with its swatches under its name, and the picked
       one's swatches under the field (a long one folded to three rows, owner 2026-11-25). -->
  <div ref="root" class="column no-wrap">
    <q-select
      v-bind="$attrs"
      :model-value="modelValue"
      :options="options"
      option-value="id"
      option-label="label"
      emit-value
      map-options
      dense
      outlined
      @update:model-value="(v) => emit('update:modelValue', v)"
    >
      <template #option="{ opt, itemProps }">
        <q-item v-bind="itemProps">
          <q-item-section>
            <q-item-label>{{ opt.label }}</q-item-label>
            <div v-if="opt.colors?.length" class="swatches">
              <span
                v-for="c in opt.colors.slice(0, 24)"
                :key="c.id"
                class="dot"
                :style="optStyle(c)"
              />
            </div>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
    <div v-if="chosen?.colors?.length" class="swatches" aria-label="The palette's swatches">
      <span
        v-for="c in shown"
        :key="c.id"
        class="dot"
        :style="optStyle(c)"
        :title="c.notecard.name"
      />
      <button v-if="more" type="button" class="more" @click="whole = true">+{{ more }} more</button>
      <button v-else-if="long" type="button" class="more" @click="whole = false">Show fewer</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { optStyle, type Opt } from '@/composables/swap-options';

defineOptions({ inheritAttrs: false });
const props = defineProps<{
  modelValue: string | null;
  options: { id: string; label: string; colors?: Opt[] }[];
}>();
const emit = defineEmits<{ 'update:modelValue': [v: string | null] }>();
const chosen = computed(() => props.options.find((p) => p.id === props.modelValue));

/** A long palette shows three rows of swatches, the last three places a "+N more" button for the
 *  rest (owner, 2026-11-25). Rows: the width in 22 px swatches with 3 px gaps. */
const ROWS = 3;
const root = ref<HTMLElement>();
const width = ref(0);
const whole = ref(false);
watch(
  () => props.modelValue,
  () => (whole.value = false),
);
let obs: ResizeObserver | undefined;
onMounted(() => {
  if (!root.value) return;
  obs = new ResizeObserver(([e]) => (width.value = e?.contentRect.width ?? 0));
  obs.observe(root.value);
});
onBeforeUnmount(() => obs?.disconnect());
const fold = computed(() => {
  const all = chosen.value?.colors ?? [];
  const n = ROWS * Math.max(3, Math.floor((width.value + 3) / 25));
  const long = !!width.value && all.length > n;
  return { long, shown: long && !whole.value ? all.slice(0, n - 3) : all };
});
const long = computed(() => fold.value.long);
const shown = computed(() => fold.value.shown);
const more = computed(() => (chosen.value?.colors?.length ?? 0) - shown.value.length);
</script>

<style scoped>
.swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 4px;
}
.more {
  height: 22px;
  min-width: 72px; /* three swatches and their gaps */
  padding: 0 4px;
  border: 1px dashed rgba(128, 128, 128, 0.6);
  border-radius: 3px;
  background: none;
  color: inherit;
  font: inherit;
  font-size: 11px;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
}
.more:hover {
  border-color: currentColor;
}
.dot {
  width: 22px;
  height: 22px;
  border-radius: 3px;
  border: 1px solid rgba(128, 128, 128, 0.45);
  background-size: cover;
}
</style>
