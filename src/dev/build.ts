// Builds the Tests tab's quilts (dev server only): each variation a quilt, filled as a quilter would,
// with its key settings in words. Layout gallery, border matrix, setting sweeps and extremes all use it.
import { produce } from 'immer';
import { BORDER_STYLE_NAMES } from '@/model/layout/borders';
import { convertLayout, generateSlots, type LayoutStyle } from '@/model/layout/slots';
import { createProject } from '@/model/new-project';
import { createQuilt } from '@/model/new-quilt';
import type { RrqDoc, Units } from '@/model/schema/project';
import type { Border, Layout } from '@/model/schema/quilt';
import { fillQuilt, starterKit, type FillMode, type Kit } from './fill-quilt';

export interface DevVariation {
  /** Reference label the owner quotes back (G012, border:points-out, S03.2, X04). */
  id: string;
  title: string;
  /** Section it's listed under. */
  group: string;
  /** Shown under the section heading (a sweep's expectation). */
  note?: string;
  /** What a correct picture shows. */
  expect?: string;
  /** Layout style; the quilt starts from a 3×3 Straight Set of 10 in (25 cm) blocks converted to it. */
  style: string;
  /** Settings changed from that start (shown as the key settings). */
  layout?: Record<string, unknown>;
  borders?: { style: string; sides: [number, number, number, number]; blocks?: [number, number] }[];
  fill?: FillMode;
  /** Every third block turned, every third flipped. */
  turns?: boolean;
  units?: Units;
}

export interface Built extends DevVariation {
  quiltId?: string;
  settings: string[];
  error?: string;
  /** Time to build and fill the quilt. */
  ms: number;
  doc: RrqDoc;
}

const startFor = (units: Units): Layout => {
  const k = units === 'cm' ? 2.5 : 1;
  return {
    style: 'straight-set',
    cols: 3,
    rows: 3,
    block: [10 * k, 10 * k],
    sash: [0, 0],
    sashBorder: false,
  };
};
const plainBorder = (units: Units): Border[] => [
  { style: 'long-horizontal', sides: units === 'cm' ? [7.5, 7.5, 7.5, 7.5] : [3, 3, 3, 3] },
];
const FILLS = {
  blocks: 'a different block in each block space',
  one: 'the same block in every block space',
  mix: 'blocks and solids alternating',
  solids: 'solids only',
};

const show = (v: unknown, u: string): string =>
  Array.isArray(v)
    ? v.every((x) => typeof x !== 'object')
      ? v.join(' × ')
      : v.map((x) => show(x, u)).join(', ')
    : typeof v === 'object' && v
      ? 'style' in v && 'width' in v
        ? `${String(v.style)} ${String(v.width)} ${u}`
        : Object.entries(v)
            .map(([k, x]) => `${k} ${show(x, u)}`)
            .join(', ')
      : String(v);

/** Everything the variation sets, in words (printed from the same settings that build it). */
function settings(v: DevVariation, blockSpaces: number) {
  const u = v.units ?? 'in';
  const borders = (v.borders ?? plainBorder(u))
    .map((b) => `${BORDER_STYLE_NAMES[b.style as Border['style']] ?? b.style} ${b.sides[0]} ${u}`)
    .join(', ');
  return [
    `layout: ${v.style}`,
    ...Object.entries(v.layout ?? {}).map(([k, x]) => `${k}: ${show(x, u)}`),
    `borders: ${borders || 'none'}`,
    `fill: ${blockSpaces ? FILLS[v.fill ?? 'blocks'] : 'solids (no block spaces)'}`,
    ...(v.turns ? ['blocks turned and flipped'] : []),
    ...(u === 'cm' ? ['units: cm'] : []),
  ];
}

let kit: Promise<Kit> | undefined;

/** One project per unit system; each variation is a quilt in it. Failures are kept, not thrown. */
export async function buildQuilts(variations: readonly DevVariation[]): Promise<Built[]> {
  const k = await (kit ??= starterKit());
  const docs: Partial<Record<Units, RrqDoc>> = {};
  const out: Omit<Built, 'doc'>[] = [];
  const unitsOf: Units[] = [];
  for (const v of variations) {
    const units = v.units ?? 'in';
    let doc = (docs[units] ??= createProject(`Tests (${units})`, units, 'tests'));
    const t0 = performance.now();
    let error: string | undefined;
    let quiltId: string | undefined;
    let blockSpaces = 0;
    try {
      const layout: Layout = {
        ...convertLayout(startFor(units), v.style as LayoutStyle, units),
        ...v.layout,
      };
      const quilt = createQuilt(
        `${v.id} ${v.title}`,
        layout,
        (v.borders ?? plainBorder(units)) as Border[],
      );
      // Throws on settings the layout can't draw.
      blockSpaces = generateSlots(quilt.layout, quilt.borders).slots.filter(
        (s) => s.kind === 'block',
      ).length;
      doc = produce(doc, (d) => void d.project.quilts.push(quilt));
      doc = fillQuilt(doc, quilt.id, k, v.fill, { turns: !!v.turns });
      docs[units] = doc;
      quiltId = quilt.id;
    } catch (e) {
      error = (e as Error).message;
    }
    out.push({
      ...v,
      settings: settings(v, blockSpaces),
      ms: performance.now() - t0,
      ...(quiltId ? { quiltId } : {}),
      ...(error ? { error } : {}),
    });
    unitsOf.push(units);
  }
  // Every entry points at its project's final version (all its quilts).
  return out.map((e, i) => ({ ...e, doc: docs[unitsOf[i]!]! }));
}
