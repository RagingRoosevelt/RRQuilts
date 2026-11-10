<template>
  <q-page v-if="project.doc && shape" class="editor column no-wrap" :style-fn="fill">
    <div class="row items-center no-wrap q-px-sm bar" :class="{ reverse: swapped }">
      <q-tabs v-model="tab" dense no-caps inline-label class="col">
        <q-tab name="details" icon="info" label="Details" />
        <q-tab name="draw" icon="draw" label="Draw" />
      </q-tabs>
      <q-btn flat round dense icon="menu" :aria-label="sidebarLabel" @click="sidebar = !sidebar">
        <q-tooltip>{{ sidebarLabel }}</q-tooltip>
      </q-btn>
    </div>
    <q-banner v-if="ro && !project.readOnly" dense class="lib-banner">
      <template #avatar><q-icon name="lock" /></template>
      {{ shape.notecard.name }} is a library shape, so it opens read-only.
    </q-banner>
    <q-banner v-else-if="failingNames.length" dense class="bg-negative text-white">
      <template #avatar><q-icon name="warning" /></template>
      {{ failingNames.join(', ') }}
      {{ failingNames.length === 1 ? "isn't" : "aren't" }} usable yet: see the flags.
    </q-banner>

    <div
      class="row col no-wrap"
      :class="{ reverse: swapped }"
      style="min-height: 0; position: relative"
    >
      <div class="rail column no-wrap q-pa-xs" style="gap: 4px">
        <q-btn
          flat
          dense
          icon="undo"
          aria-label="Undo"
          :disable="!project.canUndo"
          @click="project.undo()"
        >
          <q-tooltip anchor="center right" self="center left">Undo (Ctrl+Z)</q-tooltip>
        </q-btn>
        <q-btn
          flat
          dense
          icon="redo"
          aria-label="Redo"
          :disable="!project.canRedo"
          @click="project.redo()"
        >
          <q-tooltip anchor="center right" self="center left">Redo (Ctrl+Shift+Z)</q-tooltip>
        </q-btn>
        <template v-if="tab === 'draw'">
          <q-separator />
          <q-btn
            v-for="t in tools"
            :key="t.id"
            :flat="tool !== t.id"
            :unelevated="tool === t.id"
            :color="tool === t.id ? 'primary' : undefined"
            dense
            :icon="t.icon"
            :aria-label="t.label"
            :disable="ro"
            @click="tool = t.id"
          >
            <q-tooltip anchor="center right" self="center left">{{ t.hint }}</q-tooltip>
          </q-btn>
        </template>
      </div>

      <div class="col relative-position column no-wrap">
        <EppCanvas
          ref="canvasRef"
          v-model:view="view"
          :doc="project.doc"
          :polys="polys"
          :grid="{ kind: prefs.vertexGrid === 'triangle' ? 'triangle' : 'square' }"
          :decorate="decorate"
          :claim="claim"
          :tick="tick"
          @tap="onTap"
          @hover="onHover"
          @drag="onDrag"
          @drag-end="onDragEnd"
        />
        <div class="readout q-pa-xs text-caption">{{ readout }}</div>
      </div>

      <div v-show="sidebar" class="inspector q-pa-md scroll column no-wrap" style="gap: 12px">
        <DetailsPanel v-if="tab === 'details'" kind="shape" :id="shape.id" />
        <template v-else>
          <SlidePicker
            :model-value="multi ? 'multi' : 'single'"
            :options="[
              { value: 'single', label: 'Single shape' },
              { value: 'multi', label: 'Multi-shape' },
            ]"
            @update:model-value="(v: string) => (multi = v === 'multi')"
          />
          <div>
            <div class="text-subtitle2">Vertex grid snapping</div>
            <SlidePicker
              :model-value="prefs.vertexGrid"
              :options="[
                { value: 'free', label: 'Free' },
                { value: 'square', label: 'Square' },
                { value: 'triangle', label: 'Triangle' },
              ]"
              @update:model-value="(v: string) => setPref('vertexGrid', v as VertexGrid)"
            />
          </div>
          <q-input
            :model-value="prefs.angleStep"
            type="number"
            dense
            outlined
            label="Angle step"
            suffix="°"
            :min="1"
            :max="90"
            @update:model-value="
              (v) => setPref('angleStep', Math.min(90, Math.max(1, Number(v) || 15)))
            "
          />
          <div v-if="multi" class="column" style="gap: 8px">
            <div class="text-body2">
              Draw lines across the outline: each closed area becomes a shape.
            </div>
            <div class="row" style="gap: 8px">
              <q-btn
                outline
                dense
                no-caps
                label="Undo line"
                :disable="!lines.length"
                @click="lines.pop()"
              />
              <q-btn
                outline
                dense
                no-caps
                label="Clear lines"
                :disable="!lines.length"
                @click="lines = []"
              />
            </div>
            <q-btn
              unelevated
              color="primary"
              no-caps
              icon="hive"
              label="Save as rosette"
              :disable="ro || parts.length < 2"
              @click="saveRosette"
            />
          </div>
          <div v-if="selected !== null && tool === 'vertex' && !multi" class="row" style="gap: 8px">
            <q-btn
              outline
              dense
              no-caps
              icon="delete"
              label="Delete corner"
              :disable="ro"
              @click="deleteCorner"
            />
          </div>
          <q-separator />
          <div class="text-subtitle2">Checks</div>
          <div v-for="(p, i) in checks" :key="i" class="column" style="gap: 2px">
            <div v-if="checks.length > 1" class="text-caption text-grey-7">Shape {{ i + 1 }}</div>
            <div v-for="f in FLAGS" :key="f.key" class="row items-center no-wrap" style="gap: 6px">
              <q-icon
                :name="p[f.key] ? 'check_circle' : 'cancel'"
                :color="p[f.key] ? 'positive' : 'negative'"
                size="xs"
              />
              <span class="text-body2">{{ f.label }}</span>
            </div>
          </div>
          <div class="text-caption text-grey-7">{{ toolHint }}</div>
        </template>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// The shape editor (spec 027 FR-006a): drag corners on a 1U grid, move and mark edges, drag angle
