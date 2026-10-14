#!/usr/bin/env -S uv run
"""Download Art Gallery Fabrics collections as zips of their fabric images, named
"YY-MM | <collection name> | <designer>.zip". The Pure Solids collections instead become one RRQuilts
palette and collection, "Pure Solids" ("Pure Solids | Art Gallery Fabrics.rrqplt"), with one color
per solid.

    uv run download_artgalleryfabrics.py                  # every collection
    uv run download_artgalleryfabrics.py --only sgraffito # collections whose name contains this
    uv run download_artgalleryfabrics.py --dry-run        # list what would be made
    uv run download_artgalleryfabrics.py --out ~/zips     # default: ./artgalleryfabrics beside this

The site has no bulk download, so each fabric image (500px, the largest it serves) is fetched one by
one. collections.json lists every collection seen (kept across runs). A collection is skipped when
a file with the same name and date is already there, so it can be re-run to pick up new collections. The site lists later colors of a collection as collections of
their own ("Linen Blend Solids NEW", "Les Petits / new colors"); those are merged into one zip under
the base name, which gains any fabrics a newer page adds. The Pure Solids palette is re-checked each run and gains any new
colors (colors no longer listed stay). Collections the site gives no date get "??-??". Palettes need
Pillow (installed by uv).
"""
import argparse, html, io, json, re, shutil, sys, time, urllib.error, urllib.parse, urllib.request, zipfile
from pathlib import Path

import collections_index

SITE = 'https://www.artgalleryfabrics.com'
GALLERY = f'{SITE}/cgi-bin/fabricshop/gallery.cgi?Category=13'
UA = {'User-Agent': 'Mozilla/5.0 (personal collection downloader)'}
MONTHS = {m: i for i, m in enumerate('jan feb mar apr may jun jul aug sep oct nov dec'.split(), 1)}
# Tiles for bundles and whole-collection packs, not single fabrics.
BUNDLE = re.compile(r'full collection|\bFULL\d|bundle|pack\)|bolts|squares|fat quarters|half yards', re.I)


def fetch(url):
    url = urllib.parse.quote(url, safe=':/?&=#%+')  # some image names have spaces
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


def base_name(name):
    """'Linen Blend Solids NEW', 'Les Petits / new colors', 'Flannel Solids - NEW COLORS' → the
    collection they add to."""
    return re.sub(r'\s*[-/]?\s*new(\s+colou?rs?)?\s*$', '', name.strip(), flags=re.I).strip() or name.strip()


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


PALETTE = 'Pure Solids | Art Gallery Fabrics.rrqplt'


