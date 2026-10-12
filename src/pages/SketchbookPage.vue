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
      <q-tab name="colors" :label="`Fabrics & Colors (${colorGroups[0]!.items.length})`" />
      <q-tab name="photos" label="Photos" />
      <q-tab name="threads" label="Threads" />
      <q-tab name="details" label="Details" />
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
                  <q-item v-close-popup clickable @click="quiltDetails(q.id)"
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

    <template v-else-if="tab === 'blocks'">
      <div class="text-subtitle2 q-mb-sm">My blocks</div>
      <div class="cards">
        <button v-if="!project.readOnly" class="card add" @click="newBlockDialog">
          <q-icon name="add" size="lg" />
          <div>New block</div>
        </button>
        <button v-if="!project.readOnly" class="card add" @click="blockInput?.click()">
          <q-icon name="upload_file" size="lg" />
          <div>Import block (.rrqb)</div>
        </button>
        <div
          v-for="(b, i) in blocks"
          :key="b.id"
          class="card"
          :draggable="!project.readOnly"
          @dragstart="dragFrom = i"
          @dragover.prevent
          @drop="drop('blocks', i)"
        >
          <button class="thumb" @click="openBlock(b.id)">
            <img :src="thumb(b, 200)" :alt="b.notecard.name" />
          </button>
          <div class="row items-center no-wrap">
            <div class="col ellipsis">{{ b.notecard.name }}</div>
            <q-btn flat round dense icon="more_vert" aria-label="Actions">
              <q-menu>
                <q-list dense style="min-width: 160px">
                  <template v-if="!project.readOnly">
                    <q-item
                      v-close-popup
                      clickable
                      :disable="b.kind !== 'seam'"
                      @click="openBlock(b.id)"
                    >
                      <q-item-section>Edit</q-item-section>
                    </q-item>
                    <q-item
                      v-close-popup
                      clickable
                      :disable="b.kind !== 'seam'"
                      @click="editCopy(b.id)"
                    >
                      <q-item-section>Edit a copy</q-item-section>
                    </q-item>
                  </template>
                  <q-item v-close-popup clickable @click="preview = b.id">
                    <q-item-section>Details</q-item-section>
                  </q-item>
                  <q-item v-close-popup clickable @click="exportBlock(b)">
                    <q-item-section>Export (.rrqb)</q-item-section>
                  </q-item>
                  <template v-if="!project.readOnly">
                    <q-item v-close-popup clickable @click="blockDetails(b.id)"
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
                  </template>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </div>
      </div>

      <div class="text-subtitle2 q-mt-lg q-mb-sm">Library</div>
      <div class="cards">
        <div v-for="b in libBlocks" :key="b.id" class="card">
          <button class="thumb" @click="preview = b.id">
            <img :src="thumb(b, 200)" :alt="b.notecard.name" />
          </button>
          <div class="row items-center no-wrap">
            <div class="col ellipsis">
              {{ b.notecard.name }}
              <q-icon v-if="inUse(b.id)" name="check_circle" color="primary" size="xs">
                <q-tooltip>Used in this project</q-tooltip>
              </q-icon>
            </div>
            <q-btn flat round dense icon="more_vert" aria-label="Actions">
              <q-menu>
                <q-list dense style="min-width: 160px">
                  <q-item
                    v-if="!project.readOnly"
                    v-close-popup
                    clickable
                    :disable="b.kind !== 'seam'"
                    @click="editLibrary(b)"
                  >
                    <q-item-section>Edit (makes your copy)</q-item-section>
                  </q-item>
                  <q-item v-close-popup clickable @click="preview = b.id">
                    <q-item-section>Details</q-item-section>
                  </q-item>
                  <q-item v-close-popup clickable @click="exportBlock(b)">
                    <q-item-section>Export (.rrqb)</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </div>
      </div>
      <input ref="blockInput" type="file" accept=".rrqb,.json" hidden @change="importBlockFile" />
    </template>

    <DetailsPanel v-else-if="tab === 'details'" kind="project" />

    <template v-else-if="tab === 'colors'">
      <template v-for="group in colorGroups" :key="group.label">
        <div class="text-subtitle2 q-mb-sm">{{ group.label }}</div>
        <div class="swatches q-mb-lg">
          <div v-for="c in group.items" :key="c.id" class="column items-center" style="width: 72px">
            <div class="swatch" :style="{ background: `rgb(${c.rgb.join(',')})` }" />
            <div class="text-caption ellipsis full-width text-center">{{ c.notecard.name }}</div>
          </div>
          <div v-if="!group.items.length" class="text-caption text-grey-7">None yet.</div>
        </div>
      </template>
      <div class="text-caption text-grey-7">
        Add and edit your colors from the tray in the quilt editor. Fabrics arrive in a later
        version.
      </div>
    </template>
    <div v-else class="text-grey-7">Coming in a later version.</div>

    <q-dialog :model-value="!!preview" @update:model-value="preview = null">
      <q-card v-if="previewBlock" style="width: 360px">
        <q-card-section>
          <div class="text-h6">{{ previewBlock.notecard.name }}</div>
          <div class="text-caption text-grey-7">
            {{ previewBlock.size.join(' × ') }} {{ project.doc.units }} ·
            {{ patchCount(previewBlock) }} patches
            <template v-if="previewBlock.revision">
              · revision {{ previewBlock.revision }}</template
            >
          </div>
        </q-card-section>
        <img :src="thumb(previewBlock, 320)" style="width: 100%" alt="" />
        <q-card-section v-if="attribution(previewBlock)" class="text-caption text-grey-7">
          {{ attribution(previewBlock) }}
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog :model-value="!!inUseDialog" @update:model-value="inUseDialog = null">
      <q-card v-if="inUseDialog" style="width: 420px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">This block is placed in a quilt</div>
          <div v-for="w in inUseDialog.where" :key="w.quilt" class="q-mt-sm">
            <div class="text-weight-medium">{{ w.quilt }}</div>
            <div class="row q-mt-xs" style="gap: 4px">
              <q-badge
                v-for="(spot, i) in w.spots"
                :key="i"
                outline
                rounded
                color="primary"
                class="q-px-sm q-py-xs"
                :label="spot"
              />
            </div>
          </div>
          <div class="q-mt-sm text-grey-7">Deleting it empties those spaces (you can undo).</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps icon="search" label="Show me" @click="showPlacements" />
          <q-btn v-close-popup flat no-caps label="Cancel" />
          <q-btn
            v-close-popup
            flat
            no-caps
            color="negative"
            label="Remove from quilts and delete"
            @click="inUseDialog!.remove()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <QuiltWizard ref="wizard" :units="project.doc.units" @create="startQuilt" />
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import DetailsPanel from '@/components/DetailsPanel.vue';
import QuiltWizard from '@/components/QuiltWizard.vue';
import { useStartQuilt } from '@/composables/start-quilt';
import { allPatches } from '@/model/blocks/patches';
import { attribution, copyBlock, newBlock } from '@/editor/block-ops';
import { effectiveLicense } from '@/model/credits';
import { newId } from '@/model/ids';
import { variationName } from '@/model/new-quilt';
import { describeSlot } from '@/model/plain';
import type { Block } from '@/model/schema/block';
import { blockThumbnail, quiltThumbnail } from '@/render/thumbnail';
import { useEditorStore } from '@/stores/editor';
import { useProjectStore } from '@/stores/project';
import { useLibraryStore } from '@/stores/library';
import { useSettingsStore } from '@/stores/settings';
import { useAuthor } from '@/composables/author';
import { importBlock, parseBlockFile, serializeBlock } from '@/model/block-file';
import { splitItems, toUnits, useMyCopy } from '@/model/library-items';
import { download } from '@/storage/files';

