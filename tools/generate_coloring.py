"""Generate original 40 × 40 colour-by-number art and catalogue previews."""

import json
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "art"
ART.mkdir(exist_ok=True)
SIZE = 40


def sheet(slug, title, price, colors, draw_art):
    image = Image.new("P", (SIZE, SIZE), 0)
    drawer = ImageDraw.Draw(image)
    draw_art(drawer)
    pixels = list(image.getdata())
    assert all(0 <= pixel < len(colors) for pixel in pixels)
    art = Image.new("RGB", image.size)
    art.putdata([tuple(bytes.fromhex(colors[pixel].lstrip("#"))) for pixel in pixels])
    art.resize((400, 400), Image.Resampling.NEAREST).save(ART / f"{slug}.png", optimize=True)
    return {"id": slug, "title": title, "price": price, "width": SIZE, "height": SIZE,
            "palette": colors, "cells": "".join("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"[pixel] for pixel in pixels),
            "preview": f"./art/{slug}.png"}


def dolphin(d):
    d.rectangle((0, 0, 39, 23), fill=0)
    d.rectangle((0, 24, 39, 39), fill=1)
    for x, y in [(5, 6), (32, 8), (26, 3)]:
        d.ellipse((x - 3, y - 1, x + 3, y + 1), fill=2)
    d.ellipse((29, 5, 35, 11), fill=3)
    for y in (28, 34):
        d.arc((-5, y - 4, 45, y + 4), 0, 180, fill=4, width=2)
    # Flukes, tapered body, dorsal fin, pointed beak.
    d.polygon([(9, 21), (3, 16), (5, 23), (2, 29), (11, 25)], fill=5)
    d.polygon([(9, 22), (13, 16), (20, 14), (26, 15), (31, 19), (38, 20), (35, 23), (29, 23), (24, 27), (17, 29), (11, 27)], fill=6)
    d.polygon([(17, 15), (20, 9), (23, 15)], fill=5)
    d.polygon([(17, 27), (20, 34), (22, 27)], fill=5)
    d.polygon([(15, 25), (22, 25), (29, 22), (27, 25), (22, 28), (17, 28)], fill=7)
    d.point((29, 18), fill=8)
    d.line((34, 22, 37, 21), fill=8, width=1)
    d.point((27, 20), fill=9)
    for x, y in [(8, 10), (34, 29), (12, 35)]:
        d.ellipse((x, y, x + 2, y + 2), outline=10)


def castle(d):
    d.rectangle((0, 0, 39, 39), fill=0)
    d.rectangle((0, 32, 39, 39), fill=1)
    d.ellipse((29, 3, 35, 9), fill=2)
    for x, y in [(4, 5), (22, 4), (37, 13)]:
        d.line((x - 1, y, x + 1, y), fill=3)
        d.line((x, y - 1, x, y + 1), fill=3)
    d.rectangle((7, 18, 32, 33), fill=4)
    d.rectangle((3, 13, 10, 32), fill=5)
    d.rectangle((29, 13, 36, 32), fill=5)
    d.rectangle((15, 10, 24, 32), fill=6)
    d.polygon([(2, 13), (6, 7), (11, 13)], fill=7)
    d.polygon([(28, 13), (32, 7), (37, 13)], fill=7)
    d.polygon([(14, 10), (19, 2), (25, 10)], fill=7)
    d.rectangle((18, 5, 20, 9), fill=2)
    for x in (5, 17, 22, 31):
        d.rectangle((x, 17, x + 2, 20), fill=8)
    d.rounded_rectangle((17, 24, 23, 33), radius=3, fill=9)
    d.line((0, 34, 39, 34), fill=10, width=2)
    for x, y in [(3, 36), (12, 36), (30, 37), (37, 35)]:
        d.point((x, y), fill=11)


