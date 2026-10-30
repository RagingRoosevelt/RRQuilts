import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { prettyJson } from '@/model/json';
import { fixtureText } from './helpers';

describe('prettyJson (saved files)', () => {
  it('holds the same data as JSON.stringify', () => {
    const doc = JSON.parse(fixtureText()) as unknown;
    expect(JSON.parse(prettyJson(doc))).toEqual(JSON.parse(JSON.stringify(doc)));
    const odd = { a: undefined, b: [undefined, 1], c: 'x\n"y"', d: {}, e: [], f: null };
    expect(JSON.parse(prettyJson(odd))).toEqual(JSON.parse(JSON.stringify(odd)));
  });

  it('keeps short items on one line, indents the rest 2 spaces', () => {
    const v = {
      size: [12, 12],
      nodes: [
        { id: 'a1', x: 0, y: 0.5 },
        { id: 'a2', x: 1, y: 0.5 },
      ],
      note: 'n'.repeat(90),
    };
    expect(prettyJson(v)).toBe(
      [
        '{',
        '  "size": [12, 12],',
        '  "nodes": [{"id": "a1", "x": 0, "y": 0.5}, {"id": "a2", "x": 1, "y": 0.5}],',
        `  "note": "${'n'.repeat(90)}"`,
        '}',
      ].join('\n'),
    );
  });
});

// Every released format sample (projects, demos, blocks, libraries, palettes, settings): laid out
// by prettyJson, it reads back as the same data JSON.stringify writes.
describe('prettyJson on every format sample', () => {
  const dir = 'test/fixtures/formats';
  const files = readdirSync(dir).filter((f) => /\.rrq(bl|lib|plt|conf)?$/.test(f));

  it('finds the samples', () => expect(files.length).toBeGreaterThan(20));

  it.each(files)('%s', (f) => {
    const data = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')) as unknown;
    const text = prettyJson(data);
    expect(JSON.parse(text)).toEqual(JSON.parse(JSON.stringify(data)));
    expect(text).toMatch(/^\{\n {2}"/); // laid out, not one long line
  });
});
