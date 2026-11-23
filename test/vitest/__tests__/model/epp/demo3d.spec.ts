// The 3D EPP demo project (spec 027 User Story 7; owner, 2026-11-23: hosted as a gist and linked
// from the help): a 3D EPP quilt for each design. The test checks every design folds shut, or, for
// the pillows no flat fold closes, that stuffing does. EPP3D_DEMO=<file> also writes the project.
import { writeFileSync } from 'node:fs';
import { produce } from 'immer';
import { describe, expect, it } from 'vitest';
import { starterKit } from '@/dev/fill-quilt';
import { eppStarters } from '@/content/epp';
import { nonWholeEdges } from '@/model/epp/checks';
import { lookupEpp } from '@/model/epp/expand';
import { buildFold, foldReport, solveFold } from '@/model/epp/fold';
import { centroid } from '@/model/epp/geometry';
import { quiltNet } from '@/model/epp/net';
import { buildCloth, pieceMesh, solveCloth } from '@/model/epp/stuff';
import { DEFAULT_LICENSE } from '@/model/credits';
import { itemId } from '@/model/identity';
import { parseProject, serializeProject } from '@/model/io';
import { syncDraft } from '@/model/library-items';
import { createProject } from '@/model/new-project';
import type { Pt } from '@/model/geometry/path';
import type { EppShape } from '@/model/schema/epp';
import type { RrqDoc } from '@/model/schema/project';
import {
  cube,
  designQuilt,
  dodecahedron,
  hexagonalPrism,
  icosahedron,
  octahedron,
  soccerBall,
  starPillow,
  tetrahedron,
  trapezohedron,
  truncatedTetrahedron,
  twistedPincushion,
  type Design,
} from './designs3d';

const out = process.env.EPP3D_DEMO;
const AUTHOR = 'RRQuilts contributors';

/** Name, design, and whether it closes by folding or only once stuffed. */
const DESIGNS: [string, () => Design, 'fold' | 'stuff'][] = [
  ['Star pillow', starPillow, 'stuff'],
  ['Twisted pincushion', twistedPincushion, 'stuff'],
  ['d4 (tetrahedron)', tetrahedron, 'fold'],
  ['d6 (cube)', cube, 'fold'],
  ['d8 (octahedron)', octahedron, 'fold'],
  ['d10 (kites)', trapezohedron, 'fold'],
  ['d12 (dodecahedron)', dodecahedron, 'fold'],
  ['d20 (icosahedron)', icosahedron, 'fold'],
  ['Hexagonal prism', hexagonalPrism, 'fold'],
  ['Truncated tetrahedron', truncatedTetrahedron, 'fold'],
  ['Soccer ball', soccerBall, 'fold'],
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const fill = (color: string) => ({ color: `rrquilts.${slug(color)}` });

/** The d10's kite as the project's own shape: the long edges aren't whole units, so marked. */
function kiteShape(): EppShape {
  const pts = trapezohedron().pieces[0]!.pts.map(([x, y]): Pt => [x, -y]);
  const c = centroid(pts);
  const outline = pts.map(([x, y]): Pt => [x - c[0], y - c[1]]);
  const marked = nonWholeEdges(outline);
  return {
    id: itemId(AUTHOR),
    notecard: { name: 'd10 Kite' },
    author: AUTHOR,
    license: DEFAULT_LICENSE,
    outline,
    ...(marked.length ? { marked } : {}),
  };
}

async function demo(): Promise<RrqDoc> {
  const kit = await starterKit();
  const { shapes, rosettes } = eppStarters();
  const kite = kiteShape();
  const known = [...shapes, kite];
  const lookup = lookupEpp({ eppShapes: known, rosettes });
  const quilts = DESIGNS.map(([name, d]) => ({
    ...designQuilt(d(), name, known, lookup, fill),
    author: AUTHOR,
    license: DEFAULT_LICENSE,
  }));
  const doc = createProject('3D EPP demo', 'in', 'demo');
  return produce(doc, (d) => {
    d.project.license = DEFAULT_LICENSE;
    d.project.eppShapes = [kite];
    d.project.quilts.push(...quilts);
    syncDraft(d, kit.lookup);
  });
}

describe('3D EPP demo project', () => {
  it('every design folds shut, or stuffing closes it; the file opens clean', async () => {
    const doc = await demo();
    const lookup = lookupEpp(doc.project);
    for (const [k, [name, , closes]] of DESIGNS.entries()) {
      const q = doc.project.quilts[k]!;
      expect(q.notecard.name).toBe(name);
      const m = solveFold(buildFold(quiltNet(q, lookup).net));
      const r = foldReport(m);
      expect(m.closed, name).toBe(true);
      if (closes === 'fold') {
        expect(r.open, name).toEqual([]);
        expect(r.volume, name).toBeGreaterThan(0);
      } else {
        expect(r.open.length, name).toBeGreaterThan(0);
        const c = solveCloth(
          buildCloth(
            m,
            m.plates.map((P) => pieceMesh(P.pts, P.c)),
          ),
        );
        expect(c.vol, name).toBeGreaterThan(0.5);
      }
    }
    const text = serializeProject(doc);
    const back = await parseProject(text);
    if (!back.ok) throw new Error(back.error);
    expect(back.report ?? []).toEqual([]);
    if (out) writeFileSync(out, text);
  });
});
