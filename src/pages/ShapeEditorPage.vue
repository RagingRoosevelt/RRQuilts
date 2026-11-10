<template>
  <q-page v-if="project.doc && shape" class="editor column no-wrap" :style-fn="fill">
    <div class="row items-center no-wrap q-px-sm bar" :class="{ reverse: swapped }">
      <q-tabs v-model="tab" dense no-caps inline-label class="col">
        <q-tab name="details" icon="info" label="Details" />
        <q-tab name="draw" icon="draw" label="Draw" />
        <q-tab name="print" icon="print" label="Print" />
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
      <template #avatar><q-icon name="error" /></template>
      {{ failingNames.join('; ') }}: not usable yet.
    </q-banner>
    <q-banner v-else-if="unmarkedNames.length" dense class="bg-orange-2 text-black">
      <template #avatar><q-icon name="warning" color="orange-9" /></template>
      {{ unmarkedNames.join(', ') }}
      {{ unmarkedNames.length === 1 ? 'has' : 'have' }} edges that aren’t whole units. If they’re
      meant, tap each with the <b>Edge</b> tool to mark it (marked edges snap to the same length,
      double, half or a quarter).
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
        <template v-if="tab === 'print'">
          <q-separator />
          <PrintZoom />
        </template>
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

      <PrintPreview v-if="tab === 'print'" kind="rosette" :id="shape.id" :doc="project.doc" />
      <div v-else class="col relative-position column no-wrap">
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
        <PrintOptions v-else-if="tab === 'print'" kind="rosette" :id="shape.id" />
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
            <div v-if="saveBlocked" class="text-caption text-grey-8">{{ saveBlocked }}</div>
            <q-btn
              unelevated
              color="primary"
              no-caps
              icon="hive"
              label="Save as rosette"
              :disable="!!saveBlocked"
              @click="saveRosette"
            />
          </div>
          <q-separator />
          <div class="text-subtitle2">Checks</div>
          <div v-for="(p, i) in checks" :key="i" class="column" style="gap: 2px">
            <div v-if="checks.length > 1" class="text-caption text-grey-7">Shape {{ i + 1 }}</div>
            <div v-for="f in FLAGS" :key="f.key" class="row items-center no-wrap" style="gap: 6px">
              <q-icon
                :name="p[f.key] ? 'check_circle' : f.key === 'wholeUnits' ? 'warning' : 'cancel'"
                :color="p[f.key] ? 'positive' : f.key === 'wholeUnits' ? 'orange-9' : 'negative'"
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
import { ERASER } from '@/components/icons';
import PrintOptions from '@/components/PrintOptions.vue';
import PrintPreview from '@/components/PrintPreview.vue';
import PrintZoom from '@/components/PrintZoom.vue';
import type { World } from '@/composables/viewport';
import { checkOutline, nonWholeEdges, passes, problems, type Flags } from '@/model/epp/checks';
import { matchShape, piecePose } from '@/model/epp/match';
import { splitOutline } from '@/model/epp/faces';
import { cornerAngles, edges, edgeLength, orient, type Poly } from '@/model/epp/geometry';
import { newRosette } from '@/model/epp/rosette-ops';
import {
  lengthLabel,
  moveEdge,
  moveVertex,
  normalize,
  removeEdge,
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

const tab = ref<'details' | 'draw' | 'print'>(route.query.print ? 'print' : 'draw');
const sidebar = ref(!$q.screen.lt.md);
const sidebarLabel = computed(() => (sidebar.value ? 'Hide sidebar' : 'Show sidebar'));
const swapped = computed(() => app.settings.sidesSwapped);
const prefs = computed(() => app.settings.epp);
const setPref = <K extends keyof EppPrefs>(k: K, v: EppPrefs[K]) =>
  (app.settings.epp = { ...app.settings.epp, [k]: v });

const tool = computed({ get: () => epp.shapeTool, set: (v: ShapeTool) => (epp.shapeTool = v) });
const multi = computed({
  get: () => epp.multi,
  set: (v: boolean) => {
    epp.multi = v;
    // Multi-shape starts drawing lines; the Line tool is Multi-shape's only.
    if (v) epp.shapeTool = 'line';
    else if (epp.shapeTool === 'line') epp.shapeTool = 'vertex';
  },
});
const ALL_TOOLS: { id: ShapeTool; icon: string; label: string; hint: string }[] = [
  {
    id: 'line',
    icon: 'show_chart',
    label: 'Line',
    hint: 'Line: drag across the outline to split it; each closed area becomes a shape',
  },
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
    hint: 'Angle: drag a corner’s angle label right to widen it, left to narrow it',
  },
  {
    id: 'lock',
    icon: 'lock',
    label: 'Lock vertex',
    hint: 'Lock vertex: tap a corner so nothing moves it',
  },
  {
    id: 'delete',
    icon: ERASER,
    label: 'Delete',
    hint: 'Delete: tap a corner to remove it, or an edge to join its two corners into one',
  },
];
const tools = computed(() => ALL_TOOLS.filter((t) => t.id !== 'line' || multi.value));
const MULTI_HINTS: Partial<Record<ShapeTool, string>> = {
  vertex: 'Vertex: drag a corner or a line’s end; tap an edge to add a corner',
  delete: 'Delete: tap a line to remove it, or a corner or an edge of the outline',
};
const toolHint = computed(
  () =>
    (multi.value ? MULTI_HINTS[tool.value] : undefined) ??
    ALL_TOOLS.find((t) => t.id === tool.value)?.hint ??
    '',
);
const FLAGS: { key: keyof Flags; label: string }[] = [
  { key: 'closes', label: 'Closes' },
  { key: 'simple', label: "Doesn't cross itself" },
  { key: 'wholeUnits', label: 'Every edge a whole unit or marked (a warning only)' },
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
/** Why Save as rosette can't be used yet (empty: it can). */
const saveBlocked = computed(() =>
  ro.value
    ? 'This shape is read-only, so it can’t be split here.'
    : parts.value.length < 2
      ? 'Draw a line from edge to edge across the outline: a rosette needs two or more shapes.'
      : '',
);
const checks = computed<Flags[]>(() =>
  multi.value && parts.value.length > 1
    ? parts.value.map((p) => checkOutline(p.outline))
    : [checkOutline(outline.value, shape.value?.marked)],
);
const ok = passes;
const nameOf = (i: number) =>
  checks.value.length > 1 ? `Shape ${i + 1}` : (shape.value?.notecard.name ?? 'This shape');
/** "Shape 2 crosses itself" for each shape that isn't usable. */
const failingNames = computed(() =>
  checks.value.flatMap((f, i) => (ok(f) ? [] : [`${nameOf(i)} ${problems(f).join(' and ')}`])),
);
const unmarkedNames = computed(() =>
  // Multi-shape marks its new edges when it saves: only a single shape warns here.
  multi.value ? [] : checks.value.flatMap((f, i) => (ok(f) && !f.wholeUnits ? [nameOf(i)] : [])),
);

const polys = computed<CanvasPoly[]>(() =>
  multi.value && parts.value.length > 1
    ? parts.value.map((p, i) => ({ poly: p.outline, failing: !ok(checks.value[i]!) }))
    : [
        {
          poly: outline.value,
          failing: !ok(checks.value[0]!),
          warn: ok(checks.value[0]!) && !checks.value[0]!.wholeUnits,
        },
      ],
);

// --- Hit testing (in units, tolerance in screen pixels) ---
const selected = ref<number | null>(null);
const hover = ref<World | null>(null);
const tick = ref(0);
function segDist(p: Pt, a: Pt, b: Pt) {
  const ab: Pt = [b[0] - a[0], b[1] - a[1]];
  const L2 = ab[0] ** 2 + ab[1] ** 2 || 1e-12;
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / L2));
  return dist(p, [a[0] + ab[0] * t, a[1] + ab[1] * t]);
}
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

