#!/usr/bin/env python3
"""
Epoki Imperiow — prosty generator szkieletu mapy.

Generator tworzy koncepcyjne mapy SVG:
- 20 x 14 heksow = 280 pol,
- jeden duzy nieregularny kontynent,
- ocean na obrzezach,
- woda przybrzezna przy ladzie,
- pasma gor, lasy, jeziora, suchy region i cuda naturalne,
- losowe starty graczy na ladzie,
- brak zetonow odkryc w promieniu 2 heksow od startu.

To jest prototyp wizualny, nie finalny silnik gry.
"""

from __future__ import annotations

import argparse
import json
import math
import random
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

Coord = Tuple[int, int]
TerrainMap = Dict[Coord, str]

COLS = 20
ROWS = 14
HEX_SIZE = 22
MARGIN_X = 34
MARGIN_Y = 48

TERRAIN_COLORS = {
    "ocean": "#2f6f9f",
    "coast": "#5aa7c8",
    "plains": "#8fbd68",
    "forest": "#3f7f4f",
    "hills": "#a58b55",
    "mountain": "#8a8a86",
    "desert": "#d8bc72",
    "lake": "#4f9bc2",
    "natural": "#c58edb",
}

TERRAIN_LABELS = {
    "ocean": "O",
    "coast": "W",
    "plains": "R",
    "forest": "L",
    "hills": "WZ",
    "mountain": "G",
    "desert": "P",
    "lake": "J",
    "natural": "CN",
}

LAND_FOR_START = {"plains", "forest", "hills", "desert"}
LAND_FOR_DISCOVERY = {"plains", "forest", "hills", "desert"}


@dataclass(frozen=True)
class MapResult:
    terrain: TerrainMap
    starts: List[Coord]
    discovery_tokens: List[Coord]
    seed: int
    variant: int


def neighbors(col: int, row: int) -> Iterable[Coord]:
    """Sasiedzi dla ukladu flat-top z przesunieciem kolumn."""
    if col % 2 == 0:
        directions = [(-1, -1), (0, -1), (1, -1), (-1, 0), (1, 0), (0, 1)]
    else:
        directions = [(0, -1), (-1, 0), (1, 0), (-1, 1), (0, 1), (1, 1)]

    for dc, dr in directions:
        nc, nr = col + dc, row + dr
        if 0 <= nc < COLS and 0 <= nr < ROWS:
            yield nc, nr


def oddq_to_cube(col: int, row: int) -> Tuple[int, int, int]:
    x = col
    z = row - (col - (col & 1)) // 2
    y = -x - z
    return x, y, z


def hex_distance(a: Coord, b: Coord) -> int:
    ax, ay, az = oddq_to_cube(*a)
    bx, by, bz = oddq_to_cube(*b)
    return max(abs(ax - bx), abs(ay - by), abs(az - bz))


def nearest_position(candidates: List[Coord], target: Coord) -> Coord:
    return min(candidates, key=lambda p: hex_distance(p, target))


