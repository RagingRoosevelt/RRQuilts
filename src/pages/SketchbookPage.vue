<template>
  <q-page v-if="project.doc" padding>
    <div class="row items-center q-gutter-sm q-mb-sm">
      <q-input
        :model-value="project.doc.project.name"
        dense
        borderless
        input-class="text-h6"
        :readonly="project.readOnly"
        debounce="300"
        aria-label="Project name"
        @update:model-value="rename"
      />
    </div>
    <q-tabs v-model="tab" dense no-caps align="left">
      <q-tab name="quilts" :label="`Quilts (${quilts.length})`" />
      <q-tab name="blocks" :label="`Blocks (${blocks.length})`" />
      <q-tab
        name="colors"
        :label="`Fabrics & Colors (${project.doc.project.palette.colors.length})`"
      />
      <q-tab name="photos" label="Photos" />
      <q-tab name="threads" label="Threads" />
    </q-tabs>
    <q-separator class="q-mb-md" />

    <div v-if="tab === 'quilts'" class="cards">
      <button v-if="!project.readOnly" class="card add" @click="wizard?.show()">
        <q-icon name="add" size="lg" />
        <div>New quilt</div>
      </button>
      <div
        v-for="(q, i) in quilts"
        :key="q.id"
        class="card"
        :draggable="!project.readOnly"
        @dragstart="dragFrom = i"
        @dragover.prevent
        @drop="drop('quilts', i)"
      >
        <button class="thumb" @click="openQuilt(q.id)">
          <img
            :src="quiltThumbnail(project.doc, q, 240, $q.dark.isActive)"
            :alt="q.notecard.name"
          />
        </button>
        <div class="row items-center no-wrap">
          <div class="col ellipsis">{{ q.notecard.name }}</div>
          <q-btn flat round dense icon="more_vert" aria-label="Actions">
            <q-menu>
              <q-list dense style="min-width: 180px">
                <q-item v-close-popup clickable @click="openQuilt(q.id)"
                  ><q-item-section>Open</q-item-section></q-item
                >
                <template v-if="!project.readOnly">
                  <q-item v-close-popup clickable @click="duplicate(q.id)"
                    ><q-item-section>Duplicate as variation</q-item-section></q-item
                  >
                  <q-item v-close-popup clickable @click="editCard('quilts', q.id)"
                    ><q-item-section>Notecard…</q-item-section></q-item
                  >
                  <q-item
                    v-close-popup
                    clickable
                    :disable="i === 0"
                    @click="moveItem('quilts', i, -1)"
                    ><q-item-section>Move earlier</q-item-section></q-item
                  >
                  <q-item
                    v-close-popup
                    clickable
                    :disable="i === quilts.length - 1"
                    @click="moveItem('quilts', i, 1)"
                    ><q-item-section>Move later</q-item-section></q-item
                  >
                  <q-item v-close-popup clickable @click="deleteQuilt(q.id)"
                    ><q-item-section class="text-negative">Delete</q-item-section></q-item
                  >
                </template>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>
    </div>

    <div v-else-if="tab === 'blocks'" class="cards">
      <div
        v-for="(b, i) in blocks"
        :key="b.id"
        class="card"
        :draggable="!project.readOnly"
        @dragstart="dragFrom = i"
        @dragover.prevent
        @drop="drop('blocks', i)"
      >
        <button class="thumb" @click="preview = b.id">
          <img
            :src="blockThumbnail(project.doc, b, 200, $q.dark.isActive)"
            :alt="b.notecard.name"
          />
        </button>
        <div class="row items-center no-wrap">
          <div class="col ellipsis">{{ b.notecard.name }}</div>
          <q-btn v-if="!project.readOnly" flat round dense icon="more_vert" aria-label="Actions">
            <q-menu>
              <q-list dense style="min-width: 160px">
                <q-item v-close-popup clickable @click="editCard('blocks', b.id)"
                  ><q-item-section>Notecard…</q-item-section></q-item
                >
                <q-item
                  v-close-popup
                  clickable
                  :disable="i === 0"
                  @click="moveItem('blocks', i, -1)"
                  ><q-item-section>Move earlier</q-item-section></q-item
                >
                <q-item
                  v-close-popup
                  clickable
                  :disable="i === blocks.length - 1"
                  @click="moveItem('blocks', i, 1)"
                  ><q-item-section>Move later</q-item-section></q-item
                >
                <q-item v-close-popup clickable @click="deleteBlock(b.id)"
                  ><q-item-section class="text-negative">Delete</q-item-section></q-item
                >
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>
    </div>

    <div v-else-if="tab === 'colors'" class="row q-gutter-sm">
      <div
        v-for="c in project.doc.project.palette.colors"
        :key="c.id"
        class="column items-center"
        style="width: 72px"
      >
        <div class="swatch" :style="{ background: `rgb(${c.rgb.join(',')})` }" />
        <div class="text-caption ellipsis full-width text-center">{{ c.notecard.name }}</div>
      </div>
      <div class="full-width text-caption text-grey-7">
        Add and edit colors from the tray in the quilt editor. Fabrics arrive in a later version.
      </div>
    </div>
    <div v-else class="text-grey-7">Coming in a later version.</div>

    <q-dialog :model-value="!!preview" @update:model-value="preview = null">
      <q-card v-if="previewBlock" style="width: 360px">
        <q-card-section>
          <div class="text-h6">{{ previewBlock.notecard.name }}</div>
          <div class="text-caption text-grey-7">
            {{ previewBlock.size.join(' × ') }} {{ project.doc.units }} ·
            {{ patchCount(previewBlock) }} patches
          </div>
        </q-card-section>
        <img
          :src="blockThumbnail(project.doc, previewBlock, 320, $q.dark.isActive)"
          style="width: 100%"
          alt=""
        />
        <q-card-section class="text-caption text-grey-7"
          >Editing blocks arrives with the block editor.</q-card-section
        >
      </q-card>
    </q-dialog>
    <NotecardDialog ref="notecard" @save="saveCard" />
    <QuiltWizard ref="wizard" :units="project.doc.units" @create="startQuilt" />
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import NotecardDialog from '@/components/NotecardDialog.vue';
import QuiltWizard from '@/components/QuiltWizard.vue';
import { useStartQuilt } from '@/composables/start-quilt';
import { allPatches } from '@/model/blocks/patches';
import { newId } from '@/model/ids';
import { variationName } from '@/model/new-quilt';
import type { Block } from '@/model/schema/block';
import { blockThumbnail, quiltThumbnail } from '@/render/thumbnail';
import { useEditorStore } from '@/stores/editor';
import { useProjectStore } from '@/stores/project';

