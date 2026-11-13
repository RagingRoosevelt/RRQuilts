<template>
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
      <q-separator />
      <q-btn
        v-for="t in TOOLS"
        :key="t.id"
        :flat="tool !== t.id"
        :unelevated="tool === t.id"
        :color="tool === t.id ? 'primary' : undefined"
        dense
        :icon="t.icon"
        :class="t.cls"
        :aria-label="t.label"
        :disable="ro"
        @click="onToolClick(t.id)"
      >
        <q-tooltip anchor="center right" self="center left">{{ t.hint }}</q-tooltip>
      </q-btn>
      <q-btn
        flat
        dense
        icon="library_add"
        aria-label="Duplicate"
        :disable="ro || !epp.selection.size"
        @click="sel.duplicate()"
      >
        <q-tooltip anchor="center right" self="center left">{{ DUPLICATE_HINT }}</q-tooltip>
      </q-btn>
    </div>

    <div class="col relative-position column no-wrap">
      <EppCanvas
        ref="canvasRef"
        v-model:view="view"
        :doc="project.doc!"
        :polys="polys"
        :grid="grid"
        :unit-length="quilt.layout.style === 'epp' ? quilt.layout.unit : 1"
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
      <QuiltColorways :quilt="quilt" mode="panel" :readonly="ro" />
      <!-- As the quilt editor's Blocks / Colors: Colors is the Paint tool. -->
      <q-tabs
        :model-value="tool === 'paint' ? 'colors' : 'shapes'"
        dense
        no-caps
        align="justify"
        @update:model-value="(v: string) => (tool = v === 'colors' ? 'paint' : 'place')"
      >
        <q-tab name="shapes" label="Shapes" />
        <q-tab name="colors" label="Colors" />
      </q-tabs>
      <div class="text-caption text-grey-7">{{ toolHint }}</div>
      <!-- Paint: where it applies and the colors first; the shape picker steps aside. -->
      <template v-if="tool === 'paint'">
        <div class="row items-center" style="gap: 8px">
          <span class="text-caption">Apply to</span>
          <q-btn-toggle
            v-model="scope"
            dense
            no-caps
            :options="[
              { label: 'This', value: 'this' },
              { label: 'All', value: 'all' },
              { label: 'Same shape', value: 'shape' },
              { label: 'Same fill', value: 'fill' },
            ]"
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
      </template>
      <template v-else>
        <div>
          <div class="text-subtitle2">Placement</div>
          <SlidePicker
            :model-value="prefs.mode"
            :options="MODES.map((m) => ({ value: m.id, label: m.label }))"
            @update:model-value="(v: string) => setPref('mode', v as EppPrefs['mode'])"
          />
          <div class="text-caption text-grey-7 q-mt-xs">
            {{ MODES.find((m) => m.id === prefs.mode)?.hint }}
          </div>
        </div>
        <template v-if="prefs.mode === 'grid'">
          <q-btn
            :outline="!epp.draggingGrid"
            :unelevated="epp.draggingGrid"
            :color="epp.draggingGrid ? 'primary' : undefined"
            no-caps
            dense
            icon="open_with"
            label="Drag grid"
            class="self-start q-px-sm"
            @click="epp.draggingGrid = !epp.draggingGrid"
          />
          <q-toggle
            :model-value="prefs.syncGrid"
            dense
            label="Sync grid to selected size"
            @update:model-value="(v: boolean) => setPref('syncGrid', v)"
          />
        </template>
        <EppPicker
          v-model:picked="epp.picked"
          :scale="sel.size.value ?? epp.scale"
          v-model:ungrouped="ungrouped"
          @update:scale="setScale"
          show-ungrouped
          :groups="pickerGroups"
          :lookup="lookup"
          :paint="cssFill"
          :fit="prefs.mode === 'grow' && hoverEdge ? fitOnEdge : undefined"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
