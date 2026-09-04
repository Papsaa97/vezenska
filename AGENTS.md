# Pokyny pro vývojové agenty (AGENTS.md)

Tento repozitář obsahuje vzdělávací aplikaci pro příslušníky a zaměstnance Vězeňské služby ČR.
Technologický stack: React, Vite, TypeScript, Tailwind CSS.

## 1. Zásady pro práci s daty (`src/data/`)

* **Struktura otázek:** Každá otázka musí striktně dodržovat TypeScript rozhraní (`id`, `subject`, `topic`, `question`, `answer`, `options`, `correctOption`, `rationale`, `source`).
* **Pravidla pro ID otázek:**
  * **Prefixy:** Striktně dodržuj zaběhnutý prefix daného souboru (např. `pr-` pro právo, `bs-` pro bezpečnostní službu, `pe_` pro profesní etiku). Nikdy nevymýšlej nové tvary prefixů.
  * **Sekvenční číslování:** Nové otázky musí vždy plynule navazovat na nejvyšší existující číslo v daném souboru. Nikdy neresetuj čítač.
  * **Unikátnost:** Všechna ID musí být napříč aplikací 100% unikátní.
* **Správnost odpovědí:** Pole `correctOption` musí být platný číselný index (0 až options.length - 1) odpovídající správné textové variantě v `options` a poli `answer`.
* **Zdrojování:** Každá otázka musí mít vyplněné pole `source` (číslo zákona, NGŘ, nařízení) a `rationale` (vysvětlení).
* **Modul Kriminalistika:** Byl záměrně trvale odstraněn. Tento modul ani soubor `kriminalistika.ts` nikdy neobnovuj.

## 2. Zásady pro úpravy kódu a komponent

* **Žádné destruktivní změny:** Nikdy nemaž ani nepřepisuj existující otázky nebo komponenty bez výslovného pokynu uživatele.
* **Zachování typů:** Nepoužívej typ `any`. Všechny nové stavy a vlastnosti musí mít explicitní TypeScript definice.
* **Integrita build procesu:** Před dokončením úkolu vždy ověř typovou kontrolu a úspěšný build (`npm run build` nebo `npx tsc --noEmit`).

