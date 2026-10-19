import { describe, expect, it } from 'vitest';
import routes, { projectGuard } from '@/router/routes';

function resolve(path: string) {
  const match = routes.find((r) => r.path === path);
  if (!match) throw new Error(`no route ${path}`);
  return { meta: match.meta ?? {} };
}

describe('open-project guard', () => {
  it('redirects project routes home when no project is open', () => {
    for (const p of [
      '/project',
      '/project/quilt/:id',
      '/project/block/:id',
      '/project/image/:id',
    ]) {
      expect(projectGuard(resolve(p), false)).toEqual({
        path: '/',
        query: { notice: 'open-project' },
      });
    }
  });

  it('allows project routes when a project is open, and other routes always', () => {
    expect(projectGuard(resolve('/project/quilt/:id'), true)).toBe(true);
    for (const p of ['/', '/libraries', '/settings']) {
      expect(projectGuard(resolve(p), false)).toBe(true);
    }
  });

  it('sends gist links to Home, open project or not', () => {
    for (const open of [false, true])
      expect(projectGuard({ ...resolve('/project'), query: { open_gist: 'abc' } }, open)).toEqual({
        path: '/',
        query: { open_gist: 'abc' },
      });
  });
});
