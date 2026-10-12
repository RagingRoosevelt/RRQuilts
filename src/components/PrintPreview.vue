<template>
  <!-- On screen: toolbar + sheets scaled to fit. A second, print-only copy lives at the body level so
       printing shows nothing but the sheets. -->
  <Teleport to="body" :disabled="!printOnly">
    <div
      v-if="doc && view"
      ref="root"
      :class="printOnly ? 'print-root' : 'print-preview col scroll'"
    >
      <div v-if="!printOnly" class="row items-center q-pa-sm toolbar" style="gap: 8px">
        <div class="col text-caption text-grey-7">
          {{ sheets.length }} page{{ sheets.length === 1 ? '' : 's' }} · {{ paperLabel }} · print at
          100% scale<template v-if="sheets.some((x) => x.kind === 'templates' || x.kind === 'tile')"
            >, then check the scale square on the template pages</template
          >.
        </div>
        <q-btn color="primary" no-caps icon="print" label="Print" @click="print" />
      </div>

      <div class="sheets" :style="printOnly ? undefined : { zoom: fit }">
        <section
          v-for="(s, i) in sheets"
          :key="i"
          class="sheet"
          :class="{ flow: s.kind === 'rotary' || s.kind === 'yardage' || s.kind === 'credits' }"
          :style="sheetStyle"
        >
          <header class="row items-baseline no-wrap">
            <div class="col" style="min-width: 0">
              <div class="ellipsis">
                <b>{{ view.title }}</b> · {{ view.size }} · {{ s.heading }}
              </div>
              <div v-if="i === 0" class="ellipsis byline">{{ view.byline }}</div>
            </div>
            <div class="text-grey-8">{{ doc.project.name }}</div>
          </header>

          <div class="content">
            <!-- Templates: pieces packed at true size -->
            <svg
              v-if="s.kind === 'templates'"
              :width="`${area[0]}${units}`"
              :height="`${area[1]}${units}`"
              :viewBox="`0 0 ${area[0]} ${area[1]}`"
            >
              <g v-for="p in s.items" :key="p.key" :transform="`translate(${p.x} ${p.y})`">
                <template v-if="p.keyBlock">
                  <path
                    v-for="(d, j) in p.keyBlock.paths"
                    :key="j"
                    :d="d"
                    fill="none"
                    stroke="#000"
                    :stroke-width="stroke"
                  />
                  <text
                    v-for="(l, j) in p.keyBlock.labels"
                    :key="`l${j}`"
                    :x="l.x"
                    :y="l.y + font * 0.6 * 0.35"
                    :font-size="font * 0.6"
                    text-anchor="middle"
                  >
                    {{ l.text }}
                  </text>
                  <text :x="0" :y="p.h + font" :font-size="font * 0.8">Key</text>
                </template>
                <TemplatePiece v-else :piece="p" :look="look" />
              </g>
            </svg>

            <!-- A template too big for one page, one tile per sheet -->
            <svg
              v-else-if="s.kind === 'tile'"
              :width="`${s.tile.w}${units}`"
              :height="`${s.tile.h}${units}`"
              :viewBox="`${s.tile.x} ${s.tile.y} ${s.tile.w} ${s.tile.h}`"
            >
              <TemplatePiece :piece="s.piece" :look="look" />
              <rect
                v-for="(o, j) in s.tile.overlaps"
                :key="j"
                :x="o[0]"
                :y="o[1]"
                :width="o[2]"
                :height="o[3]"
                fill="rgba(0,0,0,0.06)"
                stroke="#999"
                :stroke-width="stroke"
                :stroke-dasharray="`${stroke * 4} ${stroke * 4}`"
              />
            </svg>

            <!-- Rotary cutting chart -->
            <div v-else-if="s.kind === 'rotary'" class="column" style="gap: 10px">
              <div class="text-caption">
                Seam allowance {{ fmt(seam) }} included;
                {{
                  step
                    ? `cut sizes rounded up to the next ${roundingLabel}`
                    : 'cut sizes exact (not rounded)'
                }}. Strips are cut across the usable fabric width ({{ fmt(usableForCuts) }}).
              </div>
              <div v-for="g in s.groups" :key="g.fill" class="avoid-break">
                <div class="row items-center" style="gap: 6px">
                  <span class="chip" :style="{ background: g.css }" />
                  <b>{{ g.name }}</b>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Piece</th>
                      <th>Finished</th>
                      <th>Cut</th>
                      <th>How</th>
                      <th>Pieces</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(l, j) in g.lines" :key="j">
                      <td>{{ KIND_LABEL[l.cut.kind] }}</td>
                      <td>{{ finishedLabel(l.cut) }}</td>
                      <td>{{ l.cut.kind === 'template' ? 'Use template' : cutLabel(l.cut) }}</td>
                      <td>{{ howLabel(l) }}</td>
                      <td>
                        {{ l.count }}
                        <span v-if="l.cut.distorted" class="warn">
                          · size is off the {{ roundingLabel }} grid; rounding distorts it — use
                          templates for accuracy</span
                        >
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Yardage -->
            <div v-else-if="s.kind === 'yardage'" class="column" style="gap: 10px">
              <div class="text-caption">
                {{ widthOption.label }}; rounded up to the next {{ fabricStepLabel }}. Borders are
                cut from strips across the fabric; estimates never come out short.
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Fabric</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="n in s.needs" :key="n.fill">
                    <td>
                      <span class="chip" :style="{ background: fillInfo(n.fill).css }" />
                      {{ fillInfo(n.fill).name }}
                    </td>
                    <td>
                      {{
                        n.fatQuarters !== undefined
                          ? `${n.fatQuarters} fat quarter${n.fatQuarters === 1 ? '' : 's'}`
                          : fabricLabel(n.length)
                      }}
                    </td>
                  </tr>
                  <tr>
                    <td>Backing ({{ fmt(prefs.overhang[units]) }} extra each side, pieced)</td>
                    <td>{{ fabricLabel(s.backing) }}</td>
                  </tr>
                  <tr>
                    <td>
                      Binding ({{ s.binding.strips }} strips × {{ fmt(prefs.bindingWidth[units]) }},
                      straight grain)
                    </td>
                    <td>{{ fabricLabel(s.binding.length) }}</td>
                  </tr>
                </tbody>
              </table>
              <div v-if="widthOption.fatQuarter" class="text-caption">
                Backing and binding use {{ standardWidth.label }} fabric.
              </div>
            </div>

            <!-- A block: picture, size, how many, fabric for all of them, credits -->
            <div v-else-if="s.kind === 'block'" class="column" style="gap: 8px">
              <div class="row no-wrap" style="gap: 16px">
                <svg
                  :width="`${s.w * s.scale}${units}`"
                  :height="`${s.h * s.scale}${units}`"
                  :viewBox="`0 0 ${s.w} ${s.h}`"
                  style="flex: none"
                >
                  <path
                    v-for="(p, j) in s.polys"
                    :key="j"
                    :d="p.d"
                    :fill="prefs.outline ? 'none' : p.css"
                    stroke="#000"
                    :stroke-width="(stroke / s.scale) * 0.6"
                  />
                </svg>
                <div class="column" style="gap: 4px">
                  <div class="text-h6">{{ s.name }}</div>
                  <div>Finished size {{ s.size }}</div>
                  <div>
                    {{ s.count }} block{{ s.count === 1 ? '' : 's' }}
                    <template v-if="s.quilt">planned in “{{ s.quilt }}”</template>
                  </div>
                  <div class="text-caption">
                    {{
                      s.scale >= 0.999
                        ? 'Picture at true size'
                        : `Picture at ${Math.round(s.scale * 100)}%`
                    }}
                  </div>
                </div>
              </div>
              <div class="text-weight-medium">
                Fabric for {{ s.count === 1 ? 'this block' : `all ${s.count} blocks` }}
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Fabric</th>
                    <th>Pieces</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="n in s.needs" :key="n.fill">
                    <td>
                      <span class="chip" :style="{ background: fillInfo(n.fill).css }" />
                      {{ fillInfo(n.fill).name }}
                    </td>
                    <td>{{ s.pieces.get(n.fill) ?? 0 }}</td>
                    <td>
                      {{
                        n.fatQuarters !== undefined
                          ? `${n.fatQuarters} fat quarter${n.fatQuarters === 1 ? '' : 's'}`
                          : fabricLabel(n.length)
                      }}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="text-caption">
                {{ widthOption.label }}; seam allowance {{ fmt(seam) }}; rounded up to the next
                {{ fabricStepLabel }}.
              </div>
              <div class="text-weight-medium">Credits</div>
              <div>{{ s.byline }}</div>
              <ul v-if="s.basedOn.length">
                <li v-for="(c, j) in s.basedOn" :key="j">Based on {{ creditLine(c) }}</li>
              </ul>
            </div>

            <!-- Credits: everyone whose work this builds on (when no block pages carry them) -->
            <div v-else-if="s.kind === 'credits'" class="column" style="gap: 8px">
              <div>
                <b>{{ view.title }}</b> — {{ view.byline }}
              </div>
              <template v-if="view.basedOn.length">
                <div class="text-weight-medium">Based on</div>
                <ul>
                  <li v-for="(c, j) in view.basedOn" :key="j">{{ creditLine(c) }}</li>
                </ul>
              </template>
              <template v-if="view.blocks.length">
                <div class="text-weight-medium">Blocks</div>
                <ul>
                  <li v-for="(b, j) in view.blocks" :key="j">
                    {{ b.name }}<template v-if="b.author"> by {{ b.author }}</template> ·
                    {{ b.license }}
                    <ul v-if="b.basedOn.length">
                      <li v-for="(c, k) in b.basedOn" :key="k">based on {{ creditLine(c) }}</li>
                    </ul>
                  </li>
                </ul>
              </template>
            </div>

            <!-- Pictures -->
            <div v-else-if="s.kind === 'picture'" class="column items-center" style="gap: 6px">
              <svg
                :width="`${s.w * s.scale}${units}`"
                :height="`${s.h * s.scale}${units}`"
                :viewBox="`${s.x0} ${s.y0} ${s.w} ${s.h}`"
              >
                <path
                  v-for="(p, j) in s.polys"
                  :key="j"
                  :d="p.d"
                  :fill="prefs.outline ? 'none' : p.css"
                  stroke="#000"
                  :stroke-width="(stroke / s.scale) * 0.6"
                />
              </svg>
              <div class="text-caption">
                {{ s.scale >= 0.999 ? 'True size' : `Scaled to ${Math.round(s.scale * 100)}%` }} ·
                finished {{ view.size }}
              </div>
              <div v-if="!isBlockKind && view.basedOn.length" class="text-caption">
                Based on {{ view.basedOn.map(creditLine).join('; ') }}
              </div>
            </div>
          </div>

          <footer class="row items-end no-wrap" style="gap: 12px">
            <div class="col credits">{{ view.title }} · {{ view.byline }}</div>
            <!-- Only pages with true-size cutting lines need a scale check. -->
            <div v-if="s.kind === 'templates' || s.kind === 'tile'" class="column items-center">
              <div
                class="scale-square"
                :style="{ width: `${scaleSquare}${units}`, height: `${scaleSquare}${units}` }"
              />
              <div class="scale-label">{{ fmt(scaleSquare) }} square</div>
            </div>
          </footer>
        </section>
      </div>
      <PrintPreview v-if="!printOnly" :kind="kind" :id="id" :target="target" print-only />
    </div>
    <div v-else-if="!printOnly" class="q-pa-md text-grey-7">Nothing to print here.</div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue';
