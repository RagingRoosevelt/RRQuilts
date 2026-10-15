<template>
  <!-- A "?" that opens the Help topic explaining this screen or section (spec 013 US6). -->
  <q-btn
    v-if="settings.settings.showHelp"
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
import { useSettingsStore } from '@/stores/settings';
/** `topic`: "<section>/<id>" (e.g. "math/half-square-triangles"); `label`: what it explains. */
defineProps<{ topic: string; label: string }>();
const settings = useSettingsStore();
</script>

<style scoped>
@media print {
  .help-link {
    display: none;
  }
}
</style>
