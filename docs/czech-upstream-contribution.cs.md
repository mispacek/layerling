# Český překlad pro původní Layerling

Připraveno proti upstream `edaad2dd` (1.72.3), commit `7e6c0810`.

- Větev: [mispacek/layerling — codex/czech-localization](https://github.com/mispacek/layerling/tree/codex/czech-localization)
- [Otevřít předvyplněný pull request do henmedia/layerling](https://github.com/henmedia/layerling/compare/main...mispacek:layerling:codex/czech-localization?expand=1&title=Add%20Czech%20translation%20and%20complete%20Czech%20user%20guide&body=Adds%20Czech%20as%20a%20complete%2C%20selectable%20language%2C%20following%20docs%2FTRANSLATING.md.%0A%0A-%20Translates%20all%202%2C365%20current%20UI%20messages%20and%20195%20release-note%20entries.%0A-%20Adds%20all%2016%20Czech%20user-guide%20chapters%2C%20shared%20screenshots%2C%20printable%20guide%2C%20and%2053%20translated%20contextual-help%20anchors.%0A-%20Registers%20cs-CZ%20formatting%20and%20lazy-loaded%20messages.%20The%20existing%20English%20default%2C%20theme%2C%20and%20site%20identity%20are%20unchanged.%0A-%20Includes%20a%20small%20drawing-PDF%20fallback%20for%20Czech%2FPolish%20letters%20unsupported%20by%20standard%20Helvetica%3A%20unsupported%20accents%20become%20readable%20base%20letters%20instead%20of%20question%20marks.%20SVG%20preserves%20full%20Unicode.%0A-%20Adds%20locale%2Fguide%20coverage%2C%20Czech%20font%20coverage%20in%20all%20seven%20built-in%20faces%2C%20and%20SVG%2FPDF%20regression%20checks.%0A%0AThis%20contribution%20was%20extracted%20from%20our%20maintained%20Czech-language%20fork.%20Custom%20LEGO%20features%2C%20local%20defaults%2C%20and%20hosting%20changes%20are%20excluded.%20Generated%20guide%20HTML%20is%20not%20committed.%0A%0AValidation%3A%0A-%20TypeScript%2C%20translation-status%20checks%20(2%2C365%2F2%2C365%20messages%3B%2016%2F16%20chapters)%2C%20guide%20generation%2C%20and%20static%20export%20pass.%0A-%20All%2080%20focused%20tests%20pass.%0A-%20Full%20unit%20suite%3A%201%2C984%2F1%2C985%20pass.%20The%20remaining%20sharedProjectsCopy%20test%20is%20an%20existing%20Windows%20path%20expectation%20failure%2C%20unrelated%20to%20localization.%0A-%20Browser%20verification%3A%20switching%20CS%20%E2%86%92%20EN%20%E2%86%92%20CS%2C%20translated%20guide%20chapter%2C%20and%20the%20combined%2016-chapter%20print%20page.%0A%0ATranslation%20note%3A%20the%20Czech%20UI%20comes%20from%20our%20Czech-speaking%20user's%20maintained%20fork%3B%20the%20completed%20guide%20and%20contribution%20preparation%20used%20AI%20assistance%20with%20contextual%20terminology%20review.%20Independent%20second%20native-speaker%20proofreading%20has%20not%20been%20completed%3B%20corrections%20and%20review%20are%20welcome.)

Větev je odeslaná na GitHub. Pull request zatím nevznikl: GitHub konektor odmítl vytvoření v původním repozitáři chybou 403 (Resource not accessible by integration). Prohlížeč Codexu nemá přihlášení ke GitHubu a ovládání Chrome je aktuálně nedostupné. Po přihlášení otevřete odkaz výše, zkontrolujte formulář a zvolte **Create pull request**.

Příspěvek obsahuje 2 365 položek rozhraní, 16 úplných kapitol příručky, 195 položek novinek a 53 odkazů na sekce příručky. Obsahuje také testy a malou úpravu čitelného náhradního zápisu znaků při exportu PDF. LEGO rozšíření, naše výchozí nastavení a vlastní doména nejsou součástí příspěvku.

Dokončená česká příručka je zároveň přidána do naší vlastní verze. Její výchozí čeština, grafitové téma a LEGO funkce zůstávají zachovány.

## Ověření

- TypeScript, stav překladů, generování příručky a statický export: prošly.
- Zaměřené testy příspěvku: 80/80; lokální příručky: 60/60.
- Celá unit sada příspěvku: 1 984/1 985; zbývá dříve existující chyba očekávání cest ve Windows v sharedProjectsCopy.
- Prohlížeč: přepnutí CS → EN → CS, česká kapitola a společná tisková stránka všech 16 kapitol.
- Neproběhlo nahrání na WEDOS ani fyzický tisk.
- Nezávislá druhá jazyková korektura rodilým mluvčím ještě neproběhla.

## Text pull requestu

Adds Czech as a complete, selectable language, following docs/TRANSLATING.md.

- Translates all 2,365 current UI messages and 195 release-note entries.
- Adds all 16 Czech user-guide chapters, shared screenshots, printable guide, and 53 translated contextual-help anchors.
- Registers cs-CZ formatting and lazy-loaded messages. The existing English default, theme, and site identity are unchanged.
- Includes a small drawing-PDF fallback for Czech/Polish letters unsupported by standard Helvetica: unsupported accents become readable base letters instead of question marks. SVG preserves full Unicode.
- Adds locale/guide coverage, Czech font coverage in all seven built-in faces, and SVG/PDF regression checks.

This contribution was extracted from our maintained Czech-language fork. Custom LEGO features, local defaults, and hosting changes are excluded. Generated guide HTML is not committed.

Validation:
- TypeScript, translation-status checks (2,365/2,365 messages; 16/16 chapters), guide generation, and static export pass.
- All 80 focused tests pass.
- Full unit suite: 1,984/1,985 pass. The remaining sharedProjectsCopy test is an existing Windows path expectation failure, unrelated to localization.
- Browser verification: switching CS → EN → CS, translated guide chapter, and the combined 16-chapter print page.

Translation note: the Czech UI comes from our Czech-speaking user's maintained fork; the completed guide and contribution preparation used AI assistance with contextual terminology review. Independent second native-speaker proofreading has not been completed; corrections and review are welcome.