// markers, lock corners; Multi-shape splits an outline into the shapes of a new rosette.
import { useQuasar } from 'quasar';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DetailsPanel from '@/components/DetailsPanel.vue';
import EppCanvas, { type CanvasPoly, type Decor } from '@/components/EppCanvas.vue';
import SlidePicker from '@/components/SlidePicker.vue';
import type { World } from '@/composables/viewport';
import { checkOutline, type Flags } from '@/model/epp/checks';
import { splitOutline } from '@/model/epp/faces';
import { cornerAngles, edges, edgeLength, orient, type Poly } from '@/model/epp/geometry';
import { newRosette } from '@/model/epp/rosette-ops';
import {
  lengthLabel,
  moveEdge,
  moveVertex,
  normalize,
  removeVertex,
  setAngle,
  snapToGrid,
  splitEdge,
  toggleLocked,
  toggleMarked,
  type VertexGrid,
} from '@/model/epp/shape-ops';
import { dist, type Pt } from '@/model/geometry/path';
import { isLibraryItem } from '@/model/library-items';
import type { EppShape } from '@/model/schema/epp';
import type { View } from '@/render/draw';
import { useEppEditorStore, type ShapeTool } from '@/stores/epp-editor';
import { useLibraryStore } from '@/stores/library';
import { useProjectStore } from '@/stores/project';
import { useSettingsStore } from '@/stores/settings';
import type { EppPrefs } from '@/settings/settings';

const project = useProjectStore();
const library = useLibraryStore();
const app = useSettingsStore();
const epp = useEppEditorStore();
const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const fill = (offset: number) => ({ height: `calc(100vh - ${offset}px)` });

const id = computed(() => String(route.params.id));
const own = computed(() => project.doc?.project.eppShapes?.find((s) => s.id === id.value));
const shape = computed<EppShape | undefined>(
  () => own.value ?? library.lookup.eppShape?.(id.value),
);
const ro = computed(() => project.readOnly || !own.value || isLibraryItem(own.value));

const tab = ref<'details' | 'draw'>('draw');
const sidebar = ref(!$q.screen.lt.md);
const sidebarLabel = computed(() => (sidebar.value ? 'Hide sidebar' : 'Show sidebar'));
const swapped = computed(() => app.settings.sidesSwapped);
const prefs = computed(() => app.settings.epp);
const setPref = <K extends keyof EppPrefs>(k: K, v: EppPrefs[K]) =>
  (app.settings.epp = { ...app.settings.epp, [k]: v });

