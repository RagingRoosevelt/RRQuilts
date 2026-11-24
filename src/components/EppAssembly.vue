<template>
  <div
    class="row col no-wrap"
    :class="{ reverse: swapped }"
    style="min-height: 0; position: relative"
  >
    <!-- The flat net (seams editable) and the folded object: stacked or side by side (Settings ›
         Interface › 3D EPP; owner, 2026-11-23). -->
    <div class="col panes no-wrap" :class="vertical ? 'column split-v' : 'row split-h'">
      <div class="col relative-position column no-wrap net">
        <EppCanvas
          :key="netKey"
          ref="netRef"
          v-model:view="netView"
          :doc="project.doc!"
          :polys="netPolys"
          :grid="{ kind: 'none' }"
          :unit-length="unit"
          :decorate="decorateNet"
          :tick="netTick"
          hold-hover
          @tap="(p: World) => !ro && seams.tap(p)"
          @hover="onNetHover"
        />
        <div class="hint q-pa-xs text-caption">{{ NET_HINT }}</div>
      </div>
      <div ref="host" class="col relative-position view">
        <canvas
          ref="canvas"
          class="absolute-full"
          :style="{ cursor: grabbing ? 'grabbing' : 'grab' }"
          @pointerdown="down"
          @pointermove="move"
          @pointerup="up"
          @pointercancel="cancel"
          @wheel.prevent="wheel"
        />
        <q-badge v-if="exploded" color="primary" class="exploded">Exploded</q-badge>
        <div class="hint q-pa-xs text-caption">{{ HINT }}</div>
        <div v-if="!leaves.length" class="absolute-center text-body2 text-grey-7 text-center">
          No pieces yet. Place them in the Design tab.
        </div>
      </div>
    </div>

    <div v-show="sidebar" class="inspector q-pa-md scroll column no-wrap" style="gap: 12px">
      <div>
        <div class="text-subtitle2">Fold</div>
        <div class="text-caption text-grey-7">{{ counts }}</div>
      </div>
      <div class="text-body2" :class="foldClass">{{ foldText }}</div>
      <div v-if="mightClose" class="note text-body2">
        <q-icon name="lightbulb" class="q-mr-xs" />The design is closed, so stuffing might close
        these seams: the fabric bends where flat pieces can't. Turn on Stuffed design to see.
      </div>
      <q-btn
        outline
        dense
        no-caps
        icon="replay"
        label="Fold again"
        class="self-start q-px-sm"
        :disable="!leaves.length"
        @click="rebuild(true)"
      />
      <q-separator />
      <div class="text-subtitle2">Stuffing</div>
      <!-- The design's setting (saved, also in Layout) and this view's switch (not saved), kept
           apart (owner, 2026-11-23). -->
      <div>
        <q-toggle
          :model-value="designStuffed"
          dense
          label="Stuffed design"
          :disable="ro"
          @update:model-value="setDesignStuffed"
        />
        <div class="text-caption text-grey-7 q-mt-xs">
          Saved with the design, as in the Layout tab: it is filled with stuffing once sewn.
        </div>
      </div>
      <div
        v-if="designStuffed"
        class="stuffable row no-wrap items-start"
        :class="stuffable.ok ? 'ok' : 'no'"
      >
        <q-icon :name="stuffable.ok ? 'check_circle' : 'block'" size="20px" class="q-mr-sm" />
        <div>
          <div class="text-weight-medium">
            {{ stuffable.ok ? 'Can be stuffed' : 'Can’t be stuffed' }}
          </div>
          <div class="text-caption">{{ stuffable.why }}</div>
        </div>
      </div>
      <div>
        <q-toggle
          :model-value="designStuffed && showStuffing"
          dense
          checked-icon="visibility"
          unchecked-icon="visibility_off"
          label="Enable simulation view"
          :disable="!designStuffed"
          @update:model-value="(on: boolean) => (showStuffing = on)"
        />
        <div class="text-caption text-grey-7 q-mt-xs">
          {{
            designStuffed
              ? 'Simulates the stuffing in this view, on whenever the tab opens. Off shows the flat pieces. Nothing is saved.'
              : 'For a stuffed design.'
          }}
        </div>
      </div>
      <div v-if="stuffText" class="text-body2">{{ stuffText }}</div>
      <q-separator />
      <div class="text-subtitle2">Front</div>
      <div class="text-caption text-grey-7">
        Once folded, the object turns so its front faces you and the design’s up is up. Double-click
        a piece to make it the front.
      </div>
      <q-btn
        v-if="quilt.epp?.front"
        flat
        dense
        no-caps
        icon="restart_alt"
        label="Default front"
        class="self-start q-px-sm"
        :disable="ro || stuffed"
        @click="pickFront(null)"
      />
      <q-btn
        outline
        dense
        no-caps
        icon="center_focus_strong"
        label="Reset view"
        class="self-start q-px-sm"
        @click="fitCamera(true)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// A 3D EPP quilt's 3D assembly tab (spec 027 User Story 7; prototypes in prototypes/epp3d on
