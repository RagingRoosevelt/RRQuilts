import { readFileSync } from 'node:fs';
import type { RrqDoc } from '@/model/schema/project';

export const fixtureText = () => readFileSync('test/fixtures/everything.rrq', 'utf8');
export const fixture = () => JSON.parse(fixtureText()) as RrqDoc & Record<string, unknown>;
