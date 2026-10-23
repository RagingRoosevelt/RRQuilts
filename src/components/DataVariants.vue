<template>
  <!-- A data block's variants (spec 025): its own drawing is the 31-day one (a week block's the
       7-day one); a month block adds 30, 29, 28 and 1-day variants, a week block a 1-day one, each
       drawn and numbered on its own. Picking one shows and edits it. -->
  <div class="row items-center no-wrap q-gutter-none" style="gap: 6px">
    <span class="text-caption">Variant</span>
    <q-btn-toggle
      :model-value="shown"
      :options="days.map((d) => ({ label: d === 1 ? '1 day' : `${d} days`, value: d }))"
      dense
      no-caps
      unelevated
      toggle-color="primary"
      aria-label="Variant"
      @update:model-value="(d: number) => (editor.blockVariant = d === base ? null : d)"
    />
    <q-btn
      v-if="!readonly && missing.length"
      flat
      dense
      round
      size="sm"
      icon="add"
      aria-label="Add a variant"
    >
      <q-tooltip>Add a variant</q-tooltip>
      <q-menu>
        <q-list dense>
          <q-item v-for="d in missing" :key="d" v-close-popup clickable @click="add(d)">
            <q-item-section
              >{{ d === 1 ? '1 day' : `${d} days` }} (a copy of the {{ base }})</q-item-section
            >
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
    <!-- Kept in place (hidden) on the base drawing, so picking a variant doesn't squeeze the
         buttons into two-line labels. -->
    <q-btn
      v-if="!readonly"
      :style="shown === base ? 'visibility: hidden' : ''"
      flat
      dense
      round
      size="sm"
      icon="delete"
      :aria-label="`Remove the ${shown}-day variant`"
      @click="remove(shown)"
    >
      <q-tooltip>Remove this variant</q-tooltip>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { plainFill } from '@/model/coloring';
import { KIND_DAYS, VARIANT_DAYS } from '@/model/data-quilt';
import { newId } from '@/model/ids';
import type { DataVariant, SeamBlock } from '@/model/schema/block';
import { useEditorStore } from '@/stores/editor';
import { useProjectStore } from '@/stores/project';

const props = defineProps<{ block: SeamBlock; readonly?: boolean }>();
const editor = useEditorStore();
const project = useProjectStore();

const kind = computed(() => props.block.data?.kind ?? 'month');
/** The block's own drawing: 31 days (month) or 7 (week). */
const base = computed(() => KIND_DAYS[kind.value]);
const variants = computed(() => props.block.data?.variants ?? []);
const days = computed(() => [
  base.value,
  ...variants.value.map((v) => v.days).sort((a, b) => b - a),
]);
const shown = computed(() =>
  variants.value.some((v) => v.days === editor.blockVariant) ? editor.blockVariant! : base.value,
);
const missing = computed(() =>
  VARIANT_DAYS[kind.value].filter((d) => !variants.value.some((v) => v.days === d)),
);

/** A new variant: the block's own drawing copied with fresh ids, each patch keeping its color
 *  (no numerals). */
function add(d: 28 | 29 | 30 | 1) {
  const b = props.block;
  const id = new Map<string, string>();
  const fresh = (old: string) => {
    if (!id.has(old)) id.set(old, newId());
    return id.get(old)!;
  };
  const v: DataVariant = {
    days: d,
    drawing: {
      nodes: b.drawing.nodes.map((n) => ({ ...n, id: fresh(n.id) })),
      segments: b.drawing.segments.map((s) => ({
        ...s,
        id: fresh(s.id),
        from: fresh(s.from),
        to: fresh(s.to),
      })),
    },
    patches: b.patches.map((p) => ({ ...p, id: fresh(p.id) })),
  };
  project.change((doc) => {
    const db = doc.project.blocks.find((x) => x.id === b.id);
    if (db?.kind !== 'seam' || !db.data) return;
    db.data.variants = [...(db.data.variants ?? []), v];
    for (const c of db.colorings)
      for (const p of b.patches) {
        // Colors only: the new variant starts with no numerals (they're the other drawing's days).
        const f = plainFill(c.fills[p.id]);
        if (f) c.fills[id.get(p.id)!] = f;
      }
  });
  editor.blockVariant = d;
}

function remove(d: number) {
  const v = variants.value.find((x) => x.days === d);
  if (!v) return;
  const gone = new Set(v.patches.map((p) => p.id));
  project.change((doc) => {
    const db = doc.project.blocks.find((x) => x.id === props.block.id);
    if (!db?.data) return;
    const rest = (db.data.variants ?? []).filter((x) => x.days !== d);
    if (rest.length) db.data.variants = rest;
    else delete db.data.variants;
    for (const c of db.colorings) for (const k of gone) delete c.fills[k];
  });
  editor.blockVariant = null;
}
</script>