// An EPP quilt's Design tab (spec 027 FR-014): the rosette editor's engine on the quilt's pieces,
// which are shapes or whole (linked) rosettes, at the quilt's 1U length.
import { useQuasar } from 'quasar';
import { computed, ref, shallowRef } from 'vue';
import EppCanvas, { type CanvasPoly, type Decor, type Grid } from '@/components/EppCanvas.vue';
import EppPicker, { type PickerGroup } from '@/components/EppPicker.vue';
import PaletteTray from '@/components/PaletteTray.vue';
import QuiltColorways from '@/components/QuiltColorways.vue';
import SlidePicker from '@/components/SlidePicker.vue';
import { ERASER } from '@/components/icons';
import { useEppSelection } from '@/composables/epp-selection';
import type { World } from '@/composables/viewport';
import { fillFor } from '@/editor/paint';
import { checkOutline, passes } from '@/model/epp/checks';
import { expand, expandAll, lookupEpp, type Leaf } from '@/model/epp/expand';
import { gapAt, lineCut } from '@/model/epp/faces';
import { outerEdges, overlapping, type Edge, type Pose } from '@/model/epp/geometry';
import { cellAt, gridKindFor, snapOrigin, type Lattice } from '@/model/epp/grid';
import { attach } from '@/model/epp/grow';
import { piecePose } from '@/model/epp/match';
import { DUPLICATE_ID, movePose } from '@/model/epp/selection';
import {
  addPiece,
  breakAll,
  breakIntoPatches,
  clipRosette,
  copyPieces,
  fillGap,
  pastePieces,
  movePiece,
  paint,
  refresh,
  removePieces,
  splitPiece,
  type PaintScope,
} from '@/model/epp/quilt-ops';
import { landsOver, nextTurn, snap, snapPose, staticEdges } from '@/model/epp/snap';
import { dist, pointInPolygon, type Pt } from '@/model/geometry/path';
import { isLibraryItem } from '@/model/library-items';
import { shownColorway, swapper } from '@/model/colorways';
import type { Fill } from '@/model/schema/coloring';
import type { EppPiece } from '@/model/schema/epp';
import type { Quilt } from '@/model/schema/quilt';
import { colorLookup, type View } from '@/render/draw';
import { useEditorStore } from '@/stores/editor';
import { useEppEditorStore } from '@/stores/epp-editor';
import { useLibraryStore } from '@/stores/library';
import { useProjectStore } from '@/stores/project';
import { useSettingsStore } from '@/stores/settings';
import type { EppPrefs } from '@/settings/settings';

type Tool =
  'select' | 'place' | 'turn' | 'mirror' | 'mirrorY' | 'break' | 'erase' | 'close' | 'paint';

const props = defineProps<{ quilt: Quilt; sidebar: boolean }>();
const project = useProjectStore();
const library = useLibraryStore();
const app = useSettingsStore();
const epp = useEppEditorStore();
const editor = useEditorStore();
const $q = useQuasar();

const ro = computed(() => project.readOnly);
const swapped = computed(() => app.settings.sidesSwapped);
const prefs = computed(() => app.settings.epp);
const setPref = <K extends keyof EppPrefs>(k: K, v: EppPrefs[K]) =>
  (app.settings.epp = { ...app.settings.epp, [k]: v });
const ungrouped = computed({
  get: () => prefs.value.ungrouped,
  set: (v: boolean) => setPref('ungrouped', v),
});

const tool = ref<Tool>('place');
const scope = ref<PaintScope>('this');
const MODES: { id: EppPrefs['mode']; label: string; hint: string }[] = [
  { id: 'free', label: 'Free', hint: 'Place and drag pieces; edges snap together.' },
  { id: 'grow', label: 'Grow', hint: 'Tap a free edge to attach the picked shape.' },
  {
    id: 'grid',
    label: 'Grid',
    hint: 'Pieces sit on a grid; a neighbor’s edge in reach snaps first.',
  },
];
const TOOLS: { id: Tool; icon: string; label: string; hint: string; cls?: string }[] = [
  {
    id: 'select',
    icon: 'highlight_alt',
    label: 'Select',
    hint: 'Select: tap pieces to pick or unpick them; drag from empty space to box them (Alt: every piece the box touches); drag a picked piece to move them all. Turn, Mirror, Delete, Break into patches, Duplicate and the Scale act on what is picked',
  },
  {
    id: 'place',
    icon: 'touch_app',
    label: 'Place',
    hint: 'Place: tap to place the picked shape or rosette (tap its card again to stop); drag a piece to move it',
  },
  {
    id: 'turn',
    icon: 'rotate_right',
    label: 'Turn',
    hint: 'Turn: tap a piece; a snapped piece turns to its next edge that fits the same neighbor',
  },
  {
    id: 'mirror',
    icon: 'flip',
    label: 'Mirror left to right',
    hint: 'Mirror left to right: tap a piece to flip it',
  },
  {
    id: 'mirrorY',
    icon: 'flip',
    cls: 'turned',
    label: 'Mirror up and down',
    hint: 'Mirror up and down: tap a piece to flip it',
  },
  {
    id: 'break',
    icon: 'scatter_plot',
    label: 'Break into patches',
    hint: 'Break into patches: tap a placed rosette to make it loose pieces',
  },
  { id: 'erase', icon: ERASER, label: 'Delete', hint: 'Delete: tap a piece to remove it' },
  {
    id: 'close',
    icon: 'format_shapes',
    label: 'Close space',
    hint: 'Close space: tap a gap to fill it with a shape; drag from corner to corner to close part of a gap or split a piece',
  },
  {
    id: 'paint',
    icon: 'format_paint',
    label: 'Paint',
    hint: 'Paint: tap a piece with the picked color or fabric',
  },
];
const DUPLICATE_HINT =
  'Duplicate (Ctrl+D): the picked pieces become a temporary rosette at the top of the sidebar, to place as often as you like until the next Duplicate';