// branch proto/epp-3d). The net folds as rigid plates hinged at every seam; Stuff turns the pieces
// into fabric under pressure. A click explodes the object (stitches across every seam), a drag
// turns the view, a double-click on a piece makes it the front. A fixed light above and in front
// shades each piece by its own folds only (owner, 2026-11-20 and 2026-11-23).
import { useQuasar } from 'quasar';
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import type * as Three from 'three';
import { shownColorway, swapper } from '@/model/colorways';
import { lookupEpp } from '@/model/epp/expand';
import {
  add3,
  bounds,
  buildFold,
  foldFrame,
  foldReport,
  mul3,
  openEdges,
  qrot,
  sub3,
  turnToFront,
  unit3,
  len3,
  world,
  type Fold,
  type Hinge,
  type V3,
} from '@/model/epp/fold';
import { quiltNet, seamMarks } from '@/model/epp/net';
import { setFront, setStuffedDesign } from '@/model/epp/quilt-ops';
import {
  buildCloth,
  clothMiddle,
  clothPt,
  clothStretch,
  pieceMesh,
  stuffFrame,
  type Cloth,
  type PieceMesh,
} from '@/model/epp/stuff';
import type { Pt } from '@/model/geometry/path';
import type { Quilt } from '@/model/schema/quilt';
import EppCanvas, { type CanvasPoly, type Decor } from '@/components/EppCanvas.vue';
import { useEppSeams } from '@/composables/epp-seams';
import type { World } from '@/composables/viewport';
import { colorLookup, type View } from '@/render/draw';
import { useEppEditorStore } from '@/stores/epp-editor';
import { useLibraryStore } from '@/stores/library';
import { useProjectStore } from '@/stores/project';
import { useSettingsStore } from '@/stores/settings';

const props = defineProps<{ quilt: Quilt; sidebar: boolean }>();
const project = useProjectStore();
const library = useLibraryStore();
const app = useSettingsStore();
const eppStore = useEppEditorStore();
const $q = useQuasar();
const ro = computed(() => project.readOnly);
const swapped = computed(() => app.settings.sidesSwapped);

const HINT = 'Click: explode · Drag: turn · Wheel or pinch: zoom · Double-click a piece: front';
const NET_HINT =
  'Tap a free edge, then an equal edge of another piece, to sew them · Tap a numbered edge to unpick it · Hover a seam (or press and hold) to find it in 3D';
/** How far pieces move out when exploded, as a share of the object's radius. */
const EXPLODE = 0.25;
/** Flat pieces sit a hair off their right side, so two layers folded onto each other (a pillow
 *  before stuffing) don't flicker through each other. */
const LIFT = 0.004;
const PAPER = 0xf1ede3;
/** Above and a little in front: the piece facing you is lit, and the inside of a hollow seen from
 *  behind still has a shaded upper side and lit lower pieces (against the inside-out illusion). */
const KEY_DIR = unit3([0.3, 1, 0.5]);
const FOV = 50;
/** Stitches: a white thread with a soft magenta glow (two see-through sleeves), radii in U. */
const THREAD = { core: 0.014, glow: [0.026, 0.04], opacity: [0.4, 0.12] };
const STITCHES_PER_U = 6;
/** The seam picked out from the net (owner, 2026-11-24): its stitches thicker and brighter, the
 *  others faded to this share. */
const HOT = { scale: 1.6, opacity: [0.75, 0.35], fade: 0.2 };
const CLICK_SLOP = 4;
const DOUBLE_MS = 250;

// ---------- the net and its fold ----------
const lookup = computed(() =>
  lookupEpp(project.doc!.project, props.quilt.epp?.shapes ?? [], library.lookup),
);
const shaped = computed(() => quiltNet(props.quilt, lookup.value));
const leaves = computed(() => shaped.value.leaves);
/** What the fold depends on: the outlines and the seams (not colors or the front). */
const shapeKey = computed(() => JSON.stringify([shaped.value.net.pieces, shaped.value.net.seams]));
const css = computed(() => {
  const paint = colorLookup(project.doc!, library.items.colors, undefined, library.items.fabrics);
  const swap = swapper(shownColorway(props.quilt));
  return (i: number) => {
    const v = paint(swap(leaves.value[i]?.fill));
    return typeof v === 'string' ? v : '#bdbdbd';
  };
});

let fold: Fold | null = null;
let cloth: Cloth | null = null;
let meshes: PieceMesh[] = [];
/** The fold's state for the sidebar (the fold itself isn't reactive). */
const phase = ref<'fold' | 'done'>('fold');
const report = shallowRef<ReturnType<typeof foldReport> | null>(null);
const closed = ref(false);
const stuffed = ref(false);
const stuffText = ref('');
const exploded = ref(false);
const grabbing = ref(false);

const counts = computed(() => {
  const m = fold;
  void phase.value;
  void shapeKey.value;
  if (!m || !m.plates.length) return '';
  const shared = m.hinges.filter((h) => h.seam === null).length;
  const n = m.net.seams.length;
  const a = m.assemblies;
  return `${a} assembl${a === 1 ? 'y' : 'ies'} · ${shared} shared edge${shared === 1 ? '' : 's'} · ${n} explicit seam${n === 1 ? '' : 's'}`;
});
const foldText = computed(() => {
  const r = report.value;
  if (!leaves.value.length) return '';
  if (phase.value !== 'done' || !r || !fold) return 'Folding…';
  if (!r.open.length) {
    if (!fold.closed) return 'Folded: every seam closes.';
    if (r.flat) return 'Folded: every seam closes. Closed, but flat: no room inside.';
    return r.volume > 0
      ? 'Folded: every seam closes. A closed shape, right side out.'
      : 'Folded: every seam closes. A closed shape, but inside out (paper side out).';
  }
  // Stuffed, the fabric closes what flat pieces couldn't (sewn by shared points).
  // A stuffed design's fabric closes what flat pieces can't: the setting decides, not the view
  // (owner, 2026-11-23).
  if (fabricCloses.value)
    return 'Stuffed design: the fabric closes the seams the flat pieces can’t.';
  const open = r.open.map((i) => fold!.hinges[i]!);
  const sewn = open.filter((h) => h.seam !== null);
  const names = sewn.length > 3 ? [`${sewn.length} seams`] : sewn.map((h) => `seam ${h.seam! + 1}`);
  const shared = open.length - sewn.length;
  if (shared) names.push(`${shared} shared edge${shared === 1 ? '' : 's'}`);
  return `Not closing: ${names.join(' and ')} (gaps up to ${fmt(r.worst)}U). Showing the closest fold found.`;
});
/** A stuffed design that can be stuffed: its seams close in fabric, whatever this view shows. */
const fabricCloses = computed(() => designStuffed.value && closed.value);
const foldClass = computed(() =>
  phase.value === 'done' && report.value?.open.length && !fabricCloses.value ? 'text-negative' : '',
);
/** Owner, 2026-11-23: "let's add a note that when it can't be joined but stuffing might help". */
const mightClose = computed(
  () =>
    phase.value === 'done' && closed.value && !!report.value?.open.length && !designStuffed.value,
);
/** Whether the design can be stuffed, and why not (owner, 2026-11-23). */
const stuffable = computed(() => {
  void shapeKey.value;
  if (!leaves.value.length) return { ok: false, why: 'There are no pieces yet.' };
  if (!closed.value) {
    const n = fold ? openEdges(fold) : 0;
    return {
      ok: false,
      why: n
        ? `${n} edge${n === 1 ? ' isn’t' : 's aren’t'} sewn to anything, so the shape is open and the stuffing would fall out. Sew every edge to close it: edges that touch are sewn already, and the Seam tool in the Design tab sews edges that don’t.`
        : 'Some edges are sewn only part of the way along, so the shape is open.',
    };
  }
  if (phase.value !== 'done')
    return { ok: false, why: 'Every edge is sewn. Stuffing can start once the fold settles.' };
  return { ok: true, why: 'Every edge is sewn, so the shape is closed.' };
});
const fmt = (x: number) => (+x.toFixed(2)).toString();

