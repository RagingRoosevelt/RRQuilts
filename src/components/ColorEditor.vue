<template>
  <q-dialog v-model="open" @show="nameInput?.select()">
    <q-card style="width: 340px; max-width: 95vw">
      <q-card-section class="column no-wrap" style="gap: 8px">
        <div class="text-h6">{{ title }}</div>
        <div class="swatch" :style="{ background: hex }" />
        <q-input ref="nameInput" v-model="name" dense label="Name" />
        <q-tabs v-model="tab" dense no-caps align="left">
          <q-tab name="picker" label="Picker" />
          <q-tab name="rgb" label="RGB" />
        </q-tabs>
        <!-- no-wrap above: in a wrapping column Firefox sizes QColor too short and clips the hue slider. -->
        <q-color
          v-if="tab === 'picker'"
          :model-value="hex"
          no-header-tabs
          no-footer
          default-view="spectrum"
          format-model="hex"
          @update:model-value="(v) => setHex(String(v ?? ''))"
        />
        <div v-else class="column" style="gap: 6px">
          <q-input
            :model-value="hex"
            dense
            label="Hex"
            @update:model-value="(v) => setHex(String(v ?? ''))"
          />
          <!-- One row per channel: a number (0–255) and a slider for the same value. -->
          <div
            v-for="(c, i) in ['R', 'G', 'B']"
            :key="c"
            class="row items-center no-wrap"
            style="gap: 10px"
          >
            <q-input
              :key="`${c}${clampTick}`"
              :model-value="rgb[i]"
              dense
              type="number"
              :min="0"
              :max="255"
              :label="c"
              style="width: 72px; flex: none"
              @update:model-value="(v) => setChannel(i, Number(v))"
            />
            <q-slider
              :model-value="rgb[i]!"
              :min="0"
              :max="255"
              class="col"
              @update:model-value="(v) => setChannel(i, v ?? 0)"
            />
          </div>
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
import type { QInput } from 'quasar';
import { computed, ref } from 'vue';
import { fromHex, toHex, type RGB } from '@/editor/color';

const emit = defineEmits<{ done: [color: { name: string; rgb: RGB }] }>();
const open = ref(false);
const tab = ref<'picker' | 'hsl'>('picker');
const name = ref('');
const rgb = ref<RGB>([200, 40, 44]);
const title = ref('Add a color');
const okLabel = ref('Add');
/** Opening the editor focuses and selects the name, ready to retype. */
const nameInput = ref<QInput>();

const hex = computed(() => toHex(rgb.value));

function setHex(v: string) {
  const c = fromHex(v);
  if (c) rgb.value = c;
}
/** Bumped when a typed value had to be clamped, so its input shows the clamped value. */
const clampTick = ref(0);
function setChannel(i: number, v: number) {
  const next = [...rgb.value] as RGB;
  next[i] = Math.max(0, Math.min(255, Math.round(v || 0)));
  if (next[i] !== v) clampTick.value++;
  rgb.value = next;
}
function ok() {
  open.value = false;
  // A plain copy: a reactive array in the project would break the draft (IndexedDB can't clone it).
  emit('done', { name: name.value.trim() || hex.value, rgb: [...rgb.value] as RGB });
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
