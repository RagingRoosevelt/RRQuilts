<template>
  <!-- A palette's colors and fabrics: one shown large (swipe or arrows), and all of them below to
       pick from. Used by the Libraries page and the project's Palettes tab. -->
  <!-- Editable with images: dropping image files anywhere on it adds them as fabrics. -->
  <div
    class="palette-preview"
    :class="{ 'drop-target': dropping }"
    @dragover.prevent="dropping = !!(editable && images)"
    @dragleave="dropping = false"
    @drop.prevent="onDrop"
  >
    <template v-if="swatches.length">
      <q-carousel
        :model-value="at"
        @update:model-value="(i: string | number) => emit('update:at', Number(i))"
        animated
        swipeable
        arrows
        infinite
        height="min(80vw, 512px)"
        control-type="unelevated"
        control-color="white"
        control-text-color="grey-9"
      >
        <q-carousel-slide
          v-for="(x, i) in swatches"
          :key="x.item.id"
          :name="i"
          class="q-pa-none"
          :style="x.kind === 'fabric' ? bigFabric(x.item) : { background: css(x.item) }"
        />
      </q-carousel>
      <q-card-section class="row items-center no-wrap q-py-sm" style="gap: 8px">
        <div class="col" style="min-width: 0">
          <div class="text-subtitle1 ellipsis">{{ shownSwatch!.item.notecard.name }}</div>
          <div class="text-caption text-grey-7 ellipsis">{{ swatchInfo(shownSwatch!) }}</div>
        </div>
        <template v-if="editable && (shownSwatch!.kind === 'color' || images)">
          <q-btn
            v-if="shownSwatch!.kind === 'color'"
            flat
            round
            dense
            icon="edit"
            aria-label="Edit color"
            @click="emit('edit', at)"
          />
          <q-btn
            flat
            round
            dense
            icon="delete"
            :aria-label="shownSwatch!.kind === 'color' ? 'Remove color' : 'Remove fabric'"
            @click="emit('remove', at)"
          />
        </template>
      </q-card-section>
    </template>
    <div class="swatch-strip q-px-md q-pb-md">
      <button v-if="editable" class="swatch-pick add" aria-label="Add a color" @click="emit('add')">
        <q-icon name="add" />
        <q-tooltip>Add a color</q-tooltip>
      </button>
      <button
        v-if="editable && images"
        class="swatch-pick add"
        aria-label="Add fabric images"
        @click="emit('addImages')"
      >
        <q-icon name="add_photo_alternate" />
        <q-tooltip>Add fabric images</q-tooltip>
      </button>
      <button
        v-for="(x, i) in swatches"
        :key="x.item.id"
        :ref="
          (el) =>
            i === at &&
            el &&
            (el as HTMLElement).scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
        "
        class="swatch-pick"
        :class="{ active: i === at }"
        :title="x.item.notecard.name"
        :style="x.kind === 'fabric' ? swatchStyle(x.item) : { background: css(x.item) }"
        @click="emit('update:at', i)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { roundLen } from '@/model/units';
import type { ColorCollection } from '@/model/schema/library';
import type { Color, Fabric } from '@/model/schema/palette';
import { display, swatchStyle } from '@/render/fabric-images';

const props = defineProps<{
  palette: Pick<ColorCollection, 'colors' | 'fabrics'>;
  /** Which color or fabric is shown large (colors first, then fabrics). */
  at: number;
  /** Colors can be added, edited and removed (My library). */
  editable?: boolean;
  /** Fabric images can be added and removed too (project palettes). */
  images?: boolean;
}>();
const emit = defineEmits<{
  'update:at': [i: number];
  add: [];
  edit: [i: number];
  remove: [i: number];
  addImages: [];
  dropFiles: [files: File[]];
}>();

type Swatch = { kind: 'color'; item: Color } | { kind: 'fabric'; item: Fabric };
const swatches = computed((): Swatch[] => [
  ...props.palette.colors.map((item) => ({ kind: 'color' as const, item })),
  ...(props.palette.fabrics ?? []).map((item) => ({ kind: 'fabric' as const, item })),
]);
watch(swatches, (l) => {
  if (props.at > l.length - 1) emit('update:at', Math.max(0, l.length - 1));
});
const dropping = ref(false);
function onDrop(e: DragEvent) {
  dropping.value = false;
  const files = [...(e.dataTransfer?.files ?? [])];
  if (props.editable && props.images && files.length) emit('dropFiles', files);
}
const shownSwatch = computed(() => swatches.value[props.at] ?? swatches.value[0]);
const css = (c: Color) => `rgb(${c.rgb.join(',')})`;
/** A fabric in the large view: its whole image, fitted (its average color until it loads). */
function bigFabric(f: Fabric) {
  const st = swatchStyle(f, display.size); // the screen-size setting: 512 looks sharper here
  return 'backgroundImage' in st
    ? {
        ...st,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundColor: 'transparent',
      }
    : st;
}
const hex = (rgb: readonly number[]) =>
  '#' +
  rgb
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
function swatchInfo(x: Swatch) {
  if (x.kind === 'color')
    return [x.item.notecard.reference, hex(x.item.rgb)].filter(Boolean).join(' · ');
  const f = x.item;
  const size = `${f.approximate ? '≈ ' : ''}${f.size.map((n) => roundLen(n, 'in')).join(' × ')} in`;
  return [f.notecard.reference ?? f.sku, size].filter(Boolean).join(' · ');
}
</script>

<style scoped>
.drop-target {
  outline: 2px dashed var(--q-primary);
  outline-offset: -4px;
}
/* Up to three rows of swatches; more scroll. */
.swatch-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: calc(3 * 50px + 8px);
  overflow-y: auto;
  scrollbar-width: thin;
  padding-top: 4px;
}
.swatch-pick {
  flex: none;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 2px solid rgba(128, 128, 128, 0.4);
  border-radius: 6px;
  cursor: pointer;
  color: inherit;
  background: transparent;
}
.swatch-pick.active {
  border-color: var(--q-primary);
  box-shadow: 0 0 0 2px var(--q-primary);
}
.swatch-pick.add {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