const toolHint = computed(() => TOOLS.find((t) => t.id === tool.value)?.hint ?? '');

const view = computed({
  get: () => epp.views.get(`quilt:${props.quilt.id}`),
  set: (v: View | undefined) => v && epp.views.set(`quilt:${props.quilt.id}`, v),
});
const canvasRef = ref<InstanceType<typeof EppCanvas>>();
const px = (n: number) => n * (canvasRef.value?.worldPerPx() ?? 0.02);

const base = computed(() =>
  lookupEpp(project.doc!.project, props.quilt.epp?.shapes ?? [], library.lookup),
);
/** Duplicate's temporary rosette: in the picker and the ghost, never in the quilt. */
const dupe = computed(() => (epp.clip ? clipRosette(epp.clip, base.value) : null));
const lookup = computed(() => {
  const l = base.value;
  const d = dupe.value;
  return d ? { ...l, rosette: (id: string) => (id === DUPLICATE_ID ? d : l.rosette(id)) } : l;
});
const pieces = computed(() => props.quilt.epp?.pieces ?? []);
const leaves = computed<Leaf[]>(() => expandAll(pieces.value, lookup.value));
const swap = computed(() => swapper(shownColorway(props.quilt)));
const overlaps = computed(() => overlapping(leaves.value.map((l) => l.poly)));
const edge = computed(() =>
  props.quilt.layout.style === 'epp' ? props.quilt.layout.edge : undefined,
);

const polys = computed<CanvasPoly[]>(() => [
  ...leaves.value.map((l, i) => ({
    poly: l.poly,
    fill: swap.value(l.fill),
    selected: epp.selection.has(l.piece),
    overlap: overlaps.value.has(i),
  })),
  // Auto-close's closing pieces: drawn, not edited.
  ...(props.quilt.epp?.closing ?? []).map((c) => ({
    poly: c.outline,
    fill: swap.value(edge.value?.kind === 'close' ? edge.value.fill : undefined),
  })),
]);

// --- Picker ---
const pickerGroups = computed<PickerGroup[]>(() => {
  const p = project.doc!.project;
  const mineShapes = (p.eppShapes ?? []).filter((s) => !isLibraryItem(s));
  const mineRosettes = (p.rosettes ?? []).filter((r) => !isLibraryItem(r));
  const seen = new Set([...mineShapes, ...mineRosettes].map((x) => x.id));
  return [
    ...(dupe.value ? [{ label: 'Duplicate', shapes: [], rosettes: [dupe.value] }] : []),
    { label: 'This project', shapes: mineShapes, rosettes: mineRosettes },
    {
      label: 'Libraries',
      shapes: library.items.eppShapes.filter((s) => !seen.has(s.id)),
      rosettes: library.items.rosettes.filter((r) => !seen.has(r.id)),
    },
  ];
});
const cssFill = (f: Fill | undefined) => {
  const v = colorLookup(project.doc!, library.items.colors, undefined, library.items.fabrics)(f);
  return typeof v === 'string' ? v : undefined;
};
const pickedShape = computed(() => (epp.picked ? lookup.value.shape(epp.picked) : undefined));
/** A piece of the picked item at a pose (for ghosts and snapping). */
const pickedPiece = (pose: Pose): EppPiece => {
  const base = {
    id: 'ghost',
    at: pose.at,
    turn: pose.turn,
    scale: pose.scale,
    ...(pose.mirror ? { mirror: true } : {}),
  };
  if (pickedShape.value) return { ...base, shape: epp.picked! };
  const coloring = epp.coloringOf.get(epp.picked!);
  return { ...base, rosette: epp.picked!, ...(coloring ? { coloring } : {}) };
};
const polysOf = (p: EppPiece) => expand(p, lookup.value).map((l) => l.poly);

