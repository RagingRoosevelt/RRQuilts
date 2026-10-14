<template>
  <!-- A block with several colorings: the count; click it to choose which coloring is shown. A color
       variant offers only its project colorings. -->
  <span v-if="list.length > 1" class="count" role="button" title="Choose coloring" @click.stop
    >{{ list.length }}
    <q-menu>
      <div class="row q-pa-sm" style="gap: 6px; max-width: 320px">
        <button
          v-for="(c, i) in list"
          :key="c.id"
          v-close-popup
          class="pick-coloring"
          :class="{ active: (modelValue ?? block.colorings[0]?.id) === c.id }"
          :title="c.name ?? `Coloring ${i + 1}`"
          @click="emit('update:modelValue', c.id)"
        >
          <img :src="thumb(c.id)" :alt="c.name ?? ''" />
        </button>
      </div> </q-menu
  ></span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Block } from '@/model/schema/block';

const props = defineProps<{
  block: Block;
  /** The colorings to offer (default: all the block's). */
  colorings?: Block['colorings'] | undefined;
  /** The coloring shown (undefined: the block's first). */
  modelValue: string | undefined;
  /** A small thumbnail of the block in a coloring. */
  thumb: (coloringId: string) => string;
}>();
const emit = defineEmits<{ 'update:modelValue': [id: string] }>();
const list = computed(() => props.colorings ?? props.block.colorings);
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
  border-radius: 9px;
  background: var(--q-primary);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
}
.pick-coloring {
  padding: 0;
  border: 2px solid transparent;
  border-radius: 6px;
  background: none;
  cursor: pointer;
}
.pick-coloring.active {
  border-color: var(--q-primary);
}
.pick-coloring img {
  display: block;
  width: 56px;
  height: 56px;
}
</style>
