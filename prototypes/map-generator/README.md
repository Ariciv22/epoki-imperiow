# Prototyp generatora mapy

Ten folder zawiera pierwszy prosty generator szkieletu mapy dla gry **Epoki Imperiów**.

Generator tworzy mapy koncepcyjne SVG, które pomagają ocenić układ świata przed projektowaniem finalnych kafli i grafik.

## Co generuje

Generator tworzy:

- mapę **20 × 14 heksów**, czyli **280 pól**,
- jeden duży nieregularny kontynent,
- ocean na obrzeżach,
- wodę przybrzeżną przy lądzie,
- równiny, lasy, wzgórza, góry, jeziora, suchy region i cuda naturalne,
- starty graczy na lądzie,
- żetony odkryć poza strefami startowymi,
- pliki SVG z mapą,
- pliki JSON z danymi mapy,
- plik `index.html` do szybkiego podglądu.

## Uruchomienie

W folderze repozytorium uruchom:

```bash
python prototypes/map-generator/generate_map.py
```

Domyślnie powstanie folder:

```txt
outputs/
```

A w nim:

```txt
mapa_01.svg
mapa_01.json
mapa_02.svg
mapa_02.json
...
index.html
```

## Przykład: wygeneruj 10 map

```bash
python prototypes/map-generator/generate_map.py --count 10 --output outputs/mapy-testowe
```

## Przykład: inny seed

```bash
python prototypes/map-generator/generate_map.py --seed 2200 --count 10 --output outputs/seed-2200
```

## Przykład: inna liczba startów graczy

```bash
python prototypes/map-generator/generate_map.py --players 4 --count 10 --output outputs/4-graczy
```

## Status

Status: **prototyp 0.1**

Ten generator nie jest jeszcze finalnym narzędziem. Służy do szybkiego testowania szkieletu mapy i rozmieszczenia terenów.

## Następne kroki

Do dopracowania później:

- dokładniejszy algorytm jednego spójnego kontynentu,
- kontrola procentu lądu i wody,
- lepsze rozmieszczenie startów,
- eksport gotowych kafli 7-heksowych,
- tryb generowania map z 40 kafli,
- możliwość zapisywania wybranego wariantu jako oficjalna mapa testowa.