const $q = useQuasar();
const router = useRouter();
const project = useProjectStore();
const editor = useEditorStore();
const startQuilt = useStartQuilt();
const tab = ref('quilts');
const preview = ref<string | null>(null);
const dragFrom = ref<number | null>(null);
const notecard = ref<InstanceType<typeof NotecardDialog>>();
const wizard = ref<InstanceType<typeof QuiltWizard>>();
let editing: { list: 'quilts' | 'blocks'; id: string } | null = null;

const quilts = computed(() => project.doc!.project.quilts);
const blocks = computed(() =>
  project.doc!.project.blocks.filter((b) => !b.notecard.tags?.includes('system')),
);
const previewBlock = computed(() => blocks.value.find((b) => b.id === preview.value));
const patchCount = (b: Block) => allPatches(b).length;

function rename(value: string | number | null) {
  const name = String(value ?? '').trim();
  if (name) project.change((d) => void (d.project.name = name), { coalesce: 'rename' });
}

function openQuilt(id: string) {
  editor.mode = 'design';
  void router.push(`/project/quilt/${id}`);
}

function duplicate(id: string) {
  const q = quilts.value.find((x) => x.id === id);
  if (!q) return;
  const copy = { ...structuredClone(q), id: newId() };
  copy.notecard.name = variationName(
    q.notecard.name,
    quilts.value.map((x) => x.notecard.name),
  );
  project.change((d) => void d.project.quilts.splice(quilts.value.indexOf(q) + 1, 0, copy));
  openQuilt(copy.id);
}

function editCard(list: 'quilts' | 'blocks', id: string) {
  const item = project.doc!.project[list].find((x) => x.id === id);
  if (!item) return;
  editing = { list, id };
  notecard.value?.show(item.notecard);
}
function saveCard({ name, notes }: { name: string; notes: string }) {
  const e = editing;
  if (!e) return;
  project.change((d) => {
    const item = d.project[e.list].find((x) => x.id === e.id);
    if (item) item.notecard = { ...item.notecard, name, notes };
  });
}

/** Reorder within the visible list (system blocks keep their place at the end). */
function moveItem(list: 'quilts' | 'blocks', from: number, delta: number) {
  const visible = list === 'quilts' ? quilts.value : blocks.value;
  const id = visible[from]?.id;
  const target = visible[from + delta]?.id;
  if (!id || !target) return;
  project.change((d) => {
    const arr = d.project[list] as { id: string }[];
    const i = arr.findIndex((x) => x.id === id);
    const [item] = arr.splice(i, 1);
    arr.splice(arr.findIndex((x) => x.id === target) + (delta > 0 ? 1 : 0), 0, item!);
  });
}
function drop(list: 'quilts' | 'blocks', to: number) {
  if (dragFrom.value === null || dragFrom.value === to) return;
  moveItem(list, dragFrom.value, to - dragFrom.value);
  dragFrom.value = null;
}

function deleteQuilt(id: string) {
  const q = quilts.value.find((x) => x.id === id);
  $q.dialog({
    title: `Delete "${q?.notecard.name}"?`,
    message: 'You can undo this.',
    cancel: true,
    ok: { label: 'Delete', color: 'negative', flat: true },
  }).onOk(() =>
    project.change((d) => void (d.project.quilts = d.project.quilts.filter((x) => x.id !== id))),
  );
}

function deleteBlock(id: string) {
  const users = quilts.value.filter((q) =>
    [
      ...Object.values(q.layers[0].slots).map((s) => s.block),
      ...q.layers.flatMap((l) => l.items.map((i) => i.ref)),
    ].includes(id),
  );
  if (users.length) {
    $q.dialog({
      title: 'This block is in use',
      message: `Remove it from ${users.map((q) => `"${q.notecard.name}"`).join(', ')} first.`,
    });
    return;
  }
  project.change((d) => void (d.project.blocks = d.project.blocks.filter((b) => b.id !== id)));
}
</script>

<style scoped>
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 16px;
}
.card {
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 8px;
  padding: 8px;
  background: transparent;
  color: inherit;
}
.card.add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  cursor: pointer;
}
.thumb {
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background: #9e9e9e;
  border-radius: 4px;
  cursor: pointer;
}
.thumb img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: contain;
}
.swatch {
  width: 56px;
  height: 56px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}
</style>
