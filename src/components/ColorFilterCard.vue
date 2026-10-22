<template>
  <!-- Palettes with a swatch in a hue, value and saturation range (spec 033). Session only. -->
  <FilterCard label="Color">
    <div class="column" style="gap: 2px">
      <q-toggle v-model="model.hue.on" dense label="Hue" />
      <template v-if="model.hue.on">
        <div class="hue-strip" :style="{ background: strip }" aria-hidden="true">
          <span class="band" :style="band" />
        </div>
        <q-slider
          class="pad"
          v-model="model.hue.center"
          :min="0"
          :max="359"
          dense
          label
          :label-value="`${model.hue.center}°`"
          aria-label="Hue"
        />
        <div class="text-caption q-mt-sm">± {{ model.hue.range }}°</div>
        <q-slider
          v-model="model.hue.range"
          class="pad"
          :min="5"
          :max="180"
          dense
          aria-label="Hue range"
        />
      </template>
    </div>
    <div class="column section" style="gap: 2px">
      <q-toggle v-model="model.value.on" dense label="Value (dark to light)" />
      <q-range
        class="pad"
        v-if="model.value.on"
        :model-value="model.value"
        :min="0"
        :max="100"
        dense
        label
        aria-label="Value"
        @update:model-value="(v) => v && Object.assign(model.value, v)"
      />
    </div>
    <div class="column section" style="gap: 2px">
      <q-toggle v-model="model.sat.on" dense label="Saturation (muted to vivid)" />
      <q-range
        class="pad"
        v-if="model.sat.on"
        :model-value="model.sat"
        :min="0"
        :max="100"
        dense
        label
        aria-label="Saturation"
        @update:model-value="(v) => v && Object.assign(model.sat, v)"
      />
    </div>
    <div v-if="colorFilterOn(model)" class="column section" style="gap: 2px">
      <q-toggle v-model="model.onlyMatching" dense label="Hide non-matching swatches" />
      <div class="text-caption text-grey-7">
        Fabrics count by their average color, which can mislead for busy prints.
      </div>
    </div>
  </FilterCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import FilterCard from './FilterCard.vue';
import { colorFilterOn, hueColor, type ColorFilter } from '@/model/palette-color-filter';

const model = defineModel<ColorFilter>({ required: true });
const strip = `linear-gradient(to right, ${Array.from({ length: 13 }, (_, i) => hueColor(i * 30)).join(', ')})`;
/** The picked range over the strip. ponytail: a range past 0°/360° is cut at the strip's end
 *  (the filter itself wraps); draw the other piece too if that confuses. */
const band = computed(() => {
  const { center, range } = model.value.hue;
  const lo = Math.max(0, center - range) / 3.6;
  const hi = Math.min(360, center + range) / 3.6;
  return { left: `${lo}%`, width: `${hi - lo}%` };
});
</script>

<style scoped>
.hue-strip {
  position: relative;
  height: 14px;
  border-radius: 7px;
  overflow: hidden;
  margin: 4px 16px 0;
}
.band {
  position: absolute;
  top: 0;
  bottom: 0;
  border: 2px solid #fff;
  outline: 1px solid rgba(0, 0, 0, 0.5);
  border-radius: 7px;
}
/* Room for the thumbs and their labels at both ends. */
.pad {
  padding: 0 16px;
}
.section {
  margin-top: 12px;
}
</style>
