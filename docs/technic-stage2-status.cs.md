# Rozpracovaná druhá etapa Lego Compatible – 13. 10. 2026

Práce byla zastavena na žádost uživatele kvůli vypnutí počítače. Při následné aktualizaci upstreamu na 1.67.5 byly rozpracované změny uložené v commitu `bb25d8e1` a záložní větvi `codex/backup-before-1675`. Nebyly odeslané na GitHub/WEDOS. Podrobnosti aktualizace jsou v `docs/upstream-1.67.5.cs.md`.

## Hotové změny v kódu

- Výběr obdélníkem a přes Shift, hromadné nastavení, kopie/přesun kliknutím do rastru, zrcadlení a odstranění výběru. Kontrola překrytí a limitů. Jedno tažení tvoří jeden krok historie.
- Volitelný skutečný 3D náhled se stejným ovládáním kamery jako Layerling a přizpůsobením pohledu celému dílku.
- Rozměry a samostatné korekce uložené přímo v předloze; pojmenované profily v localStorage. Textová číselná pole přijímají desetinnou čárku i aritmetiku. Staré předlohy zachovají původní rozměry.
- Sedm parametrických šablon: nosník, smíšený nosník, L, T, obdélníkový rám, rám I, plná destička.
- Kalibrační dílek se šesti otvory a třemi korekcemi; u X/Y jsou řady oddělené, aby otvory zůstaly průchozí.
- Zachování počátku při změně výšky i na otočeném/zrcadleném tělese; CS/EN/DE texty a aktualizovaná dokumentace.

Více pater, různé výšky jednotlivých buněk a další konektory jsou odložené do dalších etap dle dohody.

## Ověření

- Poslední cílený běh: 86 jednotkových a 27 geometrických testů prošlo (včetně `.lyl` a STL round tripu).
- Finální statický export prošel včetně TypeScript kontroly a obou CAD workerů; Service Worker obsahuje 162 souborů, otisk `06b871566f6e32b5`. Výstup: `apps/web/.next-export/`.
- Celá jednotková sada před posledním přidáním dvou testů výšky: 1803/1804 prošlo. Jediný pád je již známý Windows test `sharedProjectsCopy.test.ts`, nesouvisející s LEGO změnami.
- Živě ověřeno: náhled, výběr přes Shift, hromadná změna směru, kopie kliknutím, desetinná čárka, uložení/načtení tiskového profilu.
- V testovacím prohlížeči zůstává profil `Test ovládání (bez tisku)` s korekcí pro pin +0,1 mm; nejde o fyzicky ověřené doporučení pro tisk.
- Testováno pouze v projektu `Lego Compatible – ověření`; rozpracovaný návrh nebyl vložen do projektu.
- Logy posledního exportu a celé sady jsou v ignorovaných `node_modules/technic-stage2-export.log` a `node_modules/technic-stage2-unit.log`.

## Při pokračování

1. Zkontrolovat `git status --short`; zachovat všechny rozpracované soubory.
2. Ověřit konec posledního exportního logu; případně spustit `npm.cmd run export` s Node 24 pouze pro tento proces.
3. Dokončit živou kontrolu katalogu, kalibračního dílku, úzkého rozložení a zrušení návrhu. Uložit výsledný screenshot do ignorovaného `.codex-run/`.
4. Zkontrolovat diff a případné hraniční případy náhledu/práce s profily; po opravách zopakovat jen dotčené testy a finální export.
5. Teprve poté změny označit jako dokončené; bez dalšího pokynu neposílat na GitHub ani WEDOS.

Lokální start: `start-local.cmd`, aplikace `http://127.0.0.1:3000/`. Procesní Node: `C:\Users\milan.spacek\AppData\Local\nvm\v24.21.0`.
