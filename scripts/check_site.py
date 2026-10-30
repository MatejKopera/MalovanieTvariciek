"""Static integrity checks. Run from any directory; requires Pillow for assets."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from PIL import Image
import re
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(); self.path=path; self.ids=set(); self.refs=[]; self.h1=0; self.cards=0
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if 'id' in a:
            assert a['id'] not in self.ids, f'Duplicate ID: {a["id"]}'
            self.ids.add(a['id'])
        if tag=='h1': self.h1+=1
        if tag=='button' and 'gallery-card' in a.get('class',''): self.cards+=1
        if tag=='img': assert a.get('alt') is not None and a.get('width') and a.get('height') or 'lightbox-image' in a.get('class',''), f'Missing image attributes: {a}'
        for key in ['href','src','data-image']:
            if a.get(key): self.refs.append(a[key])
        if a.get('srcset'): self.refs.extend(x.strip().split()[0] for x in a['srcset'].split(','))

pages={}
for path in ROOT.glob('*.html'):
    p=Page(path); p.feed(path.read_text(encoding='utf-8')); pages[path.name]=p
    assert p.h1==1, f'{path.name}: expected exactly one H1'
for name,p in pages.items():
    for ref in p.refs:
        u=urlsplit(ref)
        if u.scheme or u.netloc: continue
        target=unquote(u.path) or name
        assert not any(x in target for x in ['fotky-originaly','figma-export']), ref
        assert (ROOT/target).is_file(), f'Missing file: {ref} on {name}'
        if u.fragment and target in pages: assert u.fragment in pages[target].ids, f'Missing anchor: {ref}'
assert pages['galeria.html'].cards==33
assert pages['index.html'].cards==5
for source in re.findall(r'url\([\'\"]?([^\)\'\"]+)',(ROOT/'styles.css').read_text(encoding='utf-8')):
    assert (ROOT/source).is_file(), f'Missing CSS asset: {source}'
for p in (ROOT/'fotky-web').rglob('*.webp'):
    with Image.open(p) as im: assert not im.getexif() and not im.info.get('exif'), f'EXIF found: {p.name}'
print(f'PASS: {len(pages)} pages; all local links, anchors, responsive image sources, CSS assets and WebP metadata; 33 gallery + 5 home photographs.')
for asset in json.loads((ROOT/'scripts/figma-assets.json').read_text(encoding='utf-8')):
    path=ROOT/asset['src']
    assert path.is_file() and path.stat().st_size, f'Missing Figma SVG: {path}'
    root=ET.parse(path).getroot()
    assert abs(float(root.attrib['width'])-asset['width'])<.001
    assert abs(float(root.attrib['height'])-asset['height'])<.001
assert 'Povinné: meno a e-mail.' not in (ROOT/'index.html').read_text(encoding='utf-8')
assert len(json.loads((ROOT/'scripts/figma-photos.json').read_text(encoding='utf-8')))==38
print('PASS: original Figma SVG dimensions, 38 photograph slots, and no additional visible form helper text.')
sources=json.loads((ROOT/'scripts/figma-photo-sources.json').read_text(encoding='utf-8'))
assert len(sources)==34
for source in sources:
    assert source['source'].startswith('fotky-originaly/figma-fotografie/')
    assert (ROOT/source['source']).is_file(),source['source']
for photo in json.loads((ROOT/'scripts/photos.json').read_text(encoding='utf-8')):
    for variant in photo['variants']:
        with Image.open(ROOT/variant['src']) as im:
            assert im.size==(variant['width'],variant['height'])
            assert not im.getexif() and not im.info.get('exif')
print('PASS: all 34 enlarged photograph sources come from Figma; saved image dimensions and metadata verified.')
