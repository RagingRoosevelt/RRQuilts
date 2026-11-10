<template>
  <q-page v-if="project.doc && rosette" class="editor column no-wrap" :style-fn="fill">
    <div class="row items-center no-wrap q-px-sm bar" :class="{ reverse: swapped }">
      <q-tabs v-model="tab" dense no-caps inline-label class="col">
        <q-tab name="details" icon="info" label="Details" />
        <q-tab name="design" icon="hive" label="Design" />
      </q-tabs>
      <q-btn flat round dense icon="menu" :aria-label="sidebarLabel" @click="sidebar = !sidebar">
        <q-tooltip>{{ sidebarLabel }}</q-tooltip>
      </q-btn>
    </div>
    <q-banner v-if="ro && !project.readOnly" dense class="lib-banner">
      <template #avatar><q-icon name="lock" /></template>
      {{ rosette.notecard.name }} is a library rosette, so it opens read-only.
    </q-banner>
    <q-banner v-else-if="failingCount" dense class="bg-negative text-white">
      <template #avatar><q-icon name="warning" /></template>
      {{ failingCount }}
      {{ failingCount === 1 ? 'shape made here isn’t' : 'shapes made here aren’t' }}
      usable yet (outlined in red): it must close, not cross itself, have whole-unit edges and be
      convex.
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
        <template v-if="tab === 'design'">
          <q-separator />
          <q-btn
            v-for="m in MODES"
            :key="m.id"
            :flat="prefs.mode !== m.id"
            :unelevated="prefs.mode === m.id"
            :color="prefs.mode === m.id ? 'secondary' : undefined"
            dense
            :icon="m.icon"
            :aria-label="m.label"
            @click="setPref('mode', m.id)"
          >
            <q-tooltip anchor="center right" self="center left">{{ m.hint }}</q-tooltip>
          </q-btn>
          <q-btn
            v-if="prefs.mode === 'grid'"
            :flat="!epp.draggingGrid"
            :unelevated="epp.draggingGrid"
            :color="epp.draggingGrid ? 'primary' : undefined"
            dense
            icon="open_with"
            aria-label="Drag grid"
            @click="epp.draggingGrid = !epp.draggingGrid"
          >
            <q-tooltip anchor="center right" self="center left"
              >Drag grid: drag the grid until it lines up with a placed piece</q-tooltip
            >
          </q-btn>
          <q-separator />
          <q-btn
            v-for="t in TOOLS"
            :key="t.id"
            :flat="epp.rosetteTool !== t.id"
            :unelevated="epp.rosetteTool === t.id"
            :color="epp.rosetteTool === t.id ? 'primary' : undefined"
            dense
            :icon="t.icon"
            :aria-label="t.label"
            :disable="ro && t.id !== 'select'"
            @click="epp.rosetteTool = t.id"
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
          :grid="grid"
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
        <DetailsPanel v-if="tab === 'details'" kind="rosette" :id="rosette.id" />
        <template v-else>
          <q-toggle
            v-if="prefs.mode === 'grid'"
            :model-value="prefs.syncGrid"
            dense
            label="Sync grid to selected size"
            @update:model-value="(v: boolean) => setPref('syncGrid', v)"
          />
          <EppPicker
            v-model:picked="epp.picked"
            v-model:scale="epp.scale"
            :groups="pickerGroups"
            :lookup="lookup"
            :paint="cssFill"
            :fit="prefs.mode === 'grow' && hoverEdge ? fitOnEdge : undefined"
          />
          <div class="text-caption text-grey-7">
            Rosettes placed in a rosette become its pieces (they don’t stay linked).
          </div>
          <q-separator />
          <div class="text-subtitle2">Colorings</div>
          <div class="row" style="gap: 6px">
            <q-chip
              v-for="(c, i) in rosette.colorings"
              :key="c.id"
              clickable
              :outline="c.id !== coloringId"
              :color="c.id === coloringId ? 'primary' : undefined"
              :text-color="c.id === coloringId ? 'white' : undefined"
              :removable="!ro && rosette.colorings.length > 1"
              @click="coloringId = c.id"
              @remove="edit((r) => deleteColoring(r, c.id))"
            >
              {{ c.name ?? `Coloring ${i + 1}` }}
            </q-chip>
          </div>
          <div class="row" style="gap: 8px">
            <q-btn
              outline
              dense
              no-caps
              icon="add"
              label="New coloring"
              :disable="ro"
              @click="newColoring()"
            />
            <q-btn
              outline
              dense
              no-caps
              icon="content_copy"
              label="Copy"
              :disable="ro"
              @click="newColoring(coloringId)"
            />
          </div>
          <q-expansion-item
            dense
            default-opened
            label="Colors and fabrics"
            header-class="text-subtitle2"
          >
            <PaletteTray colors-only sidebar />
          </q-expansion-item>
          <div class="text-caption text-grey-7">{{ toolHint }}</div>
        </template>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// The rosette editor (spec 050, spec 027 FR-003b): place shapes and rosettes in Free, Grow or Grid