// --- Grid, hover, ghost ---
const lattice = computed<Lattice>(() => ({
  kind: (pickedShape.value && gridKindFor(pickedShape.value.outline)) || 'square',
  origin: epp.gridOrigin,
  step: prefs.value.syncGrid ? epp.scale : 1,
}));
const grid = computed<Grid>(() =>
  prefs.value.mode === 'grid'
    ? { kind: lattice.value.kind, origin: lattice.value.origin, step: lattice.value.step }
    : { kind: 'none' },
);
const SNAP_SHARE = 0.5;
const DRAG_TURN = Math.PI / 6;
const hover = ref<Pt | null>(null);
const tick = ref(0);
const snapTarget = ref<Edge | null>(null);
const allPolys = computed(() => leaves.value.map((l) => l.poly));
const index = computed(() => staticEdges(allPolys.value));
const free = computed(() => outerEdges(allPolys.value));
function leafAt(p: Pt): Leaf | undefined {
  for (let i = leaves.value.length - 1; i >= 0; i--)
    if (pointInPolygon(p, leaves.value[i]!.poly)) return leaves.value[i];
  return undefined;
}
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
  prefs.value.mode === 'grow' && hover.value && !leafAt(hover.value) ? edgeNear(hover.value) : null,
);
const fitOnEdge = (pid: string) => {
  const s = lookup.value.shape(pid);
  const e = hoverEdge.value;
  return s && e ? attach(s.outline, epp.scale, e, allPolys.value) !== null : undefined;
};
/** Where the picked item goes for a point (the hover ghost, or a tap: phones have no hover). */
function poseAt(p: Pt): Pose | null {
  if (!epp.picked || ro.value || leafAt(p)) return null;
  const mode = prefs.value.mode;
  const s = pickedShape.value;
  if (mode === 'grow') {
    const e = edgeNear(p);
    return e && s ? attach(s.outline, epp.scale, e, allPolys.value, p) : null;
  }
  // A duplicate goes in at the sizes it was made at.
  const pose: Pose = { at: p, turn: 0, scale: epp.picked === DUPLICATE_ID ? 1 : epp.scale };
  const moving = polysOf(pickedPiece(pose));
  // A rosette meets others by its outside edges: no snap that lands it over other pieces.
  const reject = s ? undefined : landsOver(moving, allPolys.value);
  const turn = mode === 'grid' ? DRAG_TURN : Math.PI;
  const sn = snap(moving, index.value, px(16), turn, SNAP_SHARE, reject);
  if (sn) return snapPose(pose, sn);
  return mode === 'grid' && s ? cellAt(s.outline, epp.scale, lattice.value, p) : pose;
}
const ghost = computed<Pose | null>(() =>
  hover.value && tool.value === 'place' && (!drag.value || drag.value.kind === 'ghost')
    ? poseAt(hover.value)
    : null,
);

// --- Edits (each also brings the box and closing pieces up to date) ---
function edit(fn: (q: Quilt) => Quilt, coalesce?: string) {
  if (ro.value) return;
  project.change(
    (d) => {
      const k = d.project.quilts.findIndex((q) => q.id === props.quilt.id);
      if (k >= 0) d.project.quilts[k] = refresh(fn(d.project.quilts[k] as Quilt), lookup.value);
    },
    { ...(coalesce ? { coalesce } : {}), session: sel.session() },
  );
}
const paintNow = () => (editor.color ? fillFor(editor.color) : undefined);

function placeAt(pose: Pose) {
  const pick = epp.picked;
  if (!pick) return;
  const clip = epp.clip;
  if (pick === DUPLICATE_ID) return void (clip && edit((q) => pastePieces(q, clip, pose).quilt));
  const s = lookup.value.shape(pick);
  const fill = paintNow() ?? (s && 'fill' in s ? s.fill : undefined);
  const piece = {
    ...piecePose(pose),
    ...(s ? { shape: pick } : { rosette: pick }),
    ...(s && fill ? { fills: { '': fill } } : {}),
    ...(!s && epp.coloringOf.get(pick) ? { coloring: epp.coloringOf.get(pick)! } : {}),
  };
  edit((q) => {
    const { quilt, id } = addPiece(q, piece);
    // Place rosettes ungrouped: as their loose pieces.
    return !s && ungrouped.value ? breakIntoPatches(quilt, lookup.value, id) : quilt;
  });
}

