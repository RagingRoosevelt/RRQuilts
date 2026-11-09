// Data entered for a project that isn't open (spec 041): kept on the device as a patch per quilt,
// and applied when the project next opens. Pure: no storage here.
import { setYear } from './data-quilt';
import type { DayMade, DayValues } from './schema/data-quilt';
import type { RrqDoc } from './schema/project';

export interface QuiltPatch {
  /** The period's first day (the year changed, spec 041). */
  start?: string;
  /** Changed days, each its whole row of values. */
  entries?: DayValues;
  /** Changed marks (null: cleared). */
  made?: Record<string, DayMade | null>;
  blocksMade?: Record<string, string | null>;
}

export interface PendingData {
  /** Project id. */
  id: string;
  quilts: Record<string, QuiltPatch>;
  updatedAt: number;
}

/** `b` laid over `a` (later writes win per day). */
export function mergePatch(a: QuiltPatch = {}, b: QuiltPatch): QuiltPatch {
  const out: QuiltPatch = { ...a };
  if (b.start) out.start = b.start;
  if (b.entries) out.entries = { ...a.entries, ...b.entries };
  if (b.made) out.made = { ...a.made, ...b.made };
  if (b.blocksMade) out.blocksMade = { ...a.blocksMade, ...b.blocksMade };
  return out;
}

const empty = (row: readonly unknown[]) => row.every((v) => v === null || v === '');

/** The document with the pending patches applied (a new object; quilts no longer there or not data
 *  quilts are skipped). Unchanged input comes back as is. */
export function applyPending(
  doc: RrqDoc,
  pending: Pick<PendingData, 'quilts'> | undefined,
): RrqDoc {
  if (!pending || !Object.keys(pending.quilts).length) return doc;
  let changed = false;
  const quilts = doc.project.quilts.map((q) => {
    const p = pending.quilts[q.id];
    if (!p || !q.data) return q;
    changed = true;
    const moved = p.start ? setYear(q.data, Number(p.start.slice(0, 4))) : q.data;
    const data = { ...moved, entries: { ...moved.entries } };
    for (const [d, row] of Object.entries(p.entries ?? {})) {
      if (empty(row)) delete data.entries[d];
      else data.entries[d] = row;
    }
    if (p.made) {
      const made = { ...data.made };
      for (const [d, m] of Object.entries(p.made)) {
        if (m && (m.cut || m.assembled)) made[d] = m;
        else delete made[d];
      }
      if (Object.keys(made).length) data.made = made;
      else delete data.made;
    }
    if (p.blocksMade) {
      const bm = { ...data.blocksMade };
      for (const [n, at] of Object.entries(p.blocksMade)) {
        if (at) bm[n] = at;
        else delete bm[n];
      }
      if (Object.keys(bm).length) data.blocksMade = bm;
      else delete data.blocksMade;
    }
    return { ...q, data };
  });
  return changed ? { ...doc, project: { ...doc.project, quilts } } : doc;
}
