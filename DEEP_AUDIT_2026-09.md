# Hloubkový audit aplikace — Akademie VS ČR, studijní portál ZOP A

**Datum:** 16. 9. 2026 · **Revize:** `aeda1ce` (main) · **Rozsah:** 139 souborů / 51 270 řádků `src/`, 15 záložek, datová vrstva, CI, nasazení
**Metoda:** čtení veškerého zdrojového kódu; spuštění `npm run lint`, `check:legal`, `check:questions`, `npm run build`; porovnání obsahových tvrzení proti **úředním zněním stáhnutým z e-Sbírky**, která má repozitář v `public/data/esbirka/` (znění č. 25 zák. 555/1992 Sb., č. 31 zák. 169/1999 Sb., č. 23 zák. 293/1993 Sb., č. 36 zák. 361/2003 Sb., č. 46 zák. 40/2009 Sb., č. 14 zák. 129/2008 Sb., č. 11 vyhl. 345/1999 Sb.).

---

## 0. Verdikt

Technicky je to nadstandardně zvládnutý projekt: RLS je utažená, role se nedají eskalovat, skóre testu počítá server, proxy na e-Sbírku není otevřené relé, a11y ráčna drží nulu, vše se buildí a všechny kontroly procházejí zeleně.

**Problém je jinde, než kam míří CI.** Hlavní slabinou není kód, ale **fakticita právního obsahu**. Aplikace na několika místech učí věcně nesprávné znění zákona — a co je nejhorší, **sama sobě odporuje**: banka otázek má u kázeňských trestů správná čísla, zatímco Právní kompas, studijní výběr zákona 169/1999 a Poznávačka mají u téhož tři různé nesprávné verze. Student, který se učí z Kompasu, odpoví špatně na otázku z vlastní aplikace.

| Kategorie | Kritické | Významné | Drobné |
|---|---|---|---|
| Obsah (právní fakta) | 6 | 5 | — |
| Funkční vady | 3 | 11 | 9 |
| UI/UX a konzistence | — | 8 | 14 |
| Přístupnost | — | 4 | 3 |
| Výkon | 1 | 2 | 2 |
| Bezpečnost a soukromí | 1 | 4 | 2 |
| Kód a údržba | — | 3 | 68 (mrtvý kód) |

---

## 1. Co CI hlídá a co ne

Zelené kontroly jsou skutečné, ale jejich záběr je užší, než by se z `AGENTS.md` zdálo.

| Kontrola | Co ověří | Slepé místo |
|---|---|---|
| `lint:types` | `tsc --noEmit`, `strict` | bez `noUnusedLocals` → mrtvý kód projde |
| `lint:a11y` | jsx-a11y, `--max-warnings 0` | **lintuje jen `src/**/*.tsx`** — žádný `.ts` soubor (utils, hooks, data) není lintován vůbec; `no-unused-vars` není zapnuté |
| `check:legal` | tvar dat, existence citovaných § v osnově z e-Sbírky, pokrytí, doslovnost `exactText` | doslovnost je **jen varování**, nikdy neshodí build; **neověřuje, že § pod nímž je obsah uveden je ten správný §**; `fullLegalText` (studijní výběr) se na doslovnost nekontroluje vůbec |
| `check:questions` | unikátní ID, platný `correctOption`, délkový tell | nekontroluje faktickou správnost odpovědí |

To vysvětluje, jak mohla projít všechna zjištění z části 2: kontrola se ptá „existuje § 53 v zákoně 169/1999?“ (existuje) a ne „je § 53 opravdu o kázeňských trestech?“ (není).

**Doporučení:** rozšířit `eslint.config.js` na `src/**/*.{ts,tsx}` a přidat `@typescript-eslint/no-unused-vars`. Do `check:legal` přidat kontrolu, že se nadpis paragrafu v datech shoduje s názvem paragrafu v osnově z e-Sbírky — to samo by odhalilo většinu nálezů níže.

---

## 2. KRITICKÉ — věcné vady právního obsahu

### 2.1 Kázeňské odměny a tresty odsouzených — tři nesouhlasné verze, dvě chybné

Zákon 169/1999 Sb. ve znění č. 31 (účinné od 1. 1. 2026): **odměny jsou § 45**, **kázeňské tresty § 46 odst. 3**, **lékařské posouzení před samovazbou § 49**, **§ 53 je prominutí trestu**, **§ 54 je zahlazení trestu**.

**`src/data/legalCompasData.ts:246–275` (položka `169-kazenske-tresty`)** — zobrazuje se v Paragrafovém výkladu jako znění zákona:

| Tvrzení aplikace | Platné znění | |
|---|---|---|
| „§ 47 Kázeňské odměny“ | odměny jsou **§ 45**; § 47 je *Ukládání kázeňských trestů* | ❌ |
| „věcnou nebo peněžitou odměnu (do výše **2 000 Kč**)“ | **1 000 Kč** (§ 45 odst. 2 písm. e) | ❌ |
| „mimořádné opuštění věznice **až na 5 dnů**“ | **povolení opustit věznici až na 24 hodin** (§ 45 odst. 2 písm. g) | ❌ |
| „prominutí dříve uloženého kázeňského trestu“ jako odměna | mezi odměnami není (prominutí je § 53) | ❌ |
| chybí | mimořádné zvýšení návštěv až na 5 hodin, jednorázový nákup, zvýšení kapesného, rozšíření osobního volna, přerušení výkonu trestu | ❌ |
| „§ 53 Kázeňské tresty (taxativní výčet)“ | tresty jsou **§ 46 odst. 3**; § 53 je *Prominutí kázeňského trestu* | ❌ |
| „zákaz přijetí balíčku (nejvýše na dobu **3 měsíců**)“ | **zákaz přijetí jednoho balíčku v kalendářním roce** | ❌ |
| „zákaz nákupu potravin … až na 2 měsíce“ jako kázeňský trest | v zákoně vůbec není | ❌ |
| „umístění do uzavřeného oddílu v mimopracovní době (až na **30 dnů**)“ | **až na 28 dnů** | ❌ |
| chybí | **snížení kapesného** až o 1/3 na 3 měsíce, **pokuta až 5 000 Kč**, **odnětí výhod z předchozí odměny** | ❌ |
| „§ 54 Výkon samovazby“ | § 54 je *Zahlazení kázeňského trestu*; režim samovazby a lékař jsou **§ 49** | ❌ |
| `examTips`: „Jaké je maximum pro opuštění věznice jako odměna? **Až 5 dnů**.“ | **24 hodin** | ❌ |

