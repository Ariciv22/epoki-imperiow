# 07 — Layout kafla

## Cel dokumentu

Ten dokument ustala stały layout pojedynczego kafla mapy w grze **Epoki Imperiów**.

Od tego miejsca każdy kafel 7-heksowy opisujemy tak samo. Dzięki temu później będzie łatwiej tworzyć grafiki, prototypy, pliki SVG, kafle do druku i generator mapy.

## Standard kafla

Każdy kafel składa się z **7 heksów**:

- 1 heks centralny,
- 6 heksów dookoła.

Przyjmujemy heksy typu **flat-top**, czyli z płaską górną i dolną krawędzią.

## Układ pozycji na kaflu

Od teraz używamy takiego układu:

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

To jest główny standard dla wszystkich kafli mapy.

## Numeracja pól

Dla prototypów i kodu możemy używać numerów:

```txt
        2       3
     1      0       4
        6       5
```

Mapowanie:

- **0 = C**
- **1 = W**
- **2 = NW**
- **3 = NE**
- **4 = E**
- **5 = SE**
- **6 = SW**

W dokumentacji używamy głównie oznaczeń literowych, a w prototypach można używać numerów.

## Szablon opisu kafla

Każdy kafel opisujemy według tego schematu:

```txt
Nazwa kafla:
Typ kafla:
Rola kafla:

Układ wizualny:
        NW      NE
     W      C      E
        SW      SE

Tereny:
C  =
W  =
NW =
NE =
E  =
SE =
SW =

Żetony odkryć:
C  = tak / nie / specjalny
W  = tak / nie / specjalny
NW = tak / nie / specjalny
NE = tak / nie / specjalny
E  = tak / nie / specjalny
SE = tak / nie / specjalny
SW = tak / nie / specjalny

Uwagi wizualne:
Uwagi mechaniczne:
```

## Skróty terenów

Na potrzeby projektowania kafli używamy skrótów:

- **R** — równiny,
- **L** — las,
- **WZ** — wzgórza,
- **G** — góry,
- **WP** — woda przybrzeżna,
- **O** — ocean,
- **J** — jezioro,
- **P** — pustynia / suchy teren,
- **CN** — cud naturalny,
- **SPE** — teren specjalny.

## Warstwy graficzne kafla

Każdy kafel projektujemy w warstwach.

### 1. Tło terenu

Kolor i tekstura heksa:

- trawa,
- las,
- skały,
- woda,
- piasek,
- jezioro,
- teren specjalny.

### 2. Ilustracja terenu

Elementy widoczne na polu:

- drzewa,
- góry,
- wzgórza,
- fale,
- brzegi,
- wydmy,
- skały,
- drobne detale klimatyczne.

### 3. Siatka heksów

Granice pól mają być widoczne, ale delikatne.

Założenia:

- cienki obrys,
- brak grubej czarnej siatki,
- obrys lekko ciemniejszy od terenu,
- granice muszą być czytelne po położeniu żetonów i jednostek.

### 4. Miejsce na żeton

Każdy heks powinien mieć czytelne miejsce na żeton odkrycia.

Żeton nie powinien zasłaniać całego pola. Pod żetonem nadal powinno być widać typ terenu.

### 5. Ikony i zasoby

Ikony zasobów powinny być mniejsze niż żetony odkryć i nie mogą konkurować z jednostkami.

Najlepsze miejsca dla ikon:

- dolna część heksa,
- boczna część heksa,
- mały symbol centralny, jeśli na polu nie ma żetonu.

## Wymiary robocze

Na tym etapie nie ustalamy jeszcze ostatecznego rozmiaru fizycznego kafla, ale przyjmujemy robocze założenia:

- kafel musi być czytelny na stole,
- jeden heks musi pomieścić żeton i jednostkę,
- heks nie może być zbyt mały,
- grafika nie może tracić czytelności po wydruku.

Docelowy rozmiar ustalimy po pierwszym prototypie druku.

## Zasady obracania kafla

Kafel powinien wyglądać dobrze także po obróceniu.

Ważne:

- teren nie powinien mieć napisów zależnych od orientacji,
- ikony powinny być proste i czytelne,
- wybrzeża i pasma górskie mogą tworzyć różne układy po obrocie,
- obracanie kafli zwiększa różnorodność mapy.

## Czego unikamy

Unikamy:

- zbyt mocnych granic kafla,
- układu, w którym kafel wygląda jak osobny puzzel po połączeniu z innymi,
- zbyt dużych ikon na heksach,
- terenu zasłaniającego granice pól,
- zbyt ciemnych pól, na których nie widać jednostek,
- zbyt podobnych kolorów dla różnych typów terenu.

## Test czytelności kafla

Każdy kafel powinien przejść prosty test:

1. Czy z odległości około 1 metra widać typy terenu?
2. Czy da się łatwo policzyć sąsiednie heksy?
3. Czy środek każdego heksa nadaje się pod żeton?
4. Czy jednostka będzie widoczna na każdym typie pola?
5. Czy kafel po obróceniu nadal wygląda naturalnie?
6. Czy po połączeniu z innymi kaflami nie widać brzydkiej granicy?

## Następny krok

Po tym dokumencie należy przerobić pierwsze 12 kafli bazowych na ten standard pozycji:

```txt
        NW      NE
     W      C      E
        SW      SE
```

Następnie można przygotować prosty szkic jednego kafla, np. **Równiny startowe**.

## Status modułu

Status: **wersja projektowa 0.1**
