#!/usr/bin/env python
"""build/gen-og-image.py — generates assets/img/og.png, the 1200x630 social card.

Run manually when the card design changes:  python build/gen-og-image.py

Not part of the Node pipeline: it needs Pillow, and the output is a committed
binary asset rather than something regenerated on every build. The page markup
has referenced this file since the site was first built; it was missing, so
every share rendered a broken card until this was added.

Design mirrors the site: near-black ground, violet->cyan aurora, the same
gradient on the wordmark accent.
"""

import os
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

W, H = 1200, 630
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'img', 'og.png')

INK = (7, 8, 14)
BRAND1 = (109, 94, 252)
BRAND2 = (168, 85, 247)
BRAND3 = (34, 211, 238)
TEXT = (241, 242, 247)
MUTED = (163, 168, 189)

FONTS = r'C:\Windows\Fonts'
def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)

bold = lambda s: font('arialbd.ttf', s)
reg = lambda s: font('arial.ttf', s)


def radial(size, colour, strength=1.0):
    """A soft circular glow on its own layer, to be blurred and composited."""
    layer = Image.new('RGB', (size, size), (0, 0, 0))
    d = ImageDraw.Draw(layer)
    steps = 48
    for i in range(steps, 0, -1):
        r = int(size / 2 * i / steps)
        a = (1 - i / steps) ** 2 * strength
        d.ellipse(
            [size // 2 - r, size // 2 - r, size // 2 + r, size // 2 + r],
            fill=tuple(int(c * a) for c in colour),
        )
    return layer.filter(ImageFilter.GaussianBlur(size // 10))


img = Image.new('RGB', (W, H), INK)

# Aurora blobs, added rather than pasted so they glow instead of painting over.
for cx, cy, size, colour, strength in [
    (170, 70, 760, BRAND1, 0.95),
    (1080, 90, 680, BRAND3, 0.60),
    (640, 700, 720, BRAND2, 0.55),
]:
    tile = Image.new('RGB', (W, H), (0, 0, 0))
    tile.paste(radial(size, colour, strength), (cx - size // 2, cy - size // 2))
    img = ImageChops.add(img, tile)

d = ImageDraw.Draw(img)

# Subtle grid, fading out toward the bottom.
for x in range(0, W, 64):
    d.line([(x, 0), (x, H)], fill=(18, 20, 32), width=1)
for y in range(0, H, 64):
    d.line([(0, y), (W, y)], fill=(18, 20, 32), width=1)

PAD = 80

# Brand mark: rounded square with the document glyph.
mx, my, ms = PAD, PAD, 68
mark = Image.new('RGB', (ms, ms), BRAND1)
mg = ImageDraw.Draw(mark)
for i in range(ms):                                   # left->right brand gradient
    t = i / (ms - 1)
    c = tuple(int(BRAND1[k] + (BRAND3[k] - BRAND1[k]) * t) for k in range(3))
    mg.line([(i, 0), (i, ms)], fill=c)
rounded = Image.new('L', (ms, ms), 0)
ImageDraw.Draw(rounded).rounded_rectangle([0, 0, ms - 1, ms - 1], radius=20, fill=255)
img.paste(mark, (mx, my), rounded)
d.rounded_rectangle([mx + 20, my + 16, mx + 48, my + 52], radius=4, outline=(255, 255, 255), width=3)
d.line([(mx + 27, my + 32), (mx + 41, my + 32)], fill=(255, 255, 255), width=3)
d.line([(mx + 27, my + 41), (mx + 36, my + 41)], fill=(255, 255, 255), width=3)

d.text((mx + ms + 22, my + 16), 'InvoiceSoftware', font=bold(38), fill=TEXT)
w = d.textlength('InvoiceSoftware', font=bold(38))
d.text((mx + ms + 22 + w, my + 16), '.ae', font=bold(38), fill=BRAND3)

# Headline
d.text((PAD, 250), 'Invoicing built', font=bold(86), fill=TEXT)
d.text((PAD, 342), 'for the UAE', font=bold(86), fill=BRAND3)

d.text((PAD, 462),
       'VAT-ready invoices, online payments and expenses —',
       font=reg(31), fill=MUTED)
d.text((PAD, 502),
       'and a straight path to FTA e-invoicing.',
       font=reg(31), fill=MUTED)

# Badges along the bottom
x = PAD
for label in ['5% VAT automatic', 'PINT AE ready', 'From AED 0']:
    tw = d.textlength(label, font=bold(22))
    d.rounded_rectangle([x, 556, x + tw + 36, 598], radius=21,
                        fill=(20, 22, 38), outline=(52, 56, 86), width=1)
    d.text((x + 18, 567), label, font=bold(22), fill=(200, 203, 220))
    x += tw + 52

os.makedirs(os.path.dirname(OUT), exist_ok=True)
img.save(OUT, 'PNG', optimize=True)
print(f'wrote {os.path.normpath(OUT)}  {W}x{H}  {os.path.getsize(OUT) // 1024} KB')
