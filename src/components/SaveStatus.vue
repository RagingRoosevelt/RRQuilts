<template>
  <template v-if="project.isOpen">
    <q-icon v-if="project.readOnly" name="lock" size="sm" class="q-mx-sm">
      <q-tooltip>{{ look.label }}</q-tooltip>
    </q-icon>
    <q-btn
      v-else
      flat
      round
      icon="save"
      :loading="project.writing"
      aria-label="Save"
      @click="save(false)"
    >
      <q-badge floating rounded :color="look.color" class="status-dot" />
      <q-tooltip>{{ look.label }} · Save (Ctrl+S) · Save as (Ctrl+Shift+S)</q-tooltip>
    </q-btn>
  </template>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { useProjectStore, type SaveStatus } from '@/stores/project';
import { useSettingsStore } from '@/stores/settings';

const $q = useQuasar();
const project = useProjectStore();
const settings = useSettingsStore();

const LOOKS: Record<SaveStatus, { color: string; label: string }> = {
  none: { color: 'grey', label: '' },
  new: { color: 'grey', label: 'Not saved yet' },
  saved: { color: 'positive', label: 'Saved to file' },
  unsaved: { color: 'warning', label: 'Unsaved changes (draft kept)' },
  'unsaved-no-draft': { color: 'negative', label: 'Draft not kept — save to file' },
  'read-only': { color: 'grey', label: 'Read-only' },
};
const look = computed(() => LOOKS[project.status]);

const DOWNLOAD_NOTE = 'download-save';

async function save(as: boolean) {
  if (project.writing || !project.isOpen || project.readOnly) return;
  try {
    const r = await (as ? project.saveAs() : project.save());
    if (r === 'downloaded' && !settings.settings.hintsDismissed.includes(DOWNLOAD_NOTE)) {
      settings.settings.hintsDismissed.push(DOWNLOAD_NOTE);
      $q.dialog({
        title: 'Saved as a download',
        message:
          "This browser doesn't let web apps write to files, so each save downloads a new copy of " +
          'your .rrq file. Chrome or Edge save straight back to the same file.',
      });
    }
  } catch (e) {
    $q.notify({ type: 'negative', message: `Couldn't save: ${(e as Error).message}` });
  }
}

function onKey(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    void save(e.shiftKey);
  }
}
onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<style scoped>
.status-dot {
  top: 6px;
  right: 6px;
  padding: 5px;
  min-height: 0;
  border: 2px solid var(--q-primary);
}
</style>
