# Lego Compatible – první funkční verze

Volitelný konstrukční editor je součástí nabídky **Tvary → Lego Compatible → Sestavit dílek**.
Dosavadní modelovací nástroje fungují dál. Editor dílku využívá aktuální téma a překlady CS/EN/DE.

## Použití

1. Otevřete **Sestavit dílek**. Výchozí předloha je rám 7 × 5 s prázdným středem 5 × 3; není to přesná kopie dílu 64179.
2. **Vybrat** pouze vybírá buňku. V pravém panelu změňte její typ, směr otvoru X/Y/Z nebo natočení kříže 0°/45°.
   Náhled Z ukazuje profil otvoru shora; vodorovné otvory X/Y jsou vyznačeny čárkovaným průchodem a dvojicí směrových šipek. U křížového otvoru je vidět také natočení profilu. Písmeno osy je jen doplňkový popisek.
3. **Přidat** kreslí zvolenou buňku kliknutím nebo tažením, i v prázdném prostoru za obrysem. **Odebrat** odstraní materiál v buňce.
4. Šipky posouvají viditelnou část rastru; při přidání na jeho hranici se okno po uvolnění tlačítka posune o jednu buňku. Velikost buněk se nemění.
5. **Vytvořit těleso** vytvoří skutečnou uzavřenou polygonovou síť a vloží ji do projektu v jednom kroku historie. **Zrušit** nechá původní projekt beze změny.
6. Dílek znovu otevřete pravým tlačítkem → **Upravit Lego dílek**, nebo výběrem dílku a stejným příkazem v nabídce **Tvary**.

V editoru je vlastní Zpět/Znovu. Po dokončení funguje běžná historie projektu.
Předloha zůstává v lokálním projektu i v souboru `.lyl`, včetně historie.
Přesuny, otočení a zrcadlení zachovají možnost opětovné úpravy; rozšiřování zachovává světovou polohu původního počátku rastru.
Nový dílek se v této etapě vytváří u počátku základní pracovní roviny. Potom jej lze běžnými nástroji posunout a otočit.

## Generátor

Rozbalte **Generátor z předlohy**. Značky: `#` plná buňka, `o` otvor pro pin, `+` otvor pro osu, `.` prázdná.
Řádky odpovídají pohledu shora: nahoře je kladný směr Y. Všechny řádky musí mít stejnou délku.
Použití předlohy nahradí rozmístění a použije aktuální směr a natočení otvorů. Původní levý dolní počátek předlohy se zachová.
Maximální předloha je 32 × 32 a celkem 256 obsazených buněk. Ruční kreslení podporuje souřadnice −128 až 128 buněk.

## Geometrie a rozměry

- Rozteč je pevná **8 mm**, výška této verze **8 mm**.
- Plné buňky se nejprve sjednotí. Teprve potom se odečtou otvory; mezi sousedními buňkami nevznikají mezery.
- Základní průměr otvoru pro pin je **4,95 mm**, vstupní rozšíření **6,4 mm** hluboké **0,89 mm**.
- Křížový otvor je průnik kruhového profilu 4,95 mm se dvěma pásy šířky **2,02 mm**. Konce ramen tak odpovídají kruhovému profilu.
- Vstupní rozšíření pro pin vzniká pouze na vnějších čelech. Spojené buňky se souosými otvory nemají vnitřní rozšíření ani přepážku.
- **Korekce průměru otvorů** zvětší/zmenší průměr a šířku ramen, ne rozteč nebo rozměry materiálu. Rozsah je ±0,4 mm.

Referenční rozměry vycházejí z [PartDesigner – measurements.ts](https://github.com/marian42/partdesigner/blob/master/src/measurements.ts).
Výpočet těles používá existující Manifold jádro Layerlingu. Nevkládá další závislosti.
Před sériovým tiskem je nutný zkušební tisk a ověření spojení s konkrétními dílky. Rozměry v CAD nejsou ověřením fyzické pasovatelnosti.

## Hranice první verze

Jedna vrstva buněk, tři typy buněk, jeden otvor v každé buňce a dvě natočení křížového profilu.
Výsledek je běžná polygonová síť pro dosavadní modelování a export; tato verze negeneruje analytický STEP/BRep model.
Více výškových vrstev, tenké buňky, piny, výstupky, kulové čepy, poloviční rozteče a vnější výrobní vůle zatím nejsou implementované.

Pokud se dílek běžným editorem roztáhne, zúží, upraví jeho síť nebo použijí úpravy hran/BRep, editor předlohy se zablokuje.
Tím se již provedené úpravy neztratí regenerováním původní předlohy. Běžné modelování zůstává dostupné; Zpět vrátí předchozí upravitelný stav.
Zaoblení parametrických dílků a jeho zachování při změně předlohy bude samostatná další etapa.

## Vývoj a ověření

Zdrojové moduly: `technicRecipe.ts`, `technicBuilder.ts`, `TechnicWorkspace.tsx`, `technic.css`.
Integrace používá dosavadní `commitShapes`, kontrolu změny projektu před dokončením asynchronního výpočtu a obvyklou serializaci `.lyl`.
Import kontroluje verzi, počet buněk, rozsah souřadnic, duplicity a rozměrové korekce. Starší čtečky mohou zobrazit uloženou síť bez editoru předlohy.

Testy:

```text
npm run typecheck
npm test -- tests/unit/technicRecipe.test.ts tests/unit/technicWorkspace.test.ts tests/unit/lylProject.test.ts tests/unit/i18n.test.ts
npm run test:e2e -- tests/e2e/technicBody.e2e.ts tests/e2e/holeSize.e2e.ts
npm run export
```

Statický export vytváří nový otisk obsahu pro Service Worker a `version.json`; změna se tedy odliší od předchozího buildu i při zachování verze upstreamu 1.66.6.

Ověřeno lokálně: 1775/1776 jednotkových testů; jediný zbývající pád je již známý Windows test `sharedProjectsCopy.test.ts`, který s touto funkcí nesouvisí.
Nové testy předlohy a rozhraní procházejí. Dvanáct testů reálných Technic těles a pět sousedních testů průměrů otvorů prochází, včetně STL round tripu.
Typecheck, statický export a kontrola metadat pro `3d.espide.eu` procházejí.
V živém prohlížeči ověřeno vytvoření, zvětšování do všech čtyř stran, pevný 44px rastr, otočený otvor, opětovné otevření po obnovení stránky, další úprava, Zpět a zrušení změn.
Ověřeno také úzké rozhraní při 600 px: panel se přesune pod rastr, který zachová velikost buněk.
Živý export do STL vytvořil soubor, jehož binární struktura a rozměry 72 × 56 × 8 mm byly ověřeny. Běžný exportní výpočet a zpětný import STL navíc ověřují automatické testy.
Fyzický tisk, pasovatelnost s konkrétní stavebnicí, offline obnovení a nasazení na WEDOS zatím nebyly ověřeny.
