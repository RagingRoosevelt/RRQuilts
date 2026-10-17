<template>
  <!-- Layout tab: the quilt's target size outline (spec 006 FR-001a). -->
  <div class="column q-mt-lg" style="gap: 8px">
    <FieldGroup label="Reference overlay" heading>
      <template v-if="target" #aside>
        <q-toggle
          :model-value="target.visible"
          label="Show"
          left-label
          dense
          :disable="readonly"
          @update:model-value="(v) => emit('change', { ...target!, visible: v }, '')"
        />
      </template>
    </FieldGroup>
    <div class="text-caption text-grey-8">A size to aim for, drawn over the quilt</div>
    <!-- Switched off (Show): the settings stay as they are, greyed out, until it's on again. -->
    <div class="column" :class="{ off }" style="gap: 8px">
      <TargetEditor
        :model-value="input"
        :units="units"
        :readonly="readonly || off"
        @update:model-value="edit"
      />
      <div v-if="target" class="text-caption text-grey-8">
        {{ target.label }}, {{ size }} {{ units }}
      </div>
      <div v-if="target" class="row items-center no-wrap q-pl-sm q-pr-md" style="gap: 12px">
        <div class="text-caption">Fill</div>
        <q-slider
          class="col"
          :model-value="Math.round((target.opacity ?? OVERLAY_OPACITY) * 100)"
          :min="0"
          :max="100"
          :step="5"
          label
          :label-value="`${Math.round((target.opacity ?? OVERLAY_OPACITY) * 100)}%`"
          :disable="readonly || off"
          aria-label="Overlay opacity"
          @update:model-value="
            (v) => v !== null && emit('change', { ...target!, opacity: v / 100 }, 'target-opacity')
          "
        />
      </div>
      <div v-if="target" class="row items-center no-wrap q-pl-sm" style="gap: 12px">
        <div class="text-caption">Tint</div>
        <input
          type="color"
          class="tint"
          :value="target.tint ?? OVERLAY_TINT"
          :disabled="readonly || off"
          aria-label="Overlay tint"
          @change="
            (e) => emit('change', { ...target!, tint: (e.target as HTMLInputElement).value }, '')
          "
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import FieldGroup from '@/components/FieldGroup.vue';
import TargetEditor from '@/components/TargetEditor.vue';
import type { QuiltTarget } from '@/model/schema/quilt';
import {
  defaultRegion,
  OVERLAY_OPACITY,
  OVERLAY_TINT,
  resolveTarget,
  shapeSize,
  type TargetInput,
} from '@/model/targets';
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
const off = computed(() => !!props.target && !props.target.visible);
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
  const { opacity, tint } = props.target ?? {};
  emit(
    'change',
    {
      visible: props.target?.visible ?? true,
      ...(opacity !== undefined ? { opacity } : {}),
      ...(tint !== undefined ? { tint } : {}),
      input: next,
      ...shape,
    },
    'target',
  );
}
</script>

<style scoped>
.tint {
  width: 40px;
  height: 24px;
  padding: 0;
  border: 1px solid rgba(128, 128, 128, 0.5);
  border-radius: 4px;
  background: none;
  cursor: pointer;
}
.off {
  opacity: 0.45;
  pointer-events: none;
}
</style>
