<template>
  <div v-if="item" class="column" style="gap: 12px; max-width: 560px">
    <q-input
      :model-value="item.name"
      label="Title"
      dense
      outlined
      :readonly="ro"
      debounce="300"
      @update:model-value="(v) => set('name', v)"
    />
    <q-input
      :model-value="item.notes ?? ''"
      label="Notes"
      type="textarea"
      autogrow
      dense
      outlined
      :readonly="ro"
      debounce="300"
      @update:model-value="(v) => set('notes', v)"
    />
    <q-input
      :model-value="item.author ?? ''"
      label="Author"
      placeholder="anonymous"
      dense
      outlined
      :readonly="ro"
      debounce="300"
      :hint="
        credits.length
          ? 'Whoever made this version. Earlier contributors stay credited below.'
          : undefined
      "
      @update:model-value="(v) => set('author', v)"
    />
    <q-select
      :model-value="lock?.license ?? item.license ?? ''"
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
// Details tab (spec 009): title, notes, author, license, and who to credit — for the project, a
// quilt, or a block. Each field is its own coalesced undo step.
import { computed } from 'vue';
import {
  DEFAULT_LICENSE,
  LICENSES,
  blockLock,
  blocksByOthers,
  licenseName,
  priorCredits,
  quiltLock,
} from '@/model/credits';
import type { Credit } from '@/model/schema/shared';
import { useProjectStore } from '@/stores/project';
import { useSettingsStore } from '@/stores/settings';

const props = defineProps<{ kind: 'project' | 'quilt' | 'block'; id?: string }>();

const project = useProjectStore();
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

const credits = computed(() => (target.value ? priorCredits(target.value) : []));
const others = computed(() =>
  props.kind === 'quilt' && project.doc && target.value && 'layout' in target.value
    ? blocksByOthers(project.doc, target.value, me.value)
    : [],
);
const lock = computed(() => {
  const t = target.value;
  if (!t || !project.doc) return undefined;
  return 'layout' in t ? quiltLock(project.doc, t, me.value) : blockLock(t);
});

const projectLicense = computed(() => project.doc?.project.license ?? DEFAULT_LICENSE);
const options = computed(() => [
  ...(props.kind === 'project'
    ? []
    : [
        {
          value: '',
          label: `Project license (${licenseName(projectLicense.value)})`,
          terms: "Follows the project's license",
        },
      ]),
  ...LICENSES.map((l) => ({ value: l.id, label: l.name, terms: l.terms })),
  // A license from a library we don't offer stays visible as-is.
  ...(lock.value && !LICENSES.some((l) => l.id === lock.value!.license)
    ? [{ value: lock.value.license, label: licenseName(lock.value.license), terms: '' }]
    : []),
]);
const selectedTerms = computed(() => {
  const id = item.value?.license || projectLicense.value;
  return LICENSES.find((l) => l.id === id)?.terms;
});

const creditCaption = (c: Credit) =>
  [c.library, c.license && licenseName(c.license)].filter(Boolean).join(' · ');

type Field = 'name' | 'notes' | 'author' | 'license';
function set(field: Field, raw: string | number | null) {
  const value = String(raw ?? '').trim();
  if (field === 'name' && !value) return;
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
