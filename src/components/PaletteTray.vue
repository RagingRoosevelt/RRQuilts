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

    <div v-if="tab === 'blocks' && noBlocks" class="q-pa-md text-caption text-grey-8">
      This quilt layout doesn't support blocks. Its pieces take colors and fabrics: use the Colors
      tab.
    </div>
    <div v-else-if="tab === 'blocks'" class="strip q-pa-sm" style="gap: 8px">
      <div v-if="blockGroups.length === 1" class="text-caption text-grey-7 q-pa-xs">
        Pick library blocks in the project's Blocks tab.
      </div>
      <!-- Sidebar: each library in collapsible category sections; strip: one run per source. -->
      <template v-if="sidebar">
        <!-- Only blocks this quilt's block spaces take (spec 035 C); off, all show. -->
        <q-toggle
          v-if="fitsQuilt"
          v-model="app.settings.compatibleBlocks"
          dense
          label="Compatible with this layout"
        />
        <BlockFilter v-model:shape="filterShape" hide-layout class="q-mb-sm" />
        <div
          v-if="!blockSectionGroups.length && (compatibleOnly || filterShape)"
          class="text-caption text-grey-7 q-pa-xs"
        >
          No blocks fit. Clear a filter to see more.
        </div>
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
              @click="pickBlock(b)"
            >
              <img :src="thumb(b, shown(b))" :alt="b.notecard.name" />
              <FavoriteBadge v-if="isFavorite(b)" small />
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
                v-if="offered(b).length > 1"
                class="count"
                role="button"
                title="Choose coloring"
                @click.stop
                >{{ offered(b).length }}
                <q-menu>
                  <div class="row q-pa-sm" style="gap: 6px; max-width: 320px">
                    <button
                      v-for="(c, i) in offered(b)"
                      :key="c.id"
                      v-close-popup
                      class="tile"
                      :class="{
                        active: shown(b) === c.id,
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
              @click="pickBlock(b)"
            >
              <img :src="thumb(b, shown(b))" :alt="b.notecard.name" />
              <FavoriteBadge v-if="isFavorite(b)" small />
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
                v-if="offered(b).length > 1"
                class="count"
                role="button"
                title="Choose coloring"
                @click.stop
                >{{ offered(b).length }}
                <q-menu>
                  <div class="row q-pa-sm" style="gap: 6px; max-width: 320px">
                    <button
                      v-for="(c, i) in offered(b)"
                      :key="c.id"
                      v-close-popup
                      class="tile"
                      :class="{
                        active: shown(b) === c.id,
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

    <!-- Colors: the slot's content instead when given (a quilt colorway's mapping). -->
    <slot v-else-if="$slots.colors" name="colors" />
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
      <q-btn
        v-if="!project.readOnly"
        round
        dense
        flat
        icon="add_photo_alternate"
        aria-label="Add fabric images"
        @click="importDialog?.show()"
      >
        <q-tooltip>Add fabric images</q-tooltip>
      </q-btn>
      <div v-if="sidebar" class="text-caption text-grey-7 q-px-xs" style="width: 100%">
        Add library palettes: tick their checkbox in the project's Palettes tab{{
          app.settings.hideLibraryPalettes ? ' (show them via Settings › Project)' : ''
        }}.
      </div>
      <!-- Project colors, In use, then each library with its picked palettes (nested sections). -->
      <template v-for="node in colorTree" :key="node.label">
        <TraySection
          v-if="node.groups.some((g) => g.items.length || g.fabrics.length)"
          :label="node.label"
          :kind="node.lib ? 'colorlib' : 'colors'"
        >
          <component
            :is="node.lib ? TraySection : 'span'"
            v-for="group in node.groups.filter((g) => g.items.length || g.fabrics.length)"
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
            <!-- Fabrics (spec 014): the print over its average color. -->
            <button
              v-for="f in group.fabrics"
              :key="f.id"
              class="swatch fabric"
              :class="{ active: editor.color === fabricPaint(f.id) }"
              :style="swatchStyle(f)"
              :title="f.notecard.name + (f.approximate ? ' (size ≈)' : '')"
              @click="pickColor(fabricPaint(f.id))"
            >
              <q-menu v-if="!project.readOnly && group.mine" touch-position context-menu>
                <q-list dense style="min-width: 140px">
                  <q-item v-close-popup clickable @click="removeFabric(f.id)">
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
    <FabricImportDialog ref="importDialog" :units="doc.units" @done="addFabrics" />
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { QExpansionItem } from 'quasar';
import { computed, defineComponent, h, onMounted, ref } from 'vue';
import ColorEditor from '@/components/ColorEditor.vue';
import FabricImportDialog from '@/components/FabricImportDialog.vue';
import { fabricPaint } from '@/editor/paint';
import { swatchStyle } from '@/render/fabric-images';
import { colorInUse, colorsPainted, deleteColor } from '@/editor/colors';
import type { RGB } from '@/editor/color';
import { itemId } from '@/model/identity';
import { useSettingsStore } from '@/stores/settings';
import { blockThumbnail } from '@/render/thumbnail';
import FavoriteBadge from '@/components/FavoriteBadge.vue';
import { FAVORITE, tagsFor, visibleTags } from '@/model/tags';
import { useEditorStore } from '@/stores/editor';
import { useLibraryStore } from '@/stores/library';
import { usePaletteOffer } from '@/composables/palette-offer';
import { fabricsIn, isLibraryItem, projectColorings, splitItems } from '@/model/library-items';
import { blocksByLibrary, libraryGroups } from '@/model/library';
import { projectPalettes } from '@/model/project-palettes';
import BlockSections from '@/components/BlockSections.vue';
import BlockFilter from '@/components/BlockFilter.vue';
import { blockFits, type ShapeFilter } from '@/render/layout-samples';
import { creditCopy } from '@/model/credits';
import type { Color, Fabric } from '@/model/schema/palette';
import { produce } from 'immer';
import type { Block } from '@/model/schema/block';
import { useProjectStore } from '@/stores/project';