Položka je navíc označena `exactText` a `check:legal` u ní hlásí **0 z 6 doslovných vět**.

**`src/data/fullLawTexts/law169.ts:180–205`** — text zobrazovaný v Čtečce předpisu jako „Studijní výběr“ zákona 169/1999:

| Tvrzení aplikace | Platné znění | |
|---|---|---|
| „§ 45 Kázeňský přestupek“ | § 45 jsou *Odměny*; definice přestupku je § 46 odst. 1 | ❌ |
| „g) samovazba **až na 28 dnů** (u mladistvých nejvýše na **14 dnů**)“ | **20 dnů**, u mladistvých **10 dnů** (§ 46 odst. 3 písm. h, § 64) | ❌ ⚠️ |
| „c) zákaz nákupu potravin … až na 3 měsíce“ | není | ❌ |
| „e) umístění do uzavřeného oddělení v mimopracovní době až na 30 dnů“ | 28 dnů, „oddílu“ | ❌ |
| chybí pokuta 5 000 Kč a odnětí výhod | v zákoně jsou | ❌ |
| „§ 46 odst. 2: samovazbu nelze uložit těhotné ženě“ | věcně platí, ale je to **§ 66** a formulováno jako pozitivní výčet povolených trestů | ⚠️ |
| „§ 52 Řízení o kázeňském přestupku … nejpozději do 30 dnů“ | § 52 je *Stížnost proti rozhodnutí*; 30denní lhůta v zákoně není (roční prekluze je § 47 odst. 3) | ❌ |

Označený ⚠️ řádek je nejzávažnější jednotlivá vada v celé aplikaci: **28/14 dnů samovazby přímo protiřečí správné otázce ve vlastní bance** (`src/data/questions/penologie.ts:298` uvádí správně 20/10 dnů a 28/14 jako limity uzavřeného oddílu). Student se z Kompasu naučí přesně tu variantu, kterou test označí za chybnou.

**`src/data/questions/matching.ts:96–106`** (Poznávačka, kategorie „Kázeňská řízení a tresty“) — hlavička cituje **správně** § 46, obsah je chybný:

- `kt5` „Celodenní umístění do uzavřeného oddílu → **Zpřísněný režim mimo pracovní dobu** na dobu až **30 dnů**“ — dvojí chyba: *celodenní* není *mimo pracovní dobu* (to je jiný trest) a limit je **20 dnů**.
- `kt4` „Zákaz přijetí balíčku → zákaz příjmu … **až na dobu 1 roku**“ — zákon zakazuje **jeden balíček v kalendářním roce**, ne roční zákaz.
- `kt1` „**Písemná** důtka“ — zákon zná jen „důtku“.
- chybí pokuta a odnětí výhod.

### 2.2 Základní práva odsouzených — pravidlo z vyhlášky vydávané za zákon

**`src/data/legalCompasData.ts:225–244`** hlásí jako § 16 zákona 169/1999 („Ubytování a stravování“):

- „Ubytovací plocha pro jednoho odsouzeného … **nejméně 4 m²**“ — je to **§ 17 odst. 6 vyhlášky MS č. 345/1999 Sb.**, ne zákon. Zákonný § 16 se jmenuje *Sociální podmínky odsouzených a poskytování zdravotních služeb* a o ploše nemluví.
- „strava … **3× denně, z toho alespoň jedno teplé jídlo**“ — v § 16 zákona není.
- „samostatné lůžko, skříňku na osobní věci **a židli**“ — § 16 odst. 3 zaručuje „lůžko a uzamykatelnou skříňku“; židle tam není.
- Vynechána pravidla, na která se u zkoušky ptá nejčastěji: osmihodinová doba ke spánku a **nejméně jednohodinová vycházka** (§ 16 odst. 5).
- Vyhláška 345/1999 přitom stanoví i **minimum 6 m² u jednomístné cely** a výjimku na 3 m² — obojí chybí.

Návštěvy (3 h / kalendářní měsíc, max. 4 osoby) a korespondence jsou naopak věcně správné.

### 2.3 Zákon o zabezpečovací detenci — vymyšlená čísla paragrafů i údaj

**`src/data/fullLawTexts/fullRegulationsBundle.ts`** (`LAW_129_2008_FULL`):

| Tvrzení aplikace | Platné znění zák. 129/2008 Sb. | |
|---|---|---|
| „§ 4 Místo výkonu detence … **(Brno, Opava, Rýnovice)**“ | § 4 je *Umísťování chovanců do ústavu* (seznámení s právy); zákon žádná města nejmenuje | ❌ |
| „§ 14 … vycházka **nejméně 2 hodin denně**“ | **nejméně jednohodinová vycházka**, a je to **§ 20 odst. 4** | ❌ |
| „§ 24 Použití omezovacích prostředků“ | omezovací prostředky jsou **§ 36**; výčet je jiný (pobyt na uzavřeném oddělení, izolační místnost, ochranné pásy) | ❌ |

### 2.4 Donucovací prostředky — výzva s výstrahou přenesená z § 18 do § 17

**`src/data/legalCompasData.ts`, položka `555-17`.** Taxativní výčet 17 donucovacích prostředků a) až p) je **doslovně správný** a počet „17“ v `explanation` také. Vadné je odst. 3:

> „Před použitím donucovacího prostředku je příslušník povinen vyzvat osobu … **s výstrahou, že bude použito donucovacích prostředků**. Od výzvy s výstrahou lze upustit pouze …“

**V § 17 zákona 555/1992 Sb. tato povinnost není.** Formule „výzva s výstrahou“ se v celém zákoně vyskytuje **výhradně v § 18 odst. 3 pro střelnou zbraň**. Obecná povinnost je mírnější a je v § 6 odst. 3: *„Dovolují-li to okolnosti … použít domluvy, výzvy nebo varování … před výzvou použije příslušník slova ‚jménem zákona‘.“* `examTips` u § 17 tuhle záměnu učí jako zkušební chyták, takže se přenáší přímo do hlavy studenta.

