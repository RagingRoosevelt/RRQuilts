<template>
  <q-page padding>
    <div class="row items-center q-mb-md" style="gap: 8px">
      <div class="text-h6 col">Libraries</div>
      <q-btn outline no-caps icon="upload_file" label="Import" @click="fileInput?.click()">
        <q-tooltip>A backup or pack (.rrqlib), or a color collection (.rrqcc)</q-tooltip>
      </q-btn>
      <q-btn outline no-caps icon="save" label="Back up…" @click="backingUp = { ...ALL }" />
      <q-btn
        outline
        no-caps
        icon="share"
        label="Share as pack…"
        :disable="!library.mine?.items.length"
        @click="startShare"
      />
      <input
        ref="fileInput"
        type="file"
        accept=".rrqlib,.rrqcc,.json"
        hidden
        @change="importFile"
      />
    </div>
    <q-banner v-if="!library.stored" dense class="bg-warning text-dark q-mb-md">
      This browser isn't keeping your libraries (storage is blocked). Back up before closing.
    </q-banner>

    <div class="row no-wrap-md" style="gap: 16px">
      <q-list bordered separator class="rounded-borders libs">
        <q-item
          v-for="v in lists"
          :key="v.doc.id"
          clickable
          :active="v.doc.id === current?.doc.id"
          @click="select(v.doc.id)"
        >
          <q-item-section>
            <q-item-label>{{ v.doc.name }}</q-item-label>
            <q-item-label caption>{{ kindLabel(v) }} · {{ counts(v) }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          v-if="!library.mine"
          clickable
          :active="selected === 'mine'"
          @click="select('mine')"
        >
          <q-item-section>
            <q-item-label>{{ MY_LIBRARY }}</q-item-label>
            <q-item-label caption>Empty</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <div class="col" style="min-width: 0">
        <template v-if="current">
          <div class="row items-start q-mb-sm" style="gap: 8px">
            <div class="col">
              <div class="text-subtitle1">{{ current.doc.name }}</div>
              <div class="text-caption text-grey-7">
                <template v-if="current.doc.author">by {{ current.doc.author.name }} · </template>
                <template v-if="current.doc.license"
                  >{{ licenseName(current.doc.license) }} ·
                </template>
                revision {{ current.doc.revision }}
              </div>
              <div v-if="current.doc.description" class="text-body2 q-mt-xs">
                {{ current.doc.description }}
              </div>
            </div>
            <q-btn
              v-if="mineSelected"
              flat
              dense
              no-caps
              icon="label"
              label="Categories…"
              @click="managing = true"
            />
            <q-btn
              v-if="isPack(current)"
              flat
              dense
              no-caps
              color="negative"
              icon="delete"
              label="Remove pack"
              @click="removePack(current.doc)"
            />
          </div>

          <q-input
            v-model="search"
            dense
            outlined
            clearable
            placeholder="Search names, notes, tags, styles"
            class="q-mb-sm"
          >
            <template #prepend><q-icon name="search" /></template>
          </q-input>
          <div v-if="current.doc.categories.length" class="row q-mb-sm" style="gap: 4px">
            <q-chip
              v-for="c in categoryChips"
              :key="c.id ?? 'all'"
              clickable
              dense
              :outline="category !== c.id"
              color="primary"
              :text-color="category === c.id ? 'white' : 'primary'"
              @click="category = c.id"
              >{{ c.name }}</q-chip
            >
          </div>

          <div v-if="shownBlocks.length" class="text-subtitle2 q-mb-sm">Blocks</div>
          <div class="cards q-mb-lg">
            <div v-for="b in shownBlocks" :key="b.id" class="card">
              <button class="thumb" @click="previewing = b.id">
                <img :src="thumb(b, 200)" :alt="b.notecard.name" />
              </button>
              <div class="row items-center no-wrap">
                <div class="col ellipsis">{{ b.notecard.name }}</div>
                <q-btn flat round dense icon="more_vert" aria-label="Actions">
                  <q-menu>
                    <q-list dense style="min-width: 170px">
                      <q-item v-close-popup clickable @click="previewing = b.id">
                        <q-item-section>Preview</q-item-section>
                      </q-item>
                      <template v-if="mineSelected">
                        <q-item v-close-popup clickable @click="rename(b.id, b.notecard.name)">
                          <q-item-section>Rename…</q-item-section>
                        </q-item>
                        <q-item v-close-popup clickable @click="pickCategory(b.id)">
                          <q-item-section>Category…</q-item-section>
                        </q-item>
                        <q-item v-close-popup clickable @click="startTagging(b.id)">
                          <q-item-section>Tags & styles…</q-item-section>
                        </q-item>
                      </template>
                      <q-item v-else v-close-popup clickable @click="copyMine(b.id)">
                        <q-item-section>Copy to my library</q-item-section>
                      </q-item>
                      <q-item v-close-popup clickable @click="exportBlock(b)">
                        <q-item-section>Export (.rrqbl)</q-item-section>
                      </q-item>
                      <q-item v-if="mineSelected" v-close-popup clickable @click="remove(b.id)">
                        <q-item-section class="text-negative">Delete</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </div>
          </div>

          <div v-if="shownCollections.length" class="text-subtitle2 q-mb-sm">Color collections</div>
          <div class="column q-mb-lg" style="gap: 8px">
            <div v-for="c in shownCollections" :key="c.id" class="collection row items-center">
              <button class="strip" @click="previewing = c.id">
                <span
                  v-for="x in c.colors"
                  :key="x.id"
                  class="chip"
                  :style="{ background: css(x) }"
                  :title="x.notecard.name"
                />
              </button>
              <div class="col ellipsis q-px-sm">
                {{ c.notecard.name }}
                <span class="text-caption text-grey-7">· {{ c.colors.length }}</span>
              </div>
              <q-btn flat round dense icon="more_vert" aria-label="Actions">
                <q-menu>
                  <q-list dense style="min-width: 170px">
                    <q-item v-close-popup clickable @click="previewing = c.id">
                      <q-item-section>{{
                        mineSelected ? 'Edit colors…' : 'Preview'
                      }}</q-item-section>
                    </q-item>
                    <template v-if="mineSelected">
                      <q-item v-close-popup clickable @click="rename(c.id, c.notecard.name)">
                        <q-item-section>Rename…</q-item-section>
                      </q-item>
                      <q-item v-close-popup clickable @click="pickCategory(c.id)">
                        <q-item-section>Category…</q-item-section>
                      </q-item>
                      <q-item v-close-popup clickable @click="startTagging(c.id)">
                        <q-item-section>Tags & styles…</q-item-section>
                      </q-item>
                    </template>
                    <q-item v-else v-close-popup clickable @click="copyMine(c.id)">
                      <q-item-section>Copy to my library</q-item-section>
                    </q-item>
                    <q-item v-close-popup clickable @click="exportCollection(c)">
                      <q-item-section>Export (.rrqcc)</q-item-section>
                    </q-item>
                    <q-item v-if="mineSelected" v-close-popup clickable @click="remove(c.id)">
                      <q-item-section class="text-negative">Delete</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </div>

          <div v-if="!shownBlocks.length && !shownCollections.length" class="text-grey-7 q-pa-md">
            {{ search || category !== undefined ? 'Nothing matches.' : 'Nothing here yet.' }}
          </div>
        </template>
        <div v-else class="text-grey-7 q-pa-md" style="max-width: 560px">
          Your own blocks and color collections, available in every project on this device. Add a
          block from a project's Blocks tab (<b>Add to my library</b>), save colors from its Fabrics
          & Colors tab (<b>Save as collection</b>), or import a backup.
        </div>
      </div>
    </div>

    <!-- Preview / collection colors -->
    <q-dialog :model-value="!!previewing" @update:model-value="previewing = null">
      <q-card v-if="previewBlock" style="width: 560px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">{{ previewBlock.notecard.name }}</div>
          <div class="text-caption text-grey-7">
            {{ previewBlock.size.map((n) => +n.toFixed(2)).join(' × ') }} in
            <template v-if="previewBlock.revision">
              · revision {{ previewBlock.revision }}</template
            >
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
          <div v-if="itemLicense(previewBlock)">
            <span class="text-grey-7">License:</span> {{ licenseName(itemLicense(previewBlock)!) }}
          </div>
          <div v-if="priorCredits(previewBlock).length">
            <span class="text-grey-7">Based on:</span> {{ creditLine(previewBlock) }}
          </div>
          <div v-if="tagLine(previewBlock)" class="text-caption text-grey-7">
            {{ tagLine(previewBlock) }}
          </div>
        </q-card-section>
      </q-card>
      <q-card v-else-if="previewCollection" style="width: 480px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">{{ previewCollection.notecard.name }}</div>
          <div class="text-caption text-grey-7">
            {{ authorOf(previewCollection) ?? 'anonymous' }}
            <template v-if="itemLicense(previewCollection)">
              · {{ licenseName(itemLicense(previewCollection)!) }}</template
            >
          </div>
        </q-card-section>
        <q-list dense separator style="max-height: 60vh; overflow: auto">
          <q-item v-for="(x, i) in previewCollection.colors" :key="x.id">
            <q-item-section avatar>
              <span class="chip big" :style="{ background: css(x) }" />
            </q-item-section>
            <q-item-section>
              <q-input
                v-if="mineSelected"
                :model-value="x.notecard.name"
                dense
                borderless
                @change="(v: string) => renameColor(previewCollection!.id, i, v)"
              />
              <span v-else>{{ x.notecard.name }}</span>
            </q-item-section>
            <q-item-section v-if="mineSelected" side>
              <div class="row no-wrap">
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  icon="arrow_upward"
                  aria-label="Move up"
                  :disable="i === 0"
                  @click="moveColor(previewCollection!.id, i, -1)"
                />
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  icon="arrow_downward"
                  aria-label="Move down"
                  :disable="i === previewCollection.colors.length - 1"
                  @click="moveColor(previewCollection!.id, i, 1)"
                />
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  icon="close"
                  aria-label="Remove"
                  @click="removeColor(previewCollection!.id, i)"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </q-dialog>

    <!-- Tags & styles -->
    <q-dialog :model-value="!!tagging" @update:model-value="tagging = null">
      <q-card v-if="tagging" style="width: 400px; max-width: 95vw">
        <q-card-section class="text-h6">Tags & styles</q-card-section>
        <q-card-section class="column" style="gap: 8px">
          <q-input v-model="tagging.tags" dense outlined label="Tags" hint="Comma-separated" />
          <q-input
            v-model="tagging.styles"
            dense
            outlined
            label="Styles"
            hint="Comma-separated, e.g. eight-point, log cabin"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup flat no-caps label="Cancel" />
          <q-btn flat no-caps color="primary" label="Save" @click="saveTags" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Categories -->
    <q-dialog v-model="managing">
      <q-card style="width: 400px; max-width: 95vw">
        <q-card-section class="text-h6">Categories</q-card-section>
        <q-list dense separator>
          <q-item v-for="c in library.mine?.categories ?? []" :key="c.id">
            <q-item-section>{{ c.name }}</q-item-section>
            <q-item-section side>
              <div class="row no-wrap">
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  icon="edit"
                  aria-label="Rename"
                  @click="renameCat(c.id, c.name)"
                />
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  icon="delete"
                  aria-label="Delete"
                  @click="deleteCat(c.id, c.name)"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
        <q-card-section>
          <q-input v-model="newCategory" dense outlined label="New category" @keyup.enter="addCat">
            <template #append>
              <q-btn flat round dense icon="add" aria-label="Add" @click="addCat" />
            </template>
          </q-input>
          <div class="text-caption text-grey-7 q-mt-sm">
            Deleting a category leaves its items uncategorized.
          </div>
        </q-card-section>
        <q-card-actions align="right"
          ><q-btn v-close-popup flat no-caps label="Done"
        /></q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Back up -->
    <q-dialog :model-value="!!backingUp" @update:model-value="backingUp = null">
      <q-card v-if="backingUp" style="width: 400px; max-width: 95vw">
        <q-card-section class="text-h6">Back up libraries</q-card-section>
        <q-card-section class="column">
          <q-checkbox v-model="backingUp.mine" :label="`${MY_LIBRARY} (${mineCount})`" />
          <q-checkbox
            v-model="backingUp.packs"
            :label="`Installed packs (${library.packs.length})`"
            :disable="!library.packs.length"
          />
          <div class="text-caption text-grey-7 q-mt-sm">
            One .rrqlib file. Import it on any device to get everything back.
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup flat no-caps label="Cancel" />
          <q-btn
            flat
            no-caps
            color="primary"
            label="Back up"
            :disable="!backingUp.mine && !backingUp.packs"
            @click="backUp"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Restore -->
    <q-dialog :model-value="!!restoring" persistent>
      <q-card v-if="restoring" style="width: 460px; max-width: 95vw">
        <q-card-section class="text-h6">Restore a backup</q-card-section>
        <q-card-section class="column" style="gap: 8px">
          <div>
            {{ restoring.backup.items.length }} item(s) for {{ MY_LIBRARY }},
            {{ restoring.backup.packs?.length ?? 0 }} pack(s).
          </div>
          <q-option-group
            v-if="library.mine?.items.length && restoring.backup.items.length"
            v-model="restoring.mine"
            :options="[
              { label: 'Merge into my library (keep what\'s here)', value: 'merge' },
              { label: 'Replace my library with the backup\'s', value: 'replace' },
            ]"
          />
          <div v-for="p in installedAgain" :key="p.id" class="row items-center" style="gap: 8px">
            <div class="col">“{{ p.name }}” is already installed.</div>
            <q-btn-toggle
              v-model="restoring.packs[p.id]"
              dense
              no-caps
              :options="[
                { label: 'Keep', value: 'keep' },
                { label: 'Replace', value: 'replace' },
              ]"
            />
          </div>
          <SkippedList :skipped="restoring.skipped" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancel" @click="restoring = null" />
          <q-btn flat no-caps color="primary" label="Restore" @click="doRestore" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Share as pack -->
    <q-dialog :model-value="!!sharing" @update:model-value="sharing = null">
      <q-card v-if="sharing && shared" style="width: 480px; max-width: 95vw">
        <q-card-section class="text-h6">Share as pack</q-card-section>
        <q-card-section class="column" style="gap: 8px">
          <q-input v-model="sharing.name" dense outlined label="Name" />
          <q-input
            v-model="sharing.description"
            dense
            outlined
            type="textarea"
            autogrow
            label="Description"
          />
          <q-input v-model="sharing.author" dense outlined label="Author" />
          <q-select
            v-model="sharing.license"
            :options="licenseOptions"
            emit-value
            map-options
            dense
            outlined
            label="License"
            :hint="
              shared.lock
                ? `At least ${licenseName(shared.lock.license)}: required by “${shared.lock.because}”`
                : undefined
            "
          >
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.terms }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <div class="text-caption">
            {{ shared.doc.items.length }} item(s), license
            <b>{{ licenseName(shared.doc.license!) }}</b>
            <template v-if="shared.doc.credits?.length">
              · credits {{ shared.doc.credits.length }}</template
            >
          </div>
          <div v-if="shared.excluded.length" class="text-caption text-negative">
            Left out (all rights reserved by someone else): {{ shared.excluded.join(', ') }}
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup flat no-caps label="Cancel" />
          <q-btn
            flat
            no-caps
            color="primary"
            label="Download pack"
            :disable="!sharing.name.trim() || !shared.doc.items.length"
            @click="downloadPack"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
