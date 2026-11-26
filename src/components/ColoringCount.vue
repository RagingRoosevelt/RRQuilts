<template>
  <!-- Several colorings (a block's, a rosette's) or colorways (a quilt's): the count on a card's
       picture; its menu shows each as a picture with its name (a quilt's with Primary or its mode)
       to choose the one shown. -->
  <span v-if="items.length > 1" class="count" role="button" :title="title" @click.stop
    >{{ items.length }}
    <q-menu>
      <div class="row q-pa-sm" style="gap: 6px; max-width: 340px">
        <PreviewPick
          v-for="(c, i) in items"
          :key="c.id ?? ''"
          v-close-popup
          :img="thumb(c.id)"
          :name="c.name ?? `Coloring ${i + 1}`"
          :active="c.id === active"
          :badge="c.badge"
          :icon="c.icon"
          :tip="c.tip"
          readonly
          @pick="emit('update:modelValue', c.id)"
        />
      </div> </q-menu
  ></span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import PreviewPick from '@/components/PreviewPick.vue';

/** A coloring or colorway (a quilt's primary has no id). Only a quilt's carry a badge or icon. */
export interface CountItem {
  id: string | undefined;
  name?: string | undefined;
  badge?: string | undefined;
  icon?: string | undefined;
  tip?: string | undefined;
}
const props = withDefaults(
  defineProps<{
    items: readonly CountItem[];
    /** The one shown (undefined: the first). */
    modelValue: string | undefined;
    /** A small picture of it. */
    thumb: (id: string | undefined) => string;
    title?: string;
  }>(),
  { title: 'Choose coloring' },
);
const emit = defineEmits<{ 'update:modelValue': [id: string | undefined] }>();
const active = computed(() => props.modelValue ?? props.items[0]?.id);
</script>

<style scoped>
.count {
  position: absolute;
  right: -4px;
  bottom: -4px;
  isolation: isolate;
  min-width: 34px;
  padding: 8px 12px;
  border-radius: 17px;
  font-size: 11px;
  line-height: 18px;
  text-align: center;
  color: white;
  cursor: pointer;
  /* The tap zone (bigger than the badge) softly blurs the picture behind it, fading out to its
     edge (the badge sits well inside the opaque middle of the mask). */
  backdrop-filter: blur(3px);
  mask-image: radial-gradient(farthest-side, #000 70%, transparent);
}
/* The badge itself, inside the tap zone. */
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
