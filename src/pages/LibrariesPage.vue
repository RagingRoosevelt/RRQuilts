<template>
  <q-page padding>
    <div class="row items-center q-mb-md" style="gap: 8px">
      <q-btn
        v-if="$q.screen.lt.md"
        flat
        round
        icon="menu"
        aria-label="Filters"
        @click="filtersOpen = !filtersOpen"
      />
      <div class="text-h6 col" style="min-width: 120px">Libraries</div>
      <q-btn outline no-caps icon="upload_file" label="Import" @click="importFile">
        <q-tooltip>A backup or pack (.rrqlib), or a palette (.rrqplt)</q-tooltip>
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
    </div>
    <q-banner v-if="!library.stored" dense class="bg-warning text-dark q-mb-md">
      This browser isn't keeping your libraries (storage is blocked). Back up before closing.
    </q-banner>

    <div class="row no-wrap-md" style="gap: 16px">
      <div
        v-show="filtersOpen"
        class="libs column"
        :class="{ left: settings.settings.sidesSwapped }"
        style="gap: 8px"
      >
        <q-input v-model="search" dense outlined clearable placeholder="Search names, notes">
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <q-expansion-item
          default-opened
          dense
          label="Libraries"
          :caption="`${library.views.length - hiddenLibs.length} of ${library.views.length}`"
          class="lib-picker rounded-borders"
        >
          <div class="lib-checks column no-wrap q-px-sm">
            <q-checkbox
              v-for="v in library.views"
              :key="v.doc.id"
              dense
              class="q-py-xs"
              :model-value="!hiddenLibs.includes(v.doc.id)"
              @update:model-value="toggleLib(v.doc.id)"
            >
              {{ v.doc.name }}
              <div class="text-caption text-grey-7">{{ kindLabel(v) }} · {{ counts(v) }}</div>
            </q-checkbox>
          </div>
        </q-expansion-item>
        <template v-for="f in filterFields" :key="f.key">
          <q-select
            v-if="f.options.length"
            v-model="filters[f.key]"
            :options="f.options.filter((o) => o.label.toLowerCase().includes(needle[f.key]))"
            :label="f.label"
            dense
            outlined
            multiple
            use-chips
            use-input
            input-debounce="0"
            emit-value
            map-options
            clearable
            @clear="filters[f.key] = []"
            @filter="
              (v: string, done: (fn: () => void) => void) =>
                done(() => (needle[f.key] = v.toLowerCase()))
            "
          >
            <template #option="{ itemProps, opt, selected }">
              <q-item v-bind="itemProps" dense>
                <q-item-section side>
                  <q-checkbox :model-value="selected" dense class="no-pointer-events" />
                </q-item-section>
                <q-item-section>{{ opt.label }}</q-item-section>
              </q-item>
            </template>
          </q-select>
        </template>
        <q-select
          v-model="settings.settings.libraryGroupBy"
          :options="GROUP_BY"
          emit-value
          map-options
          dense
          outlined
          label="Group blocks by"
        />
      </div>

      <div class="col" style="min-width: 0">
        <div v-if="!mineCount && !filtering" class="text-grey-7 q-pa-md" style="max-width: 560px">
          Your own blocks and palettes, available in every project on this device. Add a block from
          a project's Blocks tab (<b>Add to my library</b>), save colors from its Fabrics & Colors
          tab (<b>Save to my library</b>), or import a backup.
        </div>
        <template v-for="g in groups" :key="g.v.doc.id">
          <div class="lib-group q-mb-md">
            <div class="row items-start q-mb-sm" style="gap: 8px">
              <div class="col">
                <div class="text-subtitle1">{{ g.v.doc.name }}</div>
                <div class="text-caption text-grey-7">
                  <template v-if="g.v.doc.author">by {{ g.v.doc.author.name }} · </template>
                  <template v-if="g.v.doc.license">{{ licenseName(g.v.doc.license) }} · </template>
                  revision {{ g.v.doc.revision }}
                </div>
                <div v-if="g.v.doc.description" class="text-body2 q-mt-xs">
                  {{ g.v.doc.description }}
                </div>
              </div>
              <q-btn
                v-if="g.mine"
                flat
                dense
                no-caps
                icon="label"
                label="Categories…"
                @click="managing = true"
              />
              <q-btn
                v-if="isPack(g.v)"
                flat
                dense
                no-caps
                color="negative"
                icon="delete"
                label="Remove pack"
                @click="removePack(g.v.doc)"
              />
            </div>

            <div v-if="g.blocks.length" class="text-subtitle2 q-mb-sm">Blocks</div>
            <template v-for="sec in g.sections" :key="sec.key">
              <button
                v-if="sec.label"
                v-show="!sec.parent || secOpen(g.v.doc.id, sec.parent)"
                class="sec-head text-body2 text-weight-medium text-grey-8 q-mb-xs"
                :class="{ 'sec-sub': sec.parent }"
                :aria-expanded="secOpen(g.v.doc.id, sec.key)"
                @click="toggleSec(g.v.doc.id, sec.key)"
              >
                <q-icon
                  :name="secOpen(g.v.doc.id, sec.key) ? 'expand_more' : 'chevron_right'"
                  size="20px"
                />
                {{ sec.label }} <span class="text-grey-6">· {{ sec.count }}</span>
              </button>
              <div
                v-if="sec.blocks.length"
                v-show="
                  !sec.label ||
                  (secOpen(g.v.doc.id, sec.key) && (!sec.parent || secOpen(g.v.doc.id, sec.parent)))
                "
                class="cards q-mb-lg"
                :class="{ 'sec-sub': sec.parent }"
              >
                <div v-for="b in sec.blocks" :key="b.id" class="card">
                  <button class="thumb" @click="previewing = { lib: g.v.doc.id, id: b.id }">
                    <img :src="thumb(b, 200)" :alt="b.notecard.name" />
                  </button>
                  <div class="row items-center no-wrap">
                    <div class="col ellipsis">{{ b.notecard.name }}</div>
                    <q-btn flat round dense icon="more_vert" aria-label="Actions">
                      <q-menu>
                        <q-list dense style="min-width: 170px">
                          <q-item
                            v-close-popup
                            clickable
                            @click="previewing = { lib: g.v.doc.id, id: b.id }"
                          >
                            <q-item-section>Preview</q-item-section>
                          </q-item>
                          <template v-if="g.mine">
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
                          <q-item v-else v-close-popup clickable @click="copyMine(g.v, b.id)">
                            <q-item-section>Copy to my library</q-item-section>
                          </q-item>
                          <q-item v-close-popup clickable @click="exportBlock(b)">
                            <q-item-section>Export (.rrqbl)</q-item-section>
                          </q-item>
                          <q-item v-if="g.mine" v-close-popup clickable @click="remove(b.id)">
                            <q-item-section class="text-negative">Delete</q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-btn>
                  </div>
                </div>
              </div>
            </template>

            <div v-if="g.collections.length" class="text-subtitle2 q-mb-sm">Palettes</div>
            <div class="column q-mb-lg" style="gap: 8px">
              <div v-for="c in g.collections" :key="c.id" class="collection row items-center">
                <button class="strip" @click="previewing = { lib: g.v.doc.id, id: c.id }">
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
                      <q-item
                        v-close-popup
                        clickable
                        @click="previewing = { lib: g.v.doc.id, id: c.id }"
                      >
                        <q-item-section>{{ g.mine ? 'Edit colors…' : 'Preview' }}</q-item-section>
                      </q-item>
                      <template v-if="g.mine">
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
                      <q-item v-else v-close-popup clickable @click="copyMine(g.v, c.id)">
                        <q-item-section>Copy to my library</q-item-section>
                      </q-item>
                      <q-item v-close-popup clickable @click="exportCollection(c)">
                        <q-item-section>Export (.rrqplt)</q-item-section>
                      </q-item>
                      <q-item v-if="g.mine" v-close-popup clickable @click="remove(c.id)">
                        <q-item-section class="text-negative">Delete</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </div>
          </div>
        </template>
        <div v-if="!groups.length && filtering" class="text-grey-7 q-pa-md">Nothing matches.</div>
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
                v-if="previewMine"
                :model-value="x.notecard.name"
                dense
                borderless
                @change="(v: string) => renameColor(previewCollection!.id, i, v)"
              />
              <span v-else>{{ x.notecard.name }}</span>
            </q-item-section>
            <q-item-section v-if="previewMine" side>
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
          <q-select
            v-for="f in ['tags', 'styles'] as const"
            :key="f"
            v-model="tagging[f]"
            :label="f === 'tags' ? 'Tags' : 'Styles'"
            :hint="f === 'styles' ? 'e.g. eight-point, log cabin' : undefined"
            :options="tagOptions"
            dense
            outlined
            multiple
            use-chips
            use-input
            hide-dropdown-icon
            input-debounce="0"
            new-value-mode="add-unique"
            @filter="(v: string, done: (fn: () => void) => void) => filterTags(f, v, done)"
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
          <q-item v-for="c in categoryTree(library.mine?.categories ?? [])" :key="c.id">
            <q-item-section :class="{ 'q-pl-lg': c.depth }">{{ c.name }}</q-item-section>
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
            For a subcategory, write its category first: Stars/Eight-point stars. Deleting a
            category deletes its subcategories; their items become uncategorized.
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
import { useAskCategory } from '@/composables/category';
// Libraries (spec 011): browse every library; manage My library; back up, restore, share, import.
import { useQuasar } from 'quasar';
import { computed, defineComponent, h, reactive, ref } from 'vue';
import { useAuthor } from '@/composables/author';
import { serializeBlock } from '@/model/block-file';
import { collectionFile, parseCollectionFile } from '@/model/collection-file';
import { DEFAULT_LICENSE, LICENSES, authorOf, licenseName, priorCredits } from '@/model/credits';
import {
  MY_LIBRARY,
  categoryTree,
  copyToMine,
  deleteCategory,
  ensureCategory,
  putCollection,
  removeItem,
  renameCategory,
  searchItems,
  setCategory,
  withSubcategories,
  setCollectionColors,
  setNotecard,
  type LibraryView,
} from '@/model/library';
import { backupDoc, packDoc, parseLibrary, restore, serializeLibrary } from '@/model/library-file';
import { createProject } from '@/model/new-project';
import type { Block } from '@/model/schema/block';
import type {
  ColorCollection,
  LibraryBackup,
  LibraryDoc,
  LibraryItem,
} from '@/model/schema/library';
import type { Color } from '@/model/schema/palette';
import { blockThumbnail } from '@/render/thumbnail';
import { exportFile, pickFile } from '@/storage/files';
import { useLibraryStore } from '@/stores/library';
import { useSettingsStore } from '@/stores/settings';

