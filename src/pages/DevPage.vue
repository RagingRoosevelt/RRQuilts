<template>
  <q-page class="dev q-pa-md">
    <!-- Testing aids for the owner, dev server only (routes.ts, MainLayout: import.meta.env.DEV). -->
    <div class="row items-center q-mb-sm" style="gap: 16px">
      <h1 class="text-h5 q-my-none">Tests</h1>
      <q-tabs v-model="view" dense no-caps active-color="primary" class="text-grey-8">
        <q-route-tab name="gallery" to="/dev/gallery" label="Layout gallery" />
        <q-route-tab name="pictures" to="/dev/pictures" label="Picture check" />
      </q-tabs>
    </div>

    <template v-if="view === 'gallery'">
      <p class="lede">
        Quilts built with each layout and its settings, with blocks, solids and mixes, drawn live by
        this code with seam lines. Newest variations first. Check each picture against what it
        should show, and tell Claude the reference (like <span class="ref">G012</span>) of anything
        wrong. Add variations at the top of <code>src/dev/variations.ts</code>.
      </p>
      <div class="bar">
        <q-chip dense :color="failed ? 'negative' : 'positive'" text-color="white">
          {{ gallery ? `${gallery.entries.length} variations` : 'Building…' }}
          {{ failed ? `, ${failed} failed to build` : '' }}
        </q-chip>
        <a v-for="s in gallerySections" :key="s.added" :href="`#${s.anchor}`">{{ s.added }}</a>
      </div>
      <section v-for="s in gallerySections" :key="s.added" class="sec">
        <h2 :id="s.anchor" class="text-h6">{{ s.added }}</h2>
        <article v-for="v in s.entries" :id="v.id" :key="v.id" class="card var">
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
                no-caps
                icon="open_in_new"
                label="Open in editor"
                @click="openInEditor(v.quiltId)"
              />
            </header>
            <p class="expect"><strong>Expect:</strong> {{ v.expect }}</p>
            <p v-if="v.error" class="error">Failed to build: {{ v.error }}</p>
            <ul>
              <li v-for="s2 in v.settings" :key="s2">{{ s2 }}</li>
            </ul>
          </div>
        </article>
      </section>
    </template>

    <template v-else>
      <p class="lede">
        The demo projects (<code>test/fixtures/formats</code>) drawn by this code beside the
        pictures saved when each format version was released. Red in the difference column marks
        what moved. Tell Claude the reference (like <span class="ref">v6.03</span>) of anything that
        looks wrong.
      </p>
      <div class="bar">
        <q-chip dense :color="changed ? 'negative' : 'positive'" text-color="white">
          {{
            checkDone
              ? changed
                ? `${changed} of ${total} pictures changed`
                : `All ${total} pictures match`
              : `Drawing… ${total}`
          }}
        </q-chip>
        <q-toggle v-model="onlyChanged" dense label="Show changed only" />
        <a v-for="s in sections" :key="s.version" :href="`#v${s.version}`">v{{ s.version }}</a>
      </div>
      <p v-if="checkError" class="error">{{ checkError }}</p>
      <section v-for="s in sections" :key="s.version" class="sec">
        <h2 :id="`v${s.version}`" class="text-h6">
          Project format v{{ s.version }}
          <small
            >{{ s.items.length }} pictures,
            {{ s.items.filter((i) => i.state !== 'same').length }} changed</small
          >
        </h2>
        <template v-for="c in s.items" :key="c.ref">
          <article
            v-if="!onlyChanged || c.state !== 'same'"
            :id="c.ref"
            class="card"
            :class="c.state"
          >
            <header>
              <span class="ref">{{ c.ref }}</span>
              <h3>{{ c.name }}</h3>
              <span class="chip" :class="c.state">{{ label(c) }}</span>
            </header>
            <div class="trio">
              <figure v-for="[cap, src] in pictures(c)" :key="cap">
                <img v-if="src" :src="src" :alt="`${cap}: ${c.name}`" />
                <div v-else class="none">None</div>
                <figcaption>{{ cap }}</figcaption>
              </figure>
            </div>
          </article>
        </template>
      </section>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, onMounted, reactive, ref, shallowRef, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { buildGallery, type GalleryEntry } from '@/dev/gallery';
import { pictureCheck, type Comparison, type Section } from '@/dev/picture-check';
import { serializeProject } from '@/model/io';
import type { RrqDoc } from '@/model/schema/project';
import { quiltThumbnail } from '@/render/thumbnail';
import { useLibraryStore } from '@/stores/library';
import { useProjectStore } from '@/stores/project';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const project = useProjectStore();
const library = useLibraryStore();
const view = computed(() => (route.params.view === 'pictures' ? 'pictures' : 'gallery'));