// mode, snap them edge to edge, close gaps, color them like a block.
import { useQuasar } from 'quasar';
import { computed, ref, shallowRef, watch } from 'vue';
import { useRoute } from 'vue-router';
import DetailsPanel from '@/components/DetailsPanel.vue';
import EppCanvas, { type CanvasPoly, type Decor, type Grid } from '@/components/EppCanvas.vue';
import EppPicker, { type PickerGroup } from '@/components/EppPicker.vue';
import PaletteTray from '@/components/PaletteTray.vue';
import type { World } from '@/composables/viewport';
import { fillFor } from '@/editor/paint';
import { failing } from '@/model/epp/checks';
import { expand, lookupEpp, rosetteLeaves, type Leaf } from '@/model/epp/expand';
import {
  outerEdges,
  overlapping,
  place,
  type Edge,
  type Pose,
  type Poly,
} from '@/model/epp/geometry';
import { cellAt, gridKindFor, snapOrigin, type Lattice } from '@/model/epp/grid';
import { attach } from '@/model/epp/grow';
import {
  addColoring,
  addPiece,
  closeSpace,
  copyIn,
  deleteColoring,
  movePiece,
  paintPiece,
  removePieces,
} from '@/model/epp/rosette-ops';
import { snap, snapPose, staticEdges } from '@/model/epp/snap';
import { dist, pointInPolygon, type Pt } from '@/model/geometry/path';
import { isLibraryItem } from '@/model/library-items';
import type { Rosette } from '@/model/schema/epp';
import type { Fill } from '@/model/schema/coloring';
import { colorLookup, type View } from '@/render/draw';
import { useEditorStore } from '@/stores/editor';
import { useEppEditorStore, type RosetteTool } from '@/stores/epp-editor';
import { useLibraryStore } from '@/stores/library';
import { useProjectStore } from '@/stores/project';
import { useSettingsStore } from '@/stores/settings';
import type { EppPrefs } from '@/settings/settings';

const project = useProjectStore();
const library = useLibraryStore();
const app = useSettingsStore();
const epp = useEppEditorStore();
const editor = useEditorStore();
const route = useRoute();
const $q = useQuasar();
const fill = (offset: number) => ({ height: `calc(100vh - ${offset}px)` });

const id = computed(() => String(route.params.id));
const own = computed(() => project.doc?.project.rosettes?.find((r) => r.id === id.value));
const rosette = computed<Rosette | undefined>(
  () => own.value ?? library.lookup.rosette?.(id.value),
);
const ro = computed(() => project.readOnly || !own.value || isLibraryItem(own.value));

const tab = ref<'details' | 'design'>('design');
const sidebar = ref(!$q.screen.lt.md);
const sidebarLabel = computed(() => (sidebar.value ? 'Hide sidebar' : 'Show sidebar'));
const swapped = computed(() => app.settings.sidesSwapped);
const prefs = computed(() => app.settings.epp);
const setPref = <K extends keyof EppPrefs>(k: K, v: EppPrefs[K]) =>
  (app.settings.epp = { ...app.settings.epp, [k]: v });

