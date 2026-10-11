<template>
  <div class="palette-tray column no-wrap">
    <q-tabs v-if="!colorsOnly" v-model="tab" dense no-caps align="left" class="col-auto">
      <q-tab name="blocks" label="Blocks" />
      <q-tab name="colors" label="Colors" />
    </q-tabs>

    <div v-if="tab === 'blocks'" class="strip q-pa-sm" style="gap: 8px">
      <template v-for="group in blockGroups" :key="group.label">
        <span v-if="group.items.length" class="section">{{ group.label }}</span>
        <button
          v-for="b in group.items"
          :key="b.id"
          class="tile"
          :class="{ active: editor.block === b.id }"
          :title="b.notecard.name"
          @click="pickBlock(b.id)"
        >
          <img :src="thumb(b, editor.coloringOf.get(b.id))" :alt="b.notecard.name" />
          <span v-if="b.colorings.length > 1" class="count">{{ b.colorings.length }}</span>
          <!-- Blocks with several colorings: right-click / long-press to choose which one to set. -->
          <q-menu v-if="b.colorings.length > 1" touch-position context-menu>
            <div class="row q-pa-sm" style="gap: 6px; max-width: 320px">
              <button
                v-for="(c, i) in b.colorings"
                :key="c.id"
                v-close-popup
                class="tile"
                :class="{ active: (editor.coloringOf.get(b.id) ?? b.colorings[0]?.id) === c.id }"
                :title="c.name ?? `Coloring ${i + 1}`"
                @click="chooseColoring(b.id, c.id)"
              >
                <img :src="thumb(b, c.id)" :alt="c.name ?? ''" />
              </button>
            </div>
          </q-menu>
        </button>
      </template>
    </div>

    <div v-else class="strip q-pa-sm" style="gap: 4px">
      <q-btn
        v-if="!project.readOnly"
        round
        dense
        flat
        icon="add"
        aria-label="Add color"
        @click="editorDialog?.show()"
      />
      <template v-for="group in colorGroups" :key="group.label">
        <span v-if="group.items.length" class="section">{{ group.label }}</span>
        <button
          v-for="c in group.items"
          :key="c.id"
          class="swatch"
          :class="{ active: editor.color === c.id }"
          :style="{ background: `rgb(${c.rgb.join(',')})` }"
          :title="c.notecard.name"
          @click="pickColor(c.id)"
        >
          <q-menu v-if="!project.readOnly && group.mine" touch-position context-menu>
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
      </template>
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
import { itemId } from '@/model/identity';
import { useSettingsStore } from '@/stores/settings';
import { blockThumbnail } from '@/render/thumbnail';
import { useEditorStore } from '@/stores/editor';
import { useLibraryStore } from '@/stores/library';
import { splitItems } from '@/model/library-items';
import type { Block } from '@/model/schema/block';
import { useProjectStore } from '@/stores/project';

const $q = useQuasar();
const project = useProjectStore();
const editor = useEditorStore();
const library = useLibraryStore();
const editorDialog = ref<InstanceType<typeof ColorEditor>>();
const editing = ref<string | null>(null);

/** Block editor: colors only, and picking a color doesn't touch the quilt editor's tool. */
const props = withDefaults(defineProps<{ colorsOnly?: boolean }>(), { colorsOnly: false });
const tab = computed({
  get: () =>
    props.colorsOnly || ['paint', 'spray', 'swap', 'eyedropper'].includes(editor.tool)
      ? 'colors'
      : 'blocks',
  set: (t) => (editor.tool = t === 'colors' ? 'paint' : 'set'),
});
const doc = computed(() => project.doc!);
const blockGroups = computed(() => {
  const own = doc.value.project.blocks.filter((b) => !b.notecard.tags?.includes('system'));
  const { mine, library: lib } = splitItems(own, library.items.blocks);
  return [
    { label: 'Mine', items: mine },
    { label: 'Library', items: lib },
  ];
});
/** Recently used colors first within each section. */
const recentFirst = <T extends { id: string }>(all: T[]) => [
  ...editor.recentColors.map((id) => all.find((c) => c.id === id)).filter((c) => !!c),
  ...all.filter((c) => !editor.recentColors.includes(c.id)),
];
const colorGroups = computed(() => {
  const { mine, library: lib } = splitItems(doc.value.project.palette.colors, library.items.colors);
  return [
    { label: 'Mine', items: recentFirst(mine), mine: true },
    { label: 'Library', items: recentFirst(lib), mine: false },
  ];
});
const thumb = (b: Block, coloringId?: string) =>
  blockThumbnail(doc.value, b, 96, $q.dark.isActive, coloringId, library.items.colors);

function pickBlock(id: string) {
  editor.block = id;
  if (editor.tool !== 'set') editor.tool = 'set';
}
function chooseColoring(blockId: string, coloringId: string) {
  editor.coloringOf.set(blockId, coloringId);
  pickBlock(blockId);
}
function pickColor(id: string) {
  editor.useColor(id);
  if (!props.colorsOnly && !['paint', 'spray', 'swap'].includes(editor.tool)) editor.tool = 'paint';
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
      const nid = itemId(useSettingsStore().settings.author);
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
.palette-tray {
  min-width: 0; /* let the strip scroll instead of widening the page */
  width: 100%;
}
.strip {
  min-width: 0;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  overflow-x: auto;
  overflow-y: hidden;
}
.section {
  flex: none;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: 11px;
  opacity: 0.7;
  padding-left: 4px;
  border-left: 1px solid rgba(128, 128, 128, 0.4);
}
.section:first-child {
  border-left: none;
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
.tile {
  position: relative;
}
.count {
  position: absolute;
  right: 2px;
  bottom: 2px;
  min-width: 16px;
  padding: 0 3px;
  border-radius: 8px;
  font-size: 10px;
  line-height: 16px;
  background: var(--q-primary);
  color: white;
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
