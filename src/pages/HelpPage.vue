<template>
  <q-page padding class="help">
    <h1 class="page-title q-mb-sm">Help</h1>
    <q-tabs
      :model-value="section"
      dense
      no-caps
      align="left"
      class="q-mb-md"
      @update:model-value="(s: string) => router.push(`/help/${s}`)"
    >
      <q-tab v-for="s in SECTIONS" :key="s.id" :name="s.id" :icon="s.icon" :label="s.label" />
    </q-tabs>

    <div class="row no-wrap" style="gap: 24px">
      <!-- Topic list (with search); on phones it gives way to the open topic. -->
      <nav v-if="!topic || $q.screen.gt.sm" class="topics column" aria-label="Topics">
        <q-input
          v-model="query"
          dense
          outlined
          clearable
          :placeholder="`Search ${label}`"
          class="q-mb-sm"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <router-link
          v-for="t in shown"
          :key="t.id"
          :to="`/help/${section}/${t.id}`"
          class="topic-link"
          :class="{ active: t.id === topic?.id }"
        >
          <div>{{ t.title }}</div>
          <div v-if="t.summary" class="text-caption text-grey-7">{{ t.summary }}</div>
        </router-link>
        <div v-if="!shown.length" class="text-grey-7 q-pa-sm">No topics match “{{ query }}”.</div>
      </nav>

      <article
        v-if="topic"
        class="col content"
        :class="{ 'is-dark': $q.dark.isActive }"
        @click="follow"
      >
        <div
          v-if="!$q.screen.gt.sm"
          class="mobile-bar row items-center justify-between q-mb-sm"
          :class="{ reverse: app.settings.sidesSwapped }"
          :style="{ background: $q.dark.isActive ? 'var(--q-dark-page)' : '#fff' }"
        >
          <q-btn flat dense no-caps icon="arrow_back" :label="label" :to="`/help/${section}`" />
          <q-btn v-if="topic.toc" flat dense round icon="menu" aria-label="On this page">
            <q-menu>
              <q-list dense style="min-width: 220px">
                <q-item-label header>On this page</q-item-label>
                <q-item
                  v-for="h in topic.toc"
                  :key="h.id"
                  v-close-popup
                  clickable
                  @click="jump(h.id)"
                >
                  <q-item-section>{{ h.title }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
        <h2 class="topic-title">{{ topic.title }}</h2>
        <component
          :is="topic.cards && g.card ? 'section' : 'div'"
          v-for="(g, gi) in groups"
          :key="`${topic.section}/${topic.id}/${gi}`"
          :class="{ 'section-card': topic.cards && g.card }"
        >
          <template v-for="(seg, i) in g.segs" :key="i">
            <!-- Bundled, trusted content (src/help/*.md), never user input. -->
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-if="seg.kind === 'html'" class="help-md" v-html="fill(seg.html)" />
            <HelpCalc v-else :name="seg.name" />
          </template>
        </component>
      </article>
      <nav v-if="topic?.toc && $q.screen.gt.sm" class="toc" aria-label="On this page">
        <div class="text-caption text-grey-7 q-mb-xs">On this page</div>
        <a
          v-for="h in topic.toc"
          :key="h.id"
          :href="`#${h.id}`"
          class="topic-link"
          @click.prevent="jump(h.id)"
        >
          {{ h.title }}
        </a>
      </nav>
      <div v-else-if="$q.screen.gt.sm" class="col text-grey-7 q-pt-sm">
        <q-banner v-if="missing" dense class="bg-warning text-dark q-mb-md">
          There's no topic “{{ missing }}” in {{ label }}.
        </q-banner>
        Pick a topic.
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import HelpCalc from '@/components/HelpCalc.vue';
import { supportsFileAccess } from '@/storage/files';
import { useSettingsStore } from '@/stores/settings';
import {
  findTopic,
  searchTopics,
  SECTIONS,
  topicsIn,
  type Segment,
  type SectionId,
} from '@/help/topics';

const $q = useQuasar();
const app = useSettingsStore();
const route = useRoute();
const router = useRouter();
const section = computed(() => route.params.section as SectionId);
const label = computed(() => SECTIONS.find((s) => s.id === section.value)?.label ?? '');
const wanted = computed(() => (route.params.topic as string | undefined) ?? '');
const all = computed(() => topicsIn(section.value));
// Wide screens open the first topic; a deep link to a missing topic shows a notice instead.
const topic = computed(() =>
  wanted.value
    ? findTopic(section.value, wanted.value)
    : $q.screen.gt.sm
      ? all.value[0]
      : undefined,
);
const missing = computed(() => (wanted.value && !topic.value ? wanted.value : ''));
const query = ref('');
watch(section, () => (query.value = ''));
const shown = computed(() => searchTopics(all.value, query.value ?? ''));

/** `{{yours:<feature>}}` in a topic → whether this browser has it. */
const FEATURES: Record<string, () => boolean> = { 'file-access': supportsFileAccess };
const fill = (html: string) =>
  html.replace(/\{\{yours:([\w-]+)\}\}/g, (m, f: string) =>
    FEATURES[f] ? (FEATURES[f]() ? 'yours does' : "yours doesn't") : m,
  );

/** The topic's segments, split at each ## heading (a card each when the topic asks for cards). */
const groups = computed(() => {
  const out: { card: boolean; segs: Segment[] }[] = [{ card: false, segs: [] }];
  for (const seg of topic.value?.segments ?? []) {
    if (seg.kind !== 'html') {
      out.at(-1)!.segs.push(seg);
      continue;
    }
    for (const html of seg.html.split(/(?=<h2[ >])/)) {
      if (html.startsWith('<h2')) out.push({ card: true, segs: [] });
      if (html.trim()) out.at(-1)!.segs.push({ kind: 'html', html });
    }
  }
  return out.filter((g) => g.segs.length);
});

/** Scroll to a heading of the open topic. */
const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

/** In-app links in topics (/help/…, /project…) go through the router (base path, no reload). */
function follow(e: MouseEvent) {
  // Only links written in the topics (router links like Back handle themselves).
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('.help-md a');
  const href = a?.getAttribute('href');
  if (!href?.startsWith('/') || a?.target) return;
  e.preventDefault();
  void router.push(href);
}
</script>

<style scoped>
.page-title {
  font-size: 1.6rem;
  font-weight: 500;
  line-height: 1.3;
  margin: 0;
  letter-spacing: normal;
}
.topics {
  width: 280px;
  flex: none;
  gap: 2px;
}
@media (max-width: 1023px) {
  .topics {
    width: 100%;
  }
}
.topic-link {
  display: block;
  padding: 6px 10px;
  border-radius: 6px;
  color: inherit;
  text-decoration: none;
}
.topic-link:hover {
  background: rgba(128, 128, 128, 0.12);
}
.topic-link.active {
  background: rgba(128, 128, 128, 0.2);
  font-weight: 600;
}
.content {
  max-width: 760px;
  min-width: 0;
}
.topic-title {
  font-size: 1.4rem;
  font-weight: 600;
  line-height: 1.3;
  margin: 0 0 12px;
  letter-spacing: normal;
}
/* Phones: Back and the table-of-contents menu stay under the header while scrolling. */
.mobile-bar {
  position: sticky;
  top: 51px;
  z-index: 2;
  margin: 0 -16px;
  padding: 4px 16px;
}
.section-card {
  border: 1px solid rgba(128, 128, 128, 0.35);
  border-radius: 8px;
  padding: 0 16px 4px;
  margin: 16px 0;
}
.toc {
  width: 220px;
  flex: none;
  position: sticky;
  top: 66px; /* below the header */
  align-self: flex-start;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
}
.help-md :deep(h2) {
  scroll-margin-top: 66px;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.3;
  margin: 20px 0 8px;
  letter-spacing: normal;
}
.help-md :deep(h3) {
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.3;
  margin: 16px 0 6px;
  letter-spacing: normal;
}
.help-md :deep(p),
.help-md :deep(li) {
  line-height: 1.55;
}
.help-md :deep(ol),
.help-md :deep(ul) {
  padding-left: 1.4em;
}
/* Links follow the accent color: a shade of it on the light page, a tint on the dark one. */
.help-md :deep(a) {
  color: color-mix(in srgb, var(--q-primary) 75%, black);
}
.is-dark .help-md :deep(a) {
  color: color-mix(in srgb, var(--q-primary) 40%, white);
}
.help-md :deep(code) {
  background: rgba(128, 128, 128, 0.15);
  padding: 0 4px;
  border-radius: 3px;
}
.help-md :deep(svg) {
  display: block;
  overflow: visible; /* diagram labels may run past the drawing */
  max-width: 100%;
  height: auto;
  margin: 8px 0;
}
/* Diagram labels and their arrows lift slightly off the drawing. */
.help-md :deep(svg text),
.help-md :deep(svg line[marker-end]) {
  filter: drop-shadow(0 0.6px 0.6px rgba(0, 0, 0, 0.3));
}
.help-md :deep(table) {
  border-collapse: collapse;
  margin: 8px 0 16px;
}
.help-md :deep(blockquote) {
  margin: 8px 0;
  padding: 4px 12px;
  border-left: 3px solid var(--q-primary);
}
.help-md :deep(th),
.help-md :deep(td) {
  border: 1px solid rgba(128, 128, 128, 0.3);
  padding: 4px 8px;
}
</style>
