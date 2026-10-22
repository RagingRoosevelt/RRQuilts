<template>
  <!-- A data quilt's room (spec 025): whole block spaces against the numbers its plan needs. Spaces
       cut down at the quilt's edge don't count. -->
  <div class="row no-wrap items-start text-caption" style="gap: 6px" aria-live="polite">
    <q-icon
      :name="have < need ? 'warning' : 'grid_view'"
      :color="have < need ? 'warning' : 'grey-7'"
      size="16px"
    />
    <span>
      {{ have }} whole block space{{ have === 1 ? '' : 's' }} for data blocks, {{ need }} needed for
      the {{ PLAN[plan] }}.
      <template v-if="have < need">{{ need - have }} short.</template>
      <template v-else-if="have > need">{{ have - need }} left over.</template>
      Blocks cut down at the edge don’t count.
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Generated } from '@/model/layout/slots';
import type { DataPlan } from '@/model/schema/data-quilt';
import { blockSpaceNumbers } from '@/render/data-overlay';

const props = defineProps<{ generated: Generated; plan: DataPlan['plan']; need: number }>();
const PLAN: Record<DataPlan['plan'], string> = {
  months: 'months',
  weeks: 'weeks and the days left over',
  days: 'days',
};
const have = computed(() => blockSpaceNumbers(props.generated).size);
</script>
