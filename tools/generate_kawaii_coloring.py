"""Draw original 150 × 150 kawaii pixel art for Piano Pals."""

import json
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "art"
ART.mkdir(exist_ok=True)
SIZE = 150
DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"


def build(slug, title, price, colors, paint):
    indexed = Image.new("P", (SIZE, SIZE), 0)
    paint(ImageDraw.Draw(indexed))
    cells = list(indexed.getdata())
    assert len(colors) <= len(DIGITS)
    assert set(cells) == set(range(len(colors))), f"Unused palette colour in {slug}"
    preview = Image.new("RGB", (SIZE, SIZE))
    preview.putdata([tuple(bytes.fromhex(colors[value][1:])) for value in cells])
    preview.resize((600, 600), Image.Resampling.NEAREST).save(ART / f"{slug}.png", optimize=True)
    return {
        "id": slug, "title": title, "price": price, "width": SIZE, "height": SIZE,
        "palette": colors, "cells": "".join(DIGITS[value] for value in cells),
        "preview": f"./art/{slug}.png",
    }


def bunny_tea_party(d):
    # Sky, clouds, meadow and a warm sun.
    d.rectangle((0, 0, 149, 149), fill=0)
    d.rectangle((0, 105, 149, 149), fill=1)
    for x, y in [(8, 17), (117, 15), (101, 34)]:
        d.ellipse((x, y + 5, x + 26, y + 15), fill=2)
        d.ellipse((x + 5, y, x + 16, y + 15), fill=2)
    d.ellipse((116, 39, 139, 62), fill=3)
    # Blossom tree frames the scene.
    d.polygon([(6, 114), (13, 51), (21, 49), (27, 114)], fill=4)
    d.line((17, 77, 37, 46), fill=4, width=7)
    for x, y, r in [(15, 51, 19), (37, 36, 18), (11, 31, 16), (30, 62, 15)]:
        d.ellipse((x-r, y-r, x+r, y+r), fill=5)
    for x, y in [(7, 38), (22, 28), (39, 39), (31, 55), (17, 62)]:
        d.ellipse((x-4, y-3, x+4, y+3), fill=6)
    # Bunny ears, face and paws.
    d.ellipse((53, 15, 70, 75), fill=7)
    d.ellipse((81, 15, 98, 75), fill=7)
    d.ellipse((58, 24, 65, 64), fill=8)
    d.ellipse((86, 24, 93, 64), fill=8)
    d.ellipse((50, 92, 100, 141), fill=7)
    d.ellipse((60, 106, 91, 135), fill=2)
    d.ellipse((43, 52, 108, 113), fill=7)
    d.ellipse((56, 77, 61, 85), fill=9)
    d.ellipse((89, 77, 94, 85), fill=9)
    d.point((58, 78), fill=2)
    d.point((91, 78), fill=2)
    d.ellipse((47, 88, 60, 96), fill=10)
    d.ellipse((90, 88, 103, 96), fill=10)
    d.polygon([(73, 88), (78, 88), (75, 92)], fill=11)
    d.arc((69, 91, 76, 98), 0, 170, fill=9, width=2)
    d.arc((75, 91, 82, 98), 0, 170, fill=9, width=2)
    d.polygon([(90, 44), (101, 38), (103, 48), (100, 54)], fill=12)
    d.polygon([(98, 45), (109, 42), (105, 54), (99, 53)], fill=12)
    d.ellipse((97, 45, 103, 51), fill=3)
    d.ellipse((47, 107, 59, 121), fill=7)
    d.ellipse((93, 107, 105, 121), fill=7)
    # Tea table, pink cloth, teapot, teacup, cake.
    d.ellipse((24, 112, 126, 132), fill=4)
    d.polygon([(27, 124), (123, 124), (116, 147), (35, 147)], fill=13)
    d.line((32, 133, 119, 133), fill=14, width=2)
    d.line((39, 143, 110, 143), fill=14, width=2)
    d.ellipse((37, 102, 61, 124), fill=15)
    d.polygon([(43, 103), (47, 95), (54, 95), (58, 103)], fill=15)
    d.ellipse((46, 92, 54, 96), fill=3)
    d.arc((28, 104, 43, 118), 55, 270, fill=15, width=4)
    d.polygon([(59, 108), (68, 106), (60, 113)], fill=15)
    d.ellipse((45, 107, 52, 113), fill=16)
    d.ellipse((65, 109, 88, 124), fill=14)
    d.rectangle((69, 104, 84, 118), fill=17)
    d.ellipse((68, 100, 85, 108), fill=2)
    d.ellipse((75, 95, 80, 102), fill=11)
    d.ellipse((96, 111, 111, 123), fill=15)
    d.arc((107, 112, 119, 123), 270, 95, fill=15, width=3)
    d.line((94, 124, 115, 124), fill=16, width=2)
    # Falling petals, flowers and butterfly.
    for x, y in [(44, 34), (47, 57), (34, 77), (14, 87), (37, 98), (121, 74)]:
        d.ellipse((x, y, x+3, y+2), fill=6)
    for x, y in [(12, 130), (21, 139), (132, 119), (142, 138)]:
        d.line((x, y+5, x, y), fill=18, width=2)
        d.ellipse((x-4, y-3, x+4, y+3), fill=6)
        d.point((x, y), fill=3)
    d.ellipse((119, 78, 126, 86), fill=12)
    d.ellipse((127, 78, 134, 86), fill=12)
    d.ellipse((123, 85, 127, 91), fill=12)
    d.ellipse((126, 85, 130, 91), fill=12)
    d.line((126, 80, 127, 87), fill=9, width=2)


