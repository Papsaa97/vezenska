# SYSTEM HEALTH AUDIT – Akademie VS ČR
**Datum auditu:** 12. 9. 2026  
**Auditoval:** Antigravity (automatizovaný hloubkový audit)  
**Branch:** `main` — čistý stav, nic ke commitu

---

## Souhrn aktuálního stavu

Aplikace je **stavitelná a funkční** (`npm run build` exituje kódem 0 za 21 s). Produkční výstup bez runtime chyb kompilace. Nalezena **jedna TypeScript chyba kompilátoru** (`tsc --noEmit` exituje kódem 2), dále několik strukturálních a datových slabin, které nemají vliv na okamžitou dostupnost, ale představují technický dluh a potenciální body selhání.

### Primární příčina jediného kompilátorového selhání
`UserProfileModal.tsx:299` – přímý přístup `profile.avatar_url` bez optional chaining navzdory tomu, že `profile` je v `AuthContext` typováno jako `UserProfile | null`. Zatímco samotná komponenta korektně vrací `null` při `!user`, TypeScript nevidí, že `profile` je v místě volání zaručeně non-null, protože guard condition kontroluje `user`, nikoliv `profile`.

---

## Tabulka nalezených problémů

### P0 – Blocker / Havárie

Žádný P0 problém nebyl nalezen. Build prochází, ErrorBoundary je přítomna a funkční.

---

### P1 – Chyba logiky / Kritická datová anomálie

| # | Soubor | Řádek | Problém | Příčina | Návrh řešení |
|---|--------|-------|---------|---------|--------------|
| 1 | `src/context/AuthContext.tsx` | 96–110 | **`user_class` se nepřenáší ze Supabase do profilu** – obě větve SELECT neobsahují `user_class`. Po přihlášení na novém zařízení uživatel vždy dostane výchozí třídu `'ZOP A11'`, i kdyby ji měl v DB nastavenou. Hodnota pochází ze `localStorage` nebo hardcoded defaultu. | Obě `.select()` volání neobsahují `user_class` v seznamu polí. | Přidat `user_class` do obou select řetězců: `'id, email, full_name, role, created_at, avatar_url, user_class'`. |
| 2 | `src/components/UserProfileModal.tsx` | 299 | **TypeScript chyba TS18047 – `profile` is possibly `null`**. Výraz `profile.avatar_url` (bez `?.`) způsobuje kompilátorový error. Navíc komponent čte `profile.avatar_url` místo `effectiveProfile.avatar_url`, které je definováno jako fallback na řádku 95–110. | Nekonzistentní použití `profile` vs `effectiveProfile` v jednom souboru. | Nahradit `profile.avatar_url` za `effectiveProfile.avatar_url` na řádku 299. |

---

### P2 – Regrese / Typové problémy

| # | Soubor | Řádek | Problém | Příčina | Návrh řešení |
|---|--------|-------|---------|---------|--------------|
| 3 | `src/utils/quizQuestionsLoader.ts` | 21 | **Index signature `[key: string]: unknown`** v `SupabaseQuizQuestionRow` – de facto ekvivalent `any` pro neznámá pole. Umožňuje přístup k libovolnému klíči bez typové kontroly. | Záměrné pro robustnost při čtení surových DB řádků. | Refaktorovat na striktní typ nebo opatřit eslint-disable komentářem pro explicitní záměr. |
| 4 | `src/context/AuthContext.tsx` | 119–123 | **Možná eskalace role přes localStorage** – pokud má student v `localStorage` `vscr_user_role = 'lektor'` (manuálně nebo po roli-downgrade), dostane práva lektora i přes DB, dokud se localStorage nevymaže. Logika `localRole && (profileData?.role === 'student' \|\| profileData?.role === 'velitel_tridy') ? localRole : (profileData?.role \|\| 'student')` umožňuje neoprávněnou eskalaci. | Prioritizace localStorage nad DB kvůli rychlé inicializaci, bez ověření. | DB roli jako autoritativní; localStorage smí přepsat roli pouze na stejnou nebo nižší. |
| 5 | `src/data/questions/sluzebniPriprava.ts` a AGENTS.md | — | **Prefix `sp-` není uveden v AGENTS.md** – soubor má 50 otázek s prefixem `sp-`, zatímco AGENTS.md zmiňuje pouze `pr-`, `bs-`, `pe_`. Ostatní nezdokumentované prefixy: `pen-`, `ped-`, `zdr-`, `psy-`, `va_`. | AGENTS.md nebyl aktualizován při přidání dalších modulů. | Doplnit všechny prefixy do AGENTS.md. |
| 6 | `src/data/questionsData.ts` | 30–33 | **Nekonzistentní normalizace subject klíčů** – filter používá `q.subject === 'zbrane'` i `'Zbraně'` (různá kapitalizace). Datový soubor používá lowercase, DB může mít různě. | Absence centrálního enumu pro subject klíče. | Centralizovat do const enumu nebo normalizovat na lowercase při načítání. |
| 7 | `public/sw.js` | 104 | **Catch v fetch handleru může vrátit `undefined`** – pokud `cachedResponse` je `undefined` (asset nebyl nikdy cachován) a síť selže, `fetchPromise` resolvuje na `undefined`. SW spec vyžaduje vždy `Response`. | Catch handler se spoléhá na to, že `cachedResponse` bude vždy k dispozici. | Přidat fallback: `return cachedResponse \|\| new Response('', { status: 503 });` |