import TemplatePiece from '@/components/TemplatePiece.vue';
import { resolveColoring } from '@/model/coloring';
import {
  authorOf,
  blockLock,
  blocksByOthers,
  effectiveLicense,
  licenseName,
  priorCredits,
  quiltLock,
} from '@/model/credits';
import { pathToSegs, flattenLoop, type Pt } from '@/model/geometry/path';
import { generateSlots } from '@/model/layout/slots';
import { fmtFabric, fmtLen } from '@/model/print/format';
import { pack, tiles } from '@/model/print/pack';
import {
  blockPieces,
  quiltPieces,
  templates,
  type Piece,
  type PlacedPiece,
} from '@/model/print/pieces';
import { bounds, offset, rotate, shapeKey, snugRotation } from '@/model/print/polygon';
import {
  FABRIC_STEPS,
  PAPERS,
  ROUNDINGS,
  WIDTHS,
  pick,
  printPrefs,
  type PrintTarget,
} from '@/model/print/prefs';
import { cutPlan, type Cut, type CutKind, type CutLine } from '@/model/print/rotary';
import { backing, binding, fabricNeeds } from '@/model/print/yardage';
import type { Block } from '@/model/schema/block';
import type { Quilt } from '@/model/schema/quilt';
import type { Credit } from '@/model/schema/shared';
import { useLibraryStore } from '@/stores/library';
import { useProjectStore } from '@/stores/project';
import { useSettingsStore } from '@/stores/settings';

