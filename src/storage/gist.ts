// Open from a gist (constitution Principle II, second network exception): the project files
// (.rrq) in a GitHub gist the user names, fetched once on request. What comes back is untrusted
// text, parsed and validated like any opened file.

/** The gist id in a gist link (gist.github.com/<user>/<id>, a raw link) or a bare id. */
export function gistId(input: string): string | null {
  const s = input.trim();
  const m =
    /gist\.github(?:usercontent)?\.com\/(?:[^/\s]+\/)?([0-9a-f]{20,40})(?:[/#?]|$)/i.exec(s) ??
    /^([0-9a-f]{20,40})$/i.exec(s);
  return m ? m[1]!.toLowerCase() : null;
}

export interface GistFile {
  name: string;
  size: number;
  /** Raw address (the content in the listing is cut off for big files). */
  url: string;
  /** The file on the gist's page, for people to look at. */
  page: string;
}

/** Big enough for projects with embedded fabric images; anything larger isn't one of ours. */
const MAX = 50 * 1024 * 1024;

async function get(url: string): Promise<Response> {
  let r: Response;
  try {
    r = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  } catch {
    throw new Error("Couldn't reach GitHub. Check the connection and try again.");
  }
  if (r.status === 404)
    throw new Error('No gist found at that link (a secret gist needs its full link).');
  if (r.status === 403 || r.status === 429)
    throw new Error('GitHub is limiting requests from this network. Try again in a while.');
  if (!r.ok) throw new Error(`GitHub answered ${r.status}. Try again later.`);
  return r;
}

/** The gist's description, owner (GitHub account) and project files. */
export async function gistProjects(
  id: string,
): Promise<{ title: string; owner: string; files: GistFile[] }> {
  const j = (await (await get(`https://api.github.com/gists/${id}`)).json()) as {
    description?: unknown;
    owner?: { login?: unknown } | null;
    html_url?: unknown;
    files?: Record<string, { filename?: unknown; size?: unknown; raw_url?: unknown }>;
  };
  // GitHub's own page for the gist (never a link from the response that leads elsewhere).
  const page =
    typeof j.html_url === 'string' && j.html_url.startsWith('https://gist.github.com/')
      ? j.html_url
      : `https://gist.github.com/${id}`;
  const files = Object.values(j.files ?? {})
    .filter(
      (f) =>
        typeof f.filename === 'string' &&
        /\.rrq$/i.test(f.filename) &&
        typeof f.raw_url === 'string' &&
        f.raw_url.startsWith('https://gist.githubusercontent.com/'),
    )
    .map((f) => ({
      name: f.filename as string,
      size: Number(f.size) || 0,
      url: f.raw_url as string,
      // GitHub's anchor for a file: "file-" + the name, lowercased, other characters as "-".
      page: `${page}#file-${(f.filename as string).toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    }));
  return {
    title: typeof j.description === 'string' ? j.description : '',
    owner: typeof j.owner?.login === 'string' ? j.owner.login : '',
    files,
  };
}

/** One file's text. */
export async function gistText(f: GistFile): Promise<string> {
  if (f.size > MAX) throw new Error(`"${f.name}" is too big to open (over 50 MB).`);
  const text = await (await get(f.url)).text();
  if (text.length > MAX) throw new Error(`"${f.name}" is too big to open (over 50 MB).`);
  return text;
}
