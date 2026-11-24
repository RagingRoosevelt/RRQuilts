<template>
  <q-expansion-item v-model="open" dense label="Even edge length" class="even-edge">
    <div class="column q-pa-sm" style="gap: 8px">
      <div v-if="!items.length" class="text-caption text-grey-7">
        Place a block in the quilt first.
      </div>
      <template v-else-if="item">
        <q-select
          :model-value="pick"
          :options="items.map((it, i) => ({ value: i, label: it.label }))"
          emit-value
          map-options
          dense
          outlined
          label="Block"
          @update:model-value="choose"
        />
        <div class="text-caption text-grey-7">{{ step }}</div>
        <svg :viewBox="view" class="pic">
          <polygon
            v-for="(p, i) in item.patches"
            :key="i"
            :points="pts(p.poly)"
            class="patch"
            :class="{ on: i === patch }"
            @click="selectPatch(i)"
          />
          <g v-for="(e, n) in current?.edges ?? []" :key="n" @click="edge = n">
            <line :x1="e.a[0]" :y1="e.a[1]" :x2="e.b[0]" :y2="e.b[1]" class="hit" />
            <line
              :x1="e.a[0]"
              :y1="e.a[1]"
              :x2="e.b[0]"
              :y2="e.b[1]"
              class="edge"
              :class="{ on: n === edge }"
            />
            <title>{{ fmtLen(e.len, lu) }}</title>
          </g>
        </svg>
        <template v-if="picked">
          <div class="text-body2">This edge: {{ fmtLen(picked.len, lu) }}</div>
          <div class="row" style="gap: 6px">
            <q-btn
              v-for="t in nice"
              :key="t"
              dense
              no-caps
              outline
              color="primary"
              :disable="readonly || Math.abs(t - picked.len) < 1e-9"
              @click="emit('scale', t / picked.len)"
            >
              <div class="column items-center q-px-xs">
                <span>{{ fmtLen(t, lu) }}</span>
                <span class="text-caption text-grey-7">{{ sizeText(t / picked.len) }}</span>
              </div>
            </q-btn>
          </div>
        </template>
      </template>
    </div>
  </q-expansion-item>
</template>

<script setup lang="ts">
// Even edge length (owner, 2026-11-16), under a block quilt's block size: pick a block in the
// quilt (rosettes too), one of its patches, one of the patch's straight edges, then a nice length
// near it. The block size changes so that edge is that length. Not in EPP quilts: 1U does that.
import { computed, ref } from 'vue';
import type { Pt } from '@/model/geometry/path';
import { blockEdgeItems, blockSize, niceLengths, type EdgeItem } from '@/model/layout/even-edge';
import { fmtLen } from '@/model/print/format';
import type { Quilt } from '@/model/schema/quilt';
import { useProjectStore } from '@/stores/project';

const props = defineProps<{ quilt: Quilt; units: string; readonly: boolean }>();
const emit = defineEmits<{ scale: [k: number] }>();
const project = useProjectStore();
const lu = computed(() => (props.units === 'cm' ? 'cm' : 'in'));

const open = ref(false);
// Measured only while open: a block quilt lays out every space to find its blocks.
const items = computed<EdgeItem[]>(() => {
  if (!open.value || !project.doc) return [];
  return blockEdgeItems(project.doc, props.quilt);
});
// By index: scaling changes an item's size (its key), not its place in the list.
const pick = ref(0);
const patch = ref(-1);
const edge = ref(-1);
const item = computed(() => items.value[Math.min(pick.value, items.value.length - 1)]);
const current = computed(() => item.value?.patches[patch.value]);
const picked = computed(() => current.value?.edges[edge.value]);
const nice = computed(() => (picked.value ? niceLengths(picked.value.len, lu.value) : []));

function choose(i: number) {
  pick.value = i;
  patch.value = edge.value = -1;
}
function selectPatch(i: number) {
  if (i !== patch.value) edge.value = -1;
  patch.value = i;
}

const step = computed(() =>
  patch.value < 0
    ? 'Click a patch.'
    : edge.value < 0
      ? current.value?.edges.length
        ? 'Click one of its edges.'
        : 'This patch has only curved edges: pick another.'
      : 'Pick a length: the block size changes to match.',
);

const short = (x: number) => (lu.value === 'cm' ? `${+x.toFixed(2)} cm` : `${+x.toFixed(2)}″`);
/** The size field once the blocks are `k` times as big. */
const sizeText = (k: number) =>
  blockSize(props.quilt.layout)
    .map((v) => short(v * k))
    .join(' × ');

const view = computed(() => {
  const all = item.value?.patches.flatMap((p) => p.poly) ?? [];
  const xs = all.map((p) => p[0]);
  const ys = all.map((p) => p[1]);
  const [x0, y0] = [Math.min(...xs), Math.min(...ys)];
  const [w, h] = [Math.max(...xs) - x0, Math.max(...ys) - y0];
  const pad = Math.max(w, h) * 0.04 || 1;
  return `${x0 - pad} ${y0 - pad} ${w + 2 * pad} ${h + 2 * pad}`;
});
const pts = (poly: Pt[]) => poly.map((p) => p.join(',')).join(' ');
</script>

<style scoped>
.even-edge {
  border: 1px solid rgba(128, 128, 128, 0.35);
  border-radius: 8px;
  overflow: hidden;
}
.pic {
  width: 100%;
  max-height: 240px;
}
.patch {
  fill: rgba(128, 128, 128, 0.12);
  stroke: currentColor;
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
  cursor: pointer;
}
.patch.on {
  fill: rgba(25, 118, 210, 0.25);
}
.hit {
  stroke: transparent;
  stroke-width: 14;
  vector-effect: non-scaling-stroke;
  cursor: pointer;
}
.edge {
  stroke: #1976d2;
  stroke-width: 3;
  vector-effect: non-scaling-stroke;
  pointer-events: none;
}
.edge.on {
  stroke: #ef6c00;
  stroke-width: 5;
}
</style>