---

### P3 – UX / Vylepšení / Technický dluh

| # | Soubor | Řádek | Problém | Příčina | Návrh řešení |
|---|--------|-------|---------|---------|--------------|
| 8 | `src/index.css` | 107–112 | **Agresivní tiskový reset `height: auto !important`** na `main, div, section, article` – selektor je příliš široký a může přepsat `h-*` utility na prvcích nezamýšlených pro tisk. | Snaha zajistit multi-page print. | Zúžit na `.print-container div, .print-container section`. |
| 9 | `public/manifest.json` | — | **Chybí `id` pole** – Chrome 96+ doporučuje explicitní `"id": "/"` pro stabilní identitu PWA instalace. | Manifest byl vytvořen před Chrome 96. | Přidat `"id": "/"` do manifest.json. |
| 10 | `src/App.tsx` | 131 | **`setIsLoadingQuestions` – mrtvá hodnota** – deklarováno jako `[, setIsLoadingQuestions]` (stav zahazován), setter volán ale nikde nevyužit v UI. | Stav přidán pro budoucí použití a zapomenut. | Odstranit nebo napojit na globální loading indikátor. |
| 11 | `src/components/DiagramGame.tsx` | 281 | **`overflow-x-hidden` na flex containeru** – jediné místo se skrytím horizontálního přetékání; může ořezat obsah na zařízeních < 320 px. | Obrana proti přetékání. | Ověřit na iPhone SE (375 px); pokud OK, přijatelné. |
| 12 | Build output | — | **Chunk `index-BnK9MPmJ.js` = 1 080 kB** (gzip 263 kB), `data-questions = 712 kB` – překračuje Vite doporučení 1 000 kB, prodlužuje TTI na pomalém připojení. | Všechny komponenty načteny eagerly. | Zavést `React.lazy()` pro: `LegalCompass`, `PrisonAdministration`, `CaptainExamAssistant`, `WeaponSimulator`. |
| 13 | `src/context/AuthContext.tsx` | 163 | **`fetchProfile` má `user` v dependency array** – způsobuje zbytečnou rekonstrukci callbacku při každé změně `user` objektu, což spouští `useEffect`. | Closure nad `user` namísto parametrů. | Refaktorovat `fetchProfile` aby přijímal `userId` a `userEmail` jako parametry. |

---

## Datová integrita – souhrnné výsledky

### Unikátnost ID otázek
Všechna ID jsou unikátní napříč 9 datovými soubory. Celkem 377 unikátních ID, nulové duplicity.

### Distribuce správných odpovědí (per-subject)

| Soubor | Celkem | A | B | C | D | Stav |
|--------|--------|---|---|---|---|------|
| pravo.ts | 57 | 28% | 25% | 25% | 23% | OK – vyváženo |
| bezpecnostniSluzba.ts | 32 | 22% | 28% | 25% | 25% | OK – vyváženo |
| penologie.ts | 52 | 23% | 27% | 25% | 25% | OK – vyváženo |
| profesniEtika.ts | 57 | 26% | 28% | 23% | 23% | OK – vyváženo |
| pedagogika.ts | 31 | 26% | 26% | 26% | 23% | OK – vyváženo |
| zdravoveda.ts | 29 | 24% | 31% | 24% | 21% | POZOR – B 31% (přijatelné) |
| psychologie.ts | 42 | 26% | 29% | 21% | 24% | POZOR – C 21% (přijatelné) |
| vezenskaAdministrativa.ts | 27 | 22% | 33% | 22% | 22% | POZOR – B 33% (sledovat) |

