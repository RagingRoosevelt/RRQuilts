<template>
  <!-- Manual testing checklist (Tests tab, dev server only); progress stays in this browser. -->
  <div>
    <div class="bar">
      <span class="text-subtitle2">Build {{ build }}</span>
      <q-chip dense :color="problems ? 'negative' : 'positive'" text-color="white">
        {{ done }} of {{ CHECKS.length }} tested{{ problems ? `, ${problems} with problems` : ''
        }}{{ iterating ? `, ${iterating} to iterate` : '' }}
      </q-chip>
      <q-toggle v-model="openOnly" dense label="Hide what works" />
      <q-btn flat dense no-caps icon="content_copy" label="Copy results" @click="copyResults" />
      <q-btn flat dense no-caps icon="restart_alt" label="Start over" @click="reset" />
    </div>
    <section v-for="g in groups" :key="g.name" class="sec">
      <h2 class="text-h6">
        {{ g.name }}
        <small>{{ g.checks.filter((c) => state[stateKey(c)]).length }}/{{ g.checks.length }}</small>
      </h2>
      <template v-for="c in g.checks" :key="c.id">
        <div
          v-if="!openOnly || state[stateKey(c)]?.status !== 'ok'"
          :id="checkId(c)"
          class="check"
          :class="state[stateKey(c)]?.status"
        >
          <span class="ref">{{ checkId(c) }}</span>
          <div class="text">
            {{ c.text }}
            <router-link v-if="c.to" :to="c.to" class="q-ml-xs">Open</router-link>
            <a
              v-if="c.file && sampleUrl(c.file)"
              :href="sampleUrl(c.file)"
              :download="c.file"
              class="q-ml-xs"
              >Download {{ c.file }}</a
            >
            <q-input
              v-if="
                state[stateKey(c)]?.status === 'problem' || state[stateKey(c)]?.status === 'iterate'
              "
              :model-value="state[stateKey(c)]!.note ?? ''"
              dense
              outlined
              autogrow
              :placeholder="
                state[stateKey(c)]?.status === 'iterate' ? 'What to change next' : 'What went wrong'
              "
              class="q-mt-xs"
              @update:model-value="(v) => setNote(stateKey(c), String(v ?? ''))"
            />
          </div>
          <q-btn-toggle
            :model-value="state[stateKey(c)]?.status ?? ''"
            dense
            no-caps
            unelevated
            :toggle-color="statusColor(state[stateKey(c)]?.status)"
            :options="STATUS"
            @update:model-value="(v: string) => setStatus(stateKey(c), v)"
          />
        </div>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { copyToClipboard, useQuasar } from 'quasar';
import {
  CHECKS,
  fetchBuild,
  sampleUrl,
  loadChecks,
  saveChecks,
  stateKey,
  VERSION,
  type Check,
  type CheckState,
} from '@/dev/checklist';

const $q = useQuasar();
const STATUS = [
  { label: 'Not tested', value: '' },
  { label: 'Works', value: 'ok' },
  { label: 'Needs iteration', value: 'iterate' },
  { label: 'Problem', value: 'problem' },
];
const state = ref<Record<string, CheckState>>(loadChecks());
const openOnly = ref(false);
/** The build being tested now (the version until the dev server says). */
const build = ref(VERSION);
onMounted(async () => (build.value = await fetchBuild()));
/** As shown: tested on (or, untested, to be tested on) which build. */
const checkId = (c: Check) => `${state.value[stateKey(c)]?.build ?? build.value}-${c.id}`;
const statusColor = (s?: string) =>
  s === 'ok' ? 'positive' : s === 'problem' ? 'negative' : s === 'iterate' ? 'warning' : 'grey-7';
const done = computed(() => CHECKS.filter((c) => state.value[stateKey(c)]).length);
const problems = computed(
  () => CHECKS.filter((c) => state.value[stateKey(c)]?.status === 'problem').length,
);
const iterating = computed(
  () => CHECKS.filter((c) => state.value[stateKey(c)]?.status === 'iterate').length,
);
const groups = computed(() => {
  const out: { name: string; checks: typeof CHECKS }[] = [];
  for (const c of CHECKS) {
    if (out.at(-1)?.name !== c.group) out.push({ name: c.group, checks: [] });
    out.at(-1)!.checks.push(c);
  }
  return out;
});

function commit(next: Record<string, CheckState>) {
  state.value = next;
  saveChecks(next);
}
function setStatus(id: string, status: string) {
  const { [id]: old, ...rest } = state.value;
  if (status !== 'ok' && status !== 'iterate' && status !== 'problem') return commit(rest);
  commit({
    ...rest,
    [id]: {
      status,
      ...(old?.note ? { note: old.note } : {}),
      at: new Date().toISOString(),
      build: build.value,
    },
  });
}
function setNote(id: string, note: string) {
  const old = state.value[id];
  if (old) commit({ ...state.value, [id]: { ...old, note } });
}
/** Plain text to paste back to Claude: problems (with notes) first, then works, then not tested. */
function copyResults() {
  const line = (c: Check) => `- ${checkId(c)} ${c.text}`;
  const by = (s: string) => CHECKS.filter((c) => (state.value[stateKey(c)]?.status ?? '') === s);
  const withNote = (c: Check) => {
    const note = state.value[stateKey(c)]?.note?.trim();
    return [line(c), ...(note ? [`  Note: ${note.replace(/\n/g, '\n  ')}`] : [])];
  };
  const sections = [
    ['Problems', by('problem').flatMap(withNote)],
    ['Needs iteration', by('iterate').flatMap(withNote)],
    ['Works', by('ok').map(line)],
    ['Not tested', by('').map(line)],
  ] as const;
  const text = [
    `Test results, build ${build.value} (${new Date().toISOString().slice(0, 10)})`,
    `Works ${by('ok').length} · Needs iteration ${by('iterate').length} · Problems ${by('problem').length} · Not tested ${by('').length}`,
    ...sections.flatMap(([title, lines]) => (lines.length ? ['', `${title}:`, ...lines] : [])),
  ].join('\n');
  copyToClipboard(text).then(
    () => $q.notify({ message: 'Results copied. Paste them to Claude.', timeout: 2000 }),
    () => $q.notify({ type: 'negative', message: 'Copying was blocked by the browser.' }),
  );
}
function reset() {
  $q.dialog({
    title: 'Start over?',
    message: `Every check for ${VERSION} goes back to Not tested, and its notes are cleared.`,
    cancel: true,
    ok: { label: 'Start over', color: 'negative', flat: true },
  }).onOk(() =>
    // Other builds' progress stays.
    commit(
      Object.fromEntries(
        Object.entries(state.value).filter(
          // The carried-forward mark stays, or the old results would come back on reload.
          ([k]) => !k.startsWith(`${VERSION}:`) || k.endsWith('@carried'),
        ),
      ),
    ),
  );
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
  gap: 8px;
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
.check {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 8px 12px;
  align-items: start;
  padding: 8px 10px;
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 6px;
}
.check.ok {
  border-color: var(--q-positive);
}
.check.iterate {
  border-color: var(--q-warning);
}
.check.problem {
  border-color: var(--q-negative);
}
@media (max-width: 700px) {
  .check {
    grid-template-columns: auto minmax(0, 1fr);
  }
  .check .q-btn-group {
    grid-column: 1 / -1;
    justify-self: start;
  }
}
.ref {
  font-family: ui-monospace, monospace;
  font-size: 0.8rem;
  padding: 1px 8px;
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 4px;
  user-select: all;
}
.text {
  max-width: 80ch;
}
</style>
