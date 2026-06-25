# Prototyp gry w przeglądarce

Ten folder zawiera aktualny prototyp gry **Epoki Imperiów** uruchamiany bezpośrednio w przeglądarce.

Cel tego folderu:

- szybko oglądać zmiany,
- dodawać kolejne moduły gry od razu w kodzie,
- nie wymyślać zasad z góry bez testowania,
- opierać się na zatwierdzonym koncepcie z początku projektu.

## Uruchomienie w Codespaces

W terminalu wpisz:

```bash
cd game
python3 -m http.server 8000
```

Potem kliknij w Codespaces komunikat **Open in Browser** przy porcie `8000`.

Możesz też otworzyć bezpośrednio plik:

```txt
index.html
```

## Co już jest

Aktualnie prototyp pokazuje:

- mapę heksową,
- kontynent z oceanem na obrzeżach,
- start gracza,
- osadnika,
- wojownika,
- żetony odkryć poza strefą startową,
- kliknięcie żetonu odkrycia pokazuje jego zawartość.

## Ważne

To nie jest generator mapy. To jest właściwy prototyp gry w przeglądarce.

Generator zostaje w:

```txt
prototypes/map-generator/
```

A tutaj rozwijamy rozgrywkę moduł po module.
