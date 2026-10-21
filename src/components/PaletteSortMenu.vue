<template>
  <!-- A palette menu's "Sort by" (spec 032): how this palette's swatches show, on this device. -->
  <q-item clickable>
    <q-item-section>Sort by</q-item-section>
    <q-item-section side><q-icon name="keyboard_arrow_right" /></q-item-section>
    <q-menu anchor="top end" self="top start">
      <q-list dense style="min-width: 210px">
        <q-item
          v-for="k in SORT_KEYS"
          :key="k.value"
          v-close-popup
          clickable
          :active="(pref?.key ?? 'saved') === k.value"
          @click="setPref(id, { key: k.value, ...(pref?.reverse ? { reverse: true } : {}) })"
        >
          <q-item-section>{{ k.label }}</q-item-section>
        </q-item>
        <q-separator />
        <q-item
          v-close-popup
          clickable
          @click="
            setPref(id, { key: pref?.key ?? 'saved', ...(pref?.reverse ? {} : { reverse: true }) })
          "
        >
          <q-item-section avatar class="menu-icon">
            <q-icon :name="pref?.reverse ? 'check_box' : 'check_box_outline_blank'" />
          </q-item-section>
          <q-item-section>Reverse</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePaletteSort } from '@/composables/palette-sort';
import { SORT_KEYS } from '@/model/palette-sort';

const props = defineProps<{ id: string }>();
const { prefOf, setPref } = usePaletteSort();
const pref = computed(() => prefOf(props.id));
</script>
