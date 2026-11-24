<template>
  <div class="col column no-wrap stl-preview">
    <div class="row items-center no-wrap q-px-md q-py-sm" style="gap: 12px">
      <div class="col">
        <div class="text-subtitle1 ellipsis">
          {{ stl.title
          }}<template v-if="stl.item && stl.item.label !== stl.title">
            · {{ stl.item.label }}</template
          >
        </div>
        <div v-if="stats" class="text-caption text-grey-7">{{ stats }}</div>
        <div v-for="e in stl.result?.errors ?? []" :key="e" class="text-caption text-negative">
          {{ e }}
        </div>
        <div v-for="n in stl.result?.notes ?? []" :key="n" class="text-caption text-grey-7">
          {{ n }}
        </div>
        <div v-if="!stl.items.length" class="text-caption text-grey-7">
          No pieces to make templates for.
        </div>
      </div>
      <q-btn
        color="primary"
        no-caps
        icon="download"
        label="Download STL"
        :disable="!stl.result?.mesh"
        @click="stl.save()"
      />
    </div>
    <div ref="box" class="col relative-position">
      <canvas
        ref="cv"
        class="absolute-full"
        @pointerdown="down"
        @pointermove="move"
        @pointerup="drag = null"
        @pointercancel="drag = null"
        @wheel.prevent="wheel"
      />
      <div class="hint text-caption text-grey-7 q-pa-xs">Drag to turn, scroll to zoom</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// A 3D template's solid (spec 027 stretch goal), drawn in software: flat shading with a depth
// buffer, the letters darker so they read. Drag to turn, wheel to zoom. No 3D library needed for
// a few thousand triangles.
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { Stl } from '@/composables/stl';
import type { V3 } from '@/model/print/stl';

const props = defineProps<{ stl: Stl }>();

const stats = computed(() => {
  const r = props.stl.result;
  if (!r?.mesh) return '';
  const xs = r.mesh.V.map((v) => v[0]);
  const ys = r.mesh.V.map((v) => v[1]);
  const w = Math.max(...xs) - Math.min(...xs);
  const h = Math.max(...ys) - Math.min(...ys);
  return [
    `${w.toFixed(1)} × ${h.toFixed(1)} × ${props.stl.opts.height} mm`,
    r.hole ? `${r.hole} hanging hole` : '',
    r.textSize ? `text ${+r.textSize.toFixed(1)} mm` : '',
  ]
    .filter(Boolean)
    .join(' · ');
});

const box = ref<HTMLDivElement>();
const cv = ref<HTMLCanvasElement>();
const view = { yaw: 25 * (Math.PI / 180), pitch: 55 * (Math.PI / 180), zoom: 1 };
const drag = ref<[number, number] | null>(null);

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

