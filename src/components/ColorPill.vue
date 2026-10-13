<template>
  <!-- A color as a pill: swatch, name, and (when editable) edit / delete buttons on hover. The
       default slot adds overlays on the swatch; no color makes it the "Add" tile. -->
  <component
    :is="clickable ? 'button' : 'div'"
    class="column items-center color-pick"
    :class="{ active }"
    style="width: 72px"
    :aria-label="color ? undefined : 'Add a color'"
    @click="clickable && emit('click')"
  >
    <div
      class="swatch relative-position"
      :class="{ 'add-swatch': !color }"
      :style="color ? { background: `rgb(${color.rgb.join(',')})` } : undefined"
    >
      <q-icon v-if="!color" name="add" size="sm" />
      <slot />
    </div>
    <div class="text-caption ellipsis full-width text-center">
      {{ color ? color.notecard.name : 'Add' }}
    </div>
    <template v-if="color && editable">
      <q-btn
        round
        dense
        size="xs"
        icon="edit"
        color="primary"
        class="edit-color"
        :aria-label="`Rename ${color.notecard.name}`"
        @click.stop="emit('edit')"
      >
        <q-tooltip>Rename / edit</q-tooltip>
      </q-btn>
      <q-btn
        round
        dense
        size="xs"
        icon="close"
        color="negative"
        class="remove-color"
        :aria-label="`Delete ${color.notecard.name}`"
        @click.stop="emit('remove')"
      >
        <q-tooltip>Delete</q-tooltip>
      </q-btn>
    </template>
  </component>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    color?: { notecard: { name: string }; rgb: readonly number[] } | undefined;
    editable?: boolean;
    clickable?: boolean;
    active?: boolean;
  }>(),
  { color: undefined, editable: false, clickable: false, active: false },
);
const emit = defineEmits<{ click: []; edit: []; remove: [] }>();
</script>

<style scoped>
.color-pick {
  position: relative;
  padding: 2px;
  border: 2px solid transparent;
  border-radius: 8px;
  background: none;
  color: inherit;
  cursor: pointer;
}
div.color-pick {
  cursor: default;
}
.color-pick.active {
  border-color: var(--q-primary);
}
.swatch {
  width: 56px;
  height: 56px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}
.add-swatch {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed rgba(128, 128, 128, 0.6);
}
.edit-color,
.remove-color {
  position: absolute;
  bottom: 4px;
  opacity: 0;
  transition: opacity 0.15s;
}
.edit-color {
  left: 4px;
}
.remove-color {
  right: 4px;
}
.color-pick:hover :is(.remove-color, .edit-color),
.color-pick:focus-within :is(.remove-color, .edit-color) {
  opacity: 1;
}
/* Overlays from the slot (e.g. a checkbox) can use these hover hooks too. */
.color-pick:hover :slotted(.on-hover),
.color-pick:focus-within :slotted(.on-hover),
:slotted(.on-hover.checked) {
  opacity: 1;
}
@media (hover: none) {
  .remove-color,
  .edit-color,
  :slotted(.on-hover) {
    opacity: 1;
  }
}
</style>
