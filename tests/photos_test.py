"""Geometry regressions and validation of the actual generated photo files."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageOps,ImageChops,ImageStat
import json,sys,unittest
from html.parser import HTMLParser
R=Path(__file__).resolve().parents[1];sys.path.insert(0,str(R/'scripts'))
from photo_geometry import orientation,orient,render_reference,repair_export_edge

class Geometry(unittest.TestCase):
    def test_export_seam_repair_preserves_size_and_every_interior_pixel(self):
        image=Image.new('RGB',(100,160),(72,129,210))
        image.paste('white',(98,0,100,160))
        layout={'rightEdgeRepairFraction':.02}
        repaired=repair_export_edge(image,layout)
        self.assertEqual(repaired.size,image.size)
        self.assertEqual(repaired.crop((0,0,98,160)).tobytes(),image.crop((0,0,98,160)).tobytes())
        self.assertEqual(repaired.getextrema(),((72,72),(129,129),(210,210)))

    def test_circle_is_not_stretched_by_card_crop(self):
        image=Image.new('RGB',(200,400),'white');ImageDraw.Draw(image).ellipse((50,150,150,250),fill='black')
        for size in [(150,200),(225,300)]:
            layout={'matrix':[[.75,0,0],[0,.75,-50]],'referenceSize':[150,200],'sourceOrientation':'normal'}
            result=render_reference(image,layout,size)
            mask=result.convert('L').point(lambda x:255 if x<80 else 0)
            x,y,right,bottom=mask.getbbox()
            self.assertLessEqual(abs((right-x)-(bottom-y)),2,'A circular motif became an ellipse')

    def test_negative_crop_does_not_add_black_strips(self):
        image=Image.new('RGB',(100,160),(72,129,210))
        result=render_reference(image,{'matrix':[[.6,0,.3],[0,.6,.3]],'referenceSize':[60,80],'sourceOrientation':'normal'},(60,80))
        self.assertEqual(result.getextrema(),((72,72),(129,129),(210,210)))

    def test_rotation_and_mirror_have_known_pixel_positions(self):
        im=Image.new('RGB',(2,3));im.putdata([(i,0,0)for i in range(6)])
        self.assertEqual(list(orient(im,'cw').tobytes()[::3]),[4,2,0,5,3,1])
        self.assertEqual(list(orient(im,'mirror').tobytes()[::3]),[1,0,3,2,5,4])
        self.assertEqual(orientation([[-.00000004,-1,0],[1,-.00000004,0]]),'cw')
        self.assertEqual(orientation([[-1,0,0],[0,1,0]]),'mirror')

class GeneratedPhotographs(unittest.TestCase):
    def test_every_resolution_is_free_of_abrupt_bright_export_edges(self):
        slots=json.loads((R/'scripts/figma-photos.json').read_text(encoding='utf-8'))
        for slot in slots:
            for variant in slot['variants']:
                with self.subTest(photo=variant['src']):
                    image=Image.open(R/variant['src']).convert('RGB');w,h=image.size
                    for offset in (0,1):
                        outer=image.crop((w-offset-1,0,w-offset,h)).tobytes()
                        inner=image.crop((w-offset-2,0,w-offset-1,h)).tobytes()
                        # Measure a sudden blend towards white, including tinted seams.
                        amount=sum((a-b)*(255-b) for a,b in zip(outer,inner))
                        scale=sum((255-b)**2 for b in inner)
                        self.assertLess(amount/max(1,scale),.04,
                            'Abrupt bright seam in the last two columns')

    def test_repaired_exports_have_no_bright_right_seam_in_any_resolution(self):
        slots=json.loads((R/'scripts/figma-photos.json').read_text(encoding='utf-8'))
        repaired=[s for s in slots if s['layout'].get('rightEdgeRepairFraction')]
        self.assertEqual({s['node'] for s in repaired},
            {'11292:520','11292:610','11292:625','11292:598',
             '11292:606','11292:623','11292:616'})
        for slot in repaired:
            for variant in slot['variants']:
                with self.subTest(photo=variant['src']):
                    image=Image.open(R/variant['src']).convert('RGB');w,h=image.size
                    outer=image.crop((w-1,0,w,h))
                    inner=image.crop((w-4,0,w-3,h))
                    error=ImageStat.Stat(ImageChops.difference(outer,inner)).mean
                    self.assertLess(sum(error)/3,20,'A bright export seam is still visible')

    def test_html_links_each_thumbnail_to_matching_full_image_dimensions(self):
        slots={p['node']:p for p in json.loads((R/'scripts/figma-photos.json').read_text(encoding='utf-8'))}
        case=self
        class Cards(HTMLParser):
            def __init__(self):super().__init__();self.button=None;self.count=0
            def handle_starttag(self,tag,attrs):
                case.assertEqual(len(attrs),len(dict(attrs)),'Duplicate HTML attributes')
                a=dict(attrs)
                if tag=='button' and a.get('class')=='gallery-card':self.button=a
                if tag=='img' and a.get('data-figma-photo'):
                    large=slots[a['data-figma-photo']]['large'];case.assertIsNotNone(self.button)
                    case.assertEqual(self.button['data-image'],large['src'])
                    case.assertEqual(int(self.button['data-width']),large['width'])
                    case.assertEqual(int(self.button['data-height']),large['height']);self.count+=1
            def handle_endtag(self,tag):
                if tag=='button':self.button=None
        total=0
        for name in ['index.html','galeria.html']:
            parser=Cards();parser.feed((R/name).read_text(encoding='utf-8'));total+=parser.count
        self.assertEqual(total,38)

    def test_all_38_slots_have_consistent_full_image_and_undistorted_card(self):
        slots=json.loads((R/'scripts/figma-photos.json').read_text(encoding='utf-8'))
        self.assertEqual(len(slots),38)
        for slot in slots:
            with self.subTest(node=slot['node']):
                large=slot['large'];actual=Image.open(R/large['src']).convert('RGB')
                self.assertEqual(large,slot['variants'][-1],'Enlargement must use the largest version of the thumbnail crop')
                # Independent visual ground truth: Figma, not our own renderer.
                reference=Image.open(R/'tests/fixtures/figma-photos'/(slot['node'].replace(':','-')+'.webp')).convert('RGB')
                box=(15,15,reference.width-15,reference.height-15)
                normalized=actual.resize(reference.size,Image.Resampling.LANCZOS)
                error=ImageStat.Stat(ImageChops.difference(normalized.crop(box),reference.crop(box))).mean
                self.assertLess(sum(error)/3,14,'The rendered photograph differs from the independent Figma reference')
                self.assertGreaterEqual(slot['layout']['matchedPoints'],50)
                self.assertLess(slot['layout']['medianErrorPx'],.5)
                with Image.open(R/large['src']) as metadata:self.assertFalse(metadata.getexif())
                aspect=reference.width/reference.height
                for v in slot['variants']:
                    im=Image.open(R/v['src'])
                    self.assertLessEqual(abs(im.height-im.width/aspect),.51)
                    expected=actual.resize(im.size,Image.Resampling.LANCZOS)
                    error=ImageStat.Stat(ImageChops.difference(im.convert('RGB'),expected)).mean
                    self.assertLess(sum(error)/3,9)

    def test_rose_portrait_keeps_the_whole_face_instead_of_zooming_into_it(self):
        slot=next(p for p in json.loads((R/'scripts/figma-photos.json').read_text(encoding='utf-8')) if p['node']=='11292:598')
        with Image.open(R/slot['large']['src']) as raw:actual=raw.convert('RGB')
        reference=Image.open(R/'tests/fixtures/figma-photos/11292-598.webp').convert('RGB')
        actual=actual.resize(reference.size,Image.Resampling.LANCZOS)
        box=(15,15,reference.width-15,reference.height-15)
        error=ImageStat.Stat(ImageChops.difference(actual.crop(box),reference.crop(box))).mean
        self.assertLess(sum(error)/3,9,'The rose portrait is stretched or has a different crop than Figma')

if __name__=='__main__':unittest.main()
