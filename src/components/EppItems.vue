<template>
  <div class="column" style="gap: 12px">
    <SlidePicker
      v-model="filter"
      style="max-width: 320px"
      :options="[
        { value: 'all', label: 'All' },
        { value: 'shapes', label: 'Shapes' },
        { value: 'rosettes', label: 'Rosettes' },
        { value: '3d', label: '3D' },
      ]"
    />
    <div class="text-subtitle2">Mine</div>
    <div v-if="!ro" class="stack">
      <button class="card add" @click="newShapeItem">
        <q-icon name="add" size="md" />
        <div>New shape</div>
      </button>
      <button class="card add" @click="newRosetteItem">
        <q-icon name="hive" size="md" />
        <div>New rosette</div>
      </button>
      <button class="card add" @click="new3d">
        <q-icon name="3d_rotation" size="md" />
        <div>New 3D design</div>
      </button>
      <button class="card add" @click="importFile">
        <q-icon name="upload_file" size="md" />
        <div>Import <span class="text-caption">.rrqepp</span></div>
      </button>
    </div>
    <!-- 3D EPP quilts (spec 027 User Story 7): listed here with a 3D badge, and under Quilts as
         2D EPP quilts are (owner, 2026-11-23). In a block box: Firefox stretches a grid's rows
         straight inside a flex column. -->
    <div v-if="designs.length && (filter === 'all' || filter === '3d')">
      <div class="designs">
        <div v-for="q in designs" :key="q.id" class="card">
          <div class="relative-position">
            <button class="thumb" :aria-label="`Open ${q.notecard.name}`" @click="openDesign(q.id)">
              <img
                :src="quiltThumbnail(project.doc!, q, 240, $q.dark.isActive, true)"
                :alt="q.notecard.name"
                draggable="false"
              />
            </button>
            <q-badge color="primary" class="badge3d">3D</q-badge>
          </div>
          <div class="row items-center no-wrap">
            <FullName class="col" :name="q.notecard.name" />
            <q-btn flat round dense icon="more_vert" aria-label="Actions">
              <q-menu auto-close>
                <q-list dense style="min-width: 180px">
                  <q-item clickable @click="openDesign(q.id)">
                    <q-item-section avatar class="menu-icon"><q-icon name="edit" /></q-item-section>
                    <q-item-section>Open</q-item-section>
                  </q-item>
                  <q-item clickable @click="openDesign(q.id, 'print')">
                    <q-item-section avatar class="menu-icon"
                      ><q-icon name="print"
                    /></q-item-section>
                    <q-item-section>Print</q-item-section>
                  </q-item>
                  <q-item v-if="!ro" clickable @click="copyDesign(q.id)">
                    <q-item-section avatar class="menu-icon"
                      ><q-icon name="content_copy"
                    /></q-item-section>
                    <q-item-section>Create copy</q-item-section>
                  </q-item>
                  <q-item v-if="!ro" clickable @click="deleteDesign(q.id)">
                    <q-item-section avatar class="menu-icon"
                      ><q-icon name="delete" color="negative"
                    /></q-item-section>
                    <q-item-section class="text-negative">Delete</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </div>
      </div>
    </div>
    <!-- Mine, then each library in category sections, as the Blocks tab's library blocks. A block
         box, not a flex column: Firefox stretched the cards' grid rows to a two-column guess. -->
    <div>
      <template v-for="(g, k) in groups" :key="g.lib">
        <div v-if="k === 1" class="text-subtitle2 q-mt-md">Libraries</div>
        <BlockSections :sections="g.sections" :lib="`epp:${g.lib}`" :title="g.label">
          <template #default="{ block: x }">
            <div v-for="c in cardFor(x)" :key="c.id" class="card">
              <button class="thumb" :aria-label="`Open ${c.name}`" @click="open(c)">
                <EppThumb :polys="c.polys" :size="0" />
              </button>
              <div class="row items-center no-wrap">
                <q-icon
                  v-if="c.kind === 'rosette'"
                  name="hive"
                  size="xs"
                  color="grey-7"
                  class="q-mr-xs"
                >
                  <q-tooltip>Rosette</q-tooltip>
                </q-icon>
                <FullName class="col" :name="c.name">
                  <q-icon
                    v-if="c.inProject && !c.mine"
                    name="check_circle"
                    color="primary"
                    size="xs"
                  >
                    <q-tooltip>Used in this project</q-tooltip>
                  </q-icon>
                </FullName>
                <q-btn flat round dense icon="more_vert" aria-label="Actions">
                  <q-menu auto-close>
                    <q-list dense style="min-width: 180px">
                      <q-item clickable @click="open(c)">
                        <q-item-section avatar class="menu-icon"
                          ><q-icon name="edit"
                        /></q-item-section>
                        <q-item-section>Open</q-item-section>
                      </q-item>
                      <q-item clickable @click="printItem(c)">
                        <q-item-section avatar class="menu-icon"
                          ><q-icon name="print"
                        /></q-item-section>
                        <q-item-section>Print</q-item-section>
                      </q-item>
                      <q-item v-if="c.mine && !ro" clickable @click="duplicate(c)">
                        <q-item-section avatar class="menu-icon"
                          ><q-icon name="content_copy"
                        /></q-item-section>
                        <q-item-section>Duplicate</q-item-section>
                      </q-item>
                      <q-item v-if="!c.mine && !ro" clickable @click="copyToProject(c)">
                        <q-item-section avatar class="menu-icon"
                          ><q-icon name="content_copy"
                        /></q-item-section>
                        <q-item-section>Edit a copy</q-item-section>
                      </q-item>
                      <q-item v-if="c.inProject" clickable @click="exportItem(c)">
                        <q-item-section avatar class="menu-icon"
                          ><q-icon name="file_download"
                        /></q-item-section>
                        <q-item-section>Export (.rrqepp)</q-item-section>
                      </q-item>
                      <q-item v-if="c.mine && !c.linked && !ro" clickable @click="toLibrary(c)">
                        <q-item-section avatar class="menu-icon"
                          ><q-icon name="collections_bookmark"
                        /></q-item-section>
                        <q-item-section>Add to {{ MY_LIBRARY }}</q-item-section>
                      </q-item>
                      <q-item v-if="c.mine && !ro" clickable @click="remove(c)">
                        <q-item-section avatar class="menu-icon"
                          ><q-icon name="delete" color="negative"
                        /></q-item-section>
                        <q-item-section class="text-negative">Delete</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </div>
          </template>
        </BlockSections>
      </template>
    </div>
    <div v-if="app.settings.hideLibraryBlocks" class="text-caption text-grey-7">
      Library shapes and rosettes are turned off in Settings › Project.
    </div>
  </div>
