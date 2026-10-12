// Credits and licenses (spec 009, constitution Principle VI): every earlier contributor stays
// credited, and licenses earlier in the chain limit the choice.
import { blocksUsed } from './library-items';
import type { RrqDoc } from './schema/project';
import type { Quilt } from './schema/quilt';
import type { Credit } from './schema/shared';

export const DEFAULT_LICENSE = 'CC-BY-SA-4.0';
export const ALL_RIGHTS = 'LicenseRef-All-Rights-Reserved';

export const LICENSES = [
  {
    id: 'PDM-1.0',
    name: 'Public domain',
    terms: 'Traditional or out-of-copyright design · Free for any use',
  },
  {
    id: 'CC0-1.0',
    name: 'CC0 1.0',
    terms: 'No rights reserved · Free for any use, no credit needed',
  },
  {
    id: 'CC-BY-SA-4.0',
    name: 'CC BY-SA 4.0',
    terms: 'Attribution · Share-alike: credit required; changes keep this license',
  },
  {
    id: 'CC-BY-NC-SA-4.0',
    name: 'CC BY-NC-SA 4.0',
    terms:
      'Attribution · Non-commercial · Share-alike: credit required; no selling; changes keep this license',
  },
  {
    id: ALL_RIGHTS,
    name: 'All rights reserved',
    terms: 'Only the author may copy, change, or share it',
  },
];

/** Display name; licenses from libraries we don't offer show as their id ("CC-BY-4.0" → "CC BY 4.0"). */
export const licenseName = (id: string) =>
  LICENSES.find((l) => l.id === id)?.name ??
  id.replace(/^CC-(.+)-(\d[\d.]*)$/, (_, terms: string, v: string) => `CC ${terms} ${v}`);

interface Creditable {
  notecard: { name: string };
  author?: string | undefined;
  license?: string | undefined;
  credits?: Credit[] | undefined;
  source?: { libraryId: string; derived?: boolean | undefined; [k: string]: unknown } | undefined;
}
type Src = { author?: string; license?: string; library?: string; name?: string; itemId?: string };
const src = (x: Creditable) => x.source as (Src & { derived?: boolean }) | undefined;

const compact = (c: { [K in keyof Credit]: string | undefined }): Credit =>
  Object.fromEntries(Object.entries(c).filter(([, v]) => v !== undefined));

/** Current author; an unchanged library item's is its library's. */
export const authorOf = (x: Creditable) =>
  x.author ?? (src(x) && !src(x)!.derived ? src(x)!.author : undefined);

/** Earlier contributors, origin first. Older files only have `source`. */
export function priorCredits(x: Creditable): Credit[] {
  if (x.credits) return x.credits;
  const s = src(x);
  if (!s?.derived) return [];
  return [
    compact({ author: s.author, name: s.name ?? s.itemId, license: s.license, library: s.library }),
  ];
}

/** Make credits explicit (older items keep them only in `source`). Call on a draft. */
export function settleCredits(d: Creditable) {
  if (d.credits) return;
  const s = src(d);
  if (s && !s.derived) {
    if (s.author && !d.author) d.author = s.author;
    if (s.license && !d.license) d.license = s.license;
    d.credits = [];
  } else d.credits = priorCredits(d);
}

/**
 * The user copies or changes someone else's item (call on a draft): the previous author joins the
 * credits and the user becomes the author; the license resets to the project's (the chain may lock it).
 */
export function creditCopy(d: Creditable, me: string, projectLicense?: string) {
  const library = src(d) && !src(d)!.derived ? src(d)!.library : undefined;
  settleCredits(d);
  if (d.source) d.source.derived = true;
  const prev = d.author;
  if (!prev || prev === me) return;
  d.credits!.push(
    compact({ author: prev, name: d.notecard.name, license: d.license ?? projectLicense, library }),
  );
  if (me) d.author = me;
  else delete d.author;
  d.license = projectLicense ?? DEFAULT_LICENSE;
}

/** Whether `creditCopy` would change anything (avoid new objects for no-op edits). */
export const needsCredit = (x: Creditable, me: string) =>
  (!!src(x) && !src(x)!.derived) || (!!x.author && x.author !== me);

const rank = (id?: string) =>
  !id ? 0 : id === ALL_RIGHTS ? 3 : /\bNC\b/.test(id) ? 2 : /\bSA\b/.test(id) ? 1 : 0;
const LOCKS = [undefined, 'CC-BY-SA-4.0', 'CC-BY-NC-SA-4.0', ALL_RIGHTS] as const;

export interface Lock {
  license: string;
  /** The work that requires it. */
  because: string;
}

/**
 * Strictest license among the sources: all rights reserved > non-commercial > share-alike.
 * ponytail: SA + NC-SA (strictly incompatible) resolves to NC-SA; ask a human if that matters.
 */
export function requiredLicense(sources: { license?: string; name?: string }[]): Lock | undefined {
  let best: { license?: string; name?: string } | undefined;
  for (const s of sources) if (rank(s.license) > rank(best?.license)) best = s;
  return best
    ? { license: LOCKS[rank(best.license)]!, because: best.name ?? 'earlier work' }
    : undefined;
}

export const blockLock = (x: Creditable) => requiredLicense(priorCredits(x));

export const effectiveLicense = (x: Creditable, doc: RrqDoc, lock = blockLock(x)) =>
  lock?.license ??
  x.license ??
  (src(x) && !src(x)!.derived ? src(x)!.license : undefined) ??
  doc.project.license ??
  DEFAULT_LICENSE;

/** Blocks in the quilt made by someone else, with what the quilt must credit. */
export function blocksByOthers(doc: RrqDoc, quilt: Quilt, me: string) {
  const used = blocksUsed({ ...doc.project, quilts: [quilt] });
  return doc.project.blocks
    .filter((b) => used.has(b.id) && !b.notecard.tags?.includes('system'))
    .flatMap((b) => {
      const author = authorOf(b);
      const credits = priorCredits(b);
      if ((!author || author === me) && !credits.length) return [];
      const own = !author || author === me;
      return [{ block: b, author, license: effectiveLicense(b, doc), own, credits }];
    });
}

/** A quilt is locked by its own credits, others' blocks, and every block's credits. */
export const quiltLock = (doc: RrqDoc, quilt: Quilt, me: string) =>
  requiredLicense([
    ...priorCredits(quilt),
    ...blocksByOthers(doc, quilt, me).flatMap((u) => [
      ...(u.own ? [] : [{ license: u.license, name: u.block.notecard.name }]),
      ...u.credits,
    ]),
  ]);