const MODES: { id: EppPrefs['mode']; icon: string; label: string; hint: string }[] = [
  {
    id: 'free',
    icon: 'pan_tool_alt',
    label: 'Free',
    hint: 'Free: place and drag shapes; edges snap together',
  },
  {
    id: 'grow',
    icon: 'add_box',
    label: 'Grow',
    hint: 'Grow: tap a free edge to attach the picked shape',
  },
  { id: 'grid', icon: 'grid_on', label: 'Grid', hint: 'Grid: shapes sit on a grid' },
];
const TOOLS: { id: RosetteTool; icon: string; label: string; hint: string }[] = [
  {
    id: 'place',
    icon: 'add_location_alt',
    label: 'Place',
    hint: 'Place: tap to place the picked shape; drag a piece to move it',
  },
  { id: 'select', icon: 'near_me', label: 'Select', hint: 'Select: tap a piece; drag to move it' },
  { id: 'turn', icon: 'rotate_right', label: 'Turn', hint: 'Turn: tap a piece to turn it' },
  { id: 'mirror', icon: 'flip', label: 'Mirror', hint: 'Mirror: tap a piece to flip it' },
  { id: 'erase', icon: 'delete', label: 'Delete', hint: 'Delete: tap a piece to remove it' },
  {
    id: 'close',
    icon: 'format_shapes',
    label: 'Close space',
    hint: 'Close space: tap a gap to fill it with a new shape',
  },
  {
    id: 'paint',
    icon: 'format_paint',
    label: 'Paint',
    hint: 'Paint: tap a piece to paint it in this coloring',
  },
];
const toolHint = computed(() => TOOLS.find((t) => t.id === epp.rosetteTool)?.hint ?? '');

const view = computed({
  get: () => epp.views.get(`rosette:${id.value}`),
  set: (v: View | undefined) => v && epp.views.set(`rosette:${id.value}`, v),
});
const canvasRef = ref<InstanceType<typeof EppCanvas>>();
const px = (n: number) => n * (canvasRef.value?.worldPerPx() ?? 0.02);

const coloringId = ref<string | undefined>();
watch(
  rosette,
  (r) => {
    if (r && !r.colorings.some((c) => c.id === coloringId.value))
      coloringId.value = r.colorings[0]?.id;
  },
  { immediate: true },
);

const lookup = computed(() => lookupEpp(project.doc!.project, [], library.lookup));
const leaves = computed<Leaf[]>(() =>
  rosette.value ? rosetteLeaves(rosette.value, lookup.value, coloringId.value) : [],
);
const failingIds = computed(() => {
  const own = rosette.value?.shapes ?? [];
  const bad = new Set(failing(own).map((i) => own[i]!.id));
  return bad;
});
const failingCount = computed(() => failingIds.value.size);
const overlaps = computed(() => overlapping(leaves.value.map((l) => l.poly)));

// --- The picker: own and library shapes and rosettes (not this rosette) ---
const pickerGroups = computed<PickerGroup[]>(() => {
  const p = project.doc!.project;
  const mineShapes = (p.eppShapes ?? []).filter((s) => !isLibraryItem(s));
  const mineRosettes = (p.rosettes ?? []).filter((r) => !isLibraryItem(r) && r.id !== id.value);
  const seen = new Set([...mineShapes, ...mineRosettes].map((x) => x.id));
  return [
    { label: 'This project', shapes: mineShapes, rosettes: mineRosettes },
    {
      label: 'Libraries',
      shapes: library.items.eppShapes.filter((s) => !seen.has(s.id)),
      rosettes: library.items.rosettes.filter((r) => !seen.has(r.id) && r.id !== id.value),
    },
  ];
});
const cssFill = (f: Fill | undefined) => {
  const v = colorLookup(project.doc!)(f);
  return typeof v === 'string' ? v : undefined;
};

/** The picked item's polygons for a pose. */
function pickedPolys(pose: Pose): Poly[] {
  const pick = epp.picked;
  if (!pick) return [];
  const s = lookup.value.shape(pick);
  if (s) return [place(s.outline, pose)];
  const r = lookup.value.rosette(pick);
  if (!r) return [];
  const piece = { id: 'ghost', rosette: r.id, at: pose.at, turn: pose.turn, scale: pose.scale };
  return expand(pose.mirror ? { ...piece, mirror: true } : piece, lookup.value).map((l) => l.poly);
}
const pickedShape = computed(() => (epp.picked ? lookup.value.shape(epp.picked) : undefined));

// --- Grid ---
const lattice = computed<Lattice>(() => ({
  kind: (pickedShape.value && gridKindFor(pickedShape.value.outline)) || 'square',
  origin: epp.gridOrigin,
  step: prefs.value.syncGrid ? epp.scale : 1,
}));
const grid = computed<Grid>(() =>
  prefs.value.mode === 'grid'
    ? { kind: lattice.value.kind, origin: lattice.value.origin, step: lattice.value.step }
    : { kind: 'square' },
);