// ---------- stuffing: the design's setting and this view's switch (owner, 2026-11-23) ----------
const designStuffed = computed(
  () => props.quilt.layout.style === 'epp' && !!props.quilt.layout.stuffed,
);
/** Enable simulation view: not saved, on whenever the tab opens (owner, 2026-11-23), and for each
 *  quilt it shows. */
const showStuffing = ref(true);
watch(
  () => props.quilt.id,
  () => (showStuffing.value = true),
);
const wantStuffing = () => designStuffed.value && showStuffing.value && stuffable.value.ok;
function setDesignStuffed(on: boolean) {
  if (ro.value) return;
  project.change((d) => {
    const k = d.project.quilts.findIndex((q) => q.id === props.quilt.id);
    if (k >= 0) d.project.quilts[k] = setStuffedDesign(d.project.quilts[k] as Quilt, on);
  });
  if (on) showStuffing.value = true;
}
watch([designStuffed, showStuffing], ([d, v]) => {
  if ((!d || !v) && cloth) stuffNow(false);
});

// ---------- the flat net ----------
const vertical = computed(() => app.settings.epp3dSplit !== 'horizontal');
const unit = computed(() => (props.quilt.layout.style === 'epp' ? props.quilt.layout.unit : 1));
const netRef = ref<InstanceType<typeof EppCanvas>>();
// One view per split: each pane shape fits on its first draw (EPP canvases then keep their view).
const netKey = computed(() => `assembly:${app.settings.epp3dSplit}:${props.quilt.id}`);
const netView = computed({
  get: () => eppStore.views.get(netKey.value),
  set: (v: View | undefined) => v && eppStore.views.set(netKey.value, v),
});
const swap = computed(() => swapper(shownColorway(props.quilt)));
const netPolys = computed<CanvasPoly[]>(() =>
  leaves.value.map((l) => ({ poly: l.poly, fill: swap.value(l.fill) })),
);
/** Seams (by number - 1) the fold leaves open: red in the net. */
const openSeams = computed(() => {
  const r = report.value;
  const m = fold;
  if (fabricCloses.value) return new Set<number>();
  return new Set(
    r && m ? r.open.flatMap((i) => (m.hinges[i]!.seam === null ? [] : [m.hinges[i]!.seam])) : [],
  );
});
const seams = useEppSeams({
  quilt: () => props.quilt,
  leaves: () => leaves.value,
  lookup: () => lookup.value,
  px: (n) => n * (netRef.value?.worldPerPx() ?? 0.02),
  edit: (fn) => {
    if (ro.value) return;
    project.change((d) => {
      const k = d.project.quilts.findIndex((q) => q.id === props.quilt.id);
      if (k >= 0) d.project.quilts[k] = fn(d.project.quilts[k] as Quilt);
    });
  },
  open: () => openSeams.value,
});
const netHover = ref<World | null>(null);
const netTick = computed(() => [netHover.value, seams.start.value, openSeams.value]);
const onNetHover = (p: World | null) => (netHover.value = p);
/** The seam under the pointer on the net, or under a held finger (owner, 2026-11-24: "when hoving
 *  or long pressing a seam in the 2d view, it fades out the other seams and highlights that seam's
 *  [mate]... and in the 3d view, it fades the other seams and highlights the active seam's
 *  stitching"). Read-only too: it only shows. */
const activeSeam = computed(() => (netHover.value ? seams.activeAt(netHover.value) : null));
const decorateNet = (dec: Decor) =>
  seams.decorate(dec, netHover.value, { pick: !ro.value, active: activeSeam.value });

// ---------- three.js ----------
const host = ref<HTMLDivElement>();
const canvas = ref<HTMLCanvasElement>();
let T: typeof Three | null = null;
let renderer: Three.WebGLRenderer | null = null;
let scene: Three.Scene;
let camera: Three.PerspectiveCamera;
let key: Three.DirectionalLight;
let root: Three.Group | null = null;
let plates: Three.Group[] = [];
let hitMeshes: Three.Mesh[] = [];
let gapLines: Three.LineSegments | null = null;
let threads: Three.InstancedMesh[] = [];
let hotThreads: Three.InstancedMesh[] = [];
let lineMat: Three.LineBasicMaterial;
let gapMat: Three.LineBasicMaterial;
let threadMats: Three.Material[] = [];
let hotMats: Three.Material[] = [];
let threadGeo: Three.CylinderGeometry;
let frame = 0;
let dirty = true;
let resizeObs: ResizeObserver | null = null;
let disposed = false;
const orbit = { theta: 0.55, phi: 1.1, dist: 6, target: [0, 0, 0] as V3 };
const START = { theta: 0.55, phi: 1.1 };
let explodeAmt = 0;
let refit = false;

