# Volitelná podpora Technic prvků v Layerlingu

Pracovní plán, 12. 10. 2026; zvolený směr je modulové skládání 1 × 1 podle
návrhu uživatele a principu PartDesigneru. Výchozí kód: naše větev `codex/customizations`,
Layerling 1.66.6, commit `9dc003c`. Stav první implementované etapy a její hranice
jsou v [technic-first-version.cs.md](technic-first-version.cs.md). Další části tohoto dokumentu jsou plán.

## Zvolený směr a rozhraní

Kategorie „Lego Compatible“ nabídne konstrukční moduly 1 × 1. Ruční stavba
v rastru a generátor podle vzoru používají stejné definice. Generátor zná
sousedy buněk: nejprve spojí materiál, potom vytvoří otvory a nakonec upraví
vnější obrys. Parametry a orientace spojení zůstávají součástí receptu.
Výsledný rám není sestava samostatných zmenšených kostiček s mezerami.

Podrobný návrh rozmístění a ovládání je v
[technic-ui-design.cs.md](technic-ui-design.cs.md). Doporučené rozložení:
kategorie v současném katalogu, rastr v pracovní ploše, krátká kontextová řada
Vybrat/Přidat/Odebrat a jediný panel vlastností vpravo. Textový vzor a tiskové
korekce jsou rozbalovací pokročilé části. Běžné modelování zůstává dostupné.

Následující geometrické a integrační požadavky platí i pro tento modulový
přístup. Samostatné chytré otvory jsou jeho součástí, nikoli hlavním způsobem
ručního vytváření každého celého dílku.

## Cíl a první použitelná verze

Dítě vytvoří libovolné těleso, přidá do něj otvory kompatibilní se stavebnicí
Technic a může každý otvor přesouvat, otáčet nebo změnit jeho typ. Projekt
uchová parametry i po zavření a opětovném otevření. Výsledné těleso lze
exportovat pro 3D tisk.

První verze zahrnuje:

- Katalog základních konstrukčních modulů, klikací stavba v rastru a generátor
  buněk podle vzoru. První ověřovací tvar je rám 7 × 5 s otevřeným středem
  5 × 3; přesná předvolba 64179 vyžaduje ověřenou mapu spojení.

- Otvor pro spojovací čep a křížový otvor pro osu.
- Vložení na plochu nebo přesným zadáním polohy.
- Samostatnou polohu a orientaci každého otvoru, včetně natočení křížového
  profilu kolem osy otvoru.
- Nastavitelnou délku výřezu; příkaz pro jednorázové nastavení délky tak,
  aby prošel vybraným tělesem.
- Kopírování otvoru a řadu s roztečí 8 mm; volitelné přichytávání 8/4 mm.
- Úpravu otvorů uvnitř sloučeného tělesa přes současné „Upravit sloučení“.
- Ukládání do `.lyl`, historii Zpět/Znovu a export skutečné geometrie.
- Kalibrační vzorek a uložené parametry vůle pro tisk.

V první verzi nezavádíme generátor celé stavebnice, plný řešič vazeb,
automatické sestavování dílků ani spouštění OpenSCADu v prohlížeči. Jednoduchý
generátor rámu a tabulka jeho spojení patří do první verze. Piny, osy,
ozubená kola, textové vzory a automatické změny hloubky při změně tělesa
navazují až na ověřený základ.

## Ovládání a volitelnost

1. Uživatel zapne nabídku „Technic“ ve tvarech/nastavení rozšíření.
2. Vybere otvor pro čep nebo osu a umístí jej. Při výběru plochy se počáteční
   směr nastaví kolmo na ni.
3. Vlastnosti nabídnou polohu, směr X/Y/Z nebo vlastní natočení, délku výřezu,
   natočení křížového profilu, provedení vstupů a tiskovou korekci.
4. U označeného prvku se zobrazí profil otvoru a šipka jeho osy.
5. Příkaz „Vyříznout do vybraného tělesa“ využije současné geometrické sloučení.
   Cílové těleso musí být výslovně vybrané; sousední tělesa se nemění.
6. „Upravit sloučení“ znovu zpřístupní jednotlivé výřezy i základní těleso.

Vstup „Nový modulový dílek“ vytvoří recept a zpřístupní kreslení do rastru.
Uživatel nakreslí vzor nebo zvolí předvolbu rámu 7 × 5. Generátor vytvoří
běžné editovatelné těleso/skupinu s parametry a jednotlivými chytrými výřezy.
Nemusí ručně skládat čtyři nosníky ani umísťovat všechny otvory jednotlivě.

## Konkrétní ověřovací případ: rám 64179

