#!/usr/bin/env python3
"""Download Art Gallery Fabrics collections as zips of their fabric images, named
"<collection name> | YY-MM | <designer>.zip". The Pure Solids collections become RRQuilts palettes
("<collection name> | YY-MM | <designer>.rrqplt") with one color per solid instead.

    python3 download_artgalleryfabrics.py                  # every collection
    python3 download_artgalleryfabrics.py --only sgraffito # collections whose name contains this
    python3 download_artgalleryfabrics.py --dry-run        # list what would be made
    python3 download_artgalleryfabrics.py --out ~/zips     # default: ./artgalleryfabrics beside this

The site has no bulk download, so each fabric image (500px, the largest it serves) is fetched one by
one. collections.json lists every collection seen (kept across runs). A collection is skipped when
a file with the same name and date is already there, so it can be re-run to pick up new collections; the Pure Solids palettes are re-checked each run and gain any
new colors (colors no longer listed stay). Collections the site gives no date get "??-??". Palettes need
Pillow (to average each swatch's color).
"""
import argparse, html, io, json, re, sys, time, urllib.error, urllib.request, zipfile
from pathlib import Path

import collections_index

SITE = 'https://www.artgalleryfabrics.com'
GALLERY = f'{SITE}/cgi-bin/fabricshop/gallery.cgi?Category=13'
UA = {'User-Agent': 'Mozilla/5.0 (personal collection downloader)'}
MONTHS = {m: i for i, m in enumerate('jan feb mar apr may jun jul aug sep oct nov dec'.split(), 1)}
# Tiles for bundles and whole-collection packs, not single fabrics.
BUNDLE = re.compile(r'full collection|\bFULL\d|bundle|pack\)|bolts|squares|fat quarters|half yards', re.I)


def fetch(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return r.read()


def page(url):
    return fetch(url).decode('cp1252', 'replace')  # the site is Windows-1252, not UTF-8


def text(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s))).strip()


def yy_mm(month, year):
    m = MONTHS.get(month[:3].lower()) if not month.isdigit() else int(month)
    return f'{year[-2:]}-{m:02d}' if m else None


def collections():
    """[(category id, name, designer, 'YY-MM' or None)] from the collections gallery."""
    out = []
    for box in re.findall(r'<div class="masonbox[^"]*">(.*?)<!-- category-inside', page(GALLERY), re.S):
        n = re.search(r'Category=(\d+)">([^<]+)</a>', box)
        if not n:
            continue
        by = re.search(r'by <a[^>]*>([^<]+)</a>', box)
        when = re.search(r'Available\s+([A-Za-z]+)\s*\d*\s*,\s*(\d{4})', box)
        out.append((n.group(1), text(n.group(2)), text(by.group(1)) if by else 'unknown',
                    when and yy_mm(when.group(1), when.group(2))))
    return out


def fabrics(cat, s):
    """[(name, sku, thumb url, fabric page `file` number)] for the single fabrics on a collection page."""
    out = []
    tiles = re.findall(r'<!-- FabricShop Thumbnail HTML (\d+) -->(.*?)<!-- FabricShop Thumbnail HTMLS', s, re.S)
    for _, t in tiles:
        name = re.search(r'<div style="font-weight: bold">(.*?)</div>', t, re.S)
        # "Temporarily/Temporally out of stock Marshmallow" → "Marshmallow"
        name = re.sub(r'^temp\w* out of stock\s*', '', text(name.group(1)) if name else '', flags=re.I)
        sku = re.search(r'<span style="font-weight: bold">(.*?)</span>', t, re.S)
        sku = text(sku.group(1)) if sku else ''
        thumb = re.search(r'<img src="([^"]+)"', t)
        file = re.search(r'func=show&file=(\d+)', t)  # the fabric's own page (not the tile's position)
        if thumb and file and not BUNDLE.search(name + ' ' + text(t)):
            out.append((name, sku, thumb.group(1), file.group(1)))
    return out


def image(cat, thumb, file):
    """The fabric's largest image: thumbs/X-150px.jpg is usually media/X_500px.jpg; otherwise read
    it from the fabric's own page."""
    guess = re.sub(r'-?150px(\.\w+)$', r'_500px\1', thumb.replace('/thumbs/', '/media/'))
    if guess != thumb:
        try:
            return guess, fetch(guess)
        except urllib.error.HTTPError:
            pass
    show = page(f'{SITE}/cgi-bin/fabricshop/gallery.cgi?func=show&file={file}&Category={cat}&Page=1&v=1')
    m = re.search(r'(https?://[^"\s>]+/categories/\d+/+media/[^"\s>]+\.(?:jpe?g|png))', show, re.I)
    url = m.group(1) if m else thumb
    return url, fetch(url)


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')[:64] or 'x'


