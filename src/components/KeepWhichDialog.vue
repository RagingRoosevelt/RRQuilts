<template>
  <!-- Two of the same thing (spec 035 A, B): this one, the incoming one, and a three-way switch
       between them. Steps through every clash; "Do the same for the rest" answers the others. -->
  <q-dialog :model-value="!!items?.length" @update:model-value="(v) => !v && emit('cancel')">
    <q-card v-if="current" style="width: 760px; max-width: 95vw">
      <DialogClose />
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
        <div class="text-caption text-grey-7">
          {{ current.title
          }}<template v-if="items!.length > 1"> · {{ step + 1 }} of {{ items!.length }}</template>
        </div>
      </q-card-section>
      <q-card-section class="row items-center no-wrap pair">
        <figure class="col">
          <img v-if="current.left.img" :src="current.left.img" :alt="current.left.label" />
          <div v-else class="swatch" :style="current.left.swatch?.()" />
          <figcaption>{{ current.left.label }}</figcaption>
        </figure>
        <SlidePicker v-model="choice" :options="options" label="Keep which" class="pick" />
        <figure class="col">
          <img v-if="current.right.img" :src="current.right.img" :alt="current.right.label" />
          <div v-else class="swatch" :style="current.right.swatch?.()" />
          <figcaption>{{ current.right.label }}</figcaption>
        </figure>
      </q-card-section>
      <q-card-section v-if="items!.length - step > 1" class="q-pt-none">
        <q-checkbox v-model="sameForRest" dense label="Do the same for the rest" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat no-caps label="Cancel" @click="emit('cancel')" />
        <q-btn
          flat
          no-caps
          color="primary"
          :label="items!.length - step > 1 && !sameForRest ? 'Next' : 'Done'"
          @click="next"
        />
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
  /** The switch's three words: keep the left one, keep both, use the right one. */
  labels: [string, string, string];
}>();
const emit = defineEmits<{ done: [choices: KeepChoice[]]; cancel: [] }>();

const step = ref(0);
const choice = ref<KeepChoice>('both');
const sameForRest = ref(false);
const picked = ref<KeepChoice[]>([]);
const current = computed(() => props.items?.[step.value]);
const options = computed(() =>
  (['left', 'both', 'right'] as const).map((value, i) => ({ value, label: props.labels[i]! })),
);
watch(
  () => props.items,
  () => {
    step.value = 0;
    choice.value = 'both';
    sameForRest.value = false;
    picked.value = [];
  },
);
function next() {
  const n = props.items!.length;
  picked.value.push(choice.value);
  if (sameForRest.value) while (picked.value.length < n) picked.value.push(choice.value);
  if (picked.value.length >= n) return emit('done', picked.value);
  step.value++;
}
</script>

<style scoped>
.pair {
  gap: 12px;
}
figure {
  margin: 0;
  text-align: center;
  min-width: 0;
}
figure img {
  width: 100%;
  max-height: 200px;
  object-fit: contain;
}
figcaption {
  font-size: 0.8rem;
  opacity: 0.8;
}
.swatch {
  width: 160px;
  height: 160px;
  margin: 0 auto 4px;
  border-radius: 6px;
}
.pick {
  flex: 0 0 240px;
}
</style>
