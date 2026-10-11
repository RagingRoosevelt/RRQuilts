import { describe, expect, it } from 'vitest';
import { deriveSeamPatches } from '@/model/blocks/derive';
import { signedArea } from '@/model/geometry/path';
import type { Drawing, Segment } from '@/model/schema/block';

type P = [number, number];
type Spec = [P, P] | [P, P, number] | [P, P, P, P];

/** Build a drawing from segments in normalized coords: line [a,b], arc [a,b,sweep], bezier [a,c1,c2,b]. */
function drawing(specs: Spec[]): Drawing {
  const nodes: Drawing['nodes'] = [];
  const node = ([x, y]: P) => {
    const id = `n${nodes.length}`;
    nodes.push({ id, x, y });
    return id;
  };
  const segments: Segment[] = specs.map((s, i) => {
    const id = `s${i}`;
    if (s.length === 2) return { id, kind: 'line', from: node(s[0]), to: node(s[1]) };
    if (s.length === 3) return { id, kind: 'arc', from: node(s[0]), to: node(s[1]), sweep: s[2] };
    return { id, kind: 'bezier', from: node(s[0]), to: node(s[3]), c1: s[1], c2: s[2] };
  });
  return { nodes, segments };
}

const derive = (specs: Spec[], size: P = [1, 1]) => deriveSeamPatches(drawing(specs), size);
const areas = (r: ReturnType<typeof derive>) =>
  r.patches.map((p) => signedArea(p.poly)).sort((a, b) => a - b);
const total = (r: ReturnType<typeof derive>) => areas(r).reduce((a, b) => a + b, 0);
const kinds = (r: ReturnType<typeof derive>) => r.patches.flatMap((p) => p.path.map((c) => c[0]));

const third = 1 / 3;
const grid3: Spec[] = [
  [
    [third, 0],
    [third, 1],
  ],
  [
    [2 * third, 0],
    [2 * third, 1],
  ],
  [
    [0, third],
    [1, third],
  ],
  [
    [0, 2 * third],
    [1, 2 * third],
  ],
];

describe('seam-line patch derivation', () => {
  it('outline alone is one patch', () => {
    const r = derive([]);
    expect(r.patches).toHaveLength(1);
    expect(total(r)).toBeCloseTo(1, 6);
  });

  it('nine-patch grid gives 9 equal squares', () => {
    const r = derive(grid3);
    expect(r.patches).toHaveLength(9);
    for (const a of areas(r)) expect(a).toBeCloseTo(1 / 9, 6);
  });

  it('Ohio Star seams give 5 squares and 16 triangles', () => {
    const t = third;
    const x = (x0: number, y0: number): Spec[] => [
      [
        [x0, y0],
        [x0 + t, y0 + t],
      ],
      [
        [x0 + t, y0],
        [x0, y0 + t],
      ],
    ];
    const r = derive([...grid3, ...x(t, 0), ...x(0, t), ...x(2 * t, t), ...x(t, 2 * t)]);
    expect(r.patches).toHaveLength(21);
    expect(total(r)).toBeCloseTo(1, 6);
    expect(areas(r).filter((a) => Math.abs(a - 1 / 36) < 1e-6)).toHaveLength(16);
  });

  it('a quarter-circle seam keeps a true arc (drunkard path)', () => {
    const r = derive([[[0.5, 0], [0, 0.5], -90]]);
    expect(r.patches).toHaveLength(2);
    expect(areas(r)[0]).toBeCloseTo(Math.PI / 16, 3);
    expect(kinds(r)).toContain('A');
    expect(kinds(r)).not.toContain('C');
  });

  it('an arc tangent to the outline splits the regions it touches', () => {
    // Semicircle bulging up from the left-middle to the right-middle, touching the top edge.
    const r = derive([[[0, 0.5], [1, 0.5], -180]]);
    expect(r.patches).toHaveLength(3);
    expect(total(r)).toBeCloseTo(1, 3);
  });

  it('keeps Béziers as Béziers', () => {
    const r = derive([
      [
        [0, 0.5],
        [0.3, 0.2],
        [0.7, 0.8],
        [1, 0.5],
      ],
    ]);
    expect(r.patches).toHaveLength(2);
    expect(kinds(r)).toContain('C');
    expect(total(r)).toBeCloseTo(1, 3);
  });

  it('T-junctions split the line they end on', () => {
    const r = derive([
      [
        [0, 0.5],
        [1, 0.5],
      ],
      [
        [0.5, 0],
        [0.5, 0.5],
      ],
    ]);
    expect(r.patches).toHaveLength(3);
  });

  it('flags floating and dangling segments without dropping the rest', () => {
    const r = derive([
      [
        [0.4, 0.4],
        [0.6, 0.6],
      ], // floating
      [
        [0, 0.25],
        [0.5, 0.25],
      ], // touches the outline at one end only
      [
        [0, 0.5],
        [1, 0.5],
      ],
    ]);
    expect(r.patches).toHaveLength(2);
    expect(r.unconnected.sort()).toEqual(['s0', 's1']);
  });

  it('a floating closed shape is unconnected (not pieceable)', () => {
    const r = derive([
      [
        [0.3, 0.3],
        [0.7, 0.3],
      ],
      [
        [0.7, 0.3],
        [0.7, 0.7],
      ],
      [
        [0.7, 0.7],
        [0.3, 0.7],
      ],
      [
        [0.3, 0.7],
        [0.3, 0.3],
      ],
    ]);
    expect(r.patches).toHaveLength(1);
    expect(r.unconnected).toHaveLength(4);
  });

  it('merges near-duplicate nodes and lines traced over the outline', () => {
    const r = derive([
      [
        [0, 0.5 + 1e-9],
        [1, 0.5],
      ],
      [
        [0.5, 0.5 - 1e-9],
        [0.5, 1],
      ],
      [
        [0, 0],
        [1, 0],
      ], // on the outline
    ]);
    expect(r.patches).toHaveLength(3);
    expect(r.unconnected).toEqual([]);
  });

  it('is circular at the designed proportions of non-square blocks', () => {
    // 6×10 block: quarter circle radius 3 (design units) in the top-left corner.
    const r = derive([[[0.5, 0], [0, 0.3], -90]], [6, 10]);
    expect(r.patches).toHaveLength(2);
    // Area in normalized units = (π·3²/4) / (6·10).
    expect(areas(r)[0]).toBeCloseTo((Math.PI * 9) / 4 / 60, 3);
  });

  it('derives a 100-seam block quickly', () => {
    const specs: Spec[] = [];
    for (let i = 1; i < 10; i++)
      specs.push(
        [
          [i / 10, 0],
          [i / 10, 1],
        ],
        [
          [0, i / 10],
          [1, i / 10],
        ],
      );
    for (let k = 0; specs.length < 100; k++) {
      const x = (k % 10) / 10;
      const y = Math.floor(k / 10) / 10;
      specs.push([
        [x, y],
        [x + 0.1, y + 0.1],
      ]);
    }
    const start = performance.now();
    const r = derive(specs);
    const ms = performance.now() - start;
    expect(r.patches).toHaveLength(100 + 82);
    expect(total(r)).toBeCloseTo(1, 6);
    expect(ms).toBeLessThan(200); // 10 ms locally; headroom for slow CI
  });
});