const props = defineProps<{
  kind: 'block' | 'quilt';
  id: string;
  target?: PrintTarget | undefined;
  /** The copy that prints (hidden on screen). */
  printOnly?: boolean;
}>();
const project = useProjectStore();
const library = useLibraryStore();
const app = useSettingsStore();

const doc = computed(() => project.doc);
const units = computed(() => doc.value?.units ?? 'in');
const prefs = computed(() => printPrefs(app.settings.print));
const paper = computed(() => pick(PAPERS, prefs.value.paper[units.value]));
/** Millimeters per project unit. */
const mm = computed(() => (units.value === 'in' ? 25.4 : 10));
const fmt = (x: number) => fmtLen(x, units.value);
const seam = computed(() => prefs.value.seam[units.value]);
const step = computed(() => prefs.value.rounding[units.value]);
const roundingLabel = computed(
  () => ROUNDINGS[units.value].find((r) => r.value === step.value)?.label.toLowerCase() ?? '',
);
const widthOption = computed(() => pick(WIDTHS[units.value], prefs.value.width[units.value]));
const standardWidth = computed(() => WIDTHS[units.value][0]!);
const usableForCuts = computed(() =>
  widthOption.value.fatQuarter ? standardWidth.value.usable : widthOption.value.usable,
);
const fabricStepLabel = computed(
  () =>
    FABRIC_STEPS[units.value].find((f) => f.value === prefs.value.fabricStep[units.value])?.label ??
    '',
);
const fabricLabel = (x: number) => fmtFabric(x, units.value);

