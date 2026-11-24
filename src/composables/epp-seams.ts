// 3D EPP seams on a 2D canvas (spec 027 User Story 7): the Design tab's Seam tool and the net in
// the 3D assembly tab. Tap a free edge, then an equal edge of another piece, to sew them; tap a
// numbered edge to unpick its seam. Draws each seam's edges in its color with its number (red when
// the fold can't close it), the edge being picked, and the front piece ringed.
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
  /** The piece that faces front in 3D (picked, or the default for a closed shape). */
  const front = computed(() => {
    const leaves = o.leaves();
    if (!leaves.length) return null;
    const f = frontPiece(buildFold(quiltNet(o.quilt(), o.lookup()).net));
    return f === null ? null : leaves[f]!;
  });
  /** Seams, the edge being picked and the one under `hover` (null: none), the front ring. */
  function decorate({ ctx, px: p }: Decor, hover: Pt | null) {
    const open = o.open?.() ?? new Set<number>();
    ctx.save();
    ctx.lineCap = 'round';
    ctx.font = `bold ${p(13)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const m of seamMarks(o.leaves(), o.quilt().epp?.seams ?? [], p(12))) {
      const [a, b] = m.edge;
      ctx.strokeStyle = ctx.fillStyle = open.has(m.n - 1) ? OPEN : m.color;
      ctx.lineWidth = p(4);
      ctx.setLineDash(open.has(m.n - 1) ? [p(6), p(4)] : []);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
      if (m.label) ctx.fillText(String(m.n), m.label[0], m.label[1]);
    }
    const under = hover ? near(hover) : null;
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
  return { placed, start, tap, decorate };
}
