// Sizing an EPP quilt's Manual cut on the Layout tab's picture (0.9.3 roadmap): drag a side, a
// corner or the middle handle; sides snap to piece corners and edges as Settings say
// (`eppCutSnap`), and an aspect ratio keeps its shape. The pieces it cuts away show faded.
import { computed, ref } from 'vue';
import type { CanvasOverlay } from '@/composables/viewport';
import { cutSnaps, dragCut, type Box, type CutHandle, type CutSnaps } from '@/model/epp/edge';
import { lookupEpp } from '@/model/epp/expand';
import { bbox } from '@/model/epp/geometry';
import { piecePolys, setEdge } from '@/model/epp/quilt-ops';
import type { Quilt } from '@/model/schema/quilt';
import { useLibraryStore } from '@/stores/library';
import { useProjectStore } from '@/stores/project';
import { useSettingsStore } from '@/stores/settings';

/** How near (CSS pixels) a side or handle must be to grab it. */
const GRAB = 10;
const CURSORS: Record<CutHandle, string> = {
  l: 'ew-resize',
  r: 'ew-resize',
  t: 'ns-resize',
  b: 'ns-resize',
  tl: 'nwse-resize',
  br: 'nwse-resize',
  tr: 'nesw-resize',
  bl: 'nesw-resize',
  move: 'move',
};

/** Material's open_with icon (24 × 24), the app's pan arrows. */
const PAN_ARROWS =
  'M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z';
let panArrows: Path2D | undefined;

/** The handle at p (units) within `tol`: a corner, then a side, then the middle. */
export function handleAt(r: Box, p: readonly [number, number], tol: number): CutHandle | null {
  const [x0, y0, x1, y1] = r;
  const inX = p[0] >= x0 - tol && p[0] <= x1 + tol;
  const inY = p[1] >= y0 - tol && p[1] <= y1 + tol;
  const l = inY && Math.abs(p[0] - x0) <= tol;
  const rt = inY && Math.abs(p[0] - x1) <= tol;
  const t = inX && Math.abs(p[1] - y0) <= tol;
  const b = inX && Math.abs(p[1] - y1) <= tol;
  if (t && l) return 'tl';
  if (t && rt) return 'tr';
  if (b && l) return 'bl';
  if (b && rt) return 'br';
  if (l) return 'l';
  if (rt) return 'r';
  if (t) return 't';
  if (b) return 'b';
  const mid = [(x0 + x1) / 2, (y0 + y1) / 2];
  return Math.hypot(p[0] - mid[0]!, p[1] - mid[1]!) <= tol * 1.5 ? 'move' : null;
}

export function useEppCut(quilt: () => Quilt | undefined) {
  const project = useProjectStore();
  const library = useLibraryStore();
  const app = useSettingsStore();
  const lookup = computed(() =>
    lookupEpp(project.doc!.project, quilt()?.epp?.shapes ?? [], library.lookup),
  );
  /** The cut being sized: an EPP quilt's Manual Cut to size (3D has no edge). */
  const cut = computed(() => {
    const q = quilt();
    const l = q?.layout;
    if (l?.style !== 'epp' || l.threeD || l.edge.kind !== 'cut' || !l.edge.manual) return null;
    return { q: q!, unit: l.unit, edge: l.edge };
  });
  let drag: {
    handle: CutHandle;
    start: Box;
    grab: [number, number];
    snaps: CutSnaps;
    reach: number;
    key: string;
  } | null = null;
  let drags = 0;
  /** The handle held (drawn filled; a redraw when let go). */
  const held = ref<CutHandle | null>(null);

  function change(rect: Box, key: string) {
    const c = cut.value;
    if (!c || project.readOnly) return;
    project.change(
      (d) => {
        const k = d.project.quilts.findIndex((x) => x.id === c.q.id);
        if (k >= 0)
          d.project.quilts[k] = setEdge(
            d.project.quilts[k] as Quilt,
            { ...c.edge, rect },
            lookup.value,
          );
      },
      { coalesce: key },
    );
  }

  function decorate(ctx: CanvasRenderingContext2D, px: number) {
    const c = cut.value;
    if (!c) return;
    const [x0, y0, x1, y1] = c.edge.rect.map((v) => v * c.unit) as Box;
    ctx.save();
    ctx.setLineDash([6 * px, 4 * px]);
    ctx.strokeStyle = '#d32f2f';
    ctx.lineWidth = 2 * px;
    ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    ctx.setLineDash([]);
    const [mx, my] = [(x0 + x1) / 2, (y0 + y1) / 2];
    const at: [CutHandle, number, number][] = [
      ['tl', x0, y0],
      ['t', mx, y0],
      ['tr', x1, y0],
      ['r', x1, my],
      ['br', x1, y1],
      ['b', mx, y1],
      ['bl', x0, y1],
      ['l', x0, my],
    ];
    const s = 8 * px;
    ctx.lineWidth = 1.5 * px;
    ctx.strokeStyle = '#b71c1c';
    for (const [h, x, y] of at) {
      ctx.fillStyle = held.value === h ? '#d32f2f' : '#ffffff';
      ctx.fillRect(x - s / 2, y - s / 2, s, s);
      ctx.strokeRect(x - s / 2, y - s / 2, s, s);
    }
    // The middle: a round handle with the pan arrows (open_with, as Drag grid), for moving the cut.
    const moving = held.value === 'move';
    ctx.fillStyle = moving ? '#d32f2f' : '#ffffff';
    ctx.beginPath();
    ctx.arc(mx, my, 12 * px, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    const k = (18 * px) / 24;
    ctx.translate(mx - 12 * k, my - 12 * k);
    ctx.scale(k, k);
    ctx.fillStyle = moving ? '#ffffff' : '#b71c1c';
    ctx.fill((panArrows ??= new Path2D(PAN_ARROWS)));
    ctx.restore();
  }

  const overlay = computed((): CanvasOverlay | undefined => {
    const c = cut.value;
    if (!c) return undefined;
    void held.value;
    const u = c.unit;
    const polys = piecePolys(c.q, lookup.value);
    const b = polys.length ? bbox(polys) : undefined;
    const at = (p: readonly [number, number], px: number) =>
      handleAt(c.edge.rect, [p[0] / u, p[1] / u], (GRAB * px) / u);
    return {
      bounds: b && [b[0] * u, b[1] * u, b[2] * u, b[3] * u],
      decorate,
      claim: (p, px) => {
        const handle = project.readOnly ? null : at(p, px);
        if (!handle) return false;
        drag = {
          handle,
          start: [...c.edge.rect],
          grab: [p[0] / u, p[1] / u],
          snaps: cutSnaps(polys, app.settings.eppCutSnap),
          reach: (GRAB * px) / u,
          key: `epp-cut-${++drags}`,
        };
        held.value = handle;
        return true;
      },
      drag: (p) => {
        const e = cut.value?.edge;
        if (!drag || !e) return;
        const d: [number, number] = [p[0] / u - drag.grab[0], p[1] / u - drag.grab[1]];
        change(
          dragCut(drag.start, drag.handle, d, {
            snaps: drag.snaps,
            reach: drag.reach,
            min: 1,
            ratio: e.ratio,
          }),
          drag.key,
        );
      },
      end: () => {
        drag = null;
        held.value = null;
      },
      cursor: (p, px) => {
        const h = at(p, px);
        return h ? CURSORS[h] : null;
      },
    };
  });

  return { overlay };
}