// Paper and the area left for content (project units).
const MARGIN_MM = 12.7;
const HEADER_MM = 14;
const FOOTER_MM = 34;
const paperMm = computed(() => {
  const [w, h] = paper.value.mm;
  return prefs.value.landscape ? [h, w] : [w, h];
});
const paperLabel = computed(
  () => `${paper.value.label}, ${prefs.value.landscape ? 'landscape' : 'portrait'}`,
);
const area = computed<[number, number]>(() => [
  (paperMm.value[0]! - 2 * MARGIN_MM) / mm.value,
  (paperMm.value[1]! - 2 * MARGIN_MM - HEADER_MM - FOOTER_MM) / mm.value,
]);
const sheetStyle = computed(() => ({
  width: `${paperMm.value[0]}mm`,
  minHeight: `${paperMm.value[1]}mm`,
  padding: `${MARGIN_MM}mm`,
}));
const LINE_MM = { thin: 0.25, medium: 0.5, thick: 0.8 } as const;
const stroke = computed(() => LINE_MM[prefs.value.lineWeight] / mm.value);
const font = computed(() => 3.6 / mm.value);
const scaleSquare = computed(() => (units.value === 'in' ? 1 : 2));
const look = computed(() => ({
  stroke: stroke.value,
  font: font.value,
  cutLine: prefs.value.cutLine,
  sewLine: prefs.value.sewLine,
  grain: prefs.value.grain,
}));

// Colors by fill key.
const fillInfo = (key: string) => {
  const colors = [...library.items.colors, ...(doc.value?.project.palette.colors ?? [])];
  if (key.startsWith('color:')) {
    const c = colors.find((x) => `color:${x.id}` === key);
    if (c) return { name: c.notecard.name, css: `rgb(${c.rgb.join(',')})` };
  }
  if (key.startsWith('fabric:')) {
    const f = doc.value?.project.palette.fabrics.find((x) => `fabric:${x.id}` === key);
    if (f) return { name: f.notecard.name, css: `rgb(${f.average.join(',')})` };
  }
  return { name: 'No color', css: '#fff' };
};

// What's being printed.
const KIND_LABEL: Record<CutKind, string> = {
  square: 'Square',
  rect: 'Rectangle',
  hst: 'Half-square triangle',
  qst: 'Quarter-square triangle',
  template: 'Other shape',
};
const finishedLabel = (c: Cut) =>
  c.kind === 'hst'
    ? `${fmt(c.finished[0])} legs`
    : c.kind === 'qst'
      ? `${fmt(c.finished[0])} long side`
      : `${fmt(c.finished[0])} × ${fmt(c.finished[1])}`;
const cutLabel = (c: Cut) =>
  c.kind === 'square' || c.kind === 'hst' || c.kind === 'qst'
    ? `${fmt(c.cut[0])} squares`
    : `${fmt(c.cut[0])} × ${fmt(c.cut[1])}`;
function howLabel(l: CutLine) {
  if (l.cut.kind === 'template') return `${l.count} from templates`;
  const strips = l.pieced
    ? `${l.strips} strip${l.strips === 1 ? '' : 's'} ${fmt(l.stripWidth)} wide, joined end to end`
    : `${l.strips} strip${l.strips === 1 ? '' : 's'} ${fmt(l.stripWidth)} wide → ${l.units} cut${l.units === 1 ? '' : 's'}`;
  const cutUp =
    l.cut.kind === 'hst'
      ? ', each cut once diagonally'
      : l.cut.kind === 'qst'
        ? ', each cut twice diagonally'
        : '';
  return strips + cutUp;
}

interface View {
  title: string;
  size: string;
  /** "By Jane · CC BY-SA 4.0" */
  byline: string;
  /** Earlier work this is based on (origin first). */
  basedOn: Credit[];
  /** Quilts: blocks made by others (or based on others' work), with their chains. */
  blocks: { name: string; author?: string | undefined; license: string; basedOn: Credit[] }[];
  pieces: Piece[];
  /** Picture: outlines (+ fills) in their own coordinates. */
  picture: { d: string; css: string }[];
  pictureBox: readonly [number, number, number, number];
  /** Templates: block, its finished size, and pieces of one block for the key. */
  block?: Block;
  blockSize?: [number, number];
  keyPieces?: Piece[];
}

const d = (poly: Pt[]) => `M${poly.map((p) => `${p[0]} ${p[1]}`).join('L')}Z`;
const sizeLabel = (w: number, h: number) => `${fmt(w)} × ${fmt(h)}`;

