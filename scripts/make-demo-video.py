#!/usr/bin/env python3
"""Genera assets/videos/demo-herramienta-ia.mp4 (tutorial de 45s)."""

from __future__ import annotations

import math
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1280, 720
FPS = 8
DURATION = 45
OUT = Path(__file__).resolve().parents[1] / "assets/videos/demo-herramienta-ia.mp4"

FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

INDIGO = (99, 102, 241)
VIOLET = (139, 92, 246)
SLATE = (15, 23, 42)
CARD = (30, 41, 59)
MUTED = (148, 163, 184)
WHITE = (241, 245, 249)
SOFT = (203, 213, 225)

SUBTITLES = [
    (0, 5, "Bienvenidos a nuestra plataforma de Micro-Herramientas impulsadas por IA."),
    (5, 15, "En este tutorial aprenderás a utilizar nuestras 9 herramientas especializadas."),
    (15, 25, "Primero, selecciona la categoría que necesitas: Creadores, Empleo o Negocios."),
    (25, 35, "Luego elige la herramienta específica y completa el campo de texto."),
    (35, 45, 'Haz clic en "Generar con IA" y espera el resultado optimizado.'),
]


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REG, size)


def lerp(a, b, t: float):
    t = max(0.0, min(1.0, t))
    if isinstance(a, tuple):
        return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(len(a)))
    return a + (b - a) * t


def rounded(draw: ImageDraw.ImageDraw, box, radius: int, fill):
    draw.rounded_rectangle(box, radius=radius, fill=fill)


def wrap(draw, text, fnt, max_w):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        test = f"{cur} {w}".strip()
        if draw.textlength(test, font=fnt) <= max_w:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def subtitle_for(t: float) -> str:
    for a, b, txt in SUBTITLES:
        if a <= t < b:
            return txt
    return SUBTITLES[-1][2]


def draw_progress(draw, t: float):
    rounded(draw, (80, 686, 1200, 698), 6, (51, 65, 85))
    x = 80 + int(1120 * (t / DURATION))
    rounded(draw, (80, 686, x, 698), 6, INDIGO)


def draw_caption(img, t: float):
    draw = ImageDraw.Draw(img)
    txt = subtitle_for(t)
    fnt = font(22)
    lines = wrap(draw, txt, fnt, 1080)
    box_h = 28 + 30 * len(lines)
    y0 = 610 - box_h
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rounded_rectangle((70, y0, 1210, 610), radius=16, fill=(15, 23, 42, 210))
    img.alpha_composite(overlay)
    draw = ImageDraw.Draw(img)
    y = y0 + 16
    for line in lines:
        tw = draw.textlength(line, font=fnt)
        draw.text(((W - tw) / 2, y), line, font=fnt, fill=WHITE)
        y += 30
    draw_progress(draw, t)


def header(draw, active="creadores"):
    rounded(draw, (40, 28, 1240, 108), 18, CARD)
    draw.text((68, 52), "AI Tools", font=font(28, True), fill=WHITE)
    tabs = [("creadores", "Creadores"), ("empleo", "Empleo"), ("negocios", "Negocios")]
    x = 320
    for key, label in tabs:
        fill = INDIGO if key == active else (51, 65, 85)
        rounded(draw, (x, 48, x + 170, 90), 12, fill)
        tw = draw.textlength(label, font=font(16, True))
        draw.text((x + (170 - tw) / 2, 58), label, font=font(16, True), fill=WHITE)
        x += 190
    draw.text((1080, 58), "3/3 hoy", font=font(16), fill=MUTED)


