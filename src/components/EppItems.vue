<template>
  <div class="column" style="gap: 12px">
    <SlidePicker
      v-model="filter"
      style="max-width: 320px"
      :options="[
        { value: 'all', label: 'All' },
        { value: 'shapes', label: 'Shapes' },
        { value: 'rosettes', label: 'Rosettes' },
      ]"
    />
    <template v-for="(g, k) in groups" :key="g.label">
      <div class="text-subtitle2">{{ g.label }}</div>
      <div class="cards">
        <div v-if="k === 0 && !ro" class="stack">
          <button class="card add" @click="newShapeItem">
            <q-icon name="add" size="md" />
            <div>New shape</div>
          </button>
          <button class="card add" @click="newRosetteItem">
            <q-icon name="hive" size="md" />
            <div>New rosette</div>
          </button>
          <button class="card add" @click="importFile">
            <q-icon name="upload_file" size="md" />
            <div>Import<br /><span class="text-caption">.rrqepp</span></div>
          </button>
        </div>
        <div v-for="c in g.cards" :key="c.id" class="card">
          <button class="thumb" :aria-label="`Open ${c.name}`" @click="open(c)">
            <EppThumb :polys="c.polys" :size="0" />
          </button>
          <div class="row items-center no-wrap">
            <FullName class="col" :name="c.name" />
            <q-btn flat round dense icon="more_vert" aria-label="Actions">
              <q-menu auto-close>
                <q-list dense style="min-width: 180px">
                  <q-item clickable @click="open(c)">
                    <q-item-section avatar class="menu-icon"><q-icon name="edit" /></q-item-section>
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
          <div class="text-caption text-grey-7">{{ c.kind === 'shape' ? 'Shape' : 'Rosette' }}</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
// The project's EPP tab (spec 027 FR-013): its shapes and rosettes, and the libraries' ones.
import { useQuasar } from 'quasar';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
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
import { addEpp, MY_LIBRARY } from '@/model/library';
import { eppUsed, isLibraryItem } from '@/model/library-items';
import { variationName } from '@/model/new-quilt';
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
const askAuthor = useAuthor();
const $q = useQuasar();
const ro = computed(() => project.readOnly);
const filter = ref<'all' | 'shapes' | 'rosettes'>('all');

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

const groups = computed(() => {
  const p = project.doc!.project;
  const shapes = filter.value !== 'rosettes';
  const rosettes = filter.value !== 'shapes';
  const own = [
    ...(shapes
      ? (p.eppShapes ?? []).filter((s) => !isLibraryItem(s)).map((s) => shapeCard(s, true))
      : []),
    ...(rosettes
      ? (p.rosettes ?? []).filter((r) => !isLibraryItem(r)).map((r) => rosetteCard(r, true))
      : []),
  ];
  const have = new Set([...(p.eppShapes ?? []), ...(p.rosettes ?? [])].map((x) => x.id));
  const used = [
    ...(shapes ? (p.eppShapes ?? []).filter(isLibraryItem).map((s) => shapeCard(s, true)) : []),
    ...(rosettes ? (p.rosettes ?? []).filter(isLibraryItem).map((r) => rosetteCard(r, true)) : []),
  ];
  const libs = app.settings.hideLibraryBlocks
    ? []
    : [
        ...(shapes
          ? library.items.eppShapes.filter((s) => !have.has(s.id)).map((s) => shapeCard(s, false))
          : []),
        ...(rosettes
          ? library.items.rosettes.filter((r) => !have.has(r.id)).map((r) => rosetteCard(r, false))
          : []),
      ];
  return [
    { label: 'Mine', cards: own },
    { label: 'From libraries, used here', cards: used },
    { label: 'Libraries', cards: libs },
  ].filter((g, i) => i === 0 || g.cards.length);
});

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
/* As the project's quilt and block cards (SketchbookPage). */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  grid-auto-rows: max-content;
  align-items: start;
  gap: 16px;
}
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
  flex-direction: column;
  gap: 8px;
  /* The same height with or without cards beside it (a card's height), not stretched by its row. */
  align-self: start;
  height: 204px;
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
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: inherit;
}
.menu-icon {
  min-width: 0;
  padding-right: 12px;
}
</style>