def safe(s):
    return re.sub(r'[/\0]', '-', s).strip()


def swatch_rgb(data):
    """Average color of the middle half of a solid's swatch (skips edges, shadows, labels)."""
    from PIL import Image, ImageStat
    im = Image.open(io.BytesIO(data)).convert('RGB')
    w, h = im.size
    mean = ImageStat.Stat(im.crop((w // 4, h // 4, w * 3 // 4, h * 3 // 4))).mean
    return [round(c) for c in mean]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--only', help='only collections whose name contains this (case-insensitive)')
    ap.add_argument('--out', default=str(Path(__file__).resolve().parent / 'artgalleryfabrics'))
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--delay', type=float, default=0.5, help='seconds between requests')
    a = ap.parse_args()
    out = Path(a.out).expanduser()
    out.mkdir(parents=True, exist_ok=True)

    failed = []
    rows = []  # for collections.json
    for cat, name, by, when in collections():
        if a.only and a.only.lower() not in name.lower():
            continue
        url = f'{SITE}/cgi-bin/fabricshop/gallery.cgi?Category={cat}'
        try:
            time.sleep(a.delay)
            s = page(url)
            if not when:
                m = re.search(r'Available:\s*(\d{1,2})-\d{1,2}-(\d{4})', s)
                when = m and yy_mm(m.group(1), m.group(2))
            when = when or '??-??'
            solids = 'pure solids' in name.lower()
            prefix = f'{safe(name)} | {when} | '
            dest = out / f'{prefix}{safe(by)}.{"rrqplt" if solids else "zip"}'
            have = next((f for f in out.iterdir() if f.name.startswith(prefix) and f.suffix == dest.suffix), None)
            items = fabrics(cat, s)
            row = {'name': name, 'date': when, 'designer': by, 'url': url,
                   'kind': 'palette' if solids else 'images', 'items': len(items),
                   'file': (have or dest).name, 'downloaded': 'yes' if have else 'no'}
            rows.append(row)
            # A palette is re-checked for new colors; anything else already there is done.
            old = json.loads(have.read_text(encoding='utf-8'))['collection']['colors'] if have and solids else []
            known = {c['id'] for c in old}
            new = [x for x in items if f'agf.{slug(x[1] or x[0])}' not in known] if solids else items
            if have and not new:
                print(f'  = {have.name} (already there)')
                continue
            if have:
                dest = have
                print(f'  + {dest.name} ({len(new)} new colors)')
            else:
                print(f'  + {dest.name} ({len(items)} {"colors" if solids else "fabrics"})')
            if a.dry_run or not new:
                continue
            part = dest.with_name(dest.name + '.part')
            if solids:
                colors = list(old)  # colors the site no longer lists stay in the palette
                for i, (fname, sku, thumb, tile) in enumerate(new, 1):
                    time.sleep(a.delay)
                    print(f'\r    {i}/{len(new)}', end='', flush=True)
                    _, data = image(cat, thumb, tile)
                    colors.append({'id': f'agf.{slug(sku or fname)}',
                                   'notecard': {'name': fname, 'reference': f'Art Gallery Fabrics {sku}'.strip()},
                                   'author': by, 'rgb': swatch_rgb(data)})
                print()
                seen = set()
                colors = [c for c in colors if not (c['id'] in seen or seen.add(c['id']))]
                palette = {'format': 'rrqplt', 'version': 1, 'app': 'download_artgalleryfabrics.py',
                           'collection': {'id': f'agf.{slug(name)}',
                                          'notecard': {'name': name, 'reference': url,
                                                       'notes': f'{name} by {by}, Art Gallery Fabrics. '
                                                                'Colors averaged from the swatch photos.'},
                                          'author': by, 'colors': colors}}
                part.write_text(json.dumps(palette, indent=2, ensure_ascii=False))
            else:
                with zipfile.ZipFile(part, 'w', zipfile.ZIP_STORED) as z:  # JPEGs don't compress
                    names = set()
                    for i, (fname, sku, thumb, tile) in enumerate(items, 1):
                        time.sleep(a.delay)
                        print(f'\r    {i}/{len(items)}', end='', flush=True)
                        img, data = image(cat, thumb, tile)
                        arc = img.rsplit('/', 1)[-1]
                        while arc in names:
                            arc = f'{tile}-{arc}'
                        names.add(arc)
                        z.writestr(arc, data)
                print()
            part.replace(dest)
            row['downloaded'] = 'yes'
        except Exception as e:
            print(f'\n  ! {name}: {e}')
            failed.append(name)
    collections_index.update(out / 'collections.json', rows)
    if failed:
        print('\nFailed:\n' + '\n'.join(failed))
        sys.exit(1)


if __name__ == '__main__':
    main()
