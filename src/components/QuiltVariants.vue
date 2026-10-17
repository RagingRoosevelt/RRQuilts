<template>
  <!-- A quilt's color variants (palette swaps), as a block's colorings: `badge` is the count on a
       card's thumbnail, its menu picks the variant shown; `row` shows the quilt as shown, its
       variant's name, and the badge; `panel` is the Design sidebar's section (pick, Rename, Delete,
       Save as new variant). New variants from a palette swap: the quilt card's menu. -->
  <q-expansion-item
    v-if="mode === 'panel'"
    default-opened
    dense
    label="Color variants"
    header-class="text-subtitle2"
  >
    <div class="column q-pb-md" style="gap: 8px">
      <div class="row" style="gap: 8px">
        <div v-for="c in choices" :key="c.id ?? ''" class="column items-center">
          <button class="qv-pick big" :class="{ active: shown === c.id }" @click="show(c.id)">
            <img :src="thumbOf(c.id, 72)" :alt="c.name" />
            <div class="qv-pick-name">{{ c.name }}</div>
          </button>
          <div v-if="!readonly" class="row no-wrap">
            <q-btn
              flat
              round
              dense
              size="sm"
              icon="edit"
              :aria-label="`Rename ${c.name}`"
              @click="rename(c.id, c.name)"
            >
              <q-tooltip>Rename</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              size="sm"
              icon="delete"
              color="negative"
              :disable="choices.length < 2"
              :aria-label="`Delete ${c.name}`"
              @click="remove(c.id, c.name)"
            >
              <q-tooltip>Delete</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
      <div v-if="!readonly" class="row">
        <q-btn dense outline no-caps icon="add" label="Save as new variant" @click="make" />
      </div>
      <div v-if="choices.length > 1" class="text-caption text-grey-7">
        In every variant but the first, painting a piece recolors every piece of that color, in that
        variant only.
      </div>
    </div>
  </q-expansion-item>
  <div v-else-if="mode === 'row'" class="row items-center no-wrap" style="gap: 10px">
    <div class="relative-position">
      <img :src="thumbOf(shown)" alt="" class="row-thumb" />
      <VariantCount />
    </div>
    <div class="col">
      <div class="text-caption text-grey-7">Color variant</div>
      <div>{{ choices.find((c) => c.id === shown)?.name }}</div>
    </div>
  </div>
  <VariantCount v-else />
</template>

<script setup lang="ts">
import { ClosePopup, QMenu, useQuasar } from 'quasar';
import { computed, defineComponent, h, withDirectives } from 'vue';
import { newId } from '@/model/ids';
import {
  addVariant,
  removeVariant,
  renameVariant,
  shownVariant,
  variantList,
} from '@/model/quilt-variants';
import type { Quilt } from '@/model/schema/quilt';
import { quiltThumbnail } from '@/render/thumbnail';
import { useProjectStore } from '@/stores/project';

const props = withDefaults(
  defineProps<{ quilt: Quilt; mode?: 'row' | 'badge' | 'panel'; readonly?: boolean }>(),
  { mode: 'badge', readonly: false },
);
const $q = useQuasar();
const project = useProjectStore();

/** The quilt's own colors (no id), then each variant. */
const choices = computed(() => variantList(props.quilt));
const shown = computed(() => shownVariant(props.quilt)?.id);
const thumbOf = (id: string | undefined, px = 112) => {
  const q: Quilt = { ...props.quilt };
  if (id) q.shownVariant = id;
  else delete q.shownVariant;
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
    if (id) q.shownVariant = id;
    else delete q.shownVariant;
    return q;
  });
/** A new variant: a copy of the one shown. */
const make = () => edit((q) => addVariant(q, newId(), undefined, shownVariant(q)));
function rename(id: string | undefined, name: string) {
  $q.dialog({
    title: 'Rename the color variant',
    prompt: { model: name, type: 'text' },
    cancel: true,
  }).onOk((n: string) => n.trim() && edit((q) => renameVariant(q, id, n.trim())));
}
function remove(id: string | undefined, name: string) {
  $q.dialog({
    title: 'Delete the color variant?',
    message: `“${name}” and its colors go.`,
    cancel: true,
    ok: { label: 'Delete', color: 'negative', flat: true },
  }).onOk(() => edit((q) => removeVariant(q, id, project.doc!.project.blocks)));
}

/** The count, as on block cards (ColoringCount): its menu picks the variant shown. */
const VariantCount = defineComponent(
  () => () =>
    choices.value.length < 2
      ? null
      : h(
          'span',
          {
            class: ['qv-count', { overlay: props.mode === 'badge' }],
            role: 'button',
            title: 'Choose color variant',
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
.qv-pick {
  width: 72px;
  padding: 2px;
  border: 2px solid transparent;
  border-radius: 6px;
  background: none;
  color: inherit;
  cursor: pointer;
  font-size: 11px;
}
.qv-pick.active {
  border-color: var(--q-primary);
}
.qv-pick.big {
  width: 80px;
}
.qv-pick img {
  display: block;
  width: 64px;
  height: 64px;
}
.qv-pick.big img {
  width: 72px;
  height: 72px;
}
.qv-pick-name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
