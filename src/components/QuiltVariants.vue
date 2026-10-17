<template>
  <!-- A quilt's color variants (palette swaps): the count badge, like a block's colorings; its menu
       shows each variant to pick, and makes, renames, or deletes them. `badge` sits on a card's
       thumbnail; `row` shows the quilt as it's shown, its variant's name, and the badge. -->
  <!-- `panel`: the Design sidebar's section, like a block's Colorings: every variant to pick, each
       with Rename and Delete, and Save as new variant (a copy of the one shown). -->
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
          <button
            class="qv-pick big"
            :class="{ active: (quilt.shownVariant ?? undefined) === c.id }"
            @click="show(c.id)"
          >
            <img :src="thumbOf(c.id, 72)" :alt="c.name" />
            <div class="qv-pick-name">{{ c.name }}</div>
          </button>
          <div v-if="!readonly && c.id" class="row no-wrap">
            <q-btn
              flat
              round
              dense
              size="sm"
              icon="edit"
              :aria-label="`Rename ${c.name}`"
              @click="rename(c.id)"
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
              :aria-label="`Delete ${c.name}`"
              @click="remove(c.id)"
            >
              <q-tooltip>Delete</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
      <div v-if="!readonly" class="row">
        <q-btn dense outline no-caps icon="add" label="Save as new variant" @click="make" />
      </div>
      <div class="text-caption text-grey-7">
        With a variant shown, painting swaps a color for another across the quilt.
      </div>
    </div>
  </q-expansion-item>
  <div v-else-if="mode === 'row'" class="row items-center no-wrap" style="gap: 10px">
    <div class="relative-position">
      <img :src="thumbOf(quilt.shownVariant)" alt="" class="row-thumb" />
      <span class="count" role="button" title="Color variants" @click.stop>
        {{ count }}
        <VariantMenu />
      </span>
    </div>
    <div class="col">
      <div class="text-caption text-grey-7">Colors</div>
      <div>{{ shownName }}</div>
    </div>
  </div>
  <span
    v-else-if="count > 1"
    class="count overlay"
    role="button"
    title="Color variants"
    @click.stop
  >
    {{ count }}
    <VariantMenu />
  </span>
</template>

<script setup lang="ts">
import { ClosePopup, QBtn, QMenu, useQuasar } from 'quasar';
import { computed, defineComponent, h, withDirectives } from 'vue';
import { newId } from '@/model/ids';
import { addVariant, removeVariant, renameVariant, shownVariant } from '@/model/quilt-variants';
import type { Quilt } from '@/model/schema/quilt';
import { quiltThumbnail } from '@/render/thumbnail';
import { useProjectStore } from '@/stores/project';

const props = withDefaults(
  defineProps<{ quilt: Quilt; mode?: 'row' | 'badge' | 'panel'; readonly?: boolean }>(),
  { mode: 'badge', readonly: false },
);
const $q = useQuasar();
const project = useProjectStore();

/** The quilt's own colors plus each variant. */
const count = computed(() => (props.quilt.variants?.length ?? 0) + 1);
const shownName = computed(() => shownVariant(props.quilt)?.name ?? 'Original colors');
/** The quilt's own colors, then each variant. */
const choices = computed((): { id: string | undefined; name: string }[] => [
  { id: undefined, name: 'Original colors' },
  ...(props.quilt.variants ?? []).map((v) => ({ id: v.id, name: v.name })),
]);
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
/** A new variant: a copy of the one shown (the quilt's own colors when none is). */
const make = () => edit((q) => addVariant(q, newId(), undefined, shownVariant(q)));
function rename(id = props.quilt.shownVariant) {
  const v = shownVariant(props.quilt, id);
  if (!v) return;
  $q.dialog({
    title: 'Rename the color variant',
    prompt: { model: v.name, type: 'text' },
    cancel: true,
  }).onOk((name: string) => name.trim() && edit((q) => renameVariant(q, v.id, name.trim())));
}
function remove(id = props.quilt.shownVariant) {
  const v = shownVariant(props.quilt, id);
  if (!v) return;
  $q.dialog({
    title: 'Delete the color variant?',
    message: `“${v.name}” and its color swaps go. The quilt's own colors stay.`,
    cancel: true,
    ok: { label: 'Delete', color: 'negative', flat: true },
  }).onOk(() => edit((q) => removeVariant(q, v.id)));
}

/** The badge's menu: each variant (the quilt's own colors first), then make, rename, delete. */
const VariantMenu = defineComponent(() => () => {
  const choices: { id: string | undefined; name: string }[] = [
    { id: undefined, name: 'Original colors' },
    ...(props.quilt.variants ?? []).map((v) => ({ id: v.id, name: v.name })),
  ];
  const tiles = choices.map((c) =>
    withDirectives(
      h(
        'button',
        {
          class: ['qv-pick', { active: (props.quilt.shownVariant ?? undefined) === c.id }],
          title: c.name,
          onClick: () => show(c.id),
        },
        [h('img', { src: thumbOf(c.id), alt: '' }), h('div', { class: 'qv-pick-name' }, c.name)],
      ),
      [[ClosePopup]],
    ),
  );
  const actions = props.readonly
    ? []
    : [
        withDirectives(
          h(QBtn, {
            flat: true,
            dense: true,
            noCaps: true,
            icon: 'add',
            label: 'New variant',
            onClick: make,
          }),
          [[ClosePopup]],
        ),
        ...(props.quilt.shownVariant
          ? [
              withDirectives(
                h(QBtn, {
                  flat: true,
                  dense: true,
                  noCaps: true,
                  label: 'Rename…',
                  onClick: () => rename(),
                }),
                [[ClosePopup]],
              ),
              withDirectives(
                h(QBtn, {
                  flat: true,
                  dense: true,
                  noCaps: true,
                  color: 'negative',
                  label: 'Delete',
                  onClick: () => remove(),
                }),
                [[ClosePopup]],
              ),
            ]
          : []),
      ];
  return h(QMenu, null, () =>
    h('div', { class: 'q-pa-sm', style: 'max-width: 340px' }, [
      h('div', { class: 'row', style: 'gap: 6px' }, tiles),
      actions.length ? h('div', { class: 'row q-mt-sm', style: 'gap: 4px' }, actions) : null,
      h(
        'div',
        { class: 'text-caption text-grey-7 q-mt-xs' },
        'With a variant shown, painting swaps a color for another across the quilt.',
      ),
    ]),
  );
});
</script>

<style scoped>
.row-thumb {
  display: block;
  width: 56px;
  height: 56px;
  border-radius: 4px;
}
/* The count badge, as on block cards (ColoringCount). */
.count {
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
.count.overlay {
  right: -4px;
  bottom: -4px;
}
.count::before {
  content: '';
  position: absolute;
  inset: 8px;
  z-index: -1;
  border-radius: 9px;
  background: var(--q-primary);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
}
</style>

<style>
/* The variants menu (rendered in <body>, so not scoped). */
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
