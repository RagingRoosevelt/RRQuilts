<template>
  <div class="palette-tray column no-wrap" :class="{ sidebar }">
    <q-tabs
      v-if="!colorsOnly"
      v-model="tab"
      dense
      no-caps
      :align="sidebar ? 'justify' : 'left'"
      class="col-auto"
    >
      <q-tab name="blocks" label="Blocks" />
      <q-tab name="colors" label="Colors" />
    </q-tabs>

    <div v-if="tab === 'blocks'" class="strip q-pa-sm" style="gap: 8px">
      <div v-if="blockGroups.length === 1" class="text-caption text-grey-7 q-pa-xs">
        Pick library blocks in the project's Blocks tab.
      </div>
      <!-- Sidebar: each library in collapsible category sections; strip: one run per source. -->
      <template v-if="sidebar">
        <BlockSections
          v-for="g in blockSectionGroups"
          :key="g.lib"
          :sections="g.sections"
          :lib="g.lib"
          :title="g.label"
          compact
        >
          <template #default="{ block: b }">
            <button
              class="tile"
              :class="{ active: editor.block === b.id }"
              :title="b.notecard.name"
              @click="pickBlock(b.id)"
            >
              <img :src="thumb(b, editor.coloringOf.get(b.id))" :alt="b.notecard.name" />
              <q-badge
                v-if="b.colorVariant"
                class="variant"
                color="secondary"
                title="Color variant"
              >
                <q-icon name="palette" size="12px" />
              </q-badge>
              <!-- Blocks with several colorings: click the count to choose which one to set. -->
              <span
                v-if="b.colorings.length > 1"
                class="count"
                role="button"
                title="Choose coloring"
                @click.stop
                >{{ b.colorings.length }}
                <q-menu>
                  <div class="row q-pa-sm" style="gap: 6px; max-width: 320px">
                    <button
                      v-for="(c, i) in b.colorings"
                      :key="c.id"
                      v-close-popup
                      class="tile"
                      :class="{
                        active: (editor.coloringOf.get(b.id) ?? b.colorings[0]?.id) === c.id,
                      }"
                      :title="c.name ?? `Coloring ${i + 1}`"
                      @click="chooseColoring(b.id, c.id)"
                    >
                      <img :src="thumb(b, c.id)" :alt="c.name ?? ''" />
                    </button>
                  </div> </q-menu
              ></span>
            </button>
          </template>
        </BlockSections>
      </template>
      <template v-else>
        <template v-for="group in blockGroups" :key="group.label">
          <TraySection v-if="group.items.length" :label="group.label" kind="blocks">
            <button
              v-for="b in group.items"
              :key="b.id"
              class="tile"
              :class="{ active: editor.block === b.id }"
              :title="b.notecard.name"
              @click="pickBlock(b.id)"
            >
              <img :src="thumb(b, editor.coloringOf.get(b.id))" :alt="b.notecard.name" />
              <q-badge
                v-if="b.colorVariant"
                class="variant"
                color="secondary"
                title="Color variant"
              >
                <q-icon name="palette" size="12px" />
              </q-badge>
              <!-- Blocks with several colorings: click the count to choose which one to set. -->
              <span
                v-if="b.colorings.length > 1"
                class="count"
                role="button"
                title="Choose coloring"
                @click.stop
                >{{ b.colorings.length }}
                <q-menu>
                  <div class="row q-pa-sm" style="gap: 6px; max-width: 320px">
                    <button
                      v-for="(c, i) in b.colorings"
                      :key="c.id"
                      v-close-popup
                      class="tile"
                      :class="{
                        active: (editor.coloringOf.get(b.id) ?? b.colorings[0]?.id) === c.id,
                      }"
                      :title="c.name ?? `Coloring ${i + 1}`"
                      @click="chooseColoring(b.id, c.id)"
                    >
                      <img :src="thumb(b, c.id)" :alt="c.name ?? ''" />
                    </button>
                  </div> </q-menu
              ></span>
            </button>
          </TraySection>
        </template>
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
      <div v-if="sidebar" class="text-caption text-grey-7 q-px-xs" style="width: 100%">
        More library colors: tick their palettes in the project's Palettes tab.
      </div>
      <!-- Project colors, In use, then each library with its picked palettes (nested sections). -->
      <template v-for="node in colorTree" :key="node.label">
        <TraySection
          v-if="node.groups.some((g) => g.items.length)"
          :label="node.label"
          :kind="node.lib ? 'colorlib' : 'colors'"
        >
          <component
            :is="node.lib ? TraySection : 'span'"
            v-for="group in node.groups.filter((g) => g.items.length)"
            :key="group.label"
            v-bind="
              node.lib ? { label: group.label, kind: `colors:${node.lib}` } : { class: 'contents' }
            "
          >
            <button
              v-for="c in group.items"
              :key="c.id"
              class="swatch"
              :class="{ active: editor.color === c.id }"
              :style="{ background: `rgb(${c.rgb.join(',')})` }"
              :title="c.notecard.name"
              @click="pickColor(c.id)"
            >
              <q-menu v-if="!project.readOnly && !group.mine" touch-position context-menu>
                <q-list dense style="min-width: 140px">
                  <q-item v-close-popup clickable @click="editCopy(c)">
                    <q-item-section>Edit a copy…</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
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
          </component>
        </TraySection>
      </template>
    </div>
    <ColorEditor ref="editorDialog" @done="saveColor" />
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { QExpansionItem } from 'quasar';
import { computed, defineComponent, h, onMounted, ref } from 'vue';
import ColorEditor from '@/components/ColorEditor.vue';
import { colorInUse, colorsPainted, deleteColor } from '@/editor/colors';
import type { RGB } from '@/editor/color';
import { itemId } from '@/model/identity';
import { useSettingsStore } from '@/stores/settings';
import { blockThumbnail } from '@/render/thumbnail';
import { useEditorStore } from '@/stores/editor';
import { useLibraryStore } from '@/stores/library';
import { isLibraryItem, splitItems } from '@/model/library-items';
import { blockSections, libraryGroups } from '@/model/library';
import BlockSections from '@/components/BlockSections.vue';
import { creditCopy } from '@/model/credits';
import type { Color } from '@/model/schema/palette';
import { produce } from 'immer';
import type { Block } from '@/model/schema/block';
import { useProjectStore } from '@/stores/project';

