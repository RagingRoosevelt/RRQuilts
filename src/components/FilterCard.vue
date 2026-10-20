<template>
  <!-- A labeled section: the label sits in the top border, no other borders. Its fields lay out in
       a grid, one column in a narrow sidebar. -->
  <fieldset class="filter-card">
    <legend>{{ label }}</legend>
    <slot />
  </fieldset>
</template>

<script setup lang="ts">
defineProps<{ label: string }>();
</script>

<style scoped>
.filter-card {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr));
  gap: 8px;
  margin: 0;
  padding: 4px 0 0;
  border: 0;
  border-top: 1px solid rgba(128, 128, 128, 0.4);
  min-width: 0;
}
legend {
  margin-left: 8px;
  padding: 0 4px;
  font-size: 0.875rem;
}
</style>