// Libraries (spec 011): browse every library; manage My library; back up, restore, share, import.
import { useQuasar } from 'quasar';
import { computed, defineComponent, h, ref } from 'vue';
import { useAuthor } from '@/composables/author';
import { serializeBlock } from '@/model/block-file';
import { collectionFile, parseCollectionFile } from '@/model/collection-file';
import { DEFAULT_LICENSE, LICENSES, authorOf, licenseName, priorCredits } from '@/model/credits';
import {
  MY_LIBRARY,
  addCategory,
  copyToMine,
  deleteCategory,
  putCollection,
  removeItem,
  renameCategory,
  searchItems,
  setCategory,
  setCollectionColors,
  setNotecard,
  type LibraryView,
} from '@/model/library';
import { backupDoc, packDoc, parseLibrary, restore, serializeLibrary } from '@/model/library-file';
import { createProject } from '@/model/new-project';
import type { Block } from '@/model/schema/block';
import type { ColorCollection, LibraryBackup, LibraryDoc } from '@/model/schema/library';
import type { Color } from '@/model/schema/palette';
import { blockThumbnail } from '@/render/thumbnail';
import { download } from '@/storage/files';
import { useLibraryStore } from '@/stores/library';
import { useSettingsStore } from '@/stores/settings';

const APP = import.meta.env.APP_VERSION;
const ALL = { mine: true, packs: true };

