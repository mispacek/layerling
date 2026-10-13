# Lego Compatible – první funkční verze

Volitelný konstrukční editor je součástí nabídky **Tvary → Lego Compatible → Sestavit dílek**.
Dosavadní modelovací nástroje fungují dál. Editor dílku využívá aktuální téma a překlady CS/EN/DE.

## Použití

1. Otevřete **Sestavit dílek**. Výchozí předloha je rám 7 × 5 s prázdným středem 5 × 3; není to přesná kopie dílu 64179.
2. **Vybrat** vybírá buňku kliknutím nebo více buněk tažením obdélníku. Shift přidá/odebere buňku z výběru. V pravém panelu změňte typ, směr otvoru X/Y/Z nebo natočení kříže 0°/45° celého výběru.
   Náhled Z ukazuje profil otvoru shora; vodorovné otvory X/Y jsou vyznačeny čárkovaným průchodem a dvojicí směrových šipek. U křížového otvoru je vidět také natočení profilu. Písmeno osy je jen doplňkový popisek.
3. **Přidat** kreslí zvolenou buňku kliknutím nebo tažením, i v prázdném prostoru za obrysem. **Odebrat** odstraní materiál v buňce.
   Klávesami **X / Y / Z** měníte směr otvoru pro další kreslení. V režimu Vybrat mění směr vybraných buněk, v režimu Nastavit směr razítka. Při psaní do polí ani s Ctrl/Alt/Meta se tato zkratka nepoužívá; Ctrl+Z/Y zůstává historií.
4. Šipky posouvají viditelnou část rastru; při přidání na jeho hranici se okno po uvolnění tlačítka posune o jednu buňku. Velikost buněk se nemění.
5. **Vytvořit těleso** vytvoří skutečnou uzavřenou polygonovou síť a vloží ji do projektu v jednom kroku historie. **Zrušit** nechá původní projekt beze změny.
6. Dílek znovu otevřete pravým tlačítkem → **Upravit Lego dílek**, nebo výběrem dílku a stejným příkazem v nabídce **Tvary**.

V editoru je vlastní Zpět/Znovu. Po dokončení funguje běžná historie projektu.
Jedno tažení nástrojem Přidat/Odebrat/Nastavit tvoří jeden krok historie. Při výběru se objeví malá lišta Kopírovat, Přesunout, Zrcadlit X/Y a Odstranit výběr.
Kopii/přesun umístěte kliknutím na nový levý dolní roh výběru. Překrytí cizích buněk, překročení souřadnic nebo limitu buněk se odmítne. Esc ukončí umisťování.
**3D náhled** vedle rastru zobrazuje skutečnou výslednou síť. Pravé tlačítko otáčí, prostřední nebo Ctrl + levé posouvá, kolečko přibližuje. **Zobrazit celý dílek** obnoví vhodné přiblížení.
Výpočet náhledu čeká na krátkou přestávku v kreslení; neslouží k editaci v prostoru. Při neplatných rozměrech se starý náhled skryje.
Předloha zůstává v lokálním projektu i v souboru `.lyl`, včetně historie.
Přesuny, otočení a zrcadlení zachovají možnost opětovné úpravy; rozšiřování zachovává světovou polohu původního počátku rastru.
Nový dílek se v této etapě vytváří u počátku základní pracovní roviny. Potom jej lze běžnými nástroji posunout a otočit.

**Patra:** přepínač nad rastrem vybírá aktivní patro. Lze přidat prázdné patro, duplikovat aktuální nebo ho odebrat; odebrání posune vyšší patra dolů. Průsvitné sousední patro a modrá rovina v 3D náhledu usnadňují orientaci. Kreslení, výběr, šablony i zaoblení mění pouze aktivní patro. Podrobnosti jsou v [návodu k vícepatrovému editoru](technic-multilayer.cs.md).

## Generátor

Rozbalte **Generátor z předlohy**. Značky: `#` plná buňka, `.` prázdná; `ox`, `oy`, `oz` otvor pro pin v daném směru; `+x`, `+y`, `+z` otvor pro osu s křížem 0°; `+x45`, `+y45`, `+z45` s křížem 45°.
Každá značka představuje jednu buňku. Oddělujte je mezerami; při automatickém zobrazení se sloupce zarovnají. Původní kompaktní zápis `#o.+` zůstává platný: samostatné `o` a `+` převezmou aktuální směr a natočení. Explicitní značky tato nastavení nepřebírají, takže smíšené směry zůstanou zachované i po opakovaném použití textu.
Řádky odpovídají pohledu shora: nahoře je kladný směr Y. Všechny řádky musí mít stejný počet buněk, nikoli znaků.
Použití předlohy nahradí rozmístění aktivního patra. Původní levý dolní počátek předlohy se zachová. Textový formát popisuje typ, směr a natočení otvoru; nenahrazuje `.lyl` pro uložení jednotlivých korekcí a zaoblení.

