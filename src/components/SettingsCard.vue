<template>
  <!-- A settings subsection: a bordered card with its title set into the border; the title opens
       and closes it. -->
  <fieldset class="settings-card">
    <legend>
      <button type="button" class="title" :aria-expanded="open" @click="open = !open">
        {{ label }}
        <q-icon :name="open ? 'expand_less' : 'expand_more'" size="xs" />
      </button>
    </legend>
    <q-slide-transition>
      <div v-show="open">
        <slot />
      </div>
    </q-slide-transition>
  </fieldset>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{ label: string }>();
const open = ref(true);
</script>

<style scoped>
.settings-card {
  margin-left: 0;
  margin-right: 0;
  padding: 4px 16px 14px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  min-width: 0;
}
.settings-card legend {
  padding: 0 4px;
}
.title {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0 2px;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}
:global(.body--dark .settings-card) {
  border-color: rgba(255, 255, 255, 0.25);
}
</style>