const $q = useQuasar();
const library = useLibraryStore();
const settings = useSettingsStore();
const askAuthor = useAuthor();
const me = computed(() => settings.settings.author);
const fileInput = ref<HTMLInputElement>();

/** Problems found while reading a file, listed in dialogs. */
const SkippedList = defineComponent({
  props: { skipped: { type: Array as () => string[], required: true } },
  setup: (p) => () =>
    p.skipped.length
      ? h('div', { class: 'text-caption text-negative' }, [
          `Skipped ${p.skipped.length}:`,
          h(
            'ul',
            { class: 'q-my-xs' },
            p.skipped.map((s) => h('li', s)),
          ),
        ])
      : null,
});

// --- Which library ---
const lists = computed(() => library.views);
const selected = ref<string>('mine');
const select = (id: string) => {
  selected.value = id;
  category.value = undefined;
};
const current = computed<LibraryView | undefined>(() =>
  selected.value === 'mine'
    ? library.views.find((v) => v.doc.kind === 'personal')
    : library.views.find((v) => v.doc.id === selected.value),
);
const mineSelected = computed(() => current.value?.doc.kind === 'personal');
const isPack = (v: LibraryView) => library.packs.some((p) => p.id === v.doc.id);
const kindLabel = (v: LibraryView) =>
  v.doc.kind === 'personal' ? 'Yours' : v.doc === library.builtin ? 'Built-in' : 'Pack';