def build_base_continent(rng: random.Random, variant: int) -> TerrainMap:
    """Tworzy ocean i nieregularny glowny lad."""
    terrain: TerrainMap = {}

    center_x = (COLS - 1) / 2 + rng.uniform(-0.6, 0.6)
    center_y = (ROWS - 1) / 2 + rng.uniform(-0.4, 0.4)
    radius_x = rng.uniform(0.72, 0.93)
    radius_y = rng.uniform(0.60, 0.77)
    rotation = rng.uniform(-0.18, 0.18)
    preset = variant % 10

    for row in range(ROWS):
        for col in range(COLS):
            x = (col - center_x) / (COLS / 2)
            y = (row - center_y) / (ROWS / 2)
            xr = x * math.cos(rotation) - y * math.sin(rotation)
            yr = x * math.sin(rotation) + y * math.cos(rotation)

            edge_noise = (
                0.10 * math.sin(col * 1.13 + variant)
                + 0.10 * math.cos(row * 1.31 + variant * 0.7)
                + 0.07 * math.sin((col + row) * 0.91 + variant * 1.3)
            )
            if preset in (1, 6):
                edge_noise += 0.10 * math.sin((col - row) * 0.7)
            if preset in (2, 7):
                edge_noise += 0.08 * math.cos((col + 2 * row) * 0.55)

            value = (xr / radius_x) ** 2 + (yr / radius_y) ** 2 + edge_noise
            is_land = value < 1.0

            # Zatoki / wyciecia brzegu, zeby kontynent nie byl owalem.
            bays = []
            if preset in (0, 3, 5, 8):
                bays.append(col < 4 and 3 <= row <= 8)
            if preset in (1, 4, 8):
                bays.append(col > 15 and 6 <= row <= 11)
            if preset in (2, 6, 9):
                bays.append(row < 2 and 6 <= col <= 10)
            if preset in (0, 5, 7):
                bays.append(row > 11 and 8 <= col <= 14)
            if preset in (3, 9):
                bays.append(col > 13 and row < 5)
            if preset == 6:
                bays.append(col < 6 and row > 9)

            if any(bays):
                is_land = False

            terrain[(col, row)] = "plains" if is_land else "ocean"

    # Male wyspy / polwyspy jako urozmaicenie, ale nie glowna czesc mapy.
    island_candidates = {
        0: [(3, 10), (16, 3), (17, 4)],
        1: [(3, 10), (4, 11), (16, 3)],
        2: [(15, 11), (16, 11), (2, 5)],
        3: [(17, 8), (3, 3), (4, 3)],
        4: [(2, 9), (17, 4), (18, 5)],
        5: [(16, 10), (17, 10), (5, 2)],
        6: [(3, 11), (13, 2), (14, 2)],
        7: [(18, 7), (2, 6), (2, 7)],
        8: [(4, 11), (15, 2), (16, 2)],
        9: [(17, 10), (18, 9), (3, 4)],
    }
    for pos in island_candidates[preset]:
        if pos in terrain:
            terrain[pos] = "plains"

    return terrain


def mark_coasts(terrain: TerrainMap) -> None:
    ocean_to_coast = []
    for row in range(ROWS):
        for col in range(COLS):
            if terrain[(col, row)] == "ocean":
                if any(terrain[n] == "plains" for n in neighbors(col, row)):
                    ocean_to_coast.append((col, row))

    for pos in ocean_to_coast:
        terrain[pos] = "coast"


