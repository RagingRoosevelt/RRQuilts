<template>
  <q-page padding>
    <div class="q-gutter-md column" style="max-width: 460px">
      <h1 class="text-h4">RRQuilts</h1>
      <div class="row items-center no-wrap" style="gap: 4px">
        <q-btn
          color="primary"
          size="lg"
          icon="add"
          label="Start a quilt"
          no-caps
          class="col"
          @click="confirmLeave(() => wizard?.show())"
        />
        <HelpLink topic="guides/getting-started#start-a-quilt" label="Start a quilt" />
      </div>
      <div class="row items-center no-wrap" style="gap: 4px">
        <q-btn
          flat
          icon="note_add"
          label="New project"
          no-caps
          class="col"
          @click="confirmLeave(newProject)"
        />
        <HelpLink topic="guides/sketchbook" label="New project" />
      </div>
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
          icon="cloud_download"
          label="Open from a gist"
          no-caps
          @click="openGist"
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
      <q-btn
        outline
        icon="restore"
        label="Restore unsaved project"
        no-caps
        @click="backups?.show()"
      />

      <q-btn flat icon="collections_bookmark" label="Libraries" no-caps to="/libraries" />
      <q-btn flat icon="settings" label="Settings" no-caps @click="settingsOpen = true" />
    </div>
    <RestoreDrafts ref="backups" manual />
    <!-- Gist text is the sharer's: shown as text, never as HTML. -->
    <q-dialog :model-value="!!gistAsk" @update:model-value="gistAsk = null">
      <q-card v-if="gistAsk" style="width: 460px; max-width: 95vw">
        <DialogClose />
        <q-card-section>
          <h1 class="text-h6 q-my-none">Open from a gist?</h1>
          <h2
            v-if="gistAsk.files.length === 1"
            class="text-subtitle1 text-weight-medium q-my-none q-mt-sm"
          >
            {{ gistAsk.files[0]!.name
            }}<a
              :href="gistAsk.files[0]!.page"
              target="_blank"
              rel="noopener noreferrer"
              class="gist-link"
              aria-label="See it on GitHub"
              title="See it on GitHub"
              ><q-icon name="open_in_new" size="16px"
            /></a>
          </h2>
          <div v-for="(f, i) in gistAsk.files" v-else :key="f.url" class="row items-center no-wrap">
            <q-radio v-model="gistAsk.pick" :val="i" :label="f.name" /><a
              :href="f.page"
              target="_blank"
              rel="noopener noreferrer"
              class="gist-link"
              aria-label="See it on GitHub"
              title="See it on GitHub"
              ><q-icon name="open_in_new" size="16px"
            /></a>
          </div>
          <h3 class="text-caption q-my-none byline">
            by {{ gistAsk.owner || 'an anonymous GitHub user' }}
          </h3>
          <fieldset v-if="gistAsk.title" class="gist-desc q-mt-md">
            <legend>Author’s description</legend>
            <p class="q-ma-none">{{ gistAsk.title }}</p>
          </fieldset>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup flat no-caps label="Cancel" />
          <q-btn flat no-caps color="primary" label="Open" @click="openGistFile" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <QuiltWizard
      ref="wizard"
      :units="settings.settings.units"
      @create="(l, b, t) => startQuilt(l, b, t, true)"
    />
  </q-page>
</template>

<script setup lang="ts">
import DialogClose from '@/components/DialogClose.vue';
import HelpLink from '@/components/HelpLink.vue';
import { useQuasar } from 'quasar';
import { computed, onMounted, ref, shallowRef } from 'vue';
import { lockedProjects } from '@/session/tab-lock';
import { unsavedDrafts, type Draft } from '@/storage/drafts';
import { useRoute, useRouter } from 'vue-router';
import { pickProject, supportsFileAccess } from '@/storage/files';
import { recentProjects, type RecentEntry } from '@/storage/recent';
import { gistId, gistProjects, gistText, type GistFile } from '@/storage/gist';
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
  // A shared link (/?open_gist=<gist link or id>): the gist's details are fetched to show who
  // shared what; its project opens only once the quilter says so.
  const link = route.query.open_gist;
  if (typeof link === 'string') {
    await router.replace({ path: '/' }); // first: dialogs close when the route changes
    const id = gistId(link);
    if (!id) $q.notify({ type: 'negative', message: 'That link doesn’t point at a GitHub gist.' });
    else void fetchGist(id);
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

/** A project file from a GitHub gist (link or id); several in the gist: pick one. */
function openGist() {
  $q.dialog({
    title: 'Open from a gist',
    message: 'Paste the link to a GitHub gist that has an RRQuilts project file (.rrq).',
    prompt: {
      model: '',
      type: 'text',
      placeholder: 'https://gist.github.com/…',
      isValid: (v: string) => !!gistId(v),
    },
    cancel: true,
    ok: { label: 'Open', flat: true },
  }).onOk((v: string) => void fetchGist(gistId(v)!));
}
const gistFail = (e: unknown) =>
  void $q.notify({ type: 'negative', message: e instanceof Error ? e.message : String(e) });
/** The gist being asked about: who shared what, and the file picked (when it has several). */
const gistAsk = ref<{ title: string; owner: string; files: GistFile[]; pick: number } | null>(null);
async function fetchGist(id: string) {
  const wait = $q.notify({
    group: false,
    timeout: 0,
    spinner: true,
    message: 'Fetching the gist…',
  });
  try {
    const g = await gistProjects(id);
    if (!g.files.length) throw new Error('That gist has no RRQuilts project files (.rrq).');
    // Who shared it (GitHub's account name, not the link's) and what, before anything opens.
    gistAsk.value = { ...g, pick: 0 };
  } catch (e) {
    gistFail(e);
  } finally {
    wait();
  }
}
async function openGistFile() {
  const f = gistAsk.value!.files[gistAsk.value!.pick]!;
  gistAsk.value = null;
  const done = $q.notify({
    group: false,
    timeout: 0,
    spinner: true,
    message: `Opening ${f.name}…`,
  });
  try {
    const text = await gistText(f);
    // Opened like a picked file with no place to save back to: Save asks where.
    await openWith(() => project.openFile({ file: new File([text], f.name) }));
  } catch (e) {
    gistFail(e);
  } finally {
    done();
  }
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
  confirmLeave(() => openWith(() => project.restoreDraft(d)));
}
async function discardDraft(d: Draft) {
  await project.discardDraft(d);
  drafts.value = drafts.value.filter((x) => x.id !== d.id);
}
</script>

<style scoped>
.byline {
  opacity: 0.7; /* muted in light and dark alike */
}
.gist-link {
  color: inherit;
  opacity: 0.7;
  margin-left: 4px;
  vertical-align: middle;
}
.gist-link:hover {
  opacity: 1;
}
/* Top border only, its label set into the line. */
.gist-desc {
  margin-inline: 0;
  padding: 4px 0 0;
  border: 0;
  border-top: 1px solid rgba(128, 128, 128, 0.4);
}
.gist-desc legend {
  padding: 0 6px 0 0;
  font-size: 0.75rem;
  opacity: 0.7;
}
.gist-desc p {
  white-space: pre-line;
  overflow-wrap: anywhere;
}
</style>
