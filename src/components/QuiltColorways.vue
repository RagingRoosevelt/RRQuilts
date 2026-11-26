<template>
  <!-- A quilt's colorways (palette swaps of its primary colorway), as a block's colorings: `badge` is the count on a
       card's thumbnail, its menu picks the colorway shown; `row` shows the quilt as shown, its
       colorway's name, and the badge; `panel` is the Design sidebar's section (pick, Rename, Delete,
       Save as new colorway, New colorway from palette…, also on the quilt card's menu). -->
  <q-expansion-item
    v-if="mode === 'panel'"
    default-opened
    dense
    label="Colorways"
    header-class="text-subtitle2"
  >
    <div class="column q-pb-md" style="gap: 8px">
      <div class="row" style="gap: 8px">
        <PreviewPick
          v-for="c in choices"
          :key="c.id ?? ''"
          :img="thumbOf(c.id, 72)"
          :name="c.name"
          :active="shown === c.id"
          :badge="c.id ? undefined : 'Primary'"
          :icon="modeOf(c.id)?.icon"
          :tip="modeOf(c.id)?.tip"
          :readonly="readonly"
          :deletable="choices.length > 1"
          @pick="show(c.id)"
          @rename="rename(c.id, c.name)"
          @remove="remove(c.id, c.name)"
        />
      </div>
      <div v-if="!readonly" class="row" style="gap: 8px">
        <q-btn dense outline no-caps icon="add" label="Save as new colorway" @click="make" />
        <!-- Spec 024: the same dialog as the quilt card's menu (Palette, Auto mapping or Re-color). -->
        <q-btn
          dense
          outline
          no-caps
          icon="palette"
          label="New colorway from palette…"
          @click="startSwapColorway(swapDialog, quilt)"
        />
      </div>
      <PaletteSwapDialog ref="swapDialog" />
      <div v-if="choices.length > 1" class="text-caption text-grey-7">
        The first is the primary colorway: paint it as usual. In the others, the Colors tab maps
        each of its colors to a replacement, or, with Re-color, you paint them as the primary.
      </div>
    </div>
  </q-expansion-item>
  <div v-else-if="mode === 'row'" class="row items-center no-wrap" style="gap: 10px">
    <div class="relative-position">
      <img :src="thumbOf(shown)" alt="" class="row-thumb" />
      <ColorwayCount />
    </div>
    <div class="col">
      <div class="text-caption text-grey-7">{{ shown ? 'Colorway' : 'Primary colorway' }}</div>
      <div>{{ choices.find((c) => c.id === shown)?.name }}</div>
    </div>
  </div>
  <ColorwayCount v-else />
</template>

<script setup lang="ts">
import { ClosePopup, QIcon, QMenu, useQuasar } from 'quasar';
import { computed, defineComponent, h, ref, withDirectives } from 'vue';
import { newId } from '@/model/ids';
import {
  addColorway,
  removeColorway,
  renameColorway,
  shownColorway,
  colorwayList,
} from '@/model/colorways';
import type { Quilt } from '@/model/schema/quilt';
import { quiltThumbnail } from '@/render/thumbnail';
import { useProjectStore } from '@/stores/project';
import PaletteSwapDialog from './PaletteSwapDialog.vue';
import PreviewPick from './PreviewPick.vue';
import { useColorwaySwap } from '@/composables/colorway-swap';

const swapDialog = ref<InstanceType<typeof PaletteSwapDialog>>();
const { startSwapColorway } = useColorwaySwap();
const props = withDefaults(
  defineProps<{ quilt: Quilt; mode?: 'row' | 'badge' | 'panel'; readonly?: boolean }>(),
  { mode: 'badge', readonly: false },
);
const $q = useQuasar();
const project = useProjectStore();

/** The quilt's own colors (no id), then each colorway. */
const choices = computed(() => colorwayList(props.quilt));
const shown = computed(() => shownColorway(props.quilt)?.id);
/** A colorway's mode on its picture's corner, as rosette colorings: Palette or Auto map (a
 *  re-color is painted, as the primary: none). */
function modeOf(id: string | undefined) {
  const v = id ? props.quilt.colorways?.find((x) => x.id === id) : undefined;
  if (!v || v.recolor) return undefined;
  return v.auto
    ? { icon: 'auto_awesome', tip: 'Auto map' }
    : { icon: 'swap_horiz', tip: 'Palette' };
}
const thumbOf = (id: string | undefined, px = 112) => {
  const q: Quilt = { ...props.quilt };
  if (id) q.shownColorway = id;
  else delete q.shownColorway;
  return quiltThumbnail(project.doc!, q, px, $q.dark.isActive, true);
};

function edit(fn: (q: Quilt) => Quilt) {
  if (props.readonly) return;
  project.change((d) => {
    const i = d.project.quilts.findIndex((x) => x.id === props.quilt.id);
    if (i >= 0) d.project.quilts[i] = fn(JSON.parse(JSON.stringify(d.project.quilts[i])) as Quilt);
  });
}
const show = (id: string | undefined) =>
  edit((q) => {
    if (id) q.shownColorway = id;
    else delete q.shownColorway;
    return q;
  });
/** A new colorway: a copy of the one shown. */
const make = () => edit((q) => addColorway(q, newId(), undefined, shownColorway(q)));
function rename(id: string | undefined, name: string) {
  $q.dialog({
    title: 'Rename the colorway',
    prompt: { model: name, type: 'text' },
    cancel: true,
  }).onOk((n: string) => n.trim() && edit((q) => renameColorway(q, id, n.trim())));
}
function remove(id: string | undefined, name: string) {
  $q.dialog({
    title: 'Delete the colorway?',
    message: `“${name}” and its colors go.`,
    cancel: true,
    ok: { label: 'Delete', color: 'negative', flat: true },
  }).onOk(() => edit((q) => removeColorway(q, id, project.doc!.project.blocks)));
}

/** The count, as on block cards (ColoringCount): its menu picks the colorway shown. */
const ColorwayCount = defineComponent(
  () => () =>
    choices.value.length < 2
      ? null
      : h(
          'span',
          {
            class: ['qv-count', { overlay: props.mode === 'badge' }],
            role: 'button',
            title: 'Choose colorway',
            onClick: (e: Event) => e.stopPropagation(),
          },
          [
            String(choices.value.length),
            h(QMenu, null, () =>
              h(
                'div',
                { class: 'row q-pa-sm', style: 'gap: 6px; max-width: 340px' },
                choices.value.map((c) =>
                  withDirectives(
                    h(
                      'button',
                      {
                        class: ['qv-pick', { active: shown.value === c.id }],
                        title: c.name,
                        onClick: () => show(c.id),
                      },
                      [
                        h('img', { src: thumbOf(c.id), alt: '' }),
                        c.id
                          ? modeOf(c.id) &&
                            h(
                              'span',
                              { class: 'qv-primary row items-center', title: modeOf(c.id)!.tip },
                              [h(QIcon, { name: modeOf(c.id)!.icon, size: '11px' })],
                            )
                          : h('span', { class: 'qv-primary' }, 'Primary'),
                        h('div', { class: 'qv-pick-name' }, c.name),
                      ],
                    ),
                    [[ClosePopup]],
                  ),
                ),
              ),
            ),
          ],
        ),
);
</script>

<style scoped>
.row-thumb {
  display: block;
  width: 56px;
  height: 56px;
  border-radius: 4px;
}
</style>

<style>
/* The count badge, as on block cards (ColoringCount); the menu is rendered in <body>, so these
   aren't scoped. */
.qv-count {
  position: absolute;
  right: -10px;
  bottom: -10px;
  isolation: isolate;
  min-width: 34px;
  padding: 8px 12px;
  border-radius: 17px;
  font-size: 11px;
  line-height: 18px;
  text-align: center;
  color: white;
  cursor: pointer;
  backdrop-filter: blur(3px);
  mask-image: radial-gradient(farthest-side, #000 70%, transparent);
}
.qv-count.overlay {
  right: -4px;
  bottom: -4px;
}
.qv-count::before {
  content: '';
  position: absolute;
  inset: 8px;
  z-index: -1;
  border-radius: 9px;
  background: var(--q-primary);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
}
</style>