Dále v téže položce: odst. 1 vynechává znaky „**úmyslně** poškozují majetek“ a „**násilím** se snaží mařit účel“ a celou působnost u soudů, státních zastupitelství, ministerstva a mimovězeňských poskytovatelů zdravotních služeb; odst. 5 vynechává podmínku *„omezení musí být ukončeno v okamžiku, kdy je zřejmé, že osoba takové jednání nebude opakovat“* a přidává znak „chová se agresivně“, který v zákoně není.

### 2.5 Nadpis slibující doslovnost u textu, který doslovný není

- `src/data/legalCompasData.ts`, položka `555-18`: **`title: 'Použití střelné zbraně (Přesné a plné zákonné znění)'`** — text je věcně v pořádku, ale je to parafráze („pouze v těchto případech“ vs. zákonné „jen výjimečně, aby“), `check:legal` u ní hlásí **2 z 11 doslovných vět**. `AGENTS.md` tohle výslovně zakazuje: *„Nikdy nepiš do rozhraní ‚doslovné znění‘, ‚úřední znění‘ ani ‚ověřeno podle e-Sbírky‘ nad textem, který z e-Sbírky nepochází.“*
- `src/data/fullLawTexts/law555.ts:2`: hlavička souboru tvrdí „**ÚPLNÉ DOSLOVNÉ ÚŘEDNÍ ZNĚNÍ Z E-SBÍRKY**“ — pole `fullLegalText` má být podle `AGENTS.md` studijní výběr. (U 555/1992 je pokrytí 96 %, takže tvrzení je blízko pravdě, ale ostatní dva soubory mají hlavičku poctivě „VÝBĚR USTANOVENÍ“ — nekonzistence.)
- `src/data/fullLawTexts/law169.ts:3` uvádí „24 z **85** paragrafů“; `check:legal` proti e-Sbírce počítá „23 z **111** §“.

### 2.6 AI asistent fabrikuje zákonné odůvodnění

**`src/utils/geminiAnalyzer.ts:196–199`:**

```ts
rationale: q.rationale || 'Ověřeno dle interních norem VS ČR.',
source:    q.source    || 'Předpisy VS ČR'
```

Když model odůvodnění nevrátí, aplikace jej **vymyslí** a označí neověřený výstup LLM slovem „Ověřeno“. To je tentýž problém, kvůli kterému byl přepisován Právní kompas, a `AGENTS.md` ho zakazuje jmenovitě.

Ve stejné funkci: `options: q.options.length >= 2 ? q.options : ['Správná možnost', 'Nesprávná možnost']` — při špatné odpovědi modelu vznikne otázka, jejíž správná odpověď je doslova text „Správná možnost“, a ta se přes `onStartCustomQuiz` dostane do ostrého testu i **do `quiz_results` a do XP**.

V celé záložce **není žádné upozornění, že odpovědi AI mohou být právně nesprávné.** Pro modul, který se jmenuje „AI vyhodnocení zadání od kapitánů“ a generuje citace paragrafů, to je nutné minimum.

### 2.7 Ostatní obsahová zjištění

- **`src/data/gamificationData.ts:90` — hodnost „Vrchní praporčík“ neexistuje.** § 8 zákona 361/2003 Sb. vyjmenovává: rotný, strážmistr, nadstrážmistr, podpraporčík, praporčík, nadpraporčík, podporučík, poručík, nadporučík, kapitán, major, podplukovník, plukovník (generálské: brigádní generál, generálmajor, generálporučík). V aplikaci, která zákon 361/2003 sama vyučuje, je vymyšlená hodnost v profilu uživatele nepříjemná.
- **Trenažér závad je společný pro obě zbraně.** `stoppageDrills` (`src/components/WeaponSimulator.tsx:270`) je jediné modulové pole; při přepnutí na Scorpion EVO 3 A1 se drilují **tytéž 4 pistolové závady**, zobrazené pod hlavičkou vybrané zbraně. Technické údaje obou zbraní jsem proti výrobci ověřil — ráže, kapacity, režimy střelby, kadence i konstrukce jsou v pořádku.
- **Nepodložená tvrzení vydávaná za normu.** „Postupový limit 75 %“ (`Statistics.tsx`), „50 otázek / 45 minut komisionální zkoušky“ (`Quiz.tsx:518`), „20 otázek ze souboru 50 **akreditovaných** kontrolních otázek, limit 30 minut“ (`PETest.tsx:47`) — nikde není uveden pramen. Aplikace jinak zdrojuje každou otázku; u parametrů samotné zkoušky by měla taky, nebo je označit jako vlastní simulaci.
- Správně ověřeno: hranice škod § 138 TZ (10 tis. / 50 tis. / 100 tis. / 1 mil. / 10 mil. Kč), návštěvy obviněného (90 minut jednou za 2 týdny, § 14 zák. 293/1993), výčet donucovacích prostředků a) až p), samovazba mladistvých 10 dnů, 5 důvodů použití zbraně § 18.

---

## 3. Funkční vady po záložkách

### 3.1 Napříč aplikací

**K1 — Šipky Zpět/Vpřed a swipe navigace jsou po většinu času rozbité.**
`App.tsx` má vlastní historii (`navHistory`/`historyIndex`) plněnou jedině v `navigateToTab()`. Volání `setActiveTab('…')` ji obchází — a takových je v `App.tsx` **21** (celá spodní mobilní lišta, celá mobilní nabídka „Více“, všechna `onNavigateToBadges`), plus celý `Header` dostává `setActiveTab={handleTabChange}` jen pro horní lištu. Kdo přejde ze Zkoušky na Odznaky přes tlačítko v testu, vrátí se šipkou „Zpět“ někam úplně jinam. Oprava je triviální: předat `navigateToTab` všude.

**K2 — Předvolba předmětu v testu se nikdy neuklidí.**
`quizPreset` (`App.tsx:143`) se nastaví při „Spustit test“ z předmětu a vynuluje **jen** v `handleStartCustomQuiz`. Klepnutí na „Zkouška“ ve spodní liště volá `setCustomQuestions(null); setActiveTab('quiz')` bez `setQuizPreset({})`, takže test už navždy startuje s předvybraným předmětem z posledního kliknutí. Totéž `flashcardPresetSubject`.

