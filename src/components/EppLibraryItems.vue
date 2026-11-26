<template>
  <!-- A block box, not a flex column: Firefox stretched the cards' grid rows to a two-column guess. -->
  <div>
    <!-- In category sections, as the library's blocks (BlockSections). -->
    <BlockSections :sections="sections" :lib="`epp:${view.doc.id}`" title="EPP shapes and rosettes">
      <template #default="{ block: x }">
        <div v-for="c in cardFor(x)" :key="c.id" class="card">
          <div class="relative-position">
            <button class="thumb" :aria-label="`Preview ${c.name}`" @click="preview(c)">
              <EppThumb :polys="c.polys" :size="0" />
            </button>
            <ColoringCount
              v-if="c.colorings"
              :items="c.colorings"
              :model-value="shown.get(c.id)"
              :thumb="c.thumb"
              @update:model-value="(id) => id && shown.set(c.id, id)"
            />
          </div>
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
            <FullName class="col" :name="c.name" />
            <q-btn flat round dense icon="more_vert" aria-label="Actions">
              <q-menu auto-close>
                <q-list dense style="min-width: 180px">
                  <q-item v-if="!mine" clickable @click="copyMine(c)">
                    <q-item-section avatar class="menu-icon"
                      ><q-icon name="content_copy"
                    /></q-item-section>
                    <q-item-section>Copy to {{ MY_LIBRARY }}</q-item-section>
                  </q-item>
                  <q-item v-if="mine" clickable @click="remove(c)">
                    <q-item-section avatar class="menu-icon"
                      ><q-icon name="delete" color="negative"
                    /></q-item-section>
                    <q-item-section class="text-negative"
                      >Delete from {{ MY_LIBRARY }}</q-item-section
                    >
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </div>
      </template>
    </BlockSections>

    <!-- Preview (as library blocks): the shape or rosette, and its 3D-printed templates (spec 027). -->
    <q-dialog :model-value="!!previewing" @update:model-value="previewing = null">
      <q-card v-if="previewing" class="preview column no-wrap">
        <DialogClose />
        <q-card-section class="q-pb-none">
          <div class="text-h6">{{ previewing.name }}</div>
          <div class="text-caption text-grey-7">
            {{ previewing.kind === 'rosette' ? 'Rosette' : 'EPP shape' }}
          </div>
        </q-card-section>
        <q-tabs v-model="previewTab" dense no-caps inline-label align="left" class="q-px-sm">
          <q-tab name="preview" icon="visibility" label="Preview" />
          <q-tab name="print3d" icon="view_in_ar" label="3D print" />
        </q-tabs>
        <q-separator />
        <div v-if="previewTab === 'preview'" class="q-pa-lg big">
          <EppThumb :polys="previewing.polys" :size="0" />
        </div>
        <template v-else>
          <!-- A rosette: a tab per shape it's made of. -->
          <q-tabs
            v-if="stl.items.length > 1"
            :model-value="stl.picked"
            dense
            no-caps
            outside-arrows
            mobile-arrows
            align="left"
            @update:model-value="stl.pick"
          >
            <q-tab v-for="(it, i) in stl.items" :key="it.key" :name="i" :label="it.label" />
          </q-tabs>
          <div class="row three col">
            <StlPreview :stl="stl" class="view" />
            <div class="side q-pa-md scroll">
              <StlOptions :stl="stl" hide-items />
            </div>
          </div>
        </template>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
// EPP shapes and rosettes of one library on the Libraries page (spec 027 FR-013). Pack items are
// read-only: copy them to My library to make them yours.
import { useQuasar } from 'quasar';
import { computed, reactive, ref } from 'vue';
import BlockSections from '@/components/BlockSections.vue';
import DialogClose from '@/components/DialogClose.vue';
import ColoringCount from '@/components/ColoringCount.vue';
import EppThumb from '@/components/EppThumb.vue';
import StlOptions from '@/components/StlOptions.vue';
import StlPreview from '@/components/StlPreview.vue';
import { useStl } from '@/composables/stl';
import FullName from '@/components/FullName.vue';
import { useAuthor } from '@/composables/author';
import { lookupEpp, rosetteLocal } from '@/model/epp/expand';
import { listOrder } from '@/model/epp/rosette-colorings';
import { eppSvg } from '@/render/epp-svg';
import { place } from '@/model/epp/geometry';
import { DEFAULT_LICENSE } from '@/model/credits';
import {
  blockSections,
  copyToMine,
  MY_LIBRARY,
  removeItem,
  type LibraryView,
} from '@/model/library';
import type { EppShape, Rosette } from '@/model/schema/epp';
import { useLibraryStore } from '@/stores/library';

