# Lego Compatible – vícepatrový editor

## Ovládání

1. Otevřete **Tvary → Sestavit dílek**. Nad rastrem vyberte **Aktivní patro**; nabídka uvádí jeho základní výšku Z a počet buněk.
2. **Přidat patro** přidá prázdné patro nad poslední. **Duplikovat patro** tam přidá kopii aktivního patra včetně otvorů, korekcí a zaoblení.
3. Kreslení, výběr, Nastavit, přesouvání a kopírování buněk upravují pouze aktivní patro. Katalog, textový vzor i kalibrace nahradí jen jeho buňky.
4. Volba **Sousední patra** ukazuje průsvitné buňky bezprostředně pod a nad aktivním patrem. Šipky ↓/↑ rozlišují jejich polohu. Tyto pomocné buňky se kliknutím nevybírají.
5. **3D náhled** zobrazuje celé výsledné těleso; modrá rovina označuje začátek aktivního patra. Je to pomůcka, která se neexportuje. Pravé tlačítko otáčí, prostřední / Ctrl + levé posouvá, kolečko přibližuje.
6. V části **Zaoblení rohů** nastavte vybrané buňce vnější, vnitřní, obě nebo žádné zaoblení. **Zaoblit aktivní patro** použije zvolený režim na jeho všechny buňky. **Nastavit** přenáší nastavení klikáním.
7. **Odebrat patro** odstraní jeho buňky a posune vyšší patra o jedno dolů. Poslední patro odstranit nelze. **Zpět/Znovu** obnovuje návrh i aktivní patro.
8. **Vytvořit těleso** uloží celý dílek do projektu; **Zrušit** opustí návrh bez změny projektu. Uložený dílek znovu otevřete přes jeho nabídku nebo tlačítko **Zaoblení** v 3D editoru.

## Přenos výběru mezi patry a zvýraznění

V režimu **Vybrat** označte buňku, více buněk tažením nebo přes Shift. Pod úpravami výběru zvolte **Do patra** a klikněte na **Kopírovat do patra** nebo **Přesunout do patra**. Nabídka obsahuje ostatní existující patra a také nové patro nad posledním; není nutné ho nejprve ručně založit.

Přenos zachová souřadnice X/Y, typ a směr otvorů, natočení kříže, korekce i zaoblení. Kopie ponechá původní buňky, přesun je odebere ze zdrojového patra. Cílové patro se otevře a přenesené buňky zůstanou vybrané. Vše včetně přidání nového patra tvoří jeden krok Zpět. Prázdné zdrojové patro zůstává zachované, aby se neposunula vyšší patra.

Obsazený cíl se nepřepisuje; celý přenos se odmítne bez změny návrhu nebo historie. Totéž platí pro překročení limitu pater/buněk. Při plném limitu buněk lze stále použít přesun. Hláška o překrytí se zobrazí u ovládání výběru.

V **3D náhledu** je aktivní patro červené, vybrané buňky oranžové a ostatní patra šedá. Změna výběru nebo aktivního patra nemění výslednou síť a nevyžaduje nový výpočet tělesa. Zvýraznění označuje viditelné povrchy; ostatní patra zůstávají neprůhledná. Modrá rovina dál ukazuje základ aktivního patra. Barvy a pomocná rovina se neukládají do STL ani do geometrie projektu.

Otáčení výběru o 90° a kontrola oddělených částí jsou další plánované kroky, dosud nejsou implementované.

### Klávesy a textová předloha

**X / Y / Z** nastavují směr otvoru při přidávání, výběru nebo razítkování. V textových, číselných a výběrových polích ani při zadávání přes IME se zkratky nepoužijí. Ctrl+Z/Y zůstává historií a Ctrl+X obvyklou zkratkou pro vyjmutí textu. Kliknutí do rastru vrátí fokus kreslení, i pokud jste předtím upravovali text.