**K3 — Chyba načtení historie testů se uživateli nikdy neukáže.**
`App.tsx:220` `quizHistoryError` se nastavuje a **nikde nerenderuje** (potvrzeno scanem nepoužitých proměnných). Komentář nad kódem přitom slibuje opak: *„Necháme dosavadní stav a řekneme, že se ji nepodařilo načíst.“* Když Supabase selže, student vidí 0 XP, prázdné Statistiky a žádné vysvětlení.

**K4 — XP ze scénářů a zbraňových drilů se v hlavičce neaktualizují.**
`Header.tsx:139` a `BadgesView.tsx:165`: `useMemo(() => calculateBaseXp(quizHistory, matchingHistory), [quizHistory, matchingHistory])`. `calculateBaseXp` ale XP za scénáře a drily **čte z localStorage** (`gamification.ts:133–152`), což není v závislostech. `Header` je připojený celou session → po dokončení scénáře slíbených „+80 XP“ v hlavičce nepřibude, kdežto `BadgesView` se při přechodu na záložku připojí znovu a XP vidí. **Hlavička a Odznaky tak ukazují dvě různá čísla XP.** Totéž `loadStreakInfo()` s prázdným polem závislostí (`Header.tsx:138`).

**K5 — Veškerá gamifikace je vázaná na zařízení, ne na účet.**
`vscr_matching_history`, `vscr_streak_info`, `vscr_completed_scenarios`, `vscr_completed_drills`, `vscr_leitner_boxes`, `vscr_favorites`, `vscr_legal_favs`, `vscr_custom_saved_exams` — všechno bez `user_id`. Na sdíleném počítači v učebně si studenti navzájem dědí sérii, pexeso, splněné scénáře i oblíbené otázky, a jejich XP v hlavičce je z cizích dat. README přitom tvrdí „nový uživatel vždy startuje na prázdné historii / 0 XP“ — platí to jen pro `quiz_results`.

**K6 — „Denní série“ počítá otevření aplikace, ne studium.**
`updateDailyStreak()` je v `App.tsx` v `useEffect` na mount, takže série roste pouhým spuštěním. `loadStreakInfo()` navíc rovnou zapíše výchozí `currentStreak: 1`, takže nový uživatel má sérii hned.

**K7 — 30 nativních `alert()` / `confirm()`** vedle vlastního designového systému modálů (`useDialog`, `DeleteConfirmModal`). Nejde jen o estetiku: v PWA v režimu `standalone` se zobrazí jako systémový dialog s názvem domény, blokují vlákno, nejdou stylovat ani přeložit a na iOS je lze potlačit. Nejhorší kus je `LegalCompass.tsx:222`:

> „Opravdu chcete předpis X **smazat nebo obnovit na výchozí znění**?“

Jedno tlačítko OK pro dvě různé akce; hlášení pak řekne „byl odebrán/resetován“. Uživatel se nedozví, co se stalo.

### 3.2 Nástěnka (Informační tabule tříd ZOP)

- **Vyhledávání v záhlaví nefunguje ve výchozím režimu.** `filteredClasses` (`ClassBulletinBoard.tsx:195`) se používá jen v mřížce (`:859`). V režimu „Moje třída“, který je výchozí, je pole „Hledat třídu, službu, osobu…“ plně funkční na pohled a bez jakéhokoli efektu; ukazatel vedle něj hlásí „1 podrobná (X)“.
- **„Zobrazit všechny skryté třídy“ vydrží do refreshe.** `:850` `setHiddenClassIds([])` mění jen stav; `localStorage` klíč `vscr_hidden_classes` se nepřepíše (`classBoardService.ts:447` umí jen `toggleHideClass`). Po obnovení stránky jsou třídy zpátky skryté.
- **Počítadlo v mřížce nesouhlasí s obsahem.** `:669` ukazuje `filteredClasses.length`, ale `:859` vykresluje `filteredClasses.filter(c => !hiddenClassIds.includes(c.id))`.
- **Escape zavře všechny otevřené modály, ne jen nejvyšší** (`:401–420`) — nad editací třídy otevřený lightbox zavře obojí.
- **Tisk se nikdy neuklidí.** `handlePrintSchedule` (`:405`) nastaví `printingItem` a nikdy ho nevynuluje (chybí `onafterprint`), takže každý další Ctrl+P v aplikaci vytiskne rozvrh té třídy.
- **Datum „dnes“ zamrzne.** `todayFormatted` (`:238`) je `useMemo` s prázdným polem. Informační tabule pověšená na obrazovku v učebně po půlnoci lže.
- Mazání třídy má vlastní modál, mazání celoškolního hlášení `confirm()` (`:398`); chyba mazání třídy `alert('Smazání se nezdařilo.')` (`:295`).
- V režimu mřížky během načítání není žádný skeleton — jen prázdno.
- Odznak „Velitel“ vedle „Moje třída“ se zobrazí roli `velitel_tridy` vždy, i u třídy, které nevelí.

### 3.3 Předměty

- **Přehled předmětů nemá prázdný stav.** `visibleEntries.map(...)` bez fallbacku — student, jehož předměty nemají ani otázku, ani soubor, vidí nadpis a pod ním nic.
- **Přehled předmětů nemá hledání.** `searchQuery` existuje, ale je vykreslené jen v detailu předmětu. Napříč předměty se hledat nedá.
- „Kartičky“ na kartě předmětu se nevypínají při nulovém počtu otázek, kdežto „Spustit test“ ano — dá se otevřít dril s 0 kartičkami.
- Dlaždice je `role="button"` a uvnitř má 5 dalších tlačítek. Funguje (`activateOnKey`), ale pro odečítač je to jedno tlačítko obsahující tlačítka; lepší je klikatelný nadpis/odkaz.

### 3.4 Zkouška / Test