function onTap(p: World) {
  if (ro.value) return;
  const hit = leafAt(p);
  const t = tool.value;
  if (t === 'select') return sel.pick(hit?.piece ?? null);
  if (t === 'place') {
    const pose = hit ? null : poseAt(p);
    if (pose) placeAt(pose);
    else if (!hit && !epp.picked) sel.clear();
    return;
  }
  if (t === 'close') {
    if (hit) return;
    const gap = gapAt(allPolys.value, p);
    if (!gap) return void $q.notify({ message: 'No closed gap there to fill.', timeout: 1500 });
    return edit((q) => fillGap(q, gap, known.value));
  }
  if (!hit) return;
  const piece = pieces.value.find((x) => x.id === hit.piece)!;
  // A tap on a piece of a selection acts on the whole selection.
  if (epp.selection.size > 1 && epp.selection.has(piece.id)) {
    if (t === 'erase') return sel.remove();
    if (t === 'mirror') return sel.flip('x');
    if (t === 'mirrorY') return sel.flip('y');
    if (t === 'turn') return sel.turn();
    if (t === 'break') return breakSelection();
    if (t === 'paint') {
      const f = paintNow() ?? null;
      return edit((q) => paint(q, lookup.value, piece.id, hit.part, f, 'selection', epp.selection));
    }
  }
  if (t === 'erase') return edit((q) => removePieces(q, new Set([piece.id])));
  if (t === 'mirror' || t === 'mirrorY') {
    const flipped = movePose(piece, { pivot: piece.at, flip: t === 'mirror' ? 'x' : 'y' });
    return edit((q) => movePiece(q, piece.id, { ...flipped, mirror: !!flipped.mirror }));
  }
  if (t === 'break') {
    if (!piece.rosette)
      return void $q.notify({ message: 'That piece is already a single shape.', timeout: 1500 });
    return edit((q) => breakIntoPatches(q, lookup.value, piece.id));
  }
  if (t === 'paint')
    return edit((q) => paint(q, lookup.value, piece.id, hit.part, paintNow() ?? null, scope.value));
  if (t === 'turn') {
    const others = staticEdges(leaves.value.filter((l) => l.piece !== piece.id).map((l) => l.poly));
    const along = nextTurn(polysOf(piece), others);
    if (along) return edit((q) => movePiece(q, piece.id, snapPose(piece, along)));
    const n = piece.shape ? (lookup.value.shape(piece.shape)?.outline.length ?? 4) : 6;
    const pose: Pose = { ...piece, turn: piece.turn + 360 / n };
    const s = snap(polysOf({ ...piece, turn: pose.turn }), others, px(16), Math.PI / 12);
    return edit((q) => movePiece(q, piece.id, s ? snapPose(pose, s) : pose));
  }
}
/** Shapes Close space uses when an area is one of them (yours, then the libraries'). */
const known = computed(() =>
  [...(project.doc!.project.eppShapes ?? []), ...library.items.eppShapes].filter((x) =>
    passes(checkOutline(x.outline, x.marked)),
  ),
);
/** The piece corner within reach of p (Close space lines run corner to corner). */
function cornerNear(p: Pt, not?: Pt): Pt | null {
  let best: Pt | null = null;
  let d = px(14);
  for (const c of allPolys.value.flat()) {
    if (not && dist(c, not) < 1e-6) continue;
    const e = dist(p, c);
    if (e < d) [best, d] = [c, e];
  }
  return best;
}
/** A Close space line from a to b: fill the gaps on each side of it, or split the piece it crosses. */
function closeLine(a: Pt, b: Pt) {
  const cut = lineCut(allPolys.value, a, b);
  if (!cut)
    return void $q.notify({
      message: 'That line doesn’t close a gap or cross a piece.',
      timeout: 1500,
    });
  if ('gaps' in cut)
    return edit((q) => cut.gaps.reduce((out, g) => fillGap(out, g, known.value), q));
  const piece = pieces.value.find((x) => x.id === leaves.value[cut.piece]!.piece);
  if (!piece?.shape)
    return void $q.notify({
      message: 'Break the rosette into patches to split its pieces.',
      timeout: 2000,
    });
  edit((q) => splitPiece(q, piece.id, cut.parts, known.value));
}
/** Close space: the line being drawn, and the corner under the mouse. */
function drawCloseLine({ ctx, px: p }: Decor) {
  if (tool.value !== 'close') return;
  const d = drag.value;
  const dot = (c: Pt) => {
    ctx.beginPath();
    ctx.arc(c[0], c[1], p(5), 0, 2 * Math.PI);
    ctx.fill();
  };
  ctx.save();
  ctx.fillStyle = ctx.strokeStyle = '#2e7d32';
  if (d?.kind === 'line') {
    const to = d.b ?? d.end;
    ctx.lineWidth = p(2.5);
    if (!d.b) ctx.setLineDash([p(6), p(4)]);
    ctx.beginPath();
    ctx.moveTo(d.a[0], d.a[1]);
    ctx.lineTo(to[0], to[1]);
    ctx.stroke();
    dot(d.a);
    if (d.b) dot(d.b);
  } else {
    const c = hover.value && cornerNear(hover.value);
    if (c) dot(c);
  }
  ctx.restore();
}
function onHover(p: World | null) {
  hover.value = p;
  tick.value++;
}

