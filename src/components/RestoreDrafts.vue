<template>
  <q-dialog v-model="open" persistent>
    <q-card style="min-width: 320px; max-width: 480px">
      <q-card-section>
        <div class="text-h6">Restore unsaved work?</div>
        <div class="text-body2 text-grey-7">
          These projects had changes that weren't saved to a file.
        </div>
      </q-card-section>
      <q-list separator>
        <q-item v-for="d in drafts" :key="d.id">
          <q-item-section>
            <q-item-label>{{ d.name }}</q-item-label>
            <q-item-label caption>{{ when(d.savedAt) }}</q-item-label>
          </q-item-section>
          <q-item-section side class="row no-wrap">
            <div class="row q-gutter-xs">
              <q-btn flat dense no-caps color="negative" label="Discard" @click="discard(d)" />
              <q-btn unelevated dense no-caps color="primary" label="Restore" @click="restore(d)" />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
      <q-card-actions align="right">
        <q-btn flat no-caps label="Decide later" @click="open = false" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import { lockedProjects } from '@/session/tab-lock';
import { unsavedDrafts, type Draft } from '@/storage/drafts';
import { useProjectStore } from '@/stores/project';

const project = useProjectStore();
const router = useRouter();
// shallowRef: draft docs get frozen on restore; a deep-reactive proxy would break that.
const drafts = shallowRef<Draft[]>([]);
const open = ref(false);

const when = (t: number) => new Date(t).toLocaleString();

onMounted(async () => {
  try {
    // Projects being edited in another tab aren't lost; don't offer them.
    const locked = await lockedProjects();
    drafts.value = (await unsavedDrafts()).filter((d) => !locked.has(d.id));
    open.value = drafts.value.length > 0;
  } catch {
    // No draft storage: nothing to restore.
  }
});

async function restore(d: Draft) {
  open.value = false;
  await project.restoreDraft(d);
  await router.push('/project');
}

async function discard(d: Draft) {
  await project.discardDraft(d);
  drafts.value = drafts.value.filter((x) => x.id !== d.id);
  if (!drafts.value.length) open.value = false;
}
</script>