// --- Hover, ghost, edges ---
const hover = ref<Pt | null>(null);
const tick = ref(0);
const allPolys = computed(() => leaves.value.map((l) => l.poly));
const index = computed(() => staticEdges(allPolys.value));
const free = computed(() => outerEdges(allPolys.value));
function edgeNear(p: Pt): Edge | null {
  let best: Edge | null = null;
  let d = px(14);
  for (const [a, b] of free.value) {
    const ab: Pt = [b[0] - a[0], b[1] - a[1]];
    const t = Math.max(
      0,
      Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / (ab[0] ** 2 + ab[1] ** 2)),
    );
    const e = dist(p, [a[0] + ab[0] * t, a[1] + ab[1] * t]);
    if (e < d) [best, d] = [[a, b], e];
  }
  return best;
}
const hoverEdge = computed(() =>
  prefs.value.mode === 'grow' && hover.value && !pieceAt(hover.value)
    ? edgeNear(hover.value)
    : null,
);
const fitOnEdge = (pid: string) => {
  const s = lookup.value.shape(pid);
  const e = hoverEdge.value;
  return s && e ? attach(s.outline, epp.scale, e, allPolys.value) !== null : undefined;
};

/** Where a tap would place the picked item now. */
const ghost = computed<Pose | null>(() => {
  const p = hover.value;
  if (!p || !epp.picked || epp.rosetteTool !== 'place' || ro.value || drag.value) return null;
  if (pieceAt(p)) return null;
  const mode = prefs.value.mode;
  if (mode === 'grow') {
    const e = hoverEdge.value;
    const s = pickedShape.value;
    return e && s ? attach(s.outline, epp.scale, e, allPolys.value, p) : null;
  }
  if (mode === 'grid') {
    const s = pickedShape.value;
    return s ? cellAt(s.outline, epp.scale, lattice.value, p) : null;
  }
  const pose: Pose = { at: p, turn: 0, scale: epp.scale };
  const s = snap(pickedPolys(pose), index.value, px(28));
  return s ? snapPose(pose, s) : pose;
});

function pieceAt(p: Pt): Leaf | undefined {
  for (let i = leaves.value.length - 1; i >= 0; i--)
    if (pointInPolygon(p, leaves.value[i]!.poly)) return leaves.value[i];
  return undefined;
}

const polys = computed<CanvasPoly[]>(() =>
  leaves.value.map((l, i) => ({
    poly: l.poly,
    fill: l.fill,
    selected: epp.selection.has(l.part!),
    failing: failingIds.value.has(l.shape),
    overlap: overlaps.value.has(i),
  })),
);

// --- Edits ---
function edit(fn: (r: Rosette) => Rosette, coalesce?: string) {
  if (ro.value) return;
  project.change(
    (d) => {
      const list = d.project.rosettes ?? [];
      const k = list.findIndex((r) => r.id === id.value);
      if (k >= 0) list[k] = fn(list[k] as Rosette);
    },
    coalesce ? { coalesce } : {},
  );
}
const paintNow = () => (editor.color ? fillFor(editor.color) : undefined);

function placeAt(pose: Pose) {
  const pick = epp.picked;
  if (!pick) return;
  const s = lookup.value.shape(pick);
  if (s)
    return edit((r) => addPiece(r, pick, pose, paintNow() ?? ('fill' in s ? s.fill : undefined)));
  const other = lookup.value.rosette(pick);
  if (other) edit((r) => copyIn(r, other, lookup.value, pose));
}

function onTap(p: World) {
  if (tab.value !== 'design' || ro.value) return;
  const hit = pieceAt(p);
  const t = epp.rosetteTool;
  if (t === 'place') {
    if (!hit && ghost.value) return placeAt(ghost.value);
    epp.selection = new Set(hit ? [hit.part!] : []);
    return;
  }
  if (t === 'select') return void (epp.selection = new Set(hit ? [hit.part!] : []));
  if (t === 'close') {
    if (hit) return;
    const r = rosette.value && closeSpace(rosette.value, allPolys.value, p);
    if (r) edit(() => r);
    else $q.notify({ message: 'No closed gap there to fill.', timeout: 1500 });
    return;
  }
  if (!hit) return;
  const piece = rosette.value!.pieces.find((x) => x.id === hit.part)!;
  if (t === 'erase') return edit((r) => removePieces(r, new Set([piece.id])));
  if (t === 'mirror') return edit((r) => movePiece(r, piece.id, { mirror: !piece.mirror }));
  if (t === 'paint' && coloringId.value)
    return edit((r) => paintPiece(r, coloringId.value!, piece.id, paintNow() ?? null));
  if (t === 'turn') {
    const n = lookup.value.shape(piece.shape)?.outline.length ?? 4;
    const pose: Pose = { ...piece, turn: piece.turn + 360 / n };
    const others = staticEdges(leaves.value.filter((l) => l.part !== piece.id).map((l) => l.poly));
    const s = snap(pickedPolysFor(piece.shape, pose), others, px(16), Math.PI / 12);
    const next = s ? snapPose(pose, s) : pose;
    return edit((r) => movePiece(r, piece.id, next));
  }
}
const pickedPolysFor = (shape: string, pose: Pose) => {
  const s = lookup.value.shape(shape);
  return s ? [place(s.outline, pose)] : [];
};
function onHover(p: World | null) {
  hover.value = p;
  tick.value++;
}

