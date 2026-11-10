// Single EPP item files (.rrqepp, spec 027 FR-013): one shape, or one rosette with the library
// shapes it uses and the colors and fabrics it's painted with. Imported items are the user's own;
// the original author stays credited (constitution Principle VI).
import Type from 'typebox';
import Value from 'typebox/value';
import { produce } from 'immer';
import { prettyJson } from './json';
import { plainFill } from './coloring';
import { settleCredits } from './credits';
import { canonicalContent, itemId, stableStringify } from './identity';
import { upgradeNotecards } from './tags';
import { variationName } from './new-quilt';
import { EppShape, Rosette } from './schema/epp';
import { Color, Fabric } from './schema/palette';
import type { RrqDoc } from './schema/project';

export const EPP_FORMAT = 'rrqepp';
export const EPP_VERSION = 1;

export const EppFile = Type.Object({
  format: Type.Literal(EPP_FORMAT),
  version: Type.Integer({ minimum: 1 }),
  app: Type.Optional(Type.String()),
  item: Type.Union([
    Type.Object({ type: Type.Literal('epp-shape'), data: EppShape }),
    Type.Object({ type: Type.Literal('rosette'), data: Rosette }),
  ]),
  /** A rosette's library shapes. */
  shapes: Type.Optional(Type.Array(EppShape, { maxItems: 500 })),
  colors: Type.Optional(Type.Array(Color)),
  fabrics: Type.Optional(Type.Array(Fabric)),
});
export type EppFile = Type.Static<typeof EppFile>;

/** A shape or rosette of `doc` as a file, with what it needs from the project and libraries. */
export function eppFile(
  doc: RrqDoc,
  id: string,
  lookup: {
    shape(id: string): EppShape | undefined;
    color(id: string): Color | undefined;
    fabric(id: string): Fabric | undefined;
  },
  app = '',
): EppFile | undefined {
  const p = doc.project;
  const shape = (p.eppShapes ?? []).find((s) => s.id === id);
  if (shape)
    return {
      format: EPP_FORMAT,
      version: EPP_VERSION,
      app,
      item: { type: 'epp-shape', data: shape },
    };
  const r = (p.rosettes ?? []).find((x) => x.id === id);
  if (!r) return undefined;
  const own = new Set((r.shapes ?? []).map((s) => s.id));
  const shapes = [...new Set(r.pieces.map((x) => x.shape))]
    .filter((s) => !own.has(s))
    .flatMap((s) => {
      const x = (p.eppShapes ?? []).find((y) => y.id === s) ?? lookup.shape(s);
      return x ? [x] : [];
    });
  const fills = r.colorings.flatMap((c) => Object.values(c.fills).map(plainFill));
  const colors = [...new Set(fills.flatMap((f) => (f && 'color' in f ? [f.color] : [])))].flatMap(
    (c) => {
      const x = p.palette.colors.find((y) => y.id === c) ?? lookup.color(c);
      return x ? [x] : [];
    },
  );
  const fabrics = [
    ...new Set(fills.flatMap((f) => (f && 'fabric' in f ? [f.fabric] : []))),
  ].flatMap((c) => {
    const x = p.palette.fabrics.find((y) => y.id === c) ?? lookup.fabric(c);
    return x ? [x] : [];
  });
  return {
    format: EPP_FORMAT,
    version: EPP_VERSION,
    app,
    item: { type: 'rosette', data: r },
    ...(shapes.length ? { shapes } : {}),
    ...(colors.length ? { colors } : {}),
    ...(fabrics.length ? { fabrics } : {}),
  };
}

export const serializeEpp = (f: EppFile) => prettyJson(f);

export function parseEppFile(
  text: string,
): { ok: true; file: EppFile } | { ok: false; error: string } {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Not an EPP file (not valid JSON).' };
  }
  const r = raw as Record<string, unknown> | null;
  if (!r || r.format !== EPP_FORMAT) return { ok: false, error: 'Not an RRQuilts EPP file.' };
  if (typeof r.version === 'number' && r.version > EPP_VERSION)
    return { ok: false, error: 'This file is from a newer RRQuilts. Update the app to open it.' };
  raw = upgradeNotecards(raw);
  if (!Value.Check(EppFile, raw)) {
    const e = [...Value.Errors(EppFile, raw)][0];
    return {
      ok: false,
      error: `EPP file is damaged: ${e ? `${e.instancePath || '/'}: ${e.message}` : ''}`,
    };
  }
  return { ok: true, file: raw };
}

/**
 * Add an imported shape or rosette (and the shapes, colors and fabrics it brings) to a project as the
 * user's own. The same design already there → unchanged; same id, another design → a copy with a new
 * id. Returns its id.
 */
export function importEpp(doc: RrqDoc, file: EppFile, me: string): { doc: RrqDoc; id: string } {
  const p = doc.project;
  const list = file.item.type === 'epp-shape' ? (p.eppShapes ?? []) : (p.rosettes ?? []);
  const existing = list.find((x) => x.id === file.item.data.id);
  const key = (x: object) => stableStringify(canonicalContent(x));
  if (existing && key(existing) === key(file.item.data)) return { doc, id: existing.id };
  const own = <T extends EppShape | Rosette>(x: T): T =>
    produce(x, (d) => {
      if (existing && d.id === file.item.data.id) {
        d.id = itemId(me);
        d.notecard.name = variationName(
          d.notecard.name,
          list.map((y) => y.notecard.name),
        );
        delete d.revision;
        delete d.version;
      }
      settleCredits(d);
      if (d.source) d.source.derived = true;
    });
  const item = own(file.item.data);
  const out = produce(doc, (d) => {
    const q = d.project;
    const haveShapes = new Set((q.eppShapes ?? []).map((s) => s.id));
    for (const s of file.shapes ?? []) if (!haveShapes.has(s.id)) (q.eppShapes ??= []).push(s);
    const haveColors = new Set(q.palette.colors.map((c) => c.id));
    for (const c of file.colors ?? []) if (!haveColors.has(c.id)) q.palette.colors.push(c);
    const haveFabrics = new Set(q.palette.fabrics.map((f) => f.id));
    for (const f of file.fabrics ?? []) if (!haveFabrics.has(f.id)) q.palette.fabrics.push(f);
    if (file.item.type === 'epp-shape') (q.eppShapes ??= []).push(item as EppShape);
    else (q.rosettes ??= []).push(item as Rosette);
  });
  return { doc: out, id: item.id };
}