### Přítomnost `rationale` a `source`
Všechny soubory obsahují povinná pole – žádné chybějící záznamy.

### Modul Kriminalistika
Absolutně odstraněn. Žádný import ani datový soubor. Jediná reference v `questionTemplateParser.ts` je ochranná logika blokující import (záměrné a správné).

---

## Audit tiskového subsystému (A4 Print Engine)

- **PrintHeader.tsx** – korektně implementován: skrytý na obrazovce, zobrazen při tisku, `print-avoid-break` zabraňuje rozdělení přes stránku.
- **break-inside: avoid** – aplikováno konzistentně v Quiz, ProfessionalEthics, PrisonAdministration, DiagramGame.
- **Žádné chybné distraktory** – tisková logika v Quiz.tsx zobrazuje pouze správné odpovědi a rationale.
- **Slabé místo** – agresivní globální reset (P3 #8).

---

## Mobilní ergonomie, PWA a UX

- **Dynamické viewport jednotky** – `min-h-[100dvh]` v ErrorBoundary a ProtectedRoute. Žádné zastaralé `min-h-screen`.
- **Bez pevných šířek** – žádná pevná šířka způsobující overflow. `overflow-x-hidden` pouze v DiagramGame (P3 #11).
- **PWA manifest** – funkční, chybí pouze `id` pole (P3 #9).
- **Service Worker** – Stale-While-Revalidate, Network-Only pro Supabase. Edge-case: undefined Response v catch (P2 #7).

---

## TypeScript – výsledky kompilace

```
npx tsc --noEmit → Exit code 2 (1 chyba)

src/components/UserProfileModal.tsx:299:43 - error TS18047: 'profile' is possibly 'null'.
```

Žádné použití `as any` ani `: any` nebylo nalezeno v produkčním kódu.

---

## Výsledek `npm run build`

```
✓ built in 21.16s  (exit code 0)

dist/assets/index-wZFGcoly.css              237.47 kB  │ gzip:  28.21 kB
dist/assets/vendor-supabase-C5o0XR4z.js     222.48 kB  │ gzip:  58.14 kB
dist/assets/vendor-genai-iNciG5wX.js        387.29 kB  │ gzip:  67.99 kB
dist/assets/vendor-framework-1r8SW-Oc.js    390.30 kB  │ gzip: 118.36 kB
dist/assets/vendor-charts-CBAJGQTG.js       419.59 kB  │ gzip: 119.34 kB
dist/assets/data-questions-BfVLflQt.js      712.60 kB  │ gzip: 175.29 kB
dist/assets/index-BnK9MPmJ.js             1,080.62 kB  │ gzip: 263.69 kB

VAROVÁNÍ: chunks > 1000 kB (viz P3 #12)
VAROVÁNÍ: Node.js 20 deprecated by Supabase SDK (doporučuje Node.js 22+)
```

Build prošel bez chyb kompilace Vite. TypeScript chyba (tsc) je reálná ale při vite build neblokující (Vite využívá esbuild).

---

## Návrh okamžitých kroků pro stabilizaci

### Okamžitě (tento sprint)

1. **P1 #2 – UserProfileModal.tsx:299**  
   `profile.avatar_url` → `effectiveProfile.avatar_url` — jednořádková oprava eliminuje TSC chybu.

2. **P1 #1 – AuthContext.tsx SELECT chybí `user_class`**  
   Přidat `user_class` do obou `.select()` volání (řádky 98 a 108).

### Krátký horizont (příští sprint)

3. **P2 #4** – Zabezpečit role eskalaci přes localStorage.
4. **P2 #7** – SW catch: přidat fallback Response.
5. **P2 #5** – Doplnit všechny prefixy do AGENTS.md.

### Technický dluh (backlog)

6. **P3 #12** – Lazy loading velkých modulů (redukce chunk z 1080 kB).
7. **P3 #9** – Přidat `"id": "/"` do manifest.json.
8. **P3 #13** – Refaktorovat `fetchProfile` – circular dependency.
9. **P3 #8** – Zúžit globální print reset.
10. **P2 #6** – Normalizovat subject klíče na centrální enum.

---

*Audit byl proveden automatizovaně dne 12. 9. 2026. Žádný produkční kód nebyl upraven.*
