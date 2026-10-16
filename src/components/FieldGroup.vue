<template>
  <!-- A section of related fields under a divider line with its label set into it. -->
  <fieldset class="field-group">
    <legend :class="{ heading }">{{ label }}</legend>
    <slot />
  </fieldset>
</template>

<script setup lang="ts">
/** `heading`: a top-level section of a tab (stronger label). */
defineProps<{ label: string; heading?: boolean }>();
</script>

<style scoped>
.field-group {
  margin-right: 0; /* the left and top come from the surrounding layout (q-gutter) */
  padding: 8px 0 0;
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.2);
  min-width: 0;
}
.field-group legend {
  margin-left: 12px;
  padding: 0 6px;
  font-size: 0.8rem;
  opacity: 0.75;
}
.field-group legend.heading {
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 1;
}
:global(.body--dark .field-group) {
  border-color: rgba(255, 255, 255, 0.25);
}
</style>