const $q = useQuasar();
const router = useRouter();
const project = useProjectStore();
const editor = useEditorStore();
const startQuilt = useStartQuilt();
const library = useLibraryStore();
const settings = useSettingsStore();
const askAuthor = useAuthor();
const blockInput = ref<HTMLInputElement>();
const inUseDialog = ref<{
  id: string;
  quilt: string;
  where: { quilt: string; spots: string[] }[];
  remove: () => void;
} | null>(null);
const tab = ref('quilts');
const preview = ref<string | null>(null);
const dragFrom = ref<number | null>(null);
const wizard = ref<InstanceType<typeof QuiltWizard>>();

const quilts = computed(() => project.doc!.project.quilts);
const split = computed(() =>
  splitItems(
    project.doc!.project.blocks.filter((b) => !b.notecard.tags?.includes('system')),
    library.items.blocks,
  ),
);
const blocks = computed(() => split.value.mine);
const libBlocks = computed(() => split.value.library);
const colorGroups = computed(() => {
  const c = splitItems(project.doc!.project.palette.colors, library.items.colors);
  return [
    { label: 'My colors', items: c.mine },
    { label: 'Library colors', items: c.library },
  ];
});
const previewBlock = computed(() =>
  [...blocks.value, ...libBlocks.value].find((b) => b.id === preview.value),
);
const thumb = (b: Block, px: number) =>
  blockThumbnail(project.doc!, b, px, $q.dark.isActive, undefined, library.items.colors);