- **Vlastní „paleta jistoty“ se ve statistikách vyhodnocuje špatně.** Test nabízí tři úrovně (`know`/`guess`/`dont_know`, `Quiz.tsx:1258–1276`), `Statistics.tsx:194–213` zná jen dvě: co není `know`, spadne do „Šťastný tip“ / „Mezery ve znalostech“. Odpověď označená „nevím“ a náhodou správná se vykáže jako „Šťastný tip“ — a třetí úroveň se v grafu nikdy nezobrazí.
- **V ostré zkoušce se jistota vůbec nezadává, přesto se vykazuje jako „vím“.** `handleAnswer` v režimu zkoušky končí dřív, než nastaví `confidences` (`:283–288`), a `finishExam` pak doplní `confidence: confidences[q.id] || 'know'` (`:367`). 50otázková zkouška tedy do grafu přispěje 50 odpověďmi „vím“ a **každá chyba ve zkoušce se počítá jako „Falešná jistota“**.
- **„Náhodné pořadí“ se nedá vypnout.** `isRandomOrder` je `true` a `setIsRandomOrder` se nikde nevolá — mrtvý přepínač.
- **Průběh úspěšnosti se počítá a nikde nezobrazuje.** `sessionStats` včetně `history: [{question, accuracy}]` je mrtvý stav.
- **Chybí `.slice(0, 50)`.** `startExamMode` (`:135–158`) vezme `max(2, floor(50/početPředmětů))` z každého předmětu a pak doplní do 50; horní hranici ale nikdo nekontroluje. Při 9 předmětech dnes vyjde přesně 50, při více než 25 předmětech (lektor je smí zakládat) by „zkouška na 50 otázek / 45 minut“ měla otázek víc.
- Míchání otázek `sort(() => Math.random() - 0.5)` na 4 místech — není to uniformní permutace (na rozdíl od `shuffleQuestionOptions`, kde je správný Fisher–Yates).
- „Komisionální simulace: 50 otázek ze **všech 9 předmětů**“ (`:518`) — počet je zadrátovaný, předměty přicházejí z databáze.

### 3.5 Kartičky

- **Slíbený Leitnerův systém neexistuje.** `LeitnerHelpModal` konkrétně slibuje intervaly „Denní opakování / Každé 2 až 3 dny / 1× týdně / …“, ale v kódu není **žádná** evidence data posledního opakování, žádná fronta „dnes k opakování“ ani upozornění. Krabičky jsou jen ruční roztřídění; rozvrh si musí student pamatovat sám. Buď dopsat plánovač (stačí `lastReviewed` na kartičku a filtr „splatné dnes“), nebo přestat slibovat intervaly.
- **Při zvolené konkrétní krabičce se dril zasekne na první kartičce.** `handleLeitnerProgress` změní `leitnerBoxes` → `filteredQuestions` se přepočítají → efekt na `:138` udělá `setShuffledQuestions(filteredQuestions)` a `setCurrentCardIndex(0)`, což okamžitě zruší `handleNext()` uvnitř. Tentýž efekt zahazuje i výsledek tlačítka „Zamíchat“ při každé změně filtru.
- **Mezerník v celé záložce znemožní stisk jakéhokoli tlačítka.** Posluchač na `window` (`:220–232`) přeskakuje jen `input/textarea/select` a na `e.code === 'Space'` volá `preventDefault()`. Zafokusované tlačítko („Vím“, „Nevím“, „Zamíchat“) tak mezerníkem nejde aktivovat — aktivuje se jen převrácení kartičky. Uživatel klávesnice tímto o dril přijde.
- `handleSpeak` čte `currentQuestion.rationale` bez kontroly — u otázky bez odůvodnění přečte „Odůvodnění: undefined“.

### 3.6 Profesní etika

- **Tlačítko „Spustit e-Test (20 ot.)“ žádný test nespustí** — `handleStartQuickTest` jen přepne podzáložku; komentář v kódu to přiznává.
- **Zadrátované a nesouhlasící počty.** Záložka „Zkušební test & **50 otázek**“ a text „ze souboru **50** akreditovaných kontrolních otázek“ / tlačítko „Procvičit všech **50** otázek“ — banka má **57** otázek, takže „všech 50“ jich 7 zahodí. „**36** Klíčových pojmů“ sedí (36), ale je to zadrátováno také.
- **Slíbený limit 30 minut se nikde neměří.** V `PETest.tsx` (151 řádků) není žádný časovač.
- **Test neprohazuje možnosti** (na rozdíl od hlavní Zkoušky) — správná odpověď je vždy na stejné pozici jako v datovém souboru. Kdo si zapamatuje pozice, projde bez znalostí; přesně ten druh nálezu, kvůli kterému vznikla ráčna na délkový tell.
- **Výsledek se nikam neukládá** — žádná historie, XP ani statistiky. Modul duplikuje hlavní Zkoušku ve slabší podobě.
- `profesniEtikaQuestions` je v `ProfessionalEthics.tsx:13` importováno a nepoužito.

### 3.7 Administrativa a ETŘ

- **Koncepty s osobními údaji vězněných osob leží v localStorage bez vazby na uživatele.** `DRAFT_STORAGE_PREFIX = 'vs-cr-admin-draft:'` + id šablony (`PrisonAdministration.tsx:233–271`). Koncept se ukládá automaticky každých 400 ms a při připojení komponenty se **načte bez ohledu na to, kdo je přihlášen**. Formulář obsahuje jméno, datum narození, identifikační kód vězněné osoby, popis zranění a lékařské ošetření. Na sdíleném počítači si další student otevře cizí rozepsaný záznam; odhlášení nic nemaže a žádné „smazat všechny koncepty“ v UI není. Klíč navíc nemá prefix `vscr_`, takže ho případný úklid podle prefixu přehlédne.
- **Nikde není upozornění, že se do trenažéru nemají zadávat skutečné osobní údaje.**
- **„Vygenerovat *platné* formátované Č.j.“** (`:660`) — číslo je `Math.random()`. Pro cvičení je to v pořádku, slovo „platné“ nikoli. Zástupný text v poli navíc pořád nabízí rok `2024`.
- Povinná pole mají trvale červené obrysy (`border-red-300`), takže nedotčený formulář vypadá jako chybný; a chybí `required` / `aria-required` / `aria-invalid` / `aria-describedby`, takže odečítač o validaci neví nic.
- **Dva `eslint-disable react-hooks/exhaustive-deps`** (`:333`, `:394`) — `AGENTS.md` to zakazuje jmenovitě („Chybějící závislost nikdy neumlčuj komentářem“). U `handleCopyRecord` dnes chybějící `recordText` neškodí jen náhodou (`missingMandatoryFields` je nememoizované pole a mění identitu při každém stisku klávesy). Kdyby to někdo „opravil“ memoizací, tlačítko „Kopírovat záznam“ začne tiše kopírovat starší verzi textu.

