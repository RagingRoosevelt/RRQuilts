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
