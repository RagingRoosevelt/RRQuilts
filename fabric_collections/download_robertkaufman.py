#!/usr/bin/env -S uv run
"""Download Robert Kaufman collections as zips of their fabric images, named
"YY-MM | <collection name> | <designer>.zip" (images 1000 px, "<SKU> <Color>.jpg"). The Kona solids
lines become RRQuilts palettes instead, "<line> | Robert Kaufman.rrqplt", one named color per solid.

    uv run download_robertkaufman.py                  # every collection
    uv run download_robertkaufman.py --only kona      # collections whose name contains this
    uv run download_robertkaufman.py --dry-run        # list what would be made
    uv run download_robertkaufman.py --out ~/zips     # default: ./robertkaufman beside this

Collections come from the site's Product Images list. A collection is skipped when a zip with the
same name and date is already there; the Kona palettes are re-checked each run and gain any new
colors (colors no longer listed stay). Collections the site gives no date get "??-??".
collections.json lists every collection seen (kept across runs).
"""
import argparse, html, io, json, re, sys, time, urllib.error, urllib.parse, urllib.request, zipfile
from pathlib import Path

import collections_index

SITE = 'https://www.robertkaufman.com'
LIST = f'{SITE}/fabrics-release/product-images/'
UA = {'User-Agent': 'Mozilla/5.0 (personal collection downloader)'}
MONTHS = {m: i for i, m in enumerate('jan feb mar apr may jun jul aug sep oct nov dec'.split(), 1)}
# Solid lines: a palette each, not image zips.
SOLIDS = {'kona_cotton', 'kona_premium', 'kona_60', 'kona_60_premium'}


def fetch(url):
    url = urllib.parse.quote(url, safe=':/?&=#%+')  # some image names have spaces
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
        return r.read()


def text(s):
    return re.sub(r'\s+', ' ', html.unescape(html.unescape(re.sub(r'<[^>]+>', ' ', s)))).strip()


def safe(s):
    return re.sub(r'[/\0]', '-', s).strip()


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')[:64] or 'x'


def collections():
    """[(slug, name)] from the Product Images collection list."""
    s = fetch(LIST).decode('utf-8', 'replace')
    sel = re.search(r'<select[^>]*>(.*?)</select>', s, re.S)
    return [(v, text(n).replace('®', '').strip())
            for v, n in re.findall(r'<option[^>]*value="([^"]+)"[^>]*>([^<]*)<', sel.group(1))]


def details(key):
    """(designer, 'YY-MM' or None, [(sku, color)]) from a collection page (all fabrics at once)."""
    s = fetch(f'{SITE}/fabrics/{key}/?page=All').decode('utf-8', 'replace')
    h1 = re.search(r"<h1 class='page_title'>(.*?)</h1>", s, re.S)
    by = re.search(r'\bby\s*<a[^>]*>(.*?)</a>', h1.group(1), re.S) if h1 else None
    by = re.sub(r'\s+', ' ', text(by.group(1))) if by else 'Robert Kaufman'  # the house's own lines
    when = None
    m = re.search(r'Available in stores starting ([A-Za-z]+) (\d{4})', s)
    if m and m.group(1)[:3].lower() in MONTHS:
        when = f'{m.group(2)[2:]}-{MONTHS[m.group(1)[:3].lower()]:02d}'
    items = []
    for sku, li in re.findall(r'<li\s+id="li_([^"]+)"(.*?)(?=<li\s+id="li_|</ul>)', s, re.S):
        info = re.search(r'fabrics_yards_item_info">(.*?)</div>', li, re.S)
        info = re.sub(r'<wbr>|<span[^>]*>.*?</span>', '', info.group(1) if info else '', flags=re.S)
        color = text(info)
        color = color[len(sku):].strip() if color.upper().startswith(sku.upper()) else color  # "K001-1065 CELADON"
        items.append((sku, color.title()))  # CELADON → Celadon
    return by, when, items


