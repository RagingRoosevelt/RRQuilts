<template>
  <!-- Two of the same thing (spec 035 A, B): every clash in one scrolling list, this one and the
       incoming one side by side with a three-way "Keep which?" switch between them. Each starts on
       keeping this one; "All" sets every row. -->
  <q-dialog :model-value="!!items?.length" @update:model-value="(v) => !v && emit('cancel')">
    <q-card v-if="items" style="width: 760px; max-width: 95vw">
      <DialogClose />
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
        <div v-if="items.length > 1" class="row items-center q-mt-sm" style="gap: 12px">
          <span class="text-caption">All {{ items.length }}:</span>
          <SlidePicker
            :model-value="allSame ?? ''"
            :options="options"
            label="Keep which, for all"
            class="pick"
            @update:model-value="(v) => choices.fill(v as KeepChoice)"
          />
        </div>
      </q-card-section>
      <q-card-section class="q-pt-none list">
        <div v-for="(it, i) in items" :key="i" class="pair">
          <div class="name text-subtitle2 ellipsis">{{ it.title }}</div>
          <figure :class="{ dim: choices[i] === 'right' }">
            <img v-if="it.left.img" :src="it.left.img" :alt="it.left.label" />
            <div v-else class="swatch" :style="it.left.swatch?.()" />
            <figcaption>{{ it.left.label }}</figcaption>
          </figure>
          <div class="column items-center pick-col">
            <div class="text-caption">Keep which?</div>
            <SlidePicker
              :model-value="choices[i]!"
              :options="options"
              :label="`Keep which: ${it.title}`"
              class="pick"
              @update:model-value="(v) => (choices[i] = v as KeepChoice)"
            />
          </div>
          <figure :class="{ dim: choices[i] === 'left' }">
            <img v-if="it.right.img" :src="it.right.img" :alt="it.right.label" />
            <div v-else class="swatch" :style="it.right.swatch?.()" />
            <figcaption>
              {{ it.right.label }}
              <div v-if="choices[i] === 'both' && it.right.bothName" class="text-weight-medium">
                Comes in as “{{ it.right.bothName }}”
              </div>
            </figcaption>
          </figure>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat no-caps label="Cancel" @click="emit('cancel')" />
        <q-btn flat no-caps color="primary" label="Done" @click="emit('done', [...choices])" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import DialogClose from './DialogClose.vue';
import SlidePicker from './SlidePicker.vue';

export type KeepChoice = 'left' | 'both' | 'right';
/** One side: a picture, or a swatch style (a fabric; a function, so it updates as images load). */
export interface KeepSide {
  label: string;
  img?: string;
  swatch?: () => Record<string, string>;
  /** The incoming one's name if both are kept. */
  bothName?: string;
}
export interface KeepItem {
  title: string;
  left: KeepSide;
  right: KeepSide;
}

const props = defineProps<{
  /** The clashes (none: closed). */
  items: KeepItem[] | null;
  title: string;
  /** The switch's three words (short): this one, both, the incoming one. */
  labels: [string, string, string];
}>();
const emit = defineEmits<{ done: [choices: KeepChoice[]]; cancel: [] }>();

const choices = ref<KeepChoice[]>([]);
const options = computed(() =>
  (['left', 'both', 'right'] as const).map((value, i) => ({ value, label: props.labels[i]! })),
);
/** The choice every row has (none when they differ). */
const allSame = computed(() =>
  choices.value.every((c) => c === choices.value[0]) ? choices.value[0] : undefined,
);
watch(
  () => props.items,
  (it) => (choices.value = (it ?? []).map(() => 'left')),
  { immediate: true },
);
</script>

<style scoped>
.list {
  max-height: 60vh;
  overflow: auto;
}
.pair {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  gap: 4px 12px;
  align-items: center;
  padding: 8px 0;
  border-top: 1px solid rgba(128, 128, 128, 0.25);
}
.name {
  grid-column: 1 / -1;
}
figure {
  margin: 0;
  text-align: center;
  min-width: 0;
  transition: opacity 0.15s;
}
figure.dim {
  opacity: 0.4;
}
figure img {
  width: 100%;
  max-height: 160px;
  object-fit: contain;
}
figcaption {
  font-size: 0.8rem;
  opacity: 0.8;
}
.swatch {
  width: 120px;
  height: 120px;
  margin: 0 auto 4px;
  border-radius: 6px;
}
.pick-col {
  gap: 4px;
}
.pick {
  width: 220px;
}
@media (max-width: 600px) {
  .pick {
    width: 180px;
  }
}
</style>