```text
ox   oy   oz
+x   +y45 +z
```
Maximální předloha je 32 × 32 a celkem 256 obsazených buněk. Ruční kreslení podporuje souřadnice −128 až 128 buněk.

## Geometrie a rozměry

- Výchozí rozteč je **8 mm**, výška každého patra **8 mm**. Rozteč a společnou výšku pater lze upravit v části **Úpravy pro tisk**. Nejvýše 32 pater a 256 obsazených buněk celkem.
- Buňky se sjednotí a otvory i zaoblení vypočítají pro každé patro zvlášť; potom se patra sjednotí do výsledného tělesa. Otvor jednoho patra neodebírá materiál ze sousedního.
- Základní průměr otvoru pro pin je **4,95 mm**, vstupní rozšíření **6,4 mm** hluboké **0,89 mm**.
- Křížový otvor je průnik kruhového profilu 4,95 mm se dvěma pásy šířky **2,02 mm**. Konce ramen tak odpovídají kruhovému profilu.
- Vstupní rozšíření pro pin vzniká pouze na vnějších čelech. Spojené buňky se souosými otvory nemají vnitřní rozšíření ani přepážku.
- **Korekce průměru otvorů** zvětší/zmenší průměr a šířku ramen, ne rozteč nebo rozměry materiálu. Rozsah je ±0,4 mm.
- Samostatně lze nastavit průměr otvoru, rozměry zahloubení, šířku ramen kříže a korekce pro pin, osu a zahloubení. Kříž využívá stejný základní kruhový průměr jako otvor pro pin; jeho vlastní korekce mění tento průměr i šířku ramen.
- **Úbytek obrysu** ubere materiál po obvodu sjednoceného tělesa, včetně prázdných vnitřních otvorů obrysu. Zachová rozteč a spojení sousedních buněk. Horní/spodní plochy tímto parametrem nejsou posunuté.
- Vzorky mají vlastní **Korekci vybraných buněk**, která se přičítá k ostatním korekcím. Lze ji měnit také hromadně.
- Rozměry se ukládají přímo do `.lyl`. Až 20 pojmenovaných profilů tiskárny/materiálu je uložených v prohlížeči; načtení profilu mění jen aktuální návrh a lze je vrátit přes Zpět. Starší předlohy bez rozměrového profilu zachovají původní geometrii.

## Katalog a kalibrace