</template>

<script setup lang="ts">
// The project's EPP tab (spec 027 FR-013): its shapes and rosettes, and the libraries' ones by
// library and category (BlockSections, as the Blocks tab).
import { useQuasar } from 'quasar';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import BlockSections from '@/components/BlockSections.vue';
import EppThumb from '@/components/EppThumb.vue';
import FullName from '@/components/FullName.vue';
import SlidePicker from '@/components/SlidePicker.vue';
import { useAuthor } from '@/composables/author';
import { lookupEpp, rosetteLocal } from '@/model/epp/expand';
import { place, type Poly } from '@/model/epp/geometry';
import { newRosette } from '@/model/epp/rosette-ops';
import { newShape } from '@/model/epp/shape-ops';
import { eppFile, importEpp, parseEppFile, serializeEpp } from '@/model/epp-file';
import { creditCopy } from '@/model/credits';
import { itemId } from '@/model/identity';
import { addEpp, blocksByLibrary, MY_LIBRARY } from '@/model/library';
import { eppUsed, isLibraryItem } from '@/model/library-items';
import { variationName } from '@/model/new-quilt';
import { DEFAULT_LICENSE } from '@/model/credits';
import { newId } from '@/model/ids';
import { is3d, newEppQuilt } from '@/model/epp/quilt-ops';
import { quiltThumbnail } from '@/render/thumbnail';
import { useEditorStore } from '@/stores/editor';
import type { EppShape, Rosette } from '@/model/schema/epp';
import { colorLookup } from '@/render/draw';
import { exportFile, pickFile } from '@/storage/files';
import { useLibraryStore } from '@/stores/library';
import { useProjectStore } from '@/stores/project';
import { useSettingsStore } from '@/stores/settings';
import { produce } from 'immer';

interface Card {
  id: string;
  name: string;
  kind: 'shape' | 'rosette';
  polys: { poly: Poly; fill?: string | undefined }[];
  mine: boolean;
  inProject: boolean;
  linked: boolean;
}

const project = useProjectStore();
const library = useLibraryStore();
const app = useSettingsStore();
const router = useRouter();
const editor = useEditorStore();
const askAuthor = useAuthor();
const $q = useQuasar();
const ro = computed(() => project.readOnly);
const filter = ref<'all' | 'shapes' | 'rosettes' | '3d'>('all');

const lookup = computed(() => lookupEpp(project.doc!.project, [], library.lookup));
const css = computed(() => {
  const paint = colorLookup(project.doc!, library.items.colors, undefined, library.items.fabrics);
  return (f: Parameters<typeof paint>[0]) => {
    const v = paint(f);
    return typeof v === 'string' ? v : undefined;
  };
});

