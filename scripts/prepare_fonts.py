"""Optional asset maintenance, not required to serve the site.

Requires fonttools[woff] (FontTools and Brotli).
"""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

root=Path(__file__).resolve().parents[1]
for weight in ['light', 'regular', 'medium', 'semibold', 'bold']:
    font=TTFont(root/'fonty'/f'poppins-{weight}.ttf')
    options=subset.Options()
    options.flavor='woff2'
    worker=subset.Subsetter(options=options)
    worker.populate(unicodes=list(range(0x250))+list(range(0x2000,0x2070))+[0x20ac,0x2192])
    worker.subset(font)
    font.flavor='woff2'
    font.save(root/'fonty'/f'poppins-{weight}.woff2')
    print(weight)
