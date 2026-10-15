// Help topics (spec 013): Markdown files bundled with the app (src/help/<section>/<id>.md), so Help
// works offline. Each starts with a front matter block:
//   ---
//   title: Half-square triangles
//   order: 30
//   summary: One line shown in the topic list.
// Topics with two or more ## headings get an "On this page" table of contents.
// `cards: true` in the front matter shows each ## section in its own card.
//   ---
// A line `::calc <name>` places a calculator (calc.ts); raw <svg> blocks are diagrams.
// A line `::diagram <section>/<id>` repeats the first diagram of that topic (no copies to drift).
// `{{yours:<feature>}}` becomes "yours does" / "yours doesn't" (HelpPage checks the browser).
import { marked } from 'marked';

export const SECTIONS = [
  { id: 'guides', label: 'App Guides', icon: 'menu_book' },
  { id: 'math', label: 'Quilt Math', icon: 'calculate' },
  { id: 'techniques', label: 'Techniques', icon: 'content_cut' },
  { id: 'resources', label: 'Resources', icon: 'link' },
  { id: 'about', label: 'About', icon: 'info' },
] as const;
export type SectionId = (typeof SECTIONS)[number]['id'];

export type Segment = { kind: 'html'; html: string } | { kind: 'calc'; name: string };

export interface Topic {
  section: SectionId;
  id: string;
  title: string;
  order: number;
  summary: string;
  /** Lowercased title + text, for search. */
  text: string;
  segments: Segment[];
  /** The ## headings, when there are two or more (the table of contents). */
  toc?: { id: string; title: string }[] | undefined;
  /** Show each ## section in a card. */
  cards: boolean;
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Front matter (`key: value` lines between `---`) and the body. */
export function parseTopic(raw: string): { meta: Record<string, string>; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  const meta: Record<string, string> = {};
  for (const line of (m?.[1] ?? '').split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: m ? raw.slice(m[0].length) : raw };
}

/** Markdown between `::calc` lines → HTML; each `::calc name` → a calculator segment. */
export function segmentsOf(body: string): Segment[] {
  const out: Segment[] = [];
  let md: string[] = [];
  const flush = () => {
    const text = md.join('\n').trim();
    if (!text) return;
    const html = marked
      .parse(text, { async: false, gfm: true })
      // ## headings get ids for the table of contents.
      .replace(/<h2>(.*?)<\/h2>/g, (_, t: string) => `<h2 id="${slug(t)}">${t}</h2>`);
    // Links off the app open in a new tab (Resources); /help/… links are routed by the page.
    out.push({
      kind: 'html',
      html: html.replace(
        /<a href="(https?:[^"]*)"/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer"',
      ),
    });
    md = [];
  };
  for (const line of body.split(/\r?\n/)) {
    const calc = /^::calc\s+(\S+)\s*$/.exec(line);
    const diagram = /^::diagram\s+(\S+)\s*$/.exec(line);
    if (diagram) {
      const svg = /<svg[\s\S]*?<\/svg>/.exec(files[`./${diagram[1]}.md`] ?? '')?.[0];
      md.push(svg ?? `<p>Missing diagram ${diagram[1]}</p>`);
      continue;
    }
    if (calc) {
      flush();
      out.push({ kind: 'calc', name: calc[1]! });
    } else md.push(line);
  }
  flush();
  return out;
}

function tocOf(body: string) {
  const toc = [...body.matchAll(/^## (.+)$/gm)].map((m) => ({ id: slug(m[1]!), title: m[1]! }));
  return toc.length > 1 ? toc : undefined;
}

const files = import.meta.glob<string>('./*/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

// The project's CHANGELOG.md, shown as Help › About › Changelog (it has no front matter).
const changelog = import.meta.glob<string>('/CHANGELOG.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const changelogTopic = Object.values(changelog).map(
  (raw) =>
    `---\ntitle: Changelog\norder: 40\nsummary: What changed in each version.\n---\n${raw.replace(/^# .*\n/, '')}`,
);

export const TOPICS: Topic[] = [
  ...Object.entries(files),
  ...changelogTopic.map((raw) => ['./about/changelog.md', raw] as const),
]
  .map(([path, raw]) => {
    const [, section, id] = /^\.\/([^/]+)\/([^/]+)\.md$/.exec(path)!;
    const { meta, body } = parseTopic(raw);
    return {
      section: section as SectionId,
      id: id!,
      title: meta.title ?? id!,
      order: Number(meta.order ?? 100),
      summary: meta.summary ?? '',
      text: `${meta.title ?? ''} ${meta.summary ?? ''} ${body}`.toLowerCase(),
      segments: segmentsOf(body),
      toc: tocOf(body),
      cards: meta.cards === 'true',
    };
  })
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

export const topicsIn = (section: SectionId) => TOPICS.filter((t) => t.section === section);
export const findTopic = (section: string, id: string) =>
  TOPICS.find((t) => t.section === section && t.id === id);

/** Topics whose title or text contains every word of `query`. */
export function searchTopics(topics: Topic[], query: string) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return topics.filter((t) => words.every((w) => t.text.includes(w)));
}
