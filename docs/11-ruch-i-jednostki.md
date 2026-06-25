# 11 — Ruch i jednostki

## Cel modułu

Ten moduł opisuje to, co zostało dodane do prototypu gry w przeglądarce w folderze `game/`.

Moduł powstał po decyzji, że po generatorze mapy przechodzimy do właściwej gry: gracz ma móc klikać jednostki, widzieć ich stan i ruszać nimi po mapie.

## Aktualnie dodane w prototypie

W `game/` dodano:

- zaznaczanie jednostki kliknięciem,
- panel wybranej jednostki,
- statystyki jednostki,
- podświetlanie pól, na które jednostka może wejść,
- ruch jednostki po kliknięciu podświetlonego pola,
- zużywanie punktów ruchu,
- przycisk końca tury,
- odświeżanie ruchu jednostek na końcu tury,
- odkrywanie żetonu po wejściu jednostką na pole z żetonem.

## Jednostki startowe

Gracz zaczyna z dwiema jednostkami:

| Jednostka | HP | Atak | Obrona | Ruch |
|---|---:|---:|---:|---:|
| Osadnik | 10 | 0 | 1 | 2 |
| Wojownik | 20 | 4 | 3 | 2 |

## Zaznaczanie jednostki

Kliknięcie jednostki:

- zaznacza ją na mapie,
- pokazuje jej statystyki w panelu bocznym,
- pokazuje dostępne pola ruchu,
- pozwala ją przesunąć.

## Ruch

Na tym etapie ruch jest prosty:

- jednostka rusza się o 1 heks po kliknięciu podświetlonego pola,
- każdy ruch kosztuje 1 punkt ruchu,
- jednostka ma ograniczoną liczbę punktów ruchu w turze,
- ruch odnawia się po kliknięciu `Koniec tury`.

## Tereny możliwe do wejścia

Na ten moment jednostka może wejść na:

- równiny,
- las,
- wzgórza,
- suchy teren,
- cud naturalny.

Na ten moment jednostka nie wchodzi na:

- ocean,
- wodę przybrzeżną,
- jezioro,
- góry.

To jest robocze i może zostać zmienione.

## Żetony odkryć

Jeżeli jednostka wejdzie na pole z zakrytym żetonem odkrycia, żeton zostaje odkryty automatycznie.

## Status modułu

Status: **prototyp 0.1**

Następne rzeczy do ustalenia przez projektanta:

- czy osadnik i wojownik mają mieć taką samą liczbę ruchu,
- czy lasy/wzgórza mają kosztować więcej ruchu,
- czy wejście na cud naturalny ma wymuszać natychmiastowe zejście z pola,
- czy można stackować kilka jednostek na jednym polu,
- czy ruch ma być liczony po punktach, czy zawsze o 1 pole.
