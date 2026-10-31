#!/usr/bin/env python3
"""Generate 200x200 Kuromi & Cinnamoroll colour-by-number sheets for Piano Pals."""

import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "art"
ART.mkdir(exist_ok=True)

KUROMI_SRC = Path("/Users/pushp/.gemini/antigravity/brain/f66c2d64-5949-4a79-afad-059fd775713b/.user_uploaded/media_1793463327806_69002d7b.png")
CINNAMOROLL_SRC = Path("/Users/pushp/.gemini/antigravity/brain/f66c2d64-5949-4a79-afad-059fd775713b/.user_uploaded/media_1793463345924_a1172abb.png")

W, H = 200, 200
DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"

KUROMI_PALETTE = [
    "#f4edfe",  # 0: Soft Lavender Background
    "#e6d6fc",  # 1: Lilac Cloud Floor / Soft Shading
    "#9875cb",  # 2: Deep Violet Sparkles
    "#ffe88c",  # 3: Warm Star Yellow
    "#f0b840",  # 4: Golden Star Core
    "#fcaec9",  # 5: Sweet Pastel Pink (Hearts & Baubles)
    "#ea75a4",  # 6: Deep Rose Pink (Nose & Heart Accents)
    "#ffffff",  # 7: Pure White (Face & Body)
    "#edeaf4",  # 8: Soft White Shadow / Body Tone
    "#4b4948",  # 9: Kuromi Charcoal Hood & Collar
    "#363435",  # A: Deep Charcoal Hood Shading
    "#231815",  # B: Dark Espresso Outlines, Eyes, Ears & Tail
]

CINNAMOROLL_PALETTE = [
    "#e4f5fd",  # 0: Soft Sky Blue Background
    "#f0faff",  # 1: Airy Cloud White-Blue
    "#b9def4",  # 2: Cloud Outline Sky Blue
    "#ffffff",  # 3: Pure White (Cinnamoroll & Cloud Highlights)
    "#52c3f1",  # 4: Cinnamoroll Sky Blue Eyes & Sparkles
    "#fadce9",  # 5: Cinnamoroll Soft Blush Cheeks
    "#f4a7c2",  # 6: Hearts & Rainbow Pink
    "#ffeb94",  # 7: Warm Star Yellow & Rainbow Yellow
    "#f5c344",  # 8: Star Core Gold
    "#a2ebd6",  # 9: Rainbow Pastel Mint
    "#bd946a",  # A: Cinnamon Caramel Outline
]

def map_palette(composite, palette, digits):
    palette_rgb = [tuple(int(c[i:i+2], 16) for i in (1, 3, 5)) for c in palette]
    arr = np.array(composite.convert("RGB"), dtype=np.float32)
    p_arr = np.array(palette_rgb, dtype=np.float32)

    diff = arr[:, :, np.newaxis, :] - p_arr[np.newaxis, np.newaxis, :, :]
    weights = np.array([0.299, 0.587, 0.114], dtype=np.float32)
    dist_sq = np.sum((diff ** 2) * weights, axis=-1)
    closest_idx = np.argmin(dist_sq, axis=-1)

    cells_list = closest_idx.flatten()
    assert set(cells_list) == set(range(len(palette))), "All palette colors must be used"

    cells_str = "".join(digits[val] for val in cells_list)

    preview = Image.new("RGB", (W, H))
    preview.putdata([palette_rgb[val] for val in cells_list])
    return cells_str, preview

