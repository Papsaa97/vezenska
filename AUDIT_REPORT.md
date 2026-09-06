# Komplexní technický a obsahový audit aplikace

Tento dokument obsahuje hloubkový audit zaměřený na obsahovou kvalitu, architekturu, bezpečnost, typovou bezpečnost a UI/UX, přesně podle zadání.

## 1. KVALITA A INTEGRITA OBSAHU (src/data/)

### Statistika odpovědí
Bylo analyzováno celkem **373** otázek z databáze kvízů. Rozložení správných odpovědí ukazuje, že žádná volba neúměrně nedominuje:
- Možnost A (index 0): **89** výskytů (23.9 %)
- Možnost B (index 1): **98** výskytů (26.3 %)
- Možnost C (index 2): **98** výskytů (26.3 %)
- Možnost D (index 3): **88** výskytů (23.6 %)

*Závěr:* Rozložení je velmi rovnoměrné, zkoušený nemůže těžit ze statistické předvídatelnosti.

### Analýza distraktorů a repetitivnosti
Byla provedena analýza distraktorů na přítomnost prázdných, primitivních nebo nebezpečně se opakujících možností.
Nalezené problémy s distraktory:
- **pravo.ts** (ID: `pr-52`): Multiple 'All/None of the above' style distractors
- **profesniEtika.ts** (ID: `pe_44`): Multiple 'All/None of the above' style distractors

### Datová konzistence (ID a Duplicity)
Žádná duplicitní ID otázek nebyla nalezena. Každá otázka je unikátní.

## 2. ARCHITEKTURA A REACT BEST PRACTICES

### Zbytečné re-rendery a optimalizace
Během analýzy `.tsx` komponent byly identifikovány potenciální problémy s výkonem v důsledku chybějící memoizace.
- **/App.tsx**: Potential unnecessary re-renders: Inline functions in large components (consider useCallback)
- **/components/AuthUI.tsx**: Potential unnecessary re-renders: Inline functions in large components (consider useCallback)
- **/components/AuthWall.tsx**: Potential unnecessary re-renders: Inline functions in large components (consider useCallback)
- **/components/BadgesView.tsx**: Potential unnecessary re-renders: Inline functions in large components (consider useCallback)
- **/components/CaptainExamAssistant.tsx**: Potential unnecessary re-renders: Inline functions in large components (consider useCallback)
- **/components/ContentManager.tsx**: Potential unnecessary re-renders: Inline functions in large components (consider useCallback)
- **/components/DiagramGame.tsx**: Potential unnecessary re-renders: Inline functions in large components (consider useCallback)
- **/components/Flashcards.tsx**: Potential unnecessary re-renders: Inline functions in large components (consider useCallback)
- **/components/Header.tsx**: Potential unnecessary re-renders: Inline functions in large components (consider useCallback)
- **/components/LegalCompass.tsx**: Potential unnecessary re-renders: Inline functions in large components (consider useCallback)
- **/components/MatchingGame.tsx**: Potential unnecessary re-renders: Inline functions in large components (consider useCallback)
- **/components/MaterialLibrary.tsx**: Potential unnecessary re-renders: Inline functions in large components (consider useCallback)
- **/components/PrisonAdministration.tsx**: Potential unnecessary re-renders: Inline functions in large components (consider useCallback)
- **/components/ProfessionalEthics.tsx**: Potential unnecessary re-renders: Inline functions in large components (consider useCallback)
- **/components/QuestionBankManager.tsx**: Potential unnecessary re-renders: Inline functions in large components (consider useCallback)
- **/components/Quiz.tsx**: Potential unnecessary re-renders: Inline functions in large components (consider useCallback)
- **/components/Scenarios.tsx**: Potential unnecessary re-renders: Inline functions in large components (consider useCallback)
- **/components/Statistics.tsx**: Potential unnecessary re-renders: Inline functions in large components (consider useCallback)
- **/components/SubjectsHub.tsx**: Potential unnecessary re-renders: Inline functions in large components (consider useCallback)
- **/components/WeaponSimulator.tsx**: Potential unnecessary re-renders: Inline functions in large components (consider useCallback)

*Doporučení:* U rozsáhlých komponent (zejména `App.tsx` a komplexních `components/*.tsx`) zabalit opakovaně předávané funkce do `useCallback` a složité výpočty (např. filtrování dat) do `useMemo`.

## 3. BEZPEČNOST A SUPABASE NAPOJENÍ

