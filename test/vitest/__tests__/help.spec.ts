import { describe, expect, it } from 'vitest';
import { CALCULATORS, calcContext } from '@/help/calc';
import { SECTIONS, TOPICS, findTopic, segmentsOf } from '@/help/topics';
import { printPrefs } from '@/model/print/prefs';

describe('help', () => {
  it('has topics in every section, each titled', () => {
    for (const s of SECTIONS) expect(TOPICS.some((t) => t.section === s.id)).toBe(true);
    for (const t of TOPICS) expect(t.title, t.id).not.toBe(t.id);
  });

  it('places only known calculators, and in-app links lead to real topics', () => {
    for (const t of TOPICS) {
      for (const seg of t.segments) {
        if (seg.kind === 'calc') expect(CALCULATORS[seg.name], `${t.id}: ${seg.name}`).toBeTruthy();
        else
          for (const [, sec, id] of seg.html.matchAll(/href="\/help\/([^/"]+)\/([^/"#]+)/g))
            expect(findTopic(sec!, id!), `${t.section}/${t.id} → ${sec}/${id}`).toBeTruthy();
      }
    }
  });

  it('on-point: 3 across × 2 down is 8 blocks and 6 side triangles, n × m diagonals', () => {
    const rows = CALCULATORS.onpoint!.rows(
      { f: 10, n: 3, m: 2 },
      calcContext('in', printPrefs({})),
    );
    const v = (l: string) => rows.find((r) => r.label === l)!.value;
    expect(v('Blocks')).toBe('8');
    expect(v('Side setting triangles')).toContain('(6 needed)');
    expect(v('Finished quilt')).toMatch(/^42\.426″.*× 28\.284″/);
  });

  it('::diagram repeats another topic’s diagram, and every one resolves', () => {
    const segs = segmentsOf('::diagram math/half-square-triangles');
    expect(segs[0]!.kind === 'html' && segs[0]!.html).toContain('<svg');
    for (const t of TOPICS)
      for (const seg of t.segments)
        if (seg.kind === 'html') expect(seg.html, t.id).not.toContain('Missing diagram');
  });

  it('splits ::calc lines out of the Markdown and opens off-app links in a new tab', () => {
    const segs = segmentsOf('Hi [x](https://example.com)\n\n::calc hst\n\nBye');
    expect(segs.map((s) => s.kind)).toEqual(['html', 'calc', 'html']);
    expect(segs[0]!.kind === 'html' && segs[0]!.html).toContain('target="_blank"');
  });

  it('calculators use the printouts’ math: a 3″ half-square triangle is cut from 3⅞″', () => {
    const c = calcContext('in', printPrefs({}));
    expect(CALCULATORS.hst!.rows({ f: 3 }, c)[0]!.value).toContain('3⅞″ square');
    const cm = calcContext('cm', printPrefs({}));
    expect(CALCULATORS.hst!.rows({ f: 8 }, cm)[0]!.value).toContain('11 cm square');
    for (const [name, calc] of Object.entries(CALCULATORS)) {
      const v = Object.fromEntries(calc.inputs.map((i) => [i.key, i.start.in]));
      expect(calc.rows(v, c).length, name).toBeGreaterThan(0);
    }
  });
});
