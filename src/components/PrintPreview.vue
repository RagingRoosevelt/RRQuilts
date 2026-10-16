<template>
  <!-- On screen: toolbar + sheets scaled to fit. A second, print-only copy lives at the body level so
       printing shows nothing but the sheets. -->
  <Teleport to="body" :disabled="!printOnly">
    <div
      v-if="doc && view"
      ref="root"
      :class="printOnly ? 'print-root' : 'print-preview col scroll'"
    >
      <!-- Fabric images for printed shapes (spec 014), tiled at their real size. -->
      <svg
        v-if="fabricPatterns.length"
        class="pattern-defs"
        width="0"
        height="0"
        aria-hidden="true"
      >
        <defs>
          <pattern
            v-for="p in fabricPatterns"
            :id="p.id"
            :key="p.id"
            patternUnits="userSpaceOnUse"
            :width="p.w"
            :height="p.h"
          >
            <image :href="p.url" :width="p.w" :height="p.h" preserveAspectRatio="none" />
          </pattern>
        </defs>
      </svg>
      <div v-if="!printOnly" class="row items-center q-pa-sm toolbar" style="gap: 8px">
        <div class="col text-caption text-grey-7">
          {{ sheets.length }} page{{ sheets.length === 1 ? '' : 's' }} · {{ paperLabel }} · print at
          100% scale<template
            v-if="
              sheets.some(
                (x) => x.kind === 'picture' || (x.kind === 'templates' && prefs.squareOnTemplate),
              )
            "
            >, then check a scale square with a ruler</template
          >.
        </div>
        <q-btn color="primary" no-caps icon="print" label="Print" @click="print" />
      </div>

      <div class="sheets" :style="printOnly ? undefined : { zoom: scale }">
        <!-- Measuring copies (hidden) of the flowing pages give the heights for splitting them. -->
        <section
          v-for="{ s, i, measure } in entries"
          :key="measure ? `m${i}` : i"
          class="sheet"
          :class="{ flow: !measure && !s.show && FLOW.has(s.kind), measure }"
          :style="measure ? measureStyle : sheetStyle"
          :data-i="measure ? i : undefined"
        >
          <header v-if="!measure" class="row items-baseline no-wrap">
            <div class="col" style="min-width: 0">
              <div class="ellipsis">
                <b>{{ view.title }}</b> · {{ view.size }} · {{ s.heading }}
                <HelpLink v-if="SHEET_HELP[s.kind]" v-bind="SHEET_HELP[s.kind]!" />
              </div>
              <div v-if="i === 0" class="ellipsis byline">{{ view.byline }}</div>
            </div>
            <div class="text-grey-8">{{ doc.project.name }}</div>
          </header>

          <div class="content">
            <!-- Templates: pieces packed at true size -->
            <svg
              class="bleed"
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
                  <text :x="0" :y="p.keyBlock.height + font" :font-size="font * 0.8">Key</text>
                  <text
                    v-if="fabricLegend"
                    :x="0"
                    :y="p.keyBlock.height + font * 2.1"
                    :font-size="font * 0.7"
                  >
                    Fabrics: {{ fabricLegend }}
                  </text>
                </template>
                <TemplatePiece v-else :piece="p" :look="look" :fmt="fmt" />
              </g>
            </svg>

            <!-- A template too big for one page, one tile per sheet -->
            <svg
              v-else-if="s.kind === 'tile'"
              :width="`${s.tile.w}${units}`"
              :height="`${s.tile.h}${units}`"
              :viewBox="`${s.tile.x} ${s.tile.y} ${s.tile.w} ${s.tile.h}`"
            >
              <TemplatePiece :piece="s.piece" :look="look" :fmt="fmt" />
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

            <!-- Mitered strip ends at true size: cut line, sewing lines, where stitching stops -->
            <svg
              v-else-if="s.kind === 'miter'"
              :width="`${area[0]}${units}`"
              :height="`${area[1]}${units}`"
              :viewBox="`0 0 ${area[0]} ${area[1]}`"
            >
              <g v-for="(g, j) in s.guides" :key="j" :transform="`translate(${g.x} ${g.y})`">
                <g :transform="g.right ? `translate(${g.len} 0) scale(-1 1)` : undefined">
                  <path :d="g.edge" fill="none" stroke="#000" :stroke-width="stroke" />
                  <path
                    :d="`M${g.len} ${seam}H${miterA}L${miterA + g.w} ${seam + g.w}H${g.len}`"
                    fill="none"
                    stroke="#000"
                    :stroke-width="stroke * 0.7"
                    :stroke-dasharray="`${stroke * 3} ${stroke * 3}`"
                  />
                  <circle :cx="miterA + g.w" :cy="seam + g.w" :r="stroke * 4" fill="#000" />
                  <path
                    :d="`M${g.len} 0V${g.cut}`"
                    stroke="#999"
                    :stroke-width="stroke"
                    :stroke-dasharray="`${stroke * 4} ${stroke * 4}`"
                  />
                </g>
                <text
                  :x="g.right ? (g.len - g.cut) / 2 : (g.len + g.cut) / 2"
                  :y="seam + font * 0.9"
                  :font-size="font * 0.7"
                  text-anchor="middle"
                >
                  outer edge
                </text>
                <text
                  :x="g.right ? (g.len - g.cut) / 2 : (g.len + g.cut) / 2"
                  :y="seam + g.w - font * 0.4"
                  :font-size="font * 0.7"
                  text-anchor="middle"
                >
                  inner edge (sewn to the quilt)
                </text>
                <text :x="0" :y="g.cut + font * 1.2" :font-size="font * 0.8">
                  {{ g.right ? 'Right' : 'Left' }} end · strips cut {{ fmt(g.cut) }} wide ({{
                    fmt(g.w)
                  }}
                  finished)
                </text>
                <text :x="0" :y="g.cut + font * 2.2" :font-size="font * 0.7">
                  Outer edges together; cut on the solid 45° line. Stitching ends at the dot.
                </text>
              </g>
            </svg>

            <!-- Rotary cutting chart -->
            <div v-else-if="s.kind === 'rotary'" class="column" style="gap: 10px">
              <div v-if="on(s, 'cap')" data-m="cap" class="text-caption">
                Seam allowance {{ fmt(seam) }} included;
                {{
                  step
                    ? `cut sizes rounded up to the next ${roundingLabel}`
                    : 'cut sizes exact (not rounded)'
                }}. Strips are cut across the usable fabric width ({{ fmt(usableForCuts) }}).
              </div>
              <template v-for="g in s.groups" :key="g.fill">
                <div v-if="on(s, `g:${g.fill}`)" :data-m="`g:${g.fill}`">
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
                        <td>
                          {{ splitApprox(finishedLabel(l.cut))[0] }}
                          <div v-if="splitApprox(finishedLabel(l.cut))[1]" class="approx">
                            (~ {{ splitApprox(finishedLabel(l.cut))[1] }})
                          </div>
                        </td>
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
              </template>
            </div>

            <!-- Yardage -->
            <div v-else-if="s.kind === 'yardage'" class="column" style="gap: 10px">
              <div v-if="on(s, 'cap')" data-m="cap" class="text-caption">
                {{ widthsLabel }}; rounded up to the next {{ fabricStepLabel }}. Borders are cut
                from strips across the fabric; estimates never come out short.
              </div>
              <table v-if="on(s, 'y>')">
                <thead data-m="y>">
                  <tr>
                    <th>Fabric</th>
                    <th v-for="c in s.cols" :key="c.opt.id">{{ shortWidth(c.opt) }}</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="fill in s.fills" :key="fill">
                    <tr v-if="on(s, `y>${fill}`)" :data-m="`y>${fill}`">
                      <td>
                        <span class="chip" :style="{ background: fillInfo(fill).css }" />
                        {{ fillInfo(fill).name }}
                      </td>
                      <td v-for="c in s.cols" :key="c.opt.id">{{ amount(c.needs.get(fill)) }}</td>
                    </tr>
                  </template>
                </tbody>
                <tbody v-if="on(s, 'y>extra')" data-m="y>extra">
                  <tr>
                    <td>Backing ({{ fmt(prefs.overhang[units]) }} extra each side, pieced)</td>
                    <td v-for="c in s.cols" :key="c.opt.id">
                      {{ c.backing === undefined ? '—' : fabricLabel(c.backing) }}
                    </td>
                  </tr>
                  <tr>
                    <td>Binding ({{ fmt(prefs.bindingWidth[units]) }} strips, straight grain)</td>
                    <td v-for="c in s.cols" :key="c.opt.id">
                      {{
                        c.binding
                          ? `${fabricLabel(c.binding.length)} (${c.binding.strips} strips)`
                          : '—'
                      }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- A block: picture, size, how many, fabric for all of them, credits -->
            <div v-else-if="s.kind === 'block'" class="column" style="gap: 8px">
              <div v-if="on(s, 'top')" data-m="top" class="column" style="gap: 8px">
                <div class="row no-wrap" style="gap: 16px">
                  <!-- Fabrics this block uses -->
                  <div v-if="pillsBeside(s)" class="column" style="gap: 4px; flex: none">
                    <span v-for="f in s.fabrics" :key="f.n" class="pill text-caption">
                      <span class="chip" :style="{ background: f.css }" /> {{ f.n }} · {{ f.name }}
                    </span>
                  </div>
                  <svg
                    class="bleed"
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
                    <!-- Template key -->
                    <text
                      v-for="(l, j) in s.labels"
                      :key="`k${j}`"
                      :x="l.x"
                      :y="l.y + (font / s.scale) * 0.3"
                      :font-size="(font / s.scale) * 0.8"
                      text-anchor="middle"
                      :fill="l.light ? '#fff' : '#000'"
                      :stroke="l.light ? '#000' : '#fff'"
                      :stroke-width="(font / s.scale) * 0.8 * 0.22"
                      paint-order="stroke"
                      stroke-linejoin="round"
                    >
                      {{ l.text }}
                    </text>
                  </svg>
                  <div class="column" style="gap: 4px">
                    <div class="text-h6">{{ s.name }}</div>
                    <div>Finished size {{ s.size }}</div>
                    <div v-if="s.labels.length" class="text-caption">
                      Letters are the template codes.
                    </div>
                    <div>
                      {{ s.count }} block{{ s.count === 1 ? '' : 's' }}
                      <template v-if="s.quilt">planned in “{{ s.quilt }}”</template>
                    </div>
                    <div class="text-caption">
                      {{
                        s.scale >= 0.999 ? 'True size' : `Scaled to ${Math.round(s.scale * 100)}%`
                      }}
                    </div>
                  </div>
                </div>
              </div>
              <div
                v-if="s.fabrics.length && !pillsBeside(s) && on(s, 'pills')"
                data-m="pills"
                class="row"
                style="gap: 4px"
              >
                <span v-for="f in s.fabrics" :key="f.n" class="pill text-caption">
                  <span class="chip" :style="{ background: f.css }" /> {{ f.n }} · {{ f.name }}
                </span>
              </div>
              <div v-if="on(s, 'fab')" data-m="fab" class="text-weight-medium">
                Fabric for {{ s.count === 1 ? 'this block' : `all ${s.count} blocks` }}
              </div>
              <table v-if="on(s, 'f>')">
                <thead data-m="f>">
                  <tr>
                    <th>Fabric</th>
                    <th>Pieces</th>
                    <th v-for="c in s.cols" :key="c.opt.id">{{ shortWidth(c.opt) }}</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="fill in s.fills" :key="fill">
                    <tr v-if="on(s, `f>${fill}`)" :data-m="`f>${fill}`">
                      <td>
                        <span class="chip" :style="{ background: fillInfo(fill).css }" />
                        {{ fillInfo(fill).name }}
                      </td>
                      <td>{{ s.pieces.get(fill) ?? 0 }}</td>
                      <td v-for="c in s.cols" :key="c.opt.id">{{ amount(c.needs.get(fill)) }}</td>
                    </tr>
                  </template>
                </tbody>
              </table>
              <div v-if="on(s, 'cap')" data-m="cap" class="text-caption">
                {{ widthsLabel }}; seam allowance {{ fmt(seam) }}; rounded up to the next
                {{ fabricStepLabel }}.
              </div>
              <div v-if="s.notes && on(s, 'notes')" data-m="notes" class="column" style="gap: 8px">
                <div class="text-weight-medium">Notes</div>
                <div class="notes">{{ s.notes }}</div>
              </div>
              <div v-if="on(s, 'credits')" data-m="credits" class="column" style="gap: 8px">
                <div class="text-weight-medium">Credits</div>
                <div>{{ s.byline }} <AuthorSocial :name="s.author" /></div>
                <ul v-if="s.basedOn.length">
                  <li v-for="(c, j) in s.basedOn" :key="j">
                    Based on {{ creditLine(c) }} <AuthorSocial :name="c.author" />
                  </li>
                </ul>
              </div>
            </div>

            <!-- Credits: everyone whose work this builds on (when no block pages carry them) -->
            <div v-else-if="s.kind === 'credits'" class="column" style="gap: 8px">
              <div v-if="on(s, 'title')" data-m="title">
                <b>{{ view.title }}</b> — {{ view.byline }} <AuthorSocial :name="view.author" />
              </div>
              <template v-if="view.basedOn.length && on(s, 'bo>')">
                <div class="text-weight-medium" data-m="bo>">Based on</div>
                <ul>
                  <template v-for="(c, j) in view.basedOn" :key="j">
                    <li v-if="on(s, `bo>${j}`)" :data-m="`bo>${j}`">
                      {{ creditLine(c) }} <AuthorSocial :name="c.author" />
                    </li>
                  </template>
                </ul>
              </template>
              <template v-if="view.blocks.length && on(s, 'bl>')">
                <div class="text-weight-medium" data-m="bl>">Blocks</div>
                <ul>
                  <template v-for="(b, j) in view.blocks" :key="j">
                    <li v-if="on(s, `bl>${j}`)" :data-m="`bl>${j}`">
                      {{ b.name
                      }}<template v-if="b.author">
                        by {{ b.author }} <AuthorSocial :name="b.author"
                      /></template>
                      · {{ b.license }}
                      <ul v-if="b.basedOn.length">
                        <li v-for="(c, k) in b.basedOn" :key="k">
                          based on {{ creditLine(c) }} <AuthorSocial :name="c.author" />
                        </li>
                      </ul>
                    </li>
                  </template>
                </ul>
              </template>
            </div>

            <!-- Pictures -->
            <div v-else-if="s.kind === 'picture'" class="column items-center" style="gap: 6px">
              <svg
                class="bleed"
                :width="`${s.w * s.scale}${units}`"
                :height="`${s.h * s.scale}${units}`"
                :viewBox="`${s.x0} ${s.y0} ${s.w} ${s.h}`"
              >
                <!-- Whole blocks trimmed at the edge show only what's inside it. -->
                <clipPath v-if="s.edge" :id="`edge${i}`"><path :d="s.edge" /></clipPath>
                <g :clip-path="s.edge ? `url(#edge${i})` : undefined">
                  <path
                    v-for="(p, j) in s.polys"
                    :key="j"
                    :d="p.d"
                    :fill="prefs.outline ? 'none' : p.css"
                    stroke="#000"
                    :stroke-width="(stroke / s.scale) * 0.6"
                  />
                </g>
                <path
                  v-if="s.edge"
                  :d="s.edge"
                  fill="none"
                  stroke="#000"
                  :stroke-width="(stroke / s.scale) * 1.5"
                />
              </svg>
              <div class="text-caption">
                {{ s.scale >= 0.999 ? 'True size' : `Scaled to ${Math.round(s.scale * 100)}%` }} ·
                finished {{ view.size }}
              </div>
              <div v-if="s.trim" class="text-caption">
                Pieces at the edge are cut larger. Trim the quilt top to the marked edge after
                piecing.
              </div>
              <div v-if="!isBlockKind && view.basedOn.length" class="text-caption">
                Based on {{ view.basedOn.map(creditLine).join('; ') }}
              </div>
              <div v-if="view.notes" class="notes self-stretch">{{ view.notes }}</div>
            </div>
          </div>

          <!-- The quilt picture page checks the printer's scale once for the whole printout. -->
          <div v-if="s.kind === 'picture'" class="column items-end">
            <div
              class="scale-square"
              :style="{ width: `${scaleSquare}${units}`, height: `${scaleSquare}${units}` }"
            />
            <div class="scale-label">{{ fmt(scaleSquare) }} square</div>
          </div>

          <div v-if="measure" class="ruler" :style="{ height: `${area[1]}${units}` }" />
          <footer v-else class="row no-wrap" style="gap: 12px">
            <div class="col ellipsis">{{ view.title }} · {{ view.byline }}</div>
            <div>{{ i + 1 }} of {{ sheets.length }}</div>
          </footer>
        </section>
      </div>
      <PrintPreview
        v-if="!printOnly"
        :kind="kind"
        :id="id"
        :target="target"
        :measured="measuredHere"
        print-only
      />
    </div>
    <div v-else-if="!printOnly" class="q-pa-md text-grey-7">Nothing to print here.</div>
  </Teleport>
</template>

<script setup lang="ts">
import { fabricUrl, retryMissing } from '@/render/fabric-images';
import { QIcon } from 'quasar';
import {
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  watchEffect,
  type PropType,
} from 'vue';
import HelpLink from '@/components/HelpLink.vue';
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
import { pathToSegs, flattenLoop, sub, type Pt } from '@/model/geometry/path';
import { generateFor } from '@/model/layout/slots';
import { fmtFabric, fmtLen, splitApprox } from '@/model/print/format';
import { pack, pillWidth, splitFlow, tiles, wrapPills } from '@/model/print/pack';
import {
  blockPieces,
  quiltPieces,
  templates,
  type Piece,
  type PlacedPiece,
} from '@/model/print/pieces';
import { bounds, offset, roomiest, rotate, shapeKey, snugRotation } from '@/model/print/polygon';
import {
  FABRIC_STEPS,
  PAPERS,
  ROUNDINGS,
  WIDTHS,
  type WidthOption,
  pick,
  printPrefs,
  type PrintTarget,
} from '@/model/print/prefs';
import { cutFor, cutPlan, type Cut, type CutKind, type CutLine } from '@/model/print/rotary';
import { PLAIN_BLOCK } from '@/model/plain';
import {
  BINDING_EXTRA,
  backing,
  binding,
  fabricNeeds,
  type FabricNeed,
} from '@/model/print/yardage';
import type { Block } from '@/model/schema/block';
import type { Quilt } from '@/model/schema/quilt';
import type { Credit } from '@/model/schema/shared';
import { useEditorStore } from '@/stores/editor';
import { useLibraryStore } from '@/stores/library';
import { useProjectStore } from '@/stores/project';
import { creditSocial, isKnownSite, socialIcon, type Social } from '@/settings/socials';
import { useSettingsStore } from '@/stores/settings';

const props = defineProps<{
  kind: 'block' | 'quilt';
  id: string;
  target?: PrintTarget | undefined;
  /** The copy that prints (hidden on screen). */
  printOnly?: boolean;
  /** Measured heights of the flowing pages (the print copy takes the screen copy's). */
  measured?: Record<number, { key: string; cost: number }[]> | undefined;
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
/** A mitered strip's cut edge reaches this far past the finished corner. */
const miterA = computed(() => seam.value * (1 + Math.SQRT2));
const step = computed(() => prefs.value.rounding[units.value]);
const slack = computed(() => prefs.value.miterSlack[units.value]);
const roundingLabel = computed(
  () => ROUNDINGS[units.value].find((r) => r.value === step.value)?.label.toLowerCase() ?? '',
);
/** Every fabric width gets a yardage column; rotary strips are cut across the standard one. */
const widths = computed(() => WIDTHS[units.value]);
const usableForCuts = computed(() => widths.value[0]!.usable);
const shortWidth = (w: WidthOption) => w.label.split(' (')[0];
const widthsLabel = computed(() => widths.value.map((w) => w.label).join(', '));
const amount = (n?: FabricNeed) =>
  !n
    ? '—'
    : n.fatQuarters !== undefined
      ? `${n.fatQuarters} fat quarter${n.fatQuarters === 1 ? '' : 's'}`
      : fabricLabel(n.length);
/** Fabric needs per width, by fill. */
function needCols(pieces: Piece[]) {
  const fstep = prefs.value.fabricStep[units.value];
  const cols = widths.value.map((opt) => {
    const lines = cutPlan(pieces, seam.value, step.value, opt.usable, slack.value);
    return { opt, needs: new Map(fabricNeeds(lines, opt, fstep).map((n) => [n.fill, n])) };
  });
  return { cols, fills: [...cols[0]!.needs.keys()] };
}
const fabricStepLabel = computed(
  () =>
    FABRIC_STEPS[units.value].find((f) => f.value === prefs.value.fabricStep[units.value])?.label ??
    '',
);
const fabricLabel = (x: number) => fmtFabric(x, units.value);

// Paper and the area left for content (project units).
const marginMm = computed(() => prefs.value.margin[units.value] * mm.value);
const HEADER_MM = 14;
const FOOTER_MM = 8;
const paperMm = computed(() => {
  const [w, h] = paper.value.mm;
  return prefs.value.landscape ? [h, w] : [w, h];
});
const paperLabel = computed(
  () => `${paper.value.label}, ${prefs.value.landscape ? 'landscape' : 'portrait'}`,
);
const area = computed<[number, number]>(() => [
  (paperMm.value[0]! - 2 * marginMm.value) / mm.value,
  (paperMm.value[1]! - 2 * marginMm.value - HEADER_MM - FOOTER_MM) / mm.value,
]);
const sheetStyle = computed(() => ({
  width: `${paperMm.value[0]}mm`,
  minHeight: `${paperMm.value[1]}mm`,
  padding: `${marginMm.value}mm`,
}));
const LINE_MM = { thin: 0.25, medium: 0.5, thick: 0.8 } as const;
const stroke = computed(() => LINE_MM[prefs.value.lineWeight] / mm.value);
const font = computed(() => 3.6 / mm.value);
const scaleSquare = computed(() => (units.value === 'in' ? 1 : 2));
const look = computed(() => ({
  stroke: stroke.value,
  font: font.value,
  cutLine: prefs.value.cutLine,
  // Without seam allowance the cutting line is the sewing line.
  sewLine: prefs.value.seamAllowance ? prefs.value.sewLine : 'none',
  grain: prefs.value.grain,
  shade: prefs.value.shadeSeam && prefs.value.seamAllowance,
  marks: prefs.value.curveMarks,
  /** Mark length: across the seam allowance (or a short tick without one). */
  markLength: prefs.value.seamAllowance ? seam.value : seam.value / 2,
  labels: prefs.value.labels,
  tint: prefs.value.tint,
  square: prefs.value.squareOnTemplate ? SQUARES[units.value] : undefined,
  seam: prefs.value.seamAllowance && prefs.value.seamLabel ? seam.value : 0,
  seamText: `SA = ${fmt(seam.value)}`,
}));
/** Scale squares on templates: the largest that fits, `big` on pieces at least `bigAt` a side. */
const SQUARES = {
  in: { sizes: [1, 0.5, 0.25], big: 2, bigAt: 6 },
  cm: { sizes: [2, 1, 0.5], big: 5, bigAt: 15 },
};

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
/**
 * SVG fill for a printed shape (spec 014): a fabric prints as its image tiled at true size (the
 * largest image on the device), else as its average color.
 */
const shapeFill = (key: string) => {
  const p = fabricPatterns.value.find((x) => x.key === key);
  return p ? `url(#${p.id})` : fillInfo(key).css;
};
const fabricPatterns = computed(() =>
  (doc.value?.project.palette.fabrics ?? []).flatMap((f) => {
    const url = fabricUrl(f, 1024) ?? fabricUrl(f, 512) ?? fabricUrl(f, 256);
    return url
      ? [
          {
            key: `fabric:${f.id}`,
            // Each copy (on screen, print-only) has its own ids: one copy is hidden when printing.
            id: `rrq-${props.printOnly ? 'p' : 's'}-fabric-${f.id.replace(/[^a-z0-9-]/gi, '_')}`,
            url,
            w: f.size[0],
            h: f.size[1],
          },
        ]
      : [];
  }),
);

// What's being printed.
const KIND_LABEL: Record<CutKind, string> = {
  square: 'Square',
  rect: 'Rectangle',
  hst: 'Half-square triangle',
  qst: 'Quarter-square triangle',
  miter: 'Mitered strip',
  template: 'Other shape',
};
const finishedLabel = (c: Cut) =>
  c.kind === 'hst'
    ? `${fmt(c.finished[0])} legs`
    : c.kind === 'qst'
      ? `${fmt(c.finished[0])} long side`
      : c.kind === 'miter'
        ? `${fmt(c.finished[0])} long edge × ${fmt(c.finished[1])}`
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
        : l.cut.kind === 'miter'
          ? slack.value
            ? `, ${fmt(slack.value)} extra; sew on, then trim both ends at 45° (see the corner guide)`
            : ', both ends trimmed at 45° (see the corner guide)'
          : '';
  return strips + cutUp;
}

interface View {
  title: string;
  size: string;
  /** "By Jane · CC BY-SA 4.0" */
  byline: string;
  /** The byline's author (for their social in the credits). */
  author?: string | undefined;
  notes?: string | undefined;
  /** Earlier work this is based on (origin first). */
  basedOn: Credit[];
  /** Quilts: blocks made by others (or based on others' work), with their chains. */
  blocks: { name: string; author?: string | undefined; license: string; basedOn: Credit[] }[];
  pieces: Piece[];
  /** Picture: outlines (+ fills) in their own coordinates. */
  picture: { d: string; css: string }[];
  pictureBox: readonly [number, number, number, number];
  /** Quilts: the outer edge (pieces are clipped to it) and whether to trim to it after piecing. */
  edge?: Pt[];
  trim?: boolean;
  /** Templates: block, its finished size, and pieces of one block for the key. */
  block?: Block;
  blockSize?: [number, number];
  keyPieces?: Piece[];
}

const perimeter = (poly: Pt[]) =>
  poly.reduce((s, p, i) => s + Math.hypot(...sub(poly[(i + 1) % poly.length]!, p)), 0);
const d = (poly: Pt[]) => `M${poly.map((p) => `${p[0]} ${p[1]}`).join('L')}Z`;
const sizeLabel = (w: number, h: number) => `${fmt(w)} × ${fmt(h)}`;

const view = computed<View | undefined>(() => {
  const dd = doc.value;
  if (!dd) return undefined;
  const id = props.id;
  if (props.kind === 'quilt') {
    const quilt = dd.project.quilts.find((q) => q.id === id);
    if (!quilt) return undefined;
    const g = generateFor(quilt);
    const pieces = quiltPieces(dd, quilt);
    const [x0, y0, x1, y1] = g.bounds;
    return {
      title: quilt.notecard.name,
      size: sizeLabel(x1 - x0, y1 - y0),
      byline: `By ${quilt.author ?? 'anonymous'} · ${licenseName(effectiveLicense(quilt, dd, quiltLock(dd, quilt)))}`,
      author: quilt.author,
      basedOn: priorCredits(quilt),
      notes: quilt.notecard.notes,
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
        ...pieces.map((p) => ({ d: d(p.shown ?? p.poly), css: shapeFill(p.fill) })),
      ],
      pictureBox: g.bounds,
      edge: flattenLoop(pathToSegs(g.edge, [1, 1]), 0.01),
      trim: g.trim,
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
    const g = generateFor(quilt);
    const slot = g.slots.find((s) => quilt.layers[0].slots[s.id]?.block === block.id);
    if (slot) {
      size = slot.size;
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
    author: authorOf(block),
    basedOn: priorCredits(block),
    notes: block.notecard.notes,
    blocks: [],
    pieces,
    picture: one.map((p) => ({ d: d(p.poly), css: shapeFill(p.fill) })),
    pictureBox: [0, 0, size[0], size[1]],
    block,
    blockSize: size,
    keyPieces: one,
  };
});

// Templates: each distinct shape, cut line around it, rotated snug, packed on pages.
function templateItems(pieces: Piece[], prefix: string) {
  const { mirror, seamAllowance, trimPoints, tint, labels } = prefs.value;
  // Tinted or color-keyed: one template per fabric.
  const list = templates(pieces, prefix).flatMap((t) =>
    (tint || labels.color) && t.counts.size > 1
      ? [...t.counts].map(([fill, n]) => ({ ...t, counts: new Map([[fill, n]]) }))
      : [t],
  );
  const items: (PlacedPiece & { w: number; h: number })[] = list.map((t) => {
    const cut = seamAllowance ? offset(t.poly, seam.value, trimPoints) : t.poly;
    let rad = snugRotation(cut);
    const turnVec = ([x, y]: Pt): Pt => {
      const [rx, ry] = rotate([[x, y]], rad)[0]!;
      return mirror ? [-rx, ry] : [rx, ry];
    };
    const turn = (poly: Pt[]) => poly.map(turnVec);
    let c = turn(cut);
    let [x0, y0, x1, y1] = bounds(c);
    // Prefer lying flat.
    if (y1 - y0 > (x1 - x0) * (1 + 1e-6)) {
      rad += Math.PI / 2;
      c = turn(cut);
      [x0, y0, x1, y1] = bounds(c);
    }
    const shift = ([x, y]: Pt): Pt => [x - x0, y - y0];
    const sew = turn(t.poly).map(shift);
    const grainDir: Pt = [Math.cos(rad) * (mirror ? -1 : 1), Math.sin(rad)];
    const spot = roomiest(sew);
    const fills = [...t.counts.keys()];
    const counts = [...t.counts.entries()].map(([fill, n]) => `${n} ${fillInfo(fill).name}`);
    return {
      key: `${t.letter}|${fills.join()}`,
      letter: fills.length === 1 ? code(t.letter, fills[0]!) : t.letter,
      cut: c.map(shift),
      sew,
      center: spot.p,
      room: spot.r,
      grain: grainDir,
      grainLength: Math.min(x1 - x0, y1 - y0) * 0.5,
      // Fabric pills (color key off) carry the per-fabric counts; the note keeps the total.
      note: prefs.value.labels.color
        ? `Cut ${counts.join(', ')}`
        : `Cut ${[...t.counts.values()].reduce((a, b) => a + b, 0)}`,
      size: finishedLabel(cutFor({ poly: t.poly, curved: t.curved, fill: '', marks: [] }, 0, 0)),
      tint: fills.length === 1 && fills[0] !== 'none' ? fillInfo(fills[0]!).css : undefined,
      marks: t.marks.map((m) => ({ p: shift(turnVec(m.p)), n: turnVec(m.n) })),
      fabrics: fills
        .filter((f) => fabricNos.value.has(f))
        .map((f) => {
          const n = fabricNos.value.get(f)!;
          const info = fillInfo(f);
          return { n, ...info, pill: `${n} · ${info.name} ×${t.counts.get(f)}` };
        }),
      x: 0,
      y: 0,
      w: x1 - x0,
      h: y1 - y0,
    };
  });
  return items;
}

type Sheet = (
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
      fills: string[];
      cols: (NeedCol & { backing?: number; binding?: { strips: number; length: number } })[];
    }
  | {
      kind: 'credits';
      heading: string;
    }
  | {
      kind: 'miter';
      heading: string;
      guides: MiterGuide[];
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
      fills: string[];
      cols: NeedCol[];
      /** Pieces to cut, by fill. */
      pieces: Map<string, number>;
      byline: string;
      author?: string | undefined;
      basedOn: Credit[];
      notes?: string | undefined;
      /** Template codes on the picture (the template key). */
      labels: { x: number; y: number; text: string; light: boolean }[];
      /** Fabric numbers this block uses (tinted codes). */
      fabrics: { n: number; name: string; css: string }[];
    }
  | {
      kind: 'picture';
      heading: string;
      polys: { d: string; css: string }[];
      edge?: string | undefined;
      trim?: boolean | undefined;
      x0: number;
      y0: number;
      w: number;
      h: number;
      scale: number;
    }
) & {
  /** A part of a split page: the pieces on it. */
  show?: Set<string>;
};
interface NeedCol {
  opt: WidthOption;
  needs: Map<string, FabricNeed>;
}

/** True-size end of a mitered strip: finished width `w`, cut width `cut`, drawn `len` long. */
interface MiterGuide {
  x: number;
  y: number;
  w: number;
  cut: number;
  len: number;
  /** The strip's other end. */
  right: boolean;
  /** Cutting line (open at the far end); the outer tip is cut off with trimmed points. */
  edge: string;
}

interface KeyBlock {
  height: number;
  paths: string[];
  labels: { x: number; y: number; text: string }[];
}

const logical = computed<Sheet[]>(() => {
  const v = view.value;
  if (!v) return [];
  const isBlock = props.kind === 'block';
  const wanted: string[] = isBlock ? prefs.value.blockSections : prefs.value.quiltSections;
  const out: Sheet[] = [];
  const [aw, ah] = area.value;

  // One order whatever order the boxes were ticked in — quilt: picture, yardage, rotary, blocks,
  // templates (credits last); block: block page ("picture"), rotary, templates.
  const ORDER = isBlock
    ? ['picture', 'rotary', 'templates']
    : ['picture', 'yardage', 'rotary', 'blocks', 'templates'];
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
            u.number,
          ),
        );
      }
      continue;
    }
    if (section === 'picture') {
      const [x0, y0, x1, y1] = v.pictureBox;
      const w = x1 - x0;
      const h = y1 - y0 + 0.0001;
      // Leave room for the notes under the picture and the scale square above the footer.
      const room =
        (v.notes ? ah * 0.7 : ah - 2 * font.value) - scaleSquare.value - font.value * 1.5;
      const scale = Math.min(1, aw / w, room / h);
      out.push({
        kind: 'picture',
        heading: isBlock ? 'Block' : 'Quilt',
        polys: v.picture,
        edge: v.edge && d(v.edge),
        trim: v.trim,
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
          noKey: prefs.value.keyOnBlockPage && wanted.includes('picture'),
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
            heading: `Templates: ${u.number} · ${u.block.notecard.name}`,
            prefix: String(u.number),
            noKey: prefs.value.keyOnBlockPage && wanted.includes('blocks'),
          }),
        );
      }
      // Pieces of the quilt itself that need templates (patches, setting and border shapes, strip
      // patterns): the ones the cutting chart says to cut from a template, lettered Q….
      const quilt = doc.value!.project.quilts.find((q) => q.id === props.id);
      const plain = quilt
        ? quiltPieces(doc.value!, quilt, PLAIN_BLOCK).filter(
            (p) => cutFor(p, 0, 0).kind === 'template',
          )
        : [];
      if (plain.length)
        out.push(
          ...templateSheets({
            pieces: plain,
            size: [1, 1],
            keyPieces: [],
            heading: 'Templates: quilt pieces',
            prefix: 'Q',
            noKey: true,
          }),
        );
    }
    if (section === 'rotary') {
      const lines = cutPlan(v.pieces, seam.value, step.value, usableForCuts.value, slack.value);
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
      out.push(...miterSheets(lines));
    }
    if (section === 'yardage' && !isBlock) {
      const fstep = prefs.value.fabricStep[units.value];
      const [x0, y0, x1, y1] = v.pictureBox;
      const { cols, fills } = needCols(v.pieces);
      out.push({
        kind: 'yardage',
        heading: 'Yardage estimate',
        fills,
        // Backing and binding aren't pieced from fat quarters.
        cols: cols.map((c) =>
          c.opt.fatQuarter
            ? c
            : {
                ...c,
                backing: backing(
                  x1 - x0,
                  y1 - y0,
                  prefs.value.overhang[units.value],
                  c.opt.usable,
                  fstep,
                ),
                binding: binding(
                  v.edge ? perimeter(v.edge) : 2 * (x1 - x0 + (y1 - y0)),
                  prefs.value.bindingWidth[units.value],
                  BINDING_EXTRA[units.value],
                  c.opt.usable,
                  fstep,
                ),
              },
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

// With the color key, templates carry their fabric's number (A-2 = A cut from fabric 2), numbered in order of
// first appearance across the printout.
const fabricNos = computed(
  () =>
    new Map(
      [...new Set(view.value?.pieces.map((p) => p.fill) ?? [])]
        .filter((f) => f !== 'none')
        .map((f, i) => [f, i + 1]),
    ),
);
const code = (letter: string, fill: string) =>
  prefs.value.labels.color && fabricNos.value.has(fill)
    ? `${letter}-${fabricNos.value.get(fill)}`
    : letter;
const fabricItems = computed(() =>
  [...fabricNos.value].map(([f, n]) => ({ fill: f, n, ...fillInfo(f) })),
);
/** Legend on the key: only when codes carry fabric numbers. */
const fabricLegend = computed(() =>
  prefs.value.labels.color ? fabricItems.value.map((x) => `${x.n} ${x.name}`).join(' · ') : '',
);

/** Each patch's template code at its center (block coordinates), for keys. */
function keyLabels(keyPieces: Piece[], prefix: string) {
  const letters = new Map(templates(keyPieces, prefix).map((t) => [shapeKey(t.poly), t.letter]));
  return keyPieces.map((p) => {
    const c = p.poly.reduce((a, q) => [a[0] + q[0], a[1] + q[1]], [0, 0]);
    const [R, G, B] = (fillInfo(p.fill).css.match(/\d+/g) ?? ['255', '255', '255']).map(Number);
    return {
      x: c[0] / p.poly.length,
      y: c[1] / p.poly.length,
      text: code(letters.get(shapeKey(p.poly)) ?? '', p.fill),
      /** Light text on dark fabric (pictures in color only). */
      light: !prefs.value.outline && 0.299 * R! + 0.587 * G! + 0.114 * B! < 128,
    };
  });
}

/** Blocks placed in the quilt being printed, in layout order: size and coloring of the first. */
function quiltBlocks() {
  const dd = doc.value!;
  const quilt = dd.project.quilts.find((q) => q.id === props.id);
  if (!quilt) return [];
  const seen = new Set<string>();
  return generateFor(quilt).slots.flatMap((slot) => {
    const content = quilt.layers[0].slots[slot.id];
    const block = content && dd.project.blocks.find((b) => b.id === content.block);
    if (!content || !block || seen.has(block.id) || block.notecard.tags?.includes('system'))
      return [];
    seen.add(block.id);
    const size = slot.size;
    return [
      {
        quilt,
        block,
        size,
        coloring: resolveColoring(quilt.colorings[content.coloring], block),
        number: seen.size,
      },
    ];
  });
}

/** Template pages for one block: a lettered key, then each distinct piece packed at true size. */
function templateSheets(src: {
  pieces: Piece[];
  size: [number, number];
  keyPieces: Piece[];
  heading: string;
  /** Letter prefix: the block's number in a quilt printout. */
  prefix?: string;
  /** The key is on the block page instead. */
  noKey?: boolean;
}): Sheet[] {
  const out: Sheet[] = [];
  const [aw, ah] = area.value;
  const gap = units.value === 'in' ? 0.25 : 0.6;
  const prefix = src.prefix ?? '';
  const items = templateItems(src.pieces, prefix);
  // Key: the block with each patch's letter, about a quarter of the page wide.
  const keyScale = Math.min(aw, ah) / 4 / Math.max(...src.size);
  const keyItem = {
    key: 'key',
    letter: '',
    cut: [],
    sew: [],
    center: [0, 0] as Pt,
    room: 0,
    grain: [1, 0] as Pt,
    grainLength: 0,
    note: '',
    size: '',
    marks: [],
    fabrics: [],
    x: 0,
    y: 0,
    w: src.size[0] * keyScale,
    h: src.size[1] * keyScale + font.value * (fabricLegend.value ? 2.7 : 1.5),
    keyBlock: {
      height: src.size[1] * keyScale,
      paths: src.keyPieces.map((p) => d(p.poly.map(([x, y]): Pt => [x * keyScale, y * keyScale]))),
      labels: keyLabels(src.keyPieces, prefix).map((l) => ({
        ...l,
        x: l.x * keyScale,
        y: l.y * keyScale,
      })),
    },
  };
  const all: (PlacedPiece & { h: number; keyBlock?: KeyBlock })[] = src.noKey
    ? items
    : [keyItem, ...items];
  // Room under each template for its caption and wrapped fabric pills.
  const f = font.value;
  const pillRows = (it: PlacedPiece) =>
    prefs.value.labels.color || !it.fabrics.length
      ? 0
      : Math.max(
          ...wrapPills(
            it.fabrics.map((p) => pillWidth(p.pill ?? '', f)),
            it.w,
            f * 0.3,
          ).map((p) => p.row),
        );
  const boxes = all.map((it) => ({ w: it.w, h: it.h + f * 4 + pillRows(it) * f * 1.5 }));
  // One per page: pack each on its own (still turned to fit, still tiled when too big).
  const { pages, oversize } = prefs.value.onePerPage
    ? boxes.reduce(
        (acc, box, i) => {
          const r = pack([box], aw, ah, gap, false);
          acc.pages.push(...r.pages.map((pg) => pg.map((pl) => ({ ...pl, index: i }))));
          if (r.oversize.length) acc.oversize.push(i);
          return acc;
        },
        { pages: [] as ReturnType<typeof pack>['pages'], oversize: [] as number[] },
      )
    : pack(boxes, aw, ah, gap, false);
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
          marks: it.marks.map((m) => ({ p: t(m.p), n: [-m.n[1], m.n[0]] as Pt })),
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

/** One true-size corner guide per mitered strip width, packed on pages. */
function miterSheets(lines: CutLine[]): Sheet[] {
  const s = seam.value;
  const widths = [
    ...new Set(lines.filter((l) => l.cut.kind === 'miter').map((l) => l.cut.finished[1])),
  ].sort((a, b) => a - b);
  const [aw, ah] = area.value;
  // ponytail: a strip wider than the printable width gets no guide (the chart still says 45°).
  const guides = widths
    .flatMap((w) =>
      [false, true].map((right) => {
        const len = Math.min(aw, 2 * (w + 2 * s) + 2 * s);
        const a = miterA.value;
        const far = len + w + 4 * s;
        // The finished end, grown by the seam allowance like a template, cut off at `len`.
        const pts = offset(
          [
            [a, s],
            [far, s],
            [far, s + w],
            [a + w, s + w],
          ],
          s,
          prefs.value.trimPoints,
        ).map(([x, y]): Pt => [Math.min(x, len), y]);
        const i = pts.findIndex((p, k) => p[0] === len && pts[(k + 1) % pts.length]![0] === len);
        const open = [...pts.slice(i + 1), ...pts.slice(0, i + 1)];
        const edge = `M${open.map((p) => p.join(' ')).join('L')}`;
        return { x: 0, y: 0, w, cut: w + 2 * s, len, right, edge };
      }),
    )
    .filter((g) => g.cut <= aw);
  if (!guides.length) return [];
  const gap = units.value === 'in' ? 0.25 : 0.6;
  const { pages } = pack(
    guides.map((g) => ({ w: g.len, h: g.cut + font.value * 2.5 })),
    aw,
    ah,
    gap,
    false,
  );
  return pages.map((page) => ({
    kind: 'miter',
    heading: 'Mitered corner guide',
    guides: page.map((pl) => ({ ...guides[pl.index]!, x: pl.x, y: pl.y })),
  }));
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
  /** Its number in a quilt printout (template letters 1A, 1B… use it). */
  number?: number,
): Sheet {
  const [aw, ah] = area.value;
  const pieces = new Map<string, number>();
  for (const p of all) pieces.set(p.fill, (pieces.get(p.fill) ?? 0) + 1);
  const dd = doc.value!;
  return {
    kind: 'block',
    heading: number ? `Block ${number} · ${block.notecard.name}` : `Block: ${block.notecard.name}`,
    name: block.notecard.name,
    size: sizeLabel(...size),
    count: n,
    quilt: quiltName,
    polys: one.map((p) => ({ d: d(p.poly), css: shapeFill(p.fill) })),
    w: size[0],
    h: size[1],
    scale: Math.min(1, (aw * 0.45) / size[0], (ah * 0.5) / size[1]),
    ...needCols(all),
    pieces,
    byline: `By ${authorOf(block) ?? 'anonymous'} · ${licenseName(effectiveLicense(block, dd, blockLock(block)))}`,
    author: authorOf(block),
    basedOn: priorCredits(block),
    notes: block.notecard.notes,
    labels: prefs.value.keyOnBlockPage ? keyLabels(one, number ? String(number) : '') : [],
    fabrics: fabricItems.value.filter((f) => pieces.has(f.fill)),
  };
}
/** Each author's credits social (their pick, else the first): you (Settings), the project's author, and library/pack authors. */
const firstSocial = computed(() => {
  const m = new Map<string, Social>();
  const add = (name: string | undefined, list: Social[] | undefined) => {
    const s = creditSocial(list);
    if (name && s && !m.has(name)) m.set(name, s);
  };
  add(app.settings.author, app.settings.socials);
  add(doc.value?.project.author, doc.value?.project.authorSocials);
  for (const v of library.views) add(v.doc.author?.name, v.doc.author?.socials);
  return m;
});
/** Credits: an author's first social — icon/handle for known sites, else the text (shortened). */
const AuthorSocial = defineComponent({
  props: { name: { type: String as PropType<string | undefined>, default: undefined } },
  setup: (p) => () => {
    const s = p.name ? firstSocial.value.get(p.name) : undefined;
    if (!s) return null;
    if (!isKnownSite(s.type)) {
      const t = s.handle.length > 48 ? `${s.handle.slice(0, 47)}…` : s.handle;
      return h('span', { class: 'social' }, `(${t})`);
    }
    return h('span', { class: 'social' }, [
      '(',
      h(QIcon, { name: socialIcon(s.type), size: '1em', class: 'social-icon' }),
      `/${s.handle})`,
    ]);
  },
});
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
  // Print-size (1024 px) images of connected libraries' fabrics, when online (spec 014).
  const packs = new Set(
    (doc.value?.project.palette.fabrics ?? []).flatMap((f) =>
      f.source && !f.source.derived ? [f.source.libraryId] : [],
    ),
  );
  if (packs.size && navigator.onLine)
    void library.fetchPackImages([...packs]).then((n) => n && retryMissing());
  pageStyle = document.createElement('style');
  document.head.append(pageStyle);
  watchEffect(() => {
    pageStyle!.textContent = `@page { size: ${paperMm.value[0]}mm ${paperMm.value[1]}mm; margin: 0; }`;
  });
});
onBeforeUnmount(() => pageStyle?.remove());
const print = () => window.print();

// Flowing pages (charts, tables, lists) are split into sheets at measured heights: a hidden copy of
// each is drawn at the printable width next to a ruler one printable height tall, so the browser's
// zoom doesn't matter. Until measured they show whole (and print as one long page).
/** On screen only: the Help topic behind a page (hidden when printing). */
const SHEET_HELP: Record<string, { topic: string; label: string }> = {
  rotary: { topic: 'math/seam-allowance', label: 'How cut sizes are worked out' },
  miter: { topic: 'math/borders', label: 'Mitered borders' },
  yardage: { topic: 'math/patches-from-yardage', label: 'Yardage, binding, and backing' },
};
const FLOW = new Set(['rotary', 'yardage', 'credits', 'block']);
type Costs = Record<number, { key: string; cost: number }[]>;
const measuredHere = ref<Costs>({});
const costs = computed(() => props.measured ?? measuredHere.value);
const sheets = computed<Sheet[]>(() =>
  logical.value.flatMap((s, i) => {
    const items = costs.value[i];
    if (!FLOW.has(s.kind) || !items?.length) return [s];
    return splitFlow(items).map((keys, j) => ({
      ...s,
      heading: j ? `${s.heading} (continued)` : s.heading,
      show: new Set(keys),
    }));
  }),
);
const entries = computed(() => [
  ...sheets.value.map((s, i) => ({ s, i, measure: false })),
  ...(props.printOnly
    ? []
    : logical.value.flatMap((s, i) => (FLOW.has(s.kind) ? [{ s, i, measure: true }] : []))),
]);
/** Fabric pills beside the block picture when they fit its height (about 6.6 mm each). */
const pillsBeside = (s: Sheet) =>
  s.kind === 'block' && s.fabrics.length * 6.6 <= s.h * s.scale * mm.value;
/** Part of a split page: is this piece on it? */
const on = (s: Sheet, key: string) => !s.show || s.show.has(key);
const measureStyle = computed(() => ({ width: `${area.value[0]}${units.value}` }));
function measure() {
  const out: Costs = {};
  for (const el of root.value?.querySelectorAll<HTMLElement>('section.measure') ?? []) {
    const page = el.querySelector('.ruler')!.getBoundingClientRect().height;
    const parts = [...el.querySelectorAll<HTMLElement>('[data-m]')];
    const end = el.querySelector('.content')!.getBoundingClientRect().bottom;
    const tops = parts.map((p) => p.getBoundingClientRect().top);
    if (!page) continue;
    out[Number(el.dataset.i)] = parts.map((p, k) => ({
      key: p.dataset.m!,
      cost: ((tops[k + 1] ?? end) - tops[k]!) / page,
    }));
  }
  measuredHere.value = out;
}
watch([logical, area], () => void nextTick(measure), { flush: 'post' });
onMounted(() => {
  void nextTick(measure);
  void document.fonts?.ready.then(measure);
});

// On screen, sheets shrink to fit the space (CSS px are 96 per inch), or follow the zoom.
const editor = useEditorStore();
const root = ref<HTMLElement>();
const width = ref(0);
const observer = new ResizeObserver(([e]) => (width.value = e?.contentRect.width ?? 0));
onMounted(() => root.value && observer.observe(root.value));
onBeforeUnmount(() => observer.disconnect());
const fit = computed(() =>
  width.value ? Math.min(1, (width.value - 32) / ((paperMm.value[0]! * 96) / 25.4)) : 1,
);
const scale = computed(() => (props.printOnly ? 1 : editor.printScale));
if (!props.printOnly) {
  editor.printZoom = null;
  watchEffect(() => (editor.printFit = fit.value));
}

// Zooming keeps the point under the cursor / between the fingers (else the middle) in place.
let anchor: [number, number] | null = null;
watch(scale, async (s, old) => {
  const el = root.value;
  if (!el || props.printOnly) return;
  const r = el.getBoundingClientRect();
  const [ax, ay] = anchor ?? [r.width / 2, r.height / 2];
  anchor = null;
  const top = el.querySelector<HTMLElement>('.toolbar')?.offsetHeight ?? 0;
  const x = el.scrollLeft + ax;
  const y = el.scrollTop + ay - top;
  await nextTick();
  el.scrollLeft = (x * s) / old - ax;
  el.scrollTop = (y * s) / old - ay + top;
});
const at = (x: number, y: number): [number, number] => {
  const r = root.value!.getBoundingClientRect();
  return [x - r.left, y - r.top];
};
function onWheel(e: WheelEvent) {
  if (!e.ctrlKey) return;
  e.preventDefault();
  anchor = at(e.clientX, e.clientY);
  // Mouse wheels step by lines (Firefox) or ~100 px; trackpad pinches send small deltas.
  const dy = e.deltaMode ? e.deltaY * 33 : e.deltaY;
  editor.zoomPrint(Math.exp(-Math.max(-100, Math.min(100, dy)) * 0.002));
}
// Two fingers pinch; one finger scrolls as usual.
let pinch: { d: number; s: number } | null = null;
const spread = (t: TouchList) =>
  Math.hypot(t[0]!.clientX - t[1]!.clientX, t[0]!.clientY - t[1]!.clientY);
function onTouch(e: TouchEvent) {
  if (e.touches.length !== 2) return void (pinch = null);
  e.preventDefault();
  const d = spread(e.touches);
  if (!pinch || e.type === 'touchstart') pinch = { d, s: editor.printScale };
  anchor = at(
    (e.touches[0]!.clientX + e.touches[1]!.clientX) / 2,
    (e.touches[0]!.clientY + e.touches[1]!.clientY) / 2,
  );
  editor.zoomPrint((pinch.s * d) / pinch.d / editor.printScale);
}
const events = ['touchstart', 'touchmove', 'touchend'] as const;
onMounted(() => {
  if (props.printOnly) return;
  root.value?.addEventListener('wheel', onWheel, { passive: false });
  for (const t of events) root.value?.addEventListener(t, onTouch, { passive: false });
});
</script>

<style scoped>
.approx {
  font-size: 0.85em;
  color: #555;
}
/* Sheets never push on the panels around the preview; it scrolls instead. */
.print-preview {
  min-width: 0;
}
.toolbar {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 1;
  background: #fff;
  border-bottom: 1px solid rgba(128, 128, 128, 0.25);
}
:global(.body--dark .toolbar) {
  background: #1d1d1d;
}
.sheets {
  background: #9e9e9e;
  padding: 16px;
  display: flex;
  flex-direction: column;
  /* Zoomed-in sheets scroll the preview sideways (plain `center` would cut off their left side). */
  align-items: safe center;
  min-width: fit-content;
  gap: 16px;
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
.sheet.measure {
  position: fixed;
  left: -10000px;
  top: 0;
  visibility: hidden;
  box-shadow: none;
}
.measure .content {
  flex: none;
}
.sheet footer {
  height: 6mm;
  border-top: 0.3mm solid #000;
  padding-top: 2mm;
  font-size: 8pt;
}
.notes {
  white-space: pre-wrap;
  text-align: left;
}
/* Outlines are centred on the shape's edge: let the outer half show instead of clipping it. */
.bleed {
  overflow: visible;
}
.pill {
  border: 0.2mm solid #666;
  border-radius: 999px;
  padding: 0.3mm 2mm;
  white-space: nowrap;
}
.social {
  white-space: nowrap;
  opacity: 0.8;
}
.social-icon {
  vertical-align: -0.12em;
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
  font-size: 0.8em;
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
.pattern-defs {
  position: absolute;
  width: 0;
  height: 0;
}
</style>
