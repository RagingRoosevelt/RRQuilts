// Help › Quilt math calculators (spec 013 US3): the printouts' own math (rotary.ts, yardage.ts) run on
// simple shapes, so a calculator and a printout always agree for the same input.
import type { Pt } from '@/model/geometry/path';
import { fmtFabric, fmtLen, roundUp } from '@/model/print/format';
import type { Piece } from '@/model/print/pieces';
import { WIDTHS, type PrintPrefs, type WidthOption } from '@/model/print/prefs';
import { cutFor, cutPlan, type Cut } from '@/model/print/rotary';
import { BINDING_EXTRA, backing, binding, fabricNeeds } from '@/model/print/yardage';
import type { Units } from '@/model/schema/project';

export interface CalcInput {
  key: string;
  label: string;
  /** Starting value per unit system. */
  start: Record<Units, number>;
  /** A count (whole number), not a length. */
  count?: boolean;
  /** A plain number field (not snapped to the ruler). */
  raw?: boolean;
  /** Changing this input sets `key` to this value × `factor` (e.g. a goose's height = width ÷ 2). */
  link?: { key: string; factor: number };
  /** Start a new line of inputs here (keeps a pair like length × width together). */
  newLine?: boolean;
}
export interface CalcRow {
  label: string;
  value: string;
}
/** What the math depends on: the user's units and print settings. */
export interface CalcContext {
  units: Units;
  seam: number;
  step: number;
  slack: number;
  usable: number;
  /** The chosen fabric (a bolt width, or fat quarters where the calculator offers them). */
  fabric: WidthOption;
  fabricStep: number;
  overhang: number;
  bindingWidth: number;
}
export interface Calculator {
  title: string;
  /** Uses the fabric width: the calculator offers a choice of bolt widths (as on the yardage page),
   *  'any' also fat quarters. */
  widths?: boolean | 'any';
  inputs: CalcInput[];
  rows: (v: Record<string, number>, c: CalcContext) => CalcRow[];
}

/** Bolt widths a calculator can use (fat quarters are counted separately). */
export const boltWidths = (units: Units) => WIDTHS[units].filter((w) => !w.fatQuarter);

/** `width`: a fabric width id (WIDTHS); the first bolt width by default. */
export function calcContext(units: Units, p: PrintPrefs, width?: string): CalcContext {
  const fabric = WIDTHS[units].find((w) => w.id === width) ?? boltWidths(units)[0]!;
  return {
    units,
    seam: p.seam[units],
    step: p.rounding[units],
    slack: p.miterSlack[units],
    usable: fabric.usable,
    fabric,
    fabricStep: p.fabricStep[units],
    overhang: p.overhang[units],
    bindingWidth: p.bindingWidth[units],
  };
}

const piece = (poly: Pt[]): Piece => ({ poly, curved: false, fill: 'x', marks: [] });
const rect = (w: number, h: number) =>
  piece([
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ]);
/** Half-square triangle: legs along the grain. */
const hst = (leg: number) =>
  piece([
    [0, 0],
    [leg, 0],
    [0, leg],
  ]);
/** Quarter-square triangle: long side along the grain. */
const qst = (long: number) =>
  piece([
    [0, 0],
    [long, 0],
    [long / 2, long / 2],
  ]);
/** A mitered border strip: long edge `long`, `w` wide, 45° ends. */
const miter = (long: number, w: number) =>
  piece([
    [0, 0],
    [long, 0],
    [long - w, w],
    [w, w],
  ]);

const len = (x: number, c: CalcContext) => fmtLen(x, c.units);
const size = (cut: Cut, c: CalcContext) =>
  cut.cut[0] === cut.cut[1]
    ? `${len(cut.cut[0], c)} square`
    : `${len(cut.cut[0], c)} × ${len(cut.cut[1], c)}`;

const start = (inches: number, cm: number) => ({ in: inches, cm });

