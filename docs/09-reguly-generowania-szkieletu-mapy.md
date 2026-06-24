# 09 — Reguły generowania szkieletu mapy

## Cel dokumentu

Ten dokument opisuje reguły, według których ma powstawać szkielet mapy w grze **Epoki Imperiów**.

Nie jest to jeszcze kod generatora. To zbiór decyzji projektowych, które później zostaną przełożone na programowanie.

## Założenie główne

Mapa ma przedstawiać **jeden duży, nieregularny kontynent otoczony oceanem**.

Gracz powinien mieć poczucie, że odkrywa duży świat, a nie prostokątną planszę z przypadkowo rozrzuconymi terenami.

## Rozmiar mapy

Standard mapy:

- **40 kafli mapy**,
- **7 heksów na kafel**,
- razem **280 heksów**.

W prototypie cyfrowym można tymczasowo przedstawiać mapę jako siatkę około **20 × 14 heksów**, ponieważ daje to 280 pól i dobrze nadaje się do szkiców.

## Struktura świata

Mapa powinna mieć następującą strukturę:

1. **Ocean zewnętrzny** — głównie na obrzeżach mapy.
2. **Woda przybrzeżna** — przejście między oceanem i lądem.
3. **Główny kontynent** — większość lądu w środku mapy.
4. **Zatoki i półwyspy** — nieregularne brzegi kontynentu.
5. **Opcjonalne małe wyspy** — rzadkie, raczej jako urozmaicenie, nie jako główna część gry.

## Kształt kontynentu

Kontynent nie może być idealnym prostokątem, kołem ani owalem.

Dobry kontynent powinien mieć:

- poszarpane brzegi,
- kilka zatok,
- kilka półwyspów,
- zróżnicowaną szerokość,
- czytelny środek lądu,
- naturalne przejście do oceanu.

Unikamy:

- idealnie równej krawędzi,
- lądu od brzegu do brzegu bez oceanu,
- zbyt wielu małych wysepek,
- mapy, która dzieli graczy na osobne wyspy od początku gry.

## Starty graczy

Gracz może zostać wylosowany na dowolnym odpowiednim skrawku lądu.

Pole startowe musi spełniać warunki:

- jest lądem,
- nie jest oceanem,
- nie jest wodą przybrzeżną,
- nie jest jeziorem,
- nie jest górą nieprzechodnią,
- nie jest cudem naturalnym,
- ma możliwość ekspansji w kilku kierunkach,
- nie jest całkowicie zablokowane przez wodę lub góry.

## Odległość między startami

Starty graczy powinny być rozproszone.

Wstępna zasada:

- starty nie powinny być bliżej niż około **4 heksy** od siebie,
- idealnie każdy start powinien mieć własny region ekspansji,
- gracze mogą spotkać się po kilku turach, ale nie powinni zaczynać obok siebie.

## Strefa startowa bez żetonów odkryć

Wokół każdego startu powstaje bezpieczna strefa.

Zasada:

- na polu startowym nie ma żetonu odkrycia,
- w promieniu do **2 heksów** od startu nie ma żetonów odkrycia,
- pierwsze żetony odkryć pojawiają się dopiero poza tą strefą.

Cel:

- ograniczyć losowość pierwszej tury,
- dać graczowi spokojny początek,
- zmusić gracza do realnej eksploracji.

## Rozmieszczenie terenów

### Równiny

Równiny są podstawowym typem lądu.

Powinny:

- występować często,
- tworzyć główne obszary ekspansji,
- być dobrym miejscem pod miasta,
- łączyć różne regiony mapy.

### Lasy

Lasy powinny występować w skupiskach.

Reguły:

- lasy lepiej wyglądają jako regiony po kilka heksów,
- nie powinny być całkowicie losowo rozrzucone po jednym polu,
- dobrze pasują do środkowych i wilgotniejszych części kontynentu.

### Wzgórza

Wzgórza są przejściem między równiną i górami.

Reguły:

