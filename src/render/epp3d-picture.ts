// 3D EPP quilts' pictures (owner, 2026-11-23): the folded object as the 3D assembly tab first shows
// it (turned to its front, stuffed when it's a stuffed design), drawn off screen with three.js, for
// cards and the printout. The object's shape is worked out once (fold, then stuffing) in short
// slices so the page stays responsive, and kept; each picture of it (a size and a view) is drawn
// from that. One renderer (one WebGL context) serves all pictures; `orbit` draws a shape live on a
// canvas, to turn it by hand (the printout's 3D view).
import { shallowReactive } from 'vue';
import type * as Three from 'three';
import {
  add3,
  bounds,
  buildFold,
  foldFrame,
  mul3,
  qrot,
  turnToFront,
  unit3,
  type Net,
  type V3,
} from '@/model/epp/fold';
import { buildCloth, clothPt, pieceMesh, stuffFrame, type Cloth } from '@/model/epp/stuff';

/** What an object is: the net, each piece's color, whether it's stuffed. */
export interface Shape3d {
  net: Net;
  colors: string[];
  stuffed: boolean;
}
/** Where it's seen from, as the 3D assembly tab's orbit: turn about the up axis, tilt from the top. */
export interface View3d {
  theta: number;
  phi: number;
}
export const START_VIEW: View3d = { theta: 0.55, phi: 1.1 };

/** The object worked out: each piece's points, triangles, outline (last `n` points) and color. */
interface Geometry {
  pieces: { pts: V3[]; tris: number[]; n: number; color: string }[];
}

const PAPER = 0xf1ede3;
/** The 3D assembly tab's fixed light. */
const KEY_DIR = unit3([0.3, 1, 0.5]);
const FOV = 50;
/** Flat pieces sit a hair off their right side (two layers folded onto each other). */
const LIFT = 0.004;
/** Work per slice before giving the page back (ms). */
const SLICE = 12;
const KEEP = 100;
const KEEP_SHAPES = 30;

/** Finished pictures by key (reactive: a picture waiting to be drawn shows when it's ready). */
const ready = shallowReactive(new Map<string, string>());
/** Worked-out objects by shape key. */
const shapes = new Map<string, Geometry>();
const queued = new Set<string>();
const jobs: { key: string; it: Generator<void, string | null> }[] = [];
let busy = false;
let three: Promise<typeof Three> | null = null;
let gl: { T: typeof Three; renderer: Three.WebGLRenderer } | null = null;

// For automated checks (dev only): pictures waiting and done.
if (import.meta.env.DEV)
  Object.assign(window, { epp3dPictures: () => ({ waiting: jobs.length, done: ready.size }) });

/**
 * The picture of shape `key` (what `shape()` describes), `px` square, seen from `view`; null while
 * it's drawn (it's queued).
 */
export function picture3d(
  key: string,
  shape: () => Shape3d,
  px: number,
  view: View3d = START_VIEW,
): string | null {
  const pic = `${key}|${px}|${view.theta.toFixed(4)},${view.phi.toFixed(4)}`;
  const url = ready.get(pic);
  if (url) return url;
  if (!queued.has(pic)) {
    queued.add(pic);
    jobs.push({ key: pic, it: work(key, shape, px, view) });
    void run();
  }
  return null;
}

async function run() {
  if (busy) return;
  busy = true;
  try {
    const T = await (three ??= import('three'));
    if (!gl) {
      try {
        const renderer = new T.WebGLRenderer({
          canvas: document.createElement('canvas'),
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
        });
        renderer.setClearColor(0x000000, 0);
        gl = { T, renderer };
      } catch {
        return; // No WebGL: callers keep the flat picture.
      }
    }
    while (jobs.length) {
      const job = jobs[0]!;
      const t0 = performance.now();
      let r = job.it.next();
      while (!r.done && performance.now() - t0 < SLICE) r = job.it.next();
      if (r.done) {
        jobs.shift();
        queued.delete(job.key);
        if (r.value) {
          ready.set(job.key, r.value);
          if (ready.size > KEEP) ready.delete(ready.keys().next().value!);
        }
      }
      await new Promise((ok) => setTimeout(ok, 0));
    }
  } finally {
    busy = false;
  }
}

/** Work the shape out (unless it's kept), then draw it. Yields between slices of work. */
function* work(
  key: string,
  shape: () => Shape3d,
  px: number,
  view: View3d,
): Generator<void, string | null> {
  let g = shapes.get(key);
  if (!g) {
    const it = solve(shape());
    let r = it.next();
    while (!r.done) {
      yield;
      r = it.next();
    }
    if (!r.value) return null;
    g = r.value;
    shapes.set(key, g);
    if (shapes.size > KEEP_SHAPES) shapes.delete(shapes.keys().next().value!);
  }
  yield;
  if (!gl) return null;
  const { scene, camera, done } = build(gl.T, g, view, 1);
  gl.renderer.setSize(px, px, false);
  gl.renderer.render(scene, camera);
  const url = gl.renderer.domElement.toDataURL();
  done();
  return url;
}

