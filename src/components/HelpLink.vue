<template>
  <!-- A "?" that opens the Help topic explaining this screen or section (spec 013 US6). -->
  <q-btn
    flat
    round
    dense
    size="sm"
    icon="help_outline"
    :to="`/help/${topic}`"
    :aria-label="`Help: ${label}`"
    class="help-link"
  >
    <q-tooltip>Help: {{ label }}</q-tooltip>
  </q-btn>
</template>

<script setup lang="ts">
/** `topic`: "<section>/<id>" (e.g. "math/half-square-triangles"); `label`: what it explains. */
defineProps<{ topic: string; label: string }>();
</script>

<style scoped>
@media print {
  .help-link {
    display: none;
  }
}
</style>