const view = computed<View | undefined>(() => {
  const dd = doc.value;
  if (!dd) return undefined;
  const id = props.id;
  if (props.kind === 'quilt') {
    const quilt = dd.project.quilts.find((q) => q.id === id);
    if (!quilt) return undefined;
    const g = generateSlots(quilt.layout, quilt.borders);
    const pieces = quiltPieces(dd, quilt);
    const [x0, y0, x1, y1] = g.bounds;
    return {
      title: quilt.notecard.name,
      size: sizeLabel(x1 - x0, y1 - y0),
      byline: `By ${quilt.author ?? 'anonymous'} · ${licenseName(effectiveLicense(quilt, dd, quiltLock(dd, quilt)))}`,
      basedOn: priorCredits(quilt),
      blocks: blocksByOthers(dd, quilt, app.settings.author).map((u) => ({
        name: u.block.notecard.name,
        author: u.own ? undefined : u.author,
        license: licenseName(u.license),
        basedOn: u.credits,
      })),
      pieces,
      picture: [
        ...g.slots.map((s) => ({
          d: d(flattenLoop(pathToSegs(s.outline, [1, 1]), 0.01)),
          css: '#fff',
        })),
        ...pieces.map((p) => ({ d: d(p.poly), css: fillInfo(p.fill).css })),
      ],
      pictureBox: g.bounds,
    };
  }
  const block = dd.project.blocks.find((b) => b.id === id);
  if (!block) return undefined;
  const quilt = dd.project.quilts.find((q) => q.id === props.target?.quilt);
  let size: [number, number] = [...block.size];
  let pieces: Piece[];
  let keyColoring =
    block.colorings.find((c) => c.id === props.target?.coloring) ?? block.colorings[0];
  if (quilt) {
    const g = generateSlots(quilt.layout, quilt.borders);
    const slot = g.slots.find((s) => quilt.layers[0].slots[s.id]?.block === block.id);
    if (slot) {
      size = [slot.transform[0], slot.transform[3]];
      keyColoring = resolveColoring(
        quilt.colorings[quilt.layers[0].slots[slot.id]!.coloring],
        block,
      ) as typeof keyColoring;
    }
    pieces = quiltPieces(dd, quilt, block.id);
  } else {
    const q = props.target?.size;
    if (q && q.every((n) => n > 0)) size = [q[0], q[1]];
    pieces = blockPieces(block, size, keyColoring);
  }
  const one = blockPieces(block, size, keyColoring);
  return {
    title: block.notecard.name,
    size: sizeLabel(...size) + (quilt ? ` · counts for “${quilt.notecard.name}”` : ''),
    byline: `By ${authorOf(block) ?? 'anonymous'} · ${licenseName(effectiveLicense(block, dd, blockLock(block)))}`,
    basedOn: priorCredits(block),
    blocks: [],
    pieces,
    picture: one.map((p) => ({ d: d(p.poly), css: fillInfo(p.fill).css })),
    pictureBox: [0, 0, size[0], size[1]],
    block,
    blockSize: size,
    keyPieces: one,
  };
});

// Templates: each distinct shape, cut line around it, rotated snug, packed on pages.
function templateItems(pieces: Piece[]) {
  const list = templates(pieces);
  const mirror = prefs.value.mirror;
  const items: (PlacedPiece & { w: number; h: number })[] = list.map((t) => {
    const cut = offset(t.poly, seam.value);
    let rad = snugRotation(cut);
    const turn = (poly: Pt[]) => {
      const r = rotate(poly, rad);
      return mirror ? r.map(([x, y]): Pt => [-x, y]) : r;
    };
    let c = turn(cut);
    let [x0, y0, x1, y1] = bounds(c);
    // Prefer lying flat.
    if (y1 - y0 > x1 - x0) {
      rad += Math.PI / 2;
      c = turn(cut);
      [x0, y0, x1, y1] = bounds(c);
    }
    const shift = ([x, y]: Pt): Pt => [x - x0, y - y0];
    const sew = turn(t.poly).map(shift);
    const grainDir: Pt = [Math.cos(rad) * (mirror ? -1 : 1), Math.sin(rad)];
    const cx = sew.reduce((a, p) => a + p[0], 0) / sew.length;
    const cy = sew.reduce((a, p) => a + p[1], 0) / sew.length;
    const counts = [...t.counts.entries()].map(([fill, n]) => `${n} ${fillInfo(fill).name}`);
    return {
      key: t.letter,
      letter: t.letter,
      cut: c.map(shift),
      sew,
      center: [cx, cy] as Pt,
      grain: grainDir,
      grainLength: Math.min(x1 - x0, y1 - y0) * 0.5,
      note: `Cut ${counts.join(', ')}`,
      x: 0,
      y: 0,
      w: x1 - x0,
      h: y1 - y0,
    };
  });
  return items;
}

