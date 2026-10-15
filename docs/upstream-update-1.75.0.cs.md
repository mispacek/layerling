# Aktualizace vlastní verze na Layerling 1.75.0

Dne 15. 10. 2026 byla do větve `codex/customizations` sloučena aktuální větev `henmedia/layerling:main`, commit `bf95d7659ced8f0bcdfbd854eb8112af3eba392c`. Předchozí stav je zachován ve větvi `codex/backup-custom-before-175-20261015`.

## Zachované vlastní funkce

- LEGO generátor, více pater, editovatelné předlohy, natočení otvorů a nástroje výběru, přidávání, odebírání a nastavení.
- Vnější, vnitřní i kombinované zaoblení jednotlivých buněk; výchozí poloměr 4 mm.
- Přizpůsobování mřížky kroku přichytávání, označení Lego a vlastní ikony.
- Čeština jako výchozí jazyk, grafitové téma a metadata pro `3d.espide.eu`.

Byly přeneseny také doplněné české texty a kapitoly příručky z příspěvkové větve. Čeština nyní pokrývá všech 2 515 položek naší rozšířené verze a všech 16 kapitol. Nově dostupná francouzština a ruština pro naše LEGO položky používají anglický náhradní text, stejně jako nizozemština a polština; nejsou proto označeny jako úplné překlady vlastní verze.

Generované polské stránky příručky se podle nového upstreamu již nesledují v Gitu. Sestavení je nadále vytváří. Opravena byla i upstreamová francouzská adresa příručky na `/guide-fr/index.html`.

## Ověření

- **Statické/lokální:** TypeScript, generování 103 stránek příručky a statický export prošly. Ověřeny oba CAD workery. Celá unit sada: 2 143/2 144 testů; jediná chyba je dříve zaznamenané očekávání cest ve Windows v `sharedProjectsCopy.test.ts`. Kód tohoto testu ani serverového kopírování tato aktualizace nemění oproti upstreamu.
- **Prohlížeč:** na čistém místním originu ověřena výchozí čeština a grafitový motiv, otevření projektu a LEGO generátoru, duplikace patra, nastavení vnějšího i vnitřního zaoblení s poloměrem 4 mm a vytvoření tělesa 56 × 40 × 16 mm. Během kontroly nebyly v konzoli chyby ani varování. Ověřena dostupnost lokálního modulu OCCT 5.7.1 (HTTP 200).
- **Nasazení a fyzický tisk:** neprováděno. Skutečný tisk, úplný offline cyklus a všechny kombinace starších uživatelských projektů nebyly ověřeny.

## Soubory pro webhosting

Připravený statický web je v `apps/web/.next-export/`. Na hosting se nahrává **obsah této složky**, včetně `_next`, `occt`, příruček a ostatních podsložek. Serverovou složku `store` s uživatelskými projekty zachovejte. Tato aktualizace sama na WEDOS nic nenahrává.

Samostatná větev `codex/czech-localization` pro český pull request zůstává oddělená od naší vlastní větve s LEGO funkcemi. Postup jejího odeslání popisuje [návod k pull requestu](czech-upstream-contribution.cs.md).
