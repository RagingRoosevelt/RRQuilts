<template>
  <q-page v-if="project.doc && rosette" class="editor column no-wrap" :style-fn="fill">
    <div class="row items-center no-wrap q-px-sm bar" :class="{ reverse: swapped }">
      <q-tabs v-model="tab" dense no-caps inline-label class="col">
        <q-tab name="details" icon="info" label="Details" />
        <q-tab name="design" icon="hive" label="Design" />
        <q-tab name="print" icon="print" label="Print" />
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
      <template #avatar><q-icon name="error" /></template>
      {{ failingCount }}
      {{ failingCount === 1 ? 'shape made here isn’t' : 'shapes made here aren’t' }}
      usable yet (outlined in red): {{ failingWhy }}.
    </q-banner>
    <q-banner v-else-if="unmarkedCount" dense class="bg-orange-2 text-black">
      <template #avatar><q-icon name="warning" color="orange-9" /></template>
      {{ unmarkedCount }}
      {{ unmarkedCount === 1 ? 'shape made here has' : 'shapes made here have' }} edges that aren’t
      whole units (outlined in orange). They snap to edges of the same length, double, half or a
      quarter.
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
        <template v-if="tab === 'design'">
          <q-separator />
          <q-btn
            v-for="t in TOOLS"
            :key="t.id"
            :flat="epp.rosetteTool !== t.id"
            :unelevated="epp.rosetteTool === t.id"
            :color="epp.rosetteTool === t.id ? 'primary' : undefined"
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
        </template>
      </div>

      <PrintPreview
        v-if="tab === 'print'"
        kind="rosette"
        :id="rosette.id"
        :doc="project.doc"
        :target="{ coloring: coloringId }"
      />
      <div v-else class="col relative-position column no-wrap">
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
        <PrintOptions v-else-if="tab === 'print'" kind="rosette" :id="rosette.id" />
        <template v-else>
          <!-- As the quilt editor's Blocks / Colors: Colors is the Paint tool. -->
          <q-tabs
            :model-value="epp.rosetteTool === 'paint' ? 'colors' : 'shapes'"
            dense
            no-caps
            align="justify"
            @update:model-value="
              (v: string) => (epp.rosetteTool = v === 'colors' ? 'paint' : 'place')
            "
          >
            <q-tab name="shapes" label="Shapes" />
            <q-tab name="colors" label="Colors" />
          </q-tabs>
          <div class="text-caption text-grey-7">{{ toolHint }}</div>
          <!-- Paint: colorings and colors first; the shape picker steps aside. -->
          <template v-if="epp.rosetteTool === 'paint'">
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
              >
                <q-tooltip>Drag the grid until it lines up with a placed piece</q-tooltip>
              </q-btn>
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
              @update:scale="setScale"
              :groups="pickerGroups"
              :lookup="lookup"
              :paint="cssFill"
              :fit="prefs.mode === 'grow' && hoverEdge ? fitOnEdge : undefined"
            />
            <div class="text-caption text-grey-7">
              Rosettes placed in a rosette become its pieces (they don’t stay linked).
            </div>
          </template>
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
import SlidePicker from '@/components/SlidePicker.vue';
import { ERASER } from '@/components/icons';
import PrintOptions from '@/components/PrintOptions.vue';
import PrintPreview from '@/components/PrintPreview.vue';
import PrintZoom from '@/components/PrintZoom.vue';
import { useEppSelection } from '@/composables/epp-selection';
import { DUPLICATE_ID, movePose } from '@/model/epp/selection';
import type { World } from '@/composables/viewport';
import { fillFor } from '@/editor/paint';
import { checkOutline, failing, passes, problems, unmarked } from '@/model/epp/checks';
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
  copyPieces,
  deleteColoring,
  fillGap,
  movePiece,
  paintPiece,
  pastePieces,
  removePieces,
  splitPiece,
} from '@/model/epp/rosette-ops';
import { lineCut } from '@/model/epp/faces';
import { clipRosette } from '@/model/epp/quilt-ops';
import { landsOver, nextTurn, snap, snapPose, staticEdges } from '@/model/epp/snap';
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