onMounted(async () => {
  const three = await import('three');
  if (disposed || !canvas.value) return;
  T = three;
  renderer = new three.WebGLRenderer({ canvas: canvas.value, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = three.PCFShadowMap;
  scene = new three.Scene();
  camera = new three.PerspectiveCamera(FOV, 1, 0.01, 1000);
  scene.add(camera);
  key = new three.DirectionalLight(0xffffff, 2.4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.02;
  key.shadow.radius = 3;
  scene.add(new three.HemisphereLight(0xffffff, 0x808080, 1.1), key, key.target);
  lineMat = new three.LineBasicMaterial({ color: 0x222222 });
  gapMat = new three.LineBasicMaterial({ color: 0xe53935 });
  threadMats = [
    new three.MeshBasicMaterial({ color: 0xffffff }),
    ...THREAD.opacity.map(
      (o) =>
        new three.MeshBasicMaterial({
          color: 0xff2d95,
          transparent: true,
          opacity: o,
          depthWrite: false,
        }),
    ),
  ];
  hotMats = [
    new three.MeshBasicMaterial({ color: 0xffffff }),
    ...HOT.opacity.map(
      (o) =>
        new three.MeshBasicMaterial({
          color: 0xff2d95,
          transparent: true,
          opacity: o,
          depthWrite: false,
        }),
    ),
  ];
  threadGeo = new three.CylinderGeometry(1, 1, 1, 10, 1, true);
  setBackground();
  resizeObs = new ResizeObserver(resize);
  resizeObs.observe(host.value!);
  resize();
  rebuild(true);
  frame = requestAnimationFrame(tick);
});

onBeforeUnmount(() => {
  disposed = true;
  cancelAnimationFrame(frame);
  resizeObs?.disconnect();
  if (pending) clearTimeout(pending.timer);
  clearMeshes();
  for (const m of [lineMat, gapMat, ...threadMats, ...hotMats]) m?.dispose();
  threadGeo?.dispose();
  renderer?.dispose();
  renderer = null;
});

function setBackground() {
  if (!T) return;
  scene.background = new T.Color($q.dark.isActive ? 0x1d1d1d : 0xf5f5f5);
  dirty = true;
}
watch(() => $q.dark.isActive, setBackground);

function resize() {
  const c = canvas.value;
  if (!renderer || !c || !c.clientWidth || !c.clientHeight) return;
  renderer.setSize(c.clientWidth, c.clientHeight, false);
  camera.aspect = c.clientWidth / c.clientHeight;
  camera.updateProjectionMatrix();
  dirty = true;
}

/** Fold again from the start (a change to the pieces or seams, or Fold again). */
function rebuild(reframe: boolean) {
  fold = buildFold(shaped.value.net);
  cloth = null;
  stuffed.value = false;
  stuffText.value = '';
  exploded.value = false;
  explodeAmt = 0;
  phase.value = 'fold';
  report.value = null;
  closed.value = fold.closed;
  meshes = fold.plates.map((P) => pieceMesh(P.pts, P.c));
  makeMeshes();
  if (reframe) {
    fitCamera(true);
    refit = true;
  }
  dirty = true;
}
watch(shapeKey, () => T && rebuild(false));
// Colors and the front change without a new fold.
watch(css, () => {
  plates.forEach((g, i) => {
    const front = g.children[0] as Three.Mesh<Three.BufferGeometry, Three.MeshStandardMaterial>;
    front.material.color.set(css.value(i));
  });
  dirty = true;
});
watch(
  () => shaped.value.net.front,
  (f) => {
    if (fold) fold.net = { ...fold.net, front: f };
  },
);

function clearMeshes() {
  if (!root) return;
  scene.remove(root);
  root.traverse((o) => {
    const x = o as Three.Mesh;
    if ((o as Three.InstancedMesh).isInstancedMesh) (o as Three.InstancedMesh).dispose();
    else if (x.geometry && x.geometry !== threadGeo) x.geometry.dispose();
    const mat = x.material as Three.Material | undefined;
    if (mat && mat !== lineMat && mat !== gapMat && ![...threadMats, ...hotMats].includes(mat))
      mat.dispose();
  });
  root = null;
}

const stitchCount = (h: Hinge) =>
  Math.max(
    3,
    Math.round(STITCHES_PER_U * Math.hypot(h.pa[1][0] - h.pa[0][0], h.pa[1][1] - h.pa[0][1])),
  );

function makeMeshes() {
  const three = T!;
  const m = fold!;
  clearMeshes();
  root = new three.Group();
  plates = [];
  hitMeshes = [];
  m.plates.forEach((_, i) => {
    const { xy, n, tris } = meshes[i]!;
    const geo = new three.BufferGeometry();
    geo.setAttribute(
      'position',
      new three.BufferAttribute(new Float32Array(xy.flatMap(([x, y]) => [x, y, 0])), 3),
    );
    geo.setIndex(tris);
    geo.computeVertexNormals();
    const opts = {
      roughness: 0.9,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    };
    const front = new three.Mesh(
      geo,
      new three.MeshStandardMaterial({ ...opts, color: css.value(i), side: three.FrontSide }),
    );
    const back = new three.Mesh(
      geo,
      new three.MeshStandardMaterial({ ...opts, color: PAPER, side: three.BackSide }),
    );
    const outline = new three.LineLoop(
      new three.BufferGeometry().setFromPoints(
        xy.slice(-n).map(([x, y]) => new three.Vector3(x, y, 0)),
      ),
      lineMat,
    );
    front.userData.p = back.userData.p = i;
    front.castShadow = back.castShadow = front.receiveShadow = back.receiveShadow = true;
    const g = new three.Group();
    g.add(front, back, outline);
    root!.add(g);
    plates.push(g);
    hitMeshes.push(front, back);
  });
  const explicit = m.hinges.filter((h) => h.seam !== null).length;
  const gg = new three.BufferGeometry();
  gg.setAttribute('position', new three.BufferAttribute(new Float32Array(explicit * 6), 3));
  gapLines = new three.LineSegments(gg, gapMat);
  const segs = m.hinges.reduce((s, h) => s + 2 * stitchCount(h), 0);
  threads = threadMats.map((mat) => new three.InstancedMesh(threadGeo, mat, Math.max(1, segs)));
  threads.forEach((t, i) => (t.renderOrder = i)); // core first, then the glow over it
  const most = Math.max(1, ...m.hinges.map((h) => 2 * stitchCount(h)));
  hotThreads = hotMats.map((mat) => new three.InstancedMesh(threadGeo, mat, most));
  hotThreads.forEach((t, i) => (t.renderOrder = threads.length + i));
  root.add(gapLines, ...threads, ...hotThreads);
  scene.add(root);
}

/** A point along seam h at s (0 to 1), on piece A's side (0) or piece B's (1), as drawn. */
type SeamAt = (h: Hinge, hi: number, side: 0 | 1, s: number) => V3;

function syncFolded() {
  const m = fold!;
  const W = world(m);
  // Exploded: each plate moves out from the object's middle (along its own right side when it sits
  // on the middle). Display only; the fold is unchanged.
  const { c, r } = bounds(W.flat());
  const off = m.plates.map((_, p) => {
    let d = sub3(W[p]![0]!, c);
    if (len3(d) < 0.05 * r) d = qrot(m.q[p]!, [0, 0, 1]);
    return mul3(unit3(d), EXPLODE * r * explodeAmt);
  });
  plates.forEach((g, p) => {
    g.position.set(...add3(add3(m.t[p]!, off[p]!), mul3(qrot(m.q[p]!, [0, 0, 1]), LIFT)));
    g.quaternion.set(...m.q[p]!);
  });
  syncStitches((h, _hi, side, s) => {
    const [p, ns] = side ? [h.B, h.nb] : [h.A, h.na];
    const a = W[p]![ns[0]]!;
    return add3(add3(a, mul3(sub3(W[p]![ns[1]]!, a), s)), off[p]!);
  });
  // Open explicit seams: a red line between the edges' middles (closed up only).
  gapLines!.visible = explodeAmt < 0.01;
  const pos = gapLines!.geometry.attributes.position as Three.BufferAttribute;
  let k = 0;
  for (const h of m.hinges) {
    if (h.seam === null) continue;
    pos.setXYZ(k++, ...mul3(add3(W[h.A]![h.na[0]]!, W[h.A]![h.na[1]]!), 0.5));
    pos.setXYZ(k++, ...mul3(add3(W[h.B]![h.nb[0]]!, W[h.B]![h.nb[1]]!), 0.5));
  }
  pos.needsUpdate = true;
  gapLines!.geometry.computeBoundingSphere();
}

/** Stuffed: every piece drawn from the fabric points, exploded out from the middle. */
function syncStuffed() {
  const c = cloth!;
  const mid = clothMiddle(c);
  let r = 0.5;
  for (let i = 0; i < c.X.length / 3; i++) r = Math.max(r, len3(sub3(clothPt(c, i), mid)));
  const off = c.pieceIds.map((ids) => {
    const pts = Array.from(ids, (i) => clothPt(c, i));
    const m = mul3(
      pts.reduce((s, p) => add3(s, p), [0, 0, 0]),
      1 / pts.length,
    );
    return mul3(unit3(sub3(m, mid)), EXPLODE * r * explodeAmt);
  });
  plates.forEach((g, p) => {
    g.position.set(...off[p]!);
    g.quaternion.set(0, 0, 0, 1);
    const [front, , outline] = g.children as [Three.Mesh, Three.Mesh, Three.LineLoop];
    const pos = front.geometry.attributes.position as Three.BufferAttribute;
    c.pieceIds[p]!.forEach((k, i) => pos.setXYZ(i, ...clothPt(c, k)));
    pos.needsUpdate = true;
    front.geometry.computeVertexNormals();
    front.geometry.computeBoundingSphere();
    const n = meshes[p]!.n;
    const ids = c.pieceIds[p]!;
    const ol = outline.geometry.attributes.position as Three.BufferAttribute;
    for (let k = 0; k < n; k++) ol.setXYZ(k, ...clothPt(c, ids[ids.length - n + k]!));
    ol.needsUpdate = true;
    outline.geometry.computeBoundingSphere();
  });
  // Seams follow the fabric: along the shared points, on each piece's side as drawn.
  syncStitches((h, hi, side, s) => {
    const path = c.paths[hi]!;
    const x = s * (path.length - 1);
    const i = Math.min(path.length - 2, Math.floor(x));
    const a = clothPt(c, path[i]!);
    return add3(add3(a, mul3(sub3(clothPt(c, path[i + 1]!), a), x - i)), off[side ? h.B : h.A]!);
  });
  gapLines!.visible = false;
}

/** Put the drawn pieces back to flat plates (after unstuffing). */
function flatten() {
  plates.forEach((g, p) => {
    const [front, , outline] = g.children as [Three.Mesh, Three.Mesh, Three.LineLoop];
    const { xy, n } = meshes[p]!;
    const pos = front.geometry.attributes.position as Three.BufferAttribute;
    xy.forEach(([x, y], i) => pos.setXYZ(i, x, y, 0));
    pos.needsUpdate = true;
    front.geometry.computeVertexNormals();
    front.geometry.computeBoundingSphere();
    const ol = outline.geometry.attributes.position as Three.BufferAttribute;
    xy.slice(-n).forEach(([x, y], k) => ol.setXYZ(k, x, y, 0));
    ol.needsUpdate = true;
  });
}

/** The fold's hinge for the seam picked out on the net, or -1. A shared edge's hinge lies along that
 *  edge of the piece (the net is the pieces with y flipped). */
function hotHinge(): number {
  const a = activeSeam.value;
  const m = fold;
  if (!a || !m) return -1;
  if (a.seam !== null) return m.hinges.findIndex((h) => h.seam === a.seam);
  const poly = leaves.value[a.leaf]?.poly;
  if (!poly) return -1;
  const [p, q] = [poly[a.edge]!, poly[(a.edge + 1) % poly.length]!].map(([x, y]): Pt => [
    x,
    -y,
  ]) as [Pt, Pt];
  const L2 = (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2;
  const on = ([x, y]: Pt) => {
    const t = ((x - p[0]) * (q[0] - p[0]) + (y - p[1]) * (q[1] - p[1])) / L2;
    const off = Math.abs((q[0] - p[0]) * (y - p[1]) - (q[1] - p[1]) * (x - p[0])) / Math.sqrt(L2);
    return off < 1e-6 && t > -1e-6 && t < 1 + 1e-6;
  };
  return m.hinges.findIndex(
    (h) =>
      h.seam === null && ((h.A === a.leaf && h.pa.every(on)) || (h.B === a.leaf && h.pb.every(on))),
  );
}
watch(activeSeam, () => (dirty = true));

/** While a seam is picked out, the other stitches fade. */
function fadeThreads(on: boolean) {
  const [core, ...glows] = threadMats;
  if (core && core.transparent !== on) {
    core.transparent = on;
    core.needsUpdate = true;
  }
  if (core) core.opacity = on ? HOT.fade : 1;
  glows.forEach((g, i) => (g.opacity = THREAD.opacity[i]! * (on ? HOT.fade : 1)));
}

// Stitches (owner, 2026-11-19, kept 2026-11-23): exploded, each seam shows thread lacing back and
// forth between its two edges, inset a little from the corners. The seam picked out on the net
// shows closed up too, thicker and brighter, and the others fade (owner, 2026-11-24).
function syncStitches(seamAt: SeamAt) {
  const three = T!;
  const show = explodeAmt > 0.01;
  const hot = hotHinge();
  fadeThreads(hot >= 0);
  threads.forEach((t) => (t.visible = show));
  hotThreads.forEach((t) => (t.visible = hot >= 0));
  if (!show && hot < 0) return;
  const mtx = new three.Matrix4();
  const q = new three.Quaternion();
  const up = new three.Vector3(0, 1, 0);
  const dir = new three.Vector3();
  const mid = new three.Vector3();
  const size = new three.Vector3();
  const radii = [THREAD.core, ...THREAD.glow];
  let k = 0;
  let kh = 0;
  fold!.hinges.forEach((h, hi) => {
    const isHot = hi === hot;
    if (!show && !isHot) return;
    const set = isHot ? hotThreads : threads;
    const grow = isHot ? HOT.scale : 1;
    const n = stitchCount(h);
    const at = (side: 0 | 1, s: number) => seamAt(h, hi, side, 0.08 + 0.84 * s);
    for (let i = 0; i < 2 * n; i++) {
      const [from, to]: [0 | 1, 0 | 1] = i % 2 ? [1, 0] : [0, 1];
      const p = at(from, i / (2 * n));
      const e = at(to, (i + 1) / (2 * n));
      const d = sub3(e, p);
      const L = len3(d) || 1e-9;
      q.setFromUnitVectors(up, dir.set(d[0] / L, d[1] / L, d[2] / L));
      mid.set(...mul3(add3(p, e), 0.5));
      radii.forEach((r, layer) =>
        set[layer]!.setMatrixAt(
          isHot ? kh : k,
          mtx.compose(mid, q, size.set(r * grow, L, r * grow)),
        ),
      );
      if (isHot) kh++;
      else k++;
    }
  });
  for (const [set, count] of [
    [threads, k],
    [hotThreads, kh],
  ] as const)
    for (const t of set) {
      t.count = count;
      t.instanceMatrix.needsUpdate = true;
      t.computeBoundingSphere();
    }
}

// ---------- camera ----------
function objectBounds() {
  if (cloth) {
    const c = cloth;
    const mid = clothMiddle(c);
    let r = 0.5;
    for (let i = 0; i < c.X.length / 3; i++) r = Math.max(r, len3(sub3(clothPt(c, i), mid)));
    return { c: mid, r };
  }
  const W = fold ? world(fold).flat() : [];
  return W.length ? bounds(W) : { c: [0, 0, 0] as V3, r: 1 };
}
const distFor = (r: number, margin: number) => (r / Math.sin(((FOV / 2) * Math.PI) / 180)) * margin;
function fitCamera(reset: boolean) {
  const { c, r } = objectBounds();
  orbit.target = c;
  orbit.dist = distFor(r, 1.1);
  if (reset) Object.assign(orbit, START);
  dirty = true;
}
function placeCamera() {
  const { theta, phi, dist, target } = orbit;
  camera.position.set(
    target[0] + dist * Math.sin(phi) * Math.sin(theta),
    target[1] + dist * Math.cos(phi),
    target[2] + dist * Math.sin(phi) * Math.cos(theta),
  );
  camera.lookAt(...target);
}
/** Keep the fixed light and its shadow box on the object as it moves. */
function aimKey() {
  const { c, r } = objectBounds();
  key.target.position.set(...c);
  key.position.set(...add3(c, mul3(KEY_DIR, 4 * r)));
  const box = key.shadow.camera;
  box.left = box.bottom = -1.6 * r;
  box.right = box.top = 1.6 * r;
  box.near = 0.1 * r;
  box.far = 8 * r;
  box.updateProjectionMatrix();
}
const toward = (from: V3, to: V3, k: number): V3 => add3(from, mul3(sub3(to, from), k));

// ---------- stuffing ----------
function stuffNow(on: boolean) {
  if (!fold) return;
  if (on) {
    cloth = buildCloth(fold, meshes);
    stuffText.value = 'Stuffing…';
  } else {
    cloth = null;
    flatten();
    stuffText.value = '';
  }
  stuffed.value = on;
  dirty = true;
}
function stuffStatus() {
  const c = cloth!;
  const u = props.quilt.layout.style === 'epp' ? props.quilt.layout.unit : 1;
  const units = project.doc!.units;
  const v = c.vol;
  const word = c.settled ? 'Stuffed' : 'Stuffing…';
  stuffText.value =
    `${word} ${fmt(Math.abs(v))} U³ inside (${fmt(Math.abs(v) * u ** 3)} ${units}³)` +
    `${v > 0 ? '' : ', inside out'}. The fabric stretches up to ${(100 * clothStretch(c)).toFixed(1)}%.`;
}

// ---------- the loop ----------
function tick() {
  frame = requestAnimationFrame(tick);
  if (!renderer || !fold) return;
  const m = fold;
  if (phase.value !== 'done') {
    const done = foldFrame(m);
    if (done) {
      phase.value = 'done';
      report.value = foldReport(m);
    }
    orbit.target = toward(orbit.target, objectBounds().c, 0.1);
    dirty = true;
  } else if (!cloth) {
    // A stuffed design stuffs once folded and turned to face front.
    if (turnToFront(m) > 0) dirty = true;
    else if (wantStuffing()) stuffNow(true);
    if (refit) {
      const { c, r } = objectBounds();
      const want = distFor(r, 1.5); // room to explode
      orbit.dist += (want - orbit.dist) * 0.12;
      orbit.target = toward(orbit.target, c, 0.12);
      if (Math.abs(want - orbit.dist) < 0.01 * want) refit = false;
      dirty = true;
    }
  }
  const goal = exploded.value ? 1 : 0;
  if (Math.abs(goal - explodeAmt) > 1e-3) {
    explodeAmt += (goal - explodeAmt) * 0.15;
    dirty = true;
  } else explodeAmt = goal;
  if (cloth && !cloth.settled) {
    stuffFrame(cloth);
    if (cloth.frames % 15 === 0 || cloth.settled) stuffStatus();
    dirty = true;
  }
  if (!dirty) return;
  dirty = false;
  if (cloth) syncStuffed();
  else syncFolded();
  aimKey();
  placeCamera();
  renderSelfShadowed();
}

/**
 * Self-shadows only (owner, 2026-11-20): each piece is shaded by its own folds and bunching, never
 * by the other pieces. three.js has one shadow map per light, so each piece gets its own pass with
 * only that piece drawn; the depth buffer is kept between passes, so pieces still hide each other.
 * Then stitches and lines in a last pass, without the pieces.
 */
function renderSelfShadowed() {
  const r = renderer!;
  if (!root) return void r.render(scene, camera);
  const extras = root.children.filter((o) => !plates.includes(o as Three.Group));
  const shown = extras.map((o) => o.visible);
  const background = scene.background;
  extras.forEach((o) => (o.visible = false));
  plates.forEach((g) => (g.visible = false));
  // A color background clears on every render, so only the first pass has it.
  let first = true;
  const pass = () => {
    r.autoClear = first;
    scene.background = first ? background : null;
    r.render(scene, camera);
    first = false;
  };
  for (const g of plates) {
    g.visible = true;
    pass();
    g.visible = false;
  }
  extras.forEach((o, i) => (o.visible = shown[i]!));
  r.shadowMap.autoUpdate = false; // nothing left to cast
  pass();
  r.shadowMap.autoUpdate = true;
  plates.forEach((g) => (g.visible = true));
  scene.background = background;
  r.autoClear = true;
}

// ---------- pointer ----------
// Explode (owner, 2026-11-19): a click on the object toggles explode mode; drags only turn the view
// and leave the mode as it is. A double-click on a piece makes it the front.
let press: {
  x: number;
  y: number;
  last: [number, number];
  moved: boolean;
  piece: number | null;
} | null = null;
const pointers = new Map<number, [number, number]>();
let pinch: number | null = null;
let pending: { piece: number | null; timer: ReturnType<typeof setTimeout> } | null = null;

function pieceAt(e: PointerEvent): number | null {
  const three = T;
  const c = canvas.value;
  if (!three || !c) return null;
  const r = c.getBoundingClientRect();
  const ndc = new three.Vector2(
    ((e.clientX - r.left) / r.width) * 2 - 1,
    -((e.clientY - r.top) / r.height) * 2 + 1,
  );
  const ray = new three.Raycaster();
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(hitMeshes, false)[0];
  return hit ? (hit.object.userData.p as number) : null;
}
function down(e: PointerEvent) {
  canvas.value?.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, [e.clientX, e.clientY]);
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()] as [[number, number], [number, number]];
    pinch = Math.hypot(a[0] - b[0], a[1] - b[1]);
    press = null;
    return;
  }
  press = {
    x: e.clientX,
    y: e.clientY,
    last: [e.clientX, e.clientY],
    moved: false,
    piece: pieceAt(e),
  };
}
function move(e: PointerEvent) {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, [e.clientX, e.clientY]);
  if (pinch !== null && pointers.size === 2) {
    const [a, b] = [...pointers.values()] as [[number, number], [number, number]];
    const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    if (d > 0) orbit.dist *= pinch / d;
    pinch = d;
    refit = false;
    dirty = true;
    return;
  }
  if (!press) return;
  if (!press.moved && Math.hypot(e.clientX - press.x, e.clientY - press.y) > CLICK_SLOP) {
    press.moved = true;
    grabbing.value = true;
  }
  if (!press.moved) return;
  orbit.theta -= (e.clientX - press.last[0]) * 0.01;
  orbit.phi = Math.min(
    Math.PI - 0.05,
    Math.max(0.05, orbit.phi - (e.clientY - press.last[1]) * 0.01),
  );
  press.last = [e.clientX, e.clientY];
  dirty = true;
}
function up(e: PointerEvent) {
  pointers.delete(e.pointerId);
  if (pointers.size < 2) pinch = null;
  if (press && !press.moved) click(press.piece);
  press = null;
  grabbing.value = false;
}
function cancel(e: PointerEvent) {
  pointers.delete(e.pointerId);
  pinch = null;
  press = null;
  grabbing.value = false;
}
function wheel(e: WheelEvent) {
  orbit.dist *= Math.exp(e.deltaY * 0.001);
  refit = false;
  dirty = true;
}
/** A single click waits a moment, so a double-click on a piece doesn't explode. */
function click(piece: number | null) {
  if (pending) {
    clearTimeout(pending.timer);
    const first = pending.piece;
    pending = null;
    if (piece !== null && piece === first) return pickFront(piece);
  }
  pending = {
    piece,
    timer: setTimeout(() => {
      pending = null;
      exploded.value = !exploded.value && piece !== null;
    }, DOUBLE_MS),
  };
}
function pickFront(piece: number | null) {
  if (ro.value) return;
  if (cloth)
    return void $q.notify({
      message: 'Turn off Enable simulation view first to change the front.',
      timeout: 1500,
    });
  const leaf = piece === null ? null : leaves.value[piece];
  const front = leaf ? { piece: leaf.piece, ...(leaf.part ? { part: leaf.part } : {}) } : null;
  project.change((d) => {
    const k = d.project.quilts.findIndex((q) => q.id === props.quilt.id);
    if (k >= 0) d.project.quilts[k] = setFront(d.project.quilts[k] as Quilt, front);
  });
  if (front) $q.notify({ message: 'That piece now faces front.', timeout: 1200 });
}

