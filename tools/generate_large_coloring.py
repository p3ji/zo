"""Generate original, detailed 100 × 100 colour-by-number pages."""

import json
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "art"
ART.mkdir(exist_ok=True)
SIZE = 100


def create(slug, title, price, colors, paint):
    indexed = Image.new("P", (SIZE, SIZE), 0)
    paint(ImageDraw.Draw(indexed))
    cells = list(indexed.getdata())
    assert all(0 <= value < len(colors) for value in cells)
    preview = Image.new("RGB", (SIZE, SIZE))
    preview.putdata([tuple(bytes.fromhex(colors[value][1:])) for value in cells])
    preview.resize((500, 500), Image.Resampling.NEAREST).save(ART / f"{slug}.png", optimize=True)
    return {"id": slug, "title": title, "price": price, "width": SIZE, "height": SIZE,
            "palette": colors, "cells": "".join("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"[value] for value in cells),
            "preview": f"./art/{slug}.png"}


def sea(d):
    d.rectangle((0, 0, 99, 99), fill=0)
    d.rectangle((0, 67, 99, 99), fill=1)
    for y in (12, 29, 49, 72, 88):
        d.arc((-12, y - 8, 111, y + 8), 0, 180, fill=2, width=2)
    for x, y, radius in [(8, 10, 2), (18, 23, 1), (81, 16, 2), (90, 38, 2), (10, 56, 3), (70, 56, 2), (93, 65, 2), (28, 9, 1), (48, 18, 2), (77, 35, 1)]:
        d.ellipse((x-radius, y-radius, x+radius, y+radius), outline=3, width=1)
    # Two small fish and a sea turtle.
    for x, y in [(13, 37), (84, 46), (64, 13)]:
        d.ellipse((x-5, y-2, x+5, y+2), fill=4)
        d.polygon([(x-5,y), (x-9,y-4), (x-9,y+4)], fill=5)
        d.point((x+2, y-1), fill=6)
    d.ellipse((74, 69, 91, 80), fill=7)
    d.ellipse((89, 71, 97, 77), fill=8)
    d.polygon([(76,72), (69,68), (72,76), (78,76)], fill=8)
    d.polygon([(82,78), (75,84), (87,82)], fill=8)
    d.arc((76, 70, 88, 79), 180, 350, fill=9, width=2)
    # Main dolphin with pointed beak and distinct fins.
    d.polygon([(18, 49), (5, 40), (9, 53), (4, 65), (20, 56)], fill=10)
    d.polygon([(17, 52), (27, 38), (40, 31), (56, 30), (70, 38), (83, 45), (96, 46), (91, 51), (78, 52), (66, 64), (50, 70), (33, 68), (23, 61)], fill=11)
    d.polygon([(45, 32), (51, 17), (61, 32)], fill=10)
    d.polygon([(48, 66), (51, 82), (59, 67)], fill=10)
    d.polygon([(33, 61), (48, 64), (66, 59), (77, 51), (68, 63), (50, 70), (35, 67)], fill=12)
    d.ellipse((70, 42, 73, 45), fill=6)
    d.ellipse((66, 46, 70, 48), fill=13)
    d.line((88, 50, 94, 48), fill=6, width=1)
    # Coral garden and sea plants in the foreground.
    for x in (7, 20, 36, 58, 86):
        d.line((x, 98, x-2, 82), fill=9, width=2)
        d.line((x-2, 88, x-6, 82), fill=9, width=2)
        d.line((x-1, 90, x+4, 82), fill=9, width=2)
    for x, y in [(14, 85), (38, 89), (62, 84), (82, 90)]:
        d.ellipse((x-5,y-4,x+5,y+4), fill=14)
        d.ellipse((x-2,y-2,x+2,y+2), fill=15)
    for x, y in [(24, 78), (49, 91), (69, 80), (94, 91)]:
        d.polygon([(x-3,y+2), (x,y-3), (x+4,y+2)], fill=16)


