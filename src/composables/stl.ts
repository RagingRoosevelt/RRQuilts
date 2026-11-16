// 3D-printed templates (spec 027 stretch goal; owner, 2026-11-13): the templates a workbench's
// 3D Print tab (or a library preview) offers, the picked one's solid, and its STL download. Settings
// are the print preferences, shared with the Print tab: a rosette's 1U length, plus `stl` (paper or
// fabric, trim points, the build). The seam allowance is the project's (owner, 2026-11-14): EPP for
// shapes, rosettes and EPP quilts, standard piecing for block and quilt pieces. An EPP quilt's own 1U
// wins.
import { computed, reactive, ref, watch } from 'vue';
import { useBlockPrintSize } from '@/composables/block-print-size';
import { useProjectSeams } from '@/composables/seams';
import { expandAll, lookupEpp, rosetteLocal, type EppLookup, type Leaf } from '@/model/epp/expand';
import type { Pt } from '@/model/geometry/path';
import {
  blockPieces,
  quiltPieces,
  quiltRosettes,
  templates,
  type Piece,
} from '@/model/print/pieces';
import { bounds, offset, rotate, snugRotation } from '@/model/print/polygon';
import { printPrefs, type PrintPrefs } from '@/model/print/prefs';
import { buildTemplate, isConvex, stlBytes, stlLength } from '@/model/print/stl';
import type { Block } from '@/model/schema/block';
import type { EppShape } from '@/model/schema/epp';
import type { RrqDoc, Units } from '@/model/schema/project';
import { download } from '@/storage/files';
import { useLibraryStore } from '@/stores/library';
import { useProjectStore } from '@/stores/project';
import { useSettingsStore } from '@/stores/settings';

export type StlKind = 'shape' | 'rosette' | 'block' | 'quilt';
export interface StlItem {
  key: string;
  label: string;
  /** Finished outline in project units, as drawn (y down). */
  poly: Pt[];
  /** EPP pieces: the edge (scale × 1U), written `Edge:`. Others are written `Size: w × h`. */
  edge?: number;
  convex: boolean;
}

const sizeOf = (poly: Pt[]) => {
  const [x0, y0, x1, y1] = bounds(poly);
  return [x1 - x0, y1 - y0] as const;
};

/** Each distinct shape and scale among EPP pieces (a mirror image is the same template, flipped). */
function eppItems(leaves: readonly Leaf[], lookup: EppLookup, unit: number): StlItem[] {
  const out = new Map<string, StlItem>();
  for (const l of leaves) {
    const key = `${l.shape}:${l.scale}`;
    const s = out.has(key) ? undefined : lookup.shape(l.shape);
    if (!s) continue;
    // Internal shapes (made inside a rosette or quilt) have no name.
    const name = 'notecard' in s ? (s as EppShape).notecard.name : `Shape ${out.size + 1}`;
    const k = l.scale * unit;
    const poly = s.outline.map(([x, y]): Pt => [x * k, y * k]);
    out.set(key, {
      key,
      label: l.scale > 1 ? `${name} ${l.scale}U` : name,
      poly,
      edge: k,
      convex: isConvex(poly),
    });
  }
  return [...out.values()];
}

/** Distinct pieces (the Print tab's templates), each turned snug, named by letter and size. */
function pieceItems(pieces: Piece[], units: Units, prefix = ''): StlItem[] {
  return templates(pieces).map((t) => {
    const poly = rotate(t.poly, snugRotation(t.poly));
    const [w, h] = sizeOf(poly);
    return {
      key: prefix + t.letter,
      label: `${prefix}${t.letter} · ${stlLength(w, units)} × ${stlLength(h, units)}`,
      poly,
      convex: isConvex(poly),
    };
  });
}

export interface StlTarget {
  kind: StlKind;
  id: string;
  /** Blocks: the document the block is in (a library block's view), and the block as shown (a data
   *  block's picked variant). */
  doc?: RrqDoc;
  block?: Block;
}

