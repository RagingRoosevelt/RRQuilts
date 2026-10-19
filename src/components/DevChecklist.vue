<template>
  <!-- Manual testing checklist (Tests tab, dev server only); progress stays in this browser. -->
  <div>
    <div class="bar">
      <span class="text-subtitle2">Build {{ BUILD }}</span>
      <q-chip dense :color="problems ? 'negative' : 'positive'" text-color="white">
        {{ done }} of {{ CHECKS.length }} tested{{ problems ? `, ${problems} with problems` : '' }}
      </q-chip>
      <q-toggle v-model="openOnly" dense label="Hide what works" />
      <q-btn flat dense no-caps icon="content_copy" label="Copy results" @click="copyResults" />
      <q-btn flat dense no-caps icon="restart_alt" label="Start over" @click="reset" />
    </div>
    <section v-for="g in groups" :key="g.name" class="sec">
      <h2 class="text-h6">
        {{ g.name }}
        <small>{{ g.checks.filter((c) => state[checkId(c)]).length }}/{{ g.checks.length }}</small>
      </h2>
      <template v-for="c in g.checks" :key="c.id">
        <div
          v-if="!openOnly || state[checkId(c)]?.status !== 'ok'"
          :id="checkId(c)"
          class="check"
          :class="state[checkId(c)]?.status"
        >
          <span class="ref">{{ checkId(c) }}</span>
          <div class="text">
            {{ c.text }}
            <router-link v-if="c.to" :to="c.to" class="q-ml-xs">Open</router-link>
            <q-input
              v-if="state[checkId(c)]?.status === 'problem'"
              :model-value="state[checkId(c)]!.note ?? ''"
              dense
              outlined
              autogrow
              placeholder="What went wrong"
              class="q-mt-xs"
              @update:model-value="(v) => setNote(checkId(c), String(v ?? ''))"
            />
          </div>
          <q-btn-toggle
            :model-value="state[checkId(c)]?.status ?? ''"
            dense
            no-caps
            unelevated
            :toggle-color="statusColor(state[checkId(c)]?.status)"
            :options="STATUS"
            @update:model-value="(v: string) => setStatus(checkId(c), v)"
          />
        </div>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { copyToClipboard, useQuasar } from 'quasar';
import { BUILD, CHECKS, checkId, loadChecks, saveChecks, type CheckState } from '@/dev/checklist';

const $q = useQuasar();
const STATUS = [
  { label: 'Not tested', value: '' },
  { label: 'Works', value: 'ok' },
  { label: 'Problem', value: 'problem' },
];
const state = ref<Record<string, CheckState>>(loadChecks());
const openOnly = ref(false);
const statusColor = (s?: string) =>
  s === 'ok' ? 'positive' : s === 'problem' ? 'negative' : 'grey-7';
const done = computed(() => CHECKS.filter((c) => state.value[checkId(c)]).length);
const problems = computed(
  () => CHECKS.filter((c) => state.value[checkId(c)]?.status === 'problem').length,
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
  if (status !== 'ok' && status !== 'problem') return commit(rest);
  commit({
    ...rest,
    [id]: { status, ...(old?.note ? { note: old.note } : {}), at: new Date().toISOString() },
  });
}
function setNote(id: string, note: string) {
  const old = state.value[id];
  if (old) commit({ ...state.value, [id]: { ...old, note } });
}
/** Plain text to paste back to Claude: problems (with notes) first, then works, then not tested. */
function copyResults() {
  const line = (c: (typeof CHECKS)[number]) => `- ${checkId(c)} ${c.text}`;
  const by = (s: string) => CHECKS.filter((c) => (state.value[checkId(c)]?.status ?? '') === s);
  const sections = [
    [
      'Problems',
      by('problem').flatMap((c) => {
        const note = state.value[checkId(c)]?.note?.trim();
        return [line(c), ...(note ? [`  Note: ${note.replace(/\n/g, '\n  ')}`] : [])];
      }),
    ],
    ['Works', by('ok').map(line)],
    ['Not tested', by('').map(line)],
  ] as const;
  const text = [
    `Test results, build ${BUILD} (${new Date().toISOString().slice(0, 10)})`,
    `Works ${by('ok').length} · Problems ${by('problem').length} · Not tested ${by('').length}`,
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
    message: `Every check of build ${BUILD} goes back to Not tested, and its notes are cleared.`,
    cancel: true,
    ok: { label: 'Start over', color: 'negative', flat: true },
  }).onOk(() =>
    // Other builds' progress stays.
    commit(
      Object.fromEntries(Object.entries(state.value).filter(([k]) => !k.startsWith(`${BUILD}-`))),
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
