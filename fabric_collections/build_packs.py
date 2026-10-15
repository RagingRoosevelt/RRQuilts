#!/usr/bin/env -S uv run
"""Turn downloaded manufacturer collections into RRQuilts fabric libraries (spec 014).

Each manufacturer folder (cloud9/, artgalleryfabrics/, modafabrics/, robertkaufman/) becomes one
library; each collection zip in it becomes one pack holding a palette of its fabrics:

    libraries/<maker>/library.json                 the index (packs, sizes, fabric average colors)
    libraries/<maker>/packs/<pack>/rrqlib.json     a pack document (palette with fabrics)
    libraries/<maker>/packs/<pack>/<px>/<file>.webp
    libraries/<maker>-256.rrqlib                   zips for importing: Light (256 px)
    libraries/<maker>-512.rrqlib                     Standard (512 + 256 px)
    libraries/<maker>-1024.rrqlib                    Print (1024 px)

Images are cropped to a centred square, saved as WebP (quality 80) at 256/512/1024 px on the long
side, never enlarged. Fabrics are 8 in square, marked approximate; author = designer; licensed
"All rights reserved, for personal use" (manufacturers' images are for your own use only).

    uv run build_packs.py                       # every manufacturer folder
    uv run build_packs.py cloud9                # one
    uv run build_packs.py cloud9 --only "pond"  # collections whose name contains this
    uv run build_packs.py --rebuild             # rebuild packs already built
"""
import argparse, hashlib, io, json, re, sys, zipfile
from pathlib import Path

from PIL import Image, ImageStat

HERE = Path(__file__).resolve().parent
OUT = HERE / 'libraries'
SIZES = (256, 512, 1024)
LICENSE = 'LicenseRef-Personal-Use'
MAKERS = {
    'cloud9': 'Cloud9 Fabrics',
    'artgalleryfabrics': 'Art Gallery Fabrics',
    'modafabrics': 'Moda Fabrics',
    'robertkaufman': 'Robert Kaufman',
}
# Images in collection zips that aren't fabrics.
NOT_FABRIC = re.compile(r'logo|cover|banner|lookbook|header|full[-_ ]?collection|title|catalog', re.I)


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
    fabrics, ids, preview = [], set(), []
    sizes_bytes = {str(s): 0 for s in SIZES}
    for entry in sorted(z.namelist()):
        if not re.search(r'\.(jpe?g|png|webp)$', entry, re.I) or entry.startswith('__MACOSX/'):
            continue
        if NOT_FABRIC.search(entry.split('/')[-1]):
            continue
        try:
            im = Image.open(io.BytesIO(z.read(entry))).convert('RGB')
        except Exception:
            print(f'    ! unreadable: {entry}')
            continue
        w, h = im.size
        if max(w, h) > 1.6 * min(w, h):
            continue  # banners and lookbook spreads, not swatches
        s = min(w, h)
        im = im.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s))
        fname, sku = name_from_file(entry)
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
            bucket = '256' if real_px <= 256 else '512' if real_px <= 512 else '1024'
            sizes_bytes[bucket] += len(data)
        avg = [round(c) for c in ImageStat.Stat(im.resize((64, 64), Image.BOX)).mean]
        main = [i for i in images if i['px'] <= 512][-1]
        fabric = {
            'id': fid,
            'notecard': {'name': fname, **({'reference': f'{MAKERS[maker]} {sku}'} if sku else {})},
            'author': designer,
            'license': LICENSE,
            'image': {k: main[k] for k in ('sha256', 'type', 'width', 'height')},
            'size': [8, 8],
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
    doc = {
        'format': 'rrqlib', 'version': 2, 'units': 'in', 'kind': 'pack',
        'id': pack_id, 'revision': 1, 'name': name,
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
            'items': len(fabrics), 'revision': 1, 'date': when, 'designer': designer,
            'sizes': sizes_bytes, 'fabrics': preview}


def zip_library(out_dir, dest, keep):
    """A `.rrqlib` zip of the library with only the image sizes `keep(px)` accepts."""
    with zipfile.ZipFile(dest, 'w', zipfile.ZIP_STORED) as z:
        for f in sorted(out_dir.rglob('*')):
            if not f.is_file():
                continue
            rel = f.relative_to(out_dir).as_posix()
            m = re.match(r'packs/[^/]+/(\d+)/', rel)
            if m and not keep(int(m.group(1))):
                continue
            z.write(f, rel)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('makers', nargs='*', help=f'folders to build (default: {", ".join(MAKERS)})')
    ap.add_argument('--only', help='only collections whose name contains this (case-insensitive)')
    ap.add_argument('--rebuild', action='store_true', help='rebuild packs that are already built')
    a = ap.parse_args()
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
                print(f'  = {name}')
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
        zip_library(out_dir, OUT / f'{maker}-1024.rrqlib', lambda px: px > 512)
        print(f'  → {len(packs)} packs; {OUT.relative_to(HERE)}/{maker}-{{256,512,1024}}.rrqlib')


if __name__ == '__main__':
    main()