const APP = import.meta.env.APP_VERSION;
const ALL = { mine: true, packs: true };

const $q = useQuasar();
const library = useLibraryStore();
const settings = useSettingsStore();
const askAuthor = useAuthor();
const me = computed(() => settings.settings.author);

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

// --- Browsing: filters over every library ---
const filtersOpen = ref($q.screen.gt.sm);
const select = (id: string) => {
  for (const k of Object.keys(filters) as (keyof typeof filters)[]) filters[k] = [];
  search.value = '';
  hiddenLibs.value =
    id === 'mine' ? [] : library.views.map((v) => v.doc.id).filter((x) => x !== id);
};
/** Unchecked libraries; libraries installed later start checked. */
const hiddenLibs = ref<string[]>([]);
const toggleLib = (id: string) =>
  (hiddenLibs.value = hiddenLibs.value.includes(id)
    ? hiddenLibs.value.filter((x) => x !== id)
    : [...hiddenLibs.value, id]);
const isPack = (v: LibraryView) => library.packs.some((p) => p.id === v.doc.id);
const kindLabel = (v: LibraryView) =>
  v.doc.kind === 'personal' ? 'Yours' : v.doc === library.builtin ? 'Built-in' : 'Pack';
const counts = (v: LibraryView) =>
  [
    v.blocks.length && `${v.blocks.length} block${v.blocks.length > 1 ? 's' : ''}`,
    v.collections.length && `${v.collections.length} palette${v.collections.length > 1 ? 's' : ''}`,
  ]
    .filter(Boolean)
    .join(', ') || 'empty';
