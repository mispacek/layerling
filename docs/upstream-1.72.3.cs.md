# Aktualizace upstreamu na 1.72.3 – 14. 10. 2026

Sloučen `henmedia/layerling/main`, commit `edaad2dd5d981051be1845b71efbf0f91c50f3dc`.
Předchozí stav `e08428d8` je zachován ve větvi `codex/backup-before-upstream-e08428d8`.

- Převzaty změny vydání 1.68.1–1.72.3: výkresy SVG/PDF, vlastní profil závitu, měření kruhových hran a středy měření, přesnější zarovnávání, odhad materiálu s výplní a perimetry, otáčení náčrtu a opravy kamery, posuvníků a CAD operací. Také nové profily tiskáren, nizozemština a polština.
- Naše soubory LEGO editoru, parametrické geometrie a ikon zůstaly beze změny. Zachovány patra, kopírování a přesouvání mezi patry, X/Y/Z, orientované textové předlohy, zaoblení po buňkách, výchozích 4 mm pro nové návrhy i změna typu buňky v režimu Nastavit. Zachována adaptivní mřížka.
- Výchozí jazyk zůstává český a motiv Graphite. Canonical, Open Graph a generovaná příručka/sitemap používají `3d.espide.eu`.
- Vyřešeno šest konfliktních souborů: ignorované výstupy příručky, sitemap přegenerovaná ze zdroje, úvodní stránka, jazykový registr, test překladů a vyprázdněné nevydané novinky. Úvodní stránka kombinuje naše výchozí nastavení s novými volbami serverového ukládání; uživatelova uložená volba motivu má nadále přednost.
- Přeloženo 66 nových českých textů, upraveno pět změněných textů a přidáno pět popisků pro tisk celé příručky. Přeloženo všech 24 nových položek novinek. CS i DE mají 2499/2499 klíčů a shodné zástupné proměnné.
- NL a PL mají 2365/2499 textů; našich 134 doplňkových textů používá anglický fallback. Nizozemský registr proto označuje překlad této rozšířené verze jako neúplný. Čeština má nadále úplné rozhraní a anglický fallback nepřeložených kapitol příručky.
- SVG výkres uchovává plnou diakritiku. Základní PDF Helvetica nepodporuje všechny české/polské znaky; nepodporovaný znak s diakritikou se nově převádí na čitelné základní písmeno místo otazníku. Plná česká sazba PDF by vyžadovala vložené písmo. Stávající podporované znaky zůstávají zachovány.

## Ověření

- **Static/local:** TypeScript, kontrola překladů a statický export prošly. Ověřeny oba CAD workery. Výstup `apps/web/.next-export/` má verzi 1.72.3, Service Worker obsahuje 296 souborů a hash `d24a1c382f112606`.
- Jednotkové testy: 2070/2071 prošlo při `--maxWorkers=4`; zbývá dřívější Windows chyba cesty v `sharedProjectsCopy.test.ts`. Původní běh s vyšší souběžností navíc překročil časový limit jednoho testu závitů; při čtyřech workerech tento test prošel beze změny kódu.
- Po úpravě PDF prošlo všech 14 testů výkresů, následně všech 73 cílených testů výkresů, příručky a jazyků včetně nového českého PDF/SVG případu.
- Všech 92 cílených testů skutečné geometrie prošlo: LEGO, otvory, jmenovky, velikost písmen, vytváření dutin a závitová tělesa.
- `occt-wasm` aktualizován na 5.7.1. Běžnou instalaci npm blokoval otevřený log vývojového serveru v `node_modules`; balíček byl proto získán pomocí `npm pack`, ověřen proti SHA-512 v lockfilu a rozbalen do jeho adresáře. Globální Node/npm nebyly změněny. Nové CAD testy i export použily tuto verzi.
- **Live browser/MCP:** ve statickém náhledu `http://127.0.0.1:3001/` ověřena verze 1.72.3, CS/Graphite, načtení nizozemštiny a návrat do češtiny. Změna typu otvoru přes Nastavit, vytvoření třípatrového dílku a zámek/odemčení fungují.
- Zkušební projekt `Ověření aktualizace 1.72.3` po obnovení stránky zachoval šest buněk ve třech patrech, rozměry 16 × 16 × 24 mm, orientaci otvorů a vnější zaoblení 4 mm ve třetím patře. Parametrický editor se znovu otevřel přes Zaoblení a zobrazil 3D náhled.
- Exportován skutečný SVG výkres tohoto dílku. Stažený soubor je platné XML a obsahuje české popisky i diakritiku. Nové volby výplně/perimetrů a 2D exportu mají české ovládání. Závěrečná konzole bez zaznamenaných chyb a varování.
- Screenshot: ignorovaný `.codex-run/layerling-1723-lego.png`. Logy: `node_modules/upstream-1723-*.log`.
- **Physical device/host:** fyzický tisk, skutečný WEDOS hosting, úplný offline scénář ani živé stahování PDF nebyly ověřeny; PDF je ověřeno lokálními testy.

Aktualizace je uložená jako merge pro další přebírání upstreamu. Na GitHub ani
WEDOS nebyla odeslána. Pro webhosting se nahrává obsah `apps/web/.next-export/`.
Starý vývojový server na portu 3000 je potřeba ručně restartovat přes
`start-local.cmd`; ověřený statický náhled na portu 3001 už používá nové sestavení.
