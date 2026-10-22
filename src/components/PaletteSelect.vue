<template>
  <!-- A palette picker: each palette in the list with its swatches under its name, and the picked
       one's swatches under the field. -->
  <div class="column no-wrap">
    <q-select
      v-bind="$attrs"
      :model-value="modelValue"
      :options="options"
      option-value="id"
      option-label="label"
      emit-value
      map-options
      dense
      outlined
      @update:model-value="(v) => emit('update:modelValue', v)"
    >
      <template #option="{ opt, itemProps }">
        <q-item v-bind="itemProps">
          <q-item-section>
            <q-item-label>{{ opt.label }}</q-item-label>
            <div v-if="opt.colors?.length" class="swatches">
              <span
                v-for="c in opt.colors.slice(0, 24)"
                :key="c.id"
                class="dot"
                :style="optStyle(c)"
              />
            </div>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
    <div v-if="chosen?.colors?.length" class="swatches" aria-label="The palette's swatches">
      <span v-for="c in chosen.colors" :key="c.id" class="dot" :style="optStyle(c)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { optStyle, type Opt } from '@/composables/swap-options';

defineOptions({ inheritAttrs: false });
const props = defineProps<{
  modelValue: string | null;
  options: { id: string; label: string; colors?: Opt[] }[];
}>();
const emit = defineEmits<{ 'update:modelValue': [v: string | null] }>();
const chosen = computed(() => props.options.find((p) => p.id === props.modelValue));
</script>

<style scoped>
.swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 4px;
}
.dot {
  width: 22px;
  height: 22px;
  border-radius: 3px;
  border: 1px solid rgba(128, 128, 128, 0.45);
  background-size: cover;
}
</style>