const tab = ref<'details' | 'design' | 'print'>(route.query.print ? 'print' : 'design');
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
const TOOLS: { id: RosetteTool; icon: string; label: string; hint: string; cls?: string }[] = [
  {
    id: 'select',
    icon: 'highlight_alt',
    label: 'Select',
    hint: 'Select: tap pieces to pick or unpick them; drag from empty space to box them (Alt: every piece the box touches); drag a picked piece to move them all. Turn, Mirror, Delete, Duplicate and the Scale act on what is picked',
  },
  {
    id: 'place',
    icon: 'touch_app',
    label: 'Place',
    hint: 'Place: tap to place the picked shape (tap its card again to stop); drag a piece to move it, it snaps to its neighbors',
  },
  {
    id: 'turn',
    icon: 'rotate_right',
    label: 'Turn',
    hint: 'Turn: tap a piece to turn it; a snapped piece turns to its next edge that fits the same neighbor',
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
    hint: 'Paint: tap a piece to paint it in this coloring',
  },
];
const DUPLICATE_HINT =
  'Duplicate (Ctrl+D): the picked pieces become a temporary rosette at the top of the sidebar, to place as often as you like until the next Duplicate';
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

// This rosette's own (internal) shapes too: dragging, turning and snapping look pieces up here.
const base = computed(() =>
  lookupEpp(project.doc!.project, rosette.value?.shapes ?? [], library.lookup),
);
/** Duplicate's temporary rosette: in the picker and the ghost, never saved. */
const dupe = computed(() => (epp.clip ? clipRosette(epp.clip, base.value) : null));
const lookup = computed(() => {
  const l = base.value;
  const d = dupe.value;
  return d ? { ...l, rosette: (rid: string) => (rid === DUPLICATE_ID ? d : l.rosette(rid)) } : l;
});
/** A duplicate goes in at the sizes it was made at. */
const placeScale = () => (epp.picked === DUPLICATE_ID ? 1 : epp.scale);
const leaves = computed<Leaf[]>(() =>
  rosette.value ? rosetteLeaves(rosette.value, lookup.value, coloringId.value) : [],
);
const failingIds = computed(() => {
  const own = rosette.value?.shapes ?? [];
  const bad = new Set(failing(own).map((i) => own[i]!.id));
  return bad;
});
const failingCount = computed(() => failingIds.value.size);
/** What the red shapes fail, in words ("crosses itself, isn't convex"). */
const failingWhy = computed(() => {
  const own = (rosette.value?.shapes ?? []).filter((s) => failingIds.value.has(s.id));
  return [...new Set(own.flatMap((s) => problems(checkOutline(s.outline, s.marked))))].join(', ');
});
const unmarkedIds = computed(() => {
  const own = rosette.value?.shapes ?? [];
  return new Set(unmarked(own).map((i) => own[i]!.id));
});
const unmarkedCount = computed(() => unmarkedIds.value.size);
const overlaps = computed(() => overlapping(leaves.value.map((l) => l.poly)));

// --- The picker: own and library shapes and rosettes (not this rosette) ---
const pickerGroups = computed<PickerGroup[]>(() => {
  const p = project.doc!.project;
  const mineShapes = (p.eppShapes ?? []).filter((s) => !isLibraryItem(s));
  const mineRosettes = (p.rosettes ?? []).filter((r) => !isLibraryItem(r) && r.id !== id.value);
  const seen = new Set([...mineShapes, ...mineRosettes].map((x) => x.id));
  return [
    ...(dupe.value ? [{ label: 'Duplicate', shapes: [], rosettes: [dupe.value] }] : []),
    { label: 'This project', shapes: mineShapes, rosettes: mineRosettes },
    {
      label: 'Libraries',
      shapes: library.items.eppShapes.filter((s) => !seen.has(s.id)),
      rosettes: library.items.rosettes.filter((r) => !seen.has(r.id) && r.id !== id.value),
    },
  ];
});
const cssFill = (f: Fill | undefined) => {
  const v = colorLookup(project.doc!, library.items.colors, undefined, library.items.fabrics)(f);
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
  const coloring = epp.coloringOf.get(r.id);
  const piece = {
    id: 'ghost',
    rosette: r.id,
    at: pose.at,
    turn: pose.turn,
    scale: pose.scale,
    ...(coloring ? { coloring } : {}),
  };
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
    : { kind: 'none' },
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
/** Where the picked item goes for a point (the hover ghost, or a tap: phones have no hover). */
function poseAt(p: Pt): Pose | null {
  if (!epp.picked || ro.value || pieceAt(p)) return null;
  const mode = prefs.value.mode;
  if (mode === 'grow') {
    const e = edgeNear(p);
    const s = pickedShape.value;
    return e && s ? attach(s.outline, epp.scale, e, allPolys.value, p) : null;
  }
  if (mode === 'grid') {
    // A neighbor's edge in reach wins; otherwise the grid.
    const s = pickedShape.value;
    const free: Pose = { at: p, turn: 0, scale: placeScale() };
    const e = snap(pickedPolys(free), index.value, px(16), DRAG_TURN, SNAP_SHARE);
    if (e) return snapPose(free, e);
    return s ? cellAt(s.outline, epp.scale, lattice.value, p) : null;
  }
  const pose: Pose = { at: p, turn: 0, scale: placeScale() };
  const moving = pickedPolys(pose);
  // A rosette meets the pieces by its outside edges: no snap that lands it over them.
  const reject = pickedShape.value ? undefined : landsOver(moving, allPolys.value);
  const s = snap(moving, index.value, px(16), Math.PI, SNAP_SHARE, reject);
  return s ? snapPose(pose, s) : pose;
}
const ghost = computed<Pose | null>(() =>
  hover.value && epp.rosetteTool === 'place' && (!drag.value || drag.value.kind === 'ghost')
    ? poseAt(hover.value)
    : null,
);
/** Snaps reach half the shorter edge (or 16 screen pixels, when that's more). */
const SNAP_SHARE = 0.5;
/** A dragged piece turns at most this much to meet a neighbor (owner, 2026-11-10). */
const DRAG_TURN = Math.PI / 6;
/** The two edges the dragged piece meets (drawn green). */
const snapTarget = ref<Edge | null>(null);

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
    warn: unmarkedIds.value.has(l.shape),
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
    { ...(coalesce ? { coalesce } : {}), session: sel.session() },
  );
}
const paintNow = () => (editor.color ? fillFor(editor.color) : undefined);

