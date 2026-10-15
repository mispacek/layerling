# Český překlad připravený pro pull request

Ověřeno 15. 10. 2026 proti upstream verzi **1.75.0**, commit `bf95d765`.
Větev příspěvku: `codex/czech-localization`, aktualizační commit `abb674c9`.

- [Větev na GitHubu](https://github.com/mispacek/layerling/tree/codex/czech-localization)
- [Otevřít předvyplněný pull request do henmedia/layerling](https://github.com/henmedia/layerling/compare/main...mispacek:layerling:codex/czech-localization?expand=1&title=Add%20Czech%20translation%20and%20complete%20Czech%20user%20guide&body=%23%23%20Summary%0A%0A-%20Add%20complete%20Czech%20localization%20for%20layerling%201.75.0%3A%20all%202%2C381%20UI%20messages%2C%2016%20user-guide%20chapters%2C%20218%20release-note%20items%2C%20and%20translated%20contextual-help%20links.%0A-%20Register%20Czech%20as%20a%20lazy-loaded%20language%20with%20cs-CZ%20formatting.%20Preserve%20the%20existing%20default%20language%2C%20theme%2C%20and%20site%20identity.%0A-%20Include%20readable%20base-letter%20fallback%20for%20Czech%2FPolish%20characters%20unsupported%20by%20the%20drawing%20PDF's%20standard%20Helvetica.%20SVG%20retains%20full%20Unicode%3B%20no%20storage%2C%20import%2C%20grouping%2C%20or%20undo%20behavior%20changes.%0A-%20Keep%20this%20contribution%20focused%3A%20custom%20LEGO%20functionality%2C%20fork-specific%20defaults%2C%20hosting%20changes%2C%20and%20generated%20guide%20pages%20are%20excluded.%0A%0A%23%23%20Testing%0A%0A-%20%5Bx%5D%20%60npm%20run%20typecheck%60%0A-%20%5Bx%5D%20%60npm%20run%20i18n%3Astatus%60%3A%20Czech%202%2C381%2F2%2C381%20messages%20and%2016%2F16%20chapters%2C%20no%20problems.%0A-%20%5Bx%5D%20%60npm%20run%20guide%60%20and%20%60npm%20run%20export%60%2C%20including%20both%20static%20CAD%20worker%20runtime%20checks.%0A-%20%5Bx%5D%2086%20focused%20locale%2Fguide%2Fdrawing%2Ffont%20tests.%0A-%20%5Bx%5D%20Manually%20verified%20CS%20%E2%86%92%20EN%20%E2%86%92%20CS%2C%20translated%201.75.0%20release%20notes%2C%20and%20updated%20Czech%20sketch-guide%20content%20in%20the%20browser.%0A-%20Full%20unit%20suite%3A%202%2C057%2F2%2C058%20pass.%20The%20existing%20%60sharedProjectsCopy%60%20Windows%20path%20expectation%20fails%20(%60Halterungen%60%20versus%20a%20relative%20temporary%20path)%3B%20the%20affected%20test%20and%20implementation%20are%20unchanged%20by%20this%20contribution.%0A-%20Audited%20all%2016%20chapters'%20UI%2Fvalue%2Fimage%2Fchapter%20references%20and%20verified%20that%20all%20non-Czech%20release-note%20fields%20are%20unchanged.%0A%0A%23%23%20Notes%0A%0AThe%20Czech%20UI%20originates%20in%20our%20maintained%20Czech-language%20fork.%20The%20guide%20and%20update%20preparation%20used%20AI%20assistance%20with%20contextual%20terminology%20review.%20Independent%20second%20native-speaker%20proofreading%20has%20not%20been%20completed%3B%20corrections%20and%20review%20are%20welcome.%0A)
- [Porovnat změny s původním repozitářem](https://github.com/henmedia/layerling/compare/main...mispacek:layerling:codex/czech-localization)

Po přihlášení na GitHub zkontrolujte předvyplněný název a popis a zvolte **Create pull request**. Při předchozím pokusu GitHub konektor vytvoření v původním repozitáři odmítl chybou 403. Tento dokument neznamená, že už pull request vznikl.

Příspěvek obsahuje 2 381 textů rozhraní, všech 16 kapitol příručky, 218 položek novinek a kontextovou nápovědu. Příručka odpovídá změnám 1.73.0–1.75.0 včetně PNG/JPG, rozšířené čáry při rotaci, nových ovladačů náčrtu, posunu po 0,01 mm a ukládání STL pod jiným názvem. Závislosti se nezměnily.

## Jak správně založit pull request

1. Přihlaste se na GitHub jako **mispacek** a otevřete výše uvedený odkaz **Otevřít předvyplněný pull request do henmedia/layerling**.
2. Nad porovnáním zkontrolujte následující nastavení. Pokud všechna pole nevidíte, použijte **compare across forks**.

   | Pole na GitHubu | Správná hodnota |
   | --- | --- |
   | base repository | `henmedia/layerling` |
   | base | `main` |
   | head repository / head fork | `mispacek/layerling` |
   | compare | `codex/czech-localization` |

3. Prohlédněte si změněné soubory. Příspěvek má obsahovat české texty, příručku, zapojení češtiny a související testy či opravu textu v PDF. Větev `codex/customizations` pro tento pull request **nevybírejte**: obsahuje i naše vlastní LEGO funkce a nastavení webu.
4. Pokud stránka nejprve nabízí **Create pull request**, klikněte na něj pro otevření formuláře. Název má být **Add Czech translation and complete Czech user guide**. Předvyplněný popis porovnejte s částí **Text pull requestu** níže; pokud chybí, zkopírujte jej odtud. Ponechte informaci o jediném neprocházejícím testu ve Windows a o dosud neprovedené druhé jazykové korektuře.
5. Zkontrolujte, zda GitHub nehlásí konflikty. Pokud ano, před odesláním je potřeba aktualizovat příspěvkovou větev proti původnímu `main` a konflikty vyřešit. Neřešte je přepnutím na naši větev s LEGO.
6. Tlačítkem **Create pull request** ve formuláři odešlete hotový příspěvek ke kontrole. Po odeslání musí vzniknout stránka s adresou ve tvaru `https://github.com/henmedia/layerling/pull/číslo` a stavem **Open**. Pokud GitHub místo toho nabídne již existující pull request stejné větve, otevřete jej; další nezakládejte.
7. Správce původního projektu může požádat o opravy. Ty se commitnou a nahrají do stejné větve `codex/czech-localization`; otevřený pull request se tím automaticky aktualizuje. Přijetí a sloučení do původního projektu provádí jeho správce. Větev ponechte dostupnou do dokončení kontroly.

Samotné nahrání větve na náš GitHub ještě pull request nevytvoří. Tento postup odpovídá [návodu GitHubu pro příspěvek z forku](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request-from-a-fork).

## Rozsah a ověření

- Příspěvek je v samostatném pracovním adresáři `C:/xampp/htdocs/layerling-upstream-cs`.
- Hlavní větev `codex/customizations` s LEGO funkcemi a její aplikace se v tomto kroku neaktualizovaly. Tento dokument zaznamenává stav samostatného příspěvku.
- Statické/lokální: TypeScript, překlady, generování příručky, statický export a 86 zaměřených testů prošly. Celá unit sada: 2 057/2 058; zbývá dříve zaznamenaná chyba cest ve Windows v sharedProjectsCopy.
- Prohlížeč: ověřeno přepínání CS → EN → CS, české novinky 1.75.0 a aktualizované části příručky k náčrtům.
- Nasazení na WEDOS a fyzický tisk: neprováděno.
- Nezávislá druhá jazyková korektura rodilým mluvčím ještě neproběhla.

## Text pull requestu

## Summary

- Add complete Czech localization for layerling 1.75.0: all 2,381 UI messages, 16 user-guide chapters, 218 release-note items, and translated contextual-help links.
- Register Czech as a lazy-loaded language with cs-CZ formatting. Preserve the existing default language, theme, and site identity.
- Include readable base-letter fallback for Czech/Polish characters unsupported by the drawing PDF's standard Helvetica. SVG retains full Unicode; no storage, import, grouping, or undo behavior changes.
- Keep this contribution focused: custom LEGO functionality, fork-specific defaults, hosting changes, and generated guide pages are excluded.

## Testing

- [x] `npm run typecheck`
- [x] `npm run i18n:status`: Czech 2,381/2,381 messages and 16/16 chapters, no problems.
- [x] `npm run guide` and `npm run export`, including both static CAD worker runtime checks.
- [x] 86 focused locale/guide/drawing/font tests.
- [x] Manually verified CS → EN → CS, translated 1.75.0 release notes, and updated Czech sketch-guide content in the browser.
- Full unit suite: 2,057/2,058 pass. The existing `sharedProjectsCopy` Windows path expectation fails (`Halterungen` versus a relative temporary path); the affected test and implementation are unchanged by this contribution.
- Audited all 16 chapters' UI/value/image/chapter references and verified that all non-Czech release-note fields are unchanged.

## Notes

The Czech UI originates in our maintained Czech-language fork. The guide and update preparation used AI assistance with contextual terminology review. Independent second native-speaker proofreading has not been completed; corrections and review are welcome.
