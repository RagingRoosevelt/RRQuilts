<template>
  <q-page v-if="project.doc" padding>
    <div class="row items-center q-gutter-sm q-mb-sm">
      <q-input
        :model-value="project.doc.project.name"
        dense
        borderless
        input-class="text-h6"
        :readonly="project.readOnly"
        aria-label="Project name"
        @update:model-value="rename"
        @blur="(e: Event) => rename((e.target as HTMLInputElement).value.trim())"
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
                    ><q-item-section>Details</q-item-section></q-item
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
        <div v-if="!project.readOnly" class="stack">
          <button class="card add" @click="newBlockDialog">
            <q-icon name="add" size="md" />
            <div>New block</div>
          </button>
          <button class="card add" @click="blockInput?.click()">
            <q-icon name="upload_file" size="md" />
            <div>Import blocks<br /><span class="text-caption">.rrqbl or a project</span></div>
          </button>
        </div>
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
            <div class="col ellipsis">
              {{ b.notecard.name }}
              <q-icon v-if="inUse(b.id)" name="check_circle" color="primary" size="xs">
                <q-tooltip>Placed in a quilt</q-tooltip>
              </q-icon>
              <q-icon v-if="linkOf(b) === 'synced'" name="bookmark" color="primary" size="xs">
                <q-tooltip>In {{ MY_LIBRARY }}</q-tooltip>
              </q-icon>
              <q-icon v-if="linkOf(b) === 'changed'" name="sync" color="warning" size="xs">
                <q-tooltip>Changed since {{ MY_LIBRARY }} — Sync to my library</q-tooltip>
              </q-icon>
            </div>
            <q-btn flat round dense icon="more_vert" aria-label="Actions">
              <q-menu>
                <q-list dense style="min-width: 160px">
                  <q-item
                    v-if="linkOf(b) === 'changed'"
                    v-close-popup
                    clickable
                    @click="syncToMine(b)"
                  >
                    <q-item-section>Sync to my library</q-item-section>
                  </q-item>
                  <q-item
                    v-else-if="!linkOf(b) || linkOf(b) === 'gone'"
                    v-close-popup
                    clickable
                    @click="addToMine(b)"
                  >
                    <q-item-section>Add to my library…</q-item-section>
                  </q-item>
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
                    <q-item-section>Preview</q-item-section>
                  </q-item>
                  <q-item v-close-popup clickable @click="blockDetails(b.id)">
                    <q-item-section>Details</q-item-section>
                  </q-item>
                  <q-item v-close-popup clickable @click="exportBlock(b)">
                    <q-item-section>Export (.rrqbl)</q-item-section>
                  </q-item>
                  <template v-if="!project.readOnly">
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

      <template v-for="group in libGroups" :key="group.label">
        <div class="text-subtitle2 q-mt-lg q-mb-sm">{{ group.label }}</div>
        <div class="cards">
          <div v-for="b in group.items" :key="b.id" class="card">
            <button class="thumb" @click="preview = b.id">
              <img :src="thumb(b, 200)" :alt="b.notecard.name" />
            </button>
            <div class="row items-center no-wrap">
              <div class="col ellipsis">
                {{ b.notecard.name }}
                <q-icon v-if="inUse(b.id)" name="check_circle" color="primary" size="xs">
                  <q-tooltip>Placed in a quilt</q-tooltip>
                </q-icon>
                <q-icon v-if="otherVersions.has(b.id)" name="update" color="warning" size="xs">
                  <q-tooltip
                    >Your library has revision {{ otherVersions.get(b.id)!.library.revision }} — see
                    Switch version…</q-tooltip
                  >
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
                    <q-item
                      v-if="otherVersions.has(b.id) && !project.readOnly"
                      v-close-popup
                      clickable
                      @click="project.mismatches = [otherVersions.get(b.id)!]"
                    >
                      <q-item-section>Switch version…</q-item-section>
                    </q-item>
                    <q-item v-close-popup clickable @click="preview = b.id">
                      <q-item-section>Preview</q-item-section>
                    </q-item>
                    <q-item
                      v-if="b.source?.libraryId !== library.mine?.id"
                      v-close-popup
                      clickable
                      @click="copyLibToMine(b)"
                    >
                      <q-item-section>Copy to my library</q-item-section>
                    </q-item>
                    <q-item v-close-popup clickable @click="exportBlock(b)">
                      <q-item-section>Export (.rrqbl)</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </div>
        </div>
      </template>
      <input
        ref="blockInput"
        type="file"
        accept=".rrqbl,.rrq,.json"
        hidden
        @change="importBlocksFile"
      />
    </template>

    <DetailsPanel v-else-if="tab === 'details'" kind="project" />

    <template v-else-if="tab === 'colors'">
      <div v-if="!project.readOnly" class="row items-center q-mb-sm" style="gap: 8px">
        <q-btn
          outline
          dense
          no-caps
          icon="collections_bookmark"
          label="Save to my library…"
          :disable="!pickedColors.length"
          @click="saveColors = { to: '', name: '' }"
        />
        <q-btn
          v-if="changedColors.length"
          outline
          dense
          no-caps
          color="warning"
          icon="sync"
          :label="`Sync to my library (${changedColors.length})`"
          @click="syncColors"
        />
        <q-btn
          flat
          dense
          no-caps
          icon="upload_file"
          label="Import collection (.rrqcc)"
          @click="collectionInput?.click()"
        />
        <input
          ref="collectionInput"
          type="file"
          accept=".rrqcc,.json"
          hidden
          @change="importCollectionFile"
        />
      </div>
      <div v-if="!project.readOnly" class="text-caption text-grey-7 q-mb-sm">
        Tap your colors to pick them for a collection in {{ MY_LIBRARY }}.
      </div>
      <template v-for="group in colorGroups" :key="group.label">
        <div class="text-subtitle2 q-mb-sm">{{ group.label }}</div>
        <div class="swatches q-mb-lg">
          <component
            :is="group.mine && !project.readOnly ? 'button' : 'div'"
            v-for="c in group.items"
            :key="c.id"
            class="column items-center color-pick"
            :class="{ active: group.mine && pickedColors.includes(c.id) }"
            style="width: 72px"
            @click="group.mine && !project.readOnly && togglePickColor(c.id)"
          >
            <div
              class="swatch relative-position"
              :style="{ background: `rgb(${c.rgb.join(',')})` }"
            >
              <q-icon
                v-if="group.mine && changedColors.includes(c.id)"
                name="sync"
                color="warning"
                size="xs"
                class="absolute-top-right"
              >
                <q-tooltip>Changed since {{ MY_LIBRARY }}</q-tooltip>
              </q-icon>
            </div>
            <div class="text-caption ellipsis full-width text-center">{{ c.notecard.name }}</div>
          </component>
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
      <q-card v-if="previewBlock" style="width: 560px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">{{ previewBlock.notecard.name }}</div>
          <div class="text-caption text-grey-7">
            {{ previewBlock.size.join(' × ') }} {{ project.doc.units }} ·
            {{ patchCount(previewBlock) }} patches
            <template v-if="previewBlock.revision">
              ·
              <span class="revision"
                >revision {{ previewBlock.revision }}
                <q-tooltip>{{ previewBlock.id }}@{{ previewBlock.version ?? '—' }}</q-tooltip>
              </span>
            </template>
          </div>
        </q-card-section>
        <img :src="thumb(previewBlock, 560)" style="width: 100%; display: block" alt="" />
        <q-card-section class="column" style="gap: 4px">
          <div v-if="previewBlock.notecard.notes" style="white-space: pre-wrap">
            {{ previewBlock.notecard.notes }}
          </div>
          <div>
            <span class="text-grey-7">Author:</span> {{ authorOf(previewBlock) ?? 'anonymous' }}
          </div>
          <div>
            <span class="text-grey-7">License:</span>
            {{ licenseName(effectiveLicense(previewBlock, project.doc)) }}
          </div>
          <div v-if="priorCredits(previewBlock).length">
            <span class="text-grey-7">Based on:</span>
            {{
              priorCredits(previewBlock)
                .map((c) => `${c.name ?? 'earlier work'} by ${c.author ?? 'anonymous'}`)
                .join('; ')
            }}
          </div>
          <div v-else-if="isLibraryItem(previewBlock)" class="text-caption text-grey-7">
            {{ attribution(previewBlock) }}
          </div>
        </q-card-section>
        <q-card-actions v-if="!isLibraryItem(previewBlock)" align="right">
          <q-btn
            v-close-popup
            flat
            no-caps
            icon="info"
            label="Details"
            @click="blockDetails(previewBlock.id)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog :model-value="!!picking" @update:model-value="picking = null">
      <q-card v-if="picking" style="width: 640px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">Import blocks from "{{ picking.from.project.name }}"</div>
          <div class="text-caption text-grey-7">Pick the blocks to add to My blocks.</div>
        </q-card-section>
        <q-card-section class="q-pt-none picks">
          <button
            v-for="c in picking.choices"
            :key="c.block.id"
            class="pick"
            :class="{ active: picking.picked.includes(c.block.id) }"
            :disabled="c.here"
            @click="togglePick(c.block.id)"
          >
            <img :src="blockThumbnail(picking.from, c.block, 96, $q.dark.isActive)" alt="" />
            <q-checkbox
              :model-value="c.here || picking.picked.includes(c.block.id)"
              :disable="c.here"
              dense
              size="xs"
              :label="c.block.notecard.name"
              class="text-caption"
              @update:model-value="togglePick(c.block.id)"
              @click.stop
            />
            <div v-if="c.here" class="text-caption text-grey-7">Already here</div>
          </button>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            no-caps
            label="All"
            @click="picking.picked = picking.choices.filter((c) => !c.here).map((c) => c.block.id)"
          />
          <q-btn flat no-caps label="None" @click="picking.picked = []" />
          <q-btn v-close-popup flat no-caps label="Cancel" />
          <q-btn
            color="primary"
            no-caps
            :label="`Import ${picking.picked.length}`"
            :disable="!picking.picked.length"
            @click="importPicked"
          />
        </q-card-actions>
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
    <q-dialog :model-value="!!saveColors" @update:model-value="saveColors = null">
      <q-card v-if="saveColors" style="width: 380px; max-width: 95vw">
        <q-card-section class="q-gutter-sm">
          <div class="text-h6">Save to my library</div>
          <div class="text-grey-7">{{ pickedColors.length }} color(s)</div>
          <q-select
            v-model="saveColors.to"
            :options="[
              { label: 'New collection', value: '' },
              ...myCollections.map((c) => ({ label: c.notecard.name, value: c.id })),
            ]"
            emit-value
            map-options
            label="Collection"
          />
          <q-input v-if="!saveColors.to" v-model="saveColors.name" autofocus label="Name" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup flat no-caps label="Cancel" />
          <q-btn
            v-close-popup
            flat
            no-caps
            color="primary"
            label="Save"
            :disable="!saveColors.to && !saveColors.name.trim()"
            @click="void savePickedColors(saveColors!)"
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
import { authorOf, effectiveLicense, licenseName, priorCredits } from '@/model/credits';
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
import {
  importBlock,
  importProjectBlocks,
  parseBlockFile,
  projectBlockChoices,
  serializeBlock,
} from '@/model/block-file';
import { parseProject } from '@/model/io';
import type { RrqDoc } from '@/model/schema/project';
import {
  isLibraryItem,
  splitItems,
  versionMismatches,
  toUnits,
  useMyCopy,
} from '@/model/library-items';
import { download } from '@/storage/files';
import { importCollectionColors, parseCollectionFile } from '@/model/collection-file';
import { DEFAULT_LICENSE } from '@/model/credits';
import {
  MY_LIBRARY,
  addBlock,
  addToCollection,
  colorChanged,
  copyToMine,
  libraryGroups,
  linkState,
  saveCollection,
  syncBlock,
  syncColor,
  syncConflict,
} from '@/model/library';
import type { Color } from '@/model/schema/palette';