def sleepy_moon_cat(d):
    d.rectangle((0, 0, 149, 149), fill=0)
    # Stars and hanging mobiles.
    for x, y, r in [(15, 15, 3), (40, 8, 2), (125, 19, 3), (138, 42, 2), (18, 75, 2), (131, 82, 3), (107, 12, 2), (50, 38, 2)]:
        d.line((x-r, y, x+r, y), fill=1, width=2)
        d.line((x, y-r, x, y+r), fill=1, width=2)
    for x, y in [(31, 32), (111, 37), (22, 100), (136, 108)]:
        d.line((x, 0, x, y-6), fill=2)
        d.polygon([(x, y-6), (x+3, y-1), (x+8, y), (x+3, y+2), (x, y+8), (x-3, y+2), (x-8, y), (x-3, y-1)], fill=3)
    # Crescent and glowing outer rim.
    d.ellipse((25, 25, 127, 127), fill=4)
    d.ellipse((49, 9, 139, 102), fill=0)
    d.arc((25, 25, 127, 127), 75, 252, fill=5, width=3)
    d.ellipse((27, 82, 51, 109), fill=6)
    d.ellipse((92, 104, 117, 126), fill=6)
    d.ellipse((48, 113, 97, 131), fill=6)
    # Cat tail curls behind a round body.
    d.arc((86, 84, 131, 127), 180, 45, fill=7, width=12)
    d.ellipse((49, 77, 112, 124), fill=7)
    d.ellipse((67, 87, 104, 116), fill=8)
    d.ellipse((55, 49, 107, 96), fill=7)
    d.polygon([(57, 62), (59, 41), (73, 53)], fill=7)
    d.polygon([(91, 54), (105, 40), (105, 65)], fill=7)
    d.polygon([(61, 55), (62, 48), (69, 56)], fill=9)
    d.polygon([(98, 56), (104, 47), (102, 60)], fill=9)
    # Closed eyes, pink cheeks, nose and paws.
    d.arc((65, 66, 76, 78), 0, 180, fill=10, width=2)
    d.arc((87, 66, 98, 78), 0, 180, fill=10, width=2)
    d.ellipse((58, 78, 70, 84), fill=11)
    d.ellipse((95, 78, 107, 84), fill=11)
    d.polygon([(80, 77), (85, 77), (82, 81)], fill=12)
    d.arc((77, 80, 83, 86), 0, 160, fill=10, width=1)
    d.arc((83, 80, 89, 86), 0, 160, fill=10, width=1)
    d.ellipse((54, 103, 72, 117), fill=7)
    d.ellipse((91, 103, 109, 117), fill=7)
    for x in (60, 66, 96, 102):
        d.line((x, 111, x, 113), fill=9)
    # Nightcap with pom-pom and a satin bow.
    d.polygon([(56, 54), (84, 23), (104, 56)], fill=13)
    d.arc((54, 50, 107, 60), 0, 180, fill=14, width=5)
    d.ellipse((78, 17, 90, 29), fill=14)
    d.polygon([(70, 91), (79, 88), (82, 98), (73, 99)], fill=15)
    d.polygon([(85, 89), (94, 91), (91, 99), (83, 98)], fill=15)
    d.ellipse((78, 90, 87, 99), fill=3)
    # A tiny sleeping face on the moon.
    d.arc((33, 71, 43, 82), 0, 180, fill=16, width=2)
    d.arc((50, 96, 60, 107), 0, 180, fill=16, width=2)
    d.arc((42, 89, 50, 96), 0, 180, fill=16, width=1)
    # Quilted clouds and a small pillow beneath the cat.
    d.ellipse((10, 122, 57, 148), fill=6)
    d.ellipse((45, 127, 102, 149), fill=6)
    d.ellipse((91, 119, 147, 149), fill=6)
    d.ellipse((47, 126, 115, 141), fill=17)
    d.line((54, 130, 105, 130), fill=2, width=2)
    for x in (22, 120, 138):
        d.ellipse((x-2, 129, x+2, 133), fill=1)


