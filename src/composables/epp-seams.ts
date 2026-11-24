// 3D EPP seams on a 2D canvas (spec 027 User Story 7): the Design tab's Seam tool and the net in
// the 3D assembly tab. Tap a free edge, then an equal edge of another piece, to sew them; tap a
// numbered edge to unpick its seam. Draws each seam's edges in its color with its number (red when
// the fold can't close it), the edge being picked, and the front piece ringed. In the 3D assembly
// tab the seam under the pointer (or a held finger) stands out, both its edges, and the others fade.
import { useQuasar } from 'quasar';
import { computed, ref } from 'vue';
import type { Decor } from '@/components/EppCanvas.vue';
import type { EppLookup, Leaf } from '@/model/epp/expand';
import { buildFold, frontPiece } from '@/model/epp/fold';
import { centroid, outerEdges, type Edge } from '@/model/epp/geometry';
import { edgeRef, quiltNet, seamMarks, seamsAt } from '@/model/epp/net';
import { addSeam, removeSeam } from '@/model/epp/quilt-ops';
import { dist, type Pt } from '@/model/geometry/path';
import type { Quilt } from '@/model/schema/quilt';

type At = [number, number];
const OPEN = '#e53935';
/** The shared-edge highlight: the stitches' glow color in 3D. */
const HOT = '#ff2d95';
/** Unsewn edges (Highlight unsewn edges), as their tubes in 3D. */
const RAW = '#ff9800';

/** A seam picked out on the net: an explicit seam (its number - 1), or an edge shared with a
 *  neighbor (leaf, edge of its outline). */
export type ActiveSeam = { seam: number } | { seam: null; leaf: number; edge: number };