type Drag =
  | {
      kind: 'piece';
      piece: EppPiece;
      grab: Pt;
      key: string;
      others: ReturnType<typeof staticEdges>;
      statics: Pt[][];
    }
  | { kind: 'grid'; origin: Pt; grab: Pt }
  /** Close space: a line from corner a, ending on corner b when one is in reach. */
  | { kind: 'line'; a: Pt; end: Pt; b: Pt | null }
  /** From empty space with something picked: the ghost follows, letting go places it. */
  | { kind: 'ghost' };
const drag = shallowRef<Drag | null>(null);
function claim(p: World, e: PointerEvent) {
  if (e.button === 2) return false;
  if (prefs.value.mode === 'grid' && epp.draggingGrid) {
    drag.value = { kind: 'grid', origin: epp.gridOrigin, grab: p };
    return true;
  }
  if (!ro.value && tool.value === 'close') {
    const a = cornerNear(p);
    if (!a) return false;
    drag.value = { kind: 'line', a, end: p, b: null };
    return true;
  }
  if (ro.value) return false;
  const hit = leafAt(p);
  if (tool.value === 'select') {
    if (hit) sel.startMove(p, hit.piece);
    else sel.startBox(p, e);
    return true;
  }
  if (tool.value !== 'place') return false;
  // Dragging a piece of a selection moves the selection.
  if (hit && epp.selection.size > 1 && epp.selection.has(hit.piece)) {
    sel.startMove(p, hit.piece);
    return true;
  }
  if (!hit) {
    // Touch has no hover: a drag from empty space is the ghost, placed where it's let go.
    if (!epp.picked) return false;
    drag.value = { kind: 'ghost' };
    hover.value = p;
    tick.value++;
    return true;
  }
  const piece = pieces.value.find((x) => x.id === hit.piece)!;
  drag.value = {
    kind: 'piece',
    piece,
    grab: p,
    key: `epp-move-${Date.now()}`,
    others: staticEdges(leaves.value.filter((l) => l.piece !== piece.id).map((l) => l.poly)),
    statics: leaves.value.filter((l) => l.piece !== piece.id).map((l) => l.poly),
  };
  return true;
}
function onDrag(p: World) {
  if (sel.onDrag(p)) return void tick.value++;
  const d = drag.value;
  if (!d) return;
  if (d.kind === 'ghost') {
    hover.value = p;
    tick.value++;
    return;
  }
  if (d.kind === 'line') {
    drag.value = { ...d, end: p, b: cornerNear(p, d.a) };
    tick.value++;
    return;
  }
  if (d.kind === 'grid') {
    const moved: Pt = [d.origin[0] + p[0] - d.grab[0], d.origin[1] + p[1] - d.grab[1]];
    epp.gridOrigin = snapOrigin({ ...lattice.value, origin: moved }, allPolys.value.flat(), px(16));
    tick.value++;
    return;
  }
  const from = d.piece;
  const pose: Pose = {
    ...from,
    at: [from.at[0] + p[0] - d.grab[0], from.at[1] + p[1] - d.grab[1]],
  };
  let next = pose;
  const moving = polysOf({ ...from, at: pose.at });
  const reject = from.rosette ? landsOver(moving, d.statics) : undefined;
  const s = snap(moving, d.others, px(16), DRAG_TURN, SNAP_SHARE, reject);
  if (s) next = snapPose(pose, s);
  else if (prefs.value.mode === 'grid' && from.shape) {
    const sh = lookup.value.shape(from.shape);
    next = (sh && cellAt(sh.outline, pose.scale, lattice.value, pose.at)) || pose;
  }
  snapTarget.value = s?.target ?? null;
  edit((q) => movePiece(q, from.id, next), d.key);
}
function onDragEnd(p: World, e: PointerEvent) {
  if (sel.onDragEnd()) return void tick.value++;
  const d = drag.value;
  drag.value = null;
  snapTarget.value = null;
  if (d?.kind === 'line') {
    const b = cornerNear(p, d.a);
    if (b) closeLine(d.a, b);
    tick.value++;
    return;
  }
  if (d?.kind !== 'ghost') return;
  const pose = poseAt(p);
  if (pose) placeAt(pose);
  // A finger leaves no hover behind.
  if (e.pointerType !== 'mouse') hover.value = null;
  tick.value++;
}