Textový generátor automaticky vypisuje směr každé díry: `ox/oy/oz` pro pin, `+x/+y/+z` pro osu 0°, `+x45/+y45/+z45` pro osu 45°. Značky oddělte mezerami; každý řádek musí mít stejný počet buněk. Staré `o/+` stále přebírají směr a natočení nástroje, explicitní značky je zachovají nezávisle na něm. Použití textu mění pouze aktivní patro; natočení není přenášeno do ostatních pater. Podrobný příklad je v [základním návodu](technic-first-version.cs.md#generátor).

## Rozměry a geometrie

- Výška všech pater je společná, výchozí 8 mm; mění se v **Úpravách pro tisk**. Nejvýše 32 pater a 256 obsazených buněk celkem.
- Každé patro má vlastní půdorys, typy a směry otvorů i zaoblení jednotlivých buněk. Poloměr zaoblení je společný pro celý dílek.
- Zaoblují se svislé rohy obrysu daného patra; horní a spodní vodorovné hrany zůstávají rovné. Nejde o prostorové zaoblení všech hran.
- Otvory se odečtou z příslušného patra před sjednocením pater. Nad vodorovným otvorem tedy může být plná buňka bez nechtěného řezu. Souosé Z otvory navazují bez vnitřního vstupního rozšíření na sdílené ploše.
- Prázdné patro nepřidává materiál. Pokud nejnižší obsazené patro leží výše, těleso si uchová tuto výšku nad pracovní rovinou. Oddělené buňky se automaticky nepropojují; pro jeden tisknutelný celek je potřeba souvislý materiál.
- Původní jednopatrové předlohy verze 1 zůstávají kompatibilní. Přidání patra používá předlohu verze 2 včetně počtu prázdných pater; její `.lyl` vyžaduje aktualizovanou aplikaci. Export STL funguje jako běžná polygonová síť.
- Opravena detekce orientace vlastního binárního STL: hlavička exportu určuje Z jako svislou osu i u vysokých dílků. Původní rozpoznávání neoznačených cizích STL zůstává zachované.

## Ověření

- **Staticky/lokálně:** 34 cílených testů skutečné geometrie prošlo, včetně průchozích otvorů, odděleného zaoblení, úbytku obrysu, historie, `.lyl` a zpětného importu vysokého STL. Celá jednotková sada: 1950/1951; jediný pád je známý Windows test `sharedProjectsCopy.test.ts`, nesouvisející s LEGO úpravou. TypeScript a statický export včetně obou CAD workerů prošly. Exportní otisk `d4441d7f05009f59`.
- **Živý prohlížeč:** samostatný projekt **Lego – patra a zaoblení** na `http://127.0.0.1:3001/`: patra 3 × 3, 2 × 2, 1 × 1; celkem 14 buněk, 24 × 24 × 24 mm. Ověřeno duplikování, nahrazení pouze aktivního patra, otvor X a vnější zaoblení horní buňky, odebrání prostředního patra a Zpět. Po vytvoření tělesa a obnovení stránky zůstala všechna patra, otvor i zaoblení upravitelná. Rozložení při 390 px nepřesahuje vodorovně. Tlačítko náhledu má odsazení 8 px svisle a 12 px vodorovně.
- **Fyzický tisk / hosting:** neověřeno. Rozměrové testy neprokazují pasovatelnost s konkrétní stavebnicí. Změny nebyly odeslány na GitHub ani nasazeny na WEDOS.

Lokální export: `apps/web/.next-export/`; logy v ignorovaném `node_modules/technic-layers-{unit,export}.log`. Screenshot v ignorovaném `.codex-run/technic-multilayer.png`. Vývojovou aplikaci na portu 3000 je potřeba ručně restartovat přes `start-local.cmd`, pokud ještě používá prostředí starší verze.

### Ověření následného přenosu a zvýraznění (13. 10. 2026)

- 71 cílených jednotkových testů a 34 testů skutečné geometrie prošlo. Kontrola katalogu překladů CS/EN/DE nemá chybějící nové klíče ani rozdílné parametry. TypeScript a statický export včetně obou CAD workerů prošly. Celá jednotková sada nebyla v této etapě znovu spuštěna; její výsledek výše patří předchozí etapě.
- V samostatném projektu **Lego – přenos mezi patry** na portu 3001 ověřena kopie přímo do nového patra, přesun do existujícího patra a kopie do uvolněného místa. Odmítnuté překrytí nezměnilo buňky ani historii. Zpět/Znovu obnovuje počet pater, buňky a aktivní patro. Po vytvoření tělesa a obnovení stránky zůstalo 22 buněk v patrech s počty 19/2/1.
- Skutečný WebGL náhled rozlišuje oranžový výběr, červené aktivní patro a šedá ostatní patra, bez chyb shaderu v konzoli. Zvýraznění funguje na sjednocené geometrii, včetně povrchů velkých trojúhelníků přes více buněk.
- Na šířce 390 px ověřena kopie a Zpět; dokument nepřesahuje vodorovně. Fyzický tisk, offline obnovení a nasazení na WEDOS nebyly ověřeny.
- Finální exportní log: ignorovaný `node_modules/technic-transfer-export.log`; screenshot: `.codex-run/technic-transfer.png`.

### Ověření kláves a orientovaných předloh (13. 10. 2026)

- 85 cílených jednotkových a 34 geometrických testů prošlo; překlady CS/EN/DE mají shodné klíče a parametry. Statický export prošel včetně TypeScript kontroly a obou CAD workerů, otisk `b13f1628a204d36d`.
- V projektu **Lego – směry otvorů a text** na portu 3001 ověřeno psaní X do textového pole bez změny nástroje, předloha `ox oy oz / +x +y45 +z45`, kreslení dalších tří otvorů přes X/Y/Z a Ctrl+Z/Y. Opakované použití explicitního textu s jiným směrem a natočením nástroje zachovalo původní orientace. Po uložení a obnovení stránky zůstalo 9 buněk, 32 × 24 × 8 mm, a text se obnovil se všemi směry a kříži 0°/45°. Konzole bez chyb.
- Starý zápis a limit počtu buněk nezávislý na délce značek jsou ověřené automaticky. Fyzický tisk a nasazení na WEDOS nebyly ověřeny.
- Log: ignorovaný `node_modules/technic-pattern-export.log`; screenshot: `.codex-run/technic-pattern-directions.png`.