const counts = (v: LibraryView) =>
  [
    v.blocks.length && `${v.blocks.length} block${v.blocks.length > 1 ? 's' : ''}`,
    v.collections.length &&
      `${v.collections.length} collection${v.collections.length > 1 ? 's' : ''}`,
  ]
    .filter(Boolean)
    .join(', ') || 'empty';
const mineCount = computed(() => library.mine?.items.length ?? 0);

// --- Browsing ---
const search = ref('');
/** undefined = all; '' = uncategorized. */
const category = ref<string | undefined>(undefined);
const categoryChips = computed(() => [
  { id: undefined, name: 'All' },
  ...(current.value?.doc.categories ?? []),
  { id: '', name: 'Uncategorized' },
]);
const shownIds = computed(
  () =>
    new Set(
      searchItems(current.value?.doc.items ?? [], search.value ?? '', category.value).map(
        (i) => i.data.id,
      ),
    ),
);
const shownBlocks = computed(
  () => current.value?.blocks.filter((b) => shownIds.value.has(b.id)) ?? [],
);
const shownCollections = computed(
  () => current.value?.collections.filter((c) => shownIds.value.has(c.id)) ?? [],
);

const emptyDoc = createProject();
const thumb = (b: Block, px: number) =>
  blockThumbnail(emptyDoc, b, px, $q.dark.isActive, undefined, library.items.colors);
