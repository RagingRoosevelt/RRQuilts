#!/usr/bin/env -S uv run
"""Moda Fabrics collections, from Downloads pages saved out of the browser.

my.modafabrics.com sits behind a browser check, so this script doesn't fetch anything. Instead:

1. Save each page of https://my.modafabrics.com/downloads (Ctrl+S) into ./modafabrics/.
2. Run this script. It reads the saved pages and writes, in ./modafabrics/:
     collections.json     every collection seen (kept across runs): name, in-stores date, designer,
                          styles (Moda's tags), JPG zip link, file name, downloaded
     download_links.html  the "JPG Images" links not downloaded yet; open it in the same browser
                          and click them
3. Run it again after downloading. It finds the jpg_*.zip files (in ./modafabrics/ or ~/Downloads)
   and renames them to "YY-MM | <collection name> | <designer>.zip" in ./modafabrics/.

   Or let it do the clicking: --browser opens a visible Firefox (Playwright); you get past the site's
   check and log in there yourself, press Enter, and it downloads each missing zip in that browser,
   10 seconds apart (the site's crawl delay), straight to its final name. The browser profile is
   kept in ./modafabrics/.browser-profile, so you stay logged in between runs.

A collection counts as downloaded when a zip with its name and date is there.

    uv run download_modafabrics.py
    uv run download_modafabrics.py --browser          # download the missing zips in a browser
    uv run download_modafabrics.py --from ~/Desktop   # also look for downloaded zips here

--browser needs the browser once:  uv run playwright install firefox
"""
import argparse, html, re, shutil, time
from pathlib import Path

import collections_index

SITE = 'https://my.modafabrics.com'
HERE = Path(__file__).resolve().parent / 'modafabrics'


def text(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s))).strip()


def safe(s):
    return re.sub(r'[/\0]', '-', s).strip()


def collections(pages):
    """One entry per collection (by its JPG zip) from the saved Downloads pages' tables."""
    out = {}
    for f in pages:
        s = f.read_text(encoding='utf-8', errors='replace')
        body = s[s.find('<tbody>'):s.find('</tbody>')]
        for tr in re.findall(r'<tr[^>]*>(.*?)</tr>', body, re.S):
            td = dict(re.findall(r'<td class="views-field views-field-([a-z-]+)[^"]*"[^>]*>(.*?)</td>', tr, re.S))
            jpg = re.search(r'href="([^"]+)"', td.get('field-jpg-file-path', ''))
            if not jpg:
                continue
            url = html.unescape(jpg.group(1))
            url = url if url.startswith('http') else SITE + url
            name = text(td.get('title', ''))
            by = text(td.get('field-designer', '')) or 'unknown'
            date = re.search(r'(\d{4})\.(\d{1,2})', text(td.get('field-in-stores-date', '')))
            when = f'{date.group(1)[2:]}-{int(date.group(2)):02d}' if date else '??-??'
            styles = [html.unescape(x).strip() for x in
                      re.findall(r'class="downloads-type[^"]*">([^<]+)<', td.get('field-style', ''))]
            out[url] = {'name': name, 'designer': by, 'in_stores': when, 'styles': styles,
                        'jpg': url, 'zip': url.rsplit('/', 1)[-1],
                        'file': f'{when} | {safe(name)} | {safe(by)}.zip'}
    return list(out.values())


def browser_download(todo, delay):
    """Download `todo` in a visible browser the user has logged in to. Returns the ones saved."""
    try:
        from playwright.sync_api import TimeoutError as Timeout, sync_playwright
    except ImportError:
        raise SystemExit('Run with uv (uv run download_modafabrics.py), and once: uv run playwright install firefox')
    done = []
    with sync_playwright() as p:
        ctx = p.firefox.launch_persistent_context(str(HERE / '.browser-profile'), headless=False,
                                                  accept_downloads=True)
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        page.goto(f'{SITE}/downloads')
        input('In the browser window: get past the check and log in, then press Enter here… ')
        for i, c in enumerate(todo, 1):
            print(f'  [{i}/{len(todo)}] {c["file"]}')
            for attempt in (1, 2):
                try:
                    with page.expect_download(timeout=60_000) as dl:
                        page.evaluate('url => { window.location.href = url }', c['jpg'])
                    part = HERE / (c['file'] + '.part')
                    dl.value.save_as(part)
                    part.replace(HERE / c['file'])
                    done.append(c)
                    break
                except Timeout:
                    if attempt == 1:
                        input('    No download started (the check may be back). Clear it in the browser, '
                              'then press Enter to retry… ')
                    else:
                        print('    skipped')
            time.sleep(delay)
        ctx.close()
    return done


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--from', dest='src', action='append', default=[],
                    help='another folder to look in for downloaded jpg_*.zip files')
    ap.add_argument('--browser', action='store_true', help='download the missing zips in a browser')
    ap.add_argument('--delay', type=float, default=10.0, help='seconds between browser downloads')
    a = ap.parse_args()
    pages = sorted(HERE.glob('*.htm*'))
    pages = [p for p in pages if p.name != 'download_links.html']
    if not pages:
        print(f'No saved Downloads pages in {HERE}. Save them there first (see --help).')
        return
    cols = collections(pages)

    # File the zips already downloaded under their collection names.
    by_zip = {c['zip']: c for c in cols}
    for folder in [HERE, Path.home() / 'Downloads', *map(Path, a.src)]:
        for z in Path(folder).expanduser().glob('jpg_*.zip'):
            c = by_zip.get(z.name)
            if c and not (HERE / c['file']).exists():
                shutil.move(str(z), HERE / c['file'])
                print(f'  filed {z.name} → {c["file"]}')

    def have(c):
        prefix = f'{c["in_stores"]} | {safe(c["name"])} | '
        return any(f.name.startswith(prefix) for f in HERE.glob('*.zip'))

    todo = [c for c in cols if not have(c)]
    if a.browser and todo:
        got = browser_download(todo, a.delay)
        todo = [c for c in todo if c not in got]
    collections_index.update(HERE / 'collections.json', [
        {'name': c['name'], 'date': c['in_stores'], 'designer': c['designer'],
         'styles': c['styles'], 'url': c['jpg'], 'file': c['file'],
         'downloaded': 'no' if c in todo else 'yes'} for c in cols])
    links = '\n'.join(
        f'<li><a href="{html.escape(c["jpg"])}">{html.escape(c["name"])}</a> · {html.escape(c["designer"])} · '
        f'{c["in_stores"]} · {html.escape(", ".join(c["styles"]))}</li>' for c in todo)
    (HERE / 'download_links.html').write_text(
        '<!doctype html><meta charset="utf-8"><title>Moda JPG downloads</title>'
        f'<h1>Moda JPG Images to download ({len(todo)})</h1>'
        '<p>Click each link in the browser you use for my.modafabrics.com, then run the script again '
        'to file the zips.</p>\n<ol>\n' + links + '\n</ol>\n', encoding='utf-8')
    print(f'{len(cols)} collections from {len(pages)} pages; {len(cols) - len(todo)} downloaded, '
          f'{len(todo)} to go (see modafabrics/download_links.html).')


if __name__ == '__main__':
    main()
