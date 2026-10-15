#!/usr/bin/env -S uv run
"""Turn downloaded manufacturer collections into RRQuilts fabric libraries (spec 014).

Each manufacturer folder (cloud9/, artgalleryfabrics/, modafabrics/, robertkaufman/) becomes one
library; each collection zip in it becomes one pack holding a palette of its fabrics:

    libraries/<maker>/library.json                 the index (packs, sizes, fabric average colors)
    libraries/<maker>/packs/<pack>/rrqlib.json     a pack document (palette with fabrics)
    libraries/<maker>/packs/<pack>/<px>/<file>.webp
    libraries/<maker>-256.rrqlib                   zips for importing: Light (256 px)
    libraries/<maker>-512.rrqlib                     Standard (512 + 256 px)
    libraries/<maker>-1024.rrqlib                    Print (1024 px), only with --print

Images are cropped to a centred square, saved as WebP (quality 80) at 256 and 512 px on the long
side, never enlarged. 1024 px copies (for printing) only with --print: they triple a library's size,
and without it packs built with them lose them. Fabrics are 8 in square, marked approximate; author = designer; licensed
"All rights reserved, for personal use" (manufacturers' images are for your own use only).

    uv run build_packs.py                       # every manufacturer folder
    uv run build_packs.py cloud9                # one
    uv run build_packs.py cloud9 --only "pond"  # collections whose name contains this
    uv run build_packs.py --rebuild             # rebuild packs already built
    uv run build_packs.py --print --rebuild     # with 1024 px images too
"""
import argparse, hashlib, io, json, re, shutil, sys, zipfile
from pathlib import Path

from PIL import Image, ImageStat

HERE = Path(__file__).resolve().parent
OUT = HERE / 'libraries'
SIZES = (256, 512)
LICENSE = 'LicenseRef-Personal-Use'
MAKERS = {
    'cloud9': 'Cloud9 Fabrics',
    'artgalleryfabrics': 'Art Gallery Fabrics',
    'modafabrics': 'Moda Fabrics',
    'robertkaufman': 'Robert Kaufman',
}
# Images in collection zips that aren't fabrics.
NOT_FABRIC = re.compile(r'logo|cover|banner|lookbook|header|full[-_ ]?collection|title|catalog', re.I)
# Folders of marketing and product photos, not swatches (Cloud9: social posts, folded bolts, projects).
NOT_SWATCH_DIR = re.compile(
    r'(^|/)(for ig( story)?|bolts?|projects?|pre-?cuts?[^/]*|precut[^/]*|with banner|logo[^/]*|ruler)/', re.I)
# Makers whose zips mix swatches with precuts, patterns and lifestyle shots: only files named like a
# fabric count. Moda: `<style> <color>` (RS = Ruby Star; F/L/M… substrate letters), newer files add
# the print's name ("RS4172 11 Flower Friends-Natural.jpg"). Their photos aren't cropped (panels).
# Makers whose zips hold non-swatch images recognisable by name (`_`/`-` read as spaces). Art Gallery:
# photos of finished quilts, their backings, kits and patterns.
NOT_SWATCH_NAME = {
    'artgalleryfabrics': re.compile(r'quilt(?!ed|ing)|pattern(?!ed)|\bkit\b|backing', re.I),
}
SWATCH_NAME = {
    'modafabrics': re.compile(r'^(RS ?)?\d{3,6}[- ]\d{1,3}[A-Z]{0,3}( (?!copy\b)[^/]*)?\.(jpe?g|png)$', re.I),
}
Image.MAX_IMAGE_PIXELS = 300_000_000  # some manufacturer photos are print-resolution


def slug(s, n=64):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')[:n].strip('-') or 'x'


def name_from_file(file):
    """Port of the app's nameFromFile: "SGF-40300-Gilded-Ginko-Ice_500px.jpg" → (name, sku)."""
    base = re.sub(r'\.[a-z0-9]+$', '', file.split('/')[-1], flags=re.I)
    base = re.sub(r'[-_ ]?\d{2,4}px$', '', base, flags=re.I)
    m = re.match(r'^([A-Z]{1,6}-?\d{2,6}(?:-\d{1,4})?)(?=[-_ ]|$)', base)
    sku = m.group(1) if m else None
    rest = re.sub(r'[-_]+', ' ', base[len(sku):] if sku else base).strip()
    rest = re.sub(r'\s+', ' ', rest)
    return (rest or sku or base), sku