const tool = computed({ get: () => epp.shapeTool, set: (v: ShapeTool) => (epp.shapeTool = v) });
const multi = computed({ get: () => epp.multi, set: (v: boolean) => (epp.multi = v) });
const tools: { id: ShapeTool; icon: string; label: string; hint: string }[] = [
  {
    id: 'vertex',
    icon: 'radio_button_unchecked',
    label: 'Vertex',
    hint: 'Vertex: drag a corner; tap an edge to add one',
  },
  {
    id: 'edge',
    icon: 'horizontal_rule',
    label: 'Edge',
    hint: 'Edge: drag an edge; tap one to mark it as not a whole unit',
  },
  {
    id: 'angle',
    icon: 'architecture',
    label: 'Angle',
    hint: 'Angle: drag a corner up to widen it, down to narrow it',
  },
  {
    id: 'lock',
    icon: 'lock',
    label: 'Lock vertex',
    hint: 'Lock vertex: tap a corner so nothing moves it',
  },
];
const toolHint = computed(() =>
  multi.value
    ? 'Drag from point to point to draw a line.'
    : (tools.find((t) => t.id === tool.value)?.hint ?? ''),
);
const FLAGS: { key: keyof Flags; label: string }[] = [
  { key: 'closes', label: 'Closes' },
  { key: 'simple', label: "Doesn't cross itself" },
  { key: 'wholeUnits', label: 'Every edge a whole unit (or marked)' },
  { key: 'convex', label: 'Convex' },
];

const view = computed({
  get: () => epp.views.get(`shape:${id.value}`),
  set: (v: View | undefined) => v && epp.views.set(`shape:${id.value}`, v),
});
const canvasRef = ref<InstanceType<typeof EppCanvas>>();
const px = (n: number) => n * (canvasRef.value?.worldPerPx() ?? 0.02);

// --- Multi-shape lines (session only) ---
const lines = ref<[Pt, Pt][]>([]);
watch(id, () => (lines.value = []));
const parts = computed(() =>
  multi.value && shape.value ? splitOutline(shape.value.outline, lines.value) : [],
);

const outline = computed(() => shape.value?.outline ?? []);
const checks = computed<Flags[]>(() =>
  multi.value && parts.value.length > 1
    ? parts.value.map((p) => checkOutline(p.outline))
    : [checkOutline(outline.value, shape.value?.marked)],
);
const ok = (f: Flags) => f.closes && f.simple && f.wholeUnits && f.convex;
const failingNames = computed(() =>
  checks.value.length > 1
    ? checks.value.flatMap((f, i) => (ok(f) ? [] : [`Shape ${i + 1}`]))
    : checks.value.some((f) => !ok(f))
      ? [shape.value?.notecard.name ?? 'This shape']
      : [],
);

const polys = computed<CanvasPoly[]>(() =>
  multi.value && parts.value.length > 1
    ? parts.value.map((p, i) => ({ poly: p.outline, failing: !ok(checks.value[i]!) }))
    : [{ poly: outline.value, failing: !ok(checks.value[0]!) }],
);

// --- Hit testing (in units, tolerance in screen pixels) ---
const selected = ref<number | null>(null);
const hover = ref<World | null>(null);
const tick = ref(0);
function cornerAt(p: Pt) {
  const r = px(12);
  let best = -1;
  let d = r;
  outline.value.forEach((v, i) => {
    const e = dist(v, p);
    if (e <= d) [best, d] = [i, e];
  });
  return best < 0 ? null : best;
}
function edgeAt(p: Pt): { i: number; t: number } | null {
  const r = px(10);
  let best: { i: number; t: number } | null = null;
  let d = r;
  edges(outline.value).forEach(([a, b], i) => {
    const ab: Pt = [b[0] - a[0], b[1] - a[1]];
    const L2 = ab[0] ** 2 + ab[1] ** 2;
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / L2));
    const e = dist(p, [a[0] + ab[0] * t, a[1] + ab[1] * t]);
    if (e < d) [best, d] = [{ i, t }, e];
  });
  return best;
}

// --- Edits ---
function edit(fn: (s: EppShape) => EppShape, coalesce?: string) {
  if (ro.value) return;
  project.change(
    (d) => {
      const list = d.project.eppShapes ?? [];
      const k = list.findIndex((s) => s.id === id.value);
      if (k >= 0) list[k] = fn(list[k] as EppShape);
    },
    coalesce ? { coalesce } : {},
  );
}

type Drag =
  | { kind: 'vertex'; i: number }
  | { kind: 'edge'; i: number; grab: Pt; from: Pt }
  | { kind: 'angle'; i: number; y0: number; a0: number }
  | { kind: 'line'; from: Pt; to: Pt };
