# Aktualizace upstreamu na 1.68.0 – 13. 10. 2026

Sloučen `henmedia/layerling/main`, commit `ea0189d821c6d03c6fa15ef546cfca2a57ea33ad`.
Obsahuje vydání 1.68.0 i následnou opravu zamykání objektů. Stav před aktualizací
je uložen v commitu `3313ad67` a větvi `codex/backup-before-upstream-3313ad67`.

- Převzata podpora arabského a hebrejského textu zprava doleva a spojování znaků vlastních písem.
- Náčrt a 3D editor nyní sdílejí krok přichytávání. Při vypnutém přichytávání posouvají šipky o 0,1 mm, se Shiftem o 0,5 mm.
- Zamčené objekty mají viditelný zámek a vypnuté ovládání úprav. Výběr obsahující zamčený objekt nelze společně měnit.
- Zachovány výchozí čeština, Graphite a canonical/Open Graph metadata pro `3d.espide.eu`.
- Zachován vícepatrový LEGO editor, zaoblení jednotlivých buněk, předlohy, profily pro tisk, klávesy X/Y/Z, orientované textové zadání i mřížka podle přichytávání.
- Vyřešeny tři konflikty v `LayerlingEditor.tsx`: LEGO zaoblení spolu s ochranou zamčeného výběru, přichytávání podle aktuálního kroku a nabídka úprav LEGO pouze pro odemčený objekt. Také přímé otevření LEGO editoru respektuje zámek.
- České rozhraní má všech 2433 klíčů. Aktualizovány změněné texty, odstraněny zrušené klíče a přeloženy tři nové položky novinek i dosud nevydaná oprava zámku. Anglický fallback nepřeložených kapitol příručky zůstává zachován.
- Test `textLetterSize.e2e.ts` před kontrolou anglických popisků výslovně zvolí angličtinu a po testu obnoví původní jazyk. Výchozí jazyk aplikace se tím nemění.

## Ověření

- **Static/local:** TypeScript, kontrola překladů CS/DE 2433/2433 a statický export prošly; oba CAD workery ověřeny. Service Worker obsahuje 220 souborů, hash `97bfa662e1470b5e`.
- Jednotkové testy: 2001/2002 prošlo. Zbývá známý Windows problém s cestou v `sharedProjectsCopy.test.ts`, přítomný už před aktualizací.
- Všech 42 cílených testů skutečné geometrie prošlo: LEGO, rozměry otvorů, jmenovky a velikost písmen.
- **Live browser/MCP:** ve statickém náhledu `http://127.0.0.1:3001/` ověřena verze 1.68.0, čeština/Graphite, přepínání CS/EN/DE, blokování úprav zamčeného LEGO objektu a opětovná editace po odemčení.
- Vytvořen zkušební dílek z orientovaných tokenů `ox +y45 / oz #`, doplněna dvě patra. Po obnovení stránky zachováno všech šest buněk, rozměry 16 × 16 × 24 mm, otvory X/Y/Z a vnější zaoblení vybrané buňky ve třetím patře. Funkční 3D náhled; bez zaznamenaných chyb a varování konzole při závěrečné kontrole.
- Screenshot: ignorovaný `.codex-run/layerling-1680-lego.png`; logy v `node_modules/upstream-1680-unit.log` a `node_modules/upstream-1680-export.log`.
- **Physical device/host:** fyzický tisk, skutečný WEDOS hosting a offline obnovení nebyly ověřeny.

Výstup pro běžný webhosting je obsah `apps/web/.next-export/`. Aktualizace je
uložena jako merge pro další přebírání upstreamu; nebyla odeslána na GitHub ani WEDOS.
Vývojový server na portu 3000 je potřeba ručně znovu spustit pomocí `start-local.cmd`;
ověřený statický náhled na portu 3001 už používá aktuální sestavení.