def add_feature_regions(terrain: TerrainMap, rng: random.Random, variant: int) -> None:
    land_positions = [p for p, t in terrain.items() if t == "plains"]
    if not land_positions:
        return

    def nearest_land(target: Coord) -> Coord:
        return nearest_position(land_positions, target)

    preset = variant % 10

    mountain_chains = [
        [(7, 3), (8, 4), (9, 5), (10, 6), (11, 6)],
        [(8, 2), (8, 3), (9, 4), (9, 5), (10, 6)],
        [(6, 5), (7, 5), (8, 6), (9, 6), (10, 7)],
        [(11, 3), (10, 4), (9, 5), (8, 6), (7, 7)],
        [(5, 4), (6, 5), (7, 6), (8, 7), (9, 8)],
        [(12, 4), (11, 5), (10, 6), (9, 7), (8, 8)],
        [(9, 3), (10, 4), (11, 5), (12, 6), (13, 7)],
        [(6, 7), (7, 7), (8, 7), (9, 8), (10, 8)],
        [(10, 2), (10, 3), (11, 4), (11, 5), (12, 6)],
        [(7, 4), (8, 5), (9, 6), (10, 7), (11, 8)],
    ]

    for target in mountain_chains[preset]:
        pos = nearest_land(target)
        if terrain[pos] == "plains":
            terrain[pos] = "mountain"
            for n in neighbors(*pos):
                if terrain[n] == "plains" and rng.random() < 0.28:
                    terrain[n] = "hills"

    forest_centers = [
        [(5, 6), (14, 5), (5, 9)],
        [(4, 5), (12, 4), (13, 9)],
        [(6, 8), (13, 5), (15, 8)],
        [(5, 4), (7, 9), (14, 7)],
        [(4, 8), (11, 4), (15, 6)],
        [(6, 5), (8, 9), (13, 7)],
        [(4, 6), (12, 8), (15, 5)],
        [(5, 8), (10, 4), (14, 9)],
        [(4, 5), (7, 9), (13, 4)],
        [(6, 4), (12, 5), (14, 8)],
    ][preset]

    for target in forest_centers:
        pos = nearest_land(target)
        if terrain[pos] == "plains":
            terrain[pos] = "forest"
        for n in neighbors(*pos):
            if terrain[n] == "plains" and rng.random() < 0.52:
                terrain[n] = "forest"

    lake_sets = [
        [(12, 8), (13, 8), (8, 9)],
        [(10, 8), (11, 8), (6, 6)],
        [(12, 7), (13, 7), (14, 8)],
        [(9, 8), (10, 8), (13, 5)],
        [(11, 9), (12, 9), (8, 5)],
        [(10, 7), (11, 7), (14, 9)],
        [(7, 8), (8, 8), (13, 9)],
        [(12, 6), (13, 6), (7, 5)],
        [(10, 9), (11, 9), (14, 6)],
        [(9, 9), (10, 9), (13, 7)],
    ][preset]

    for target in lake_sets:
        pos = nearest_land(target)
        if terrain[pos] in {"plains", "forest", "hills"}:
            terrain[pos] = "lake"

    desert_centers = [(15, 10), (14, 9), (15, 8), (13, 10), (16, 8), (14, 10), (15, 9), (13, 9), (16, 9), (14, 8)]
    desert_start = nearest_land(desert_centers[preset])
    if terrain[desert_start] in {"plains", "hills"}:
        terrain[desert_start] = "desert"
    for n in neighbors(*desert_start):
        if terrain[n] in {"plains", "hills"} and rng.random() < 0.50:
            terrain[n] = "desert"

    wonder_targets = [
        [(9, 6), (13, 8)],
        [(8, 4), (11, 8)],
        [(10, 7), (13, 7)],
        [(8, 6), (13, 5)],
        [(7, 7), (12, 9)],
        [(10, 6), (14, 8)],
        [(11, 5), (8, 8)],
        [(9, 8), (13, 6)],
        [(11, 4), (10, 9)],
        [(10, 7), (13, 7)],
    ][preset]

    for target in wonder_targets:
        pos = nearest_land(target)
        if terrain[pos] in {"plains", "forest", "hills", "mountain", "desert", "lake"}:
            terrain[pos] = "natural"


def choose_starts(terrain: TerrainMap, player_count: int) -> List[Coord]:
    candidates = [p for p, t in terrain.items() if t in LAND_FOR_START]
    preferred = [(4, 4), (15, 4), (4, 9), (14, 10), (9, 3), (10, 10), (16, 7), (6, 7)]
    starts: List[Coord] = []

    for target in preferred:
        sorted_candidates = sorted(candidates, key=lambda p: hex_distance(p, target))
        for pos in sorted_candidates:
            if all(hex_distance(pos, existing) >= 4 for existing in starts):
                starts.append(pos)
                break
        if len(starts) >= player_count:
            break

    return starts


def place_discovery_tokens(terrain: TerrainMap, starts: List[Coord], seed: int) -> List[Coord]:
    tokens: List[Coord] = []
    for row in range(ROWS):
        for col in range(COLS):
            pos = (col, row)
            if terrain[pos] not in LAND_FOR_DISCOVERY:
                continue
            if any(hex_distance(pos, start) <= 2 for start in starts):
                continue
            # Gestosc zetonow: czesc ladowych pol poza startem dostaje znacznik.
            if (col * 3 + row + seed) % 3 != 0:
                tokens.append(pos)
    return tokens


def generate_map(seed: int, variant: int, players: int) -> MapResult:
    rng = random.Random(seed)
    terrain = build_base_continent(rng, variant)
    mark_coasts(terrain)
    add_feature_regions(terrain, rng, variant)
    starts = choose_starts(terrain, players)
    discovery_tokens = place_discovery_tokens(terrain, starts, seed)
    return MapResult(terrain=terrain, starts=starts, discovery_tokens=discovery_tokens, seed=seed, variant=variant)


