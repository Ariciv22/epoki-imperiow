# 11 — Rdzeń rozgrywki

## Cel dokumentu

Ten dokument zaczyna drugi etap projektu **Epoki Imperiów**.

Etap mapy i generatora jest na razie wystarczająco zamknięty. Teraz przechodzimy do tego, co gracz faktycznie robi w trakcie gry.

Ten moduł opisuje główny szkielet rozgrywki, do którego później dopinamy:

- miasta,
- produkcję,
- technologie,
- polityki,
- handel,
- wojsko,
- cuda,
- liderów,
- cywilizacje,
- warunki zwycięstwa.

## Główna pętla gry

Gra powinna opierać się na prostej pętli:

```txt
Odkrywaj → Osiedlaj się → Rozwijaj → Rywalizuj → Zwycięż
```

Gracz powinien stale podejmować decyzje:

- gdzie wysłać jednostki,
- gdzie założyć miasto,
- co produkować,
- w jaką technologię iść,
- czy rozwijać gospodarkę, wojsko, kulturę czy naukę,
- kiedy handlować,
- kiedy walczyć,
- kiedy budować cuda,
- jaką ścieżkę zwycięstwa obrać.

## Główne filary rozgrywki

### 1. Eksploracja

Eksploracja jest pierwszym silnikiem gry.

Gracz odkrywa mapę przez ruch jednostek i zdejmowanie żetonów odkryć.

Eksploracja daje:

- informacje o terenie,
- nagrody,
- potencjalne zasoby,
- miejsca pod miasta,
- cuda naturalne,
- kontakt z innymi graczami.

### 2. Ekspansja

Ekspansja polega na zajmowaniu nowych obszarów i zakładaniu miast.

Miasta są głównym źródłem:

- produkcji,
- nauki,
- kultury,
- złota / handlu,
- jednostek,
- punktów zwycięstwa.

### 3. Rozwój cywilizacji

Rozwój odbywa się przez technologie, polityki, miasta i karty cywilizacji.

Gracz powinien czuć, że jego cywilizacja rośnie od małego plemienia do imperium.

### 4. Rywalizacja

Rywalizacja może być militarna, ekonomiczna, technologiczna albo kulturowa.

Gra nie powinna wymuszać jednej ścieżki zwycięstwa.

### 5. Zwycięstwo

Gracz może wygrać różnymi drogami.

Robocze ścieżki zwycięstwa:

- militarna,
- naukowa,
- kulturowa,
- ekonomiczna / handlowa,
- cudów / prestiżu.

Religia jest na tym etapie pominięta.

## Struktura rundy

Roboczo każda runda składa się z kilku faz.

```txt
1. Faza początku rundy
2. Faza dochodu
3. Faza akcji graczy
4. Faza konfliktów i rozstrzygnięć
5. Faza końca rundy
```

## 1. Faza początku rundy

W tej fazie przygotowuje się nową rundę.

Możliwe działania:

- odkrycie nowych kart rynku,
- odświeżenie limitów,
- przygotowanie wydarzeń,
- sprawdzenie efektów czasowych,
- oznaczenie nowej ery, jeśli gra tego wymaga.

Na razie ta faza powinna być lekka i szybka.

## 2. Faza dochodu

Gracze otrzymują dochód ze swoich miast, terenów, kart i efektów.

Podstawowe typy dochodu do dalszego opracowania:

- żywność,
- produkcja,
- nauka,
- kultura,
- złoto / handel,
- wpływy / prestiż.

Nie wszystkie muszą od razu istnieć jako fizyczne żetony. Część może być zapisywana na torach albo kartach.

## 3. Faza akcji graczy

To jest najważniejsza część rundy.

Gracze wykonują akcje na zmianę albo każdy wykonuje pełną turę.

Roboczo są dwa możliwe modele:

### Model A — pełna tura gracza

Gracz wykonuje wszystkie swoje akcje, potem następny gracz.

Zalety:

- łatwiejsze do zrozumienia,
- prostsze do prototypu,
- mniej przerywania.

Wady:

- dłuższe oczekiwanie między turami,
- większe ryzyko, że jeden gracz długo myśli.

### Model B — akcje naprzemienne

Gracze wykonują po jednej akcji, aż wszyscy spasują.

Zalety:

- większa dynamika,
- mniej czekania,
- lepsze napięcie przy wojnie i eksploracji.

Wady:

- trudniejsze do zbalansowania,
- wymaga jasnych limitów akcji.

## Wstępna rekomendacja

Na pierwszy prototyp wybieramy:

```txt
Model A — pełna tura gracza
```

Powód: jest prostszy do testowania i łatwiej na nim zbudować resztę zasad.

Później można przejść na akcje naprzemienne, jeśli gra będzie zbyt statyczna.

## Akcje gracza

W swojej turze gracz powinien mieć ograniczoną liczbę akcji.

Roboczo:

