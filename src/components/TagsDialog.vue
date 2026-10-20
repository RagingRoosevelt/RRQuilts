<template>
  <!-- The quilter's tags on an item (spec 029). Techniques are the block designer's, in Details. -->
  <q-dialog :model-value="!!target" @update:model-value="(v) => !v && emit('close')">
    <q-card v-if="target" style="width: 420px; max-width: 95vw">
      <DialogClose />
      <q-card-section class="text-h6">
        Tags
        <div class="text-caption text-grey-7">{{ target.name }}</div>
      </q-card-section>
      <q-card-section>
        <q-select
          v-model="tags"
          label="Tags"
          hint="Your own words for finding it. Only you see them."
          :options="options"
          dense
          outlined
          multiple
          use-chips
          use-input
          hide-dropdown-icon
          input-debounce="0"
          new-value-mode="add-unique"
          :option-label="tagLabel"
          @filter="filter"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat no-caps label="Cancel" @click="emit('close')" />
        <q-btn flat no-caps color="primary" label="Save" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import DialogClose from './DialogClose.vue';
import { ref, watch } from 'vue';
import { cleanTags, tagLabel, type TagTarget } from '@/model/tags';

const props = defineProps<{ target: TagTarget | null; vocabulary: readonly string[] }>();
const emit = defineEmits<{ close: []; save: [tags: string[]] }>();

const tags = ref<string[]>([]);
watch(
  () => props.target,
  (t) => (tags.value = [...(t?.tags ?? [])]),
  { immediate: true },
);

// Tags in use anywhere, matched as you type; Enter adds a new one.
const options = ref<string[]>([]);
function filter(typed: string, done: (fn: () => void) => void) {
  const q = typed.trim().toLowerCase();
  done(() => (options.value = props.vocabulary.filter((t) => t.toLowerCase().includes(q))));
}
// A tag differing only in case from one in use takes that spelling.
const save = () => emit('save', cleanTags(tags.value, props.vocabulary));
</script>