function shapeCard(s: EppShape, inProject: boolean): Card {
  return {
    id: s.id,
    name: s.notecard.name,
    kind: 'shape',
    polys: [{ poly: place(s.outline, { at: [0, 0], turn: 0, scale: 1 }), fill: css.value(s.fill) }],
    mine: inProject && !isLibraryItem(s),
    inProject,
    linked: !!s.source?.derived,
  };
}
function rosetteCard(r: Rosette, inProject: boolean): Card {
  return {
    id: r.id,
    name: r.notecard.name,
    kind: 'rosette',
    polys: rosetteLocal(r, lookup.value).map((l) => ({ poly: l.poly, fill: css.value(l.fill) })),
    mine: inProject && !isLibraryItem(r),
    inProject,
    linked: !!r.source?.derived,
  };
}

/** Mine (own items, project order), then each library's in its category sections (spec 027
 *  FR-013, owner 2026-11-16: grouped as the Blocks tab's library blocks). A library item the project
 *  holds shows as the project's copy, marked used; one no library on this device has goes under
 *  Other libraries. */
const groups = computed(() => {
  const p = project.doc!.project;
  const f = filter.value;
  const kinds = (shapes: EppShape[], rosettes: Rosette[]): (EppShape | Rosette)[] => [
    ...(f === 'all' || f === 'shapes' ? shapes : []),
    ...(f === 'all' || f === 'rosettes' ? rosettes : []),
  ];
  const own = kinds(p.eppShapes ?? [], p.rosettes ?? []).filter((x) => !isLibraryItem(x));
  const have = new Set([...(p.eppShapes ?? []), ...(p.rosettes ?? [])].map((x) => x.id));
  const fromLibs = app.settings.hideLibraryBlocks
    ? []
    : [
        ...kinds(p.eppShapes ?? [], p.rosettes ?? []).filter(isLibraryItem),
        ...kinds(library.items.eppShapes, library.items.rosettes).filter((x) => !have.has(x.id)),
      ];
  const r = blocksByLibrary(library.views, fromLibs, 'category', undefined, (v) => [
    ...v.eppShapes,
    ...v.rosettes,
  ]);
  const one = (lib: string, label: string | undefined, xs: (EppShape | Rosette)[]) => ({
    lib,
    label,
    sections: [{ key: '', label: '', blocks: xs, count: xs.length }],
  });
  return [
    one('mine', undefined, own),
    ...r.groups.map((g) => ({
      lib: g.id,
      label: g.label,
      sections: g.sections,
    })),
    ...(r.other.length ? [one('other', 'Other libraries', r.other)] : []),
  ];
});
const cards = computed(() => {
  const p = project.doc!.project;
  const inProject = new Set([...(p.eppShapes ?? []), ...(p.rosettes ?? [])].map((x) => x.id));
  return new Map(
    groups.value
      .flatMap((g) => g.sections.flatMap((x) => x.blocks))
      .map((x) => [
        x.id,
        'outline' in x ? shapeCard(x, inProject.has(x.id)) : rosetteCard(x, inProject.has(x.id)),
      ]),
  );
});
/** The card for a listed item (none or one, for the sections' slot). */
const cardFor = (x: { id: string }) => {
  const c = cards.value.get(x.id);
  return c ? [c] : [];
};

const open = (c: Card) => void router.push(`/project/${c.kind}/${c.id}`);
const printItem = (c: Card) => void router.push(`/project/${c.kind}/${c.id}?print=1`);

async function newShapeItem() {
  const s = newShape('New shape', await askAuthor());
  project.change((d) => void (d.project.eppShapes ??= []).push(s));
  await router.push(`/project/shape/${s.id}`);
}
async function newRosetteItem() {
  const r = newRosette('New rosette', await askAuthor());
  project.change((d) => void (d.project.rosettes ??= []).push(r));
  await router.push(`/project/rosette/${r.id}`);
}

/** A copy (own item): new id, "(2)" name, earlier authors credited. */
async function copyOf<T extends EppShape | Rosette>(x: T, names: string[]): Promise<T> {
  const me = await askAuthor();
  return produce(x, (d) => {
    creditCopy(d, me);
    d.id = itemId(me);
    d.notecard.name = variationName(d.notecard.name, names);
    delete d.version;
    delete d.revision;
  });
}
async function duplicate(c: Card) {
  const p = project.doc!.project;
  if (c.kind === 'shape') {
    const s = p.eppShapes?.find((x) => x.id === c.id);
    if (!s) return;
    const copy = await copyOf(
      s,
      (p.eppShapes ?? []).map((x) => x.notecard.name),
    );
    project.change((d) => void (d.project.eppShapes ??= []).push(copy));
  } else {
    const r = p.rosettes?.find((x) => x.id === c.id);
    if (!r) return;
    const copy = await copyOf(
      r,
      (p.rosettes ?? []).map((x) => x.notecard.name),
    );
    project.change((d) => void (d.project.rosettes ??= []).push(copy));
  }
}
async function copyToProject(c: Card) {
  const p = project.doc!.project;
  if (c.kind === 'shape') {
    const s = lookup.value.shape(c.id) as EppShape | undefined;
    if (!s) return;
    const copy = await copyOf(
      s,
      (p.eppShapes ?? []).map((x) => x.notecard.name),
    );
    project.change((d) => void (d.project.eppShapes ??= []).push(copy));
    await router.push(`/project/shape/${copy.id}`);
  } else {
    const r = lookup.value.rosette(c.id);
    if (!r) return;
    const copy = await copyOf(
      r,
      (p.rosettes ?? []).map((x) => x.notecard.name),
    );
    project.change((d) => void (d.project.rosettes ??= []).push(copy));
    await router.push(`/project/rosette/${copy.id}`);
  }
}