type Sheet =
  | {
      kind: 'templates';
      heading: string;
      items: (PlacedPiece & { keyBlock?: KeyBlock; h: number })[];
    }
  | {
      kind: 'tile';
      heading: string;
      piece: PlacedPiece;
      tile: {
        x: number;
        y: number;
        w: number;
        h: number;
        overlaps: [number, number, number, number][];
      };
    }
  | {
      kind: 'rotary';
      heading: string;
      groups: { fill: string; name: string; css: string; lines: CutLine[] }[];
    }
  | {
      kind: 'yardage';
      heading: string;
      needs: ReturnType<typeof fabricNeeds>;
      backing: number;
      binding: { strips: number; length: number };
    }
  | {
      kind: 'credits';
      heading: string;
    }
  | {
      kind: 'block';
      heading: string;
      name: string;
      size: string;
      count: number;
      quilt?: string | undefined;
      polys: { d: string; css: string }[];
      w: number;
      h: number;
      scale: number;
      needs: ReturnType<typeof fabricNeeds>;
      /** Pieces to cut, by fill. */
      pieces: Map<string, number>;
      byline: string;
      basedOn: Credit[];
    }
  | {
      kind: 'picture';
      heading: string;
      polys: { d: string; css: string }[];
      x0: number;
      y0: number;
      w: number;
      h: number;
      scale: number;
    };
interface KeyBlock {
  paths: string[];
  labels: { x: number; y: number; text: string }[];
}

const sheets = computed<Sheet[]>(() => {
  const v = view.value;
  if (!v) return [];
  const isBlock = props.kind === 'block';
  const wanted: string[] = isBlock ? prefs.value.blockSections : prefs.value.quiltSections;
  const out: Sheet[] = [];
  const [aw, ah] = area.value;

  // Always in the same order, whatever order the boxes were ticked in.
  const ORDER = isBlock
    ? ['templates', 'rotary', 'picture']
    : ['picture', 'blocks', 'yardage', 'rotary', 'templates'];
  for (const section of ORDER.filter((x) => wanted.includes(x))) {
    if (section === 'picture' && isBlock && v.block) {
      const quilt = doc.value!.project.quilts.find((q) => q.id === props.target?.quilt);
      out.push(
        blockPage(
          v.block,
          v.blockSize!,
          v.keyPieces!,
          v.pieces,
          quilt ? count(quilt, v.block.id) : 1,
          quilt?.notecard.name,
        ),
      );
      continue;
    }
    if (section === 'blocks' && !isBlock) {
      for (const u of quiltBlocks()) {
        out.push(
          blockPage(
            u.block,
            u.size,
            blockPieces(u.block, u.size, u.coloring),
            quiltPieces(doc.value!, u.quilt, u.block.id),
            count(u.quilt, u.block.id),
            undefined,
          ),
        );
      }
      continue;
    }
    if (section === 'picture') {
      const [x0, y0, x1, y1] = v.pictureBox;
      const w = x1 - x0;
      const h = y1 - y0 + 0.0001;
      const scale = Math.min(1, aw / w, (ah - 2 * font.value) / h);
      out.push({
        kind: 'picture',
        heading: isBlock ? 'Block' : 'Quilt',
        polys: v.picture,
        x0,
        y0,
        w,
        h,
        scale,
      });
    }
    if (section === 'templates' && isBlock && v.block && v.keyPieces) {
      out.push(
        ...templateSheets({
          pieces: v.pieces,
          size: v.blockSize!,
          keyPieces: v.keyPieces,
          heading: 'Templates',
        }),
      );
    }
    if (section === 'templates' && !isBlock) {
      for (const u of quiltBlocks()) {
        out.push(
          ...templateSheets({
            pieces: quiltPieces(doc.value!, u.quilt, u.block.id),
            size: u.size,
            keyPieces: blockPieces(u.block, u.size, u.coloring),
            heading: `Templates: ${u.block.notecard.name}`,
          }),
        );
      }
    }
    if (section === 'rotary') {
      const lines = cutPlan(v.pieces, seam.value, step.value, usableForCuts.value);
      const fills = [...new Set(lines.map((l) => l.fill))];
      out.push({
        kind: 'rotary',
        heading: 'Rotary cutting',
        groups: fills.map((fill) => ({
          fill,
          ...fillInfo(fill),
          lines: lines.filter((l) => l.fill === fill),
        })),
      });
    }
    if (section === 'yardage' && !isBlock) {
      const fabric = widthOption.value;
      const lines = cutPlan(v.pieces, seam.value, step.value, fabric.usable);
      const fstep = prefs.value.fabricStep[units.value];
      const [x0, y0, x1, y1] = v.pictureBox;
      const plain = standardWidth.value.usable;
      out.push({
        kind: 'yardage',
        heading: 'Yardage estimate',
        needs: fabricNeeds(lines, fabric, fstep),
        backing: backing(x1 - x0, y1 - y0, prefs.value.overhang[units.value], plain, fstep),
        binding: binding(
          x1 - x0,
          y1 - y0,
          prefs.value.bindingWidth[units.value],
          units.value === 'in' ? 10 : 25,
          plain,
          fstep,
        ),
      });
    }
  }
  // Block pages carry each block's credits; without them, everyone goes on a Credits page.
  const blockPages = out.some((x) => x.kind === 'block');
  if (out.length && !blockPages && (v.basedOn.length || v.blocks.length))
    out.push({ kind: 'credits', heading: 'Credits' });
  return out;
});