const inUse = (id: string) => quiltsUsing(id).length > 0;
const patchCount = (b: Block) => allPatches(b).length;

function rename(value: string | number | null) {
  const name = String(value ?? '').trim();
  if (name) project.change((d) => void (d.project.name = name), { coalesce: 'rename' });
}

function quiltsUsing(id: string) {
  return quilts.value.filter((q) =>
    [
      ...Object.values(q.layers[0].slots).map((s) => s.block),
      ...q.layers.flatMap((l) => l.items.map((i) => i.ref)),
    ].includes(id),
  );
}

/** Open the block editor; warn once when the block is used in quilts (edits update them). */
const warnedBlocks = new Set<string>();
function openBlock(id: string) {
  const b = blocks.value.find((x) => x.id === id);
  if (!b) return;
  if (b.kind !== 'seam') {
    preview.value = id;
    return;
  }
  const users = quiltsUsing(id);
  const go = () => {
    editor.blockMode = 'draw';
    void router.push(`/project/block/${id}`);
  };
  if (!users.length || warnedBlocks.has(id) || project.readOnly) return go();
  warnedBlocks.add(id);
  $q.dialog({
    title: 'This block is in use',
    message: `Changes will update ${users.length} quilt${users.length > 1 ? 's' : ''}: ${users.map((q) => `"${q.notecard.name}"`).join(', ')}. To leave them alone, use "Edit a copy".`,
    cancel: { label: 'Edit a copy', flat: true },
    ok: { label: 'Edit anyway', flat: true },
  })
    .onOk(go)
    .onCancel(() => void editCopy(id));
}

async function editCopy(id: string) {
  const b = blocks.value.find((x) => x.id === id);
  if (!b) return;
  const copy = copyBlock(
    b,
    blocks.value.map((x) => x.notecard.name),
    await askAuthor(),
    project.doc!.project.license,
  );
  const at = project.doc!.project.blocks.indexOf(b) + 1;
  project.change((d) => void d.project.blocks.splice(at, 0, copy));
  editor.blockMode = 'draw';
  void router.push(`/project/block/${copy.id}`);
}

function newBlockDialog() {
  const units = project.doc!.units;
  const s = units === 'cm' ? 25 : 10;
  $q.dialog({
    title: 'New block',
    message: `Finished size ${s} × ${s} ${units} — you can change it in the block editor.`,
    prompt: { model: `Block ${blocks.value.length + 1}`, type: 'text' },
    cancel: true,
  }).onOk((name: string) => void createBlock(name.trim() || 'Block', s));
}