```txt
Gracz ma 3 akcje główne na turę.
```

Akcje mogą obejmować:

- ruch jednostką,
- eksplorację żetonu odkrycia,
- założenie miasta,
- budowę w mieście,
- rekrutację jednostki,
- badanie technologii,
- zagranie polityki,
- handel,
- atak,
- budowę cudu,
- akcję cywilizacji albo lidera.

Niektóre rzeczy mogą być darmowe albo automatyczne, np. pobranie dochodu.

## Dlaczego 3 akcje

3 akcje są dobrym punktem startowym, bo:

- gracz ma wybór,
- tura nie jest zbyt długa,
- można łączyć ruch, rozwój i produkcję,
- łatwo testować balans,
- liczba jest czytelna dla nowych graczy.

Przykład tury:

```txt
Akcja 1: rusz wojownika
Akcja 2: odkryj żeton
Akcja 3: rozpocznij budowę w mieście
```

Inny przykład:

```txt
Akcja 1: załóż miasto
Akcja 2: zrekrutuj jednostkę
Akcja 3: rozpocznij technologię
```

## Jednostki na początku gry

Każdy gracz zaczyna z:

- osadnikiem,
- wojownikiem.

Start znajduje się na lądzie.

W promieniu do 2 heksów od startu nie ma żetonów odkryć.

## Miasta

Miasta będą osobnym modułem, ale na tym etapie ustalamy ich rolę.

Miasto powinno:

- kontrolować okoliczne heksy,
- produkować zasoby,
- budować budynki i jednostki,
- umożliwiać rozwój technologii i kultury,
- być celem wojny i ekspansji.

## Technologie

Technologie będą osobnym modułem.

Ich rola:

- odblokowywanie jednostek,
- odblokowywanie budynków,
- wzmacnianie produkcji,
- zwiększanie możliwości eksploracji,
- wspieranie różnych ścieżek zwycięstwa.

## Polityki

Polityki są sposobem na styl gry cywilizacji.

Mogą dawać:

- stałe bonusy,
- jednorazowe efekty,
- premie do miast,
- premie do wojny,
- premie do handlu,
- premie do kultury albo nauki.

## Wojna

Wojna ma być ważna, ale nie powinna być jedyną drogą do wygranej.

Wojna powinna obejmować:

- ruch jednostek,
- atak,
- obronę miasta,
- kontrolę terenu,
- strategiczne przejścia przez góry i wybrzeża.

## Handel

Handel powinien być prosty i przydatny.

Może obejmować:

- wymianę zasobów,
- szlaki handlowe,
- dochód złota,
- premie za kontakt z innymi graczami,
- zwycięstwo ekonomiczne.

## Cuda

Cuda powinny być silnymi, rzadkimi projektami.

Mogą wymagać:

- technologii,
- produkcji,
- konkretnego typu terenu,
- miasta,
- zasobów.

Cuda powinny dawać duży efekt, ale nie mogą same automatycznie wygrywać gry.

## Liderzy i cywilizacje

Cywilizacja i lider są osobnymi kartami.

Cywilizacja powinna dawać długofalowy styl gry.

Lider powinien dawać bardziej konkretny, unikalny efekt.

Przykład struktury:

```txt
Cywilizacja: Rzym
Efekt cywilizacji: bonus do dróg / miast / ekspansji
Lider: Juliusz Cezar
Efekt lidera: premia do wojny albo szybkiej ekspansji
```

To tylko przykład struktury, nie finalna karta.

## Minimalny pierwszy prototyp zasad

Pierwszy prototyp rozgrywki powinien mieć tylko:

- mapę,
- start gracza,
- osadnika,
- wojownika,
- ruch,
- żetony odkryć,
- zakładanie miasta,
- prostą produkcję,
- prostą technologię,
- jeden warunek zwycięstwa testowy.

Nie dodajemy jeszcze wszystkiego naraz.

## Kolejność następnych modułów

Najlepsza kolejność dalszego projektowania:

1. **Tura i akcje gracza**
2. **Ruch i eksploracja**
3. **Miasta i kontrola terenu**
4. **Zasoby i produkcja**
5. **Technologie**
6. **Jednostki i wojna**
7. **Handel**
8. **Polityki**
9. **Cuda**
10. **Cywilizacje i liderzy**
11. **Warunki zwycięstwa**
12. **Balans i długość gry**

## Decyzje robocze na teraz

Przyjmujemy roboczo:

- gra jest turowa,
- każdy gracz wykonuje pełną turę,
- gracz ma 3 akcje główne na turę,
- każdy zaczyna z osadnikiem i wojownikiem,
- eksploracja i ekspansja są głównym początkiem gry,
- religia nadal jest pominięta,
- generator mapy zostaje jako osobny, działający prototyp.

## Status modułu

Status: **wersja projektowa 0.1**

Następny moduł: **Tura i akcje gracza**.