const mineCount = computed(() => library.mine?.items.length ?? 0);

const search = ref('');
/** Selected values per filter; empty = any. Category '' = uncategorized. */
const filters = reactive({
  types: [] as string[],
  cats: [] as string[],
  tags: [] as string[],
  styles: [] as string[],
});
/** What's typed in each dropdown to narrow its options. */
const needle = reactive({ types: '', cats: '', tags: '', styles: '' });
const filtering = computed(
  () => !!search.value || !!hiddenLibs.value.length || Object.values(filters).some((f) => f.length),
);
const inScope = computed(() => library.views.filter((v) => !hiddenLibs.value.includes(v.doc.id)));
const values = (f: 'tags' | 'styles') =>
  [...new Set(inScope.value.flatMap((v) => v.doc.items.flatMap((i) => i.data.notecard[f] ?? [])))]
    .sort()
    .map((t) => ({ label: t, value: t }));
const allCats = computed(() => [
  ...new Map(inScope.value.flatMap((v) => v.doc.categories).map((c) => [c.id, c])).values(),
]);
const filterFields = computed(() => {
  const cats = allCats.value;
  return [
    {
      key: 'types' as const,
      label: 'Type',
      options: [
        { label: 'Blocks', value: 'block' },
        { label: 'Palettes', value: 'colors' },
      ],
    },
    {
      key: 'cats' as const,
      label: 'Category',
      options: cats.length
        ? [
            ...categoryTree(cats).map((c) => ({ label: c.label, value: c.id })),
            { label: 'Uncategorized', value: '' },
          ]
        : [],
    },
    { key: 'tags' as const, label: 'Tags', options: values('tags') },
    { key: 'styles' as const, label: 'Styles', options: values('styles') },
  ];
});
const anyOf = (picked: string[], have: string[]) =>
  !picked.length || picked.some((x) => have.includes(x));
