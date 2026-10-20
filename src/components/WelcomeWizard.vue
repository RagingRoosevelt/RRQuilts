<template>
  <!-- First visit: name, units, your bed and clothes sizes, help. Every step can be skipped and
       everything can be changed later in Settings. -->
  <q-dialog v-model="open" persistent>
    <q-card class="welcome">
      <DialogClose @click="finish" />
      <q-card-section class="text-h6">Welcome to RRQuilts</q-card-section>
      <q-stepper
        v-model="step"
        flat
        animated
        header-nav
        alternative-labels
        class="steps"
        :contracted="$q.screen.lt.sm"
      >
        <q-step name="name" title="You" icon="person">
          <!-- Basic Log Cabin, Mexican Cross II, and Bear's Paws, fanned out like swatch cards. -->
          <div v-if="cards.length" class="hero" aria-hidden="true">
            <img v-for="(src, i) in cards" :key="i" :src="src" alt="" :class="`card c${i}`" />
          </div>
          <p class="text-body1 q-mb-lg">
            RRQuilts is a free quilt designer that runs in your browser, even offline. Lay out a
            quilt (straight sets, on point, strips, one-patch shapes, tumbling blocks, and pieced
            borders), draw your own blocks, color them with your colors and fabric photos, and print
            templates, cutting charts, and yardage. Your work stays on your device, in files you
            save.
          </p>
          <p>
            What name should go on the quilts, blocks, and palettes you design? Your real name, a
            pseudonym, a shop name, or a handle are all fine. It's shown as the credit when you
            share your work, and the start of ids for things you make.
          </p>
          <q-input
            v-model.trim="settings.author"
            outlined
            dense
            maxlength="100"
            label="Name for credits"
            placeholder="anonymous"
            autofocus
          />
          <div class="text-caption text-grey-7 q-mt-xs">
            Leave it empty to be credited as “anonymous”.
          </div>
        </q-step>

        <q-step name="units" title="Units" icon="straighten">
          <p>Do you measure in inches or centimeters? New projects start in these units.</p>
          <q-btn-toggle
            v-model="settings.units"
            no-caps
            unelevated
            toggle-color="primary"
            :options="[
              { label: 'Inches', value: 'in' },
              { label: 'Centimeters', value: 'cm' },
            ]"
          />
          <div class="text-caption text-grey-7 q-mt-sm">
            A project can switch units any time in its Details tab.
          </div>
        </q-step>

        <q-step name="sizes" title="Your sizes" icon="bed">
          <p>
            A quilt can show a <b>reference overlay</b>: the outline of a bed with its drop, or of a
            garment piece, drawn over the design so you can size the quilt to it. Tell us your bed
            and your top and pants sizes, and those outlines start from them. All optional.
          </p>
          <OverlaySettings />
        </q-step>

        <q-step name="help" title="Help" icon="help_outline">
          <q-toggle v-model="settings.showHelp" label="Show help buttons" />
          <div class="text-caption text-grey-7 q-mb-md">
            Small “?” buttons beside editors and settings open the help about that part.
          </div>
          <p>
            The Help pages walk through each part of making a quilt, and work offline like the rest
            of the app:
          </p>
          <ul class="q-mt-none">
            <li v-for="g in GUIDES" :key="g.id">
              <a href="#" @click.prevent="openHelp(g.id)">{{ g.title }}</a>
              — {{ g.about }}
            </li>
          </ul>
          <div class="text-caption text-grey-7">
            There are also quilting math calculators and technique guides. Help is in the menu at
            the top.
          </div>
        </q-step>
      </q-stepper>
      <q-card-actions align="right">
        <q-btn flat no-caps label="Skip" @click="finish" />
        <q-btn v-if="step !== 'name'" flat no-caps label="Back" @click="move(-1)" />
        <q-btn
          unelevated
          no-caps
          color="primary"
          :label="step === 'help' ? 'Start quilting' : 'Next'"
          @click="step === 'help' ? finish() : move(1)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import DialogClose from './DialogClose.vue';
