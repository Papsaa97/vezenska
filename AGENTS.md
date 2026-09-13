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
* **Integrita build procesu:** Před dokončením úkolu vždy spusť `npm test` (typová kontrola + integrita předpisů + kvalita banky otázek) a `npm run build`. Totéž běží v CI na každý pull request a na push do `main` (`.github/workflows/ci.yml`), takže neověřená změna shodí build.

## 3. Autonoma testovací data (`src/autonoma/`)

Autonoma je nástroj pro end-to-end testování, který generuje realistická testovací data prostřednictvím integračního endpointu `/api/autonoma` a definovaných factories (`src/autonoma/factories/`).

* **Konfigurace výhradně z prostředí:** Endpoint je ve výchozím stavu VYPNUTÝ (vrací 404) a zapne se jen při `AUTONOMA_ENABLED=true` spolu se všemi proměnnými `AUTONOMA_*` a `VITE_SUPABASE_*` (viz `.env.example`). Do `src/autonoma/` ani do `api/autonoma.ts` NIKDY nepiš záložní (fallback) hodnotu tajemství, hesla ani anon klíče — dřívější verze je měla zapsané natvrdo a daly se z repozitáře vyčíst. Proměnné čti vždy líně přes `requireEnv()` z `src/autonoma/env.ts`, nikdy na úrovni modulu: `vite.config.ts` tenhle strom importuje, takže výjimka při importu rozbije `npm run dev` i `npm run build`. Factories vytvářejí a mažou entity (`quiz_questions`, `user_feedback`) přímo přes aplikační logiku a Supabase rozhraní. Při přidání nového datového modelu nebo změně způsobu vytváření entit vždy přidejte nebo aktualizujte odpovídající factory v `src/autonoma/factories/`.
