"""Photo geometry verified against rendered Figma reference frames."""
from PIL import Image, ImageOps
import math

def reference_maximum_width(layout):
    a,b,_=layout['matrix'][0];c,d,_=layout['matrix'][1]
    trace=a*a+b*b+c*c+d*d;det=(a*d-b*c)**2
    singular=math.sqrt((trace+math.sqrt(max(0,trace*trace-4*det)))/2)
    return max(1,int(layout['referenceSize'][0]/singular))

def render_reference(image,layout,size):
    """Render the original Figma framing, correcting warped technical assets."""
    image=orient(image,layout['sourceOrientation'])
    # Extend edge pixels for subpixel rounding at frame borders; never add bars.
    w,h=image.size;pad=4;canvas=Image.new('RGB',(w+2*pad,h+2*pad));canvas.paste(image,(pad,pad))
    canvas.paste(image.crop((0,0,1,h)).resize((pad,h)),(0,pad))
    canvas.paste(image.crop((w-1,0,w,h)).resize((pad,h)),(w+pad,pad))
    canvas.paste(canvas.crop((0,pad,w+2*pad,pad+1)).resize((w+2*pad,pad)),(0,0))
    canvas.paste(canvas.crop((0,h+pad-1,w+2*pad,h+pad)).resize((w+2*pad,pad)),(0,h+pad))
    a,b,c=layout['matrix'][0];d,e,f=layout['matrix'][1];det=a*e-b*d
    ia,ib,ic=e/det,-b/det,(b*f-e*c)/det
    id,ie,iff=-d/det,a/det,(d*c-a*f)/det
    sx,sy=layout['referenceSize'][0]/size[0],layout['referenceSize'][1]/size[1]
    return canvas.transform(size,Image.Transform.AFFINE,(ia*sx,ib*sy,ic+pad,id*sx,ie*sy,iff+pad),Image.Resampling.BICUBIC)

def orientation(matrix):
    # Ignore the tiny floating-point cosine around 90 degrees.
    if abs(matrix[0][1]) > .5:
        return 'cw' if matrix[1][0] > 0 else 'ccw'
    return 'mirror' if matrix[0][0] < -.5 else 'normal'

def orient(image, mode):
    return {'cw':lambda: image.transpose(Image.Transpose.ROTATE_270),
            'ccw':lambda: image.transpose(Image.Transpose.ROTATE_90),
            'mirror':lambda: ImageOps.mirror(image),
            'normal':lambda: image.copy()}[mode]()
