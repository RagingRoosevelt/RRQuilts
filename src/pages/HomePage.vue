<template>
  <q-page padding>
    <div class="q-gutter-md column" style="max-width: 460px">
      <h1 class="text-h4">RRQuilts</h1>
      <q-btn color="primary" size="lg" icon="add" label="New project" no-caps @click="newProject" />
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
      <q-btn flat icon="settings" label="Settings" no-caps to="/settings" />
    </div>
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

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const project = useProjectStore();
const { openWith } = useOpenProject();
const recent = ref<RecentEntry[]>([]);

onMounted(async () => {
  if (route.query.notice === 'open-project') {
    $q.notify({ message: 'Open a project first.', color: 'warning', textColor: 'dark' });
    void router.replace({ path: '/' });
  }
  if (supportsFileAccess()) {
    recent.value = (await recentProjects().catch(() => [])).filter((r) => r.handle);
  }
});

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
