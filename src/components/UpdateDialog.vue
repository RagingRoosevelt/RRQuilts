<template>
  <!-- A new version (spec 054): shown as soon as it's found, while it downloads. -->
  <!-- no-route-dismiss: an update found at startup must survive the first navigation. -->
  <q-dialog :model-value="update.open" no-route-dismiss @update:model-value="(v) => !v && later()">
    <q-card class="update">
      <DialogClose @click="later" />
      <!-- Two whole quilts tilted toward each other, like the welcome wizard's cards. -->
      <div v-if="pictures.length" class="hero" aria-hidden="true">
        <img v-for="(src, i) in pictures" :key="i" :src="src" alt="" :class="`quilt q${i}`" />
      </div>
      <q-card-section class="text-h6 q-pb-none">{{ title }}</q-card-section>
      <q-card-section class="q-pt-sm text-body2">
        <template v-if="update.phase === 'elsewhere'">
          RRQuilts was updated in another tab. Reload to finish updating this one.
        </template>
        <template v-else-if="update.phase === 'failed'">
          The update couldn't be downloaded. RRQuilts tries again the next time it opens.
        </template>
        <template v-else-if="update.phase === 'downloading'">
          <q-spinner size="16px" color="primary" class="q-mr-xs" /> Downloading the update…
        </template>
        <template v-else>The update is ready.</template>
      </q-card-section>
      <q-card-section v-if="since.length" class="q-pt-none changes scroll">
        <div v-for="v in since" :key="v.version" class="q-mb-md">
          <div class="text-subtitle2">{{ v.version }}</div>
          <ul v-if="v.major.length" class="q-my-xs">
            <li v-for="(t, i) in v.major" :key="i">{{ t }}</li>
          </ul>
          <div v-if="v.minor" class="text-caption text-grey-7">
            {{ v.major.length ? 'And' : '' }} {{ v.minor }} smaller
            {{ v.minor === 1 ? 'change' : 'changes' }}.
          </div>
        </div>
        <a href="#" @click.prevent="openChangelog">The full changelog</a>
      </q-card-section>
      <q-card-section v-if="askUnsaved" class="q-pt-none">
        <div class="text-body2 q-mb-sm">
          "{{ project.doc?.project.name }}" has unsaved changes. Save it first, or keep them in a
          draft that's offered after the reload.
        </div>
        <div class="row justify-end q-gutter-sm">
          <q-btn flat label="Cancel" @click="askUnsaved = false" />
          <q-btn flat label="Keep as draft" @click="go(false)" />
          <q-btn color="primary" label="Save" @click="go(true)" />
        </div>
      </q-card-section>
      <q-card-actions v-else align="right">
        <template v-if="update.reloading">
          <q-spinner size="1.4em" class="q-mr-sm" /> <span class="q-mr-md">Reloading…</span>
        </template>
        <template v-else>
          <q-btn v-if="update.phase !== 'elsewhere'" flat label="Later" @click="later" />
          <q-btn
            v-if="update.phase !== 'failed'"
            color="primary"
            label="Reload"
            @click="onReload"
          />
          <q-btn v-else color="primary" label="Close" @click="later" />
        </template>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { produce } from 'immer';
import { useQuasar } from 'quasar';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import DialogClose from './DialogClose.vue';
import { takesBlock } from '@/editor/scope';
import { changesSince, compareVersions } from '@/model/changelog';
import { newId } from '@/model/ids';
import { generateFor } from '@/model/layout/slots';
import { syncDraft } from '@/model/library-items';
import { createProject } from '@/model/new-project';
import { createQuilt } from '@/model/new-quilt';
import type { Layout } from '@/model/schema/quilt';
import { quiltThumbnail } from '@/render/thumbnail';
import { later, reload, update } from '@/session/update';
import { useLibraryStore } from '@/stores/library';
import { useProjectStore } from '@/stores/project';

const $q = useQuasar();
const router = useRouter();
const library = useLibraryStore();
const project = useProjectStore();
const running = computed(() => update.from ?? import.meta.env.APP_VERSION);

const title = computed(() => {
  const next = update.info?.version;
  if (!next) return 'Update available';
  if (compareVersions(next, running.value) === 0) return `A new build of ${running.value}`;
  return `Update from ${running.value} to ${next}`;
});
const since = computed(() => (update.info ? changesSince(update.info, running.value) : []));

/** Two small built-in quilts: a barn-raising Log Cabin and a Bear's Paws. */
const SAMPLES: [block: string, coloring: (n: number) => number, size: number, turns: boolean][] = [
  ['Basic Log Cabin', () => 1, 4, true],
  ["Bear's Paws", (n) => n - 1, 3, false],
];
const pictures = computed(() => {
  if (!update.open) return [];
  const doc = produce(createProject(), (d) => {
    for (const [name, pick, n, turns] of SAMPLES) {
      const b = library.items.blocks.find((x) => x.notecard.name === name);
      const c = b?.colorings[Math.min(pick(b.colorings.length), b.colorings.length - 1)];
      if (!b || !c) continue;
      const layout: Layout = {
        style: 'straight-set',
        cols: n,
        rows: n,
        block: [3, 3],
        sash: [0, 0],
        sashBorder: false,
      };
      const q = createQuilt(name, layout, []);
      // Slots point at a quilt coloring based on the block's (as the Set tool does).
      const qc = newId();
      q.colorings[qc] = { base: c.id, fills: {} };
      generateFor(q)
        .slots.filter((s) => takesBlock(s))
        .forEach((s, i) => {
          const [r, col] = [Math.floor(i / n), i % n];
          // Barn raising: each quarter turned to face the middle.
          const rotation = !turns
            ? 0
            : r < n / 2
              ? col < n / 2
                ? 0
                : 90
              : col < n / 2
                ? 270
                : 180;
          q.layers[0].slots[s.id] = { block: b.id, coloring: qc, rotation, flip: false };
        });
      d.project.quilts.push(q);
    }
    syncDraft(d, library.lookup);
    // Built-in colorings use the built-in library's colors; the drawing looks only in the project.
    const have = new Set(d.project.palette.colors.map((c) => c.id));
    d.project.palette.colors.push(...library.items.colors.filter((c) => !have.has(c.id)));
  });
  return doc.project.quilts.map((q) => quiltThumbnail(doc, q, 220, $q.dark.isActive));
});

const askUnsaved = ref(false);
function onReload() {
  if (update.phase !== 'elsewhere' && project.dirty && !project.readOnly) askUnsaved.value = true;
  else reload();
}
async function go(save: boolean) {
  if (save && (await project.save()) === 'cancelled') return;
  askUnsaved.value = false;
  if (!save) await project.flushDraft();
  project.allowLeave();
  reload();
}
function openChangelog() {
  later();
  void router.push('/help/about/changelog');
}
</script>

<style scoped>
.update {
  width: 520px;
  max-width: 95vw;
}
.hero {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  height: 160px;
  margin-top: 12px;
}
.quilt {
  width: 120px;
  height: 120px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.q0 {
  transform: rotate(-9deg) translateY(6px);
  animation: lean-left 3.6s ease-in-out infinite;
}
.q1 {
  transform: rotate(9deg) translateY(6px);
  animation: lean-right 3.6s ease-in-out infinite;
}
@keyframes lean-left {
  50% {
    transform: rotate(-6deg) translate(4px, 2px);
  }
}
@keyframes lean-right {
  50% {
    transform: rotate(6deg) translate(-4px, 2px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .q0,
  .q1 {
    animation: none;
  }
}
.changes {
  max-height: 40vh;
}
.changes ul {
  padding-left: 20px;
}
</style>
