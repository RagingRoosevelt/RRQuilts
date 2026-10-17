<template>
  <!-- A section of related fields under a divider line with its label set into it, and an
       optional control (#aside) at the line's right end. -->
  <div class="field-group">
    <div class="head">
      <span class="label" :class="{ heading }">{{ label }}</span>
      <span class="line" />
      <slot name="aside" />
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
/** `heading`: a top-level section of a tab (stronger label). */
defineProps<{ label: string; heading?: boolean }>();
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
