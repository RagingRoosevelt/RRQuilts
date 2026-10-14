#!/usr/bin/env python3
"""Download each Cloud9 Fabrics collection's Dropbox folder as a zip named
"<collection name> | YY-MM | <designer>.zip".

    python3 download_cloud9.py                 # asks which listing page(s)
    python3 download_cloud9.py --pages 1       # collections on listing page 1
    python3 download_cloud9.py --pages 1-3     # pages 1 to 3 ("all" = every page)
    python3 download_cloud9.py --dry-run       # list what would be downloaded
    python3 download_cloud9.py --out ~/zips    # where zips go (default: ./cloud9 beside this script)

A collection is skipped when a zip with the same name and date is already there, so it can be
re-run to pick up new collections.
"""
import argparse, html, re, sys, time, urllib.request
from pathlib import Path

BASE = 'https://cloud9fabrics.com/fabrics/'
UA = {'User-Agent': 'Mozilla/5.0 (personal collection downloader)'}
MONTHS = {m: i for i, m in enumerate(
    'jan feb mar apr may jun jul aug sep oct nov dec'.split(), 1)}


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return r.read().decode('utf-8', 'replace')


def text(s):
    return html.unescape(re.sub(r'<[^>]+>', '', s)).strip()


def collections(page):
    """Collection page URLs on one listing page (an empty list past the last page)."""
    try:
        s = get(f'{BASE}page/{page}/')
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return []
        raise
    seen = []
    for u in re.findall(r'href="(https://cloud9fabrics\.com/fabrics/([^"/]+)/)"', s):
        if u[1] not in ('feed', 'page') and u[0] not in seen:
            seen.append(u[0])
    return seen


def details(url):
    """(name, 'YY-MM', designer, dropbox url) from a collection page's header: the first .post-info
    has the h1 ("Pond Days | Mar' 27") and .designer ("By Jayme Marie Designs"), the second the date
    ("March 2027")."""
    s = get(url)
    infos = re.findall(r'<div class="post-info">(.*?)</div>', s, re.S)
    h1 = text(re.search(r'<h1[^>]*>(.*?)</h1>', infos[0], re.S).group(1))
    name = h1.split('|')[0].strip()
    by = re.search(r'class="designer">(.*?)</p>', infos[0], re.S)
    by = by and text(by.group(1))
    if not by:  # some pages leave .designer empty; the gallery heading's subtitle names them
        by = re.search(r'class="subtitle">(.*?)</span>', s, re.S)
        by = by and text(by.group(1))
    by = re.sub(r'^by\s+', '', by, flags=re.I) if by else 'unknown'
    when = '??-??'
    m = len(infos) > 1 and re.search(r'([A-Za-z]{3})[a-z]*\s+\d{2}(\d{2})', text(infos[1]))
    if not m and '|' in h1:  # fall back to the h1's "Mar' 27"
        m = re.search(r'([A-Za-z]{3})[a-z]*\W*(\d{2})\b', h1.split('|')[1])
    if m and m.group(1).lower() in MONTHS:
        when = f'{m.group(2)}-{MONTHS[m.group(1).lower()]:02d}'
    box = re.search(r'https://www\.dropbox\.com/[^"\'<> ]+', s)
    link = html.unescape(box.group(0)) if box else None
    if link:
        link = re.sub(r'([?&])dl=0', r'\1dl=1', link) if 'dl=' in link else link + '&dl=1'
    return name, when, by, link


def safe(s):
    return re.sub(r'[/\0]', '-', s).strip()


def download(url, dest):
    part = dest.with_suffix('.zip.part')
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=300) as r, open(part, 'wb') as f:
        total = int(r.headers.get('Content-Length') or 0)
        done = 0
        while chunk := r.read(1 << 20):
            f.write(chunk)
            done += len(chunk)
            if total:
                print(f'\r    {done >> 20} / {total >> 20} MB', end='', flush=True)
    print()
    part.rename(dest)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--pages', help='"1", "1-3", or "all" (asked for when left out)')
    ap.add_argument('--out', default=str(Path(__file__).resolve().parent / 'cloud9'))
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--delay', type=float, default=2.0, help='seconds between requests')
    a = ap.parse_args()
    out = Path(a.out).expanduser()
    out.mkdir(parents=True, exist_ok=True)
    while not a.pages or not re.fullmatch(r'all|\d+(-\d+)?', a.pages):
        a.pages = input('Listing page(s) to download: a number, a range like 1-3, or "all": ').strip().lower()
    if a.pages == 'all':
        pages = range(1, 1000)
    elif '-' in a.pages:
        lo, hi = map(int, a.pages.split('-'))
        pages = range(lo, hi + 1)
    else:
        pages = [int(a.pages)]

    failed = []
    for page in pages:
        urls = collections(page)
        if not urls:
            break
        print(f'Page {page}: {len(urls)} collections')
        for url in urls:
            time.sleep(a.delay)
            try:
                name, when, by, link = details(url)
            except Exception as e:  # a page that doesn't look like the others
                print(f'  ! {url}: {e}')
                failed.append(url)
                continue
            dest = out / f'{safe(name)} | {when} | {safe(by)}.zip'
            if not link:
                print(f'  - {dest.name}: no Dropbox link, skipped')
                continue
            # Already downloaded: same collection name and date (the designer's spelling may change).
            prefix = f'{safe(name)} | {when} | '
            have = next((f for f in out.iterdir() if f.name.startswith(prefix) and f.suffix == '.zip'), None)
            if have:
                print(f'  = {have.name} (already there)')
                continue
            print(f'  + {dest.name}')
            if a.dry_run:
                continue
            try:
                download(link, dest)
            except Exception as e:
                print(f'  ! {dest.name}: {e}')
                failed.append(url)
    if failed:
        print('\nFailed:\n' + '\n'.join(failed))
        sys.exit(1)


if __name__ == '__main__':
    main()
