#!/usr/bin/env python3
"""
Epoki Imperiow - prosty generator szkieletu mapy.

Generator tworzy koncepcyjne mapy SVG:
- 20 x 14 heksow = 280 pol,
- jeden duzy nieregularny kontynent,
- wiecej ladu niz w pierwszej wersji prototypu,
- ocean glownie na obrzezach,
- woda przybrzezna przy ladzie,
- pasma gor, lasy, jeziora, suchy region i cuda naturalne,
- starty graczy na ladzie,
- brak zetonow odkryc w promieniu 2 heksow od startu,
- opcjonalny podglad 40 kafli po 7 heksow przez --show-tiles.

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
TileMap = Dict[Coord, str]

COLS = 20
ROWS = 14
HEX_SIZE = 22
MARGIN_X = 34
MARGIN_Y = 48

TILE_COLS = 8
TILE_ROWS = 5
TILE_CAPACITY = 7

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
LAND_TERRAINS = {"plains", "forest", "hills", "mountain", "desert", "lake", "natural"}
WATER_TERRAINS = {"ocean", "coast"}


@dataclass(frozen=True)
class MapResult:
    terrain: TerrainMap
    starts: List[Coord]
    discovery_tokens: List[Coord]
    tile_assignments: TileMap
    seed: int
    variant: int
    land_scale: float


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


def edge_neighbor(col: int, row: int, edge_index: int) -> Coord:
    """Zwraca sasiada po danej krawedzi heksa.

    Kolejnosc krawedzi odpowiada punktom heksa w renderingu flat-top:
    0=NE, 1=N, 2=NW, 3=SW, 4=S, 5=SE.
    """
    if col % 2 == 0:
        dirs = [(1, -1), (0, -1), (-1, -1), (-1, 0), (0, 1), (1, 0)]
    else:
        dirs = [(1, 0), (0, -1), (-1, 0), (-1, 1), (0, 1), (1, 1)]
    dc, dr = dirs[edge_index]
    return col + dc, row + dr


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


def build_base_continent(rng: random.Random, variant: int, land_scale: float) -> TerrainMap:
    """Tworzy ocean i nieregularny glowny lad."""
    terrain: TerrainMap = {}

    center_x = (COLS - 1) / 2 + rng.uniform(-0.45, 0.45)
    center_y = (ROWS - 1) / 2 + rng.uniform(-0.30, 0.30)

    radius_x = rng.uniform(0.80, 0.98) * land_scale
    radius_y = rng.uniform(0.68, 0.82) * land_scale
    radius_x = min(radius_x, 1.13)
    radius_y = min(radius_y, 0.98)

    rotation = rng.uniform(-0.16, 0.16)
    preset = variant % 10

    for row in range(ROWS):
        for col in range(COLS):
            x = (col - center_x) / (COLS / 2)
            y = (row - center_y) / (ROWS / 2)
            xr = x * math.cos(rotation) - y * math.sin(rotation)
            yr = x * math.sin(rotation) + y * math.cos(rotation)

            edge_noise = (
                0.08 * math.sin(col * 1.13 + variant)
                + 0.08 * math.cos(row * 1.31 + variant * 0.7)
                + 0.06 * math.sin((col + row) * 0.91 + variant * 1.3)
            )
            if preset in (1, 6):
                edge_noise += 0.07 * math.sin((col - row) * 0.7)
            if preset in (2, 7):
                edge_noise += 0.06 * math.cos((col + 2 * row) * 0.55)

            value = (xr / radius_x) ** 2 + (yr / radius_y) ** 2 + edge_noise
            is_land = value < 1.0

            bays = []
            if preset in (0, 3, 5, 8):
                bays.append(col < 3 and 4 <= row <= 7)
            if preset in (1, 4, 8):
                bays.append(col > 16 and 7 <= row <= 10)
            if preset in (2, 6, 9):
                bays.append(row < 2 and 7 <= col <= 10)
            if preset in (0, 5, 7):
                bays.append(row > 12 and 9 <= col <= 13)
            if preset in (3, 9):
                bays.append(col > 16 and row < 4)
            if preset == 6:
                bays.append(col < 4 and row > 10)

            if any(bays):
                is_land = False

            if (col < 2 and row < 2) or (col > COLS - 3 and row < 2):
                is_land = False
            if (col < 2 and row > ROWS - 3) or (col > COLS - 3 and row > ROWS - 3):
                is_land = False

            terrain[(col, row)] = "plains" if is_land else "ocean"

    island_candidates = {
        0: [(3, 10), (16, 3), (17, 4), (2, 7)],
        1: [(3, 10), (4, 11), (16, 3), (17, 8)],
        2: [(15, 11), (16, 11), (2, 5), (3, 6)],
        3: [(17, 8), (3, 3), (4, 3), (16, 9)],
        4: [(2, 9), (17, 4), (18, 5), (3, 8)],
        5: [(16, 10), (17, 10), (5, 2), (4, 11)],
        6: [(3, 11), (13, 2), (14, 2), (16, 8)],
        7: [(18, 7), (2, 6), (2, 7), (16, 3)],
        8: [(4, 11), (15, 2), (16, 2), (3, 5)],
        9: [(17, 10), (18, 9), (3, 4), (4, 10)],
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
            if (col * 3 + row + seed) % 3 != 0:
                tokens.append(pos)
    return tokens


def hex_center(col: int, row: int) -> Tuple[float, float]:
    hex_h = math.sqrt(3) * HEX_SIZE
    x_step = 1.5 * HEX_SIZE
    cx = MARGIN_X + col * x_step + HEX_SIZE
    cy = MARGIN_Y + row * hex_h + hex_h / 2
    if col % 2 == 1:
        cy += hex_h / 2
    return cx, cy


def tile_id(tile_col: int, tile_row: int) -> str:
    return f"{chr(ord('A') + tile_row)}{tile_col + 1}"


def build_tile_assignments() -> TileMap:
    """Dzieli aktualna siatke 280 heksow na 40 roboczych kafli po 7 heksow.

    To jest warstwa prototypowa. Sluzy do sprawdzania granic kafli na obecnej
    siatce 20 x 14. Kazdy kafel dostaje dokladnie 7 pol.
    """
    positions = [(col, row) for row in range(ROWS) for col in range(COLS)]
    tile_centers: List[Tuple[str, float, float]] = []

    for tile_row in range(TILE_ROWS):
        for tile_col in range(TILE_COLS):
            target_col = (tile_col + 0.5) * COLS / TILE_COLS - 0.5
            target_row = (tile_row + 0.5) * ROWS / TILE_ROWS - 0.5
            if tile_row % 2 == 1:
                target_col += 0.25
            cx, cy = hex_center(int(round(target_col)), int(round(target_row)))
            tile_centers.append((tile_id(tile_col, tile_row), cx, cy))

    pairs: List[Tuple[float, str, Coord]] = []
    for pos in positions:
        px, py = hex_center(*pos)
        for tid, tx, ty in tile_centers:
            dist = math.hypot(px - tx, py - ty)
            pairs.append((dist, tid, pos))

    pairs.sort(key=lambda item: item[0])
    counts = {tid: 0 for tid, _, _ in tile_centers}
    assignment: TileMap = {}

    for _, tid, pos in pairs:
        if pos in assignment:
            continue
        if counts[tid] >= TILE_CAPACITY:
            continue
        assignment[pos] = tid
        counts[tid] += 1
        if len(assignment) == len(positions):
            break

    # Awaryjne dopelnienie, gdyby jakies pole nie zostalo przypisane.
    for pos in positions:
        if pos in assignment:
            continue
        tid = min(counts, key=counts.get)
        assignment[pos] = tid
        counts[tid] += 1

    return assignment


def tile_cells(tile_assignments: TileMap) -> Dict[str, List[Coord]]:
    tiles: Dict[str, List[Coord]] = {}
    for pos, tid in tile_assignments.items():
        tiles.setdefault(tid, []).append(pos)
    return tiles


def classify_tile(tile_positions: List[Coord], terrain: TerrainMap, starts: List[Coord]) -> str:
    values = [terrain[pos] for pos in tile_positions]
    water = sum(1 for value in values if value in WATER_TERRAINS)
    mountains_or_hills = sum(1 for value in values if value in {"mountain", "hills"})
    forests = sum(1 for value in values if value == "forest")

    if any(pos in starts for pos in tile_positions):
        return "START"
    if any(terrain[pos] == "natural" for pos in tile_positions):
        return "SPEC"
    if water >= 6:
        return "OCEAN"
    if water >= 3:
        return "WYBRZ"
    if mountains_or_hills + forests >= 4:
        return "TRUD"
    return "LAD"


def generate_map(seed: int, variant: int, players: int, land_scale: float) -> MapResult:
    rng = random.Random(seed)
    terrain = build_base_continent(rng, variant, land_scale)
    mark_coasts(terrain)
    add_feature_regions(terrain, rng, variant)
    starts = choose_starts(terrain, players)
    discovery_tokens = place_discovery_tokens(terrain, starts, seed)
    tile_assignments = build_tile_assignments()
    return MapResult(
        terrain=terrain,
        starts=starts,
        discovery_tokens=discovery_tokens,
        tile_assignments=tile_assignments,
        seed=seed,
        variant=variant,
        land_scale=land_scale,
    )


def hex_points_list(cx: float, cy: float, size: float) -> List[Tuple[float, float]]:
    points = []
    for i in range(6):
        angle = math.radians(60 * i)
        points.append((cx + size * math.cos(angle), cy + size * math.sin(angle)))
    return points


def hex_points(cx: float, cy: float, size: float) -> str:
    return " ".join(f"{x:.1f},{y:.1f}" for x, y in hex_points_list(cx, cy, size))


def terrain_stats(terrain: TerrainMap) -> Dict[str, int]:
    stats: Dict[str, int] = {}
    for terrain_type in terrain.values():
        stats[terrain_type] = stats.get(terrain_type, 0) + 1
    return stats


def render_tile_overlay(result: MapResult) -> List[str]:
    parts: List[str] = []
    parts.append('<g id="tile-boundaries" stroke="#fff2c7" stroke-width="3" stroke-linecap="round" opacity="0.95">')

    for row in range(ROWS):
        for col in range(COLS):
            pos = (col, row)
            current_tile = result.tile_assignments[pos]
            cx, cy = hex_center(col, row)
            pts = hex_points_list(cx, cy, HEX_SIZE * 0.98)

            for edge_index in range(6):
                n = edge_neighbor(col, row, edge_index)
                neighbor_tile = result.tile_assignments.get(n)
                if neighbor_tile == current_tile:
                    continue
                x1, y1 = pts[edge_index]
                x2, y2 = pts[(edge_index + 1) % 6]
                parts.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}"/>')

    parts.append('</g>')

    tiles = tile_cells(result.tile_assignments)
    parts.append('<g id="tile-labels" font-family="Arial, sans-serif" text-anchor="middle" font-weight="bold">')
    for tid, cells in sorted(tiles.items()):
        centers = [hex_center(*pos) for pos in cells]
        avg_x = sum(x for x, _ in centers) / len(centers)
        avg_y = sum(y for _, y in centers) / len(centers)
        tile_type = classify_tile(cells, result.terrain, result.starts)
        parts.append(f'<rect x="{avg_x-23:.1f}" y="{avg_y-16:.1f}" width="46" height="27" rx="6" fill="#111820" opacity="0.78"/>')
        parts.append(f'<text x="{avg_x:.1f}" y="{avg_y-4:.1f}" font-size="11" fill="#fff2c7">{tid}</text>')
        parts.append(f'<text x="{avg_x:.1f}" y="{avg_y+8:.1f}" font-size="8" fill="#d8e8f0">{tile_type}</text>')
    parts.append('</g>')
    return parts


def render_svg(result: MapResult, title: str, show_tiles: bool) -> str:
    hex_h = math.sqrt(3) * HEX_SIZE
    x_step = 1.5 * HEX_SIZE
    width = int(MARGIN_X * 2 + (COLS - 1) * x_step + 2 * HEX_SIZE)
    board_height = int(MARGIN_Y * 2 + (ROWS - 1) * hex_h + hex_h + hex_h / 2)
    height = board_height + 100
    stats = terrain_stats(result.terrain)
    land_count = sum(stats.get(t, 0) for t in LAND_TERRAINS)
    water_count = stats.get("ocean", 0) + stats.get("coast", 0)

    parts: List[str] = []
    parts.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">')
    parts.append('<rect width="100%" height="100%" fill="#18354a"/>')
    parts.append(f'<text x="36" y="30" font-family="Arial, sans-serif" font-size="17" fill="#f2efe6" font-weight="bold">{title}</text>')
    parts.append(f'<text x="36" y="52" font-family="Arial, sans-serif" font-size="12" fill="#d8e8f0">seed={result.seed}, wariant={result.variant}, land_scale={result.land_scale:.2f}, lad={land_count}, woda={water_count}, heksy={COLS}x{ROWS}=280</text>')

    for row in range(ROWS):
        for col in range(COLS):
            pos = (col, row)
            terrain_type = result.terrain[pos]
            cx, cy = hex_center(col, row)
            fill = TERRAIN_COLORS[terrain_type]
            stroke = "#26323a" if terrain_type not in {"ocean", "coast"} else "#1f5975"
            parts.append(f'<polygon points="{hex_points(cx, cy, HEX_SIZE * 0.96)}" fill="{fill}" stroke="{stroke}" stroke-width="1.1"/>')
            text_color = "#ffffff" if terrain_type in {"ocean", "coast", "forest", "mountain", "natural"} else "#1e2a22"
            parts.append(f'<text x="{cx:.1f}" y="{cy+4:.1f}" font-family="Arial, sans-serif" font-size="9.5" text-anchor="middle" fill="{text_color}" font-weight="bold">{TERRAIN_LABELS[terrain_type]}</text>')

    for col, row in result.discovery_tokens:
        cx, cy = hex_center(col, row)
        parts.append(f'<circle cx="{cx:.1f}" cy="{cy-9:.1f}" r="4.5" fill="#d9c38b" stroke="#5d4622" stroke-width="1"/>')
        parts.append(f'<text x="{cx:.1f}" y="{cy-6.2:.1f}" font-family="Arial, sans-serif" font-size="7.5" text-anchor="middle" fill="#4b3215" font-weight="bold">?</text>')

    for idx, (col, row) in enumerate(result.starts, 1):
        cx, cy = hex_center(col, row)
        parts.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="10.5" fill="#fff7c2" stroke="#a57923" stroke-width="2"/>')
        parts.append(f'<text x="{cx:.1f}" y="{cy+4:.1f}" font-family="Arial, sans-serif" font-size="10.5" text-anchor="middle" fill="#6b4312" font-weight="bold">S{idx}</text>')

    if show_tiles:
        parts.extend(render_tile_overlay(result))

    legend_x = 36
    legend_y = board_height + 12
    legend_note = " | kafle: A1-E8 po 7 heksow" if show_tiles else ""
    parts.append(f'<rect x="{legend_x-10}" y="{legend_y-8}" width="{width-52}" height="82" rx="8" fill="#f3ead6" opacity="0.94"/>')
    parts.append(f'<text x="{legend_x}" y="{legend_y+10}" font-family="Arial, sans-serif" font-size="12" fill="#2a2620" font-weight="bold">Legenda: S = start gracza, ? = zeton odkryc poza strefa startowa{legend_note}</text>')

    legend_items = [
        ("R", "rowniny", "plains"), ("L", "las", "forest"), ("WZ", "wzgorza", "hills"),
        ("G", "gory", "mountain"), ("J", "jezioro", "lake"), ("P", "suchy", "desert"),
        ("W", "wybrzeze", "coast"), ("O", "ocean", "ocean"), ("CN", "cud", "natural"),
    ]
    for i, (code, name, terrain_type) in enumerate(legend_items):
        x = legend_x + (i % 5) * 133
        y = legend_y + 35 + (i // 5) * 22
        parts.append(f'<rect x="{x}" y="{y-11}" width="17" height="13" fill="{TERRAIN_COLORS[terrain_type]}" stroke="#333" stroke-width="0.5"/>')
        parts.append(f'<text x="{x+23}" y="{y}" font-family="Arial, sans-serif" font-size="11" fill="#2a2620">{code} - {name}</text>')

    parts.append("</svg>")
    return "\n".join(parts)


def write_json(result: MapResult, path: Path) -> None:
    stats = terrain_stats(result.terrain)
    tiles = tile_cells(result.tile_assignments)
    data = {
        "seed": result.seed,
        "variant": result.variant,
        "land_scale": result.land_scale,
        "cols": COLS,
        "rows": ROWS,
        "tile_cols": TILE_COLS,
        "tile_rows": TILE_ROWS,
        "tile_capacity": TILE_CAPACITY,
        "terrain_stats": stats,
        "starts": [{"col": c, "row": r} for c, r in result.starts],
        "discovery_tokens": [{"col": c, "row": r} for c, r in result.discovery_tokens],
        "tiles": [
            {
                "id": tid,
                "type": classify_tile(cells, result.terrain, result.starts),
                "cells": [{"col": col, "row": row} for col, row in sorted(cells, key=lambda p: (p[1], p[0]))],
            }
            for tid, cells in sorted(tiles.items())
        ],
        "terrain": [
            {
                "col": col,
                "row": row,
                "terrain": result.terrain[(col, row)],
                "tile": result.tile_assignments[(col, row)],
            }
            for row in range(ROWS)
            for col in range(COLS)
        ],
    }
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def write_index(output_dir: Path, svg_files: List[Path], show_tiles: bool) -> None:
    cards = []
    for svg in svg_files:
        cards.append(
            f'<section class="card"><h2>{svg.stem}</h2><img src="{svg.name}" alt="{svg.stem}" /></section>'
        )

    tile_note = " Granice 40 kafli sa wlaczone." if show_tiles else ""
    html = f"""<!doctype html>
