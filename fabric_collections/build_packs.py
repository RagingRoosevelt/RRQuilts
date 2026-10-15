#!/usr/bin/env -S uv run
"""Turn downloaded manufacturer collections into the sources of RRQuilts fabric libraries (spec 014).

Each manufacturer folder (cloud9/, artgalleryfabrics/, modafabrics/, robertkaufman/) feeds one
library repository, laid out like the library template (~/Code/rrquilts-library-template):

    libraries/<maker>/library.config.json         the library's details (written if missing)
    libraries/<maker>/sources/<collection>/       one pack: its swatch images and pack.json
                                                   (name, designer, description, tags, per-file
                                                   names, SKUs and sizes); solids: palette.rrqplt

Then the repository's own `uv run tools/build.py` builds `library.json` and `packs/` from them.
Sources stay on this machine (they're gitignored); only built packs are committed.

Swatches are picked from each zip by the rules below (no logos, bolts, projects, quilts...). Square
crops of 8 in, marked approximate; Moda photos stay uncropped (panels are about 44 in long). Author
= designer; licensed "for personal use" (manufacturers' images are for your own use only).

    uv run build_packs.py                       # every manufacturer folder
    uv run build_packs.py cloud9                # one
    uv run build_packs.py cloud9 --only "pond"  # collections whose name contains this
    uv run build_packs.py --rebuild             # write sources already written again
    cd libraries/cloud9 && uv run tools/build.py --note "Spring collections"
"""
import argparse, io, json, re, shutil, sys, zipfile
from pathlib import Path

from PIL import Image, ImageStat

HERE = Path(__file__).resolve().parent
OUT = HERE / 'libraries'
LICENSE = 'LicenseRef-Personal-Use'
MAKERS = {
    'cloud9': 'Cloud9 Fabrics',
    'artgalleryfabrics': 'Art Gallery Fabrics',
    'modafabrics': 'Moda Fabrics',
    'robertkaufman': 'Robert Kaufman',
}
# Images in collection zips that aren't fabrics.
NOT_FABRIC = re.compile(r'logo|cover|banner|lookbook|header|full[-_ ]?collection|title|catalog|profile|with[-_ ]*ruler', re.I)
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


def export_pack(maker, zip_path, meta, src_dir):
    """One collection zip → sources/<collection>/. Returns its fabric count."""
    stem = zip_path.stem.split(' | ')
    when, name, designer = (stem + ['', '', ''])[:3] if len(stem) >= 3 else ('??-??', zip_path.stem, 'unknown')
    designer = (meta or {}).get('designer') or designer
    folder = src_dir / name.replace('/', '-')
    z = zipfile.ZipFile(zip_path)
    shutil.rmtree(folder, ignore_errors=True)
    folder.mkdir(parents=True)
    named = SWATCH_NAME.get(maker)
    overrides, n = {}, 0
    for entry in sorted(z.namelist()):
        base = entry.split('/')[-1]
        if not re.search(r'\.(jpe?g|png|webp)$', entry, re.I) or entry.startswith('__MACOSX/'):
            continue
        if NOT_FABRIC.search(base) or NOT_SWATCH_DIR.search(entry):
            continue
        skip = NOT_SWATCH_NAME.get(maker)
        if skip and skip.search(re.sub(r'[_-]+', ' ', base)):
            continue
        m = named and named.match(base)
        if named and not m:
            continue
        data = z.read(entry)
        try:
            im = Image.open(io.BytesIO(data)).convert('RGB')
        except Exception:
            print(f'    ! unreadable: {entry}')
            continue
        im.thumbnail((2048, 2048))  # as tools/build.py does, so sizes match what it builds
        w, h = im.size
        over = {}
        if named:  # uncropped: 8 in, or about a width of fabric for a panel or border print
            long_in = 44 if max(w, h) > 1.6 * min(w, h) else 8
            over['size'] = [round(long_in * w / max(w, h), 2), round(long_in * h / max(w, h), 2)]
        elif max(w, h) > 1.6 * min(w, h):
            continue  # banners and lookbook spreads, not swatches
        fname, sku = name_from_file(entry)
        if m and m.group(2):  # newer Moda names: "RS4172 11 Flower Friends-Natural"
            sku, fname = base.rsplit('.', 1)[0][: -len(m.group(2))].strip(), m.group(2).strip()
        elif m:  # "13900 11": style and color only
            sku = base.rsplit('.', 1)[0]
            fname = f'{name} {sku}'
        if fname.isdigit() and not sku:  # Cloud9 style numbers
            sku, fname = fname, f'{name} {fname}'
        n += 1
        # Numbered in zip order, so tools/build.py meets them (and numbers duplicate ids) in that order.
        file = f'{n:03d} {base}'
        (folder / file).write_bytes(data)
        overrides[file] = {'name': fname, 'sku': sku, **over}
    if not n:
        shutil.rmtree(folder)
        return 0
    pack = {
        'name': name, 'designer': designer,
        'description': f'{name} by {designer}, {MAKERS[maker]}' + (f' ({when})' if when != '??-??' else ''),
        **({'tags': meta['styles']} if meta and meta.get('styles') else {}),
        'crop': not named, 'fabrics': overrides,
    }
    (folder / 'pack.json').write_text(json.dumps(pack, indent=1, ensure_ascii=False))
    return n