def cards(draw, tools, highlight=None, pulse=0.0):
    x0, y0 = 70, 150
    for i, (icon, title, tag) in enumerate(tools):
        col, row = i % 3, i // 3
        x, y = x0 + col * 390, y0 + row * 200
        fill = CARD
        if highlight == i:
            fill = lerp(CARD, (55, 48, 110), 0.35 + 0.25 * math.sin(pulse))
        rounded(draw, (x, y, x + 360, y + 170), 18, fill)
        if highlight == i:
            draw.rounded_rectangle((x, y, x + 360, y + 170), radius=18, outline=INDIGO, width=3)
        draw.text((x + 24, y + 22), icon, font=font(32), fill=WHITE)
        draw.text((x + 24, y + 72), title, font=font(22, True), fill=WHITE)
        rounded(draw, (x + 24, y + 118, x + 24 + 8 * len(tag) + 28, y + 146), 10, (51, 65, 85))
        draw.text((x + 36, y + 122), tag, font=font(13), fill=SOFT)


def scene_welcome(t: float) -> Image.Image:
    img = Image.new("RGBA", (W, H), SLATE)
    draw = ImageDraw.Draw(img)
    glow = 0.5 + 0.5 * math.sin(t * 2.2)
    badge = lerp(INDIGO, VIOLET, glow)
    rounded(draw, (470, 170, 810, 250), 28, badge)
    tw = draw.textlength("AI Tools", font=font(36, True))
    draw.text(((W - tw) / 2, 192), "AI Tools", font=font(36, True), fill=WHITE)
    title = "Micro-Herramientas impulsadas por IA"
    f = font(34, True)
    tw = draw.textlength(title, font=f)
    draw.text(((W - tw) / 2, 290), title, font=f, fill=WHITE)
    sub = "Creadores  ·  Empleo  ·  Negocios"
    tw = draw.textlength(sub, font=font(22))
    draw.text(((W - tw) / 2, 350), sub, font=font(22), fill=MUTED)
    return img


def scene_nine_tools(t: float) -> Image.Image:
    img = Image.new("RGBA", (W, H), SLATE)
    draw = ImageDraw.Draw(img)
    header(draw)
    tools = [
        ("1", "Generador de Guiones", "Contenido"),
        ("2", "Generador de Hooks", "Marketing"),
        ("3", "Generador de Captions", "Social"),
        ("4", "Optimizador de CV", "Carrera"),
        ("5", "Carta de Presentación", "Aplicación"),
        ("6", "Preparación Entrevista", "Entrevista"),
        ("7", "Emails de Ventas", "Ventas"),
        ("8", "Pitch Deck", "Startup"),
        ("9", "Propuesta de Valor", "Estrategia"),
    ]
    # reveal cards over the first 8 seconds of this scene locally
    local = t - 5
    visible = min(9, int(local * 1.2) + 1)
    cards(draw, tools[:visible], highlight=visible - 1 if visible else None, pulse=t * 4)
    return img


def scene_categories(t: float) -> Image.Image:
    img = Image.new("RGBA", (W, H), SLATE)
    draw = ImageDraw.Draw(img)
    cats = [
        ("Creadores", "Guiones, hooks y captions virales"),
        ("Empleo", "CV, carta y preparación de entrevista"),
        ("Negocios", "Emails, pitch deck y propuesta de valor"),
    ]
    idx = int(((t - 15) / 10) * 3) % 3
    header(draw, ["creadores", "empleo", "negocios"][idx])
    for i, (name, desc) in enumerate(cats):
        x = 90 + i * 380
        fill = lerp(CARD, (67, 56, 140), 0.55) if i == idx else CARD
        rounded(draw, (x, 180, x + 340, 480), 24, fill)
        if i == idx:
            draw.rounded_rectangle((x, 180, x + 340, 480), radius=24, outline=INDIGO, width=4)
        draw.text((x + 28, 230), name, font=font(28, True), fill=WHITE)
        lines = wrap(draw, desc, font(18), 280)
        y = 300
        for line in lines:
            draw.text((x + 28, y), line, font=font(18), fill=SOFT)
            y += 28
        if i == idx:
            draw.text((x + 28, 410), "Seleccionado", font=font(16, True), fill=INDIGO)
    return img


