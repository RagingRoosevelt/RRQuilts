<template>
  <div class="column" style="gap: 6px">
    <div class="text-subtitle2">EPP shapes and rosettes</div>
    <div class="cards">
      <div v-for="c in cards" :key="c.id" class="card">
        <EppThumb :polys="c.polys" :size="0" />
        <div class="row items-center no-wrap">
          <q-icon v-if="c.kind === 'rosette'" name="hive" size="xs" color="grey-7" class="q-mr-xs">
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
    </div>
  </div>
</template>

<script setup lang="ts">
// EPP shapes and rosettes of one library on the Libraries page (spec 027 FR-013). Pack items are
// read-only: copy them to My library to make them yours.
import { useQuasar } from 'quasar';
import { computed } from 'vue';
import EppThumb from '@/components/EppThumb.vue';
import FullName from '@/components/FullName.vue';
import { useAuthor } from '@/composables/author';
import { lookupEpp, rosetteLocal } from '@/model/epp/expand';
import { place } from '@/model/epp/geometry';
import { DEFAULT_LICENSE } from '@/model/credits';
import { copyToMine, MY_LIBRARY, removeItem, type LibraryView } from '@/model/library';
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
const cards = computed(() => [
  ...props.shapes.map((s) => ({
    id: s.id,
    name: s.notecard.name,
    kind: 'shape' as const,
    polys: [{ poly: place(s.outline, { at: [0, 0], turn: 0, scale: 1 }), fill: css(s.fill) }],
  })),
  ...props.rosettes.map((r) => ({
    id: r.id,
    name: r.notecard.name,
    kind: 'rosette' as const,
    polys: rosetteLocal(r, lookup.value).map((l) => ({ poly: l.poly, fill: css(l.fill) })),
  })),
]);

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
/* As the block cards. */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  grid-auto-rows: max-content;
  align-items: start;
  gap: 16px;
}
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
</style>
