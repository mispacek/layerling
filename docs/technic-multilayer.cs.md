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
