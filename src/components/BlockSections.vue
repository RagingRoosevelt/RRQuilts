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
      class="sec-head root-head"
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
      v-bind="
        allButton(
          sections.filter((x) => x.label),
          title ? ROOT : undefined,
        )
      "
    />
  </div>
  <template v-for="sec in title && !isOpen(ROOT) ? [] : sections" :key="sec.key">
    <div
      v-if="sec.label"
      v-show="!sec.parent || isOpen(sec.parent)"
      class="row items-center no-wrap q-mb-xs"
      :class="{ 'cat-row': !sec.parent, compact }"
      :style="indent(sec)"
      style="gap: 4px"
    >
      <button
        class="sec-head"
        :class="sec.parent ? 'sub-head' : 'cat-head'"
        :aria-expanded="isOpen(sec.key)"
        @click="toggle(sec.key)"
      >
        <q-icon :name="isOpen(sec.key) ? 'expand_more' : 'chevron_right'" size="20px" />
        {{ sec.label }} <span class="text-grey-6">· {{ sec.count }}</span>
        <slot name="header" :section="sec" />
      </button>
      <slot name="actions" :section="sec" :blocks="blocksIn(sec)" />
      <q-btn
        v-if="!sec.parent && sections.some((x) => x.parent === sec.key)"
        v-bind="
          allButton(
            sections.filter((x) => x.parent === sec.key),
            sec.key,
          )
        "
      />
    </div>
    <div
      v-if="sec.blocks.length"
      v-show="!sec.label || (isOpen(sec.key) && (!sec.parent || isOpen(sec.parent)))"
      :class="compact ? 'tiles q-mb-sm' : 'cards q-mb-lg'"
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
/** `compact`: small tiles that wrap (the quilt editor's sidebar). */
const props = defineProps<{
  sections: BlockSection[];
  lib: string;
  title?: string;
  compact?: boolean;
}>();
const ROOT = '\u0000library';
/** Section headers sit under the library header, subcategories under their category (blocks don't indent). */
const indent = (sec: BlockSection) => ({
  marginLeft: `${((props.title ? 1 : 0) + (sec.parent ? 1 : 0)) * 20}px`,
});
const settings = useSettingsStore();
const key = (k: string) => `libsec:${props.lib}:${k}`;
const isOpen = (k: string) => !settings.settings.collapsedSections.includes(key(k));
/**
 * One button for a level's children: when the level or any child is closed it expands them all
 * (the level too); otherwise it collapses the children, leaving the level open.
 */
function allButton(children: BlockSection[], self?: string) {
  const keys = children.map((x) => key(x.key));
  const all = self ? [...keys, key(self)] : keys;
  const anyClosed = all.some((k) => settings.settings.collapsedSections.includes(k));
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
      const rest = settings.settings.collapsedSections.filter((k) => !all.includes(k));
      settings.settings.collapsedSections = anyClosed ? rest : [...rest, ...keys];
    },
  };
}
/** A section's blocks, its subcategories' included. */
const blocksIn = (sec: BlockSection) => [
  ...sec.blocks,
  ...props.sections.filter((x) => x.parent === sec.key).flatMap((x) => x.blocks),
];
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
/* Category headings: top level bold with a rule under it, subcategories a step smaller. */
.cat-row {
  margin-top: 12px;
  padding-bottom: 2px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.3);
}
.cat-row.compact {
  margin-top: 6px;
}
.root-head {
  font-size: 1.25rem;
  font-weight: 600;
}
.cat-head {
  font-size: 1.1rem;
  font-weight: 600;
}
.compact .cat-head {
  font-size: 0.95rem;
}
.sub-head {
  font-size: 0.95rem;
  font-weight: 600;
  opacity: 0.8;
}
.tiles {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}
</style>