const $q = useQuasar();
const project = useProjectStore();
const editor = useEditorStore();
const library = useLibraryStore();
/** Spec 029: tagged Favorite by the quilter (a library block's tag is kept in My library). */
const isFavorite = (b: Block) =>
  (isLibraryItem(b)
    ? tagsFor(b.notecard.tags, [b.id], library.kept)
    : visibleTags(b.notecard.tags)
  ).includes(FAVORITE);
const editorDialog = ref<InstanceType<typeof ColorEditor>>();
const importDialog = ref<InstanceType<typeof FabricImportDialog>>();
const editing = ref<string | null>(null);

/**
 * Block editor: colors only, and picking a color doesn't touch the quilt editor's tool.
 * `sidebar`: quilt editor Design sidebar — sources are accordion sections; open sections and the
 * tab are remembered app-wide.
 */
const props = withDefaults(
  defineProps<{
    colorsOnly?: boolean;
    sidebar?: boolean;
    /** The quilt has no spaces for blocks: Blocks says so, and it opens on Colors. */
    noBlocks?: boolean;
    /** Whether the quilt has a space that takes this block (its shape). */
    fitsQuilt?: (b: Block) => boolean;
  }>(),
  { colorsOnly: false, sidebar: false, noBlocks: false },
);
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
  // A quilt without block spaces opens on Colors (without changing the remembered tab).
  if (props.noBlocks) {
    if (tab.value === 'blocks') editor.tool = 'paint';
  } else if (props.sidebar && !props.colorsOnly && tab.value !== app.settings.trayTab)
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
const offerPalette = usePaletteOffer();
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
const filterShape = ref<ShapeFilter | null>(null);
const compatibleOnly = computed(() => !!props.fitsQuilt && app.settings.compatibleBlocks);
const fits = (b: Block) =>
  (!compatibleOnly.value || props.fitsQuilt!(b)) && blockFits(b.shape, null, filterShape.value);
const blockSectionGroups = computed(() => {
  const [all, ...libs] = blockGroups.value;
  const mine = { ...all!, items: all!.items.filter(fits) };
  const avail = new Map(libs.flatMap((g) => g.items.filter(fits)).map((b) => [b.id, b]));
  const r = blocksByLibrary(library.views, [...avail.values()]);
  const out = r.groups.map((g) => ({ lib: `tray:${g.id}`, label: g.label, sections: g.sections }));
  const flat = (lib: string, label: string, bs: Block[]) => ({
    lib,
    label,
    sections: [{ key: '', label: '', blocks: bs, count: bs.length }],
  });
  const other = r.other;
  return [
    ...(mine.items.length ? [flat('tray:mine', 'Mine', mine.items)] : []),
    ...out,
    ...(other.length ? [flat('tray:other', 'Other libraries', other)] : []),
  ];
});
/** Recently used colors first within each section when the setting asks; else palette order. */
const recentFirst = <T extends { id: string }>(all: T[]) =>
  app.settings.recentColorsFirst
    ? [
        ...editor.recentColors.map((id) => all.find((c) => c.id === id)).filter((c) => !!c),
        ...all.filter((c) => !editor.recentColors.includes(c.id)),
      ]
    : all;
