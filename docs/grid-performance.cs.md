# Výkon mřížky pracovní plochy

Ověřeno 15. 10. 2026 na vlastní verzi Layerlingu 1.76.0.

## Zjištění

Krok přichytávání ovlivňuje hustotu viditelné mřížky. Automatické ředění jemných čar podle přiblížení již fungovalo, ale všechny čáry se navíc vykreslovaly jako průhledné plošné pásy. Ty se vytvářely i při šířce menší než jeden obrazový pixel. Ploché oboustranné pásy navíc používaly dva průchody vykreslení průhlednosti.

V otevřeném Chromu se podařilo zachytit horší plynulost i na prázdné desce 200 × 200 mm. V integrovaném prohlížeči Codexu se tentýž problém výrazně neprojevil; jeho výsledek proto nestačil jako důkaz výkonu v Chromu.

## Změna

- Šířka pásů se porovnává s velikostí pixelu v pracovní rovině. Pásy jemných a hlavních čar se vytvářejí samostatně pouze tehdy, jsou-li široké alespoň jeden CSS pixel. Tenké linky mřížky zůstávají viditelné.
- Při přibližování se pásy automaticky obnoví, jakmile jejich šířka dosáhne viditelné velikosti. Funguje to také u pevné mřížky a při vypnutém přichytávání.
- Ploché pásy využívají jeden průchod vykreslení průhlednosti i při zobrazení z obou stran.
- Přesnost přichytávání, polohy čar, rozměry modelů a uložené nastavení se nemění. Volba zesilování čar zůstává zachovaná.

## Měření a jeho meze

Měření proběhlo v Chromu na místním vývojovém serveru, při rozměrech vykreslovacího plátna 2560 × 1098 pixelů. Dočasné ovládání provedlo 120 kroků otáčení a zaznamenalo intervaly `requestAnimationFrame`. Následující hodnoty jsou výsledky jednotlivých běhů, nikoli záruka FPS pro všechny projekty nebo počítače:

| Stav při kroku 0,1 mm | Před změnou | Po změně |
| --- | ---: | ---: |
| Medián intervalu snímků | 33,5 ms | 16,7 ms |
| 95. percentil intervalu | 66,5 ms | 33,2 ms |
| Průměr testovacího běhu | 21,9 FPS | 45,8 FPS |
| Vykreslovací volání posledního snímku | 25 | 19 |
| Vykreslené trojúhelníky posledního snímku | 2 310 | 314 |

Pohled zobrazoval automaticky zředěnou mřížku s roztečí 0,8 mm, ale přichytávání bylo po celou dobu nastavené na 0,1 mm. Samostatně se ověřilo obnovení skutečné rozteče 0,1 mm i obou druhů pásů při velkém přiblížení. U varianty 5 mm byl před změnou průměr testu 52,1 FPS a medián 16,7 ms. Běhy obsahovaly jednotlivé delší prodlevy, proto jsou uvedeny i mediány a percentily.

Přímý čas volání vykreslování na CPU byl obvykle pod jednou milisekundou a sám o sobě pokles plynulosti neodhalil. Výsledky FPS nelze zaměňovat s tímto časem. Dočasné měřicí ovládání i synchronizace grafiky byly z výsledného kódu odstraněny.

Staticky prošla kontrola TypeScriptu a všech 26 testů mřížky včetně metrických, palcových, vlastních a LEGO kroků. V prohlížeči byla ověřena hustota čar, obnova pásů při zoomování a vykreslení s LEGO tělesem. Měření FPS se týká prázdné testovací desky v Chromu; nasazení na WEDOS a výkon konkrétního uživatelského projektu je samostatná kontrola.
