<template>
  <!-- Data Quilts (spec 041): every data quilt this device knows, its picture as entered so far,
       and when data was last entered; tap one to enter data. -->
  <q-page padding>
    <div class="row items-center q-mb-md" style="gap: 8px">
      <h1 class="text-h5 q-my-none col">Data Quilts</h1>
      <HelpLink topic="guides/data-quilts" label="Data quilts" />
    </div>
    <div v-if="loading" class="row justify-center q-pa-lg"><q-spinner size="32px" /></div>
    <div v-else-if="!store.cards.length" class="text-grey-7" style="max-width: 520px">
      No data quilts yet. A project's data quilts show here once it has been opened on this device.
      To make one, turn on Data quilt in a quilt's Layout tab.
    </div>
    <div v-else class="cards">
      <q-card
        v-for="c in store.cards"
        :key="`${c.projectId}:${c.quiltId}`"
        flat
        bordered
        class="cursor-pointer column"
        @click="enter(c)"
      >
        <div class="pic row items-center justify-center">
          <img v-if="pictureOf(c)" :src="pictureOf(c)" :alt="c.quiltName" />
          <div v-else-if="store.failed.get(c.projectId)" class="text-caption text-negative q-pa-md">
            {{ store.failed.get(c.projectId) }}
          </div>
          <q-btn
            v-else-if="store.needsAsk.has(c.projectId)"
            outline
            no-caps
            icon="visibility"
            label="Show"
            @click.stop="show(c)"
          >
            <q-tooltip>Asks the browser to let RRQuilts read the project file</q-tooltip>
          </q-btn>
        </div>
        <q-card-section class="q-pt-sm col">
          <div class="row items-start no-wrap">
            <div class="col" style="min-width: 0">
              <div class="text-weight-medium ellipsis">{{ c.quiltName }}</div>
              <div class="text-caption text-grey-7 ellipsis">{{ c.projectName }}</div>
            </div>
            <q-btn flat dense round icon="more_vert" aria-label="More" @click.stop>
              <q-menu auto-close>
                <q-list dense style="min-width: 180px">
                  <q-item clickable @click="openProject(c)">
                    <q-item-section>Open project</q-item-section>
                  </q-item>
                  <q-item clickable :disable="!store.docOf(c.projectId)" @click="steps(c)">
                    <q-item-section>Print instructions</q-item-section>
                  </q-item>
                  <q-item v-if="c.handle" clickable @click="store.forget(c.projectId)">
                    <q-item-section>Forget</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
          <div class="text-caption q-mt-xs">{{ lastNote(c) }}</div>
          <div class="row q-mt-xs" style="gap: 4px">
            <q-badge v-if="c.draft" color="warning" label="Unsaved changes" />
            <q-badge
              v-if="store.pending.get(c.projectId)"
              color="info"
              label="Waiting for the project to open"
            >
              <q-tooltip
                >Data entered here is written into the project when you next open it</q-tooltip
              >
            </q-badge>
            <q-badge v-if="c.projectId === openId" color="primary" label="Open" />
          </div>
        </q-card-section>
      </q-card>
    </div>
    <DataEntryDialog ref="dialog" />
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import DataEntryDialog from '@/components/DataEntryDialog.vue';
import HelpLink from '@/components/HelpLink.vue';
import { useOpenProject } from '@/composables/open-project';
import { lastEntry, nextDays } from '@/model/data-quilt';
import { quiltThumbnail } from '@/render/thumbnail';
import { useDataQuiltsStore, type DataCard } from '@/stores/data-quilts';
import { useProjectStore } from '@/stores/project';

const $q = useQuasar();
const router = useRouter();
const store = useDataQuiltsStore();
const project = useProjectStore();
const { openWith } = useOpenProject();
const dialog = ref<InstanceType<typeof DataEntryDialog>>();
const loading = ref(true);
const openId = computed(() => (project.isOpen ? project.doc!.project.id : undefined));

onMounted(async () => {
  await store.refresh();
  loading.value = false;
});

function pictureOf(c: DataCard) {
  const doc = store.docOf(c.projectId);
  const q = store.quiltOf(c);
  if (!doc || !q?.data) return '';
  return quiltThumbnail(doc, { ...q, data: { ...q.data, show: 'real' } }, 320, $q.dark.isActive);
}

const short = (k: string) =>
  new Date(`${k}T00:00:00Z`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
function lastNote(c: DataCard) {
  const plan = store.quiltOf(c)?.data;
  if (!plan) return '';
  const last = lastEntry(plan);
  return last ? `Last entry ${short(last)}` : 'No entries yet';
}

async function show(c: DataCard) {
  if (c.handle) await store.read(c.projectId, c.handle, true);
}

async function enter(c: DataCard) {
  if (!store.docOf(c.projectId)) {
    if (!store.needsAsk.has(c.projectId)) return;
    await show(c);
    if (!store.docOf(c.projectId)) return;
  }
  dialog.value?.show(c);
}

function steps(c: DataCard) {
  const doc = store.docOf(c.projectId);
  const plan = store.quiltOf(c)?.data;
  if (!doc || !plan) return;
  store.stepsInput = { doc, quiltId: c.quiltId, days: nextDays(plan) };
  void router.push('/data/steps');
}

function openProject(c: DataCard) {
  if (c.projectId === openId.value) return void router.push('/project');
  if (c.draft) return void openWith(() => project.restoreDraft(c.draft!));
  const handle = c.handle;
  if (handle)
    void openWith(() =>
      project.openRecent({ id: c.projectId, name: c.projectName, openedAt: 0, handle }),
    );
}
</script>

<style scoped>
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}
.pic {
  height: 200px;
  padding: 8px;
}
.pic img {
  max-width: 100%;
  max-height: 100%;
}
</style>