Původní plán samostatných otvorů řešil orientaci, ale nedostatečně usnadňoval
tvorbu celého dílku. Doplněním je dvojice: generátor základního obrysu a
samostatně editovatelná mapa spojení. Přesný originální rám není jen obdélník
s rovnoměrně vyvrtanými otvory.

Rozměry 7 × 5 a otevřený střed 5 × 3 zde označují modulové rozměry, nikoli
výrobní míry v milimetrech. Pro jednoduchou představu je obrys následující;
znak `#` označuje materiál a tečka prázdný střed, nikoli polohy otvorů:

```text
#######
#.....#
#.....#
#.....#
#######
```

Postup v navrženém editoru:

1. Otevřít „Lego Compatible“, vytvořit nový modulový dílek a zvolit obvodový
   vzor 7 × 5; později také ověřenou předvolbu 64179.
2. Vygenerovat souvislé těleso z 20 obvodových buněk, s tloušťkou a potřebnými
   detaily podle rozměrového profilu. Vnější/vnitřní obrys je možná optimalizace
   výpočtu, ne druhý nezávislý popis uživatelova modelu.
3. Z předvolby vytvořit ověřenou mapu otvorů s polohou a úplnou orientací
   každého spojení. Pro libovolný nový rám nabídnout základní vzor a jeho úpravu.
4. Vybrat otvor v modelu nebo tabulce a změnit typ, směr, natočení, polohu;
   přidat, vynechat či duplikovat konkrétní spojení.
5. Upravit základní těleso či přidat vlastní držák stávajícími CAD nástroji.
6. Uložit `.lyl`, znovu otevřít, upravit jeden otvor a exportovat pro tisk.

Mapa otvorů se nesmí odhadnout pouhým vyplněním všech buněk obrysu. Model
LDraw 64179 používá různé orientace spojení a další detaily. Pro předvolbu
musíme z digitálního modelu a fyzického dílku ověřit skutečné osy a polohy,
zahloubení, zbytkové stěny a detaily obrysu. LDraw je referencí geometrie,
nikoli automaticky hotovým kalibrovaným CAD modelem pro tisk.

Rozměrová editace rámu probíhá změnou receptu/generátoru, nikoli natažením
hotové polygonové sítě. Při změně velikosti se přepočítá obrys a základní vzor
spojení. Ruční úpravy spojení se uchovají přes stabilní identifikátory;
pokud se jejich poloha či existence mění, editor musí ukázat náhled změny.
První prototyp má ověřit tento model regenerace před rozšířením na jiné rodiny.
Prototyp může začít vložením předvolby a samostatnými úpravami, ale bez této
kontroly nelze slíbit bezpečnou rozměrovou editaci již upraveného rámu.

Značky a šipky jsou pomůcky pohledu a neexportují se. Přichytávání lze vypnout
nezávisle na nabídce Technic. Volný posun a libovolné úhly zůstávají dostupné.
Vypnutí nabídky nesmí odstranit či přepočítat již existující prvky projektu.
Projekt s takovými prvky má nabídnout jejich opětovné zpřístupnění k úpravě.

## Datový a geometrický základ

Preferovaná reprezentace je současné odečítací těleso nebo odečítací skupina
s volitelnými metadaty `technicFeature`. Nový obecný typ tvaru zavádíme jen
pokud malý prototyp prokáže, že současná reprezentace nestačí.

To platí pro jednotlivá spojení. Celý modulový dílek potřebuje vlastní
verzovaný recept buněk na výsledném tělese a jeho odvozenou CAD geometrii.
Při editaci receptu se neupravují nezávislé generované kopie dílčích tvarů.
Pokročilý převod do běžných těles je explicitní a vratný.

Metadata mají verzovaný popis: stabilní identifikátor prvku, typ spojení,
délku výřezu, parametry vstupů a vlastní kopii rozměrového/tiskového profilu.
Posun a natočení vlastní existující transformace tvaru/skupiny. Nevytváříme
druhý nezávislý seznam souřadnic značek, který by se mohl rozejít s geometrií.

Lokální osa generátoru určuje osu otvoru. Natočení profilu kolem této osy je
součástí úplné orientace, není zaměněné za změnu směru vrtání. Vlastnosti mohou
zobrazovat osy a úhly, výpočty však musí používat existující převody souřadnic
a lokální rámec tvaru. Editor zobrazuje Z nahoru, interní scéna používá jiné
uspořádání os. Zrcadlení musí zachovat správnou orientaci i asymetrické vstupy.

Geometrie je odvozená z parametrů. Kulatý otvor vytvoří odpovídající osový
profil, křížový otvor vlastní uzavřený profil; potřebná zahloubení či zkosení
se vytvoří jako další části výřezu. Využijeme stávající CAD geometrii,
profilové operace a booleovské sloučení. Samotný válec je vhodný pro technický
prototyp, ale finální profil musí být ověřený skutečnými čepy a osami.

