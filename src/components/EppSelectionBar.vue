<template>
  <div class="sel-bar row no-wrap items-center q-px-xs" style="gap: 2px">
    <span class="text-caption q-px-xs text-no-wrap">{{ label }}</span>
    <q-btn flat dense round icon="select_all" aria-label="Select">
      <q-tooltip>Select all or the same</q-tooltip>
      <q-menu auto-close>
        <q-list dense style="min-width: 180px">
          <q-item clickable @click="emit('all')">
            <q-item-section>Select all</q-item-section>
            <q-item-section side class="text-caption">Ctrl+A</q-item-section>
          </q-item>
          <q-item clickable :disable="!count" @click="emit('same', 'shape')">
            <q-item-section>Same shape or rosette</q-item-section>
          </q-item>
          <q-item clickable :disable="!count" @click="emit('same', 'fill')">
            <q-item-section>Same fill</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
    <q-btn
      v-if="canPaste"
      flat
      dense
      round
      icon="content_paste"
      aria-label="Paste"
      @click="emit('paste')"
    >
      <q-tooltip>Paste (Ctrl+V)</q-tooltip>
    </q-btn>
    <template v-if="count">
      <q-separator vertical inset />
      <q-btn
        v-for="b in BUTTONS"
        :key="b.id"
        flat
        dense
        round
        :icon="b.icon"
        :class="b.cls"
        :aria-label="b.label"
        @click="emit(b.id)"
      >
        <q-tooltip>{{ b.label }}</q-tooltip>
      </q-btn>
      <template v-if="quilt">
        <q-separator vertical inset />
        <q-btn flat dense round icon="hive" aria-label="Make rosette" @click="emit('make')">
          <q-tooltip>Make rosette</q-tooltip>
        </q-btn>
        <q-btn
          v-if="hasRosette"
          flat
          dense
          round
          icon="scatter_plot"
          aria-label="Break into patches"
          @click="emit('break')"
        >
          <q-tooltip>Break into patches</q-tooltip>
        </q-btn>
      </template>
      <q-separator vertical inset />
      <q-btn
        flat
        dense
        no-caps
        :icon="adding ? undefined : 'close'"
        :label="adding ? 'Done' : undefined"
        :round="!adding"
        aria-label="Clear the selection"
        @click="emit('clear')"
      >
        <q-tooltip>{{ adding ? 'Stop picking pieces' : 'Clear the selection (Esc)' }}</q-tooltip>
      </q-btn>
    </template>
  </div>
</template>

<script setup lang="ts">
// The selection's actions (spec 051) over the EPP canvas: the outline's handles as buttons, which
// work the same with a mouse and a finger.
import { computed } from 'vue';

type Action =
  | 'turn'
  | 'flipX'
  | 'flipY'
  | 'bigger'
  | 'smaller'
  | 'copy'
  | 'duplicate'
  | 'front'
  | 'back'
  | 'remove';

const props = defineProps<{
  count: number;
  adding: boolean;
  canPaste: boolean;
  /** An EPP quilt (Make rosette, Break into patches). */
  quilt?: boolean;
  hasRosette?: boolean;
}>();
const emit = defineEmits<{
  (e: Action | 'all' | 'paste' | 'make' | 'break' | 'clear'): void;
  (e: 'same', by: 'shape' | 'fill'): void;
}>();

const label = computed(() =>
  props.count
    ? `${props.count} selected`
    : props.adding
      ? 'Tap pieces to pick them'
      : 'Nothing selected',
);
const BUTTONS: { id: Action; icon: string; label: string; cls?: string }[] = [
  { id: 'turn', icon: 'rotate_right', label: 'Turn' },
  { id: 'flipX', icon: 'flip', label: 'Mirror left to right' },
  { id: 'flipY', icon: 'flip', label: 'Mirror up and down', cls: 'turned' },
  { id: 'bigger', icon: 'open_in_full', label: 'One size bigger' },
  { id: 'smaller', icon: 'close_fullscreen', label: 'One size smaller' },
  { id: 'copy', icon: 'content_copy', label: 'Copy (Ctrl+C)' },
  { id: 'duplicate', icon: 'library_add', label: 'Duplicate (Ctrl+D)' },
  { id: 'front', icon: 'flip_to_front', label: 'Bring to front' },
  { id: 'back', icon: 'flip_to_back', label: 'Send to back' },
  { id: 'remove', icon: 'delete', label: 'Delete (Del)' },
];
</script>

<style scoped>
.sel-bar {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  max-width: calc(100% - 16px);
  overflow-x: auto;
  z-index: 2;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.25);
}
:global(.body--dark .sel-bar) {
  background: rgba(40, 40, 40, 0.95);
}
.turned :deep(.q-icon) {
  transform: rotate(90deg);
}
</style>