### 3.8 Kompas zákonů

- **Předpisy smí editovat a mazat kdokoli, včetně studenta.** `LegalCompass.tsx` `useAuth` vůbec neimportuje a v `src/components/legal-compass/*` není jediná role. Student si tak může přepsat text zákona 555/1992, který se mu pak zobrazuje jako studijní výběr — a nemá jak poznat, že už nečte to, co je v repozitáři.
- **Úpravy předpisů jdou jen do localStorage** (`regulationsStorage.ts`), zatímco Předměty, Modelovky a Otázky lektor ukládá do `content_blocks` v Supabase. Lektor tedy upraví předpis, uvidí potvrzení „úspěšně uložen“ a nikdo jiný to neuvidí. UI o tom nemlčí — o tom nic neříká.
- **Import JSON bez potvrzení přepíše všechny místní úpravy.** `importRegulationsFromJSON` dělá `localStorage.setItem(STORAGE_KEY, …)`, tedy *nahrazení*, a validuje jen `item.id && item.title && item.code`; cokoli jiného projde.
- **„Uloženo offline“ po každém nasazení lže.** Service worker pojmenovává mezipaměť podle `BUILD_ID` a v `activate` maže všechny ostatní `vscr-akademie-*` (`public/sw.js:85–97`), takže stažená znění (~1,5 MB) zmizí. Příznak `vscr_offline_downloaded_at` v localStorage ale přežije a odznak s datem stažení zůstává. Řešení: dát znění do samostatné neverzované mezipaměti (`vscr-esbirka-v1`) a vyjmout ji z úklidu.
- **Mrtvý kód se zápisem 300 kB.** `saveAllForOffline()` zapíše kompletní kopii všech předpisů do `vscr_offline_regulations_cache` — klíč, který **nikdo nikde nečte**. Pole `officialUrl` se vyplňuje v editoru a nikde se nezobrazuje.
- Při hledání bez výsledku spadne detail na `legalDatabase[0]`, takže se vpravo ukazuje článek, který hledání neodpovídá.
- `handleCopy` nemá `catch` — bez HTTPS nebo bez svolení se `navigator.clipboard` zamítne, ale odznak „zkopírováno“ se zobrazí. (V Administrativě je to ošetřeno správně — nekonzistence.)
- Stahování 9 znění nemá ukazatel průběhu, i když `prefetchAllSnapshots` `onProgress` podporuje.
- README slibuje „proxy pouští jen **šest** konkrétních endpointů“, `ALLOWED_ENDPOINTS` má **sedm**.

### 3.9 Taktické scénáře

- `score` se počítá a nikde nezobrazuje — po dokončení scénáře není žádný souhrn „x/y správných rozhodnutí“.
- Postup je v localStorage bez vazby na účet (viz K5) a `window.dispatchEvent(new Event('storage'))` je zneužití události určené pro jiné karty.
- `markScenarioCompleted` se volá ze tří míst s jinými podmínkami; v `handleNextStep` se scénář označí za dokončený i tehdy, když `nextStepId` ukazuje na neexistující krok.

### 3.10 Statistiky

- „Nedostatek dat pro predikci“ se spouští při `total < 10`, ale text hlásí „Absolvujte alespoň **15–20** otázek“.
- `strongestTopics` se počítá a nezobrazuje; 9 importů z `recharts` (LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar) je nepoužitých — pozůstatek zrušených grafů.
- Výsledky čekající v offline frontě si nesou `dateFormatted: 'Dnes HH:MM'` z `Quiz.tsx:386`. Čtení ze Supabase datum přeformátuje správně (`quizResults.ts:78`), ale test odeslaný po třech dnech offline se do té doby vykazuje jako „Dnes“.
- Hranice 75 % je zadrátovaná na třech místech.

### 3.11 Správa obsahu

- **Lišta podzáložek přeteče na telefonu.** `ContentManager.tsx:133` `flex … w-fit` se 4 položkami (~650 px) bez `overflow-x-auto` a bez `flex-wrap`; `<main>` má `overflow-y: auto`, takže se na 375px displeji objeví vodorovný posuvník obsahu. Totéž `FeedbackManager.tsx:186`.
- Přepínač není `role="tablist"` / `role="tab"` / `aria-selected`.
- Popisek „Nahrávání a správa studijních materiálů a testových otázek“ nezmiňuje Zpětnou vazbu ani Správu uživatelů, které tam taky jsou.
- `max-w-4xl` (896 px) je pro tabulku banky otázek na velkém monitoru zbytečně těsné.
- Mazání otázky používá 5 různých `alert()` hlášení (`QuestionBankManager.tsx:399–423`), z toho jedno uživateli radí „Zkontrolujte oprávnění RLS pro DELETE v Supabase“ — hlášení pro vývojáře, ne pro lektora.

---

## 4. UI/UX a konzistence

**Názvy jedné a téže záložky se liší podle místa:**

| Záložka | `NAV_TAB_LABELS` | horní lišta | rozbalovátko | mobilní nabídka | manifest |
|---|---|---|---|---|---|
| `quiz` | Zkouška | **Test & Zkouška** | — | Zkouška | Test & Zkouška / Kvíz |
| `library` | Knihovna | **Materiály** | Knihovna materiálů | Knihovna | — |
| `compass` | Kompas zákonů | — | **Předpisy & § Kompas** | Předpisy & § | Předpisy & Paragrafy |
| `dashboard` | Nástěnka | Nástěnka | — | **Informační tabule tříd ZOP** | — |

Popisek záložky se navíc posílá do zpětné vazby (`FeedbackButton screenLabel`), takže lektor dostane hlášení k „Zkoušce“, kterou student v rozhraní nikdy neviděl.

**Ostatní:**