def hex_center(col: int, row: int) -> Tuple[float, float]:
    hex_h = math.sqrt(3) * HEX_SIZE
    x_step = 1.5 * HEX_SIZE
    cx = MARGIN_X + col * x_step + HEX_SIZE
    cy = MARGIN_Y + row * hex_h + hex_h / 2
    if col % 2 == 1:
        cy += hex_h / 2
    return cx, cy


def hex_points(cx: float, cy: float, size: float) -> str:
    points = []
    for i in range(6):
        angle = math.radians(60 * i)
        points.append((cx + size * math.cos(angle), cy + size * math.sin(angle)))
    return " ".join(f"{x:.1f},{y:.1f}" for x, y in points)


def render_svg(result: MapResult, title: str) -> str:
    hex_h = math.sqrt(3) * HEX_SIZE
    x_step = 1.5 * HEX_SIZE
    width = int(MARGIN_X * 2 + (COLS - 1) * x_step + 2 * HEX_SIZE)
    board_height = int(MARGIN_Y * 2 + (ROWS - 1) * hex_h + hex_h + hex_h / 2)
    height = board_height + 92

    parts: List[str] = []
    parts.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">')
    parts.append('<rect width="100%" height="100%" fill="#18354a"/>')
    parts.append(f'<text x="36" y="30" font-family="Arial, sans-serif" font-size="17" fill="#f2efe6" font-weight="bold">{title}</text>')
    parts.append(f'<text x="36" y="52" font-family="Arial, sans-serif" font-size="12" fill="#d8e8f0">seed={result.seed}, wariant={result.variant}, heksy={COLS}x{ROWS}=280</text>')

    for row in range(ROWS):
        for col in range(COLS):
            pos = (col, row)
            terrain = result.terrain[pos]
            cx, cy = hex_center(col, row)
            fill = TERRAIN_COLORS[terrain]
            stroke = "#26323a" if terrain not in {"ocean", "coast"} else "#1f5975"
            parts.append(f'<polygon points="{hex_points(cx, cy, HEX_SIZE * 0.96)}" fill="{fill}" stroke="{stroke}" stroke-width="1.1"/>')
            text_color = "#ffffff" if terrain in {"ocean", "coast", "forest", "mountain", "natural"} else "#1e2a22"
            parts.append(f'<text x="{cx:.1f}" y="{cy+4:.1f}" font-family="Arial, sans-serif" font-size="9.5" text-anchor="middle" fill="{text_color}" font-weight="bold">{TERRAIN_LABELS[terrain]}</text>')

    for col, row in result.discovery_tokens:
        cx, cy = hex_center(col, row)
        parts.append(f'<circle cx="{cx:.1f}" cy="{cy-9:.1f}" r="4.5" fill="#d9c38b" stroke="#5d4622" stroke-width="1"/>')
        parts.append(f'<text x="{cx:.1f}" y="{cy-6.2:.1f}" font-family="Arial, sans-serif" font-size="7.5" text-anchor="middle" fill="#4b3215" font-weight="bold">?</text>')

    for idx, (col, row) in enumerate(result.starts, 1):
        cx, cy = hex_center(col, row)
        parts.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="10.5" fill="#fff7c2" stroke="#a57923" stroke-width="2"/>')
        parts.append(f'<text x="{cx:.1f}" y="{cy+4:.1f}" font-family="Arial, sans-serif" font-size="10.5" text-anchor="middle" fill="#6b4312" font-weight="bold">S{idx}</text>')

    legend_x = 36
    legend_y = board_height + 12
    parts.append(f'<rect x="{legend_x-10}" y="{legend_y-8}" width="{width-52}" height="74" rx="8" fill="#f3ead6" opacity="0.94"/>')
    parts.append(f'<text x="{legend_x}" y="{legend_y+10}" font-family="Arial, sans-serif" font-size="12" fill="#2a2620" font-weight="bold">Legenda: S = start gracza, ? = zeton odkryc poza strefa startowa</text>')

    legend_items = [
        ("R", "rowniny", "plains"), ("L", "las", "forest"), ("WZ", "wzgorza", "hills"),
        ("G", "gory", "mountain"), ("J", "jezioro", "lake"), ("P", "suchy", "desert"),
        ("W", "wybrzeze", "coast"), ("O", "ocean", "ocean"), ("CN", "cud", "natural"),
    ]
    for i, (code, name, terrain) in enumerate(legend_items):
        x = legend_x + (i % 5) * 133
        y = legend_y + 35 + (i // 5) * 22
        parts.append(f'<rect x="{x}" y="{y-11}" width="17" height="13" fill="{TERRAIN_COLORS[terrain]}" stroke="#333" stroke-width="0.5"/>')
        parts.append(f'<text x="{x+23}" y="{y}" font-family="Arial, sans-serif" font-size="11" fill="#2a2620">{code} — {name}</text>')

    parts.append("</svg>")
    return "\n".join(parts)


def write_json(result: MapResult, path: Path) -> None:
    data = {
        "seed": result.seed,
        "variant": result.variant,
        "cols": COLS,
        "rows": ROWS,
        "starts": [{"col": c, "row": r} for c, r in result.starts],
        "discovery_tokens": [{"col": c, "row": r} for c, r in result.discovery_tokens],
        "terrain": [
            {"col": col, "row": row, "terrain": result.terrain[(col, row)]}
            for row in range(ROWS)
            for col in range(COLS)
        ],
    }
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def write_index(output_dir: Path, svg_files: List[Path]) -> None:
    cards = []
    for svg in svg_files:
        cards.append(
            f'<section class="card"><h2>{svg.stem}</h2><img src="{svg.name}" alt="{svg.stem}" /></section>'
        )

    html = f"""<!doctype html>
<html lang="pl">
<head>
  <meta charset="utf-8" />
  <title>Epoki Imperiów — generator map</title>
  <style>
    body {{ margin: 0; font-family: Arial, sans-serif; background: #111820; color: #f2efe6; }}
    header {{ padding: 24px 32px; background: #18354a; }}
    main {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(520px, 1fr)); gap: 24px; padding: 24px; }}
    .card {{ background: #f3ead6; color: #2a2620; border-radius: 12px; padding: 14px; }}
    .card img {{ width: 100%; height: auto; display: block; border-radius: 8px; }}
    h1 {{ margin: 0 0 8px; }}
    h2 {{ margin: 0 0 12px; font-size: 18px; }}
  </style>
</head>
<body>
  <header>
    <h1>Epoki Imperiów — wygenerowane szkielety map</h1>
    <p>Prototyp: jeden kontynent, ocean na obrzeżach, starty na lądzie, żetony odkryć poza strefą startową.</p>
  </header>
  <main>
    {''.join(cards)}
  </main>
</body>
</html>
"""
    (output_dir / "index.html").write_text(html, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generator szkicow mapy dla Epok Imperiow")
    parser.add_argument("--seed", type=int, default=1000, help="Seed bazowy")
    parser.add_argument("--count", type=int, default=10, help="Liczba map do wygenerowania")
    parser.add_argument("--players", type=int, default=6, help="Liczba startow graczy")
    parser.add_argument("--output", type=Path, default=Path("outputs"), help="Folder wyjsciowy")
    args = parser.parse_args()

    args.output.mkdir(parents=True, exist_ok=True)
    svg_files: List[Path] = []

    for i in range(args.count):
        seed = args.seed + i * 17
        variant = i % 10
        result = generate_map(seed=seed, variant=variant, players=args.players)
        number = i + 1
        name = f"mapa_{number:02d}"
        svg_path = args.output / f"{name}.svg"
        json_path = args.output / f"{name}.json"

        svg_path.write_text(render_svg(result, title=f"Epoki Imperiow — wariant mapy {number:02d}"), encoding="utf-8")
        write_json(result, json_path)
        svg_files.append(svg_path)

    write_index(args.output, svg_files)
    print(f"Wygenerowano {len(svg_files)} map w folderze: {args.output}")
    print(f"Podglad HTML: {args.output / 'index.html'}")


if __name__ == "__main__":
    main()