Při změně parametrů se znovu sestaví pouze daný výřez a příslušné sloučení.
Změna musí projít současnou historií jako jeden krok. Při neúspěchu zůstane
poslední platný model; výsledek staršího asynchronního výpočtu nesmí přepsat
novější úpravu. Použijeme existující řízení požadavků a CAD Worker.

## Rozměry, škálování a kompatibilita

- Konstrukční rozteč a tisková korekce jsou oddělené parametry.
- Předvolby vycházejí z ověřených zdrojů; v profilu evidujeme původ a verzi.
  Hodnoty generátorů nejsou automaticky výrobními tolerancemi originálních dílků.
- Změna nastavení tiskárny nepřepočítá staré projekty bez příkazu uživatele.
  Každý prvek uchová použité parametry; hromadná aktualizace je samostatný krok
  s náhledem a možností Zpět.
- Posun, rotace a duplikace nemění průměry, křížový profil ani rozteč řady.
- Běžné škálování skupiny dnes deformuje všechny její části. První verze
  proto nabídne u chytrého prvku nebo skupiny s ním dvě zřetelné cesty:
  upravit základní těleso přes „Upravit sloučení“, nebo převést dotčené chytré
  prvky na obyčejnou geometrii a provést volné škálování. Převod musí být
  vratný přes Zpět. Nikdy nezachováme metadata tvrdící původní rozměry nad
  deformovanou geometrií. Stejné pravidlo platí pro procenta, více vybraných
  těles, vnořené skupiny a automatizační příkazy.
- Změna tvaru cílového tělesa nepředstavuje obecnou parametrickou vazbu.
  V první verzi se délka průchozího výřezu vypočítá na požádání pro aktuální
  těleso. Automatické sledování budoucích změn bude samostatná další funkce.
- Parametry doplní `.lyl` jako volitelné rozšíření, bez rozbití starých projektů.
  Uložíme také běžnou geometrii. Otevření ve starší verzi musí být samostatně
  ověřené: cílem je zobrazit geometrii, nikoli zaručit zachování parametrické
  editace při opětovném uložení ve starém editoru.

## Etapy a podmínky dokončení

| Etapa | Výsledek | Ověření před pokračováním |
| --- | --- | --- |
| A — technický prototyp | Jednoduchý rám 7 × 5 se samostatnými orientovanými výřezy a parametry obrysu | `.lyl` a IndexedDB zachovají parametry; změna rozměrů rámu nezdeformuje spojení ani potichu nezruší jejich ruční úpravy; otevření sloučení a Zpět/Znovu fungují |
| B — geometrie a orientace | Generátory obou typů otvorů, délka výřezu, vstupní profily a tiskové korekce | Skutečný CAD řez má zadané rozměry; X/Y/Z, šikmá osa a pootočený kříž; nastavení průchodu šikmým tělesem |
| C — první ovladatelná verze | Volitelná nabídka, vložení rámu, panel vlastností, tabulka spojení, vložení otvoru na plochu a značky | Celý postup v živém prohlížeči; rám podle mapy 64179 a vlastní těleso s různě orientovanými otvory; sousední model zůstane nedotčený |
| D — rychlé opakování a úpravy | Řada otvorů, rozteč, duplikace, převod na běžnou geometrii a pravidla škálování | Jeden otvor lze následně otočit či změnit na křížový; transformace skupin a kopie zachovají význam parametrů |
| E — kalibrace a výuka | Zkušební dílek, profil školní tiskárny, krátký návod | Vytištěný vzorek je vyzkoušený skutečnými čepy a osami; děti zvládnou vlastní držák s otvory ve dvou směrech |
| F — vydání | Přeložené ovládání, otestovaný export a zdrojový kód připravený pro GitHub | Kontrola buildu, metadat 3d.espide.eu, offline prostředků a základních běžných tvarů; ověření nasazení zvlášť |

První demonstrační výstup po etapě C: editovatelný rám s ověřenou mapou spojení
64179, dále libovolný kvádr s kulatým otvorem
shora, kulatým otvorem z boku a křížovým otvorem v třetím směru. Vybrat
parametry a orientaci tak, aby se výřezy pro základní test vzájemně nekřížily.
Zvlášť pak ověřit křížící se a šikmé otvory jako náročnější případ.

## Místa zásahu v současném kódu

Nová logika má být soustředěná například do `apps/web/src/lib/technic/`
(typy, validace, profily, geometrie rámu a otvorů, transformace, předvolby,
mapa spojení a případně opakování)
a malých komponent `TechnicFeaturePanel` / `TechnicFeatureOverlay`.
Existující soubory upravíme jen v potřebných napojeních:

- `src/types/layerling.ts`: volitelná metadata prvku a nastavení nabídky.
- `src/lib/shapeCatalog.ts` a `workplaneShapes.ts`: vytvoření, kopírování,
  normalizace a porovnání tvarů bez ztráty parametrů.
- `src/lib/lylProject.ts`, `projectShapePersistence.ts`, `editorHistory.ts`:
  validace, uložení/obnovení, historie a sledování změn metadat.
- `src/lib/placementWorkplane.ts`, `carryOntoFace.ts`, `groupScale.ts`:
  využití stávajících převodů a cílené ošetření transformací.
- `src/components/LayerlingEditor.tsx`, `WorkplaneViewport.tsx`
  a `workplane/ShapeInspector.tsx`: příkazy, výběr a ovládací panel.
- `src/lib/editorBooleans.ts`, profilové CAD pomocné funkce a jejich
  konverze pro Worker: výřezy a regenerace skupiny podle stávajících cest.
- `src/lib/myShapes.ts`: ověřit zachování chytrých prvků ve vlastní knihovně.
- `messages.cs.ts`, `messages.en.ts`, `messages.de.ts`: všechny nové texty
  se stejnými klíči a zástupnými symboly.

Cesty v seznamu jsou relativní k `apps/web/`. Generované styly, ikony,
průvodce a service worker upravujeme pouze přes jejich zdroj/build postup.
Nový obecný systém pluginů není podmínkou tohoto rozšíření. Velké editorové
soubory dostanou malé explicitní napojení; při dalších upstream aktualizacích
je nutné tato napojení znovu ověřit.

## Ověření a rizika

Automatické testy musí ověřit význam parametrů, nikoli jen obrázek či počet
trojúhelníků: skutečné rozměry řezu, příslušnost k cílovému tělesu, natočení
profilu, transformace, kopie, historii a obnovu po uložení. Neplatné či
neznámé parametry nesmí poškodit existující projekt.

Použijeme místní Node.js 24 bez globální změny prostředí Blockly/Electron.
Spustíme cílené jednotkové a CAD testy, kontrolu typů a statický export.
Při širších změnách historie a persistence také celou jednotkovou sadu.
Dříve zjištěná chyba Windows cest v `sharedProjectsCopy.test.ts` je samostatná
výchozí odchylka a nesmí zakrýt novou regresi.

Živá kontrola prohlížeče má zahrnout vložení na vodorovnou/boční/šikmou
plochu, orientaci kříže, manipulaci uvnitř sloučení, Zpět/Znovu, reload,
opětovné otevření `.lyl`, skrytou nabídku Technic a běžný projekt bez Technic.
Testovat na odděleném zkušebním projektu, nikoli na dětském rozpracovaném modelu.

Fyzická kontrola je samostatná: více profilů otvorů, různé orientace tisku,
konkrétní tiskárna/materiál/nastavení a skutečný čep/osa. Správná CAD geometrie
není důkazem správného mechanického spojení. Kalibrace upraví profily otvorů,
nikoli měřítko celého dílku a rozteče.

Hlavní rizika: ztráta metadat při vytváření nové instance tvaru; deformace
vnořeným škálováním; přegenerování skupiny s pozdějšími úpravami hran;
neplatný booleovský výsledek u překrývajících se výřezů; nesoulad náhledu
a exportu. V první etapě ověřit také návrat ke zdrojům skupiny před úpravami
hran. Kombinace, kterou neumíme bezpečně obnovit, má zachovat platnou
geometrii a nabídnout jasnou vratnou cestu, nikoli potichu ztratit úpravy.

## Navazující rozšíření

Po ověření první verze: symbolové řady
a mřížky jako způsob zadání jednotlivých prvků; generátory dalších nosníků a rámů;
přichytávání podle středů a orientace spojení; další typy spojů.
Žádný z těchto kroků není podmínkou použitelných samostatných otvorů.

## Referenční projekty

- https://github.com/marian42/partdesigner — skládání prvků a nastavitelné rozměry.
- https://github.com/cfinke/Technic.scad — úhly, typy a rozměry spojek/nosníků.
- https://github.com/B-AROL-O/OpenSCAD-lego-library — symbolové vzory různě orientovaných otvorů.
- https://brickarchitect.com/parts/category-12 — přehled rodin a příkladů Technic dílků.
- https://library.ldraw.org/library/official/parts/64179.dat — geometrická reference rámu 64179, včetně jeho odkazovaných podčástí.

Případné převzetí implementace kontrolovat podle licence konkrétního souboru;
geometrické generátory lze také napsat vlastní podle ověřených parametrů.