const css = (c: Color) => `rgb(${c.rgb.join(',')})`;
const itemLicense = (x: Block | ColorCollection) =>
  x.license ?? current.value?.doc.license ?? (mineSelected.value ? undefined : DEFAULT_LICENSE);
const creditLine = (x: Block) =>
  priorCredits(x)
    .map((c) => `${c.name ?? 'earlier work'} by ${c.author ?? 'anonymous'}`)
    .join('; ');
const tagLine = (x: Block) =>
  [...(x.notecard.styles ?? []).map((s) => `style: ${s}`), ...(x.notecard.tags ?? [])].join(' · ');

const previewing = ref<string | null>(null);
const previewBlock = computed(() => current.value?.blocks.find((b) => b.id === previewing.value));
const previewCollection = computed(() =>
  current.value?.collections.find((c) => c.id === previewing.value),
);

// --- Editing My library ---
async function update(fn: (lib: LibraryDoc) => LibraryDoc | Promise<LibraryDoc>) {
  await library.saveMine(await fn(library.ensureMine(me.value)));
}

function rename(id: string, name: string) {
  $q.dialog({ title: 'Rename', prompt: { model: name, type: 'text' }, cancel: true }).onOk(
    (v: string) => v.trim() && void update((l) => setNotecard(l, id, { name: v.trim() })),
  );
}
function remove(id: string) {
  $q.dialog({
    title: 'Delete from my library?',
    message: 'Projects that use it keep their copy.',
    cancel: true,
    ok: { label: 'Delete', color: 'negative', flat: true },
  }).onOk(() => void update((l) => removeItem(l, id)));
}
function pickCategory(id: string) {
  const lib = library.mine!;
  const item = lib.items.find((i) => i.data.id === id);
  $q.dialog({
    title: 'Category',
    options: {
      type: 'radio',
      model: item?.category ?? '',
      items: [
        { label: 'Uncategorized', value: '' },
        ...lib.categories.map((c) => ({ label: c.name, value: c.id })),
      ],
    },
    cancel: true,
  }).onOk((v: string) => void update((l) => setCategory(l, id, v || undefined)));
}

