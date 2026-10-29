// Dev only: this build's changelog as version.json would carry it, for `?update_demo=` (spec 054).
import { parseChangelog, type VersionInfo } from '@/model/changelog';

const raw = Object.values(
  import.meta.glob<string>('/CHANGELOG.md', { query: '?raw', import: 'default', eager: true }),
)[0]!;

export const demoInfo = (): VersionInfo => ({
  version: import.meta.env.APP_VERSION,
  versions: parseChangelog(raw),
});
