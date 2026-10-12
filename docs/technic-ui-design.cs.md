# Lego Compatible: návrh rozhraní a ergonomie

12. 10. 2026. Zvolený směr: modulové skládání 1 × 1 v rozteči 8 mm, inspirované
PartDesignerem, integrované do současného Layerlingu. Dokument specifikuje
cílové chování. První funkční etapa je popsaná v [technic-first-version.cs.md](technic-first-version.cs.md);
zbytek tohoto návrhu včetně více spojení v jedné buňce zůstává plánem.

## Základní rozhodnutí

Katalog a generátor vzoru používají stejné definice modulů. Modul tvoří
materiál a seznam orientovaných spojení; dvě kolmé spojení mohou být v jedné
buňce. Úplná geometrie vznikne z buněk společným generátorem, který zná
sousedy, odkryté stěny a požadované zakončení. Samostatné modely malých
hotových dílků nelze jen slepě pospojovat a očekávat správné vnitřní přechody.

Ukládá se editovatelný recept: verze definic, buňky, jejich polohy a orientace,
parametry spojení, tiskový profil a záměr úprav obrysu. Výsledná CAD geometrie
je odvozená. Zdroj pravdy nesmí být duplicitně v receptu a nezávisle upravených
kopiích buněk. Převod na běžné těleso je explicitní a vratný přes Zpět.

Uživateli nabízíme přímo stavbu v rastru. Symbolový vzor je další způsob
zadání stejného receptu, nikoli povinný způsob práce s dětmi.

## Rozmístění

### Katalog tvarů nahoře vlevo

„Lego Compatible“ je volitelná kategorie současného katalogu Tvary. Zachová
jeho dlaždice, náhledy a kliknutí/přetažení. Běžné tvary i vlastní knihovna
zůstávají dostupné. Nová kategorie se nebude vnucovat při práci na běžném
projektu. Jednoznačný vstup „Nový modulový dílek“ zahájí editor buněk;
přetažení modulu mimo jeho rastr vloží samostatný modulový dílek.

Začít s malým katalogem: plný modul, otvor pro čep, otvor pro osu,
kombinované spojení, tenké provedení a zakončení. Směr se nastavuje ve
vlastnostech, každé natočení není další katalogová dlaždice.

### Pracovní plocha uprostřed

Aktivní recept se zvýrazní, ostatní modely zůstanou viditelné jako kontext.
Náhled umístění jasně ukáže buňku, materiál, typ a směr spojení ještě před
potvrzením. Aktivní dílek má vlastní lokální rastr, který se otáčí s ním;
počítá se v modulech a výsledek se dál exportuje v milimetrech.

Podkladový rastr a buňky musí vycházet z jednoho počátku, stejného kroku
a stejného převodu souřadnic do pohledu. Nezávislá dekorativní mřížka s jinou
velikostí čtverců je matoucí. Okraje modulů přesně leží na hranicích buněk.

Kreslicí prostor není omezen aktuálním obrysem ani předvolbou 7 × 5. Obsazené
buňky ukládat podle jejich souřadnic; kolem dílku jsou dostupné další prázdné
buňky. Plný modul, stejně jako otvorový modul, lze vložit mimo původní obrys
a dílek tak zvětšit doleva, doprava, nahoru či dolů. Souřadnice existujících
modulů se při rozšíření nepřečíslují; podporují i záporné hodnoty.

Rozměr dílku se odvozuje z obsazených buněk. Rozsah zobrazeného rastru je
samostatný stav pohledu: posun kamery nemění model a jeho hranice nesmí
omezovat přidávání. U okraje lze odkrýt další prostor, při rozšiřování se
nemá automaticky zmenšovat velikost buňky pod ukazatelem. Předvolba stanoví
počáteční obsah, nikoli maximální rozměr nebo povolenou oblast kreslení.

