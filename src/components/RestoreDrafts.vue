<template>
  <q-dialog v-model="open" persistent>
    <q-card style="min-width: 320px; max-width: 480px">
      <q-card-section>
        <div class="text-h6">{{ all ? 'Backed-up projects' : 'Restore unsaved work?' }}</div>
        <div class="text-body2 text-grey-7">
          {{
            all
              ? 'This browser keeps a copy of each project you open. It is not a save: keep your .rrq files.'
              : "These projects had changes that weren't saved to a file."
          }}
        </div>
      </q-card-section>
      <q-card-section v-if="all && !drafts.length" class="text-grey-7">
        No backups in this browser.
      </q-card-section>
      <q-list separator>
        <q-item v-for="d in drafts" :key="d.id">
          <q-item-section>
            <q-item-label>{{ d.name }}</q-item-label>
            <q-item-label caption
              >{{ when(d.savedAt) }}{{ all && d.dirty ? ' · unsaved changes' : '' }}</q-item-label
            >
          </q-item-section>
          <q-item-section side class="row no-wrap">
            <div class="row q-gutter-xs">
              <q-btn
                flat
                dense
                no-caps
                color="negative"
                :label="all ? 'Delete' : 'Discard'"
                @click="discard(d)"
              />
              <q-btn
                unelevated
                dense
                no-caps
                color="primary"
                :label="all ? 'Open' : 'Restore'"
                @click="restore(d)"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
      <q-card-actions align="right">
        <q-btn flat no-caps :label="all ? 'Close' : 'Decide later'" @click="open = false" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import { lockedProjects } from '@/session/tab-lock';
import { allDrafts, unsavedDrafts, type Draft } from '@/storage/drafts';
import { useProjectStore } from '@/stores/project';

/** `all`: list every backup on request (`show()`) instead of prompting for unsaved ones at start. */
const props = defineProps<{ all?: boolean }>();
const project = useProjectStore();
const router = useRouter();
// shallowRef: draft docs get frozen on restore; a deep-reactive proxy would break that.
const drafts = shallowRef<Draft[]>([]);
const open = ref(false);

const when = (t: number) => new Date(t).toLocaleString();

async function load() {
  try {
    // Projects being edited in another tab aren't lost; don't offer them.
    const locked = await lockedProjects();
    drafts.value = (await (props.all ? allDrafts() : unsavedDrafts())).filter(
      (d) => !locked.has(d.id),
    );
  } catch {
    // No draft storage: nothing to restore.
    drafts.value = [];
  }
}

onMounted(async () => {
  if (props.all) return;
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
  await project.restoreDraft(d);
  await router.push('/project');
}

async function discard(d: Draft) {
  await project.discardDraft(d);
  drafts.value = drafts.value.filter((x) => x.id !== d.id);
  if (!drafts.value.length && !props.all) open.value = false;
}
</script>