- często powinny pojawiać się obok gór,
- mogą tworzyć trudniejszy teren,
- mogą być dobrym miejscem pod przyszłe zasoby produkcyjne.

### Góry

Góry powinny tworzyć pasma lub kręgosłup kontynentu.

Reguły:

- góry nie powinny być rozrzucone pojedynczo bez sensu,
- pasmo gór może dzielić regiony,
- góry mogą tworzyć strategiczne przejścia,
- nie mogą całkowicie blokować startu gracza.

### Jeziora

Jeziora powinny pojawiać się wewnątrz lądu.

Reguły:

- jeziora nie powinny wyglądać jak fragment oceanu,
- dobrze działają przy lasach, górach i równinach,
- mogą tworzyć atrakcyjne miejsca pod miasta i eksplorację.

### Suchy region

Suchy region, pustynia albo step powinny być rzadsze.

Reguły:

- suchy region nie powinien dominować mapy,
- najlepiej, aby tworzył jeden lub dwa większe obszary,
- może znajdować się na południu, południowym wschodzie albo w głębi kontynentu.

### Woda przybrzeżna i ocean

Ocean powinien znajdować się głównie na zewnątrz mapy.

Reguły:

- ocean tworzy ramę świata,
- woda przybrzeżna pojawia się przy lądzie,
- zatoki i półwyspy zwiększają naturalność mapy,
- zbyt duża ilość oceanu zmniejsza przestrzeń do rozwoju na początku gry.

## Cuda naturalne

Cuda naturalne powinny być rzadkie i wyjątkowe.

Reguły:

- cud naturalny nie powinien leżeć w strefie startowej,
- cud naturalny może znajdować się przy górach, jeziorach, lesie albo suchym regionie,
- cud powinien zachęcać do eksploracji,
- nie powinien być zwykłym polem postoju jednostki.

## Żetony odkryć

Żetony odkryć pojawiają się na lądzie poza strefami startowymi.

Reguły:

- mogą pojawiać się na równinach, lasach, wzgórzach i suchych terenach,
- nie powinny pojawiać się na oceanie,
- nie powinny pojawiać się w jeziorach,
- nie powinny pojawiać się w promieniu 2 heksów od startu,
- mogą być częstsze przy ciekawych terenach, np. górach, lasach, jeziorach i cudach.

## Priorytety generatora

Jeżeli będziemy robić generator mapy, powinien działać etapami:

1. Utwórz siatkę 280 heksów.
2. Wyznacz ocean zewnętrzny.
3. Wygeneruj nieregularny kontynent.
4. Dodaj wodę przybrzeżną przy lądzie.
5. Dodaj pasma górskie.
6. Dodaj lasy w skupiskach.
7. Dodaj jeziora.
8. Dodaj suchy region.
9. Dodaj cuda naturalne.
10. Wylosuj poprawne starty graczy.
11. Usuń żetony odkryć ze stref startowych.
12. Rozłóż żetony odkryć na pozostałych lądowych heksach.
13. Sprawdź, czy mapa jest grywalna.

## Test grywalności mapy

Mapa powinna przejść podstawowy test:

- każdy gracz ma miejsce na ekspansję,
- starty nie są zablokowane,
- kontynent jest w większości połączony,
- ocean nie zabiera zbyt dużej części mapy,
- góry nie dzielą mapy na całkowicie odcięte fragmenty,
- żetony odkryć są dostępne po wyjściu poza strefę startową,
- mapa wygląda jak naturalny świat.

## Decyzje jeszcze otwarte

Do ustalenia później:

- dokładny procent lądu i wody,
- liczba startów graczy,
- czy mapa ma zawsze mieć jeden kontynent, czy czasem większe wyspy,
- ile cudów naturalnych powinno być na mapie,
- ile żetonów odkryć powinno przypadać na mapę,
- czy generator ma tworzyć mapę losowo, pół-losowo czy według gotowych szablonów.

## Status modułu

Status: **wersja projektowa 0.1**

Po zatwierdzeniu tych reguł można zacząć tworzyć pierwszy prosty generator mapy w formie SVG/PNG.
