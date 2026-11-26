<template>
  <!-- A colorway or coloring to pick, as its picture with its name (a quilt's colorways, a
       rosette's colorings), Rename and Delete under it. -->
  <div class="qv-card column items-center">
    <button class="qv-pick big" :class="{ active }" @click="emit('pick')">
      <img :src="img" :alt="name" draggable="false" />
      <span v-if="badge || icon" class="qv-primary row items-center no-wrap">
        <q-icon v-if="icon" :name="icon" size="11px" />{{ badge }}
        <q-tooltip v-if="tip">{{ tip }}</q-tooltip>
      </span>
      <div class="qv-pick-name">{{ name }}</div>
    </button>
    <div v-if="!readonly" class="row no-wrap items-center">
      <!-- `movable`: drag the card, or this grip with the arrow keys, Home and End. -->
      <button
        v-if="movable"
        type="button"
        class="qv-grip"
        :data-grip="gripId"
        :aria-label="`Move ${name}: arrow keys, Home, End`"
        @keydown="emit('gripKey', $event)"
      >
        <q-icon name="drag_indicator" size="16px" />
      </button>
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
  /** Can be dragged into another place (the grip shows; `gripId` finds it again after a move). */
  movable?: boolean;
  gripId?: string | undefined;
}>();
const emit = defineEmits<{ pick: []; rename: []; remove: []; gripKey: [e: KeyboardEvent] }>();
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
/* Dragged into order (spec 037): no text selection; the card moved fades; the cards either side of
   where it lands glow on their facing edges. */
.qv-card {
  border-radius: 6px;
  user-select: none;
  -webkit-touch-callout: none;
}
.qv-card.dragged {
  opacity: 0.4;
}
.qv-card.glow-right {
  box-shadow:
    4px 0 0 -1px #1976d2,
    8px 0 10px -4px rgba(25, 118, 210, 0.9);
}
.qv-card.glow-left {
  box-shadow:
    -4px 0 0 -1px #1976d2,
    -8px 0 10px -4px rgba(25, 118, 210, 0.9);
}
.qv-grip {
  display: inline-flex;
  padding: 2px 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  opacity: 0.5;
  cursor: grab;
  touch-action: none; /* a finger on the grip drags at once instead of scrolling */
}
@media (pointer: coarse) {
  .qv-grip {
    padding: 6px 4px;
  }
}
.qv-grip:focus-visible {
  opacity: 1;
  outline: 2px solid var(--q-primary);
}
.qv-pick-name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
