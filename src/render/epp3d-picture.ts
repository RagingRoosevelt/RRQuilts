// 3D EPP quilts' card pictures (owner, 2026-11-23: "change the thumbnails for 3d epp quilts to use
// a 3d render of the quilt"): the folded object as the 3D assembly tab first shows it (turned to its
// front, stuffed when it's a stuffed design), drawn off screen with three.js. Pictures are worked out
// one at a time in short slices, so the page stays responsive; until one is ready, callers show
// the flat picture. One renderer (one WebGL context) serves them all.
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
  type Fold,
  type Net,
  type V3,
} from '@/model/epp/fold';
import { buildCloth, clothPt, pieceMesh, stuffFrame, type Cloth } from '@/model/epp/stuff';

/** What a picture shows: the net, each piece's color, whether it's stuffed, and how it's drawn. */
export interface Picture3d {
  net: Net;
  colors: string[];
  stuffed: boolean;
  px: number;
}

const PAPER = 0xf1ede3;
/** The 3D assembly tab's fixed light and first view. */
const KEY_DIR = unit3([0.3, 1, 0.5]);
const FOV = 50;
const VIEW = { theta: 0.55, phi: 1.1 };
/** Flat pieces sit a hair off their right side (two layers folded onto each other). */
const LIFT = 0.004;
/** Work per slice before giving the page back (ms). */
const SLICE = 12;
const KEEP = 100;

/** Finished pictures by key (reactive: a card showing the flat picture updates when it's ready). */
const ready = shallowReactive(new Map<string, string>());
const queued = new Set<string>();
const jobs: { key: string; it: Generator<void, string | null> }[] = [];
let busy = false;
let three: Promise<typeof Three> | null = null;
let gl: { T: typeof Three; renderer: Three.WebGLRenderer } | null = null;

// For automated checks (dev only): pictures waiting and done.
if (import.meta.env.DEV)
  Object.assign(window, { epp3dPictures: () => ({ waiting: jobs.length, done: ready.size }) });

/** The finished picture for `key`, or null (then it's queued). */
export function picture3d(key: string, what: () => Picture3d): string | null {
  const url = ready.get(key);
  if (url) return url;
  if (!queued.has(key)) {
    queued.add(key);
    jobs.push({ key, it: work(what()) });
    void run();
  }
  return null;
}

async function run() {
  if (busy) return;
  busy = true;
  try {
    three ??= import('three');
    const T = await three;
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
        return; // No WebGL: cards keep the flat picture.
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

/** Fold, turn to the front, stuff (a stuffed design), then draw. Yields between slices of work. */
function* work(p: Picture3d): Generator<void, string | null> {
  if (!p.net.pieces.length) return null;
  const m = buildFold(p.net);
  while (!foldFrame(m)) yield;
  for (let i = 0; i < 200 && turnToFront(m, 1) > 0; i++);
  const meshes = m.plates.map((P) => pieceMesh(P.pts, P.c));
  let cloth: Cloth | null = null;
  if (p.stuffed && m.closed) {
    cloth = buildCloth(m, meshes);
    while (!cloth.settled) {
      stuffFrame(cloth);
      yield;
    }
  }
  yield;
  return gl ? draw(gl.T, gl.renderer, m, cloth, meshes, p) : null;
}

function draw(
  T: typeof Three,
  renderer: Three.WebGLRenderer,
  m: Fold,
  cloth: Cloth | null,
  meshes: ReturnType<typeof pieceMesh>[],
  p: Picture3d,
): string {
  const scene = new T.Scene();
  const line = new T.LineBasicMaterial({ color: 0x222222 });
  const all: V3[] = [];
  m.plates.forEach((_, i) => {
    const mesh = meshes[i]!;
    const lift = mul3(qrot(m.q[i]!, [0, 0, 1]), LIFT);
    const pts: V3[] = cloth
      ? Array.from(cloth.pieceIds[i]!, (k) => clothPt(cloth, k))
      : mesh.xy.map(([x, y]) => add3(add3(qrot(m.q[i]!, [x, y, 0]), m.t[i]!), lift));
    all.push(...pts);
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.BufferAttribute(new Float32Array(pts.flat()), 3));
    geo.setIndex(mesh.tris);
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
        new T.MeshStandardMaterial({ ...opts, color: p.colors[i] ?? '#bdbdbd', side: T.FrontSide }),
      ),
      new T.Mesh(geo, new T.MeshStandardMaterial({ ...opts, color: PAPER, side: T.BackSide })),
      new T.LineLoop(
        new T.BufferGeometry().setFromPoints(pts.slice(-mesh.n).map((q) => new T.Vector3(...q))),
        line,
      ),
    );
  });
  const { c, r } = bounds(all);
  const camera = new T.PerspectiveCamera(FOV, 1, 0.01 * r, 100 * r);
  const dist = (r / Math.sin(((FOV / 2) * Math.PI) / 180)) * 1.05;
  camera.position.set(
    c[0] + dist * Math.sin(VIEW.phi) * Math.sin(VIEW.theta),
    c[1] + dist * Math.cos(VIEW.phi),
    c[2] + dist * Math.sin(VIEW.phi) * Math.cos(VIEW.theta),
  );
  camera.lookAt(...c);
  const key = new T.DirectionalLight(0xffffff, 2.4);
  key.position.set(...add3(c, mul3(KEY_DIR, 4 * r)));
  key.target.position.set(...c);
  scene.add(new T.HemisphereLight(0xffffff, 0x808080, 1.1), key, key.target);
  renderer.setSize(p.px, p.px, false);
  renderer.render(scene, camera);
  const url = renderer.domElement.toDataURL();
  scene.traverse((o) => {
    const x = o as Three.Mesh;
    x.geometry?.dispose();
    const mat = x.material as Three.Material | undefined;
    if (mat && mat !== line) mat.dispose();
  });
  line.dispose();
  return url;
}