<html lang="pl">
<head>
  <meta charset="utf-8" />
  <title>Epoki Imperiów - generator map</title>
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
    <h1>Epoki Imperiów - wygenerowane szkielety map</h1>
    <p>Prototyp 0.3: wiekszy kontynent, mniej oceanu, starty na ladzie, zetony odkryc poza strefa startowa.{tile_note}</p>
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
    parser.add_argument("--land-scale", type=float, default=1.14, help="Ilosc ladu. 1.00 = mniej ladu, 1.14 = standard, 1.22 = bardzo duzo ladu")
    parser.add_argument("--show-tiles", action="store_true", help="Pokaz granice 40 kafli po 7 heksow")
    parser.add_argument("--output", type=Path, default=Path("outputs"), help="Folder wyjsciowy")
    args = parser.parse_args()

    args.output.mkdir(parents=True, exist_ok=True)
    svg_files: List[Path] = []

    for i in range(args.count):
        seed = args.seed + i * 17
        variant = i % 10
        result = generate_map(seed=seed, variant=variant, players=args.players, land_scale=args.land_scale)
        number = i + 1
        name = f"mapa_{number:02d}"
        svg_path = args.output / f"{name}.svg"
        json_path = args.output / f"{name}.json"

        svg_path.write_text(
            render_svg(result, title=f"Epoki Imperiow - wariant mapy {number:02d}", show_tiles=args.show_tiles),
            encoding="utf-8",
        )
        write_json(result, json_path)
        svg_files.append(svg_path)

    write_index(args.output, svg_files, show_tiles=args.show_tiles)
    print(f"Wygenerowano {len(svg_files)} map w folderze: {args.output}")
    print(f"Podglad HTML: {args.output / 'index.html'}")
    if args.show_tiles:
        print("Tryb kafli: wlaczony (--show-tiles).")


if __name__ == "__main__":
    main()
