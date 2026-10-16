<template>
  <!-- First visit: name, units, your bed and clothes sizes, help. Every step can be skipped and
       everything can be changed later in Settings. -->
  <q-dialog v-model="open" persistent>
    <q-card class="welcome">
      <q-card-section class="text-h6">Welcome to RRQuilts</q-card-section>
      <q-stepper v-model="step" flat animated header-nav alternative-labels class="col">
        <q-step name="name" title="You" icon="person">
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
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import OverlaySettings from '@/components/OverlaySettings.vue';
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
.welcome {
  width: 640px;
  max-width: 95vw;
}
</style>
