<template>
  <div v-if="project.isOpen" class="row items-center no-wrap q-gutter-sm">
    <q-badge rounded :color="look.color" class="q-pa-xs" />
    <span class="text-caption gt-xs">{{ look.label }}</span>
    <q-btn
      v-if="!project.readOnly"
      flat
      dense
      no-caps
      icon="save"
      label="Save"
      :loading="saving"
      @click="save(false)"
    >
      <q-tooltip>Save (Ctrl+S) · Save as (Ctrl+Shift+S)</q-tooltip>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useProjectStore, type SaveStatus } from '@/stores/project';
import { useSettingsStore } from '@/stores/settings';

const $q = useQuasar();
const project = useProjectStore();
const settings = useSettingsStore();
const saving = ref(false);

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
  if (saving.value || !project.isOpen || project.readOnly) return;
  saving.value = true;
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
  } finally {
    saving.value = false;
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
