<template>
  <!-- Fabric images (spec 014): a spinner with a count while they load, and a warning with a count
       for ones this device doesn't have (click to try again). Hidden when all is well. -->
  <q-btn
    v-if="slow || (!status.loading && status.missing.length)"
    flat
    round
    :aria-label="label"
    @click="status.loading ? undefined : retryMissing()"
  >
    <q-spinner v-if="status.loading" size="20px" />
    <q-icon v-else name="image_not_supported" />
    <q-badge floating rounded :color="status.loading ? 'primary' : 'warning'" text-color="dark">
      {{ status.loading || status.missing.length }}
    </q-badge>
    <q-tooltip>{{ label }}</q-tooltip>
  </q-btn>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { imageStatus, retryMissing } from '@/render/fabric-images';

const status = computed(() => imageStatus.value);
/** Loading only shows when it takes a while (most images come from the device in an instant). */
const slow = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;
watch(
  () => status.value.loading > 0,
  (busy) => {
    clearTimeout(timer);
    if (busy) timer = setTimeout(() => (slow.value = true), 400);
    else slow.value = false;
  },
);
const plural = (n: number) => `${n} fabric image${n === 1 ? '' : 's'}`;
const label = computed(() =>
  status.value.loading
    ? `Loading ${plural(status.value.loading)}…`
    : `${plural(status.value.missing.length)} not on this device, shown as average colors. ` +
      'Switch on their library pack, or click to try again.',
);
</script>
