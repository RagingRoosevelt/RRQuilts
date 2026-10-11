<template>
  <div class="palette-tray column no-wrap">
    <q-tabs v-model="tab" dense no-caps align="left" class="col-auto">
      <q-tab name="blocks" label="Blocks" />
      <q-tab name="colors" label="Colors" />
    </q-tabs>

    <div v-if="tab === 'blocks'" class="row no-wrap scroll-x q-pa-sm q-gutter-sm">
      <button
        v-for="b in blocks"
        :key="b.id"
        class="tile"
        :class="{ active: editor.block === b.id }"
        :title="b.notecard.name"
        @click="pickBlock(b.id)"
      >
        <img :src="blockThumbnail(doc, b, 96, $q.dark.isActive)" :alt="b.notecard.name" />
      </button>
    </div>

    <div v-else class="row no-wrap scroll-x q-pa-sm q-gutter-xs items-center">
      <q-btn
        v-if="!project.readOnly"
        round
        dense
        flat
        icon="add"
        aria-label="Add color"
        @click="editorDialog?.show()"
      />
      <button
        v-for="c in colors"
        :key="c.id"
        class="swatch"
        :class="{ active: editor.color === c.id }"
        :style="{ background: `rgb(${c.rgb.join(',')})` }"
        :title="c.notecard.name"
        @click="pickColor(c.id)"
      >
        <q-menu v-if="!project.readOnly" touch-position context-menu>
          <q-list dense style="min-width: 140px">
            <q-item v-close-popup clickable @click="edit(c.id)">
              <q-item-section>Edit…</q-item-section>
            </q-item>
            <q-item v-close-popup clickable @click="remove(c.id)">
              <q-item-section class="text-negative">Delete</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </button>
    </div>
    <ColorEditor ref="editorDialog" @done="saveColor" />
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, ref } from 'vue';
import ColorEditor from '@/components/ColorEditor.vue';
import { colorInUse, deleteColor } from '@/editor/colors';
import type { RGB } from '@/editor/color';
import { newId } from '@/model/ids';
import { blockThumbnail } from '@/render/thumbnail';
import { useEditorStore } from '@/stores/editor';
import { useProjectStore } from '@/stores/project';

const $q = useQuasar();
const project = useProjectStore();
const editor = useEditorStore();
const editorDialog = ref<InstanceType<typeof ColorEditor>>();
const editing = ref<string | null>(null);

const tab = computed({
  get: () => (['paint', 'spray', 'swap', 'eyedropper'].includes(editor.tool) ? 'colors' : 'blocks'),
  set: (t) => (editor.tool = t === 'colors' ? 'paint' : 'set'),
});
const doc = computed(() => project.doc!);
const blocks = computed(() =>
  doc.value.project.blocks.filter((b) => !b.notecard.tags?.includes('system')),
);
const colors = computed(() => {
  const all = doc.value.project.palette.colors;
  const recent = editor.recentColors.map((id) => all.find((c) => c.id === id)).filter((c) => !!c);
  return [...recent, ...all.filter((c) => !editor.recentColors.includes(c.id))];
});

function pickBlock(id: string) {
  editor.block = id;
  if (editor.tool !== 'set') editor.tool = 'set';
}
function pickColor(id: string) {
  editor.useColor(id);
  if (!['paint', 'spray', 'swap'].includes(editor.tool)) editor.tool = 'paint';
}

function edit(id: string) {
  const c = doc.value.project.palette.colors.find((x) => x.id === id);
  if (!c) return;
  editing.value = id;
  editorDialog.value?.show({ name: c.notecard.name, rgb: [...c.rgb] as RGB });
}

function saveColor({ name, rgb }: { name: string; rgb: RGB }) {
  const id = editing.value;
  editing.value = null;
  project.change((d) => {
    const existing = id && d.project.palette.colors.find((c) => c.id === id);
    if (existing) {
      existing.notecard.name = name;
      existing.rgb = rgb;
    } else {
      const nid = newId();
      d.project.palette.colors.push({ id: nid, notecard: { name }, rgb });
      editor.useColor(nid);
    }
  });
}

function remove(id: string) {
  const go = () => project.change((d) => deleteColor(d, id));
  if (!colorInUse(doc.value, id)) return go();
  $q.dialog({
    title: 'Delete a color in use?',
    message: 'Patches using it will become unfilled.',
    cancel: true,
    ok: { label: 'Delete', color: 'negative', flat: true },
  }).onOk(go);
}
</script>

<style scoped>
.scroll-x {
  overflow-x: auto;
}
.tile,
.swatch {
  flex: none;
  border: 2px solid transparent;
  border-radius: 6px;
  padding: 0;
  cursor: pointer;
  background: none;
}
.tile img {
  display: block;
  width: 56px;
  height: 56px;
}
.swatch {
  width: 36px;
  height: 36px;
  border-color: rgba(0, 0, 0, 0.15);
}
.active {
  border-color: var(--q-primary);
  box-shadow: 0 0 0 2px var(--q-primary);
}
</style>
