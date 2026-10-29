// CHANGELOG.md as data (spec 054): versions, their sections, and each change's text. A change whose
// line starts with "[major]" is major: the update dialog shows those, Help lists them first.
// No "@/" imports: quasar.config.ts uses this at build time to write version.json.

export interface Change {
  text: string;
  major: boolean;
}
export interface ChangelogSection {
  title: string;
  changes: Change[];
}
export interface ChangelogVersion {
  version: string;
  date: string;
  sections: ChangelogSection[];
}

const MAJOR = /^\[major\]\s*/;

/** Versions newest first, as written. Bullets may wrap onto indented lines. */
export function parseChangelog(raw: string): ChangelogVersion[] {
  const out: ChangelogVersion[] = [];
  let section: ChangelogSection | undefined;
  let change: Change | undefined;
  for (const line of raw.split('\n')) {
    const v = /^## (\S+)(?: \((.*)\))?/.exec(line);
    const s = /^### (.+)/.exec(line);
    if (v) {
      out.push({ version: v[1]!, date: v[2] ?? '', sections: [] });
      section = change = undefined;
    } else if (s && out.length) {
      section = { title: s[1]!.trim(), changes: [] };
      out.at(-1)!.sections.push(section);
      change = undefined;
    } else if (line.startsWith('- ') && section) {
      const text = line.slice(2).trim();
      change = { text: text.replace(MAJOR, ''), major: MAJOR.test(text) };
      section.changes.push(change);
    } else if (change && /^\s+\S/.test(line)) change.text += ' ' + line.trim();
    else change = undefined;
  }
  return out;
}

/** The changelog for Help: the text before the first version, then each version with major changes
 *  first in each section (each group in written order), the marker removed. */
export function changelogMarkdown(raw: string): string {
  const intro = raw.split(/^## /m)[0]!.trimEnd();
  const versions = parseChangelog(raw).map((v) =>
    [
      `## ${v.version}${v.date ? ` (${v.date})` : ''}`,
      ...v.sections.map((s) =>
        [
          `### ${s.title}`,
          [...s.changes.filter((c) => c.major), ...s.changes.filter((c) => !c.major)]
            .map((c) => `- ${c.text}`)
            .join('\n'),
        ].join('\n\n'),
      ),
    ].join('\n\n'),
  );
  return [intro, ...versions].filter(Boolean).join('\n\n') + '\n';
}