def webp(im, px):
    """`im` resized so its long side is `px` (never enlarged), as WebP bytes and its size."""
    w, h = im.size
    k = min(1, px / max(w, h))
    out = im.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS) if k < 1 else im
    buf = io.BytesIO()
    out.save(buf, 'WEBP', quality=80, method=6)
    return buf.getvalue(), out.size


def build_pack(maker, lib_id, zip_path, meta, out_dir):
    """One collection zip → pack folder. Returns the index entry, or None if nothing usable."""
    stem = zip_path.stem.split(' | ')
    when, name, designer = (stem + ['', '', ''])[:3] if len(stem) >= 3 else ('??-??', zip_path.stem, 'unknown')
    designer = (meta or {}).get('designer') or designer
    pack_id = f'{lib_id}-{slug(name, 120)}'
    pdir = out_dir / 'packs' / pack_id
    z = zipfile.ZipFile(zip_path)
    # The earlier build's revision and contents: a pack whose fabrics or images change gets the next
    # revision, so connected apps download it again on update.
    old = json.loads((pdir / 'rrqlib.json').read_text()) if (pdir / 'rrqlib.json').exists() else None
    shutil.rmtree(pdir, ignore_errors=True)  # no images left from an earlier build
    fabrics, ids, preview = [], set(), []
    sizes_bytes = {str(s): 0 for s in SIZES}
    for entry in sorted(z.namelist()):
        if not re.search(r'\.(jpe?g|png|webp)$', entry, re.I) or entry.startswith('__MACOSX/'):
            continue
        if NOT_FABRIC.search(entry.split('/')[-1]) or NOT_SWATCH_DIR.search(entry):
            continue
        skip = NOT_SWATCH_NAME.get(maker)
        if skip and skip.search(re.sub(r'[_-]+', ' ', entry.split('/')[-1])):
            continue
        named = SWATCH_NAME.get(maker)
        m = named and named.match(entry.split('/')[-1])
        if named and not m:
            continue
        try:
            im = Image.open(io.BytesIO(z.read(entry))).convert('RGB')
        except Exception:
            print(f'    ! unreadable: {entry}')
            continue
        im.thumbnail((2048, 2048))  # plenty for 1024 px, and quick
        w, h = im.size
        long_in = 8
        if named:
            if max(w, h) > 1.6 * min(w, h):
                long_in = 44  # a panel or border print: about a width of fabric
        elif max(w, h) > 1.6 * min(w, h):
            continue  # banners and lookbook spreads, not swatches
        else:
            s = min(w, h)
            im = im.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s))
            w, h = im.size
        fname, sku = name_from_file(entry)
        if m and m.group(2):  # newer Moda names: "RS4172 11 Flower Friends-Natural"
            stem = entry.split('/')[-1].rsplit('.', 1)[0]
            sku, fname = stem[: -len(m.group(2))].strip(), m.group(2).strip()
        elif m:  # "13900 11": style and color only
            sku = entry.split('/')[-1].rsplit('.', 1)[0]
            fname = f'{name} {sku}'
        if fname.isdigit() and not sku:  # Cloud9 style numbers
            sku, fname = fname, f'{name} {fname}'
        fid = f'{lib_id}.{slug(sku or fname)}'
        n = 2
        while fid in ids:
            fid = f'{lib_id}.{slug(sku or fname, 58)}-{n}'
            n += 1
        ids.add(fid)
        file = slug(sku or fname, 80)
        images = []
        for px in SIZES:
            data, (iw, ih) = webp(im, px)
            if images and images[-1]['width'] == iw:  # source smaller than this size: no larger copy
                continue
            real_px = max(iw, ih)
            rel = f'{real_px}/{file}.webp'
            (pdir / str(real_px)).mkdir(parents=True, exist_ok=True)
            (pdir / rel).write_bytes(data)
            images.append({'px': real_px, 'sha256': hashlib.sha256(data).hexdigest(), 'type': 'image/webp',
                           'width': iw, 'height': ih, 'path': rel})
            sizes_bytes[str(min(s for s in SIZES if real_px <= s))] += len(data)
        avg = [round(c) for c in ImageStat.Stat(im.resize((64, 64), Image.BOX)).mean]
        main = [i for i in images if i['px'] <= 512][-1]
        fabric = {
            'id': fid,
            'notecard': {'name': fname, **({'reference': f'{MAKERS[maker]} {sku}'} if sku else {})},
            'author': designer,
            'license': LICENSE,
            'image': {k: main[k] for k in ('sha256', 'type', 'width', 'height')},
            'size': [round(long_in * w / max(w, h), 2), round(long_in * h / max(w, h), 2)],
            'approximate': True,
            'average': avg,
            'manufacturer': MAKERS[maker],
            **({'sku': sku} if sku else {}),
            'sizes': images,
        }
        fabrics.append(fabric)
        preview.append({'id': fid, 'name': fname, 'average': avg})
    if not fabrics:
        return None
    palette_id = f'{lib_id}.{slug(name, 58)}'
    revision = (old or {}).get('revision', 0) + (1 if contents(old) != contents_of(fabrics) else 0)
    doc = {
        'format': 'rrqlib', 'version': 2, 'units': 'in', 'kind': 'pack',
        'id': pack_id, 'revision': revision, 'name': name,
        'description': f'{name} by {designer}, {MAKERS[maker]}' + (f' ({when})' if when != '??-??' else ''),
        'author': {'name': designer}, 'license': LICENSE,
        'categories': [],
        'library': {'id': lib_id, 'name': MAKERS[maker]},
        'items': [{'type': 'colors', 'data': {
            'id': palette_id, 'notecard': {'name': name, **({'tags': meta['styles']} if meta and meta.get('styles') else {})},
            'author': designer, 'license': LICENSE, 'colors': [], 'fabrics': fabrics}}],
    }
    pdir.mkdir(parents=True, exist_ok=True)
    (pdir / 'rrqlib.json').write_text(json.dumps(doc, indent=1, ensure_ascii=False))
    return {'id': pack_id, 'name': name, 'kind': 'palettes', 'path': f'packs/{pack_id}/rrqlib.json',
            'items': len(fabrics), 'revision': revision, 'date': when, 'designer': designer,
            'sizes': sizes_bytes, 'fabrics': preview}


