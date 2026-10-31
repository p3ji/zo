#!/usr/bin/env python3
"""Generate 200x200 Kuromi colour-by-number sheet for Piano Pals."""

import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "art"
ART.mkdir(exist_ok=True)

SRC_PATH = Path("/Users/pushp/.gemini/antigravity/brain/f66c2d64-5949-4a79-afad-059fd775713b/.user_uploaded/media_1793463327806_69002d7b.png")

W, H = 200, 200
DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"

PALETTE = [
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

def generate():
    src = Image.open(SRC_PATH).convert("RGBA")
    bbox = src.getbbox()
    k_img = src.crop(bbox)
    kw, kh = k_img.size

    # Fit Kuromi nicely with comfortable padding
    target_h = 174
    scale = target_h / kh
    target_w = int(kw * scale)
    resized_k = k_img.resize((target_w, target_h), Image.Resampling.LANCZOS)

    # Base background canvas
    bg_color = (244, 237, 254) # #f4edfe
    composite = Image.new("RGBA", (W, H), (*bg_color, 255))
    draw = ImageDraw.Draw(composite)

    # Decorative bottom lilac clouds
    for x, y, r in [(30, 195, 25), (70, 198, 22), (100, 197, 26), (140, 198, 24), (170, 195, 25)]:
        draw.ellipse((x - r, y - r, x + r, y + r), fill=(230, 214, 252))

    # Decorative stars
    def draw_star(cx, cy, r, fill, line):
        draw.polygon([(cx, cy - r), (cx + r // 3, cy - r // 3), (cx + r, cy), (cx + r // 3, cy + r // 3),
                      (cx, cy + r), (cx - r // 3, cy + r // 3), (cx - r, cy), (cx - r // 3, cy - r // 3)], fill=fill)
        draw.line((cx - r - 1, cy, cx + r + 1, cy), fill=line, width=1)
        draw.line((cx, cy - r - 1, cx, cy + r + 1), fill=line, width=1)

    def draw_heart(cx, cy, r, fill):
        draw.ellipse((cx - r, cy - r, cx, cy), fill=fill)
        draw.ellipse((cx, cy - r, cx + r, cy), fill=fill)
        draw.polygon([(cx - r, cy - r // 3), (cx + r, cy - r // 3), (cx, cy + r)], fill=fill)

    # Stars
    draw_star(22, 24, 7, (255, 232, 140), (240, 184, 64))
    draw_star(178, 26, 8, (255, 232, 140), (240, 184, 64))
    draw_star(16, 75, 5, (255, 232, 140), (240, 184, 64))
    draw_star(185, 82, 6, (255, 232, 140), (240, 184, 64))
    draw_star(24, 140, 5, (255, 232, 140), (240, 184, 64))
    draw_star(178, 142, 5, (255, 232, 140), (240, 184, 64))

    # Hearts
    draw_heart(26, 48, 5, (252, 174, 201))
    draw_heart(175, 55, 6, (252, 174, 201))
    draw_heart(18, 108, 4, (252, 174, 201))
    draw_heart(182, 115, 5, (252, 174, 201))

    # Diamond sparkles
    for cx, cy in [(48, 12), (152, 14), (8, 42), (192, 45), (10, 165), (190, 168)]:
        draw.polygon([(cx, cy - 3), (cx + 2, cy), (cx, cy + 3), (cx - 2, cy)], fill=(152, 117, 203))

    # Paste Kuromi centered
    kx = (W - target_w) // 2
    ky = 14
    composite.paste(resized_k, (kx, ky), resized_k)

    # Palette mapping
    palette_rgb = [tuple(int(c[i:i+2], 16) for i in (1, 3, 5)) for c in PALETTE]
    arr = np.array(composite.convert("RGB"), dtype=np.float32)
    p_arr = np.array(palette_rgb, dtype=np.float32)

    diff = arr[:, :, np.newaxis, :] - p_arr[np.newaxis, np.newaxis, :, :]
    weights = np.array([0.299, 0.587, 0.114], dtype=np.float32)
    dist_sq = np.sum((diff ** 2) * weights, axis=-1)
    closest_idx = np.argmin(dist_sq, axis=-1)

    # Ensure every palette color is used
    cells_list = closest_idx.flatten()
    assert set(cells_list) == set(range(len(PALETTE))), "All palette colors must be used"

    cells_str = "".join(DIGITS[val] for val in cells_list)

    # Save 600x600 preview PNG
    preview = Image.new("RGB", (W, H))
    preview.putdata([palette_rgb[val] for val in cells_list])
    preview.resize((600, 600), Image.Resampling.NEAREST).save(ART / "kuromi.png", optimize=True)
    print("Saved preview to art/kuromi.png")

    sheet_data = [{
        "id": "kuromi",
        "title": "Kuromi Star Magic",
        "price": 8,
        "width": W,
        "height": H,
        "palette": PALETTE,
        "cells": cells_str,
        "preview": "./art/kuromi.png"
    }]

    out_file = ROOT / "coloring-giant-data.js"
    out_file.write_text("window.COLORING_GIANT_SHEETS = " + json.dumps(sheet_data, separators=(",", ":")) + ";\n")
    print(f"Saved sheet data to {out_file} (cells length: {len(cells_str)})")

if __name__ == "__main__":
    generate()
