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
      <div class="row no-wrap" style="gap: 8px">
        <q-btn
          outline
          class="col"
          icon="folder_open"
          label="Open a project file"
          no-caps
          @click="openPicked"
        />
        <q-btn
          outline
          class="col"
          icon="restore"
          label="Restore unsaved project"
          no-caps
          @click="backups?.show()"
        />
      </div>
      <div class="text-caption text-grey-7">…or drop a .rrq file anywhere on this window.</div>

      <!-- Recent projects; unsaved work shows here too (opened from its draft) instead of a popup. -->
      <q-list v-if="recent.length || looseDrafts.length" bordered separator class="rounded-borders">
        <q-item-label header>Recent projects</q-item-label>
        <q-item v-for="r in recent" :key="r.id" clickable @click="openRecent(r)">
          <q-item-section avatar><q-icon name="description" /></q-item-section>
          <q-item-section>
            <q-item-label>{{ r.name }}</q-item-label>
            <q-item-label caption>{{ new Date(r.openedAt).toLocaleString() }}</q-item-label>
          </q-item-section>
          <q-item-section v-if="draftOf(r.id)" side>
            <q-btn
              flat
              dense
              no-caps
              color="warning"
              icon="restore"
              label="Unsaved changes"
              @click.stop="openDraft(draftOf(r.id)!)"
            >
              <q-tooltip>
                Open the changes made {{ when(draftOf(r.id)!.savedAt) }} that weren't saved to the
                file
              </q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
        <q-item v-for="d in looseDrafts" :key="d.id" clickable @click="openDraft(d)">
          <q-item-section avatar><q-icon name="restore" color="warning" /></q-item-section>
          <q-item-section>
            <q-item-label>{{ d.name }}</q-item-label>
            <q-item-label caption>Not saved to a file yet · {{ when(d.savedAt) }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              flat
              round
              dense
              icon="delete"
              :aria-label="`Discard ${d.name}`"
              @click.stop="discardDraft(d)"
            >
              <q-tooltip>Discard these unsaved changes</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>

      <q-btn flat icon="collections_bookmark" label="Libraries" no-caps to="/libraries" />
      <q-btn flat icon="settings" label="Settings" no-caps @click="settingsOpen = true" />
    </div>
    <RestoreDrafts ref="backups" manual />
    <QuiltWizard
      ref="wizard"
      :units="settings.settings.units"
      @create="(l, b) => startQuilt(l, b, true)"
    />
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, onMounted, ref, shallowRef } from 'vue';
import { lockedProjects } from '@/session/tab-lock';
import { unsavedDrafts, type Draft } from '@/storage/drafts';
import { useRoute, useRouter } from 'vue-router';
import { pickProject, supportsFileAccess } from '@/storage/files';
import { recentProjects, type RecentEntry } from '@/storage/recent';
import { useProjectStore } from '@/stores/project';
import { useOpenProject } from '@/composables/open-project';
import { useStartQuilt } from '@/composables/start-quilt';
import QuiltWizard from '@/components/QuiltWizard.vue';
import RestoreDrafts from '@/components/RestoreDrafts.vue';
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
const backups = ref<InstanceType<typeof RestoreDrafts>>();
const startQuilt = useStartQuilt();

onMounted(async () => {
  if (route.query.notice === 'open-project') {
    $q.notify({ message: 'Open a project first.', color: 'warning', textColor: 'dark' });
    void router.replace({ path: '/' });
  }
  if (supportsFileAccess())
    recent.value = (await recentProjects().catch(() => [])).filter((r) => r.handle);
  await loadDrafts(); // every browser: unsaved work is listed (Firefox has no recent files)
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

function openRecent(r: RecentEntry) {
  const d = draftOf(r.id);
  if (!d) return void openWith(() => project.openRecent(r));
  // The project has unsaved changes here: open those, or the file (losing them).
  $q.dialog({
    title: `${r.name} has unsaved changes`,
    message: `Changes from ${when(d.savedAt)} weren't saved to the file.`,
    options: {
      type: 'radio',
      model: 'draft',
      items: [
        { label: 'Open the unsaved changes', value: 'draft' },
        { label: 'Open the saved file (the unsaved changes are lost)', value: 'file' },
      ],
    },
    cancel: true,
    ok: { label: 'Open', flat: true },
  }).onOk((pick: 'draft' | 'file') => {
    if (pick === 'draft') return openDraft(d);
    void discardDraft(d).then(() => openWith(() => project.openRecent(r)));
  });
}

// Unsaved work (drafts) beside the recent projects.
const drafts = shallowRef<Draft[]>([]);
async function loadDrafts() {
  try {
    const locked = await lockedProjects(); // being edited in another tab: not lost
    drafts.value = (await unsavedDrafts()).filter(
      (d) => !locked.has(d.id) && d.id !== project.doc?.project.id,
    );
  } catch {
    drafts.value = [];
  }
}
const draftOf = (id: string) => drafts.value.find((d) => d.id === id);
/** Unsaved work with no file in the recent list: shown on its own. */
const looseDrafts = computed(() =>
  drafts.value.filter((d) => !recent.value.some((r) => r.id === d.id)),
);
const when = (t: number) => new Date(t).toLocaleString();
function openDraft(d: Draft) {
  confirmLeave(async () => {
    await project.restoreDraft(d);
    await router.push('/project');
  });
}
async function discardDraft(d: Draft) {
  await project.discardDraft(d);
  drafts.value = drafts.value.filter((x) => x.id !== d.id);
}
</script>