- **Na širokých monitorech (xl+) je „Správa obsahu“ dosažitelná jen z profilového rozbalovátka.** Tlačítko „Další“, které ji obsahuje, je `flex xl:hidden`. Lektor na velkém monitoru svou hlavní pracovní záložku v navigaci nenajde.
- Rozbalovátka v hlavičce nemají `role="menu"`, nezavírají se na Escape, nemají past na fokus ani navigaci šipkami a při změně velikosti okna se nepřepočítá jejich pevná pozice (`position: fixed` z `getBoundingClientRect()`).
- Žádná záložka nikde nemá `aria-current`; ani jeden ze dvou `<nav>` nemá `aria-label`.
- Tlačítko „Výcvik“ ve spodní liště se podbarví pro `scenarios|weapons|admin|ethics`, ale vždy naviguje na `scenarios` — ze Zbraní klepnutím na podbarvené tlačítko odskočíte do Scénářů.
- Většina tlačítek v `Header.tsx` a v `ClassBulletinBoard.tsx` nemá `type="button"`, ačkoli `AGENTS.md` to předepisuje.
- `manifest.json` vynucuje `"orientation": "portrait-primary"`. Na nainstalovaném tabletu tím zabije rozvrh na šířku (lightbox `ScheduleLightbox`), tiskové náhledy i desktopové rozvržení.
- Manifest deklaruje tytéž ikony pro `purpose: "any"` i `"maskable"` — neoříznutá ikona použitá jako maskable se na Androidu ořízne.
- `ErrorBoundary` je natvrdo tmavý (`bg-slate-950`) i pro uživatele ve světlém režimu, každou chybu vysvětluje jako „výpadek spojení se serverem (Supabase)“ a zachycený `this.state.error` nikde nezobrazí, takže uživatel nemá co nahlásit. „Zkusit znovu“ jen zahodí stav, takže u deterministické chyby okamžitě spadne znovu.
- Vodorovně posuvná lišta záložek má `hide-scrollbar`; jedinou nápovědou je 4px gradient s tečkou.

---

## 5. Přístupnost

Zděděný dluh klikacích `<div>`ů je skutečně splacený a `jsx-a11y` hlásí nulu — to je nadprůměr. Zbývá čtvero, co lint nezachytí:

1. **Žádný globální `:focus-visible`.** `src/index.css` (410 řádků) neobsahuje jediné pravidlo pro fokus. Vstupy mají `focus:ring`, ale stovky tlačítek s vlastním pozadím se spoléhají na výchozí obrys prohlížeče, který je na tmavé hlavičce (`hover:bg-slate-800`) prakticky nevidět. Tři řádky v `index.css` to vyřeší pro celou aplikaci.
2. **Žádná podpora `prefers-reduced-motion`.** 41 souborů používá `motion/react`, k tomu `animate-pulse` na ikoně AI a na „vysílačce“ na Nástěnce a 3D překlápění kartiček. Pro celodenní studijní nástroj je to vada (WCAG 2.3.3).
3. **Chybí „přeskočit na obsah“.** Před `<main>` je 8+ tlačítek navigace, kterými uživatel klávesnice projde při každém přepnutí.
4. **Nekonzistentní úrovně nadpisů.** `Header` renderuje `<h1>AKADEMIE VS ČR</h1>` na každé stránce a záložky si přidávají další `<h1>` (Předměty, Profesní etika, AI asistent, Nástěnka) nebo začínají `<h2>` (Knihovna, Správa obsahu, Scénáře). Na stránce tedy bývají dva `h1`.

Plus: viz **mezerník v Kartičkách** (3.5), **validace formuláře v Administrativě** (3.7) a **přepínač podzáložek bez `role="tablist"`** (3.11).

---

## 6. Výkon

**První načtení stahuje 773 kB otázek, které se skoro vždy zahodí.**

`dist/index.html` předpíná (`modulepreload`) tyto balíky:

| Balík | Neupravený | gzip |
|---|---|---|
| `index` (vstupní) | 205 kB | 54 kB |
| `vendor-framework` (React + motion) | 388 kB | 118 kB |
| `vendor-supabase` | 222 kB | 58 kB |
| **`data-questions`** | **774 kB** | **194 kB** |
| `index.css` | 244 kB | 29 kB |
| **celkem před prvním vykreslením** | **≈ 1,83 MB** | **≈ 453 kB** |

`data-questions` je záložní bundlovaná banka 364 otázek. `App.tsx:30` ji importuje staticky, takže se stahuje **vždy** — přitom `loadQuestions()` ji hned nahradí kopií ze Supabase a slouží už jen jako fallback pro selhání dotazu. Skoro polovina gzipovaného payloadu úvodní obrazovky je tedy data, která se zahodí. Řešení: `const { academyQuestions } = await import('./data/questionsData')` až ve chvíli, kdy `fetchQuizQuestionsFromSupabase()` vrátí `null`. Stejně je staticky natažená `scenariosData` a `initialData`.

Dále:

- `vendor-charts` má 420 kB (120 kB gzip) kvůli `recharts`; 9 nepoužitých importů ve `Statistics.tsx` signalizuje, že se z něj používá málo.
- `Header` počítá `calculateBaseXp` + `evaluateBadges` nad celou historií při každé změně historie (24 odznaků × všechny pokusy) — dnes zanedbatelné, u studenta se stovkami testů méně.
- `Flashcards` počítá pět plných průchodů `accessibleQuestions` (`box1Count`…`box5Count`) při každém renderu bez memoizace.

---

## 7. Bezpečnost a soukromí

Datová vrstva je silná stránka: 29 migrací, `013_harden_rls.sql` ruší `USING (true)`, `018` odebírá klientům `EXECUTE` na `get_role`, `020` chrání posledního správce, `021` počítá skóre serverovou funkcí `vyhodnotit_kviz()`, role nelze eskalovat (`profiles.sql:95–115` — `WITH CHECK (role = public.get_role(id))`), `quiz_results` čte každý jen své. Proxy `/api/esbirka` má pevný výčet endpointů, ELI podle regulárního výrazu, klíč jen na serveru. To je poctivá práce.

Zbývá:

1. **Každý přihlášený student si může vypsat celý jmenný seznam Akademie.**
   `profiles.sql:80–84`: `FOR SELECT TO authenticated USING (true)`. Tabulka obsahuje `email`, `full_name`, `role`, `user_class`. Anon klíč je veřejný (a má být), takže jeden dotaz na REST API vrátí kompletní roster. **Aplikace to nepotřebuje** — mimo `UserManager` (jen pro správce) čte kód vždy jen `.eq('id', userId)`. Zúžit na `(select auth.uid()) = id OR public.is_admin()` je změna na jeden řádek.