Použít současnou kameru, orientační krychli, zoom a ovládání pracovní roviny.
Nezavádět druhou sadu kláves pro kameru. Pro kreslení v půdorysu nabídnout
rychlý přechod existujícím ovládáním pohledu. Pro více vrstev je nutné jasně
zobrazit aktivní rovinu a výšku; vrstvy jsou navazující etapa po jednom patře.
Výběr nebo náhled překryvu nesmí být součástí tisknutelné geometrie.

### Krátká kontextová řada nahoře

Pouze při editaci receptu: „Vybrat“, „Přidat“, „Odebrat“ a informace o
rastru/vrstvě. Označení režimu je textové i vizuální; samotná barva nestačí.
Nevkládat všechny varianty modulů do hlavní lišty editoru. Typ je v katalogu,
vlastnosti v pravém panelu. Zpět/Znovu používají současnou historii.

### Jeden panel vpravo — doporučené rozložení

Využít současné místo vlastností, šířku a chování nástrojových panelů. Obsah
panelu se přepne podle kontextu, nepřekrývat jej dalším inspektorem.
Pokud se použije plovoucí panel, sdílí současný mechanismus posunu, omezení
na pracovní plochu, paměť polohy a návrat na výchozí místo.

Pořadí ovládacích prvků:

1. Název dílku / informace, zda měníme vybraný modul nebo modul pro vkládání.
2. Typ modulu.
3. Směr spojení: X/Y/Z s vysvětlením v souřadnicích dílku; náhled osy přímo
   v modelu. Pokročilé natočení je dostupné bez desítek dalších dlaždic.
4. Natočení křížového profilu, dostupné jen pro příslušný typ spojení.
5. Tloušťka/provedení a případné další spojení v téže buňce.
6. Rozbalovací „Vzor a předvolby“.
7. Rozbalovací „Nastavení tisku“; kalibrace není nutná při každém vkládání.
8. „Zrušit změny“ a „Hotovo“, stále snadno dosažitelné.

Panel pod pracovní plochou je alternativa pro porovnání. Zachová šířku
modelu, ale zmenší jeho dostupnou výšku. Doporučení pro první implementaci
je panel vpravo, protože odpovídá současným panelům Layerlingu.

## Interakce pro děti a běžné uživatele

- Výchozí režim po otevření existujícího dílku je „Vybrat“. Kliknutí proto
  nic nesmaže a nepřidá. Nový prázdný recept může začít v „Přidat“.
- Výběr katalogového modulu přepne na „Přidat“ a zobrazí aktuální modul
  a jeho směr. Jedno kliknutí vloží jednu buňku.
- Malování tažením je rozšíření jednoduchého klikání; jedno tažení tvoří
  jeden krok historie. Nelze jím přepsat celé okolí bez jasného náhledu.
- Režim „Odebrat“ je výslovný, gumování nesmí být skrytá akce běžného kliknutí.
  Obsazená buňka v režimu „Přidat“ ukáže předem, zda se nahradí její modul.
- Výběr existujícího modulu upravuje tento modul. Nastavení pro nové vložení
  se nesmí neviditelně měnit v jiném panelu. Při prázdné buňce panel jasně
  nabídne přidání, místo aby tvrdil, že existuje vybraný modul.
- Shift přidá buňky do výběru. Při smíšených vlastnostech panel zobrazí
  „Různé“; změna se použije na celý výběr jako jeden krok.
- Pokročilé operace jsou dostupné tlačítkem či menu, klávesové zkratky jsou
  doplněk. Nezavádět novou globální zkratku R či Delete bez kontroly jejich
  současného významu. Klávesy nezasahují do psaní v textových a číselných polích.
- „Hotovo“ potvrdí úpravu a vrátí běžné ovládání tělesa. „Upravit Lego dílek“
  jej později znovu otevře. Esc nejprve zruší aktuální náhled/vkládání;
  neopustí celý recept a nezahodí změny jediným nejasným krokem.
- „Zrušit změny“ obnoví stav při vstupu do úpravy. Nezaměňovat se smazáním
  dílku ani návratem k tovární předvolbě.