def contents_of(fabrics):
    """What a pack's update would change: its fabrics, their names and images."""
    return sorted((f['id'], f['notecard']['name'], tuple(s['sha256'] for s in f.get('sizes', [])))
                  for f in fabrics)


def contents(doc):
    return contents_of([f for it in (doc or {}).get('items', []) for f in it['data'].get('fabrics', [])]) \
        if doc else None


def zip_library(out_dir, dest, keep):
    """A `.rrqlib` zip of the library with only the image sizes `keep(px)` accepts."""
    # Only what the index and its packs name: never images left over from earlier builds.
    index = json.loads((out_dir / 'library.json').read_text())
    files = ['library.json']
    for p in index['packs']:
        files.append(p['path'])
        base = p['path'].rsplit('/', 1)[0] + '/' if '/' in p['path'] else ''
        doc = json.loads((out_dir / p['path']).read_text())
        files += sorted({base + s['path'] for it in doc['items'] for f in (it.get('data') or {}).get('fabrics') or []
                         for s in f.get('sizes', []) if keep(s['px'])})
    with zipfile.ZipFile(dest, 'w', zipfile.ZIP_STORED) as z:
        for rel in files:
            z.write(out_dir / rel, rel)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('makers', nargs='*', help=f'folders to build (default: {", ".join(MAKERS)})')
    ap.add_argument('--only', help='only collections whose name contains this (case-insensitive)')
    ap.add_argument('--rebuild', action='store_true', help='rebuild packs that are already built')
    ap.add_argument('--print', action='store_true',
                    help='also make 1024 px images (for printing) and <maker>-1024.rrqlib')
    a = ap.parse_args()
    global SIZES
    if a.print:
        SIZES = (256, 512, 1024)
    for maker in a.makers or [m for m in MAKERS if (HERE / m).is_dir()]:
        if maker not in MAKERS:
            sys.exit(f'Unknown manufacturer folder: {maker}')
        src = HERE / maker
        lib_id = slug(MAKERS[maker])
        out_dir = OUT / maker
        index_path = out_dir / 'library.json'
        index = json.loads(index_path.read_text()) if index_path.exists() else None
        packs = {p['id']: p for p in (index or {}).get('packs', [])}
        meta = {}
        cj = src / 'collections.json'
        if cj.exists():
            for c in json.loads(cj.read_text()):
                meta[c.get('file', '')] = c
        print(f'{MAKERS[maker]}:')
        for zp in sorted(src.glob('*.zip')):
            name = zp.stem.split(' | ')[1] if ' | ' in zp.stem else zp.stem
            if a.only and a.only.lower() not in name.lower():
                continue
            pack_id = f'{lib_id}-{slug(name, 120)}'
            if pack_id in packs and not a.rebuild and (out_dir / packs[pack_id]['path']).exists():
                dropped = 1024 not in SIZES and drop_large(out_dir, packs[pack_id])
                print(f'  = {name}' + (' (1024 px removed)' if dropped else ''))
                continue
            m = meta.get(zp.name) or {}
            try:
                entry = build_pack(maker, lib_id, zp, {'designer': m.get('designer'), 'styles': m.get('styles')}, out_dir)
            except zipfile.BadZipFile:
                print(f'  - {name}: damaged zip, download it again ({zp.name})')
                continue
            if entry:
                packs[pack_id] = entry
                print(f'  + {name} ({entry["items"]} fabrics)')
            else:
                print(f'  - {name}: no fabric images')
        if not packs:
            continue
        index = {
            'format': 'rrqlib-index', 'version': 1, 'id': lib_id, 'name': MAKERS[maker],
            'description': f'{MAKERS[maker]} collections, from their downloads. For personal use only.',
            'author': {'name': MAKERS[maker]}, 'license': LICENSE,
            'revision': (index or {}).get('revision', 0) + 1,
            'packs': sorted(packs.values(), key=lambda p: (p.get('date') or '', p['name']), reverse=True),
        }
        out_dir.mkdir(parents=True, exist_ok=True)
        index_path.write_text(json.dumps(index, indent=1, ensure_ascii=False))
        zip_library(out_dir, OUT / f'{maker}-256.rrqlib', lambda px: px <= 256)
        zip_library(out_dir, OUT / f'{maker}-512.rrqlib', lambda px: px <= 512)
        if 1024 in SIZES:
            zip_library(out_dir, OUT / f'{maker}-1024.rrqlib', lambda px: px > 512)
        else:
            (OUT / f'{maker}-1024.rrqlib').unlink(missing_ok=True)
        print(f'  → {len(packs)} packs; {OUT.relative_to(HERE)}/{maker}-{{{",".join(map(str, SIZES))}}}.rrqlib')


def drop_large(out_dir, entry):
    """Remove a pack's images over 512 px (built before they were dropped). True if any were."""
    pdir = out_dir / Path(entry['path']).parent
    large = [d for d in pdir.iterdir() if d.is_dir() and d.name.isdigit() and int(d.name) > 512]
    if not large:
        return False
    doc_path = pdir / 'rrqlib.json'
    doc = json.loads(doc_path.read_text())
    for item in doc['items']:
        for f in (item.get('data') or {}).get('fabrics') or []:
            f['sizes'] = [x for x in f.get('sizes', []) if x['px'] <= 512]
    doc_path.write_text(json.dumps(doc, indent=1, ensure_ascii=False))
    for d in large:
        for f in d.iterdir():
            f.unlink()
        d.rmdir()
    entry.get('sizes', {}).pop('1024', None)
    return True


if __name__ == '__main__':
    main()