const colorTree = computed(() => {
  const colors = doc.value.project.palette.colors;
  const { mine, library: lib } = splitItems(colors, library.items.colors);
  const byId = new Map(lib.map((c) => [c.id, c]));
  // Library colors: the palettes picked in the project's Palettes tab (labelled with their
  // library), then other library colors in use.
  const picked = new Set(doc.value.project.libraryPalettes ?? []);
  const shown = new Set<string>();
  const shownFabrics = new Set<string>();
  const palettes = library.views.flatMap((v) =>
    v.collections
      .filter((c) => picked.has(c.id))
      .map((c) => {
        const items = c.colors.map((x) => byId.get(x.id) ?? x);
        items.forEach((x) => shown.add(x.id));
        (c.fabrics ?? []).forEach((x) => shownFabrics.add(x.id));
        return {
          // A library's packs (spec 014) group together under the library's name.
          lib: v.doc.library?.id ?? v.doc.id,
          libName: v.doc.library?.name ?? v.doc.name,
          // Spec 029: a palette the quilter tagged Favorite shows its star.
          label: `${tagsFor(c.notecard.tags, [c.id], library.kept).includes(FAVORITE) ? '⭐ ' : ''}${c.notecard.name}`,
          items: recentFirst(items),
          fabrics: c.fabrics ?? [],
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
    // A library's packs (spec 014) alphabetically; a single library's palettes keep their order.
    if (library.views.some((v) => v.doc.library?.id === lib))
      groups.sort((a, b) => a.label.localeCompare(b.label));
    return { lib, label: groups[0]!.libName, groups };
  });
  // Fabrics: the project's own, then library fabrics painted here but not in a picked palette.
  const fabrics = doc.value.project.palette.fabrics;
  const usedFabrics = fabrics.filter((f) => isLibraryItem(f) && !shownFabrics.has(f.id));
  return [
    {
      // The project's own palettes (format v3), each a section like a library's palettes.
      lib: 'project',
      label: 'Project palettes',
      groups: projectPalettes(doc.value).map((pp) => ({
        label: `${visibleTags(pp.palette.notecard.tags).includes(FAVORITE) ? '⭐ ' : ''}${pp.palette.notecard.name}`,
        items: recentFirst(pp.colors),
        fabrics: pp.fabrics,
        mine: true,
      })),
    },
    {
      lib: '',
      label: 'In use',
      groups: [
        {
          label: '', // Off: by name, so picking a color doesn't move it.
          items: app.settings.recentColorsFirst
            ? recentFirst(used)
            : [...used].sort((a, b) => a.notecard.name.localeCompare(b.notecard.name)),
          fabrics: usedFabrics,
          mine: false,
        },
      ],
    },
    ...libs,
  ];
});
const thumb = (b: Block, coloringId?: string) =>
  blockThumbnail(doc.value, b, 96, $q.dark.isActive, coloringId, library.items.colors);

/** The colorings a block offers: a color variant only its project colorings (when it has any). */
function offered(b: Block) {
  const own = projectColorings(b, library.lookup)?.own;
  return own?.length ? own : b.colorings;
}
/** The coloring a block is set with: the one chosen if offered, else the first offered. */
function shown(b: Block) {
  const chosen = editor.coloringOf.get(b.id);
  const list = offered(b);
  return list.some((c) => c.id === chosen) ? chosen! : list[0]?.id;
}
function pickBlock(b: Block | string) {
  const block =
    typeof b === 'string'
      ? (doc.value.project.blocks.find((x) => x.id === b) ?? library.lookup.block(b))
      : b;
  const id = typeof b === 'string' ? b : b.id;
  // Placing uses the chosen coloring, so record the one shown (a variant's own, not its library's).
  const c = block && shown(block);
  if (c && editor.coloringOf.get(id) !== c) editor.coloringOf.set(id, c);
  editor.block = id;
  if (editor.tool !== 'set') editor.tool = 'set';
}
function chooseColoring(blockId: string, coloringId: string) {
  editor.coloringOf.set(blockId, coloringId);
  const b = doc.value.project.blocks.find((x) => x.id === blockId) ?? library.lookup.block(blockId);
  if (b) offerPalette(b, coloringId);
  pickBlock(blockId);
}
/** Imported fabric images join the project's palette (spec 014). */
function addFabrics(fabrics: Fabric[]) {
  project.change((d) => void d.project.palette.fabrics.push(...fabrics));
}
function removeFabric(id: string) {
  const used = fabricsIn([
    ...doc.value.project.blocks.flatMap((b) => b.colorings),
    ...doc.value.project.quilts.flatMap((q) => Object.values(q.colorings)),
  ]).includes(id);
  if (used) {
    $q.notify({ message: 'This fabric is painted in the project. Paint over it first.' });
    return;
  }
  project.change((d) => {
    d.project.palette.fabrics = d.project.palette.fabrics.filter((f) => f.id !== id);
  });
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
.count {
  position: absolute;
  right: -6px;
  bottom: -6px;
  isolation: isolate;
  min-width: 32px;
  padding: 8px 11px;
  border-radius: 16px;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  color: white;
  cursor: pointer;
  /* The tap zone (bigger than the badge) softly blurs the block behind it, fading out to its edge
     (the badge sits well inside the opaque middle of the mask). */
  backdrop-filter: blur(3px);
  mask-image: radial-gradient(farthest-side, #000 70%, transparent);
}
/* The badge itself, inside the tap zone. */
.count::before {
  content: '';
  position: absolute;
  inset: 8px;
  z-index: -1;
  border-radius: 8px;
  background: var(--q-primary);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
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