### Ochrana tras (Protected Routes)
- **global**: No explicitly named Protected Routes found. Make sure routing is secure.
*Závěr:* Byla zjištěna absence dedikovaného AuthGuard wrapperu (např. `ProtectedRoute.tsx`). Ochrana je pravděpodobně řešena přímo uvnitř komponent (`App.tsx`), což může vést k blikání obsahu a menší robustnosti.

### Zpracování chyb databáze
V souborech s dotazy na Supabase chybí u některých volání korektní `.error` check a fallback UI. Hrozí, že při výpadku sítě spadne celá komponenta nebo zobrazí prázdnou stránku.

## 4. TYPESCRIPT A TYPOVÁ BEZPEČNOST

Byla nalezena následující místa s použitím explicitního `any`, což oslabuje typovou bezpečnost projektu:
- **src/data/questions/profesniEtika.ts** (Řádek 133): Use of explicit 'any' type
- **src/data/questions/profesniEtika.ts** (Řádek 187): Use of explicit 'any' type
- **src/data/questions/profesniEtika.ts** (Řádek 189): Use of explicit 'any' type
- **src/data/questions/profesniEtika.ts** (Řádek 845): Use of explicit 'any' type
- **src/utils/gamification.ts** (Řádek 459): Use of explicit 'any' type
- **src/utils/geminiAnalyzer.ts** (Řádek 28): Use of explicit 'any' type
- **src/utils/geminiAnalyzer.ts** (Řádek 139): Use of explicit 'any' type
- **src/utils/geminiAnalyzer.ts** (Řádek 153): Use of explicit 'any' type
- **src/utils/geminiAnalyzer.ts** (Řádek 195): Use of explicit 'any' type
- **src/utils/speech.ts** (Řádek 13): Use of explicit 'any' type
- **src/components/BadgesView.tsx** (Řádek 346): Use of explicit 'any' type
- **src/components/CaptainExamAssistant.tsx** (Řádek 80): Use of explicit 'any' type
- **src/components/CaptainExamAssistant.tsx** (Řádek 169): Use of explicit 'any' type
- **src/components/LegalCompass.tsx** (Řádek 1065): Use of explicit 'any' type
- **src/components/LegalCompass.tsx** (Řádek 1091): Use of explicit 'any' type
- **src/components/PrisonAdministration.tsx** (Řádek 1197): Use of explicit 'any' type

*Doporučení:* Nahradit `any` přesnějším typováním (např. `unknown`, nebo definováním konkrétních rozhraní).

## 5. UI/UX A RESPONZIVITA (Tailwind)

Při analýze Tailwind tříd byly zjištěny následující pevně dané rozměry, které mohou narušovat responzivitu:
- **src/components/Flashcards.tsx** (Řádek 308): Fixed large height (h-[...px]) without responsive prefix might break mobile layout

*Doporučení:* Používat responzivní prefixy (např. `md:w-[...]` a jako základ `w-full`), a preferovat dynamické výšky jako `min-h-[100dvh]` místo `h-screen` kvůli mobilním prohlížečům.

## ROADMAPA OPRAV (Dle kritičnosti)

### 🔴 Blocker / Critical (Okamžitá priorita)
1. **Zavedení systémového `AuthGuard` (Protected Route)**: Aktuální směrování je potřeba chránit robustně proti neoprávněnému přístupu (zamezit "zábleskům" chráněného obsahu před přesměrováním).
2. **Ošetření výpadků Supabase (Error Boundaries)**: Obalit chráněné i veřejné komponenty, které tahají data, do Error Boundary, aby pád dotazu neshodil celou aplikaci na prázdnou bílou obrazovku.

### 🟡 High (Vysoká priorita)
3. **Odstranění duplicit a optimalizace distraktorů**: Opravit logiku u otázek (ID: pr-52, pe_44), kde se opakují možnosti "Všechny odpovědi jsou správně".
4. **Odstranění explicitních `any` z TypeScriptu**: Striktní otypování `geminiAnalyzer.ts` a komponent (`LegalCompass.tsx`, `PrisonAdministration.tsx`).
5. **Oprava fixních výšek na mobilu (UI/UX)**: Odstranit nebo obalit `h-[...px]` ve `Flashcards.tsx` responzivním chováním, přejít z `h-screen` na `min-h-[100dvh]`.

### 🟢 Medium / Cosmetic (Kosmetické a optimalizační kroky)
6. **Výkonnostní ladění (useCallback / useMemo)**: Přidat memoizaci pro drahé funkce předávané jako props (zejména do obřích komponent jako `Quiz.tsx`, `Scenarios.tsx`).
7. **Úklid mrtvého kódu a konzistence stínů/barev**: Sjednotit použití stínů v Tailwindu a odstranit případné nepoužívané importy odhalené linterem.