const $q = useQuasar();
const project = useProjectStore();
const editor = useEditorStore();
const library = useLibraryStore();
const editorDialog = ref<InstanceType<typeof ColorEditor>>();
const editing = ref<string | null>(null);

/**
 * Block editor: colors only, and picking a color doesn't touch the quilt editor's tool.
 * `sidebar`: quilt editor Design sidebar — sources are accordion sections; open sections and the
 * tab are remembered app-wide.
 */
const props = withDefaults(defineProps<{ colorsOnly?: boolean; sidebar?: boolean }>(), {
  colorsOnly: false,
  sidebar: false,
});
const app = useSettingsStore();
const tab = computed({
  get: () =>
    props.colorsOnly || ['paint', 'spray', 'swap', 'eyedropper'].includes(editor.tool)
      ? 'colors'
      : 'blocks',
  set: (t: 'blocks' | 'colors') => {
    editor.tool = t === 'colors' ? 'paint' : 'set';
    if (props.sidebar) app.settings.trayTab = t;
  },
});
onMounted(() => {
  if (props.sidebar && !props.colorsOnly && tab.value !== app.settings.trayTab)
    tab.value = app.settings.trayTab;
});

/** A source of blocks or colors: a labelled run in the strip, an accordion in the sidebar. */
const TraySection = defineComponent({
  props: { label: { type: String, required: true }, kind: { type: String, required: true } },
  setup: (p, { slots }) => {
    const key = () => `tray:${p.kind}:${p.label}`;
    return () =>
      props.sidebar
        ? h(
            QExpansionItem,
            {
              dense: true,
              label: p.label,
              headerClass: 'text-subtitle2',
              modelValue: !app.settings.collapsedSections.includes(key()),
              'onUpdate:modelValue': (open: boolean) => {
                const rest = app.settings.collapsedSections.filter((l) => l !== key());
                app.settings.collapsedSections = open ? rest : [...rest, key()];
              },
            },
            () => h('div', { class: 'items' }, slots.default?.()),
          )
        : [h('span', { class: 'section' }, p.label), slots.default?.()];
  },
});
const doc = computed(() => project.doc!);
const blockGroups = computed(() => {
  const own = doc.value.project.blocks.filter((b) => !b.notecard.tags?.includes('system'));
  const { mine, library: lib } = splitItems(own, library.items.blocks);
  // Library blocks: the ones picked in the project's Blocks tab, and any already placed (embedded).
  const picked = new Set(doc.value.project.libraryBlocks ?? []);
  const embedded = new Set(own.filter(isLibraryItem).map((b) => b.id));
  const avail = lib.filter((b) => picked.has(b.id) || embedded.has(b.id));
  return [{ label: 'Mine', items: mine }, ...libraryGroups(avail, library.views, 'blocks')];
});
/** Sidebar: Mine, then each library's available blocks in category sections. */
const blockSectionGroups = computed(() => {
  const [mine, ...libs] = blockGroups.value;
  const avail = new Map(libs.flatMap((g) => g.items).map((b) => [b.id, b]));
  const seen = new Set<string>();
  const out = library.views.flatMap((v) => {
    const bs = v.blocks
      .filter((b) => avail.has(b.id) && !seen.has(b.id))
      .map((b) => avail.get(b.id)!);
    bs.forEach((b) => seen.add(b.id));
    return bs.length
      ? [
          {
            lib: `tray:${v.doc.id}`,
            label: v.doc.name,
            sections: blockSections(v.doc, bs, 'category'),
          },
        ]
      : [];
  });
  const flat = (lib: string, label: string, bs: Block[]) => ({
    lib,
    label,
    sections: [{ key: '', label: '', blocks: bs, count: bs.length }],
  });
  const other = [...avail.values()].filter((b) => !seen.has(b.id));
  return [
    ...(mine!.items.length ? [flat('tray:mine', 'Mine', mine!.items)] : []),
    ...out,
    ...(other.length ? [flat('tray:other', 'Other libraries', other)] : []),
  ];
});
/** Recently used colors first within each section. */
const recentFirst = <T extends { id: string }>(all: T[]) => [
  ...editor.recentColors.map((id) => all.find((c) => c.id === id)).filter((c) => !!c),
  ...all.filter((c) => !editor.recentColors.includes(c.id)),
];
const colorTree = computed(() => {
  const colors = doc.value.project.palette.colors;
  const { mine, library: lib } = splitItems(colors, library.items.colors);
  const byId = new Map(lib.map((c) => [c.id, c]));
  // Library colors: the palettes picked in the project's Palettes tab (labelled with their
  // library), then other library colors in use.
  const picked = new Set(doc.value.project.libraryPalettes ?? []);
  const shown = new Set<string>();
  const palettes = library.views.flatMap((v) =>
    v.collections
      .filter((c) => picked.has(c.id))
      .map((c) => {
        const items = c.colors.map((x) => byId.get(x.id) ?? x);
        items.forEach((x) => shown.add(x.id));
        return {
          lib: v.doc.id,
          libName: v.doc.name,
          label: c.notecard.name,
          items: recentFirst(items),
          mine: false,
        };
      }),
  );
  // Library colors outside the picked palettes are offered once painted or picked up with the
  // eyedropper; library blocks' own designer colors aren't offered by themselves.
  const painted = colorsPainted(doc.value);
  const used = [...new Set([...painted, ...editor.recentColors])]
    .filter((id) => !shown.has(id) && !mine.some((c) => c.id === id))
    .map((id) => colors.find((c) => c.id === id) ?? library.lookup.color(id))
    .filter((c): c is Color => !!c);
  const libs = [...new Set(palettes.map((p) => p.lib))].map((lib) => {
    const groups = palettes.filter((p) => p.lib === lib);
    return { lib, label: groups[0]!.libName, groups };
  });
  return [
    {
      lib: '',
      label: 'Project colors',
      groups: [{ label: '', items: recentFirst(mine), mine: true }],
    },
    { lib: '', label: 'In use', groups: [{ label: '', items: recentFirst(used), mine: false }] },
    ...libs,
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

/** Library colors are read-only: edit your copy (linked to My-library colors, so it can sync back). */
function editCopy(c: Color) {
  const me = useSettingsStore().settings.author;
  const copy = produce(c, (d) => {
    creditCopy(d, me, doc.value.project.license);
    d.id = itemId(me);
    delete d.version;
    delete d.revision;
  });
  project.change((d) => void d.project.palette.colors.push(copy));
  editor.useColor(copy.id);
  edit(copy.id);
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
.sidebar .strip {
  display: block;
  overflow: visible;
  padding: 0;
}
.contents {
  display: contents;
}
/* Palettes nested in their library's section: full rows; only their labels indent. */
.sidebar :deep(.items:has(> .q-expansion-item)) {
  padding: 0;
}
.sidebar :deep(.items > .q-expansion-item) {
  width: 100%;
}
.sidebar :deep(.items > .q-expansion-item > .q-expansion-item__container > .q-item) {
  padding-left: 28px;
}
.sidebar :deep(.items) {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 4px 4px 12px;
}
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
.variant {
  position: absolute;
  left: 2px;
  top: 2px;
  padding: 1px 3px;
}
/* Bigger tap target than the badge itself. */
.count::after {
  content: '';
  position: absolute;
  inset: -8px;
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
  cursor: pointer;
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
