# Epoki Imperiów - świeży prototyp JS

Ten projekt jest maksymalnie prosty:

- bez Reacta,
- bez TypeScript,
- bez Vite,
- bez `npm install`,
- tylko HTML + CSS + JavaScript.

## Pliki

- `index.html` - strona gry,
- `styles.css` - wygląd gry,
- `app.js` - logika gry.

## Uruchomienie w Codespaces

W terminalu wpisz:

```bash
python3 -m http.server 8000
```

Potem otwórz port `8000` w zakładce `PORTS` / `PORTY`.

## Uruchomienie na swoim komputerze

Wejdź do folderu projektu i uruchom:

```bash
python -m http.server 8000
```

albo:

```bash
python3 -m http.server 8000
```

Potem otwórz:

```text
http://localhost:8000
```

## Hosting GitHub Pages

Ponieważ to zwykłe pliki statyczne, GitHub Pages może je hostować bez budowania.

1. Wrzuć `index.html`, `styles.css`, `app.js`, `README.md` do repozytorium.
2. Wejdź w `Settings`.
3. Wejdź w `Pages`.
4. Wybierz `Deploy from a branch`.
5. Branch: `main`.
6. Folder: `/root`.
7. Kliknij `Save`.

Po chwili GitHub da link do strony.