/** Where corner i's angle label sits: a little way in from the corner, toward the middle. */
function angleLabel(poly: Poly, i: number): Pt {
  const v = poly[i]!;
  const c = centroidOf(poly);
  const dir: Pt = [c[0] - v[0], c[1] - v[1]];
  const L = Math.hypot(dir[0], dir[1]) || 1;
  return [v[0] + (dir[0] / L) * px(30), v[1] + (dir[1] / L) * px(30)];
}
function angleLabelAt(p: Pt): number | null {
  let best: number | null = null;
  let d = px(18);
  outline.value.forEach((_, i) => {
    const e = dist(angleLabel(outline.value, i), p);
    if (e < d) [best, d] = [i, e];
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
  | { kind: 'angle'; i: number; x0: number; a0: number }
  | { kind: 'line'; from: Pt; to: Pt }
  | { kind: 'end'; at: Pt };
const drag = ref<Drag | null>(null);
const dragKey = ref('');

/**
 * Multi-shape line ends: the outline's corners and earlier lines' ends first, then a point on an
 * outline edge or earlier line (a whole unit from one of its ends when that's close), then the grid.
 */
function snapPoint(p: Pt): Pt {
  const ends = [...outline.value, ...lines.value.flat()];
  const corner = ends.reduce<{ q: Pt | null; d: number }>(
    (b, v) => (dist(v, p) < b.d ? { q: v, d: dist(v, p) } : b),
    { q: null, d: px(18) },
  ).q;
  if (corner) return corner;
  let best: Pt | null = null;
  let bd = px(16);
  for (const [a, b] of [...edges(outline.value), ...lines.value]) {
    const L = dist(a, b);
    if (L < 1e-9) continue;
    const t = Math.max(
      0,
      Math.min(L, ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / L),
    );
    const on = (u: number): Pt => [a[0] + ((b[0] - a[0]) * u) / L, a[1] + ((b[1] - a[1]) * u) / L];
    const q = on(t);
    const d = dist(q, p);
    if (d >= bd) continue;
    // Whole units from either end, when the pointer is near one: lines meet edges at even steps.
    const steps = [Math.round(t), L - Math.round(L - t)].filter((u) => u > 0 && u < L);
    const step = steps.map(on).find((x) => dist(x, q) < px(10));
    [best, bd] = [step ?? q, d];
  }
  return best ?? snapToGrid(p, prefs.value.vertexGrid);
}

function claim(p: World, e: PointerEvent): boolean {
  if (tab.value !== 'draw' || ro.value || e.button === 2) return false;
  dragKey.value = `shape-drag-${Date.now()}`;
  if (tool.value !== 'line') return grab(p, e);
  // Multi-shape's Line tool draws a line.
  const from = snapPoint(p);
  drag.value = { kind: 'line', from, to: from };
  return true;
}
/** The current tool's handle under p (a corner, a line end, an edge, an angle label), if any. */
function grab(p: Pt, e: PointerEvent): boolean {
  const c = cornerAt(p);
  if (tool.value === 'vertex' && multi.value && c === null) {
    const end = lines.value.flat().find((v) => dist(v, p) < px(12));
    if (end) {
      drag.value = { kind: 'end', at: end };
      return true;
    }
  }
  if (tool.value === 'vertex' && c !== null && !shape.value?.locked?.includes(c)) {
    drag.value = { kind: 'vertex', i: c };
    selected.value = c;
    return true;
  }
  const a = tool.value === 'angle' ? angleLabelAt(p) : null;
  if (a !== null) {
    drag.value = {
      kind: 'angle',
      i: a,
      x0: e.clientX,
      a0: cornerAngles(orient(outline.value))[a]!,
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
  } else if (d.kind === 'end') {
    const to = snapToGrid(p, prefs.value.vertexGrid);
    moveEnds(d.at, to);
    drag.value = { kind: 'end', at: to };
  } else if (d.kind === 'vertex') {
    // Lines ending on the corner go with it.
    const from = outline.value[d.i]!;
    edit((s) => moveVertex(s, d.i, p, prefs.value.vertexGrid), dragKey.value);
    moveEnds(from, outline.value[d.i]!);
  } else if (d.kind === 'edge') {
    const target: Pt = [d.from[0] + p[0] - d.grab[0], d.from[1] + p[1] - d.grab[1]];
    edit((s) => moveEdge(s, d.i, target, prefs.value.vertexGrid), dragKey.value);
  } else {
    // From the angle's label: right widens, left narrows, one step per 12 pixels.
    const steps = Math.round((e.clientX - d.x0) / 12);
    const deg = Math.min(179, Math.max(1, d.a0 + steps * prefs.value.angleStep));
    edit((s) => setAngle(s, d.i, deg), dragKey.value);
  }
}
/** Multi-shape lines' ends at `from` move to `to`. */
function moveEnds(from: Pt, to: Pt) {
  if (dist(from, to) < 1e-12) return;
  const at = (v: Pt): Pt => (dist(v, from) < 1e-9 ? to : v);
  lines.value = lines.value.map(([a, b]) => [at(a), at(b)]);
  tick.value++;
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
  if (tab.value !== 'draw' || ro.value) return;
  if (multi.value && tool.value === 'delete') {
    // A line under the tap goes first.
    const k = lines.value.findIndex(([a, b]) => segDist(p, a, b) < px(10));
    if (k >= 0) return void (lines.value = lines.value.filter((_, i) => i !== k));
  }
  const c = cornerAt(p);
  if (tool.value === 'lock' && c !== null) return edit((s) => toggleLocked(s, c));
  if (tool.value === 'delete') {
    // Corners first (they sit on two edges); a shape keeps at least three corners.
    if (c !== null) return edit((s) => normalize(removeVertex(s, c)));
    const hit = edgeAt(p);
    if (hit) edit((s) => normalize(removeEdge(s, hit.i)));
    return;
  }
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

async function saveRosette() {
  const s = shape.value;
  if (!s) return;
  const name = `${s.notecard.name} rosette`;
  const r = newRosette(name, app.settings.author);
  // A piece that is an existing shape (yours, then the libraries') uses it, not a copy of it.
  const known = [...(project.doc?.project.eppShapes ?? []), ...library.items.eppShapes].filter(
    (x) => passes(checkOutline(x.outline, x.marked)),
  );
  const own: typeof parts.value = [];
  r.pieces = parts.value.map((p, i) => {
    const m = matchShape(p.outline, known);
    if (m) return { id: `p${i + 1}`, shape: m.shape.id, ...piecePose(m.pose) };
    // The lines were drawn on purpose: edges that aren't whole units are marked as meant.
    const marked = nonWholeEdges(p.outline);
    own.push(marked.length ? { ...p, marked } : p);
    return { id: `p${i + 1}`, shape: p.id, at: centroidOf(p.outline), turn: 0, scale: 1 };
  });
  if (own.length) r.shapes = own;
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
    // Line ends: handles for the Vertex tool.
    ctx.fillStyle = '#1976d2';
    for (const v of lines.value.flat()) {
      ctx.beginPath();
      ctx.arc(v[0], v[1], p(3.5), 0, Math.PI * 2);
      ctx.fill();
    }
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
      const at = angleLabel(s.outline, i);
      const text = `${Math.round(ang[i]! * 10) / 10}°`;
      const w = ctx.measureText(text).width + p(10);
      // A grab handle: drag it right to widen the angle, left to narrow it.
      ctx.fillStyle = drag.value?.kind === 'angle' && drag.value.i === i ? '#7b1fa2' : '#f3e5f5';
      ctx.fillRect(at[0] - w / 2, at[1] - p(9), w, p(18));
      ctx.strokeStyle = '#7b1fa2';
      ctx.lineWidth = p(1);
      ctx.strokeRect(at[0] - w / 2, at[1] - p(9), w, p(18));
      ctx.fillStyle = drag.value?.kind === 'angle' && drag.value.i === i ? '#fff' : '#7b1fa2';
      ctx.fillText(text, at[0], at[1]);
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
