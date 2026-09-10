"""Gera ícones PNG do PWA a partir do formato do favicon (quadrado arredondado + raio)."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1] / "public"
CYAN = (0, 198, 255)
PINK = (255, 0, 127)
WHITE = (255, 255, 255, 255)
BG = (10, 12, 20, 255)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def rounded_mask(size: int, radius: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    return mask


def gradient_square(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    px = img.load()
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * (size - 1))
            r, g, b = lerp(CYAN, PINK, t)
            px[x, y] = (r, g, b, 255)
    return img


def draw_bolt(draw: ImageDraw.ImageDraw, size: int) -> None:
    s = size
    bolt = [
        (0.57 * s, 0.16 * s),
        (0.32 * s, 0.52 * s),
        (0.48 * s, 0.52 * s),
        (0.40 * s, 0.84 * s),
        (0.70 * s, 0.44 * s),
        (0.54 * s, 0.44 * s),
    ]
    draw.polygon(bolt, fill=WHITE)


def make_icon(size: int, maskable: bool = False) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), BG if maskable else (0, 0, 0, 0))
    pad = int(size * 0.12) if maskable else 0
    inner = size - pad * 2
    grad = gradient_square(inner)
    radius = int(inner * 0.22)
    mask = rounded_mask(inner, radius)
    icon = Image.new("RGBA", (inner, inner), (0, 0, 0, 0))
    icon.paste(grad, (0, 0))
    icon.putalpha(mask)
    draw = ImageDraw.Draw(icon)
    draw_bolt(draw, inner)
    if pad:
        canvas.paste(icon, (pad, pad), icon)
        return canvas
    return icon


def save(img: Image.Image, name: str) -> None:
    path = ROOT / name
    img.save(path, "PNG")
    print(f"wrote {path} ({img.size[0]}x{img.size[1]})")


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    for size in (72, 96, 128, 144, 152, 167, 180, 192, 384, 512):
        save(make_icon(size), f"pwa-{size}x{size}.png")
    save(make_icon(192, maskable=True), "pwa-maskable-192x192.png")
    save(make_icon(512, maskable=True), "pwa-maskable-512x512.png")
    apple = make_icon(180)
    save(apple, "apple-touch-icon.png")
    save(apple.copy().resize((152, 152), Image.Resampling.LANCZOS), "apple-touch-icon-152x152.png")
    save(apple.copy().resize((167, 167), Image.Resampling.LANCZOS), "apple-touch-icon-167x167.png")
    save(apple, "apple-touch-icon-180x180.png")
    save(make_icon(32), "favicon-32x32.png")
    save(make_icon(16), "favicon-16x16.png")


if __name__ == "__main__":
    main()