def panda_bakery(d):
    d.rectangle((0, 0, 149, 149), fill=0)
    d.rectangle((0, 124, 149, 149), fill=1)
    for x in range(0, 150, 18):
        d.line((x, 124, x+20, 149), fill=2, width=1)
    # Sweet striped awning and hanging sign.
    d.rectangle((7, 14, 142, 32), fill=3)
    for x in range(7, 143, 20):
        d.rectangle((x, 14, x+10, 35), fill=4)
        d.ellipse((x, 29, x+10, 39), fill=4)
        d.ellipse((x+10, 29, x+20, 39), fill=3)
    d.line((16, 31, 16, 100), fill=5, width=4)
    d.line((136, 31, 136, 100), fill=5, width=4)
    d.line((118, 36, 118, 50), fill=5, width=2)
    d.rounded_rectangle((105, 47, 132, 63), radius=4, fill=6)
    d.polygon([(113, 55), (118, 50), (122, 55), (127, 52), (125, 59), (113, 59)], fill=7)
    # Pastry shelf behind the baker.
    d.rectangle((21, 54, 131, 92), fill=8)
    d.rectangle((22, 72, 130, 77), fill=5)
    for x in (30, 42, 54, 98, 110, 121):
        d.ellipse((x-5, 65, x+5, 74), fill=9)
        d.arc((x-3, 66, x+3, 72), 180, 350, fill=10, width=2)
    for x in (33, 50, 108, 124):
        d.ellipse((x-4, 80, x+4, 87), fill=11)
        d.point((x, 83), fill=7)
    # Panda ears, chef hat, head and apron.
    d.ellipse((47, 56, 66, 78), fill=12)
    d.ellipse((87, 56, 106, 78), fill=12)
    d.ellipse((55, 85, 99, 135), fill=12)
    d.ellipse((59, 88, 95, 126), fill=13)
    d.ellipse((50, 63, 103, 109), fill=13)
    d.ellipse((55, 78, 69, 93), fill=12)
    d.ellipse((84, 78, 98, 93), fill=12)
    d.ellipse((60, 82, 64, 87), fill=14)
    d.ellipse((89, 82, 93, 87), fill=14)
    d.ellipse((72, 90, 82, 97), fill=13)
    d.polygon([(74, 92), (80, 92), (77, 96)], fill=14)
    d.ellipse((51, 94, 63, 100), fill=15)
    d.ellipse((91, 94, 103, 100), fill=15)
    d.arc((71, 95, 83, 102), 0, 180, fill=14, width=2)
    d.ellipse((55, 44, 100, 63), fill=16)
    d.ellipse((58, 37, 76, 58), fill=16)
    d.ellipse((75, 31, 94, 57), fill=16)
    d.rectangle((58, 55, 98, 63), fill=17)
    d.polygon([(68, 102), (87, 102), (94, 130), (60, 130)], fill=18)
    d.polygon([(67, 107), (74, 110), (77, 107), (84, 110), (88, 106), (82, 118), (72, 118)], fill=7)
    d.ellipse((49, 105, 62, 119), fill=12)
    d.ellipse((93, 105, 106, 119), fill=12)
    # Countertop, three frosted cupcakes and cookies.
    d.rectangle((8, 119, 142, 149), fill=5)
    d.rectangle((8, 117, 142, 123), fill=19)
    for x in (30, 116):
        d.polygon([(x-8, 112), (x+8, 112), (x+5, 126), (x-5, 126)], fill=10)
        d.ellipse((x-9, 106, x+9, 118), fill=15)
        d.ellipse((x-5, 101, x+5, 111), fill=16)
        d.ellipse((x-2, 99, x+2, 103), fill=7)
    d.ellipse((60, 121, 93, 135), fill=20)
    for x, y in [(68, 125), (79, 127), (86, 123), (72, 132), (89, 131)]:
        d.ellipse((x, y, x+2, y+2), fill=14)
    d.rounded_rectangle((42, 137, 109, 146), radius=4, fill=6)
    d.ellipse((65, 138, 76, 145), fill=7)
    d.ellipse((81, 138, 92, 145), fill=7)


SHEETS = [
    build("bunny-tea-party", "Bunny Tea Party", 10,
          ["#ede2ff", "#abe0bb", "#fffaf5", "#ffdf89", "#946c72", "#f4bbd4", "#e58db7", "#fff0de", "#f8b6cc", "#3f426b", "#f7aabc", "#d9778f", "#a78de3", "#f7cade", "#fff5e8", "#c9e6e3", "#7abbb8", "#ffc5a1", "#6ab493"], bunny_tea_party),
    build("sleepy-moon-cat", "Sleepy Moon Cat", 11,
          ["#343564", "#fff3c7", "#8586ae", "#f9bd6b", "#f6db8e", "#ffeab0", "#b5cbeb", "#b6a1de", "#dec5f3", "#f1c4da", "#4e456e", "#f4a9be", "#dd83ad", "#7d6db1", "#f2edf9", "#f5a67e", "#a97a80", "#d7c7ed"], sleepy_moon_cat),
    build("panda-bakery", "Panda Bakery", 12,
          ["#fff2df", "#e4c49f", "#f7dbbc", "#fce4dc", "#e9a3bf", "#9f6f63", "#e7bbd7", "#ee9c75", "#c9ad9a", "#efbd78", "#b57b59", "#d8a5dd", "#454560", "#fffaf0", "#34364e", "#f5b1bd", "#ffffff", "#d6d5e8", "#a5d9c8", "#c99178", "#e7b675"], panda_bakery),
]

(ROOT / "coloring-kawaii-data.js").write_text(
    "window.COLORING_KAWAII_SHEETS = " + json.dumps(SHEETS, separators=(",", ":")) + ";\n"
)