def scene_input(t: float) -> Image.Image:
    img = Image.new("RGBA", (W, H), SLATE)
    draw = ImageDraw.Draw(img)
    header(draw)
    rounded(draw, (90, 140, 1190, 560), 22, CARD)
    draw.text((120, 168), "Generador de Guiones", font=font(28, True), fill=WHITE)
    draw.text((120, 212), "¿De qué quieres hablar en tu video?", font=font(18), fill=MUTED)
    rounded(draw, (120, 250, 1160, 400), 14, (15, 23, 42))
    typed = "3 trucos para ahorrar dinero trabajando como freelancer"
    chars = min(len(typed), int((t - 25) * 6))
    shown = typed[:chars] + ("|" if int(t * 2) % 2 == 0 and chars < len(typed) else "")
    draw.text((140, 270), shown, font=font(20), fill=WHITE)
    draw.text((140, 360), f"{max(chars, 0)}/5000", font=font(14), fill=MUTED)
    rounded(draw, (120, 430, 420, 500), 14, (51, 65, 85))
    draw.text((155, 450), "Generar con IA", font=font(20, True), fill=SOFT)
    return img


def scene_generate(t: float) -> Image.Image:
    img = Image.new("RGBA", (W, H), SLATE)
    draw = ImageDraw.Draw(img)
    header(draw)
    rounded(draw, (90, 140, 1190, 560), 22, CARD)
    draw.text((120, 168), "Generador de Guiones", font=font(28, True), fill=WHITE)
    local = t - 35
    if local < 3.5:
        pulse = 0.5 + 0.5 * math.sin(t * 6)
        btn = lerp(INDIGO, VIOLET, pulse)
        rounded(draw, (120, 230, 460, 300), 14, btn)
        draw.text((155, 250), "Generando...", font=font(20, True), fill=WHITE)
        rounded(draw, (120, 330, 1160, 360), 8, (51, 65, 85))
        w = int(1040 * min(1.0, local / 3.5))
        rounded(draw, (120, 330, 120 + w, 360), 8, INDIGO)
    else:
        rounded(draw, (120, 230, 460, 300), 14, (16, 185, 129))
        draw.text((155, 250), "Generado", font=font(20, True), fill=WHITE)
        rounded(draw, (120, 330, 1160, 520), 16, (15, 23, 42))
        draw.text((150, 350), "HOOK", font=font(14, True), fill=INDIGO)
        draw.text((150, 376), "Deja de perder 2 horas al día en tareas que ya puedes automatizar.", font=font(18), fill=WHITE)
        draw.text((150, 430), "CTA", font=font(14, True), fill=INDIGO)
        draw.text((150, 456), "Guarda el video y pruébalo mañana a primera hora.", font=font(18), fill=WHITE)
    return img


def frame_at(t: float) -> Image.Image:
    if t < 5:
        img = scene_welcome(t)
    elif t < 15:
        img = scene_nine_tools(t)
    elif t < 25:
        img = scene_categories(t)
    elif t < 35:
        img = scene_input(t)
    else:
        img = scene_generate(t)
    draw_caption(img, t)
    return img.convert("RGB")


def encode(frames_dir: Path):
    OUT.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "gst-launch-1.0",
        "-e",
        "multifilesrc",
        f"location={frames_dir}/frame_%04d.png",
        "index=0",
        "caps=image/png,framerate=8/1",
        "!",
        "pngdec",
        "!",
        "videoconvert",
        "!",
        "x264enc",
        "speed-preset=fast",
        "tune=stillimage",
        "key-int-max=16",
        "!",
        "video/x-h264,profile=high",
        "!",
        "mp4mux",
        "!",
        "filesink",
        f"location={OUT}",
    ]
    subprocess.run(cmd, check=True)


def main():
    tmp = Path(tempfile.mkdtemp(prefix="demo-frames-"))
    try:
        total = DURATION * FPS
        for i in range(total):
            t = i / FPS
            frame_at(t).save(tmp / f"frame_{i:04d}.png")
        encode(tmp)
        print(f"OK {OUT} ({OUT.stat().st_size} bytes)")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