const tagging = ref<{ id: string; tags: string; styles: string } | null>(null);
const list = (s: string) => [
  ...new Set(
    s
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean),
  ),
];
function startTagging(id: string) {
  const n = library.mine!.items.find((i) => i.data.id === id)!.data.notecard;
  tagging.value = { id, tags: (n.tags ?? []).join(', '), styles: (n.styles ?? []).join(', ') };
}
function saveTags() {
  const t = tagging.value!;
  tagging.value = null;
  void update((l) => setNotecard(l, t.id, { tags: list(t.tags), styles: list(t.styles) }));
}

const managing = ref(false);
const newCategory = ref('');
function addCat() {
  const name = newCategory.value.trim();
  if (!name) return;
  newCategory.value = '';
  void update((l) => addCategory(l, name).lib);
}
function renameCat(id: string, name: string) {
  $q.dialog({ title: 'Rename category', prompt: { model: name, type: 'text' }, cancel: true }).onOk(
    (v: string) => v.trim() && void update((l) => renameCategory(l, id, v.trim())),
  );
}
function deleteCat(id: string, name: string) {
  $q.dialog({
    title: `Delete “${name}”?`,
    message: 'Its items become uncategorized.',
    cancel: true,
    ok: { label: 'Delete', color: 'negative', flat: true },
  }).onOk(() => {
    if (category.value === id) category.value = undefined;
    void update((l) => deleteCategory(l, id));
  });
}