/** Fold, turn to the front, stuff (a stuffed design): each piece's points. */
function* solve(p: Shape3d): Generator<void, Geometry | null> {
  if (!p.net.pieces.length) return null;
  const m = buildFold(p.net);
  while (!foldFrame(m)) yield;
  turnToFront(m, 1);
  const meshes = m.plates.map((P) => pieceMesh(P.pts, P.c));
  let cloth: Cloth | null = null;
  if (p.stuffed && m.closed) {
    cloth = buildCloth(m, meshes);
    while (!cloth.settled) {
      stuffFrame(cloth);
      yield;
    }
  }
  return {
    pieces: m.plates.map((_, i) => {
      const mesh = meshes[i]!;
      const lift = mul3(qrot(m.q[i]!, [0, 0, 1]), LIFT);
      const pts: V3[] = cloth
        ? Array.from(cloth.pieceIds[i]!, (k) => clothPt(cloth, k))
        : mesh.xy.map(([x, y]) => add3(add3(qrot(m.q[i]!, [x, y, 0]), m.t[i]!), lift));
      return { pts, tris: mesh.tris, n: mesh.n, color: p.colors[i] ?? '#bdbdbd' };
    }),
  };
}

/** The scene for a worked-out object and a camera seeing it from `view` (`aspect` wide). */
function build(T: typeof Three, g: Geometry, view: View3d, aspect: number) {
  const scene = new T.Scene();
  const line = new T.LineBasicMaterial({ color: 0x222222 });
  const all: V3[] = [];
  for (const piece of g.pieces) {
    all.push(...piece.pts);
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.BufferAttribute(new Float32Array(piece.pts.flat()), 3));
    geo.setIndex(piece.tris);
    geo.computeVertexNormals();
    const opts = {
      roughness: 0.9,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    };
    scene.add(
      new T.Mesh(
        geo,
        new T.MeshStandardMaterial({ ...opts, color: piece.color, side: T.FrontSide }),
      ),
      new T.Mesh(geo, new T.MeshStandardMaterial({ ...opts, color: PAPER, side: T.BackSide })),
      new T.LineLoop(
        new T.BufferGeometry().setFromPoints(
          piece.pts.slice(-piece.n).map((q) => new T.Vector3(...q)),
        ),
        line,
      ),
    );
  }
  const { c, r } = bounds(all);
  const camera = new T.PerspectiveCamera(FOV, aspect, 0.01 * r, 100 * r);
  const key = new T.DirectionalLight(0xffffff, 2.4);
  key.position.set(...add3(c, mul3(KEY_DIR, 4 * r)));
  key.target.position.set(...c);
  scene.add(new T.HemisphereLight(0xffffff, 0x808080, 1.1), key, key.target);
  const look = (v: View3d) => {
    const dist = (r / Math.sin(((FOV / 2) * Math.PI) / 180)) * 1.05;
    camera.position.set(
      c[0] + dist * Math.sin(v.phi) * Math.sin(v.theta),
      c[1] + dist * Math.cos(v.phi),
      c[2] + dist * Math.sin(v.phi) * Math.cos(v.theta),
    );
    camera.lookAt(...c);
  };
  look(view);
  const done = () => {
    scene.traverse((o) => {
      const x = o as Three.Mesh;
      x.geometry?.dispose();
      const mat = x.material as Three.Material | undefined;
      if (mat && mat !== line) mat.dispose();
    });
    line.dispose();
  };
  return { scene, camera, look, done };
}

/**
 * Shape `key` drawn live on `canvas` from `view`, turned by dragging (as the 3D assembly tab's
 * orbit); `onView` hears each new view, `onTouch` every pointer action. Returns the way to stop
 * (it frees the WebGL context), or null when the shape isn't worked out yet or there's no WebGL.
 */
export async function orbit(
  canvas: HTMLCanvasElement,
  key: string,
  view: View3d,
  onView: (v: View3d) => void,
  onTouch: () => void,
): Promise<(() => void) | null> {
  const g = shapes.get(key);
  if (!g) return null;
  const T = await (three ??= import('three'));
  let renderer: Three.WebGLRenderer;
  try {
    renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    return null;
  }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  const w = canvas.clientWidth || 300;
  const h = canvas.clientHeight || 300;
  renderer.setSize(w, h, false);
  const { scene, camera, look, done } = build(T, g, view, w / h);
  let v = { ...view };
  const draw = () => renderer.render(scene, camera);
  draw();
  let last: [number, number] | null = null;
  const down = (e: PointerEvent) => {
    canvas.setPointerCapture(e.pointerId);
    last = [e.clientX, e.clientY];
    onTouch();
  };
  const move = (e: PointerEvent) => {
    onTouch();
    if (!last || !e.buttons) return;
    v = {
      theta: v.theta - (e.clientX - last[0]) * 0.01,
      phi: Math.min(Math.PI - 0.05, Math.max(0.05, v.phi - (e.clientY - last[1]) * 0.01)),
    };
    last = [e.clientX, e.clientY];
    look(v);
    draw();
    onView(v);
  };
  const up = () => (last = null);
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  return () => {
    canvas.removeEventListener('pointerdown', down);
    canvas.removeEventListener('pointermove', move);
    canvas.removeEventListener('pointerup', up);
    canvas.removeEventListener('pointercancel', up);
    done();
    renderer.dispose();
    renderer.forceContextLoss();
  };
}