const matches = (i: LibraryItem) =>
  anyOf(filters.types, [i.type]) &&
  anyOf(withSubcategories(allCats.value, filters.cats), [i.category ?? '']) &&
  anyOf(filters.tags, i.data.notecard.tags ?? []) &&
  anyOf(filters.styles, i.data.notecard.styles ?? []);
/** Group-by sections the user collapsed are remembered per library and section. */
const secKey = (lib: string, label: string) => `libsec:${lib}:${label}`;
const secOpen = (lib: string, label: string) =>
  !settings.settings.collapsedSections.includes(secKey(lib, label));
function toggleSec(lib: string, label: string) {
  const key = secKey(lib, label);
  const all = settings.settings.collapsedSections;
  settings.settings.collapsedSections = all.includes(key)
    ? all.filter((k) => k !== key)
    : [...all, key];
}
const GROUP_BY = [
  { label: 'Nothing', value: 'none' },
  { label: 'Category', value: 'category' },
  { label: 'Tags', value: 'tags' },
  { label: 'Styles', value: 'styles' },
];
/**
 * A library's blocks in sections by the chosen grouping: categories in the library's order, each
 * top-level one holding its subcategories (then Uncategorized); tags or styles A–Z (then None). A
 * block with several tags shows under each.
 */
function sections(doc: LibraryDoc, blocks: Block[]) {
  const by = settings.settings.libraryGroupBy;
  type Sec = { key: string; label: string; blocks: Block[]; count: number; parent?: string };
  const sec = (key: string, label: string, bs: Block[], parent?: string): Sec => ({
    key,
    label,
    blocks: bs,
    count: bs.length,
    ...(parent ? { parent } : {}),
  });
  if (by === 'none' || !blocks.length) return [sec('', '', blocks)];
  if (by === 'category') {
    // Top-level categories are accordions holding their own blocks, then their subcategories'.
    const catOf = new Map(doc.items.map((i) => [i.data.id, i.category]));
    const inCat = (id: string) => blocks.filter((b) => catOf.get(b.id) === id);
    const known = new Set(doc.categories.map((c) => c.id));
    const out: Sec[] = doc.categories
      .filter((t) => !t.parent)
      .flatMap((t) => {
        const subs = doc.categories
          .filter((c) => c.parent === t.id)
          .map((c) => sec(`${t.name} / ${c.name}`, c.name, inCat(c.id), t.name))
          .filter((x) => x.count);
        const top = sec(t.name, t.name, inCat(t.id));
        top.count += subs.reduce((n, x) => n + x.count, 0);
        return top.count ? [top, ...subs] : [];
      });
    const none = blocks.filter((b) => !known.has(catOf.get(b.id) ?? ''));
    return none.length ? [...out, sec('Uncategorized', 'Uncategorized', none)] : out;
  }
  const keysOf = (b: Block) => b.notecard[by] ?? [];
  const keys = [...new Set(blocks.flatMap(keysOf))].sort();
  const none = `No ${by}`;
  return [
    ...keys.map((k) =>
      sec(
        k,
        k,
        blocks.filter((b) => keysOf(b).includes(k)),
      ),
    ),
    sec(
      none,
      none,
      blocks.filter((b) => !keysOf(b).length),
    ),
  ].filter((x) => x.count);
}
const groups = computed(() =>
  inScope.value
    .map((v) => {
      const ids = new Set(
        searchItems(v.doc.items, search.value ?? '')
          .filter(matches)
          .map((i) => i.data.id),
      );
      const blocks = v.blocks.filter((b) => ids.has(b.id));
      return {
        v,
        mine: v.doc.kind === 'personal',
        blocks,
        sections: sections(v.doc, blocks),
        collections: v.collections.filter((c) => ids.has(c.id)),
      };
    })
    .filter((g) => g.blocks.length || g.collections.length),
);

