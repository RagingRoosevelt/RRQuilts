<template>
  <!-- A multi-pick filter dropdown with checkboxes; typing narrows its options. Empty = any. -->
  <q-select
    v-model="picked"
    :options="options.filter((o) => o.label.toLowerCase().includes(needle))"
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
    <template #option="{ itemProps, opt, selected }">
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
import { ref } from 'vue';

defineProps<{ label: string; options: { label: string; value: string }[] }>();
const picked = defineModel<string[]>({ required: true });
const needle = ref('');
</script>
