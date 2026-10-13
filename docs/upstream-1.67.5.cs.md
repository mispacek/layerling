# Aktualizace upstreamu na 1.67.5 – 13. 10. 2026

Sloučen upstream `henmedia/layerling`, commit `8aa8d8e301cc463982f3012d135237042a833e4c`.
Rozpracované LEGO změny byly před mergem uložené v commitu `bb25d8e1` a záložní větvi `codex/backup-before-1675`.

- Převzat nový jazykový registr, přepínač s rozbalovací nabídkou, vyhledávání v příručce a ostatní změny upstreamu.
- Čeština zůstává výchozí a je dostupná při serverovém vykreslení i bez dodatečného načítání. Zachován grafitový motiv, české formátování čísel a metadata pro `3d.espide.eu`.
- Přeloženo 28 nových textů rozhraní a novinky vydání 1.67.0–1.67.5. Odstraněny dva zrušené klíče a upraveny překlady změněných textů. Rozhraní má všech 2414 klíčů a shodné zástupné proměnné.
- Česká příručka `/prirucka/` má české ovládání; její 16 nepřeložených kapitol přebírá označený anglický obsah. Proto má registr `complete: false`, ale testy stále vyžadují úplný český překlad rozhraní.
- LEGO generátor, předlohy, rozměrové profily, kalibrace, zaoblení a ukládání zůstaly zachované. Aktualizace sama neoznačuje rozpracovanou druhou LEGO etapu za dokončenou.

## Ověření

- TypeScript a statický export prošly; ověřeny oba CAD workery. Výstup pro běžný webhosting je obsah `apps/web/.next-export/`.
- `npm run i18n:status`: CS i DE mají 2414/2414 textů, bez neznámých klíčů, prázdných textů a rozdílů ve zástupných proměnných.
- Jednotkové testy: 1939/1940 prošlo. Známý pád `sharedProjectsCopy.test.ts` na Windows byl přítomný už před aktualizací.
- 60 cílených testů reálné geometrie prošlo: LEGO, velikosti otvorů, vytváření dutin a propojení profilů.
- Staticky ověřena canonical/Open Graph/Twitter metadata pro `3d.espide.eu`; příručka má rovněž canonical odkazy na naši doménu.
- V živém statickém náhledu `http://127.0.0.1:3001/`: české výchozí rozhraní a Graphite, přepínání CS/EN/DE, LEGO generátor, vytvoření kalibračního tělesa a opětovná editace po obnovení stránky. Bez zaznamenaných chyb v konzoli.
- Screenshot: ignorovaný `.codex-run/layerling-1675-lego.png`. Logy: `node_modules/upstream-1675-unit.log` a `node_modules/upstream-1675-export.log`.
- Fyzický tisk, skutečný WEDOS hosting a offline obnovení nebyly ověřeny. Aktualizace nebyla odeslaná na GitHub ani WEDOS.

Automatická kontrola zamítla restart existujícího vývojového serveru na portu 3000 bez konkrétního důvodu. Je nutné jej ručně znovu spustit pomocí `start-local.cmd`; poslední browserové ověření proto použilo samostatný statický náhled.