// For automated checks (dev only): the fold's state.
if (import.meta.env.DEV)
  Object.assign(window, {
    epp3d: {
      get state() {
        return {
          phase: phase.value,
          open: report.value?.open.length ?? null,
          closed: closed.value,
          volume: report.value?.volume ?? null,
          stuffed: stuffed.value,
          stuffSettled: cloth?.settled ?? null,
          stuffVolume: cloth?.vol ?? null,
          exploded: exploded.value,
          seams: seams.placed.value.length,
          openSeams: [...openSeams.value],
          active: activeSeam.value,
          hotHinge: hotHinge(),
          hotStitches: hotThreads[0]?.visible ? hotThreads[0].count : 0,
          stitches: threads[0]?.visible ? threads[0].count : 0,
        };
      },
      /** Page point at the middle of edge k of piece (leaf) i in the net. */
      edgePoint(i: number, k: number) {
        const poly = leaves.value[i]?.poly;
        const v = netView.value;
        const c = netRef.value?.$el.querySelector('canvas')?.getBoundingClientRect();
        if (!poly || !v || !c) return null;
        const [a, b] = [poly[k]!, poly[(k + 1) % poly.length]!];
        return [
          c.left + ((a[0] + b[0]) / 2) * v.scale + v.tx,
          c.top + ((a[1] + b[1]) / 2) * v.scale + v.ty,
        ];
      },
      /** Page point at the middle of seam n's first edge in the net. */
      seamPoint(n: number) {
        const m = seamMarks(leaves.value, props.quilt.epp?.seams ?? [], 0).find((x) => x.n === n);
        const v = netView.value;
        const c = netRef.value?.$el.querySelector('canvas')?.getBoundingClientRect();
        if (!m || !v || !c) return null;
        const [a, b] = m.edge;
        return [
          c.left + ((a[0] + b[0]) / 2) * v.scale + v.tx,
          c.top + ((a[1] + b[1]) / 2) * v.scale + v.ty,
        ];
      },
    },
  });
