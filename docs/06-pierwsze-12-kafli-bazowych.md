# 06 — Pierwsze 12 kafli bazowych

## Cel dokumentu

Ten dokument projektuje pierwsze **12 bazowych kafli mapy** dla gry **Epoki Imperiów**.

To nie jest jeszcze pełna lista 40 kafli. To pierwszy zestaw wzorców wizualnych i terenowych, z których później rozwiniemy pełną pulę mapy.

## Standard układu kafla

Każdy kafel ma 7 heksów:

```txt
        NW   N
     SW   C   NE
        S    SE
```

Na potrzeby opisu używamy oznaczeń:

- **C** — heks centralny,
- **N** — północ,
- **NE** — północny wschód,
- **SE** — południowy wschód,
- **S** — południe,
- **SW** — południowy zachód,
- **NW** — północny zachód.

## Skróty terenów

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

## Zasada projektowa

Każdy kafel powinien mieć:

- czytelny dominujący charakter,
- naturalne przejścia między terenami,
- miejsce na żetony odkryć,
- brak przeładowania ikonami,
- możliwość połączenia z innymi kaflami bez brzydkich granic.

## Kafel 01 — Równiny startowe

### Funkcja

Bezpieczny, czytelny kafel dobry pod start gracza albo rozwój pierwszego miasta.

### Układ terenów

```txt
        R    R
     R    R    WZ
        R    L
```

- C: R
- N: R
- NE: WZ
- SE: L
- S: R
- SW: R
- NW: R

### Wygląd

Kafel powinien być spokojny wizualnie. Dominują jasne zielenie i delikatna tekstura trawy. Jeden las i jedno wzgórze nadają mu charakter, ale nie blokują startu.

### Uwagi

Dobry kandydat na kafel startowy. W wersji startowej nie powinien mieć żetonów odkryć w centrum i blisko pola startowego.

---

## Kafel 02 — Równiny z lasem

### Funkcja

Podstawowy kafel mieszany, dobry do rozwoju, eksploracji i rozmieszczania pierwszych żetonów.

### Układ terenów

```txt
        L    R
     R    R    L
        WZ   R
```

- C: R
- N: R
- NE: L
- SE: R
- S: WZ
- SW: R
- NW: L

### Wygląd

Dwie grupy lasów po przeciwnych stronach kafla. Równiny w centrum dają czytelność i dobre tło pod żetony.

### Uwagi

To kafel neutralny. Powinien często pojawiać się w puli mapy.

---

## Kafel 03 — Gęsty las

### Funkcja

Region leśny, bardziej naturalny i mniej otwarty niż równiny.

### Układ terenów

```txt
        L    L
     R    L    L
        WZ   R
```

- C: L
- N: L
- NE: L
- SE: R
- S: WZ
- SW: R
- NW: L

### Wygląd

Ciemniejsza zieleń, skupiska drzew i mocny kontrast względem równin. Las nie może zasłaniać granic heksów.

### Uwagi

Dobry kafel pod zasoby leśne, produkcję albo specjalne wydarzenia eksploracyjne.

---

## Kafel 04 — Wzgórza i lasy

### Funkcja

Teren bardziej strategiczny i produkcyjny. Ma dawać wrażenie pagórkowatego regionu.

### Układ terenów

```txt
        WZ   L
     R    WZ   L
        WZ   R
```

- C: WZ
- N: L
- NE: L
- SE: R
- S: WZ
- SW: R
- NW: WZ

### Wygląd

Pagórki, zielono-brązowe odcienie, trochę lasu na zboczach. Kafel powinien wyglądać bardziej trójwymiarowo niż zwykłe równiny.

### Uwagi

Dobry kafel do późniejszych zasad produkcji i obrony.

---

## Kafel 05 — Pasmo górskie

### Funkcja

Kafel tworzący naturalną barierę i mocny punkt wizualny mapy.

### Układ terenów

```txt
        G    G
     WZ   G    WZ
        R    R
```

- C: G
- N: G
- NE: WZ
- SE: R
- S: R
- SW: WZ
- NW: G

### Wygląd

Trzy heksy górskie powinny wizualnie łączyć się w jedno pasmo. Szczyty mogą lekko nachodzić na siebie ilustracyjnie, ale granice heksów muszą zostać czytelne.

### Uwagi

Nie powinien występować zbyt często, żeby nie blokować mapy.

---

## Kafel 06 — Góry z jeziorem

### Funkcja

Kafel atrakcyjny wizualnie, łączący przeszkodę terenową i wodę śródlądową.

### Układ terenów

```txt
        G    WZ
     G    J    R
        L    R
```

- C: J
- N: WZ
- NE: R
- SE: R
- S: L
- SW: G
- NW: G

### Wygląd