// --- Multi-select (spec 051; owner, 2026-11-12) ---
const sel = useEppSelection({
  items: () => pieces.value,
  leaves: () => leaves.value.map((l) => ({ item: l.piece, poly: l.poly })),
  update: (fn, coalesce) =>
    edit((q) => ({ ...q, epp: { ...q.epp!, pieces: fn(q.epp?.pieces ?? []) } }), coalesce),
  px,
  gridStep: () => lattice.value.step,
  active: () => !ro.value,
  remove: (ids) => edit((q) => removePieces(q, ids)),
  copy: (ids, mid) => copyPieces(props.quilt, ids, mid),
  duplicated: () => (tool.value = 'place'),
});
/** With pieces picked, Turn, the Mirrors, Delete and Break act on them at once. */
function onToolClick(id: Tool) {
  if (epp.selection.size) {
    if (id === 'turn') return sel.turn();
    if (id === 'mirror') return sel.flip('x');
    if (id === 'mirrorY') return sel.flip('y');
    if (id === 'erase') return sel.remove();
    if (id === 'break') return breakSelection();
  }
  tool.value = id;
}
/** The sidebar's Scale: the picked pieces' size when there are any, else the size to place at. */
function setScale(v: number) {
  if (epp.selection.size) sel.scaleTo(v);
  else epp.scale = v;
}
function breakSelection() {
  let ids: string[] = [];
  edit((q) => {
    const out = breakAll(q, lookup.value, epp.selection);
    ids = out.ids;
    return out.quilt;
  });
  epp.selection = new Set(ids);
}

const readout = computed(() => {
  const n = leaves.value.length;
  const o = overlaps.value.size;
  const u = props.quilt.layout.style === 'epp' ? props.quilt.layout.unit : 1;
  const units = project.doc!.units;
  const k = epp.selection.size;
  return `${n} ${n === 1 ? 'piece' : 'pieces'} · 1U = ${+u.toFixed(3)} ${units}${o ? ` · ${o} overlapping` : ''}${k ? ` · ${k} picked` : ''}`;
});

function decorate(dec: Decor) {
  const { ctx, px: p } = dec;
  drawCloseLine(dec);
  sel.decorate(dec);
  // Cut to size: the cut line.
  const e0 = edge.value;
  if (e0?.kind === 'cut') {
    const [x0, y0, x1, y1] = e0.rect;
    ctx.save();
    ctx.setLineDash([p(6), p(4)]);
    ctx.strokeStyle = '#d32f2f';
    ctx.lineWidth = p(2);
    ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    ctx.restore();
  }
  const e = hoverEdge.value ?? snapTarget.value;
  if (e) {
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = p(4);
    ctx.beginPath();
    ctx.moveTo(e[0][0], e[0][1]);
    ctx.lineTo(e[1][0], e[1][1]);
    ctx.stroke();
  }
  const g = ghost.value;
  if (!g) return;
  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = '#90caf9';
  ctx.strokeStyle = '#1976d2';
  ctx.lineWidth = p(1.5);
  for (const poly of polysOf(pickedPiece(g))) {
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
.turned :deep(.q-icon) {
  transform: rotate(90deg);
}
.readout {
  position: absolute;
  left: 8px;
  bottom: 8px;
  pointer-events: none;
  opacity: 0.8;
}
</style>