export function useEppSeams(o: {
  quilt: () => Quilt;
  leaves: () => Leaf[];
  lookup: () => EppLookup;
  /** CSS pixels → units. */
  px: (n: number) => number;
  edit: (fn: (q: Quilt) => Quilt) => void;
  /** Seams (by number - 1) the fold can't close. */
  open?: () => ReadonlySet<number>;
}) {
  const $q = useQuasar();
  /** The explicit seams that fit, placed: (leaf, edge of its outline) each end, in number order. */
  const placed = computed(() => seamsAt(o.leaves(), o.quilt().epp?.seams ?? []));
  const edgeKey = (a: Pt, b: Pt) => [...a, ...b].map((x) => x.toFixed(4)).join(',');
  const free = computed(
    () => new Set(outerEdges(o.leaves().map((l) => l.poly)).map(([a, b]) => edgeKey(a, b))),
  );
  /** The first edge picked for a new seam. */
  const start = ref<At | null>(null);
  const leafEdge = ([i, k]: At): Edge => {
    const poly = o.leaves()[i]!.poly;
    return [poly[k]!, poly[(k + 1) % poly.length]!];
  };
  /** The piece edge nearest p within reach. */
  function near(p: Pt): At | null {
    let best: At | null = null;
    let d = o.px(14);
    o.leaves().forEach((l, i) =>
      l.poly.forEach((a, k) => {
        const b = l.poly[(k + 1) % l.poly.length]!;
        const ab: Pt = [b[0] - a[0], b[1] - a[1]];
        const t = Math.max(
          0,
          Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / (ab[0] ** 2 + ab[1] ** 2)),
        );
        const e = dist(p, [a[0] + ab[0] * t, a[1] + ab[1] * t]);
        if (e < d) [best, d] = [[i, k], e];
      }),
    );
    return best;
  }
  const say = (message: string) => void $q.notify({ message, timeout: 2000 });
  function tap(p: Pt) {
    const at = near(p);
    if (!at) return void (start.value = null);
    const same = (x: At) => x[0] === at[0] && x[1] === at[1];
    const sewn = placed.value.find((s) => same(s.a) || same(s.b));
    if (sewn) {
      start.value = null;
      const k = (o.quilt().epp?.seams ?? []).indexOf(sewn.seam);
      return o.edit((q) => removeSeam(q, k));
    }
    if (!free.value.has(edgeKey(...leafEdge(at)))) {
      start.value = null;
      return say('That edge touches its neighbor, so it is sewn already.');
    }
    const first = start.value;
    if (!first) return void (start.value = at);
    start.value = null;
    if (first[0] === at[0]) {
      if (first[1] !== at[1]) say('A piece can’t be sewn to itself.');
      return;
    }
    const la = dist(...leafEdge(first));
    const lb = dist(...leafEdge(at));
    if (Math.abs(la - lb) > 1e-6)
      return say(
        `Those edges differ (${+la.toFixed(2)}U and ${+lb.toFixed(2)}U). Seams join equal edges.`,
      );
    const [a, b] = [first, at].map(([i, k]) => edgeRef(o.leaves()[i]!, k)) as [
      ReturnType<typeof edgeRef>,
      ReturnType<typeof edgeRef>,
    ];
    o.edit((q) => addSeam(q, a, b));
  }
  /** Edges that aren't part of any seam: touching no neighbor and in no explicit seam. */
  const unsewnEdges = computed(() => {
    const sewn = new Set(placed.value.flatMap((s) => [s.a, s.b]).map(([i, k]) => `${i}:${k}`));
    return o.leaves().flatMap((l, i) =>
      l.poly.flatMap((a, k) => {
        const b = l.poly[(k + 1) % l.poly.length]!;
        return free.value.has(edgeKey(a, b)) && !sewn.has(`${i}:${k}`) ? [[a, b] as [Pt, Pt]] : [];
      }),
    );
  });
  /** The seam whose edge is under p: explicit, or shared with a neighbor (free edges are none). */
  function activeAt(p: Pt): ActiveSeam | null {
    const at = near(p);
    if (!at) return null;
    const same = (x: At) => x[0] === at[0] && x[1] === at[1];
    const k = placed.value.findIndex((s) => same(s.a) || same(s.b));
    if (k >= 0) return { seam: k };
    if (free.value.has(edgeKey(...leafEdge(at)))) return null;
    return { seam: null, leaf: at[0], edge: at[1] };
  }
  /** The piece that faces front in 3D (picked, or the default for a closed shape). */
  const front = computed(() => {
    const leaves = o.leaves();
    if (!leaves.length) return null;
    const f = frontPiece(buildFold(quiltNet(o.quilt(), o.lookup()).net));
    return f === null ? null : leaves[f]!;
  });
  /**
   * Seams, the edge being picked and the one under `hover` (null: none; `pick`: as a pick to sew),
   * the front ring. `active`: that seam stands out (both its edges, glowing) and the others fade.
   * `unsewn`: the edges in no seam stand out, everything else fades.
   */
  function decorate(
    { ctx, px: p }: Decor,
    hover: Pt | null,
    {
      pick = true,
      active = null,
      unsewn = false,
    }: { pick?: boolean; active?: ActiveSeam | null; unsewn?: boolean } = {},
  ) {
    const open = o.open?.() ?? new Set<number>();
    ctx.save();
    if (unsewn) {
      // A veil over the pieces (the canvas's background color, see-through).
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = $q.dark.isActive ? 'rgba(43,43,43,0.7)' : 'rgba(240,240,240,0.7)';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    }
    ctx.lineCap = 'round';
    ctx.font = `bold ${p(13)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const line = ([a, b]: [Pt, Pt], width: number, alpha = 1) => {
      ctx.globalAlpha = alpha;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    };
    for (const m of seamMarks(o.leaves(), o.quilt().epp?.seams ?? [], p(12))) {
      const on = active?.seam === m.n - 1;
      const faded = (!!active || unsewn) && !on;
      ctx.strokeStyle = ctx.fillStyle = open.has(m.n - 1) ? OPEN : m.color;
      ctx.setLineDash(open.has(m.n - 1) && !on ? [p(6), p(4)] : []);
      if (on) line(m.edge, p(14), 0.3); // a glow under it
      line(m.edge, p(on ? 6 : 4), faded ? 0.2 : 1);
      if (m.label) ctx.fillText(String(m.n), m.label[0], m.label[1]);
    }
    ctx.globalAlpha = 1;
    if (unsewn) {
      ctx.strokeStyle = RAW;
      ctx.setLineDash([]);
      for (const e of unsewnEdges.value) {
        line(e, p(14), 0.35);
        line(e, p(5));
      }
      ctx.globalAlpha = 1;
    }
    if (active && active.seam === null) {
      ctx.strokeStyle = HOT;
      ctx.setLineDash([]);
      const e = leafEdge([active.leaf, active.edge]);
      line(e, p(14), 0.3);
      line(e, p(6));
      ctx.globalAlpha = 1;
    }
    const under = hover && pick && !active ? near(hover) : null;
    for (const [e, dash] of [
      [start.value, false],
      [under, true],
    ] as const) {
      if (!e) continue;
      const [a, b] = leafEdge(e);
      ctx.strokeStyle = '#2e7d32';
      ctx.lineWidth = p(5);
      ctx.setLineDash(dash ? [p(6), p(4)] : []);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    const f = front.value;
    if (f) {
      const c = centroid(f.poly);
      ctx.strokeStyle = ctx.fillStyle = '#212121';
      ctx.lineWidth = p(2);
      ctx.beginPath();
      ctx.arc(c[0], c[1], p(9), 0, 2 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(c[0], c[1], p(4), 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.restore();
  }
  return { placed, start, tap, decorate, activeAt };
}
