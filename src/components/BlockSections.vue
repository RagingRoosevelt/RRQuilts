<template>
  <!-- A library's blocks in collapsible sections (subcategories nested in their category); the
       default slot renders each block's card. Open/closed state is remembered per library. -->
  <div
    v-if="title || sections.some((x) => x.label)"
    class="row items-center no-wrap q-mb-sm"
    :class="{ 'q-mt-md': title }"
    style="gap: 4px"
  >
    <button
      v-if="title"
      class="sec-head text-subtitle2"
      :aria-expanded="isOpen(ROOT)"
      @click="toggle(ROOT)"
    >
      <q-icon :name="isOpen(ROOT) ? 'expand_more' : 'chevron_right'" size="20px" />
      {{ title }}
      <span class="text-grey-6 text-weight-regular">
        · {{ sections.reduce((n, x) => n + (x.parent ? 0 : x.count), 0) }}</span
      >
    </button>
    <q-btn
      v-if="sections.some((x) => x.label)"
      v-bind="allButton(sections.filter((x) => x.label))"
    />
  </div>
  <template v-for="sec in title && !isOpen(ROOT) ? [] : sections" :key="sec.key">
    <div
      v-if="sec.label"
      v-show="!sec.parent || isOpen(sec.parent)"
      class="row items-center no-wrap q-mb-xs"
      :style="indent(sec)"
      style="gap: 4px"
    >
      <button
        class="sec-head text-body2 text-weight-medium text-grey-8"
        :aria-expanded="isOpen(sec.key)"
        @click="toggle(sec.key)"
      >
        <q-icon :name="isOpen(sec.key) ? 'expand_more' : 'chevron_right'" size="20px" />
        {{ sec.label }} <span class="text-grey-6">· {{ sec.count }}</span>
        <slot name="header" :section="sec" />
      </button>
      <q-btn
        v-if="!sec.parent && sections.some((x) => x.parent === sec.key)"
        v-bind="allButton(sections.filter((x) => x.parent === sec.key))"
      />
    </div>
    <div
      v-if="sec.blocks.length"
      v-show="!sec.label || (isOpen(sec.key) && (!sec.parent || isOpen(sec.parent)))"
      class="cards q-mb-lg"
      :style="indent(sec)"
    >
      <template v-for="b in sec.blocks" :key="b.id">
        <slot :block="b" />
      </template>
    </div>
  </template>
</template>

<script setup lang="ts">
import type { BlockSection } from '@/model/library';
import { useSettingsStore } from '@/stores/settings';

/** `title`: the library's own collapsible header around all its sections. */
const props = defineProps<{ sections: BlockSection[]; lib: string; title?: string }>();
const ROOT = '\u0000library';
/** Sections sit under the library header, subcategories under their category. */
const indent = (sec: BlockSection) => ({
  marginLeft: `${((props.title ? 1 : 0) + (sec.parent ? 1 : 0)) * 20}px`,
});
const settings = useSettingsStore();
const key = (k: string) => `libsec:${props.lib}:${k}`;
const isOpen = (k: string) => !settings.settings.collapsedSections.includes(key(k));
/**
 * One button for a level's children (never the level itself): expands them all when any is
 * closed, else collapses them all.
 */
function allButton(children: BlockSection[]) {
  const keys = children.map((x) => key(x.key));
  const anyClosed = keys.some((k) => settings.settings.collapsedSections.includes(k));
  const label = anyClosed ? 'Expand all' : 'Collapse all';
  return {
    flat: true,
    dense: true,
    round: true,
    size: 'sm',
    icon: anyClosed ? 'unfold_more' : 'unfold_less',
    title: label,
    'aria-label': label,
    onClick: () => {
      const rest = settings.settings.collapsedSections.filter((k) => !keys.includes(k));
      settings.settings.collapsedSections = anyClosed ? rest : [...rest, ...keys];
    },
  };
}
function toggle(k: string) {
  const all = settings.settings.collapsedSections;
  settings.settings.collapsedSections = all.includes(key(k))
    ? all.filter((x) => x !== key(k))
    : [...all, key(k)];
}
</script>

<style scoped>
.sec-head {
  display: flex;
  align-items: center;
  gap: 2px;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  font: inherit;
}
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}
</style>
