<template>
  <!-- Tests tab (dev server only): quilts in sections, each with its reference and what to expect.
       Each card builds and draws its quilt when it first scrolls into view (as the project's block
       list does). Compact: small cards in a grid (sweeps, borders). -->
  <div>
    <div class="bar">
      <q-chip dense :color="failed ? 'negative' : 'positive'" text-color="white">
        {{ variations.length }} quilts{{ failed ? `, ${failed} failed to build` : '' }}
      </q-chip>
      <a v-for="s in sections" :key="s.group" :href="`#${s.anchor}`">{{ s.group }}</a>
    </div>
    <section v-for="s in sections" :key="s.group" class="sec">
      <h2 :id="s.anchor" class="text-h6">{{ s.group }}</h2>
      <p v-if="s.note" class="expect"><strong>Expect:</strong> {{ s.note }}</p>
      <div :class="compact ? 'grid' : 'list'">
        <q-intersection
          v-for="v in s.entries"
          :id="v.id"
          :key="v.id"
          once
          :class="compact ? 'slot-small' : 'slot'"
          @visibility="(on: boolean) => on && void load(v)"
        >
          <article class="card" :class="[compact ? 'small' : 'var', { bad: built[v.id]?.error }]">
            <figure>
              <img v-if="pics[v.id]" :src="pics[v.id]" :alt="v.title" />
              <div v-else class="none">{{ built[v.id]?.error ? 'Not drawn' : 'Drawing…' }}</div>
            </figure>
            <div class="about">
              <header>
                <span class="ref">{{ v.id }}</span>
                <h3>{{ v.title }}</h3>
                <q-btn
                  v-if="built[v.id]?.quiltId"
                  flat
                  dense
                  round
                  size="sm"
                  icon="open_in_new"
                  :aria-label="`Open ${v.title} in the editor`"
                  @click="emit('open', built[v.id]!)"
                >
                  <q-tooltip>Open in editor</q-tooltip>
                </q-btn>
              </header>
              <p v-if="v.expect" class="expect"><strong>Expect:</strong> {{ v.expect }}</p>
              <p v-if="built[v.id]?.error" class="error">
                Failed to build: {{ built[v.id]!.error }}
              </p>
              <ul v-if="!compact && built[v.id]">
                <li v-for="x in built[v.id]!.settings" :key="x">{{ x }}</li>
              </ul>
              <p v-if="timing && built[v.id]" class="time">{{ timeText(v.id) }}</p>
            </div>
          </article>
        </q-intersection>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, shallowReactive } from 'vue';
import { buildOne, type Built, type DevVariation } from '@/dev/build';
import { quiltThumbnail } from '@/render/thumbnail';

const props = defineProps<{
  variations: readonly DevVariation[];
  compact?: boolean;
  timing?: boolean;
}>();
const emit = defineEmits<{ open: [entry: Built] }>();

const built = shallowReactive<Record<string, Built>>({});
const pics = reactive<Record<string, string>>({});
const drawMs = reactive<Record<string, number>>({});
const failed = computed(() => Object.values(built).filter((b) => b.error).length);
const timeText = (id: string) =>
  `Built in ${Math.round(built[id]!.ms)} ms` +
  (drawMs[id] === undefined ? '' : `, drawn in ${Math.round(drawMs[id])} ms`);

/** Sections in list order, one per group. */
const sections = computed(() => {
  const out: { group: string; note?: string; anchor: string; entries: DevVariation[] }[] = [];
  for (const v of props.variations) {
    if (out.at(-1)?.group !== v.group)
      out.push({
        group: v.group,
        ...(v.note ? { note: v.note } : {}),
        anchor: `g${out.length}`,
        entries: [],
      });
    out.at(-1)!.entries.push(v);
  }
  return out;
});

const started = new Set<string>();
async function load(v: DevVariation) {
  if (started.has(v.id)) return;
  started.add(v.id);
  const b = await buildOne(v);
  built[v.id] = b;
  const q = b.doc.project.quilts.find((x) => x.id === b.quiltId);
  if (!q) return;
  // Let the card show its settings before the (slower) drawing.
  await new Promise((r) => setTimeout(r));
  const t0 = performance.now();
  pics[v.id] = quiltThumbnail(b.doc, q, props.compact ? 600 : 1080, false, false, true, true);
  drawMs[v.id] = performance.now() - t0;
}
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
/* Room held for a card before it scrolls into view, so only the visible ones build. */
.slot {
  min-height: 560px;
}
.slot-small {
  min-height: 330px;
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
