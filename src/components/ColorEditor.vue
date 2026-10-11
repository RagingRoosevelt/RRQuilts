<template>
  <q-dialog v-model="open">
    <q-card style="width: 340px">
      <q-card-section class="q-gutter-sm">
        <div class="text-h6">{{ title }}</div>
        <div class="swatch" :style="{ background: hex }" />
        <q-input v-model="name" dense label="Name" />
        <q-tabs v-model="tab" dense no-caps align="left">
          <q-tab name="picker" label="Picker" />
          <q-tab name="hsl" label="HSL" />
        </q-tabs>
        <q-color
          v-if="tab === 'picker'"
          :model-value="hex"
          no-header-tabs
          default-view="spectrum"
          format-model="hex"
          @update:model-value="(v) => setHex(String(v ?? ''))"
        />
        <div v-else>
          <div v-for="(label, i) in ['Hue', 'Saturation', 'Lightness']" :key="label">
            <div class="text-caption">{{ label }} {{ hsl[i] }}</div>
            <q-slider
              :model-value="hsl[i]"
              :min="0"
              :max="i === 0 ? 360 : 100"
              @update:model-value="(v) => setHsl(i, v ?? 0)"
            />
          </div>
        </div>
        <div class="row q-gutter-sm">
          <q-input
            :model-value="hex"
            dense
            label="Hex"
            style="width: 110px"
            @update:model-value="(v) => setHex(String(v ?? ''))"
          />
          <q-input
            v-for="(c, i) in ['R', 'G', 'B']"
            :key="c"
            :model-value="rgb[i]"
            dense
            type="number"
            :label="c"
            style="width: 56px"
            @update:model-value="(v) => setChannel(i, Number(v))"
          />
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat no-caps label="Cancel" @click="open = false" />
        <q-btn unelevated no-caps color="primary" :label="okLabel" @click="ok" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { fromHex, fromHsl, toHex, toHsl, type RGB } from '@/editor/color';

const emit = defineEmits<{ done: [color: { name: string; rgb: RGB }] }>();
const open = ref(false);
const tab = ref<'picker' | 'hsl'>('picker');
const name = ref('');
const rgb = ref<RGB>([200, 40, 44]);
const title = ref('Add a color');
const okLabel = ref('Add');

const hex = computed(() => toHex(rgb.value));
const hsl = computed(() => toHsl(rgb.value));

function setHex(v: string) {
  const c = fromHex(v);
  if (c) rgb.value = c;
}
function setHsl(i: number, v: number) {
  const next = [...hsl.value] as RGB;
  next[i] = v;
  rgb.value = fromHsl(next);
}
function setChannel(i: number, v: number) {
  const next = [...rgb.value] as RGB;
  next[i] = Math.max(0, Math.min(255, Math.round(v || 0)));
  rgb.value = next;
}
function ok() {
  open.value = false;
  emit('done', { name: name.value.trim() || hex.value, rgb: rgb.value });
}

/** Open for adding (no args) or editing an existing color. */
function show(initial?: { name: string; rgb: RGB }) {
  name.value = initial?.name ?? '';
  rgb.value = initial ? [...initial.rgb] : [200, 40, 44];
  title.value = initial ? 'Edit color' : 'Add a color';
  okLabel.value = initial ? 'Save' : 'Add';
  open.value = true;
}
defineExpose({ show });
</script>

<style scoped>
.swatch {
  height: 40px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}
</style>
