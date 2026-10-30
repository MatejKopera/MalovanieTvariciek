"""Generate all photo slots from the same source and orientation. Requires Pillow."""
from pathlib import Path
from PIL import Image,ImageOps
from photo_geometry import orientation,render_reference,reference_maximum_width
import json,re

ROOT=Path(__file__).resolve().parents[1]

def save(image,target):
    path=ROOT/target;temporary=path.with_suffix('.tmp');image.info.clear()
    image.save(temporary,'WEBP',quality=85,method=6);temporary.replace(path)

def prepare():
    sources=json.loads((ROOT/'scripts/figma-photo-sources.json').read_text(encoding='utf-8'))
    slots=json.loads((ROOT/'scripts/figma-photos.json').read_text(encoding='utf-8'))
    by_source={p['source']:s for p,s in zip(slots[5:]+[slots[4]],sources)}
    outputs={};photo_records=[]
    for slot in slots:
        source=by_source[slot['source']]
        with Image.open(ROOT/source['source']) as raw:image=ImageOps.exif_transpose(raw).convert('RGB')
        mode=orientation(slot['relativeTransform']);layout=slot['layout']
        aspect=layout['referenceSize'][0]/layout['referenceSize'][1]
        maximum=min(1280,reference_maximum_width(layout))
        master=render_reference(image,layout,(maximum,round(maximum/aspect)))
        variants=[]
        for w in sorted({min(w,maximum) for w in [320,640,1280]}):
            h=round(w/aspect);target=f'fotky-web/figma/photo-{slot["node"].replace(":","-")}-{w}.webp'
            save(master.resize((w,h),Image.Resampling.LANCZOS),target)
            variants.append({'src':target,'width':w,'height':h})
        # The enlarged view uses the highest-resolution version of the same crop.
        slot.update({'orientation':mode,'sourcePhoto':source['source'],'variants':variants,'large':variants[-1]})
        photo_records.append({'id':slot['node'],'alt':source['alt'],'node':slot['node'],'orientation':mode,'variants':variants})
        outputs[slot['node']]=slot
    for name in ['index.html','galeria.html']:
        path=ROOT/name;content=path.read_text(encoding='utf-8')
        def update(match):
            block=match[0];node=re.search(r'data-figma-photo="([^"]+)"',block)[1];p=outputs[node];large=p['large']
            block=re.sub(r' data-(?:width|height)="[^"]+"','',block)
            block=re.sub(r'data-image="[^"]+"',f'data-image="{large["src"]}" data-width="{large["width"]}" data-height="{large["height"]}"',block)
            thumb=min(p['variants'],key=lambda v:abs(v['width']-640))
            def img(m):
                s=m[0]
                for attr,value in [('src',thumb['src']),('srcset',', '.join(v['src']+' '+str(v['width'])+'w' for v in p['variants'])),('width',str(thumb['width'])),('height',str(thumb['height']))]:
                    s=re.sub(r'\b'+attr+r'="[^"]*"',attr+'="'+value+'"',s)
                return s
            return re.sub(r'<img\b[^>]*>',img,block)
        content=re.sub(r'<button\b[^>]*class="gallery-card"[^>]*>.*?</button',update,content,flags=re.S)
        path.write_text(content,encoding='utf-8')
    (ROOT/'scripts/figma-photos.json').write_text(json.dumps(slots,ensure_ascii=False,indent=2),encoding='utf-8')
    (ROOT/'scripts/photos.json').write_text(json.dumps(photo_records,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'Prepared {len(slots)} matching thumbnail/enlarged crops, using the highest available resolution up to 1280 px.')

if __name__=='__main__':prepare()
