<template>
  <!-- Viewport sizes as this browser reports them (Tests tab, dev server only): for iOS Safari's
       address bar covering dialog buttons. -->
  <div>
    <div class="bar">
      <q-btn unelevated no-caps color="primary" label="Open a tall dialog" @click="open = true" />
      <q-btn flat dense no-caps icon="content_copy" label="Copy numbers" @click="copy" />
    </div>
    <pre class="nums">{{ text }}</pre>
    <!-- Hidden probes: each one's height is what the browser gives that CSS length. -->
    <div class="probes" aria-hidden="true">
      <div
        v-for="u in UNITS"
        :key="u"
        :ref="(el) => (probes[u] = el as HTMLElement)"
        :style="{ height: u }"
      />
      <div ref="safe" style="padding-bottom: env(safe-area-inset-bottom)" />
    </div>

    <q-dialog v-model="open">
      <q-card ref="card" style="width: 360px">
        <q-card-section class="text-h6">Tall dialog</q-card-section>
        <q-card-section>
          <p>The buttons below should show above the address bar. Scroll this card if needed.</p>
          <pre class="nums">{{ text }}</pre>
          <div v-for="i in 30" :key="i" class="filler">Line {{ i }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Copy numbers" @click="copy" />
          <q-btn unelevated no-caps color="primary" label="Done" @click="open = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { copyToClipboard, useQuasar, type QCard } from 'quasar';

const UNITS = ['100vh', '100svh', '100dvh', '100lvh'] as const;
const $q = useQuasar();
const open = ref(false);
const probes: Record<string, HTMLElement | null> = {};
const safe = ref<HTMLElement>();
const card = ref<QCard>();
const tick = ref(0);
const bump = () => tick.value++;

const text = computed(() => {
  void tick.value;
  const vv = window.visualViewport;
  const rect = (card.value?.$el as HTMLElement | undefined)?.getBoundingClientRect();
  const lines = [
    `innerHeight ${innerHeight}, clientHeight ${document.documentElement.clientHeight}`,
    `visualViewport height ${vv?.height.toFixed(1)}, offsetTop ${vv?.offsetTop.toFixed(1)}, scale ${vv?.scale}`,
    ...UNITS.map((u) => `${u} = ${probes[u]?.offsetHeight ?? '?'} px`),
    `env(safe-area-inset-bottom) = ${safe.value ? getComputedStyle(safe.value).paddingBottom : '?'}`,
    `dialog card top ${rect?.top.toFixed(1) ?? '-'}, bottom ${rect?.bottom.toFixed(1) ?? '-'}`,
    `body: ${document.body.className}`,
    `iOS ${$q.platform.is.ios ?? false}, standalone ${matchMedia('(display-mode: standalone)').matches}`,
    navigator.userAgent,
  ];
  return lines.join('\n');
});

const copy = () => void copyToClipboard(text.value).then(() => $q.notify('Copied'));

watch(open, () => nextTick(() => setTimeout(bump, 400)));
onMounted(() => {
  bump();
  addEventListener('resize', bump);
  window.visualViewport?.addEventListener('resize', bump);
  window.visualViewport?.addEventListener('scroll', bump);
});
onBeforeUnmount(() => {
  removeEventListener('resize', bump);
  window.visualViewport?.removeEventListener('resize', bump);
  window.visualViewport?.removeEventListener('scroll', bump);
});
</script>

<style scoped>
.bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}
.nums {
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 12px;
}
.probes {
  position: fixed;
  left: -10px;
  top: 0;
  width: 1px;
  visibility: hidden;
  pointer-events: none;
}
.filler {
  padding: 4px 0;
}
</style>