## Vzor a první ověřovací dílek

Výchozí práce je klikání do rastru. Textový vzor lze otevřít pro rychlé
zadání rámu, řady, L/T tvaru a podobně. Legenda musí být přímo u vstupu;
chyba ve vzoru nesmí přepsat platný model. Před vložením je viditelný náhled.
Textový vstup a klikací editor musí upravovat jeden stejný recept.

První test: rám 7 × 5 z 20 obvodových buněk, následně různé typy a směry
otvorů. To je základní ověřovací tvar, nikoli automaticky přesná kopie 64179.
Předvolba 64179 vyžaduje zvlášť ověřenou mapu spojení a detaily geometrie.

## Zaoblování a další úpravy

Vybrané buňky určují oblast úpravy obrysu. Zaoblení se provádí na relevantních
vnějších hranách spojeného materiálu, aby mezi buňkami nevznikaly prohlubně.
Využít současný panel zaoblení, náhled a chybové stavy.

Je nutné ověřit, jak uchovat záměr zaoblení při změně receptu: CAD identifikátor
hrany nemusí po regeneraci označovat tutéž hranu. Pokud úpravu neumíme znovu
bezpečně aplikovat, zachovat poslední platné těleso a zobrazit náhled řešení.
Neztratit zaoblení potichu ani nepřenést na jinou hranu. Tuto kombinaci nelze
označit za hotovou před integračním testem.

## Styly a přístupnost

- Použít stávající typografii, barevné proměnné, katalogové dlaždice, formuláře,
  aktivní stavy a komponentu `MovableToolPanel`, kde odpovídá kontextu.
- Zkontrolovat Graphite i světlé/tmavé téma. Žádná samostatná barevná identita
  nebo nové pevné barvy pouze pro Lego; barva os odpovídá editoru.
- Zachovat nastavení velikosti nástrojové lišty. Důležité akce mají viditelný
  název, ne pouze ikonu s tooltipem.
- Na úzké obrazovce panel přemístit pod pracovní plochu nebo do otevíratelného
  panelu. Katalog při vložení zavřít; nezakrývat zároveň katalogem a inspektorem
  celý model. Na dotyku ověřit efektivní cíle přibližně 44 px a použitelnost
  zoomu pro malé buňky. Sedm buněk nelze na každé úzké ploše současně zvětšit
  na pohodlnou velikost; příslušný test musí zahrnout přiblížení a posun pohledu.
- Zachovat nativní focus, návrat focusu po zavření panelu a ovládání klávesnicí.
- Texty a nápovědy připravit v češtině, angličtině a němčině.

## Místa napojení a ověření

Katalog: `LayerlingEditor.tsx`, `shapeCatalog.ts`, současné `.shape-menu-*`.
Panel: `ShapeInspector.tsx` nebo `MovableToolPanel.tsx` s vlastní malou
komponentou. Rastr, výběr a náhled: samostatná komponenta napojená do
`WorkplaneViewport.tsx`. Recept a geometrie: samostatné `src/lib/technic/`.
Nedoplňovat celou logiku do velkých editorových komponent.

Před implementací vyzkoušet návrh rozhraní: vložení, změnu směru, křížový
profil, odebrání, Zpět/Znovu, vzor a úzkou obrazovku. Poté odděleně ověřit
skutečné CAD operace, `.lyl`, historii a tisk. Návrh rozhraní není funkční
CAD generátor ani důkaz přesné kompatibility s fyzickým dílkem.

Doplněné ověřovací scénáře: plný modul mimo rám na všech čtyřech stranách,
opakované rozšíření za hranice pohledu, zachování souřadnic při posunu,
Zpět/Znovu pro rozšíření a odebrání, shoda rastru při různých šířkách panelu
a změně velikosti okna. Na úzké obrazovce se zmenší rozsah viditelné oblasti,
nikoli automaticky dotyková buňka; zbývající prostor je dostupný posunem pohledu.