2. **Nasazení nemá žádné bezpečnostní hlavičky.** `vercel.json` obsahuje jen `rewrites` — chybí `Content-Security-Policy`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Permissions-Policy`. Aplikaci s interními materiály VS ČR lze vložit do cizího rámce.
3. **Osobní údaje vězněných osob v localStorage bez vazby na uživatele** — viz 3.7.
4. **Kompas zákonů bez kontroly role** — viz 3.8.
5. **Gemini API klíč**: uložen v plaintextu v localStorage a posílán z prohlížeče. Modál tvrdí „**Nikam se neodesílá**“ — klíč se posílá s každým požadavkem Googlu; věta má znamenat „ne na náš server“, ale takhle je nepravdivá. Fallback `VITE_GEMINI_API_KEY` se dostane do veřejného bundlu (README to přiznává jako záměrný kompromis).
6. **Seznam modelů je neplatný.** `geminiAnalyzer.ts:161`: `['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.5-flash']` — `gemini-3.5-flash` neexistuje, skončí 404. Smyčka navíc při nedostupnosti prvního modelu protáhne čekání o dva zbytečné okružní požadavky.
7. **Migrace se spouštějí ručně ve 29 krocích**, dvě dvojice mají shodný prefix (`022_`, `026_`) a v repozitáři není způsob, jak zjistit, co už je v daném projektu nasazeno. `set_admin_miichalpapi.sql` má e-mail vlastníka zapsaný v repozitáři.

---

## 8. Kód a údržba

- **68 nálezů mrtvého kódu** (jednorázový běh `@typescript-eslint/no-unused-vars` nad `src/**/*.{ts,tsx}`). Nejvíc `CaptainExamAssistant.tsx` (13), `Statistics.tsx` (10), `LegalCompass.tsx` (10). Čtyři z nich nejsou kosmetika, ale nedokončená funkce: `quizHistoryError`, `sessionStats`, `setIsRandomOrder`, `score`, `strongestTopics`.
- **ESLint nevidí `.ts` soubory** — celý `src/utils/`, `src/hooks/`, `src/data/` je bez lintu.
- **`PETest` duplikuje `Quiz`** ve slabší podobě (bez míchání, bez časovače, bez ukládání). Sjednotit na jeden test a Profesní etice nechat jen předvolbu předmětu.
- Tři zrušená/rozpracovaná místa (`saveAllForOffline`, `officialUrl`, `handleStartQuickTest`) tvrdí, že něco dělají, a nedělají nic.
- V repozitáři leží 4 starší auditní dokumenty, 6 jednorázových `patch_*.cjs`, `update_weapons.cjs`, `update_diagrams.sh`, `test_cuj.py` a 350 kB PDF. `package.json` se pořád jmenuje `react-example`.

---

## 9. Doporučené pořadí prací

**Nejdřív (fakticita — aplikace teď učí špatně):**

1. Přepsat `169-kazenske-tresty` v `legalCompasData.ts` a kázeňskou část `law169.ts` podle § 45, § 46 odst. 3, § 49, § 64 a § 66 platného znění; opravit `matching.ts` `kt1`, `kt4`, `kt5`.
2. Opravit `169-prava-povinnosti` — 4 m² přeřadit k vyhlášce 345/1999 § 17 odst. 6, doplnit § 16 odst. 5 (spánek, hodinová vycházka).
3. Vyjmout „výzvu s výstrahou“ z § 17 a z jeho `examTips`; doplnit správný odkaz na § 6 odst. 3 a § 18 odst. 3.
4. Opravit 129/2008 v `fullRegulationsBundle.ts` (§ 20 odst. 4 místo „2 hodiny“, § 36 místo § 24, vypustit města).
5. Odstranit nadpis „Přesné a plné zákonné znění“ u `555-18` a hlavičku „ÚPLNÉ DOSLOVNÉ ÚŘEDNÍ ZNĚNÍ“ v `law555.ts`.
6. Vypustit „Vrchní praporčík“ z hodnostního žebříčku.
7. V `geminiAnalyzer.ts` nahradit `'Ověřeno dle interních norem VS ČR.'` prázdnou hodnotou a do záložky přidat upozornění, že výstup AI není ověřený; zahodit zástupné `['Správná možnost', …]`.
8. Do `check:legal` přidat porovnání nadpisu paragrafu s osnovou z e-Sbírky a povýšit doslovnost `exactText` z varování na chybu (s výslovnou výjimkou pro položky označené jako výklad).

**Potom (funkčnost, kterou uživatel pozná):**

9. Předat `navigateToTab` všem 21 místům, kde se dnes volá `setActiveTab` (K1); nulovat `quizPreset` (K2).
10. Zobrazit `quizHistoryError` (K3); opravit závislosti XP v hlavičce (K4).
11. Navázat gamifikaci na `user_id` (K5) a udělat ze série ukazatel studia, ne spuštění (K6).
12. Opravit dril kartiček (reset na první kartu) a mezerník blokující tlačítka.
13. Ve statistikách rozlišit tři úrovně jistoty a nepočítat odpovědi ze zkoušky jako „vím“.
14. Nástěnka: zapojit hledání (nebo ho v podrobném režimu skrýt), ukládat zrušení skrytých tříd, uklízet `printingItem`, živé datum.
15. Sjednotit `alert`/`confirm` na vlastní modály; rozdělit dvojsmyslné potvrzení v Kompasu.

**Pak (výkon, přístupnost, bezpečnost):**

16. Načítat `data-questions` líně (−194 kB gzip z první obrazovky).
17. Globální `:focus-visible`, `prefers-reduced-motion`, „přeskočit na obsah“, jeden `h1` na stránku.
18. Zúžit `SELECT` politiku nad `profiles`; doplnit bezpečnostní hlavičky do `vercel.json`.
19. Koncepty v Administrativě navázat na uživatele, doplnit upozornění na osobní údaje a tlačítko „smazat koncepty“.
20. Role v Kompasu zákonů; znění do neverzované mezipaměti Service Workeru.
21. Rozšířit ESLint na `.ts` a zapnout `no-unused-vars`; uklidit 68 nálezů.
