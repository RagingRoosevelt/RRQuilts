<template>
  <q-page class="dev q-pa-md">
    <!-- Testing aids for the owner, dev server only (routes.ts, MainLayout: import.meta.env.DEV). -->
    <div class="row items-center q-mb-sm" style="gap: 16px">
      <h1 class="text-h5 q-my-none">Tests</h1>
      <q-tabs dense no-caps inline-label outside-arrows mobile-arrows class="col text-grey-8">
        <q-route-tab
          v-for="t in TABS"
          :key="t.name"
          :to="`/dev/${t.name}`"
          :label="t.label"
          :icon="t.icon"
        />
      </q-tabs>
    </div>
    <p class="lede">
      {{ TABS.find((t) => t.name === view)!.about }} Tell Claude the reference of anything that
      looks wrong.
    </p>

    <DevChecklist v-if="view === 'checklist'" />
    <DevViewport v-else-if="view === 'viewport'" />

    <template v-else-if="view === 'blocks'">
      <div class="bar">
        <q-chip dense color="positive" text-color="white">{{ blockList.length }} blocks</q-chip>
        <q-input v-model="blockSearch" dense outlined clearable placeholder="Find a block" />
        <a v-for="g in blockGroups" :key="g.name" :href="`#${g.anchor}`">{{ g.name }}</a>
      </div>
      <section v-for="g in blockGroups" :key="g.name" class="sec">
        <h2 :id="g.anchor" class="text-h6">
          {{ g.name }} <small>{{ g.blocks.length }}</small>
        </h2>
        <div class="blocks">
          <!-- Drawn when it first scrolls into view, as the project's block list does. -->
          <q-intersection v-for="b in g.blocks" :id="b.ref" :key="b.ref" once class="block-slot">
            <figure class="block">
              <img :src="blockPic(b.block, b.doc)" :alt="b.name" />
              <figcaption>
                <strong>{{ b.name }}</strong>
                <span class="ref">{{ b.ref }}</span>
                <span v-if="b.shape" class="shape">{{ b.shape }}</span>
                <span class="facts">{{ blockFacts(b.block) }}</span>
              </figcaption>
            </figure>
          </q-intersection>
        </div>
      </section>
    </template>

    <template v-else-if="view === 'print'">
      <div class="bar">
        <q-btn-toggle
          v-model="printPick"
          no-caps
          unelevated
          toggle-color="primary"
          :options="printOptions"
        />
      </div>
      <template v-if="printShown">
        <h2 class="text-h6 q-my-sm">
          <span class="ref">{{ printShown.ex.id }}</span> {{ printShown.entry.title }}
          <small>(gallery {{ printShown.entry.id }})</small>
        </h2>
        <p class="q-mb-xs"><strong>Check:</strong></p>
        <ul class="checks">
          <li v-for="c in printShown.ex.check" :key="c">{{ c }}</li>
        </ul>
        <div class="print-box column">
          <PrintPreview
            :key="printShown.ex.id"
            kind="quilt"
            :id="printShown.entry.quiltId!"
            :doc="printShown.entry.doc"
          />
        </div>
      </template>
      <p v-else>Building…</p>
    </template>

    <template v-else-if="view === 'pictures'">
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

    <template v-else>
      <DevQuiltCards
        :key="view"
        :variations="LISTS[view] ?? []"
        :compact="view === 'borders' || view === 'sweeps'"
        :timing="view === 'extremes'"
        @open="openInEditor"
      />
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, ref, shallowReactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DevChecklist from '@/components/DevChecklist.vue';
import DevViewport from '@/components/DevViewport.vue';
import DevQuiltCards from '@/components/DevQuiltCards.vue';
import PrintPreview from '@/components/PrintPreview.vue';
import { BORDERS } from '@/dev/borders';
import { buildOne, type Built, type DevVariation } from '@/dev/build';
import { EXTREMES } from '@/dev/extremes';
import { pictureCheck, type Comparison, type Section } from '@/dev/picture-check';
import { PRINT_EXAMPLES } from '@/dev/print-examples';
import { SWEEP_QUILTS } from '@/dev/sweeps';
import { GALLERY } from '@/dev/variations';
import { serializeProject } from '@/model/io';
import { createProject } from '@/model/new-project';
import type { Block } from '@/model/schema/block';
import { TECHNIQUES } from '@/model/schema/shared';
import {
  blockConstruction,
  DIFFICULTIES,
  SEAM_KINDS,
  seamKinds,
} from '@/model/blocks/construction';
import { blockThumbnail } from '@/render/thumbnail';
import { useLibraryStore } from '@/stores/library';
import { isLibraryItem } from '@/model/library-items';
import type { RrqDoc } from '@/model/schema/project';
import { useProjectStore } from '@/stores/project';