async function createBlock(name: string, s: number) {
  const b = newBlock(
    name,
    [s, s],
    project.doc!.units,
    await askAuthor(),
    project.doc!.project.license,
  );
  project.change((d) => void d.project.blocks.push(b));
  editor.blockMode = 'draw';
  editor.blockTool = 'line';
  void router.push(`/project/block/${b.id}`);
}

/** Library blocks are read-only: editing makes your copy, optionally used in their place. */
async function editLibrary(lib: Block) {
  const copy = copyBlock(
    toUnits(lib, project.doc!.units),
    blocks.value.map((x) => x.notecard.name),
    await askAuthor(),
    project.doc!.project.license,
  );
  const users = quiltsUsing(lib.id);
  const go = (replace: boolean) => {
    project.change(() => useMyCopy(project.doc!, lib.id, copy, replace));
    editor.blockMode = 'draw';
    void router.push(`/project/block/${copy.id}`);
  };
  if (!users.length) return go(false);
  $q.dialog({
    title: `Use your copy of "${lib.notecard.name}"?`,
    message: `It's used in ${users.map((q) => `"${q.notecard.name}"`).join(', ')}. Your copy can replace it there (colors are kept).`,
    persistent: true,
    ok: { label: 'Use my copy there', flat: true },
    cancel: { label: 'Keep the library block', flat: true },
  })
    .onOk(() => go(true))
    .onCancel(() => go(false));
}

function exportBlock(b: Block) {
  const palette = [...project.doc!.project.palette.colors, ...library.items.colors];
  const author = settings.settings.author;
  const stamped = { ...b, license: effectiveLicense(b, project.doc!) };
  download(b.notecard.name, serializeBlock(stamped, project.doc!.units, palette, author), 'rrqb');
}

async function importBlockFile(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  const r = parseBlockFile(await file.text());
  if (!r.ok) {
    $q.notify({ type: 'negative', message: r.error });
    return;
  }
  const res = importBlock(project.doc!, r.file, settings.settings.author);
  if (res.doc === project.doc) {
    $q.notify({ message: `"${r.file.block.notecard.name}" is already in this project.` });
    return;
  }
  project.change(() => res.doc);
  $q.notify({ type: 'positive', message: `Imported "${r.file.block.notecard.name}".` });
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

function quiltDetails(id: string) {
  editor.mode = 'details';
  void router.push(`/project/quilt/${id}`);
}
function blockDetails(id: string) {
  editor.blockMode = 'details';
  void router.push(`/project/block/${id}`);
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
  const users = quiltsUsing(id);
  const remove = () =>
    project.change((d) => {
      for (const q of d.project.quilts) {
        const slots = q.layers[0].slots;
        for (const [k, s] of Object.entries(slots)) if (s.block === id) delete slots[k];
        for (const l of q.layers) l.items = l.items.filter((i) => i.ref !== id);
        const used = new Set(Object.values(slots).map((s) => s.coloring));
        for (const l of q.layers) for (const i of l.items) if (i.coloring) used.add(i.coloring);
        for (const c of Object.keys(q.colorings)) if (!used.has(c)) delete q.colorings[c];
      }
      d.project.blocks = d.project.blocks.filter((b) => b.id !== id);
    });
  if (!users.length) return remove();
  const where = users.map((q) => {
    const spots = Object.keys(q.layers[0].slots)
      .filter((slot) => q.layers[0].slots[slot]!.block === id)
      .sort((x, y) => x.localeCompare(y, undefined, { numeric: true }))
      .map(describeSlot);
    const items = q.layers.flatMap((l) => l.items).filter((i) => i.ref === id).length;
    if (items) spots.push(`${items} appliqué item${items > 1 ? 's' : ''}`);
    return { quilt: q.notecard.name, spots };
  });
  inUseDialog.value = { id, where, remove, quilt: users[0]!.id };
}

function showPlacements() {
  const d = inUseDialog.value!;
  inUseDialog.value = null;
  editor.mode = 'design';
  editor.tool = 'find';
  editor.block = d.id;
  void router.push(`/project/quilt/${d.quilt}`);
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
.swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.swatch {
  width: 56px;
  height: 56px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}
</style>
