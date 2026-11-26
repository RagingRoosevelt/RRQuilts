// Rosette colorings that follow another (0.9.3 roadmap; as quilt colorways, spec 019 FR-009 and
// spec 024): Palette (`swaps`, picked by hand) and Auto mapping (`auto`, each color its nearest in a
// palette) map the colors of the coloring they follow (`source`). A coloring with no source is
// painted piece by piece (Re-color). Picks are keyed by the colors of the base (the painted coloring
// the chain of sources reaches), so following another changes no pick. `fills` always hold the
// colors shown, worked out again on every change (syncDraft), so drawing, quilts, printing and
// files read them as any coloring's.
import { fillKey } from '../coloring';
import { nearestColor, type RGB } from '../color-distance';
import type { PaletteSwatch } from '../colorway-auto';
import type { Fill, Swap } from '../schema/coloring';
import type { Rosette, RosetteColoring } from '../schema/epp';

const byId = (r: Rosette, id: string | undefined) => r.colorings.find((c) => c.id === id);

/** The painted coloring `c`'s chain of sources reaches (`c` when painted; undefined: a source is
 *  missing or the chain loops). */
export function baseColoring(r: Rosette, c: RosetteColoring): RosetteColoring | undefined {
  const seen = new Set<string>();
  let x: RosetteColoring | undefined = c;
  while (x?.source) {
    if (seen.has(x.id)) return undefined;
    seen.add(x.id);
    x = byId(r, x.source);
  }
  return x;
}

/** A coloring's picks as a function on the base's fills (a painted coloring changes nothing). */
export function swapperOf(c: RosetteColoring | undefined): (f: Fill) => Fill {
  if (!c?.source || !c.swaps?.length) return (f) => f;
  const m = new Map(c.swaps.map((s) => [s.from, s.to]));
  return (f) => m.get(fillKey(f)) ?? f;
}

/** The colorings `id` leads to through sources (itself first): none of them can be its source. */
export function followers(r: Rosette, id: string): Set<string> {
  const out = new Set([id]);
  for (let grew = true; grew;) {
    grew = false;
    for (const c of r.colorings)
      if (c.source && out.has(c.source) && !out.has(c.id)) grew = !!out.add(c.id);
  }
  return out;
}

/**
 * Colorings as lists show them (owner, 2026-11-25): each one followed at once by the colorings
 * that follow it (Palette, Auto map), and theirs, in stored order otherwise. The stored order
 * stays (a placement with no coloring shows the first).
 */
export function listOrder(r: Rosette): RosetteColoring[] {
  const kids = new Map<string, RosetteColoring[]>();
  for (const c of r.colorings)
    if (c.source && c.source !== c.id && byId(r, c.source))
      kids.set(c.source, [...(kids.get(c.source) ?? []), c]);
  const out: RosetteColoring[] = [];
  const seen = new Set<string>();
  const visit = (c: RosetteColoring) => {
    if (seen.has(c.id)) return;
    seen.add(c.id);
    out.push(c);
    for (const k of kids.get(c.id) ?? []) visit(k);
  };
  // Those that follow nothing first, with their followers; then any left (a loop), as stored.
  for (const c of r.colorings) if (!c.source || !byId(r, c.source)) visit(c);
  for (const c of r.colorings) visit(c);
  return out;
}

/** Painted from now on: the colors it shows kept, what it followed dropped. */
export function bake(c: RosetteColoring): RosetteColoring {
  const { source: _s, swaps: _w, auto: _a, palette: _p, ...rest } = c;
  void _s;
  void _w;
  void _a;
  void _p;
  return rest;
}

/**
 * Every coloring that follows another worked out again: an auto mapping's picks from the colors of
 * what it follows and its palette, then each one's fills from its base. `paletteOf` gives a
 * palette's picks (undefined: gone; null: can't tell here, so its picks stay), `rgbOf` a fill's
 * color. A missing source or a loop leaves it painted as it shows; a gone or empty palette makes an
 * auto mapping a Palette one keeping its picks. Unchanged, the rosette is returned as it was.
 */
export function refreshColorings(
  r: Rosette,
  paletteOf: (id: string) => readonly PaletteSwatch[] | undefined | null,
  rgbOf: (f: Fill) => RGB | undefined,
): Rosette {
  if (!r.colorings.some((c) => c.source)) return r;
  const done = new Map<string, RosetteColoring>();
  const out = r.colorings.map((c) => c);
  // Sources first: each pass settles the colorings whose source is settled.
  for (let pass = 0; pass <= out.length; pass++)
    out.forEach((c, i) => {
      if (done.has(c.id)) return;
      if (!c.source) return void done.set(c.id, c);
      const base = baseColoring(r, c);
      if (!base) return void done.set(c.id, (out[i] = bake(c)));
      if (!done.has(c.source)) {
        if (pass === out.length) done.set(c.id, (out[i] = bake(c))); // a loop
        return;
      }
      const shown = swapperOf(done.get(c.source));
      const keys = new Map(Object.values(base.fills).map((f) => [fillKey(f), f]));
      let next: RosetteColoring = c;
      const a = c.auto;
      const pal = a ? paletteOf(a.palette) : null;
      if (a && pal !== null && !pal?.length) {
        const { auto: _a, ...rest } = c;
        void _a;
        next = { ...rest, palette: a.palette };
      } else if (a && pal) {
        const inPalette = new Set(pal.map((p) => fillKey(p.fill)));
        const overrides = (a.overrides ?? []).filter(
          (o) => keys.has(o.from) && inPalette.has(fillKey(o.to)),
        );
        const over = new Map(overrides.map((o) => [o.from, o.to]));
        const swaps: Swap[] = [];
        for (const [from, f] of keys) {
          const rgb = rgbOf(shown(f));
          const to = over.get(from) ?? (rgb && nearestColor(rgb, pal)?.fill);
          if (to && fillKey(to) !== from) swaps.push({ from, to });
        }
        const { overrides: _o, ...plain } = a;
        void _o;
        next = { ...c, swaps, auto: overrides.length ? { ...plain, overrides } : plain };
      }
      const swap = swapperOf(next);
      const fills = Object.fromEntries(Object.entries(base.fills).map(([k, f]) => [k, swap(f)]));
      next = { ...next, fills };
      done.set(c.id, (out[i] = JSON.stringify(next) === JSON.stringify(c) ? c : next));
    });
  return out.every((c, i) => c === r.colorings[i]) ? r : { ...r, colorings: out };
}

/**
 * Coloring `id` deleted, every other looking as it did: one that followed it follows what it
 * followed (an auto mapping becomes a Palette one, keeping its picks). When it was painted, the
 * colorings built on it are painted from now on (their picks were keyed by its colors).
 */
export function deleteColoring(r: Rosette, id: string): Rosette {
  if (r.colorings.length <= 1) return r;
  const gone = byId(r, id);
  if (!gone) return r;
  const colorings = r.colorings
    .filter((c) => c.id !== id)
    .map((c) => {
      if (!gone.source) return c.source && baseColoring(r, c) === gone ? bake(c) : c;
      if (c.source !== id) return c;
      const { auto, ...rest } = c;
      return { ...rest, source: gone.source, ...(auto ? { palette: auto.palette } : {}) };
    });
  return { ...r, colorings };
}
