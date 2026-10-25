# Aktualizace vlastní verze na Layerling 1.111.0

Dne 25. 10. 2026 byla větev `codex/customizations` spojena s aktuálně staženou větví `henmedia/layerling:main`, commit `8615a3d8c44c45cb41c50e2db18914dcabc2aeb8`. Původní stav zachovává záložní větev `codex/backup-custom-before-update-20261025`.

## Zachované úpravy

- Výchozí čeština a grafitový motiv, vlastní metadata a odkazy domény `3d.espide.eu`.
- Všech 134 vlastních překladových položek v češtině, angličtině a němčině. Čeština má 3 182 z 3 182 položek rozhraní a 17 ze 17 kapitol příručky.
- Všech 17 souborů LEGO generátoru, jeho geometrie, šablon a souvisejících testů zůstalo obsahově shodných. Zachované jsou patra, směry otvorů, tiskové tolerance, per-buňkové zaoblení a předloha rámu 7 × 5 s vnějšími rohy 4 mm, zapnutým náhledem a vystředěním.
- Zachováno opětovné otevření LEGO předlohy přes Zaoblení a nabídku tělesa.
- Adaptivní mřížka podle přichytávání, vynechávání podpixelových pásů a jeden průchod průhledných pásů.
- Zachované jsou dosavadní české karty novinek; přibylo 165 českých shrnutí dalších karet.

Upstream rozdělil velké komponenty na menší soubory. LEGO nabídka byla proto přenesena do `SecondaryToolbar.tsx` a úpravy vykreslování mřížky do `viewportScene.ts`. Zpřístupněna zůstává i nová zjednodušená nabídka upstreamu. Skript určující jazyk stránky před spuštěním Reactu používá stejné výchozí nastavení češtiny jako aplikace; uložený jiný jazyk má přednost.

## Převzaté novinky

Aktualizace obsahuje nové možnosti Gridfinity, import a export DXF, přílohy projektů, obal těles, společnou osu otvorů a čepů, referenční obrázky, další nástroje náčrtu a opravy ukládání, importu, exportu i odezvy velkých modelů. Místní závislosti byly aktualizovány podle upstreamu, včetně `brepjs` 20.10.3 a OCCT WASM 5.8.0. Globální Node.js ani Blockly/Electron se neměnily.

## Ověření

- **Statické/lokální:** TypeScript a kontrola překladů prošly. Z 3 297 jednotkových testů prošlo 3 295. Dvě chyby se týkají výpočtu relativních serverových cest ve Windows v `sharedProjectsCopy.test.ts` a `sharedProjectsExportFile.test.ts`; očekává se složka projektu, vrací se cesta přes dočasný adresář. Anglické testovací předlohy si nyní nastavují jazyk výslovně. Všech 150 testů skutečné geometrie v devíti vybraných sadách prošlo, včetně LEGO, zaoblování, Gridfinity, náčrtů a skupin.
- **Živý prohlížeč:** statický export 1.111.0 otevřel uložený testovací LEGO projekt z verze 1.91.0; Zaoblení znovu otevřelo jeho předlohu. Ověřeny výchozí hodnoty nového generátoru: 20 buněk, 56 × 40 × 8 mm, vnější zaoblení 4 mm a zapnutý náhled. Vystředění má odchylku 0,5 px v obou směrech. Z nové nabídky vzniklo těleso v novém uloženém projektu; zvolen krok přichytávání 0,1 mm. Konzole bez chyb a varování. Nové měření FPS ani úplný offline test nebyly provedeny.
- **Nasazení/fyzický tisk:** neprováděno. Kontrola místního exportu nepotvrzuje nasazení na WEDOS ani rozměry vytištěného dílu.

## Export pro webhosting

Obsah `apps/web/.next-export/` je připravený pro nahrání do kořene subdomény. Verze 1.111.0, sestavení `3ad8ca34f27e0532`, 559 souborů v seznamu service workeru a tři ověřené statické worker runtime. Sestavení proběhlo v existující oddělené pracovní kopii kvůli dřívějšímu zámku exportní složky; hlavní export byl aktualizován a SHA-256 souborů `index.html`, `sw.js` a `version.json` porovnán.

Při nahrávání zachovejte serverový adresář `store` s daty projektů. Nahrajte také aktuální `store.php` a přiložené soubory `.htaccess`: upstream upravil ověřování exportních souborů a ochranu přímého přístupu k úložišti. Není potřeba měnit globální instalaci Node.js ani přidávat Node na PHP hosting.
