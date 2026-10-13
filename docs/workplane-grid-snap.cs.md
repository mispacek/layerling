# Mřížka hlavní pracovní plochy podle přichytávání

Rozteč mřížky v 3D editoru nyní sleduje **Krok přichytávání**. Volba **Lego** znamená 8 mm; fungují také kroky 0,1 / 0,25 / 0,5 / 1 / 2 / 5 mm, palcové kroky a vlastní pojmenované rozměry včetně jejich polovin a čtvrtin.

V **Nastavení pracovní plochy → Pracovní rovina** je zapnutá volba **Mřížka podle přichytávání**. Její vypnutí vrátí ručně nastavenou velikost buňky mřížky. Původní pevná velikost zůstává uložená, automatický režim ji nepřepisuje. Při kroku **Vypnuto** se rovněž používá tato pevná mřížka. Volba se ukládá s projektem; starší projekty bez ní používají automatický režim.

Čáry se počítají od počátku pracovní roviny. Při příliš hustém rastru se zobrazují jen celočíselné násobky kroku; přibližování jemné čáry obnovuje. Odstup viditelných čar u středu pohledu je nejméně přibližně 4 pixely. Tmavší čáry nadále leží na původních zvýrazněných násobcích, včetně celých palců. Pro velmi jemné vlastní kroky je množství vykreslené geometrie omezené přibližně na 2 000 čar v jednom směru. Toto ředění nemění přesnost přichytávání ani polohy těles.

Příkaz **Přichytit k mřížce** používá stejnou základní rozteč. Náčrt a rastr uvnitř LEGO editoru mají dál vlastní kreslicí pravidla. Plocha, barvy, osy, obrys podložky a nastavení silnějších čar zůstávají součástí dosavadního vykreslování.

Opravena také ochrana před zpětným přepisem načteného nastavení: změna z dialogu je uživatelský zásah a musí se uložit stejně jako výběr kroku v nabídce. Nesmí být potlačena jako pouhé načtení projektu.

## Ověření

Staticky/lokálně: finálních 109 cílených testů mřížky, přichytávání, nastavení, projektového formátu a překladů prošlo. Poslední celá jednotková sada po opravě ukládání (před konečným zvýšením odstupu čar): 1 987/1 988; jediný pád je známý Windows test sdílených projektů `sharedProjectsCopy.test.ts`. Finální TypeScript a export včetně CAD workerů prošly, otisk `bb0a3419d4f2d150`. Logy jsou v ignorovaných `node_modules/grid-follow-snap-{unit,export}.log`.

Živě ověřeno v samostatném projektu **Ověření mřížky a přichytávání** na `http://127.0.0.1:3001/`: Lego 8 mm, 1 mm, jemný rastr 0,25 mm s přibližováním, pevná mřížka 10 mm při kroku 1 mm a při vypnutém přichytávání. Vypnutí automatického režimu a pevná velikost přežily obnovení stránky; obnovil se i zvolený krok 0,25 mm. Náhled v perspektivě i pohledu shora funguje, konzole bez chyb. Výsledný screenshot je v ignorovaném `.codex-run/grid-follow-snap.png`.

Nasazení na WEDOS a offline obnovení nebyly ověřeny. Změny jsou pouze v lokálním repozitáři.
