"""Prepare web photos from saved Figma sources. No build step; requires Pillow.

Sources are local, ignored by Git and never served. HTML thumbnails preserve
the separate exact Figma crops; the dialog uses these uncropped source images.
"""
from pathlib import Path
from shutil import copyfile
from PIL import Image, ImageOps, ImageDraw, ImageFont
import json,re

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'fotky-web';OUT.mkdir(exist_ok=True)
def variants(image,stem,widths):
    result=[]
    for width in sorted({min(w,image.width) for w in widths}):
        height=round(image.height*width/image.width)
        output=image.resize((width,height),Image.Resampling.LANCZOS)
        output.info.clear()
        target=OUT/f'{stem}-{width}.webp'
        temporary=target.with_suffix('.tmp')
        output.save(temporary,'WEBP',quality=85,method=6)
        temporary.replace(target)
        result.append({'src':target.relative_to(ROOT).as_posix(),'width':width,'height':height})
    return result

if __name__=='__main__':
    from prepare_photos import prepare
    prepare()
    # Original Figma layer positions in the 1440 px frame, relative to hero y=100.
    # The first two source layers are mirrored horizontally in the design.
    hero=Image.new('RGBA',(1440,497))
    ornaments=ROOT/'fotky-originaly/figma-uvod'
    # The edge ornament is placed independently by CSS, outside the photo crop.
    copyfile(ornaments/'ozdoba-lava.svg', OUT/'ozdoba-uvod.svg')
    # Original SVGs rasterized at 4x; apply the exact Figma layer transforms.
    shape=Image.open(ornaments/'ozdoba.png').convert('RGBA').rotate(4.61,Image.Resampling.BICUBIC,expand=True)
    shape=shape.resize((714,732),Image.Resampling.LANCZOS)
    hero.alpha_composite(shape,(593,-35))
    shape=Image.open(ornaments/'ozdoba-lava.png').convert('RGBA').transpose(Image.Transpose.ROTATE_90)
    shape=shape.resize((189,169),Image.Resampling.LANCZOS)
    hero.alpha_composite(shape,(-86,-84))
    for filename,box,mirror in [('44361.png',(1047,138,381,384),True),('829d9.png',(615,110,278,465),True),('8f646.png',(753,-25,523,522),False)]:
        im=Image.open(ROOT/'fotky-originaly/figma-uvod'/filename).convert('RGBA')
        im=ImageOps.fit(im,box[2:],Image.Resampling.LANCZOS,centering=(.5,1))
        if mirror:im=ImageOps.mirror(im)
        hero.alpha_composite(im,box[:2])
    variants(hero,'uvod',[960,1440])
    variants(hero.crop((610,0,1440,497)),'uvod-mobil',[480,830])
    preview=Image.new('RGB',(1200,630),'#fff7fb')
    preview.paste(hero,(-240,134),hero)
    draw=ImageDraw.Draw(preview);font=ImageFont.truetype(str(ROOT/'fonty/poppins-semibold.ttf'),46)
    draw.text((55,90),'Maľovanie',font=font,fill='#85468c');draw.text((55,150),'tváričiek',font=font,fill='#85468c')
    preview.save(OUT/'social-preview.jpg',quality=85,optimize=True)
    print('Prepared transparent hero and social preview from Figma sources.')