def swatch_rgb(data):
    """Average color of the middle half of a solid's swatch."""
    from PIL import Image, ImageStat
    im = Image.open(io.BytesIO(data)).convert('RGB')
    w, h = im.size
    return [round(c) for c in ImageStat.Stat(im.crop((w // 4, h // 4, w * 3 // 4, h * 3 // 4))).mean]


def save_palette(path, name, url, colors):
    palette = {'format': 'rrqplt', 'version': 1, 'app': 'download_robertkaufman.py',
               'collection': {'id': f'rk.{slug(name)}', 'author': 'Robert Kaufman',
                              'notecard': {'name': name, 'reference': url,
                                           'notes': f'Robert Kaufman {name}. Colors averaged from the swatch photos.'},
                              'colors': colors}}
    part = path.with_name(path.name + '.part')
    part.write_text(json.dumps(palette, indent=2, ensure_ascii=False))
    part.replace(path)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--only', help='only collections whose name contains this (case-insensitive)')
    ap.add_argument('--out', default=str(Path(__file__).resolve().parent / 'robertkaufman'))
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--delay', type=float, default=0.5, help='seconds between requests')
    a = ap.parse_args()
    out = Path(a.out).expanduser()
    out.mkdir(parents=True, exist_ok=True)

    failed, rows = [], []
    for key, name in collections():
        if a.only and a.only.lower() not in name.lower():
            continue
        url = f'{SITE}/fabrics/{key}/'
        try:
            time.sleep(a.delay)
            by, when, items = details(key)
            when = when or '??-??'
            if key in SOLIDS:  # a palette: only colors it doesn't have yet
                pal = out / f'{safe(name)} | Robert Kaufman.rrqplt'
                colors = json.loads(pal.read_text(encoding='utf-8'))['collection']['colors'] if pal.exists() else []
                known = {c['id'] for c in colors}
                new = [x for x in items if f'rk.{slug(x[0])}' not in known]
                rows.append({'name': name, 'date': when, 'designer': by, 'url': url, 'kind': 'palette',
                             'items': len(items), 'file': pal.name, 'downloaded': 'no' if new else 'yes'})
                print(f'  {"+" if new else "="} {pal.name} ({len(new)} new colors)')
                if a.dry_run or not new:
                    continue
                for i, (sku, color) in enumerate(new, 1):
                    time.sleep(a.delay)
                    print(f'\r    {i}/{len(new)}', end='', flush=True)
                    data = fetch(f'{SITE}/assets/fabric/thumbs/{sku}.jpg')  # 400 px is plenty to average
                    colors.append({'id': f'rk.{slug(sku)}',
                                   'notecard': {'name': color or sku, 'reference': f'Robert Kaufman {sku}'},
                                   'author': 'Robert Kaufman', 'rgb': swatch_rgb(data)})
                    if i % 50 == 0:
                        save_palette(pal, name, url, colors)  # a long line: keep what's done
                print()
                save_palette(pal, name, url, colors)
                rows[-1]['downloaded'] = 'yes'
                continue
            prefix = f'{when} | {safe(name)} | '
            dest = out / f'{prefix}{safe(by)}.zip'
            have = next((f for f in out.glob('*.zip') if f.name.startswith(prefix)), None)
            row = {'name': name, 'date': when, 'designer': by, 'url': url, 'kind': 'images',
                   'items': len(items), 'file': (have or dest).name, 'downloaded': 'yes' if have else 'no'}
            rows.append(row)
            if have:
                print(f'  = {have.name} (already there)')
                continue
            print(f'  + {dest.name} ({len(items)} fabrics)')
            if a.dry_run or not items:
                continue
            part = dest.with_name(dest.name + '.part')
            with zipfile.ZipFile(part, 'w', zipfile.ZIP_STORED) as z:  # JPEGs don't compress
                names = set()
                for i, (sku, color) in enumerate(items, 1):
                    time.sleep(a.delay)
                    print(f'\r    {i}/{len(items)}', end='', flush=True)
                    try:
                        data = fetch(f'{SITE}/assets/fabric/detail/{sku}.jpg')
                    except urllib.error.HTTPError:
                        data = fetch(f'{SITE}/assets/fabric/thumbs/{sku}.jpg')  # no large image
                    arc = safe(f'{sku} {color}'.strip()) + '.jpg'
                    if arc not in names:
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
