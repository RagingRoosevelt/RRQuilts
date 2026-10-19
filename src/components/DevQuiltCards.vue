<template>
  <!-- Tests tab (dev server only): built quilts in sections, each with its reference and what to
       expect. Compact: small cards in a grid (sweeps, borders). -->
  <div>
    <div class="bar">
      <q-chip dense :color="failed ? 'negative' : 'positive'" text-color="white">
        {{ entries.length }} quilts{{ failed ? `, ${failed} failed to build` : '' }}
      </q-chip>
      <a v-for="s in sections" :key="s.group" :href="`#${s.anchor}`">{{ s.group }}</a>
    </div>
    <section v-for="s in sections" :key="s.group" class="sec">
      <h2 :id="s.anchor" class="text-h6">{{ s.group }}</h2>
      <p v-if="s.note" class="expect"><strong>Expect:</strong> {{ s.note }}</p>
      <div :class="compact ? 'grid' : 'list'">
        <article
          v-for="v in s.entries"
          :id="v.id"
          :key="v.id"
          class="card"
          :class="[compact ? 'small' : 'var', { bad: v.error }]"
        >
          <figure>
            <img v-if="pics[v.id]" :src="pics[v.id]" :alt="v.title" />
            <div v-else class="none">{{ v.error ? 'Not drawn' : 'Drawing…' }}</div>
          </figure>
          <div class="about">
            <header>
              <span class="ref">{{ v.id }}</span>
              <h3>{{ v.title }}</h3>
              <q-btn
                v-if="v.quiltId"
                flat
                dense
                round
                size="sm"
                icon="open_in_new"
                :aria-label="`Open ${v.title} in the editor`"
                @click="emit('open', v)"
              >
                <q-tooltip>Open in editor</q-tooltip>
              </q-btn>
            </header>
            <p v-if="v.expect" class="expect"><strong>Expect:</strong> {{ v.expect }}</p>
            <p v-if="v.error" class="error">Failed to build: {{ v.error }}</p>
            <ul v-if="!compact">
              <li v-for="x in v.settings" :key="x">{{ x }}</li>
            </ul>
            <p v-if="timing" class="time">{{ timeText(v) }}</p>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import type { Built } from '@/dev/build';
import { quiltThumbnail } from '@/render/thumbnail';

const props = defineProps<{ entries: Built[]; compact?: boolean; timing?: boolean }>();
const emit = defineEmits<{ open: [entry: Built] }>();

const pics = reactive<Record<string, string>>({});
const timeText = (v: Built) =>
  `Built in ${Math.round(v.ms)} ms` +
  (drawMs[v.id] === undefined ? '' : `, drawn in ${Math.round(drawMs[v.id]!)} ms`);
const drawMs = reactive<Record<string, number>>({});
const failed = computed(() => props.entries.filter((e) => e.error).length);
/** Sections in list order, one per group. */
const sections = computed(() => {
  const out: { group: string; note?: string; anchor: string; entries: Built[] }[] = [];
  for (const e of props.entries) {
    if (out.at(-1)?.group !== e.group)
      out.push({
        group: e.group,
        ...(e.note ? { note: e.note } : {}),
        anchor: `g${out.length}`,
        entries: [],
      });
    out.at(-1)!.entries.push(e);
  }
  return out;
});

// One at a time, so the page stays responsive while they draw.
onMounted(async () => {
  const px = props.compact ? 600 : 1080;
  for (const e of props.entries) {
    const q = e.doc.project.quilts.find((x) => x.id === e.quiltId);
    if (q) {
      const t0 = performance.now();
      pics[e.id] = quiltThumbnail(e.doc, q, px, false, false, true, true);
      drawMs[e.id] = performance.now() - t0;
    }
    await new Promise((r) => setTimeout(r));
  }
});
</script>

<style scoped>
.bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  align-items: center;
  margin-bottom: 16px;
}
.sec {
  display: grid;
  gap: 12px;
  margin-bottom: 24px;
}
.sec h2 {
  margin: 0;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.3);
}
.list {
  display: grid;
  gap: 16px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(260px, 100%), 1fr));
  gap: 12px;
}
.card {
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 6px;
  padding: 12px;
  display: grid;
  gap: 10px;
}
.card.bad {
  border-color: var(--q-negative);
}
.var {
  grid-template-columns: minmax(0, 540px) minmax(0, 1fr);
  align-items: start;
}
@media (max-width: 900px) {
  .var {
    grid-template-columns: minmax(0, 1fr);
  }
}
.about {
  display: grid;
  gap: 8px;
  min-width: 0;
  align-content: start;
}
header {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  align-items: center;
}
h3 {
  margin: 0;
  font-size: 1rem;
  line-height: 1.4;
  font-weight: 600;
  flex: 1;
  min-width: 0;
}
/* Small cards: the name on its own line first, then the reference. */
.small h3 {
  font-size: 0.9rem;
  flex-basis: 100%;
  order: -1;
}
.ref {
  font-family: ui-monospace, monospace;
  font-size: 0.8rem;
  padding: 1px 8px;
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 4px;
  user-select: all;
}
.expect {
  margin: 0;
  max-width: 75ch;
}
ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
li {
  font-family: ui-monospace, monospace;
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid rgba(128, 128, 128, 0.35);
  overflow-wrap: anywhere;
}
.error {
  color: var(--q-negative);
  margin: 0;
}
.time {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.7;
  font-variant-numeric: tabular-nums;
}
figure {
  margin: 0;
}
/* Pictures sit on a light cutting mat in both themes. */
figure img,
figure .none {
  width: 100%;
  aspect-ratio: 1;
  object-fit: contain;
  background-color: #e9efe6;
  background-image:
    linear-gradient(#cfdacb 1px, transparent 1px),
    linear-gradient(90deg, #cfdacb 1px, transparent 1px);
  background-size: 24px 24px;
  border-radius: 4px;
  display: block;
}
figure .none {
  display: grid;
  place-items: center;
  color: #5b6475;
}
</style>
