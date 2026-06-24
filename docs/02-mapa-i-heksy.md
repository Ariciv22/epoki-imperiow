# 02 — Mapa i heksy

## Cel modułu

Ten dokument opisuje podstawową strukturę mapy w grze **Epoki Imperiów**.

Mapa jest główną planszą gry. To na niej gracze eksplorują świat, poruszają jednostki, zakładają miasta, odkrywają żetony, walczą i kontrolują terytorium.

## Podstawowy rozmiar mapy

Docelowa mapa składa się z:

- **40 kafli mapy**,
- **7 heksów na każdym kaflu**,
- łącznie **280 heksów**.

Ten rozmiar traktujemy jako podstawowy standard projektowy.

## Kształt mapy

Mapa nie powinna być prostokątną planszą z równymi krawędziami. Docelowy kształt to nieregularny układ kafli przypominający naturalny kontynent lub archipelag.

Założenia:

- zewnętrzne krawędzie mapy często są wodą,
- środek mapy zawiera większość lądów,
- mapa może mieć zatoki, półwyspy i jeziora,
- niektóre fragmenty mogą tworzyć wyspy,
- układ powinien wyglądać naturalnie, ale nadal być grywalny.

## Funkcje heksów

Każdy heks może pełnić jedną lub kilka funkcji:

- teren ruchu,
- miejsce pod żeton odkrycia,
- miejsce pod zasób,
- miejsce pod jednostkę,
- miejsce pod miasto lub element miasta,
- część obszaru cudu naturalnego,
- pole strategiczne w walce.

## Typy heksów

Na tym etapie przyjmujemy podstawowe typy terenu:

1. Równiny.
2. Las.
3. Góry.
4. Wzgórza.
5. Woda przybrzeżna.
6. Ocean.
7. Jezioro.
8. Pustynia lub teren suchy.
9. Specjalny teren cudu naturalnego.

Lista może zostać rozszerzona po dopracowaniu zasad produkcji, ruchu i zasobów.

## Ruch po heksach

Ruch jednostek będzie rozliczany po heksach. Jednostka przesuwa się z jednego heksa na sąsiedni heks.

Na późniejszym etapie należy określić:

- koszt ruchu przez każdy typ terenu,
- czy góry są przechodnie,
- czy las spowalnia ruch,
- jak działa przekraczanie wody,
- czy jednostki lądowe mogą wchodzić na wodę,
- jak działają statki lub transport morski.

## Strefa startowa

Każdy gracz rozpoczyna w bezpiecznej strefie startowej.

Zasada startowa:

- na polu startowym i w promieniu do **2 heksów** od startu nie układa się żetonów odkryć,
- gracz musi wyjść dalej, aby zacząć odkrywać nieznane pola,
- pierwsze odkrycia powinny zaczynać się najwcześniej na trzecim heksie od pozycji startowej.

Ta zasada ma ograniczyć przypadkowość pierwszej tury i dać graczowi bezpieczny start.

## Odkrywanie mapy

Gracze od początku widzą typy terenu, ale nie wiedzą, co kryje się pod żetonami odkryć.

Model odkrywania:

- heks może mieć zakryty żeton odkrycia,
- gracz zna położenie żetonu, ale nie zna jego efektu,
- wejście jednostką na heks z żetonem aktywuje odkrycie,
- żeton jest zdejmowany po rozpatrzeniu efektu.

## Rozmieszczenie terenów

Mapa powinna być zróżnicowana.

Dobre rozmieszczenie:

- góry tworzą pasma lub bariery,
- lasy tworzą zwarte regiony,
- jeziora pojawiają się wewnątrz lądu,
- wybrzeża dają dostęp do wody,
- pustynie są rzadsze i bardziej punktowe,
- równiny łączą wiele obszarów i ułatwiają rozwój.

## Czytelność gry

Każdy heks musi być czytelny dla graczy siedzących przy stole.

Priorytety czytelności:

1. Gracz rozpoznaje typ terenu.
2. Gracz widzi, czy na heksie leży żeton.
3. Gracz widzi jednostki i miasta.
4. Gracz rozumie sąsiedztwo heksów.
5. Gracz nie musi zgadywać, gdzie kończy się pole.

## Status modułu

Status: **wersja projektowa 0.1**

Ten dokument opisuje mapę na poziomie ogólnym. Szczegółowe kafle mapy są opisane w kolejnym module.