function editColors(id: string, fn: (colors: Color[]) => Color[]) {
  void update((l) => {
    const item = l.items.find((i) => i.data.id === id);
    return item?.type === 'colors' ? setCollectionColors(l, id, fn([...item.data.colors])) : l;
  });
}
const renameColor = (id: string, i: number, name: string) =>
  name.trim() &&
  editColors(id, (cs) =>
    cs.map((c, j) => (j === i ? { ...c, notecard: { ...c.notecard, name: name.trim() } } : c)),
  );
const moveColor = (id: string, i: number, d: number) =>
  editColors(id, (cs) => {
    const [c] = cs.splice(i, 1);
    cs.splice(i + d, 0, c!);
    return cs;
  });
const removeColor = (id: string, i: number) => editColors(id, (cs) => cs.filter((_, j) => j !== i));

async function copyMine(id: string) {
  const item = current.value?.doc.items.find((i) => i.data.id === id);
  if (!item) return;
  // Copy what projects see (with its library attribution), so credits name the source.
  const stamped =
    item.type === 'block'
      ? { ...item, data: current.value!.blocks.find((b) => b.id === id)! }
      : { ...item, data: current.value!.collections.find((c) => c.id === id)! };
  const author = await askAuthor();
  await update((l) => copyToMine(l, stamped, author, DEFAULT_LICENSE));
  $q.notify({ type: 'positive', message: `Copied “${item.data.notecard.name}” to ${MY_LIBRARY}.` });
}

// --- Files ---
function exportBlock(b: Block) {
  download(b.notecard.name, serializeBlock(b, 'in', library.items.colors, me.value), 'rrqbl');
}
function exportCollection(c: ColorCollection) {
  download(c.notecard.name, JSON.stringify(collectionFile(c, APP)), 'rrqcc');
}

const formatOf = (text: string): unknown => {
  try {
    return (JSON.parse(text) as { format?: unknown } | null)?.format;
  } catch {
    return undefined;
  }
};

async function importFile(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  const text = await file.text();
  if (formatOf(text) === 'rrqcc') return importCollection(text);
  const r = parseLibrary(text);
  if (!r.ok) return void $q.notify({ type: 'negative', message: r.error });
  if (r.doc.kind === 'personal') {
    restoring.value = {
      backup: r.doc,
      skipped: r.skipped,
      mine: 'merge',
      packs: Object.fromEntries((r.doc.packs ?? []).map((p) => [p.id, 'keep' as const])),
    };
  } else installPack(r.doc, r.skipped);
}

function importCollection(text: string) {
  const r = parseCollectionFile(text);
  if (!r.ok) return void $q.notify({ type: 'negative', message: r.error });
  const c = r.file.collection;
  const have = library.mine?.items.find((i) => i.data.id === c.id);
  const done = () => {
    select('mine');
    $q.notify({ type: 'positive', message: `Added “${c.notecard.name}” to ${MY_LIBRARY}.` });
  };
  if (!have) return void update((l) => putCollection(l, c)).then(done);
  if (have.data.version && have.data.version === c.version)
    return void $q.notify({ message: `“${c.notecard.name}” is already in ${MY_LIBRARY}.` });
  $q.dialog({
    title: `“${c.notecard.name}” is already in ${MY_LIBRARY}`,
    message: 'The file has another version of it.',
    cancel: { label: 'Keep both', flat: true, noCaps: true },
    ok: { label: 'Replace it', flat: true, noCaps: true },
  })
    .onOk(() => void update((l) => putCollection(l, c)).then(done))
    .onCancel(
      () => void update((l) => copyToMine(l, { type: 'colors', data: c }, me.value)).then(done),
    );
}

