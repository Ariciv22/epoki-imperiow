# 12 — Wygląd kafli w grze

## Cel modułu

Ten moduł opisuje zmianę wyglądu heksów w prototypie gry w przeglądarce.

Zamiast płaskich kolorów typu zielony/żółty, prototyp zaczyna używać generowanych wzorów SVG dla terenów.

## Co zostało dodane

W `game/app.js` dodano proceduralne wzory terenów:

- równiny — trawa i jasne smugi,
- las — drzewa,
- wzgórza — łagodne pagórki,
- góry — szare szczyty ze śniegiem,
- pustynia / suchy teren — wydmy,
- ocean — fale,
- wybrzeże — woda i jasna linia brzegu,
- jezioro — spokojna woda,
- cud naturalny — wyróżniający symbol.

## Założenie

To nie są jeszcze finalne ilustracje.

To jest etap przejściowy:

```txt
płaskie kolory → generowane wzory SVG → docelowe obrazy / assety terenu
```

Dzięki temu można dalej testować grę w przeglądarce i od razu widzieć kierunek wizualny.

## Status modułu

Status: **prototyp 0.1**

Następny krok: zdecydować, czy generujemy osobne grafiki/asset pack dla każdego typu terenu, czy dalej rozwijamy proceduralne wzory SVG w kodzie.