const TABS = [
  {
    name: 'checklist',
    label: 'Checklist',
    icon: 'checklist',
    about:
      'Things to try by hand before a release, with progress kept in this browser only (src/dev/checklist.ts).',
  },
  {
    name: 'gallery',
    label: 'Layout gallery',
    icon: 'grid_view',
    about:
      'Quilts built with each layout and its settings, drawn live with seam lines, newest first. Check each against what it should show. Add variations at the top of src/dev/variations.ts.',
  },
  {
    name: 'borders',
    label: 'Borders',
    icon: 'crop_free',
    about: 'Every border style on the same small quilt, generated from the Borders tab’s list.',
  },
  {
    name: 'sweeps',
    label: 'Sweeps',
    icon: 'linear_scale',
    about: 'One setting stepped through its range per row (src/dev/sweeps.ts).',
  },
  {
    name: 'extremes',
    label: 'Extremes',
    icon: 'warning_amber',
    about:
      'Sizes, counts, units and turns at the edges of what a quilter would do, with build and draw times.',
  },
  {
    name: 'blocks',
    label: 'Blocks',
    icon: 'apps',
    about:
      'Every built-in block with seam lines, by category, with its technique and what the app reads from its drawing (seams, pieces, narrowest piece, difficulty).',
  },
  {
    name: 'print',
    label: 'Print',
    icon: 'print',
    about: 'The Print tab’s sheets for a few layout gallery quilts, with what to check on them.',
  },
  {
    name: 'pictures',
    label: 'Picture check',
    icon: 'compare',
    about:
      'The demo projects (test/fixtures/formats) drawn by this code beside the pictures saved when each format version was released; red marks what moved.',
  },
  {
    name: 'viewport',
    label: 'Viewport',
    icon: 'phone_iphone',
    about:
      'Screen and viewport sizes as this browser reports them, and a tall dialog to check that its buttons can be reached (iOS Safari address bar).',
  },
] as const;
type View = (typeof TABS)[number]['name'];

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const project = useProjectStore();
const library = useLibraryStore();
const view = computed<View>(
  () => TABS.find((t) => t.name === route.params.view)?.name ?? 'checklist',
);

// --- Built quilts (gallery, borders, sweeps, extremes; print uses the gallery) ---
const LISTS: Partial<Record<View, readonly DevVariation[]>> = {
  gallery: GALLERY,
  borders: BORDERS,
  sweeps: SWEEP_QUILTS,
  extremes: EXTREMES,
};

/** Opens the quilt's test project (unsaved work stays in its draft), at that quilt. */
function openInEditor(entry: Built) {
  const go = async () => {
    const file = new File([serializeProject(entry.doc)], `${entry.doc.project.name}.rrq`);
    await project.openFile({ file });
    await router.push(`/project/quilt/${entry.quiltId}`);
  };
  if (!project.dirty || project.readOnly) return void go();
  $q.dialog({
    title: `Close "${project.doc!.project.name}"?`,
    message: 'It has unsaved changes. They are kept in a draft you can restore later.',
    cancel: true,
    ok: { label: 'Continue', flat: true },
  }).onOk(() => void go());
}

// --- Print ---
const printPick = ref(PRINT_EXAMPLES[0]!.id);
const printOptions = PRINT_EXAMPLES.map((p) => ({ value: p.id, label: p.id }));
/** Only the picked example's quilt is built. */
const printBuilt = shallowReactive<Record<string, Built>>({});
const printShown = computed(() => {
  const ex = PRINT_EXAMPLES.find((p) => p.id === printPick.value)!;
  const entry = printBuilt[ex.id];
  return entry?.quiltId ? { ex, entry } : undefined;
});
async function buildPrint() {
  const ex = PRINT_EXAMPLES.find((p) => p.id === printPick.value)!;
  if (printBuilt[ex.id]) return;
  printBuilt[ex.id] = await buildOne(GALLERY.find((v) => v.id === ex.quilt)!);
}
watch(printPick, () => view.value === 'print' && void buildPrint());