// --- Layout gallery ---
const gallery = shallowRef<{ doc: RrqDoc; entries: GalleryEntry[] } | null>(null);
const pics = reactive<Record<string, string>>({});
const failed = computed(() => gallery.value?.entries.filter((e) => e.error).length ?? 0);
/** Sections follow the list's order (newest first), one per feature that added variations. */
const gallerySections = computed(() => {
  const out: { added: string; anchor: string; entries: GalleryEntry[] }[] = [];
  for (const e of gallery.value?.entries ?? []) {
    if (out.at(-1)?.added !== e.added)
      out.push({ added: e.added, anchor: `s${out.length}`, entries: [] });
    out.at(-1)!.entries.push(e);
  }
  return out;
});

async function loadGallery() {
  if (gallery.value) return;
  const g = await buildGallery();
  gallery.value = g;
  // One at a time, so the page stays responsive while they draw.
  for (const e of g.entries) {
    const q = g.doc.project.quilts.find((x) => x.id === e.quiltId);
    if (q) pics[e.id] = quiltThumbnail(g.doc, q, 1080, false, false, true, true);
    await new Promise((r) => setTimeout(r));
  }
}

/** Opens the gallery as the project (unsaved work stays in its draft), at that quilt. */
function openInEditor(quiltId: string) {
  const go = async () => {
    const file = new File([serializeProject(gallery.value!.doc)], 'Layout Gallery.rrq');
    await project.openFile({ file });
    await router.push(`/project/quilt/${quiltId}`);
  };
  if (!project.dirty || project.readOnly) return void go();
  $q.dialog({
    title: `Close "${project.doc!.project.name}"?`,
    message: 'It has unsaved changes. They are kept in a draft you can restore later.',
    cancel: true,
    ok: { label: 'Continue', flat: true },
  }).onOk(() => void go());
}

// --- Picture check ---
const sections = ref<Section[]>([]);
const onlyChanged = ref(false);
const checkDone = ref(false);
const checkError = ref('');
let checkStarted = false;
const total = computed(() => sections.value.reduce((n, s) => n + s.items.length, 0));
const changed = computed(() =>
  sections.value.reduce((n, s) => n + s.items.filter((i) => i.state !== 'same').length, 0),
);
const label = (c: Comparison) =>
  ({
    same: 'Same',
    changed: `Changed ${(c.share * 100).toFixed(1)}%`,
    missing: 'Not drawn now',
    new: 'New, nothing stored',
  })[c.state];
const pictures = (c: Comparison): [string, string | undefined][] => [
  ['Release', c.release],
  ['Now', c.now],
  ...(c.diff ? ([['Difference', c.diff]] as [string, string][]) : []),
];

async function loadCheck() {
  if (checkStarted) return;
  checkStarted = true;
  // Block pictures use library colors: wait for the built-in library.
  while (!library.builtin) await new Promise((r) => setTimeout(r, 100));
  try {
    for await (const s of pictureCheck(library.items.colors)) sections.value.push(s);
  } catch (e) {
    checkError.value = (e as Error).message;
  }
  checkDone.value = true;
}

const load = () => void (view.value === 'gallery' ? loadGallery() : loadCheck());
onMounted(load);
watch(view, load);
</script>

<style scoped>
.dev {
  max-width: 1300px;
  margin: 0 auto;
}
.lede {
  max-width: 75ch;
  color: rgba(128, 128, 128, 1);
}
.bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  align-items: center;
  margin-bottom: 16px;
}
.sec {
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
}
.sec h2 {
  margin: 0;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.3);
}
.sec h2 small {
  font-size: 0.85rem;
  opacity: 0.7;
  margin-left: 8px;
}
.card {
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 6px;
  padding: 12px;
  display: grid;
  gap: 10px;
}
.card.changed,
.card.new,
.card.missing {
  border-color: var(--q-negative);
}
.card header {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  align-items: center;
}
.card h3 {
  margin: 0;
  font-size: 1rem;
  line-height: 1.4;
  font-weight: 600;
  flex: 1;
  min-width: 0;
}
.ref {
  font-family: ui-monospace, monospace;
  font-size: 0.85rem;
  padding: 1px 8px;
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 4px;
  user-select: all;
}
.chip {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 999px;
  color: #fff;
  background: var(--q-positive);
}
.chip.changed,
.chip.new,
.chip.missing {
  background: var(--q-negative);
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
}
.expect {
  margin: 0;
  max-width: 65ch;
}
.var ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.var li {
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
.trio {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr));
  gap: 12px;
}
figure {
  margin: 0;
  display: grid;
  gap: 4px;
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
}
figure .none {
  display: grid;
  place-items: center;
  color: #5b6475;
}
figcaption {
  font-size: 0.75rem;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
</style>
