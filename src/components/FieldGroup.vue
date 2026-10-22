<template>
  <!-- A section of related fields under a divider line with its label set into it, and an
       optional control (#aside) at the line's right end. -->
  <div class="field-group">
    <div class="head">
      <button
        v-if="collapsible"
        type="button"
        class="label toggle"
        :class="{ heading }"
        :aria-expanded="open"
        @click="setOpen(!open)"
      >
        {{ label }}
        <q-icon :name="open ? 'expand_less' : 'expand_more'" size="18px" />
      </button>
      <span v-else class="label" :class="{ heading }">{{ label }}</span>
      <span class="line" />
      <slot name="aside" />
    </div>
    <div v-if="collapsible" v-show="open" class="column no-wrap" style="gap: 10px">
      <slot />
    </div>
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSettingsStore } from '@/stores/settings';

/** `heading`: a top-level section of a tab (stronger label). `collapsible`: the label folds the
 *  section away; which are folded is kept in settings, as the tray's sections. */
const props = defineProps<{ label: string; heading?: boolean; collapsible?: boolean }>();
const app = useSettingsStore();
const key = computed(() => `group:${props.label}`);
const open = computed(
  () => !props.collapsible || !app.settings.collapsedSections.includes(key.value),
);
function setOpen(v: boolean) {
  const rest = app.settings.collapsedSections.filter((l) => l !== key.value);
  app.settings.collapsedSections = v ? rest : [...rest, key.value];
}
</script>

<style scoped>
.field-group {
  min-width: 0;
}
.head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  min-height: 20px;
}
.head::before,
.line {
  content: '';
  border-top: 1px solid rgba(0, 0, 0, 0.2);
}
.head::before {
  flex: 0 0 12px;
}
.line {
  flex: 1;
}
.label {
  font-size: 0.8rem;
  opacity: 0.75;
}
.toggle {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: none;
  border: 0;
  padding: 0;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.label.heading {
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 1;
}
:global(.body--dark .field-group .head::before),
:global(.body--dark .field-group .line) {
  border-color: rgba(255, 255, 255, 0.25);
}
</style>