/** Blocks placed in the quilt being printed, in layout order: size and coloring of the first. */
function quiltBlocks() {
  const dd = doc.value!;
  const quilt = dd.project.quilts.find((q) => q.id === props.id);
  if (!quilt) return [];
  const seen = new Set<string>();
  return generateSlots(quilt.layout, quilt.borders).slots.flatMap((slot) => {
    const content = quilt.layers[0].slots[slot.id];
    const block = content && dd.project.blocks.find((b) => b.id === content.block);
    if (!content || !block || seen.has(block.id) || block.notecard.tags?.includes('system'))
      return [];
    seen.add(block.id);
    const size: [number, number] = [slot.transform[0], slot.transform[3]];
    return [
      { quilt, block, size, coloring: resolveColoring(quilt.colorings[content.coloring], block) },
    ];
  });
}

/** Template pages for one block: a lettered key, then each distinct piece packed at true size. */
function templateSheets(src: {
  pieces: Piece[];
  size: [number, number];
  keyPieces: Piece[];
  heading: string;
}): Sheet[] {
  const out: Sheet[] = [];
  const [aw, ah] = area.value;
  const gap = units.value === 'in' ? 0.25 : 0.6;
  const items = templateItems(src.pieces);
  // Key: the block with each patch's letter, about a quarter of the page wide.
  const keyScale = Math.min(aw, ah) / 4 / Math.max(...src.size);
  const letters = new Map(templates(src.keyPieces).map((t) => [shapeKey(t.poly), t.letter]));
  const keyItem = {
    key: 'key',
    letter: '',
    cut: [],
    sew: [],
    center: [0, 0] as Pt,
    grain: [1, 0] as Pt,
    grainLength: 0,
    note: '',
    x: 0,
    y: 0,
    w: src.size[0] * keyScale,
    h: src.size[1] * keyScale + font.value * 1.5,
    keyBlock: {
      paths: src.keyPieces.map((p) => d(p.poly.map(([x, y]): Pt => [x * keyScale, y * keyScale]))),
      labels: src.keyPieces.map((p) => {
        const c = p.poly.reduce((a, q) => [a[0] + q[0], a[1] + q[1]], [0, 0]);
        const t = templates([p])[0]!;
        return {
          x: (c[0] / p.poly.length) * keyScale,
          y: (c[1] / p.poly.length) * keyScale,
          text: letters.get(shapeKey(t.poly)) ?? '',
        };
      }),
    },
  };
  const all: (PlacedPiece & { h: number; keyBlock?: KeyBlock })[] = [keyItem, ...items];
  const { pages, oversize } = pack(
    all.map((it) => ({ w: it.w, h: it.h + font.value * 2.4 })),
    aw,
    ah,
    gap,
  );
  for (const page of pages) {
    out.push({
      kind: 'templates',
      heading: src.heading,
      items: page.map((pl) => {
        const it = all[pl.index]!;
        // Packing may stand a piece up: turn it 90° about its box.
        if (!pl.turned || it.keyBlock) return { ...it, x: pl.x, y: pl.y };
        const t = ([x, y]: Pt): Pt => [it.h - y, x];
        return {
          ...it,
          cut: it.cut.map(t),
          sew: it.sew.map(t),
          center: t(it.center),
          grain: [-it.grain[1], it.grain[0]] as Pt,
          x: pl.x,
          y: pl.y,
          w: it.h,
          h: it.w,
        };
      }),
    });
  }
  const overlap = units.value === 'in' ? 0.5 : 1.25;
  for (const i of oversize) {
    const it = all[i]!;
    const t = tiles(it.w, it.h, aw, ah, overlap);
    for (const tile of t.tiles) {
      const overlaps: [number, number, number, number][] = [];
      if (tile.col > 0) overlaps.push([tile.x, tile.y, overlap, ah]);
      if (tile.row > 0) overlaps.push([tile.x, tile.y, aw, overlap]);
      out.push({
        kind: 'tile',
        heading: `Template ${it.letter}, part ${tile.row * t.cols + tile.col + 1} of ${t.cols * t.rows} (row ${tile.row + 1}, column ${tile.col + 1}; shaded strips overlap the previous part)`,
        piece: it,
        tile: { x: tile.x, y: tile.y, w: aw, h: ah, overlaps },
      });
    }
  }
  return out;
}