def library(d):
    d.rectangle((0, 0, 99, 99), fill=0)
    d.rectangle((0, 78, 99, 99), fill=1)
    d.rectangle((4, 6, 95, 75), fill=2)
    for x in (8, 50, 91):
        d.rectangle((x, 7, x+3, 75), fill=3)
    for y in (27, 48, 70):
        d.rectangle((7, y, 94, y+4), fill=3)
    # Detailed shelves of colourful books.
    book_colors = (4, 5, 6, 7, 8, 9, 10)
    for shelf, base in enumerate((26, 47, 69)):
        for x in range(13, 89, 5):
            if shelf == 1 and 35 <= x <= 63:
                continue
            color = book_colors[(x // 5 + shelf * 3) % len(book_colors)]
            height = 10 + (x * 3 + shelf) % 7
            d.rectangle((x, base-height, x+3, base-1), fill=color)
            d.line((x+1, base-height+3, x+1, base-height+5), fill=11)
    # Arched window at the centre.
    d.rounded_rectangle((37, 31, 63, 67), radius=12, fill=11, outline=3, width=2)
    d.ellipse((51, 35, 58, 42), fill=12)
    for x, y in [(44, 43), (55, 53), (48, 58)]:
        d.point((x,y), fill=12)
    d.line((50, 33, 50, 66), fill=3, width=2)
    # Rug, pillow, reading cat.
    d.ellipse((22, 79, 78, 98), fill=5)
    d.ellipse((27, 82, 73, 96), fill=13)
    d.rounded_rectangle((39, 69, 65, 84), radius=5, fill=14)
    d.polygon([(37, 70), (38, 57), (47, 67), (56, 66), (65, 57), (66, 73)], fill=15)
    d.ellipse((39, 65, 65, 84), fill=15)
    d.polygon([(40, 68), (40, 61), (46, 67)], fill=13)
    d.polygon([(65, 68), (64, 61), (59, 67)], fill=13)
    d.ellipse((45, 72, 48, 75), fill=3)
    d.ellipse((56, 72, 59, 75), fill=3)
    d.polygon([(51, 77), (54, 77), (52, 79)], fill=7)
    d.arc((61, 74, 80, 91), 190, 330, fill=15, width=4)
    # Reading lamp and warm glow.
    d.ellipse((73, 10, 85, 22), fill=12)
    d.polygon([(76, 21), (72, 30), (87, 30), (83, 21)], fill=12)
    d.line((80, 30, 80, 44), fill=3, width=2)
    d.ellipse((75, 43, 85, 46), fill=3)


def treehouse(d):
    d.rectangle((0, 0, 99, 99), fill=0)
    d.rectangle((0, 76, 99, 99), fill=1)
    d.ellipse((76, 5, 93, 22), fill=2)
    for x, y in [(7, 9), (28, 6), (58, 5), (96, 39), (12, 44), (69, 27)]:
        d.line((x-2,y,x+2,y), fill=3)
        d.line((x,y-2,x,y+2), fill=3)
    # Wide trunk, branches, and leaf clusters.
    d.polygon([(39, 93), (44, 49), (54, 47), (63, 93)], fill=4)
    d.line((49, 58, 28, 40), fill=4, width=7)
    d.line((54, 57, 74, 35), fill=4, width=7)
    for x,y,r in [(22,40,14),(34,27,17),(53,23,19),(73,33,17),(83,48,12),(16,55,9)]:
        d.ellipse((x-r,y-r,x+r,y+r), fill=5)
        d.arc((x-r+3,y-r+3,x+r-3,y+r-3), 210, 320, fill=6, width=2)
    for x,y in [(22,33),(36,18),(57,18),(75,31),(80,50),(16,52),(51,34)]:
        d.ellipse((x-3,y-2,x+3,y+2), fill=7)
    # House, roof, rail, window and little door.
    d.rectangle((25, 43, 74, 66), fill=8)
    d.polygon([(20,44),(49,30),(79,44)], fill=9)
    d.line((21,45,78,45), fill=10, width=2)
    d.rectangle((36, 48, 46, 57), fill=2)
    d.line((41,48,41,57), fill=10)
    d.rectangle((55, 50, 65, 65), fill=10)
    d.ellipse((62,57,63,58), fill=2)
    d.rectangle((22, 64, 77, 68), fill=9)
    for x in (25,36,48,60,73):
        d.line((x,62,x,68), fill=10, width=2)
    # Hanging ladder and path.
    d.line((57,68,55,91), fill=10, width=2)
    d.line((69,68,67,91), fill=10, width=2)
    for y in (72,77,82,87):
        d.line((57,y,68,y), fill=9, width=2)
    d.polygon([(52,99),(56,90),(67,90),(77,99)], fill=11)
    for x,y in [(9,86),(21,94),(84,87),(95,96),(33,90)]:
        d.line((x,y+4,x,y-2), fill=6)
        d.ellipse((x-3,y-4,x+3,y), fill=12)
        d.point((x,y-2), fill=2)
    # Tiny owl on a branch.
    d.ellipse((71, 54, 81, 66), fill=13)
    d.polygon([(71,57),(71,51),(75,55)], fill=13)
    d.polygon([(81,57),(81,51),(77,55)], fill=13)
    d.point((74,58), fill=10)
    d.point((78,58), fill=10)
    d.polygon([(75,61),(77,61),(76,63)], fill=2)


SHEETS = [
    create("ocean-orchestra", "Ocean Orchestra", 7,
           ["#c5f4fa", "#6bc2df", "#e1ffff", "#ffffff", "#ffd373", "#ed9d65", "#284b69", "#a8d5a1", "#85b7aa", "#4d947d", "#3686b8", "#55add1", "#e8fff9", "#f6a8c2", "#ff897c", "#ffe8ac", "#dab78b"], sea),
    create("magic-library", "Magic Library", 8,
           ["#f6e7d4", "#a87462", "#e3c29d", "#754f53", "#79bdb3", "#b891e1", "#ffbd8f", "#e788a9", "#8ca9db", "#dcb36c", "#a4c487", "#5a527b", "#ffe7a0", "#f4d1e8", "#e8acb7", "#cb9e88"], library),
    create("starry-treehouse", "Starry Treehouse", 9,
           ["#3a477f", "#8cb77b", "#f9efb2", "#fff8de", "#7b594b", "#4f8d6b", "#79a987", "#a2cb8b", "#e7b98c", "#aa6d65", "#735963", "#d4c6a1", "#f4a5c5", "#b78d71"], treehouse),
]

(ROOT / "coloring-large-data.js").write_text("window.COLORING_LARGE_SHEETS = " + json.dumps(SHEETS, separators=(",", ":")) + ";\n")