**Katalog šablon** obsahuje nosník, nosník s křížovými otvory na koncích, nosníky L/T, obdélníkový rám, rám I a plnou destičku.
Zvolte šířku/hloubku v buňkách a použijte šablonu. Všechny její buňky zůstávají upravitelné. Nejde o přesné repliky originálních dílů; inspirace katalogem [PartDesigner](https://github.com/marian42/partdesigner/blob/master/src/editor/Catalog.ts).
Použití šablony nebo kalibrace nahradí pouze aktivní patro; Zpět jej obnoví. Projekt se změní teprve po **Vytvořit těleso**.

**Kalibrační dílek** vytvoří tři kruhové a tři křížové otvory s korekcemi −krok, 0, +krok. Výchozí krok je 0,1 mm a lze jej měnit.
Pro Z jde o destičku 24 × 16 × 8 mm při výchozích rozměrech. U X/Y jsou dvě řady oddělené a spojené po straně, aby všech šest otvorů zůstalo průchozích (24 × 32 nebo 32 × 24 mm).
Hodnoty vzorků jsou uvedené v rastru, nikoli vyražené do tištěného tělesa. Kruhový vzorek s nejmenší vůlí má zaoblené vnější rohy jako hmatovou orientační značku. Při zachování této značky lze poznat orientaci i po tisku; zaoblení lze běžně změnit v editoru. Hotový dílek exportujte běžným exportem do STL.
Po vyzkoušení konkrétních pinů/os nastavte odpovídající korekce a uložte profil. U součástí X/Y ověřte také vliv podpěr a směru vrstev tisku.

Referenční rozměry vycházejí z [PartDesigner – measurements.ts](https://github.com/marian42/partdesigner/blob/master/src/measurements.ts).
Výpočet těles používá existující Manifold jádro Layerlingu. Nevkládá další závislosti.
Před sériovým tiskem je nutný zkušební tisk a ověření spojení s konkrétními dílky. Rozměry v CAD nejsou ověřením fyzické pasovatelnosti.

## Hranice první verze

Více pater buněk se společnou výškou, tři typy buněk, jeden otvor v každé buňce a dvě natočení křížového profilu.
Výsledek je běžná polygonová síť pro dosavadní modelování a export; tato verze negeneruje analytický STEP/BRep model.
Různé výšky jednotlivých buněk, vystupující piny/osy, kulové čepy a poloviční rozteče zatím nejsou implementované.

Pokud se dílek běžným editorem roztáhne, zúží, upraví jeho síť nebo použijí úpravy hran/BRep, editor předlohy se zablokuje.
Tím se již provedené úpravy neztratí regenerováním původní předlohy. Běžné modelování zůstává dostupné; Zpět vrátí předchozí upravitelný stav.
Zaoblení rohů obrysu nyní zůstává v předloze a při její změně se přepočítá podle sousedních buněk. Horní a spodní hrany se tímto nástrojem nezaoblují.

## Nastavit a zaoblení rohů
Každá buňka má vlastní volbu **Bez zaoblení / Vnější / Vnitřní / Vnější i vnitřní**. **Zaoblit aktivní patro** nanese aktuální volbu na jeho buňky; **Nastavit** ji přenáší na kliknuté buňky. Starší `rounded: true` zachová obě zaoblení. Označení mřížky a jednotek je **Lego**, uložené identifikátory zůstávají stejné.

V režimu **Vybrat** zvolte vzorovou buňku a upravte její typ, směr, natočení a zaoblení. Přepněte na **Nastavit** a klikáním nebo tažením přenášejte tato nastavení na další obsazené buňky. Typ můžete zvolit také přímo v režimu **Nastavit**: **Plná buňka / Otvor pro pin / Otvor pro osu**. Volba v panelu připraví nastavení; použije se až kliknutím na buňku v rastru. Prázdné buňky se nepřidávají.

V části **Zaoblení rohů** lze zaoblit vybranou buňku nebo aktivní patro. Poloměr 0,2–4 mm je společný. Zaoblení se počítá na sjednoceném obrysu daného patra: vnější rohy se oříznou, vnitřní rohy se vyplní obloukem, společné rovné stěny zůstanou spojené. Průchozí otvory pokračují přes materiál přidaný vnitřním zaoblením.

Tlačítko **Zaoblení** v běžném 3D editoru u upravitelného Lego dílku otevře tuto část generátoru, takže jej neblokuje limit CAD úprav polygonových sítí 4 000 trojúhelníků. Parametry zaoblení se ukládají do `.lyl`; staré předlohy se načítají bez zaoblení.

## Vývoj a ověření

Zdrojové moduly: `technicRecipe.ts`, `technicBuilder.ts`, `technicMeasurements.ts`, `technicSelection.ts`, `technicTemplates.ts`, `TechnicWorkspace.tsx`, `TechnicPreview.tsx`, `technic.css`.
Integrace používá dosavadní `commitShapes`, kontrolu změny projektu před dokončením asynchronního výpočtu a obvyklou serializaci `.lyl`.
Import kontroluje verzi, počet buněk a pater, rozsah souřadnic, duplicity a rozměrové korekce. Staré předlohy verze 1 se načtou jako jedno patro. Vícepatrová předloha používá verzi 2; pro její `.lyl` je nutná aktualizovaná aplikace. STL zůstává běžnou přenositelnou sítí.

Testy:

```text
npm run typecheck
npm test -- tests/unit/technicRecipe.test.ts tests/unit/technicWorkspace.test.ts tests/unit/lylProject.test.ts tests/unit/i18n.test.ts
npm run test:e2e -- tests/e2e/technicBody.e2e.ts tests/e2e/holeSize.e2e.ts
npm run export
```

Statický export vytváří nový otisk obsahu pro Service Worker a `version.json`; změna se tedy odliší od předchozího buildu i při zachování verze upstreamu 1.66.7.

Historické ověření první etapy (před rozšířením výběru, kalibrace a katalogu): 1775/1776 jednotkových testů; jediný zbývající pád je již známý Windows test `sharedProjectsCopy.test.ts`, který s touto funkcí nesouvisí.
Nové testy předlohy a rozhraní procházejí. Dvanáct testů reálných Technic těles a pět sousedních testů průměrů otvorů prochází, včetně STL round tripu.
Typecheck, statický export a kontrola metadat pro `3d.espide.eu` procházejí.
V živém prohlížeči ověřeno vytvoření, zvětšování do všech čtyř stran, pevný 44px rastr, otočený otvor, opětovné otevření po obnovení stránky, další úprava, Zpět a zrušení změn.
Ověřeno také úzké rozhraní při 600 px: panel se přesune pod rastr, který zachová velikost buněk.
Živý export do STL vytvořil soubor, jehož binární struktura a rozměry 72 × 56 × 8 mm byly ověřeny. Běžný exportní výpočet a zpětný import STL navíc ověřují automatické testy.
Fyzický tisk, pasovatelnost s konkrétní stavebnicí, offline obnovení a nasazení na WEDOS zatím nebyly ověřeny.
