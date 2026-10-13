<template>
  <q-page padding>
    <div class="q-gutter-md column" style="max-width: 460px">
      <h1 class="text-h4">RRQuilts</h1>
      <q-btn
        color="primary"
        size="lg"
        icon="add"
        label="Start a quilt"
        no-caps
        @click="confirmLeave(() => wizard?.show())"
      />
      <q-btn flat icon="note_add" label="New project" no-caps @click="confirmLeave(newProject)" />
      <q-btn outline icon="folder_open" label="Open a project file" no-caps @click="openPicked" />
      <div class="text-caption text-grey-7">…or drop a .rrq file anywhere on this window.</div>

      <q-list v-if="recent.length" bordered separator class="rounded-borders">
        <q-item-label header>Recent projects</q-item-label>
        <q-item v-for="r in recent" :key="r.id" clickable @click="openRecent(r)">
          <q-item-section avatar><q-icon name="description" /></q-item-section>
          <q-item-section>
            <q-item-label>{{ r.name }}</q-item-label>
            <q-item-label caption>{{ new Date(r.openedAt).toLocaleString() }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <q-btn flat icon="collections_bookmark" label="Libraries" no-caps to="/libraries" />
      <q-btn flat icon="settings" label="Settings" no-caps @click="settingsOpen = true" />
    </div>
    <QuiltWizard
      ref="wizard"
      :units="settings.settings.units"
      @create="(l, b) => startQuilt(l, b, true)"
    />
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { pickProject, supportsFileAccess } from '@/storage/files';
import { recentProjects, type RecentEntry } from '@/storage/recent';
import { useProjectStore } from '@/stores/project';
import { useOpenProject } from '@/composables/open-project';
import { useStartQuilt } from '@/composables/start-quilt';
import QuiltWizard from '@/components/QuiltWizard.vue';
import { settingsOpen } from '@/composables/settings-open';
import { useSettingsStore } from '@/stores/settings';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const project = useProjectStore();
const { openWith } = useOpenProject();
const recent = ref<RecentEntry[]>([]);
const settings = useSettingsStore();
const wizard = ref<InstanceType<typeof QuiltWizard>>();
const startQuilt = useStartQuilt();

onMounted(async () => {
  if (route.query.notice === 'open-project') {
    $q.notify({ message: 'Open a project first.', color: 'warning', textColor: 'dark' });
    void router.replace({ path: '/' });
  }
  if (supportsFileAccess()) {
    recent.value = (await recentProjects().catch(() => [])).filter((r) => r.handle);
  }
});

/** Starting something new closes the open project; unsaved work stays in its draft. */
function confirmLeave(go: () => unknown) {
  if (!project.dirty || project.readOnly) return void go();
  $q.dialog({
    title: `Close "${project.doc!.project.name}"?`,
    message: 'It has unsaved changes. They are kept in a draft you can restore later.',
    cancel: true,
    ok: { label: 'Continue', flat: true },
  }).onOk(go);
}

async function newProject() {
  await project.newProject();
  await router.push('/project');
}

async function openPicked() {
  const picked = await pickProject().catch((e: Error) => {
    $q.notify({ type: 'negative', message: e.message });
    return null;
  });
  if (picked) await openWith(() => project.openFile(picked));
}

const openRecent = (r: RecentEntry) => openWith(() => project.openRecent(r));
</script>