function installPack(doc: LibraryDoc, skipped: string[]) {
  if (doc.id === library.builtin?.id || doc.id === library.mine?.id)
    return void $q.notify({ type: 'negative', message: 'This pack’s id is already used here.' });
  const have = library.packs.find((p) => p.id === doc.id);
  const install = async () => {
    await library.savePack(doc);
    select(doc.id);
    $q.notify({
      type: skipped.length ? 'warning' : 'positive',
      message: `Installed “${doc.name}”${skipped.length ? ` (${skipped.length} item(s) skipped: ${skipped.join('; ')})` : ''}.`,
      timeout: skipped.length ? 0 : 2500,
      ...(skipped.length ? { actions: [{ label: 'OK', color: 'white' }] } : {}),
    });
  };
  if (!have) return void install();
  if (doc.revision <= have.revision)
    return void $q.notify({
      message: `“${doc.name}” is already installed (revision ${have.revision}).`,
    });
  const notes = (doc.changelog ?? [])
    .filter((c) => c.revision > have.revision)
    .map((c) => `Revision ${c.revision} (${c.date}): ${c.notes}`);
  $q.dialog({
    title: `Update “${doc.name}” to revision ${doc.revision}?`,
    message: notes.length ? notes.join('\n') : 'No changelog provided.',
    style: 'white-space: pre-wrap',
    cancel: true,
    ok: { label: 'Update', flat: true },
  }).onOk(() => void install());
}

function removePack(doc: LibraryDoc) {
  $q.dialog({
    title: `Remove “${doc.name}”?`,
    message: 'Projects that use its items keep their copies.',
    cancel: true,
    ok: { label: 'Remove', color: 'negative', flat: true },
  }).onOk(() => {
    select('mine');
    void library.removePack(doc.id);
  });
}

const backingUp = ref<{ mine: boolean; packs: boolean } | null>(null);
function backUp() {
  const b = backingUp.value!;
  backingUp.value = null;
  const doc = backupDoc(library.ensureMine(me.value), library.packs, b);
  download('RRQuilts library backup', serializeLibrary(doc, APP), 'rrqlib');
}

const restoring = ref<{
  backup: LibraryBackup;
  skipped: string[];
  mine: 'merge' | 'replace';
  packs: Record<string, 'keep' | 'replace'>;
} | null>(null);
const installedAgain = computed(() =>
  (restoring.value?.backup.packs ?? []).filter((p) => library.packs.some((x) => x.id === p.id)),
);
async function doRestore() {
  const r = restoring.value!;
  restoring.value = null;
  const next = restore({ mine: library.ensureMine(me.value), packs: library.packs }, r.backup, {
    mine: r.mine,
    packs: r.packs,
  });
  await library.saveMine(next.mine);
  for (const p of next.packs) if (!library.packs.includes(p)) await library.savePack(p);
  select('mine');
  $q.notify({ type: 'positive', message: 'Libraries restored.' });
}

// --- Share as pack ---
const sharing = ref<{ name: string; description: string; author: string; license: string } | null>(
  null,
);
const licenseOptions = LICENSES.map((l) => ({ value: l.id, label: l.name, terms: l.terms }));
async function startShare() {
  const author = await askAuthor();
  sharing.value = {
    name: author ? `${author}'s library` : 'My pack',
    description: '',
    author,
    license: DEFAULT_LICENSE,
  };
}
const shared = computed(() =>
  sharing.value && library.mine
    ? packDoc(library.mine, me.value, {
        name: sharing.value.name.trim(),
        description: sharing.value.description.trim(),
        author: sharing.value.author.trim(),
        license: sharing.value.license,
      })
    : null,
);
function downloadPack() {
  const doc = shared.value!.doc;
  sharing.value = null;
  download(doc.name, serializeLibrary(doc, APP), 'rrqlib');
}
</script>

<style scoped>
.libs {
  width: 260px;
  flex: none;
  align-self: flex-start;
}
@media (max-width: 1023px) {
  .row.no-wrap-md {
    flex-direction: column;
  }
  .libs {
    width: 100%;
  }
}
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}
.card {
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 8px;
  padding: 8px;
  min-width: 0;
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
.collection {
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 8px;
  padding: 6px;
  min-width: 0;
}
.strip {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  max-width: 60%;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
}
.chip {
  display: inline-block;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}
.chip.big {
  width: 32px;
  height: 32px;
}
</style>