def garden(d):
    d.rectangle((0, 0, 39, 39), fill=0)
    d.rectangle((0, 27, 39, 39), fill=1)
    d.ellipse((3, 3, 11, 11), fill=2)
    for x, y in [(20, 4), (33, 6), (28, 14), (7, 18)]:
        d.point((x, y), fill=3)
    # Fox with layered ears, face, belly, legs and curling tail.
    d.polygon([(9, 20), (11, 12), (17, 17), (22, 16), (27, 11), (30, 20), (26, 26), (13, 27)], fill=4)
    d.polygon([(11, 15), (12, 20), (15, 19)], fill=5)
    d.polygon([(26, 18), (28, 14), (28, 20)], fill=5)
    d.ellipse((13, 20, 27, 34), fill=4)
    d.ellipse((17, 25, 23, 34), fill=6)
    d.polygon([(26, 29), (34, 24), (37, 26), (35, 33), (29, 34)], fill=4)
    d.polygon([(34, 25), (37, 26), (35, 32), (32, 33)], fill=6)
    for x in (16, 24):
        d.point((x, 22), fill=7)
    d.point((20, 25), fill=8)
    d.ellipse((13, 25, 15, 26), fill=9)
    d.ellipse((25, 25, 27, 26), fill=9)
    for x in (5, 32):
        d.line((x, 35, x, 29), fill=10, width=1)
        d.ellipse((x - 2, 27, x + 2, 31), fill=11)
        d.point((x, 29), fill=2)


def space_cat(d):
    d.rectangle((0, 0, 39, 39), fill=0)
    for x, y in [(3, 4), (14, 3), (34, 6), (31, 19), (4, 27), (36, 34), (18, 35)]:
        d.line((x - 1, y, x + 1, y), fill=1)
        d.line((x, y - 1, x, y + 1), fill=1)
    d.ellipse((2, 29, 11, 38), fill=2)
    d.ellipse((30, 2, 38, 10), fill=3)
    d.ellipse((5, 7, 35, 35), fill=4)  # helmet
    d.ellipse((8, 9, 32, 32), fill=5)
    d.polygon([(11, 12), (10, 4), (18, 11), (22, 11), (30, 4), (29, 13)], fill=6)
    d.polygon([(12, 9), (12, 6), (16, 10)], fill=7)
    d.polygon([(28, 9), (28, 6), (24, 10)], fill=7)
    d.ellipse((11, 12, 29, 29), fill=6)
    d.ellipse((15, 22, 25, 29), fill=8)
    d.ellipse((14, 18, 17, 21), fill=9)
    d.ellipse((23, 18, 26, 21), fill=9)
    d.point((20, 23), fill=7)
    d.ellipse((12, 23, 14, 25), fill=10)
    d.ellipse((26, 23, 28, 25), fill=10)
    d.arc((4, 7, 36, 36), 205, 330, fill=11, width=2)


SHEETS = [
    sheet("dolphin-dream", "Dolphin Dream", 0,
          ["#d9f7ff", "#80cde8", "#ffffff", "#ffe8a6", "#b5e9f5", "#3e84b8", "#60bcd9", "#e9fffa", "#284762", "#f5a7ba", "#f7ffff"], dolphin),
    sheet("rainbow-castle", "Rainbow Castle", 3,
          ["#e8ddff", "#9ee2b2", "#ffe69a", "#fff8ff", "#f8a9cf", "#b48be8", "#ffd0ec", "#7b64bb", "#a5ddff", "#825baa", "#73c9a1", "#ffbf66"], castle),
    sheet("moonlight-garden", "Moonlight Garden", 4,
          ["#344b85", "#67956d", "#f6e9a2", "#ffffff", "#ed985a", "#bb6347", "#fff3de", "#28364e", "#ef746f", "#f6ada0", "#477750", "#f5b8df"], garden),
    sheet("space-kitty", "Space Kitty", 5,
          ["#2b275e", "#fff6c7", "#a786ed", "#ffc978", "#8ed9ee", "#c5f2ff", "#d3b4f5", "#e39bc7", "#f4eaff", "#3b3568", "#f4a7be", "#78bfdf"], space_cat),
]

(ROOT / "coloring-data.js").write_text("window.COLORING_SHEETS = " + json.dumps(SHEETS, separators=(",", ":")) + ";\n")
