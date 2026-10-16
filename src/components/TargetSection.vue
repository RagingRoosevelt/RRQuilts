<template>
  <!-- Layout tab: the quilt's target size outline (spec 006 FR-001a). -->
  <div class="column q-mt-lg" style="gap: 8px">
    <div class="row items-center">
      <div class="text-subtitle2 col">Target size</div>
      <q-toggle
        v-if="target"
        :model-value="target.visible"
        label="Show"
        left-label
        dense
        :disable="readonly"
        @update:model-value="(v) => emit('change', { ...target!, visible: v }, '')"
      />
    </div>
    <TargetEditor
      :model-value="input"
      :units="units"
      :readonly="readonly"
      hint="An outline over the quilt, to size it to"
      @update:model-value="edit"
    />
    <div v-if="target" class="text-caption text-grey-8">
      {{ target.label }}, {{ size }} {{ units }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import TargetEditor from '@/components/TargetEditor.vue';
import type { QuiltTarget } from '@/model/schema/quilt';
import { defaultRegion, resolveTarget, shapeSize, type TargetInput } from '@/model/targets';
import { useSettingsStore } from '@/stores/settings';

const props = defineProps<{
  target: QuiltTarget | undefined;
  units: 'in' | 'cm';
  readonly: boolean;
}>();
const emit = defineEmits<{ change: [target: QuiltTarget | undefined, coalesce: string] }>();

const input = computed<TargetInput>(
  () =>
    (props.target?.input as TargetInput | undefined) ?? {
      choice: null,
      region: defaultRegion(useSettingsStore().settings.bedSizes, props.units),
    },
);
const size = computed(() => {
  if (!props.target) return '';
  const [w, h] = shapeSize(props.target);
  return `${+w.toFixed(2)} × ${+h.toFixed(2)}`;
});

/** A changed choice resolves to a new shape; None removes the target. */
function edit(next: TargetInput) {
  const shape = resolveTarget(next, props.units);
  if (!shape) return emit('change', undefined, '');
  // Typed fields coalesce into one undo step.
  emit('change', { visible: props.target?.visible ?? true, input: next, ...shape }, 'target');
}
</script>