function exportItem(c: Card) {
  const file = eppFile(
    project.doc!,
    c.id,
    {
      shape: (id) => library.lookup.eppShape?.(id),
      color: (id) => library.lookup.color(id),
      fabric: (id) => library.lookup.fabric?.(id),
    },
    import.meta.env.APP_VERSION,
  );
  if (file) void exportFile(c.name, serializeEpp(file), 'rrqepp');
}
async function importFile() {
  const f = await pickFile(['rrqepp']);
  if (!f) return;
  const r = parseEppFile(await f.text());
  if (!r.ok) return void $q.notify({ type: 'negative', message: r.error });
  const res = importEpp(project.doc!, r.file, app.settings.author);
  const name = r.file.item.data.notecard.name;
  if (res.doc === project.doc)
    return void $q.notify({ message: `"${name}" is already in this project.` });
  project.change(() => res.doc);
  $q.notify({ type: 'positive', message: `Imported "${name}".` });
}

async function toLibrary(c: Card) {
  const lib = library.ensureMine(await askAuthor());
  const r = await addEpp(lib, project.doc!, c.id);
  await library.saveMine(r.lib);
  project.change(() => r.doc);
  $q.notify({ type: 'positive', message: `Added "${c.name}" to ${MY_LIBRARY}.` });
}

// --- 3D designs (3D EPP quilts) ---
const designs = computed(() => project.doc!.project.quilts.filter(is3d));
function openDesign(id: string, mode: 'assembly' | 'print' = 'assembly') {
  const q = designs.value.find((x) => x.id === id);
  editor.mode = mode === 'assembly' && !q?.epp?.pieces.length ? 'design' : mode;
  void router.push(`/project/quilt/${id}`);
}
async function new3d() {
  const d = project.doc!;
  const author = await askAuthor();
  const name = variationName(
    '3D design',
    d.project.quilts.map((q) => q.notecard.name),
  );
  const q = {
    ...newEppQuilt(name, d.units, undefined, true),
    ...(author ? { author } : {}),
    license: d.project.license ?? DEFAULT_LICENSE,
  };
  project.change((x) => void x.project.quilts.push(q));
  openDesign(q.id, 'assembly');
}
function copyDesign(id: string) {
  const quilts = project.doc!.project.quilts;
  const q = quilts.find((x) => x.id === id);
  if (!q) return;
  const copy = { ...structuredClone(q), id: newId() };
  copy.notecard.name = variationName(
    q.notecard.name,
    quilts.map((x) => x.notecard.name),
  );
  project.change((d) => void d.project.quilts.splice(quilts.indexOf(q) + 1, 0, copy));
}
function deleteDesign(id: string) {
  const q = designs.value.find((x) => x.id === id);
  $q.dialog({
    title: `Delete "${q?.notecard.name}"?`,
    message: 'You can undo this.',
    cancel: true,
    ok: { label: 'Delete', color: 'negative', flat: true },
  }).onOk(() =>
    project.change((d) => void (d.project.quilts = d.project.quilts.filter((x) => x.id !== id))),
  );
}

function remove(c: Card) {
  const p = project.doc!.project;
  const used = eppUsed(p);
  if (used.shapes.has(c.id) || used.rosettes.has(c.id))
    return void $q.notify({
      message: `"${c.name}" is used in a rosette or quilt, so it can't be deleted.`,
    });
  project.change((d) => {
    if (c.kind === 'shape')
      d.project.eppShapes = (d.project.eppShapes ?? []).filter((x) => x.id !== c.id);
    else d.project.rosettes = (d.project.rosettes ?? []).filter((x) => x.id !== c.id);
  });
}
</script>

<style scoped>
.card {
  position: relative;
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 8px;
  padding: 8px;
  background: transparent;
  color: inherit;
  min-width: 0;
}
.card.add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  cursor: pointer;
}
.stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.stack .card.add {
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
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: inherit;
}
.menu-icon {
  min-width: 0;
  padding-right: 12px;
}
.designs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}
.thumb img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: contain;
}
.badge3d {
  position: absolute;
  top: 6px;
  right: 6px;
}
</style>
