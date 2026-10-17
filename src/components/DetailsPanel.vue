<template>
  <div v-if="item" class="column" style="gap: 12px; max-width: 560px">
    <q-input
      :model-value="item.name"
      label="Title"
      dense
      outlined
      :readonly="ro"
      @update:model-value="(v) => set('name', v)"
      @blur="(e: Event) => set('name', (e.target as HTMLInputElement).value, true)"
    />
    <QuiltColorways v-if="quilt" :quilt="quilt" mode="row" :readonly="ro" />
    <div
      v-if="kind === 'block' && target"
      class="text-caption text-grey-7"
      style="margin-top: -8px"
    >
      <span v-if="target.revision" class="revision"
        >Revision {{ target.revision }}
        <q-tooltip>{{ target.id }}@{{ target.version }}</q-tooltip>
      </span>
      <span v-else>Not saved yet (revision 1 on first save)</span>
    </div>
    <q-input
      :model-value="item.author ?? ''"
      label="Author"
      placeholder="anonymous"
      dense
      outlined
      :readonly="ro"
      :hint="
        credits.length
          ? 'Whoever made this version. Earlier contributors stay credited below.'
          : undefined
      "
      @update:model-value="(v) => set('author', v)"
      @blur="(e: Event) => set('author', (e.target as HTMLInputElement).value, true)"
    />
    <q-select
      :model-value="current"
      :options="options"
      label="License"
      dense
      outlined
      emit-value
      map-options
      :readonly="ro || !!lock"
      :hint="lock ? `Required by “${lock.because}” (${licenseName(lock.license)})` : selectedTerms"
      @update:model-value="(v: string) => set('license', v)"
    >
      <template #prepend><q-icon v-if="lock" name="lock" size="xs" /></template>
      <template #option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
            <q-item-label caption>{{ scope.opt.terms }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
    <div v-if="kind === 'project'">
      <div class="text-caption text-grey-7">Units</div>
      <q-btn-toggle
        :model-value="project.doc!.units"
        no-caps
        :disable="ro"
        :options="[
          { label: 'Inches', value: 'in' },
          { label: 'Centimeters', value: 'cm' },
        ]"
        @update:model-value="setUnits"
      />
      <div class="text-caption text-grey-7 q-mt-xs">
        Converts every size in the project (10 in → 25.4 cm). Undo reverts.
      </div>
    </div>
    <div v-if="kind === 'project'">
      <q-checkbox
        :model-value="!!project.doc!.project.includeLibraryImages"
        :disable="ro"
        label="Include library fabric images when saving"
        @update:model-value="setIncludeImages"
      />
      <div class="text-caption text-grey-7">
        Adds 256 px images of the library fabrics this project uses, for sharing with someone who
        doesn't have those libraries. Fabrics whose license forbids sharing are left out. The
        project still says which libraries it uses, so anyone you share it with can add them.
      </div>
    </div>
    <template v-if="kind === 'project' && missingLibraries.length">
      <div class="text-subtitle2 q-mt-sm">Libraries this device doesn't have</div>
      <q-list dense bordered separator class="rounded-borders">
        <q-item v-for="l in missingLibraries" :key="l.id">
          <q-item-section>
            <q-item-label
              >{{ l.name }}<template v-if="l.author"> by {{ l.author }}</template></q-item-label
            >
            <q-item-label caption>
              {{ l.url ?? l.file ?? 'Ask whoever shared the project for it' }}
            </q-item-label>
          </q-item-section>
          <q-item-section v-if="l.url" side>
            <q-btn
              flat
              dense
              no-caps
              color="primary"
              label="Connect"
              :loading="connecting === l.id"
              @click="connectLibrary(l)"
            />
          </q-item-section>
        </q-item>
      </q-list>
      <div class="text-caption text-grey-7">
        Their fabrics show as average colors until you connect them or import them in Libraries.
      </div>
    </template>
    <q-input
      :model-value="item.notes ?? ''"
      label="Notes"
      type="textarea"
      autogrow
      :input-style="{ minHeight: '8em' }"
      dense
      outlined
      :readonly="ro"
      @update:model-value="(v) => set('notes', v)"
      @blur="(e: Event) => set('notes', (e.target as HTMLInputElement).value, true)"
    />

    <div v-if="quilt" class="row items-center" style="gap: 8px">
      <q-btn outline no-caps icon="download" label="Download image" @click="downloadImage" />
      <div v-if="quilt.target?.visible" class="text-caption text-grey-7 col">
        With the reference overlay (it's enabled in Layout).
      </div>
    </div>

    <template v-if="credits.length">
      <div class="text-subtitle2 q-mt-sm">Based on</div>
      <q-list dense bordered separator class="rounded-borders">
        <q-item v-for="(c, i) in credits" :key="i">
          <q-item-section>
            <q-item-label
              >{{ c.name ?? 'Earlier work' }} by {{ c.author ?? 'anonymous' }}</q-item-label
            >
            <q-item-label caption>{{ creditCaption(c) }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </template>

    <template v-if="others.length">
      <div class="text-subtitle2 q-mt-sm">Blocks by others</div>
      <q-list dense bordered separator class="rounded-borders">
        <q-item v-for="u in others" :key="u.block.id">
          <q-item-section>
            <q-item-label>
              {{ u.block.notecard.name }}
              <template v-if="!u.own"> by {{ u.author }}</template>
            </q-item-label>
            <q-item-label caption>
              {{ licenseName(u.license) }}
              <template v-if="u.credits.length">
                · based on work by
                {{ [...new Set(u.credits.map((c) => c.author ?? 'anonymous'))].join(', ') }}
              </template>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </template>
  </div>
</template>

<script setup lang="ts">
import QuiltColorways from '@/components/QuiltColorways.vue';
import { saveQuiltImage } from '@/render/save-image';
import { useLibraryStore } from '@/stores/library';
// Details tab (spec 009): title, notes, author, license, and who to credit — for the project, a
// quilt, or a block. Each field is its own coalesced undo step.
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import { retryMissing } from '@/render/fabric-images';
import {
  DEFAULT_LICENSE,
  LICENSES,
  blockLock,
  blocksByOthers,
  licenseName,
  priorCredits,
  quiltLock,
} from '@/model/credits';
import { isLibraryItem } from '@/model/library-items';
import type { LibraryRef, Units } from '@/model/schema/project';
import type { Credit } from '@/model/schema/shared';
import { convertUnits } from '@/model/units';
import { useProjectStore } from '@/stores/project';
import { useSettingsStore } from '@/stores/settings';

const props = defineProps<{ kind: 'project' | 'quilt' | 'block'; id?: string }>();

const project = useProjectStore();
const $q = useQuasar();
const app = useSettingsStore();
const ro = computed(() => project.readOnly);
const me = computed(() => app.settings.author);

const target = computed(() => {
  const p = project.doc?.project;
  if (!p) return undefined;
  if (props.kind === 'quilt') return p.quilts.find((q) => q.id === props.id);
  if (props.kind === 'block') return p.blocks.find((b) => b.id === props.id);
  return undefined;
});

const item = computed(() => {
  const p = project.doc?.project;
  if (!p) return undefined;
  if (props.kind === 'project')
    return {
      name: p.name,
      notes: p.notes,
      author: p.author,
      license: p.license ?? DEFAULT_LICENSE,
    };
  const t = target.value;
  return (
    t && { name: t.notecard.name, notes: t.notecard.notes, author: t.author, license: t.license }
  );
});

/** The quilt (Details of a quilt): its picture can be downloaded. */
const quilt = computed(() =>
  props.kind === 'quilt' && target.value && 'layout' in target.value ? target.value : undefined,
);
/** A PNG of the quilt; the reference overlay only when it's switched on in Layout. */
const downloadImage = () => quilt.value && saveQuiltImage(project.doc!, quilt.value, true);
const credits = computed(() => (target.value ? priorCredits(target.value) : []));
const others = computed(() =>
  props.kind === 'quilt' && project.doc && target.value && 'layout' in target.value
    ? blocksByOthers(project.doc, target.value, me.value)
    : [],
);
const lock = computed(() => {
  const t = target.value;
  if (!t || !project.doc) return undefined;
  return 'layout' in t ? quiltLock(project.doc, t) : blockLock(t);
});

/** Libraries the project's file names that this device doesn't have (spec 014 FR-032). */
const libStore = useLibraryStore();
const missingLibraries = computed(() =>
  (project.doc?.project.libraries ?? []).filter((l) => libStore.lacking(l).length),
);
const connecting = ref<string | null>(null);
async function connectLibrary(l: LibraryRef) {
  connecting.value = l.id;
  try {
    const skipped = await libStore.connectRef(l, useSettingsStore().settings.imageSize);
    retryMissing();
    $q.notify({
      type: 'positive',
      message: `${l.name} added` + (skipped.length ? ` (${skipped.length} skipped)` : ''),
    });
  } catch (e) {
    $q.notify({ type: 'negative', message: `${l.name}: ${(e as Error).message}` });
  } finally {
    connecting.value = null;
  }
}
function setIncludeImages(on: boolean) {
  project.change((d) => {
    if (on) d.project.includeLibraryImages = true;
    else delete d.project.includeLibraryImages;
  });
}

const projectLicense = computed(() => project.doc?.project.license ?? DEFAULT_LICENSE);
/** Items without their own license (older files) show the project's. */
const current = computed(
  () => lock.value?.license ?? (item.value?.license || projectLicense.value),
);
const options = computed(() => [
  ...LICENSES.map((l) => ({ value: l.id, label: l.name, terms: l.terms })),
  // A license from a library we don't offer stays visible as-is.
  ...(current.value && !LICENSES.some((l) => l.id === current.value)
    ? [{ value: current.value, label: licenseName(current.value), terms: '' }]
    : []),
]);
const selectedTerms = computed(() => LICENSES.find((l) => l.id === current.value)?.terms);

const creditCaption = (c: Credit) =>
  [c.library, c.license && licenseName(c.license)].filter(Boolean).join(' · ');

function setUnits(units: Units) {
  project.change(() => convertUnits(project.doc!, units));
}

type Field = 'name' | 'notes' | 'author' | 'license';
/** Typing keeps spaces as typed; leaving the field (`final`) trims them. */
function set(field: Field, raw: string | number | null, final = false) {
  const text = String(raw ?? '');
  if (field === 'name' && !text.trim()) return;
  const value = text.trim() ? (final ? text.trim() : text) : '';
  project.change(
    (d) => {
      const p = d.project;
      const t =
        props.kind === 'quilt'
          ? p.quilts.find((q) => q.id === props.id)
          : props.kind === 'block'
            ? p.blocks.find((b) => b.id === props.id)
            : undefined;
      if (props.kind !== 'project' && !t) return;
      // Items keep the license they had: pin those still following the old project license.
      if (field === 'license' && !t) {
        const old = p.license ?? DEFAULT_LICENSE;
        for (const x of [...p.blocks, ...p.quilts])
          if (!x.license && !isLibraryItem(x) && !x.notecard.tags?.includes('system'))
            x.license = old;
      }
      if (field === 'name') {
        if (t) t.notecard.name = value;
        else p.name = value;
        return;
      }
      if (field === 'notes') {
        const h = t ? t.notecard : p;
        if (value) h.notes = value;
        else delete h.notes;
        return;
      }
      const h = t ?? p;
      if (value) h[field] = value;
      else delete h[field];
    },
    { coalesce: `details-${props.kind}-${props.id ?? ''}-${field}` },
  );
}
</script>

<style scoped>
.revision {
  text-decoration: underline dotted;
  cursor: help;
}
</style>
