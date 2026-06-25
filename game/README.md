# Prototyp gry w przeglądarce

Ten folder zawiera prosty prototyp gry **Epoki Imperiów** uruchamiany bezpośrednio w przeglądarce.

## Uruchomienie

Uruchom serwer z głównego folderu repozytorium, czyli z miejsca, gdzie widzisz foldery `game` i `grafiki`:

```bash
python3 -m http.server 8000
```

Potem otwórz:

```txt
http://localhost:8000/game/
```

W Codespaces otwórz port `8000` i dopisz na końcu `/game/`.

## Wymagane grafiki

Gra ładuje heksy z folderu `grafiki`:

```txt
grafiki/wybrzeze.png
grafiki/rowniny.png
grafiki/las.png
grafiki/wzgorza.png
grafiki/gory.png
grafiki/pustynia.png
grafiki/obszar_zalewowy.png
grafiki/tundra.png
```

## Co już jest

- mapa heksowa,
- teren z grafik PNG,
- start gracza,
- osadnik i wojownik,
- ruch jednostek,
- żetony odkryć poza strefą startową,
- dziennik zdarzeń.
