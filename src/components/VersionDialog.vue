<template>
  <!-- Shown after opening a project whose library items differ from the installed library (spec 008). -->
  <q-dialog :model-value="open" persistent>
    <q-card style="width: 560px; max-width: 95vw">
      <q-card-section>
        <div class="text-h6">Library updates available</div>
        <div class="text-body2">
          This project uses {{ items.length === 1 ? 'an item' : `${items.length} items` }} from your
          library at a different version. Choose which to use — nothing changes unless you pick the
          library version.
        </div>
      </q-card-section>
      <q-card-section class="q-pt-none column" style="gap: 12px">
        <div
          v-for="m in items"
          :key="m.project.id"
          class="row items-center no-wrap"
          style="gap: 12px"
        >
          <div class="col-3 ellipsis text-weight-medium" style="min-width: 0">
            {{ m.project.notecard.name }}
          </div>
          <button
            v-for="side in sides"
            :key="side.key"
            class="choice col"
            :class="{ active: choice[m.project.id] === side.key }"
            @click="choice[m.project.id] = side.key"
          >
            <img v-if="m.kind === 'block'" :src="thumb(m[side.key] as Block)" alt="" />
            <div v-else class="swatch" :style="{ background: rgb(m[side.key] as Color) }" />
            <div class="text-caption">
              {{ side.label
              }}<template v-if="m[side.key].revision"> · rev {{ m[side.key].revision }}</template>
              <template v-if="m.kind === 'block'">
                · {{ size(m[side.key] as Block, side.key) }}</template
              >
              <q-tooltip>{{ m[side.key].id }}@{{ m[side.key].version }}</q-tooltip>
            </div>
          </button>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat no-caps label="Keep all project copies" @click="all('project')" />
        <q-btn flat no-caps label="Use all library versions" @click="all('library')" />
        <q-btn color="primary" no-caps label="Done" @click="done" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, reactive, watch } from 'vue';
import { toUnits } from '@/model/library-items';
import type { Block } from '@/model/schema/block';
import type { Color } from '@/model/schema/palette';
import { blockThumbnail } from '@/render/thumbnail';
import { useLibraryStore } from '@/stores/library';
import { useProjectStore } from '@/stores/project';

type Side = 'project' | 'library';
const sides: { key: Side; label: string }[] = [
  { key: 'project', label: "Project's copy" },
  { key: 'library', label: 'Library version' },
];

const $q = useQuasar();
const project = useProjectStore();
const library = useLibraryStore();
const items = computed(() => project.mismatches);
/** Finished size in project units (library blocks are stored in inches). */
function size(b: Block, side: Side) {
  const units = project.doc?.units ?? 'in';
  const s = side === 'library' ? toUnits(b, units).size : b.size;
  return `${s.map((n) => Number(n.toFixed(2))).join(' × ')} ${units}`;
}
const open = computed(() => items.value.length > 0 && !!project.doc);
const choice = reactive<Record<string, Side>>({});
watch(items, (ms) => ms.forEach((m) => (choice[m.project.id] = 'project')), { immediate: true });

const rgb = (c: Color) => `rgb(${c.rgb.join(',')})`;
const thumb = (b: Block) =>
  blockThumbnail(project.doc!, b, 96, $q.dark.isActive, undefined, library.items.colors);

function all(side: Side) {
  items.value.forEach((m) => (choice[m.project.id] = side));
  done();
}
function done() {
  project.useLibraryVersions(
    items.value.filter((m) => choice[m.project.id] === 'library').map((m) => m.project.id),
  );
}
</script>

<style scoped>
.choice {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px;
  border: 2px solid rgba(128, 128, 128, 0.3);
  border-radius: 8px;
  background: none;
  color: inherit;
  cursor: pointer;
  min-width: 0;
}
.choice img {
  width: 72px;
  height: 72px;
}
.swatch {
  width: 56px;
  height: 56px;
  border-radius: 6px;
}
.active {
  border-color: var(--q-primary);
}
</style>
