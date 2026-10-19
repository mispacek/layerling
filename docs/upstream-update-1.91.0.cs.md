# Aktualizace vlastní verze na Layerling 1.91.0

Dne 19. 10. 2026 byla větev `codex/customizations` aktualizována podle `henmedia/layerling:main`. Poslední převzatý commit je `f211ed3139b6d4128be70b85239e9ca60f782dca`. Zahrnuje vydání 1.91.0 i následné opravy orientační krychle, složitých náčrtů a exportu drobných písmen. Sloučení zachycují commity `6da5a4a2` a `a98495ec`.

Předchozí stav 1.81.0 včetně optimalizace mřížky zachovává větev `codex/backup-custom-before-191-20261019`.

## Převzaté změny

- Nová přesouvatelná, připínatelná a rozměrově nastavitelná nabídka tvarů; složky projektů a vlastních tvarů.
- QR kódy, boxy a základny Gridfinity, další možnosti úprav hran, mazání ploch a práce s historií.
- Opravy importu, exportu, dotykového ovládání, náčrtů, rozměrů otočených těles a rychlosti práce s velkými modely.
- Nastavitelná poloha orientační krychle, přímé přepínání jednotek, interaktivní nápověda a nová kapitola o tabletech.
- Další jazykové balíčky a japonské písmo načítané podle potřeby.

Přibyly místní závislosti `qrcode-generator` a testovací `jsqr`. Globální Node.js a npm ani jiné aplikace v `C:\xampp\htdocs` nebyly upravovány.

## Zachované vlastní úpravy

- Výchozí čeština, grafitový motiv, styly LEGO editoru a metadata i kanonické odkazy domény `3d.espide.eu`.
- Všech 134 vlastních překladových klíčů v češtině, angličtině i němčině. Český balíček má všech 2 832 textů a příručka všech 17 kapitol. Doplněna jsou česká shrnutí 106 nových nebo změněných karet novinek; starší české karty zůstaly zachované.
- Zdroje LEGO generátoru a jeho předloh se nezměnily. Výchozí dílek zůstává rám 7 × 5 s prázdným středem, střídáním `oz oy oz oy oz oy oz` nahoře a dole a `ox` na bocích. Zachované je vnější zaoblení 4 mm, zapnutý 3D náhled, vystředění, patra, typy a směry otvorů, tolerance, tiskové profily i opětovná úprava předlohy.
- V nabídce tvarů a místní nabídce těles zůstává přístup k LEGO generátoru. Zachované je také přesměrování zaoblení upravitelných LEGO dílků do jejich generátoru.
- Mřížka sleduje přichytávání a nadále používá adaptivní hustotu, vynechání podpixelových pásů a jediný průchod vykreslení plochých průhledných pásů. Přesnost přichytávání se nemění.

Konflikty byly vyřešeny spojením nových importů a ovládání s vlastními doplňky. Generovaná mapa webu se podle nového upstreamu již nesleduje v Gitu; sestavení ji vytváří pro naši doménu. Byly opraveny odkazy na příručky v italštině a turečtině. Testy s anglickými textovými předlohami si nastavují angličtinu výslovně, zatímco aplikace nadále začíná česky.

## Ověření

- **Statické/lokální:** TypeScript prošel a kontrola překladů je bez problémů. Z 2 637 unit testů prošlo 2 636; jediná chyba je dříve zaznamenané očekávání cest ve Windows v `sharedProjectsCopy.test.ts`. Všech 81 testů skutečné geometrie v osmi sadách pro LEGO, Gridfinity, zahloubení, náčrty, úpravy hran a vícebarevné sloučené celky prošlo. Kontroly byly zopakovány i po převzetí posledních dvou oprav upstreamu.
- **Prohlížeč:** ověřena verze 1.91.0, čeština, grafitový motiv a dostupnost LEGO, QR kódů i Gridfinity v nové nabídce. LEGO generátor má 20 buněk, náhled zapnutý, vnější zaoblení 4 mm a odchylku vystředění 0,5 px v obou směrech. Vytvoření tělesa 56 × 40 × 8 mm, uložení běžného testovacího projektu, jeho opětovné otevření a návrat do upravitelné LEGO předlohy přes Zaoblení prošly. Ověřen je i krok 0,1 mm. Konzole nehlásila chyby ani varování. Nové měření FPS nebylo součástí aktualizace.
- **Nasazení a fyzický tisk:** neprováděno. Místní kontrola exportu není potvrzením nasazení na WEDOS ani kontroly vytištěného dílu.

## Výstup pro webhosting

Aktuální export je v `apps/web/.next-export/`, verze 1.91.0, sestavení `9bdd48c5d19c3c60`. Service worker eviduje 464 souborů pro offline použití. Ověřeny jsou také oba statické CAD workery.

Kvůli dříve zjištěnému zámku exportní složky ve Windows proběhlo sestavení v oddělené kopii a výstup byl přenesen do hlavní složky. Kontrola SHA-256 potvrdila shodu `index.html`, `sw.js` a `version.json`. Na WEDOS se nahrává obsah `.next-export`; případný serverový adresář `store` s projekty zachovejte.