const $q = useQuasar();
const router = useRouter();
const project = useProjectStore();
const editor = useEditorStore();
const startQuilt = useStartQuilt();
const library = useLibraryStore();
/** Library blocks whose project copy differs from the installed library version. */
const otherVersions = computed(
  () => new Map(versionMismatches(project.doc!, library.lookup).map((m) => [m.project.id, m])),
);
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
const libGroups = computed(() => libraryGroups(libBlocks.value, library.views, 'blocks'));
const colorGroups = computed(() => {
  const c = splitItems(project.doc!.project.palette.colors, library.items.colors);
  return [
    { label: 'My colors', items: c.mine, mine: true },
    ...libraryGroups(c.library, library.views, 'colors').map((g) => ({ ...g, mine: false })),
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
  const name = String(value ?? '');
  if (name.trim()) project.change((d) => void (d.project.name = name), { coalesce: 'rename' });
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

// --- My library (spec 011) ---
const linkOf = (b: Block) => linkState(library.mine ?? undefined, b, project.doc!.units);

/** Category for a new My-library item (asked only when there are categories). */
function askCategory(): Promise<string | undefined | null> {
  const cats = library.mine?.categories ?? [];
  if (!cats.length) return Promise.resolve(undefined);
  return new Promise((resolve) =>
    $q
      .dialog({
        title: `Add to ${MY_LIBRARY}`,
        message: 'Category',
        options: {
          type: 'radio',
          model: '',
          items: [
            { label: 'Uncategorized', value: '' },
            ...cats.map((c) => ({ label: c.name, value: c.id })),
          ],
        },
        cancel: true,
      })
      .onOk((v: string) => resolve(v || undefined))
      .onCancel(() => resolve(null)),
  );
}

/** Take the library links a My-library operation set on blocks/colors into the open project. */
function applyLinks(next: RrqDoc) {
  const blocks = new Map(next.project.blocks.map((b) => [b.id, b]));
  const colors = new Map(next.project.palette.colors.map((c) => [c.id, c]));
  project.change((d) => {
    for (const x of [...d.project.blocks, ...d.project.palette.colors]) {
      const n = blocks.get(x.id) ?? colors.get(x.id);
      if (!n?.source || n.source === x.source) continue;
      x.source = n.source;
      x.credits ??= [];
    }
  });
}

async function addToMine(b: Block) {
  const category = await askCategory();
  if (category === null) return;
  const r = await addBlock(library.ensureMine(await askAuthor()), project.doc!, b.id, category);
  await library.saveMine(r.lib);
  applyLinks(r.doc);
  $q.notify({ type: 'positive', message: `Added “${b.notecard.name}” to ${MY_LIBRARY}.` });
}

function syncToMine(b: Block) {
  const lib = library.mine!;
  const go = async (asNew = false) => {
    const r = asNew
      ? await addBlock(lib, project.doc!, b.id)
      : await syncBlock(lib, project.doc!, b.id);
    await library.saveMine(r.lib);
    applyLinks(r.doc);
    $q.notify({ type: 'positive', message: `Synced “${b.notecard.name}” to ${MY_LIBRARY}.` });
  };
  if (!syncConflict(lib, b)) return void go();
  // Keeping both needs a different id (a copy made with Edit has one).
  const canKeepBoth = b.source?.itemId !== b.id;
  $q.dialog({
    title: `${MY_LIBRARY} has a newer version`,
    message: `“${b.notecard.name}” was synced from another project after this copy was made. Replace that version with this one?`,
    cancel: canKeepBoth
      ? { label: 'Keep both', flat: true, noCaps: true }
      : { label: 'Cancel', flat: true, noCaps: true },
    ok: { label: 'Replace', flat: true, noCaps: true },
    persistent: true,
  })
    .onOk(() => void go())
    .onCancel(() => canKeepBoth && void go(true));
}

async function copyLibToMine(b: Block) {
  const view = library.views.find((v) => v.doc.id === b.source?.libraryId);
  const item = view?.doc.items.find((i) => i.data.id === b.id);
  const author = await askAuthor();
  const lib = library.ensureMine(author);
  await library.saveMine(
    await copyToMine(
      lib,
      item?.type === 'block' ? { ...item, data: b } : { type: 'block' as const, data: b },
      author,
      DEFAULT_LICENSE,
    ),
  );
  $q.notify({ type: 'positive', message: `Copied “${b.notecard.name}” to ${MY_LIBRARY}.` });
}

// Colors: pick own colors, save them as a collection or add them to one; sync changed ones.
const pickedColors = ref<string[]>([]);
const togglePickColor = (id: string) =>
  (pickedColors.value = pickedColors.value.includes(id)
    ? pickedColors.value.filter((x) => x !== id)
    : [...pickedColors.value, id]);
const myCollections = computed(
  () => library.views.find((v) => v.doc.kind === 'personal')?.collections ?? [],
);
const changedColors = computed(() =>
  project
    .doc!.project.palette.colors.filter((c: Color) => colorChanged(library.mine ?? undefined, c))
    .map((c) => c.id),
);
const collectionInput = ref<HTMLInputElement>();

const saveColors = ref<{ to: string; name: string } | null>(null);
async function savePickedColors({ to, name }: { to: string; name: string }) {
  if (to) {
    const r = await addToCollection(library.mine!, project.doc!, to, pickedColors.value);
    await library.saveMine(r.lib);
    applyLinks(r.doc);
    pickedColors.value = [];
    return void $q.notify({ type: 'positive', message: 'Added to the collection.' });
  }
  const category = await askCategory();
  if (category === null) return;
  const author = await askAuthor();
  const r = await saveCollection(
    library.ensureMine(author),
    project.doc!,
    name.trim(),
    pickedColors.value,
    author,
    category,
  );
  await library.saveMine(r.lib);
  applyLinks(r.doc);
  pickedColors.value = [];
  $q.notify({ type: 'positive', message: `Saved “${name.trim()}” to ${MY_LIBRARY}.` });
}

async function syncColors() {
  let lib = library.mine!;
  let doc = project.doc!;
  for (const id of changedColors.value) ({ lib, doc } = await syncColor(lib, doc, id));
  await library.saveMine(lib);
  applyLinks(doc);
  $q.notify({ type: 'positive', message: `Synced colors to ${MY_LIBRARY}.` });
}

async function importCollectionFile(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  const r = parseCollectionFile(await file.text());
  if (!r.ok) return void $q.notify({ type: 'negative', message: r.error });
  const res = importCollectionColors(project.doc!, r.file);
  if (!res.added)
    return void $q.notify({
      message: `“${r.file.collection.notecard.name}”'s colors are already here.`,
    });
  project.change(() => res.doc);
  $q.notify({ type: 'positive', message: `Added ${res.added} color(s) (undo removes them).` });
}

function exportBlock(b: Block) {
  const palette = [...project.doc!.project.palette.colors, ...library.items.colors];
  const author = settings.settings.author;
  const stamped = { ...b, license: effectiveLicense(b, project.doc!) };
  download(b.notecard.name, serializeBlock(stamped, project.doc!.units, palette, author), 'rrqbl');
}

/** One picker for both: a project file (.rrq) offers its blocks; anything else is read as .rrqbl. */
async function importBlocksFile(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  const text = await file.text();
  if (file.name.toLowerCase().endsWith('.rrq') || formatOf(text) === 'rrq')
    await importProjectBlocksText(text);
  else importBlockText(text);
}

function formatOf(text: string): unknown {
  try {
    return (JSON.parse(text) as { format?: unknown } | null)?.format;
  } catch {
    return undefined;
  }
}

function importBlockText(text: string) {
  const r = parseBlockFile(text);
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

/** Another project's blocks to pick from; only the picked ones come in (one undo step). */
const picking = ref<{
  from: RrqDoc;
  choices: ReturnType<typeof projectBlockChoices>;
  picked: string[];
} | null>(null);

async function importProjectBlocksText(text: string) {
  const r = await parseProject(text);
  if (!r.ok) {
    $q.notify({ type: 'negative', message: r.error });
    return;
  }
  const choices = projectBlockChoices(project.doc!, r.doc, (id) => !!library.lookup.block(id));
  if (!choices.some((c) => !c.here)) {
    $q.notify({ message: `No new blocks in "${r.doc.project.name}".` });
    return;
  }
  picking.value = {
    from: r.doc,
    choices,
    picked: choices.filter((c) => !c.here).map((c) => c.block.id),
  };
}

function togglePick(id: string) {
  const p = picking.value!;
  p.picked = p.picked.includes(id) ? p.picked.filter((x) => x !== id) : [...p.picked, id];
}

function importPicked() {
  const p = picking.value!;
  picking.value = null;
  const res = importProjectBlocks(project.doc!, p.from, settings.settings.author, p.picked);
  if (!res.added) return;
  project.change(() => res.doc);
  $q.notify({
    type: 'positive',
    message: `Imported ${res.added} block${res.added > 1 ? 's' : ''} from "${p.from.project.name}" (undo removes ${res.added > 1 ? 'them' : 'it'}).`,
  });
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
.picks {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  max-height: 60vh;
  overflow: auto;
}
.pick {
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
.pick.active {
  border-color: var(--q-primary);
}
.pick:disabled {
  opacity: 0.5;
  cursor: default;
}
.pick img {
  width: 96px;
  height: 96px;
}
.revision {
  text-decoration: underline dotted;
  cursor: help;
}
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
/* Stacked actions sharing one grid cell, icon beside the label. */
.stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.stack .card.add {
  flex: 1;
  flex-direction: row;
  justify-content: flex-start;
  gap: 8px;
  min-height: 0;
  padding: 8px 12px;
  text-align: left;
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
.color-pick {
  padding: 2px;
  border: 2px solid transparent;
  border-radius: 8px;
  background: none;
  color: inherit;
  cursor: pointer;
}
div.color-pick {
  cursor: default;
}
.color-pick.active {
  border-color: var(--q-primary);
}
.swatch {
  width: 56px;
  height: 56px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}
</style>
