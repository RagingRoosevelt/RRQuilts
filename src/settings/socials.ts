// The user's socials: a known site (a link is reduced to the handle) or any other type (kept as typed).
import {
  fabBluesky,
  fabEtsy,
  fabFacebook,
  fabGithub,
  fabInstagram,
  fabMastodon,
  fabPinterest,
  fabRavelry,
  fabTiktok,
  fabXTwitter,
  fabYoutube,
} from '@quasar/extras/fontawesome-v7';

// Not in the bundled icon sets: Simple Icons paths (CC0), as Quasar "path|viewBox" icons.
const printablesIcon = 'M3.678 4.8 12 9.6v9.6l8.322-4.8V4.8L12 0ZM12 19.2l-8.322-4.8V24Z|0 0 24 24';
const thingiverseIcon =
  'M11.955.005C5.425-.152-.091 5.485.007 11.805c-.235 6.756 5.537 12.25 12.052 12.196C18.621 23.9 23.912 18.595 24 12.03 24.031 5.483 18.505-.18 11.955.005zm-.047 1.701a10.276 10.276 0 0 1 7.36 17.529 10.275 10.275 0 0 1-17.556-7.287C1.71 6.308 6.268 1.728 11.907 1.706zm-5.55 4.781c-.322 0-.358.033-.358.361v2.248c0 .351.04.391.398.391h3.823c.274 0 .274.004.274.265v9.736a.176.176 0 0 0 .051.146c.04.038.093.059.148.053h2.555c.247-.003.283-.035.283-.28v-9.32c0-.124.004-.239 0-.39s.055-.21.218-.21h3.9c.319.004.35-.032.35-.344V6.855c0-.34-.024-.363-.37-.363h-5.626z|0 0 24 24';

export interface Social {
  type: string;
  handle: string;
  /** The one shown in printed credits (else the first). */
  credit?: boolean;
}

/**
 * Known sites: the profile path a link puts the handle in (`:h`, the first path is also how the
 * profile link is rebuilt), and an icon (an SVG from @quasar/extras or a Material icon name).
 */
const SITES: Record<string, { hosts: string[]; paths: string[]; icon: string }> = {
  GitHub: { hosts: ['github.com'], paths: ['/:h'], icon: fabGithub },
  'Twitter / X': { hosts: ['x.com', 'twitter.com'], paths: ['/:h'], icon: fabXTwitter },
  Bluesky: { hosts: ['bsky.app'], paths: ['/profile/:h'], icon: fabBluesky },
  Instagram: { hosts: ['instagram.com'], paths: ['/:h'], icon: fabInstagram },
  Facebook: { hosts: ['facebook.com', 'fb.com'], paths: ['/:h'], icon: fabFacebook },
  Pinterest: { hosts: ['pinterest.com'], paths: ['/:h'], icon: fabPinterest },
  YouTube: {
    hosts: ['youtube.com'],
    paths: ['/@:h', '/c/:h', '/user/:h', '/channel/:h'],
    icon: fabYoutube,
  },
  TikTok: { hosts: ['tiktok.com'], paths: ['/@:h'], icon: fabTiktok },
  Etsy: { hosts: ['etsy.com'], paths: ['/shop/:h', '/people/:h'], icon: fabEtsy },
  Printables: { hosts: ['printables.com'], paths: ['/@:h', '/social/:h'], icon: printablesIcon },
  Thingiverse: { hosts: ['thingiverse.com'], paths: ['/:h'], icon: thingiverseIcon },
  Threadloop: { hosts: ['threadloop.com'], paths: ['/@:h', '/:h'], icon: 'checkroom' },
  'Sewing Pattern Review': {
    hosts: ['sewingpatternreview.com'],
    paths: ['/members/:h', '/:h'],
    icon: 'rate_review',
  },
  Ravelry: { hosts: ['ravelry.com'], paths: ['/people/:h'], icon: fabRavelry },
};

/** Suggested types; any other can be typed in. */
export const SOCIAL_TYPES = [
  'Website',
  ...[...Object.keys(SITES), 'Mastodon'].sort((a, b) => a.localeCompare(b)),
];

/** A known site (shown as icon/handle); Website and custom types are shown as typed. */
export const isKnownSite = (type: string) => type in SITES || type === 'Mastodon';

/** The icon for a type (custom types: a link). */
export const socialIcon = (type: string) =>
  SITES[type]?.icon ??
  (type === 'Mastodon' ? fabMastodon : type === 'Website' ? 'language' : 'link');

/** The profile link for a handle; Website and custom types link only if they hold a URL. */
export function socialLink({ type, handle }: Social): string | undefined {
  const h = handle.trim();
  if (!h) return undefined;
  const site = SITES[type];
  if (site) return `https://${site.hosts[0]}${site.paths[0]!.replace(':h', encodeURIComponent(h))}`;
  const m = /^@?([^@\s]+)@([^@\s]+)$/.exec(h);
  if (type === 'Mastodon' && m) return `https://${m[2]}/@${m[1]}`;
  return /^https?:\/\//i.test(h) ? h : undefined;
}

/** A known site's link becomes its handle (no "@"); Mastodon links become @user@server. */
export function toHandle(type: string, value: string): string {
  const v = value.trim();
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
  } catch {
    return v.replace(/^@/, '');
  }
  if (!v.includes('/') && !/^https?:/i.test(v)) return v.replace(/^@/, ''); // already a handle
  const host = url.hostname.replace(/^(www|m)\./, '');
  if (type === 'Mastodon') {
    const user = /^\/@([^/]+)/.exec(url.pathname)?.[1];
    return user ? `@${user}@${host}` : v;
  }
  const site = SITES[type];
  if (!site?.hosts.includes(host)) return v;
  for (const p of site.paths) {
    const prefix = p.slice(0, p.indexOf(':h'));
    if (url.pathname.startsWith(prefix)) {
      const h = url.pathname.slice(prefix.length).split('/')[0];
      if (h) return decodeURIComponent(h).replace(/^@/, '');
    }
  }
  return v;
}

/** Socials as written into files: filled-in entries, in order, with the credits pick flagged. */
export const socialsOut = (list: Social[]) =>
  list
    .filter((s) => s.type.trim() && s.handle.trim())
    .map((s) => ({
      type: s.type.trim(),
      handle: s.handle.trim(),
      ...(s.credit ? { credit: true } : {}),
    }));

/** The social printed credits show: the flagged one, else the first. */
export const creditSocial = (list: readonly Social[] | undefined) => {
  const ok = (list ?? []).filter((s) => s.type && s.handle);
  return ok.find((s) => s.credit) ?? ok[0];
};
