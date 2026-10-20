// Seam-line blocks: derive patches from the drawn seams plus the block outline.
import { arrange, type Face, type InputSeg } from '../geometry/arrangement';
import type { Pt, Seg } from '../geometry/path';
import type { Drawing } from '../schema/block';
import type { Path, PathCommand } from '../schema/shared';
import { SHAPE_OUTLINE, type BlockShape } from './shape';

export interface DerivedPatch {
  path: Path;
  /** Flattened outline in normalized coordinates (for sampling/area). */
  poly: Pt[];
}

export interface Derivation {
  patches: DerivedPatch[];
  /** Segment ids not connected to the outline (flagged; the drawing is left as drawn). */
  unconnected: string[];
}

const OUTLINE = ['#top', '#right', '#bottom', '#left'];
const SQUARE: [number, number][] = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];

/** Tolerance in design units: well below anything a quilter can cut or see. */
export const epsFor = (size: [number, number]) => 1e-6 * Math.max(size[0], size[1]);

/** `shape`: a shaped block's outline (spec 026); absent = the square. */
export function deriveSeamPatches(
  drawing: Drawing,
  size: [number, number],
  shape?: BlockShape,
): Derivation {
  const [w, h] = size;
  const toDesign = (x: number, y: number): Pt => [x * w, y * h];
  const nodes = new Map(drawing.nodes.map((n) => [n.id, toDesign(n.x, n.y)]));
  const corners: Pt[] = (shape ? SHAPE_OUTLINE[shape] : SQUARE).map(([x, y]) => toDesign(x, y));

  const input: InputSeg[] = corners.map((a, i) => ({
    id: (shape ? `#${i}` : OUTLINE[i]) ?? '#',
    seg: { kind: 'line', a, b: corners[(i + 1) % corners.length]! },
    outline: true,
  }));
  const broken: string[] = [];
  for (const s of drawing.segments) {
    const a = nodes.get(s.from);
    const b = nodes.get(s.to);
    if (!a || !b || (a[0] === b[0] && a[1] === b[1])) {
      broken.push(s.id);
      continue;
    }
    const seg: Seg =
      s.kind === 'line'
        ? { kind: 'line', a, b }
        : s.kind === 'arc'
          ? { kind: 'arc', a, b, sweep: s.sweep }
          : { kind: 'bezier', a, c1: toDesign(...s.c1), c2: toDesign(...s.c2), b };
    input.push({ id: s.id, seg, outline: false });
  }

  const { faces, unconnected } = arrange(input, epsFor(size));
  return {
    patches: faces.map((f) => toPatch(f, w, h)),
    unconnected: [...broken, ...unconnected],
  };
}

function toPatch(face: Face, w: number, h: number): DerivedPatch {
  const n = (p: Pt): [number, number] => [p[0] / w, p[1] / h];
  const first = n(face.segs[0]!.a);
  const path: PathCommand[] = [['M', ...first]];
  for (const s of face.segs) {
    if (s.kind === 'line') path.push(['L', ...n(s.b)]);
    else if (s.kind === 'arc') path.push(['A', ...n(s.b), s.sweep]);
    else path.push(['C', ...n(s.c1), ...n(s.c2), ...n(s.b)]);
  }
  path.push(['Z']);
  return { path, poly: face.poly.map(n) };
}
