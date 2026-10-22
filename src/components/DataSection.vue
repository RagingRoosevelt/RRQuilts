<template>
  <!-- Details tab (spec 025): a quilt's Data quilt switch and plan, or a block's Data block switch
       and kind. -->
  <FieldGroup :label="quilt ? 'Data quilt' : 'Data block'" heading>
    <q-toggle
      :model-value="on"
      dense
      :label="quilt ? 'Data quilt' : 'Data block'"
      :disable="readonly"
      @update:model-value="setOn"
    />
    <div class="text-caption text-grey-7 q-mt-xs">
      <template v-if="quilt">
        Colors pieces from data, such as a year of temperatures: the Design tab places numbered data
        blocks and maps values to colors.
      </template>
      <template v-else>
        A type a data quilt places for each day, week or month: its Color tab numbers patches with
        day numerals.
      </template>
    </div>
    <template v-if="quilt?.data?.on">
      <SlidePicker
        :model-value="quilt.data.plan"
        :options="[
          { value: 'months', label: 'Months' },
          { value: 'weeks', label: 'Weeks' },
          { value: 'days', label: 'Days' },
        ]"
        label="Plan"
        class="q-mt-md"
        :class="{ 'no-pointer': readonly }"
        @update:model-value="setPlan"
      />
      <div class="text-caption text-grey-7 q-mt-xs">{{ PLAN_HINTS[quilt.data.plan] }}</div>
    </template>
    <template v-if="block?.data">
      <SlidePicker
        :model-value="block.data.kind"
        :options="[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
        ]"
        label="Data block type"
        class="q-mt-md"
        :class="{ 'no-pointer': readonly }"
        @update:model-value="setKind"
      />
      <div class="text-caption text-grey-7 q-mt-xs">
        {{ KIND_HINTS[block.data.kind] }}
      </div>
    </template>
  </FieldGroup>
</template>

<script setup lang="ts">
import { castDraft } from 'immer';
import { computed } from 'vue';
import FieldGroup from '@/components/FieldGroup.vue';
import SlidePicker from '@/components/SlidePicker.vue';
import { plainFill } from '@/model/coloring';
import { fitOrder, newDataPlan } from '@/model/data-quilt';
import type { Block, DataKind } from '@/model/schema/block';
import type { DataPlan } from '@/model/schema/data-quilt';
import type { Quilt } from '@/model/schema/quilt';
import { useEditorStore } from '@/stores/editor';
import { useProjectStore } from '@/stores/project';

const props = defineProps<{
  quilt?: Quilt | undefined;
  block?: Block | undefined;
  readonly?: boolean;
}>();
const project = useProjectStore();
const editor = useEditorStore();

const PLAN_HINTS: Record<DataPlan['plan'], string> = {
  months: 'A numbered block space per month, showing its month block’s variant for its days.',
  weeks:
    'A numbered block space per week of 7 days from the period start, then one per day left over (day 365, and 366 in a leap period).',
  days: 'A numbered block space per day of the period.',
};
const KIND_HINTS: Record<DataKind, string> = {
  day: 'Numerals: 1. A Days plan places it on every day, a Weeks plan on the days left over.',
  week: 'Numerals: 1 to 7.',
  month:
    'Numerals: 1 to 31. The Draw tab can add 30, 29 and 28-day variants; a month shows the smallest with enough days.',
};

const on = computed(() => !!(props.quilt ? props.quilt.data?.on : props.block?.data));

function setOn(v: boolean) {
  if (props.readonly) return;
  const q = props.quilt;
  if (q) {
    project.change((d) => {
      const dq = d.project.quilts.find((x) => x.id === q.id)!;
      if (dq.data) dq.data.on = v;
      else if (v) dq.data = newDataPlan(project.doc!.units, new Date().getFullYear() + 1);
    });
    if (v) {
      editor.tool = 'number';
      editor.dataNext = 1;
    }
    return;
  }
  const b = props.block;
  if (!b) return;
  project.change((d) => {
    const db = d.project.blocks.find((x) => x.id === b.id)!;
    if (v) db.data = { kind: 'month' };
    else {
      // Off: numerals give their pieces back the colors under them; variants go.
      dropVariants(db);
      delete db.data;
      for (const c of db.colorings)
        for (const [k, f] of Object.entries(c.fills)) {
          const under = 'data' in f ? plainFill(f) : f;
          if (under) c.fills[k] = castDraft(under);
          else delete c.fills[k];
        }
    }
  });
}

/** A month block's variants and their fills removed. */
function dropVariants(db: Block) {
  const gone = new Set((db.data?.variants ?? []).flatMap((v) => v.patches.map((p) => p.id)));
  if (db.data) delete db.data.variants;
  for (const c of db.colorings) for (const k of gone) delete c.fills[k];
}

function setKind(v: string) {
  const b = props.block;
  if (!b || props.readonly) return;
  project.change((d) => {
    const db = d.project.blocks.find((x) => x.id === b.id)!;
    if (v !== 'month') dropVariants(db);
    db.data = { ...db.data, kind: v as DataKind };
  });
}

function setPlan(v: string) {
  const q = props.quilt;
  if (!q?.data || props.readonly) return;
  const plan = v as DataPlan['plan'];
  const start = plan === 'months' ? `${q.data.start.slice(0, 8)}01` : q.data.start;
  const next = fitOrder({ ...q.data, plan, start });
  project.change((d) => {
    d.project.quilts.find((x) => x.id === q.id)!.data = castDraft(next);
  });
}
</script>

<style scoped>
.no-pointer {
  pointer-events: none;
}
</style>