// --- Drags: move a piece (snapping), or move the grid ---
type Drag =
  | {
      kind: 'piece';
      id: string;
      shape: string;
      from: Pose;
      grab: Pt;
      key: string;
      others: ReturnType<typeof staticEdges>;
    }
  | { kind: 'grid'; origin: Pt; grab: Pt };
const drag = shallowRef<Drag | null>(null);
function claim(p: World, e: PointerEvent) {
  if (tab.value !== 'design' || e.button === 2) return false;
  if (prefs.value.mode === 'grid' && epp.draggingGrid) {
    drag.value = { kind: 'grid', origin: epp.gridOrigin, grab: p };
    return true;
  }
  if (ro.value || !['place', 'select'].includes(epp.rosetteTool)) return false;
  const hit = pieceAt(p);
  if (!hit) return false;
  const piece = rosette.value!.pieces.find((x) => x.id === hit.part)!;
  drag.value = {
    kind: 'piece',
    id: piece.id,
    shape: piece.shape,
    from: { at: piece.at, turn: piece.turn, scale: piece.scale, mirror: piece.mirror },
    grab: p,
    key: `rosette-move-${Date.now()}`,
    others: staticEdges(leaves.value.filter((l) => l.part !== piece.id).map((l) => l.poly)),
  };
  epp.selection = new Set([piece.id]);
  return true;
}
function onDrag(p: World) {
  const d = drag.value;
  if (!d) return;
  if (d.kind === 'grid') {
    const moved: Pt = [d.origin[0] + p[0] - d.grab[0], d.origin[1] + p[1] - d.grab[1]];
    const corners = allPolys.value.flat();
    epp.gridOrigin = snapOrigin({ ...lattice.value, origin: moved }, corners, px(16));
    tick.value++;
    return;
  }
  const pose: Pose = {
    ...d.from,
    at: [d.from.at[0] + p[0] - d.grab[0], d.from.at[1] + p[1] - d.grab[1]],
  };
  let next = pose;
  if (prefs.value.mode === 'grid') {
    const s = lookup.value.shape(d.shape);
    next = (s && cellAt(s.outline, pose.scale, lattice.value, pose.at)) || pose;
  } else {
    const s = snap(pickedPolysFor(d.shape, pose), d.others, px(28));
    if (s) next = snapPose(pose, s);
  }
  edit((r) => movePiece(r, d.id, next), d.key);
}
function onDragEnd() {
  drag.value = null;
}

function newColoring(copyOf?: string) {
  let made = '';
  edit((r) => {
    const out = addColoring(r, copyOf);
    made = out.id;
    return out.rosette;
  });
  if (made) coloringId.value = made;
}

const readout = computed(() => {
  const n = leaves.value.length;
  const o = overlaps.value.size;
  return `${n} ${n === 1 ? 'piece' : 'pieces'}${o ? ` · ${o} overlapping` : ''}`;
});

function decorate({ ctx, px: p }: Decor) {
  const e = hoverEdge.value;
  if (e) {
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = p(4);
    ctx.beginPath();
    ctx.moveTo(e[0][0], e[0][1]);
    ctx.lineTo(e[1][0], e[1][1]);
    ctx.stroke();
  }
  // The ghost only with a mouse: on touch there is no hover.
  const g = ghost.value;
  if (!g) return;
  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = '#90caf9';
  ctx.strokeStyle = '#1976d2';
  ctx.lineWidth = p(1.5);
  for (const poly of pickedPolys(g)) {
    ctx.beginPath();
    poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
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