const drag = ref<Drag | null>(null);
const dragKey = ref('');

function snapPoint(p: Pt): Pt {
  // Lines snap to the outline's corners first, then to the grid.
  const c = outline.value.find((v) => dist(v, p) < px(12));
  return c ?? snapToGrid(p, prefs.value.vertexGrid);
}

function claim(p: World, e: PointerEvent): boolean {
  if (tab.value !== 'draw' || ro.value || e.button === 2) return false;
  dragKey.value = `shape-drag-${Date.now()}`;
  if (multi.value) {
    const from = snapPoint(p);
    drag.value = { kind: 'line', from, to: from };
    return true;
  }
  const c = cornerAt(p);
  if (tool.value === 'vertex' && c !== null && !shape.value?.locked?.includes(c)) {
    drag.value = { kind: 'vertex', i: c };
    selected.value = c;
    return true;
  }
  if (tool.value === 'angle' && c !== null) {
    drag.value = {
      kind: 'angle',
      i: c,
      y0: e.clientY,
      a0: cornerAngles(orient(outline.value))[c]!,
    };
    return true;
  }
  const hit = edgeAt(p);
  if (tool.value === 'edge' && hit) {
    drag.value = { kind: 'edge', i: hit.i, grab: p, from: outline.value[hit.i]! };
    return true;
  }
  return false;
}
function onDrag(p: World, e: PointerEvent) {
  const d = drag.value;
  if (!d) return;
  if (d.kind === 'line') {
    drag.value = { ...d, to: snapPoint(p) };
    tick.value++;
  } else if (d.kind === 'vertex')
    edit((s) => moveVertex(s, d.i, p, prefs.value.vertexGrid), dragKey.value);
  else if (d.kind === 'edge') {
    const target: Pt = [d.from[0] + p[0] - d.grab[0], d.from[1] + p[1] - d.grab[1]];
    edit((s) => moveEdge(s, d.i, target, prefs.value.vertexGrid), dragKey.value);
  } else {
    // Up widens, down narrows: one step per 12 pixels.
    const steps = Math.round((d.y0 - e.clientY) / 12);
    const deg = Math.min(179, Math.max(1, d.a0 + steps * prefs.value.angleStep));
    edit((s) => setAngle(s, d.i, deg), dragKey.value);
  }
}
function onDragEnd() {
  const d = drag.value;
  drag.value = null;
  if (d?.kind === 'line') {
    if (dist(d.from, d.to) > 1e-6) lines.value = [...lines.value, [d.from, d.to]];
    tick.value++;
    return;
  }
  // Settle the outline counter-clockwise once the drag is over.
  if (d) edit(normalize, dragKey.value);
}
function onTap(p: World) {
  if (tab.value !== 'draw' || ro.value || multi.value) return;
  const c = cornerAt(p);
  if (tool.value === 'lock' && c !== null) return edit((s) => toggleLocked(s, c));
  if (tool.value === 'vertex') {
    if (c !== null) return void (selected.value = c);
    const hit = edgeAt(p);
    if (hit) edit((s) => splitEdge(s, hit.i, hit.t));
    selected.value = null;
    return;
  }
  if (tool.value === 'edge') {
    const hit = edgeAt(p);
    if (hit) edit((s) => toggleMarked(s, hit.i));
  }
}
function onHover(p: World | null) {
  hover.value = p;
  tick.value++;
}
function deleteCorner() {
  const i = selected.value;
  if (i === null) return;
  edit((s) => removeVertex(s, i));
  selected.value = null;
}

async function saveRosette() {
  const s = shape.value;
  if (!s) return;
  const name = `${s.notecard.name} rosette`;
  const r = newRosette(name, app.settings.author);
  r.shapes = parts.value;
  r.pieces = parts.value.map((p, i) => ({
    id: `p${i + 1}`,
    shape: p.id,
    at: centroidOf(p.outline),
    turn: 0,
    scale: 1,
  }));
  project.change((d) => void (d.project.rosettes ??= []).push(r));
  lines.value = [];
  multi.value = false;
  await router.push(`/project/rosette/${r.id}`);
}
/** Internal shapes are placed around their centroid; this is where each sits. */
function centroidOf(poly: Poly): Pt {
  let a = 0;
  let cx = 0;
  let cy = 0;
  poly.forEach((p, i) => {
    const q = poly[(i + 1) % poly.length]!;
    const c = p[0] * q[1] - q[0] * p[1];
    a += c;
    cx += (p[0] + q[0]) * c;
    cy += (p[1] + q[1]) * c;
  });
  return [cx / (3 * a), cy / (3 * a)];
}