Jezioro w centrum, góry od jednej strony, las i równiny od drugiej. Kafel powinien wyglądać jak górska dolina z wodą.

### Uwagi

Dobry kandydat pod specjalne bonusy, zasoby lub żeton odkrycia.

---

## Kafel 07 — Wybrzeże łagodne

### Funkcja

Podstawowy kafel przejścia między lądem a wodą.

### Układ terenów

```txt
        R    WP
     R    R    WP
        L    R
```

- C: R
- N: WP
- NE: WP
- SE: R
- S: L
- SW: R
- NW: R

### Wygląd

Ląd płynnie przechodzi w wodę. Przy heksach wodnych powinien być widoczny piaszczysty lub jasny brzeg.

### Uwagi

Ten typ kafla będzie ważny dla późniejszego handlu i żeglugi.

---

## Kafel 08 — Wybrzeże zatokowe

### Funkcja

Kafel z większą ilością wody, tworzący zatoki, półwyspy i ciekawe brzegi mapy.

### Układ terenów

```txt
        WP   WP
     R    WP   O
        R    L
```

- C: WP
- N: WP
- NE: O
- SE: L
- S: R
- SW: R
- NW: WP

### Wygląd

Woda powinna wcinać się w ląd. Kafel ma wyglądać jak zatoka lub wybrzeże z małym półwyspem.

### Uwagi

Dobry na obrzeża mapy i do tworzenia naturalnych linii brzegowych.

---

## Kafel 09 — Wyspa / archipelag

### Funkcja

Kafel wodny z małym fragmentem lądu. Używany głównie przy krawędziach mapy lub w regionach morskich.

### Układ terenów

```txt
        O    WP
     O    WP   O
        R    WP
```

- C: WP
- N: WP
- NE: O
- SE: WP
- S: R
- SW: O
- NW: O

### Wygląd

Większość kafla to woda. Jeden heks lądu powinien wyglądać jak mała wyspa lub fragment większego brzegu.

### Uwagi

Na początku gry ten kafel nie powinien blokować startu gracza.

---

## Kafel 10 — Jezioro śródlądowe

### Funkcja

Kafel lądowy z jeziorem jako centralnym elementem.

### Układ terenów

```txt
        R    L
     WZ   J    R
        R    L
```

- C: J
- N: L
- NE: R
- SE: L
- S: R
- SW: WZ
- NW: R

### Wygląd

Jezioro w centrum, zielone brzegi, lasy po dwóch stronach. Kafel ma wyglądać spokojnie i naturalnie.

### Uwagi

Dobry kafel do rozwoju miast, zasobów i żetonów eksploracji.

---

## Kafel 11 — Suchy region

### Funkcja

Kafel pustynny lub stepowy, rzadszy od zielonych terenów.

### Układ terenów

```txt
        P    WZ
     P    P    R
        WZ   R
```

- C: P
- N: WZ
- NE: R
- SE: R
- S: WZ
- SW: P
- NW: P

### Wygląd

Beżowe i piaskowe odcienie, delikatne wydmy, pojedyncze skały. Przejścia do równin powinny być łagodne.

### Uwagi

Nie powinien być zbyt częsty w podstawowej mapie. Może służyć jako region specjalny.

---

## Kafel 12 — Kafel specjalny pod cud naturalny

### Funkcja

Kafel przeznaczony pod wyjątkowy punkt mapy.

### Układ terenów

```txt
        WZ   G
     L    CN   R
        R    WZ
```

- C: CN
- N: G
- NE: R
- SE: WZ
- S: R
- SW: L
- NW: WZ

### Wygląd

Cud naturalny znajduje się w centrum. Powinien być największym i najbardziej rozpoznawalnym elementem kafla.

Możliwe warianty cudu:

- wielka góra,
- wodospad,
- krater,
- wielkie drzewo,
- gejzer,
- oaza,
- lodowiec.

### Uwagi

Kafel specjalny powinien być rzadki. Jednostka może odkryć cud naturalny, ale nie powinna traktować tego pola jak zwykłego miejsca postoju.

---

## Wstępna proporcja terenów w tych 12 kaflach

Ten zestaw daje bazę do dalszych prac:

- dużo równin jako teren podstawowy,
- średnia liczba lasów i wzgórz,
- kilka mocnych kafli górskich,
- kilka kafli wodnych i wybrzeżowych,
- jeden suchy region,
- jeden kafel specjalny pod cud naturalny.

## Następny krok

Po zatwierdzeniu tych 12 wzorców przygotujemy:

1. pełną listę **40 kafli mapy**,
2. proporcje terenów na całej mapie,
3. oznaczenia kafli startowych,
4. zasady układania mapy,
5. pierwsze proste szkice graficzne kafli.

## Status modułu

Status: **wersja projektowa 0.1**