const props = defineProps<{
  view: LibraryView;
  shapes: EppShape[];
  rosettes: Rosette[];
  mine: boolean;
}>();
const library = useLibraryStore();
const askAuthor = useAuthor();
const $q = useQuasar();

const css = (f: unknown) => {
  if (!f || typeof f !== 'object' || !('color' in f)) return undefined;
  const c = library.lookup.color((f as { color: string }).color);
  return c ? `rgb(${c.rgb.join(',')})` : undefined;
};
const lookup = computed(() =>
  lookupEpp({ eppShapes: props.view.eppShapes, rosettes: props.view.rosettes }, [], library.lookup),
);
/** The coloring each rosette card shows (this page). */
const shown = reactive(new Map<string, string>());
const cards = computed(() => [
  ...props.shapes.map((s) => ({
    id: s.id,
    name: s.notecard.name,
    kind: 'shape' as const,
    polys: [{ poly: place(s.outline, { at: [0, 0], turn: 0, scale: 1 }), fill: css(s.fill) }],
    colorings: undefined,
    thumb: undefined,
  })),
  ...props.rosettes.map((r) => {
    const polys = (id: string | undefined) =>
      rosetteLocal(r, lookup.value, id).map((l) => ({ poly: l.poly, fill: css(l.fill) }));
    return {
      id: r.id,
      name: r.notecard.name,
      kind: 'rosette' as const,
      polys: polys(shown.get(r.id)),
      // Several colorings: the count chooses the one the card shows.
      colorings: listOrder(r).map((c) => ({
        id: c.id,
        name: c.name ?? `Coloring ${r.colorings.indexOf(c) + 1}`,
      })),
      thumb: (id: string | undefined) => eppSvg(polys(id)),
    };
  }),
]);

type Card = (typeof cards.value)[number];
const byId = computed(() => new Map(cards.value.map((c) => [c.id, c])));
/** The card for a listed item (none or one, for the sections' slot). */
const cardFor = (x: { id: string }) => {
  const c = byId.value.get(x.id);
  return c ? [c] : [];
};
/** By category, as a project's EPP tab (the page's Group by is for blocks). */
const sections = computed(() =>
  blockSections(props.view.doc, [...props.shapes, ...props.rosettes], 'category'),
);
const previewing = ref<Card | null>(null);
const previewTab = ref<'preview' | 'print3d'>('preview');
function preview(c: Card) {
  previewing.value = c;
  previewTab.value = 'preview';
}
const stl = useStl(() =>
  previewing.value ? { kind: previewing.value.kind, id: previewing.value.id } : null,
);

async function copyMine(c: { id: string; name: string }) {
  const item = props.view.doc.items.find((i) => i.data.id === c.id);
  if (!item || (item.type !== 'epp-shape' && item.type !== 'rosette')) return;
  // What projects see (with its library attribution), so credits name the source.
  const data =
    item.type === 'epp-shape'
      ? props.view.eppShapes.find((s) => s.id === c.id)
      : props.view.rosettes.find((r) => r.id === c.id);
  if (!data) return;
  const author = await askAuthor();
  const lib = library.ensureMine(author);
  await library.saveMine(
    await copyToMine(lib, { ...item, data } as typeof item, author, DEFAULT_LICENSE),
  );
  $q.notify({ type: 'positive', message: `Copied “${c.name}” to ${MY_LIBRARY}.` });
}
function remove(c: { id: string; name: string }) {
  const lib = library.mine;
  if (!lib) return;
  $q.dialog({
    title: `Delete from ${MY_LIBRARY}?`,
    message: 'Projects that use it keep their copy.',
    cancel: true,
    ok: { label: 'Delete', color: 'negative', flat: true },
  }).onOk(() => void library.saveMine(removeItem(lib, c.id)));
}
</script>

<style scoped>
.card {
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 8px;
  padding: 8px;
  min-width: 0;
}
.menu-icon {
  min-width: 0;
  padding-right: 12px;
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
.preview {
  width: min(980px, 95vw);
  max-width: none;
  height: min(720px, 90vh);
}
.big {
  max-width: 420px;
  width: 100%;
  margin: 0 auto;
}
.three {
  min-height: 0;
}
.view {
  flex: 1 1 360px;
  min-height: 300px;
}
.side {
  flex: 0 1 300px;
  max-height: 100%;
}
</style>
