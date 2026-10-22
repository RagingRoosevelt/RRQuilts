<template>
  <!-- A month data block's variants (spec 025): its own drawing is the 31-day one; 30, 29 and
       28-day variants are drawn and numbered on their own. Picking one shows and edits it. -->
  <div class="row items-center no-wrap q-gutter-none" style="gap: 6px">
    <span class="text-caption">Variant</span>
    <q-btn-toggle
      :model-value="shown"
      :options="days.map((d) => ({ label: `${d} days`, value: d }))"
      dense
      no-caps
      unelevated
      toggle-color="primary"
      aria-label="Variant"
      @update:model-value="(d: number) => (editor.blockVariant = d === 31 ? null : d)"
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
            <q-item-section>{{ d }} days (a copy of the 31)</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
    <q-btn
      v-if="!readonly && shown !== 31"
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
import { newId } from '@/model/ids';
import type { DataVariant, SeamBlock } from '@/model/schema/block';
import { useEditorStore } from '@/stores/editor';
import { useProjectStore } from '@/stores/project';

const props = defineProps<{ block: SeamBlock; readonly?: boolean }>();
const editor = useEditorStore();
const project = useProjectStore();

const variants = computed(() => props.block.data?.variants ?? []);
const days = computed(() => [31, ...variants.value.map((v) => v.days).sort((a, b) => b - a)]);
const shown = computed(() =>
  variants.value.some((v) => v.days === editor.blockVariant) ? editor.blockVariant! : 31,
);
const missing = computed(() =>
  ([30, 29, 28] as const).filter((d) => !variants.value.some((v) => v.days === d)),
);

/** A new variant: the 31-day drawing copied with fresh ids, each patch keeping its fills. */
function add(d: 28 | 29 | 30) {
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
        const f = c.fills[p.id];
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
