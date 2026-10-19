<template>
  <!-- A multi-pick filter dropdown with checkboxes; typing narrows its options. Empty = any.
       Options with a `group` get a section label where the group changes. -->
  <q-select
    v-model="picked"
    :options="shown"
    :label="label"
    dense
    outlined
    multiple
    use-chips
    use-input
    input-debounce="0"
    emit-value
    map-options
    clearable
    @clear="picked = []"
    @filter="(v: string, done: (fn: () => void) => void) => done(() => (needle = v.toLowerCase()))"
  >
    <template #option="{ itemProps, opt, selected, index }">
      <q-item-label
        v-if="opt.group && opt.group !== shown[index - 1]?.group"
        header
        class="q-py-xs text-weight-medium"
      >
        {{ opt.group }}
      </q-item-label>
      <q-item v-bind="itemProps" dense>
        <q-item-section side>
          <q-checkbox :model-value="selected" dense class="no-pointer-events" />
        </q-item-section>
        <q-item-section>{{ opt.label }}</q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{
  label: string;
  options: { label: string; value: string; group?: string }[];
}>();
const picked = defineModel<string[]>({ required: true });
const needle = ref('');
const shown = computed(() =>
  props.options.filter((o) => o.label.toLowerCase().includes(needle.value)),
);
</script>