def save_palette(path, colors):
    palette = {'format': 'rrqplt', 'version': 1, 'app': 'download_artgalleryfabrics.py',
               'collection': {'id': 'agf.pure-solids', 'author': 'Art Gallery Fabrics',
                              'notecard': {'name': 'Pure Solids', 'reference': GALLERY,
                                           'notes': 'Art Gallery Fabrics Pure Solids, every collection. '
                                                    'Colors averaged from the swatch photos.'},
                              'colors': colors}}
    part = path.with_name(path.name + '.part')
    part.write_text(json.dumps(palette, indent=2, ensure_ascii=False))
    part.replace(path)


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
    pal = out / PALETTE
    colors = json.loads(pal.read_text(encoding='utf-8'))['collection']['colors'] if pal.exists() else []
    solid_pages = []  # the site's Pure Solids collections, all one "Pure Solids" collection here
    # The site lists a collection's later colors as their own collections ("Linen Blend Solids NEW",
    # "Les Petits / new colors"): group them under the base name and make one zip per group.
    groups = {}
    for cat, name, by, when in collections():
        groups.setdefault(base_name(name).lower(), []).append((cat, name, by, when))
    for members in groups.values():
        name = base_name(members[0][1])
        if a.only and not any(a.only.lower() in n.lower() for _, n, _, _ in members):
            continue
        try:
            pages, items, dates = [], [], []
            for cat, mname, by, when in members:
                url = f'{SITE}/cgi-bin/fabricshop/gallery.cgi?Category={cat}'
                time.sleep(a.delay)
                s = page(url)
                if not when:
                    m = re.search(r'Available:\s*(\d{1,2})-\d{1,2}-(\d{4})', s)
                    when = m and yy_mm(m.group(1), m.group(2))
                dates += [when] if when else []
                pages.append(url)
                items += [(cat, *x) for x in fabrics(cat, s)]
            by = next((b for _, _, b, _ in members if b != 'unknown'), 'unknown')
            when = max(dates) if dates else '??-??'  # the newest page's date
            seen = set()  # the same fabric listed on two pages
            items = [x for x in items if not ((x[2] or x[1]) in seen or seen.add(x[2] or x[1]))]
            solids = 'pure solids' in name.lower()
            if solids:  # into the one Pure Solids palette: only colors it doesn't have yet
                known = {c['id'] for c in colors}
                new = [x for x in items if f'agf.{slug(x[2] or x[1])}' not in known]
                solid_pages += pages
                print(f'  {"+" if new else "="} {PALETTE} ← {name} ({len(new)} new colors)')
                if a.dry_run or not new:
                    continue
                for i, (cat, fname, sku, thumb, tile) in enumerate(new, 1):
                    time.sleep(a.delay)
                    print(f'\r    {i}/{len(new)}', end='', flush=True)
                    _, data = image(cat, thumb, tile)
                    colors.append({'id': f'agf.{slug(sku or fname)}',
                                   'notecard': {'name': fname, 'reference': f'Art Gallery Fabrics {sku}'.strip()},
                                   'author': by, 'rgb': swatch_rgb(data)})
                print()
                save_palette(pal, colors)  # saved per collection, so an interruption loses little
                continue
            merged = len(members) > 1
            dest = out / f'{when} | {safe(name)} | {safe(by)}.zip'
            # A merged collection matches on its name alone (its date follows its newest page).
            have = next((f for f in out.glob('*.zip') if (f.name.split(' | ')[1:2] == [safe(name)]
                         if merged else f.name.startswith(f'{when} | {safe(name)} | '))), None)
            todo = items
            if have and merged:  # add fabrics a newer page brought (matched by SKU in the file name)
                inside = ' '.join(zipfile.ZipFile(have).namelist()).lower()
                todo = [x for x in items if (x[2] or slug(x[1])).lower() not in inside]
            elif have:
                todo = []
            if merged and have and not todo and not a.dry_run:
                parts = {safe(n) for _, n, _, _ in members} - {safe(name)}
                for f in out.glob('*.zip'):
                    if f != have and f.name.split(' | ')[1:2] and f.name.split(' | ')[1] in parts:
                        f.unlink()
                        print(f'  - {f.name} (merged into {have.name})')
            row = {'name': name, 'date': when, 'designer': by, 'url': pages[0], 'pages': pages,
                   'kind': 'images', 'items': len(items), 'file': (have or dest).name,
                   'downloaded': 'yes' if have and not todo else 'no'}
            rows.append(row)
            if have and not todo:
                print(f'  = {have.name} (already there)')
                continue
            print(f'  + {dest.name} ({len(todo)} {"new " if have else ""}fabrics'
                  f'{f", from {len(members)} pages" if merged else ""})')
            if a.dry_run or not todo:
                continue
            part = dest.with_name(dest.name + '.part')
            if have:
                shutil.copy(have, part)
            with zipfile.ZipFile(part, 'a' if have else 'w', zipfile.ZIP_STORED) as z:  # JPEGs don't compress
                names = set(z.namelist())
                for i, (cat, fname, sku, thumb, tile) in enumerate(todo, 1):
                    time.sleep(a.delay)
                    print(f'\r    {i}/{len(todo)}', end='', flush=True)
                    img, data = image(cat, thumb, tile)
                    arc = img.rsplit('/', 1)[-1]
                    if arc in names:
                        continue
                    names.add(arc)
                    z.writestr(arc, data)
            print()
            part.replace(dest)
            if have and have != dest:
                have.unlink()  # the date moved on: the zip takes the newest page's date
            row.update(file=dest.name, downloaded='yes')
        except Exception as e:
            print(f'\n  ! {name}: {e}')
            failed.append(name)
    if solid_pages:
        rows.append({'name': 'Pure Solids', 'date': '??-??', 'designer': 'Art Gallery Fabrics',
                     'url': f'{GALLERY}#pure-solids', 'pages': solid_pages, 'kind': 'palette',
                     'items': len(colors), 'file': PALETTE, 'downloaded': 'yes' if pal.exists() else 'no'})
    collections_index.update(out / 'collections.json', rows)
    if failed:
        print('\nFailed:\n' + '\n'.join(failed))
        sys.exit(1)


if __name__ == '__main__':
    main()