def export_palette(maker, path, src_dir):
    """A solids palette (.rrqplt from the downloaders, e.g. Pure Solids, Kona) → a color pack."""
    col = json.loads(path.read_text())['collection']
    name = col['notecard']['name']
    folder = src_dir / name.replace('/', '-')
    shutil.rmtree(folder, ignore_errors=True)
    folder.mkdir(parents=True)
    shutil.copy(path, folder / 'palette.rrqplt')
    pack = {'name': name, 'designer': col.get('author') or MAKERS[maker],
            'description': f'{name}, {MAKERS[maker]} solids'}
    (folder / 'pack.json').write_text(json.dumps(pack, indent=1, ensure_ascii=False))
    return len(col['colors'])


def palette_files(src):
    """The maker's .rrqplt palettes, leaving out any whose colors are all in a bigger one (leftover
    "new colors" pages the downloaders have since merged)."""
    files = sorted(src.glob('*.rrqplt'))
    names = {f: {c['notecard']['name'] for c in json.loads(f.read_text())['collection']['colors']} for f in files}
    return [f for f in files if not any(g != f and names[f] < names[g] for g in files)]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('makers', nargs='*', help=f'folders to export (default: {", ".join(MAKERS)})')
    ap.add_argument('--only', help='only collections whose name contains this (case-insensitive)')
    ap.add_argument('--rebuild', action='store_true', help='write sources that are already written again')
    a = ap.parse_args()
    for maker in a.makers or [m for m in MAKERS if (HERE / m).is_dir()]:
        if maker not in MAKERS:
            sys.exit(f'Unknown manufacturer folder: {maker}')
        src = HERE / maker
        repo = OUT / maker
        src_dir = repo / 'sources'
        config = repo / 'library.config.json'
        if not config.exists():
            repo.mkdir(parents=True, exist_ok=True)
            config.write_text(json.dumps({
                'id': slug(MAKERS[maker]), 'name': MAKERS[maker],
                'description': f'{MAKERS[maker]} collections, from their downloads. For personal use only.',
                'author': {'name': MAKERS[maker]}, 'license': LICENSE, 'manufacturer': MAKERS[maker],
            }, indent=1) + '\n')
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
            if (src_dir / name.replace('/', '-') / 'pack.json').exists() and not a.rebuild:
                continue
            m = meta.get(zp.name) or {}
            try:
                n = export_pack(maker, zp, {'designer': m.get('designer'), 'styles': m.get('styles')}, src_dir)
            except zipfile.BadZipFile:
                print(f'  - {name}: damaged zip, download it again ({zp.name})')
                shutil.rmtree(src_dir / name.replace('/', '-'), ignore_errors=True)
                continue
            print(f'  + {name} ({n} fabrics)' if n else f'  - {name}: no fabric images')
        for f in palette_files(src):
            if a.only and a.only.lower() not in f.stem.lower():
                continue
            print(f'  + {f.stem} ({export_palette(maker, f, src_dir)} colors)')


if __name__ == '__main__':
    main()