// --- Blocks ---
const blockSearch = ref<string | null>('');
const blockDoc = createProject('Blocks', 'in', 'tests');
/** Spec 029: its technique, and what the app reads from its drawing. */
function blockFacts(b: Block) {
  const c = blockConstruction(b);
  return [
    (b.notecard.techniques ?? []).map((t) => TECHNIQUES[t]).join(', ') || 'no technique',
    seamKinds(c)
      .map((k) => SEAM_KINDS[k])
      .join(', '),
    `${c.pieces} pieces, narrowest ${c.smallest.toFixed(2)} in`,
    DIFFICULTIES[c.difficulty],
  ].join(' · ');
}
/** Drawn in its own project (a project's blocks) or a blank one with the libraries' colors. */
const blockPic = (b: Block, doc?: RrqDoc) =>
  blockThumbnail(doc ?? blockDoc, b, 240, false, undefined, library.items.colors);
const blockList = computed(() => {
  const lib = library.builtin;
  if (!lib) return [];
  const cats = new Map(lib.categories.map((c) => [c.id, c]));
  const catName = (id?: string) => {
    const c = id ? cats.get(id) : undefined;
    const parent = c?.parent ? cats.get(c.parent) : undefined;
    return c ? (parent ? `${parent.name} › ${c.name}` : c.name) : 'Uncategorized';
  };
  const entry = (block: Block, group: string, doc?: RrqDoc) => ({
    ref: block.id.replace(/^rrquilts\./, ''),
    name: block.notecard.name,
    group,
    shape: block.shape,
    block,
    doc,
  });
  // Your own first: the open project's blocks, then My library's, then the built-in library.
  const doc = project.doc;
  const own = doc
    ? doc.project.blocks
        .filter((b) => !isLibraryItem(b) && !b.notecard.tags?.includes('system'))
        .map((b) => entry(b, `This project (${doc.project.name})`, doc))
    : [];
  const mine = (library.mine?.items ?? []).flatMap((i) =>
    i.type === 'block' ? [entry(i.data, 'My library')] : [],
  );
  return [
    ...own,
    ...mine,
    ...lib.items.flatMap((i) => (i.type === 'block' ? [entry(i.data, catName(i.category))] : [])),
  ];
});
const blockGroups = computed(() => {
  const q = (blockSearch.value ?? '').trim().toLowerCase();
  const groups = new Map<string, typeof blockList.value>();
  for (const b of blockList.value)
    if (!q || b.name.toLowerCase().includes(q) || b.ref.includes(q))
      groups.set(b.group, [...(groups.get(b.group) ?? []), b]);
  return [...groups].map(([name, blocks], i) => ({ name, anchor: `c${i}`, blocks }));
});
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

watch(
  view,
  (v) => {
    if (v === 'pictures') void loadCheck();
    else if (v === 'print') void buildPrint();
  },
  { immediate: true },
);
</script>

<style scoped>
.dev {
  max-width: 1300px;
  margin: 0 auto;
}
.lede {
  max-width: 80ch;
  opacity: 0.75;
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
h2 small {
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
  font-size: 0.8rem;
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
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.blocks {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}
.block-slot {
  min-height: 210px;
}
.block figcaption {
  text-transform: none;
  letter-spacing: 0;
  font-size: 0.8rem;
  display: flex;
  flex-wrap: wrap;
  gap: 2px 6px;
  align-items: center;
}
.block figcaption strong {
  width: 100%;
  font-size: 0.85rem;
}
.shape {
  opacity: 0.7;
}
.facts {
  width: 100%;
  opacity: 0.75;
  font-size: 0.75rem;
}
.checks {
  margin: 0 0 12px;
  max-width: 80ch;
}
/* The Print tab fills its box like the editor's canvas area. */
.print-box {
  height: 80vh;
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 6px;
  overflow: hidden;
}
</style>
