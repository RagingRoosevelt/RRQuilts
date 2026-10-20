<template>
  <q-dialog v-model="open" persistent>
    <q-card style="min-width: 320px; max-width: 480px">
      <DialogClose />
      <q-card-section>
        <div class="text-h6">Restore unsaved work?</div>
        <div class="text-body2 text-grey-7">
          These projects had changes that weren't saved to a file.
        </div>
      </q-card-section>
      <q-card-section v-if="!drafts.length" class="text-grey-7">
        No unsaved work to restore.
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
import DialogClose from './DialogClose.vue';
import { onMounted, ref, shallowRef } from 'vue';
import { useOpenProject } from '@/composables/open-project';
import { lockedProjects } from '@/session/tab-lock';
import { unsavedDrafts, type Draft } from '@/storage/drafts';
import { useProjectStore } from '@/stores/project';

/** `manual`: opened on request (`show()`) instead of prompting at start when there's unsaved work. */
const props = defineProps<{ manual?: boolean }>();
const project = useProjectStore();
const { openWith } = useOpenProject();
// shallowRef: draft docs get frozen on restore; a deep-reactive proxy would break that.
const drafts = shallowRef<Draft[]>([]);
const open = ref(false);

const when = (t: number) => new Date(t).toLocaleString();

async function load() {
  try {
    // Projects being edited in another tab aren't lost; don't offer them.
    const locked = await lockedProjects();
    drafts.value = (await unsavedDrafts()).filter((d) => !locked.has(d.id));
  } catch {
    // No draft storage: nothing to restore.
    drafts.value = [];
  }
}

onMounted(async () => {
  if (props.manual) return;
  await load();
  open.value = drafts.value.length > 0;
});

async function show() {
  await load();
  open.value = true;
}
defineExpose({ show });

async function restore(d: Draft) {
  open.value = false;
  await openWith(() => project.restoreDraft(d));
}

async function discard(d: Draft) {
  await project.discardDraft(d);
  drafts.value = drafts.value.filter((x) => x.id !== d.id);
  if (!drafts.value.length && !props.manual) open.value = false;
}
</script>
