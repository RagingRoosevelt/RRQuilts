<template>
  <!-- A settings subsection: a card that opens and closes, nested in its section. -->
  <q-card flat bordered class="settings-card">
    <q-expansion-item default-opened dense :label="label" header-class="text-subtitle2">
      <div class="q-px-md q-pb-md">
        <slot />
      </div>
    </q-expansion-item>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{ label: string }>();
</script>

<style scoped>
.settings-card {
  border-radius: 6px;
}
</style>