const emptyDoc = createProject();
const thumb = (b: Block, px: number) =>
  blockThumbnail(emptyDoc, b, px, $q.dark.isActive, undefined, library.items.colors);
const css = (c: Color) => `rgb(${c.rgb.join(',')})`;
const itemLicense = (x: Block | ColorCollection) =>
  x.license ?? previewLib.value?.doc.license ?? (previewMine.value ? undefined : DEFAULT_LICENSE);
const creditLine = (x: Block) =>
  priorCredits(x)
    .map((c) => `${c.name ?? 'earlier work'} by ${c.author ?? 'anonymous'}`)
    .join('; ');
const tagLine = (x: Block) =>
  [...(x.notecard.styles ?? []).map((s) => `style: ${s}`), ...(x.notecard.tags ?? [])].join(' · ');

const previewing = ref<{ lib: string; id: string } | null>(null);
const previewLib = computed(() => library.views.find((v) => v.doc.id === previewing.value?.lib));
const previewMine = computed(() => previewLib.value?.doc.kind === 'personal');
const previewBlock = computed(() =>
  previewLib.value?.blocks.find((b) => b.id === previewing.value?.id),
);
const previewCollection = computed(() =>
  previewLib.value?.collections.find((c) => c.id === previewing.value?.id),
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
const askCategory = useAskCategory();
async function pickCategory(id: string) {
  const item = library.mine!.items.find((i) => i.data.id === id);
  const v = await askCategory('Category', item?.category ?? '');
  if (v !== null) await update((l) => setCategory(l, id, v));
}

const tagging = ref<{ id: string; tags: string[]; styles: string[] } | null>(null);
const tagOptions = ref<string[]>([]);
// Existing tags/styles from every library, matched as you type; Enter adds a new one.
function filterTags(f: 'tags' | 'styles', typed: string, done: (fn: () => void) => void) {
  const q = typed.trim().toLowerCase();
  const all = new Set(
    library.views.flatMap((v) => v.doc.items.flatMap((i) => i.data.notecard[f] ?? [])),
  );
  done(() => (tagOptions.value = [...all].filter((t) => t.toLowerCase().includes(q)).sort()));
}
function startTagging(id: string) {
  const n = library.mine!.items.find((i) => i.data.id === id)!.data.notecard;
  tagging.value = { id, tags: [...(n.tags ?? [])], styles: [...(n.styles ?? [])] };
}
function saveTags() {
  const { id, tags, styles } = tagging.value!;
  tagging.value = null;
  const clean = (l: string[]) => [...new Set(l.map((x) => x.trim()).filter(Boolean))];
  void update((l) => setNotecard(l, id, { tags: clean(tags), styles: clean(styles) }));
}

const managing = ref(false);
const newCategory = ref('');
function addCat() {
  const name = newCategory.value.trim();
  if (!name) return;
  newCategory.value = '';
  void update((l) => ensureCategory(l, name).lib);
}
function renameCat(id: string, name: string) {
  $q.dialog({ title: 'Rename category', prompt: { model: name, type: 'text' }, cancel: true }).onOk(
    (v: string) => v.trim() && void update((l) => renameCategory(l, id, v.trim())),
  );
}
function deleteCat(id: string, name: string) {
  $q.dialog({
    title: `Delete “${name}”?`,
    message: 'Its subcategories go too; their items become uncategorized.',
    cancel: true,
    ok: { label: 'Delete', color: 'negative', flat: true },
  }).onOk(() => {
    const gone = withSubcategories(library.mine?.categories ?? [], [id]);
    filters.cats = filters.cats.filter((c) => !gone.includes(c));
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

async function copyMine(v: LibraryView, id: string) {
  const item = v.doc.items.find((i) => i.data.id === id);
  if (!item) return;
  // Copy what projects see (with its library attribution), so credits name the source.
  const stamped =
    item.type === 'block'
      ? { ...item, data: v.blocks.find((b) => b.id === id)! }
      : { ...item, data: v.collections.find((c) => c.id === id)! };
  const author = await askAuthor();
  await update((l) => copyToMine(l, stamped, author, DEFAULT_LICENSE));
  $q.notify({ type: 'positive', message: `Copied “${item.data.notecard.name}” to ${MY_LIBRARY}.` });
}

// --- Files ---
function exportBlock(b: Block) {
  void exportFile(
    b.notecard.name,
    serializeBlock(b, 'in', library.items.colors, me.value),
    'rrqbl',
  );
}
function exportCollection(c: ColorCollection) {
  void exportFile(c.notecard.name, JSON.stringify(collectionFile(c, APP)), 'rrqplt');
}

const formatOf = (text: string): unknown => {
  try {
    return (JSON.parse(text) as { format?: unknown } | null)?.format;
  } catch {
    return undefined;
  }
};

async function importFile() {
  const file = await pickFile(['rrqlib', 'rrqplt']);
  if (!file) return;
  const text = await file.text();
  if (formatOf(text) === 'rrqplt') return importCollection(text);
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
  void exportFile('RRQuilts library backup', serializeLibrary(doc, APP), 'rrqlib');
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
  void exportFile(doc.name, serializeLibrary(doc, APP), 'rrqlib');
}
</script>

<style scoped>
.libs {
  width: 260px;
  flex: none;
  align-self: flex-start;
  position: sticky;
  top: 67px;
  max-height: calc(100vh - 83px);
  overflow-y: auto;
  padding-top: 2px;
  order: 1;
}
.libs.left {
  order: -1;
}
.lib-picker {
  border: 1px solid rgba(128, 128, 128, 0.4);
}
/* At most five libraries show; more scroll. */
.lib-checks {
  max-height: calc(5 * 50px);
  overflow-y: auto;
}
.lib-checks .q-checkbox {
  min-height: 50px;
}
.lib-group + .lib-group {
  border-top: 1px solid rgba(128, 128, 128, 0.3);
  padding-top: 12px;
}
@media (max-width: 1023px) {
  .row.no-wrap-md {
    flex-direction: column;
  }
  .libs {
    width: 100%;
    position: static;
    max-height: none;
    order: 0;
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
.sec-sub {
  margin-left: 20px;
}
.sec-head {
  display: flex;
  align-items: center;
  gap: 2px;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  font: inherit;
}
</style>
