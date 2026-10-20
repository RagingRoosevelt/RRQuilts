<template>
  <!-- A library's blocks in collapsible sections (subcategories nested in their category); the
       default slot renders each block's card. Open/closed state is remembered per library. -->
  <div
    v-if="title || sections.some((x) => x.label)"
    :id="sectionAnchor(lib, ROOT)"
    class="row items-center no-wrap q-mb-sm anchor"
    :class="{ 'q-mt-md': title }"
    style="gap: 4px"
  >
    <h3 v-if="title" class="sec-h">
      <button class="sec-head root-head" :aria-expanded="isOpen(ROOT)" @click="toggle(ROOT)">
        <q-icon :name="isOpen(ROOT) ? 'expand_more' : 'chevron_right'" size="20px" />
        {{ title }}
        <span class="text-grey-6 text-weight-regular">
          · {{ sections.reduce((n, x) => n + (x.parent ? 0 : x.count), 0) }}</span
        >
      </button>
    </h3>
    <!-- The library's own actions (all its blocks), as each category has. -->
    <slot v-if="title" name="actions" :blocks="sections.flatMap((x) => x.blocks)" />
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
      :id="sectionAnchor(lib, sec.key)"
      class="row items-center no-wrap q-mb-xs anchor"
      :class="{ 'cat-row': !sec.parent, compact }"
      :style="indent(sec)"
      style="gap: 4px"
    >
      <h3 class="sec-h">
        <button class="sec-head cat-head" :aria-expanded="isOpen(sec.key)" @click="toggle(sec.key)">
          <q-icon :name="isOpen(sec.key) ? 'expand_more' : 'chevron_right'" size="20px" />
          {{ sec.label }} <span class="text-grey-6">· {{ sec.count }}</span>
          <slot name="header" :section="sec" />
        </button>
      </h3>
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
import { ROOT, sectionAnchor, sectionKey } from '@/composables/block-sections';
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

/** Section headers sit under the library header, subcategories under their category (blocks don't indent). */
const indent = (sec: BlockSection) => ({
  marginLeft: `${((props.title ? 1 : 0) + (sec.parent ? 1 : 0)) * 20}px`,
});
const settings = useSettingsStore();
const key = (k: string) => sectionKey(props.lib, k);
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
  color: inherit;
}
/* Category headings: all one style (indent shows the level); top level ruled. */
/* Headings scrolled to (table of contents) clear the app header. */
.anchor {
  scroll-margin-top: 64px;
}
.cat-row {
  margin-top: 12px;
  padding-bottom: 2px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.3);
}
.cat-row.compact {
  margin-top: 6px;
}
/* Headings: library title h2 (page); "Blocks" and every category h3 (indent shows the level). */
.sec-h {
  margin: 0;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  letter-spacing: normal;
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