</script>

<style scoped>
.view {
  overflow: hidden;
  touch-action: none;
}
.panes {
  min-width: 0;
  min-height: 0;
}
.panes > .col {
  min-width: 0;
  min-height: 0;
}
.split-v > .net {
  border-bottom: 1px solid rgba(128, 128, 128, 0.35);
}
.split-h > .net {
  border-right: 1px solid rgba(128, 128, 128, 0.35);
}
.net .hint {
  right: 48px;
}
/* A canvas keeps its own size unless told to fill. */
.view canvas {
  width: 100%;
  height: 100%;
  display: block;
}
.hint {
  position: absolute;
  left: 8px;
  bottom: 8px;
  pointer-events: none;
  opacity: 0.75;
}
.exploded {
  position: absolute;
  top: 8px;
  left: 8px;
}
.stuffable {
  border-radius: 6px;
  padding: 8px 10px;
}
.stuffable.ok {
  background: rgba(46, 125, 50, 0.12);
  color: #2e7d32;
}
.stuffable.no {
  background: rgba(128, 128, 128, 0.14);
}
.note {
  border-left: 3px solid #f9a825;
  padding-left: 8px;
}
:global(.body--dark .stuffable.ok) {
  color: #81c784;
}
.inspector {
  width: 340px;
  flex: none;
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
</style>
