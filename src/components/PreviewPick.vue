<template>
  <!-- A colorway or coloring to pick, as its picture with its name (a quilt's colorways, a
       rosette's colorings), Rename and Delete under it. -->
  <div class="column items-center">
    <button class="qv-pick big" :class="{ active }" @click="emit('pick')">
      <img :src="img" :alt="name" />
      <span v-if="badge || icon" class="qv-primary row items-center no-wrap">
        <q-icon v-if="icon" :name="icon" size="11px" />{{ badge }}
        <q-tooltip v-if="tip">{{ tip }}</q-tooltip>
      </span>
      <div class="qv-pick-name">{{ name }}</div>
    </button>
    <div v-if="!readonly" class="row no-wrap">
      <q-btn
        flat
        round
        dense
        size="sm"
        icon="edit"
        :aria-label="`Rename ${name}`"
        @click="emit('rename')"
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
        :disable="!deletable"
        :aria-label="`Delete ${name}`"
        @click="emit('remove')"
      >
        <q-tooltip>Delete</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  img: string;
  name: string;
  active: boolean;
  /** A label on the picture's corner ("Primary"), and/or an icon there, with a tooltip. */
  badge?: string | undefined;
  icon?: string | undefined;
  tip?: string | undefined;
  readonly?: boolean;
  deletable?: boolean;
}>();
const emit = defineEmits<{ pick: []; rename: []; remove: [] }>();
</script>

<style>
/* Also in ColoringCount's menu (rendered in <body>), so not scoped. */
.qv-pick {
  position: relative;
  width: 72px;
  padding: 2px;
  border: 2px solid transparent;
  border-radius: 6px;
  background: none;
  color: inherit;
  cursor: pointer;
  font-size: 11px;
}
/* "Primary" (or a mode icon) on the picture's corner. */
.qv-primary {
  position: absolute;
  top: 4px;
  left: 4px;
  gap: 2px;
  padding: 0 4px;
  border-radius: 3px;
  font-size: 9px;
  line-height: 14px;
  color: white;
  background: var(--q-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
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
