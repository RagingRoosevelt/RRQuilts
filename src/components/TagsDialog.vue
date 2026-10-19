<template>
  <!-- The quilter's tags on an item, and its technique (spec 029): technique is the author's, so
       it's changed only on the quilter's own items and shown on others'. -->
  <q-dialog :model-value="!!target" @update:model-value="(v) => !v && emit('close')">
    <q-card v-if="target" style="width: 420px; max-width: 95vw">
      <q-card-section class="text-h6">
        {{ target.editTechniques ? 'Tags & technique' : 'Tags' }}
        <div class="text-caption text-grey-7">{{ target.name }}</div>
      </q-card-section>
      <q-card-section class="column" style="gap: 12px">
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
          @filter="filter"
        />
        <div>
          <div class="text-subtitle2">Technique</div>
          <q-option-group
            v-if="target.editTechniques"
            v-model="techniques"
            type="checkbox"
            dense
            :options="TECHNIQUE_OPTIONS"
          />
          <div v-else class="text-body2">
            {{ techniqueNames || 'Not given' }}
            <div class="text-caption text-grey-7">Set by its author.</div>
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat no-caps label="Cancel" @click="emit('close')" />
        <q-btn flat no-caps color="primary" label="Save" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { TECHNIQUES, type Technique } from '@/model/schema/shared';
import { cleanTags, type TagTarget } from '@/model/tags';

const props = defineProps<{ target: TagTarget | null; vocabulary: readonly string[] }>();
const emit = defineEmits<{
  close: [];
  save: [value: { tags: string[]; techniques: Technique[] }];
}>();

const TECHNIQUE_OPTIONS = Object.entries(TECHNIQUES).map(([value, label]) => ({ value, label }));
const tags = ref<string[]>([]);
const techniques = ref<Technique[]>([]);
const techniqueNames = computed(() => techniques.value.map((t) => TECHNIQUES[t]).join(', '));
watch(
  () => props.target,
  (t) => {
    tags.value = [...(t?.tags ?? [])];
    techniques.value = [...(t?.techniques ?? [])];
  },
  { immediate: true },
);

// Tags in use anywhere, matched as you type; Enter adds a new one.
const options = ref<string[]>([]);
function filter(typed: string, done: (fn: () => void) => void) {
  const q = typed.trim().toLowerCase();
  done(() => (options.value = props.vocabulary.filter((t) => t.toLowerCase().includes(q))));
}
function save() {
  emit('save', {
    // A tag differing only in case from one in use takes that spelling.
    tags: cleanTags(tags.value, props.vocabulary),
    techniques: Object.keys(TECHNIQUES).filter((t) =>
      techniques.value.includes(t as Technique),
    ) as Technique[],
  });
}
</script>