def build_kuromi():
    src = Image.open(KUROMI_SRC).convert("RGBA")
    bbox = src.getbbox()
    k_img = src.crop(bbox)
    kw, kh = k_img.size

    target_h = 174
    scale = target_h / kh
    target_w = int(kw * scale)
    resized_k = k_img.resize((target_w, target_h), Image.Resampling.LANCZOS)

    bg_color = (244, 237, 254)
    composite = Image.new("RGBA", (W, H), (*bg_color, 255))
    draw = ImageDraw.Draw(composite)

    for x, y, r in [(30, 195, 25), (70, 198, 22), (100, 197, 26), (140, 198, 24), (170, 195, 25)]:
        draw.ellipse((x - r, y - r, x + r, y + r), fill=(230, 214, 252))

    def draw_star(cx, cy, r, fill, line):
        draw.polygon([(cx, cy - r), (cx + r // 3, cy - r // 3), (cx + r, cy), (cx + r // 3, cy + r // 3),
                      (cx, cy + r), (cx - r // 3, cy + r // 3), (cx - r, cy), (cx - r // 3, cy - r // 3)], fill=fill)
        draw.line((cx - r - 1, cy, cx + r + 1, cy), fill=line, width=1)
        draw.line((cx, cy - r - 1, cx, cy + r + 1), fill=line, width=1)

    def draw_heart(cx, cy, r, fill):
        draw.ellipse((cx - r, cy - r, cx, cy), fill=fill)
        draw.ellipse((cx, cy - r, cx + r, cy), fill=fill)
        draw.polygon([(cx - r, cy - r // 3), (cx + r, cy - r // 3), (cx, cy + r)], fill=fill)

    draw_star(22, 24, 7, (255, 232, 140), (240, 184, 64))
    draw_star(178, 26, 8, (255, 232, 140), (240, 184, 64))
    draw_star(16, 75, 5, (255, 232, 140), (240, 184, 64))
    draw_star(185, 82, 6, (255, 232, 140), (240, 184, 64))
    draw_star(24, 140, 5, (255, 232, 140), (240, 184, 64))
    draw_star(178, 142, 5, (255, 232, 140), (240, 184, 64))

    draw_heart(26, 48, 5, (252, 174, 201))
    draw_heart(175, 55, 6, (252, 174, 201))
    draw_heart(18, 108, 4, (252, 174, 201))
    draw_heart(182, 115, 5, (252, 174, 201))

    for cx, cy in [(48, 12), (152, 14), (8, 42), (192, 45), (10, 165), (190, 168)]:
        draw.polygon([(cx, cy - 3), (cx + 2, cy), (cx, cy + 3), (cx - 2, cy)], fill=(152, 117, 203))

    kx = (W - target_w) // 2
    ky = 14
    composite.paste(resized_k, (kx, ky), resized_k)

    cells_str, preview = map_palette(composite, KUROMI_PALETTE, DIGITS)
    preview.resize((600, 600), Image.Resampling.NEAREST).save(ART / "kuromi.png", optimize=True)

    return {
        "id": "kuromi",
        "title": "Kuromi Star Magic",
        "price": 8,
        "width": W,
        "height": H,
        "palette": KUROMI_PALETTE,
        "cells": cells_str,
        "preview": "./art/kuromi.png"
    }

def build_cinnamoroll():
    src = Image.open(CINNAMOROLL_SRC).convert("RGBA")
    bbox = src.getbbox()
    cin_img = src.crop(bbox)
    cw, ch = cin_img.size

    target_w = 186
    scale = target_w / cw
    target_h = int(ch * scale) # ~87
    resized_cin = cin_img.resize((target_w, target_h), Image.Resampling.LANCZOS)

    bg_sky = (228, 245, 253)
    composite = Image.new("RGBA", (W, H), (*bg_sky, 255))
    draw = ImageDraw.Draw(composite)

    cloud_edge = (185, 222, 244)
    cloud_fill = (240, 250, 255)
    cloud_top_hi = (255, 255, 255)

    cloud_circles = [
        (25, 172, 32), (60, 166, 28), (100, 170, 32), (145, 165, 28), (180, 172, 32),
        (40, 192, 28), (85, 194, 30), (125, 192, 30), (165, 194, 28)
    ]

    for x, y, r in cloud_circles:
        draw.ellipse((x - r - 2, y - r - 2, x + r + 2, y + r + 2), fill=cloud_edge)

    for x, y, r in cloud_circles:
        draw.ellipse((x - r, y - r, x + r, y + r), fill=cloud_fill)

    for x, y, r in [(28, 175, 22), (62, 170, 18), (102, 174, 22), (147, 169, 18), (178, 175, 22)]:
        draw.ellipse((x - r, y - r, x + r, y + r), fill=cloud_top_hi)

    def draw_star(cx, cy, r, fill, line):
        draw.polygon([(cx, cy - r), (cx + r // 3, cy - r // 3), (cx + r, cy), (cx + r // 3, cy + r // 3),
                      (cx, cy + r), (cx - r // 3, cy + r // 3), (cx - r, cy), (cx - r // 3, cy - r // 3)], fill=fill)
        draw.line((cx - r - 1, cy, cx + r + 1, cy), fill=line, width=1)
        draw.line((cx, cy - r - 1, cx, cy + r + 1), fill=line, width=1)

    def draw_heart(cx, cy, r, fill):
        draw.ellipse((cx - r, cy - r, cx, cy), fill=fill)
        draw.ellipse((cx, cy - r, cx + r, cy), fill=fill)
        draw.polygon([(cx - r, cy - r // 3), (cx + r, cy - r // 3), (cx, cy + r)], fill=fill)

    # Rainbow arch
    draw.arc((60, 4, 140, 80), 200, 340, fill=(255, 182, 202), width=3)
    draw.arc((63, 7, 137, 77), 200, 340, fill=(255, 236, 150), width=3)
    draw.arc((66, 10, 134, 74), 200, 340, fill=(162, 235, 214), width=3)

    # Stars
    star_yellow = (255, 235, 148)
    star_core = (245, 195, 68)
    draw_star(26, 22, 7, star_yellow, star_core)
    draw_star(174, 20, 7, star_yellow, star_core)
    draw_star(100, 14, 6, star_yellow, star_core)
    draw_star(60, 24, 4, star_yellow, star_core)
    draw_star(140, 22, 4, star_yellow, star_core)

    # Hearts
    heart_pink = (252, 175, 202)
    draw_heart(42, 38, 5, heart_pink)
    draw_heart(158, 36, 5, heart_pink)
    draw_heart(16, 58, 4, heart_pink)
    draw_heart(184, 56, 4, heart_pink)

    # Sparkles
    sparkle_blue = (90, 192, 242)
    for cx, cy in [(12, 25), (188, 28), (80, 10), (120, 10), (8, 105), (192, 105)]:
        draw.polygon([(cx, cy - 3), (cx + 2, cy), (cx, cy + 3), (cx - 2, cy)], fill=sparkle_blue)

    # Paste Cinnamoroll
    kx = (W - target_w) // 2
    ky = 62
    composite.paste(resized_cin, (kx, ky), resized_cin)

    cells_str, preview = map_palette(composite, CINNAMOROLL_PALETTE, DIGITS)
    preview.resize((600, 600), Image.Resampling.NEAREST).save(ART / "cinnamoroll.png", optimize=True)

    return {
        "id": "cinnamoroll",
        "title": "Cinnamoroll Cloud Dream",
        "price": 8,
        "width": W,
        "height": H,
        "palette": CINNAMOROLL_PALETTE,
        "cells": cells_str,
        "preview": "./art/cinnamoroll.png"
    }

def main():
    sheets = [build_kuromi(), build_cinnamoroll()]
    out_file = ROOT / "coloring-giant-data.js"
    out_file.write_text("window.COLORING_GIANT_SHEETS = " + json.dumps(sheets, separators=(",", ":")) + ";\n")
    print(f"Generated {len(sheets)} giant sheets in {out_file}")

if __name__ == "__main__":
    main()
