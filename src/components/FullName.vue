<template>
  <!-- One line, cut with "…"; hovering a cut name shows it in full. -->
  <div
    ref="el"
    class="ellipsis"
    @mouseenter="show = el!.scrollWidth > el!.clientWidth"
    @mouseleave="show = false"
  >
    {{ name }}
    <q-tooltip :model-value="show" no-parent-event>{{ name }}</q-tooltip>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{ name: string }>();
const el = ref<HTMLElement>();
const show = ref(false);
</script>