import { useQuasar } from 'quasar';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import OverlaySettings from '@/components/OverlaySettings.vue';
import { createProject } from '@/model/new-project';
import { blockThumbnail } from '@/render/thumbnail';
import { useLibraryStore } from '@/stores/library';
import { welcomeOpen as open } from '@/composables/settings-open';
import { useSettingsStore } from '@/stores/settings';

const GUIDES = [
  {
    id: 'getting-started',
    title: 'Getting started',
    about: 'start a quilt, save and open projects',
  },
  { id: 'designing-a-quilt', title: 'Designing a quilt', about: 'layouts, borders, and coloring' },
  { id: 'drawing-blocks', title: 'Drawing blocks', about: 'make and change your own blocks' },
  {
    id: 'colors-and-palettes',
    title: 'Colors and palettes',
    about: 'build palettes of colors and fabrics',
  },
  { id: 'libraries', title: 'Libraries', about: 'keep, share, and add blocks and palettes' },
  { id: 'printing', title: 'Printing', about: 'templates, cutting charts, and yardage' },
] as const;
const STEPS = ['name', 'units', 'sizes', 'help'];

const settings = useSettingsStore().settings;
const $q = useQuasar();
const library = useLibraryStore();
// Built-in blocks draw against an empty project (their colors come from the built-in library).
const scratch = createProject();
/** Three built-in blocks, each in one of its themed colorings (same slot as the others: pastel,
 *  the original colors, the last theme). */
const CARDS: [name: string, coloring: (n: number) => number][] = [
  ['Basic Log Cabin', () => 1],
  ['Mexican Cross II', () => 0],
  ["Bear's Paws", (n) => n - 1],
];
const cards = computed(() =>
  CARDS.flatMap(([name, pick]) => {
    const b = library.items.blocks.find((x) => x.notecard.name === name);
    const c = b?.colorings[Math.min(pick(b.colorings.length), b.colorings.length - 1)];
    return b && c
      ? [blockThumbnail(scratch, b, 220, $q.dark.isActive, c.id, library.items.colors)]
      : [];
  }),
);
const router = useRouter();
const step = ref('name');
const move = (d: number) => (step.value = STEPS[STEPS.indexOf(step.value) + d] ?? step.value);

/** Done (finished or skipped): it doesn't come back, and the name has been asked. */
function finish() {
  settings.welcomeDone = true;
  settings.authorAsked = true;
  open.value = false;
}
function openHelp(id: string) {
  finish();
  void router.push(`/help/guides/${id}`);
}

// Each time it opens (first visit, or Settings › You), it starts at the beginning.
watch(open, (o) => o && (step.value = 'name'));
// First visit only: people who already gave a name (before this existed) aren't asked again.
onMounted(() => {
  if (!settings.welcomeDone && !settings.authorAsked) open.value = true;
});
</script>

<style scoped>
.hero {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120px;
  margin-bottom: 4px;
}
.card {
  width: 92px;
  height: 92px;
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
  background: #fff;
}
.c0 {
  transform: rotate(-10deg) translate(18px, 10px);
}
.c1 {
  position: relative;
  z-index: 1;
  animation: bob 3.2s ease-in-out infinite;
}
.c2 {
  transform: rotate(10deg) translate(-18px, 10px);
}
@keyframes bob {
  0%,
  100% {
    transform: translateY(0) scale(1.12) rotate(0deg);
  }
  50% {
    transform: translateY(-6px) scale(1.12) rotate(3deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .c1 {
    animation: none;
    transform: scale(1.12);
  }
}
/* One size for every step: the step scrolls if it needs to, the buttons stay put. */
.welcome {
  width: 640px;
  max-width: 95vw;
  height: min(760px, 92vh);
  max-height: none;
  display: flex;
  flex-direction: column;
}
.steps {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-gutter: stable;
}
</style>