function draw() {
  const c = cv.value;
  const ctx = c?.getContext('2d');
  if (!c || !ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const w = Math.max(1, Math.round(c.clientWidth * dpr));
  const h = Math.max(1, Math.round(c.clientHeight * dpr));
  if (c.width !== w || c.height !== h) [c.width, c.height] = [w, h];
  const img = ctx.createImageData(w, h);
  const px = img.data;
  // The page's own background (light or dark).
  const bg = (getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g) ?? []).map(Number);
  const back = bg.length >= 3 && bg[3] !== 0 ? bg : [255, 255, 255];
  for (let i = 0; i < w * h; i++) {
    px[i * 4] = back[0]!;
    px[i * 4 + 1] = back[1]!;
    px[i * 4 + 2] = back[2]!;
    px[i * 4 + 3] = 255;
  }
  const mesh = props.stl.result?.mesh;
  if (mesh) {
    const { V, T, textTris } = mesh;
    const lo = [0, 1, 2].map((k) => Math.min(...V.map((v) => v[k]!)));
    const hi = [0, 1, 2].map((k) => Math.max(...V.map((v) => v[k]!)));
    const mid = lo.map((l, k) => (l + hi[k]!) / 2) as V3;
    const R = Math.hypot(...hi.map((x, k) => x - lo[k]!)) / 2 || 1;
    const s = (view.zoom * Math.min(w, h)) / (2.2 * R);
    const [cy, sy, cp, sp] = [
      Math.cos(view.yaw),
      Math.sin(view.yaw),
      Math.cos(view.pitch),
      Math.sin(view.pitch),
    ];
    // Turn about the up axis, then tilt toward the viewer; x right, y up, z toward the viewer.
    const P = V.map((v): V3 => {
      const [x, y, z] = sub(v, mid);
      const x1 = x * cy - y * sy;
      const y1 = x * sy + y * cy;
      return [x1, y1 * cp + z * sp, -y1 * sp + z * cp];
    });
    const zb = new Float32Array(w * h).fill(-Infinity);
    const L: V3 = [-0.35, 0.5, 0.8];
    const Ll = Math.hypot(...L);
    const edge = (p: V3, q: V3, x: number, y: number) =>
      (q[0] - p[0]) * (y - p[1]) - (q[1] - p[1]) * (x - p[0]);
    T.forEach((t, k) => {
      const [a, b, cc] = t.map((i) => P[i]!) as [V3, V3, V3];
      const n = cross(sub(b, a), sub(cc, a));
      const nl = Math.hypot(...n);
      if (n[2] <= 0 || nl === 0) return;
      const shade = 0.3 + 0.7 * Math.max(0, dot(n, L) / nl / Ll);
      const base = k >= textTris[0] && k < textTris[1] ? [40, 70, 120] : [90, 150, 220];
      const col = base.map((x) => x * shade);
      const S = [a, b, cc].map((q): V3 => [w / 2 + q[0] * s, h / 2 - q[1] * s, q[2]]) as [
        V3,
        V3,
        V3,
      ];
      const x0 = Math.max(0, Math.floor(Math.min(S[0][0], S[1][0], S[2][0])));
      const x1 = Math.min(w - 1, Math.ceil(Math.max(S[0][0], S[1][0], S[2][0])));
      const y0 = Math.max(0, Math.floor(Math.min(S[0][1], S[1][1], S[2][1])));
      const y1 = Math.min(h - 1, Math.ceil(Math.max(S[0][1], S[1][1], S[2][1])));
      const area = edge(S[0], S[1], S[2][0], S[2][1]);
      if (area === 0) return;
      for (let y = y0; y <= y1; y++)
        for (let x = x0; x <= x1; x++) {
          const [fx, fy] = [x + 0.5, y + 0.5];
          const w0 = edge(S[1], S[2], fx, fy) / area;
          const w1 = edge(S[2], S[0], fx, fy) / area;
          const w2 = 1 - w0 - w1;
          if (w0 < 0 || w1 < 0 || w2 < 0) continue;
          const z = w0 * S[0][2] + w1 * S[1][2] + w2 * S[2][2];
          const i = y * w + x;
          if (z <= zb[i]!) continue;
          zb[i] = z;
          px[i * 4] = col[0]!;
          px[i * 4 + 1] = col[1]!;
          px[i * 4 + 2] = col[2]!;
        }
    });
  }
  ctx.putImageData(img, 0, 0);
}

let frame = 0;
const redraw = () => {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(draw);
};
watch(() => props.stl.result, redraw);

function down(e: PointerEvent) {
  drag.value = [e.clientX, e.clientY];
  cv.value?.setPointerCapture(e.pointerId);
}
function move(e: PointerEvent) {
  if (!drag.value) return;
  view.yaw += (e.clientX - drag.value[0]) * 0.01;
  view.pitch = Math.min(Math.PI, Math.max(0, view.pitch - (e.clientY - drag.value[1]) * 0.01));
  drag.value = [e.clientX, e.clientY];
  redraw();
}
function wheel(e: WheelEvent) {
  view.zoom = Math.min(8, Math.max(0.3, view.zoom * Math.exp(-e.deltaY * 0.001)));
  redraw();
}

let ro: ResizeObserver | undefined;
onMounted(() => {
  ro = new ResizeObserver(redraw);
  if (box.value) ro.observe(box.value);
  redraw();
});
onBeforeUnmount(() => {
  ro?.disconnect();
  cancelAnimationFrame(frame);
});
</script>

<style scoped>
.stl-preview {
  min-height: 0;
}
canvas {
  width: 100%;
  height: 100%;
  touch-action: none;
  cursor: grab;
}
.hint {
  position: absolute;
  right: 0;
  bottom: 0;
  pointer-events: none;
}
</style>