// --- Drawing on top: corners, labels, angles, locks, marks, the line being drawn ---
const readout = computed(() => {
  const h = hover.value;
  if (!h) return `${outline.value.length} corners`;
  return `${lengthLabel(Math.round(h[0] * 100) / 100)}, ${lengthLabel(Math.round(h[1] * 100) / 100)}`;
});
function decorate({ ctx, px: p }: Decor) {
  const s = shape.value;
  if (!s) return;
  const dark = $q.dark.isActive;
  ctx.font = `${p(12)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const ang = cornerAngles(orient(s.outline));
  // Edge labels (and marks) at each edge's middle, just outside.
  edges(s.outline).forEach(([a, b], i) => {
    const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const L = edgeLength([a, b]);
    const n: Pt = [(b[1] - a[1]) / L, -(b[0] - a[0]) / L];
    const at: Pt = [m[0] + n[0] * p(14), m[1] + n[1] * p(14)];
    const marked = s.marked?.includes(i);
    if (marked) {
      ctx.save();
      ctx.setLineDash([p(4), p(3)]);
      ctx.strokeStyle = '#ef6c00';
      ctx.lineWidth = p(3);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = marked ? '#ef6c00' : dark ? '#eee' : '#333';
    ctx.fillText(lengthLabel(Math.round(L * 1000) / 1000), at[0], at[1]);
  });
  if (multi.value) {
    ctx.strokeStyle = '#1976d2';
    ctx.lineWidth = p(2);
    ctx.beginPath();
    const d = drag.value;
    const drawn = d?.kind === 'line' ? [...lines.value, [d.from, d.to] as [Pt, Pt]] : lines.value;
    for (const [a, b] of drawn) {
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
    }
    ctx.stroke();
    return;
  }
  // Corners: handles, angle values (Angle tool), locks.
  s.outline.forEach((v, i) => {
    const isLocked = s.locked?.includes(i);
    ctx.beginPath();
    ctx.arc(v[0], v[1], p(isLocked ? 6 : 5), 0, Math.PI * 2);
    ctx.fillStyle = isLocked ? '#616161' : i === selected.value ? '#1976d2' : '#fff';
    ctx.fill();
    ctx.lineWidth = p(1.5);
    ctx.strokeStyle = '#1976d2';
    ctx.stroke();
    if (isLocked) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(v[0] - p(2), v[1] - p(1), p(4), p(3));
    }
    if (tool.value === 'angle') {
      const c = centroidOf(s.outline);
      const dir: Pt = [c[0] - v[0], c[1] - v[1]];
      const L = Math.hypot(dir[0], dir[1]) || 1;
      ctx.fillStyle = '#7b1fa2';
      ctx.fillText(
        `${Math.round(ang[i]! * 10) / 10}°`,
        v[0] + (dir[0] / L) * p(22),
        v[1] + (dir[1] / L) * p(22),
      );
    }
  });
}
</script>

<style scoped>
.lib-banner {
  background: rgba(128, 128, 128, 0.12);
}
.editor {
  overflow: hidden;
  min-width: 0;
}
.bar {
  border-top: 1px solid rgba(128, 128, 128, 0.25);
  border-bottom: 1px solid rgba(128, 128, 128, 0.25);
  min-width: 0;
}
.rail {
  overflow-y: auto;
  border-right: 1px solid rgba(128, 128, 128, 0.25);
}
.inspector {
  width: 340px;
  flex: none;
  border-left: 1px solid rgba(128, 128, 128, 0.25);
}
.reverse > .rail {
  border-right: none;
  border-left: 1px solid rgba(128, 128, 128, 0.25);
}
.reverse > .inspector {
  border-left: none;
  border-right: 1px solid rgba(128, 128, 128, 0.25);
}
@media (max-width: 1023px) {
  .inspector {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: min(320px, 85vw);
    z-index: 5;
    background: #fff;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.25);
  }
  .reverse > .inspector {
    right: auto;
    left: 0;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.25);
  }
  :global(.body--dark .inspector) {
    background: var(--q-dark-page);
  }
}
@media (max-width: 599px) {
  .inspector {
    width: 95%;
  }
}
.readout {
  position: absolute;
  left: 8px;
  bottom: 8px;
  pointer-events: none;
  opacity: 0.8;
}
</style>