export const CALCULATORS: Record<string, Calculator> = {
  square: {
    title: 'Square',
    inputs: [{ key: 'f', label: 'Finished side', start: start(3, 8) }],
    rows: ({ f }, c) => [{ label: 'Cut', value: size(cutFor(rect(f!, f!), c.seam, c.step), c) }],
  },
  rect: {
    title: 'Rectangle',
    inputs: [
      { key: 'w', label: 'Finished length', start: start(6, 15) },
      { key: 'h', label: 'Finished width', start: start(3, 8) },
    ],
    rows: ({ w, h }, c) => [{ label: 'Cut', value: size(cutFor(rect(w!, h!), c.seam, c.step), c) }],
  },
  hst: {
    title: 'Half-square triangles',
    inputs: [{ key: 'f', label: 'Finished leg', start: start(3, 8) }],
    rows: ({ f }, c) => {
      const two = cutFor(hst(f!), c.seam, c.step);
      const four = roundUp((f! + (2 + Math.SQRT2) * c.seam) * Math.SQRT2, c.step);
      return [
        { label: 'Two at a time', value: `${size(two, c)}, one per pair · cut once diagonally` },
        {
          label: 'Four at a time',
          value: `${len(four, c)} square, one per pair · sew all around, cut both diagonals`,
        },
        {
          label: 'Eight at a time',
          value: `${len(2 * two.cut[0], c)} square, one per pair · sew both diagonals, cut into 8`,
        },
      ];
    },
  },
  qst: {
    title: 'Quarter-square triangles',
    inputs: [{ key: 'f', label: 'Finished long side', start: start(4, 10) }],
    rows: ({ f }, c) => [
      {
        label: 'Cut',
        value: `${size(cutFor(qst(f!), c.seam, c.step), c)} · cut both diagonals: 4 triangles`,
      },
    ],
  },
  geese: {
    title: 'Flying geese',
    // These methods make the classic 2:1 goose (right isosceles triangles), so the two sizes are
    // linked: set either one.
    inputs: [
      { key: 'w', label: 'Finished width', start: start(4, 10), link: { key: 'h', factor: 0.5 } },
      { key: 'h', label: 'Finished height', start: start(2, 5), link: { key: 'w', factor: 2 } },
    ],
    rows: ({ w }, c) => {
      const h = w! / 2;
      const goose = cutFor(qst(w!), c.seam, c.step);
      const sky = cutFor(hst(h), c.seam, c.step);
      return [
        {
          label: 'Stitch and flip (1)',
          value: `${size(cutFor(rect(w!, h), c.seam, c.step), c)} rectangle + 2 × ${size(cutFor(rect(h, h), c.seam, c.step), c)}`,
        },
        {
          label: 'Four at a time (4)',
          value: `1 × ${size(goose, c)} + 4 × ${size(sky, c)}`,
        },
        {
          label: 'Pieced (1)',
          value: `goose: ¼ of a ${size(goose, c)}; sky: 2 halves of a ${size(sky, c)}`,
        },
      ];
    },
  },
  sqinsq: {
    title: 'Square in a square',
    inputs: [{ key: 'f', label: 'Finished unit side', start: start(4, 10) }],
    rows: ({ f }, c) => {
      const center = f! / Math.SQRT2;
      return [
        { label: 'Center', value: size(cutFor(rect(center, center), c.seam, c.step), c) },
        {
          label: 'Corners',
          value: `2 × ${size(cutFor(hst(f! / 2), c.seam, c.step), c)}, cut once diagonally`,
        },
      ];
    },
  },
  onpoint: {
    title: 'On-point setting',
    inputs: [
      { key: 'f', label: 'Finished block side', start: start(10, 25) },
      { key: 'n', label: 'Blocks across', start: start(3, 3), count: true },
      { key: 'm', label: 'Blocks down', start: start(2, 2), count: true },
    ],
    // `n` full blocks across the top row and `m` down the side; the rows between are offset by half a
    // block, so the quilt is n × m block diagonals.
    rows: ({ f, n, m }, c) => {
      const d = f! * Math.SQRT2;
      const across = Math.max(1, Math.round(n!));
      const down = Math.max(1, Math.round(m!));
      const sides = 2 * (across - 1) + 2 * (down - 1);
      return [
        { label: 'Finished quilt', value: `${len(across * d, c)} × ${len(down * d, c)}` },
        { label: 'Block diagonal', value: len(d, c) },
        { label: 'Blocks', value: String(across * down + (across - 1) * (down - 1)) },
        {
          label: 'Side setting triangles',
          value: `${Math.ceil(sides / 4)} × ${size(cutFor(qst(d), c.seam, c.step), c)}, cut both diagonals (${sides} needed)`,
        },
        {
          label: 'Corner setting triangles',
          value: `2 × ${size(cutFor(hst(f! / Math.SQRT2), c.seam, c.step), c)}, cut once (4 corners)`,
        },
      ];
    },
  },
  border: {
    title: 'Borders',
    inputs: [
      { key: 'w', label: 'Finished width, no border', start: start(48, 120) },
      { key: 'h', label: 'Finished height, no border', start: start(60, 150) },
      { key: 'b', label: 'Finished border width', start: start(4, 10) },
    ],
    rows: ({ w, h, b }, c) => [
      {
        label: 'Straight: sides',
        value: `2 × ${size(cutFor(rect(h!, b!), c.seam, c.step), c)}`,
      },
      {
        label: 'Straight: top and bottom',
        value: `2 × ${size(cutFor(rect(w! + 2 * b!, b!), c.seam, c.step), c)}`,
      },
      {
        label: 'Mitered: sides',
        value: `2 × ${size(cutFor(miter(h! + 2 * b!, b!), c.seam, c.step, c.slack), c)}`,
      },
      {
        label: 'Mitered: top and bottom',
        value: `2 × ${size(cutFor(miter(w! + 2 * b!, b!), c.seam, c.step, c.slack), c)}`,
      },
    ],
  },
  binding: {
    title: 'Binding',
    widths: true,
    inputs: [
      { key: 'w', label: 'Quilt width', start: start(48, 120) },
      { key: 'h', label: 'Quilt height', start: start(48, 120) },
    ],
    rows: ({ w, h }, c) => {
      const b = binding(
        2 * (w! + h!),
        c.bindingWidth,
        BINDING_EXTRA[c.units],
        c.usable,
        c.fabricStep,
      );
      return [
        { label: 'Strips', value: `${b.strips} × ${len(c.bindingWidth, c)} wide` },
        { label: 'Total length', value: len(2 * (w! + h!) + BINDING_EXTRA[c.units], c) },
        { label: 'Fabric', value: fmtFabric(b.length, c.units) },
      ];
    },
  },
  backing: {
    title: 'Backing',
    widths: true,
    inputs: [
      { key: 'w', label: 'Quilt width', start: start(60, 150) },
      { key: 'h', label: 'Quilt height', start: start(72, 180) },
    ],
    rows: ({ w, h }, c) => [
      {
        label: 'Fabric',
        value: fmtFabric(backing(w!, h!, c.overhang, c.usable, c.fabricStep), c.units),
      },
      { label: 'Overhang', value: `${len(c.overhang, c)} each side` },
    ],
  },
  yardage: {
    title: 'Patches from yardage',
    widths: 'any',
    inputs: [
      { key: 'n', label: 'How many patches', start: start(40, 40), count: true },
      { key: 'w', label: 'Finished length', start: start(3, 8), newLine: true },
      { key: 'h', label: 'Finished width', start: start(3, 8) },
    ],
    rows: ({ n, w, h }, c) => {
      const pieces = Array.from({ length: Math.max(1, Math.round(n!)) }, () => rect(w!, h!));
      const lines = cutPlan(pieces, c.seam, c.step, c.usable);
      const need = fabricNeeds(lines, c.fabric, c.fabricStep)[0]!;
      return [
        {
          label: 'Strips',
          value: `${lines[0]!.strips} × ${len(lines[0]!.stripWidth, c)} (${lines[0]!.perStrip} per strip)`,
        },
        c.fabric.fatQuarter
          ? { label: 'Fat quarters', value: String(need.fatQuarters) }
          : {
              label: `Fabric (${len(c.usable, c)} usable)`,
              value: fmtFabric(need.length, c.units),
            },
      ];
    },
  },
  rounding: {
    title: 'Rounding to the ruler',
    inputs: [{ key: 'x', label: 'Exact length', start: start(3.854, 9.31), raw: true }],
    rows: ({ x }, c) => [
      { label: 'Exact', value: len(x!, c) },
      { label: 'Cut (rounded up)', value: len(roundUp(x!, c.step), c) },
    ],
  },
};
