<template>
  <div class="column" style="gap: 6px">
    <div class="text-subtitle2">EPP shapes and rosettes</div>
    <div class="cards">
      <div v-for="c in cards" :key="c.id" class="card column items-center">
        <EppThumb :polys="c.polys" :size="88" />
        <div class="text-caption ellipsis full-width text-center">{{ c.name }}</div>
        <div class="text-caption text-grey-7">{{ c.kind === 'shape' ? 'Shape' : 'Rosette' }}</div>
        <q-btn flat round dense size="sm" icon="more_vert" class="menu" aria-label="More">
          <q-menu auto-close>
            <q-list dense style="min-width: 180px">
              <q-item v-if="!mine" clickable @click="copyMine(c)">
                <q-item-section>Copy to {{ MY_LIBRARY }}</q-item-section>
              </q-item>
              <q-item v-if="mine" clickable @click="remove(c)">
                <q-item-section class="text-negative">Delete from {{ MY_LIBRARY }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
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
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}
.card {
  position: relative;
  padding: 8px;
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 8px;
  min-width: 0;
}
.menu {
  position: absolute;
  top: 2px;
  right: 2px;
}
</style>
