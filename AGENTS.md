# Pokyny pro vývojové agenty (AGENTS.md)

Tento repozitář obsahuje vzdělávací aplikaci pro příslušníky a zaměstnance Vězeňské služby ČR.
Technologický stack: React, Vite, TypeScript, Tailwind CSS.

## 1. Zásady pro práci s daty (`src/data/`)

* **Struktura otázek:** Každá otázka musí striktně dodržovat TypeScript rozhraní (`id`, `subject`, `topic`, `question`, `answer`, `options`, `correctOption`, `rationale`, `source`).
* **Pravidla pro ID otázek:**
  * **Prefixy:** Striktně dodržuj zaběhnutý prefix daného souboru (povolené prefixy: `pr-`, `bs-`, `pe_`, `sp-`, `pen-`, `ped-`, `zdr-`, `psy-`, `va_`). Nikdy nevymýšlej nové tvary prefixů.
  * **Sekvenční číslování:** Nové otázky musí vždy plynule navazovat na nejvyšší existující číslo v daném souboru. Nikdy neresetuj čítač.
  * **Unikátnost:** Všechna ID musí být napříč aplikací 100% unikátní.
* **Správnost odpovědí:** Pole `correctOption` musí být platný číselný index (0 až options.length - 1) odpovídající správné textové variantě v `options` a poli `answer`.
* **Zdrojování:** Každá otázka musí mít vyplněné pole `source` (číslo zákona, NGŘ, nařízení) a `rationale` (vysvětlení).
* **Vyvážená délka možností (vynuceno v CI):** Délka možnosti NESMÍ prozrazovat správnou odpověď — ani tím, že je nejdelší, ani tím, že je nejkratší. Všechny 4 možnosti musí mít srovnatelnou délku, gramatickou strukturu a odborný tón; cílem je, aby podíl „správná je nejdelší" i „správná je nejkratší" vyšel poblíž 25 %, tedy náhodné hladiny u čtyř možností. Kontrola `npm run check:questions` hlídá ráčnou OBA tyto počty — ani celkově, ani v jednom předmětu nesmí vzrůst. Pozor: dorovnat distraktory tak, aby byly všechny delší než správná odpověď, problém neřeší, jen ho překlopí na „vyber nejkratší"; ráčna to zachytí. Zlepšíš-li obsah, přepiš referenční stav příkazem `npm run check:questions -- --update-baseline` a commitni `scripts/question-quality-baseline.json`.
* **Modul Kriminalistika:** Byl záměrně trvale odstraněn. Tento modul ani soubor `kriminalistika.ts` nikdy neobnovuj.

## 2. Zásady pro úpravy kódu a komponent

* **Žádné destruktivní změny:** Nikdy nemaž ani nepřepisuj existující otázky nebo komponenty bez výslovného pokynu uživatele.
* **Zachování typů:** Nepoužívej typ `any`. Všechny nové stavy a vlastnosti musí mít explicitní TypeScript definice.
* **Přístupnost JSX (vynuceno v CI):** `npm run lint` spouští vedle `tsc --noEmit` i `eslint` s pluginem `jsx-a11y`. Nové prvky musí mít dostupné jméno (ikonové tlačítko `aria-label`, popisek svázaný se vstupem), obrázky `alt` a dialogy `role="dialog"` + `aria-modal`. Zděděný dluh klikacích `<div>`ů je **splacený** — `jsx-a11y` hlásí nulu. Prvek, který se chová jako tlačítko, má být `<button type="button">`; nejde-li to (uvnitř už jsou jiná tlačítka, nebo je prvek uprostřed textového toku), použij `role="button"`, `tabIndex={0}` a `activateOnKey()` z `src/utils/a11y.ts`. `lint:a11y` běží s `--max-warnings 0`, takže **jakékoli varování shodí build** — rozpočet je vyčerpaný a není kam ustoupit. Pravidla a důvody nastavení jsou okomentované v `eslint.config.js`.
* **Závislosti hooků (`react-hooks/exhaustive-deps`):** Pravidlo je rovněž vynucené na nulu. Chybějící závislost nikdy neumlčuj komentářem `eslint-disable`; odstraň místo toho důvod, proč tam nemůže být. Osvědčené postupy: funkci volanou z efektu zabal do `useCallback` a dej do závislostí ji (viz `MatchingGame`); u intervalu nebo odběru, který má volat vždy nejnovější verzi funkce, drž ji v refu synchronizovaném efektem bez pole závislostí (viz `finishExamRef` v `Quiz`); a nikdy nevolej vedlejší efekt uvnitř updateru `setState` — updater musí být čistá funkce a StrictMode ho ve vývoji spouští dvakrát.
* **Integrita build procesu:** Před dokončením úkolu vždy spusť `npm test` (lint + typová kontrola + integrita předpisů + kvalita banky otázek) a `npm run build`. Totéž běží v CI na každý pull request a na push do `main` (`.github/workflows/ci.yml`), takže neověřená změna shodí build.
