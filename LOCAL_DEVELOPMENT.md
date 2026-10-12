# Vlastni upravy Layerlingu

Tento adresar je samostatny Git repozitar s uplnou historii puvodniho projektu.
Remote `upstream` smeruje na https://github.com/henmedia/layerling.git.
Vlastni upravy patri do vetve `codex/customizations`; `main` je vychozi upstream.

## Lokalni spusteni

Na tomto pocitaci spustte `start-local.cmd`. Pouzije Node.js 24.21.0 z NVM,
bez globalniho prepnuti verze pro Blockly nebo Electron. Otevrete
http://127.0.0.1:3000/. Server ukoncite klavesami Ctrl+C v jeho okne.
Pokud jiz bezi server na portu 3000, nejprve jej ukoncete.

## Prebirani zmen puvodniho projektu

Nejprve ulozte vlastni rozpracovane zmeny do commitu a overte cisty `git status`.
Potom zastavte vyvojovy server a v tomto adresari provedte:

```powershell
git switch codex/customizations
git fetch upstream --tags
git merge upstream/main
```

Pro prebirani pouze vydane verze misto celeho `main` pouzijte konkretni tag,
napriklad `git merge v1.66.2`. Pripadne konflikty opravte, zkontrolujte diff
a dokoncete merge commitem. Nedokonceny merge lze zrusit `git merge --abort`.

Instalaci a kontrolu po aktualizaci spoustejte pod Node.js 24:

```powershell
npm.cmd ci
npm.cmd run typecheck
npm.cmd run test
npm.cmd run export
```

Pro nahrani na hosting pouzijte obsah `apps/web/.next-export/`.
Pokud pouzivate serverove uloziste `store`, pri aktualizaci ho zachovejte.

## Vlastni vzdaleny repozitar

Remote `origin` zatim neni nastaveny. Az vytvorite vlastni fork/repozitar,
pridejte jeho skutecnou adresu:

```powershell
git remote add origin https://github.com/VAS_UCET/VAS_REPOZITAR.git
git push -u origin codex/customizations
```

Podle licence AGPL zpristupnete odpovidajici zdrojovy kod upravene verze.
Pri sestaveni nastavte `NEXT_PUBLIC_SOURCE_CODE_URL` na verejnou adresu
svych zdroju; puvodni odkaz nepokriva vlastni upravy.