function placeAt(pose: Pose) {
  const pick = epp.picked;
  if (!pick) return;
  const clip = epp.clip;
  if (pick === DUPLICATE_ID)
    return void (clip && edit((r) => pastePieces(r, clip, base.value, pose).rosette));
  const s = lookup.value.shape(pick);
  if (s)
    return edit((r) => addPiece(r, pick, pose, paintNow() ?? ('fill' in s ? s.fill : undefined)));
  const other = lookup.value.rosette(pick);
  // In the coloring picked on its card.
  if (other) edit((r) => copyIn(r, other, lookup.value, pose, epp.coloringOf.get(pick)));
}

function onTap(p: World) {
  if (tab.value !== 'design' || ro.value) return;
  const hit = pieceAt(p);
  const t = epp.rosetteTool;
  if (t === 'select') return sel.pick(hit?.part ?? null);
  if (t === 'place') {
    const pose = hit ? null : poseAt(p);
    if (pose) placeAt(pose);
    else if (!hit && !epp.picked) sel.clear();
    return;
  }
  if (t === 'close') {
    if (hit) return;
    const r = rosette.value && closeSpace(rosette.value, allPolys.value, p, known.value);
    if (r) edit(() => r);
    else $q.notify({ message: 'No closed gap there to fill.', timeout: 1500 });
    return;
  }
  if (!hit) return;
  const piece = rosette.value!.pieces.find((x) => x.id === hit.part)!;
  // A tap on a piece of a selection acts on the whole selection.
  if (epp.selection.size > 1 && epp.selection.has(piece.id)) {
    if (t === 'erase') return sel.remove();
    if (t === 'mirror') return sel.flip('x');
    if (t === 'mirrorY') return sel.flip('y');
    if (t === 'turn') return sel.turn();
    if (t === 'paint' && coloringId.value) {
      const [k, f, ids] = [coloringId.value, paintNow() ?? null, [...epp.selection]];
      return edit((r) => ids.reduce((out, id) => paintPiece(out, k, id, f), r));
    }
  }
  if (t === 'erase') return edit((r) => removePieces(r, new Set([piece.id])));
  if (t === 'mirror' || t === 'mirrorY') {
    const flipped = movePose(piece, { pivot: piece.at, flip: t === 'mirror' ? 'x' : 'y' });
    return edit((r) => movePiece(r, piece.id, { ...flipped, mirror: !!flipped.mirror }));
  }
  if (t === 'paint' && coloringId.value)
    return edit((r) => paintPiece(r, coloringId.value!, piece.id, paintNow() ?? null));
  if (t === 'turn') {
    const others = staticEdges(leaves.value.filter((l) => l.part !== piece.id).map((l) => l.poly));
    // Snapped: turn to the next edge that fits the neighbor it lies along.
    const along = nextTurn(pickedPolysFor(piece.shape, piece), others);
    if (along) return edit((r) => movePiece(r, piece.id, snapPose(piece, along)));
    const n = lookup.value.shape(piece.shape)?.outline.length ?? 4;
    const pose: Pose = { ...piece, turn: piece.turn + 360 / n };
    const s = snap(pickedPolysFor(piece.shape, pose), others, px(16), Math.PI / 12);
    const next = s ? snapPose(pose, s) : pose;
    return edit((r) => movePiece(r, piece.id, next));
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
/** Close space: the line being drawn, and the corner under the mouse. */
function drawCloseLine({ ctx, px: p }: Decor) {
  if (epp.rosetteTool !== 'close') return;
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
/** A Close space line from a to b: fill the gaps on each side of it, or split the piece it crosses. */
function closeLine(a: Pt, b: Pt) {
  const cut = lineCut(allPolys.value, a, b);
  if (!cut)
    return void $q.notify({
      message: 'That line doesn’t close a gap or cross a piece.',
      timeout: 1500,
    });
  if ('gaps' in cut)
    return edit((r) => cut.gaps.reduce((out, g) => fillGap(out, g, known.value), r));
  const part = leaves.value[cut.piece]!.part!;
  edit((r) => splitPiece(r, part, cut.parts, known.value));
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
  | { kind: 'grid'; origin: Pt; grab: Pt }
  /** Close space: a line from corner a, ending on corner b when one is in reach. */
  | { kind: 'line'; a: Pt; end: Pt; b: Pt | null }
  /** From empty space with something picked: the ghost follows, letting go places it. */
  | { kind: 'ghost' };
const drag = shallowRef<Drag | null>(null);
function claim(p: World, e: PointerEvent) {
  if (tab.value !== 'design' || e.button === 2) return false;
  if (prefs.value.mode === 'grid' && epp.draggingGrid) {
    drag.value = { kind: 'grid', origin: epp.gridOrigin, grab: p };
    return true;
  }
  if (!ro.value && epp.rosetteTool === 'close') {
    const a = cornerNear(p);
    if (!a) return false;
    drag.value = { kind: 'line', a, end: p, b: null };
    return true;
  }
  if (ro.value) return false;
  const hit = pieceAt(p);
  if (epp.rosetteTool === 'select') {
    if (hit) sel.startMove(p, hit.part!);
    else sel.startBox(p, e);
    return true;
  }
  if (epp.rosetteTool !== 'place') return false;
  // Dragging a piece of a selection moves the selection.
  if (hit && epp.selection.size > 1 && epp.selection.has(hit.part!)) {
    sel.startMove(p, hit.part!);
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
  // Edges snap in every mode; in Grid mode, with no edge in reach, the piece sits on the grid.
  const s = snap(pickedPolysFor(d.shape, pose), d.others, px(16), DRAG_TURN, SNAP_SHARE);
  if (s) next = snapPose(pose, s);
  else if (prefs.value.mode === 'grid') {
    const sh = lookup.value.shape(d.shape);
    next = (sh && cellAt(sh.outline, pose.scale, lattice.value, pose.at)) || pose;
  }
  snapTarget.value = s?.target ?? null;
  edit((r) => movePiece(r, d.id, next), d.key);
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
  items: () => rosette.value?.pieces ?? [],
  leaves: () => leaves.value.map((l) => ({ item: l.part!, poly: l.poly })),
  update: (fn, coalesce) => edit((r) => ({ ...r, pieces: fn(r.pieces) }), coalesce),
  px,
  sides: (pid) => {
    const s = rosette.value?.pieces.find((x) => x.id === pid)?.shape;
    return (s && lookup.value.shape(s)?.outline.length) || 4;
  },
  gridStep: () => lattice.value.step,
  active: () => tab.value === 'design' && !ro.value,
  remove: (ids) => edit((r) => removePieces(r, ids)),
  copy: (ids, mid) => copyPieces(rosette.value!, ids, mid, coloringId.value),
  duplicated: () => (epp.rosetteTool = 'place'),
});
watch(id, () => sel.clear());
/** With pieces picked, Turn, the Mirrors and Delete act on them at once. */
function onToolClick(t: RosetteTool) {
  if (epp.selection.size) {
    if (t === 'turn') return sel.turn();
    if (t === 'mirror') return sel.flip('x');
    if (t === 'mirrorY') return sel.flip('y');
    if (t === 'erase') return sel.remove();
  }
  epp.rosetteTool = t;
}
/** The sidebar's Scale: the picked pieces' size when there are any, else the size to place at. */
function setScale(v: number) {
  if (epp.selection.size) sel.scaleTo(v);
  else epp.scale = v;
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
  const k = epp.selection.size;
  return `${n} ${n === 1 ? 'piece' : 'pieces'}${o ? ` · ${o} overlapping` : ''}${k ? ` · ${k} picked` : ''}`;
});

function decorate(dec: Decor) {
  const { ctx, px: p } = dec;
  drawCloseLine(dec);
  sel.decorate(dec);
  const e = hoverEdge.value ?? snapTarget.value;
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
