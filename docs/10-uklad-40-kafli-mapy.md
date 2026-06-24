# 10 — Układ 40 kafli mapy

## Cel dokumentu

Ten dokument opisuje, jak pełna mapa gry **Epoki Imperiów** ma być zbudowana z **40 kafli mapy**.

Do tej pory generator pokazywał mapę jako prostą siatkę **20 × 14 heksów = 280 pól**. To jest dobre do testowania wyglądu świata, ale finalnie plansza ma składać się z fizycznych kafli:

- **40 kafli mapy**,
- **7 heksów na kafel**,
- razem **280 heksów**.

## Najważniejsza decyzja

Mapa nie powinna być traktowana wyłącznie jako prostokąt 20 × 14 heksów.

Docelowo mapa ma być składana z kafli 7-heksowych, a generator powinien umieć pokazać:

- pojedyncze heksy,
- granice kafli,
- typ każdego kafla,
- rozmieszczenie kafli lądowych, wodnych, wybrzeżnych i specjalnych.

## Standard pojedynczego kafla

Każdy kafel ma 7 heksów:

```txt
        NW      NE
     W      C      E
        SW      SE
```

Oznaczenia:

- **C** — centrum kafla,
- **W** — zachód,
- **NW** — północny zachód,
- **NE** — północny wschód,
- **E** — wschód,
- **SE** — południowy wschód,
- **SW** — południowy zachód.

Ten standard jest opisany szerzej w dokumencie:

- [07 — Layout kafla](07-layout-kafla.md)

## Roboczy układ 40 kafli

Na potrzeby prototypu przyjmujemy układ **8 × 5 kafli**:

```txt
Rząd A:  A1  A2  A3  A4  A5  A6  A7  A8
Rząd B:    B1  B2  B3  B4  B5  B6  B7  B8
Rząd C:  C1  C2  C3  C4  C5  C6  C7  C8
Rząd D:    D1  D2  D3  D4  D5  D6  D7  D8
Rząd E:  E1  E2  E3  E4  E5  E6  E7  E8
```

Razem:

```txt
5 rzędów × 8 kafli = 40 kafli
40 kafli × 7 heksów = 280 heksów
```

Przesunięcie rzędów B i D ma pomóc uzyskać bardziej naturalny, heksowy kształt mapy.

## Ważne założenie wizualne

Nawet jeśli technicznie kafle są ułożone w układzie 8 × 5, mapa nie może wyglądać jak prostokąt.

Efekt nieregularnego kontynentu uzyskujemy przez:

- oceaniczne kafle na obrzeżach,
- wybrzeża na granicach lądu i wody,
- zatoki wcinające się w kontynent,
- półwyspy wychodzące w ocean,
- ląd skupiony głównie w środku,
- kilka skrawków lądu przy krawędziach.

## Typy kafli

Każdy z 40 kafli powinien mieć jeden główny typ projektowy.

Proponowany podział roboczy:

| Typ kafla | Liczba | Rola |
|---|---:|---|
| Lądowy podstawowy | 12 | równiny, lasy, wzgórza, rozwój miast |
| Lądowy trudny | 6 | góry, wzgórza, lasy, przejścia strategiczne |
| Wybrzeżny | 10 | przejście między lądem i wodą, zatoki, półwyspy |
| Wodny / oceaniczny | 6 | zewnętrzna rama mapy, morze, ograniczenie planszy |
| Startowy | 4 | dobre regiony startowe, bez żetonów odkryć w promieniu 2 heksów |
| Specjalny | 2 | cuda naturalne, wyjątkowe układy terenu |

Razem: **40 kafli**.

To jest podział roboczy. Można go zmienić po testach.

## Regiony mapy

Mapa powinna mieć kilka czytelnych regionów:

### Centrum kontynentu

Najważniejsza część mapy.

Powinna zawierać:

- dużo lądu,
- równiny,
- lasy,
- wzgórza,
- część gór,
- dobre miejsca pod miasta,
- konflikty o centrum.

### Pasma górskie

Góry powinny przechodzić przez kilka kafli.

Nie powinny być tylko pojedynczymi polami bez sensu.

Rola gór:

- dzielenie regionów,
- tworzenie przejść strategicznych,
- budowanie klimatu mapy,
- sąsiedztwo cudów naturalnych.

### Wybrzeża

Wybrzeża powinny być na obrzeżach kontynentu, ale nieregularne.

Dobre wybrzeże ma:

- zatoki,
- cyple,
- półwyspy,
- wodę przybrzeżną,
- miejsce na eksplorację.

### Woda i ocean

Ocean ma ograniczać planszę, ale nie powinien zabierać zbyt dużo miejsca.

Po ostatnich testach kierunek jest taki:

- mniej pustych kafli oceanu,
- więcej lądu,
- ocean głównie jako rama i wybrzeża,
- pełne wodne kafle tylko tam, gdzie pomagają ukształtować świat.

## Kafle startowe

Kafle startowe powinny być projektowane osobno albo oznaczane przez generator.

Kafel startowy powinien:

- mieć przewagę lądu,
- mieć sensowną przestrzeń ekspansji,
- nie mieć startu na wodzie, jeziorze, górze ani cudzie naturalnym,
- mieć kilka pól nadających się pod pierwsze miasto,
- nie zawierać żetonów odkryć w promieniu 2 heksów od pola startowego.

Start może wypaść na różnych skrawkach lądu, ale musi być grywalny.

## Kafle specjalne

Kafle specjalne służą do ciekawych miejsc na mapie.

Przykłady:

- cud naturalny w górach,
- jezioro z lasem,
- krater,
- wielkie drzewo,
- oaza na suchym terenie,
- wodospad,
- lodowiec,
- gejzer.

Kafel specjalny nie powinien być startowy.

## Obracanie kafli

Docelowo kafle mogą być obracane.

Zalety obracania:

- większa regrywalność,
- więcej kombinacji mapy,
- mniej potrzeby tworzenia ogromnej liczby unikalnych kafli.

Ograniczenia:

- kafel po obróceniu nadal musi wyglądać naturalnie,
- wybrzeże nie może po obrocie tworzyć brzydkich, nielogicznych przejść,
- pasma górskie powinny móc łączyć się z sąsiednimi kaflami.

## Co powinien pokazywać generator

Następna wersja generatora powinna mieć opcję pokazania granic kafli.

Proponowana flaga:

```bash
--show-tiles
```

Po jej użyciu mapa powinna pokazywać:

- pojedyncze heksy,
- grubszy obrys każdego kafla 7-heksowego,
- oznaczenie kafla, np. `A1`, `A2`, `B1`,
- typ kafla, np. lądowy, wybrzeżny, oceaniczny, startowy, specjalny.

## Dalszy kierunek generatora

Generator powinien działać tak:

1. Utwórz 40 miejsc na kafle.
2. Każdemu miejscu przypisz rolę: ląd, wybrzeże, ocean, start, specjalny.
3. W każdym kaflu wygeneruj 7 heksów.
4. Połącz kafle w jedną mapę 280 heksów.
5. Dopasuj brzegi terenów między sąsiednimi kaflami.
6. Rozmieść starty.
7. Usuń żetony odkryć ze stref startowych.
8. Rozmieść żetony odkryć na pozostałych polach.
9. Sprawdź grywalność mapy.
10. Wygeneruj SVG/JSON/HTML.

## Status modułu

Status: **wersja projektowa 0.1**

Następny krok techniczny: dodać do generatora tryb `--show-tiles`, który pokaże granice 40 kafli na mapie.
