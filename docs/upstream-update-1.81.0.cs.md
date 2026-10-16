# Aktualizace vlastní verze na Layerling 1.81.0

Dne 16. 10. 2026 byla do větve `codex/customizations` sloučena aktuální větev `henmedia/layerling:main`, commit `271cf8463e4a2f94c588dafaec7f49473d41df2f`. Záložní větev `codex/backup-custom-before-181-20261016` zachovává předchozí stav včetně poslední optimalizace mřížky. Samotné sloučení je v commitu `356fb5e8`.

## Převzaté změny

- Nástroj Plocha pro přidávání materiálu nebo vytváření kapsy na rovné ploše tělesa.
- Tažení náčrtu podél dráhy s přesnou CAD geometrií, oboustranné kuželové zahloubení a další úpravy náčrtů a tvarů.
- Samostatná obnova záloh, zachování historie při opětovném načtení a opravy importu SVG, OBJ a obrázků.
- Vynechávání drobných oddělených úlomků při exportu, vyšší limit 2D výkresu, opravy kót a možnost zadat polohu nad 220 mm.
- Nové maďarské a dánské překlady a rozšíření MCP o export tiskových formátů.

Závislosti se nezměnily; v `package.json` a lockfile se mění pouze verze aplikace. Globální instalace Node.js a npm nebyla upravována.

## Zachované vlastní úpravy

- Výchozí čeština a grafitový motiv, metadata a kanonické odkazy pro `https://3d.espide.eu`.
- Všech 134 vlastních překladových klíčů v češtině, angličtině i němčině. Čeština má všech 2 587 textů a všech 16 kapitol příručky; doplněno je také 29 českých karet novinek.
- Zdroje LEGO generátoru se při sloučení nezměnily. Zůstává rám 7 × 5 s prázdným středem, vzorem `oz oy oz oy oz oy oz` nahoře a dole a `ox` na bocích, vnějším zaoblením 4 mm, zapnutým 3D náhledem a vystředěním. Zachované jsou také patra, jednotlivé typy a směry otvorů, tiskové tolerance a vlastní profily.
- Mřížka nadále sleduje přichytávání a zachovává poslední optimalizaci: neviditelné podpixelové pásy se nevytvářejí a ploché průhledné pásy nepotřebují dvojí vykreslení. Přesnost přichytávání se nemění.

Konflikty byly vyřešeny v importech editoru, registru jazyků, české nápovědě řezu a generované mapě webu. U nových jazyků byly opraveny odkazy z úvodní stránky na jejich vlastní příručky. Pro naše dosud nepřeložené LEGO doplňky používají nové jazyky anglický náhradní text.

## Ověření

- **Statické/lokální:** TypeScript prošel, kontrola překladů je bez problémů a sestavení příručky vytvořilo 154 stránek. Z 2 255 unit testů prošlo 2 254. Jediná chyba je už dříve zaznamenané očekávání cest ve Windows v `sharedProjectsCopy.test.ts`; aktualizace ji nezpůsobila. Všech 53 testů skutečné geometrie ve čtyřech sadách pro LEGO dílky, zahloubení, tažení náčrtu a odsazení ploch prošlo.
- **Prohlížeč:** ve statickém exportu ověřena verze 1.81.0, čeština, grafitový motiv, výchozí LEGO vzor, vnější zaoblení 4 mm a automaticky zapnutý 3D náhled. Odchylka středu dílku od středu kreslicí plochy je 0,5 px v obou směrech. Vytvoření tělesa 56 × 40 × 8 mm, krok přichytávání 0,1 mm a otevření nového českého panelu Plocha prošly. Konzole nehlásila chyby ani varování. Nové měření FPS nebylo součástí této aktualizace.
- **Nasazení a fyzický tisk:** neprováděno. Export byl ověřen místně; nejedná se o kontrolu WEDOS ani vytištěného dílku.

## Soubory pro webhosting

Aktuální výstup je v `apps/web/.next-export/`. Service worker obsahuje 331 souborů a identifikátor sestavení je `137adeb937d8c884`. Při nahrávání na WEDOS použijte obsah této složky a zachovejte případný serverový adresář `store` s uloženými projekty.

Kvůli dříve zjištěnému zámku exportní složky ve Windows se web sestavil v oddělené místní kopii. Výstup se následně zkopíroval do hlavního exportu při zachování jeho kořenové složky a `store`; shoda `index.html`, `sw.js` a `version.json` byla ověřena pomocí SHA-256.
