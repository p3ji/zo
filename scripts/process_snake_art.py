#!/usr/bin/env python3
import sys
import os
from PIL import Image, ImageFilter

def make_transparent(input_path, output_path):
    if not os.path.exists(input_path):
        print(f"File not found: {input_path}")
        return False

    img = Image.open(input_path).convert("RGBA")
    width, height = img.size

    # Flood fill transparency from the corners / edges where background is light
    # We can detect background color from corners
    corners = [(0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1)]
    corner_colors = [img.getpixel(c)[:3] for c in corners]
    avg_bg = tuple(sum(c[i] for c in corner_colors) // 4 for i in range(3))

    # We do a floodfill / distance check on alpha
    # Since background was specified as pure white, we can calculate alpha based on distance from white
    datas = img.getdata()
    new_data = []

    for item in datas:
        r, g, b, a = item
        # If very close to pure white, make transparent
        # Smooth transition between 240 and 255
        brightness = (r + g + b) / 3.0
        diff_from_bg = max(abs(r - 255), abs(g - 255), abs(b - 255))

        if diff_from_bg < 10:
            new_data.append((r, g, b, 0))
        elif diff_from_bg < 25:
            alpha = int(((diff_from_bg - 10) / 15.0) * 255)
            new_data.append((r, g, b, alpha))
        else:
            new_data.append((r, g, b, 255))

    img.putdata(new_data)

    # Trim empty transparent borders
    bbox = img.getbbox()
    if bbox:
        # Add padding
        pad = 20
        x0 = max(0, bbox[0] - pad)
        y0 = max(0, bbox[1] - pad)
        x1 = min(width, bbox[2] + pad)
        y1 = min(height, bbox[3] + pad)
        img = img.crop((x0, y0, x1, y1))

    # Resize to standard 512x512 preserving aspect ratio with centering
    max_dim = max(img.size)
    square = Image.new("RGBA", (max_dim, max_dim), (0, 0, 0, 0))
    offset = ((max_dim - img.size[0]) // 2, (max_dim - img.size[1]) // 2)
    square.paste(img, offset)

    final_img = square.resize((512, 512), Image.Resampling.LANCZOS)
    final_img.save(output_path, "PNG", optimize=True)
    print(f"Processed {input_path} -> {output_path} (512x512 transparent PNG)")
    return True

if __name__ == "__main__":
    art_dir = sys.argv[1] if len(sys.argv) > 1 else "art"
    files = [
        ("snake-raw.png", "snake.png"),
        ("snake-witch-hat-raw.png", "snake-witch-hat.png"),
        ("snake-pumpkin-hat-raw.png", "snake-pumpkin-hat.png"),
        ("snake-bat-wings-raw.png", "snake-bat-wings.png"),
        ("snake-ghost-hood-raw.png", "snake-ghost-hood.png"),
    ]
    for raw_name, out_name in files:
        raw_path = os.path.join(art_dir, raw_name)
        out_path = os.path.join(art_dir, out_name)
        make_transparent(raw_path, out_path)
