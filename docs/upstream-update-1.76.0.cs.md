# Aktualizace vlastní verze na Layerling 1.76.0

Dne 15. 10. 2026 byla do `codex/customizations` sloučena aktuální větev `henmedia/layerling:main`, commit `ac26a6d3b7b32ed2449d29493534e2b54a7f4cab`. Předchozí stav je ve větvi `codex/backup-custom-before-176-20261015`.

## Převzaté změny

- Náhled společné části těles před provedením průniku a zachování těles při prázdném výsledku.
- Přichytávání ke středu kružnice a protilehlému bodu při měření v řezu; rozlišení průměru Ø a poloměru R.
- Série posunů šipkami jako jeden krok historie ve 3D editoru i náčrtu.
- Výraznější zvýraznění hrany pod ukazatelem a slovinský překlad.
- Náš český překlad a příručka jsou nově také v původním projektu: [přijatý pull request #379](https://github.com/henmedia/layerling/pull/379).

## Zachované vlastní úpravy

LEGO generátor zachovává výchozí rám 7 × 5 s prázdným středem 5 × 3: nahoře a dole střídavě `oz oy oz oy oz oy oz`, na bočních stranách `ox`. Nadále má zapnutý 3D náhled, pouze vnější zaoblení 4 mm a vystředěný rastr. Více pater, nastavení jednotlivých buněk, směry otvorů, tolerance a tiskové profily zůstávají zachované.

Čeština zůstává výchozí, grafitový motiv i doména `3d.espide.eu` jsou zachované. Statický audit porovnal všech 134 vlastních překladových klíčů v češtině, angličtině a němčině; žádný se neztratil. Všechny odkazy a značky v 16 českých kapitolách odpovídají aktuální anglické příručce. Čeština má 2 521/2 521 textů. Další jazyky nadále používají anglický náhradní text pro naše LEGO rozšíření.

## Ověření

- **Statické/lokální:** TypeScript prošel; 2 160/2 161 unit testů a všech 30 testů skutečné LEGO geometrie prošlo. Jediná chyba je dříve zaznamenané očekávání cest ve Windows v `sharedProjectsCopy.test.ts`. Závislosti se nezměnily.
- Statický web se sestavuje v oddělené sestavovací kopii, protože Windows drží zámek kořenové složky původního exportu. Hotový výstup se kopíruje do `apps/web/.next-export/` při zachování samotné složky a případného `store` s projekty.
- **Prohlížeč:** ověřena verze 1.76.0, čeština a grafitový motiv; v LEGO generátoru přesný zadaný vzor, automaticky zapnutý 3D náhled, vnější zaoblení 4 mm a vystředění s odchylkou 0,5 px danou okrajem mřížky. Vytvoření tělesa 56 × 40 × 8 mm prošlo a konzole nehlásila chyby ani varování. Místní vývojový server byl znovu spuštěn s novou verzí.
- **Nasazení a fyzický tisk:** neprováděno. Pro WEDOS je určen obsah `apps/web/.next-export/`; složku `store` s projekty na serveru zachovejte.