const isBlockKind = computed(() => props.kind === 'block');
const count = (quilt: Quilt, blockId: string) =>
  Object.values(quilt.layers[0].slots).filter((c) => c.block === blockId).length;

/** One block's page: picture (up to half the page), fabric for every placement, credits. */
function blockPage(
  block: Block,
  size: [number, number],
  one: Piece[],
  all: Piece[],
  n: number,
  quiltName: string | undefined,
): Sheet {
  const [aw, ah] = area.value;
  const fabric = widthOption.value;
  const lines = cutPlan(all, seam.value, step.value, fabric.usable);
  const pieces = new Map<string, number>();
  for (const p of all) pieces.set(p.fill, (pieces.get(p.fill) ?? 0) + 1);
  const dd = doc.value!;
  return {
    kind: 'block',
    heading: `Block: ${block.notecard.name}`,
    name: block.notecard.name,
    size: sizeLabel(...size),
    count: n,
    quilt: quiltName,
    polys: one.map((p) => ({ d: d(p.poly), css: fillInfo(p.fill).css })),
    w: size[0],
    h: size[1],
    scale: Math.min(1, (aw * 0.6) / size[0], (ah * 0.5) / size[1]),
    needs: fabricNeeds(lines, fabric, prefs.value.fabricStep[units.value]),
    pieces,
    byline: `By ${authorOf(block) ?? 'anonymous'} · ${licenseName(effectiveLicense(block, dd, blockLock(block)))}`,
    basedOn: priorCredits(block),
  };
}
const creditLine = (c: Credit) =>
  [
    `${c.name ?? 'Earlier work'} by ${c.author ?? 'anonymous'}`,
    c.license && licenseName(c.license),
    c.library,
  ]
    .filter(Boolean)
    .join(' · ');

// The browser prints at the chosen paper size with no margins of its own.
let pageStyle: HTMLStyleElement | null = null;
onMounted(() => {
  if (!props.printOnly) return;
  pageStyle = document.createElement('style');
  document.head.append(pageStyle);
  watchEffect(() => {
    pageStyle!.textContent = `@page { size: ${paperMm.value[0]}mm ${paperMm.value[1]}mm; margin: 0; }`;
  });
});
onBeforeUnmount(() => pageStyle?.remove());
const print = () => window.print();

// On screen, sheets shrink to fit the space (CSS px are 96 per inch).
const root = ref<HTMLElement>();
const width = ref(0);
const observer = new ResizeObserver(([e]) => (width.value = e?.contentRect.width ?? 0));
onMounted(() => root.value && observer.observe(root.value));
onBeforeUnmount(() => observer.disconnect());
const fit = computed(() =>
  width.value ? Math.min(1, (width.value - 32) / ((paperMm.value[0]! * 96) / 25.4)) : 1,
);
</script>

<style scoped>
/* Sheets never push on the panels around the preview; it scrolls instead. */
.print-preview {
  min-width: 0;
}
.toolbar {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #fff;
  border-bottom: 1px solid rgba(128, 128, 128, 0.25);
}
:global(.body--dark) .toolbar {
  background: #1d1d1d;
}
.sheets {
  background: #9e9e9e;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  overflow-x: auto;
}
.sheet {
  background: #fff;
  color: #000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  font-size: 10pt;
}
.sheet header {
  height: 12mm;
  border-bottom: 0.3mm solid #000;
  margin-bottom: 2mm;
}
.content {
  flex: 1;
}
.sheet footer {
  height: 32mm;
  border-top: 0.3mm solid #000;
  padding-top: 2mm;
  font-size: 8pt;
}
.credits {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}
.byline {
  font-size: 9pt;
}
.scale-square {
  border: 0.3mm solid #000;
  box-sizing: border-box;
}
.scale-label {
  font-size: 7pt;
}
table {
  border-collapse: collapse;
  width: 100%;
  font-size: 9pt;
}
th,
td {
  border: 0.2mm solid #888;
  padding: 1mm 2mm;
  text-align: left;
  vertical-align: top;
}
.chip {
  display: inline-block;
  width: 4mm;
  height: 4mm;
  border: 0.2mm solid #000;
  vertical-align: middle;
}
.warn {
  color: #b00020;
}
.avoid-break {
  break-inside: avoid;
}

@media print {
  .sheets {
    background: none;
    padding: 0;
    gap: 0;
  }
  .sheet {
    box-shadow: none;
    break-after: page;
  }
  .sheet:not(.flow) {
    height: v-bind('`${paperMm[1]}mm`');
    overflow: hidden;
  }
}
</style>

<style>
/* Only the print copy prints; the app (and the on-screen preview) don't. */
.print-root {
  display: none;
}
@media print {
  #q-app {
    display: none !important;
  }
  .print-root {
    display: block;
  }
  body {
    background: #fff !important;
  }
}
</style>