export function useStl(target: () => StlTarget | null) {
  const project = useProjectStore();
  const library = useLibraryStore();
  const app = useSettingsStore();
  const prefs = computed(() => printPrefs(app.settings.print));
  const kind = computed(() => target()?.kind);
  const units = computed<Units>(() => project.doc?.units ?? app.settings.units);
  const p = computed(() => project.doc?.project);
  const quilt = computed(() =>
    kind.value === 'quilt' ? p.value?.quilts.find((q) => q.id === target()!.id) : undefined,
  );
  const eppQuilt = computed(() =>
    quilt.value?.layout.style === 'epp'
      ? { q: quilt.value, layout: quilt.value.layout }
      : undefined,
  );
  const lookup = computed(() =>
    lookupEpp(p.value ?? {}, eppQuilt.value?.q.epp?.shapes ?? [], library.lookup),
  );
  /** A shape preview's size in U (whole sizes, as in the app). */
  const nU = ref(1);
  const blockSize = useBlockPrintSize(
    () => target()?.id ?? '',
    () => kind.value === 'block',
    () => target()?.doc,
  );
  /** 1U: an EPP quilt's own, else the print setting a rosette prints at. */
  const unit = computed(() => eppQuilt.value?.layout.unit ?? prefs.value.rosetteUnit[units.value]);
  /** EPP pieces (a shape, a rosette, an EPP quilt's, a block quilt's rosette patch) take the
   *  project's EPP seam allowance. */
  const epp = computed(
    () =>
      kind.value === 'shape' ||
      kind.value === 'rosette' ||
      !!eppQuilt.value ||
      item.value?.edge !== undefined,
  );
  const seamKind = computed(() => (epp.value ? 'epp' : 'piecing'));
  const projectSeams = useProjectSeams();
  const seam = computed(() => projectSeams.seams.value[seamKind.value]);

  const title = computed(() => {
    const t = target();
    if (!t) return '';
    const item =
      t.kind === 'shape'
        ? (p.value?.eppShapes?.find((s) => s.id === t.id) ?? library.lookup.eppShape?.(t.id))
        : t.kind === 'rosette'
          ? lookup.value.rosette(t.id)
          : t.kind === 'block'
            ? blockSize.block.value
            : quilt.value;
    return item?.notecard.name ?? '';
  });

  const items = computed<StlItem[]>(() => {
    const t = target();
    if (!t) return [];
    if (t.kind === 'shape') {
      const s = p.value?.eppShapes?.find((x) => x.id === t.id) ?? library.lookup.eppShape?.(t.id);
      if (!s) return [];
      const k = nU.value * unit.value;
      const poly = s.outline.map(([x, y]): Pt => [x * k, y * k]);
      return [{ key: s.id, label: s.notecard.name, poly, edge: k, convex: isConvex(poly) }];
    }
    if (t.kind === 'rosette') {
      const r = lookup.value.rosette(t.id);
      return r ? eppItems(rosetteLocal(r, lookup.value), lookup.value, unit.value) : [];
    }
    if (t.kind === 'block') {
      const b = t.block ?? blockSize.block.value;
      return b ? pieceItems(blockPieces(b, blockSize.size.value), units.value) : [];
    }
    const e = eppQuilt.value;
    if (e) {
      const u = e.layout.unit;
      const closing = (e.q.epp?.closing ?? []).map((c): Piece => ({
        poly: c.outline.map(([x, y]): Pt => [x * u, y * u]),
        curved: false,
        fill: 'none',
        marks: [],
      }));
      return [
        ...eppItems(expandAll(e.q.epp?.pieces ?? [], lookup.value), lookup.value, u),
        ...pieceItems(closing, units.value, 'Closing '),
      ];
    }
    if (!quilt.value || !project.doc) return [];
    // A block quilt's rosettes (spec 027 FR-015) print as EPP templates, each shape at the 1U it's
    // placed at; the other pieces as block pieces.
    const epp = new Map<string, StlItem>();
    for (const { rosette, unit: u } of quiltRosettes(project.doc, quilt.value)) {
      const r = lookup.value.rosette(rosette);
      if (!r) continue;
      for (const it of eppItems(rosetteLocal(r, lookup.value), lookup.value, u)) {
        const key = `${it.key}:${it.edge!.toFixed(6)}`;
        if (!epp.has(key)) epp.set(key, { ...it, key });
      }
    }
    // The same shape at two sizes: say which.
    const named = [...epp.values()];
    const twice = (it: StlItem) => named.filter((x) => x.label === it.label).length > 1;
    return [
      ...named.map((it) =>
        twice(it) ? { ...it, label: `${it.label} · ${stlLength(it.edge!, units.value)}` } : it,
      ),
      ...pieceItems(
        quiltPieces(project.doc, quilt.value).filter((x) => !x.epp),
        units.value,
      ),
    ];
  });

  const picked = ref(0);
  watch(
    () => target()?.id,
    () => (picked.value = 0),
  );
  const item = computed(() => items.value[Math.min(picked.value, items.value.length - 1)]);
  const opts = computed(() => prefs.value.stl);
  /** The picked piece, y up. */
  const flat = computed(() => item.value?.poly.map(([x, y]): Pt => [x, -y]));

  const result = computed(() => {
    const it = item.value;
    if (!it || !flat.value) return null;
    const { fabric, trim, ...build } = opts.value;
    const u = units.value;
    const mm = u === 'in' ? 25.4 : 10;
    const outline = fabric ? offset(flat.value, seam.value, trim) : flat.value;
    const [w, h] = sizeOf(it.poly);
    const lines = [
      it.edge !== undefined
        ? `Edge: ${stlLength(it.edge, u)}`
        : `Size: ${stlLength(w, u)} × ${stlLength(h, u)}`,
      fabric ? `SA: ${stlLength(seam.value, u)}` : 'SA: 0',
    ];
    // Owner: 6 mm text per inch of edge (a piece's shorter side when it has no edge).
    const nominal = (it.edge ?? Math.min(w, h)) * mm;
    return buildTemplate(
      outline.map(([x, y]): Pt => [x * mm, y * mm]),
      build,
      lines,
      (6 * nominal) / 25.4,
    );
  });
  /** Trimming only changes pieces with corners under 90° (it adds a point per trimmed corner). */
  const canTrim = computed(
    () =>
      !!flat.value &&
      offset(flat.value, seam.value, true).length !== offset(flat.value, seam.value, false).length,
  );

  const set = (patch: Partial<PrintPrefs['stl']>) =>
    (app.settings.print = { ...app.settings.print, stl: { ...opts.value, ...patch } });
  const setPer = (key: 'rosetteUnit', v: number) =>
    (app.settings.print = {
      ...app.settings.print,
      [key]: { ...prefs.value[key], [units.value]: v },
    });

  function save() {
    const mesh = result.value?.mesh;
    const it = item.value;
    if (!mesh || !it) return;
    const name = [title.value, it.label, opts.value.fabric ? 'fabric' : 'paper'].join(' ');
    download(name, new Uint8Array(stlBytes(mesh, name)), 'stl');
  }

  return reactive({
    kind,
    units,
    title,
    items,
    picked,
    pick: (i: number) => void (picked.value = i),
    item,
    opts,
    set,
    seam,
    /** An EPP quilt's own 1U: shown, not set here. */
    fromQuilt: computed(() => !!eppQuilt.value),
    /** The project's seam allowance (EPP or standard piecing), set here as in the Print tab. */
    setSeam: (v: number) => projectSeams.set(seamKind.value, v),
    canSetSeam: projectSeams.canSet,
    epp,
    unit,
    setUnit: (v: number) => setPer('rosetteUnit', v),
    nU,
    setNU: (n: number) => void (nU.value = n),
    blockSize,
    setBlockSize: (v: string) => void (blockSize.sizeSource.value = v),
    setCustom: (k: 0 | 1, v: number) => {
      const c = blockSize.custom.value;
      blockSize.custom.value = k ? [c[0], v] : [v, c[1]];
    },
    result,
    canTrim,
    save,
  });
}
export type Stl = ReturnType<typeof useStl>;
